using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Kyber
{
    public class KyberPublicKeyParameters
        : KyberKeyParameters
    {
        internal byte[] publicKey;

        public byte[] GetEncoded()
        {
            return Arrays.Clone(publicKey);
        }

        public KyberPublicKeyParameters(KyberParameters parameters, byte[] publicKey)
            : base(false, parameters)
        {
            this.publicKey = Arrays.Clone(publicKey);
        }
    }
}