using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Cms
{
    public class OtherKeyAttribute
        : Asn1Encodable
    {
        private DerObjectIdentifier	keyAttrId;
        private Asn1Encodable		keyAttr;

		/**
         * return an OtherKeyAttribute object from the given object.
         *
         * @param o the object we want converted.
         * @exception ArgumentException if the object cannot be converted.
         */
        public static OtherKeyAttribute GetInstance(
            object obj)
        {
            if (obj == null || obj is OtherKeyAttribute)
                return (OtherKeyAttribute) obj;

			if (obj is Asn1Sequence)
                return new OtherKeyAttribute((Asn1Sequence) obj);

            throw new ArgumentException("unknown object in factory: " + Platform.GetTypeName(obj), "obj");
        }

		public OtherKeyAttribute(
            Asn1Sequence seq)
        {
            keyAttrId = (DerObjectIdentifier) seq[0];
            keyAttr = seq[1];
        }

		public OtherKeyAttribute(
            DerObjectIdentifier	keyAttrId,
            Asn1Encodable		keyAttr)
        {
            this.keyAttrId = keyAttrId;
            this.keyAttr = keyAttr;
        }

		public DerObjectIdentifier KeyAttrId
		{
			get { return keyAttrId; }
		}

		public Asn1Encodable KeyAttr
		{
			get { return keyAttr; }
		}

		/**
         * Produce an object suitable for an Asn1OutputStream.
         * <pre>
         * OtherKeyAttribute ::= Sequence {
         *     keyAttrId OBJECT IDENTIFIER,
         *     keyAttr ANY DEFINED BY keyAttrId OPTIONAL
         * }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
			return new DerSequence(keyAttrId, keyAttr);
        }
    }
}
