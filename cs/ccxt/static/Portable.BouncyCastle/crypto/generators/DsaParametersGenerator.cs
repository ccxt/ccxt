using System;

using Org.BouncyCastle.Crypto.Parameters;
using Org.BouncyCastle.Crypto.Digests;
using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Utilities;
using Org.BouncyCastle.Utilities.Encoders;

namespace Org.BouncyCastle.Crypto.Generators
{
    /**
     * Generate suitable parameters for DSA, in line with FIPS 186-2, or FIPS 186-3.
     */
    public class DsaParametersGenerator
    {
        private IDigest         digest;
        private int				L, N;
        private int				certainty;
        private SecureRandom	random;
        private bool            use186_3;
        private int             usageIndex;

        public DsaParametersGenerator()
            : this(new Sha1Digest())
        {
        }

        public DsaParametersGenerator(IDigest digest)
        {
            this.digest = digest;
        }

        /// <summary>Initialise the generator</summary>
        /// <remarks>This form can only be used for older DSA (pre-DSA2) parameters</remarks>
        /// <param name="size">the size of keys in bits (from 512 up to 1024, and a multiple of 64)</param>
        /// <param name="certainty">measure of robustness of primes (at least 80 for FIPS 186-2 compliance)</param>
        /// <param name="random">the source of randomness to use</param>
        public virtual void Init(
            int             size,
            int             certainty,
            SecureRandom    random)
        {
            if (!IsValidDsaStrength(size))
                throw new ArgumentException("size must be from 512 - 1024 and a multiple of 64", "size");

            this.use186_3 = false;
            this.L = size;
            this.N = GetDefaultN(size);
            this.certainty = certainty;
            this.random = random;
        }

        /// <summary>Initialise the generator for DSA 2</summary>
        /// <remarks>You must use this Init method if you need to generate parameters for DSA 2 keys</remarks>
        /// <param name="parameters">An instance of <c>DsaParameterGenerationParameters</c> used to configure this generator</param>
        public virtual void Init(DsaParameterGenerationParameters parameters)
        {
            // TODO Should we enforce the minimum 'certainty' values as per C.3 Table C.1?
            this.use186_3 = true;
            this.L = parameters.L;
            this.N = parameters.N;
            this.certainty = parameters.Certainty;
            this.random = parameters.Random;
            this.usageIndex = parameters.UsageIndex;

            if ((L < 1024 || L > 3072) || L % 1024 != 0)
                throw new ArgumentException("Values must be between 1024 and 3072 and a multiple of 1024", "L");
            if (L == 1024 && N != 160)
                throw new ArgumentException("N must be 160 for L = 1024");
            if (L == 2048 && (N != 224 && N != 256))
                throw new ArgumentException("N must be 224 or 256 for L = 2048");
            if (L == 3072 && N != 256)
                throw new ArgumentException("N must be 256 for L = 3072");

            if (digest.GetDigestSize() * 8 < N)
                throw new InvalidOperationException("Digest output size too small for value of N");
        }

        /// <summary>Generates a set of <c>DsaParameters</c></summary>
        /// <remarks>Can take a while...</remarks>
        public virtual DsaParameters GenerateParameters()
        {
            return use186_3
                ?	GenerateParameters_FIPS186_3()
                :	GenerateParameters_FIPS186_2();
        }

