using System;
using System.IO;

using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.IO;

namespace Org.BouncyCastle.Bcpg
{
	/// <remarks>Reader for PGP objects.</remarks>
    public class BcpgInputStream
        : BaseInputStream
    {
        private Stream m_in;
        private bool next = false;
        private int nextB;

        internal static BcpgInputStream Wrap(
			Stream inStr)
        {
            if (inStr is BcpgInputStream)
            {
                return (BcpgInputStream) inStr;
            }

            return new BcpgInputStream(inStr);
        }

        private BcpgInputStream(
			Stream inputStream)
        {
            this.m_in = inputStream;
        }

        public override int ReadByte()
        {
            if (next)
            {
                next = false;
                return nextB;
            }

            return m_in.ReadByte();
        }

        public override int Read(byte[] buffer, int offset, int count)
        {
			if (!next)
				return m_in.Read(buffer, offset, count);

            Streams.ValidateBufferArguments(buffer, offset, count);

			if (nextB < 0)
				return 0;

            buffer[offset] = (byte)nextB;
            next = false;
            return 1;
        }

        public byte[] ReadAll()
        {
			return Streams.ReadAll(this);
		}

		public void ReadFully(
            byte[]	buffer,
            int		off,
            int		len)
        {
			if (Streams.ReadFully(this, buffer, off, len) < len)
				throw new EndOfStreamException();
        }

		public void ReadFully(
            byte[] buffer)
        {
            ReadFully(buffer, 0, buffer.Length);
        }

		/// <summary>Returns the next packet tag in the stream.</summary>
        public PacketTag NextPacketTag()
        {
            if (!next)
            {
                try
                {
                    nextB = m_in.ReadByte();
                }
                catch (EndOfStreamException)
                {
                    nextB = -1;
                }

                next = true;
            }

            if (nextB < 0)
                return (PacketTag)nextB;

            int maskB = nextB & 0x3f;
            if ((nextB & 0x40) == 0)    // old
            {
                maskB >>= 2;
            }
            return (PacketTag)maskB;
        }

        public Packet ReadPacket()
        {
            int hdr = this.ReadByte();

            if (hdr < 0)
            {
                return null;
            }

            if ((hdr & 0x80) == 0)
            {
                throw new IOException("invalid header encountered");
            }

            bool newPacket = (hdr & 0x40) != 0;
            PacketTag tag = 0;
            int bodyLen = 0;
            bool partial = false;

            if (newPacket)
            {
                tag = (PacketTag)(hdr & 0x3f);

                int l = this.ReadByte();

                if (l < 192)
                {
                    bodyLen = l;
                }
                else if (l <= 223)
                {
                    int b = m_in.ReadByte();
                    bodyLen = ((l - 192) << 8) + (b) + 192;
                }
                else if (l == 255)
                {
                    bodyLen = (m_in.ReadByte() << 24) | (m_in.ReadByte() << 16)
                        |  (m_in.ReadByte() << 8)  | m_in.ReadByte();
                }
                else
                {
                    partial = true;
                    bodyLen = 1 << (l & 0x1f);
                }
            }
            else
            {
                int lengthType = hdr & 0x3;

                tag = (PacketTag)((hdr & 0x3f) >> 2);

                switch (lengthType)
                {
                    case 0:
                        bodyLen = this.ReadByte();
                        break;
                    case 1:
                        bodyLen = (this.ReadByte() << 8) | this.ReadByte();
                        break;
                    case 2:
                        bodyLen = (this.ReadByte() << 24) | (this.ReadByte() << 16)
                            | (this.ReadByte() << 8) | this.ReadByte();
                        break;
                    case 3:
                        partial = true;
                        break;
                    default:
                        throw new IOException("unknown length type encountered");
                }
            }

            BcpgInputStream objStream;
            if (bodyLen == 0 && partial)
            {
                objStream = this;
            }
            else
            {
                PartialInputStream pis = new PartialInputStream(this, partial, bodyLen);
				Stream buf = new BufferedStream(pis);
                objStream = new BcpgInputStream(buf);
            }

            switch (tag)
            {
                case PacketTag.Reserved:
                    return new InputStreamPacket(objStream);
                case PacketTag.PublicKeyEncryptedSession:
                    return new PublicKeyEncSessionPacket(objStream);
                case PacketTag.Signature:
                    return new SignaturePacket(objStream);
                case PacketTag.SymmetricKeyEncryptedSessionKey:
                    return new SymmetricKeyEncSessionPacket(objStream);
                case PacketTag.OnePassSignature:
                    return new OnePassSignaturePacket(objStream);
                case PacketTag.SecretKey:
                    return new SecretKeyPacket(objStream);
                case PacketTag.PublicKey:
                    return new PublicKeyPacket(objStream);
                case PacketTag.SecretSubkey:
                    return new SecretSubkeyPacket(objStream);
                case PacketTag.CompressedData:
                    return new CompressedDataPacket(objStream);
                case PacketTag.SymmetricKeyEncrypted:
                    return new SymmetricEncDataPacket(objStream);
                case PacketTag.Marker:
                    return new MarkerPacket(objStream);
                case PacketTag.LiteralData:
                    return new LiteralDataPacket(objStream);
                case PacketTag.Trust:
                    return new TrustPacket(objStream);
                case PacketTag.UserId:
                    return new UserIdPacket(objStream);
                case PacketTag.UserAttribute:
                    return new UserAttributePacket(objStream);
                case PacketTag.PublicSubkey:
                    return new PublicSubkeyPacket(objStream);
                case PacketTag.SymmetricEncryptedIntegrityProtected:
                    return new SymmetricEncIntegrityPacket(objStream);
                case PacketTag.ModificationDetectionCode:
                    return new ModDetectionCodePacket(objStream);
                case PacketTag.Experimental1:
                case PacketTag.Experimental2:
                case PacketTag.Experimental3:
                case PacketTag.Experimental4:
                    return new ExperimentalPacket(tag, objStream);
                default:
                    throw new IOException("unknown packet type encountered: " + tag);
            }
        }

        public PacketTag SkipMarkerPackets()
        {
            PacketTag tag;
            while ((tag = NextPacketTag()) == PacketTag.Marker)
            {
                ReadPacket();
            }

            return tag;
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                Platform.Dispose(m_in);
            }
            base.Dispose(disposing);
        }

