#include "Crypto.h"
#include "helpers.h"

#include <openssl/evp.h>
#include <openssl/hmac.h>
#include <openssl/ec.h>
#include <openssl/bn.h>
#include <openssl/obj_mac.h>

#include <array>
#include <cctype>
#include <stdexcept>

namespace ccxt {

namespace {

const char* BASE64_ALPHABET =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const char* BASE58_ALPHABET =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

// ---------------------------------------------------------------------------
// Keccak-f[1600] -- original Keccak (NOT SHA-3), as used by Ethereum keccak256.
// OpenSSL 3 only ships the padded SHA-3 variant, and ccxt's eth signing paths
// (ethEncodeStructuredData / ethGetAddressFromPrivateKey) need the original.
// ---------------------------------------------------------------------------

namespace {

constexpr uint64_t KECCAK_ROUND_CONSTANTS[24] = {
    0x0000000000000001ULL, 0x0000000000008082ULL, 0x800000000000808aULL, 0x8000000080008000ULL,
    0x000000000000808bULL, 0x0000000080000001ULL, 0x8000000080008081ULL, 0x8000000000008009ULL,
    0x000000000000008aULL, 0x0000000000000088ULL, 0x0000000080008009ULL, 0x000000008000000aULL,
    0x000000008000808bULL, 0x800000000000008bULL, 0x8000000000008089ULL, 0x8000000000008003ULL,
    0x8000000000008002ULL, 0x8000000000000080ULL, 0x000000000000800aULL, 0x800000008000000aULL,
    0x8000000080008081ULL, 0x8000000000008080ULL, 0x0000000080000001ULL, 0x8000000080008008ULL,
};

inline uint64_t keccakRotl (uint64_t x, int n) {
    return (x << n) | (x >> (64 - n));
}

void keccakF1600 (uint64_t state[25]) {
    uint64_t bc[5];
    for (int round = 0; round < 24; round++) {
        // theta
        for (int i = 0; i < 5; i++) {
            bc[i] = state[i] ^ state[i + 5] ^ state[i + 10] ^ state[i + 15] ^ state[i + 20];
        }
        for (int i = 0; i < 5; i++) {
            const uint64_t t = bc[(i + 4) % 5] ^ keccakRotl (bc[(i + 1) % 5], 1);
            for (int j = 0; j < 25; j += 5) {
                state[j + i] ^= t;
            }
        }
        // rho + pi as the classic piln/rotc circular walk (tiny-keccak formulation,
        // verified against the official Keccak test vectors)
        static const int PILN[24] = {10, 7, 11, 17, 18, 3, 5, 16, 8, 21, 24, 4,
                                     15, 23, 19, 13, 12, 2, 20, 14, 22, 9, 6, 1};
        static const int ROTC[24] = {1, 3, 6, 10, 15, 21, 28, 36, 45, 55, 2, 14,
                                     27, 41, 56, 8, 25, 43, 62, 18, 39, 61, 20, 44};
        uint64_t t = state[1];
        for (int i = 0; i < 24; i++) {
            const int j = PILN[i];
            bc[0] = state[j];
            state[j] = keccakRotl (t, ROTC[i]);
            t = bc[0];
        }
        // chi
        for (int j = 0; j < 25; j += 5) {
            for (int i = 0; i < 5; i++) {
                bc[i] = state[j + i];
            }
            for (int i = 0; i < 5; i++) {
                state[j + i] ^= (~bc[(i + 1) % 5]) & bc[(i + 2) % 5];
            }
        }
        // iota
        state[0] ^= KECCAK_ROUND_CONSTANTS[round];
    }
}

// Keccak-256 over an arbitrary byte range. Rate 136 bytes, 0x01 domain separator,
// final 0x80 padding.
void keccak256Absorb (const unsigned char* input, std::size_t length, unsigned char out[32]) {
    constexpr std::size_t RATE = 136;
    uint64_t state[25] = {0};
    while (length >= RATE) {
        for (std::size_t i = 0; i < RATE; i += 8) {
            uint64_t lane = 0;
            for (int j = 0; j < 8; j++) {
                lane |= static_cast<uint64_t> (input[i + j]) << (8 * j);
            }
            state[i / 8] ^= lane;
        }
        keccakF1600 (state);
        input += RATE;
        length -= RATE;
    }
    unsigned char block[RATE] = {0};
    std::copy (input, input + length, block);
    block[length] ^= 0x01;
    block[RATE - 1] ^= 0x80;
    for (std::size_t i = 0; i < RATE; i += 8) {
        uint64_t lane = 0;
        for (int j = 0; j < 8; j++) {
            lane |= static_cast<uint64_t> (block[i + j]) << (8 * j);
        }
        state[i / 8] ^= lane;
    }
    keccakF1600 (state);
    for (int i = 0; i < 4; i++) {
        const uint64_t lane = state[i];
        for (int j = 0; j < 8; j++) {
            out[i * 8 + j] = static_cast<unsigned char> ((lane >> (8 * j)) & 0xff);
        }
    }
}

} // namespace

const EVP_MD* digestFor (const std::string& algorithm) {
    if (algorithm == "sha256") return EVP_sha256 ();
    if (algorithm == "sha512") return EVP_sha512 ();
    if (algorithm == "sha384") return EVP_sha384 ();
    if (algorithm == "sha1")   return EVP_sha1 ();
    if (algorithm == "md5")    return EVP_md5 ();
    // keccak is NOT sha3: OpenSSL ships the padded SHA-3, and ccxt's eth paths need the
    // original Keccak padding. Failing here is better than signing with the wrong one.
    throw std::runtime_error ("unsupported hash algorithm: " + algorithm);
}

std::any encodeDigest (const std::vector<unsigned char>& raw, const std::string& digest) {
    const bytes value (raw);
    if (digest.empty () || digest == "hex") {
        return std::any (toBase16 (value));
    }
    if (digest == "base64") {
        return std::any (toBase64 (value));
    }
    if (digest == "binary") {
        return std::any (value);
    }
    throw std::runtime_error ("unsupported digest encoding: " + digest);
}

} // namespace

// ---------------------------------------------------------------------------
// binary <-> text
// ---------------------------------------------------------------------------

bytes encodeUtf8 (const std::string& text) { return bytes (text); }

std::string decodeUtf8 (const bytes& value) { return value.toString (); }

std::string toBase16 (const bytes& value) {
    static const char* digits = "0123456789abcdef";
    std::string out;
    out.reserve (value.size () * 2);
    for (unsigned char c : value.data ()) {
        out += digits[c >> 4];
        out += digits[c & 0x0f];
    }
    return out;
}

bytes fromBase16 (const std::string& text) {
    std::vector<unsigned char> out;
    out.reserve (text.size () / 2);
    const auto nibble = [] (char c) -> int {
        if (c >= '0' && c <= '9') return c - '0';
        if (c >= 'a' && c <= 'f') return c - 'a' + 10;
        if (c >= 'A' && c <= 'F') return c - 'A' + 10;
        return -1;
    };
    for (std::size_t i = 0; i + 1 < text.size (); i += 2) {
        const int high = nibble (text[i]);
        const int low = nibble (text[i + 1]);
        if (high < 0 || low < 0) {
            continue;
        }
        out.push_back (static_cast<unsigned char> ((high << 4) | low));
    }
    return bytes (std::move (out));
}

std::string toBase64 (const bytes& value) {
    const std::vector<unsigned char>& in = value.data ();
    std::string out;
    for (std::size_t i = 0; i < in.size (); i += 3) {
        const unsigned char b0 = in[i];
        const unsigned char b1 = (i + 1 < in.size ()) ? in[i + 1] : 0;
        const unsigned char b2 = (i + 2 < in.size ()) ? in[i + 2] : 0;
        out += BASE64_ALPHABET[b0 >> 2];
        out += BASE64_ALPHABET[((b0 & 0x03) << 4) | (b1 >> 4)];
        out += (i + 1 < in.size ()) ? BASE64_ALPHABET[((b1 & 0x0f) << 2) | (b2 >> 6)] : '=';
        out += (i + 2 < in.size ()) ? BASE64_ALPHABET[b2 & 0x3f] : '=';
    }
    return out;
}

bytes fromBase64 (const std::string& text) {
    std::array<int, 256> reverse {};
    reverse.fill (-1);
    for (int i = 0; i < 64; i++) {
        reverse[static_cast<unsigned char> (BASE64_ALPHABET[i])] = i;
    }
    std::vector<unsigned char> out;
    int accumulator = 0;
    int bits = 0;
    for (char c : text) {
        if (c == '=') {
            break;
        }
        const int value = reverse[static_cast<unsigned char> (c)];
        if (value < 0) {
            continue;   // whitespace and url-safe padding are skipped, as in JS
        }
        accumulator = (accumulator << 6) | value;
        bits += 6;
        if (bits >= 8) {
            bits -= 8;
            out.push_back (static_cast<unsigned char> ((accumulator >> bits) & 0xff));
        }
    }
    return bytes (std::move (out));
}

// Base58 is a big-number base change, not a bit-packing, so it goes through repeated
// division. Leading zero bytes are significant and map to leading '1's.
std::string toBase58 (const bytes& value) {
    const std::vector<unsigned char>& in = value.data ();
    std::size_t leadingZeros = 0;
    while (leadingZeros < in.size () && in[leadingZeros] == 0) {
        leadingZeros++;
    }
    std::vector<unsigned char> digits { 0 };
    for (std::size_t i = leadingZeros; i < in.size (); i++) {
        int carry = in[i];
        for (std::size_t j = 0; j < digits.size (); j++) {
            carry += digits[j] << 8;
            digits[j] = static_cast<unsigned char> (carry % 58);
            carry /= 58;
        }
        while (carry) {
            digits.push_back (static_cast<unsigned char> (carry % 58));
            carry /= 58;
        }
    }
    std::string out (leadingZeros, '1');
    for (std::size_t i = digits.size (); i > 0; i--) {
        out += BASE58_ALPHABET[digits[i - 1]];
    }
    // a single trailing 0 digit from the seed is only real if the input was all zeros
    if (in.size () > leadingZeros && out.size () > leadingZeros && out[leadingZeros] == '1') {
        out.erase (leadingZeros, 1);
    }
    return out;
}

bytes fromBase58 (const std::string& text) {
    std::array<int, 256> reverse {};
    reverse.fill (-1);
    for (int i = 0; i < 58; i++) {
        reverse[static_cast<unsigned char> (BASE58_ALPHABET[i])] = i;
    }
    std::size_t leadingOnes = 0;
    while (leadingOnes < text.size () && text[leadingOnes] == '1') {
        leadingOnes++;
    }
    std::vector<unsigned char> out { 0 };
    for (std::size_t i = leadingOnes; i < text.size (); i++) {
        const int value = reverse[static_cast<unsigned char> (text[i])];
        if (value < 0) {
            continue;
        }
        int carry = value;
        for (std::size_t j = 0; j < out.size (); j++) {
            carry += out[j] * 58;
            out[j] = static_cast<unsigned char> (carry & 0xff);
            carry >>= 8;
        }
        while (carry) {
            out.push_back (static_cast<unsigned char> (carry & 0xff));
            carry >>= 8;
        }
    }
    std::vector<unsigned char> result (leadingOnes, 0);
    for (std::size_t i = out.size (); i > 0; i--) {
        result.push_back (out[i - 1]);
    }
    // drop the seed byte unless it is a genuine leading zero
    if (result.size () > leadingOnes + 1 && result[leadingOnes] == 0) {
        result.erase (result.begin () + static_cast<long> (leadingOnes));
    }
    return bytes (std::move (result));
}

// ---------------------------------------------------------------------------
// digests
// ---------------------------------------------------------------------------

std::any hashBytes (const bytes& payload, const std::string& algorithm, const std::string& digest) {
    if (algorithm == "keccak") {
        // original Keccak-256, not OpenSSL's SHA-3: keccak256Absorb handles the
        // domain separator (0x01) and final 0x80 padding
        unsigned char raw[32];
        keccak256Absorb (payload.data ().data (), payload.size (), raw);
        return encodeDigest (std::vector<unsigned char> (raw, raw + 32), digest);
    }
    const EVP_MD* md = digestFor (algorithm);
    std::vector<unsigned char> raw (EVP_MAX_MD_SIZE);
    unsigned int length = 0;
    EVP_MD_CTX* context = EVP_MD_CTX_new ();
    if (context == nullptr) {
        throw std::runtime_error ("EVP_MD_CTX_new failed");
    }
    const bool ok = EVP_DigestInit_ex (context, md, nullptr)
        && EVP_DigestUpdate (context, payload.data ().data (), payload.size ())
        && EVP_DigestFinal_ex (context, raw.data (), &length);
    EVP_MD_CTX_free (context);
    if (!ok) {
        throw std::runtime_error ("hash failed for " + algorithm);
    }
    raw.resize (length);
    return encodeDigest (raw, digest);
}

std::any hmacBytes (const bytes& payload, const std::string& key,
                    const std::string& algorithm, const std::string& digest) {
    const EVP_MD* md = digestFor (algorithm);
    std::vector<unsigned char> raw (EVP_MAX_MD_SIZE);
    unsigned int length = 0;
    const unsigned char* result = HMAC (md,
                                        key.data (), static_cast<int> (key.size ()),
                                        payload.data ().data (), payload.size (),
                                        raw.data (), &length);
    if (result == nullptr) {
        throw std::runtime_error ("hmac failed for " + algorithm);
    }
    raw.resize (length);
    return encodeDigest (raw, digest);
}

long long crc32Of (const std::string& text, bool signed32) {
    static unsigned int table[256];
    static bool ready = false;
    if (!ready) {
        for (unsigned int i = 0; i < 256; i++) {
            unsigned int c = i;
            for (int k = 0; k < 8; k++) {
                c = (c & 1) ? (0xEDB88320u ^ (c >> 1)) : (c >> 1);
            }
            table[i] = c;
        }
        ready = true;
    }
    unsigned int crc = 0xFFFFFFFFu;
    for (unsigned char c : text) {
        crc = table[(crc ^ c) & 0xFF] ^ (crc >> 8);
    }
    crc ^= 0xFFFFFFFFu;
    if (signed32) {
        return static_cast<long long> (static_cast<int> (crc));
    }
    return static_cast<long long> (crc);
}

} // namespace ccxt

