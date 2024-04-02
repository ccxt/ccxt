using System;



namespace Org.BouncyCastle.Bcpg.Sig
{
    /**
    * packet giving signature creation time.
    */
    public class IssuerKeyId
        : SignatureSubpacket
    {
        protected static byte[] KeyIdToBytes(
            long    keyId)
        {
            byte[]    data = new byte[8];

            data[0] = (byte)(keyId >> 56);
            data[1] = (byte)(keyId >> 48);
            data[2] = (byte)(keyId >> 40);
            data[3] = (byte)(keyId >> 32);
            data[4] = (byte)(keyId >> 24);
            data[5] = (byte)(keyId >> 16);
            data[6] = (byte)(keyId >> 8);
            data[7] = (byte)keyId;

            return data;
        }

        public IssuerKeyId(
            bool    critical,
            bool    isLongLength,
            byte[]  data)
            : base(SignatureSubpacketTag.IssuerKeyId, critical, isLongLength, data)
        {
        }

        public IssuerKeyId(
            bool    critical,
            long    keyId)
            : base(SignatureSubpacketTag.IssuerKeyId, critical, false, KeyIdToBytes(keyId))
        {
        }

        public long KeyId
        {
			get
			{
				long keyId = ((long)(data[0] & 0xff) << 56)
					| ((long)(data[1] & 0xff) << 48)
					| ((long)(data[2] & 0xff) << 40)
					| ((long)(data[3] & 0xff) << 32)
					| ((long)(data[4] & 0xff) << 24)
					| ((long)(data[5] & 0xff) << 16)
					| ((long)(data[6] & 0xff) << 8)
					| ((long)data[7] & 0xff);

				return keyId;
			}
        }
    }
}
