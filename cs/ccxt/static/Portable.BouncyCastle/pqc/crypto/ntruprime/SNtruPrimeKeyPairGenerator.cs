using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.NtruPrime
{
    public class SNtruPrimeKeyPairGenerator
    {
        private SNtruPrimeKeyGenerationParameters _ntruPrimeParams;

        private int p;
        private int q;

        private SecureRandom random;

        private void Initialize(KeyGenerationParameters param)
        {
            _ntruPrimeParams = (SNtruPrimeKeyGenerationParameters) param;
            random = param.Random;

            // n = ntruParams.Parameters.N;

            p = _ntruPrimeParams.Parameters.P;
            q = _ntruPrimeParams.Parameters.Q;

        }

        private AsymmetricCipherKeyPair GenKeyPair()
        {
            NtruPrimeEngine primeEngine = _ntruPrimeParams.Parameters.PrimeEngine;
            byte[] sk = new byte[primeEngine.PrivateKeySize];
            byte[] pk = new byte[primeEngine.PublicKeySize];
            primeEngine.kem_keypair( pk,sk,random);

            SNtruPrimePublicKeyParameters pubKey = new SNtruPrimePublicKeyParameters(_ntruPrimeParams.Parameters, pk);
            SNtruPrimePrivateKeyParameters privKey = new SNtruPrimePrivateKeyParameters(_ntruPrimeParams.Parameters, sk);
            return new AsymmetricCipherKeyPair(pubKey, privKey);
        }
        
        public void Init(KeyGenerationParameters param)
        {
            this.Initialize(param);
        }
        
        public AsymmetricCipherKeyPair GenerateKeyPair()
        {
            return GenKeyPair();
        }
    }
}
