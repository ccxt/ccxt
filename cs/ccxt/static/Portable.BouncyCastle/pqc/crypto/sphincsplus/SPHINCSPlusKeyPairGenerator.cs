
using System;
using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;
using static Org.BouncyCastle.Pqc.Crypto.SphincsPlus.SPHINCSPlusEngine;

namespace Org.BouncyCastle.Pqc.Crypto.SphincsPlus
{
    public class SPHINCSPlusKeyPairGenerator
        : IAsymmetricCipherKeyPairGenerator
    {
        private SecureRandom random;
        private SPHINCSPlusParameters parameters;

        public void Init(KeyGenerationParameters param)
        {
            random = param.Random;
            parameters = ((SPHINCSPlusKeyGenerationParameters)param).Parameters;
        }

        public AsymmetricCipherKeyPair GenerateKeyPair()
        {
            SPHINCSPlusEngine engine = parameters.GetEngine();
            byte[] pkSeed;
            SK sk;

            if (engine is SPHINCSPlusEngine.HarakaSEngine)
            {
                // required to pass kat tests
                byte[] tmparray = SecRand(engine.N * 3);
                byte[] skseed = new byte[engine.N];
                byte[] skprf = new byte[engine.N];
                pkSeed = new byte[engine.N];
                Array.Copy(tmparray, 0, skseed, 0, engine.N);
                Array.Copy(tmparray, engine.N, skprf, 0, engine.N);
                Array.Copy(tmparray, engine.N << 1, pkSeed, 0, engine.N);
                sk = new SK(skseed, skprf);
            }
            else
            {
                sk = new SK(SecRand(engine.N), SecRand(engine.N));
                pkSeed = SecRand(engine.N);
            }
            engine.Init(pkSeed);
            // TODO
            PK pk = new PK(pkSeed, new HT(engine, sk.seed, pkSeed).HTPubKey);

            return new AsymmetricCipherKeyPair(new SPHINCSPlusPublicKeyParameters(parameters, pk),
                new SPHINCSPlusPrivateKeyParameters(parameters, sk, pk));
        }

        private byte[] SecRand(int n)
        {
            return SecureRandom.GetNextBytes(random, n);
        }
    }
}
