
using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Frodo
{
    
    public class FrodoKEMExtractor
            : IEncapsulatedSecretExtractor
    {
        private FrodoEngine engine;

        private FrodoKeyParameters key;

        public FrodoKEMExtractor(FrodoKeyParameters privParams)
        {
            this.key = privParams;
            InitCipher(key.Parameters);
        }

        private void InitCipher(FrodoParameters param)
        {
            engine = param.Engine;
        }

        public byte[] ExtractSecret(byte[] encapsulation)
        {
            byte[] session_key = new byte[engine.SessionKeySize];
            engine.kem_dec(session_key, encapsulation, ((FrodoPrivateKeyParameters)key).PrivateKey);
            return session_key;
        }

        public int EncapsulationLength => (int)engine.CipherTextSize;
    }
}