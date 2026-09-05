namespace ccxt;

using System.Globalization;

using dict = IDictionary<string, object>;
using list = List<object>;

public partial class BaseExchange
{
    public List<object> sortBy(object array, object value1, object desc2 = null, object defaultValue2 = null)
    {
        desc2 ??= false;
        var defaultValue = defaultValue2 ?? 0; // ts parity: generic.ts defaults the sort fallback to 0, not the empty string
        var desc = (bool)desc2;
        var list = (IList<object>)array;

        if (value1.GetType() == typeof(string))
        {
            var sortedList2 = list.OrderBy(x => ((dict)x)[(string)value1], sortKeyComparer).ToList();
            if (desc)
                sortedList2.Reverse();
            return sortedList2;
        }
        else
        {
            var value = (int)value1;
            var sortedList = list.OrderBy(x =>
            {
                if (x.GetType() == typeof(list))
                {
                    return ((list)x)[value];
                }
                return defaultValue;
            }, sortKeyComparer).ToList();

            if (desc)
                sortedList.Reverse();

            return sortedList;
        }
    }

    // a TOTAL comparator for sort keys, matching go's compareSortValues and
    // java's compareJsLike: numeric pairs compare as double regardless of how
    // they were boxed (Double from parsers next to Int32/Int64 from literals
    // and integer math used to throw ArgumentException out of
    // Double.CompareTo), and anything else falls back to ordinal string
    // comparison, so no key mix can throw. caveat shared with the double
    // route in go and java: integral keys above 2^53 can collide in double
    // space and settle on input order - ccxt's real keys (ms timestamps,
    // prices) sit well inside the exact range
    private class SortKeyComparer : IComparer<object>
    {
        private static bool isNumeric(object key)
        {
            return key is sbyte || key is byte || key is short || key is ushort || key is int || key is uint || key is long || key is ulong || key is float || key is double || key is decimal;
        }

        public int Compare(object a, object b)
        {
            if (isNumeric(a) && isNumeric(b))
            {
                return Convert.ToDouble(a).CompareTo(Convert.ToDouble(b));
            }
            var sa = (a == null) ? "" : a.ToString();
            var sb = (b == null) ? "" : b.ToString();
            return string.CompareOrdinal(sa, sb);
        }
    }

    private static readonly SortKeyComparer sortKeyComparer = new SortKeyComparer();

    public List<object> sortBy2(object array, object key1, object key2, object desc2 = null)
    {
        // todo :: check this later
        desc2 ??= false;
        var desc = (bool)desc2;
        var list = (IList<object>)array;

        if (key1.GetType() == typeof(string))
        {
            var orderByResult = list.OrderBy(s => ((dict)s)[(string)key1], sortKeyComparer)
                                    .ThenBy(s => ((dict)s)[(string)key2], sortKeyComparer)
                                    .ToList();
            if (desc)
                orderByResult.Reverse();
            return orderByResult;
        }
        return null;
    }

    public List<object> filterBy(object aa, object key, object value)
    {
        // var targetA = (List<object>)aa;
        var targetA = new List<object>() { };
        if (aa is List<object> plain)
        {
            targetA = plain;
        }
        else if (aa is dict asDict)
        {
            targetA = asDict.Values.ToList();
        }
        else if (aa is System.Collections.IEnumerable rows)
        {
            // a typed core's List<Dictionary<string, object>> (dydx FetchTransactionsHelper)
            foreach (var row in rows)
            {
                targetA.Add(row);
            }
        }
        var outList = new List<object>();
        foreach (object elem in targetA)
        {
            // JS reads a missing key as undefined and simply does not match; indexing the
            // dictionary directly threw KeyNotFoundException on entries lacking the key.
            var row = (dict)elem;
            object cell = row.TryGetValue((string)key, out var found) ? found : null;
            if (cell?.ToString() == value?.ToString())
            {
                outList.Add(elem);
            }
        }
        return outList;
    }

    public Dictionary<string, object> extend(object aa, object bb = null)
    {
        return Extend(aa, bb);
    }

    public static Dictionary<string, object> Extend(object aa, object bb = null)
    {

        var a = (dict)aa;
        var outDict = new Dictionary<string, object>();
        var keysA = new List<string>(a.Keys);
        foreach (string key in keysA)
            outDict[(string)key] = a[key];

        if (bb != null)
        {
            var b = (dict)bb;
            var keysB = new List<string>(b.Keys);
            foreach (string key in keysB)
                outDict[(string)key] = b[key];
        }
        return outDict;
    }

