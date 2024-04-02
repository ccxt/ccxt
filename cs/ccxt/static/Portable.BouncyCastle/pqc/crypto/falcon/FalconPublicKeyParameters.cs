using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Falcon
{
    public class FalconPublicKeyParameters
        : FalconKeyParameters
    {
        private byte[] publicKey;

        public FalconPublicKeyParameters(FalconParameters parameters, byte[] pk_encoded)
            : base(false, parameters)
        {
            this.publicKey = Arrays.Clone(pk_encoded);
        }

        public byte[] GetEncoded()
        {
            return Arrays.Clone(publicKey);
        }
    }
}
