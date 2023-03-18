using System.Text;
using System.Security.Cryptography;

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

    public virtual string decimalToPrecision(object value, object roundingMode, object digits, object countmode, object decimal_places = null)
    {
        return "0";
    }

    public virtual float precisionFromString(object value)
    {
        return 0;
    }

    public virtual object sum(object a, object b)
    {
        return 0; // to do
    }

    public virtual object parseNumber(object value, object number = null)
    {
        if (value == null)
            return null;
        // tmp to do
        // return (float)value;
        if (value.GetType() == typeof(float))
        {
            return (float)value;
        }
        else if (value.GetType() == typeof(Int64))
        {
            return (Int64)value;
        }
        else if (value.GetType() == typeof(string))
        {
            var stringValue = (string)value;
            if (stringValue == null || stringValue == "")
            {
                return null;
            }
            return parseFloat((string)value);
        }
        else
        {
            return 0;
        }
    }

    public virtual string numberToString(object number)

    {
        var num = 5;
        var ceil = Math.Ceiling((double)num);
        var a = Math.Min(0, 5);
        var b = Math.Max(0, 5);
        var c = float.Parse("1.3");
        var d = Int32.Parse("1.3");
        var e = Int32.MaxValue;
        var f = Math.Abs(-2);
        var g = Math.Pow(1, 2);
        var h = Math.Round((double)5);
        var i = Math.Floor(5.5);

        return number.ToString();
    }

}