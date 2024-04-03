using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.CryptoPro;
using Org.BouncyCastle.Asn1.GM;
using Org.BouncyCastle.Asn1.Misc;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Asn1.Pkcs;
// using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.Rosstandart;
using Org.BouncyCastle.Asn1.TeleTrust;
using Org.BouncyCastle.Asn1.UA;
using Org.BouncyCastle.Crypto;
// using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Security
{
    /// <remarks>
    ///  Utility class for creating IDigest objects from their names/Oids
    /// </remarks>
    public static class DigestUtilities
    {
        private enum DigestAlgorithm
        {
            BLAKE2B_160, BLAKE2B_256, BLAKE2B_384, BLAKE2B_512,
            BLAKE2S_128, BLAKE2S_160, BLAKE2S_224, BLAKE2S_256,
            DSTU7564_256, DSTU7564_384, DSTU7564_512,
            GOST3411,
            GOST3411_2012_256, GOST3411_2012_512,
            KECCAK_224, KECCAK_256, KECCAK_288, KECCAK_384, KECCAK_512,
            MD2, MD4, MD5,
            NONE,
            RIPEMD128, RIPEMD160, RIPEMD256, RIPEMD320,
            SHA_1, SHA_224, SHA_256, SHA_384, SHA_512,
            SHA_512_224, SHA_512_256,
            SHA3_224, SHA3_256, SHA3_384, SHA3_512,
            SHAKE128_256, SHAKE256_512,
            SM3,
            TIGER,
            WHIRLPOOL,
        };

        private static readonly IDictionary<string, string> Aliases =
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        private static readonly IDictionary<string, DerObjectIdentifier> Oids =
            new Dictionary<string, DerObjectIdentifier>(StringComparer.OrdinalIgnoreCase);

        static DigestUtilities()
        {
            // Signal to obfuscation tools not to change enum constants
            ((DigestAlgorithm)Enums.GetArbitraryValue(typeof(DigestAlgorithm))).ToString();

            Aliases[PkcsObjectIdentifiers.MD2.Id] = "MD2";
            Aliases[PkcsObjectIdentifiers.MD4.Id] = "MD4";
            Aliases[PkcsObjectIdentifiers.MD5.Id] = "MD5";

            Aliases["SHA1"] = "SHA-1";
            // Aliases[OiwObjectIdentifiers.IdSha1.Id] = "SHA-1";
            Aliases[PkcsObjectIdentifiers.IdHmacWithSha1.Id] = "SHA-1";
            Aliases[MiscObjectIdentifiers.HMAC_SHA1.Id] = "SHA-1";
            Aliases["SHA224"] = "SHA-224";
            Aliases[NistObjectIdentifiers.IdSha224.Id] = "SHA-224";
            Aliases[PkcsObjectIdentifiers.IdHmacWithSha224.Id] = "SHA-224";
            Aliases["SHA256"] = "SHA-256";
            Aliases[NistObjectIdentifiers.IdSha256.Id] = "SHA-256";
            Aliases[PkcsObjectIdentifiers.IdHmacWithSha256.Id] = "SHA-256";
            Aliases["SHA384"] = "SHA-384";
            Aliases[NistObjectIdentifiers.IdSha384.Id] = "SHA-384";
            Aliases[PkcsObjectIdentifiers.IdHmacWithSha384.Id] = "SHA-384";
            Aliases["SHA512"] = "SHA-512";
            Aliases[NistObjectIdentifiers.IdSha512.Id] = "SHA-512";
            Aliases[PkcsObjectIdentifiers.IdHmacWithSha512.Id] = "SHA-512";

            Aliases["SHA512/224"] = "SHA-512/224";
            Aliases["SHA512(224)"] = "SHA-512/224";
            Aliases["SHA-512(224)"] = "SHA-512/224";
            Aliases[NistObjectIdentifiers.IdSha512_224.Id] = "SHA-512/224";
            Aliases["SHA512/256"] = "SHA-512/256";
            Aliases["SHA512(256)"] = "SHA-512/256";
            Aliases["SHA-512(256)"] = "SHA-512/256";
            Aliases[NistObjectIdentifiers.IdSha512_256.Id] = "SHA-512/256";

            Aliases["RIPEMD-128"] = "RIPEMD128";
            Aliases[TeleTrusTObjectIdentifiers.RipeMD128.Id] = "RIPEMD128";
            Aliases["RIPEMD-160"] = "RIPEMD160";
            Aliases[TeleTrusTObjectIdentifiers.RipeMD160.Id] = "RIPEMD160";
            Aliases["RIPEMD-256"] = "RIPEMD256";
            Aliases[TeleTrusTObjectIdentifiers.RipeMD256.Id] = "RIPEMD256";
            Aliases["RIPEMD-320"] = "RIPEMD320";
            //Aliases[TeleTrusTObjectIdentifiers.RipeMD320.Id] = "RIPEMD320";

            Aliases[CryptoProObjectIdentifiers.GostR3411.Id] = "GOST3411";

            Aliases["KECCAK224"] = "KECCAK-224";
            Aliases["KECCAK256"] = "KECCAK-256";
            Aliases["KECCAK288"] = "KECCAK-288";
            Aliases["KECCAK384"] = "KECCAK-384";
            Aliases["KECCAK512"] = "KECCAK-512";

            Aliases[NistObjectIdentifiers.IdSha3_224.Id] = "SHA3-224";
            Aliases[NistObjectIdentifiers.IdHMacWithSha3_224.Id] = "SHA3-224";
            Aliases[NistObjectIdentifiers.IdSha3_256.Id] = "SHA3-256";
            Aliases[NistObjectIdentifiers.IdHMacWithSha3_256.Id] = "SHA3-256";
            Aliases[NistObjectIdentifiers.IdSha3_384.Id] = "SHA3-384";
            Aliases[NistObjectIdentifiers.IdHMacWithSha3_384.Id] = "SHA3-384";
            Aliases[NistObjectIdentifiers.IdSha3_512.Id] = "SHA3-512";
            Aliases[NistObjectIdentifiers.IdHMacWithSha3_512.Id] = "SHA3-512";
            Aliases["SHAKE128"] = "SHAKE128-256";
            Aliases[NistObjectIdentifiers.IdShake128.Id] = "SHAKE128-256";
            Aliases["SHAKE256"] = "SHAKE256-512";
            Aliases[NistObjectIdentifiers.IdShake256.Id] = "SHAKE256-512";

            Aliases[GMObjectIdentifiers.sm3.Id] = "SM3";

            Aliases[MiscObjectIdentifiers.id_blake2b160.Id] = "BLAKE2B-160";
            Aliases[MiscObjectIdentifiers.id_blake2b256.Id] = "BLAKE2B-256";
            Aliases[MiscObjectIdentifiers.id_blake2b384.Id] = "BLAKE2B-384";
            Aliases[MiscObjectIdentifiers.id_blake2b512.Id] = "BLAKE2B-512";
            Aliases[MiscObjectIdentifiers.id_blake2s128.Id] = "BLAKE2S-128";
            Aliases[MiscObjectIdentifiers.id_blake2s160.Id] = "BLAKE2S-160";
            Aliases[MiscObjectIdentifiers.id_blake2s224.Id] = "BLAKE2S-224";
            Aliases[MiscObjectIdentifiers.id_blake2s256.Id] = "BLAKE2S-256";

            Aliases[RosstandartObjectIdentifiers.id_tc26_gost_3411_12_256.Id] = "GOST3411-2012-256";
            Aliases[RosstandartObjectIdentifiers.id_tc26_gost_3411_12_512.Id] = "GOST3411-2012-512";

            Aliases[UAObjectIdentifiers.dstu7564digest_256.Id] = "DSTU7564-256";
            Aliases[UAObjectIdentifiers.dstu7564digest_384.Id] = "DSTU7564-384";
            Aliases[UAObjectIdentifiers.dstu7564digest_512.Id] = "DSTU7564-512";

            Oids["MD2"] = PkcsObjectIdentifiers.MD2;
            Oids["MD4"] = PkcsObjectIdentifiers.MD4;
            Oids["MD5"] = PkcsObjectIdentifiers.MD5;
            // Oids["SHA-1"] = OiwObjectIdentifiers.IdSha1;
            Oids["SHA-224"] = NistObjectIdentifiers.IdSha224;
            Oids["SHA-256"] = NistObjectIdentifiers.IdSha256;
            Oids["SHA-384"] = NistObjectIdentifiers.IdSha384;
            Oids["SHA-512"] = NistObjectIdentifiers.IdSha512;
            Oids["SHA-512/224"] = NistObjectIdentifiers.IdSha512_224;
            Oids["SHA-512/256"] = NistObjectIdentifiers.IdSha512_256;
            Oids["SHA3-224"] = NistObjectIdentifiers.IdSha3_224;
            Oids["SHA3-256"] = NistObjectIdentifiers.IdSha3_256;
            Oids["SHA3-384"] = NistObjectIdentifiers.IdSha3_384;
            Oids["SHA3-512"] = NistObjectIdentifiers.IdSha3_512;
            Oids["SHAKE128-256"] = NistObjectIdentifiers.IdShake128;
            Oids["SHAKE256-512"] = NistObjectIdentifiers.IdShake256;
            Oids["RIPEMD128"] = TeleTrusTObjectIdentifiers.RipeMD128;
            Oids["RIPEMD160"] = TeleTrusTObjectIdentifiers.RipeMD160;
            Oids["RIPEMD256"] = TeleTrusTObjectIdentifiers.RipeMD256;
            Oids["GOST3411"] = CryptoProObjectIdentifiers.GostR3411;
            Oids["SM3"] = GMObjectIdentifiers.sm3;
            Oids["BLAKE2B-160"] = MiscObjectIdentifiers.id_blake2b160;
            Oids["BLAKE2B-256"] = MiscObjectIdentifiers.id_blake2b256;
            Oids["BLAKE2B-384"] = MiscObjectIdentifiers.id_blake2b384;
            Oids["BLAKE2B-512"] = MiscObjectIdentifiers.id_blake2b512;
            Oids["BLAKE2S-128"] = MiscObjectIdentifiers.id_blake2s128;
            Oids["BLAKE2S-160"] = MiscObjectIdentifiers.id_blake2s160;
            Oids["BLAKE2S-224"] = MiscObjectIdentifiers.id_blake2s224;
            Oids["BLAKE2S-256"] = MiscObjectIdentifiers.id_blake2s256;
            Oids["GOST3411-2012-256"] = RosstandartObjectIdentifiers.id_tc26_gost_3411_12_256;
            Oids["GOST3411-2012-512"] = RosstandartObjectIdentifiers.id_tc26_gost_3411_12_512;
            Oids["DSTU7564-256"] = UAObjectIdentifiers.dstu7564digest_256;
            Oids["DSTU7564-384"] = UAObjectIdentifiers.dstu7564digest_384;
            Oids["DSTU7564-512"] = UAObjectIdentifiers.dstu7564digest_512;
        }

        /// <summary>
        /// Returns a ObjectIdentifier for a given digest mechanism.
        /// </summary>
        /// <param name="mechanism">A string representation of the digest meanism.</param>
        /// <returns>A DerObjectIdentifier, null if the Oid is not available.</returns>

        public static DerObjectIdentifier GetObjectIdentifier(string mechanism)
        {
            if (mechanism == null)
                throw new ArgumentNullException(nameof(mechanism));

            mechanism = CollectionUtilities.GetValueOrKey(Aliases, mechanism).ToUpperInvariant();

            return CollectionUtilities.GetValueOrNull(Oids, mechanism);
        }

        public static IDigest GetDigest(DerObjectIdentifier id)
        {
            return GetDigest(id.Id);
        }

        public static IDigest GetDigest(string algorithm)
        {
            throw new ArgumentNullException(nameof(algorithm));
        }

        public static string GetAlgorithmName(DerObjectIdentifier oid)
        {
            return CollectionUtilities.GetValueOrNull(Aliases, oid.Id);
        }

        public static byte[] CalculateDigest(DerObjectIdentifier id, byte[] input)
        {
            return CalculateDigest(id.Id, input);
        }

        public static byte[] CalculateDigest(string algorithm, byte[] input)
        {
            IDigest digest = GetDigest(algorithm);
            return DoFinal(digest, input);
        }

        public static byte[] CalculateDigest(string algorithm, byte[] buf, int off, int len)
        {
            IDigest digest = GetDigest(algorithm);
            return DoFinal(digest, buf, off, len);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public static byte[] CalculateDigest(string algorithm, ReadOnlySpan<byte> buffer)
        {
            IDigest digest = GetDigest(algorithm);
            return DoFinal(digest, buffer);
        }
#endif

        public static byte[] DoFinal(IDigest digest)
        {
            byte[] b = new byte[digest.GetDigestSize()];
            digest.DoFinal(b, 0);
            return b;
        }

        public static byte[] DoFinal(IDigest digest, byte[] input)
        {
            digest.BlockUpdate(input, 0, input.Length);
            return DoFinal(digest);
        }

        public static byte[] DoFinal(IDigest digest, byte[] buf, int off, int len)
        {
            digest.BlockUpdate(buf, off, len);
            return DoFinal(digest);
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public static byte[] DoFinal(IDigest digest, ReadOnlySpan<byte> buffer)
        {
            digest.BlockUpdate(buffer);
            return DoFinal(digest);
        }
#endif
    }
}
