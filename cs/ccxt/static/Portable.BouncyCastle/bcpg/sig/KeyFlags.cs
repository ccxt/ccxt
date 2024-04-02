using System;

using Org.BouncyCastle.Math;

namespace Org.BouncyCastle.Bcpg.Sig
{
    /**
    * Packet holding the key flag values.
    */
    public class KeyFlags
        : SignatureSubpacket
    {
		public const int CertifyOther	= 0x01;
		public const int SignData		= 0x02;
		public const int EncryptComms	= 0x04;
		public const int EncryptStorage	= 0x08;
		public const int Split			= 0x10;
		public const int Authentication	= 0x20;
		public const int Shared			= 0x80;

        private static byte[] IntToByteArray(
            int v)
        {
			byte[] tmp = new byte[4];
			int size = 0;

			for (int i = 0; i != 4; i++)
			{
				tmp[i] = (byte)(v >> (i * 8));
				if (tmp[i] != 0)
				{
					size = i;
				}
			}

			byte[] data = new byte[size + 1];
			Array.Copy(tmp, 0, data, 0, data.Length);
			return data;
		}

		public KeyFlags(
            bool	critical,
            bool    isLongLength,
            byte[]  data)
            : base(SignatureSubpacketTag.KeyFlags, critical, isLongLength, data)
        {
        }

		public KeyFlags(
			bool    critical,
			int     flags)
            : base(SignatureSubpacketTag.KeyFlags, critical, false, IntToByteArray(flags))
        {
        }

		/// <summary>
		/// Return the flag values contained in the first 4 octets (note: at the moment
		/// the standard only uses the first one).
		/// </summary>
		public int Flags
        {
			get
			{
				int flags = 0;

				for (int i = 0; i != data.Length; i++)
				{
					flags |= (data[i] & 0xff) << (i * 8);
				}

				return flags;
			}
        }
    }
}
