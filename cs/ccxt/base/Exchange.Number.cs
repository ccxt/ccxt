using System.Text.RegularExpressions;
using System.Globalization;

namespace ccxt;


// to be implemented 

// numberToString,
// precisionFromString,
// decimalToPrecision,
// truncate_to_string,
// truncate,
// omitZero,
// precisionConstants,

public partial class BaseExchange
{

    public static int ROUND = 1;                // rounding mode
    public static int TRUNCATE = 0;
    public static int ROUND_UP = 2;
    public static int ROUND_DOWN = 3;
    public static int DECIMAL_PLACES = 2;        // digits counting mode
    public static int SIGNIFICANT_DIGITS = 3;
    public static int TICK_SIZE = 4;
    public static int NO_PADDING = 5;             // zero-padding mode
    public static int PAD_WITH_ZERO = 6;

    // Cached on first use: `Regex.Replace (input, pattern, ...)` goes through the static
    // Regex cache (bounded, guarded lookup) on every call. A `static readonly Regex` runs
    // the exact same pattern with the exact same options and skips that lookup entirely.
    private static readonly Regex exponentPrefixRegex = new Regex(@"\d\.?\d*[eE]", RegexOptions.None);

    public object precisionConstants = new
    {
        ROUND,
        TRUNCATE,
        ROUND_UP,
        ROUND_DOWN,
        DECIMAL_PLACES,
        SIGNIFICANT_DIGITS,
        TICK_SIZE,
        NO_PADDING,
        PAD_WITH_ZERO

    };

    public virtual string decimalToPrecision(object x, object roundingMode2, object numPrecisionDigits2, object countmode2 = null, object paddingMode = null) => DecimalToPrecision(x, roundingMode2, numPrecisionDigits2, countmode2, paddingMode);

