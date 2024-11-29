using System;
using System.IO;

namespace Org.BouncyCastle.Asn1
{
    /// <summary>Parser for a DL encoded BIT STRING.</summary>
    internal class DLBitStringParser
        : Asn1BitStringParser
    {
        private readonly DefiniteLengthInputStream m_stream;
        private int m_padBits = 0;

        internal DLBitStringParser(DefiniteLengthInputStream stream)
        {
            m_stream = stream;
        }

        public Stream GetBitStream()
        {
            return GetBitStream(false);
        }

        public Stream GetOctetStream()
        {
            return GetBitStream(true);
        }

        public int PadBits
        {
            get { return m_padBits; }
        }

        public Asn1Object ToAsn1Object()
        {
            try
            {
                return DerBitString.CreatePrimitive(m_stream.ToArray());
            }
            catch (IOException e)
            {
                throw new Asn1ParsingException("IOException converting stream to byte array: " + e.Message, e);
            }
        }

        private Stream GetBitStream(bool octetAligned)
        {
            int length = m_stream.Remaining;
            if (length < 1)
                throw new InvalidOperationException("content octets cannot be empty");

            m_padBits = m_stream.ReadByte();
            if (m_padBits > 0)
            {
                if (length < 2)
                    throw new InvalidOperationException("zero length data with non-zero pad bits");
                if (m_padBits > 7)
                    throw new InvalidOperationException("pad bits cannot be greater than 7 or less than 0");
                if (octetAligned)
                    throw new IOException("expected octet-aligned bitstring, but found padBits: " + m_padBits);
            }

            return m_stream;
        }
    }
}
