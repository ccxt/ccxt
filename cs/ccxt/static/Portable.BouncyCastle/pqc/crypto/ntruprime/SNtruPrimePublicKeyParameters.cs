using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.NtruPrime
{
    public class SNtruPrimePublicKeyParameters : SNtruPrimeKeyParameters
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

        public SNtruPrimePublicKeyParameters(SNtruPrimeParameters primeParameters, byte[] pubKey) : base(false,primeParameters)
        {
            this.pubKey = Arrays.Clone(pubKey);
        }
    }
}
