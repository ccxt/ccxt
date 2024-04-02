using System;

using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Tls
{
    public sealed class ByteQueueInputStream
        : BaseInputStream
    {
        private readonly ByteQueue m_buffer;

        public ByteQueueInputStream()
        {
            this.m_buffer = new ByteQueue();
        }

        public void AddBytes(byte[] buf)
        {
            m_buffer.AddData(buf, 0, buf.Length);
        }

        public void AddBytes(byte[] buf, int bufOff, int bufLen)
        {
            m_buffer.AddData(buf, bufOff, bufLen);
        }

        public int Peek(byte[] buf)
        {
            int bytesToRead = System.Math.Min(m_buffer.Available, buf.Length);
            m_buffer.Read(buf, 0, bytesToRead, 0);
            return bytesToRead;
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            Streams.ValidateBufferArguments(buffer, offset, count);

            int bytesToRead = System.Math.Min(m_buffer.Available, count);
            m_buffer.RemoveData(buffer, offset, bytesToRead, 0);
            return bytesToRead;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int Read(Span<byte> buffer)
        {
            int bytesToRead = System.Math.Min(m_buffer.Available, buffer.Length);
            m_buffer.RemoveData(buffer[..bytesToRead], 0);
            return bytesToRead;
        }
#endif

        public override int ReadByte()
        {
            if (m_buffer.Available == 0)
                return -1;

            return m_buffer.RemoveData(1, 0)[0];
        }

        public long Skip(long n)
        {
            int bytesToRemove = System.Math.Min((int)n, m_buffer.Available);
            m_buffer.RemoveData(bytesToRemove);
            return bytesToRemove;
        }

        public int Available
        {
            get { return m_buffer.Available; }
        }
    }
}
