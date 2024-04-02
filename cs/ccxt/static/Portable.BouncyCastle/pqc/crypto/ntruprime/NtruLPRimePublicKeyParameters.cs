using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.NtruPrime
{
    public class NtruLPRimePublicKeyParameters : NtruLPRimeKeyParameters
    {
        internal byte[] pubKey;

        public byte[] GetPublicKey()
        {
            return Arrays.Clone(pubKey);
        }

        public byte[] GetEncoded()
        {
            return GetPublicKey();
        }

        public NtruLPRimePublicKeyParameters(NtruLPRimeParameters primeParameters, byte[] pubKey) : base(false,primeParameters)
        {
            this.pubKey = Arrays.Clone(pubKey);
        }
    }
}
