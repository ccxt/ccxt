using System;

namespace Org.BouncyCastle.Asn1
{
    internal class DLSequence
        : DerSequence
    {
        internal static new readonly DLSequence Empty = new DLSequence();

        internal static new DLSequence FromVector(Asn1EncodableVector elementVector)
        {
            return elementVector.Count < 1 ? Empty : new DLSequence(elementVector);
        }

        /**
		 * create an empty sequence
		 */
        internal DLSequence()
            : base()
        {
        }

        /**
		 * create a sequence containing one object
		 */
        internal DLSequence(Asn1Encodable element)
            : base(element)
        {
        }

        /**
		 * create a sequence containing two objects
		 */
        public DLSequence(Asn1Encodable element1, Asn1Encodable element2)
            : base(element1, element2)
        {
        }

        internal DLSequence(params Asn1Encodable[] elements)
            : base(elements)
        {
        }

        /**
		 * create a sequence containing a vector of objects.
		 */
        internal DLSequence(Asn1EncodableVector elementVector)
            : base(elementVector)
        {
        }

        internal DLSequence(Asn1Encodable[] elements, bool clone)
            : base(elements, clone)
        {
        }

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            if (Asn1OutputStream.EncodingDer == encoding)
                return base.GetEncoding(encoding);

            return new ConstructedDLEncoding(Asn1Tags.Universal, Asn1Tags.Sequence,
                Asn1OutputStream.GetContentsEncodings(encoding, elements));
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            if (Asn1OutputStream.EncodingDer == encoding)
                return base.GetEncodingImplicit(encoding, tagClass, tagNo);

            return new ConstructedDLEncoding(tagClass, tagNo,
                Asn1OutputStream.GetContentsEncodings(encoding, elements));
        }

        internal override DerBitString ToAsn1BitString()
        {
            return new DLBitString(BerBitString.FlattenBitStrings(GetConstructedBitStrings()), false);
        }

        // TODO[asn1] DLExternal
        //internal override DerExternal ToAsn1External()
        //{
        //    return new DLExternal(this);
        //}

        internal override Asn1Set ToAsn1Set()
        {
            return new DLSet(false, elements);
        }
    }
}
