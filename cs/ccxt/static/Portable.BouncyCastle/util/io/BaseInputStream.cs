using System;
using System.IO;

namespace Org.BouncyCastle.Utilities.IO
{
    public abstract class BaseInputStream
        : Stream
    {
        public sealed override bool CanRead { get { return true; } }
        public sealed override bool CanSeek { get { return false; } }
        public sealed override bool CanWrite { get { return false; } }

        public sealed override void Flush() {}
        public sealed override long Length { get { throw new NotSupportedException(); } }
        public sealed override long Position
        {
            get { throw new NotSupportedException(); }
            set { throw new NotSupportedException(); }
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
            Streams.ValidateBufferArguments(buffer, offset, count);

            int pos = 0;
            try
            {
                while (pos < count)
                {
                    int b = ReadByte();
                    if (b < 0)
                        break;

                    buffer[offset + pos++] = (byte)b;
                }
            }
            catch (IOException)
            {
                if (pos == 0)
                    throw;
            }
            return pos;
        }

        public sealed override long Seek(long offset, SeekOrigin origin) { throw new NotSupportedException(); }
        public sealed override void SetLength(long value) { throw new NotSupportedException(); }
        public sealed override void Write(byte[] buffer, int offset, int count) { throw new NotSupportedException(); }
    }
}
