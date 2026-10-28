namespace ccxt;

using System.Globalization;

// hx11 w8: typed, non-throwing twins of the TS globals parseInt(string) / parseFloat(string), for a call
// whose operand the C# printer proved a `string` / `string?` (build/hx11w8-parse.ts). They follow the
// ECMAScript algorithm (leading whitespace, sign, longest numeric prefix; no digits -> NaN), reported as
// null instead of NaN, with the invariant culture. They never throw: a string with no numeric prefix, a
// null string and an Int64 overflow all answer null (the helpers they replace also answered null on a
// throw, but accepted whole-string forms like "1e3" for parseInt and threw on "12abc").
public static class JsParse
{
    // ECMAScript WhiteSpace + LineTerminator
    private static bool IsJsSpace(char c) => char.IsWhiteSpace(c) || c == '\uFEFF';

    private static int SkipSpace(string s)
    {
        int i = 0;
        while (i < s.Length && IsJsSpace(s[i]))
        {
            i++;
        }
        return i;
    }

    // parseInt(string) with no radix argument: decimal, or hex after a 0x / 0X prefix
    public static Int64? parseInt(string s)
    {
        if (s == null)
        {
            return null;
        }
        int i = SkipSpace(s);
        bool negative = false;
        if (i < s.Length && (s[i] == '+' || s[i] == '-'))
        {
            negative = s[i] == '-';
            i++;
        }
        int radix = 10;
        if (i + 1 < s.Length && s[i] == '0' && (s[i + 1] == 'x' || s[i + 1] == 'X'))
        {
            radix = 16;
            i += 2;
        }
        Int64 value = 0;
        int digits = 0;
        for (; i < s.Length; i++)
        {
            char c = s[i];
            int d;
            if (c >= '0' && c <= '9') d = c - '0';
            else if (radix == 16 && c >= 'a' && c <= 'f') d = c - 'a' + 10;
            else if (radix == 16 && c >= 'A' && c <= 'F') d = c - 'A' + 10;
            else break;
            // accumulate negatively so Int64.MinValue is representable; overflow -> null
            try
            {
                value = checked(value * radix - d);
            }
            catch (OverflowException)
            {
                return null;
            }
            digits++;
        }
        if (digits == 0)
        {
            return null;
        }
        if (negative)
        {
            return value;
        }
        if (value == Int64.MinValue)
        {
            return null;
        }
        return -value;
    }

    // parseFloat(string): StrDecimalLiteral prefix (sign, Infinity, digits[.digits][e[sign]digits])
    public static double? parseFloat(string s)
    {
        if (s == null)
        {
            return null;
        }
        int i = SkipSpace(s);
        int start = i;
        if (i < s.Length && (s[i] == '+' || s[i] == '-'))
        {
            i++;
        }
        if (string.CompareOrdinal(s, i, "Infinity", 0, 8) == 0)
        {
            return s[start] == '-' ? double.NegativeInfinity : double.PositiveInfinity;
        }
        int intDigits = 0;
        while (i < s.Length && s[i] >= '0' && s[i] <= '9')
        {
            i++;
            intDigits++;
        }
        int fracDigits = 0;
        if (i < s.Length && s[i] == '.')
        {
            int j = i + 1;
            while (j < s.Length && s[j] >= '0' && s[j] <= '9')
            {
                j++;
                fracDigits++;
            }
            if (intDigits > 0 || fracDigits > 0)
            {
                i = j;
            }
        }
        if (intDigits == 0 && fracDigits == 0)
        {
            return null;
        }
        if (i < s.Length && (s[i] == 'e' || s[i] == 'E'))
        {
            int j = i + 1;
            if (j < s.Length && (s[j] == '+' || s[j] == '-'))
            {
                j++;
            }
            int expDigits = 0;
            while (j < s.Length && s[j] >= '0' && s[j] <= '9')
            {
                j++;
                expDigits++;
            }
            if (expDigits > 0)
            {
                i = j;
            }
        }
        double result;
        if (double.TryParse(s.Substring(start, i - start), NumberStyles.Float, CultureInfo.InvariantCulture, out result))
        {
            return result;
        }
        return null;
    }
}
