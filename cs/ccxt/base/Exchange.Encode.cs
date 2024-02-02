namespace ccxt;
using System.Security.Cryptography;
using System.Text;


using dict = Dictionary<string, object>;
using list = List<object>;

public partial class Exchange
{

    public object base16ToBinary(object str)
    {
        return (string)str; // stub
    }

    public virtual object remove0xPrefix(object str)
    {
        return (string)str; // stub
    }

    public string stringToBase64(object pt) => StringToBase64(pt);
    public static string StringToBase64(object pt)
    {
        var plainText = (string)pt;
        var plainTextBytes = System.Text.Encoding.UTF8.GetBytes(plainText);
        return System.Convert.ToBase64String(plainTextBytes);
    }
    public byte[] base64ToBinary(object pt) => Base64ToBinary(pt);
    public static byte[] Base64ToBinary(object pt)
    {
        // check this
        var plainText = (string)pt;
        var base64EncodedBytes = System.Convert.FromBase64String(plainText);
        return base64EncodedBytes;
    }

    public string base58ToBinary(object str)
    {
        return (string)str; // stub
    }

    public object binaryConcat(object a, object b)
    {
        return (string)a + (string)b; // stub
    }

    public object binaryConcatArray(object a)
    {
        return (string)a; // stub
    }

    public object numberToBE(object n, object padding = null)
    {
        // implement number to big endian
        return (string)n; // stub
    }

    public static string binaryToHex(byte[] buff)
    {
        var result = string.Empty;
        foreach (var t in buff)
            result += t.ToString("X2");
        // return result;
        return result.ToLower();// check this
    }

    public string binaryToBase16(object buff2)
    {
        var buff = (byte[])buff2;
        return binaryToHex(buff);
    }

    public string binaryToBase58(object buff2)
    {
        var buff = (byte[])buff2;
        return binaryToHex(buff);
    }

    public static string binaryToBase64(byte[] buff)
    {
        return Convert.ToBase64String(buff);
    }

    public byte[] stringToBinary(string buff)
    {
        return Encoding.UTF8.GetBytes(buff);
    }

    public string encode(object data)
    {
        return (string)data; // stub for python
    }

    public string decode(object data)
    {
        return (string)data; // stub for python
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
            var value = paramaters[key];
            if (value is IList<object>)
            {
                foreach (var item in (IList<object>)value)
                {
                    outList.Add(key + "=" + item);
                }
            }
            else
            {
                outList.Add(key + "=" + value);
            }
        }
        return string.Join("&", outList);
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
                    var finalValue = value2.ToString();
                    if (value2.GetType() == typeof(bool))
                    {
                        finalValue = finalValue.ToLower(); // c# uses "True" and "False" instead of "true" and "false" $:(

                    }
                    queryString.Add(key + "[" + key2 + "]", finalValue);
                }
            }
            else
            {
                queryString.Add(key, value.ToString());
            }
        }
        return queryString.ToString();
    }

    public string urlencode(object parameters2)
    {
        var parameters = (dict)parameters2;

        var queryString = System.Web.HttpUtility.ParseQueryString(string.Empty);
        var keys = parameters.Keys;
        foreach (string key in keys)
        {
            var value = parameters[key];
            var finalValue = value.ToString();
            if (value.GetType() == typeof(bool))
            {
                finalValue = finalValue.ToLower(); // c# uses "True" and "False" instead of "true" and "false" $:(

            }
            queryString.Add(key, finalValue);
        }
        return queryString.ToString();
    }

    public string encodeURIComponent(object str2)
    {
        // check this later
        var str = (string)str2;
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

    public static string Base64urlEncode(string s)
    {
        char[] padding = { '=' };
        // var toEncodeAsBytes = System.Text.ASCIIEncoding.ASCII.GetBytes(s);
        // string returnValue = System.Convert.ToBase64String(toEncodeAsBytes)
        string returnValue = s.TrimEnd(padding).Replace('+', '-').Replace('/', '_');
        return returnValue;
    }

}
