namespace ccxt;

using System.Globalization;
using System.Reflection;

using dict = Dictionary<string, object>;


public partial class Exchange
{

    // tmp most of these methods are going to be re-implemented in the future to be more generic and efficient

    public static object normalizeIntIfNeeded(object a)
    {
        if (a == null)
            return null;

        if (a is int)
        {
            return System.Convert.ToInt64(a);
        }
        return a;
    }
    public static object postFixIncrement(ref object a)
    {
        if (a is Int64)
        {
            a = (Int64)a + 1;
        }
        else if (a is int)
        {
            a = (int)a + 1;
        }
        else if (a is double)
        {
            a = (double)a + 1;
        }
        else if (a is string)
        {
            a = (string)a + 1;
        }
        else
        {
            return null;
        }
        return a;
    }

    public static object postFixDecrement(ref object a)
    {

        if (a is Int64)
        {
            a = (Int64)a - 1;
        }
        else if (a is int)
        {
            a = (int)a - 1;
        }
        else if (a is double)
        {
            a = (double)a - 1;
        }
        else
        {
            return null;
        }
        return a;

    }

    public static object prefixUnaryNeg(ref object a)
    {
        if (a.GetType() == typeof(Int64))
        {
            a = -(Int64)a;
        }
        else if (a.GetType() == typeof(int))
        {
            a = -(int)a;
        }
        else if (a.GetType() == typeof(double))
        {
            a = -(double)a;
        }
        else if (a.GetType() == typeof(string))
        {
            return null;
        }
        else
        {
            return null;
        }
        return a;
    }

    public static object prefixUnaryPlus(ref object a)
    {
        if (a.GetType() == typeof(Int64))
        {
            a = +(Int64)a;
        }
        else if (a.GetType() == typeof(int))
        {
            a = +(int)a;
        }
        else if (a.GetType() == typeof(double))
        {
            a = +(double)a;
        }
        else if (a.GetType() == typeof(string))
        {
            return null;
        }
        else
        {
            return null;
        }
        return a;
    }

    public static object plusEqual(object a, object value)
    {

        a = normalizeIntIfNeeded(a);
        value = normalizeIntIfNeeded(value);

        if (value == null)
            return null;
        if (a.GetType() == typeof(Int64))
        {
            a = (Int64)a + (Int64)value;
        }
        else if (a.GetType() == typeof(int))
        {
            a = (int)a + (int)value;
        }
        else if (a.GetType() == typeof(double))
        {
            a = (double)a + (double)value;
        }
        else if (a.GetType() == typeof(string))
        {
            a = (string)a + (string)value;
        }
        else
        {
            return null;
        }
        return a;
    }

    public object parseJson(object json)
    {
        // var jsonString = json.ToString();
        // if (jsonString.StartsWith("[".ToString()))
        // {
        //     return JsonConvert.DeserializeObject<List<dict>>(jsonString);
        // }
        // return JsonConvert.DeserializeObject<dict>((string)json);
        return JsonHelper.Deserialize((string)json);
    }

