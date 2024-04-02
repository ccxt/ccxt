

using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Frodo
{
    public class FrodoPrivateKeyParameters
        : FrodoKeyParameters
    {
        private byte[] privateKey;

        public byte[] PrivateKey => Arrays.Clone(privateKey);

        public FrodoPrivateKeyParameters(FrodoParameters parameters, byte[] privateKey)
            : base(true, parameters)
        {
            this.privateKey = Arrays.Clone(privateKey);
        }

        public byte[] GetEncoded()
        {
            return Arrays.Clone(privateKey);
        }
    }
}