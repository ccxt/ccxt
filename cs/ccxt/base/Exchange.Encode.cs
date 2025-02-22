namespace ccxt;
using System.Security.Cryptography;
using System.Text;

using Cryptography.ECDSA;

using MiniMessagePack;

using dict = Dictionary<string, object>;
using list = List<object>;

public partial class Exchange
{

    public object base16ToBinary(object str2)
    {
        // return (string)str; // stub
        // return Convert.FromHexString((string)str);
        var str = (string)str2;
        return ConvertHexStringToByteArray(str);
    }

    public static byte[] ConvertHexStringToByteArray(string hexString)
    {
        if (hexString.Length % 2 != 0)
        {
            throw new ArgumentException("The hex string must have an even number of characters.", nameof(hexString));
        }

        byte[] bytes = new byte[hexString.Length / 2];
        for (int i = 0; i < hexString.Length; i += 2)
        {
            string hexSubstring = hexString.Substring(i, 2);
            bytes[i / 2] = Convert.ToByte(hexSubstring, 16);
        }

        return bytes;
    }

    public virtual object remove0xPrefix(object str2)
    {
        var str = (string)str2;
        if (str.StartsWith("0x"))
        {
            return str.Substring(2);
        }
        return str;
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

    public byte[] base58ToBinary(object pt) => Base58ToBinary(pt);

    public static byte[] Base58ToBinary(object pt)
    {
        return Base58.Decode(pt as string);
    }


    public object binaryConcat(params object[] parts)
    {
        var resultList = new List<byte>();

        foreach (var part in parts)
        {
            if (part is string str)
            {
                resultList.AddRange(Encoding.ASCII.GetBytes(str));
            }
            else if (part is byte[] bytes)
            {
                resultList.AddRange(bytes);
            }
            else
            {
                throw new ArgumentException("BinaryConcat: Unsupported type, only string and byte[] are allowed.");
            }
        }

        return resultList.ToArray();
    }

    // public object binaryConcat(object a, object b)
    // {
    //     byte[] first;
    //     byte[] second;
    //     if (a is string)
    //     {
    //         first = Encoding.ASCII.GetBytes(a as string);
    //     }
    //     else
    //     {
    //         first = (byte[])a;
    //     }
    //     if (b is string)
    //     {
    //         second = Encoding.ASCII.GetBytes(b as string);
    //     }
    //     else
    //     {
    //         second = (byte[])b;
    //     }
    //     var result = new byte[first.Length + second.Length];
    //     first.CopyTo(result, 0);
    //     second.CopyTo(result, first.Length);
    //     return result;
    //     // return (string)a + (string)b; // stub
    // }

    public object binaryConcatArray(object arrays2)
    {
        // if (byteArrays is not IList arrays)
        // {
        //     throw new ArgumentException("Input must be an array or collection of byte arrays.", nameof(byteArrays));
        // }

        var arrays = (IList<object>)arrays2;
        // Determine total length
        int totalLength = 0;
        foreach (var item in arrays)
        {
            // if (item is not byte[] array)
            // {
            //     throw new ArgumentException("All elements in the collection must be byte arrays.", nameof(byteArrays));
            // }
            byte[] bytesItem;
            if (item is string)
            {
                bytesItem = Encoding.ASCII.GetBytes(item as string);
            }
            else
            {
                bytesItem = (byte[])item;
            }
            totalLength += ((byte[])bytesItem).Length;
        }

        // Concatenate arrays
        byte[] result = new byte[totalLength];
        int offset = 0;

        foreach (var item in arrays)
        {
            byte[] bytesItem;
            if (item is string)
            {
                bytesItem = Encoding.ASCII.GetBytes(item as string);
            }
            else
            {
                bytesItem = (byte[])item;
            }
            byte[] array = (byte[])bytesItem;
            Buffer.BlockCopy(array, 0, result, offset, array.Length);
            offset += array.Length;
        }

        return result;
    }

    public object numberToBE(object n2, object size2 = null)
    {
        var n = Convert.ToInt64(n2);
        var size = size2 == null ? 0 : Convert.ToInt32(size2);
        byte[] bytes = BitConverter.GetBytes(n);
        if (BitConverter.IsLittleEndian)
        {
            Array.Reverse(bytes);
        }
        return bytes[^size..]; // Extract the last 'size' bytes
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

    public string binaryToBase64(byte[] buff) => BinaryToBase64(buff);

    public static string BinaryToBase64(byte[] buff) => Convert.ToBase64String(buff);

    public byte[] stringToBinary(string buff) => StringToBinary(buff);

    public static byte[] StringToBinary(string buff)
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

    public string intToBase16(object number)
    {
        var n = Convert.ToInt64(number);
        return n.ToString("x");
    }

    public object packb(object data)
    {
        var packer = new MiniMessagePacker();
        return packer.Pack(data);
    }

    public string rawencode(object paramaters1)
    {
        var paramaters = (dict)paramaters1;
        var keys = new List<string>(((dict)paramaters).Keys);
        var outList = new List<object>();
        foreach (string key in keys)
        {
            var value = paramaters[key];
            if (value is bool)
            {
                value = value.ToString().ToLower();
            }
            outList.Add(key + "=" + value);
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

        // var queryString = System.Web.HttpUtility.ParseQueryString(string.Empty);
        var queryString = new List<string>();
        var keys = parameters.Keys;
        foreach (string key in keys)
        {
            var value = parameters[key];
            string encodedKey = System.Web.HttpUtility.UrlEncode(key);
            var finalValue = value.ToString();
            if (value.GetType() == typeof(bool))
            {
                finalValue = finalValue.ToLower(); // c# uses "True" and "False" instead of "true" and "false" $:(

            }
            if (key.ToLower() == "timestamp")
            {
                finalValue = System.Web.HttpUtility.UrlEncode(finalValue).ToUpper();
            }
            else
            {
                finalValue = System.Web.HttpUtility.UrlEncode(finalValue);
            }
            queryString.Add($"{encodedKey}={finalValue}");
        }
        return string.Join("&", queryString);
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

    public string urlencodeBase64(object s) => Base64urlEncode(s);

    public static string Base64urlEncode(object s)
    {
        char[] padding = { '=' };
        string str = (s is string) ? Exchange.StringToBase64(s as string) : Exchange.BinaryToBase64(s as byte[]);
        string returnValue = str.TrimEnd(padding).Replace('+', '-').Replace('/', '_');
        return returnValue;
    }

}
