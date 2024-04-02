using Org.BouncyCastle.Utilities;


namespace Org.BouncyCastle.Pqc.Crypto.Falcon
{
    public class FalconPrivateKeyParameters
        : FalconKeyParameters
    {
        private byte[] privateKey;

        public FalconPrivateKeyParameters(FalconParameters parameters, byte[] sk_encoded)
            : base(true, parameters)
        {
            this.privateKey = Arrays.Clone(sk_encoded);
        }

        public byte[] GetEncoded()
        {
            return Arrays.Clone(privateKey);
        }
    }
}
