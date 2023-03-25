using System.Text;
using System.Security.Cryptography;

namespace Main;

using dict = Dictionary<string, object>;

public partial class Exchange
{
    // falsy and truthy methods wrappers

    // tmp safe number
    public object safeNumberN(object obj, List<object> keys, object defaultValue = null) => safeFloatN(obj, keys, defaultValue);
    // public float safeNumber(object obj, object key, float defaultValue = -1) => safeFloatN(obj, new List<object> { key }, defaultValue);
    // public float safeNumber2(object obj, object key1, object key2, float defaultValue = -1) => safeFloatN(obj, new List<object> { key1, key2 }, defaultValue);

    ////////////////////////////////////////////////////////

    public object safeTimestamp(object obj, object key, object defaultValue = null)
    {
        var value = safeValue(obj, key, defaultValue);
        if (value == null)
            return null;
        if (value is string)
        {
            return Convert.ToInt64(value) / 1000;
        }
        return safeInteger(value, defaultValue);
    }

    public object safeTimestamp2(object obj, object key1, object key2, int defaultValue = -1)
    {
        var value = safeValue2(obj, key1, key2, defaultValue);
        if (value is string)
        {
            return (Int64)milliseconds() / 1000;
        }
        return (Int64)safeInteger(value, defaultValue);
    }

    public object safeInteger(object obj, object key, object defaultValue = null) => safeIntegerN(obj, new List<object> { key }, defaultValue);

    public object safeInteger2(object obj, object key1, object key2, object defaultValue = null) => safeIntegerN(obj, new List<object> { key1, key2 }, defaultValue);

    public object safeFloat(object obj, object key, object defaultValue = null) => safeFloatN(obj, new List<object> { key }, defaultValue);

    public object safeFloat2(object obj, object key1, object key2, object defaultValue = null) => safeFloatN(obj, new List<object> { key1, key2 }, defaultValue);

    public object safeString(object obj, object key, object defaultValue = null) => safeStringN(obj, new List<object> { key }, defaultValue);

    public object safeString2(object obj, object key1, object key2, object defaultValue = null) => safeStringN(obj, new List<object> { key1, key2 }, defaultValue);

    public object safeValue2(object obj, object key1, object key2, object defaultValue = null) => safeValueN(obj, new List<object> { key1, key2 }, defaultValue);

    public object safeValue(object obj, object key1, object defaultValue = null) => safeValueN(obj, new List<object> { key1 }, defaultValue);


    public object safeStringUpper(object obj, object key, object defaultValue = null)
    {
        var result = toStringOrNull(safeString(obj, key, defaultValue));
        return result == null ? defaultValue : result.ToUpper();
    }

    public object safeStringUpper2(object obj, object key1, object key2, object defaultValue = null)
    {
        var result = safeString2(obj, new List<object> { key1, key2 }, defaultValue);
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
        var result = safeString2(obj, new List<object> { key1, key2 }, defaultValue);
        return result == null ? defaultValue : ((string)result).ToLower();
    }

    public object safeStringLowerN(object obj, List<object> keys, string defaultValue = null)
    {
        var result = safeStringN(obj, keys, defaultValue);
        return result == null ? defaultValue : ((string)result).ToLower();
    }

    public object safeIntegerProduct(object obj, object key, object defaultValue = null, object multiplier = null)
    {
        defaultValue ??= 0;
        multiplier ??= 1;
        var result = safeValueN(obj, new List<object> { key }, defaultValue);
        object parsedValue = null;
        try
        {
            parsedValue = (Convert.ToInt64(result) * Convert.ToInt64(multiplier));
        }
        catch (Exception e)
        {

        }
        return parsedValue == null ? defaultValue : parsedValue;
    }

    public object safeIntegerProduct2(object obj, object key1, object key2, object defaultValue = null, object multiplier = null)
    {
        var result = safeValueN(obj, new List<object> { key1, key2 }, defaultValue);
        object parsedValue = null;
        try
        {
            parsedValue = (Convert.ToInt64(result) * Convert.ToInt64(multiplier));
        }
        catch (Exception e)
        {

        }
        return parsedValue == null ? defaultValue : parsedValue;
    }

    public object safeIntegerN(object obj, List<object> keys, object defaultValue = null)
    {
        var result = safeValueN(obj, keys, defaultValue);
        if (result == null)
            return defaultValue;
        object parsedValue = null;
        try
        {
            parsedValue = Convert.ToInt64(result);
        }
        catch (Exception e)
        {

        }
        return parsedValue == null ? defaultValue : parsedValue;
    }

    public object safeStringN(object obj, object keys, object defaultValue = null)
    {
        var result = safeValueN(obj, keys, defaultValue);
        var returnResult = result == null ? defaultValue : (result).ToString();
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


    public object safeFloatN(object obj, List<object> keys, object defaultValue = null)
    {
        defaultValue ??= null;
        var result = safeValueN(obj, keys, defaultValue);
        if (result == null)
            return defaultValue;
        object parsedValue = null;
        try
        {
            parsedValue = Convert.ToSingle(result);
        }
        catch (Exception e)
        {

        }
        return parsedValue == null ? defaultValue : Convert.ToSingle(result);
    }

    public object safeValueN(object obj, object keys2, object defaultValue = null)
    {

        var keys = (List<object>)keys2;
        if (obj == null)
            return defaultValue;

        // convert array to list
        if (obj.GetType().IsArray == true)
        {
            obj = new List<object>((object[])obj);
        }

        if (obj.GetType() == typeof(dict))
        {
            var dict = (dict)obj;
            foreach (var key2 in keys)
            {
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

                    return returnValue;
                }
            }
        }
        // duplicated code for now, check this later
        if (obj.GetType() == typeof(List<object>))
        {
            var list = (List<object>)obj;
            foreach (var key in keys)
            {
                if (list.ElementAtOrDefault((int)key) != null)
                {
                    var returnValue = list[(int)key];
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


        if (obj.GetType() == typeof(List<string>))
        {
            var list = (List<string>)obj;
            foreach (var key in keys)
            {
                if (list.ElementAtOrDefault((int)key) != null)
                {
                    var returnValue = list[(int)key];
                    if ((returnValue.GetType() == typeof(string)))
                        return returnValue;
                    if ((returnValue.GetType() == typeof(Int64)))
                        return returnValue;
                }
            }
        }

        if (obj.GetType() == typeof(List<int>))
        {
            var list = (List<int>)obj;
            foreach (var key in keys)
            {
                if (list.ElementAtOrDefault((int)key) != null) // this is wrong apparently
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