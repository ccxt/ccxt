using System;

using Org.BouncyCastle.Asn1.Crmf;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cmp
{
	public class CertifiedKeyPair
		: Asn1Encodable
	{
		private readonly CertOrEncCert certOrEncCert;
		private readonly EncryptedValue privateKey;
		private readonly PkiPublicationInfo publicationInfo;

		private CertifiedKeyPair(Asn1Sequence seq)
		{
			certOrEncCert = CertOrEncCert.GetInstance(seq[0]);

			if (seq.Count >= 2)
			{
				if (seq.Count == 2)
				{
					Asn1TaggedObject tagged = Asn1TaggedObject.GetInstance(seq[1]);
					if (tagged.TagNo == 0)
					{
						privateKey = EncryptedValue.GetInstance(tagged.GetObject());
					}
					else
					{
						publicationInfo = PkiPublicationInfo.GetInstance(tagged.GetObject());
					}
				}
				else
				{
					privateKey = EncryptedValue.GetInstance(Asn1TaggedObject.GetInstance(seq[1]));
					publicationInfo = PkiPublicationInfo.GetInstance(Asn1TaggedObject.GetInstance(seq[2]));
				}
			}
		}

		public static CertifiedKeyPair GetInstance(object obj)
		{
			if (obj is CertifiedKeyPair)
				return (CertifiedKeyPair)obj;

			if (obj is Asn1Sequence)
				return new CertifiedKeyPair((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
		}

		public CertifiedKeyPair(
			CertOrEncCert certOrEncCert)
			: this(certOrEncCert, null, null)
		{
		}

		public CertifiedKeyPair(
			CertOrEncCert		certOrEncCert,
			EncryptedValue		privateKey,
			PkiPublicationInfo	publicationInfo
		)
		{
			if (certOrEncCert == null)
				throw new ArgumentNullException("certOrEncCert");

			this.certOrEncCert = certOrEncCert;
			this.privateKey = privateKey;
			this.publicationInfo = publicationInfo;
		}

		public virtual CertOrEncCert CertOrEncCert
		{
			get { return certOrEncCert; }
		}

		public virtual EncryptedValue PrivateKey
		{
			get { return privateKey; }
		}

		public virtual PkiPublicationInfo PublicationInfo
		{
			get { return publicationInfo; }
		}

		/**
		 * <pre>
		 * CertifiedKeyPair ::= SEQUENCE {
		 *                                  certOrEncCert       CertOrEncCert,
		 *                                  privateKey      [0] EncryptedValue      OPTIONAL,
		 *                                  -- see [CRMF] for comment on encoding
		 *                                  publicationInfo [1] PKIPublicationInfo  OPTIONAL
		 *       }
		 * </pre>
		 * @return a basic ASN.1 object representation.
		 */
		public override Asn1Object ToAsn1Object()
		{
			Asn1EncodableVector v = new Asn1EncodableVector(certOrEncCert);
            v.AddOptionalTagged(true, 0, privateKey);
            v.AddOptionalTagged(true, 1, publicationInfo);
			return new DerSequence(v);
		}
	}
}
