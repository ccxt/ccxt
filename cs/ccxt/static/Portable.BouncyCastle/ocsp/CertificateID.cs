using System;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Ocsp;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.X509;

namespace Org.BouncyCastle.Ocsp
{
	public class CertificateID
	{
		public const string HashSha1 = "1.3.14.3.2.26";

		private readonly CertID id;

		public CertificateID(
			CertID id)
		{
			if (id == null)
				throw new ArgumentNullException("id");

			this.id = id;
		}

		/**
		 * create from an issuer certificate and the serial number of the
		 * certificate it signed.
		 * @exception OcspException if any problems occur creating the id fields.
		 */
		public CertificateID(
			string			hashAlgorithm,
			X509Certificate	issuerCert,
			BigInteger		serialNumber)
		{
			AlgorithmIdentifier hashAlg = new AlgorithmIdentifier(
				new DerObjectIdentifier(hashAlgorithm), DerNull.Instance);

			this.id = CreateCertID(hashAlg, issuerCert, new DerInteger(serialNumber));
		}

		public string HashAlgOid
		{
            get { return id.HashAlgorithm.Algorithm.Id; }
		}

		public byte[] GetIssuerNameHash()
		{
			return id.IssuerNameHash.GetOctets();
		}

		public byte[] GetIssuerKeyHash()
		{
			return id.IssuerKeyHash.GetOctets();
		}

		/**
		 * return the serial number for the certificate associated
		 * with this request.
		 */
		public BigInteger SerialNumber
		{
			get { return id.SerialNumber.Value; }
		}

		public bool MatchesIssuer(
			X509Certificate	issuerCert)
		{
			return CreateCertID(id.HashAlgorithm, issuerCert, id.SerialNumber).Equals(id);
		}

		public CertID ToAsn1Object()
		{
			return id;
		}

		public override bool Equals(
			object obj)
		{
			if (obj == this)
				return true;

			CertificateID other = obj as CertificateID;

			if (other == null)
				return false;

			return id.ToAsn1Object().Equals(other.id.ToAsn1Object());
		}

		public override int GetHashCode()
		{
			return id.ToAsn1Object().GetHashCode();
		}


		/**
		 * Create a new CertificateID for a new serial number derived from a previous one
		 * calculated for the same CA certificate.
		 *
		 * @param original the previously calculated CertificateID for the CA.
		 * @param newSerialNumber the serial number for the new certificate of interest.
		 *
		 * @return a new CertificateID for newSerialNumber
		 */
		public static CertificateID DeriveCertificateID(CertificateID original, BigInteger newSerialNumber)
		{
			return new CertificateID(new CertID(original.id.HashAlgorithm, original.id.IssuerNameHash,
				original.id.IssuerKeyHash, new DerInteger(newSerialNumber)));
		}

        private static CertID CreateCertID(
			AlgorithmIdentifier	hashAlg,
			X509Certificate		issuerCert,
			DerInteger			serialNumber)
		{
			try
			{
                string hashAlgorithm = hashAlg.Algorithm.Id;

				X509Name issuerName = PrincipalUtilities.GetSubjectX509Principal(issuerCert);
				byte[] issuerNameHash = DigestUtilities.CalculateDigest(
					hashAlgorithm, issuerName.GetEncoded());

				AsymmetricKeyParameter issuerKey = issuerCert.GetPublicKey();
				SubjectPublicKeyInfo info = SubjectPublicKeyInfoFactory.CreateSubjectPublicKeyInfo(issuerKey);
				byte[] issuerKeyHash = DigestUtilities.CalculateDigest(
					hashAlgorithm, info.PublicKeyData.GetBytes());

				return new CertID(hashAlg, new DerOctetString(issuerNameHash),
					new DerOctetString(issuerKeyHash), serialNumber);
			}
			catch (Exception e)
			{
				throw new OcspException("problem creating ID: " + e, e);
			}
		}
	}
}
