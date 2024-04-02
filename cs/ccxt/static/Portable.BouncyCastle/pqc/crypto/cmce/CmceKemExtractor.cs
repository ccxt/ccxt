using System;

using Org.BouncyCastle.Crypto;

namespace Org.BouncyCastle.Pqc.Crypto.Cmce
{
    public class CmceKemExtractor
        : IEncapsulatedSecretExtractor
    {
        private CmceEngine engine;

        private CmceKeyParameters key;

        public CmceKemExtractor(CmcePrivateKeyParameters privParams)
        {
            this.key = privParams;
            InitCipher(key.Parameters);
        }

        private void InitCipher(CmceParameters param)
        {
            engine = param.Engine;
            CmcePrivateKeyParameters privateParams = (CmcePrivateKeyParameters)key;
            if (privateParams.PrivateKey.Length < engine.PrivateKeySize)
            {
                key = new CmcePrivateKeyParameters(privateParams.Parameters, engine.decompress_private_key(privateParams.PrivateKey));
            }
        }

        public byte[] ExtractSecret(byte[] encapsulation)
        {
            return ExtractSecret(encapsulation, engine.DefaultSessionKeySize);
        }

        private byte[] ExtractSecret(byte[] encapsulation, int sessionKeySizeInBits)
        {
            byte[] session_key = new byte[sessionKeySizeInBits / 8];
            engine.kem_dec(session_key, encapsulation, ((CmcePrivateKeyParameters)key).PrivateKey);
            return session_key;
        }

        public int EncapsulationLength => engine.CipherTextSize;
    }
}
