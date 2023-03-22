using System.Text;
using System.Security.Cryptography;
using System.Text.Json;

namespace Main;

using dict = Dictionary<string, object>;

public partial class Exchange
{
    public long milliseconds()
    {
        return DateTime.Now.Ticks / TimeSpan.TicksPerMillisecond;
    }

    // public object nonce()
    // {
    //     return (Int64)(milliseconds() / 100);
    // }

    // private void teste(string x, List<object> y = null)
    // {

    // }

    public long microseconds()
    {
        return DateTime.Now.Ticks / TimeSpan.TicksPerMicrosecond;
    }

    private bool isHttpMethod(string method)
    {
        return method == "get" || method == "post" || method == "delete" || method == "put" || method == "patch";
    }

    public string capitalize(object str2)
    {
        var str = (string)str2;
        return char.ToLower(str[0]) + str.Substring(1);
    }

    public string urlencode(object parameters2)
    {
        var parameters = (dict)parameters2;
        var x = new Dictionary<string, object>() { { "ola", 1 } };
        var y = new List<string>(x.Keys);
        var z = new List<object>(x.Values);

        var queryString = System.Web.HttpUtility.ParseQueryString(string.Empty);
        var keys = new List<string>(parameters.Keys);
        foreach (string key in keys)
        {
            queryString.Add(key, parameters[key].ToString());
        }
        return queryString.ToString();
    }

    public string urlencodeNested(object paramaters)
    {
        // stub check this out
        var queryString = System.Web.HttpUtility.ParseQueryString(string.Empty);
        var keys = new List<string>(((dict)paramaters).Keys);
        foreach (string key in keys)
        {
            var value = ((dict)paramaters)[key];
            if (value != null && value.GetType() == typeof(dict))
            {
                var keys2 = new List<string>(((dict)value).Keys);
                foreach (string key2 in keys2)
                {
                    var value2 = ((dict)value)[key2];
                    queryString.Add(key + "[" + key2 + "]", value2.ToString());
                }
            }
            else
            {
                queryString.Add(key, value.ToString());
            }
        }
        return queryString.ToString();
    }

    public string encodeURIComponent(string str)
    {
        // check this later
        var result = new StringBuilder();
        var unreserved = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~";
        foreach (char symbol in str)
        {
            if (unreserved.IndexOf(symbol) != -1)
            {
                result.Append(symbol);
            }
            else
            {
                result.Append('%' + string.Format("{0:X2}", (int)symbol));
            }
        }
        return result.ToString();
    }

    public dict keysort(object parameters2)
    {
        var parameters = (dict)parameters2;
        var keys = new List<string>(parameters.Keys);
        keys.Sort();
        var outDict = new dict();
        foreach (string key in keys)
        {
            outDict.Add(key, parameters[key]);
        }
        return outDict;
    }

    public dict extend(object aa, object bb)
    {

        var a = (dict)aa;
        var b = (dict)bb;
        var keys = new List<string>(b.Keys);
        foreach (string key in keys)
        {
            // a.Add(key, b[key]);
            a[(string)key] = b[key];
        }
        return a;
    }

    public dict deepExtend(params object[] objs)
    {
        var outDict = new dict();
        foreach (object obj in objs)
        {
            var obj2 = obj;
            if (obj2 == null)
            {
                obj2 = new dict();
            }
            var keys = new List<string>(((dict)obj2).Keys);
            foreach (string key in keys)
            {
                var value = ((dict)obj2)[key];
                if (value != null && value.GetType() == typeof(dict))
                {
                    if (outDict.ContainsKey(key))
                    {
                        outDict[key] = deepExtend(outDict[key], value);
                    }
                    else
                    {
                        outDict[key] = deepExtend(value);
                    }
                }
                else
                {
                    outDict[key] = value;
                }
            }
        }
        return outDict;
    }

    public object omit(object a, params object[] parameters)
    {
        var keys = new List<object>();
        foreach (object parameter in parameters)
        {
            keys.Add(parameter);
        }
        return omit(a, keys);
    }

    public object omit(object aa, object k)
    {
        List<string> keys = null;
        if (k.GetType() == typeof(string))
        {
            keys = new List<string>() { (string)k };
        }
        else
        {
            var myList = (List<object>)k;
            keys = myList.Select(s => (string)s).ToList();
        }
        // var keys = new List<string>() { (string)k };
        var a = (dict)aa;
        var outDict = new dict();
        var aKeys = new List<string>(a.Keys);
        foreach (string key in aKeys)
        {
            if (!keys.Contains(key))
            {
                outDict.Add(key, a[key]);
            }
        }
        return outDict;
    }

    public dict omitN(object aa, List<object> keys)
    {
        var a = (dict)aa;
        var outDict = new dict();
        var aKeys = new List<string>(a.Keys);
        foreach (string key in aKeys)
        {
            if (!keys.Contains(key))
            {
                outDict.Add(key, a[key]);
            }
        }
        return outDict;
    }

    public object omit(dict a, string key)
    {
        var keys = new List<object>();
        keys.Add(key);
        return omit(a, keys);
    }

