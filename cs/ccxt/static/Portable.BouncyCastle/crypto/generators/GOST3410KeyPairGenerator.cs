using System;

using Org.BouncyCastle.Asn1.CryptoPro;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC.Multiplier;
using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Generators
{
    /**
     * a GOST3410 key pair generator.
     * This generates GOST3410 keys in line with the method described
     * in GOST R 34.10-94.
     */
    public class Gost3410KeyPairGenerator
        : IAsymmetricCipherKeyPairGenerator
    {
        private Gost3410KeyGenerationParameters param;

        public void Init(
            KeyGenerationParameters parameters)
        {
            if (parameters is Gost3410KeyGenerationParameters)
            {
                this.param = (Gost3410KeyGenerationParameters) parameters;
            }
            else
            {
                Gost3410KeyGenerationParameters kgp = new Gost3410KeyGenerationParameters(
                    parameters.Random,
                    CryptoProObjectIdentifiers.GostR3410x94CryptoProA);

                if (parameters.Strength != kgp.Parameters.P.BitLength - 1)
                {
                    // TODO Should we complain?
                }

                this.param = kgp;
            }
        }

        public AsymmetricCipherKeyPair GenerateKeyPair()
        {
            SecureRandom random = param.Random;
            Gost3410Parameters gost3410Params = param.Parameters;

            BigInteger q = gost3410Params.Q, x;

            int minWeight = 64;
            for (;;)
            {
                x = new BigInteger(256, random);

                if (x.SignValue < 1 || x.CompareTo(q) >= 0)
                    continue;

                if (WNafUtilities.GetNafWeight(x) < minWeight)
                    continue;

                break;
            }

            BigInteger p = gost3410Params.P;
            BigInteger a = gost3410Params.A;

            // calculate the public key.
            BigInteger y = a.ModPow(x, p);

            if (param.PublicKeyParamSet != null)
            {
                return new AsymmetricCipherKeyPair(
                    new Gost3410PublicKeyParameters(y, param.PublicKeyParamSet),
                    new Gost3410PrivateKeyParameters(x, param.PublicKeyParamSet));
            }

            return new AsymmetricCipherKeyPair(
                new Gost3410PublicKeyParameters(y, gost3410Params),
                new Gost3410PrivateKeyParameters(x, gost3410Params));
        }
    }
}
