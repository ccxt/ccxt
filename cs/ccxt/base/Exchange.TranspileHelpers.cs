namespace ccxt;

using System.Globalization;
using System.Reflection;

using dict = Dictionary<string, object>;


public partial class BaseExchange
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
        // large int literals (2^31..2^32-1, e.g. 2592000000 = 30 days in ms)
        // are typed uint by the C# compiler and would fail the (Int64) casts
        // in the arithmetic helpers
        if (a is uint)
        {
            return System.Convert.ToInt64(a);
        }
        return a;
    }

    public object parseJson(object json)
    {
        return JsonHelper.Deserialize((string)json);
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

    // S58 identity twins: a variable statically typed List<object>/IList<object> holds only such
    // a list or null, so this is exactly the object overload's IList<object> branch (null -> 0).
    public static int getArrayLength(List<object> value)
    {
        return (value == null) ? 0 : value.Count;
    }

    public static int getArrayLength(IList<object> value)
    {
        return (value == null) ? 0 : value.Count;
    }

    public static int getArrayLength(object value)
    {
        if (value == null)
        {
            return 0;
        }

        if (value is byte[] byteArray)
        {
            return byteArray.Length;
        }
        else if (value is (IList<object>))
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
        else if (value is IList<IList<object>>)
        {
            return ((IList<IList<object>>)value).Count;
        }
        else if (value is List<List<object>>)
        {
            return ((List<List<object>>)value).Count;
        }
        else if (value is List<List<string>>)
        {
            return ((List<List<string>>)value).Count;
        }
        else if (value is (string))
        {
            return ((string)value).Length; // fallback that should not be used
        }
        else if (value is System.Collections.ICollection)
        {
            // typed core results (List<Order>, List<OHLCV>, ...) are not IList<object>;
            // without this they silently measured as length 0
            return ((System.Collections.ICollection)value).Count;
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

    // Every return path of this helper is the Convert.ToInt64 box or null (the
    // catch), so the signature names that single box instead of `object`. A call site that
    // keeps the value in an object context (a dict slot, a request value, an object local)
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
    // typed twin of GetValue(object, object) for a receiver the C# printer proved is a
    // string-keyed dictionary (see build/csharp-local-types.js): its string/array branches are
    // unreachable for such a receiver, and this is the same null-safe ContainsKey-then-indexer read.
    public static object GetValue(IDictionary<string, object> value2, string key)
    {
        if (value2 == null || key == null)
        {
            return null;
        }

        if (value2.ContainsKey(key))
        {
            return value2[key];
        }

        return null;
    }
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

        // object[] (and covariant reference arrays) already index as IList<object>; copy only other arrays
        object value = value2;
        if (value2.GetType().IsArray == true && !(value2 is IList<object>))
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
            var strKey = key.ToString();
            if (dict.ContainsKey(strKey))
            {
                return dict[strKey];
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
        else if (value is IList<IList<object>>)
        {
            int parsed = Convert.ToInt32(key);
            var listLength = getArrayLength(value);
            if (parsed >= listLength)
            {
                return null;
            }
            return ((IList<IList<object>>)value)[parsed];
        }
        else if (value is List<List<object>>)
        {
            int parsed = Convert.ToInt32(key);
            var listLength = getArrayLength(value);
            if (parsed >= listLength)
            {
                return null;
            }
            return ((List<List<object>>)value)[parsed];
        }
        else if (value is List<List<string>>)
        {
            int parsed = Convert.ToInt32(key);
            var listLength = getArrayLength(value);
            if (parsed >= listLength)
            {
                return null;
            }
            return ((List<List<string>>)value)[parsed];
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
        // List<T> is invariant so List<Dictionary<string, object>> is not IList<object>
        // and not List<dict> (dict = IDictionary). Re-box through the non-generic IList
        // the same way toArray / arraySlice do, before the reflection last-resort.
        else if (value is System.Collections.IList genericList && !(value is System.Collections.IDictionary) && !(value is string))
        {
            int parsed = Convert.ToInt32(key);
            if (parsed < 0 || parsed >= genericList.Count)
            {
                return null;
            }
            return genericList[parsed];
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

    // A generated implicit API method declares the shape its api leaf promised,
    // so it returns Task<Dictionary<string, object>> / Task<List<object>> /
    // Task<string> rather than Task<object>. Task<T> is invariant, so none of
    // those IS a Task<object>: an `is Task<object>` test returns false and a
    // hard cast throws. Every place that filters, casts or awaits an un-awaited
    // task whose static type has been erased to object has to come through here
    // instead, or a narrowed endpoint is silently dropped rather than awaited.
    public static Task<object> AsTaskOfObject(object value)
    {
        if (value is Task<object> already)
        {
            return already;
        }
        if (value is Task task)
        {
            return AwaitAsObject(task);
        }
        return null;
    }

    // Await any Task<T> and re-box its result as object. Reflection is the only
    // way back to the value once T is not statically known, and it only runs
    // after the task completed, so it costs one property read per call.
    private static async Task<object> AwaitAsObject(Task task)
    {
        await task.ConfigureAwait(false);
        var resultProperty = task.GetType().GetProperty("Result");
        if (resultProperty == null)
        {
            return null; // a non-generic Task has no result to unwrap
        }
        // reflective callers (callDynamically, fetchPaginatedCall*, promiseAll) feed the
        // untyped object pipeline, so any typed struct/list coming back from a typed core
        // is de-typed here into the plain dictionaries/rows that pipeline reads keys from.
        // FromTyped's switch is generated from the struct families only, so a core declared
        // List<Dictionary<string, object>> falls through it untouched and the generated
        // safeList's (List<object>) cast then throws on the invariant list - FromDictList
        // reboxes that one shape and passes everything else through, so it composes safely.
        return FromDictList(FromTyped(resultProperty.GetValue(task)));
    }

    public static async Task<List<object>> PromiseAll(object promisesObj)
    {
        var promises = (IList<object>)promisesObj;
        var tasks = new List<Task<object>>();
        foreach (var promise in promises)
        {
            var task = AsTaskOfObject(promise);
            if (task != null)
            {
                tasks.Add(task);
            }
        }
        var results = await Task.WhenAll(tasks);
        return results.ToList();
    }

    // A watch* core hands back the LIVE order book: without a copy the caller keeps
    // mutating with the ws thread. Idempotent, so re-entering an already-typed core
    // (a tail `return await this.watchOrderBook(...)` override) copies only once.
    public static ccxt.pro.IOrderBook ToOrderBookSnapshot(object value)
    {
        return (value is ccxt.pro.IOrderBook book) ? book.Copy() : null;
    }

    public static PredictionOrderBook ToPredictionOrderBookSnapshot(object value)
    {
        return (value is PredictionOrderBook already) ? already : new PredictionOrderBook(ToOrderBookSnapshot(value));
    }

    public static Dictionary<string, object> ToDict(object value)
    {
        return value as Dictionary<string, object>;
    }

    public static List<Dictionary<string, object>> ToDictList(object values)
    {
        if (values == null)
        {
            return null;
        }
        if (values is List<Dictionary<string, object>> already)
        {
            return already;
        }
        var rows = (IList<object>)values;
        var result = new List<Dictionary<string, object>>(rows.Count);
        foreach (var row in rows)
        {
            result.Add(row as Dictionary<string, object>);
        }
        return result;
    }

    public static Int64 ToInt64Value(object value)
    {
        return ToInt64ArgRequired(value);
    }

    public static string ToStringValue(object value)
    {
        // a string-typed core may tail-return a numeric id read off user params
        // (htx fetchAccountIdByType); stringify primitives instead of nulling them
        if (value is string s)
        {
            return s;
        }
        if (value is Int64 || value is int || value is double || value is decimal || value is float)
        {
            return Convert.ToString(value, System.Globalization.CultureInfo.InvariantCulture);
        }
        return null;
    }

    // a `Promise<string[]>` core (fetchUnderlyingAssets, fetchOptionUnderlyings) hands back
    // a `List<object>` of strings from the generated body; project it to `List<string>`
    public static List<string> ToStringList(object values)
    {
        if (values == null)
        {
            return null;
        }
        if (values is List<string> already)
        {
            return already;
        }
        var result = new List<string>();
        foreach (var item in (System.Collections.IEnumerable)values)
        {
            result.Add(ToStringValue(item));
        }
        return result;
    }

    public static object FromDictList(object values)
    {
        // getValue / getArrayLength read any IList through the non-generic interface, but the
        // generated safeList hard-casts to List<object>, and List<T> is invariant - so a
        // List<Dictionary<string, object>> coming off a typed core has to be reboxed row by row
        if (values is List<Dictionary<string, object>> typed)
        {
            return new List<object>(typed);
        }
        return values;
    }

    // the typed funnel twin: the printer emits FromDictList only for a typed core declared
    // List<Dictionary<string, object>> (typedCoreFromHelper), so the argument is always that list
    // and the object overload reboxes it — a null argument passes through as null
    public static List<object> FromDictList(List<Dictionary<string, object>> values)
    {
        return (List<object>)FromDictList((object)values);
    }

    public void throwDynamicException(object exception, object message)
    {
        throw NewException((Type)exception, (string)message);
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

    // JavaScript Number.prototype.toFixed: exact binary value, ties away from zero, zero padded
    public static string toFixed(object number, object decimals)
    {
        var value = Convert.ToDouble(number, CultureInfo.InvariantCulture);
        var digits = Convert.ToInt32(decimals, CultureInfo.InvariantCulture);
        if (digits < 0 || digits > 100)
        {
            throw new ArgumentOutOfRangeException(nameof(decimals), "toFixed() digits argument must be between 0 and 100");
        }
        if (double.IsNaN(value))
        {
            return "NaN";
        }
        if (double.IsInfinity(value))
        {
            return value > 0 ? "Infinity" : "-Infinity";
        }
        if (Math.Abs(value) >= 1e21)
        {
            return value.ToString("R", CultureInfo.InvariantCulture);
        }
        var negative = value < 0;
        var bits = BitConverter.DoubleToInt64Bits(value);
        var exponent = (int)((bits >> 52) & 0x7FFL);
        var mantissa = bits & 0xFFFFFFFFFFFFFL;
        if (exponent == 0)
        {
            exponent = 1;
        }
        else
        {
            mantissa = mantissa | (1L << 52);
        }
        exponent = exponent - 1075;
        var numerator = new System.Numerics.BigInteger(mantissa) * System.Numerics.BigInteger.Pow(10, digits);
        var denominator = System.Numerics.BigInteger.One;
        if (exponent > 0)
        {
            numerator = numerator << exponent;
        }
        else
        {
            denominator = System.Numerics.BigInteger.One << (-exponent);
        }
        System.Numerics.BigInteger remainder;
        var quotient = System.Numerics.BigInteger.DivRem(numerator, denominator, out remainder);
        if (remainder * 2 >= denominator)
        {
            quotient = quotient + System.Numerics.BigInteger.One;
        }
        var text = quotient.ToString(CultureInfo.InvariantCulture).PadLeft(digits + 1, '0');
        if (digits > 0)
        {
            text = text.Substring(0, text.Length - digits) + "." + text.Substring(text.Length - digits);
        }
        return (negative ? "-" : "") + text;
    }

    // Typed cores are emitted PascalCase (`CreateOrder`), but the method-name strings that drive
    // reflective dispatch stay camelCase — they double as `has`/`describe()` capability keys.
    // Resolve the exact name first, then fall back to a case-insensitive match.
    public static MethodInfo ResolveMethod(Type type, string methodName)
    {
        const BindingFlags flags = BindingFlags.Static | BindingFlags.Instance | BindingFlags.Public | BindingFlags.NonPublic;
        var mi = type.GetMethod(methodName, flags);
        if (mi != null)
        {
            return mi;
        }
        return type.GetMethod(methodName, flags | BindingFlags.IgnoreCase);
    }

    // reflection binds by EXACT runtime type: a boxed Int32 does not land in an `Int64?`
    // parameter, it throws ArgumentException. The generated cores now declare typed
    // scalars, so every reflective arg list is converted to the target parameter types
    // first. Impossible conversions are passed through unchanged so the original
    // ArgumentException still surfaces instead of a helper-thrown one.
    public static object[] coerceArgs(MethodInfo mi, object[] args)
    {
        if (mi == null || args == null)
        {
            return args;
        }
        var ps = mi.GetParameters();
        var n = Math.Min(ps.Length, args.Length);
        object[] outArgs = null;
        for (var i = 0; i < n; i++)
        {
            var arg = args[i];
            if (arg == null)
            {
                continue;
            }
            var target = ps[i].ParameterType;
            if (target.IsByRef)
            {
                target = target.GetElementType();
            }
            if (target == null || target == typeof(object) || target.IsInstanceOfType(arg))
            {
                continue;
            }
            var effective = Nullable.GetUnderlyingType(target) ?? target;
            if (effective.IsInstanceOfType(arg))
            {
                continue;
            }
            // numeric widening (Int32 → Int64?) plus JSON numbers → string id/code
            // (static request fixtures decode order ids as Int64)
            var numeric = (effective.IsPrimitive || effective == typeof(decimal)) && effective != typeof(bool) && effective != typeof(char);
            if (!numeric && effective != typeof(string))
            {
                continue;
            }
            if (!(arg is IConvertible))
            {
                continue;
            }
            try
            {
                var converted = Convert.ChangeType(arg, effective, System.Globalization.CultureInfo.InvariantCulture);
                if (outArgs == null)
                {
                    outArgs = new object[args.Length];
                    Array.Copy(args, outArgs, args.Length);
                }
                outArgs[i] = converted;
            }
            catch
            {
                // leave the original value in place; Invoke reports the real mismatch
            }
        }
        return outArgs ?? args;
    }

    // a direct `(Int64?)expr` unbox-cast of a boxed Int32 throws InvalidCastException,
    // so every generated call site feeding a narrowed numeric core parameter converts
    // through these instead of casting. null stays null (the parameter is optional).
    public static Int64? ToInt64Arg(object value)
    {
        if (value == null)
        {
            return null;
        }
        if (value is Int64 l)
        {
            return l;
        }
        return Convert.ToInt64(value, System.Globalization.CultureInfo.InvariantCulture);
    }

    public static double? ToDoubleArg(object value)
    {
        if (value == null)
        {
            return null;
        }
        if (value is double d)
        {
            return d;
        }
        return Convert.ToDouble(value, System.Globalization.CultureInfo.InvariantCulture);
    }

    // required (non-optional) numeric positions: same conversion, but a missing value is
    // a contract violation rather than an absent optional, so it surfaces as 0 like the
    // untyped path did instead of throwing inside the helper.
    public static double ToDoubleArgRequired(object value)
    {
        return (value == null) ? 0 : Convert.ToDouble(value, System.Globalization.CultureInfo.InvariantCulture);
    }

    public static Int64 ToInt64ArgRequired(object value)
    {
        return (value == null) ? 0 : Convert.ToInt64(value, System.Globalization.CultureInfo.InvariantCulture);
    }

    public static object callDynamically(object obj, object methodName, object[] args = null)
    {
        args ??= new object[] { };
        if (args.Length == 0)
        {
            args = new object[] { null };
        }
        var mi = ResolveMethod(obj.GetType(), (string)methodName);
        var res = mi.Invoke(obj, coerceArgs(mi, args));
        // The transpiled callers cast this result to Task<object> (the cast is
        // emitted by ast-transpiler), which an implicit API method's narrowed
        // Task<Dictionary<string, object>> would fail. Normalize here so the
        // reflective path stays shape-agnostic, exactly like PromiseAll.
        return AsTaskOfObject(res) ?? res;
    }

    // S58 identity twin: a Dictionary<string, object> is not an IList, so the object overload
    // reaches its IDictionary branch — ContainsKey(key) behind the same null -> false guards.
    public bool inOp(Dictionary<string, object> obj, string key) => (obj != null) && (key != null) && obj.ContainsKey(key);

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
        else if (obj is System.Collections.IDictionary || (obj.GetType().IsGenericType && obj.GetType().GetGenericTypeDefinition() == typeof(Dictionary<,>))) // is the second cond needed?
        {
            // check if this is a dictionary regardless of the value type
            IDictionary<string, object> dict = ConvertToDictionaryOfStringObject(obj);
            return dict.ContainsKey((string)key);
        }
        else
        {
            return false;
        }
    }

    // reverses the typed-core boundary: hands a typed candle list back to the untyped object
    // pipeline (pagination, arrayConcat, filterBySinceLimit) as plain 6-element rows
    public static object FromOHLCVList(object candles)
    {
        if (!(candles is List<OHLCV>))
        {
            return candles;
        }
        var typed = (List<OHLCV>)candles;
        var result = new List<object>(typed.Count);
        foreach (var candle in typed)
        {
            result.Add(new List<object>() { candle.timestamp, candle.open, candle.high, candle.low, candle.close, candle.volume });
        }
        return result;
    }

    // the typed funnel twin: FromOHLCVList is emitted only for a small OHLCV[] core, so the
    // argument is always that candle list — null passes through as null
    public static List<object> FromOHLCVList(List<OHLCV> candles)
    {
        return (List<object>)FromOHLCVList((object)candles);
    }

    // watchOHLCVForSymbols: `{ symbol: { timeframe: OHLCV[] } }`. Not a types.ts struct, so the
    // generator has no To*/From* pair for it — these two are the hand-written equivalents,
    // built on ToOHLCVList / FromOHLCVList (see OHLCV_DICT_TYPE in build/csharpTranspiler.ts)
    public static Dictionary<string, Dictionary<string, List<OHLCV>>> ToOHLCVDict(object value)
    {
        if (value == null)
        {
            return null;
        }
        if (value is Dictionary<string, Dictionary<string, List<OHLCV>>> already)
        {
            return already;
        }
        var bySymbol = (IDictionary<string, object>)value;
        var result = new Dictionary<string, Dictionary<string, List<OHLCV>>>(bySymbol.Count);
        foreach (var symbolEntry in bySymbol)
        {
            var byTimeframe = new Dictionary<string, List<OHLCV>>();
            if (symbolEntry.Value is IDictionary<string, object> timeframes)
            {
                foreach (var timeframeEntry in timeframes)
                {
                    byTimeframe[timeframeEntry.Key] = ToOHLCVList(timeframeEntry.Value);
                }
            }
            result[symbolEntry.Key] = byTimeframe;
        }
        return result;
    }

    public static object FromOHLCVDict(object value)
    {
        if (!(value is Dictionary<string, Dictionary<string, List<OHLCV>>> typed))
        {
            return value;
        }
        var result = new Dictionary<string, object>(typed.Count);
        foreach (var symbolEntry in typed)
        {
            var byTimeframe = new Dictionary<string, object>(symbolEntry.Value.Count);
            foreach (var timeframeEntry in symbolEntry.Value)
            {
                byTimeframe[timeframeEntry.Key] = FromOHLCVList(timeframeEntry.Value);
            }
            result[symbolEntry.Key] = byTimeframe;
        }
        return result;
    }

    // the typed funnel twin: FromOHLCVDict is emitted only for the `{ symbol: { timeframe:
    // OHLCV[] } }` core shape the dictionary's own type names — null passes through as null
    public static Dictionary<string, object> FromOHLCVDict(Dictionary<string, Dictionary<string, List<OHLCV>>> value)
    {
        return (Dictionary<string, object>)FromOHLCVDict((object)value);
    }
}