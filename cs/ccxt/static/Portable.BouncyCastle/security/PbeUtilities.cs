using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.BC;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.TeleTrust;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Crypto.Generators;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;

namespace Org.BouncyCastle.Security
{
    /// <summary>
    ///
    /// </summary>
    public static class PbeUtilities
    {
        const string Pkcs5S1 = "Pkcs5S1";
        const string Pkcs5S2 = "Pkcs5S2";
        const string Pkcs12 = "Pkcs12";
        const string OpenSsl = "OpenSsl";

        private static readonly IDictionary<string, string> Algorithms =
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        private static readonly IDictionary<string, string> AlgorithmType =
            new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase);
        private static readonly IDictionary<string, DerObjectIdentifier> Oids =
            new Dictionary<string, DerObjectIdentifier>(StringComparer.OrdinalIgnoreCase);

        static PbeUtilities()
        {
            Algorithms["PKCS5SCHEME1"] = "Pkcs5scheme1";
            Algorithms["PKCS5SCHEME2"] = "Pkcs5scheme2";
            Algorithms["PBKDF2"] = "Pkcs5scheme2";
            Algorithms[PkcsObjectIdentifiers.IdPbeS2.Id] = "Pkcs5scheme2";
//			algorithms[PkcsObjectIdentifiers.IdPbkdf2.Id] = "Pkcs5scheme2";

            // FIXME Add support for these? (see Pkcs8Generator)
//			algorithms[PkcsObjectIdentifiers.DesEde3Cbc.Id] = "Pkcs5scheme2";
//			algorithms[NistObjectIdentifiers.IdAes128Cbc.Id] = "Pkcs5scheme2";
//			algorithms[NistObjectIdentifiers.IdAes192Cbc.Id] = "Pkcs5scheme2";
//			algorithms[NistObjectIdentifiers.IdAes256Cbc.Id] = "Pkcs5scheme2";

            Algorithms["PBEWITHMD2ANDDES-CBC"] = "PBEwithMD2andDES-CBC";
            Algorithms[PkcsObjectIdentifiers.PbeWithMD2AndDesCbc.Id] = "PBEwithMD2andDES-CBC";
            Algorithms["PBEWITHMD2ANDRC2-CBC"] = "PBEwithMD2andRC2-CBC";
            Algorithms[PkcsObjectIdentifiers.PbeWithMD2AndRC2Cbc.Id] = "PBEwithMD2andRC2-CBC";
            Algorithms["PBEWITHMD5ANDDES-CBC"] = "PBEwithMD5andDES-CBC";
            Algorithms[PkcsObjectIdentifiers.PbeWithMD5AndDesCbc.Id] = "PBEwithMD5andDES-CBC";
            Algorithms["PBEWITHMD5ANDRC2-CBC"] = "PBEwithMD5andRC2-CBC";
            Algorithms[PkcsObjectIdentifiers.PbeWithMD5AndRC2Cbc.Id] = "PBEwithMD5andRC2-CBC";
            Algorithms["PBEWITHSHA1ANDDES"] = "PBEwithSHA-1andDES-CBC";
            Algorithms["PBEWITHSHA-1ANDDES"] = "PBEwithSHA-1andDES-CBC";
            Algorithms["PBEWITHSHA1ANDDES-CBC"] = "PBEwithSHA-1andDES-CBC";
            Algorithms["PBEWITHSHA-1ANDDES-CBC"] = "PBEwithSHA-1andDES-CBC";
            Algorithms[PkcsObjectIdentifiers.PbeWithSha1AndDesCbc.Id] = "PBEwithSHA-1andDES-CBC";
            Algorithms["PBEWITHSHA1ANDRC2"] = "PBEwithSHA-1andRC2-CBC";
            Algorithms["PBEWITHSHA-1ANDRC2"] = "PBEwithSHA-1andRC2-CBC";
            Algorithms["PBEWITHSHA1ANDRC2-CBC"] = "PBEwithSHA-1andRC2-CBC";
            Algorithms["PBEWITHSHA-1ANDRC2-CBC"] = "PBEwithSHA-1andRC2-CBC";
            Algorithms[PkcsObjectIdentifiers.PbeWithSha1AndRC2Cbc.Id] = "PBEwithSHA-1andRC2-CBC";
            Algorithms["PKCS12"] = "Pkcs12";
            Algorithms[BCObjectIdentifiers.bc_pbe_sha1_pkcs12_aes128_cbc.Id] = "PBEwithSHA-1and128bitAES-CBC-BC";
            Algorithms[BCObjectIdentifiers.bc_pbe_sha1_pkcs12_aes192_cbc.Id] = "PBEwithSHA-1and192bitAES-CBC-BC";
            Algorithms[BCObjectIdentifiers.bc_pbe_sha1_pkcs12_aes256_cbc.Id] = "PBEwithSHA-1and256bitAES-CBC-BC";
            Algorithms[BCObjectIdentifiers.bc_pbe_sha256_pkcs12_aes128_cbc.Id] = "PBEwithSHA-256and128bitAES-CBC-BC";
            Algorithms[BCObjectIdentifiers.bc_pbe_sha256_pkcs12_aes192_cbc.Id] = "PBEwithSHA-256and192bitAES-CBC-BC";
            Algorithms[BCObjectIdentifiers.bc_pbe_sha256_pkcs12_aes256_cbc.Id] = "PBEwithSHA-256and256bitAES-CBC-BC";
            Algorithms["PBEWITHSHAAND128BITRC4"] = "PBEwithSHA-1and128bitRC4";
            Algorithms["PBEWITHSHA1AND128BITRC4"] = "PBEwithSHA-1and128bitRC4";
            Algorithms["PBEWITHSHA-1AND128BITRC4"] = "PBEwithSHA-1and128bitRC4";
            Algorithms[PkcsObjectIdentifiers.PbeWithShaAnd128BitRC4.Id] = "PBEwithSHA-1and128bitRC4";
            Algorithms["PBEWITHSHAAND40BITRC4"] = "PBEwithSHA-1and40bitRC4";
            Algorithms["PBEWITHSHA1AND40BITRC4"] = "PBEwithSHA-1and40bitRC4";
            Algorithms["PBEWITHSHA-1AND40BITRC4"] = "PBEwithSHA-1and40bitRC4";
            Algorithms[PkcsObjectIdentifiers.PbeWithShaAnd40BitRC4.Id] = "PBEwithSHA-1and40bitRC4";
            Algorithms["PBEWITHSHAAND3-KEYDESEDE-CBC"] = "PBEwithSHA-1and3-keyDESEDE-CBC";
            Algorithms["PBEWITHSHAAND3-KEYTRIPLEDES-CBC"] = "PBEwithSHA-1and3-keyDESEDE-CBC";
            Algorithms["PBEWITHSHA1AND3-KEYDESEDE-CBC"] = "PBEwithSHA-1and3-keyDESEDE-CBC";
            Algorithms["PBEWITHSHA1AND3-KEYTRIPLEDES-CBC"] = "PBEwithSHA-1and3-keyDESEDE-CBC";
            Algorithms["PBEWITHSHA-1AND3-KEYDESEDE-CBC"] = "PBEwithSHA-1and3-keyDESEDE-CBC";
            Algorithms["PBEWITHSHA-1AND3-KEYTRIPLEDES-CBC"] = "PBEwithSHA-1and3-keyDESEDE-CBC";
            Algorithms[PkcsObjectIdentifiers.PbeWithShaAnd3KeyTripleDesCbc.Id] = "PBEwithSHA-1and3-keyDESEDE-CBC";
            Algorithms["PBEWITHSHAAND2-KEYDESEDE-CBC"] = "PBEwithSHA-1and2-keyDESEDE-CBC";
            Algorithms["PBEWITHSHAAND2-KEYTRIPLEDES-CBC"] = "PBEwithSHA-1and2-keyDESEDE-CBC";
            Algorithms["PBEWITHSHA1AND2-KEYDESEDE-CBC"] = "PBEwithSHA-1and2-keyDESEDE-CBC";
            Algorithms["PBEWITHSHA1AND2-KEYTRIPLEDES-CBC"] = "PBEwithSHA-1and2-keyDESEDE-CBC";
            Algorithms["PBEWITHSHA-1AND2-KEYDESEDE-CBC"] = "PBEwithSHA-1and2-keyDESEDE-CBC";
            Algorithms["PBEWITHSHA-1AND2-KEYTRIPLEDES-CBC"] = "PBEwithSHA-1and2-keyDESEDE-CBC";
            Algorithms[PkcsObjectIdentifiers.PbeWithShaAnd2KeyTripleDesCbc.Id] = "PBEwithSHA-1and2-keyDESEDE-CBC";
            Algorithms["PBEWITHSHAAND128BITRC2-CBC"] = "PBEwithSHA-1and128bitRC2-CBC";
            Algorithms["PBEWITHSHA1AND128BITRC2-CBC"] = "PBEwithSHA-1and128bitRC2-CBC";
            Algorithms["PBEWITHSHA-1AND128BITRC2-CBC"] = "PBEwithSHA-1and128bitRC2-CBC";
            Algorithms[PkcsObjectIdentifiers.PbeWithShaAnd128BitRC2Cbc.Id] = "PBEwithSHA-1and128bitRC2-CBC";
            Algorithms["PBEWITHSHAAND40BITRC2-CBC"] = "PBEwithSHA-1and40bitRC2-CBC";
            Algorithms["PBEWITHSHA1AND40BITRC2-CBC"] = "PBEwithSHA-1and40bitRC2-CBC";
            Algorithms["PBEWITHSHA-1AND40BITRC2-CBC"] = "PBEwithSHA-1and40bitRC2-CBC";
            Algorithms[PkcsObjectIdentifiers.PbewithShaAnd40BitRC2Cbc.Id] = "PBEwithSHA-1and40bitRC2-CBC";
            Algorithms["PBEWITHSHAAND128BITAES-CBC-BC"] = "PBEwithSHA-1and128bitAES-CBC-BC";
            Algorithms["PBEWITHSHA1AND128BITAES-CBC-BC"] = "PBEwithSHA-1and128bitAES-CBC-BC";
            Algorithms["PBEWITHSHA-1AND128BITAES-CBC-BC"] = "PBEwithSHA-1and128bitAES-CBC-BC";
            Algorithms["PBEWITHSHAAND192BITAES-CBC-BC"] = "PBEwithSHA-1and192bitAES-CBC-BC";
            Algorithms["PBEWITHSHA1AND192BITAES-CBC-BC"] = "PBEwithSHA-1and192bitAES-CBC-BC";
            Algorithms["PBEWITHSHA-1AND192BITAES-CBC-BC"] = "PBEwithSHA-1and192bitAES-CBC-BC";
            Algorithms["PBEWITHSHAAND256BITAES-CBC-BC"] = "PBEwithSHA-1and256bitAES-CBC-BC";
            Algorithms["PBEWITHSHA1AND256BITAES-CBC-BC"] = "PBEwithSHA-1and256bitAES-CBC-BC";
            Algorithms["PBEWITHSHA-1AND256BITAES-CBC-BC"] = "PBEwithSHA-1and256bitAES-CBC-BC";
            Algorithms["PBEWITHSHA256AND128BITAES-CBC-BC"] = "PBEwithSHA-256and128bitAES-CBC-BC";
            Algorithms["PBEWITHSHA-256AND128BITAES-CBC-BC"] = "PBEwithSHA-256and128bitAES-CBC-BC";
            Algorithms["PBEWITHSHA256AND192BITAES-CBC-BC"] = "PBEwithSHA-256and192bitAES-CBC-BC";
            Algorithms["PBEWITHSHA-256AND192BITAES-CBC-BC"] = "PBEwithSHA-256and192bitAES-CBC-BC";
            Algorithms["PBEWITHSHA256AND256BITAES-CBC-BC"] = "PBEwithSHA-256and256bitAES-CBC-BC";
            Algorithms["PBEWITHSHA-256AND256BITAES-CBC-BC"] = "PBEwithSHA-256and256bitAES-CBC-BC";
            Algorithms["PBEWITHSHAANDIDEA"] = "PBEwithSHA-1andIDEA-CBC";
            Algorithms["PBEWITHSHAANDIDEA-CBC"] = "PBEwithSHA-1andIDEA-CBC";
            Algorithms["PBEWITHSHAANDTWOFISH"] = "PBEwithSHA-1andTWOFISH-CBC";
            Algorithms["PBEWITHSHAANDTWOFISH-CBC"] = "PBEwithSHA-1andTWOFISH-CBC";
            Algorithms["PBEWITHHMACSHA1"] = "PBEwithHmacSHA-1";
            Algorithms["PBEWITHHMACSHA-1"] = "PBEwithHmacSHA-1";
            Algorithms[OiwObjectIdentifiers.IdSha1.Id] = "PBEwithHmacSHA-1";
            Algorithms["PBEWITHHMACSHA224"] = "PBEwithHmacSHA-224";
            Algorithms["PBEWITHHMACSHA-224"] = "PBEwithHmacSHA-224";
            Algorithms[NistObjectIdentifiers.IdSha224.Id] = "PBEwithHmacSHA-224";
            Algorithms["PBEWITHHMACSHA256"] = "PBEwithHmacSHA-256";
            Algorithms["PBEWITHHMACSHA-256"] = "PBEwithHmacSHA-256";
            Algorithms[NistObjectIdentifiers.IdSha256.Id] = "PBEwithHmacSHA-256";
            Algorithms["PBEWITHHMACRIPEMD128"] = "PBEwithHmacRipeMD128";
            Algorithms[TeleTrusTObjectIdentifiers.RipeMD128.Id] = "PBEwithHmacRipeMD128";
            Algorithms["PBEWITHHMACRIPEMD160"] = "PBEwithHmacRipeMD160";
            Algorithms[TeleTrusTObjectIdentifiers.RipeMD160.Id] = "PBEwithHmacRipeMD160";
            Algorithms["PBEWITHHMACRIPEMD256"] = "PBEwithHmacRipeMD256";
            Algorithms[TeleTrusTObjectIdentifiers.RipeMD256.Id] = "PBEwithHmacRipeMD256";
            Algorithms["PBEWITHHMACTIGER"] = "PBEwithHmacTiger";

            Algorithms["PBEWITHMD5AND128BITAES-CBC-OPENSSL"] = "PBEwithMD5and128bitAES-CBC-OpenSSL";
            Algorithms["PBEWITHMD5AND192BITAES-CBC-OPENSSL"] = "PBEwithMD5and192bitAES-CBC-OpenSSL";
            Algorithms["PBEWITHMD5AND256BITAES-CBC-OPENSSL"] = "PBEwithMD5and256bitAES-CBC-OpenSSL";

            AlgorithmType["Pkcs5scheme1"] = Pkcs5S1;
            AlgorithmType["Pkcs5scheme2"] = Pkcs5S2;
            AlgorithmType["PBEwithMD2andDES-CBC"] = Pkcs5S1;
            AlgorithmType["PBEwithMD2andRC2-CBC"] = Pkcs5S1;
            AlgorithmType["PBEwithMD5andDES-CBC"] = Pkcs5S1;
            AlgorithmType["PBEwithMD5andRC2-CBC"] = Pkcs5S1;
            AlgorithmType["PBEwithSHA-1andDES-CBC"] = Pkcs5S1;
            AlgorithmType["PBEwithSHA-1andRC2-CBC"] = Pkcs5S1;
            AlgorithmType["Pkcs12"] = Pkcs12;
            AlgorithmType["PBEwithSHA-1and128bitRC4"] = Pkcs12;
            AlgorithmType["PBEwithSHA-1and40bitRC4"] = Pkcs12;
            AlgorithmType["PBEwithSHA-1and3-keyDESEDE-CBC"] = Pkcs12;
            AlgorithmType["PBEwithSHA-1and2-keyDESEDE-CBC"] = Pkcs12;
            AlgorithmType["PBEwithSHA-1and128bitRC2-CBC"] = Pkcs12;
            AlgorithmType["PBEwithSHA-1and40bitRC2-CBC"] = Pkcs12;
            AlgorithmType["PBEwithSHA-1and128bitAES-CBC-BC"] = Pkcs12;
            AlgorithmType["PBEwithSHA-1and192bitAES-CBC-BC"] = Pkcs12;
            AlgorithmType["PBEwithSHA-1and256bitAES-CBC-BC"] = Pkcs12;
            AlgorithmType["PBEwithSHA-256and128bitAES-CBC-BC"] = Pkcs12;
            AlgorithmType["PBEwithSHA-256and192bitAES-CBC-BC"] = Pkcs12;
            AlgorithmType["PBEwithSHA-256and256bitAES-CBC-BC"] = Pkcs12;
            AlgorithmType["PBEwithSHA-1andIDEA-CBC"] = Pkcs12;
            AlgorithmType["PBEwithSHA-1andTWOFISH-CBC"] = Pkcs12;
            AlgorithmType["PBEwithHmacSHA-1"] = Pkcs12;
            AlgorithmType["PBEwithHmacSHA-224"] = Pkcs12;
            AlgorithmType["PBEwithHmacSHA-256"] = Pkcs12;
            AlgorithmType["PBEwithHmacRipeMD128"] = Pkcs12;
            AlgorithmType["PBEwithHmacRipeMD160"] = Pkcs12;
            AlgorithmType["PBEwithHmacRipeMD256"] = Pkcs12;
            AlgorithmType["PBEwithHmacTiger"] = Pkcs12;

            AlgorithmType["PBEwithMD5and128bitAES-CBC-OpenSSL"] = OpenSsl;
            AlgorithmType["PBEwithMD5and192bitAES-CBC-OpenSSL"] = OpenSsl;
            AlgorithmType["PBEwithMD5and256bitAES-CBC-OpenSSL"] = OpenSsl;

            Oids["PBEwithMD2andDES-CBC"] = PkcsObjectIdentifiers.PbeWithMD2AndDesCbc;
            Oids["PBEwithMD2andRC2-CBC"] = PkcsObjectIdentifiers.PbeWithMD2AndRC2Cbc;
            Oids["PBEwithMD5andDES-CBC"] = PkcsObjectIdentifiers.PbeWithMD5AndDesCbc;
            Oids["PBEwithMD5andRC2-CBC"] = PkcsObjectIdentifiers.PbeWithMD5AndRC2Cbc;
            Oids["PBEwithSHA-1andDES-CBC"] = PkcsObjectIdentifiers.PbeWithSha1AndDesCbc;
            Oids["PBEwithSHA-1andRC2-CBC"] = PkcsObjectIdentifiers.PbeWithSha1AndRC2Cbc;
            Oids["PBEwithSHA-1and128bitRC4"] = PkcsObjectIdentifiers.PbeWithShaAnd128BitRC4;
            Oids["PBEwithSHA-1and40bitRC4"] = PkcsObjectIdentifiers.PbeWithShaAnd40BitRC4;
            Oids["PBEwithSHA-1and3-keyDESEDE-CBC"] = PkcsObjectIdentifiers.PbeWithShaAnd3KeyTripleDesCbc;
            Oids["PBEwithSHA-1and2-keyDESEDE-CBC"] = PkcsObjectIdentifiers.PbeWithShaAnd2KeyTripleDesCbc;
            Oids["PBEwithSHA-1and128bitRC2-CBC"] = PkcsObjectIdentifiers.PbeWithShaAnd128BitRC2Cbc;
            Oids["PBEwithSHA-1and40bitRC2-CBC"] = PkcsObjectIdentifiers.PbewithShaAnd40BitRC2Cbc;
            Oids["PBEwithHmacSHA-1"] = OiwObjectIdentifiers.IdSha1;
            Oids["PBEwithHmacSHA-224"] = NistObjectIdentifiers.IdSha224;
            Oids["PBEwithHmacSHA-256"] = NistObjectIdentifiers.IdSha256;
            Oids["PBEwithHmacRipeMD128"] = TeleTrusTObjectIdentifiers.RipeMD128;
            Oids["PBEwithHmacRipeMD160"] = TeleTrusTObjectIdentifiers.RipeMD160;
            Oids["PBEwithHmacRipeMD256"] = TeleTrusTObjectIdentifiers.RipeMD256;
            Oids["Pkcs5scheme2"] = PkcsObjectIdentifiers.IdPbeS2;
        }

