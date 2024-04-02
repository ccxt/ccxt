using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1.Crmf
{
    public class AttributeTypeAndValue
        : Asn1Encodable
    {
        private readonly DerObjectIdentifier type;
        private readonly Asn1Encodable value;

        private AttributeTypeAndValue(Asn1Sequence seq)
        {
            type = (DerObjectIdentifier)seq[0];
            value = (Asn1Encodable)seq[1];
        }

        public static AttributeTypeAndValue GetInstance(object obj)
        {
            if (obj is AttributeTypeAndValue)
                return (AttributeTypeAndValue)obj;

            if (obj is Asn1Sequence)
                return new AttributeTypeAndValue((Asn1Sequence)obj);

            throw new ArgumentException("Invalid object: " + Platform.GetTypeName(obj), "obj");
        }

        public AttributeTypeAndValue(
            string oid,
            Asn1Encodable value)
            : this(new DerObjectIdentifier(oid), value)
        {
        }

        public AttributeTypeAndValue(
            DerObjectIdentifier type,
            Asn1Encodable value)
        {
            this.type = type;
            this.value = value;
        }

        public virtual DerObjectIdentifier Type
        {
            get { return type; }
        }

        public virtual Asn1Encodable Value
        {
            get { return value; }
        }

        /**
         * <pre>
         * AttributeTypeAndValue ::= SEQUENCE {
         *           type         OBJECT IDENTIFIER,
         *           value        ANY DEFINED BY type }
         * </pre>
         * @return a basic ASN.1 object representation.
         */
        public override Asn1Object ToAsn1Object()
        {
            return new DerSequence(type, value);
        }
    }
}
