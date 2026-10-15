namespace ccxt;

public partial class BaseExchange
{


    public static string BaseUID()
    {
        return Guid.NewGuid().ToString().Replace("-", "");
    }

    public string uuid()
    {
        return Guid.NewGuid().ToString();
    }

    public string uuid16()
    {
        return BaseUID().Substring(0, 16);
    }

    public string uuid22()
    {
        return BaseUID().Substring(0, 22);
    }

    // ((string)str).Trim() is a string on every path (a non-string box throws inside the
    // cast, exactly where the object signature threw it)
    public string strip(object str)
    {
        return ((string)str).Trim(); //stub
    }

    public string capitalize(object str2)
    {
        var str = (string)str2;
        if (str.Length == 0)
        {
            return str;
        }
        return char.ToUpper(str[0]) + str.Substring(1);
    }


}