        static PbeParametersGenerator MakePbeGenerator(
            string	type,
            IDigest	digest,
            byte[]	key,
            byte[]	salt,
            int		iterationCount)
        {
            PbeParametersGenerator generator;

            if (type.Equals(Pkcs5S1))
            {
                generator = new Pkcs5S1ParametersGenerator(digest);
            }
            else if (type.Equals(Pkcs5S2))
            {
                generator = new Pkcs5S2ParametersGenerator(digest);
            }
            else if (type.Equals(Pkcs12))
            {
                generator = new Pkcs12ParametersGenerator(digest);
            }
            else if (type.Equals(OpenSsl))
            {
                generator = new OpenSslPbeParametersGenerator();
            }
            else
            {
                throw new ArgumentException("Unknown PBE type: " + type, "type");
            }

            generator.Init(key, salt, iterationCount);
            return generator;
        }

        /// <summary>
        /// Returns a ObjectIdentifier for a give encoding.
        /// </summary>
        /// <param name="mechanism">A string representation of the encoding.</param>
        /// <returns>A DerObjectIdentifier, null if the Oid is not available.</returns>
        public static DerObjectIdentifier GetObjectIdentifier(string mechanism)
        {
            if (!Algorithms.TryGetValue(mechanism, out var algorithm))
                return null;

            return CollectionUtilities.GetValueOrNull(Oids, algorithm);
        }

