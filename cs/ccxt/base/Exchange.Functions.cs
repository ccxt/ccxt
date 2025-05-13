using Newtonsoft.Json;

using System.Text.RegularExpressions;

namespace ccxt;

using dict = Dictionary<string, object>;

public partial class Exchange
{

    private bool isHttpMethod(string method)
    {
        return method == "get" || method == "post" || method == "delete" || method == "put" || method == "patch";
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
        if (aa is (IList<object>))
        {
            return aa;
        }
        List<string> keys = null;
        if (k is (string))
        {
            keys = new List<string>() { (string)k };
        }
        else
        {
            var myList = (List<object>)k;
            keys = myList.Select(s => (string)s).ToList();
        }
        // var keys = new List<string>() { (string)k };
        var a = (IDictionary<string, object>)aa;
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

    public IList<object> toArray(object a)
    {
        if (a == null)
            return null;

        // if (a.GetType() == typeof(List<object>))
        // {
        //     return (List<object>)a;
        // }
        if (a is List<object>)
        {
            return (List<object>)a;
        }

        if (a is IList<object>)
        {
            // return ((IList<object>)a).ToList();
            return ((IList<object>)a);
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

    public object arrayConcat(object aa, object bb)
    {
        // if (aa.GetType() == typeof(List<object>))
        if (aa is List<object>)
        {
            var a = (List<object>)aa;
            var b = (List<object>)bb;
            var outList = new List<object>();
            foreach (object elem in a)
                outList.Add(elem);
            foreach (object elem in b)
                outList.Add(elem);
            return outList;
        }

        if (aa.GetType() == typeof(List<Task<object>>))
        {
            var a = (List<Task<object>>)aa;
            var b = (List<Task<object>>)bb;
            var outList = new List<Task<object>>();
            foreach (var elem in a)
                outList.Add(elem);
            foreach (var elem in b)
                outList.Add(elem);
            return outList;
        }
        return null;
    }

    public List<object> aggregate(object bidasks)
    {
        var outList = new List<object>();
        return outList; // stub to override
    }

    // public List<object> filterByValueSinceLimit(object aa, object key, object value, object since, object limit, object timestamp = null, object tail = null)
    // {
    //     tail ??= false;
    //     var a = (List<object>)aa;
    //     var outList = new List<object>();
    //     foreach (object elem in a)
    //     {
    //         var elemDict = (dict)elem;
    //         if (elemDict[(string)key].ToString() == value)
    //         {
    //             outList.Add(elem);
    //         }
    //     }
    //     return outList;
    // }

    // public List<object> filterBySinceLimit(object a, object since, object limit, object key = null, object tail2 = null)
    // {
    //     var list = (List<object>)a;
    //     key ??= "timestamp";
    //     tail2 ??= false;
    //     var tail = (bool)tail2;
    //     var outList = new List<object>();
    //     if (tail)
    //     {
    //         list.Reverse();
    //     }
    //     foreach (object elem in list)
    //     {
    //         outList.Add(elem);
    //     }

    //     return outList;
    // }


    public string uuidv1()
    {
        return Guid.NewGuid().ToString(); //stub
    }


    public List<object> extractParams(object str)
    {
        var regex = new Regex(@"\{([^\}]+)\}");
        var matches = regex.Matches((string)str);
        var outList = new List<object>();
        foreach (Match match in matches)
        {
            outList.Add(match.Groups[1].Value);
        }
        return outList;
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
        if (obj is ccxt.pro.IOrderBook)
        {
            // tmp fix, not this prevents the Collection was modified; enumeration operation may not execute error wtf
            var ob = (ccxt.pro.IOrderBook)obj;
            var copy = ob.Copy();
            try
            {
                return Json(copy);
            }
            catch (Exception e)
            {
                throw e;
            }
        }
        return Json(obj);
    }

    public static string Json(object obj)
    {
        if (obj == null)
            return null;
        // Check if the object is an exception
        if (obj is Exception ex)
        {
            var errorObj = new { name = ex.GetType().Name };
            return JsonConvert.SerializeObject(errorObj);
        }

        return JsonConvert.SerializeObject(obj);
        // if (obj.GetType() == typeof(dict))
        // {
        //     var obj2 = (dict)obj;
        //     return JsonSerializer.Serialize<Dictionary<string, object>>(obj2)dd;
        // }
        // if (obj.GetType() == typeof(List<object>))
        // {
        //     var obj2 = (List<object>)obj;
        //     return JsonSerializer.Serialize<List<object>>(obj2);
        // }
        // if (obj.GetType() == typeof(List<string>))
        // {
        //     var obj2 = (List<string>)obj;
        //     return JsonSerializer.Serialize<List<string>>(obj2);
        // }
        // if (obj.GetType() == typeof(List<int>))
        // {
        //     var obj2 = (List<int>)obj;
        //     return JsonSerializer.Serialize<List<int>>(obj2);
        // }
        // return null;
    }

    public object ordered(object ob)
    {
        return ob; //stub
    }
}
