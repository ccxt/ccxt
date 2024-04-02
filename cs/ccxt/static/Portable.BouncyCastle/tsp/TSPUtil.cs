using System;
using System.Collections.Generic;
using System.IO;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.CryptoPro;
using Org.BouncyCastle.Asn1.GM;
using Org.BouncyCastle.Asn1.Nist;
using Org.BouncyCastle.Asn1.Oiw;
using Org.BouncyCastle.Asn1.Pkcs;
using Org.BouncyCastle.Asn1.Rosstandart;
using Org.BouncyCastle.Asn1.TeleTrust;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Cms;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Collections;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Tsp
{
	public class TspUtil
	{
		private static readonly Dictionary<string, int> DigestLengths = new Dictionary<string, int>();
        private static readonly Dictionary<string, string> DigestNames = new Dictionary<string, string>();

		static TspUtil()
		{
			DigestLengths.Add(PkcsObjectIdentifiers.MD5.Id, 16);
            DigestLengths.Add(OiwObjectIdentifiers.IdSha1.Id, 20);
            DigestLengths.Add(NistObjectIdentifiers.IdSha224.Id, 28);
            DigestLengths.Add(NistObjectIdentifiers.IdSha256.Id, 32);
            DigestLengths.Add(NistObjectIdentifiers.IdSha384.Id, 48);
            DigestLengths.Add(NistObjectIdentifiers.IdSha512.Id, 64);
            DigestLengths.Add(TeleTrusTObjectIdentifiers.RipeMD128.Id, 16);
            DigestLengths.Add(TeleTrusTObjectIdentifiers.RipeMD160.Id, 20);
            DigestLengths.Add(TeleTrusTObjectIdentifiers.RipeMD256.Id, 32);
            DigestLengths.Add(CryptoProObjectIdentifiers.GostR3411.Id, 32);
            DigestLengths.Add(RosstandartObjectIdentifiers.id_tc26_gost_3411_12_256.Id, 32);
            DigestLengths.Add(RosstandartObjectIdentifiers.id_tc26_gost_3411_12_512.Id, 64);
            DigestLengths.Add(GMObjectIdentifiers.sm3.Id, 32);

            DigestNames.Add(PkcsObjectIdentifiers.MD5.Id, "MD5");
            DigestNames.Add(OiwObjectIdentifiers.IdSha1.Id, "SHA1");
            DigestNames.Add(NistObjectIdentifiers.IdSha224.Id, "SHA224");
            DigestNames.Add(NistObjectIdentifiers.IdSha256.Id, "SHA256");
            DigestNames.Add(NistObjectIdentifiers.IdSha384.Id, "SHA384");
            DigestNames.Add(NistObjectIdentifiers.IdSha512.Id, "SHA512");
            DigestNames.Add(PkcsObjectIdentifiers.MD5WithRsaEncryption.Id, "MD5");
			DigestNames.Add(PkcsObjectIdentifiers.Sha1WithRsaEncryption.Id, "SHA1");
            DigestNames.Add(PkcsObjectIdentifiers.Sha224WithRsaEncryption.Id, "SHA224");
            DigestNames.Add(PkcsObjectIdentifiers.Sha256WithRsaEncryption.Id, "SHA256");
            DigestNames.Add(PkcsObjectIdentifiers.Sha384WithRsaEncryption.Id, "SHA384");
            DigestNames.Add(PkcsObjectIdentifiers.Sha512WithRsaEncryption.Id, "SHA512");
            DigestNames.Add(TeleTrusTObjectIdentifiers.RipeMD128.Id, "RIPEMD128");
            DigestNames.Add(TeleTrusTObjectIdentifiers.RipeMD160.Id, "RIPEMD160");
            DigestNames.Add(TeleTrusTObjectIdentifiers.RipeMD256.Id, "RIPEMD256");
            DigestNames.Add(CryptoProObjectIdentifiers.GostR3411.Id, "GOST3411");
            DigestNames.Add(OiwObjectIdentifiers.DsaWithSha1.Id, "SHA1");
            DigestNames.Add(OiwObjectIdentifiers.Sha1WithRsa.Id, "SHA1");
            DigestNames.Add(OiwObjectIdentifiers.MD5WithRsa.Id, "MD5");
            DigestNames.Add(RosstandartObjectIdentifiers.id_tc26_gost_3411_12_256.Id, "GOST3411-2012-256");
            DigestNames.Add(RosstandartObjectIdentifiers.id_tc26_gost_3411_12_512.Id, "GOST3411-2012-512");
            DigestNames.Add(GMObjectIdentifiers.sm3.Id, "SM3");
        }


	    /**
	     * Fetches the signature time-stamp attributes from a SignerInformation object.
	     * Checks that the MessageImprint for each time-stamp matches the signature field.
	     * (see RFC 3161 Appendix A).
	     *
	     * @param signerInfo a SignerInformation to search for time-stamps
	     * @return a collection of TimeStampToken objects
	     * @throws TSPValidationException
	     */
		public static IList<TimeStampToken> GetSignatureTimestamps(
			SignerInformation signerInfo)
		{
			var timestamps = new List<TimeStampToken>();

			Asn1.Cms.AttributeTable unsignedAttrs = signerInfo.UnsignedAttributes;
			if (unsignedAttrs != null)
			{
				foreach (Asn1.Cms.Attribute tsAttr in unsignedAttrs.GetAll(
					PkcsObjectIdentifiers.IdAASignatureTimeStampToken))
				{
					foreach (Asn1Encodable asn1 in tsAttr.AttrValues)
					{
						try
						{
							Asn1.Cms.ContentInfo contentInfo = Asn1.Cms.ContentInfo.GetInstance(
								asn1.ToAsn1Object());
							TimeStampToken timeStampToken = new TimeStampToken(contentInfo);
							TimeStampTokenInfo tstInfo = timeStampToken.TimeStampInfo;

							byte[] expectedDigest = DigestUtilities.CalculateDigest(
								GetDigestAlgName(tstInfo.MessageImprintAlgOid),
							    signerInfo.GetSignature());

							if (!Arrays.ConstantTimeAreEqual(expectedDigest, tstInfo.GetMessageImprintDigest()))
								throw new TspValidationException("Incorrect digest in message imprint");

							timestamps.Add(timeStampToken);
						}
						catch (SecurityUtilityException)
						{
							throw new TspValidationException("Unknown hash algorithm specified in timestamp");
						}
						catch (Exception)
						{
							throw new TspValidationException("Timestamp could not be parsed");
						}
					}
				}
			}

			return timestamps;
		}

		/**
		 * Validate the passed in certificate as being of the correct type to be used
		 * for time stamping. To be valid it must have an ExtendedKeyUsage extension
		 * which has a key purpose identifier of id-kp-timeStamping.
		 *
		 * @param cert the certificate of interest.
		 * @throws TspValidationException if the certicate fails on one of the check points.
		 */
		public static void ValidateCertificate(
			X509Certificate cert)
		{
			if (cert.Version != 3)
				throw new ArgumentException("Certificate must have an ExtendedKeyUsage extension.");

			Asn1OctetString ext = cert.GetExtensionValue(X509Extensions.ExtendedKeyUsage);
			if (ext == null)
				throw new TspValidationException("Certificate must have an ExtendedKeyUsage extension.");

			if (!cert.GetCriticalExtensionOids().Contains(X509Extensions.ExtendedKeyUsage.Id))
				throw new TspValidationException("Certificate must have an ExtendedKeyUsage extension marked as critical.");

			try
			{
				ExtendedKeyUsage extKey = ExtendedKeyUsage.GetInstance(
					Asn1Object.FromByteArray(ext.GetOctets()));

				if (!extKey.HasKeyPurposeId(KeyPurposeID.IdKPTimeStamping) || extKey.Count != 1)
					throw new TspValidationException("ExtendedKeyUsage not solely time stamping.");
			}
			catch (IOException)
			{
				throw new TspValidationException("cannot process ExtendedKeyUsage extension");
			}
		}

		/// <summary>
		/// Return the digest algorithm using one of the standard JCA string
		/// representations rather than the algorithm identifier (if possible).
		/// </summary>
		internal static string GetDigestAlgName(string digestAlgOid)
		{
			return CollectionUtilities.GetValueOrKey(DigestNames, digestAlgOid);
		}

		internal static int GetDigestLength(string digestAlgOid)
		{
			if (!DigestLengths.TryGetValue(digestAlgOid, out int length))
				throw new TspException("digest algorithm cannot be found.");

			return length;
		}

		internal static IDigest CreateDigestInstance(string digestAlgOID)
		{
	        string digestName = GetDigestAlgName(digestAlgOID);

			return DigestUtilities.GetDigest(digestName);
		}

		internal static ISet<DerObjectIdentifier> GetCriticalExtensionOids(X509Extensions extensions)
		{
			return extensions == null
				? new HashSet<DerObjectIdentifier>()
				: new HashSet<DerObjectIdentifier>(extensions.GetCriticalExtensionOids());
		}

		internal static ISet<DerObjectIdentifier> GetNonCriticalExtensionOids(X509Extensions extensions)
		{
			return extensions == null
				? new HashSet<DerObjectIdentifier>()
				: new HashSet<DerObjectIdentifier>(extensions.GetNonCriticalExtensionOids());
		}

		internal static IList<DerObjectIdentifier> GetExtensionOids(X509Extensions extensions)
		{
			return extensions == null
				? new List<DerObjectIdentifier>()
				: new List<DerObjectIdentifier>(extensions.GetExtensionOids());
		}
	}
}
