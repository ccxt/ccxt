using System;

namespace Org.BouncyCastle.Bcpg.Sig
{
    /**
    * packet giving trust.
    */
    public class TrustSignature
        : SignatureSubpacket
    {
        private static byte[] IntToByteArray(
            int	v1,
            int	v2)
        {
			return new byte[]{ (byte)v1, (byte)v2 };
        }

		public TrustSignature(
            bool    critical,
            bool    isLongLength,
            byte[]  data)
            : base(SignatureSubpacketTag.TrustSig, critical, isLongLength, data)
        {
        }

        public TrustSignature(
            bool    critical,
            int     depth,
            int     trustAmount)
            : base(SignatureSubpacketTag.TrustSig, critical, false, IntToByteArray(depth, trustAmount))
        {
        }

        public int Depth
        {
			get { return data[0] & 0xff; }
        }

        public int TrustAmount
        {
			get { return data[1] & 0xff; }
        }
    }
}
