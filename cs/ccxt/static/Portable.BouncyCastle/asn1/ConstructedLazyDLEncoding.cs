using System;

namespace Org.BouncyCastle.Asn1
{
    internal class ConstructedLazyDLEncoding
        : IAsn1Encoding
    {
        private readonly int m_tagClass;
        private readonly int m_tagNo;
        private readonly byte[] m_contentsOctets;

        internal ConstructedLazyDLEncoding(int tagClass, int tagNo, byte[] contentsOctets)
        {
            m_tagClass = tagClass;
            m_tagNo = tagNo;
            m_contentsOctets = contentsOctets;
        }

        void IAsn1Encoding.Encode(Asn1OutputStream asn1Out)
        {
            asn1Out.WriteIdentifier(Asn1Tags.Constructed | m_tagClass, m_tagNo);
            asn1Out.WriteDL(m_contentsOctets.Length);
            asn1Out.Write(m_contentsOctets, 0, m_contentsOctets.Length);
        }

        int IAsn1Encoding.GetLength()
        {
            return Asn1OutputStream.GetLengthOfIdentifier(m_tagNo)
                +  Asn1OutputStream.GetLengthOfDL(m_contentsOctets.Length)
                +  m_contentsOctets.Length;
        }
    }
}
