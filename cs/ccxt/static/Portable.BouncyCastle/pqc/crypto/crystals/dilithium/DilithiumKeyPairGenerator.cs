
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Dilithium
{
    public class DilithiumKeyPairGenerator
        : IAsymmetricCipherKeyPairGenerator

    {
        private SecureRandom random;
        private DilithiumParameters parameters;

        public void Init(KeyGenerationParameters param)
        {
            random = param.Random;
            parameters = ((DilithiumKeyGenerationParameters)param).Parameters;
        }

        public AsymmetricCipherKeyPair GenerateKeyPair()
        {
            DilithiumEngine engine = parameters.GetEngine(random);
            byte[] sk = new byte[engine.CryptoSecretKeyBytes];
            byte[] pk = new byte[engine.CryptoPublicKeyBytes];
            engine.GenerateKeyPair(pk, sk);

            DilithiumPublicKeyParameters pubKey = new DilithiumPublicKeyParameters(parameters, pk);
            DilithiumPrivateKeyParameters privKey = new DilithiumPrivateKeyParameters(parameters, sk);


            return new AsymmetricCipherKeyPair(pubKey, privKey);
        }
    }
}
