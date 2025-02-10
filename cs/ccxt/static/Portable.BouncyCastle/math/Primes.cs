using System;

using Org.BouncyCastle.Crypto;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;

namespace Org.BouncyCastle.Math
{
    /**
     * Utility methods for generating primes and testing for primality.
     */
    public abstract class Primes
    {
        public static readonly int SmallFactorLimit = 211;

        private static readonly BigInteger One = BigInteger.One;
        private static readonly BigInteger Two = BigInteger.Two;
        private static readonly BigInteger Three = BigInteger.Three;

        /**
         * Used to return the output from the
         * {@linkplain Primes#enhancedMRProbablePrimeTest(BigInteger, SecureRandom, int) Enhanced
         * Miller-Rabin Probabilistic Primality Test}
         */
        public class MROutput
        {
            internal static MROutput ProbablyPrime()
            {
                return new MROutput(false, null);
            }

            internal static MROutput ProvablyCompositeWithFactor(BigInteger factor)
            {
                return new MROutput(true, factor);
            }

            internal static MROutput ProvablyCompositeNotPrimePower()
            {
                return new MROutput(true, null);
            }

            private readonly bool mProvablyComposite;
            private readonly BigInteger mFactor;

            private MROutput(bool provablyComposite, BigInteger factor)
            {
                this.mProvablyComposite = provablyComposite;
                this.mFactor = factor;
            }

            public BigInteger Factor
            {
                get { return mFactor; }
            }

            public bool IsProvablyComposite
            {
                get { return mProvablyComposite; }
            }

            public bool IsNotPrimePower
            {
                get { return mProvablyComposite && mFactor == null; }
            }
        }

        /**
         * Used to return the output from the {@linkplain Primes#generateSTRandomPrime(Digest, int, byte[]) Shawe-Taylor Random_Prime Routine} 
         */
        public class STOutput
        {
            private readonly BigInteger mPrime;
            private readonly byte[] mPrimeSeed;
            private readonly int mPrimeGenCounter;

            internal STOutput(BigInteger prime, byte[] primeSeed, int primeGenCounter)
            {
                this.mPrime = prime;
                this.mPrimeSeed = primeSeed;
                this.mPrimeGenCounter = primeGenCounter;
            }

            public BigInteger Prime
            {
                get { return mPrime; }
            }

            public byte[] PrimeSeed
            {
                get { return mPrimeSeed; }
            }

            public int PrimeGenCounter
            {
                get { return mPrimeGenCounter; }
            }
        }

        /**
         * FIPS 186-4 C.6 Shawe-Taylor Random_Prime Routine
         * 
         * Construct a provable prime number using a hash function.
         * 
         * @param hash
         *            the {@link Digest} instance to use (as "Hash()"). Cannot be null.
         * @param length
         *            the length (in bits) of the prime to be generated. Must be at least 2.
         * @param inputSeed
         *            the seed to be used for the generation of the requested prime. Cannot be null or
         *            empty.
         * @return an {@link STOutput} instance containing the requested prime.
         */
        public static STOutput GenerateSTRandomPrime(IDigest hash, int length, byte[] inputSeed)
        {
            if (hash == null)
                throw new ArgumentNullException("hash");
            if (length < 2)
                throw new ArgumentException("must be >= 2", "length");
            if (inputSeed == null)
                throw new ArgumentNullException("inputSeed");
            if (inputSeed.Length == 0)
                throw new ArgumentException("cannot be empty", "inputSeed");

            return ImplSTRandomPrime(hash, length, Arrays.Clone(inputSeed));
        }

