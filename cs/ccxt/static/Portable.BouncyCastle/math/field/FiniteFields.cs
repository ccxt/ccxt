using System;

namespace Org.BouncyCastle.Math.Field
{
    public abstract class FiniteFields
    {
        internal static readonly IFiniteField GF_2 = new PrimeField(BigInteger.ValueOf(2));
        internal static readonly IFiniteField GF_3 = new PrimeField(BigInteger.ValueOf(3));

        public static IPolynomialExtensionField GetBinaryExtensionField(int[] exponents)
        {
            if (exponents[0] != 0)
            {
                throw new ArgumentException("Irreducible polynomials in GF(2) must have constant term", "exponents");
            }
            for (int i = 1; i < exponents.Length; ++i)
            {
                if (exponents[i] <= exponents[i - 1])
                {
                    throw new ArgumentException("Polynomial exponents must be monotonically increasing", "exponents");
                }
            }

            return new GenericPolynomialExtensionField(GF_2, new GF2Polynomial(exponents));
        }

    //    public static IPolynomialExtensionField GetTernaryExtensionField(Term[] terms)
    //    {
    //        return new GenericPolynomialExtensionField(GF_3, new GF3Polynomial(terms));
    //    }

        public static IFiniteField GetPrimeField(BigInteger characteristic)
        {
            int bitLength = characteristic.BitLength;
            if (characteristic.SignValue <= 0 || bitLength < 2)
            {
                throw new ArgumentException("Must be >= 2", "characteristic");
            }

            if (bitLength < 3)
            {
                switch (characteristic.IntValue)
                {
                case 2:
                    return GF_2;
                case 3:
                    return GF_3;
                }
            }

            return new PrimeField(characteristic);
        }
    }
}
