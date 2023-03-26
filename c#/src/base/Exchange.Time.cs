namespace Main;

public partial class Exchange
{

    public long milliseconds()
    {
        DateTimeOffset now = DateTimeOffset.UtcNow;
        long unixTimeMilliseconds = now.ToUnixTimeMilliseconds();
        return unixTimeMilliseconds;
    }

    public long microseconds()
    {
        return DateTime.Now.Ticks / TimeSpan.TicksPerMicrosecond;
    }

    public object parseDate(object date)
    {
        var stringDate = (string)date;
        // if (stringDate.IndexOf("GMT") >= 0)
        // {
        //     return DateTime.ParseExact(stringDate, "ddd MMM dd yyyy HH:mm:ss 'GMT'K");
        // }
        // else
        // {
        //     return DateTime.ParseExact(stringDate, "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");
        // }
        return parse8601(date); // stub implement later
    }

    public string iso8601(object ts)
    {
        if (ts == null)
        {
            return null;
        }
        var startdatetime = Convert.ToInt64(ts);
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
        var startdatetime = Convert.ToInt64(ts);
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
        var startdatetime = Convert.ToInt64(ts);
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
        object startdatetime = null;
        var date = "";
        try
        {
            startdatetime = Convert.ToInt64(ts);
            var tmp = (new DateTime(1970, 1, 1)).AddMilliseconds((Int64)startdatetime);
            date = tmp.ToString("yy" + infix + "MM" + infix + "dd");
        }
        catch (Exception e)
        {

        }
        return date;
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
        var startdatetime = Convert.ToInt64(ts);
        var date = (new DateTime(1970, 1, 1)).AddMilliseconds(startdatetime);
        return date.ToString("yyyy" + infix + "MM" + infix + "dd");
    }

    public object parse8601(object timestamp2)
    {
        // stub check this out
        var timestamp = (string)timestamp2;
        return DateTime.Parse(timestamp).Millisecond;
    }

}