        /**
         * FIPS 186-4 C.3.2 Enhanced Miller-Rabin Probabilistic Primality Test
         * 
         * Run several iterations of the Miller-Rabin algorithm with randomly-chosen bases. This is an
         * alternative to {@link #isMRProbablePrime(BigInteger, SecureRandom, int)} that provides more
         * information about a composite candidate, which may be useful when generating or validating
         * RSA moduli.
         * 
         * @param candidate
         *            the {@link BigInteger} instance to test for primality.
         * @param random
         *            the source of randomness to use to choose bases.
         * @param iterations
         *            the number of randomly-chosen bases to perform the test for.
         * @return an {@link MROutput} instance that can be further queried for details.
         */
        public static MROutput EnhancedMRProbablePrimeTest(BigInteger candidate, SecureRandom random, int iterations)
        {
            CheckCandidate(candidate, "candidate");

            if (random == null)
                throw new ArgumentNullException("random");
            if (iterations < 1)
                throw new ArgumentException("must be > 0", "iterations");

            if (candidate.BitLength == 2)
                return MROutput.ProbablyPrime();

            if (!candidate.TestBit(0))
                return MROutput.ProvablyCompositeWithFactor(Two);

            BigInteger w = candidate;
            BigInteger wSubOne = candidate.Subtract(One);
            BigInteger wSubTwo = candidate.Subtract(Two);

            int a = wSubOne.GetLowestSetBit();
            BigInteger m = wSubOne.ShiftRight(a);

            for (int i = 0; i < iterations; ++i)
            {
                BigInteger b = BigIntegers.CreateRandomInRange(Two, wSubTwo, random);
                BigInteger g = b.Gcd(w);

                if (g.CompareTo(One) > 0)
                    return MROutput.ProvablyCompositeWithFactor(g);

                BigInteger z = b.ModPow(m, w);

                if (z.Equals(One) || z.Equals(wSubOne))
                    continue;

                bool primeToBase = false;

                BigInteger x = z;
                for (int j = 1; j < a; ++j)
                {
                    z = z.ModPow(Two, w);

                    if (z.Equals(wSubOne))
                    {
                        primeToBase = true;
                        break;
                    }

                    if (z.Equals(One))
                        break;

                    x = z;
                }

                if (!primeToBase)
                {
                    if (!z.Equals(One))
                    {
                        x = z;
                        z = z.ModPow(Two, w);

                        if (!z.Equals(One))
                        {
                            x = z;
                        }
                    }

                    g = x.Subtract(One).Gcd(w);

                    if (g.CompareTo(One) > 0)
                        return MROutput.ProvablyCompositeWithFactor(g);

                    return MROutput.ProvablyCompositeNotPrimePower();
                }
            }

            return MROutput.ProbablyPrime();
        }

        /**
         * A fast check for small divisors, up to some implementation-specific limit.
         * 
         * @param candidate
         *            the {@link BigInteger} instance to test for division by small factors.
         * 
         * @return <code>true</code> if the candidate is found to have any small factors,
         *         <code>false</code> otherwise.
         */
        public static bool HasAnySmallFactors(BigInteger candidate)
        {
            CheckCandidate(candidate, "candidate");

            return ImplHasAnySmallFactors(candidate);
        }

        /**
         * FIPS 186-4 C.3.1 Miller-Rabin Probabilistic Primality Test
         * 
         * Run several iterations of the Miller-Rabin algorithm with randomly-chosen bases.
         * 
         * @param candidate
         *            the {@link BigInteger} instance to test for primality.
         * @param random
         *            the source of randomness to use to choose bases.
         * @param iterations
         *            the number of randomly-chosen bases to perform the test for.
         * @return <code>false</code> if any witness to compositeness is found amongst the chosen bases
         *         (so <code>candidate</code> is definitely NOT prime), or else <code>true</code>
         *         (indicating primality with some probability dependent on the number of iterations
         *         that were performed).
         */
        public static bool IsMRProbablePrime(BigInteger candidate, SecureRandom random, int iterations)
        {
            CheckCandidate(candidate, "candidate");

            if (random == null)
                throw new ArgumentException("cannot be null", "random");
            if (iterations < 1)
                throw new ArgumentException("must be > 0", "iterations");

            if (candidate.BitLength == 2)
                return true;
            if (!candidate.TestBit(0))
                return false;

            BigInteger w = candidate;
            BigInteger wSubOne = candidate.Subtract(One);
            BigInteger wSubTwo = candidate.Subtract(Two);

            int a = wSubOne.GetLowestSetBit();
            BigInteger m = wSubOne.ShiftRight(a);

            for (int i = 0; i < iterations; ++i)
            {
                BigInteger b = BigIntegers.CreateRandomInRange(Two, wSubTwo, random);

                if (!ImplMRProbablePrimeToBase(w, wSubOne, m, a, b))
                    return false;
            }

            return true;
        }

        /**
         * FIPS 186-4 C.3.1 Miller-Rabin Probabilistic Primality Test (to a fixed base).
         * 
         * Run a single iteration of the Miller-Rabin algorithm against the specified base.
         * 
         * @param candidate
         *            the {@link BigInteger} instance to test for primality.
         * @param baseValue
         *            the base value to use for this iteration.
         * @return <code>false</code> if the specified base is a witness to compositeness (so
         *         <code>candidate</code> is definitely NOT prime), or else <code>true</code>.
         */
        public static bool IsMRProbablePrimeToBase(BigInteger candidate, BigInteger baseValue)
        {
            CheckCandidate(candidate, "candidate");
            CheckCandidate(baseValue, "baseValue");

            if (baseValue.CompareTo(candidate.Subtract(One)) >= 0)
                throw new ArgumentException("must be < ('candidate' - 1)", "baseValue");

            if (candidate.BitLength == 2)
                return true;

            BigInteger w = candidate;
            BigInteger wSubOne = candidate.Subtract(One);

            int a = wSubOne.GetLowestSetBit();
            BigInteger m = wSubOne.ShiftRight(a);

            return ImplMRProbablePrimeToBase(w, wSubOne, m, a, baseValue);
        }

