using System;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.IO
{
    public sealed class MacStream
        : Stream
    {
        private readonly Stream m_stream;
        private readonly IMac m_readMac;
        private readonly IMac m_writeMac;

        public MacStream(Stream stream, IMac readMac, IMac writeMac)
        {
            m_stream = stream;
            m_readMac = readMac;
            m_writeMac = writeMac;
        }

        public IMac ReadMac => m_readMac;

        public IMac WriteMac => m_writeMac;

        public override bool CanRead
        {
            get { return m_stream.CanRead; }
        }

        public sealed override bool CanSeek
        {
            get { return false; }
        }

        public override bool CanWrite
        {
            get { return m_stream.CanWrite; }
        }

#if NETCOREAPP2_0_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override void CopyTo(Stream destination, int bufferSize)
        {
            if (m_readMac == null)
            {
                m_stream.CopyTo(destination, bufferSize);
            }
            else
            {
                base.CopyTo(destination, bufferSize);
            }
        }
#endif

        public override void Flush()
        {
            m_stream.Flush();
        }

        public sealed override long Length
        {
            get { throw new NotSupportedException(); }
        }

        public sealed override long Position
        {
            get { throw new NotSupportedException(); }
            set { throw new NotSupportedException(); }
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            int n = m_stream.Read(buffer, offset, count);

            if (m_readMac != null && n > 0)
            {
                m_readMac.BlockUpdate(buffer, offset, n);
            }

            return n;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int Read(Span<byte> buffer)
        {
            int n = m_stream.Read(buffer);

            if (m_readMac != null && n > 0)
            {
                m_readMac.BlockUpdate(buffer[..n]);
            }

            return n;
        }
#endif

        public override int ReadByte()
        {
            int b = m_stream.ReadByte();

            if (m_readMac != null && b >= 0)
            {
                m_readMac.Update((byte)b);
            }

            return b;
        }

        public sealed override long Seek(long offset, SeekOrigin origin)
        {
            throw new NotSupportedException();
        }

        public sealed override void SetLength(long length)
        {
            throw new NotSupportedException();
        }

        public override void Write(byte[] buffer, int offset, int count)
        {
            m_stream.Write(buffer, offset, count);

            if (m_writeMac != null && count > 0)
            {
                m_writeMac.BlockUpdate(buffer, offset, count);
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override void Write(ReadOnlySpan<byte> buffer)
        {
            m_stream.Write(buffer);

            if (m_writeMac != null && !buffer.IsEmpty)
            {
                m_writeMac.BlockUpdate(buffer);
            }
        }
#endif

        public override void WriteByte(byte value)
        {
            m_stream.WriteByte(value);

            if (m_writeMac != null)
            {
                m_writeMac.Update(value);
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                Platform.Dispose(m_stream);
            }
            base.Dispose(disposing);
        }
    }
}