		/// <summary>
		/// A stream that overlays our input stream, allowing the user to only read a segment of it.
		/// NB: dataLength will be negative if the segment length is in the upper range above 2**31.
		/// </summary>
		private class PartialInputStream
            : BaseInputStream
        {
            private BcpgInputStream m_in;
            private bool partial;
            private int dataLength;

            internal PartialInputStream(
                BcpgInputStream	bcpgIn,
                bool			partial,
                int				dataLength)
            {
                this.m_in = bcpgIn;
                this.partial = partial;
                this.dataLength = dataLength;
            }

			public override int ReadByte()
			{
				do
				{
					if (dataLength != 0)
					{
						int ch = m_in.ReadByte();
						if (ch < 0)
						{
							throw new EndOfStreamException("Premature end of stream in PartialInputStream");
						}
						dataLength--;
						return ch;
					}
				}
				while (partial && ReadPartialDataLength() >= 0);

				return -1;
			}

			public override int Read(byte[] buffer, int offset, int count)
			{
                Streams.ValidateBufferArguments(buffer, offset, count);

				do
				{
					if (dataLength != 0)
					{
						int readLen = (dataLength > count || dataLength < 0) ? count : dataLength;
						int len = m_in.Read(buffer, offset, readLen);
						if (len < 1)
						{
							throw new EndOfStreamException("Premature end of stream in PartialInputStream");
						}
						dataLength -= len;
						return len;
					}
				}
				while (partial && ReadPartialDataLength() >= 0);

				return 0;
			}

            private int ReadPartialDataLength()
            {
                int l = m_in.ReadByte();

				if (l < 0)
                {
                    return -1;
                }

				partial = false;

				if (l < 192)
                {
                    dataLength = l;
                }
                else if (l <= 223)
                {
                    dataLength = ((l - 192) << 8) + (m_in.ReadByte()) + 192;
                }
                else if (l == 255)
                {
                    dataLength = (m_in.ReadByte() << 24) | (m_in.ReadByte() << 16)
                        |  (m_in.ReadByte() << 8)  | m_in.ReadByte();
                }
                else
                {
                    partial = true;
                    dataLength = 1 << (l & 0x1f);
                }

                return 0;
            }
        }
    }
}