    public static string DecimalToPrecision(object x, object roundingMode2, object numPrecisionDigits2, object countmode2 = null, object paddingMode = null)
    {
        countmode2 = countmode2 ?? DECIMAL_PLACES;
        paddingMode = paddingMode ?? NO_PADDING;
        var countMode = Convert.ToInt32(countmode2);
        var roundingMode = Convert.ToInt32(roundingMode2);
        // Trace.Assert(precision != null);
        var numPrecisionDigits = Convert.ToDouble(numPrecisionDigits2, CultureInfo.InvariantCulture);
        if (countMode == TICK_SIZE)
        {
            if (numPrecisionDigits2.GetType() == typeof(string))
            {
                // numPrecisionDigits = float.Parse(numPrecisionDigits2.ToString()); //  already done above
            }
            if (numPrecisionDigits < 0)
            {
                throw new Exception("TICK_SIZE cant be used with negative or zero numPrecisionDigits'");
            }
        }


        // The original implementation always evaluated Convert.ToDouble (x) up-front, which
        // also validated the input before NumberToString ran. NumberToString (unlike
        // Convert.ToDouble) accepts BigInteger and throws a different message for char and
        // DateTime, so reproduce the original validation for exactly those types — common
        // string/double inputs are validated by NumberToString with identical results and
        // skip the expensive double parse entirely.
        if (x is System.Numerics.BigInteger || x is char || x is DateTime)
        {
            Convert.ToDouble(x, CultureInfo.InvariantCulture);
        }

        if (numPrecisionDigits < 0)
        {
            var parsedX = Convert.ToDouble(x, CultureInfo.InvariantCulture);
            var toNearest = Math.Pow(10, Math.Abs(-(float)numPrecisionDigits));
            if (roundingMode == ROUND)
            {
                var res = DecimalToPrecision(parsedX / toNearest, roundingMode, 0, countmode2, paddingMode);
                return (toNearest * float.Parse(res, CultureInfo.InvariantCulture)).ToString();
            }
            if (roundingMode == TRUNCATE)
            {
                return (parsedX - (parsedX % toNearest)).ToString();
            }
        }
        /*handle tick size */
        if (countMode == TICK_SIZE)
        {
            var parsedX = Convert.ToDouble(x, CultureInfo.InvariantCulture);
            var precisionDigitsString = DecimalToPrecision(numPrecisionDigits, ROUND, 22, DECIMAL_PLACES, NO_PADDING);
            var newNumPrecisionDigits = PrecisionFromString(precisionDigitsString);
            if (roundingMode == TRUNCATE)
            {
                // Add these lines before the existing scaling logic:
                var xStr = NumberToString2(parsedX);
                var truncatedX = TruncateToString(xStr, Math.Max(0, newNumPrecisionDigits));
                parsedX = Convert.ToDouble(truncatedX, CultureInfo.InvariantCulture);

                var scale = Math.Pow(10, newNumPrecisionDigits);
                var xScaled = Math.Round(parsedX * scale);
                var tickScaled = Math.Round(numPrecisionDigits * scale);
                var ticks = Math.Truncate(xScaled / tickScaled);
                parsedX = (ticks * tickScaled) / scale;
                if ((int)paddingMode == NO_PADDING)
                {
                    // Fixed: avoid the Convert.ToDouble() that loses precision
                    var result = parsedX.ToString($"F{newNumPrecisionDigits}", CultureInfo.InvariantCulture);
                    return result.Contains('.') ? result.TrimEnd('0').TrimEnd('.') : result;
                }
                return DecimalToPrecision(parsedX, ROUND, newNumPrecisionDigits, DECIMAL_PLACES, paddingMode);
            }

            var missing = parsedX % numPrecisionDigits;
            // See: https://github.com/ccxt/ccxt/pull/6486
            missing = Convert.ToDouble(DecimalToPrecision(missing, ROUND, 8, DECIMAL_PLACES, NO_PADDING), CultureInfo.InvariantCulture);
            var fpError = DecimalToPrecision(missing / numPrecisionDigits, ROUND, Math.Max(newNumPrecisionDigits, 8), DECIMAL_PLACES, NO_PADDING);
            var fpErrorResult = PrecisionFromString(fpError);
            if (fpErrorResult != 0)
            {
                if (roundingMode == ROUND)
                {
                    if (parsedX > 0)
                    {
                        if (missing >= numPrecisionDigits / 2)
                        {
                            parsedX = parsedX - missing + numPrecisionDigits;
                        }
                        else
                        {
                            parsedX = parsedX - missing;
                        }
                    }
                    else
                    {
                        if (missing >= numPrecisionDigits / 2)
                        {
                            parsedX = parsedX - missing;
                        }
                        else
                        {
                            parsedX = parsedX - missing - numPrecisionDigits;
                        }
                    }
                }
                else if (roundingMode == TRUNCATE)
                {
                    parsedX = parsedX - missing;
                }
            }
            return DecimalToPrecision(parsedX, ROUND, newNumPrecisionDigits, DECIMAL_PLACES, paddingMode);
        }

        /*  Convert to a string (if needed), skip leading minus sign (if any)   */
        var str = NumberToString(x);
        var isNegative = str[0] == '-';
        var strStart = isNegative ? 1 : 0;
        var strEnd = str.Length;

        /*  Find the dot position in the source buffer   */
        var hasDot = str.IndexOf('.') >= 0;

        /*  Char code constants         */
        const int MINUS = 45;
        const int DOT = 46;
        const int ZERO = 48;
        const int ONE = (ZERO + 1);
        const int FIVE = (ZERO + 5);
        const int NINE = (ZERO + 9);

        /*  For -123.4567 the `chars` array will hold 01234567 (leading zero is reserved for rounding cases when 099 → 100)    */
        var arraySize = (strEnd - strStart) + (hasDot ? 0 : 1);
        var chars = new int[arraySize];
        chars[0] = ZERO;

        /*  Validate & copy digits, determine certain locations in the resulting buffer  */
        var afterDot = arraySize;
        var digitsStart = -1;
        var digitsEnd = -1;
        for (int i = 1, j = strStart; j < strEnd; i++, j++)
        {
            var c = (int)str[j];
            if (c == DOT)
            {
                afterDot = i--;
            }
            else if ((c < ZERO) || (c > NINE))
            {
                throw new Exception($"{str}: invalid number(contains an illegal character '${str[i - 1]}')");
            }
            else
            {
                chars[i] = c;
                if ((c != ZERO) && (digitsStart < 0))
                {
                    digitsStart = i;
                }
            }
        }

        if (digitsStart < 0)
        {
            digitsStart = 1;
        }

        var precisionStart = (countMode == DECIMAL_PLACES) ? afterDot : digitsStart;

        var precisionEnd = precisionStart + (int)numPrecisionDigits;

        /*  Reset the last significant digit index, as it will change during the rounding/truncation.   */

        digitsEnd = -1;

        // Perform rounding/truncation per digit, from digitsEnd to digitsStart, by using the following
        //  algorithm (rounding 999 → 1000, as an example):
        //
        //      step  =          i=3      i=2      i=1      i=0
        //
        //      chars =         0999     0999     0900     1000
        //      memo  =         ---0     --1-     -1--     0---
        var allZeros = true;
        var signNeeded = isNegative;
        // Loop invariants hoisted out: `ROUND` is a mutable static field (not a const), so the
        // JIT reloads it on every digit, and `precisionStart + numPrecisionDigits` is a fixed
        // double. `isTrue (memo)` boxed an int on every single digit — `memo != 0` is what
        // isTrue() computes for an integer, without the two allocations.
        var isRoundMode = (roundingMode == ROUND);
        var roundLimit = precisionStart + numPrecisionDigits;
        for (int i = chars.Length - 1, memo = 0; i >= 0; i--)
        {
            var c = chars[i];
            if (i != 0)
            {
                c += memo;
                if (i >= roundLimit)
                {
                    var ceil = isRoundMode
                                 && (c >= FIVE)
                                && !((c == FIVE) && (memo != 0)); // prevents rounding of 1.45 to 2
                    c = ceil ? (NINE + 1) : ZERO;
                }
                if (c > NINE)
                {
                    c = ZERO; memo = 1;
                }
                else memo = 0;
            }
            else if (memo != 0) c = ONE; // leading extra digit (0900 → 1000)
            chars[i] = c;
            if (c != ZERO)
            {
                allZeros = false;
                digitsStart = i;
                digitsEnd = (digitsEnd < 0) ? (i + 1) : digitsEnd;
            }
        }

        /*  Update the precision range, as `digitsStart` may have changed... & the need for a negative sign if it is only 0    */
        if (countMode == SIGNIFICANT_DIGITS)
        {
            precisionStart = digitsStart;
            precisionEnd = precisionStart + (int)numPrecisionDigits;
        }
        if (allZeros)
        {
            signNeeded = false;
        }

        /*  Determine the input character range     */

        var readStart = ((digitsStart >= afterDot) || allZeros) ? (afterDot - 1) : digitsStart; // 0.000(1)234  ----> (0).0001234
        var readEnd = (digitsEnd < afterDot) ? (afterDot) : digitsEnd;   // 12(3)000     ----> 123000( )

        /*  Compute various sub-ranges       */

        var nSign = (signNeeded ? 1 : 0);                // (-)123.456
        var nBeforeDot = (nSign + (afterDot - readStart));    // (-123).456
        var nAfterDot = Math.Max(readEnd - afterDot, 0);             // -123.(456)
        var actualLength = (readEnd - readStart);               // -(123.456)
        var desiredLength = ((int)paddingMode == NO_PADDING)
            ? (actualLength)                // -(123.456)
            : (precisionEnd - readStart);    // -(123.456    )
        var pad = Math.Max(desiredLength - actualLength, 0);   //  -123.456(    )
        var padStart = (nBeforeDot + 1 + nAfterDot);        //  -123.456( )
        var padEnd = (padStart + pad);                    //  -123.456     ( )
        var isInteger = (nAfterDot + pad) == 0;             //  -123

        /*  Fill the output buffer with characters    */

        // Build straight into a char[]: the previous int[] was converted with a LINQ
        // Select(...).ToArray() (iterator + delegate + growable buffer + a second array)
        // before the string copy. Same characters, one allocation instead of three.
        var outArray = new char[(nBeforeDot + (isInteger ? 0 : 1) + nAfterDot + pad)];

        // ------------------------------------------------------------------------------------------ // ---------------------
        if (signNeeded) outArray[0] = (char)MINUS;     // -     minus sign
        for (int i = nSign, j = readStart; i < nBeforeDot; i++, j++) outArray[i] = (char)chars[j];  // 123   before dot
        if (!isInteger) outArray[nBeforeDot] = (char)DOT;       // .     dot
        for (int i = nBeforeDot + 1, j = afterDot; i < padStart; i++, j++) outArray[i] = (char)chars[j];  // 456   after dot
        for (int i = padStart; i < padEnd; i++) outArray[i] = (char)ZERO;      // 000   padding

        /*  Build a string from the output buffer     */
        return new string(outArray);
    }

