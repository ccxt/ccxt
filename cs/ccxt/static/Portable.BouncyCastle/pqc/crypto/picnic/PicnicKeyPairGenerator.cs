
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Picnic
{
    public class PicnicKeyPairGenerator
        : IAsymmetricCipherKeyPairGenerator

    {
        private SecureRandom random;
        private PicnicParameters parameters;

        public void Init(KeyGenerationParameters param)
        {
            random = param.Random;
            parameters = ((PicnicKeyGenerationParameters) param).GetParameters();
        }

        public AsymmetricCipherKeyPair GenerateKeyPair()
        {
            PicnicEngine engine = parameters.GetEngine();
            byte[] sk = new byte[engine.GetSecretKeySize()];
            byte[] pk = new byte[engine.GetPublicKeySize()];
            engine.crypto_sign_keypair(pk, sk, random);

            PicnicPublicKeyParameters pubKey = new PicnicPublicKeyParameters(parameters, pk);
            PicnicPrivateKeyParameters privKey = new PicnicPrivateKeyParameters(parameters, sk);


            return new AsymmetricCipherKeyPair(pubKey, privKey);
        }
    }
}