        //public static ICollection Algorithms
        //{
        //    get { return oids.Keys; }
        //}

        public static bool IsPkcs12(string algorithm)
        {
            if (!Algorithms.TryGetValue(algorithm, out var mechanism))
                return false;
            if (!AlgorithmType.TryGetValue(mechanism, out var algorithmType))
                return false;

            return Pkcs12.Equals(algorithmType);
        }

        public static bool IsPkcs5Scheme1(string algorithm)
        {
            if (!Algorithms.TryGetValue(algorithm, out var mechanism))
                return false;
            if (!AlgorithmType.TryGetValue(mechanism, out var algorithmType))
                return false;

            return Pkcs5S1.Equals(algorithmType);
        }

        public static bool IsPkcs5Scheme2(string algorithm)
        {
            if (!Algorithms.TryGetValue(algorithm, out var mechanism))
                return false;
            if (!AlgorithmType.TryGetValue(mechanism, out var algorithmType))
                return false;

            return Pkcs5S2.Equals(algorithmType);
        }

        public static bool IsOpenSsl(string algorithm)
        {
            if (!Algorithms.TryGetValue(algorithm, out var mechanism))
                return false;
            if (!AlgorithmType.TryGetValue(mechanism, out var algorithmType))
                return false;

            return OpenSsl.Equals(algorithmType);
        }

