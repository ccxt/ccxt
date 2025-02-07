using System;
using System.Diagnostics;
using System.IO;

namespace Org.BouncyCastle.Utilities.IO
{
	public class TeeInputStream
		: BaseInputStream
	{
		private readonly Stream input, tee;

		public TeeInputStream(Stream input, Stream tee)
		{
			Debug.Assert(input.CanRead);
			Debug.Assert(tee.CanWrite);

			this.input = input;
			this.tee = tee;
		}

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                Platform.Dispose(input);
                Platform.Dispose(tee);
            }
            base.Dispose(disposing);
        }

        public override int Read(byte[] buffer, int offset, int count)
		{
			int i = input.Read(buffer, offset, count);

			if (i > 0)
			{
				tee.Write(buffer, offset, i);
			}

			return i;
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override int Read(Span<byte> buffer)
        {
            int i = input.Read(buffer);

            if (i > 0)
            {
				tee.Write(buffer[..i]);
            }

            return i;
        }
#endif

        public override int ReadByte()
		{
			int i = input.ReadByte();

			if (i >= 0)
			{
				tee.WriteByte((byte)i);
			}

			return i;
		}
	}
}
