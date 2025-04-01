using System.Globalization;

namespace examples;
using ccxt;

using dict = System.Collections.Generic.Dictionary<string, object>;

partial class Examples
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
}