using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    public class SPHINCSPlusKeyGenerationParameters
        : KeyGenerationParameters
    {
        private SPHINCSPlusParameters parameters;

        public SPHINCSPlusKeyGenerationParameters(SecureRandom random, SPHINCSPlusParameters parameters)
            : base(random, 256)
        {
            this.parameters = parameters;
        }

        internal SPHINCSPlusParameters Parameters => parameters;
    }
}