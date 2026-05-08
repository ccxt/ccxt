using System;

namespace Org.BouncyCastle.Asn1
{
    internal class ConstructedDLEncoding
        : IAsn1Encoding
    {
        private readonly int m_tagClass;
        private readonly int m_tagNo;
        private readonly IAsn1Encoding[] m_contentsElements;
        private readonly int m_contentsLength;

        internal ConstructedDLEncoding(int tagClass, int tagNo, IAsn1Encoding[] contentsElements)
        {
            m_tagClass = tagClass;
            m_tagNo = tagNo;
            m_contentsElements = contentsElements;
            m_contentsLength = Asn1OutputStream.GetLengthOfContents(contentsElements);
        }

        void IAsn1Encoding.Encode(Asn1OutputStream asn1Out)
        {
            asn1Out.WriteIdentifier(Asn1Tags.Constructed | m_tagClass, m_tagNo);
            asn1Out.WriteDL(m_contentsLength);
            asn1Out.EncodeContents(m_contentsElements);
        }

        int IAsn1Encoding.GetLength()
        {
            return Asn1OutputStream.GetLengthOfIdentifier(m_tagNo)
                +  Asn1OutputStream.GetLengthOfDL(m_contentsLength)
                +  m_contentsLength;
        }
    }
}
