using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Falcon
{
    public class FalconKeyPairGenerator
        : IAsymmetricCipherKeyPairGenerator
    {
        private FalconKeyGenerationParameters parameters;
        private SecureRandom random;
        private FalconNIST nist;
        private uint logn;
        private uint noncelen;

        private int pk_size;
        private int sk_size;

        public void Init(KeyGenerationParameters param)
        {
            this.parameters = (FalconKeyGenerationParameters)param;
            this.random = param.Random;
            this.logn = ((FalconKeyGenerationParameters)param).Parameters.LogN;
            this.noncelen = ((FalconKeyGenerationParameters)param).Parameters.NonceLength;
            this.nist = new FalconNIST(random, logn, noncelen);
            int n = 1 << (int)this.logn;
            int sk_coeff_size = 8;
            if (n == 1024)
            {
                sk_coeff_size = 5;
            }
            else if (n == 256 || n == 512)
            {
                sk_coeff_size = 6;
            }
            else if (n == 64 || n == 128)
            {
                sk_coeff_size = 7;
            }
            this.pk_size = 1 + (14 * n / 8);
            this.sk_size = 1 + (2 * sk_coeff_size * n / 8) + (n);
        }

        public AsymmetricCipherKeyPair GenerateKeyPair()
        {
            byte[] pk, sk;
            pk = new byte[pk_size];
            sk = new byte[sk_size];
            nist.crypto_sign_keypair(pk, 0, sk, 0);
            FalconParameters p = ((FalconKeyGenerationParameters)this.parameters).Parameters;
            FalconPrivateKeyParameters privk = new FalconPrivateKeyParameters(p, sk);
            FalconPublicKeyParameters pubk = new FalconPublicKeyParameters(p, pk);
            return new AsymmetricCipherKeyPair(pubk, privk);
        }
    }
}
