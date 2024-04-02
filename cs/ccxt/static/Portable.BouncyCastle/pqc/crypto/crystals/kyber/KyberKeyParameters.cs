
using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Kyber
{
    public class KyberKeyParameters
        : AsymmetricKeyParameter
    {
        private KyberParameters parameters;

        public KyberKeyParameters(
            bool isPrivate,
            KyberParameters parameters)
            : base(isPrivate)
        {
            this.parameters = parameters;
        }

        public KyberParameters Parameters => parameters;
    }
}