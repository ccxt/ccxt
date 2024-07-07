using System;
using System.IO;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Asn1
{
    internal class ConstructedBitStream
        : BaseInputStream
    {
        private readonly Asn1StreamParser m_parser;
        private readonly bool m_octetAligned;

        private bool m_first = true;
        private int m_padBits = 0;

        private Asn1BitStringParser m_currentParser;
        private Stream m_currentStream;

        internal ConstructedBitStream(Asn1StreamParser parser, bool octetAligned)
        {
            m_parser = parser;
            m_octetAligned = octetAligned;
        }

        internal int PadBits
        {
            get { return m_padBits; }
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            Streams.ValidateBufferArguments(buffer, offset, count);

            if (count < 1)
                return 0;

            if (m_currentStream == null)
            {
                if (!m_first)
                    return 0;

                m_currentParser = GetNextParser();
                if (m_currentParser == null)
                    return 0;

                m_first = false;
                m_currentStream = m_currentParser.GetBitStream();
            }

            int totalRead = 0;

            for (;;)
            {
                int numRead = m_currentStream.Read(buffer, offset + totalRead, count - totalRead);

                if (numRead > 0)
                {
                    totalRead += numRead;

                    if (totalRead == count)
                        return totalRead;
                }
                else
                {
                    m_padBits = m_currentParser.PadBits;
                    m_currentParser = GetNextParser();
                    if (m_currentParser == null)
                    {
                        m_currentStream = null;
                        return totalRead;
                    }

                    m_currentStream = m_currentParser.GetBitStream();
                }
            }
        }

        public override int ReadByte()
        {
            if (m_currentStream == null)
            {
                if (!m_first)
                    return -1;

                m_currentParser = GetNextParser();
                if (m_currentParser == null)
                    return -1;

                m_first = false;
                m_currentStream = m_currentParser.GetBitStream();
            }

            for (;;)
            {
                int b = m_currentStream.ReadByte();

                if (b >= 0)
                    return b;

                m_padBits = m_currentParser.PadBits;
                m_currentParser = GetNextParser();
                if (m_currentParser == null)
                {
                    m_currentStream = null;
                    return -1;
                }

                m_currentStream = m_currentParser.GetBitStream();
            }
        }

        private Asn1BitStringParser GetNextParser()
        {
            IAsn1Convertible asn1Obj = m_parser.ReadObject();
            if (asn1Obj == null)
            {
                if (m_octetAligned && m_padBits != 0)
                    throw new IOException("expected octet-aligned bitstring, but found padBits: " + m_padBits);

                return null;
            }

            if (asn1Obj is Asn1BitStringParser)
            {
                if (m_padBits != 0)
                    throw new IOException("only the last nested bitstring can have padding");

                return (Asn1BitStringParser)asn1Obj;
            }

            throw new IOException("unknown object encountered: " + Platform.GetTypeName(asn1Obj));
        }
    }
}
