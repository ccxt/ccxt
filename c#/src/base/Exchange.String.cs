namespace ccxt;

public partial class Exchange
{

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

    public string uuid22()
    {
        return Guid.NewGuid().ToString();
    }

    public object strip(object str)
    {
        return str; //stub
    }

    public string capitalize(object str2)
    {
        var str = (string)str2;
        return char.ToLower(str[0]) + str.Substring(1);
    }


}
