using System;

namespace Org.BouncyCastle.Asn1
{
	/**
	 * A Der encoded set object
	 */
	public class DerSet
		: Asn1Set
	{
		public static readonly DerSet Empty = new DerSet();

		public static DerSet FromVector(Asn1EncodableVector elementVector)
		{
            return elementVector.Count < 1 ? Empty : new DerSet(elementVector);
		}

        /**
		 * create an empty set
		 */
        public DerSet()
			: base()
		{
		}

		/**
		 * @param obj - a single object that makes up the set.
		 */
		public DerSet(Asn1Encodable element)
			: base(element)
		{
		}

        public DerSet(params Asn1Encodable[] elements)
            : base(elements, true)
        {
        }

        internal DerSet(Asn1Encodable[] elements, bool doSort)
			: base(elements, doSort)
		{
		}

		/**
		 * @param v - a vector of objects making up the set.
		 */
		public DerSet(Asn1EncodableVector elementVector)
			: base(elementVector, true)
		{
		}

		internal DerSet(Asn1EncodableVector	elementVector, bool doSort)
			: base(elementVector, doSort)
		{
		}

        internal DerSet(bool isSorted, Asn1Encodable[] elements)
            : base(isSorted, elements)
        {
        }

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            return new ConstructedDLEncoding(Asn1Tags.Universal, Asn1Tags.Set,
                Asn1OutputStream.GetContentsEncodings(Asn1OutputStream.EncodingDer, GetSortedElements()));
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            return new ConstructedDLEncoding(tagClass, tagNo,
                Asn1OutputStream.GetContentsEncodings(Asn1OutputStream.EncodingDer, GetSortedElements()));
        }

        private Asn1Encodable[] GetSortedElements()
        {
            if (isSorted)
                return elements;

            int count = elements.Length;
            Asn1Object[] asn1Objects = new Asn1Object[count];
            for (int i = 0; i < count; ++i)
            {
                asn1Objects[i] = elements[i].ToAsn1Object();
            }

            return Sort(asn1Objects);
        }
    }
}
