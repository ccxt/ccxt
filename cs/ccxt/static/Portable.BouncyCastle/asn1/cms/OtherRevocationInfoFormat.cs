using System;

namespace Org.BouncyCastle.Asn1.Cms
{
    public class OtherRevocationInfoFormat
        : Asn1Encodable
    {
        private readonly DerObjectIdentifier otherRevInfoFormat;
        private readonly Asn1Encodable otherRevInfo;

        public OtherRevocationInfoFormat(
            DerObjectIdentifier otherRevInfoFormat,
            Asn1Encodable otherRevInfo)
        {
            this.otherRevInfoFormat = otherRevInfoFormat;
            this.otherRevInfo = otherRevInfo;
        }

        private OtherRevocationInfoFormat(Asn1Sequence seq)
        {
            otherRevInfoFormat = DerObjectIdentifier.GetInstance(seq[0]);
            otherRevInfo = seq[1];
        }

        /**
         * return a OtherRevocationInfoFormat object from a tagged object.
         *
         * @param obj the tagged object holding the object we want.
         * @param explicit true if the object is meant to be explicitly
         *              tagged false otherwise.
         * @exception IllegalArgumentException if the object held by the
         *          tagged object cannot be converted.
         */
        public static OtherRevocationInfoFormat GetInstance(Asn1TaggedObject obj, bool isExplicit)
        {
            return GetInstance(Asn1Sequence.GetInstance(obj, isExplicit));
        }

        /**
         * return a OtherRevocationInfoFormat object from the given object.
         *
         * @param obj the object we want converted.
         * @exception IllegalArgumentException if the object cannot be converted.
         */
        public static OtherRevocationInfoFormat GetInstance(object obj)
        {
            if (obj is OtherRevocationInfoFormat)
                return (OtherRevocationInfoFormat)obj;
            if (obj != null)
                return new OtherRevocationInfoFormat(Asn1Sequence.GetInstance(obj));
            return null;
        }

        public virtual DerObjectIdentifier InfoFormat
        {
            get { return otherRevInfoFormat; }
        }

        public virtual Asn1Encodable Info
        {
            get { return otherRevInfo; }
        }

        /** 
         * Produce an object suitable for an ASN1OutputStream.
         * <pre>
         * OtherRevocationInfoFormat ::= SEQUENCE {
         *      otherRevInfoFormat OBJECT IDENTIFIER,
         *      otherRevInfo ANY DEFINED BY otherRevInfoFormat }
         * </pre>
         */
        public override Asn1Object ToAsn1Object()
        {
            return new DerSequence(otherRevInfoFormat, otherRevInfo);
        }
    }
}
