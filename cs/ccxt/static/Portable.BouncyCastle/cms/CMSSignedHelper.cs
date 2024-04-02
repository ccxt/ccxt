using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.CryptoPro;
using Org.BouncyCastle.Asn1.Eac;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.TeleTrust;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Asn1.X9;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Cms
{
    internal class CmsSignedHelper
    {
        internal static readonly CmsSignedHelper Instance = new CmsSignedHelper();

        private static readonly string EncryptionECDsaWithSha1 = X9ObjectIdentifiers.ECDsaWithSha1.Id;
        private static readonly string EncryptionECDsaWithSha224 = X9ObjectIdentifiers.ECDsaWithSha224.Id;
        private static readonly string EncryptionECDsaWithSha256 = X9ObjectIdentifiers.ECDsaWithSha256.Id;
        private static readonly string EncryptionECDsaWithSha384 = X9ObjectIdentifiers.ECDsaWithSha384.Id;
        private static readonly string EncryptionECDsaWithSha512 = X9ObjectIdentifiers.ECDsaWithSha512.Id;

		private static readonly IDictionary<string, string> m_encryptionAlgs = new Dictionary<string, string>();
		private static readonly IDictionary<string, string> m_digestAlgs = new Dictionary<string, string>();
		private static readonly IDictionary<string, string[]> m_digestAliases = new Dictionary<string, string[]>();

        private static readonly HashSet<string> noParams = new HashSet<string>();
		private static readonly IDictionary<string, string> m_ecAlgorithms = new Dictionary<string, string>();

		private static void AddEntries(DerObjectIdentifier oid, string digest, string encryption)
		{
			string alias = oid.Id;
			m_digestAlgs.Add(alias, digest);
			m_encryptionAlgs.Add(alias, encryption);
		}

		static CmsSignedHelper()
		{
			AddEntries(NistObjectIdentifiers.DsaWithSha224, "SHA224", "DSA");
			AddEntries(NistObjectIdentifiers.DsaWithSha256, "SHA256", "DSA");
			AddEntries(NistObjectIdentifiers.DsaWithSha384, "SHA384", "DSA");
			AddEntries(NistObjectIdentifiers.DsaWithSha512, "SHA512", "DSA");
			AddEntries(OiwObjectIdentifiers.DsaWithSha1, "SHA1", "DSA");
			AddEntries(OiwObjectIdentifiers.MD4WithRsa, "MD4", "RSA");
			AddEntries(OiwObjectIdentifiers.MD4WithRsaEncryption, "MD4", "RSA");
			AddEntries(OiwObjectIdentifiers.MD5WithRsa, "MD5", "RSA");
			AddEntries(OiwObjectIdentifiers.Sha1WithRsa, "SHA1", "RSA");
			AddEntries(PkcsObjectIdentifiers.MD2WithRsaEncryption, "MD2", "RSA");
			AddEntries(PkcsObjectIdentifiers.MD4WithRsaEncryption, "MD4", "RSA");
			AddEntries(PkcsObjectIdentifiers.MD5WithRsaEncryption, "MD5", "RSA");
			AddEntries(PkcsObjectIdentifiers.Sha1WithRsaEncryption, "SHA1", "RSA");
			AddEntries(PkcsObjectIdentifiers.Sha224WithRsaEncryption, "SHA224", "RSA");
			AddEntries(PkcsObjectIdentifiers.Sha256WithRsaEncryption, "SHA256", "RSA");
			AddEntries(PkcsObjectIdentifiers.Sha384WithRsaEncryption, "SHA384", "RSA");
			AddEntries(PkcsObjectIdentifiers.Sha512WithRsaEncryption, "SHA512", "RSA");
            AddEntries(PkcsObjectIdentifiers.Sha512_224WithRSAEncryption, "SHA512(224)", "RSA");
            AddEntries(PkcsObjectIdentifiers.Sha512_256WithRSAEncryption, "SHA512(256)", "RSA");
            AddEntries(NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_224, "SHA3-224", "RSA");
            AddEntries(NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_256, "SHA3-256", "RSA");
            AddEntries(NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_384, "SHA3-384", "RSA");
            AddEntries(NistObjectIdentifiers.IdRsassaPkcs1V15WithSha3_512, "SHA3-512", "RSA");
            AddEntries(X9ObjectIdentifiers.ECDsaWithSha1, "SHA1", "ECDSA");
			AddEntries(X9ObjectIdentifiers.ECDsaWithSha224, "SHA224", "ECDSA");
			AddEntries(X9ObjectIdentifiers.ECDsaWithSha256, "SHA256", "ECDSA");
			AddEntries(X9ObjectIdentifiers.ECDsaWithSha384, "SHA384", "ECDSA");
			AddEntries(X9ObjectIdentifiers.ECDsaWithSha512, "SHA512", "ECDSA");
			AddEntries(X9ObjectIdentifiers.IdDsaWithSha1, "SHA1", "DSA");
			AddEntries(EacObjectIdentifiers.id_TA_ECDSA_SHA_1, "SHA1", "ECDSA");
			AddEntries(EacObjectIdentifiers.id_TA_ECDSA_SHA_224, "SHA224", "ECDSA");
			AddEntries(EacObjectIdentifiers.id_TA_ECDSA_SHA_256, "SHA256", "ECDSA");
			AddEntries(EacObjectIdentifiers.id_TA_ECDSA_SHA_384, "SHA384", "ECDSA");
			AddEntries(EacObjectIdentifiers.id_TA_ECDSA_SHA_512, "SHA512", "ECDSA");
			AddEntries(EacObjectIdentifiers.id_TA_RSA_v1_5_SHA_1, "SHA1", "RSA");
			AddEntries(EacObjectIdentifiers.id_TA_RSA_v1_5_SHA_256, "SHA256", "RSA");
			AddEntries(EacObjectIdentifiers.id_TA_RSA_PSS_SHA_1, "SHA1", "RSAandMGF1");
			AddEntries(EacObjectIdentifiers.id_TA_RSA_PSS_SHA_256, "SHA256", "RSAandMGF1");

			m_encryptionAlgs.Add(X9ObjectIdentifiers.IdDsa.Id, "DSA");
			m_encryptionAlgs.Add(PkcsObjectIdentifiers.RsaEncryption.Id, "RSA");
			m_encryptionAlgs.Add(TeleTrusTObjectIdentifiers.TeleTrusTRsaSignatureAlgorithm.Id, "RSA");
			m_encryptionAlgs.Add(X509ObjectIdentifiers.IdEARsa.Id, "RSA");
			m_encryptionAlgs.Add(CmsSignedGenerator.EncryptionRsaPss, "RSAandMGF1");
			m_encryptionAlgs.Add(CryptoProObjectIdentifiers.GostR3410x94.Id, "GOST3410");
			m_encryptionAlgs.Add(CryptoProObjectIdentifiers.GostR3410x2001.Id, "ECGOST3410");
			m_encryptionAlgs.Add("1.3.6.1.4.1.5849.1.6.2", "ECGOST3410");
			m_encryptionAlgs.Add("1.3.6.1.4.1.5849.1.1.5", "GOST3410");

			m_digestAlgs.Add(PkcsObjectIdentifiers.MD2.Id, "MD2");
			m_digestAlgs.Add(PkcsObjectIdentifiers.MD4.Id, "MD4");
			m_digestAlgs.Add(PkcsObjectIdentifiers.MD5.Id, "MD5");
			m_digestAlgs.Add(OiwObjectIdentifiers.IdSha1.Id, "SHA1");
			m_digestAlgs.Add(NistObjectIdentifiers.IdSha224.Id, "SHA224");
			m_digestAlgs.Add(NistObjectIdentifiers.IdSha256.Id, "SHA256");
			m_digestAlgs.Add(NistObjectIdentifiers.IdSha384.Id, "SHA384");
			m_digestAlgs.Add(NistObjectIdentifiers.IdSha512.Id, "SHA512");
			m_digestAlgs.Add(NistObjectIdentifiers.IdSha512_224.Id, "SHA512(224)");
			m_digestAlgs.Add(NistObjectIdentifiers.IdSha512_256.Id, "SHA512(256)");
			m_digestAlgs.Add(NistObjectIdentifiers.IdSha3_224.Id, "SHA3-224");
			m_digestAlgs.Add(NistObjectIdentifiers.IdSha3_256.Id, "SHA3-256");
			m_digestAlgs.Add(NistObjectIdentifiers.IdSha3_384.Id, "SHA3-384");
			m_digestAlgs.Add(NistObjectIdentifiers.IdSha3_512.Id, "SHA3-512");
			m_digestAlgs.Add(TeleTrusTObjectIdentifiers.RipeMD128.Id, "RIPEMD128");
			m_digestAlgs.Add(TeleTrusTObjectIdentifiers.RipeMD160.Id, "RIPEMD160");
			m_digestAlgs.Add(TeleTrusTObjectIdentifiers.RipeMD256.Id, "RIPEMD256");
			m_digestAlgs.Add(CryptoProObjectIdentifiers.GostR3411.Id,  "GOST3411");
			m_digestAlgs.Add("1.3.6.1.4.1.5849.1.2.1",  "GOST3411");

			m_digestAliases.Add("SHA1", new string[]{ "SHA-1" });
			m_digestAliases.Add("SHA224", new string[]{ "SHA-224" });
			m_digestAliases.Add("SHA256", new string[]{ "SHA-256" });
			m_digestAliases.Add("SHA384", new string[]{ "SHA-384" });
			m_digestAliases.Add("SHA512", new string[]{ "SHA-512" });

            noParams.Add(CmsSignedGenerator.EncryptionDsa);
            //			noParams.Add(EncryptionECDsa);
            noParams.Add(EncryptionECDsaWithSha1);
            noParams.Add(EncryptionECDsaWithSha224);
            noParams.Add(EncryptionECDsaWithSha256);
            noParams.Add(EncryptionECDsaWithSha384);
            noParams.Add(EncryptionECDsaWithSha512);

			m_ecAlgorithms.Add(CmsSignedGenerator.DigestSha1, EncryptionECDsaWithSha1);
			m_ecAlgorithms.Add(CmsSignedGenerator.DigestSha224, EncryptionECDsaWithSha224);
			m_ecAlgorithms.Add(CmsSignedGenerator.DigestSha256, EncryptionECDsaWithSha256);
			m_ecAlgorithms.Add(CmsSignedGenerator.DigestSha384, EncryptionECDsaWithSha384);
			m_ecAlgorithms.Add(CmsSignedGenerator.DigestSha512, EncryptionECDsaWithSha512);
		}

		/**
        * Return the digest algorithm using one of the standard JCA string
        * representations rather than the algorithm identifier (if possible).
        */
		internal string GetDigestAlgName(string digestAlgOid)
        {
			return m_digestAlgs.TryGetValue(digestAlgOid, out var algName) ? algName : digestAlgOid;
        }

		internal AlgorithmIdentifier GetEncAlgorithmIdentifier(DerObjectIdentifier encOid,
			Asn1Encodable sigX509Parameters)
		{
			if (noParams.Contains(encOid.Id))
			{
				return new AlgorithmIdentifier(encOid);
			}

			return new AlgorithmIdentifier(encOid, sigX509Parameters);
		}

		internal string[] GetDigestAliases(string algName)
		{
			return m_digestAliases.TryGetValue(algName, out var aliases) ? (string[])aliases.Clone() : new string[0];
		}

		/**
        * Return the digest encryption algorithm using one of the standard
        * JCA string representations rather than the algorithm identifier (if
        * possible).
        */
        internal string GetEncryptionAlgName(string encryptionAlgOid)
        {
			return m_encryptionAlgs.TryGetValue(encryptionAlgOid, out var algName) ? algName : encryptionAlgOid;
        }

		internal IDigest GetDigestInstance(
			string algorithm)
		{
			try
			{
				return DigestUtilities.GetDigest(algorithm);
			}
			catch (SecurityUtilityException e)
			{
				// This is probably superfluous on C#, since no provider infrastructure,
				// assuming DigestUtilities already knows all the aliases
				foreach (string alias in GetDigestAliases(algorithm))
				{
					try { return DigestUtilities.GetDigest(alias); }
					catch (SecurityUtilityException) {}
				}
				throw e;
			}
		}

		internal ISigner GetSignatureInstance(
			string algorithm)
		{
			return SignerUtilities.GetSigner(algorithm);
		}

		internal AlgorithmIdentifier FixAlgID(
			AlgorithmIdentifier algId)
		{
			if (algId.Parameters == null)
                return new AlgorithmIdentifier(algId.Algorithm, DerNull.Instance);

			return algId;
		}

        internal string GetEncOid(
            AsymmetricKeyParameter key,
            string digestOID)
        {
            string encOID = null;

            if (key is RsaKeyParameters)
            {
                if (!((RsaKeyParameters)key).IsPrivate)
                    throw new ArgumentException("Expected RSA private key");

                encOID = CmsSignedGenerator.EncryptionRsa;
            }
            else if (key is DsaPrivateKeyParameters)
            {
                if (digestOID.Equals(CmsSignedGenerator.DigestSha1))
                {
                    encOID = CmsSignedGenerator.EncryptionDsa;
                }
                else if (digestOID.Equals(CmsSignedGenerator.DigestSha224))
                {
                    encOID = NistObjectIdentifiers.DsaWithSha224.Id;
                }
                else if (digestOID.Equals(CmsSignedGenerator.DigestSha256))
                {
                    encOID = NistObjectIdentifiers.DsaWithSha256.Id;
                }
                else if (digestOID.Equals(CmsSignedGenerator.DigestSha384))
                {
                    encOID = NistObjectIdentifiers.DsaWithSha384.Id;
                }
                else if (digestOID.Equals(CmsSignedGenerator.DigestSha512))
                {
                    encOID = NistObjectIdentifiers.DsaWithSha512.Id;
                }
                else
                {
                    throw new ArgumentException("can't mix DSA with anything but SHA1/SHA2");
                }
            }
            else if (key is ECPrivateKeyParameters)
            {
                ECPrivateKeyParameters ecPrivKey = (ECPrivateKeyParameters)key;
                string algName = ecPrivKey.AlgorithmName;

                if (algName == "ECGOST3410")
                {
                    encOID = CmsSignedGenerator.EncryptionECGost3410;
                }
                else
				{
					// TODO Should we insist on algName being one of "EC" or "ECDSA", as Java does?
					if (!m_ecAlgorithms.TryGetValue(digestOID, out encOID))
						throw new ArgumentException("can't mix ECDSA with anything but SHA family digests");
                }
            }
            else if (key is Gost3410PrivateKeyParameters)
            {
                encOID = CmsSignedGenerator.EncryptionGost3410;
            }
            else
            {
                throw new ArgumentException("Unknown algorithm in CmsSignedGenerator.GetEncOid");
            }

            return encOID;
        }

		internal IStore<X509V2AttributeCertificate> GetAttributeCertificates(Asn1Set attrCertSet)
		{
			var contents = new List<X509V2AttributeCertificate>();
			if (attrCertSet != null)
			{
				foreach (Asn1Encodable ae in attrCertSet)
				{
					if (ae != null && ae.ToAsn1Object() is Asn1TaggedObject t)
					{
						if (t.HasContextTag(2))
						{
							Asn1Sequence s = Asn1Sequence.GetInstance(t, false);

							contents.Add(new X509V2AttributeCertificate(AttributeCertificate.GetInstance(s)));
						}
					}
				}
			}
			return CollectionUtilities.CreateStore(contents);
		}

		internal IStore<X509Certificate> GetCertificates(Asn1Set certSet)
		{
			var contents = new List<X509Certificate>();
			if (certSet != null)
            {
				foreach (Asn1Encodable ae in certSet)
				{
					if (ae != null && ae.ToAsn1Object() is Asn1Sequence s)
					{
						contents.Add(new X509Certificate(X509CertificateStructure.GetInstance(s)));
					}
				}
			}
			return CollectionUtilities.CreateStore(contents);
		}

		internal IStore<X509Crl> GetCrls(Asn1Set crlSet)
		{
			var contents = new List<X509Crl>();
			if (crlSet != null)
			{
				foreach (Asn1Encodable ae in crlSet)
				{
					if (ae != null && ae.ToAsn1Object() is Asn1Sequence s)
					{
						contents.Add(new X509Crl(CertificateList.GetInstance(s)));
					}
				}
			}
			return CollectionUtilities.CreateStore(contents);
		}
    }
}