namespace ccxt {

bytes keccak256Bytes (const bytes& payload) {
    unsigned char raw[32];
    keccak256Absorb (payload.data ().data (), payload.size (), raw);
    return bytes (std::vector<unsigned char> (raw, raw + 32));
}

// ---------------------------------------------------------------------------
// ecdsa(): deterministic RFC-6979 signing over secp256k1, matching the TS
// @noble/curves v2 sign(msg, priv, { lowS: true, prehash: false, format: 'recovered' })
// bit-for-bit. Returns {r, s, v}: r/s are UNPADDED lowercase hex (BigInt.toString(16)),
// v is the recovery bit (0/1). The request is hex text; its LAST 32 bytes are the
// message hash z, exactly like noble's numTo32b truncation.
// ---------------------------------------------------------------------------

namespace {

std::vector<unsigned char> bignumBytes32 (const BIGNUM* bn) {
    std::vector<unsigned char> out (32, 0);
    BN_bn2binpad (bn, out.data (), 32);
    return out;
}

// the message hash: the LEFTMOST 32 bytes of the hex request, as a big-endian vector
// (standard ECDSA z = leftmost min(nbits, len) bits; noble does the same)
std::vector<unsigned char> messageHashBytes (const std::string& requestHex) {
    std::string s = requestHex;
    if (s.size () >= 2 && s[0] == '0' && (s[1] == 'x' || s[1] == 'X')) {
        s = s.substr (2);
    }
    std::vector<unsigned char> raw;
    for (std::size_t i = 0; i + 1 < s.size (); i += 2) {
        const auto nib = [](char c) -> int {
            if (c >= '0' && c <= '9') return c - '0';
            if (c >= 'a' && c <= 'f') return c - 'a' + 10;
            if (c >= 'A' && c <= 'F') return c - 'A' + 10;
            return 0;
        };
        raw.push_back (static_cast<unsigned char> ((nib (s[i]) << 4) | nib (s[i + 1])));
    }
    if (raw.size () < 32) {
        std::vector<unsigned char> padded (32, 0);
        std::copy (raw.begin (), raw.end (), padded.begin () + (32 - raw.size ()));
        return padded;
    }
    return std::vector<unsigned char> (raw.begin (), raw.begin () + 32);
}

} // namespace

std::any ecdsa (std::any request, std::any secret, std::any curve, std::any prehash, std::any fixedLength) {
    (void) fixedLength;
    if (!isStr (request) || !isStr (secret)) {
        throw NotSupported ("ecdsa: request and secret must be hex strings");
    }
    if (!isStr (curve) || ::str (curve) != "secp256k1") {
        throw NotSupported ("ecdsa: only secp256k1 is supported in the C++ port yet");
    }
    // -- message: last 32 bytes of the (possibly prehashed) request -----------------
    std::vector<unsigned char> message = messageHashBytes (::str (request));
    if (isTrue (prehash)) {
        const std::vector<unsigned char> hashed = keccak256Bytes (bytes (message)).data ();
        message = hashed;
    }

    // -- private key ------------------------------------------------------------------
    std::vector<unsigned char> priv = messageHashBytes (::str (secret));
    if (priv.size () != 32) {
        throw NotSupported ("ecdsa: private key must be 32 bytes");
    }

    // -- curve constants --------------------------------------------------------------
    // secp256k1: p, n, generator
    BIGNUM* n = BN_new ();
    BIGNUM* p = BN_new ();
    BN_CTX* ctx = BN_CTX_new ();
    const unsigned char nHex[] = {
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xfe,
        0xba, 0xae, 0xdc, 0xe6, 0xaf, 0x48, 0xa0, 0x3b, 0xbf, 0xd2, 0x5e, 0x8c, 0xd0, 0x36, 0x41, 0x41,
    };
    const unsigned char pHex[] = {
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
        0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff, 0xfe, 0xff, 0xff, 0xfc, 0x2f,
    };
    BN_bin2bn (nHex, sizeof (nHex), n);
    BN_bin2bn (pHex, sizeof (pHex), p);

    BIGNUM* d = BN_bin2bn (priv.data (), 32, nullptr);
    BIGNUM* z = BN_bin2bn (message.data (), 32, nullptr);

    // -- RFC 6979 nonce ---------------------------------------------------------------
    // h1 = bits2octets(z) = z mod n as 32 bytes
    BIGNUM* h1 = BN_dup (z);
    BN_mod (h1, h1, n, ctx);
    const std::vector<unsigned char> h1Bytes = bignumBytes32 (h1);
    const std::vector<unsigned char> xBytes = priv;

    std::vector<unsigned char> V (32, 0x01);
    std::vector<unsigned char> K (32, 0x00);
    const auto hmac = [](const std::vector<unsigned char>& key,
                         const std::vector<unsigned char>& msg) {
        std::vector<unsigned char> out (32);
        unsigned int len = 0;
        HMAC (EVP_sha256 (), key.data (), static_cast<int> (key.size ()),
              msg.data (), msg.size (), out.data (), &len);
        return out;
    };
    // K = HMAC(K, V || 0x00 || x || h1)
    {
        std::vector<unsigned char> msg;
        msg.insert (msg.end (), V.begin (), V.end ());
        msg.push_back (0x00);
        msg.insert (msg.end (), xBytes.begin (), xBytes.end ());
        msg.insert (msg.end (), h1Bytes.begin (), h1Bytes.end ());
        K = hmac (K, msg);
        V = hmac (K, V);
    }
    // K = HMAC(K, V || 0x01 || x || h1)
    {
        std::vector<unsigned char> msg;
        msg.insert (msg.end (), V.begin (), V.end ());
        msg.push_back (0x01);
        msg.insert (msg.end (), xBytes.begin (), xBytes.end ());
        msg.insert (msg.end (), h1Bytes.begin (), h1Bytes.end ());
        K = hmac (K, msg);
        V = hmac (K, V);
    }
    BIGNUM* k = nullptr;
    for (int attempts = 0; attempts < 64 && k == nullptr; attempts++) {
        std::vector<unsigned char> T;
        while (T.size () < 32) {
            V = hmac (K, V);
            T.insert (T.end (), V.begin (), V.end ());
        }
        BIGNUM* candidate = BN_bin2bn (T.data (), 32, nullptr);
        if (BN_is_zero (candidate) == 0 && BN_cmp (candidate, n) < 0) {
            k = candidate;
        } else {
            BN_free (candidate);
            std::vector<unsigned char> msg;
            msg.insert (msg.end (), V.begin (), V.end ());
            msg.push_back (0x00);
            K = hmac (K, msg);
            V = hmac (K, V);
        }
    }
    if (k == nullptr) {
        throw NotSupported ("ecdsa: RFC-6979 nonce generation failed");
    }

    // -- R = k*G -----------------------------------------------------------------------
    EC_KEY* ec = EC_KEY_new_by_curve_name (NID_secp256k1);
    const EC_GROUP* group = EC_KEY_get0_group (ec);
    EC_POINT* R = EC_POINT_new (group);
    EC_POINT_mul (group, R, k, nullptr, nullptr, ctx);
    BIGNUM* rx = BN_new ();
    BIGNUM* ry = BN_new ();
    EC_POINT_get_affine_coordinates (group, R, rx, ry, ctx);
    const bool yOdd = BN_is_odd (ry);

    // -- r = x(R) mod n; s = k^-1 (z + r d) mod n -------------------------------------
    BIGNUM* r = BN_dup (rx);
    BN_mod (r, r, n, ctx);
    BIGNUM* kinv = BN_mod_inverse (BN_dup (k), k, n, ctx);
    BIGNUM* rd = BN_new ();
    BN_mod_mul (rd, r, d, n, ctx);
    BN_mod_add (rd, rd, z, n, ctx);
    BIGNUM* s = BN_new ();
    BN_mod_mul (s, kinv, rd, n, ctx);

    // -- low-s normalisation + recovery bit -------------------------------------------
    BIGNUM* halfN = BN_dup (n);
    BN_rshift1 (halfN, halfN);
    int recovery = yOdd ? 1 : 0;
    if (BN_cmp (s, halfN) > 0) {
        BN_sub (s, n, s);
        recovery ^= 1;
    }

    // -- r/s as UNPADDED lowercase hex (BigInt.toString(16)) ---------------------------
    // BN_bn2hex pads to an even nibble count; JS BigInt.toString(16) does not, so a
    // leading zero nibble is stripped. The fixtures compare these strings directly.
    char* rHex = BN_bn2hex (r);
    char* sHex = BN_bn2hex (s);
    std::string rStr (rHex);
    std::string sStr (sHex);
    OPENSSL_free (rHex);
    OPENSSL_free (sHex);
    for (char& c : rStr) c = static_cast<char> (std::tolower (static_cast<unsigned char> (c)));
    for (char& c : sStr) c = static_cast<char> (std::tolower (static_cast<unsigned char> (c)));
    if (rStr.size () > 1 && rStr[0] == '0') rStr = rStr.substr (1);
    if (sStr.size () > 1 && sStr[0] == '0') sStr = sStr.substr (1);

    dict out;
    out.set ("r", std::string (rStr));
    out.set ("s", std::string (sStr));
    out.set ("v", static_cast<long long> (recovery));

    BN_free (n); BN_free (p); BN_free (d); BN_free (z); BN_free (h1); BN_free (k);
    BN_free (rx); BN_free (ry); BN_free (r); BN_free (kinv); BN_free (rd); BN_free (s);
    BN_free (halfN);
    BN_CTX_free (ctx);
    EC_POINT_free (R);
    EC_KEY_free (ec);
    return std::any (out);
}

} // namespace ccxt
