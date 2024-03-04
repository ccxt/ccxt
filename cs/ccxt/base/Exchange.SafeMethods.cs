using System.Globalization;
using System.Collections;

namespace ccxt;

using dict = Dictionary<string, object>;

public partial class Exchange
{

    // aux method
    public static IDictionary<string, object> ConvertToDictionaryOfStringObject(object potentialDictionary)
    {
        // First, check if the object is a dictionary
        if (potentialDictionary is IDictionary && potentialDictionary.GetType().IsGenericType)
        {
            var dictionaryType = potentialDictionary.GetType().GetGenericTypeDefinition();
            // if (dictionaryType == typeof(Dictionary<,>))
            // {
            var result = new Dictionary<string, object>();
            var dict = (IDictionary)potentialDictionary;

            foreach (DictionaryEntry entry in dict)
            {
                // Convert the key to a string and add the entry to the new dictionary
                result[entry.Key.ToString()] = entry.Value;
            }

            return result;
            // }
        }

        throw new InvalidOperationException("The provided object is not a dictionary.");
    }
    // falsy and truthy methods wrappers

    // tmp safe number
    public static object SafeNumberN(object obj, List<object> keys, object defaultValue = null) => SafeFloatN(obj, keys, defaultValue);
    public object safeNumberN(object obj, List<object> keys, object defaultValue = null) => safeFloatN(obj, keys, defaultValue);
    // public static object safeNumberN(object obj, List<object> keys, object defaultValue = null) => safeFloatN(obj, keys, defaultValue);
    // public float safeNumber(object obj, object key, float defaultValue = -1) => safeFloatN(obj, new List<object> { key }, defaultValue);
    // public float safeNumber2(object obj, object key1, object key2, float defaultValue = -1) => safeFloatN(obj, new List<object> { key1, key2 }, defaultValue);

    ////////////////////////////////////////////////////////

    public object safeTimestampN(object obj, List<object> keys, object defaultValue = null)
    {
        var result = safeValueN(obj, keys, defaultValue);
        if (result == null)
            return defaultValue;
        if (result is string && ((string)result).IndexOf(".") > -1)
        {
            return Convert.ToInt64(Convert.ToDouble(result, CultureInfo.InvariantCulture) * 1000);
        }
        // if (result.GetType() == typeof(double))
        // {
        //     return Convert.ToInt64(result) * 1000;
        // }
        // return (Int64)(result) * 1000;
        return Convert.ToInt64(result, CultureInfo.InvariantCulture.NumberFormat) * 1000;
    }

    public object safeTimestamp(object obj, object key, object defaultValue = null)
    {
        return safeTimestampN(obj, new List<object> { key }, defaultValue);
    }

    public object safeTimestamp2(object obj, object key1, object key2, object defaultValue = null)
    {
        return safeTimestampN(obj, new List<object> { key1, key2 }, defaultValue);
    }

    public object safeInteger(object obj, object key, object defaultValue = null) => SafeInteger(obj, key, defaultValue);
    public static Int64? SafeInteger(object obj, object key, object defaultValue = null)
    {
        var res = SafeIntegerN(obj, new List<object> { key }, defaultValue);
        return res == null ? null : (Int64)res;
    }

    public object safeInteger2(object obj, object key1, object key2, object defaultValue = null) => safeIntegerN(obj, new List<object> { key1, key2 }, defaultValue);

    public object safeFloat(object obj, object key, object defaultValue = null) => safeFloatN(obj, new List<object> { key }, defaultValue);
    public static double? SafeFloat(object obj, object key, object defaultValue = null)
    {
        var res = SafeFloatN(obj, new List<object> { key }, defaultValue);
        return res == null ? null : Convert.ToDouble(res);
    }

    public object safeFloat2(object obj, object key1, object key2, object defaultValue = null) => safeFloatN(obj, new List<object> { key1, key2 }, defaultValue);

    public static string SafeString(object obj, object key, object defaultValue = null)
    {
        var res = SafeStringN(obj, new List<object> { key });
        return res == null ? null : (string)res;
    }
    public object safeString(object obj, object key, object defaultValue = null) => safeStringN(obj, new List<object> { key }, defaultValue);

    public object safeString2(object obj, object key1, object key2, object defaultValue = null) => safeStringN(obj, new List<object> { key1, key2 }, defaultValue);

    public object safeValue2(object obj, object key1, object key2, object defaultValue = null) => safeValueN(obj, new List<object> { key1, key2 }, defaultValue);

    public static object SafeValue(object obj, object key1, object defaultValue = null) => SafeValueN(obj, new List<object> { key1 }, defaultValue);
    public object safeValue(object obj, object key1, object defaultValue = null) => safeValueN(obj, new List<object> { key1 }, defaultValue);


