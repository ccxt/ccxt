using System;

using Org.BouncyCastle.Asn1.X509;

namespace Org.BouncyCastle.Asn1.Pkcs
{
    /**
     * Pkcs10 CertificationRequestInfo object.
     * <pre>
     *  CertificationRequestInfo ::= Sequence {
     *   version             Integer { v1(0) } (v1,...),
     *   subject             Name,
     *   subjectPKInfo   SubjectPublicKeyInfo{{ PKInfoAlgorithms }},
     *   attributes          [0] Attributes{{ CRIAttributes }}
     *  }
     *
     *  Attributes { ATTRIBUTE:IOSet } ::= Set OF Attr{{ IOSet }}
     *
     *  Attr { ATTRIBUTE:IOSet } ::= Sequence {
     *    type    ATTRIBUTE.&amp;id({IOSet}),
     *    values  Set SIZE(1..MAX) OF ATTRIBUTE.&amp;Type({IOSet}{\@type})
     *  }
     * </pre>
     */
    public class CertificationRequestInfo
        : Asn1Encodable
    {
        internal DerInteger				version = new DerInteger(0);
        internal X509Name				subject;
        internal SubjectPublicKeyInfo	subjectPKInfo;
        internal Asn1Set				attributes;

		public static CertificationRequestInfo GetInstance(object obj)
        {
            if (obj is CertificationRequestInfo)
                return (CertificationRequestInfo)obj;
            if (obj != null)
                return new CertificationRequestInfo(Asn1Sequence.GetInstance(obj));
            return null;
		}

		public CertificationRequestInfo(
            X509Name				subject,
            SubjectPublicKeyInfo	pkInfo,
            Asn1Set					attributes)
        {
            this.subject = subject;
            this.subjectPKInfo = pkInfo;
            this.attributes = attributes;

            ValidateAttributes(attributes);

            if (subject == null || version == null || subjectPKInfo == null)
            {
                throw new ArgumentException(
					"Not all mandatory fields set in CertificationRequestInfo generator.");
            }
        }

		private CertificationRequestInfo(
            Asn1Sequence seq)
        {
            version = (DerInteger) seq[0];

			subject = X509Name.GetInstance(seq[1]);
            subjectPKInfo = SubjectPublicKeyInfo.GetInstance(seq[2]);

			//
            // some CertificationRequestInfo objects seem to treat this field
            // as optional.
            //
            if (seq.Count > 3)
            {
                DerTaggedObject tagobj = (DerTaggedObject) seq[3];
                attributes = Asn1Set.GetInstance(tagobj, false);
            }

            ValidateAttributes(attributes);

            if (subject == null || version == null || subjectPKInfo == null)
            {
                throw new ArgumentException(
					"Not all mandatory fields set in CertificationRequestInfo generator.");
            }
        }

		public DerInteger Version
		{
			get { return version; }
		}

		public X509Name Subject
		{
			get { return subject; }
		}

		public SubjectPublicKeyInfo SubjectPublicKeyInfo
		{
			get { return subjectPKInfo; }
		}

		public Asn1Set Attributes
		{
			get { return attributes; }
		}

        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(version, subject, subjectPKInfo);
            v.AddOptionalTagged(false, 0, attributes);
            return new DerSequence(v);
        }

        private static void ValidateAttributes(Asn1Set attributes)
        {
            if (attributes == null)
                return;

            foreach (Asn1Encodable ae in attributes)
            {
                Asn1Object obj = ae.ToAsn1Object();
                AttributePkcs attr = AttributePkcs.GetInstance(obj);
                if (attr.AttrType.Equals(PkcsObjectIdentifiers.Pkcs9AtChallengePassword))
                {
                    if (attr.AttrValues.Count != 1)
                        throw new ArgumentException("challengePassword attribute must have one value");
                }
            }
        }
    }
}
