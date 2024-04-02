using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms
{
    public class Attribute
        : Asn1Encodable
    {
        private DerObjectIdentifier	attrType;
        private Asn1Set				attrValues;

		/**
        * return an Attribute object from the given object.
        *
        * @param o the object we want converted.
        * @exception ArgumentException if the object cannot be converted.
        */
        public static Attribute GetInstance(
            object obj)
        {
            if (obj == null || obj is Attribute)
				return (Attribute) obj;

			if (obj is Asn1Sequence)
                return new Attribute((Asn1Sequence) obj);

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
        }

		public Attribute(
            Asn1Sequence seq)
        {
            attrType = (DerObjectIdentifier)seq[0];
            attrValues = (Asn1Set)seq[1];
        }

		public Attribute(
            DerObjectIdentifier attrType,
            Asn1Set             attrValues)
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
        * Attribute ::= SEQUENCE {
        *     attrType OBJECT IDENTIFIER,
        *     attrValues SET OF AttributeValue
        * }
        * </pre>
        */
        public override Asn1Object ToAsn1Object()
        {
			return new DerSequence(attrType, attrValues);
        }
    }
}
