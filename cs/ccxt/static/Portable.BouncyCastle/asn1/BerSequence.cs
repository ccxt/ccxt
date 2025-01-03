using System;

namespace Org.BouncyCastle.Asn1
{
	public class BerSequence
		: DerSequence
	{
		public static new readonly BerSequence Empty = new BerSequence();

		public static new BerSequence FromVector(Asn1EncodableVector elementVector)
		{
            return elementVector.Count < 1 ? Empty : new BerSequence(elementVector);
		}

		/**
		 * create an empty sequence
		 */
		public BerSequence()
            : base()
		{
		}

		/**
		 * create a sequence containing one object
		 */
		public BerSequence(Asn1Encodable element)
            : base(element)
		{
		}

        /**
		 * create a sequence containing two objects
		 */
        public BerSequence(Asn1Encodable element1, Asn1Encodable element2)
            : base(element1, element2)
        {
        }

        public BerSequence(params Asn1Encodable[] elements)
            : base(elements)
		{
		}

		/**
		 * create a sequence containing a vector of objects.
		 */
		public BerSequence(Asn1EncodableVector elementVector)
            : base(elementVector)
		{
		}

        internal BerSequence(Asn1Encodable[] elements, bool clone)
            : base(elements, clone)
        {
        }

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            if (Asn1OutputStream.EncodingBer != encoding)
                return base.GetEncoding(encoding);

            return new ConstructedILEncoding(Asn1Tags.Universal, Asn1Tags.Sequence,
                Asn1OutputStream.GetContentsEncodings(encoding, elements));
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            if (Asn1OutputStream.EncodingBer != encoding)
                return base.GetEncodingImplicit(encoding, tagClass, tagNo);

            return new ConstructedILEncoding(tagClass, tagNo,
                Asn1OutputStream.GetContentsEncodings(encoding, elements));
        }

        internal override DerBitString ToAsn1BitString()
        {
            return new BerBitString(GetConstructedBitStrings());
        }

        internal override DerExternal ToAsn1External()
        {
            // TODO There is currently no BerExternal class (or ToDLObject/ToDerObject)
            //return ((Asn1Sequence)ToDLObject()).ToAsn1External();
            return new DLSequence(elements).ToAsn1External();
        }

        internal override Asn1OctetString ToAsn1OctetString()
        {
            return new BerOctetString(GetConstructedOctetStrings());
        }

        internal override Asn1Set ToAsn1Set()
        {
            return new BerSet(false, elements);
        }
    }
}