        protected virtual DsaParameters GenerateParameters_FIPS186_2()
        {
            byte[] seed = new byte[20];
            byte[] part1 = new byte[20];
            byte[] part2 = new byte[20];
            byte[] u = new byte[20];
            int n = (L - 1) / 160;
            byte[] w = new byte[L / 8];

            if (!(digest is Sha1Digest))
                throw new InvalidOperationException("can only use SHA-1 for generating FIPS 186-2 parameters");

            for (;;)
            {
                random.NextBytes(seed);

                Hash(digest, seed, part1);
                Array.Copy(seed, 0, part2, 0, seed.Length);
                Inc(part2);
                Hash(digest, part2, part2);

                for (int i = 0; i != u.Length; i++)
                {
                    u[i] = (byte)(part1[i] ^ part2[i]);
                }

                u[0] |= (byte)0x80;
                u[19] |= (byte)0x01;

                BigInteger q = new BigInteger(1, u);

                if (!q.IsProbablePrime(certainty))
                    continue;

                byte[] offset = Arrays.Clone(seed);
                Inc(offset);

                for (int counter = 0; counter < 4096; ++counter)
                {
                    for (int k = 0; k < n; k++)
                    {
                        Inc(offset);
                        Hash(digest, offset, part1);
                        Array.Copy(part1, 0, w, w.Length - (k + 1) * part1.Length, part1.Length);
                    }

                    Inc(offset);
                    Hash(digest, offset, part1);
                    Array.Copy(part1, part1.Length - ((w.Length - (n) * part1.Length)), w, 0, w.Length - n * part1.Length);

                    w[0] |= (byte)0x80;

                    BigInteger x = new BigInteger(1, w);

                    BigInteger c = x.Mod(q.ShiftLeft(1));

                    BigInteger p = x.Subtract(c.Subtract(BigInteger.One));

                    if (p.BitLength != L)
                        continue;

                    if (p.IsProbablePrime(certainty))
                    {
                        BigInteger g = CalculateGenerator_FIPS186_2(p, q, random);

                        return new DsaParameters(p, q, g, new DsaValidationParameters(seed, counter));
                    }
                }
            }
        }

        protected virtual BigInteger CalculateGenerator_FIPS186_2(BigInteger p, BigInteger q, SecureRandom r)
        {
            BigInteger e = p.Subtract(BigInteger.One).Divide(q);
            BigInteger pSub2 = p.Subtract(BigInteger.Two);

            for (;;)
            {
                BigInteger h = BigIntegers.CreateRandomInRange(BigInteger.Two, pSub2, r);
                BigInteger g = h.ModPow(e, p);

                if (g.BitLength > 1)
                    return g;
            }
        }

        /**
         * generate suitable parameters for DSA, in line with
         * <i>FIPS 186-3 A.1 Generation of the FFC Primes p and q</i>.
         */
        protected virtual DsaParameters GenerateParameters_FIPS186_3()
        {
// A.1.1.2 Generation of the Probable Primes p and q Using an Approved Hash Function
            IDigest d = digest;
            int outlen = d.GetDigestSize() * 8;

// 1. Check that the (L, N) pair is in the list of acceptable (L, N pairs) (see Section 4.2). If
//    the pair is not in the list, then return INVALID.
            // Note: checked at initialisation
            
// 2. If (seedlen < N), then return INVALID.
            // FIXME This should be configurable (must be >= N)
            int seedlen = N;
            byte[] seed = new byte[seedlen / 8];

// 3. n = ceiling(L ⁄ outlen) – 1.
            int n = (L - 1) / outlen;

// 4. b = L – 1 – (n ∗ outlen).
            int b = (L - 1) % outlen;

            byte[] output = new byte[d.GetDigestSize()];
            for (;;)
            {
// 5. Get an arbitrary sequence of seedlen bits as the domain_parameter_seed.
                random.NextBytes(seed);

// 6. U = Hash (domain_parameter_seed) mod 2^(N–1).
                Hash(d, seed, output);
                BigInteger U = new BigInteger(1, output).Mod(BigInteger.One.ShiftLeft(N - 1));

// 7. q = 2^(N–1) + U + 1 – ( U mod 2).
                BigInteger q = U.SetBit(0).SetBit(N - 1);

// 8. Test whether or not q is prime as specified in Appendix C.3.
                // TODO Review C.3 for primality checking
                if (!q.IsProbablePrime(certainty))
                {
// 9. If q is not a prime, then go to step 5.
                    continue;
                }

// 10. offset = 1.
                // Note: 'offset' value managed incrementally
                byte[] offset = Arrays.Clone(seed);

// 11. For counter = 0 to (4L – 1) do
                int counterLimit = 4 * L;
                for (int counter = 0; counter < counterLimit; ++counter)
                {
// 11.1 For j = 0 to n do
//      Vj = Hash ((domain_parameter_seed + offset + j) mod 2^seedlen).
// 11.2 W = V0 + (V1 ∗ 2^outlen) + ... + (V^(n–1) ∗ 2^((n–1) ∗ outlen)) + ((Vn mod 2^b) ∗ 2^(n ∗ outlen)).
                    // TODO Assemble w as a byte array
                    BigInteger W = BigInteger.Zero;
                    for (int j = 0, exp = 0; j <= n; ++j, exp += outlen)
                    {
                        Inc(offset);
                        Hash(d, offset, output);

                        BigInteger Vj = new BigInteger(1, output);
                        if (j == n)
                        {
                            Vj = Vj.Mod(BigInteger.One.ShiftLeft(b));
                        }

                        W = W.Add(Vj.ShiftLeft(exp));
                    }

// 11.3 X = W + 2^(L–1). Comment: 0 ≤ W < 2L–1; hence, 2L–1 ≤ X < 2L.
                    BigInteger X = W.Add(BigInteger.One.ShiftLeft(L - 1));

// 11.4 c = X mod 2q.
                    BigInteger c = X.Mod(q.ShiftLeft(1));

// 11.5 p = X - (c - 1). Comment: p ≡ 1 (mod 2q).
                    BigInteger p = X.Subtract(c.Subtract(BigInteger.One));

                    // 11.6 If (p < 2^(L - 1)), then go to step 11.9
                    if (p.BitLength != L)
                        continue;

// 11.7 Test whether or not p is prime as specified in Appendix C.3.
                    // TODO Review C.3 for primality checking
                    if (p.IsProbablePrime(certainty))
                    {
// 11.8 If p is determined to be prime, then return VALID and the values of p, q and
//      (optionally) the values of domain_parameter_seed and counter.
                        // TODO Make configurable (8-bit unsigned)?

                        if (usageIndex >= 0)
                        {
                            BigInteger g = CalculateGenerator_FIPS186_3_Verifiable(d, p, q, seed, usageIndex);
                            if (g != null)
                                return new DsaParameters(p, q, g, new DsaValidationParameters(seed, counter, usageIndex));
                        }

                        {
                            BigInteger g = CalculateGenerator_FIPS186_3_Unverifiable(p, q, random);

                            return new DsaParameters(p, q, g, new DsaValidationParameters(seed, counter));
                        }
                    }

// 11.9 offset = offset + n + 1.      Comment: Increment offset; then, as part of
//                                    the loop in step 11, increment counter; if
//                                    counter < 4L, repeat steps 11.1 through 11.8.
                    // Note: 'offset' value already incremented in inner loop
                }
// 12. Go to step 5.
            }
        }

