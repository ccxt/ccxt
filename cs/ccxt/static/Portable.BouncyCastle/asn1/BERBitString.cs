using System;
using System.Diagnostics;

namespace Org.BouncyCastle.Asn1
{
    public class BerBitString
        : DerBitString
    {
        private const int DefaultSegmentLimit = 1000;

        internal static byte[] FlattenBitStrings(DerBitString[] bitStrings)
        {
            int count = bitStrings.Length;
            switch (count)
            {
            case 0:
                // No bits
                return new byte[]{ 0 };
            case 1:
                return bitStrings[0].contents;
            default:
            {
                int last = count - 1, totalLength = 0;
                for (int i = 0; i < last; ++i)
                {
                    byte[] elementContents = bitStrings[i].contents;
                    if (elementContents[0] != 0)
                        throw new ArgumentException("only the last nested bitstring can have padding", "bitStrings");

                    totalLength += elementContents.Length - 1;
                }

                // Last one can have padding
                byte[] lastElementContents = bitStrings[last].contents;
                byte padBits = lastElementContents[0];
                totalLength += lastElementContents.Length;

                byte[] contents = new byte[totalLength];
                contents[0] = padBits;

                int pos = 1;
                for (int i = 0; i < count; ++i)
                {
                    byte[] elementContents = bitStrings[i].contents;
                    int length = elementContents.Length - 1;
                    Array.Copy(elementContents, 1, contents, pos, length);
                    pos += length;
                }

                Debug.Assert(pos == totalLength);
                return contents;
            }
            }
        }

        private readonly int segmentLimit;
        private readonly DerBitString[] elements;

        public BerBitString(byte data, int padBits)
            : base(data, padBits)
        {
            this.elements = null;
            this.segmentLimit = DefaultSegmentLimit;
        }

        public BerBitString(byte[] data)
            : this(data, 0)
        {
        }

        public BerBitString(byte[] data, int padBits)
            : this(data, padBits, DefaultSegmentLimit)
		{
        }

        public BerBitString(byte[] data, int padBits, int segmentLimit)
            : base(data, padBits)
        {
            this.elements = null;
            this.segmentLimit = segmentLimit;
        }

        public BerBitString(int namedBits)
            : base(namedBits)
        {
            this.elements = null;
            this.segmentLimit = DefaultSegmentLimit;
        }

        public BerBitString(Asn1Encodable obj)
            : this(obj.GetDerEncoded(), 0)
		{
        }

        public BerBitString(DerBitString[] elements)
            : this(elements, DefaultSegmentLimit)
        {
        }

        public BerBitString(DerBitString[] elements, int segmentLimit)
            : base(FlattenBitStrings(elements), false)
        {
            this.elements = elements;
            this.segmentLimit = segmentLimit;
        }

        internal BerBitString(byte[] contents, bool check)
            : base(contents, check)
        {
            this.elements = null;
            this.segmentLimit = DefaultSegmentLimit;
        }

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            if (Asn1OutputStream.EncodingBer != encoding)
                return base.GetEncoding(encoding);

            if (null == elements)
                return new PrimitiveEncoding(Asn1Tags.Universal, Asn1Tags.BitString, contents);

            return new ConstructedILEncoding(Asn1Tags.Universal, Asn1Tags.BitString,
                Asn1OutputStream.GetContentsEncodings(encoding, elements));
        }

        internal override IAsn1Encoding GetEncodingImplicit(int encoding, int tagClass, int tagNo)
        {
            if (Asn1OutputStream.EncodingBer != encoding)
                return base.GetEncodingImplicit(encoding, tagClass, tagNo);

            if (null == elements)
                return new PrimitiveEncoding(tagClass, tagNo, contents);

            return new ConstructedILEncoding(tagClass, tagNo,
                Asn1OutputStream.GetContentsEncodings(encoding, elements));
        }
    }
}
