using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Lms
{
    public class HSSKeyPairGenerator
    : IAsymmetricCipherKeyPairGenerator
    {
        HSSKeyGenerationParameters param;

        public void Init(KeyGenerationParameters param)
        {
            this.param = (HSSKeyGenerationParameters) param;
        }

        public AsymmetricCipherKeyPair GenerateKeyPair()
        {
            HSSPrivateKeyParameters privKey = HSS.GenerateHssKeyPair(param);

            return new AsymmetricCipherKeyPair(privKey.GetPublicKey(), privKey);
        }
    }
}