        public static bool IsPbeAlgorithm(string algorithm)
        {
            if (!Algorithms.TryGetValue(algorithm, out var mechanism))
                return false;

            return AlgorithmType.ContainsKey(mechanism);
        }

        public static Asn1Encodable GenerateAlgorithmParameters(
            DerObjectIdentifier algorithmOid,
            byte[]              salt,
            int                 iterationCount)
        {
            return GenerateAlgorithmParameters(algorithmOid.Id, salt, iterationCount);
        }

        public static Asn1Encodable GenerateAlgorithmParameters(
            string  algorithm,
            byte[]  salt,
            int     iterationCount)
        {
            if (IsPkcs12(algorithm))
            {
                return new Pkcs12PbeParams(salt, iterationCount);
            }
            else if (IsPkcs5Scheme2(algorithm))
            {
                return new Pbkdf2Params(salt, iterationCount);
            }
            else
            {
                return new PbeParameter(salt, iterationCount);
            }
        }

        public static Asn1Encodable GenerateAlgorithmParameters( 
            DerObjectIdentifier cipherAlgorithm,
            DerObjectIdentifier hashAlgorithm,
            byte[] salt,
            int iterationCount,
            SecureRandom secureRandom)
        {
            EncryptionScheme encScheme;
            if (NistObjectIdentifiers.IdAes128Cbc.Equals(cipherAlgorithm)
                || NistObjectIdentifiers.IdAes192Cbc.Equals(cipherAlgorithm)
                || NistObjectIdentifiers.IdAes256Cbc.Equals(cipherAlgorithm)
                || NistObjectIdentifiers.IdAes128Cfb.Equals(cipherAlgorithm)
                || NistObjectIdentifiers.IdAes192Cfb.Equals(cipherAlgorithm)
                || NistObjectIdentifiers.IdAes256Cfb.Equals(cipherAlgorithm))
            {
                byte[] iv = new byte[16];
                secureRandom.NextBytes(iv);
                encScheme = new EncryptionScheme(cipherAlgorithm, new DerOctetString(iv));
            }
            else
            {
                throw new ArgumentException("unknown cipher: " + cipherAlgorithm);
            }

            KeyDerivationFunc func = new KeyDerivationFunc(PkcsObjectIdentifiers.IdPbkdf2, new Pbkdf2Params(salt, iterationCount, new AlgorithmIdentifier(hashAlgorithm, DerNull.Instance)));

            return new PbeS2Parameters(func, encScheme);
        }