    public bool inArray(object elem, object list2)
    {
        var list = (List<object>)list2;
        return list.Contains(elem);
    }

    public List<object> sortBy(object aa, object value1, bool desc = false)
    {
        var list = (List<object>)aa;
        var value = (string)value1;

        var sortedList = list.OrderBy(x => ((dict)x)[value]).ToList();

        if (desc)
        {
            sortedList.Reverse();
        }

        return sortedList;
        // var outList = new List<object>();
        // var keys = new List<string>();
        // foreach (object elem in a)
        // {
        //     keys.Add(((dict)elem)[value].ToString());
        // }
        // keys.Sort();
        // if (desc)
        // {
        //     keys.Reverse();
        // }
        // foreach (string key in keys)
        // {
        //     foreach (object elem in a)
        //     {
        //         if (((dict)elem)[value].ToString() == key)
        //         {
        //             outList.Add(elem);
        //         }
        //     }
        // }
        // return outList;
    }

    public List<object> filterBy(object aa, object key, object value)
    {
        var a = (List<object>)aa;
        var outList = new List<object>();
        foreach (object elem in a)
        {
            if (((dict)elem)[(string)key].ToString() == value.ToString())
            {
                outList.Add(elem);
            }
        }
        return outList;
    }

    public bool isArray(object a)
    {
        return a is List<object>;
    }

    public dict indexBy(object a, object key2)
    {
        var key = (string)key2;
        var outDict = new dict();

        List<object> input = null;
        if (a.GetType() == typeof(List<object>))
        {
            input = (List<object>)a;
        }
        else if (a.GetType() == typeof(List<string>))
        {
            input = ((List<string>)a).Select(s => (object)s).ToList();
        }
        else if (a.GetType() == (typeof(dict)))
        {
            input = new List<object>();
            foreach (string key3 in ((dict)a).Keys)
            {
                input.Add(((dict)a)[key3]);
            }
        }

        foreach (object elem in input)
        {
            var elem2 = (dict)elem;
            if (elem2.ContainsKey(key))
            {
                // outDict.Add(((dict)elem)[key].ToString(), elem);
                outDict[(((dict)elem)[key]).ToString()] = elem2;
            }
        }
        return outDict;
    }

    public string iso8601(object ts)
    {
        if (ts == null)
        {
            return null;
        }
        var startdatetime = (Int64)ts;
        var date = (new DateTime(1970, 1, 1)).AddMilliseconds(startdatetime);
        return date.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");

    }

    public string ymdhms(object ts, object infix = null)
    {
        if (infix == null)
        {
            infix = "-";
        }
        // check this
        if (ts == null)
        {
            return null;
        }
        var startdatetime = (Int64)ts;
        var date = (new DateTime(1970, 1, 1)).AddMilliseconds(startdatetime);
        return date.ToString("yyyy" + infix + "MM" + infix + "dd HH:mm:ss");

    }

    public string yyyymmdd(object ts, object infix = null)
    {
        if (infix == null)
        {
            infix = "-";
        }
        // check this
        if (ts == null)
        {
            return null;
        }
        var startdatetime = (Int64)ts;
        var date = (new DateTime(1970, 1, 1)).AddMilliseconds(startdatetime);
        return date.ToString("yyyy" + infix + "MM" + infix + "dd");
    }

    public string yymmdd(object ts, object infix = null)
    {
        if (infix == null)
        {
            infix = "-";
        }
        // check this
        if (ts == null)
        {
            return null;
        }
        var startdatetime = (Int64)ts;
        var date = (new DateTime(1970, 1, 1)).AddMilliseconds(startdatetime);
        return date.ToString("yy" + infix + "MM" + infix + "dd");
    }

    public object ymd(object ts, object infix = null)
    {
        if (infix == null)
        {
            infix = "-";
        }
        // check this
        if (ts == null)
        {
            return null;
        }
        var startdatetime = (Int64)ts;
        var date = (new DateTime(1970, 1, 1)).AddMilliseconds(startdatetime);
        return date.ToString("yyyy" + infix + "MM" + infix + "dd");
    }

    public List<object> toArray(object a)
    {
        if (a.GetType() == typeof(List<object>))
        {
            return (List<object>)a;
        }
        // if (a.GetType() == typeof(List<string>))
        // {
        //     return (List<string>)a;
        // }

        var b = (dict)a;
        var outList = new List<object>();
        var keys = new List<string>(((dict)a).Keys);
        foreach (string key in keys)
        {
            outList.Add(b[key]);
        }
        return outList;
    }

    public List<object> arrayConcat(object aa, object bb)
    {
        var a = (List<object>)aa;
        var b = (List<object>)bb;
        var outList = new List<object>();
        foreach (object elem in a)
        {
            outList.Add(elem);
        }
        foreach (object elem in b)
        {
            outList.Add(elem);
        }
        return outList;
    }

    public object omitZero(object value)
    {
        if (value is double)
        {
            if ((double)value == 0.0)
            {
                return null;
            }
        }
        return value;
    }

