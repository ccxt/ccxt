using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Pqc.Crypto.Cmce
{
    public class CmceKeyPairGenerator
        : IAsymmetricCipherKeyPairGenerator
    {
        private CmceKeyGenerationParameters CmceParams;

        private int m;

        private int n;

        private int t;

        private SecureRandom random;

        private void Initialize(
            KeyGenerationParameters param)
        {
            this.CmceParams = (CmceKeyGenerationParameters) param;
            this.random = param.Random;

            this.m = this.CmceParams.Parameters.M;
            this.n = this.CmceParams.Parameters.N;
            this.t = this.CmceParams.Parameters.T;
        }

        private AsymmetricCipherKeyPair GenKeyPair()
        {
            CmceEngine engine = CmceParams.Parameters.Engine;
            byte[] sk = new byte[engine.PrivateKeySize];
            byte[] pk = new byte[engine.PublicKeySize];
            engine.kem_keypair(pk, sk, random);

            CmcePublicKeyParameters pubKey = new CmcePublicKeyParameters(CmceParams.Parameters, pk);
            CmcePrivateKeyParameters privKey = new CmcePrivateKeyParameters(CmceParams.Parameters, sk);
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