        public static ICipherParameters GenerateCipherParameters(
            DerObjectIdentifier algorithmOid,
            char[]              password,
            Asn1Encodable       pbeParameters)
        {
            return GenerateCipherParameters(algorithmOid.Id, password, false, pbeParameters);
        }

        public static ICipherParameters GenerateCipherParameters(
            DerObjectIdentifier algorithmOid,
            char[]              password,
            bool				wrongPkcs12Zero,
            Asn1Encodable       pbeParameters)
        {
            return GenerateCipherParameters(algorithmOid.Id, password, wrongPkcs12Zero, pbeParameters);
        }

        public static ICipherParameters GenerateCipherParameters(
            AlgorithmIdentifier algID,
            char[]              password)
        {
            return GenerateCipherParameters(algID.Algorithm.Id, password, false, algID.Parameters);
        }

        public static ICipherParameters GenerateCipherParameters(
            AlgorithmIdentifier algID,
            char[]              password,
            bool				wrongPkcs12Zero)
        {
            return GenerateCipherParameters(algID.Algorithm.Id, password, wrongPkcs12Zero, algID.Parameters);
        }

        public static ICipherParameters GenerateCipherParameters(
            string          algorithm,
            char[]          password,
            Asn1Encodable   pbeParameters)
        {
            return GenerateCipherParameters(algorithm, password, false, pbeParameters);
        }

