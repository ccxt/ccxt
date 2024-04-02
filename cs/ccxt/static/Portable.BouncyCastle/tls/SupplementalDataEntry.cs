using System;

namespace Org.BouncyCastle.Tls
{
    public sealed class SupplementalDataEntry
    {
        private readonly int m_dataType;
        private readonly byte[] m_data;

        public SupplementalDataEntry(int dataType, byte[] data)
        {
            this.m_dataType = dataType;
            this.m_data = data;
        }

        public int DataType
        {
            get { return m_dataType; }
        }

        public byte[] Data
        {
            get { return m_data; }
        }
    }
}
