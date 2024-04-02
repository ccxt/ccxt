using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.CryptoPro;
using Org.BouncyCastle.Asn1.EdEC;
using Org.BouncyCastle.Asn1.Iana;
using Org.BouncyCastle.Asn1.Kisa;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Asn1.Nsri;
using Org.BouncyCastle.Asn1.Ntt;
using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.Rosstandart;
using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Security
{
    public static class GeneratorUtilities
    {
        private static readonly IDictionary<string, string> KgAlgorithms =
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        private static readonly IDictionary<string, string> KpgAlgorithms =
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        private static readonly IDictionary<string, int> DefaultKeySizes =
            new Dictionary<string, int>(StringComparer.OrdinalIgnoreCase);

        static GeneratorUtilities()
        {
            //
            // key generators.
            //
            AddKgAlgorithm("AES",
                "AESWRAP");
            AddKgAlgorithm("AES128",
                "2.16.840.1.101.3.4.2",
                NistObjectIdentifiers.IdAes128Cbc,
                NistObjectIdentifiers.IdAes128Ccm,
                NistObjectIdentifiers.IdAes128Cfb,
                NistObjectIdentifiers.IdAes128Ecb,
                NistObjectIdentifiers.IdAes128Gcm,
                NistObjectIdentifiers.IdAes128Ofb,
                NistObjectIdentifiers.IdAes128Wrap);
            AddKgAlgorithm("AES192",
                "2.16.840.1.101.3.4.22",
                NistObjectIdentifiers.IdAes192Cbc,
                NistObjectIdentifiers.IdAes192Ccm,
                NistObjectIdentifiers.IdAes192Cfb,
                NistObjectIdentifiers.IdAes192Ecb,
                NistObjectIdentifiers.IdAes192Gcm,
                NistObjectIdentifiers.IdAes192Ofb,
                NistObjectIdentifiers.IdAes192Wrap);
            AddKgAlgorithm("AES256",
                "2.16.840.1.101.3.4.42",
                NistObjectIdentifiers.IdAes256Cbc,
                NistObjectIdentifiers.IdAes256Ccm,
                NistObjectIdentifiers.IdAes256Cfb,
                NistObjectIdentifiers.IdAes256Ecb,
                NistObjectIdentifiers.IdAes256Gcm,
                NistObjectIdentifiers.IdAes256Ofb,
                NistObjectIdentifiers.IdAes256Wrap);
            AddKgAlgorithm("BLOWFISH",
                "1.3.6.1.4.1.3029.1.2");
            AddKgAlgorithm("CAMELLIA",
                "CAMELLIAWRAP");
            AddKgAlgorithm("ARIA");
            AddKgAlgorithm("ARIA128",
                NsriObjectIdentifiers.id_aria128_cbc,
                NsriObjectIdentifiers.id_aria128_ccm,
                NsriObjectIdentifiers.id_aria128_cfb,
                NsriObjectIdentifiers.id_aria128_ctr,
                NsriObjectIdentifiers.id_aria128_ecb,
                NsriObjectIdentifiers.id_aria128_gcm,
                NsriObjectIdentifiers.id_aria128_ocb2,
                NsriObjectIdentifiers.id_aria128_ofb);
            AddKgAlgorithm("ARIA192",
                NsriObjectIdentifiers.id_aria192_cbc,
                NsriObjectIdentifiers.id_aria192_ccm,
                NsriObjectIdentifiers.id_aria192_cfb,
                NsriObjectIdentifiers.id_aria192_ctr,
                NsriObjectIdentifiers.id_aria192_ecb,
                NsriObjectIdentifiers.id_aria192_gcm,
                NsriObjectIdentifiers.id_aria192_ocb2,
                NsriObjectIdentifiers.id_aria192_ofb);
            AddKgAlgorithm("ARIA256",
                NsriObjectIdentifiers.id_aria256_cbc,
                NsriObjectIdentifiers.id_aria256_ccm,
                NsriObjectIdentifiers.id_aria256_cfb,
                NsriObjectIdentifiers.id_aria256_ctr,
                NsriObjectIdentifiers.id_aria256_ecb,
                NsriObjectIdentifiers.id_aria256_gcm,
                NsriObjectIdentifiers.id_aria256_ocb2,
                NsriObjectIdentifiers.id_aria256_ofb);
            AddKgAlgorithm("CAMELLIA128",
                NttObjectIdentifiers.IdCamellia128Cbc,
                NttObjectIdentifiers.IdCamellia128Wrap);
            AddKgAlgorithm("CAMELLIA192",
                NttObjectIdentifiers.IdCamellia192Cbc,
                NttObjectIdentifiers.IdCamellia192Wrap);
            AddKgAlgorithm("CAMELLIA256",
                NttObjectIdentifiers.IdCamellia256Cbc,
                NttObjectIdentifiers.IdCamellia256Wrap);
            AddKgAlgorithm("CAST5",
                "1.2.840.113533.7.66.10");
            AddKgAlgorithm("CAST6");
            AddKgAlgorithm("CHACHA");
            AddKgAlgorithm("CHACHA7539",
                "CHACHA20",
                "CHACHA20-POLY1305",
                PkcsObjectIdentifiers.IdAlgAeadChaCha20Poly1305);
            AddKgAlgorithm("DES",
                OiwObjectIdentifiers.DesCbc,
                OiwObjectIdentifiers.DesCfb,
                OiwObjectIdentifiers.DesEcb,
                OiwObjectIdentifiers.DesOfb);
            AddKgAlgorithm("DESEDE",
                "DESEDEWRAP",
                "TDEA",
                OiwObjectIdentifiers.DesEde);
            AddKgAlgorithm("DESEDE3",
                PkcsObjectIdentifiers.DesEde3Cbc,
                PkcsObjectIdentifiers.IdAlgCms3DesWrap);
            AddKgAlgorithm("GOST28147",
                "GOST",
                "GOST-28147",
                CryptoProObjectIdentifiers.GostR28147Cbc);
            AddKgAlgorithm("HC128");
            AddKgAlgorithm("HC256");
            AddKgAlgorithm("IDEA",
                "1.3.6.1.4.1.188.7.1.1.2");
            AddKgAlgorithm("NOEKEON");
            AddKgAlgorithm("RC2",
                PkcsObjectIdentifiers.RC2Cbc,
                PkcsObjectIdentifiers.IdAlgCmsRC2Wrap);
            AddKgAlgorithm("RC4",
                "ARC4",
                "1.2.840.113549.3.4");
            AddKgAlgorithm("RC5",
                "RC5-32");
            AddKgAlgorithm("RC5-64");
            AddKgAlgorithm("RC6");
            AddKgAlgorithm("RIJNDAEL");
            AddKgAlgorithm("SALSA20");
            AddKgAlgorithm("SEED",
                KisaObjectIdentifiers.IdNpkiAppCmsSeedWrap,
                KisaObjectIdentifiers.IdSeedCbc);
            AddKgAlgorithm("SERPENT");
            AddKgAlgorithm("SKIPJACK");
            AddKgAlgorithm("SM4");
            AddKgAlgorithm("TEA");
            AddKgAlgorithm("THREEFISH-256");
            AddKgAlgorithm("THREEFISH-512");
            AddKgAlgorithm("THREEFISH-1024");
            AddKgAlgorithm("TNEPRES");
            AddKgAlgorithm("TWOFISH");
            AddKgAlgorithm("VMPC");
            AddKgAlgorithm("VMPC-KSA3");
            AddKgAlgorithm("XTEA");

            //
            // HMac key generators
            //
            AddHMacKeyGenerator("MD2");
            AddHMacKeyGenerator("MD4");
            AddHMacKeyGenerator("MD5",
                IanaObjectIdentifiers.HmacMD5);
            AddHMacKeyGenerator("SHA1",
                PkcsObjectIdentifiers.IdHmacWithSha1,
                IanaObjectIdentifiers.HmacSha1);
            AddHMacKeyGenerator("SHA224",
                PkcsObjectIdentifiers.IdHmacWithSha224);
            AddHMacKeyGenerator("SHA256",
                PkcsObjectIdentifiers.IdHmacWithSha256);
            AddHMacKeyGenerator("SHA384",
                PkcsObjectIdentifiers.IdHmacWithSha384);
            AddHMacKeyGenerator("SHA512",
                PkcsObjectIdentifiers.IdHmacWithSha512);
            AddHMacKeyGenerator("SHA512/224");
            AddHMacKeyGenerator("SHA512/256");
            AddHMacKeyGenerator("KECCAK224");
            AddHMacKeyGenerator("KECCAK256");
            AddHMacKeyGenerator("KECCAK288");
            AddHMacKeyGenerator("KECCAK384");
            AddHMacKeyGenerator("KECCAK512");
            AddHMacKeyGenerator("SHA3-224",
                NistObjectIdentifiers.IdHMacWithSha3_224);
            AddHMacKeyGenerator("SHA3-256",
                NistObjectIdentifiers.IdHMacWithSha3_256);
            AddHMacKeyGenerator("SHA3-384",
                NistObjectIdentifiers.IdHMacWithSha3_384);
            AddHMacKeyGenerator("SHA3-512",
                NistObjectIdentifiers.IdHMacWithSha3_512);
            AddHMacKeyGenerator("RIPEMD128");
            AddHMacKeyGenerator("RIPEMD160",
                IanaObjectIdentifiers.HmacRipeMD160);
            AddHMacKeyGenerator("TIGER",
                IanaObjectIdentifiers.HmacTiger);
            AddHMacKeyGenerator("GOST3411-2012-256",
                RosstandartObjectIdentifiers.id_tc26_hmac_gost_3411_12_256);
            AddHMacKeyGenerator("GOST3411-2012-512",
                RosstandartObjectIdentifiers.id_tc26_hmac_gost_3411_12_512);

            //
            // key pair generators.
            //
            AddKpgAlgorithm("DH",
                "DIFFIEHELLMAN");
            AddKpgAlgorithm("DSA");
            AddKpgAlgorithm("EC",
                // TODO Should this be an alias for ECDH?
                X9ObjectIdentifiers.DHSinglePassStdDHSha1KdfScheme);
            AddKpgAlgorithm("ECDH",
                "ECIES");
            AddKpgAlgorithm("ECDHC");
            AddKpgAlgorithm("ECMQV",
                X9ObjectIdentifiers.MqvSinglePassSha1KdfScheme);
            AddKpgAlgorithm("ECDSA");
            AddKpgAlgorithm("ECGOST3410",
                "ECGOST-3410",
                "GOST-3410-2001");
            AddKpgAlgorithm("Ed25519",
                "Ed25519ctx",
                "Ed25519ph",
                EdECObjectIdentifiers.id_Ed25519);
            AddKpgAlgorithm("Ed448",
                "Ed448ph",
                EdECObjectIdentifiers.id_Ed448);
            AddKpgAlgorithm("ELGAMAL");
            AddKpgAlgorithm("GOST3410",
                "GOST-3410",
                "GOST-3410-94");
            AddKpgAlgorithm("RSA",
                "1.2.840.113549.1.1.1");
            AddKpgAlgorithm("RSASSA-PSS");
            AddKpgAlgorithm("X25519",
                EdECObjectIdentifiers.id_X25519);
            AddKpgAlgorithm("X448",
                EdECObjectIdentifiers.id_X448);

            AddDefaultKeySizeEntries(64, "DES");
            AddDefaultKeySizeEntries(80, "SKIPJACK");
            AddDefaultKeySizeEntries(128, "AES128", "ARIA128", "BLOWFISH", "CAMELLIA128", "CAST5", "CHACHA", "DESEDE",
                "HC128", "HMACMD2", "HMACMD4", "HMACMD5", "HMACRIPEMD128", "IDEA", "NOEKEON",
                "RC2", "RC4", "RC5", "SALSA20", "SEED", "SM4", "TEA", "XTEA", "VMPC", "VMPC-KSA3");
            AddDefaultKeySizeEntries(160, "HMACRIPEMD160", "HMACSHA1");
            AddDefaultKeySizeEntries(192, "AES", "AES192", "ARIA192", "CAMELLIA192", "DESEDE3", "HMACTIGER",
                "RIJNDAEL", "SERPENT", "TNEPRES");
            AddDefaultKeySizeEntries(224, "HMACSHA3-224", "HMACKECCAK224", "HMACSHA224", "HMACSHA512/224");
            AddDefaultKeySizeEntries(256, "AES256", "ARIA", "ARIA256", "CAMELLIA", "CAMELLIA256", "CAST6",
                "CHACHA7539", "GOST28147", "HC256", "HMACGOST3411-2012-256", "HMACSHA3-256", "HMACKECCAK256",
                "HMACSHA256", "HMACSHA512/256", "RC5-64", "RC6", "THREEFISH-256", "TWOFISH");
            AddDefaultKeySizeEntries(288, "HMACKECCAK288");
            AddDefaultKeySizeEntries(384, "HMACSHA3-384", "HMACKECCAK384", "HMACSHA384");
            AddDefaultKeySizeEntries(512, "HMACGOST3411-2012-512", "HMACSHA3-512", "HMACKECCAK512", "HMACSHA512",
                "THREEFISH-512");
            AddDefaultKeySizeEntries(1024, "THREEFISH-1024");
        }

        private static void AddDefaultKeySizeEntries(int size, params string[] algorithms)
        {
            foreach (string algorithm in algorithms)
            {
                DefaultKeySizes.Add(algorithm, size);
            }
        }

        private static void AddKgAlgorithm(string canonicalName, params object[] aliases)
        {
            KgAlgorithms[canonicalName] = canonicalName;

            foreach (object alias in aliases)
            {
                KgAlgorithms[alias.ToString()] = canonicalName;
            }
        }

        private static void AddKpgAlgorithm(string canonicalName, params object[] aliases)
        {
            KpgAlgorithms[canonicalName] = canonicalName;

            foreach (object alias in aliases)
            {
                KpgAlgorithms[alias.ToString()] = canonicalName;
            }
        }

        private static void AddHMacKeyGenerator(string algorithm, params object[] aliases)
        {
            string mainName = "HMAC" + algorithm;

            KgAlgorithms[mainName] = mainName;
            KgAlgorithms["HMAC-" + algorithm] = mainName;
            KgAlgorithms["HMAC/" + algorithm] = mainName;

            foreach (object alias in aliases)
            {
                KgAlgorithms[alias.ToString()] = mainName;
            }
        }

        // TODO Consider making this public
        internal static string GetCanonicalKeyGeneratorAlgorithm(string algorithm)
        {
            return CollectionUtilities.GetValueOrNull(KgAlgorithms, algorithm);
        }

        // TODO Consider making this public
        internal static string GetCanonicalKeyPairGeneratorAlgorithm(string algorithm)
        {
            return CollectionUtilities.GetValueOrNull(KpgAlgorithms, algorithm);
        }

        public static CipherKeyGenerator GetKeyGenerator(DerObjectIdentifier oid)
        {
            return GetKeyGenerator(oid.Id);
        }

        public static CipherKeyGenerator GetKeyGenerator(string algorithm)
        {
            string canonicalName = GetCanonicalKeyGeneratorAlgorithm(algorithm);

            if (canonicalName == null)
                throw new SecurityUtilityException("KeyGenerator " + algorithm + " not recognised.");

            int defaultKeySize = FindDefaultKeySize(canonicalName);
            if (defaultKeySize == -1)
                throw new SecurityUtilityException("KeyGenerator " + algorithm
                    + " (" + canonicalName + ") not supported.");

            if (canonicalName == "DES")
                return new DesKeyGenerator(defaultKeySize);

            if (canonicalName == "DESEDE" || canonicalName == "DESEDE3")
                return new DesEdeKeyGenerator(defaultKeySize);

            return new CipherKeyGenerator(defaultKeySize);
        }

        public static IAsymmetricCipherKeyPairGenerator GetKeyPairGenerator(DerObjectIdentifier oid)
        {
            return GetKeyPairGenerator(oid.Id);
        }

        public static IAsymmetricCipherKeyPairGenerator GetKeyPairGenerator(string algorithm)
        {
            string canonicalName = GetCanonicalKeyPairGeneratorAlgorithm(algorithm);

            if (canonicalName == null)
                throw new SecurityUtilityException("KeyPairGenerator " + algorithm + " not recognised.");

            if (canonicalName == "DH")
                return new DHKeyPairGenerator();

            if (canonicalName == "DSA")
                return new DsaKeyPairGenerator();

            // "EC", "ECDH", "ECDHC", "ECDSA", "ECGOST3410", "ECMQV"
            if (Platform.StartsWith(canonicalName, "EC"))
                return new ECKeyPairGenerator(canonicalName);

            if (canonicalName == "Ed25519")
                return new Ed25519KeyPairGenerator();

            if (canonicalName == "Ed448")
                return new Ed448KeyPairGenerator();

            if (canonicalName == "ELGAMAL")
                return new ElGamalKeyPairGenerator();

            if (canonicalName == "GOST3410")
                return new Gost3410KeyPairGenerator();

            if (canonicalName == "RSA" || canonicalName == "RSASSA-PSS")
                return new RsaKeyPairGenerator();

            if (canonicalName == "X25519")
                return new X25519KeyPairGenerator();

            if (canonicalName == "X448")
                return new X448KeyPairGenerator();

            throw new SecurityUtilityException("KeyPairGenerator " + algorithm
                + " (" + canonicalName + ") not supported.");
        }

        internal static int GetDefaultKeySize(DerObjectIdentifier oid)
        {
            return GetDefaultKeySize(oid.Id);
        }

        internal static int GetDefaultKeySize(string algorithm)
        {
            string canonicalName = GetCanonicalKeyGeneratorAlgorithm(algorithm);

            if (canonicalName == null)
                throw new SecurityUtilityException("KeyGenerator " + algorithm + " not recognised.");

            int defaultKeySize = FindDefaultKeySize(canonicalName);
            if (defaultKeySize == -1)
                throw new SecurityUtilityException("KeyGenerator " + algorithm
                    + " (" + canonicalName + ") not supported.");

            return defaultKeySize;
        }

        private static int FindDefaultKeySize(string canonicalName)
        {
            return DefaultKeySizes.TryGetValue(canonicalName, out int keySize) ? keySize : -1;
        }
    }
}
