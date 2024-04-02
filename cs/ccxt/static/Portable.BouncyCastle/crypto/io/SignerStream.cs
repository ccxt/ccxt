using System;
using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.IO
{
    public sealed class SignerStream
        : Stream
    {
        private readonly Stream stream;
        private readonly ISigner inSigner;
        private readonly ISigner outSigner;

        public SignerStream(Stream stream, ISigner readSigner, ISigner writeSigner)
        {
            this.stream = stream;
            this.inSigner = readSigner;
            this.outSigner = writeSigner;
        }

        public ISigner ReadSigner => inSigner;

        public ISigner WriteSigner => outSigner;

        public override bool CanRead
        {
            get { return stream.CanRead; }
        }

        public sealed override bool CanSeek
        {
            get { return false; }
        }

        public override bool CanWrite
        {
            get { return stream.CanWrite; }
        }

#if NETCOREAPP2_0_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override void CopyTo(Stream destination, int bufferSize)
        {
            if (inSigner == null)
            {
                stream.CopyTo(destination, bufferSize);
            }
            else
            {
                base.CopyTo(destination, bufferSize);
            }
        }
#endif

        public override void Flush()
        {
            stream.Flush();
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
            int n = stream.Read(buffer, offset, count);

            if (inSigner != null && n > 0)
            {
                inSigner.BlockUpdate(buffer, offset, n);
            }

            return n;
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int Read(Span<byte> buffer)
        {
            int n = stream.Read(buffer);

            if (inSigner != null && n > 0)
            {
                inSigner.BlockUpdate(buffer[..n]);
            }

            return n;
        }
#endif

        public override int ReadByte()
        {
            int b = stream.ReadByte();

            if (inSigner != null && b >= 0)
            {
                inSigner.Update((byte)b);
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
            stream.Write(buffer, offset, count);

            if (outSigner != null && count > 0)
            {
                outSigner.BlockUpdate(buffer, offset, count);
            }
        }

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override void Write(ReadOnlySpan<byte> buffer)
        {
            stream.Write(buffer);

            if (outSigner != null && !buffer.IsEmpty)
            {
                outSigner.BlockUpdate(buffer);
            }
        }
#endif

        public override void WriteByte(byte value)
        {
            stream.WriteByte(value);

            if (outSigner != null)
            {
                outSigner.Update(value);
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                Platform.Dispose(stream);
            }
            base.Dispose(disposing);
        }
    }
}
