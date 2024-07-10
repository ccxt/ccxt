using System;

namespace Org.BouncyCastle.Asn1
{
    internal sealed class Asn1Tag
    {
        internal static Asn1Tag Create(int tagClass, int tagNo)
        {
            return new Asn1Tag(tagClass, tagNo);
        }

        private readonly int m_tagClass;
        private readonly int m_tagNo;

        private Asn1Tag(int tagClass, int tagNo)
        {
            m_tagClass = tagClass;
            m_tagNo = tagNo;
        }

        internal int TagClass
        {
            get { return m_tagClass; }
        }

        internal int TagNo
        {
            get { return m_tagNo; }
        }
    }
}
