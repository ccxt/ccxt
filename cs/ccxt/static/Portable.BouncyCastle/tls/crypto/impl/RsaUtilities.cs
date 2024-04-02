using System;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tls.Crypto.Impl
{
    public abstract class RsaUtilities
    {
        private static readonly byte[] RSAPSSParams_256_A, RSAPSSParams_384_A, RSAPSSParams_512_A;
        private static readonly byte[] RSAPSSParams_256_B, RSAPSSParams_384_B, RSAPSSParams_512_B;

        static RsaUtilities()
        {
            /*
             * RFC 4055
             */

            AlgorithmIdentifier sha256Identifier_A = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha256);
            AlgorithmIdentifier sha384Identifier_A = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha384);
            AlgorithmIdentifier sha512Identifier_A = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha512);
            AlgorithmIdentifier sha256Identifier_B = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha256, DerNull.Instance);
            AlgorithmIdentifier sha384Identifier_B = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha384, DerNull.Instance);
            AlgorithmIdentifier sha512Identifier_B = new AlgorithmIdentifier(NistObjectIdentifiers.IdSha512, DerNull.Instance);

            AlgorithmIdentifier mgf1SHA256Identifier_A = new AlgorithmIdentifier(PkcsObjectIdentifiers.IdMgf1, sha256Identifier_A);
            AlgorithmIdentifier mgf1SHA384Identifier_A = new AlgorithmIdentifier(PkcsObjectIdentifiers.IdMgf1, sha384Identifier_A);
            AlgorithmIdentifier mgf1SHA512Identifier_A = new AlgorithmIdentifier(PkcsObjectIdentifiers.IdMgf1, sha512Identifier_A);
            AlgorithmIdentifier mgf1SHA256Identifier_B = new AlgorithmIdentifier(PkcsObjectIdentifiers.IdMgf1, sha256Identifier_B);
            AlgorithmIdentifier mgf1SHA384Identifier_B = new AlgorithmIdentifier(PkcsObjectIdentifiers.IdMgf1, sha384Identifier_B);
            AlgorithmIdentifier mgf1SHA512Identifier_B = new AlgorithmIdentifier(PkcsObjectIdentifiers.IdMgf1, sha512Identifier_B);

            DerInteger sha256Size = new DerInteger(TlsCryptoUtilities.GetHashOutputSize(CryptoHashAlgorithm.sha256));
            DerInteger sha384Size = new DerInteger(TlsCryptoUtilities.GetHashOutputSize(CryptoHashAlgorithm.sha384));
            DerInteger sha512Size = new DerInteger(TlsCryptoUtilities.GetHashOutputSize(CryptoHashAlgorithm.sha512));

            DerInteger trailerField = new DerInteger(1);

            try
            {
                RSAPSSParams_256_A = new RsassaPssParameters(sha256Identifier_A, mgf1SHA256Identifier_A, sha256Size, trailerField)
                    .GetEncoded(Asn1Encodable.Der);
                RSAPSSParams_384_A = new RsassaPssParameters(sha384Identifier_A, mgf1SHA384Identifier_A, sha384Size, trailerField)
                    .GetEncoded(Asn1Encodable.Der);
                RSAPSSParams_512_A = new RsassaPssParameters(sha512Identifier_A, mgf1SHA512Identifier_A, sha512Size, trailerField)
                    .GetEncoded(Asn1Encodable.Der);
                RSAPSSParams_256_B = new RsassaPssParameters(sha256Identifier_B, mgf1SHA256Identifier_B, sha256Size, trailerField)
                    .GetEncoded(Asn1Encodable.Der);
                RSAPSSParams_384_B = new RsassaPssParameters(sha384Identifier_B, mgf1SHA384Identifier_B, sha384Size, trailerField)
                    .GetEncoded(Asn1Encodable.Der);
                RSAPSSParams_512_B = new RsassaPssParameters(sha512Identifier_B, mgf1SHA512Identifier_B, sha512Size, trailerField)
                    .GetEncoded(Asn1Encodable.Der);
            }
            catch (IOException e)
            {
                throw new InvalidOperationException(e.Message);
            }
        }

        public static bool SupportsPkcs1(AlgorithmIdentifier pubKeyAlgID)
        {
            DerObjectIdentifier oid = pubKeyAlgID.Algorithm;
            return PkcsObjectIdentifiers.RsaEncryption.Equals(oid)
                || X509ObjectIdentifiers.IdEARsa.Equals(oid);
        }

        public static bool SupportsPss_Pss(short signatureAlgorithm, AlgorithmIdentifier pubKeyAlgID)
        {
            DerObjectIdentifier oid = pubKeyAlgID.Algorithm;
            if (!PkcsObjectIdentifiers.IdRsassaPss.Equals(oid))
                return false;

            /*
             * TODO ASN.1 NULL shouldn't really be allowed here; it's a workaround for e.g. Oracle JDK
             * 1.8.0_241, where the X.509 certificate implementation adds the NULL when re-encoding the
             * original parameters. It appears it was fixed at some later date (OpenJDK 12.0.2 does not
             * have the issue), but not sure exactly when.
             */
            Asn1Encodable pssParams = pubKeyAlgID.Parameters;
            if (null == pssParams || pssParams is DerNull)
            {
                switch (signatureAlgorithm)
                {
                case SignatureAlgorithm.rsa_pss_pss_sha256:
                case SignatureAlgorithm.rsa_pss_pss_sha384:
                case SignatureAlgorithm.rsa_pss_pss_sha512:
                    return true;
                default:
                    return false;
                }
            }

            byte[] encoded;
            try
            {
                encoded = pssParams.ToAsn1Object().GetEncoded(Asn1Encodable.Der);
            }
            catch (Exception)
            {
                return false;
            }

            byte[] expected_A, expected_B;
            switch (signatureAlgorithm)
            {
            case SignatureAlgorithm.rsa_pss_pss_sha256:
                expected_A = RSAPSSParams_256_A;
                expected_B = RSAPSSParams_256_B;
                break;
            case SignatureAlgorithm.rsa_pss_pss_sha384:
                expected_A = RSAPSSParams_384_A;
                expected_B = RSAPSSParams_384_B;
                break;
            case SignatureAlgorithm.rsa_pss_pss_sha512:
                expected_A = RSAPSSParams_512_A;
                expected_B = RSAPSSParams_512_B;
                break;
            default:
                return false;
            }

            return Arrays.AreEqual(expected_A, encoded)
                || Arrays.AreEqual(expected_B, encoded);
        }

        public static bool SupportsPss_Rsae(AlgorithmIdentifier pubKeyAlgID)
        {
            DerObjectIdentifier oid = pubKeyAlgID.Algorithm;
            return PkcsObjectIdentifiers.RsaEncryption.Equals(oid);
        }
    }
}
