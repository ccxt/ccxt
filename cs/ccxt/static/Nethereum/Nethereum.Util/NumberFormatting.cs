namespace Nethereum.Util
{
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.Globalization;
    using System.Runtime.InteropServices;
    using System.Text;

    internal static class NumberFormatting
    {
        private static readonly string[] s_posCurrencyFormats =
        {
            "$#", "#$", "$ #", "# $"
        };

        private static readonly string[] s_negCurrencyFormats =
        {
            "($#)", "-$#", "$-#", "$#-",
            "(#$)", "-#$", "#-$", "#$-",
            "-# $", "-$ #", "# $-", "$ #-",
            "$ -#", "#- $", "($ #)", "(# $)"
        };

        internal static char ParseFormatSpecifier(string format, out int digits)
        {
            char c = default;
            if (format.Length > 0)
            {
                // If the format begins with a symbol, see if it's a standard format
                // with or without a specified number of digits.
                c = format[0];
                if ((uint) (c - 'A') <= 'Z' - 'A' ||
                    (uint) (c - 'a') <= 'z' - 'a')
                {
                    // Fast path for sole symbol, e.g. "D"
                    if (format.Length == 1)
                    {
                        digits = -1;
                        return c;
                    }

                    if (format.Length == 2)
                    {
                        // Fast path for symbol and single digit, e.g. "X4"
                        int d = format[1] - '0';
                        if ((uint) d < 10)
                        {
                            digits = d;
                            return c;
                        }
                    }
                    else if (format.Length == 3)
                    {
                        // Fast path for symbol and double digit, e.g. "F12"
                        int d1 = format[1] - '0', d2 = format[2] - '0';
                        if ((uint) d1 < 10 && (uint) d2 < 10)
                        {
                            digits = d1 * 10 + d2;
                            return c;
                        }
                    }

                    // Fallback for symbol and any length digits.  The digits value must be >= 0 && <= 99,
                    // but it can begin with any number of 0s, and thus we may need to check more than two
                    // digits.  Further, for compat, we need to stop when we hit a null char.
                    int n = 0;
                    int i = 1;
                    while (i < format.Length && (((uint) format[i] - '0') < 10) && n < 10)
                    {
                        n = (n * 10) + format[i++] - '0';
                    }

                    // If we're at the end of the digits rather than having stopped because we hit something
                    // other than a digit or overflowed, return the standard format info.
                    if (i == format.Length || format[i] == '\0')
                    {
                        digits = n;
                        return c;
                    }
                }
            }

            // Default empty format to be "G"; custom format is signified with '\0'.
            digits = -1;
            return format.Length == 0 || c == '\0'
                ? // For compat, treat '\0' as the end of the specifier, even if the specifier extends beyond it.
                'G'
                : '\0';
        }

        internal static void FormatCurrency(StringBuilder result,
            bool isNegative, IList<byte> digits, int exponent,
            int maxDigits, NumberFormatInfo info)
        {
            string fmt = isNegative
                ? s_negCurrencyFormats[info.CurrencyNegativePattern]
                : s_posCurrencyFormats[info.CurrencyPositivePattern];

            foreach (char ch in fmt)
            {
                switch (ch)
                {
                    case '#':
                        FormatFixed(result, digits, exponent,
                            maxFractionalDigits: maxDigits,
                            info.CurrencyGroupSizes,
                            decimalSeparator: info.CurrencyDecimalSeparator,
                            groupSeparator: info.CurrencyGroupSeparator);
                        break;
                    case '-':
                        result.Append(info.NegativeSign);
                        break;
                    case '$':
                        result.Append(info.CurrencySymbol);
                        break;
                    default:
                        result.Append(ch);
                        break;
                }
            }
        }

        internal static void FormatFixed(StringBuilder sb, IList<byte> digits, int exponent,
            int maxFractionalDigits,
            int[] groupDigits, string decimalSeparator, string groupSeparator)
        {
            int digPos = digits.Count + exponent;
            int digitIndex = 0;

            if (digPos > 0)
            {
                if (groupDigits != null)
                {
                    Debug.Assert(groupSeparator != null, "Must be null when groupDigits != null");
                    int groupSizeIndex = 0; // Index into the groupDigits array.
                    int bufferSize = digPos; // The length of the result buffer string.
                    int groupSize = 0; // The current group size.

                    // Find out the size of the string buffer for the result.
                    if (groupDigits.Length != 0) // You can pass in 0 length arrays
                    {
                        int groupSizeCount = groupDigits[groupSizeIndex]; // The current total of group size.

                        while (digPos > groupSizeCount)
                        {
                            groupSize = groupDigits[groupSizeIndex];
                            if (groupSize == 0)
                                break;

                            bufferSize += groupSeparator.Length;
                            if (groupSizeIndex < groupDigits.Length - 1)
                                groupSizeIndex++;

                            groupSizeCount += groupDigits[groupSizeIndex];
                            if (groupSizeCount < 0 || bufferSize < 0)
                                throw new ArgumentOutOfRangeException(); // If we overflow
                        }

                        groupSize = groupSizeCount == 0
                            ? 0
                            : groupDigits[0]; // If you passed in an array with one entry as 0, groupSizeCount == 0
                    }

                    groupSizeIndex = 0;
                    int digitCount = 0;
                    //int digLength = number.DigitsCount;
                    int digLength = digits.Count;
                    int digStart = (digPos < digLength) ? digPos : digLength;
                    char[] spanPtr = new char[bufferSize];
                    int p = bufferSize - 1;
                    for (int i = digPos - 1; i >= 0; i--)
                    {
                        spanPtr[p--] = (i < digStart) ? (char) (digits[digitIndex + i]) : '0';

                        if (groupSize > 0)
                        {
                            digitCount++;
                            if ((digitCount == groupSize) && (i != 0))
                            {
                                for (int j = groupSeparator.Length - 1; j >= 0; j--)
                                    spanPtr[p--] = groupSeparator[j];

                                if (groupSizeIndex < groupDigits.Length - 1)
                                {
                                    groupSizeIndex++;
                                    groupSize = groupDigits[groupSizeIndex];
                                }

                                digitCount = 0;
                            }
                        }
                    }

                    sb.Append(spanPtr);

                    Debug.Assert(p >= -1, "Underflow");
                    digitIndex += digStart;
                }
                else
                {
                    do
                    {
                        sb.Append(digitIndex < digits.Count ? (char) digits[digitIndex++] : '0');
                    } while (--digPos > 0);
                }
            }
            else
            {
                sb.Append('0');
            }

            if (maxFractionalDigits > 0)
            {
                Debug.Assert(decimalSeparator != null);
                sb.Append(decimalSeparator);
                if ((digPos < 0) && (maxFractionalDigits > 0))
                {
                    int zeroes = Math.Min(-digPos, maxFractionalDigits);
                    sb.Append('0', zeroes);
                    digPos += zeroes;
                    maxFractionalDigits -= zeroes;
                }

                while (maxFractionalDigits > 0)
                {
                    sb.Append((digitIndex < digits.Count) ? (char) digits[digitIndex++] : '0');
                    maxFractionalDigits--;
                }
            }
        }
    }
}