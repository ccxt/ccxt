#include "Starknet.h"
#include "Crypto.h"
#include "Errors.h"
#include "helpers.h"

#include <openssl/bn.h>
#include <openssl/ec.h>
#include <openssl/sha.h>
#include <openssl/hmac.h>
#include <openssl/evp.h>

#include <algorithm>
#include <cctype>
#include <map>
#include <memory>
#include <mutex>
#include <vector>

namespace ccxt {
namespace starkcrypto {

namespace {

// ---------------------------------------------------------------------------
// curve context (singleton): the Stark curve y^2 = x^3 + x + b over the Stark
// prime, plus the five StarkWare Pedersen seed points
// ---------------------------------------------------------------------------

struct StarkCtx {
    BN_CTX* bnctx = nullptr;
    BIGNUM* p = nullptr;          // field prime 2^251 + 17*2^192 + 1
    BIGNUM* n = nullptr;          // curve order
    BIGNUM* addrBound = nullptr;  // 2^251 - 256
    BIGNUM* mask250 = nullptr;    // 2^250 - 1
    EC_GROUP* group = nullptr;
    EC_POINT* pedersen[5] = {nullptr, nullptr, nullptr, nullptr, nullptr};

    StarkCtx () {
        bnctx = BN_CTX_new ();
        BN_dec2bn (&p, "3618502788666131213697322783095070105623107215331596699973092056135872020481");
        BN_dec2bn (&n, "3618502788666131213697322783095070105526743751716087489154079457884512865583");
        BIGNUM* a = nullptr;
        BIGNUM* b = nullptr;
        BN_dec2bn (&a, "1");
        BN_dec2bn (&b, "3141592653589793238462643383279502884197169399375105820974944592307816406665");
        group = EC_GROUP_new_curve_GFp (p, a, b, bnctx);
        // generator
        BIGNUM* gx = nullptr;
        BIGNUM* gy = nullptr;
        BN_dec2bn (&gx, "874739451078007766457464989774322083649278607533249481151382481072868806602");
        BN_dec2bn (&gy, "152666792071518830868575557812948353041420400780739481342941381225525861407");
        EC_POINT* g = EC_POINT_new (group);
        EC_POINT_set_affine_coordinates (group, g, gx, gy, bnctx);
        EC_GROUP_set_generator (group, g, n, BN_value_one ());
        EC_POINT_free (g);
        BN_free (gx);
        BN_free (gy);
        BN_free (a);
        BN_free (b);
        // pedersen seed points (shift point + 2 per input)
        static const char* seeds[5][2] = {
            {"2089986280348253421170679821480865132823066470938446095505822317253594081284",
             "1713931329540660377023406109199410414810705867260802078187082345529207694986"},
            {"996781205833008774514500082376783249102396023663454813447423147977397232763",
             "1668503676786377725805489344771023921079126552019160156920634619255970485781"},
            {"2251563274489750535117886426533222435294046428347329203627021249169616184184",
             "1798716007562728905295480679789526322175868328062420237419143593021674992973"},
            {"2138414695194151160943305727036575959195309218611738193261179310511854807447",
             "113410276730064486255102093846540133784865286929052426931474106396135072156"},
            {"2379962749567351885752724891227938183011949129833673362440656643086021394946",
             "776496453633298175483985398648758586525933812536653089401905292063708816422"},
        };
        for (int i = 0; i < 5; i++) {
            BIGNUM* x = nullptr;
            BIGNUM* y = nullptr;
            BN_dec2bn (&x, seeds[i][0]);
            BN_dec2bn (&y, seeds[i][1]);
            pedersen[i] = EC_POINT_new (group);
            EC_POINT_set_affine_coordinates (group, pedersen[i], x, y, bnctx);
            BN_free (x);
            BN_free (y);
        }
        // 2^251 - 256
        addrBound = BN_new ();
        BN_one (addrBound);
        BN_lshift (addrBound, addrBound, 251);
        BIGNUM* storage = nullptr;
        BN_dec2bn (&storage, "256");
        BN_sub (addrBound, addrBound, storage);
        BN_free (storage);
        // 2^250 - 1
        mask250 = BN_new ();
        BN_one (mask250);
        BN_lshift (mask250, mask250, 250);
        BN_sub_word (mask250, 1);
    }
};

StarkCtx& ctx () {
    static StarkCtx instance;   // magic static: thread-safe one-time init
    return instance;
}

// stark operations are called from the test framework's std::async futures;
// OpenSSL BN_CTX/EC_GROUP are not thread-safe, so serialise
std::mutex& starkMutex () {
    static std::mutex m;
    return m;
}

// -- small helpers ------------------------------------------------------------------

std::string strip0x (std::string s) {
    if (s.size () >= 2 && s[0] == '0' && (s[1] == 'x' || s[1] == 'X')) {
        s = s.substr (2);
    }
    return s;
}

std::vector<unsigned char> hexToBytesPadded (std::string hex) {
    hex = strip0x (hex);
    if (hex.size () & 1) {
        hex = "0" + hex;
    }
    std::vector<unsigned char> out;
    out.reserve (hex.size () / 2);
    const auto nib = [](char c) -> int {
        if (c >= '0' && c <= '9') return c - '0';
        if (c >= 'a' && c <= 'f') return c - 'a' + 10;
        if (c >= 'A' && c <= 'F') return c - 'A' + 10;
        throw NotSupported ("starknet: invalid hex digit");
    };
    for (std::size_t i = 0; i + 1 < hex.size () + 1 && i + 1 < hex.size () + 1; i += 2) {
        if (i + 1 >= hex.size ()) break;
        out.push_back (static_cast<unsigned char> ((nib (hex[i]) << 4) | nib (hex[i + 1])));
    }
    return out;
}

// BIGNUM -> unpadded lowercase hex (JS BigInt.toString(16))
std::string bnToHexUnpadded (const BIGNUM* bn) {
    char* hex = BN_bn2hex (bn);
    std::string s (hex);
    OPENSSL_free (hex);
    for (char& c : s) {
        c = static_cast<char> (std::tolower (static_cast<unsigned char> (c)));
    }
    std::size_t firstNonZero = s.find_first_not_of ('0');
    if (firstNonZero == std::string::npos) {
        return "0";
    }
    return s.substr (firstNonZero);
}

using BnPtr = std::unique_ptr<BIGNUM, decltype (&BN_free)>;
BnPtr makeBn () { return BnPtr (BN_new (), &BN_free); }

// JS BigInt(string) subset: 0x hex, decimal; else fails (caller falls back to
// short-string encoding)
bool tryParseNumeric (const std::string& text, BIGNUM* out) {
    if (text.empty ()) {
        return false;
    }
    if (text.size () >= 2 && text[0] == '0' && (text[1] == 'x' || text[1] == 'X')) {
        BIGNUM* tmp = out;
        return BN_hex2bn (&tmp, text.substr (2).c_str ()) != 0;
    }
    for (char c : text) {
        if (c < '0' || c > '9') {
            return false;
        }
    }
    BIGNUM* tmp = out;
    return BN_dec2bn (&tmp, text.c_str ()) != 0;
}

// TS encodeShortString: ASCII, max 31 chars, char codes as hex
std::string encodeShortStringHex (const std::string& text) {
    if (text.size () > 31) {
        throw NotSupported ("starknet shortstring is too long: " + text);
    }
    static const char* digits = "0123456789abcdef";
    std::string out = "0x";
    for (unsigned char c : text) {
        if (c > 127) {
            throw NotSupported ("starknet shortstring is not ASCII: " + text);
        }
        out += digits[c >> 4];
        out += digits[c & 0xf];
    }
    return out;
}

// a typed-data leaf value -> felt (BigInt-ish parse with shortstring fallback)
void feltOf (const ccxt::any& value, BIGNUM* out) {
    if (!value.has_value ()) {
        BN_zero (out);
        return;
    }
    if (value.type () == typeid (bool)) {
        if (ccxt::any_cast<bool> (value)) BN_one (out); else BN_zero (out);
        return;
    }
    if (isStr (value)) {
        const std::string s = ::str (value);
        if (tryParseNumeric (s, out)) {
            return;
        }
        BIGNUM* tmp = out;
        BN_hex2bn (&tmp, encodeShortStringHex (s).substr (2).c_str ());
        return;
    }
    // numeric types (int/long long/double)
    const std::string s = ::str (value);
    if (!tryParseNumeric (s, out)) {
        throw NotSupported ("starknet felt: cannot encode value " + s);
    }
}

// -- pedersen -----------------------------------------------------------------------

// subset-sum walk over one input: 248 low bits against `low` doublings, 4 high bits
// against `high` doublings (mirrors @scure/starknet pedersenSingle + precompute)
void pedersenAccumulate (EC_POINT* acc, const BIGNUM* value, const EC_POINT* low, const EC_POINT* high) {
    StarkCtx& c = ctx ();
    if (BN_is_negative (value) || BN_cmp (value, c.p) >= 0) {
        throw NotSupported ("starknet pedersen: argument out of field range");
    }
    EC_POINT* q = EC_POINT_dup (low, c.group);
    for (int j = 0; j < 252; j++) {
        if (j == 248) {
            EC_POINT_free (q);
            q = EC_POINT_dup (high, c.group);
        }
        if (BN_is_bit_set (value, j)) {
            EC_POINT_add (c.group, acc, acc, q, c.bnctx);
        }
        if (j != 251 && j != 247) {
            EC_POINT_dbl (c.group, q, q, c.bnctx);
        }
    }
    EC_POINT_free (q);
}

// pedersen(a, b) -> x coordinate as BIGNUM (caller owns out)
void pedersenNum (const BIGNUM* a, const BIGNUM* b, BIGNUM* out) {
    StarkCtx& c = ctx ();
    EC_POINT* acc = EC_POINT_dup (c.pedersen[0], c.group);
    pedersenAccumulate (acc, a, c.pedersen[1], c.pedersen[2]);
    pedersenAccumulate (acc, b, c.pedersen[3], c.pedersen[4]);
    BnPtr y = makeBn ();
    EC_POINT_get_affine_coordinates (c.group, acc, out, y.get (), c.bnctx);
    EC_POINT_free (acc);
}

// pedersen chain with the trailing length element (computeHashOnElements)
void hashOnElements (const std::vector<BIGNUM*>& elements, BIGNUM* out) {
    BnPtr h = makeBn ();
    BN_zero (h.get ());
    BnPtr next = makeBn ();
    for (const BIGNUM* e : elements) {
        pedersenNum (h.get (), e, next.get ());
        BN_copy (h.get (), next.get ());
    }
    BnPtr len = makeBn ();
    BN_set_word (len.get (), elements.size ());
    pedersenNum (h.get (), len.get (), out);
}

// -- keccak selector ----------------------------------------------------------------

void starknetKeccakNum (const std::string& name, BIGNUM* out) {
    const bytes hashed = keccak256Bytes (name);
    BIGNUM* tmp = out;
    BN_bin2bn (hashed.data ().data (), static_cast<int> (hashed.size ()), tmp);
    // & (2^250 - 1): keep the low 250 bits
    BnPtr masked = makeBn ();
    BN_mod (masked.get (), out, ctx ().mask250, ctx ().bnctx);
    // BN_mod is not a bitmask; mask by clearing bits >= 250 instead
    BN_copy (out, tmp);
    for (int bit = BN_num_bits (out) - 1; bit >= 250; bit--) {
        BN_clear_bit (out, bit);
    }
}

// -- grindKey / getStarkKey ---------------------------------------------------------

void sha256Num (const std::vector<unsigned char>& data, BIGNUM* out) {
    unsigned char digest[SHA256_DIGEST_LENGTH];
    SHA256 (data.data (), data.size (), digest);
    BIGNUM* tmp = out;
    BN_bin2bn (digest, SHA256_DIGEST_LENGTH, tmp);
}

std::string grindKeyImpl (const std::string& seedHex) {
    StarkCtx& c = ctx ();
    const std::vector<unsigned char> seed = hexToBytesPadded (seedHex);
    // limit = 2^256 - (2^256 mod n)
    BnPtr sha256mask = makeBn ();
    BN_one (sha256mask.get ());
    BN_lshift (sha256mask.get (), sha256mask.get (), 256);
    BnPtr rem = makeBn ();
    BN_mod (rem.get (), sha256mask.get (), c.n, c.bnctx);
    BnPtr limit = makeBn ();
    BN_sub (limit.get (), sha256mask.get (), rem.get ());
    BnPtr key = makeBn ();
    for (long i = 0; i <= 100000; i++) {
        // numberToVarBytesBE(i): minimal big-endian, 0 -> [0x00]
        std::vector<unsigned char> input = seed;
        std::vector<unsigned char> idx;
        unsigned long v = static_cast<unsigned long> (i);
        if (v == 0) {
            idx.push_back (0x00);
        } else {
            while (v) {
                idx.insert (idx.begin (), static_cast<unsigned char> (v & 0xff));
                v >>= 8;
            }
        }
        input.insert (input.end (), idx.begin (), idx.end ());
        sha256Num (input, key.get ());
        if (BN_cmp (key.get (), limit.get ()) < 0) {
            BnPtr result = makeBn ();
            BN_mod (result.get (), key.get (), c.n, c.bnctx);
            return bnToHexUnpadded (result.get ());
        }
    }
    throw NotSupported ("starknet grindKey: no valid key after 100k attempts");
}

std::string getStarkKeyImpl (const std::string& privateKeyHex) {
    StarkCtx& c = ctx ();
    BnPtr d = makeBn ();
    BIGNUM* tmp = d.get ();
    BN_hex2bn (&tmp, strip0x (privateKeyHex).c_str ());
    EC_POINT* q = EC_POINT_new (c.group);
    EC_POINT_mul (c.group, q, d.get (), nullptr, nullptr, c.bnctx);
    BnPtr x = makeBn ();
    BnPtr y = makeBn ();
    EC_POINT_get_affine_coordinates (c.group, q, x.get (), y.get (), c.bnctx);
    EC_POINT_free (q);
    return "0x" + bnToHexUnpadded (x.get ());
}

// -- typed data (legacy revision) ---------------------------------------------------

using Fields = std::vector<std::pair<std::string, std::string>>;

std::string encodeTypeLegacy (const std::map<std::string, Fields>& types, const std::string& name) {
    // dependencies: referenced struct types (array suffix stripped), recursively,
    // sorted alphabetically after the primary
    std::vector<std::string> deps;
    std::vector<std::string> stack = {name};
    std::vector<std::string> seen = {name};
    while (!stack.empty ()) {
        const std::string current = stack.back ();
        stack.pop_back ();
        const auto it = types.find (current);
        if (it == types.end ()) {
            continue;
        }
        for (const auto& field : it->second) {
            std::string base = field.second;
            if (!base.empty () && base.back () == '*') {
                base.pop_back ();
            }
            if (types.count (base) && std::find (seen.begin (), seen.end (), base) == seen.end ()) {
                seen.push_back (base);
                deps.push_back (base);
                stack.push_back (base);
            }
        }
    }
    std::sort (deps.begin (), deps.end ());
    std::vector<std::string> ordered = {name};
    ordered.insert (ordered.end (), deps.begin (), deps.end ());
    std::string out;
    for (const std::string& t : ordered) {
        out += t + "(";
        const auto& fields = types.at (t);
        for (std::size_t i = 0; i < fields.size (); i++) {
            if (i > 0) {
                out += ",";
            }
            out += fields[i].first + ":" + fields[i].second;
        }
        out += ")";
    }
    return out;
}

void structHashLegacy (const std::map<std::string, Fields>& types, const std::string& name,
                       const ccxt::any& data, BIGNUM* out);

void encodeLeafOrStruct (const std::map<std::string, Fields>& types, const std::string& type,
                         const ccxt::any& value, BIGNUM* out) {
    if (types.count (type)) {
        structHashLegacy (types, type, value, out);
        return;
    }
    feltOf (value, out);
}

void structHashLegacy (const std::map<std::string, Fields>& types, const std::string& name,
                       const ccxt::any& data, BIGNUM* out) {
    const auto it = types.find (name);
    if (it == types.end ()) {
        throw NotSupported ("starknet typed data: unknown struct '" + name + "'");
    }
    std::vector<BnPtr> owned;
    std::vector<BIGNUM*> elements;
    // type hash first
    owned.push_back (makeBn ());
    starknetKeccakNum (encodeTypeLegacy (types, name), owned.back ().get ());
    elements.push_back (owned.back ().get ());
    for (const auto& field : it->second) {
        ccxt::any value = isDict (data) ? ccxt::any_cast<dict> (data).get (field.first) : ccxt::any {};
        if (!field.second.empty () && field.second.back () == '*') {
            // array: hashOnElements over the element encodings
            const std::string base = field.second.substr (0, field.second.size () - 1);
            std::vector<BnPtr> elemOwned;
            std::vector<BIGNUM*> elemHashes;
            if (isList (value)) {
                for (const auto& item : ccxt::any_cast<list> (value).items ()) {
                    elemOwned.push_back (makeBn ());
                    encodeLeafOrStruct (types, base, item, elemOwned.back ().get ());
                    elemHashes.push_back (elemOwned.back ().get ());
                }
            }
            owned.push_back (makeBn ());
            hashOnElements (elemHashes, owned.back ().get ());
            elements.push_back (owned.back ().get ());
        } else {
            owned.push_back (makeBn ());
            encodeLeafOrStruct (types, field.second, value, owned.back ().get ());
            elements.push_back (owned.back ().get ());
        }
    }
    hashOnElements (elements, out);
}

Fields parseFieldList (const ccxt::any& fieldsAny) {
    if (!isList (fieldsAny)) {
        throw NotSupported ("starknet typed data: struct fields must be an array");
    }
    Fields fields;
    for (const auto& item : ccxt::any_cast<list> (fieldsAny).items ()) {
        if (!isDict (item)) {
            throw NotSupported ("starknet typed data: field descriptor must be an object");
        }
        const dict field = ccxt::any_cast<dict> (item);
        fields.push_back ({::str (field.get ("name")), ::str (field.get ("type"))});
    }
    return fields;
}

} // namespace

// -- public API ---------------------------------------------------------------------

std::string ethSigToPrivate (const std::string& ethSignatureHex) {
    std::lock_guard<std::mutex> guard (starkMutex ());
    const std::string sig = strip0x (ethSignatureHex);
    if (sig.size () != 130) {
        throw NotSupported ("starknet ethSigToPrivate: wrong ethereum signature length");
    }
    return grindKeyImpl (sig.substr (0, 64));
}

std::string getStarkKey (const std::string& privateKeyHex) {
    std::lock_guard<std::mutex> guard (starkMutex ());
    return getStarkKeyImpl (privateKeyHex);
}

std::string getSelectorFromName (const std::string& name) {
    std::lock_guard<std::mutex> guard (starkMutex ());
    BnPtr out = makeBn ();
    starknetKeccakNum (name, out.get ());
    return "0x" + bnToHexUnpadded (out.get ());
}

// -- poseidon (starknet flavour, 3-wide Hades permutation) --------------------------
// Ported from python/ccxt/static_dependencies/starknet/hash/poseidon.py
// (which mirrors ts/src/static_dependencies/scure-starknet): round constants are
// derived from sha256("Hades" + i) rather than hardcoded.

namespace {

constexpr int POSEIDON_RATE = 2;
constexpr int POSEIDON_WIDTH = 3;
constexpr int POSEIDON_FULL = 8;
constexpr int POSEIDON_PARTIAL = 83;
// MDS small matrix: [[3,1,1],[1,-1,1],[1,1,-2]] (mod p)
const long long POSEIDON_MDS[3][3] = {{3, 1, 1}, {1, -1, 1}, {1, 1, -2}};

void poseidonRoundConstant (int index, BIGNUM* out) {
    const std::string name = "Hades" + std::to_string (index);
    unsigned char digest[SHA256_DIGEST_LENGTH];
    SHA256 (reinterpret_cast<const unsigned char*> (name.data ()), name.size (), digest);
    BN_bin2bn (digest, SHA256_DIGEST_LENGTH, out);
    BN_nnmod (out, out, ctx ().p, ctx ().bnctx);
}

void poseidonField (const BIGNUM* src, BIGNUM* out) {
    BN_nnmod (out, src, ctx ().p, ctx ().bnctx);
}

// returns a BnPtr with a value mod p; free via BnPtr
void poseidonSbox (BIGNUM* value) {
    // x^3 mod p
    BIGNUM* three = BN_new ();
    BN_set_word (three, 3);
    BN_mod_exp (value, value, three, ctx ().p, ctx ().bnctx);
    BN_free (three);
}

void poseidonRound (std::vector<BIGNUM*>& values, bool isFull, int index) {
    // add round constants
    for (int i = 0; i < POSEIDON_WIDTH; i++) {
        BnPtr rc = makeBn ();
        poseidonRoundConstant (POSEIDON_WIDTH * index + i, rc.get ());
        BN_mod_add (values[i], values[i], rc.get (), ctx ().p, ctx ().bnctx);
    }
    // sbox: full rounds cube every element, partial rounds cube only the last
    if (isFull) {
        for (int i = 0; i < POSEIDON_WIDTH; i++) {
            poseidonSbox (values[i]);
        }
    } else {
        poseidonSbox (values[POSEIDON_WIDTH - 1]);
    }
    // MDS multiplication
    std::vector<BIGNUM*> next (POSEIDON_WIDTH);
    for (int i = 0; i < POSEIDON_WIDTH; i++) {
        next[i] = BN_new ();
        BN_zero (next[i]);
    }
    BnPtr tmp = makeBn ();
    BnPtr prod = makeBn ();
    for (int row = 0; row < POSEIDON_WIDTH; row++) {
        BN_zero (next[row]);
        for (int col = 0; col < POSEIDON_WIDTH; col++) {
            const long long m = POSEIDON_MDS[row][col];
            if (m >= 0) {
                BN_set_word (tmp.get (), static_cast<BN_ULONG> (m));
            } else {
                // p + m (i.e. p-1 or p-2)
                BnPtr neg = makeBn ();
                BN_set_word (neg.get (), static_cast<BN_ULONG> (-m));
                BN_sub (tmp.get (), ctx ().p, neg.get ());
            }
            BN_mod_mul (prod.get (), values[col], tmp.get (), ctx ().p, ctx ().bnctx);
            BN_mod_add (next[row], next[row], prod.get (), ctx ().p, ctx ().bnctx);
        }
    }
    for (int i = 0; i < POSEIDON_WIDTH; i++) {
        BN_copy (values[i], next[i]);
        BN_free (next[i]);
    }
}

// poseidon_hash over exactly 3 field elements: 4 full, 83 partial, 4 full
std::vector<BIGNUM*> poseidonHash3 (const std::vector<BIGNUM*>& input) {
    std::vector<BIGNUM*> values (POSEIDON_WIDTH);
    for (int i = 0; i < POSEIDON_WIDTH; i++) {
        values[i] = BN_new ();
        poseidonField (input[i], values[i]);
    }
    int roundIndex = 0;
    const int halfFull = POSEIDON_FULL / 2;
    for (int i = 0; i < halfFull; i++) {
        poseidonRound (values, true, roundIndex++);
    }
    for (int i = 0; i < POSEIDON_PARTIAL; i++) {
        poseidonRound (values, false, roundIndex++);
    }
    for (int i = 0; i < halfFull; i++) {
        poseidonRound (values, true, roundIndex++);
    }
    return values;
}

} // namespace

// poseidon_hash_many: pad with 1 then zeros to a RATE multiple, absorb 2 elements
// at a time into the state, permute, and return state[0] as an unpadded hex string.
std::string poseidonHashMany (const std::vector<std::string>& elements) {
    std::lock_guard<std::mutex> guard (starkMutex ());
    std::vector<std::string> padded = elements;
    padded.push_back ("1");
    while (padded.size () % POSEIDON_RATE != 0) {
        padded.push_back ("0");
    }
    std::vector<BIGNUM*> state (POSEIDON_WIDTH);
    for (int i = 0; i < POSEIDON_WIDTH; i++) {
        state[i] = BN_new ();
        BN_zero (state[i]);
    }
    std::vector<BIGNUM*> absorbed;
    absorbed.reserve (padded.size ());
    for (const std::string& elem : padded) {
        BIGNUM* v = BN_new ();
        if (!tryParseNumeric (elem, v)) {
            for (auto* p : absorbed) BN_free (p);
            for (auto* p : state) BN_free (p);
            BN_free (v);
            throw NotSupported ("starknet poseidon: element is not numeric: " + elem);
        }
        absorbed.push_back (v);
    }
    for (std::size_t i = 0; i + POSEIDON_RATE <= absorbed.size (); i += POSEIDON_RATE) {
        for (int j = 0; j < POSEIDON_RATE; j++) {
            BN_mod_add (state[j], state[j], absorbed[i + j], ctx ().p, ctx ().bnctx);
        }
        std::vector<BIGNUM*> next = poseidonHash3 (state);
        for (int k = 0; k < POSEIDON_WIDTH; k++) {
            BN_copy (state[k], next[k]);
            BN_free (next[k]);
        }
    }
    const std::string result = bnToHexUnpadded (state[0]);
    for (auto* p : absorbed) BN_free (p);
    for (auto* p : state) BN_free (p);
    return result;
}

std::string pedersenHash (const std::string& a, const std::string& b) {
    std::lock_guard<std::mutex> guard (starkMutex ());
    BnPtr x = makeBn ();
    BnPtr y = makeBn ();
    if (!tryParseNumeric (a, x.get ()) || !tryParseNumeric (b, y.get ())) {
        throw NotSupported ("starknet pedersen: arguments must be numeric strings");
    }
    BnPtr out = makeBn ();
    pedersenNum (x.get (), y.get (), out.get ());
    return "0x" + bnToHexUnpadded (out.get ());
}

std::string grindKey (const std::string& seedHex) {
    std::lock_guard<std::mutex> guard (starkMutex ());
    return grindKeyImpl (seedHex);
}

std::string computeAccountAddress (const std::string& accountClassHash,
                                   const std::string& accountProxyClassHash,
                                   const std::string& publicKeyHex) {
    std::lock_guard<std::mutex> guard (starkMutex ());
    StarkCtx& c = ctx ();
    // constructor calldata: [classHash, selector('initialize'), 2, publicKey, 0]
    BnPtr classHash = makeBn ();
    BnPtr proxyHash = makeBn ();
    BnPtr pub = makeBn ();
    if (!tryParseNumeric (accountClassHash, classHash.get ())
        || !tryParseNumeric (accountProxyClassHash, proxyHash.get ())
        || !tryParseNumeric (publicKeyHex, pub.get ())) {
        throw NotSupported ("starknet computeAccountAddress: non-numeric argument");
    }
    BnPtr selector = makeBn ();
    starknetKeccakNum ("initialize", selector.get ());
    BnPtr two = makeBn ();
    BN_set_word (two.get (), 2);
    BnPtr zero = makeBn ();
    BN_zero (zero.get ());
    std::vector<BIGNUM*> calldata = {classHash.get (), selector.get (), two.get (), pub.get (), zero.get ()};
    BnPtr calldataHash = makeBn ();
    hashOnElements (calldata, calldataHash.get ());
    // 'STARKNET_CONTRACT_ADDRESS'
    BnPtr prefix = makeBn ();
    BIGNUM* prefixRaw = prefix.get ();
    BN_hex2bn (&prefixRaw, "535441524b4e45545f434f4e54524143545f41444452455353");
    std::vector<BIGNUM*> addressElements = {prefix.get (), zero.get (), pub.get (), proxyHash.get (), calldataHash.get ()};
    BnPtr hash = makeBn ();
    hashOnElements (addressElements, hash.get ());
    BnPtr address = makeBn ();
    BN_mod (address.get (), hash.get (), c.addrBound, c.bnctx);
    return "0x" + bnToHexUnpadded (address.get ());
}

std::string messageHashLegacy (const ccxt::dict& messageTypes,
                               const ccxt::dict& domain,
                               const ccxt::dict& message,
                               const std::string& account) {
    std::lock_guard<std::mutex> guard (starkMutex ());
    std::map<std::string, Fields> types;
    std::string primaryType;
    for (const auto& kv : messageTypes.entries ()) {
        if (primaryType.empty ()) {
            primaryType = kv.first;
        }
        types[kv.first] = parseFieldList (kv.second);
    }
    if (primaryType.empty ()) {
        throw NotSupported ("starknet typed data: empty messageTypes");
    }
    types["StarkNetDomain"] = {{"name", "felt"}, {"chainId", "felt"}, {"version", "felt"}};
    BnPtr domainHash = makeBn ();
    structHashLegacy (types, "StarkNetDomain", ccxt::any (domain), domainHash.get ());
    BnPtr primaryHash = makeBn ();
    structHashLegacy (types, primaryType, ccxt::any (message), primaryHash.get ());
    BnPtr starknetMessage = makeBn ();
    BIGNUM* rawMsg = starknetMessage.get ();
    BN_hex2bn (&rawMsg, encodeShortStringHex ("StarkNet Message").substr (2).c_str ());
    BnPtr accountNum = makeBn ();
    if (!tryParseNumeric (account, accountNum.get ())) {
        throw NotSupported ("starknet typed data: non-numeric account address");
    }
    std::vector<BIGNUM*> elements = {starknetMessage.get (), domainHash.get (), accountNum.get (), primaryHash.get ()};
    BnPtr out = makeBn ();
    hashOnElements (elements, out.get ());
    return "0x" + bnToHexUnpadded (out.get ());
}

std::pair<std::string, std::string> sign (const std::string& msgHashHex, const std::string& privateKeyHex) {
    std::lock_guard<std::mutex> guard (starkMutex ());
    StarkCtx& c = ctx ();
    // bits2int: strip leading zero BYTES, then right-shift if byte-length bits > 252
    const auto bits2int = [&](const std::vector<unsigned char>& bytesIn, BIGNUM* out) {
        std::size_t start = 0;
        while (start < bytesIn.size () && bytesIn[start] == 0) {
            start++;
        }
        const std::size_t len = bytesIn.size () - start;
        BIGNUM* tmp = out;
        BN_bin2bn (bytesIn.data () + start, static_cast<int> (len), tmp);
        const long delta = static_cast<long> (len) * 8 - 252;
        if (delta > 0) {
            BN_rshift (out, out, static_cast<int> (delta));
        }
    };
    // bits2int_modN with the StarkWare 63-nibble fixMsgHashLen quirk
    BnPtr m = makeBn ();
    {
        std::vector<unsigned char> msgBytes = hexToBytesPadded (msgHashHex);
        BnPtr num = makeBn ();
        BIGNUM* rawNum = num.get ();
        BN_bin2bn (msgBytes.data (), static_cast<int> (msgBytes.size ()), rawNum);
        std::string hex = bnToHexUnpadded (num.get ());
        if (hex.size () == 63) {
            hex += "0";
        }
        const std::vector<unsigned char> fixed = hexToBytesPadded (hex);
        BnPtr truncated = makeBn ();
        bits2int (fixed, truncated.get ());
        BN_mod (m.get (), truncated.get (), c.n, c.bnctx);
    }
    // private key
    BnPtr d = makeBn ();
    {
        BIGNUM* raw = d.get ();
        BN_hex2bn (&raw, strip0x (privateKeyHex).c_str ());
        if (BN_is_zero (d.get ()) || BN_cmp (d.get (), c.n) >= 0) {
            throw NotSupported ("starknet sign: private key out of range");
        }
    }
    // RFC-6979 HMAC-SHA256 DRBG seeded with int2octets(d) || int2octets(m)
    const auto int2octets32 = [](const BIGNUM* v) {
        std::vector<unsigned char> out (32, 0);
        BN_bn2binpad (v, out.data (), 32);
        return out;
    };
    const auto hmac256 = [](const std::vector<unsigned char>& key, const std::vector<unsigned char>& msg) {
        std::vector<unsigned char> out (32);
        unsigned int len = 0;
        HMAC (EVP_sha256 (), key.data (), static_cast<int> (key.size ()),
              msg.data (), msg.size (), out.data (), &len);
        return out;
    };
    std::vector<unsigned char> seed = int2octets32 (d.get ());
    const std::vector<unsigned char> mOctets = int2octets32 (m.get ());
    seed.insert (seed.end (), mOctets.begin (), mOctets.end ());
    std::vector<unsigned char> K (32, 0x00);
    std::vector<unsigned char> V (32, 0x01);
    {
        std::vector<unsigned char> msg = V;
        msg.push_back (0x00);
        msg.insert (msg.end (), seed.begin (), seed.end ());
        K = hmac256 (K, msg);
        V = hmac256 (K, V);
        msg = V;
        msg.push_back (0x01);
        msg.insert (msg.end (), seed.begin (), seed.end ());
        K = hmac256 (K, msg);
        V = hmac256 (K, V);
    }
    BnPtr k = makeBn ();
    BnPtr r = makeBn ();
    BnPtr s = makeBn ();
    for (int attempts = 0; attempts < 1000; attempts++) {
        V = hmac256 (K, V);
        bits2int (V, k.get ());
        const bool kValid = !BN_is_zero (k.get ()) && BN_cmp (k.get (), c.n) < 0;
        bool done = false;
        if (kValid) {
            EC_POINT* R = EC_POINT_new (c.group);
            EC_POINT_mul (c.group, R, k.get (), nullptr, nullptr, c.bnctx);
            BnPtr rx = makeBn ();
            BnPtr ry = makeBn ();
            EC_POINT_get_affine_coordinates (c.group, R, rx.get (), ry.get (), c.bnctx);
            EC_POINT_free (R);
            BN_mod (r.get (), rx.get (), c.n, c.bnctx);
            if (!BN_is_zero (r.get ())) {
                BnPtr kinv = BnPtr (BN_mod_inverse (nullptr, k.get (), c.n, c.bnctx), &BN_free);
                BnPtr rd = makeBn ();
                BN_mod_mul (rd.get (), r.get (), d.get (), c.n, c.bnctx);
                BN_mod_add (rd.get (), rd.get (), m.get (), c.n, c.bnctx);
                BN_mod_mul (s.get (), kinv.get (), rd.get (), c.n, c.bnctx);
                if (!BN_is_zero (s.get ())) {
                    done = true;
                }
            }
        }
        if (done) {
            char* rDec = BN_bn2dec (r.get ());
            char* sDec = BN_bn2dec (s.get ());
            std::pair<std::string, std::string> out (rDec, sDec);
            OPENSSL_free (rDec);
            OPENSSL_free (sDec);
            return out;
        }
        // retry: K = HMAC(K, V || 0x00); V = HMAC(K, V)
        std::vector<unsigned char> msg = V;
        msg.push_back (0x00);
        K = hmac256 (K, msg);
        V = hmac256 (K, V);
    }
    throw NotSupported ("starknet sign: RFC-6979 nonce generation failed");
}

} // namespace starkcrypto
} // namespace ccxt
