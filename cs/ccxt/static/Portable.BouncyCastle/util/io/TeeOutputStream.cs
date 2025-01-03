using System;
using System.Diagnostics;
using System.IO;

namespace Org.BouncyCastle.Utilities.IO
{
    public class TeeOutputStream
		: BaseOutputStream
	{
		private readonly Stream output, tee;

		public TeeOutputStream(Stream output, Stream tee)
		{
			Debug.Assert(output.CanWrite);
			Debug.Assert(tee.CanWrite);

			this.output = output;
			this.tee = tee;
		}

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                Platform.Dispose(output);
                Platform.Dispose(tee);
            }
            base.Dispose(disposing);
        }

        public override void Write(byte[] buffer, int offset, int count)
		{
			output.Write(buffer, offset, count);
			tee.Write(buffer, offset, count);
		}

#if NETCOREAPP2_1_OR_GREATER || NETSTANDARD2_1_OR_GREATER
        public override void Write(ReadOnlySpan<byte> buffer)
        {
            output.Write(buffer);
            tee.Write(buffer);
        }
#endif

        public override void WriteByte(byte value)
		{
			output.WriteByte(value);
			tee.WriteByte(value);
		}
	}
}
