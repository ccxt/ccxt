namespace Main;

using System.Globalization;
using System.Reflection;
using System.Text.Json;
using dict = Dictionary<string, object>;


public partial class Exchange
{

    // tmp most of these methods are going to be re-implemented in the future to be more generic and efficient

    public static object normalizeIntIfNeeded(object a)
    {
        if (a == null)
            return null;

        if (a.GetType() == typeof(int))
        {
            return System.Convert.ToInt64(a);
        }
        return a;
    }
    public static object postFixIncrement(ref object a)
    {
        if (a.GetType() == typeof(Int64))
        {
            a = (Int64)a + 1;
        }
        else if (a.GetType() == typeof(int))
        {
            a = (int)a + 1;
        }
        else if (a.GetType() == typeof(double))
        {
            a = (double)a + 1;
        }
        else if (a.GetType() == typeof(string))
        {
            a = (string)a + 1;
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

    public dict parseJson(object json)
    {
        return JsonSerializer.Deserialize<Dictionary<string, object>>((string)json);
    }

    public static bool isTrue(object value)
    {
        if (value == null)
        {
            return false;
        }

        value = normalizeIntIfNeeded(value);

        // return value != null && value != false && value != 0 && value != "" && value != "0" && value != "false" && value != "False" && value != "FALSE";
        if (value.GetType() == typeof(bool))
        {
            return (bool)value;
        }
        else if (value.GetType() == typeof(Int64))
        {
            return (Int64)value != 0;
        }
        else if (value.GetType() == typeof(double))
        {
            return (double)value != 0;
        }
        else if (value.GetType() == typeof(string))
        {
            return (string)value != "";
        }
        else if (value.GetType() == typeof(List<object>))
        {
            return ((List<object>)value).Count > 0;
        }
        else if (value.GetType() == typeof(List<string>))
        {
            return ((List<string>)value).Count > 0;
        }
        else if (value.GetType() == typeof(List<int>))
        {
            return ((List<string>)value).Count > 0;
        }
        else if (value.GetType() == typeof(List<Int64>))
        {
            return ((List<string>)value).Count > 0;
        }
        else if (value.GetType() == typeof(List<double>))
        {
            return ((List<double>)value).Count > 0;
        }
        else if (value.GetType() == typeof(Dictionary<string, object>))
        {
            return true;
        }
        else
        {
            return false;
        }
    }

    public static bool isEqual(object a, object b)
    {

        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);

        if (a == null && b == null)
        {
            return true;
        }
        else if (a == null || b == null)
        {
            return false;
        }

        if (a.GetType() != b.GetType())
        {
            return false;
        }

        if (a.GetType() == typeof(Int64))
        {
            return (Int64)a == (Int64)b;
        }
        else if (a.GetType() == typeof(int))
        {
            return (int)a == (int)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a == (double)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a == (double)b;
        }
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

        if (a.GetType() == typeof(Int64))
        {
            return (Int64)a > (Int64)b;
        }
        else if (a.GetType() == typeof(int))
        {
            return (int)a > (int)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a > (double)b;
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
        if (a.GetType() != b.GetType())
            return null;

        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);

        if (a.GetType() == typeof(string) || a.GetType() == typeof(Int64) || a.GetType() == typeof(int))
            return ((int)a) % ((int)b);

        return null;

        // return add(a, b);
    }

    public static object add(object a, object b)
    {
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);

        if (a.GetType() == typeof(Int64))
        {
            return (Int64)a + (Int64)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a + (double)b;
        }
        else if (a.GetType() == typeof(string))
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

    public static string add(object a, string b)
    {
        if (a == null || b == null)
        {
            return null;
        }
        if (a.GetType() != b.GetType())
            return null;

        if (a.GetType() == typeof(string) || a.GetType() == typeof(Int64) || a.GetType() == typeof(int))
            return a + b;

        return null;

        // return add(a, b);
    }

    public static int add(int a, int b)
    {
        return a + b;
    }

    public float add(float a, float b)
    {
        return a + b;
    }

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

        if (a.GetType() == typeof(Int64))
        {
            return (Int64)a / (Int64)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a / (double)b;
        }
        else
        {
            return null;
        }
    }

    public static object multiply(object a, object b)
    {
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);
        if (a.GetType() == typeof(Int64))
        {
            return (Int64)a * (Int64)b;
        }
        else if (a.GetType() == typeof(double))
        {
            return (double)a * (double)b;
        }
        else
        {
            return null;
        }
    }

    public static int getArrayLength(object value)
    {
        if (value == null)
        {
            return 0;
        }

        if (value.GetType() == typeof(List<object>))
        {
            return ((List<object>)value).Count;
        }
        else if (value.GetType() == typeof(List<string>))
        {
            return ((List<string>)value).Count;
        }
        else
        {
            return 0;
        }
    }

    public static object mathMin(object a, object b)
    {
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);
        if (a.GetType() == typeof(Int64))
        {
            return Math.Min((Int64)a, (Int64)b);
        }
        else if (a.GetType() == typeof(double))
        {
            return Math.Min((double)a, (double)b);
        }
        else
        {
            return null;
        }
    }

    public static object mathMax(object a, object b)
    {
        a = normalizeIntIfNeeded(a);
        b = normalizeIntIfNeeded(b);
        if (a.GetType() == typeof(Int64))
        {
            return Math.Max((Int64)a, (Int64)b);
        }
        else if (a.GetType() == typeof(double))
        {
            return Math.Max((double)a, (double)b);
        }
        else
        {
            return null;
        }
    }

    public static int getIndexOf(object str, object target)
    {
        if (str.GetType() == typeof(List<object>))
        {
            return ((List<object>)str).IndexOf(target);
        }
        else if (str.GetType() == typeof(List<string>))
        {
            return ((List<string>)str).IndexOf((string)target);
        }
        else if (str.GetType() == typeof(string))
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
            parsedValue = float.Parse((string)a, CultureInfo.InvariantCulture.NumberFormat);
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

        // check if array
        object value = value2;
        if (value2.GetType().IsArray == true)
        {
            value = new List<object>((object[])value2);
        }


        if (value.GetType() == typeof(dict))
        {
            var dictValue = (dict)value;
            if (dictValue.ContainsKey((string)key))
            {
                return dictValue[(string)key];
            }
            else
            {
                return null;
            }
        }
        else if (value.GetType() == typeof(List<object>))
        {
            // check here if index is out of bounds
            int parsed = Convert.ToInt32(key);
            var listLength = getArrayLength(value);
            if (parsed >= listLength)
            {
                return null;
            }
            return ((List<object>)value)[parsed];
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
        else if (value.GetType() == typeof(List<Int64>))
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
        var promises = (List<object>)promisesObj;
        var tasks = new List<Task<object>>();
        foreach (var promise in promises)
        {
            tasks.Add((Task<object>)promise);
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
        throw Exception;
    }

    // This function is the salient bit here
    public Exception NewException(Type exception, String message)
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
}