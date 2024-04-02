using System.IO;

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Bcpg
{
	/// <remarks>Basic type for a PGP Signature sub-packet.</remarks>
    public class SignatureSubpacket
    {
        private readonly SignatureSubpacketTag type;
        private readonly bool critical;
        private readonly bool isLongLength;
		internal byte[] data;

		protected internal SignatureSubpacket(
            SignatureSubpacketTag	type,
            bool					critical,
            bool                    isLongLength,
            byte[]					data)
        {
            this.type = type;
            this.critical = critical;
            this.isLongLength = isLongLength;
            this.data = data;
        }

        public SignatureSubpacketTag SubpacketType
        {
			get { return type; }
        }

        public bool IsCritical()
        {
            return critical;
        }

        public bool IsLongLength()
        {
            return isLongLength;
        }

        /// <summary>Return the generic data making up the packet.</summary>
        public byte[] GetData()
        {
            return (byte[]) data.Clone();
        }

		public void Encode(
            Stream os)
        {
            int bodyLen = data.Length + 1;

            if (isLongLength)
            {
                os.WriteByte(0xff);
                os.WriteByte((byte)(bodyLen >> 24));
                os.WriteByte((byte)(bodyLen >> 16));
                os.WriteByte((byte)(bodyLen >> 8));
                os.WriteByte((byte)bodyLen);
            }
            else
            {
                if (bodyLen < 192)
                {
                    os.WriteByte((byte)bodyLen);
                }
                else if (bodyLen <= 8383)
                {
                    bodyLen -= 192;

                    os.WriteByte((byte)(((bodyLen >> 8) & 0xff) + 192));
                    os.WriteByte((byte)bodyLen);
                }
                else
                {
                    os.WriteByte(0xff);
                    os.WriteByte((byte)(bodyLen >> 24));
                    os.WriteByte((byte)(bodyLen >> 16));
                    os.WriteByte((byte)(bodyLen >> 8));
                    os.WriteByte((byte)bodyLen);
                }
            }

            if (critical)
            {
                os.WriteByte((byte)(0x80 | (int) type));
            }
            else
            {
                os.WriteByte((byte) type);
            }

            os.Write(data, 0, data.Length);
        }

        public override int GetHashCode()
        {
            return (critical ? 1 : 0) + 7 * (int)type + 49 * Arrays.GetHashCode(data);
        }

        public override bool Equals(object obj)
        {
            if (obj == this)
                return true;

            SignatureSubpacket other = obj as SignatureSubpacket;
            if (null == other)
                return false;

            return this.type == other.type
                && this.critical == other.critical
                && Arrays.AreEqual(this.data, other.data);
        }
    }
}