        public static ICipherParameters GenerateCipherParameters(
            string          algorithm,
            char[]          password,
            bool			wrongPkcs12Zero,
            Asn1Encodable   pbeParameters)
        {
            string mechanism = CollectionUtilities.GetValueOrNull(Algorithms, algorithm);

            byte[] keyBytes = null;
            byte[] salt = null;
            int iterationCount = 0;

            if (IsPkcs12(mechanism))
            {
                Pkcs12PbeParams pbeParams = Pkcs12PbeParams.GetInstance(pbeParameters);
                salt = pbeParams.GetIV();
                iterationCount = pbeParams.Iterations.IntValue;
                keyBytes = PbeParametersGenerator.Pkcs12PasswordToBytes(password, wrongPkcs12Zero);
            }
            else if (IsPkcs5Scheme2(mechanism))
            {
                // See below
            }
            else
            {
                PbeParameter pbeParams = PbeParameter.GetInstance(pbeParameters);
                salt = pbeParams.GetSalt();
                iterationCount = pbeParams.IterationCount.IntValue;
                keyBytes = PbeParametersGenerator.Pkcs5PasswordToBytes(password);
            }

            ICipherParameters parameters = null;

            if (IsPkcs5Scheme2(mechanism))
            {
                PbeS2Parameters s2p = PbeS2Parameters.GetInstance(pbeParameters.ToAsn1Object());
                AlgorithmIdentifier encScheme = s2p.EncryptionScheme;
                DerObjectIdentifier encOid = encScheme.Algorithm;
                Asn1Object encParams = encScheme.Parameters.ToAsn1Object();

                Pbkdf2Params pbeParams = Pbkdf2Params.GetInstance(s2p.KeyDerivationFunc.Parameters.ToAsn1Object());
                IDigest digest = DigestUtilities.GetDigest(pbeParams.Prf.Algorithm);

                byte[] iv;
                if (encOid.Equals(PkcsObjectIdentifiers.RC2Cbc)) // PKCS5.B.2.3
                {
                    RC2CbcParameter rc2Params = RC2CbcParameter.GetInstance(encParams);
                    iv = rc2Params.GetIV();
                }
                else
                {
                    iv = Asn1OctetString.GetInstance(encParams).GetOctets();
                }

                salt = pbeParams.GetSalt();
                iterationCount = pbeParams.IterationCount.IntValue;
                keyBytes = PbeParametersGenerator.Pkcs5PasswordToBytes(password);

                int keyLength = pbeParams.KeyLength != null
                    ?	pbeParams.KeyLength.IntValue * 8
                    :	GeneratorUtilities.GetDefaultKeySize(encOid);

                PbeParametersGenerator gen = MakePbeGenerator(
                    AlgorithmType[mechanism], digest, keyBytes, salt, iterationCount);

                parameters = gen.GenerateDerivedParameters(encOid.Id, keyLength);

                if (iv != null)
                {
                    // FIXME? OpenSSL weirdness with IV of zeros (for ECB keys?)
                    if (Arrays.AreEqual(iv, new byte[iv.Length]))
                    {
                        //Console.Error.Write("***** IV all 0 (length " + iv.Length + ") *****");
                    }
                    else
                    {
                        parameters = new ParametersWithIV(parameters, iv);
                    }
                }
            }
            else if (Platform.StartsWith(mechanism, "PBEwithSHA-1"))
            {
                PbeParametersGenerator generator = MakePbeGenerator(
                    AlgorithmType[mechanism], new Sha1Digest(), keyBytes, salt, iterationCount);

                if (mechanism.Equals("PBEwithSHA-1and128bitAES-CBC-BC"))
                {
                    parameters = generator.GenerateDerivedParameters("AES", 128, 128);
                }
                else if (mechanism.Equals("PBEwithSHA-1and192bitAES-CBC-BC"))
                {
                    parameters = generator.GenerateDerivedParameters("AES", 192, 128);
                }
                else if (mechanism.Equals("PBEwithSHA-1and256bitAES-CBC-BC"))
                {
                    parameters = generator.GenerateDerivedParameters("AES", 256, 128);
                }
                else if (mechanism.Equals("PBEwithSHA-1and128bitRC4"))
                {
                    parameters = generator.GenerateDerivedParameters("RC4", 128);
                }
                else if (mechanism.Equals("PBEwithSHA-1and40bitRC4"))
                {
                    parameters = generator.GenerateDerivedParameters("RC4", 40);
                }
                else if (mechanism.Equals("PBEwithSHA-1and3-keyDESEDE-CBC"))
                {
                    parameters = generator.GenerateDerivedParameters("DESEDE", 192, 64);
                }
                else if (mechanism.Equals("PBEwithSHA-1and2-keyDESEDE-CBC"))
                {
                    parameters = generator.GenerateDerivedParameters("DESEDE", 128, 64);
                }
                else if (mechanism.Equals("PBEwithSHA-1and128bitRC2-CBC"))
                {
                    parameters = generator.GenerateDerivedParameters("RC2", 128, 64);
                }
                else if (mechanism.Equals("PBEwithSHA-1and40bitRC2-CBC"))
                {
                    parameters = generator.GenerateDerivedParameters("RC2", 40, 64);
                }
                else if (mechanism.Equals("PBEwithSHA-1andDES-CBC"))
                {
                    parameters = generator.GenerateDerivedParameters("DES", 64, 64);
                }
                else if (mechanism.Equals("PBEwithSHA-1andRC2-CBC"))
                {
                    parameters = generator.GenerateDerivedParameters("RC2", 64, 64);
                }
            }
            else if (Platform.StartsWith(mechanism, "PBEwithSHA-256"))
            {
                PbeParametersGenerator generator = MakePbeGenerator(
                    AlgorithmType[mechanism], new Sha256Digest(), keyBytes, salt, iterationCount);

                if (mechanism.Equals("PBEwithSHA-256and128bitAES-CBC-BC"))
                {
                    parameters = generator.GenerateDerivedParameters("AES", 128, 128);
                }
                else if (mechanism.Equals("PBEwithSHA-256and192bitAES-CBC-BC"))
                {
                    parameters = generator.GenerateDerivedParameters("AES", 192, 128);
                }
                else if (mechanism.Equals("PBEwithSHA-256and256bitAES-CBC-BC"))
                {
                    parameters = generator.GenerateDerivedParameters("AES", 256, 128);
                }
            }
            else if (Platform.StartsWith(mechanism, "PBEwithMD5"))
            {
                PbeParametersGenerator generator = MakePbeGenerator(
                    AlgorithmType[mechanism], new MD5Digest(), keyBytes, salt, iterationCount);

                if (mechanism.Equals("PBEwithMD5andDES-CBC"))
                {
                    parameters = generator.GenerateDerivedParameters("DES", 64, 64);
                }
                else if (mechanism.Equals("PBEwithMD5andRC2-CBC"))
                {
                    parameters = generator.GenerateDerivedParameters("RC2", 64, 64);
                }
                else if (mechanism.Equals("PBEwithMD5and128bitAES-CBC-OpenSSL"))
                {
                    parameters = generator.GenerateDerivedParameters("AES", 128, 128);
                }
                else if (mechanism.Equals("PBEwithMD5and192bitAES-CBC-OpenSSL"))
                {
                    parameters = generator.GenerateDerivedParameters("AES", 192, 128);
                }
                else if (mechanism.Equals("PBEwithMD5and256bitAES-CBC-OpenSSL"))
                {
                    parameters = generator.GenerateDerivedParameters("AES", 256, 128);
                }
            }
            else if (Platform.StartsWith(mechanism, "PBEwithMD2"))
            {
                PbeParametersGenerator generator = MakePbeGenerator(
                    AlgorithmType[mechanism], new MD2Digest(), keyBytes, salt, iterationCount);
                if (mechanism.Equals("PBEwithMD2andDES-CBC"))
                {
                    parameters = generator.GenerateDerivedParameters("DES", 64, 64);
                }
                else if (mechanism.Equals("PBEwithMD2andRC2-CBC"))
                {
                    parameters = generator.GenerateDerivedParameters("RC2", 64, 64);
                }
            }
            else if (Platform.StartsWith(mechanism, "PBEwithHmac"))
            {
                string digestName = mechanism.Substring("PBEwithHmac".Length);
                IDigest digest = DigestUtilities.GetDigest(digestName);

                PbeParametersGenerator generator = MakePbeGenerator(
                    AlgorithmType[mechanism], digest, keyBytes, salt, iterationCount);

                int bitLen = digest.GetDigestSize() * 8;
                parameters = generator.GenerateDerivedMacParameters(bitLen);
            }

            Array.Clear(keyBytes, 0, keyBytes.Length);

            return FixDesParity(mechanism, parameters);
        }

