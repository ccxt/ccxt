using System;

namespace Org.BouncyCastle.Asn1.X500
{
    /**
     * Holding class for the AttributeTypeAndValue structures that make up an RDN.
     */
    public class AttributeTypeAndValue
        : Asn1Encodable
    {
        private readonly DerObjectIdentifier type;
        private readonly Asn1Encodable value;

        private AttributeTypeAndValue(Asn1Sequence seq)
        {
            type = (DerObjectIdentifier)seq[0];
            value = seq[1];
        }

        public static AttributeTypeAndValue GetInstance(object obj)
        {
            if (obj is AttributeTypeAndValue)
                return (AttributeTypeAndValue)obj;
            if (null != obj)
                return new AttributeTypeAndValue(Asn1Sequence.GetInstance(obj));
            throw new ArgumentNullException("obj");
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
