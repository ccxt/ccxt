using System;

using Org.BouncyCastle.Asn1.Crmf;
using Org.BouncyCastle.Asn1.X509;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public class RevRepContent
		: Asn1Encodable
	{
		private readonly Asn1Sequence status;
		private readonly Asn1Sequence revCerts;
		private readonly Asn1Sequence crls;

		private RevRepContent(Asn1Sequence seq)
		{
			status = Asn1Sequence.GetInstance(seq[0]);

			for (int pos = 1; pos < seq.Count; ++pos)
			{
				Asn1TaggedObject tObj = Asn1TaggedObject.GetInstance(seq[pos]);

				if (tObj.TagNo == 0)
				{
					revCerts = Asn1Sequence.GetInstance(tObj, true);
				}
				else
				{
					crls = Asn1Sequence.GetInstance(tObj, true);
				}
			}
		}

		public static RevRepContent GetInstance(object obj)
		{
			if (obj is RevRepContent)
				return (RevRepContent)obj;

			if (obj is Asn1Sequence)
				return new RevRepContent((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
		}
		
		public virtual PkiStatusInfo[] GetStatus()
		{
			PkiStatusInfo[] results = new PkiStatusInfo[status.Count];
			for (int i = 0; i != results.Length; ++i)
			{
				results[i] = PkiStatusInfo.GetInstance(status[i]);
			}
			return results;
		}

		public virtual CertId[] GetRevCerts()
		{
			if (revCerts == null)
				return null;

			CertId[] results = new CertId[revCerts.Count];
			for (int i = 0; i != results.Length; ++i)
			{
				results[i] = CertId.GetInstance(revCerts[i]);
			}
			return results;
		}

		public virtual CertificateList[] GetCrls()
		{
			if (crls == null)
				return null;

			CertificateList[] results = new CertificateList[crls.Count];
			for (int i = 0; i != results.Length; ++i)
			{
				results[i] = CertificateList.GetInstance(crls[i]);
			}
			return results;
		}

		/**
		 * <pre>
		 * RevRepContent ::= SEQUENCE {
		 *        status       SEQUENCE SIZE (1..MAX) OF PKIStatusInfo,
		 *        -- in same order as was sent in RevReqContent
		 *        revCerts [0] SEQUENCE SIZE (1..MAX) OF CertId OPTIONAL,
		 *        -- IDs for which revocation was requested
		 *        -- (same order as status)
		 *        crls     [1] SEQUENCE SIZE (1..MAX) OF CertificateList OPTIONAL
		 *        -- the resulting CRLs (there may be more than one)
		 *   }
		 * </pre>
		 * @return a basic ASN.1 object representation.
		 */
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(status);
            v.AddOptionalTagged(true, 0, revCerts);
            v.AddOptionalTagged(true, 1, crls);
			return new DerSequence(v);
		}
	}
}
