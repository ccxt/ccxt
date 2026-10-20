using System.Globalization;

namespace examples;
using ccxt;

using dict = System.Collections.Generic.Dictionary<string, object>;

partial class Examples
{

    // bridges to make auxiliary methods available in tests
    //

    // the S57 typed twins mirror Exchange.TranspileHelpers.cs (see BaseTest.Bridge.cs)
    public static object mod(object a, object b) => Exchange.mod(a, b);
    public static Int64 mod(Int64 a, Int64 b) => Exchange.mod(a, b);
    public static Int64 mod(double a, double b) => Exchange.mod(a, b);
    public static Int64? mod(Int64? a, Int64? b) => Exchange.mod(a, b);

    public string decimalToPrecision(object a, object b, object c = null, object d = null, object e = null) => Exchange.DecimalToPrecision(a, b, c, d, e);
    public virtual string numberToString(object number) => Exchange.NumberToString(number);
    public static Task<List<object>> promiseAll(object a) => ccxt.Exchange.PromiseAll(a);
    public static object getValue(object a, object b) => Exchange.GetValue(a, b);

    public static bool inOp(object a, object b) => Exchange.InOp(a, b);
    // typed twin mirroring Exchange.TranspileHelpers.cs (S58): Dictionary<string, object> + string
    // takes InOp's IDictionary branch (a Dictionary is not an IList), ContainsKey behind null guards
    public static bool inOp(Dictionary<string, object> a, string b) => Exchange.InOp(a, b);
    public static int getIndexOf(object a, object b) => Exchange.getIndexOf(a, b);
    public static int getArrayLength(object a) => Exchange.getArrayLength(a);
    // typed twins mirroring Exchange.TranspileHelpers.cs (S58): an example operand that is
    // statically List<object>/IList<object> must resolve to the library's own list branch
    public static int getArrayLength(List<object> a) => Exchange.getArrayLength(a);
    public static int getArrayLength(IList<object> a) => Exchange.getArrayLength(a);
    public static bool isLessThan(object a, object b) => Exchange.isLessThan(a, b);
    public static bool isGreaterThan(object a, object b) => Exchange.isGreaterThan(a, b);
    public static bool isGreaterThanOrEqual(object a, object b) => Exchange.isGreaterThanOrEqual(a, b);
    public static bool isLessThanOrEqual(object a, object b) => Exchange.isLessThanOrEqual(a, b);
    public static object postFixIncrement(ref object a) => Exchange.postFixIncrement(ref a);
    public static int postFixIncrement(ref int a) => Exchange.postFixIncrement(ref a);
    public static Int64 postFixIncrement(ref Int64 a) => Exchange.postFixIncrement(ref a);
    public static double postFixIncrement(ref double a) => Exchange.postFixIncrement(ref a);
    public static double postFixDecrement(ref double a) => Exchange.postFixDecrement(ref a);
    // the (ref object) prefix twins mirror cs/tests/BaseTest.Bridge.cs / Exchange.TranspileHelpers.cs
    public static object prefixUnaryNeg(ref object a) => Exchange.prefixUnaryNeg(ref a);
    public static int prefixUnaryNeg(ref int a) => Exchange.prefixUnaryNeg(ref a);
    public static Int64 prefixUnaryNeg(ref Int64 a) => Exchange.prefixUnaryNeg(ref a);
    public static double prefixUnaryNeg(ref double a) => Exchange.prefixUnaryNeg(ref a);
    public static object prefixUnaryPlus(ref object a) => Exchange.prefixUnaryPlus(ref a);
    public static int prefixUnaryPlus(ref int a) => Exchange.prefixUnaryPlus(ref a);
    public static Int64 prefixUnaryPlus(ref Int64 a) => Exchange.prefixUnaryPlus(ref a);
    public static double prefixUnaryPlus(ref double a) => Exchange.prefixUnaryPlus(ref a);
    // typed ref twins for `x--` counters, mirroring Exchange.TranspileHelpers.cs
    public static object postFixDecrement(ref object a) => Exchange.postFixDecrement(ref a);
    public static int postFixDecrement(ref int a) => Exchange.postFixDecrement(ref a);
    public static Int64 postFixDecrement(ref Int64 a) => Exchange.postFixDecrement(ref a);
    public static object add(object a, object b) => Exchange.add(a, b);
    public static string add(string a, string b) => Exchange.add(a, b);
    public static string add(string a, object b) => Exchange.add(a, b);
    // S57's typed add twins (mirrored from Exchange.TranspileHelpers.cs): the example tier
    // must resolve a numerically typed `a + b` exactly as the library does
    public static Int64 add(Int64 a, Int64 b) => Exchange.add(a, b);
    public static double add(double a, double b) => Exchange.add(a, b);
    public static object multiply(object a, object b) => Exchange.multiply(a, b);
    public static Int64 multiply(Int64 a, Int64 b) => Exchange.multiply(a, b);
    public static Int64? multiply(Int64? a, Int64? b) => Exchange.multiply(a, b);
    public static object subtract(object a, object b) => Exchange.subtract(a, b);
    public static int subtract(int a, int b) => Exchange.subtract(a, b);
    public static Int64 subtract(Int64 a, Int64 b) => Exchange.subtract(a, b);
    public static double subtract(double a, double b) => Exchange.subtract(a, b);
    public static object divide(object a, object b) => Exchange.divide(a, b);
    public static Int64 divide(Int64 a, Int64 b) => Exchange.divide(a, b);
    public static double divide(double a, double b) => Exchange.divide(a, b);
    public static Int64? divide(Int64? a, Int64? b) => Exchange.divide(a, b);
    public static string toStringOrNull(object a) => Exchange.toStringOrNull(a);
    public static bool isEqual(object a, object b) => Exchange.isEqual(a, b);
    public static bool isTrue(object a) => Exchange.isTrue(a);
    // typed twin mirroring Exchange.TranspileHelpers.cs (S58): `isTrue` is the identity on a bool
    public static bool isTrue(bool a) => Exchange.isTrue(a);
    public static object encode(object a) => a;
}