    public static bool isTrue(object value)
    {
        if (value == null)
        {
            return false;
        }

        value = normalizeIntIfNeeded(value);

        // return value != null && value != false && value != 0 && value != "" && value != "0" && value != "false" && value != "False" && value != "FALSE";
        if (value is (bool))
        {
            return (bool)value;
        }
        else if (value is (Int64))
        {
            return (Int64)value != 0;
        }
        else if (value is (double))
        {
            return (double)value != 0;
        }
        else if (value is (string))
        {
            return (string)value != "";
        }
        else if (value is (IList<object>))
        {
            return ((IList<object>)value).Count > 0;
        }
        else if (value is (IList<string>))
        {
            return ((IList<string>)value).Count > 0;
        }
        else if (value is (IList<int>))
        {
            return ((IList<string>)value).Count > 0;
        }
        else if (value is (IList<Int64>))
        {
            return ((IList<string>)value).Count > 0;
        }
        else if (value is (IList<double>))
        {
            return ((IList<double>)value).Count > 0;
        }
        else if (value is (IDictionary<string, object>))
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    public static bool isNumber(object number)
    {
        return Double.TryParse(number.ToString(), out _);
    }

    public static bool isEqual(object a, object b)
    {

        try
        {

            if (a == null && b == null)
            {
                return true;
            }
            else if (a == null || b == null)
            {
                return false;
            }

            if (a.GetType() != b.GetType() && (!isNumber(a) || !isNumber(b)))
            {
                return false;
            }

            // if (a.GetType() != b.GetType())
            // {
            //     return false;
            // }
            if (IsInteger(a) && IsInteger(b))
            {
                return Convert.ToInt64(a) == Convert.ToInt64(b);
            }
            if (a.GetType() == typeof(Int64) && b.GetType() == typeof(Int64))
            {
                return Convert.ToInt64(a) == Convert.ToInt64(b);
            }
            if (a.GetType() == typeof(decimal) || b.GetType() == typeof(decimal))
            {
                return Convert.ToDecimal(a) == Convert.ToDecimal(b);
            }
            else if (a.GetType() == typeof(int))
            {
                return (int)a == (int)b;
            }
            else if (a.GetType() == typeof(double) || b.GetType() == typeof(double))
            {
                return Convert.ToDouble(a) == Convert.ToDouble(b);
            }
            else if (a.GetType() == typeof(decimal) || b.GetType() == typeof(decimal))
            {
                return Convert.ToDecimal(a) == Convert.ToDecimal(b);
            }
            else if (a.GetType() == typeof(Single) || b.GetType() == typeof(Single))
            {
                return Convert.ToSingle(a) == Convert.ToSingle(b);
            }
            // else if (a.GetType() == typeof(double))
            // {
            //     return (double)a == (double)b;
            // }
            else if (a.GetType() == typeof(string))
            {
                return ((string)a) == ((string)b);
            }
            else if (a.GetType() == typeof(bool))
            {
                return ((bool)a) == ((bool)b);
            }
            else
            {
                return false;
            }
        }
        catch (Exception e)
        {
            return false;
        }


    }

    public static bool isGreaterThan(object a, object b)
    {
        if (a != null && b == null)
        {
            return true;
        }
        else if (a == null || b == null)
        {
            return false;
        }

        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);

        if (a.GetType() == typeof(Int64) && b.GetType() == typeof(Int64))
        {
            return Convert.ToInt64(a) > Convert.ToInt64(b);
        }
        else if (a.GetType() == typeof(int) && b.GetType() == typeof(int))
        {
            return (int)a > (int)b;
        }
        else if (a.GetType() == typeof(double) || b.GetType() == typeof(double))
        {
            return Convert.ToDouble(a) > Convert.ToDouble(b);
        }
        else if (a.GetType() == typeof(string))
        {
            return ((string)a).CompareTo((string)b) > 0;
        }
        else
        {
            return false;
        }
    }

    public static bool isLessThan(object a, object b)
    {

        return !isGreaterThan(a, b) && !isEqual(a, b);
    }

    public static bool isGreaterThanOrEqual(object a, object b)
    {
        return isGreaterThan(a, b) || isEqual(a, b);
    }

    public static bool isLessThanOrEqual(object a, object b)
    {
        return isLessThan(a, b) || isEqual(a, b);
    }

    public static object mod(object a, object b)
    {
        if (a == null || b == null)
        {
            return null;
        }

        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);

        if (a.GetType() == typeof(string) || a.GetType() == typeof(Int64) || a.GetType() == typeof(int) || a.GetType() == typeof(double))
            return (Convert.ToDouble(a)) % (Convert.ToDouble(b));

        return null;

