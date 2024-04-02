using System;

namespace Org.BouncyCastle.Asn1.X509
{
    public class V2Form
        : Asn1Encodable
    {
        internal GeneralNames        issuerName;
        internal IssuerSerial        baseCertificateID;
        internal ObjectDigestInfo    objectDigestInfo;

        public static V2Form GetInstance(
            Asn1TaggedObject	obj,
            bool				explicitly)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
        }

        public static V2Form GetInstance(object obj)
        {
            if (obj is V2Form)
                return (V2Form)obj;
            if (obj != null)
                return new V2Form(Asn1Sequence.GetInstance(obj));
            return null;
        }

        public V2Form(GeneralNames issuerName)
            : this(issuerName, null, null)
        {
        }

        public V2Form(GeneralNames issuerName, IssuerSerial baseCertificateID)
            : this(issuerName, baseCertificateID, null)
        {
        }

        public V2Form(GeneralNames issuerName, ObjectDigestInfo objectDigestInfo)
            : this(issuerName, null, objectDigestInfo)
        {
        }

        public V2Form(
            GeneralNames issuerName,
            IssuerSerial baseCertificateID,
            ObjectDigestInfo objectDigestInfo)
        {
            this.issuerName = issuerName;
            this.baseCertificateID = baseCertificateID;
            this.objectDigestInfo = objectDigestInfo;
        }

        private V2Form(
            Asn1Sequence seq)
        {
            if (seq.Count > 3)
            {
                throw new ArgumentException("Bad sequence size: " + seq.Count);
            }

            int index = 0;

            if (!(seq[0] is Asn1TaggedObject))
            {
                index++;
                this.issuerName = GeneralNames.GetInstance(seq[0]);
            }

            for (int i = index; i != seq.Count; i++)
            {
                Asn1TaggedObject o = Asn1TaggedObject.GetInstance(seq[i]);
                if (o.TagNo == 0)
                {
                    baseCertificateID = IssuerSerial.GetInstance(o, false);
                }
                else if (o.TagNo == 1)
                {
                    objectDigestInfo = ObjectDigestInfo.GetInstance(o, false);
                }
                else
                {
                    throw new ArgumentException("Bad tag number: " + o.TagNo);
                }
            }
        }

        public GeneralNames IssuerName
        {
            get { return issuerName; }
        }

        public IssuerSerial BaseCertificateID
        {
            get { return baseCertificateID; }
        }

        public ObjectDigestInfo ObjectDigestInfo
        {
            get { return objectDigestInfo; }
        }

        /**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         *  V2Form ::= Sequence {
         *       issuerName            GeneralNames  OPTIONAL,
         *       baseCertificateID     [0] IssuerSerial  OPTIONAL,
         *       objectDigestInfo      [1] ObjectDigestInfo  OPTIONAL
         *         -- issuerName MUST be present in this profile
         *         -- baseCertificateID and objectDigestInfo MUST NOT
         *         -- be present in this profile
         *  }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector();
            v.AddOptional(issuerName);
            v.AddOptionalTagged(false, 0, baseCertificateID);
            v.AddOptionalTagged(false, 1, objectDigestInfo);
            return new DerSequence(v);
        }
    }
}
