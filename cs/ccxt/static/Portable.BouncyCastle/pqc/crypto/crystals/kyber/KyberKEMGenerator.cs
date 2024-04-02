
using System;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.Crystals.Kyber
{
    public class KyberKEMGenerator
        : IEncapsulatedSecretGenerator
    {
        // the source of randomness
        private SecureRandom sr;

        public KyberKEMGenerator(SecureRandom random)
        {
            this.sr = random;
        }

        public ISecretWithEncapsulation GenerateEncapsulated(AsymmetricKeyParameter recipientKey)
        {
            KyberPublicKeyParameters key = (KyberPublicKeyParameters) recipientKey;
            KyberEngine engine = key.Parameters.GetEngine();
            engine.Init(sr);
            byte[] CipherText = new byte[engine.CryptoCipherTextBytes];
            byte[] SessionKey = new byte[engine.CryptoBytes];
            engine.KemEncrypt(CipherText, SessionKey, key.publicKey);
            byte[] rv = Arrays.CopyOfRange(SessionKey, 0, key.Parameters.DefaultKeySize / 8);
            Arrays.Clear(SessionKey);
            return new SecretWithEncapsulationImpl(rv, CipherText);
        }

        private class SecretWithEncapsulationImpl
            : ISecretWithEncapsulation
        {
            private volatile bool hasBeenDestroyed = false;

            private byte[] SessionKey;
            private byte[] CipherText;

            public SecretWithEncapsulationImpl(byte[] sessionKey, byte[] cipher_text)
            {
                this.SessionKey = sessionKey;
                this.CipherText = cipher_text;
            }

            public byte[] GetSecret()
            {
                CheckDestroyed();

                return Arrays.Clone(SessionKey);
            }

            public byte[] GetEncapsulation()
            {
                CheckDestroyed();

                return Arrays.Clone(CipherText);
            }

            public void Dispose()
            {
                if (!hasBeenDestroyed)
                {
                    hasBeenDestroyed = true;
                    Arrays.Clear(SessionKey);
                    Arrays.Clear(CipherText);
                }
            }

            public bool IsDestroyed()
            {
                return hasBeenDestroyed;
            }

            void CheckDestroyed()
            {
                if (IsDestroyed())
                {
                    throw new ArgumentException("data has been destroyed");
                }
            }
        }
    }
}