using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public class KeyRecRepContent
		: Asn1Encodable
	{
		private readonly PkiStatusInfo status;
		private readonly CmpCertificate newSigCert;
		private readonly Asn1Sequence caCerts;
		private readonly Asn1Sequence keyPairHist;

		private KeyRecRepContent(Asn1Sequence seq)
		{
			status = PkiStatusInfo.GetInstance(seq[0]);

			for (int pos = 1; pos < seq.Count; ++pos)
			{
				Asn1TaggedObject tObj = Asn1TaggedObject.GetInstance(seq[pos]);

				switch (tObj.TagNo)
				{
					case 0:
						newSigCert = CmpCertificate.GetInstance(tObj.GetObject());
						break;
					case 1:
						caCerts = Asn1Sequence.GetInstance(tObj.GetObject());
						break;
					case 2:
						keyPairHist = Asn1Sequence.GetInstance(tObj.GetObject());
						break;
					default:
						throw new ArgumentException("unknown tag number: " + tObj.TagNo, "seq");
				}
			}
		}

		public static KeyRecRepContent GetInstance(object obj)
		{
			if (obj is KeyRecRepContent)
				return (KeyRecRepContent)obj;

			if (obj is Asn1Sequence)
				return new KeyRecRepContent((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
		}

		public virtual PkiStatusInfo Status
		{
			get { return status; }
		}

		public virtual CmpCertificate NewSigCert
		{
			get { return newSigCert; }
		}

		public virtual CmpCertificate[] GetCACerts()
		{
			if (caCerts == null)
				return null;

			CmpCertificate[] results = new CmpCertificate[caCerts.Count];
			for (int i = 0; i != results.Length; ++i)
			{
				results[i] = CmpCertificate.GetInstance(caCerts[i]);
			}
			return results;
		}

		public virtual CertifiedKeyPair[] GetKeyPairHist()
		{
			if (keyPairHist == null)
				return null;

			CertifiedKeyPair[] results = new CertifiedKeyPair[keyPairHist.Count];
			for (int i = 0; i != results.Length; ++i)
			{
				results[i] = CertifiedKeyPair.GetInstance(keyPairHist[i]);
			}
			return results;
		}

		/**
		 * <pre>
		 * KeyRecRepContent ::= SEQUENCE {
		 *                         status                  PKIStatusInfo,
		 *                         newSigCert          [0] CMPCertificate OPTIONAL,
		 *                         caCerts             [1] SEQUENCE SIZE (1..MAX) OF
		 *                                                           CMPCertificate OPTIONAL,
		 *                         keyPairHist         [2] SEQUENCE SIZE (1..MAX) OF
		 *                                                           CertifiedKeyPair OPTIONAL
		 *              }
		 * </pre> 
		 * @return a basic ASN.1 object representation.
		 */
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(status);
            v.AddOptionalTagged(true, 0, newSigCert);
            v.AddOptionalTagged(true, 1, caCerts);
            v.AddOptionalTagged(true, 2, keyPairHist);
			return new DerSequence(v);
		}
	}
}
