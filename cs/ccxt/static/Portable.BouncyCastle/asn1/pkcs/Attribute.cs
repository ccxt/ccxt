using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Pkcs
{
    public class AttributePkcs
        : Asn1Encodable
    {
        private readonly DerObjectIdentifier attrType;
        private readonly Asn1Set attrValues;

		/**
         * return an Attribute object from the given object.
         *
         * @param o the object we want converted.
         * @exception ArgumentException if the object cannot be converted.
         */
        public static AttributePkcs GetInstance(
            object obj)
        {
            AttributePkcs attr = obj as AttributePkcs;
            if (obj == null || attr != null)
            {
                return attr;
            }

			Asn1Sequence seq = obj as Asn1Sequence;
            if (seq != null)
            {
                return new AttributePkcs(seq);
            }

			throw new ArgumentException("Unknown object in factory: " + Platform.GetTypeName(obj), "obj");
		}

		private AttributePkcs(
            Asn1Sequence seq)
        {
			if (seq.Count != 2)
				throw new ArgumentException("Wrong number of elements in sequence", "seq");

			attrType = DerObjectIdentifier.GetInstance(seq[0]);
            attrValues = Asn1Set.GetInstance(seq[1]);
        }

		public AttributePkcs(
            DerObjectIdentifier	attrType,
            Asn1Set				attrValues)
        {
            this.attrType = attrType;
            this.attrValues = attrValues;
        }

		public DerObjectIdentifier AttrType
		{
			get { return attrType; }
		}

		public Asn1Set AttrValues
		{
			get { return attrValues; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * Attr ::= Sequence {
         *     attrType OBJECT IDENTIFIER,
         *     attrValues Set OF AttributeValue
         * }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
			return new DerSequence(attrType, attrValues);
        }
    }
}
