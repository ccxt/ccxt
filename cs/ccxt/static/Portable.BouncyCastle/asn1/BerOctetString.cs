using System;
using System.Diagnostics;

namespace Org.BouncyCastle.Asn1
{
    public class BerOctetString
        : DerOctetString
    {
        private const int DefaultSegmentLimit = 1000;

        public static BerOctetString FromSequence(Asn1Sequence seq)
        {
            int count = seq.Count;
            Asn1OctetString[] v = new Asn1OctetString[count];
            for (int i = 0; i < count; ++i)
            {
                v[i] = GetInstance(seq[i]);
            }
            return new BerOctetString(v);
        }

        internal static byte[] FlattenOctetStrings(Asn1OctetString[] octetStrings)
        {
            int count = octetStrings.Length;
            switch (count)
            {
            case 0:
                return EmptyOctets;
            case 1:
                return octetStrings[0].contents;
            default:
            {
                int totalOctets = 0;
                for (int i = 0; i < count; ++i)
                {
                    totalOctets += octetStrings[i].contents.Length;
                }

                byte[] str = new byte[totalOctets];
                int pos = 0;
                for (int i = 0; i < count; ++i)
                {
                    byte[] octets = octetStrings[i].contents;
                    Array.Copy(octets, 0, str, pos, octets.Length);
                    pos += octets.Length;
                }

                Debug.Assert(pos == totalOctets);
                return str;
            }
            }
        }

        private readonly int segmentLimit;
        private readonly Asn1OctetString[] elements;

        public BerOctetString(byte[] contents)
			: this(contents, DefaultSegmentLimit)
		{
		}

        public BerOctetString(Asn1OctetString[] elements)
            : this(elements, DefaultSegmentLimit)
        {
        }

        public BerOctetString(byte[] contents, int segmentLimit)
            : this(contents, null, segmentLimit)
        {
        }

        public BerOctetString(Asn1OctetString[] elements, int segmentLimit)
            : this(FlattenOctetStrings(elements), elements, segmentLimit)
        {
        }

        private BerOctetString(byte[] contents, Asn1OctetString[] elements, int segmentLimit)
            : base(contents)
        {
            this.elements = elements;
            this.segmentLimit = segmentLimit;
        }

        internal override IAsn1Encoding GetEncoding(int encoding)
        {
            if (Asn1OutputStream.EncodingBer != encoding)
                return base.GetEncoding(encoding);

            if (null == elements)
                return new PrimitiveEncoding(Asn1Tags.Universal, Asn1Tags.OctetString, contents);

            return new ConstructedILEncoding(Asn1Tags.Universal, Asn1Tags.OctetString,
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
