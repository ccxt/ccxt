
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Kyber
{
    public class KyberKeyGenerationParameters
        : KeyGenerationParameters
    {
        private KyberParameters parameters;

        public KyberKeyGenerationParameters(
            SecureRandom random,
            KyberParameters KyberParameters)
            : base(random, 256)
        {
            this.parameters = KyberParameters;
        }

        public KyberParameters Parameters => parameters;
    }
}