    public object safeStringUpper(object obj, object key, object defaultValue = null)
    {
        var result = toStringOrNull(safeString(obj, key, defaultValue));
        return result == null ? defaultValue : result.ToUpper();
    }

    public object safeStringUpper2(object obj, object key1, object key2, object defaultValue = null)
    {
        var result = safeString2(obj, key1, key2, defaultValue);
        return result == null ? defaultValue : ((string)result).ToUpper();
    }

    public object safeStringUpperN(object obj, List<object> keys, object defaultValue = null)
    {
        var result = safeStringN(obj, keys, defaultValue);
        return result == null ? defaultValue : ((string)result).ToUpper();
    }

    public object safeStringLower(object obj, object key, object defaultValue = null)
    {
        var result = safeString(obj, key, defaultValue);
        return result == null ? defaultValue : ((string)result).ToLower();
    }

    public object safeStringLower2(object obj, object key1, object key2, object defaultValue = null)
    {
        var result = safeString2(obj, key1, key2, defaultValue);
        return result == null ? defaultValue : ((string)result).ToLower();
    }

    public object safeStringLowerN(object obj, List<object> keys, string defaultValue = null)
    {
        var result = safeStringN(obj, keys, defaultValue);
        return result == null ? defaultValue : ((string)result).ToLower();
    }

    public object safeIntegerProduct(object obj, object key, object multiplier = null, object defaultValue = null)
    {
        multiplier ??= 1;
        var result = safeValueN(obj, new List<object> { key }, defaultValue);
        if (result == null)
        {
            return defaultValue;
        }
        object parsedValue = null;
        try
        {
            parsedValue = Convert.ToInt64((Convert.ToDouble(result) * Convert.ToDouble(multiplier)));
        }
        catch (Exception e)
        {

        }
        return parsedValue == null ? defaultValue : parsedValue;
    }

    public object safeIntegerProduct2(object obj, object key1, object key2, object multiplier = null, object defaultValue = null)
    {
        var result = safeValueN(obj, new List<object> { key1, key2 }, defaultValue);
        object parsedValue = null;
        try
        {
            parsedValue = Convert.ToInt64((Convert.ToDouble(result) * Convert.ToDouble(multiplier)));
        }
        catch (Exception e)
        {

        }
        return parsedValue == null ? defaultValue : parsedValue;
    }

    public object safeIntegerProductN(object obj, List<object> keys, object multiplier = null, object defaultValue = null)
    {
        var result = safeValueN(obj, keys, defaultValue);
        if (result == null)
            return defaultValue;
        object parsedValue = null;
        try
        {
            parsedValue = Convert.ToInt64((Convert.ToDouble(result) * Convert.ToDouble(multiplier)));
        }
        catch (Exception e)
        {

        }
        return parsedValue == null ? defaultValue : parsedValue;
    }

    public object safeIntegerN(object obj, List<object> keys, object defaultValue = null) => SafeIntegerN(obj, keys, defaultValue);
    public static Int64? SafeIntegerN(object obj, List<object> keys, object defaultValue = null)
    {
        var result = SafeValueN(obj, keys, defaultValue);
        if (result == null || result.ToString().Length == 0)
            if (defaultValue != null)
                return Convert.ToInt64(defaultValue);
            else
                return null;
        Int64? parsedValue = null;
        try
        {
            if (result is string)
            {

                if (((string)result).IndexOf(".") > -1)
                {
                    parsedValue = Convert.ToInt64(Convert.ToDouble(result, CultureInfo.InvariantCulture));
                }
                else
                {

                    // parsedValue = Convert.ToInt64(float.Parse(result.ToString(), CultureInfo.InvariantCulture));
                    parsedValue = Convert.ToInt64(result); // check this out
                }

            }
            else
            {
                parsedValue = Convert.ToInt64(result);

            }
        }
        catch (Exception e)
        {
            // try
            // {
            //     parsedValue = Math.Round((float)result);
            // }
            // catch (Exception e2)
            // {

            // }

        }
        return parsedValue == null ? Convert.ToInt64(defaultValue) : parsedValue;
    }

    public object safeStringN(object obj, object keys, object defaultValue = null) => SafeStringN(obj, keys, defaultValue);

    public static object SafeStringN(object obj, object keys, object defaultValue = null)
    {
        var result = SafeValueN(obj, keys, defaultValue);
        if (result == null)
            return defaultValue;
        string returnResult = null;
        if (result.GetType() == typeof(float))
        {
            returnResult = ((float)result).ToString(CultureInfo.InvariantCulture);
        }
        else if (result.GetType() == typeof(double))
        {
            returnResult = ((double)result).ToString(CultureInfo.InvariantCulture);
        }
        else if (result is double)
        {
            returnResult = ((double)result).ToString(CultureInfo.InvariantCulture);

        }
        else if (result is decimal)
        {
            returnResult = ((decimal)result).ToString(CultureInfo.InvariantCulture);
        }
        else
        {
            returnResult = result.ToString();
        }
        if (returnResult != null)
        {
            var stringRest = (string)returnResult;
            if (stringRest.Length > 0)
            {
                return stringRest;
            }
        }
        return defaultValue;
    }