        public static object CreateEngine(
            DerObjectIdentifier algorithmOid)
        {
            return CreateEngine(algorithmOid.Id);
        }

        public static object CreateEngine(
            AlgorithmIdentifier algID)
        {
            string algorithm = algID.Algorithm.Id;

            if (IsPkcs5Scheme2(algorithm))
            {
                PbeS2Parameters s2p = PbeS2Parameters.GetInstance(algID.Parameters.ToAsn1Object());
                AlgorithmIdentifier encScheme = s2p.EncryptionScheme;
                return CipherUtilities.GetCipher(encScheme.Algorithm);
            }

            return CreateEngine(algorithm);
        }

        public static object CreateEngine(string algorithm)
        {
            string mechanism = CollectionUtilities.GetValueOrNull(Algorithms, algorithm);

            if (Platform.StartsWith(mechanism, "PBEwithHmac"))
            {
                string digestName = mechanism.Substring("PBEwithHmac".Length);

                return MacUtilities.GetMac("HMAC/" + digestName);
            }

            if (Platform.StartsWith(mechanism, "PBEwithMD2")
                ||	Platform.StartsWith(mechanism, "PBEwithMD5")
                ||	Platform.StartsWith(mechanism, "PBEwithSHA-1")
                ||	Platform.StartsWith(mechanism, "PBEwithSHA-256"))
            {
                if (Platform.EndsWith(mechanism, "AES-CBC-BC") || Platform.EndsWith(mechanism, "AES-CBC-OPENSSL"))
                {
                    return CipherUtilities.GetCipher("AES/CBC");
                }

                if (Platform.EndsWith(mechanism, "DES-CBC"))
                {
                    return CipherUtilities.GetCipher("DES/CBC");
                }

                if (Platform.EndsWith(mechanism, "DESEDE-CBC"))
                {
                    return CipherUtilities.GetCipher("DESEDE/CBC");
                }

                if (Platform.EndsWith(mechanism, "RC2-CBC"))
                {
                    return CipherUtilities.GetCipher("RC2/CBC");
                }

                if (Platform.EndsWith(mechanism, "RC4"))
                {
                    return CipherUtilities.GetCipher("RC4");
                }
            }

            return null;
        }

        public static string GetEncodingName(DerObjectIdentifier oid)
        {
            return CollectionUtilities.GetValueOrNull(Algorithms, oid.Id);
        }

        private static ICipherParameters FixDesParity(string mechanism, ICipherParameters parameters)
        {
            if (!Platform.EndsWith(mechanism, "DES-CBC") && !Platform.EndsWith(mechanism, "DESEDE-CBC"))
            {
                return parameters;
            }

            if (parameters is ParametersWithIV)
            {
                ParametersWithIV ivParams = (ParametersWithIV)parameters;
                return new ParametersWithIV(FixDesParity(mechanism, ivParams.Parameters), ivParams.GetIV());
            }

            KeyParameter kParam = (KeyParameter)parameters;
            byte[] keyBytes = kParam.GetKey();
            DesParameters.SetOddParity(keyBytes);
            return new KeyParameter(keyBytes);
        }
    }
}
