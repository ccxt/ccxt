namespace ccxt;
using System.Security.Cryptography;
using System.Text;

using dict = Dictionary<string, object>;
using list = List<object>;

public partial class Exchange
{
    public List<object> sortBy(object array, object value1, object desc2 = null)
    {
        desc2 ??= false;
        var desc = (bool)desc2;
        var list = (List<object>)array;

        if (value1.GetType() == typeof(string))
        {
            var sortedList2 = list.OrderBy(x => ((dict)x)[(string)value1]).ToList();
            return sortedList2;
        }
        else
        {
            var value = (int)value1;
            var sortedList = list.OrderBy(x => ((list)x)[value]).ToList();

            if (desc)
                sortedList.Reverse();

            return sortedList;
        }
    }

    public List<object> sortBy2(object array, object key1, object key2, object desc2 = null)
    {
        // todo :: check this later
        desc2 ??= false;
        var desc = (bool)desc2;
        var list = (List<object>)array;

        if (key1.GetType() == typeof(string))
        {
            var orderByResult = (from s in list
                                 orderby ((dict)s)[(string)key1], ((dict)s)[(string)key2]
                                 select s).ToList();
            if (desc)
                orderByResult.Reverse();
            return orderByResult;
        }
        return null;
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

    public bool inArray(object elem, object list2)
    {
        var list = (List<object>)list2;
        return list.Contains(elem);
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

    public object omitZero(object value)
    {
        if (value is double)
        {
            if ((double)value == 0.0)
            {
                return null;
            }
        }
        if (value is Int64)
        {
            if ((Int64)value == 0)
            {
                return null;
            }
        }
        if (value is string)
        {
            if ((string)value == "0")
            {
                return null;
            }
        }
        return value;
    }

    public virtual object sum(params object[] args)
    {
        object res = 0;
        foreach (var arg in args)
        {
            res = sum(res, arg);
        }
        return res;
    }

    public virtual object sum(object a, object b)
    {
        return float.Parse(a.ToString()) + float.Parse(b.ToString());
    }

}
