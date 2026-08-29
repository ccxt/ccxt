using System;
using System.Collections.Generic;
using System.Globalization;
using System.Text;

namespace Nethereum.Util {
    internal static class BigDecimalFormatter {
        public static string ToCurrencyString(this BigDecimal value, int maxDigits, NumberFormatInfo format) {
            value.Normalize();

            if (maxDigits < 0)
                maxDigits = format.CurrencyDecimalDigits;

            BigDecimal rounded = value.RoundAwayFromZero(significantDigits: maxDigits);
            var digits = rounded.GetDigits(out int exponent);
            var result = new StringBuilder();
            NumberFormatting.FormatCurrency(result,
                rounded.Mantissa < 0, digits, exponent,
                maxDigits: maxDigits, info: format);
            return result.ToString();
        }

        internal static IList<byte> GetDigits(this BigDecimal value, out int exponent) {
            var nonNegativeMantissa = value.Mantissa < 0 ? -value.Mantissa : value.Mantissa;
            var result = new List<byte>();
            while (nonNegativeMantissa > 0) {
                result.Add((byte)(nonNegativeMantissa % 10 + '0'));
                nonNegativeMantissa /= 10;
            }
            result.Reverse();
            exponent = value.Exponent;
            return result;
        }
    }
}
