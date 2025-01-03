using System;

namespace Org.BouncyCastle.Asn1.X509
{
    /**
     * The OtherName object.
     * <pre>
     * OtherName ::= SEQUENCE {
     *      type-id    OBJECT IDENTIFIER,
     *      value      [0] EXPLICIT ANY DEFINED BY type-id }
     * </pre>
     */
    public class OtherName
        : Asn1Encodable
    {
        private readonly DerObjectIdentifier typeID;
        private readonly Asn1Encodable value;

        /**
         * OtherName factory method.
         * @param obj the object used to construct an instance of <code>
         * OtherName</code>. It must be an instance of <code>OtherName
         * </code> or <code>ASN1Sequence</code>.
         * @return the instance of <code>OtherName</code> built from the
         * supplied object.
         * @throws java.lang.IllegalArgumentException if the object passed
         * to the factory is not an instance of <code>OtherName</code> or something that
         * can be converted into an appropriate <code>ASN1Sequence</code>.
         */
        public static OtherName GetInstance(object obj)
        {
            if (obj is OtherName)
                return (OtherName)obj;
            if (obj == null)
                return null;
            return new OtherName(Asn1Sequence.GetInstance(obj));
        }

        /**
         * Base constructor.
         * @param typeID the type of the other name.
         * @param value the ANY object that represents the value.
         */
        public OtherName(DerObjectIdentifier typeID, Asn1Encodable value)
        {
            this.typeID = typeID;
            this.value  = value;
        }

        private OtherName(Asn1Sequence seq)
        {
            this.typeID = DerObjectIdentifier.GetInstance(seq[0]);
            this.value = DerTaggedObject.GetInstance(seq[1]).GetObject(); // explicitly tagged
        }

        public virtual DerObjectIdentifier TypeID
        {
            get { return typeID; }
        }

        public Asn1Encodable Value
        {
            get { return value; }
        }

        public override Asn1Object ToAsn1Object()
        {
            return new DerSequence(typeID, new DerTaggedObject(true, 0, value));
        }
    }
}
