using System;

using Org.BouncyCastle.Asn1.Crmf;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public class RevAnnContent
		: Asn1Encodable
	{
		private readonly PkiStatusEncodable status;
		private readonly CertId certId;
		private readonly DerGeneralizedTime willBeRevokedAt;
		private readonly DerGeneralizedTime badSinceDate;
		private readonly X509Extensions crlDetails;

		private RevAnnContent(Asn1Sequence seq)
		{
			status = PkiStatusEncodable.GetInstance(seq[0]);
			certId = CertId.GetInstance(seq[1]);
			willBeRevokedAt = DerGeneralizedTime.GetInstance(seq[2]);
			badSinceDate = DerGeneralizedTime.GetInstance(seq[3]);

			if (seq.Count > 4)
			{
				crlDetails = X509Extensions.GetInstance(seq[4]);
			}
		}

		public static RevAnnContent GetInstance(object obj)
		{
			if (obj is RevAnnContent)
				return (RevAnnContent)obj;

			if (obj is Asn1Sequence)
				return new RevAnnContent((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
		}

		public virtual PkiStatusEncodable Status
		{
			get { return status; }
		}

		public virtual CertId CertID
		{
			get { return certId; }
		}

		public virtual DerGeneralizedTime WillBeRevokedAt
		{
			get { return willBeRevokedAt; }
		}

		public virtual DerGeneralizedTime BadSinceDate
		{
			get { return badSinceDate; }
		}

		public virtual X509Extensions CrlDetails
		{
			get { return crlDetails; }
		}

		/**
		 * <pre>
		 * RevAnnContent ::= SEQUENCE {
		 *       status              PKIStatus,
		 *       certId              CertId,
		 *       willBeRevokedAt     GeneralizedTime,
		 *       badSinceDate        GeneralizedTime,
		 *       crlDetails          Extensions  OPTIONAL
		 *        -- extra CRL details (e.g., crl number, reason, location, etc.)
		 * }
		 * </pre>
		 * @return a basic ASN.1 object representation.
		 */
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(status, certId, willBeRevokedAt, badSinceDate);
			v.AddOptional(crlDetails);
			return new DerSequence(v);
		}
	}
}
