namespace ccxt;

public partial class Exchange
{


    public static string BaseUID()
    {
        return Guid.NewGuid().ToString().Replace("-", "");
    }

    public string uuid2()
    {
        return Guid.NewGuid().ToString();
    }

    public string uuid()
    {
        return BaseUID();
    }

    public string uuid16()
    {
        return BaseUID().Substring(0, 16);
    }

    public string uuid22()
    {
        return BaseUID().Substring(0, 22);
    }

    public object strip(object str)
    {
        return ((string)str).Trim(); //stub
    }

    public string capitalize(object str2)
    {
        var str = (string)str2;
        return char.ToUpper(str[0]) + str.Substring(1);
    }


}
