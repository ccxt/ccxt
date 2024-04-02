
using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Saber
{
    public class SABERKEMExtractor
        : IEncapsulatedSecretExtractor
    {
        private SABEREngine engine;

        private SABERKeyParameters key;

        public SABERKEMExtractor(SABERKeyParameters privParams)
        {
            this.key = privParams;
            InitCipher(key.GetParameters());
        }

        private void InitCipher(SABERParameters param)
        {
            engine = param.GetEngine();
        }

        public byte[] ExtractSecret(byte[] encapsulation)
        {
            byte[] session_key = new byte[engine.GetSessionKeySize()];
            engine.crypto_kem_dec(session_key, encapsulation, ((SABERPrivateKeyParameters) key).GetPrivateKey());
            return session_key;
        }

        public int EncapsulationLength => engine.GetCipherTextSize();
    }
}