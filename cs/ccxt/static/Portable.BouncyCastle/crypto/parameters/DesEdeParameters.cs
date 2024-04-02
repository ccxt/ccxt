using System;

namespace Org.BouncyCastle.Crypto.Parameters
{
    public class DesEdeParameters
		: DesParameters
    {
        /*
        * DES-EDE Key length in bytes.
        */
		public const int DesEdeKeyLength = 24;

		private static byte[] FixKey(
			byte[]	key,
			int		keyOff,
			int		keyLen)
		{
			byte[] tmp = new byte[24];

			switch (keyLen)
			{
				case 16:
					Array.Copy(key, keyOff, tmp, 0, 16);
					Array.Copy(key, keyOff, tmp, 16, 8);
					break;
				case 24:
					Array.Copy(key, keyOff, tmp, 0, 24);
					break;
				default:
					throw new ArgumentException("Bad length for DESede key: " + keyLen, "keyLen");
			}

			if (IsWeakKey(tmp))
				throw new ArgumentException("attempt to create weak DESede key");

			return tmp;
		}

		public DesEdeParameters(
            byte[] key)
			: base(FixKey(key, 0, key.Length))
        {
        }

		public DesEdeParameters(
			byte[]	key,
			int		keyOff,
			int		keyLen)
			: base(FixKey(key, keyOff, keyLen))
		{
		}

		/**
         * return true if the passed in key is a DES-EDE weak key.
         *
         * @param key bytes making up the key
         * @param offset offset into the byte array the key starts at
         * @param length number of bytes making up the key
         */
        public static bool IsWeakKey(
            byte[]  key,
            int     offset,
            int     length)
        {
            for (int i = offset; i < length; i += DesKeyLength)
            {
                if (DesParameters.IsWeakKey(key, i))
                {
                    return true;
                }
            }

            return false;
        }

        /**
         * return true if the passed in key is a DES-EDE weak key.
         *
         * @param key bytes making up the key
         * @param offset offset into the byte array the key starts at
         */
        public static new bool IsWeakKey(
            byte[]	key,
            int		offset)
        {
            return IsWeakKey(key, offset, key.Length - offset);
        }

		public static new bool IsWeakKey(
			byte[] key)
		{
			return IsWeakKey(key, 0, key.Length);
		}

        /**
         * return true if the passed in key is a real 2/3 part DES-EDE key.
         *
         * @param key bytes making up the key
         * @param offset offset into the byte array the key starts at
         */
        public static bool IsRealEdeKey(byte[] key, int offset)
        {
            return key.Length == 16 ? IsReal2Key(key, offset) : IsReal3Key(key, offset);
        }

        /**
         * return true if the passed in key is a real 2 part DES-EDE key.
         *
         * @param key bytes making up the key
         * @param offset offset into the byte array the key starts at
         */
        public static bool IsReal2Key(byte[] key, int offset)
        {
            bool isValid = false;
            for (int i = offset; i != offset + 8; i++)
            {
                isValid |= (key[i] != key[i + 8]);
            }
            return isValid;
        }

        /**
         * return true if the passed in key is a real 3 part DES-EDE key.
         *
         * @param key bytes making up the key
         * @param offset offset into the byte array the key starts at
         */
        public static bool IsReal3Key(byte[] key, int offset)
        {
            bool diff12 = false, diff13 = false, diff23 = false;
            for (int i = offset; i != offset + 8; i++)
            {
                diff12 |= (key[i] != key[i + 8]);
                diff13 |= (key[i] != key[i + 16]);
                diff23 |= (key[i + 8] != key[i + 16]);
            }
            return diff12 && diff13 && diff23;
        }
    }
}
