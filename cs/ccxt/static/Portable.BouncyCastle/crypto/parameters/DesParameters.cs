using System;

namespace Org.BouncyCastle.Crypto.Parameters
{
    public class DesParameters
		: KeyParameter
    {
        public DesParameters(
            byte[] key)
			: base(key)
        {
            if (IsWeakKey(key))
				throw new ArgumentException("attempt to create weak DES key");
        }

		public DesParameters(
			byte[]	key,
			int		keyOff,
			int		keyLen)
			: base(key, keyOff, keyLen)
		{
			if (IsWeakKey(key, keyOff))
				throw new ArgumentException("attempt to create weak DES key");
		}

		/*
        * DES Key Length in bytes.
        */
        public const int DesKeyLength = 8;

        /*
        * Table of weak and semi-weak keys taken from Schneier pp281
        */
        private const int N_DES_WEAK_KEYS = 16;

        private static readonly byte[] DES_weak_keys =
        {
            /* weak keys */
            (byte)0x01,(byte)0x01,(byte)0x01,(byte)0x01, (byte)0x01,(byte)0x01,(byte)0x01,(byte)0x01,
            (byte)0x1f,(byte)0x1f,(byte)0x1f,(byte)0x1f, (byte)0x0e,(byte)0x0e,(byte)0x0e,(byte)0x0e,
            (byte)0xe0,(byte)0xe0,(byte)0xe0,(byte)0xe0, (byte)0xf1,(byte)0xf1,(byte)0xf1,(byte)0xf1,
            (byte)0xfe,(byte)0xfe,(byte)0xfe,(byte)0xfe, (byte)0xfe,(byte)0xfe,(byte)0xfe,(byte)0xfe,

            /* semi-weak keys */
            (byte)0x01,(byte)0xfe,(byte)0x01,(byte)0xfe, (byte)0x01,(byte)0xfe,(byte)0x01,(byte)0xfe,
            (byte)0x1f,(byte)0xe0,(byte)0x1f,(byte)0xe0, (byte)0x0e,(byte)0xf1,(byte)0x0e,(byte)0xf1,
            (byte)0x01,(byte)0xe0,(byte)0x01,(byte)0xe0, (byte)0x01,(byte)0xf1,(byte)0x01,(byte)0xf1,
            (byte)0x1f,(byte)0xfe,(byte)0x1f,(byte)0xfe, (byte)0x0e,(byte)0xfe,(byte)0x0e,(byte)0xfe,
            (byte)0x01,(byte)0x1f,(byte)0x01,(byte)0x1f, (byte)0x01,(byte)0x0e,(byte)0x01,(byte)0x0e,
            (byte)0xe0,(byte)0xfe,(byte)0xe0,(byte)0xfe, (byte)0xf1,(byte)0xfe,(byte)0xf1,(byte)0xfe,
            (byte)0xfe,(byte)0x01,(byte)0xfe,(byte)0x01, (byte)0xfe,(byte)0x01,(byte)0xfe,(byte)0x01,
            (byte)0xe0,(byte)0x1f,(byte)0xe0,(byte)0x1f, (byte)0xf1,(byte)0x0e,(byte)0xf1,(byte)0x0e,
            (byte)0xe0,(byte)0x01,(byte)0xe0,(byte)0x01, (byte)0xf1,(byte)0x01,(byte)0xf1,(byte)0x01,
            (byte)0xfe,(byte)0x1f,(byte)0xfe,(byte)0x1f, (byte)0xfe,(byte)0x0e,(byte)0xfe,(byte)0x0e,
            (byte)0x1f,(byte)0x01,(byte)0x1f,(byte)0x01, (byte)0x0e,(byte)0x01,(byte)0x0e,(byte)0x01,
            (byte)0xfe,(byte)0xe0,(byte)0xfe,(byte)0xe0, (byte)0xfe,(byte)0xf1,(byte)0xfe,(byte)0xf1
        };

        /**
        * DES has 16 weak keys.  This method will check
        * if the given DES key material is weak or semi-weak.
        * Key material that is too short is regarded as weak.
        * <p>
        * See <a href="http://www.counterpane.com/applied.html">"Applied
        * Cryptography"</a> by Bruce Schneier for more information.
        * </p>
        * @return true if the given DES key material is weak or semi-weak,
        *     false otherwise.
        */
        public static bool IsWeakKey(
            byte[]	key,
            int		offset)
        {
            if (key.Length - offset < DesKeyLength)
                throw new ArgumentException("key material too short.");

			//nextkey:
            for (int i = 0; i < N_DES_WEAK_KEYS; i++)
            {
                bool unmatch = false;
                for (int j = 0; j < DesKeyLength; j++)
                {
                    if (key[j + offset] != DES_weak_keys[i * DesKeyLength + j])
                    {
                        //continue nextkey;
                        unmatch = true;
						break;
                    }
                }

				if (!unmatch)
				{
					return true;
				}
            }

			return false;
        }

		public static bool IsWeakKey(
			byte[] key)
		{
			return IsWeakKey(key, 0);
		}

        public static byte SetOddParity(byte b)
        {
            uint parity = b ^ 1U;
            parity ^= (parity >> 4);
            parity ^= (parity >> 2);
            parity ^= (parity >> 1);
            parity &= 1U;

            return (byte)(b ^ parity);
        }

        /**
        * DES Keys use the LSB as the odd parity bit.  This can
        * be used to check for corrupt keys.
        *
        * @param bytes the byte array to set the parity on.
        */
        public static void SetOddParity(byte[] bytes)
        {
            for (int i = 0; i < bytes.Length; i++)
            {
                bytes[i] = SetOddParity(bytes[i]);
            }
        }

        public static void SetOddParity(byte[] bytes, int off, int len)
        {
            for (int i = 0; i < len; i++)
            {
                bytes[off + i] = SetOddParity(bytes[off + i]);
            }
        }
    }
}
