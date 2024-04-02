using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public class CertResponse
		: Asn1Encodable
	{
		private readonly DerInteger certReqId;
		private readonly PkiStatusInfo status;
		private readonly CertifiedKeyPair certifiedKeyPair;
		private readonly Asn1OctetString rspInfo;

		private CertResponse(Asn1Sequence seq)
		{
			certReqId = DerInteger.GetInstance(seq[0]);
			status = PkiStatusInfo.GetInstance(seq[1]);

			if (seq.Count >= 3)
			{
				if (seq.Count == 3)
				{
					Asn1Encodable o = seq[2];
					if (o is Asn1OctetString)
					{
						rspInfo = Asn1OctetString.GetInstance(o);
					}
					else
					{
						certifiedKeyPair = CertifiedKeyPair.GetInstance(o);
					}
				}
				else
				{
					certifiedKeyPair = CertifiedKeyPair.GetInstance(seq[2]);
					rspInfo = Asn1OctetString.GetInstance(seq[3]);
				}
			}
		}

		public static CertResponse GetInstance(object obj)
		{
			if (obj is CertResponse)
				return (CertResponse)obj;

			if (obj is Asn1Sequence)
				return new CertResponse((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
		}

		public CertResponse(
			DerInteger certReqId,
			PkiStatusInfo status)
			: this(certReqId, status, null, null)
		{
		}

		public CertResponse(
			DerInteger			certReqId,
			PkiStatusInfo		status,
			CertifiedKeyPair	certifiedKeyPair,
			Asn1OctetString		rspInfo)
		{
			if (certReqId == null)
				throw new ArgumentNullException("certReqId");

			if (status == null)
				throw new ArgumentNullException("status");

			this.certReqId = certReqId;
			this.status = status;
			this.certifiedKeyPair = certifiedKeyPair;
			this.rspInfo = rspInfo;
		}

		public virtual DerInteger CertReqID
		{
			get { return certReqId; }
		}

		public virtual PkiStatusInfo Status
		{
			get { return status; }
		}

		public virtual CertifiedKeyPair CertifiedKeyPair
		{
			get { return certifiedKeyPair; }
		}

		/**
		 * <pre>
		 * CertResponse ::= SEQUENCE {
		 *                            certReqId           INTEGER,
		 *                            -- to match this response with corresponding request (a value
		 *                            -- of -1 is to be used if certReqId is not specified in the
		 *                            -- corresponding request)
		 *                            status              PKIStatusInfo,
		 *                            certifiedKeyPair    CertifiedKeyPair    OPTIONAL,
		 *                            rspInfo             OCTET STRING        OPTIONAL
		 *                            -- analogous to the id-regInfo-utf8Pairs string defined
		 *                            -- for regInfo in CertReqMsg [CRMF]
		 *             }
		 * </pre> 
		 * @return a basic ASN.1 object representation.
		 */
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(certReqId, status);
			v.AddOptional(certifiedKeyPair, rspInfo);
			return new DerSequence(v);
		}
	}
}