    public object deepExtend2(params object[] objs)
    {
        // old implementation
        object outDict = new Dictionary<string, object>();
        foreach (object obj in objs)
        {
            var obj2 = obj;
            if (obj2 == null)
            {
                obj2 = new Dictionary<string, object>();
            }
            if (obj2 is dict)
            {
                var keys = new List<string>(((dict)obj2).Keys);
                foreach (string key in keys)
                {

                    var value = ((dict)obj2)[key];
                    if (value != null && value is dict)
                    {
                        if (((dict)outDict).ContainsKey(key))
                        {
                            ((dict)outDict)[key] = deepExtend2(((dict)outDict)[key], value);
                        }
                        else
                        {
                            ((dict)outDict)[key] = deepExtend2(value);
                        }
                    }
                    else
                    {
                        ((dict)outDict)[key] = value;
                    }
                }
            }
            else
            {
                outDict = obj;
            }
        }
        return outDict;
    }
    public Dictionary<string, object> deepExtend(params object[] objs)
    {
        object outObj = null;
        foreach (object x in objs)
        {
            if (x == null)
                continue;

            if (x is dict)
            {
                if (outObj == null || !(outObj is dict))
                    outObj = new Dictionary<string, object>();

                var dictX = (dict)x;
                var dictXKeys = new List<string>(dictX.Keys);
                foreach (string k in dictXKeys)
                {
                    var arg1 = ((dict)outObj).ContainsKey(k) ? ((dict)outObj)[k] : null;
                    var arg2 = dictX.ContainsKey(k) ? dictX[k] : null;
                    // ((dict)outObj)[(string)k] = deepExtend(arg1, arg2); // this screws the  return type
                    if (arg1 is dict && arg2 is dict)
                    {
                        ((dict)outObj)[k] = deepExtend(arg1, arg2);
                    }
                    else
                    {
                        ((dict)outObj)[k] = arg2;
                    }
                }
            }
            else
            {
                outObj = x;
            }
        }
        return outObj as Dictionary<string, object>;
    }
    public bool inArray(object elem, object list2)
    {
        if (list2 == null)
            return false;
        if (list2 is List<string>)
        {
            return ((List<string>)list2).Contains((string)elem);
        }
        if (list2 is List<Int64>)
        {
            return ((List<Int64>)list2).Contains(Convert.ToInt64(elem));
        }
        var list = (List<object>)list2;
        if (elem is Int32 || elem is Int64)
        {
            return list.Contains(Convert.ToInt64(elem)) || list.Contains(Convert.ToInt32(elem));
        }
        return list.Contains(elem);
    }


    public bool isArray(object a)
    {
        return a is IList<object>;
    }

    public Dictionary<string, object> indexBySafe(object a, object key2)
    {
        return indexBy(a, key2); // this is needed for go
    }

    public Dictionary<string, object> indexBy(object a, object key2)
    {
        // var key = (string)key2;
        // var outDict = new Dictionary<string, object>();

        // List<object> input = null;
        // if (a.GetType() == typeof(List<object>))
        // {
        //     input = (List<object>)a;
        // }
        // else if (a.GetType() == typeof(List<string>))
        // {
        //     input = ((List<string>)a).Select(s => (object)s).ToList();
        // }
        // else if (a.GetType() == (typeof(dict)))
        // {
        //     input = new List<object>();
        //     foreach (string key3 in ((dict)a).Keys)
        //     {
        //         input.Add(((dict)a)[key3]);
        //     }
        // }

        // foreach (object elem in input)
        // {
        //     var elem2 = (dict)elem;
        //     if (elem2.ContainsKey(key))
        //     {
        //         // outDict.Add(((dict)elem)[key].ToString(), elem);
        //         outDict[(((dict)elem)[key]).ToString()] = elem2;
        //     }
        // }
        // return outDict;
        var outDict = new Dictionary<string, object>();
        var targetX = new List<object>() { };
        if (a.GetType() == typeof(List<object>))
        {
            targetX = (List<object>)a;
        }
        else
        {
            targetX = ((dict)a).Values.ToList();
        }
        foreach (object elem in targetX)
        {
            // var elem2 = (dict)elem;
            if (elem is dict)
            {
                var elem2 = (dict)elem;
                if (elem2.ContainsKey((string)key2))
                {
                    var elem2Value = elem2[(string)key2];
                    if (elem2Value == null)
                        continue;
                    outDict[elem2Value.ToString()] = elem2;
                }
            }
            else if (elem.GetType() == typeof(List<string>) || elem.GetType() == typeof(List<object>))
            {
                var index = Convert.ToInt32(key2);
                if (elem.GetType() == typeof(List<string>))
                {
                    var elem2 = (List<string>)elem;
                    if (elem2.Count > 0)
                    {
                        var elem2IndexValue = elem2[index];
                        if (elem2IndexValue == null)
                            continue;
                        outDict[elem2IndexValue.ToString()] = elem2;
                    }
                }
                if (elem.GetType() == typeof(List<object>))
                {
                    var elem2 = (List<object>)elem;
                    if (elem2.Count > 0)
                    {
                        var elem2IndexValue = elem2[index];
                        if (elem2IndexValue == null)
                            continue;
                        outDict[elem2IndexValue.ToString()] = elem2;
                    }
                }

            }

        }
        return outDict;
    }

    public Dictionary<string, object> groupBy(object trades, object key2)
    {
        var key = (string)key2;
        var outDict = new Dictionary<string, object>();
        var list = (List<object>)trades;
        foreach (object elem in list)
        {
            var elemDict = (dict)elem;
            if (elemDict.ContainsKey(key))
            {
                var elem2 = (string)elemDict[key];
                if (elem2 == null)
                    continue;
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
        try
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
                // if ((string)value == "0")
                // {
                //     return null;
                // }
                var parsed = Convert.ToDouble(value, CultureInfo.InvariantCulture);
                if (parsed == 0)
                {
                    return null;
                }
            }
            return value;
        }
        catch (Exception e)
        {
            return value;
        }

    }

    public virtual object isDictionary(object value)
    {
        return isTrue(isTrue((!isEqual(value, null))) && isTrue(((value is IDictionary<string, object>)))) && !isTrue(((value is IList<object>) || (value.GetType().IsGenericType && value.GetType().GetGenericTypeDefinition().IsAssignableFrom(typeof(List<>)))));
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
        if (a == null)
            a = 0;
        if (b == null)
            b = 0;
        var sum = Convert.ToDouble(a) + Convert.ToDouble(b);
        if (IsInteger(sum))
        {
            return Convert.ToInt64(sum);
        }
        return sum;
    }

}
