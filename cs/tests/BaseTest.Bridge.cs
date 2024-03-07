using System.Globalization;

namespace Tests;
using ccxt;

using dict = System.Collections.Generic.Dictionary<string, object>;

public class Helper
{
    public static void Green(string message)
    {
        System.Console.ForegroundColor = System.ConsoleColor.Green;
        System.Console.WriteLine(message);
        System.Console.ResetColor();
    }

    public static void Red(string message)
    {
        System.Console.ForegroundColor = System.ConsoleColor.Red;
        System.Console.WriteLine(message);
        System.Console.ResetColor();
    }

    public static void Warn(string message)
    {
        System.Console.ForegroundColor = System.ConsoleColor.Yellow;
        System.Console.WriteLine(message);
        System.Console.ResetColor();
    }
}

public partial class BaseTest
{
    public static void Assert(object condition2, object message2 = null)
    {
        var condition = true;
        // var condition = (bool)condition2;
        if (condition2 == null)
        {
            condition = false;
        }
        else if (condition2.GetType() == typeof(bool))
        {
            condition = (bool)condition2;
        }
        var message = message2?.ToString();
        if (!condition)
        {
            var errorMessage = "Assertion failed";
            if (message != null)
            {
                errorMessage += ": " + message;
            }
            throw new Exception(errorMessage);
        }
    }

    public static void assert(object condition, object message) => Assert(condition, message);
}

public partial class BaseTest
{
    public int TRUNCATE = ccxt.Exchange.TRUNCATE;
    public int DECIMAL_PLACES = ccxt.Exchange.DECIMAL_PLACES;
    public int ROUND = ccxt.Exchange.ROUND;
    public int ROUND_UP = ccxt.Exchange.ROUND_UP;
    public int ROUND_DOWN = ccxt.Exchange.ROUND_DOWN;
    public int SIGNIFICANT_DIGITS = ccxt.Exchange.SIGNIFICANT_DIGITS;
    public int TICK_SIZE = ccxt.Exchange.TICK_SIZE;
    public int NO_PADDING = ccxt.Exchange.NO_PADDING;
    public int PAD_WITH_ZERO = ccxt.Exchange.PAD_WITH_ZERO;

    // public ccxt.Precise Precise = ccxt.Precise;
    // initialize methods used here; (improve this later)
}

public partial class BaseTest
{

    // bridges to make auxiliary methods available in tests
    //

    public static object mod(object a, object b) => Exchange.mod(a, b);

    public string decimalToPrecision(object a, object b, object c = null, object d = null, object e = null) => Exchange.DecimalToPrecision(a, b, c, d, e);
    public virtual string numberToString(object number) => Exchange.NumberToString(number);
    public static Task<List<object>> promiseAll(object a) => ccxt.Exchange.PromiseAll(a);
    public static object getValue(object a, object b) => Exchange.GetValue(a, b);

    public static bool inOp(object a, object b) => Exchange.InOp(a, b);
    public static int getIndexOf(object a, object b) => Exchange.getIndexOf(a, b);
    public static object getArrayLength(object a) => Exchange.getArrayLength(a);
    public static bool isLessThan(object a, object b) => Exchange.isLessThan(a, b);
    public static bool isGreaterThan(object a, object b) => Exchange.isGreaterThan(a, b);
    public static bool isGreaterThanOrEqual(object a, object b) => Exchange.isGreaterThanOrEqual(a, b);
    public static bool isLessThanOrEqual(object a, object b) => Exchange.isLessThanOrEqual(a, b);
    public static object postFixIncrement(ref object a) => Exchange.postFixIncrement(ref a);
    public static object add(object a, object b) => Exchange.add(a, b);
    public static object multiply(object a, object b) => Exchange.multiply(a, b);
    public static object subtract(object a, object b) => Exchange.subtract(a, b);
    public static string toStringOrNull(object a) => Exchange.toStringOrNull(a);
    public static bool isEqual(object a, object b) => Exchange.isEqual(a, b);
    public static bool isTrue(object a) => Exchange.isTrue(a);
    public static object encode(object a) => a;
    public static object hash(object request2, Delegate algorithm2 = null, object digest2 = null) => Exchange.Hash(request2, algorithm2, digest2);
    public static string hmac(object request2, object secret2, Delegate algorithm2 = null, string digest = "hex") => Exchange.Hmac(request2, secret2, algorithm2, digest);
    public static string rsa(object request, object secret, Delegate alg = null) => Exchange.Rsa(request, secret, alg);
    public static object ecdsa(object request, object secret, Delegate alg = null, Delegate stub = null) => Exchange.Ecdsa(request, secret, alg, stub);
    public string jwt(object data, object secret, Delegate alg = null, bool isRsa = false) => Exchange.Jwt(data, secret, alg, isRsa);

    public static object crc32(object str, object signed2 = null) => Exchange.Crc32(str, signed2);
    public static string sha1() => "sha1";
    public static string sha256() => "sha256";
    public static string sha384() => "sha384";
    public static string sha512() => "sha512";
    public static string md5() => "md5";
    public static string ed25519() => "ed25519";
    public static string keccak() => "keccak";
    public static string secp256k1() => "secp256k1";

    public bool equals(object a, object b)
    {
        if (a is IList<object>)
        {
            var list1 = (IList<object>)a;
            var list2 = (IList<object>)b;
            if (list1.Count != list2.Count)
            {
                return false;
            }
            for (int i = 0; i < list1.Count; i++)
            {
                var item1 = list1[i];
                var item2 = list2[i];
                // recursive comparion
                if (!equals(item1, item2))
                {
                    return false;
                }
            }
            return true;
        }
        else if (a is IDictionary<string, object>)
        {
            var dict1 = a as IDictionary<string, object>;
            var dict2 = b as IDictionary<string, object>;

            var keysA = dict1.Keys;
            foreach (var key in keysA)
            {
                if (!dict2.ContainsKey(key))
                {
                    return false;
                }
                if (!equals(dict1[key], dict2[key]))
                {
                    return false;
                }
            }
            return true;
        }
        return isEqual(a, b);

    }

}