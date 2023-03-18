using System.Text;
using System.Security.Cryptography;

namespace Main;

using dict = Dictionary<string, object>;

public partial class Exchange
{
    // falsy and truthy methods wrappers

    // tmp safe number
    public float safeNumberN(object obj, List<object> keys, float defaultValue = -1) => safeFloatN(obj, keys, defaultValue);
    // public float safeNumber(object obj, object key, float defaultValue = -1) => safeFloatN(obj, new List<object> { key }, defaultValue);
    // public float safeNumber2(object obj, object key1, object key2, float defaultValue = -1) => safeFloatN(obj, new List<object> { key1, key2 }, defaultValue);

    ////////////////////////////////////////////////////////

    public object safeTimestamp(object obj, object key, int defaultValue = -1)
    {
        var value = safeValue(obj, key, defaultValue);
        if (value is string)
        {
            return (Int64)milliseconds() / 1000;
        }
        return (Int64)safeInteger(value, defaultValue);
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

    public object safeInteger2(object obj, object key1, object key2, object defaultValue = null) => safeInteger2(obj, new List<object> { key1, key2 }, defaultValue);

    public object safeFloat(object obj, object key, object defaultValue = null) => safeFloatN(obj, new List<object> { key }, (float)defaultValue);

    public object safeFloat2(object obj, object key1, object key2, object defaultValue = null) => safeFloatN(obj, new List<object> { key1, key2 }, (float)defaultValue);

    public string safeString(object obj, object key, object defaultValue = null) => safeStringN(obj, new List<object> { key }, (string)defaultValue);

    public string safeString2(object obj, object key1, object key2, object defaultValue = null) => safeStringN(obj, new List<object> { key1, key2 }, (string)defaultValue);

    public object safeValue2(object obj, object key1, object key2, object defaultValue = null) => safeValueN(obj, new List<object> { key1, key2 }, defaultValue);

    public object safeValue(object obj, object key1, object defaultValue = null) => safeValueN(obj, new List<object> { key1 }, defaultValue);


    public string safeStringUpper(object obj, object key, string defaultValue = null)
    {
        var result = safeString(obj, key, defaultValue);
        return result == null ? defaultValue : result.ToUpper();
    }

    public string safeStringUpper2(object obj, object key1, object key2, string defaultValue = null)
    {
        var result = safeString2(obj, new List<object> { key1, key2 }, defaultValue);
        return result == null ? defaultValue : result.ToUpper();
    }

    public string safeStringUpperN(object obj, List<object> keys, string defaultValue = null)
    {
        var result = safeStringN(obj, keys, defaultValue);
        return result == null ? defaultValue : result.ToUpper();
    }

    public string safeStringLower(object obj, object key, string defaultValue = null)
    {
        var result = safeString(obj, key, defaultValue);
        return result == null ? defaultValue : result.ToLower();
    }

    public string safeStringLower2(object obj, object key1, object key2, string defaultValue = null)
    {
        var result = safeString2(obj, new List<object> { key1, key2 }, defaultValue);
        return result == null ? defaultValue : result.ToLower();
    }

    public string safeStringLowerN(object obj, List<object> keys, string defaultValue = null)
    {
        var result = safeStringN(obj, keys, defaultValue);
        return result == null ? defaultValue : result.ToLower();
    }

    public object safeIntegerN(object obj, List<object> keys, object defaultValue = null)
    {
        defaultValue ??= 0;
        var result = safeValueN(obj, keys, defaultValue);
        return result == null ? defaultValue : (Convert.ToInt64(result));
    }

    public string safeStringN(object obj, object keys, string defaultValue = null)
    {
        var result = safeValueN(obj, keys, defaultValue);
        return result == null ? defaultValue : result.ToString();
    }


    public float safeFloatN(object obj, List<object> keys, float defaultValue = -1)
    {
        var result = safeValueN(obj, keys, defaultValue);
        return result == null ? defaultValue : Convert.ToSingle(result);
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
            foreach (var key in keys)
            {
                if (dict.ContainsKey((string)key))
                {

                    var returnValue = dict[(string)key];
                    if (returnValue == null)
                        return defaultValue;
                    if ((returnValue.GetType() == typeof(dict)))
                        return (dict)returnValue;
                    if ((returnValue.GetType() == typeof(List<object>)))
                        return (List<object>)returnValue;
                    if ((returnValue.GetType() == typeof(string)))
                        return (string)returnValue;
                    if ((returnValue.GetType() == typeof(Int64)))
                        return Convert.ToInt64(returnValue);

                    return returnValue;
                }
            }
        }
        // duplicated code for now, check this later
        if (obj.GetType() == typeof(List<object>))
        {
            var list = (List<object>)obj;
            foreach (var key in list)
            {
                if (list.ElementAt((int)key) != null)
                {
                    var returnValue = list[(int)key];
                    if ((returnValue.GetType() == typeof(dict)))
                        return (dict)returnValue;
                    if ((returnValue.GetType() == typeof(List<object>)))
                        return (List<object>)returnValue;
                    if ((returnValue.GetType() == typeof(string)))
                        return (string)returnValue;
                    if ((returnValue.GetType() == typeof(Int64)))
                        return (string)returnValue;
                }
            }
        }


        if (obj.GetType() == typeof(List<string>))
        {
            var list = (List<string>)obj;
            foreach (var key in keys)
            {
                if (list.ElementAt((int)key) != null)
                {
                    var returnValue = list[(int)key];
                    if ((returnValue.GetType() == typeof(string)))
                        return (string)returnValue;
                    if ((returnValue.GetType() == typeof(Int64)))
                        return (string)returnValue;
                }
            }
        }

        if (obj.GetType() == typeof(List<int>))
        {
            var list = (List<int>)obj;
            foreach (var key in keys)
            {
                if (list.ElementAt((int)key) != null)
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