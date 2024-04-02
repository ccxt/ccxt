using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class LMSKeyPairGenerator
        : IAsymmetricCipherKeyPairGenerator
    {
        private LMSKeyGenerationParameters param;

        public void Init(KeyGenerationParameters param)
        {
            this.param = (LMSKeyGenerationParameters) param;
        }

        public AsymmetricCipherKeyPair GenerateKeyPair()
        {
            SecureRandom source = param.Random;

            byte[] I = new byte[16];
            source.NextBytes(I);

            byte[] rootSecret = new byte[32];
            source.NextBytes(rootSecret);

            LMSPrivateKeyParameters privKey = LMS.GenerateKeys(param.GetParameters().GetLmSigParam(),
                param.GetParameters().GetLmotsParam(), 0, I, rootSecret);

            return new AsymmetricCipherKeyPair(privKey.GetPublicKey(), privKey);
        }
    }
    
}