#pragma once

// Hashing, HMAC and the binary encodings, backed by OpenSSL.
//
// ts/src/base/functions/crypto.ts is not transpiled -- every port implements it against
// the host platform's crypto library, and this is the C++ side of that. The digest
// algorithm arrives from generated code as a bare identifier (`sha256`, `md5`), which
// the transpiler leaves as a name; the constants below give those names a value so
// `hash(payload, sha256, 'hex')` resolves without any rewriting.

#include "Value.h"

#include <any>
#include <string>

namespace ccxt {

// Digest selectors. Generated code passes these positionally into hash()/hmac(); they
// are plain strings so an unknown algorithm fails loudly at the call rather than
// silently picking a default.
inline const std::any sha1   = std::string ("sha1");
inline const std::any sha256 = std::string ("sha256");
inline const std::any sha384 = std::string ("sha384");
inline const std::any sha512 = std::string ("sha512");
inline const std::any md5    = std::string ("md5");
inline const std::any keccak = std::string ("keccak");
// asymmetric-key selectors: they name the algorithm for rsa()/eddsa(), which are not
// wired yet -- the constants have to exist because binance's sign() references them on
// its RSA / ed25519 key branches even when the hmac branch is the one taken
inline const std::any ed25519   = std::string ("ed25519");
inline const std::any secp256k1 = std::string ("secp256k1");

// -- binary <-> text ---------------------------------------------------------------

bytes encodeUtf8 (const std::string& text);
std::string decodeUtf8 (const bytes& value);

std::string toBase16 (const bytes& value);
bytes fromBase16 (const std::string& text);
std::string toBase64 (const bytes& value);
bytes fromBase64 (const std::string& text);
std::string toBase58 (const bytes& value);
bytes fromBase58 (const std::string& text);

// -- digests -------------------------------------------------------------------------
//
// `digest` selects the output encoding: "hex" (default), "base64", or "binary" for the
// raw bytes. This mirrors the third argument of the TS hash()/hmac().

std::any hashBytes (const bytes& payload, const std::string& algorithm, const std::string& digest);
std::any hmacBytes (const bytes& payload, const std::string& key,
                    const std::string& algorithm, const std::string& digest);

// CRC-32 (IEEE), returned signed when `signed32` is true, matching TS crc32().
long long crc32Of (const std::string& text, bool signed32);

} // namespace ccxt