    public virtual int precisionFromString(object value2) => PrecisionFromString(value2);

    public static int PrecisionFromString(object value2)
    {
        if (value2 == null)
            return 0;
        var value = (string)value2;
        if (value.IndexOf('e') > -1 || value.IndexOf('E') > -1)
        {
            var numStr = exponentPrefixRegex.Replace(value, "");
            return (Int32.Parse(numStr) * -1);
        }
        value = value.TrimEnd('0');
        // The former `Regex.Replace (value, "/0+$/g", "")` here was a JS regex literal pasted
        // as a .NET pattern: it asks for "/0...0" followed by end-of-input followed by "/g",
        // which no input can satisfy, so it always returned `value` unchanged. The trailing
        // zeros it was meant to strip are already removed by the TrimEnd('0') above.
        var dotIndex = value.IndexOf('.');
        if (dotIndex < 0)
        {
            return 0;
        }
        // equivalent to Split('.')[1].Length: measure up to the next dot, if any
        var nextDotIndex = value.IndexOf('.', dotIndex + 1);
        return ((nextDotIndex < 0) ? value.Length : nextDotIndex) - dotIndex - 1;
    }

    public static string TruncateToString(object num, int precision = 0)
    {
        var numStr = NumberToString(num);
        if (numStr == null) return null;

        if (precision > 0)
        {
            // Fast path for canonical decimal strings ("-?<digits>[.<digits>]"), which is all
            // NumberToString ever produces. It reproduces the regex below exactly: cut after
            // `precision` fractional digits, but only when a further digit exists.
            var cut = canonicalTruncateCut(numStr, precision);
            if (cut > 0)
            {
                return numStr.Substring(0, cut);
            }
            if (cut == 0)
            {
                return numStr; // canonical, but the regex could not have matched
            }
            // Regex pattern: ([-]*\d+\.\d{precision})(\d)
            // Captures: minus sign (optional) + digits + dot + exactly 'precision' digits after dot
            var pattern = @"([-]*\d+\.\d{" + precision + @"})(\d)";
            var match = Regex.Match(numStr, pattern);

            if (match.Success)
            {
                return match.Groups[1].Value; // Return the first captured group
            }

            return numStr; // Return original if no match (e.g., number has fewer decimal places)
        }

        // If precision is 0, return integer part
        var dotIndex = numStr.IndexOf('.');
        if (dotIndex >= 0)
        {
            return numStr.Substring(0, dotIndex);
        }

        return numStr; // Already an integer
    }

