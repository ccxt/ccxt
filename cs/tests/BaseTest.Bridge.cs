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

    public string decimalToPrecision(object a, object b, object c = null, object d = null, object e = null) => Exchange.DecimalToPrecision(a, b, c, d, e);
    public virtual string numberToString(object number) => Exchange.NumberToString(number);
    public static Task<List<object>> promiseAll(object a) => ccxt.Exchange.PromiseAll(a);
    public static object getValue(object a, object b) => Exchange.GetValue((a is ValueType || (a is System.Collections.IList && !(a is IList<object>))) ? toComparable(a) : a, b);

    // struct-aware compare seam (test harness only): a unified struct (Ticker, Order, ...) or a
    // collection of them becomes the plain dict/list the fixtures hold; anything else passes through
    public static object toComparable(object a) => testMainClass.detypeForComparison(a);
    public static dict toDict(object a) => (dict)testMainClass.detypeForComparison(a);

    public static bool inOp(object a, object b) => Exchange.InOp(a, b);
    // typed twin mirroring Exchange.TranspileHelpers.cs (S58): Dictionary<string, object> + string
    // takes InOp's IDictionary branch (a Dictionary is not an IList), ContainsKey behind null guards
    public static bool inOp(Dictionary<string, object> a, string b) => Exchange.InOp(a, b);
    public static int getArrayLength(object a) => Exchange.getArrayLength(a);
    // typed twins mirroring Exchange.TranspileHelpers.cs (S58): a generated test operand that is
    // statically List<object>/IList<object> must resolve to the library's own list branch
    public static int getArrayLength(List<object> a) => Exchange.getArrayLength(a);
    public static int getArrayLength(IList<object> a) => Exchange.getArrayLength(a);
    private static object normalizeIntIfNeeded(object a)
    {
        if (a == null) return null;
        if (a is int || a is uint) return System.Convert.ToInt64(a);
        return a;
    }
    public static bool isGreaterThan(object a, object b)
    {
        if (a != null && b == null) return true;
        if (a == null || b == null) return false;
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);
        if (a.GetType() == typeof(Int64) && b.GetType() == typeof(Int64)) return Convert.ToInt64(a) > Convert.ToInt64(b);
        if (a.GetType() == typeof(int) && b.GetType() == typeof(int)) return (int)a > (int)b;
        if (a.GetType() == typeof(double) || b.GetType() == typeof(double)) return Convert.ToDouble(a) > Convert.ToDouble(b);
        if (a.GetType() == typeof(string)) return ((string)a).CompareTo((string)b) > 0;
        return false;
    }
    public static bool isLessThan(object a, object b) => !isGreaterThan(a, b) && !Exchange.isEqual(a, b);
    public static bool isGreaterThanOrEqual(object a, object b) => isGreaterThan(a, b) || Exchange.isEqual(a, b);
    public static bool isLessThanOrEqual(object a, object b) => isLessThan(a, b) || Exchange.isEqual(a, b);
    public static object postFixIncrement(ref object a)
    {
        if (a is Int64) { a = (Int64)a + 1; }
        else if (a is int) { a = (int)a + 1; }
        else if (a is double) { a = (double)a + 1; }
        else if (a is string) { a = (string)a + 1; }
        else { return null; }
        return a;
    }
    public static int postFixIncrement(ref int a) { a = a + 1; return a; }
    public static Int64 postFixIncrement(ref Int64 a) { a = a + 1; return a; }
    public static double postFixIncrement(ref double a) { a = a + 1; return a; }
    public static object mathMax(object a, object b)
    {
        if (a == null || b == null) return null;
        return Convert.ToDouble(a) > Convert.ToDouble(b) ? a : b;
    }
    public static object add(object a, object b)
    {
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);
        if (a is Int64) { return (Int64)a + (Int64)b; }
        if (a is double) { return (double)a + Convert.ToDouble(b); }
        if (a is string) { return (string)a + (string)b; }
        return null;
    }
    public static string add(string a, string b) => (string)add((object)a, (object)b);
    public static string add(string a, object b) => (string)add((object)a, b);
    public static Int64 add(Int64 a, Int64 b) => a + b;
    public static double add(double a, double b) => a + b;
    public static object multiply(object a, object b)
    {
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);
        if (a == null || b == null) { return null; }
        if (a is Int64 && b is Int64) { return (Int64)a * (Int64)b; }
        var res = System.Convert.ToDouble(a) * System.Convert.ToDouble(b);
        return Exchange.IsInteger(res) ? (object)System.Convert.ToInt64(res) : res;
    }
    public static Int64 multiply(Int64 a, Int64 b) => a * b;
    public static Int64? multiply(Int64? a, Int64? b) => a * b;
    public static object subtract(object a, object b)
    {
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);
        if (a.GetType() == typeof(Int64)) { return (Int64)a - (Int64)b; }
        if (a.GetType() == typeof(int)) { return (int)a - (int)b; }
        if (a.GetType() == typeof(double)) { return (double)a - System.Convert.ToDouble(b); }
        return null;
    }
    public static int subtract(int a, int b) => a - b;
    public static Int64 subtract(Int64 a, Int64 b) => a - b;
    public static double subtract(double a, double b) => a - b;
    public static object divide(object a, object b)
    {
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);
        if (a == null || b == null) { return null; }
        if (a.GetType() == typeof(Int64) && b.GetType() == typeof(Int64)) { return (double)(Int64)a / (Int64)b; }
        if (a.GetType() == typeof(double) && b.GetType() == typeof(double)) { return (double)a / (double)b; }
        return System.Convert.ToDouble(a) / System.Convert.ToDouble(b);
    }
    public static double divide(Int64 a, Int64 b) => (double)a / b;
    public static double divide(double a, double b) => a / b;
    public static double? divide(Int64? a, Int64? b) => (double?)a / b;
    public static bool isEqual(object a, object b) => Exchange.isEqual(a, b);
    public static bool isTrue(bool a) => a;
    public static bool isTrue(object value)
    {
        if (value == null) { return false; }
        value = normalizeIntIfNeeded(value);
        if (value is bool b) { return b; }
        if (value is Int64 i) { return i != 0; }
        if (value is double d) { return d != 0; }
        if (value is string s) { return s != ""; }
        if (value is IList<object> lo) { return lo.Count > 0; }
        if (value is IList<string> ls) { return ls.Count > 0; }
        if (value is IList<int> li) { return li.Count > 0; }
        if (value is IList<Int64> l64) { return l64.Count > 0; }
        if (value is IList<double> ld) { return ld.Count > 0; }
        if (value is IDictionary<string, object>) { return true; }
        return false;
    }
    public static object encode(object a) => a;
    public static object hash(object request2, Delegate algorithm2 = null, object digest2 = null) => Exchange.Hash(request2, algorithm2, digest2);
    public static string hmac(object request2, object secret2, Delegate algorithm2 = null, string digest = "hex") => Exchange.Hmac(request2, secret2, algorithm2, digest);
    public static string rsa(object request, object secret, Delegate alg = null) => Exchange.Rsa(request, secret, alg);
    // mirrors the base signature, which now names the { r, s, v } dictionary Ecdsa builds
    public static Dictionary<string, object> ecdsa(object request, object secret, Delegate alg = null, Delegate stub = null) => Exchange.Ecdsa(request, secret, alg, stub);
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
    public static object parseFloat(object a)
    {
        try
        {
            return Convert.ToDouble(a, System.Globalization.CultureInfo.InvariantCulture.NumberFormat);
        }
        catch (Exception)
        {
            return null;
        }
    }
    public static object callDynamically(object obj, object methodName, object[] args = null) => Exchange.callDynamically(obj, methodName, args);

    public bool equals(object a, object b)
    {
        a = toComparable(a);
        b = toComparable(b);
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

    // string (not object) so generated `string x = json(...)` locals compile
    public string json(object a)
    {
        return Exchange.Json(a);
    }

    public object DeepEqual(object a, object b)
    {
        return isEqual(json(toComparable(a)), json(toComparable(b)));
    }

    public void AssertDeepEqual(Exchange exchange, object skippedProperties, object method, object a, object b)
    {
        a = toComparable(a);
        b = toComparable(b);
        assert(DeepEqual(a, b), add(add(add(add("two dicts do not match: ", Exchange.Json(a)), " != "), Exchange.Json(b)), method));
    }

    public object exchangeProp(Exchange exchange, object key, object defaultValue = null)
    {
        object value = exchange.getProperty(exchange, ((object)key).ToString());
        if (isTrue(!isEqual(value, null)))
        {
            return value;
        }
        // try UpperCase key also, for other langs
        object keyUpper = exchange.capitalize(((object)key).ToString());
        return exchange.getProperty(exchange, keyUpper, defaultValue);
    }
}



public partial class BaseTest
{
    public async Task testLanguageSpecific()
    {
        // hand-written C#-only: throttler lock under concurrent callers (offline, mocked fetch)
        await MultithreadTest();

        // hand-written C#-only: dual-stack (IPv4 + IPv6) transport checks (offline)
        testDualStack();

        // hand-written C#-only: the reflective await must rebox typed dict lists for the untyped pipeline (offline)
        await testFromTypedRebox();

        // hand-written C#-only: a wrong-typed option throws BadRequest (offline)
        testOptionTypes();
    }
}
