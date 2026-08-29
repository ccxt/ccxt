using System;

using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Crypto.Parameters
{
    public class KeyParameter
		: ICipherParameters
    {
        private readonly byte[] key;

		public KeyParameter(
			byte[] key)
		{
			if (key == null)
				throw new ArgumentNullException("key");

			this.key = (byte[]) key.Clone();
		}

		public KeyParameter(
            byte[]	key,
            int		keyOff,
            int		keyLen)
        {
			if (key == null)
				throw new ArgumentNullException("key");
			if (keyOff < 0 || keyOff > key.Length)
				throw new ArgumentOutOfRangeException("keyOff");
            if (keyLen < 0 || keyLen > (key.Length - keyOff))
				throw new ArgumentOutOfRangeException("keyLen");

			this.key = new byte[keyLen];
            Array.Copy(key, keyOff, this.key, 0, keyLen);
        }

		public byte[] GetKey()
        {
			return (byte[]) key.Clone();
        }
    }

}