        protected virtual BigInteger CalculateGenerator_FIPS186_3_Unverifiable(BigInteger p, BigInteger q,
            SecureRandom r)
        {
            return CalculateGenerator_FIPS186_2(p, q, r);
        }

        protected virtual BigInteger CalculateGenerator_FIPS186_3_Verifiable(IDigest d, BigInteger p, BigInteger q,
            byte[] seed, int index)
        {
            // A.2.3 Verifiable Canonical Generation of the Generator g
            BigInteger e = p.Subtract(BigInteger.One).Divide(q);
            byte[] ggen = Hex.DecodeStrict("6767656E");

            // 7. U = domain_parameter_seed || "ggen" || index || count.
            byte[] U = new byte[seed.Length + ggen.Length + 1 + 2];
            Array.Copy(seed, 0, U, 0, seed.Length);
            Array.Copy(ggen, 0, U, seed.Length, ggen.Length);
            U[U.Length - 3] = (byte)index; 

            byte[] w = new byte[d.GetDigestSize()];
            for (int count = 1; count < (1 << 16); ++count)
            {
                Inc(U);
                Hash(d, U, w);
                BigInteger W = new BigInteger(1, w);
                BigInteger g = W.ModPow(e, p);

                if (g.CompareTo(BigInteger.Two) >= 0)
                    return g;
            }

            return null;
        }
        
        private static bool IsValidDsaStrength(
            int strength)
        {
            return strength >= 512 && strength <= 1024 && strength % 64 == 0;
        }

        protected static void Hash(IDigest d, byte[] input, byte[] output)
        {
            d.BlockUpdate(input, 0, input.Length);
            d.DoFinal(output, 0);
        }

        private static int GetDefaultN(int L)
        {
            return L > 1024 ? 256 : 160;
        }

        protected static void Inc(byte[] buf)
        {
            for (int i = buf.Length - 1; i >= 0; --i)
            {
                byte b = (byte)(buf[i] + 1);
                buf[i] = b;

                if (b != 0)
                    break;
            }
        }
    }
}
