
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Frodo
{
    public class FrodoKeyGenerationParameters
        : KeyGenerationParameters
    {
        private FrodoParameters parameters;

        public FrodoKeyGenerationParameters(
            SecureRandom random,
            FrodoParameters frodoParameters)
            : base(random, 256)
        {
            this.parameters = frodoParameters;
        }

        public FrodoParameters Parameters => parameters;
    }
}