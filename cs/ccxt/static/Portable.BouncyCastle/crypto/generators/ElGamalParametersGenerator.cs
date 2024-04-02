using System;

using Org.BouncyCastle.Math;
using Org.BouncyCastle.Security;
using Org.BouncyCastle.Crypto.Parameters;

namespace Org.BouncyCastle.Crypto.Generators
{
    public class ElGamalParametersGenerator
    {
		private int				size;
        private int				certainty;
        private SecureRandom	random;

		public void Init(
            int				size,
            int				certainty,
            SecureRandom	random)
        {
            this.size = size;
            this.certainty = certainty;
            this.random = random;
        }

		/**
         * which Generates the p and g values from the given parameters,
         * returning the ElGamalParameters object.
         * <p>
         * Note: can take a while...
		 * </p>
         */
        public ElGamalParameters GenerateParameters()
        {
			//
			// find a safe prime p where p = 2*q + 1, where p and q are prime.
			//
			BigInteger[] safePrimes = DHParametersHelper.GenerateSafePrimes(size, certainty, random);

			BigInteger p = safePrimes[0];
			BigInteger q = safePrimes[1];
			BigInteger g = DHParametersHelper.SelectGenerator(p, q, random);

			return new ElGamalParameters(p, g);
        }
    }
}
