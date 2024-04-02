using System;

namespace Org.BouncyCastle.Bcpg.Sig
{
    /**
    * packet giving signature expiration time.
    */
    public class SignatureExpirationTime
        : SignatureSubpacket
    {
        protected static byte[] TimeToBytes(
            long    t)
        {
            byte[] data = new byte[4];
            data[0] = (byte)(t >> 24);
            data[1] = (byte)(t >> 16);
            data[2] = (byte)(t >> 8);
            data[3] = (byte)t;
            return data;
        }

        public SignatureExpirationTime(
            bool    critical,
            bool    isLongLength,
            byte[]  data)
            : base(SignatureSubpacketTag.ExpireTime, critical, isLongLength, data)
        {
        }

        public SignatureExpirationTime(
            bool    critical,
            long    seconds)
            : base(SignatureSubpacketTag.ExpireTime, critical, false, TimeToBytes(seconds))
        {
        }

        /**
        * return time in seconds before signature expires after creation time.
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
