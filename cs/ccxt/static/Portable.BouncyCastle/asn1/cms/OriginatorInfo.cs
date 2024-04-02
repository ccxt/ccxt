using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms
{
    public class OriginatorInfo
        : Asn1Encodable
    {
        private Asn1Set certs;
        private Asn1Set crls;

        public OriginatorInfo(
            Asn1Set certs,
            Asn1Set crls)
        {
            this.certs = certs;
            this.crls = crls;
        }

		public OriginatorInfo(
            Asn1Sequence seq)
        {
            switch (seq.Count)
            {
            case 0:     // empty
                break;
            case 1:
                Asn1TaggedObject o = (Asn1TaggedObject) seq[0];
                switch (o.TagNo)
                {
                case 0 :
                    certs = Asn1Set.GetInstance(o, false);
                    break;
                case 1 :
                    crls = Asn1Set.GetInstance(o, false);
                    break;
                default:
                    throw new ArgumentException("Bad tag in OriginatorInfo: " + o.TagNo);
                }
                break;
            case 2:
                certs = Asn1Set.GetInstance((Asn1TaggedObject) seq[0], false);
                crls  = Asn1Set.GetInstance((Asn1TaggedObject) seq[1], false);
                break;
            default:
                throw new ArgumentException("OriginatorInfo too big");
            }
        }

		/**
         * return an OriginatorInfo object from a tagged object.
         *
         * @param obj the tagged object holding the object we want.
         * @param explicitly true if the object is meant to be explicitly
         *              tagged false otherwise.
         * @exception ArgumentException if the object held by the
         *          tagged object cannot be converted.
         */
        public static OriginatorInfo GetInstance(
            Asn1TaggedObject	obj,
            bool				explicitly)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
        }

		/**
         * return an OriginatorInfo object from the given object.
         *
         * @param obj the object we want converted.
         * @exception ArgumentException if the object cannot be converted.
         */
        public static OriginatorInfo GetInstance(
            object obj)
        {
            if (obj == null || obj is OriginatorInfo)
                return (OriginatorInfo)obj;

			if (obj is Asn1Sequence)
                return new OriginatorInfo((Asn1Sequence)obj);

            throw new ArgumentException("Invalid OriginatorInfo: " + Platform.GetTypeName(obj));
        }

		public Asn1Set Certificates
		{
			get { return certs; }
		}

		public Asn1Set Crls
		{
			get { return crls; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * OriginatorInfo ::= Sequence {
         *     certs [0] IMPLICIT CertificateSet OPTIONAL,
         *     crls [1] IMPLICIT CertificateRevocationLists OPTIONAL
         * }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector();
            v.AddOptionalTagged(false, 0, certs);
            v.AddOptionalTagged(false, 1, crls);
			return new DerSequence(v);
        }
    }
}
