using System;
using System.Globalization;
using System.Numerics;

namespace Nethereum.Util
{
    public static class BigIntegerExtensions
    {
        public static int NumberOfDigits(this BigInteger value)
        {
            return (value * value.Sign).ToString().Length;
        }

        public static BigInteger ParseInvariant(string value)
        {
            if (value == null) throw new ArgumentNullException(nameof(value));

            return BigInteger.Parse(value, CultureInfo.InvariantCulture);
        }
    }
}