        private static void CheckCandidate(BigInteger n, string name)
        {
            if (n == null || n.SignValue < 1 || n.BitLength < 2)
                throw new ArgumentException("must be non-null and >= 2", name);
        }

        private static bool ImplHasAnySmallFactors(BigInteger x)
        {
            /*
             * Bundle trial divisors into ~32-bit moduli then use fast tests on the ~32-bit remainders.
             */
            int m = 2 * 3 * 5 * 7 * 11 * 13 * 17 * 19 * 23;
            int r = x.Mod(BigInteger.ValueOf(m)).IntValue;
            if ((r % 2) == 0 || (r % 3) == 0 || (r % 5) == 0 || (r % 7) == 0 || (r % 11) == 0 || (r % 13) == 0
                || (r % 17) == 0 || (r % 19) == 0 || (r % 23) == 0)
            {
                return true;
            }

            m = 29 * 31 * 37 * 41 * 43;
            r = x.Mod(BigInteger.ValueOf(m)).IntValue;
            if ((r % 29) == 0 || (r % 31) == 0 || (r % 37) == 0 || (r % 41) == 0 || (r % 43) == 0)
            {
                return true;
            }

            m = 47 * 53 * 59 * 61 * 67;
            r = x.Mod(BigInteger.ValueOf(m)).IntValue;
            if ((r % 47) == 0 || (r % 53) == 0 || (r % 59) == 0 || (r % 61) == 0 || (r % 67) == 0)
            {
                return true;
            }

            m = 71 * 73 * 79 * 83;
            r = x.Mod(BigInteger.ValueOf(m)).IntValue;
            if ((r % 71) == 0 || (r % 73) == 0 || (r % 79) == 0 || (r % 83) == 0)
            {
                return true;
            }

            m = 89 * 97 * 101 * 103;
            r = x.Mod(BigInteger.ValueOf(m)).IntValue;
            if ((r % 89) == 0 || (r % 97) == 0 || (r % 101) == 0 || (r % 103) == 0)
            {
                return true;
            }

            m = 107 * 109 * 113 * 127;
            r = x.Mod(BigInteger.ValueOf(m)).IntValue;
            if ((r % 107) == 0 || (r % 109) == 0 || (r % 113) == 0 || (r % 127) == 0)
            {
                return true;
            }

            m = 131 * 137 * 139 * 149;
            r = x.Mod(BigInteger.ValueOf(m)).IntValue;
            if ((r % 131) == 0 || (r % 137) == 0 || (r % 139) == 0 || (r % 149) == 0)
            {
                return true;
            }

            m = 151 * 157 * 163 * 167;
            r = x.Mod(BigInteger.ValueOf(m)).IntValue;
            if ((r % 151) == 0 || (r % 157) == 0 || (r % 163) == 0 || (r % 167) == 0)
            {
                return true;
            }

            m = 173 * 179 * 181 * 191;
            r = x.Mod(BigInteger.ValueOf(m)).IntValue;
            if ((r % 173) == 0 || (r % 179) == 0 || (r % 181) == 0 || (r % 191) == 0)
            {
                return true;
            }

            m = 193 * 197 * 199 * 211;
            r = x.Mod(BigInteger.ValueOf(m)).IntValue;
            if ((r % 193) == 0 || (r % 197) == 0 || (r % 199) == 0 || (r % 211) == 0)
            {
                return true;
            }

            /*
             * NOTE: Unit tests depend on SMALL_FACTOR_LIMIT matching the
             * highest small factor tested here.
             */
            return false;
        }

        private static bool ImplMRProbablePrimeToBase(BigInteger w, BigInteger wSubOne, BigInteger m, int a, BigInteger b)
        {
            BigInteger z = b.ModPow(m, w);

            if (z.Equals(One) || z.Equals(wSubOne))
                return true;

            bool result = false;

            for (int j = 1; j < a; ++j)
            {
                z = z.ModPow(Two, w);

                if (z.Equals(wSubOne))
                {
                    result = true;
                    break;
                }

                if (z.Equals(One))
                    return false;
            }

            return result;
        }

