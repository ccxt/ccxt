#include "Crypto.h"

#include <openssl/evp.h>
#include <openssl/hmac.h>

#include <array>
#include <stdexcept>

namespace ccxt {

namespace {

const char* BASE64_ALPHABET =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
const char* BASE58_ALPHABET =
    "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";

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
