using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Picnic
{
    public class PicnicKeyGenerationParameters
     : KeyGenerationParameters
    {
        private PicnicParameters parameters;

        public PicnicKeyGenerationParameters(SecureRandom random, PicnicParameters parameters)
            : base(random, 255)
        {
            this.parameters = parameters;
        }

        public PicnicParameters GetParameters()
        {
            return parameters;
        }
    }
}