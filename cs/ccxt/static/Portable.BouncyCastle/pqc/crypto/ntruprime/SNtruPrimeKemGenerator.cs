using System;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Pqc.Crypto.NtruPrime
{
    public class SNtruPrimeKemGenerator : IEncapsulatedSecretGenerator
    {
        private SecureRandom sr;
        
        public SNtruPrimeKemGenerator(SecureRandom sr)
        {
            this.sr = sr;
        }

        public ISecretWithEncapsulation GenerateEncapsulated(AsymmetricKeyParameter recipientKey)
        {
            SNtruPrimePublicKeyParameters key = (SNtruPrimePublicKeyParameters)recipientKey;
            NtruPrimeEngine primeEngine = key.Parameters.PrimeEngine;
            byte[] cipherText = new byte[primeEngine.CipherTextSize];
            byte[] sessionKey = new byte[primeEngine.SessionKeySize];
            primeEngine.kem_enc(cipherText, sessionKey,key.pubKey, sr);
            return new NtruLPRimeKemGenerator.SecretWithEncapsulationImpl(sessionKey, cipherText);
        }

        public class SecretWithEncapsulationImpl : ISecretWithEncapsulation
        {
            private volatile bool hasBeenDestroyed = false;
            
            private byte[] sessionKey;
            private byte[] cipherText;
            
            public SecretWithEncapsulationImpl(byte[] sessionKey, byte[] cipherText)
            {
                this.sessionKey = sessionKey;
                this.cipherText = cipherText;
            }

            public byte[] GetSecret()
            {
                CheckDestroyed();
                return Arrays.Clone(sessionKey);
            }

            public byte[] GetEncapsulation()
            {
                return Arrays.Clone(cipherText);
            }

            public void Dispose()
            {
                if (!hasBeenDestroyed)
                {
                    hasBeenDestroyed = true;
                    Arrays.Clear(sessionKey);
                    Arrays.Clear(cipherText);
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
                    throw new Exception("data has been destroyed");
                }
            }
            
        }
        
    }
}