    public object safeFloatN(object obj, object keys, object defaultValue = null) => SafeFloatN(obj, keys as List<object>, defaultValue);
    public static object SafeFloatN(object obj, List<object> keys, object defaultValue = null)
    {
        defaultValue ??= null;
        var result = SafeValueN(obj, keys, defaultValue);
        if (result == null)
            return defaultValue;
        object parsedValue = null;
        try
        {
            parsedValue = Convert.ToDouble(result, CultureInfo.InvariantCulture); // altough the name is float right now it is double
        }
        catch (Exception e)
        {

        }
        return parsedValue == null ? defaultValue : Convert.ToDouble(result, CultureInfo.InvariantCulture);
    }
    public object safeValueN(object obj, object keys2, object defaultValue = null) => SafeValueN(obj, keys2, defaultValue);
    public static object SafeValueN(object obj, object keys2, object defaultValue = null)
    {

        var keys = (List<object>)keys2;
        if (obj == null)
            return defaultValue;

        // convert array to list
        if (obj.GetType().IsArray == true)
        {
            obj = new List<object>((object[])obj);
        }

        if (obj is IDictionary<string, object>)
        {
            var dict = (IDictionary<string, object>)obj;
            foreach (var key2 in keys)
            {
                if (key2 == null)
                    continue;
                var key = key2.ToString();
                if (dict.ContainsKey(key))
                {

                    var returnValue = dict[key];
                    // if (returnValue == null)
                    //     return defaultValue;
                    // if ((returnValue.GetType() == typeof(dict)))
                    //     return (dict)returnValue;
                    // if ((returnValue.GetType() == typeof(List<object>)))
                    //     return (List<object>)returnValue;
                    // if ((returnValue.GetType() == typeof(string)))
                    //     return returnValue;
                    // if ((returnValue.GetType() == typeof(Int64)))
                    //     return Convert.ToInt64(returnValue);
                    if (returnValue == null || returnValue.ToString().Length == 0)
                        continue;

                    return returnValue;
                }
            }
            return defaultValue;
        }

        if (obj is IDictionary || (obj.GetType().IsGenericType && obj.GetType().GetGenericTypeDefinition() == typeof(Dictionary<,>))) // is the second cond needed?
        {
            // check if this is a dictionary regardless of the value type
            IDictionary<string, object> dict = ConvertToDictionaryOfStringObject(obj);
            foreach (var key2 in keys)
            {
                if (key2 == null)
                    continue;
                var key = key2.ToString();
                if (dict.ContainsKey(key))
                {
                    var returnValue = dict[key];
                    if (returnValue == null || returnValue.ToString().Length == 0)
                        continue;

                    return returnValue;
                }
            }
            return defaultValue;
        }
        // duplicated code for now, check this later
        if (obj is IList<object>)
        {
            var list = (IList<object>)obj;
            foreach (var key in keys)
            {
                var sucess = Int32.TryParse(key.ToString(), out int keyInt);
                if (sucess == false)
                    continue;
                if (list.ElementAtOrDefault(keyInt) != null)
                {
                    var returnValue = list[keyInt];
                    return returnValue;
                    // if ((returnValue.GetType() == typeof(dict)))
                    //     return (dict)returnValue;
                    // if ((returnValue.GetType() == typeof(List<object>)))
                    //     return (List<object>)returnValue;
                    // if ((returnValue.GetType() == typeof(string)))
                    //     return returnValue;
                    // if ((returnValue.GetType() == typeof(Int64)))
                    //     return returnValue;
                }
            }
        }


        if (obj is IList<string>)
        {
            var list = (IList<string>)obj;
            foreach (var key in keys)
            {
                var sucess = Int32.TryParse(key.ToString(), out int keyInt);
                if (sucess == false)
                    continue;
                if (list.ElementAtOrDefault(keyInt) != null)
                {
                    var returnValue = list[keyInt];
                    if ((returnValue.GetType() == typeof(string)))
                        return returnValue;
                    if ((returnValue.GetType() == typeof(Int64)))
                        return returnValue;
                }
            }
        }

        if (obj is IList<int>)
        {
            var list = (IList<int>)obj;
            foreach (var key in keys)
            {
                if (list.IndexOf((int)key) > -1) // this is wrong apparently
                {
                    var returnValue = list[(int)key];
                    if ((returnValue.GetType() == typeof(int)))
                        return (int)returnValue;
                }
            }
        }


        return defaultValue;
    }

}