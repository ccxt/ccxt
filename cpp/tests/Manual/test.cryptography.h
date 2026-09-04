#pragma once

// HAND-WRITTEN, not generated.
//
// ts/src/test/base/test.cryptography.ts carries a `// NO_AUTO_TRANSPILE` marker: it
// imports @noble/hashes and @noble/curves directly, so no backend can transpile it and
// every port keeps a hand-maintained copy (see cs/tests/Generated/Base/test.cryptography.cs,
// which is likewise written by hand despite living under Generated/). This file is the
// C++ copy; it lives under tests/Manual/ rather than tests/Generated/ so the directory
// does not misreport where it came from.
//
// Assertions are transcribed verbatim from the TS source. The ecdsa / rsa / jwt cases
// are NOT here -- see the note at the bottom.

#include "../BaseTest.Bridge.h"
#include "../../ccxt/base/Crypto.h"

inline void testCryptography () {
    using namespace ccxt;

    // -- hash ------------------------------------------------------------------------
    assertTrue (isEqual (hashBytes (encodeUtf8 (""), "sha256", "hex"),
        std::string ("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855")));
    assertTrue (isEqual (hashBytes (encodeUtf8 ("cheese"), "sha256", "hex"),
        std::string ("873ac9ffea4dd04fa719e8920cd6938f0c23cd678af330939cff53c3d2855f34")));
    assertTrue (isEqual (hashBytes (encodeUtf8 (""), "md5", "hex"),
        std::string ("d41d8cd98f00b204e9800998ecf8427e")));
    assertTrue (isEqual (hashBytes (encodeUtf8 ("sexyfish"), "md5", "hex"),
        std::string ("c8a35464aa9d5683585786f44d5889f8")));
    assertTrue (isEqual (hashBytes (encodeUtf8 (""), "sha1", "hex"),
        std::string ("da39a3ee5e6b4b0d3255bfef95601890afd80709")));
    assertTrue (isEqual (hashBytes (encodeUtf8 ("nutella"), "sha1", "hex"),
        std::string ("b3d60a34b744159793c483b067c56d8affc5111a")));

    // -- hmac ------------------------------------------------------------------------
    assertTrue (isEqual (hmacBytes (encodeUtf8 ("hello"), "there", "sha256", "hex"),
        std::string ("551e1c1ecbce0fe9b643745a376584a6289f5f43a46861b315fac9edc8d52a26")));
    assertTrue (isEqual (hmacBytes (encodeUtf8 ("a message"), "a secret", "md5", "hex"),
        std::string ("0bfa503bdbc7358185fcd49b4869e23d")));

    // -- crc32 -----------------------------------------------------------------------
    assertTrue (isEqual (crc32Of ("hello", true), 907060870LL));
    assertTrue (isEqual (crc32Of ("tasty chicken breast :)", true), 825820175LL));

    // -- binary encodings ------------------------------------------------------------
    //
    // Not in the TS crypto test, but they are the substrate the crypto paths sign over
    // and they cover what the base16/base58/base64 base tests assert.
    assertTrue (isEqual (toBase16 (encodeUtf8 ("hello")), std::string ("68656c6c6f")));
    assertTrue (isEqual (decodeUtf8 (fromBase16 ("68656c6c6f")), std::string ("hello")));
    assertTrue (isEqual (toBase64 (encodeUtf8 ("hello")), std::string ("aGVsbG8=")));
    assertTrue (isEqual (decodeUtf8 (fromBase64 ("aGVsbG8=")), std::string ("hello")));
    assertTrue (isEqual (toBase16 (fromBase16 ("00000000499602d2")),
        std::string ("00000000499602d2")));
    assertTrue (isEqual (toBase58 (encodeUtf8 ("hello world")), std::string ("StV1DL6CwTryKyV")));
    assertTrue (isEqual (decodeUtf8 (fromBase58 ("StV1DL6CwTryKyV")), std::string ("hello world")));

    // NOT COVERED HERE, and deliberately so rather than silently:
    //   ecdsa  - the TS assertions pin exact (r, s, v) triples, which requires the
    //            RFC-6979 deterministic nonce @noble/curves uses. OpenSSL's
    //            ECDSA_do_sign draws a random nonce, so it cannot reproduce them
    //            without implementing 6979 by hand.
    //   rsa/jwt- need PEM parsing plus PKCS#1 v1.5 signing wired through a
    //            ccxt-shaped jwt(); the pieces exist in OpenSSL but are not plumbed.
    //   keccak - OpenSSL ships padded SHA-3, not the original Keccak padding ethereum
    //            uses; digestFor() throws rather than signing with the wrong one.
}