        // return add(a, b);
    }

    public static object add(object a, object b)
    {
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);

        if (a is (Int64))
        {
            return (Int64)a + (Int64)b;
        }
        else if (a is (double))
        {
            return (double)a + Convert.ToDouble(b);
        }
        else if (a is (string))
        {
            return (string)a + (string)b;
        }
        else
        {
            return null;
        }
    }

    public static string add(string a, string b)
    {
        return a + b;
    }

    public static string add(string a, object b)
    {
        return add(a, b.ToString());
    }

    // public static string add(object a, string b)
    // {
    //     if (a == null || b == null)
    //     {
    //         return null;
    //     }
    //     if (a.GetType() != b.GetType())
    //         return null;

    //     if (a.GetType() == typeof(string) || a.GetType() == typeof(Int64) || a.GetType() == typeof(int))
    //         return a + b;

    //     return null;

    //     // return add(a, b);
    // }

    // public static int add(int a, int b)
    // {
    //     return a + b;
    // }

    // public float add(float a, float b)
    // {
    //     return a + b;
    // }

    public static object subtract(object a, object b)
    {
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);

        // subtract logic
        if (a.GetType() == typeof(Int64))
        {
            return (Int64)a - (Int64)b;
        }
        else if (a.GetType() == typeof(int))
        {
            return (int)a - (int)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a - (double)b;
        }
        else
        {
            return null;
        }
    }

    public static int subtract(int a, int b)
    {
        return a - b;
    }

    public float subtract(float a, float b)
    {
        return a - b;
    }

    public static object divide(object a, object b)
    {
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);

        if (a == null || b == null)
        {
            return null;
        }

        if (a.GetType() == typeof(Int64) && b.GetType() == typeof(Int64))
        {
            return (Int64)a / (Int64)b;
        }
        else if (a.GetType() == typeof(double) && b.GetType() == typeof(double))
        {
            return (double)a / (double)b;
        }
        else
        {
            return Convert.ToDouble(a) / Convert.ToDouble(b);
        }
    }

    public static object multiply(object a, object b)
    {
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);
        if (a == null || b == null)
        {
            return null;
        }

        if (a is Int64 && b is Int64)
        {
            return (Int64)a * (Int64)b;
        }
        var first = Convert.ToDouble(a);
        var second = Convert.ToDouble(b);

        var res = first * second;

        if (IsInteger(res))
        {
            return Convert.ToInt64(res);
        }
        else
        {
            return res;
        }
    }

    public static int getArrayLength(object value)
    {
        if (value == null)
        {
            return 0;
        }

        if (value is (IList<object>))
        {
            return ((IList<object>)value).Count;
        }
        else if (value is (IList<string>))
        {
            return ((IList<string>)value).Count;
        }
        else if (value is (List<dict>))
        {
            return ((List<dict>)value).Count;
        }
        else if (value is (string))
        {
            return ((string)value).Length; // fallback that should not be used
        }
        else
        {
            return 0;
        }
    }

    public static bool IsInteger(object value)
    {
        if (value == null)
        {
            return false;
        }

        Type type = value.GetType();

        // Check for integral types
        if (type == typeof(int) || type == typeof(long) || type == typeof(short) || type == typeof(byte) || type == typeof(sbyte) || type == typeof(uint) || type == typeof(ulong) || type == typeof(ushort))
        {
            return true;
        }

        // Check for floating-point types and verify if they can be converted to an integer without losing precision
        if (type == typeof(float) || type == typeof(double) || type == typeof(decimal))
        {
            decimal decimalValue = Convert.ToDecimal(value);
            return decimalValue == Math.Floor(decimalValue);
        }

        // Add any additional type checks if necessary

        return false;
    }

    public static object mathMin(object a, object b)
    {
        if (a == null || b == null)
        {
            return null;
        }
        var first = Convert.ToDouble(a);
        var second = Convert.ToDouble(b);

        if (first < second)
        {
            return a;
        }
        else
        {
            return b;
        }

        // a = normalizeIntIfNeeded(a);
        // b = normalizeIntIfNeeded(b);
        // if (a.GetType() == typeof(Int64))
        // {
        //     return Math.Min((Int64)a, (Int64)b);
        // }
        // else if (a.GetType() == typeof(double))
        // {
        //     return Math.Min((double)a, (double)b);
        // }
        // else if (a.GetType() == typeof(float))
        // {
        //     return Math.Min((float)a, (float)b);
        // }
        // else if (a.GetType() == typeof(int))
        // {
        //     return Math.Min((int)a, (int)b);
        // }
        // else
        // {
        //     return null;
        // }
    }

    public static object mathMax(object a, object b)
    {
        if (a == null || b == null)
        {
            return null;
        }
        var first = Convert.ToDouble(a);
        var second = Convert.ToDouble(b);

        if (first > second)
        {
            return a;
        }
        else
        {
            return b;
        }
    }

    public static int getIndexOf(object str, object target)
    {
        if (str is IList<object>)
        {
            return ((IList<object>)str).IndexOf(target);
        }
        else if (str is IList<string>)
        {
            return ((IList<string>)str).IndexOf((string)target);
        }
        else if (str is (string))
        {
            return ((string)str).IndexOf((string)target);
        }
        else
        {
            return -1;
        }
    }

    public static object parseInt(object a)
    {
        object parsedValue = null;
        try
        {
            parsedValue = (Convert.ToInt64(a));
        }
        catch (Exception e)
        {
        }
        return parsedValue;
    }

    public static object parseFloat(object a)
    {
        object parsedValue = null;
        try
        {
            // parsedValue = float.Parse((string)a, CultureInfo.InvariantCulture.NumberFormat);
            parsedValue = (Convert.ToDouble(a, CultureInfo.InvariantCulture.NumberFormat));
        }
        catch (Exception e)
        {
        }
        return parsedValue;
    }

    // generic getValue to replace elementAccesses
    public object getValue(object a, object b) => GetValue(a, b);
    public static object GetValue(object value2, object key)
    {
        if (value2 == null || key == null)
        {
            return null;
        }

        if (value2.GetType() == typeof(string))
        {
            var str = (string)value2;
            return (str[Convert.ToInt32(key)]).ToString();
        }

        // check if array
        object value = value2;
        if (value2.GetType().IsArray == true)
        {
            value = new List<object>((object[])value2);
        }


        if (value is IDictionary<string, object>)
        {
            var dictValue = (IDictionary<string, object>)value;
            if (dictValue.ContainsKey((string)key))
            {
                return dictValue[(string)key];
            }
            else
            {
                return null;
            }
        }
        else if (value2 is System.Collections.IDictionary)
        {

            IDictionary<string, object> dict = ConvertToDictionaryOfStringObject(value2);
            var keys = dict.Keys;
            foreach (var key2 in keys)
            {
                if (key2 == null)
                    continue;
                var dictKey = key2.ToString();
                if (dict.ContainsKey(dictKey))
                {
                    var returnValue = dict[dictKey];
                    if (returnValue == null || returnValue.ToString().Length == 0)
                        continue;

                    return returnValue;
                }
            }
            return null;
        }
        else if (value is IList<object>)
        {
            // check here if index is out of bounds
            int parsed = Convert.ToInt32(key);
            var listLength = getArrayLength(value);
            if (parsed >= listLength)
            {
                return null;
            }
            return ((IList<object>)value)[parsed];
        }
        else if (value is List<dict>)
        {
            // check here if index is out of bounds
            int parsed = Convert.ToInt32(key);
            var listLength = getArrayLength(value);
            if (parsed >= listLength)
            {
                return null;
            }
            return ((List<dict>)value)[parsed];
        }
        else if (value.GetType() == typeof(List<string>))
        {
            int parsed = Convert.ToInt32(key);
            var listLength = getArrayLength(value);
            if (parsed >= listLength)
            {
                return null;
            }
            return ((List<string>)value)[parsed];
        }
        else if (value is List<Int64>)
        {
            int parsed = Convert.ToInt32(key);
            return ((List<Int64>)value)[parsed];
        }
        // check this last, avoid reflection
        else if (key.GetType() == typeof(string) && (value.GetType()).GetProperty((string)key) != null)
        {
            var prop = (value.GetType()).GetProperty((string)key);
            if (prop != null)
            {
                return prop.GetValue(value2, null);
            }
            else
            {
                return null;
            }
        }
        else
        {
            return null;
        }
    }

    public async Task<List<object>> promiseAll(object promisesObj) => await PromiseAll(promisesObj);

    public static async Task<List<object>> PromiseAll(object promisesObj)
    {
        var promises = (IList<object>)promisesObj;
        var tasks = new List<Task<object>>();
        foreach (var promise in promises)
        {
            if (promise is Task<object>)
            {
                tasks.Add((Task<object>)promise);
            }
        }
        var results = await Task.WhenAll(tasks);
        return results.ToList();
    }

    public static string toStringOrNull(object value)
    {
        if (value == null)
        {
            return null;
        }
        else
        {
            return (string)value;
        }
    }

    public void throwDynamicException(object exception, object message)
    {
        var Exception = NewException((Type)exception, (string)message);
    }

    // This function is the salient bit here
    public object newException(object exception, object message)
    {
        return Activator.CreateInstance(exception as Type, message as String) as Exception;
    }

    public static Exception NewException(Type exception, String message)
    {
        return Activator.CreateInstance(exception, message) as Exception;
    }

    public static object toFixed(object number, object decimals)
    {
        return Math.Round((double)number, (int)decimals);
    }

    public static object callDynamically(object obj, object methodName, object[] args = null)
    {
        args ??= new object[] { };
        if (args.Length == 0)
        {
            args = new object[] { null };
        }
        return obj.GetType().GetMethod((string)methodName, BindingFlags.Static | BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic).Invoke(obj, args);
    }

    public static async Task<object> callDynamicallyAsync(object obj, object methodName, object[] args = null)
    {
        args ??= new object[] { };
        var res = obj.GetType().GetMethod((string)methodName, BindingFlags.Static | BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic).Invoke(obj, args);
        return await ((Task<object>)res);
    }

    public bool inOp(object obj, object key) => InOp(obj, key);

    public static bool InOp(object obj, object key)
    {
        if (obj == null || key == null)
        {
            return false;
        }
        if (obj is (IList<object>))
        {
            return ((IList<object>)obj).Contains(key);
        }
        else if (obj is (IList<string>))
        {
            return ((IList<string>)obj).Contains((string)key);
        }
        else if (obj is (List<Int64>))
        {
            return ((List<Int64>)obj).Contains((Int64)key);
        }
        else if (obj is (IDictionary<string, object>))
        {
            if (key is (string))
                return ((IDictionary<string, object>)obj).ContainsKey((string)key);
            else
                return false;
        }
        else
        {
            return false;
        }
    }

    public string slice(object str2, object idx1, object idx2) => Slice(str2, idx1, idx2);

    public static string Slice(object str2, object idx1, object idx2)
    {
        if (str2 == null)
        {
            return null;
        }
        var str = (string)str2;
        var start = idx1 != null ? Convert.ToInt32(idx1) : -1;
        if (idx2 == null)
        {
            if (start < 0)
            {
                var innerStart = str.Length + start;
                innerStart = innerStart < 0 ? 0 : innerStart;
                return str[(innerStart)..];
            }
            else
            {
                return str[start..];
            }
        }
        else
        {
            var end = Convert.ToInt32(idx2);
            if (start < 0)
            {
                start = str.Length + start;
            }
            if (end < 0)
            {
                end = str.Length + end;
            }
            if (end > str.Length)
            {
                end = str.Length;
            }
            return str[start..end];
        }
    }
}