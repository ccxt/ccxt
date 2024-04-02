
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Saber
{
    public class SABERKeyGenerationParameters
        : KeyGenerationParameters
    {
        private SABERParameters parameters;

        public SABERKeyGenerationParameters(
            SecureRandom random,
            SABERParameters saberParameters)
            : base(random, 256)
        {
            this.parameters = saberParameters;
        }

        public SABERParameters GetParameters()
        {
            return parameters;
        }
    }
}