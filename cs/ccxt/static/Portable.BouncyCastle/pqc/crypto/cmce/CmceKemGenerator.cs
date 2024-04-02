using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Pqc.Crypto.Utilities;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Cmce
{
    public class CmceKemGenerator
        : IEncapsulatedSecretGenerator
    {
        // the source of randomness
        private SecureRandom sr;

        public CmceKemGenerator(SecureRandom random)
        {
            this.sr = random;
        }

        public ISecretWithEncapsulation GenerateEncapsulated(AsymmetricKeyParameter recipientKey)
        {
            CmcePublicKeyParameters key = (CmcePublicKeyParameters)recipientKey;
            CmceEngine engine = key.Parameters.Engine;

            return GenerateEncapsulated(recipientKey, engine.DefaultSessionKeySize);
        }

        private ISecretWithEncapsulation GenerateEncapsulated(AsymmetricKeyParameter recipientKey, int sessionKeySizeInBits)
        {
            CmcePublicKeyParameters key = (CmcePublicKeyParameters)recipientKey;
            CmceEngine engine = key.Parameters.Engine;
            byte[] cipher_text = new byte[engine.CipherTextSize];
            byte[] sessionKey = new byte[sessionKeySizeInBits / 8];     // document as 32 - l/8  - Section 2.5.2
            engine.kem_enc(cipher_text, sessionKey, key.PublicKey, sr);
            return new SecretWithEncapsulationImpl(sessionKey, cipher_text);
        }
    }
}
