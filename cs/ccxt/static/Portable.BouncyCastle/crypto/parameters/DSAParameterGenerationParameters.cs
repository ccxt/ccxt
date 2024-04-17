using System;

using Org.BouncyCastle.Security;

namespace Org.BouncyCastle.Crypto.Parameters
{
    public class DsaParameterGenerationParameters
    {
        public const int DigitalSignatureUsage = 1;
        public const int KeyEstablishmentUsage = 2;

        private readonly int l;
        private readonly int n;
        private readonly int certainty;
        private readonly SecureRandom random;
        private readonly int usageIndex;

        /**
         * Construct without a usage index, this will do a random construction of G.
         *
         * @param L desired length of prime P in bits (the effective key size).
         * @param N desired length of prime Q in bits.
         * @param certainty certainty level for prime number generation.
         * @param random the source of randomness to use.
         */
        public DsaParameterGenerationParameters(int L, int N, int certainty, SecureRandom random)
            : this(L, N, certainty, random, -1)
        {
        }

        /**
         * Construct for a specific usage index - this has the effect of using verifiable canonical generation of G.
         *
         * @param L desired length of prime P in bits (the effective key size).
         * @param N desired length of prime Q in bits.
         * @param certainty certainty level for prime number generation.
         * @param random the source of randomness to use.
         * @param usageIndex a valid usage index.
         */
        public DsaParameterGenerationParameters(int L, int N, int certainty, SecureRandom random, int usageIndex)
        {
            this.l = L;
            this.n = N;
            this.certainty = certainty;
            this.random = random;
            this.usageIndex = usageIndex;
        }

        public virtual int L
        {
            get { return l; }
        }

        public virtual int N
        {
            get { return n; }
        }

        public virtual int UsageIndex
        {
            get { return usageIndex; }
        }

        public virtual int Certainty
        {
            get { return certainty; }
        }

        public virtual SecureRandom Random
        {
            get { return random; }
        }
    }
}
