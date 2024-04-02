using System;
using System.IO;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Bcpg
{
	/// <remarks>Basic output stream.</remarks>
    public class BcpgOutputStream
        : BaseOutputStream
    {
		internal static BcpgOutputStream Wrap(
			Stream outStr)
		{
			if (outStr is BcpgOutputStream)
			{
				return (BcpgOutputStream) outStr;
			}

			return new BcpgOutputStream(outStr);
		}

		private Stream outStr;
        private byte[] partialBuffer;
        private int partialBufferLength;
        private int partialPower;
        private int partialOffset;
        private const int BufferSizePower = 16; // 2^16 size buffer on long files

		/// <summary>Create a stream representing a general packet.</summary>
		/// <param name="outStr">Output stream to write to.</param>
		public BcpgOutputStream(
            Stream outStr)
        {
			if (outStr == null)
				throw new ArgumentNullException("outStr");

			this.outStr = outStr;
        }

		/// <summary>Create a stream representing an old style partial object.</summary>
		/// <param name="outStr">Output stream to write to.</param>
		/// <param name="tag">The packet tag for the object.</param>
        public BcpgOutputStream(
            Stream		outStr,
            PacketTag	tag)
        {
			if (outStr == null)
				throw new ArgumentNullException("outStr");

			this.outStr = outStr;
            this.WriteHeader(tag, true, true, 0);
        }

		/// <summary>Create a stream representing a general packet.</summary>
		/// <param name="outStr">Output stream to write to.</param>
		/// <param name="tag">Packet tag.</param>
		/// <param name="length">Size of chunks making up the packet.</param>
		/// <param name="oldFormat">If true, the header is written out in old format.</param>
		public BcpgOutputStream(
            Stream		outStr,
            PacketTag	tag,
            long		length,
            bool		oldFormat)
        {
			if (outStr == null)
				throw new ArgumentNullException("outStr");

			this.outStr = outStr;

            if (length > 0xFFFFFFFFL)
            {
                this.WriteHeader(tag, false, true, 0);
                this.partialBufferLength = 1 << BufferSizePower;
                this.partialBuffer = new byte[partialBufferLength];
				this.partialPower = BufferSizePower;
				this.partialOffset = 0;
            }
            else
            {
                this.WriteHeader(tag, oldFormat, false, length);
            }
        }

		/// <summary>Create a new style partial input stream buffered into chunks.</summary>
		/// <param name="outStr">Output stream to write to.</param>
		/// <param name="tag">Packet tag.</param>
		/// <param name="length">Size of chunks making up the packet.</param>
		public BcpgOutputStream(
            Stream		outStr,
            PacketTag	tag,
            long		length)
        {
			if (outStr == null)
				throw new ArgumentNullException("outStr");

            this.outStr = outStr;
            this.WriteHeader(tag, false, false, length);
        }

		/// <summary>Create a new style partial input stream buffered into chunks.</summary>
		/// <param name="outStr">Output stream to write to.</param>
		/// <param name="tag">Packet tag.</param>
		/// <param name="buffer">Buffer to use for collecting chunks.</param>
        public BcpgOutputStream(
            Stream		outStr,
            PacketTag	tag,
            byte[]		buffer)
        {
			if (outStr == null)
				throw new ArgumentNullException("outStr");

            this.outStr = outStr;
            this.WriteHeader(tag, false, true, 0);

			this.partialBuffer = buffer;

			uint length = (uint) partialBuffer.Length;
            for (partialPower = 0; length != 1; partialPower++)
            {
                length >>= 1;
            }

			if (partialPower > 30)
            {
                throw new IOException("Buffer cannot be greater than 2^30 in length.");
            }
            this.partialBufferLength = 1 << partialPower;
            this.partialOffset = 0;
        }

		private void WriteNewPacketLength(
            long bodyLen)
        {
            if (bodyLen < 192)
            {
                outStr.WriteByte((byte)bodyLen);
            }
            else if (bodyLen <= 8383)
            {
                bodyLen -= 192;

                outStr.WriteByte((byte)(((bodyLen >> 8) & 0xff) + 192));
                outStr.WriteByte((byte)bodyLen);
            }
            else
            {
                outStr.WriteByte(0xff);
                outStr.WriteByte((byte)(bodyLen >> 24));
                outStr.WriteByte((byte)(bodyLen >> 16));
                outStr.WriteByte((byte)(bodyLen >> 8));
                outStr.WriteByte((byte)bodyLen);
            }
        }

        private void WriteHeader(
            PacketTag	tag,
            bool		oldPackets,
            bool		partial,
            long		bodyLen)
        {
            int hdr = 0x80;

            if (partialBuffer != null)
            {
                PartialFlush(true);
                partialBuffer = null;
            }

            if (oldPackets)
            {
                hdr |= ((int) tag) << 2;

                if (partial)
                {
                    this.WriteByte((byte)(hdr | 0x03));
                }
                else
                {
                    if (bodyLen <= 0xff)
                    {
                        this.WriteByte((byte) hdr);
                        this.WriteByte((byte)bodyLen);
                    }
                    else if (bodyLen <= 0xffff)
                    {
                        this.WriteByte((byte)(hdr | 0x01));
                        this.WriteByte((byte)(bodyLen >> 8));
                        this.WriteByte((byte)(bodyLen));
                    }
                    else
                    {
                        this.WriteByte((byte)(hdr | 0x02));
                        this.WriteByte((byte)(bodyLen >> 24));
                        this.WriteByte((byte)(bodyLen >> 16));
                        this.WriteByte((byte)(bodyLen >> 8));
                        this.WriteByte((byte)bodyLen);
                    }
                }
            }
            else
            {
                hdr |= 0x40 | (int) tag;
                this.WriteByte((byte) hdr);

                if (partial)
                {
                    partialOffset = 0;
                }
                else
                {
                    this.WriteNewPacketLength(bodyLen);
                }
            }
        }

        private void PartialFlush(bool isLast)
        {
            if (isLast)
            {
                WriteNewPacketLength(partialOffset);
                outStr.Write(partialBuffer, 0, partialOffset);
            }
            else
            {
                outStr.WriteByte((byte)(0xE0 | partialPower));
                outStr.Write(partialBuffer, 0, partialBufferLength);
            }

            partialOffset = 0;
        }

        private void PartialWrite(byte[] buffer, int offset, int count)
        {
            Streams.ValidateBufferArguments(buffer, offset, count);

            if (partialOffset == partialBufferLength)
            {
                PartialFlush(false);
            }

            if (count <= (partialBufferLength - partialOffset))
            {
                Array.Copy(buffer, offset, partialBuffer, partialOffset, count);
                partialOffset += count;
            }
            else
            {
                int diff = partialBufferLength - partialOffset;
                Array.Copy(buffer, offset, partialBuffer, partialOffset, diff);
                offset += diff;
                count -= diff;
                PartialFlush(false);
                while (count > partialBufferLength)
                {
                    Array.Copy(buffer, offset, partialBuffer, 0, partialBufferLength);
                    offset += partialBufferLength;
                    count -= partialBufferLength;
                    PartialFlush(false);
                }
                Array.Copy(buffer, offset, partialBuffer, 0, count);
                partialOffset += count;
            }
        }

        private void PartialWriteByte(byte value)
        {
            if (partialOffset == partialBufferLength)
            {
                PartialFlush(false);
            }

            partialBuffer[partialOffset++] = value;
        }

        public override void Write(byte[] buffer, int offset, int count)
        {
            if (partialBuffer != null)
            {
                PartialWrite(buffer, offset, count);
            }
            else
            {
                outStr.Write(buffer, offset, count);
            }
        }

        public override void WriteByte(byte value)
        {
            if (partialBuffer != null)
            {
                PartialWriteByte(value);
            }
            else
            {
                outStr.WriteByte(value);
            }
        }

        // Additional helper methods to write primitive types
        internal virtual void WriteShort(
			short n)
		{
			this.Write(
				(byte)(n >> 8),
				(byte)n);
		}
		internal virtual void WriteInt(
			int n)
		{
			this.Write(
				(byte)(n >> 24),
				(byte)(n >> 16),
				(byte)(n >> 8),
				(byte)n);
		}
		internal virtual void WriteLong(
			long n)
		{
			this.Write(
				(byte)(n >> 56),
				(byte)(n >> 48),
				(byte)(n >> 40),
				(byte)(n >> 32),
				(byte)(n >> 24),
				(byte)(n >> 16),
				(byte)(n >> 8),
				(byte)n);
		}

		public void WritePacket(
            ContainedPacket p)
        {
            p.Encode(this);
        }

        internal void WritePacket(
            PacketTag	tag,
            byte[]		body,
            bool		oldFormat)
        {
            this.WriteHeader(tag, oldFormat, false, body.Length);
            this.Write(body);
        }

		public void WriteObject(
            BcpgObject bcpgObject)
        {
            bcpgObject.Encode(this);
        }

		public void WriteObjects(
			params BcpgObject[] v)
		{
			foreach (BcpgObject o in v)
			{
				o.Encode(this);
			}
		}

		/// <summary>Flush the underlying stream.</summary>
        public override void Flush()
        {
            outStr.Flush();
        }

		/// <summary>Finish writing out the current packet without closing the underlying stream.</summary>
        public void Finish()
        {
            if (partialBuffer != null)
            {
                PartialFlush(true);
                Array.Clear(partialBuffer, 0, partialBuffer.Length);
                partialBuffer = null;
            }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
			    this.Finish();
			    outStr.Flush();
                Platform.Dispose(outStr);
            }
            base.Dispose(disposing);
        }
    }
}
