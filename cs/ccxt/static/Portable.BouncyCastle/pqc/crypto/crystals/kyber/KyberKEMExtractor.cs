
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Kyber
{
    public class KyberKEMExtractor
        : IEncapsulatedSecretExtractor
    {
        private KyberEngine engine;

        private KyberKeyParameters key;

        public KyberKEMExtractor(KyberKeyParameters privParams)
        {
            this.key = privParams;
            InitCipher(key.Parameters);
        }

        private void InitCipher(KyberParameters param)
        {
            engine = param.GetEngine();
        }

        public byte[] ExtractSecret(byte[] encapsulation)
        {
            byte[] sessionKey = new byte[engine.CryptoBytes];
            engine.KemDecrypt(sessionKey, encapsulation, ((KyberPrivateKeyParameters) key).privateKey);
            byte[] rv = Arrays.CopyOfRange(sessionKey, 0, key.Parameters.DefaultKeySize / 8);
            Arrays.Clear(sessionKey);
            return rv;
        }

        public int EncapsulationLength => engine.CryptoCipherTextBytes;
    }
}