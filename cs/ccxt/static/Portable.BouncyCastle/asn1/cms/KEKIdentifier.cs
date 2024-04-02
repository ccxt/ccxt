using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms
{
    public class KekIdentifier
        : Asn1Encodable
    {
        private Asn1OctetString		keyIdentifier;
        private DerGeneralizedTime	date;
        private OtherKeyAttribute	other;

		public KekIdentifier(
            byte[]              keyIdentifier,
            DerGeneralizedTime  date,
            OtherKeyAttribute   other)
        {
            this.keyIdentifier = new DerOctetString(keyIdentifier);
            this.date = date;
            this.other = other;
        }

		public KekIdentifier(
            Asn1Sequence seq)
        {
            keyIdentifier = (Asn1OctetString) seq[0];

			switch (seq.Count)
            {
            case 1:
				break;
            case 2:
				if (seq[1] is DerGeneralizedTime)
				{
					date = (DerGeneralizedTime) seq[1];
				}
				else
				{
					other = OtherKeyAttribute.GetInstance(seq[2]);
				}
				break;
            case 3:
				date  = (DerGeneralizedTime) seq[1];
				other = OtherKeyAttribute.GetInstance(seq[2]);
				break;
            default:
				throw new ArgumentException("Invalid KekIdentifier");
            }
        }

		/**
         * return a KekIdentifier object from a tagged object.
         *
         * @param obj the tagged object holding the object we want.
         * @param explicitly true if the object is meant to be explicitly
         *              tagged false otherwise.
         * @exception ArgumentException if the object held by the
         *          tagged object cannot be converted.
         */
        public static KekIdentifier GetInstance(
            Asn1TaggedObject obj,
            bool explicitly)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, explicitly));
        }

        /**
         * return a KekIdentifier object from the given object.
         *
         * @param obj the object we want converted.
         * @exception ArgumentException if the object cannot be converted.
         */
        public static KekIdentifier GetInstance(
            object obj)
        {
            if (obj == null || obj is KekIdentifier)
                return (KekIdentifier)obj;

			if (obj is Asn1Sequence)
                return new KekIdentifier((Asn1Sequence)obj);

            throw new ArgumentException("Invalid KekIdentifier: " + Platform.GetTypeName(obj));
        }

		public Asn1OctetString KeyIdentifier
		{
			get { return keyIdentifier; }
		}

		public DerGeneralizedTime Date
		{
			get { return date; }
		}

		public OtherKeyAttribute Other
		{
			get { return other; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * KekIdentifier ::= Sequence {
         *     keyIdentifier OCTET STRING,
         *     date GeneralizedTime OPTIONAL,
         *     other OtherKeyAttribute OPTIONAL
         * }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            Asn1EncodableVector v = new Asn1EncodableVector(keyIdentifier);
			v.AddOptional(date, other);
			return new DerSequence(v);
        }
    }
}

