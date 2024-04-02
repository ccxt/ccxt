using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Math.EC.Multiplier;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Crypto.Generators
{
    /**
     * an RSA key pair generator.
     */
    public class RsaKeyPairGenerator
        :   IAsymmetricCipherKeyPairGenerator
    {
        private static readonly int[] SPECIAL_E_VALUES = new int[]{ 3, 5, 17, 257, 65537 };
        private static readonly int SPECIAL_E_HIGHEST = SPECIAL_E_VALUES[SPECIAL_E_VALUES.Length - 1];
        private static readonly int SPECIAL_E_BITS = BigInteger.ValueOf(SPECIAL_E_HIGHEST).BitLength;

        protected static readonly BigInteger One = BigInteger.One;
        protected static readonly BigInteger DefaultPublicExponent = BigInteger.ValueOf(0x10001);
        protected const int DefaultTests = 100;

        protected RsaKeyGenerationParameters parameters;

        public virtual void Init(
            KeyGenerationParameters parameters)
        {
            if (parameters is RsaKeyGenerationParameters)
            {
                this.parameters = (RsaKeyGenerationParameters)parameters;
            }
            else
            {
                this.parameters = new RsaKeyGenerationParameters(
                    DefaultPublicExponent, parameters.Random, parameters.Strength, DefaultTests);
            }
        }

        public virtual AsymmetricCipherKeyPair GenerateKeyPair()
        {
            for (;;)
            {
                //
                // p and q values should have a length of half the strength in bits
                //
                int strength = parameters.Strength;
                int pBitlength = (strength + 1) / 2;
                int qBitlength = strength - pBitlength;
                int mindiffbits = strength / 3;
                int minWeight = strength >> 2;

                BigInteger e = parameters.PublicExponent;

                // TODO Consider generating safe primes for p, q (see DHParametersHelper.generateSafePrimes)
                // (then p-1 and q-1 will not consist of only small factors - see "Pollard's algorithm")

                BigInteger p = ChooseRandomPrime(pBitlength, e);
                BigInteger q, n;

                //
                // generate a modulus of the required length
                //
                for (;;)
                {
                    q = ChooseRandomPrime(qBitlength, e);

                    // p and q should not be too close together (or equal!)
                    BigInteger diff = q.Subtract(p).Abs();
                    if (diff.BitLength < mindiffbits)
                        continue;

                    //
                    // calculate the modulus
                    //
                    n = p.Multiply(q);

                    if (n.BitLength != strength)
                    {
                        //
                        // if we get here our primes aren't big enough, make the largest
                        // of the two p and try again
                        //
                        p = p.Max(q);
                        continue;
                    }

                    /*
	                 * Require a minimum weight of the NAF representation, since low-weight composites may
	                 * be weak against a version of the number-field-sieve for factoring.
	                 *
	                 * See "The number field sieve for integers of low weight", Oliver Schirokauer.
	                 */
                    if (WNafUtilities.GetNafWeight(n) < minWeight)
                    {
                        p = ChooseRandomPrime(pBitlength, e);
                        continue;
                    }

                    break;
                }

                if (p.CompareTo(q) < 0)
                {
                    BigInteger tmp = p;
                    p = q;
                    q = tmp;
                }

                BigInteger pSub1 = p.Subtract(One);
                BigInteger qSub1 = q.Subtract(One);
                //BigInteger phi = pSub1.Multiply(qSub1);
                BigInteger gcd = pSub1.Gcd(qSub1);
                BigInteger lcm = pSub1.Divide(gcd).Multiply(qSub1);

                //
                // calculate the private exponent
                //
                BigInteger d = e.ModInverse(lcm);

                if (d.BitLength <= qBitlength)
                    continue;

                //
                // calculate the CRT factors
                //
                BigInteger dP = d.Remainder(pSub1);
                BigInteger dQ = d.Remainder(qSub1);
                BigInteger qInv = BigIntegers.ModOddInverse(p, q);

                return new AsymmetricCipherKeyPair(
                    new RsaKeyParameters(false, n, e),
                    new RsaPrivateCrtKeyParameters(n, e, d, p, q, dP, dQ, qInv));
            }
        }

        /// <summary>Choose a random prime value for use with RSA</summary>
        /// <param name="bitlength">the bit-length of the returned prime</param>
        /// <param name="e">the RSA public exponent</param>
        /// <returns>a prime p, with (p-1) relatively prime to e</returns>
        protected virtual BigInteger ChooseRandomPrime(int bitlength, BigInteger e)
        {
            bool eIsKnownOddPrime = (e.BitLength <= SPECIAL_E_BITS) && Arrays.Contains(SPECIAL_E_VALUES, e.IntValue);

            for (;;)
            {
                BigInteger p = new BigInteger(bitlength, 1, parameters.Random);

                if (p.Mod(e).Equals(One))
                    continue;

                if (!p.IsProbablePrime(parameters.Certainty, true))
                    continue;

                if (!eIsKnownOddPrime && !e.Gcd(p.Subtract(One)).Equals(One))
                    continue;

                return p;
            }
        }
    }
}
