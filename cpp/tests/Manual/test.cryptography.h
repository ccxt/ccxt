#pragma once

// TEMPORARY hand-written stand-in — the correct shape (matching C#) is a dedicated
// transpileCryptoTests () in build/cppTranspiler.ts, mirroring
// transpileCryptoTestsToCSharp: ts/src/test/base/test.cryptography.ts has
// NO_AUTO_TRANSPILE (its imports name @noble digest objects), but it IS machine-
// transpiled per-file with extra post-processing — see the TS comment "even though
// no AUTO_TRANSP flag here, this file is manually transpiled". Replacing this file
// with that transpilation needs runtime work first: deterministic ECDSA (RFC 6979)
// over secp256k1, RSA PKCS#1 v1.5 via PEM, and a ccxt-shaped jwt(); until those
// exist the transpiled asserts cannot pass, so this copy carries the subset the
// current runtime supports.
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
    //   rsa     - PEM parsing + PKCS#1 v1.5 signing wired through a ccxt-shaped
    //             jwt(); the pieces exist in OpenSSL but are not plumbed. This is
    //             the ONLY remaining gap: RFC-6979 ECDSA over secp256k1, the
    //             original (non-SHA3) keccak-256, and jwt HS256/EdDSA are all
    //             implemented and vector-validated elsewhere (Crypto.cpp /
    //             Starknet.cpp comments + the ETH signing probes).

    // EIP-712 array-of-structs encoding (CPP-006): ethers encodes each struct
    // element as typehash||fields with a PER-ELEMENT keccak, then one keccak over
    // the concatenation (NOT a bare field-concat keccak). Reference vector
    // generated from the repo's pinned ethers fork (typed-data.ts getEncoder).
    {
        ccxt::ExchangeBase ex;
        const ccxt::any domain = ccxt::dict {
            { std::string ("name"), std::string ("Test") },
            { std::string ("version"), std::string ("1") },
            { std::string ("chainId"), 1 },
            { std::string ("verifyingContract"), std::string ("0xCcCCccccCCCCcCCCCCCcCcCccCcCCCcCcccccccC") },
        };
        const ccxt::any types = ccxt::dict {
            { std::string ("Order"), ccxt::list {
                ccxt::dict { { std::string ("name"), std::string ("legs") },
                             { std::string ("type"), std::string ("Leg[]") } } } },
            { std::string ("Leg"), ccxt::list {
                ccxt::dict { { std::string ("name"), std::string ("price") },
                             { std::string ("type"), std::string ("uint256") } },
                ccxt::dict { { std::string ("name"), std::string ("side") },
                             { std::string ("type"), std::string ("uint8") } } } },
        };
        const ccxt::any message = ccxt::dict {
            { std::string ("legs"), ccxt::list {
                ccxt::dict { { std::string ("price"), std::string ("100") }, { std::string ("side"), 1 } },
                ccxt::dict { { std::string ("price"), std::string ("200") }, { std::string ("side"), 0 } } } },
        };
        const ccxt::any encoded = ex.ethEncodeStructuredData (domain, types, message);
        assertTrue (isEqual (toBase16 (ccxt::any_cast<bytes> (encoded)),
            std::string ("1901"
                "9a8af9fa0e0b9cc754673d55fcc039a94f1fa62a8ea41c8a977869f73d86b933"
                "1287d85fcfc3713a33bd8724f32131f49ca37833681c7219bc2e7190471e0d23")));
    }
}