    public List<object> sortBy2(object aa, string k1, string k2)
    {
        var a = (List<object>)aa;
        var outList = new List<object>();
        var keys = new List<string>();
        foreach (object elem in a)
        {
            keys.Add(((dict)elem)[k1].ToString() + ((dict)elem)[k2].ToString());
        }
        keys.Sort();
        foreach (string key in keys)
        {
            foreach (object elem in a)
            {
                if (((dict)elem)[k1].ToString() + ((dict)elem)[k2].ToString() == key)
                {
                    outList.Add(elem);
                }
            }
        }
        return outList;

    }

    public List<object> aggregate(object bidasks)
    {
        var outList = new List<object>();
        return outList; // stub to override
    }

    public List<object> filterByValueSinceLimit(object aa, object key, object value, object since, object limit, object timestamp = null, object tail = null)
    {
        tail ??= false;
        var a = (List<object>)aa;
        var outList = new List<object>();
        foreach (object elem in a)
        {
            var elemDict = (dict)elem;
            if (elemDict[(string)key].ToString() == value)
            {
                outList.Add(elem);
            }
        }
        return outList;
    }

    public List<object> filterBySinceLimit(object a, object since, object limit, object key = null, object tail2 = null)
    {
        var list = (List<object>)a;
        key ??= "timestamp";
        tail2 ??= false;
        var tail = (bool)tail2;
        var outList = new List<object>();
        if (tail)
        {
            list.Reverse();
        }
        foreach (object elem in list)
        {
            outList.Add(elem);
        }

        return outList;
    }

    public string uuid2()
    {
        return Guid.NewGuid().ToString();
    }

    public string uuid()
    {
        return Guid.NewGuid().ToString();
    }

    public string uuid16()
    {
        return Guid.NewGuid().ToString().Substring(0, 16);
    }

    public string uuidv1()
    {
        return Guid.NewGuid().ToString(); //stub
    }

    public object implodeParams(object path2, object parameter2)
    {
        // var path = (string)path2;
        // var parameter = (dict)parameter2;
        // var keys = new List<string>(((dict)parameter).Keys);
        // var outList = new List<object>();
        // foreach (string key in keys)
        // {
        //     outList.Add(key + "=" + parameter[key]);
        // }
        // return path + "?" + string.Join("&", outList);

        var path = (string)path2;
        if (parameter2.GetType() == typeof(dict))
        {
            var parameter = (dict)parameter2;
            var keys = new List<string>(((dict)parameter).Keys);
            var outList = new List<object>();
            foreach (string key in keys)
            {
                var value = parameter[key];
                if (value.GetType() == typeof(dict))
                {
                    path = path.Replace("{" + key + "}", (string)parameter[key]);
                }
                // outList.Add(key + "=" + parameter[key]);
            }
            return path;
            // return (string)path2 + "?" + string.Join("&", outList);

        }
        else
        {
            return (string)parameter2;
        }
    }

    public object parse8601(object timestamp2)
    {
        // stub check this out
        var timestamp = (string)timestamp2;
        return DateTime.Parse(timestamp).Millisecond;
    }

    public string uuid22()
    {
        return Guid.NewGuid().ToString();
    }

    public string rawencode(object paramaters1)
    {
        var paramaters = (dict)paramaters1;
        var keys = new List<string>(((dict)paramaters).Keys);
        var outList = new List<object>();
        foreach (string key in keys)
        {
            outList.Add(key + "=" + paramaters[key]);
        }
        return string.Join("&", outList);
    }

    public string urlencodeWithArrayRepeat(object parameters)
    {
        var paramaters = (dict)parameters;
        var keys = new List<string>(((dict)paramaters).Keys);
        var outList = new List<object>();
        foreach (string key in keys)
        {
            outList.Add(key + "=" + paramaters[key]);
        }
        return string.Join("&", outList);
    }

    public List<object> extractParams(object str)
    {
        var outList = new List<object>();
        return outList; // stub to implement
    }

    public object buildOHLCVC(object trades, object timeframe, object since, object limit)
    {
        return null; // stub to implement
    }

    public dict groupBy(object trades, object key2)
    {
        var key = (string)key2;
        var outDict = new dict();
        var list = (List<object>)trades;
        foreach (object elem in list)
        {
            var elemDict = (dict)elem;
            if (elemDict.ContainsKey(key))
            {
                var elem2 = (string)elemDict[key];
                if (outDict.ContainsKey(elem2))
                {
                    var list2 = (List<object>)outDict[elem2];
                    list2.Add(elem);
                    outDict[elem2] = list2;
                }
                else
                {
                    var list2 = new List<object>();
                    list2.Add(elem);
                    outDict[elem2] = list2;
                }

            }

        }

        return outDict;
    }

    public bool isJsonEncodedObject(object str)
    {
        var str2 = (string)str;
        if (str2 != null && (str2.StartsWith("{") || str2.StartsWith("[")))
        {
            return true;
        }
        else
        {
            return false;
        }

    }

    public string json(object obj)
    {
        var obj2 = (dict)obj;
        return JsonSerializer.Serialize<Dictionary<string, object>>(obj2);
    }

    public object ordered(object ob)
    {
        return ob;
    }

}