    // Returns the cut index for TruncateToString's fast path, 0 when a canonical string needs
    // no truncation, or -1 when the input is not canonical and the regex must be used.
    private static int canonicalTruncateCut(string s, int precision)
    {
        var n = s.Length;
        var i = 0;
        if (i < n && s[i] == '-')
        {
            i++;
        }
        var intStart = i;
        while (i < n && s[i] >= '0' && s[i] <= '9')
        {
            i++;
        }
        if (i == intStart)
        {
            return -1; // no integer digits: the regex's `\d+` could still match further right
        }
        if (i == n)
        {
            return 0; // integer with no dot: the regex requires a '.', so it cannot match
        }
        if (s[i] != '.')
        {
            return -1;
        }
        var dot = i;
        i++;
        var fracStart = i;
        while (i < n && s[i] >= '0' && s[i] <= '9')
        {
            i++;
        }
        if (i != n)
        {
            return -1; // trailing junk
        }
        var fracLength = i - fracStart;
        return (fracLength > precision) ? (dot + 1 + precision) : 0;
    }

    public virtual string numberToString(object number) => NumberToString(number);

    public static string NumberToString(object number)

    {
        if (number == null)
            return null;
        if (number.GetType() == typeof(Int32) || number.GetType() == typeof(Int64))
            return number.ToString();
        if (number is System.Numerics.BigInteger)
            return number.ToString(); // BigInteger is not IConvertible, Convert.ToDecimal would throw

        // double doubleValue = -1;
        // if (number.GetType() == typeof(string))
        // {
        //     doubleValue = Double.Parse(number.ToString(), CultureInfo.InvariantCulture);
        // }
        // else if (number.GetType() == typeof(Single))
        // {
        //     doubleValue = Convert.ToDouble(number);

        // }
        // else
        // {
        //     doubleValue = (double)number;
        // }
        // var doubleValue = Double.Parse(number);
        var decimalValue = Convert.ToDecimal(number, CultureInfo.InvariantCulture);
        return decimalValue.ToString(CultureInfo.InvariantCulture); // https://stackoverflow.com/questions/1546113/double-to-string-conversion-without-scientific-notation
    }


