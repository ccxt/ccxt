
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Saber
{
    public class SABERKeyPairGenerator
        : IAsymmetricCipherKeyPairGenerator
    {
        private SABERKeyGenerationParameters saberParams;

        private int l;

        private SecureRandom random;

        private void Initialize(
            KeyGenerationParameters param)
        {
            this.saberParams = (SABERKeyGenerationParameters) param;
            this.random = param.Random;

            this.l = this.saberParams.GetParameters().L;
        }

        private AsymmetricCipherKeyPair GenKeyPair()
        {
            SABEREngine engine = saberParams.GetParameters().GetEngine();
            byte[] sk = new byte[engine.GetPrivateKeySize()];
            byte[] pk = new byte[engine.GetPublicKeySize()];
            engine.crypto_kem_keypair(pk, sk, random);

            SABERPublicKeyParameters pubKey = new SABERPublicKeyParameters(saberParams.GetParameters(), pk);
            SABERPrivateKeyParameters privKey = new SABERPrivateKeyParameters(saberParams.GetParameters(), sk);
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