using System;



namespace Org.BouncyCastle.Bcpg.Sig
{
    /**
    * packet giving the User ID of the signer.
    */
    public class SignerUserId
        : SignatureSubpacket
    {
        private static byte[] UserIdToBytes(
            string id)
        {
            byte[] idData = new byte[id.Length];

            for (int i = 0; i != id.Length; i++)
            {
                idData[i] = (byte)id[i];
            }

			return idData;
        }

        public SignerUserId(
            bool    critical,
            bool    isLongLength,
            byte[]  data)
            : base(SignatureSubpacketTag.SignerUserId, critical, isLongLength, data)
		{
		}

        public SignerUserId(
            bool    critical,
            string  userId)
            : base(SignatureSubpacketTag.SignerUserId, critical, false, UserIdToBytes(userId))
		{
        }

        public string GetId()
        {
            char[] chars = new char[data.Length];

			for (int i = 0; i != chars.Length; i++)
            {
                chars[i] = (char)(data[i] & 0xff);
            }

			return new string(chars);
        }
    }
}
