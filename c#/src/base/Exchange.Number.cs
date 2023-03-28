using System.Text;
using System.Security.Cryptography;
using System.Diagnostics;
using System.Text.RegularExpressions;
using System.Globalization;

namespace Main;


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

    public static int ROUND = 0;                // rounding mode
    public static int TRUNCATE = 1;
    public static int ROUND_UP = 2;
    public static int ROUND_DOWN = 3;
    public static int DECIMAL_PLACES = 0;        // digits counting mode
    public static int SIGNIFICANT_DIGITS = 1;
    public static int TICK_SIZE = 2;
    public static int NO_PADDING = 0;             // zero-padding mode
    public static int PAD_WITH_ZERO = 1;

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

    public virtual string decimalToPrecision(object x, object roundingMode2, object numPrecisionDigits2, object countmode2 = null, object paddingMode = null)
    {
        countmode2 = countmode2 ?? DECIMAL_PLACES;
        paddingMode = paddingMode ?? NO_PADDING;
        var countMode = (int)countmode2;
        var roundingMode = (int)roundingMode2;
        Trace.Assert(precision != null);
        var numPrecisionDigits = float.Parse(numPrecisionDigits2.ToString(), CultureInfo.InvariantCulture);
        if (countMode == TICK_SIZE)
        {
            if (numPrecisionDigits2.GetType() == typeof(string))
            {
                // numPrecisionDigits = float.Parse(numPrecisionDigits2.ToString()); //  already done above
            }
            if ((float)numPrecisionDigits < 0)
            {
                throw new Exception("TICK_SIZE cant be used with negative or zero numPrecisionDigits'");
            }
        }


        var parsedX = float.Parse(x.ToString(), CultureInfo.InvariantCulture);
        if ((float)numPrecisionDigits < 0)
        {
            var toNearest = Math.Pow(10, Math.Abs(-(float)numPrecisionDigits));
            if (roundingMode == ROUND)
            {
                var res = decimalToPrecision((double)x / toNearest, roundingMode, 0, countmode2, paddingMode);
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
            var precisionDigitsString = decimalToPrecision(numPrecisionDigits, ROUND, 22, DECIMAL_PLACES, NO_PADDING);
            var newNumPrecisionDigits = precisionFromString(precisionDigitsString);
            var missing = parsedX % float.Parse(newNumPrecisionDigits, CultureInfo.InvariantCulture);
            // See: https://github.com/ccxt/ccxt/pull/6486
            // missing = Number(decimalToPrecision(missing, ROUND, 8, DECIMAL_PLACES, NO_PADDING));
            var fpError = decimalToPrecision(missing / float.Parse(numPrecisionDigits.ToString()), ROUND, Math.Max(float.Parse(newNumPrecisionDigits, CultureInfo.InvariantCulture), 8), DECIMAL_PLACES, NO_PADDING);
            var fpErrorResult = float.Parse(precisionFromString(fpError), CultureInfo.InvariantCulture);
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
            return decimalToPrecision(parsedX, ROUND, newNumPrecisionDigits, DECIMAL_PLACES, NO_PADDING);
        }


        object precise = null;
        if (roundingMode == ROUND)
        {
            if (countMode == DECIMAL_PLACES)
            {

            }
        }

        return "0";

    }

    public virtual string precisionFromString(object value2)
    {
        if (value2 == null)
            return null;
        var value = (string)value2;
        if (value.IndexOf('e') > -1)
        {
            var numStr = Regex.Replace(value, @"/\de/", "");
            return (Int64.Parse(numStr) * -1).ToString();
        }
        var split = Regex.Replace(value, @"/0+$/g", "").Split('.');
        return split.Length > 1 ? split[1].Length.ToString() : "0";
    }


    public virtual string numberToString(object number)

    {
        if (number == null)
            return null;
        if (number.GetType() == typeof(Int32) || number.GetType() == typeof(Int64))
            return number.ToString();
        var doubleValue = (double)number;
        var decimalValue = (decimal)doubleValue;
        return decimalValue.ToString(CultureInfo.InvariantCulture); // https://stackoverflow.com/questions/1546113/double-to-string-conversion-without-scientific-notation
    }

}