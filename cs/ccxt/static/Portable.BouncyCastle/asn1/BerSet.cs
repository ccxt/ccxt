using System;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Asn1
{
    public class BerSet
        : DerSet
    {
		public static new readonly BerSet Empty = new BerSet();

		public static new BerSet FromVector(Asn1EncodableVector elementVector)
		{
            return elementVector.Count < 1 ? Empty : new BerSet(elementVector);
		}

		/**
         * create an empty set
         */
        public BerSet()
            : base()
        {
        }

        /**
         * create a set containing one object
         */
        public BerSet(Asn1Encodable element)
            : base(element)
        {
        }

        public BerSet(params Asn1Encodable[] elements)
            : base(elements, false)
        {
        }

        /**
         * create a set containing a vector of objects.
         */
        public BerSet(Asn1EncodableVector elementVector)
            : base(elementVector, false)
        {
        }

        internal BerSet(bool isSorted, Asn1Encodable[] elements)
            : base(isSorted, elements)
        {
        }

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            if (Asn1OutputStream.EncodingBer != encoding)
                return base.GetEncoding(encoding);

            return new ConstructedILEncoding(Asn1Tags.Universal, Asn1Tags.Set,
                Asn1OutputStream.GetContentsEncodings(encoding, elements));
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            if (Asn1OutputStream.EncodingBer != encoding)
                return base.GetEncodingImplicit(encoding, tagClass, tagNo);

            return new ConstructedILEncoding(tagClass, tagNo,
                Asn1OutputStream.GetContentsEncodings(encoding, elements));
        }
    }
}
