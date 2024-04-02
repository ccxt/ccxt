using Org.BouncyCastle.Utilities.Zlib;
using System;
using System.IO;

namespace Org.BouncyCastle.Utilities.IO
{
    internal class LimitedInputStream
        : BaseInputStream
    {
        private readonly Stream m_stream;
        private long m_limit;

        internal LimitedInputStream(Stream stream, long limit)
        {
            this.m_stream = stream;
            this.m_limit = limit;
        }

        internal long CurrentLimit => m_limit;

        public override int Read(byte[] buffer, int offset, int count)
        {
            int numRead = m_stream.Read(buffer, offset, count);
            if (numRead > 0)
            {
                if ((m_limit -= numRead) < 0)
                    throw new StreamOverflowException("Data Overflow");
            }
            return numRead;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int Read(Span<byte> buffer)
        {
            int numRead = m_stream.Read(buffer);
            if (numRead > 0)
            {
                if ((m_limit -= numRead) < 0)
                    throw new StreamOverflowException("Data Overflow");
            }
            return numRead;
        }
#endif

        public override int ReadByte()
        {
            int b = m_stream.ReadByte();
            if (b >= 0)
            {
                if (--m_limit < 0)
                    throw new StreamOverflowException("Data Overflow");
            }
            return b;
        }
    }
}