        private static STOutput ImplSTRandomPrime(IDigest d, int length, byte[] primeSeed)
        {
            int dLen = d.GetDigestSize();

            if (length < 33)
            {
                int primeGenCounter = 0;

                byte[] c0 = new byte[dLen];
                byte[] c1 = new byte[dLen];

                for (;;)
                {
                    Hash(d, primeSeed, c0, 0);
                    Inc(primeSeed, 1);

                    Hash(d, primeSeed, c1, 0);
                    Inc(primeSeed, 1);

                    uint c = Extract32(c0) ^ Extract32(c1);
                    c &= (uint.MaxValue >> (32 - length));
                    c |= (1U << (length - 1)) | 1U;

                    ++primeGenCounter;

                    if (IsPrime32(c))
                    {
                        return new STOutput(BigInteger.ValueOf((long)c), primeSeed, primeGenCounter);
                    }

                    if (primeGenCounter > (4 * length))
                    {
                        throw new InvalidOperationException("Too many iterations in Shawe-Taylor Random_Prime Routine");
                    }
                }
            }

            STOutput rec = ImplSTRandomPrime(d, (length + 3)/2, primeSeed);

            {
                BigInteger c0 = rec.Prime;
                primeSeed = rec.PrimeSeed;
                int primeGenCounter = rec.PrimeGenCounter;

                int outlen = 8 * dLen;
                int iterations = (length - 1)/outlen;

                int oldCounter = primeGenCounter;

                BigInteger x = HashGen(d, primeSeed, iterations + 1);
                x = x.Mod(One.ShiftLeft(length - 1)).SetBit(length - 1);

                BigInteger c0x2 = c0.ShiftLeft(1);
                BigInteger tx2 = x.Subtract(One).Divide(c0x2).Add(One).ShiftLeft(1);
                int dt = 0;

                BigInteger c = tx2.Multiply(c0).Add(One);

                /*
                 * TODO Since the candidate primes are generated by constant steps ('c0x2'),
                 * sieving could be used here in place of the 'HasAnySmallFactors' approach.
                 */
                for (;;)
                {
                    if (c.BitLength > length)
                    {
                        tx2 = One.ShiftLeft(length - 1).Subtract(One).Divide(c0x2).Add(One).ShiftLeft(1);
                        c = tx2.Multiply(c0).Add(One);
                    }

                    ++primeGenCounter;

                    /*
                     * This is an optimization of the original algorithm, using trial division to screen out
                     * many non-primes quickly.
                     * 
                     * NOTE: 'primeSeed' is still incremented as if we performed the full check!
                     */
                    if (!ImplHasAnySmallFactors(c))
                    {
                        BigInteger a = HashGen(d, primeSeed, iterations + 1);
                        a = a.Mod(c.Subtract(Three)).Add(Two);

                        tx2 = tx2.Add(BigInteger.ValueOf(dt));
                        dt = 0;

                        BigInteger z = a.ModPow(tx2, c);

                        if (c.Gcd(z.Subtract(One)).Equals(One) && z.ModPow(c0, c).Equals(One))
                        {
                            return new STOutput(c, primeSeed, primeGenCounter);
                        }
                    }
                    else
                    {
                        Inc(primeSeed, iterations + 1);
                    }

                    if (primeGenCounter >= ((4 * length) + oldCounter))
                    {
                        throw new InvalidOperationException("Too many iterations in Shawe-Taylor Random_Prime Routine");
                    }

                    dt += 2;
                    c = c.Add(c0x2);
                }
            }
        }

        private static uint Extract32(byte[] bs)
        {
            uint result = 0;

            int count = System.Math.Min(4, bs.Length);
            for (int i = 0; i < count; ++i)
            {
                uint b = bs[bs.Length - (i + 1)];
                result |= (b << (8 * i));
            }

            return result;
        }

        private static void Hash(IDigest d, byte[] input, byte[] output, int outPos)
        {
            d.BlockUpdate(input, 0, input.Length);
            d.DoFinal(output, outPos);
        }

        private static BigInteger HashGen(IDigest d, byte[] seed, int count)
        {
            int dLen = d.GetDigestSize();
            int pos = count * dLen;
            byte[] buf = new byte[pos];
            for (int i = 0; i < count; ++i)
            {
                pos -= dLen;
                Hash(d, seed, buf, pos);
                Inc(seed, 1);
            }
            return new BigInteger(1, buf);
        }

        private static void Inc(byte[] seed, int c)
        {
            int pos = seed.Length;
            while (c > 0 && --pos >= 0)
            {
                c += seed[pos];
                seed[pos] = (byte)c;
                c >>= 8;
            }
        }

        private static bool IsPrime32(uint x)
        {
            /*
             * Use wheel factorization with 2, 3, 5 to select trial divisors.
             */

            if (x <= 5)
            {
                return x == 2 || x == 3 || x == 5;
            }

            if ((x & 1) == 0 || (x % 3) == 0 || (x % 5) == 0)
            {
                return false;
            }

            uint[] ds = new uint[]{ 1, 7, 11, 13, 17, 19, 23, 29 };
            uint b = 0;
            for (int pos = 1; ; pos = 0)
            {
                /*
                 * Trial division by wheel-selected divisors
                 */
                while (pos < ds.Length)
                {
                    uint d = b + ds[pos];
                    if (x % d == 0)
                    {
                        return x < 30;
                    }
                    ++pos;
                }

                b += 30;

                if ((b >> 16 != 0) || (b * b >= x))
                {
                    return true;
                }
            }
        }
    }
}
