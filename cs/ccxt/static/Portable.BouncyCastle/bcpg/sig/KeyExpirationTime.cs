using System;

namespace Org.BouncyCastle.Bcpg.Sig
{
    /**
    * packet giving time after creation at which the key expires.
    */
    public class KeyExpirationTime
        : SignatureSubpacket
    {
        protected static byte[] TimeToBytes(
            long    t)
        {
            byte[]    data = new byte[4];

            data[0] = (byte)(t >> 24);
            data[1] = (byte)(t >> 16);
            data[2] = (byte)(t >> 8);
            data[3] = (byte)t;

            return data;
        }

        public KeyExpirationTime(
            bool    critical,
            bool    isLongLength,
            byte[]  data)
            : base(SignatureSubpacketTag.KeyExpireTime, critical, isLongLength, data)
        {
        }

        public KeyExpirationTime(
            bool    critical,
            long    seconds)
            : base(SignatureSubpacketTag.KeyExpireTime, critical, false, TimeToBytes(seconds))
        {
        }

        /**
        * Return the number of seconds after creation time a key is valid for.
        *
        * @return second count for key validity.
        */
        public long Time
        {
			get
			{
				long time = ((long)(data[0] & 0xff) << 24) | ((long)(data[1] & 0xff) << 16)
					| ((long)(data[2] & 0xff) << 8) | ((long)data[3] & 0xff);

				return time;
			}
        }
    }
}
