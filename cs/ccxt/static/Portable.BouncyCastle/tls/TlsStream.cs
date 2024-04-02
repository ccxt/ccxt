using System;
using System.IO;

namespace Org.BouncyCastle.Tls
{
    internal class TlsStream
        : Stream
    {
        private readonly TlsProtocol m_handler;

        internal TlsStream(TlsProtocol handler)
        {
            m_handler = handler;
        }

        public override bool CanRead
        {
            get { return true; }
        }

        public override bool CanSeek
        {
            get { return false; }
        }

        public override bool CanWrite
        {
            get { return true; }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                m_handler.Close();
            }
            base.Dispose(disposing);
        }

        public override void Flush()
        {
            m_handler.Flush();
        }

        public override long Length
        {
            get { throw new NotSupportedException(); }
        }

        public override long Position
        {
            get { throw new NotSupportedException(); }
            set { throw new NotSupportedException(); }
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            return m_handler.ReadApplicationData(buffer, offset, count);
        }

        public override int ReadByte()
        {
            byte[] buf = new byte[1];
            int ret = m_handler.ReadApplicationData(buf, 0, 1);
            return ret <= 0 ? -1 : buf[0];
        }

        public override long Seek(long offset, SeekOrigin origin)
        {
            throw new NotSupportedException();
        }

        public override void SetLength(long value)
        {
            throw new NotSupportedException();
        }

        public override void Write(byte[] buffer, int offset, int count)
        {
            m_handler.WriteApplicationData(buffer, offset, count);
        }

        public override void WriteByte(byte value)
        {
            m_handler.WriteApplicationData(new byte[]{ value }, 0, 1);
        }
    }
}
