using System;
using System.IO;

using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Asn1
{
    class DefiniteLengthInputStream
        : LimitedInputStream
    {
		private static readonly byte[] EmptyBytes = new byte[0];

		private readonly int _originalLength;
		private int _remaining;

        internal DefiniteLengthInputStream(Stream inStream, int length, int limit)
            : base(inStream, limit)
        {
            if (length <= 0)
            {
                if (length < 0)
                    throw new ArgumentException("negative lengths not allowed", "length");

                SetParentEofDetect();
            }

            this._originalLength = length;
			this._remaining = length;
        }

        internal int Remaining
		{
			get { return _remaining; }
		}

		public override int ReadByte()
        {
            if (_remaining < 2)
            {
                if (_remaining == 0)
                    return -1;

                int b = _in.ReadByte();
                if (b < 0)
                    throw new EndOfStreamException("DEF length " + _originalLength + " object truncated by " + _remaining);

                _remaining = 0;
                SetParentEofDetect();

                return b;
            }
            else
            {
                int b = _in.ReadByte();
                if (b < 0)
                    throw new EndOfStreamException("DEF length " + _originalLength + " object truncated by " + _remaining);

                --_remaining;
                return b;
            }
        }

		public override int Read(byte[] buf, int off, int len)
		{
            if (_remaining == 0)
                return 0;

            int toRead = System.Math.Min(len, _remaining);
            int numRead = _in.Read(buf, off, toRead);

            if (numRead < 1)
                throw new EndOfStreamException("DEF length " + _originalLength + " object truncated by " + _remaining);

            if ((_remaining -= numRead) == 0)
            {
                SetParentEofDetect();
            }

            return numRead;
        }

        internal void ReadAllIntoByteArray(byte[] buf)
        {
            if (_remaining != buf.Length)
                throw new ArgumentException("buffer length not right for data");

            if (_remaining == 0)
                return;

            // make sure it's safe to do this!
            int limit = Limit;
            if (_remaining >= limit)
                throw new IOException("corrupted stream - out of bounds length found: " + _remaining + " >= " + limit);

            if ((_remaining -= Streams.ReadFully(_in, buf, 0, buf.Length)) != 0)
                throw new EndOfStreamException("DEF length " + _originalLength + " object truncated by " + _remaining);
            SetParentEofDetect();
        }

        internal byte[] ToArray()
		{
			if (_remaining == 0)
				return EmptyBytes;

            // make sure it's safe to do this!
            int limit = Limit;
            if (_remaining >= limit)
                throw new IOException("corrupted stream - out of bounds length found: " + _remaining + " >= " + limit);

            byte[] bytes = new byte[_remaining];
			if ((_remaining -= Streams.ReadFully(_in, bytes, 0, bytes.Length)) != 0)
				throw new EndOfStreamException("DEF length " + _originalLength + " object truncated by " + _remaining);
			SetParentEofDetect();
			return bytes;
		}
    }
}
