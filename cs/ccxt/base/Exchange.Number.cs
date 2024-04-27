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

public partial class Exchange
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


        var parsedX = Convert.ToDouble(x, CultureInfo.InvariantCulture);
        if (numPrecisionDigits < 0)
        {
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
            var precisionDigitsString = DecimalToPrecision(numPrecisionDigits, ROUND, 22, DECIMAL_PLACES, NO_PADDING);
            var newNumPrecisionDigits = PrecisionFromString(precisionDigitsString);
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
        var strDot = 0;
        for (strDot = 0; strDot < strEnd; strDot++)
        {
            if (str[strDot] == '.')
            {
                break;
            }
        }
        var hasDot = strDot < strEnd;

        /*  Char code constants         */
        var MINUS = 45;
        var DOT = 46;
        var ZERO = 48;
        var ONE = (ZERO + 1);
        var FIVE = (ZERO + 5);
        var NINE = (ZERO + 9);

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
            var value = str[j];
            var c = (int)Convert.ToChar(value);
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
        for (int i = chars.Length - 1, memo = 0; i >= 0; i--)
        {
            var c = chars[i];
            if (i != 0)
            {
                c += memo;
                if (i >= (precisionStart + numPrecisionDigits))
                {
                    var ceil = (roundingMode == ROUND)
                                 && (c >= FIVE)
                                && !((c == FIVE) && isTrue(memo)); // prevents rounding of 1.45 to 2
                    c = ceil ? (NINE + 1) : ZERO;
                }
                if (c > NINE)
                {
                    c = ZERO; memo = 1;
                }
                else memo = 0;
            }
            else if (isTrue(memo)) c = ONE; // leading extra digit (0900 → 1000)
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
        if (isTrue(allZeros))
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

        var outArray = new int[(nBeforeDot + (isInteger ? 0 : 1) + nAfterDot + pad)];

        // ------------------------------------------------------------------------------------------ // ---------------------
        if (signNeeded) outArray[0] = MINUS;     // -     minus sign
        for (int i = nSign, j = readStart; i < nBeforeDot; i++, j++) outArray[i] = chars[j];  // 123   before dot
        if (!isInteger) outArray[nBeforeDot] = DOT;       // .     dot
        for (int i = nBeforeDot + 1, j = afterDot; i < padStart; i++, j++) outArray[i] = chars[j];  // 456   after dot
        for (int i = padStart; i < padEnd; i++) outArray[i] = ZERO;      // 000   padding

        /*  Build a string from the output buffer     */
        var charArray = outArray.Select(c => (char)c).ToArray();
        return new string(charArray);
    }

    public virtual int precisionFromString(object value2) => PrecisionFromString(value2);

    public static int PrecisionFromString(object value2)
    {
        if (value2 == null)
            return 0;
        var value = (string)value2;
        if (value.IndexOf('e') > -1)
        {
            var numStr = Regex.Replace(value, @"/\de/", "");
            return (Int32.Parse(numStr) * -1);
        }
        var split = Regex.Replace(value, @"/0+$/g", "").Split('.');
        return split.Length > 1 ? split[1].Length : 0;
    }


    public virtual string numberToString(object number) => NumberToString(number);

    public static string NumberToString(object number)

    {
        if (number == null)
            return null;
        if (number.GetType() == typeof(string))
            return number;
        if (number.GetType() == typeof(Int32) || number.GetType() == typeof(Int64))
            return number.ToString();

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

}