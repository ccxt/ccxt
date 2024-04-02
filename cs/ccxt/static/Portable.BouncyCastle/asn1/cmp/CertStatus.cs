using System;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public class CertStatus
		: Asn1Encodable
	{
		private readonly Asn1OctetString certHash;
		private readonly DerInteger certReqId;
		private readonly PkiStatusInfo statusInfo;

		private CertStatus(Asn1Sequence seq)
		{
			certHash = Asn1OctetString.GetInstance(seq[0]);
			certReqId = DerInteger.GetInstance(seq[1]);

			if (seq.Count > 2)
			{
				statusInfo = PkiStatusInfo.GetInstance(seq[2]);
			}
		}

		public CertStatus(byte[] certHash, BigInteger certReqId)
		{
			this.certHash = new DerOctetString(certHash);
			this.certReqId = new DerInteger(certReqId);
		}

		public CertStatus(byte[] certHash, BigInteger certReqId, PkiStatusInfo statusInfo)
		{
			this.certHash = new DerOctetString(certHash);
			this.certReqId = new DerInteger(certReqId);
			this.statusInfo = statusInfo;
		}

		public static CertStatus GetInstance(object obj)
		{
			if (obj is CertStatus)
				return (CertStatus)obj;

			if (obj is Asn1Sequence)
				return new CertStatus((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
		}

		public virtual Asn1OctetString CertHash
		{
			get { return certHash; }
		}

		public virtual DerInteger CertReqID
		{
			get { return certReqId; }
		}

		public virtual PkiStatusInfo StatusInfo
		{
			get { return statusInfo; }
		}

		/**
		 * <pre>
		 * CertStatus ::= SEQUENCE {
		 *                   certHash    OCTET STRING,
		 *                   -- the hash of the certificate, using the same hash algorithm
		 *                   -- as is used to create and verify the certificate signature
		 *                   certReqId   INTEGER,
		 *                   -- to match this confirmation with the corresponding req/rep
		 *                   statusInfo  PKIStatusInfo OPTIONAL
		 * }
		 * </pre>
		 * @return a basic ASN.1 object representation.
		 */
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(certHash, certReqId);
			v.AddOptional(statusInfo);
			return new DerSequence(v);
		}
	}
}
