
using System;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Pqc.Crypto.Utilities;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Saber
{
    public class SABERKEMGenerator
        : IEncapsulatedSecretGenerator
    {
        // the source of randomness
        private SecureRandom sr;

        public SABERKEMGenerator(SecureRandom random)
        {
            this.sr = random;
        }

        public ISecretWithEncapsulation GenerateEncapsulated(AsymmetricKeyParameter recipientKey)
        {
            SABERPublicKeyParameters key = (SABERPublicKeyParameters) recipientKey;
            SABEREngine engine = key.GetParameters().GetEngine();
            byte[] cipher_text = new byte[engine.GetCipherTextSize()];
            byte[] sessionKey = new byte[engine.GetSessionKeySize()];
            engine.crypto_kem_enc(cipher_text, sessionKey, key.PublicKey, sr);
            return new SecretWithEncapsulationImpl(sessionKey, cipher_text);
        }
        
    }
}