    public static string NumberToString2(object number)
{
    if (number == null)
        return null;
    
    if (number.GetType() == typeof(Int32) || number.GetType() == typeof(Int64))
        return number.ToString();
    
    if (number.GetType() == typeof(string))
        return number.ToString();
    
    // Convert to double and get initial string representation
    var doubleValue = Convert.ToDouble(number, CultureInfo.InvariantCulture);
    var s = doubleValue.ToString("G", CultureInfo.InvariantCulture);
    
    // Handle scientific notation for small numbers (< 1.0)
    if (Math.Abs(doubleValue) < 1.0)
    {
        var lowerS = s.ToLower();
        if (lowerS.Contains("e-"))
        {
            var parts = lowerS.Split(new[] { "e-" }, StringSplitOptions.None);
            if (parts.Length == 2)
            {
                var n = parts[0].Replace(".", ""); // Remove decimal point
                var e = int.Parse(parts[1]);
                var isNegative = s[0] == '-';
                var numPart = isNegative ? n.Substring(1) : n; // Remove minus sign if present
                
                // Create the result: sign + "0." + zeros + number_part
                var zeros = new string('0', e - 1);
                var result = (isNegative ? "-" : "") + "0." + zeros + numPart;
                return result;
            }
        }
    }
    else
    {
        // Handle scientific notation for large numbers
        var lowerS = s.ToLower();
        if (lowerS.Contains("e"))
        {
            var parts = lowerS.Split('e');
            if (parts.Length == 2)
            {
                var e = int.Parse(parts[1]);
                var mantissaParts = parts[0].Split('.');
                var wholePart = mantissaParts[0];
                var fractionalPart = mantissaParts.Length > 1 ? mantissaParts[1] : "";
                
                if (fractionalPart.Length > 0)
                {
                    e -= fractionalPart.Length;
                }
                
                var zeros = new string('0', e);
                return wholePart + fractionalPart + zeros;
            }
        }
    }
    
    return s;
}
}