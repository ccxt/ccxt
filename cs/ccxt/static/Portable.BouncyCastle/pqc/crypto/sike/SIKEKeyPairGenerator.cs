using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Sike
{
    public class SIKEKeyPairGenerator
        : IAsymmetricCipherKeyPairGenerator
    {
        private SIKEKeyGenerationParameters sikeParams;

        private SecureRandom random;

        private void Initialize(KeyGenerationParameters param)
        {
            this.sikeParams = (SIKEKeyGenerationParameters) param;
            this.random = param.Random;
        }

        private AsymmetricCipherKeyPair GenKeyPair()
        {
            SIKEEngine engine = sikeParams.GetParameters().GetEngine();
            byte[] sk = new byte[engine.GetPrivateKeySize()];
            byte[] pk = new byte[engine.GetPublicKeySize()];

            engine.crypto_kem_keypair(pk, sk, random);


            SIKEPublicKeyParameters pubKey = new SIKEPublicKeyParameters(sikeParams.GetParameters(), pk);
            SIKEPrivateKeyParameters privKey = new SIKEPrivateKeyParameters(sikeParams.GetParameters(), sk);
            return new AsymmetricCipherKeyPair(pubKey, privKey);
        }

        public void Init(KeyGenerationParameters param)
        {
            this.Initialize(param);
        }

        public AsymmetricCipherKeyPair GenerateKeyPair()
        {
            return GenKeyPair();
        }
    }

}