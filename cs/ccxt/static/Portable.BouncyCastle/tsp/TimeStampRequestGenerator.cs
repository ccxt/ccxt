using System;
using System.Collections.Generic;

using Org.BouncyCastle.Asn1;
using Org.BouncyCastle.Asn1.Tsp;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Math;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Tsp
{
	/**
	 * Generator for RFC 3161 Time Stamp Request objects.
	 */
	public class TimeStampRequestGenerator
	{
		private DerObjectIdentifier reqPolicy;

		private DerBoolean certReq;

		private Dictionary<DerObjectIdentifier, X509Extension> m_extensions =
			new Dictionary<DerObjectIdentifier, X509Extension>();
		private List<DerObjectIdentifier> m_ordering = new List<DerObjectIdentifier>();

		public void SetReqPolicy(string reqPolicy)
		{
			this.reqPolicy = new DerObjectIdentifier(reqPolicy);
		}

		public void SetCertReq(bool certReq)
		{
			this.certReq = DerBoolean.GetInstance(certReq);
		}

		/**
		 * add a given extension field for the standard extensions tag (tag 3)
		 * @throws IOException
		 */
		public virtual void AddExtension(DerObjectIdentifier oid, bool critical, Asn1Encodable extValue)
		{
			this.AddExtension(oid, critical, extValue.GetEncoded());
		}

		/**
		 * add a given extension field for the standard extensions tag
		 * The value parameter becomes the contents of the octet string associated
		 * with the extension.
		 */
		public virtual void AddExtension(DerObjectIdentifier oid, bool critical, byte[] extValue)
		{
			m_extensions.Add(oid, new X509Extension(critical, new DerOctetString(extValue)));
			m_ordering.Add(oid);
		}

		public TimeStampRequest Generate(string digestAlgorithm, byte[] digest)
		{
			return Generate(digestAlgorithm, digest, null);
		}

		public TimeStampRequest Generate(string digestAlgorithmOid, byte[] digest, BigInteger nonce)
		{
			if (digestAlgorithmOid == null)
				throw new ArgumentException("No digest algorithm specified");

			DerObjectIdentifier digestAlgOid = new DerObjectIdentifier(digestAlgorithmOid);

			AlgorithmIdentifier algID = new AlgorithmIdentifier(digestAlgOid, DerNull.Instance);
			MessageImprint messageImprint = new MessageImprint(algID, digest);

			X509Extensions ext = null;

			if (m_ordering.Count > 0)
			{
				ext = new X509Extensions(m_ordering, m_extensions);
			}

			DerInteger derNonce = nonce == null ? null : new DerInteger(nonce);

			return new TimeStampRequest(
				new TimeStampReq(messageImprint, reqPolicy, derNonce, certReq, ext));
		}

		public virtual TimeStampRequest Generate(DerObjectIdentifier digestAlgorithm, byte[] digest)
		{
			return Generate(digestAlgorithm.Id, digest);
		}

		public virtual TimeStampRequest Generate(DerObjectIdentifier digestAlgorithm, byte[] digest, BigInteger nonce)
		{
			return Generate(digestAlgorithm.Id, digest, nonce);
		}
	}
}
