
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Pqc.Crypto.Crystals.Kyber;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Kyber
{
    public class KyberKeyPairGenerator
        : IAsymmetricCipherKeyPairGenerator
    {
        private KyberKeyGenerationParameters KyberParams;

        private int k;

        private SecureRandom random;

        private void Initialize(
            KeyGenerationParameters param)
        {
            this.KyberParams = (KyberKeyGenerationParameters) param;
            this.random = param.Random;

            this.k = this.KyberParams.Parameters.K;
        }

        private AsymmetricCipherKeyPair GenKeyPair()
        {
            KyberEngine engine = KyberParams.Parameters.GetEngine();
            engine.Init(random);
            byte[] sk = new byte[engine.CryptoSecretKeyBytes];
            byte[] pk = new byte[engine.CryptoPublicKeyBytes];
            engine.GenerateKemKeyPair(pk, sk);

            KyberPublicKeyParameters pubKey = new KyberPublicKeyParameters(KyberParams.Parameters, pk);
            KyberPrivateKeyParameters privKey = new KyberPrivateKeyParameters(KyberParams.Parameters, sk);
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