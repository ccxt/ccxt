namespace ccxt;

public partial class Exchange
{

    public Int64 milliseconds()
    {

        DateTimeOffset dto = new DateTimeOffset(DateTime.UtcNow);
        string unixTime = dto.ToUnixTimeSeconds().ToString();
        return dto.ToUnixTimeMilliseconds();

        // DateTimeOffset now = DateTimeOffset.UtcNow;
        // long unixTimeMilliseconds = now.ToUnixTimeMilliseconds();
        // // return unixTimeMilliseconds;
        // DateTime unixEpoch = new DateTime(1970, 1, 1);
        // DateTime currentTime = DateTime.UtcNow;
        // TimeSpan elapsedTime = unixEpoch.Subtract(currentTime);

        // long unixTimstamp = (long)elapsedTime.TotalMilliseconds;
        // return unixTimstamp;
        // DateTimeOffset now = (DateTimeOffset)DateTime.UtcNow;
        // var res = now.ToUnixTimeMilliseconds();
        // return res;


    }

    public long microseconds()
    {
#if NET7_0_OR_GREATER
        return DateTime.Now.Ticks / TimeSpan.TicksPerMicrosecond; ;
#else
        return DateTime.Now.Ticks / (TimeSpan.TicksPerMillisecond / 1000);
#endif
    }

    public object parseDate(object datetime2)
    {
        if (datetime2 == null || datetime2.GetType() != typeof(string))
        {
            return null;
        }
        var datetime = (string)datetime2;
        Int64 timestamp;
        try
        {
            timestamp = (long)DateTime.Parse(datetime, null, System.Globalization.DateTimeStyles.RoundtripKind).Subtract(new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalMilliseconds;
        }
        catch (Exception e)
        {
            return null;
        }
        return timestamp;
    }

    public static string Iso8601(object ts = null)
    {
        if (ts == null)
        {
            return null;
        }
        Int64 startdatetime;
        try
        {
            startdatetime = Convert.ToInt64(ts);
        }
        catch (Exception e)
        {
            return null;
        }
        if (startdatetime < 0)
        {
            return null;
        }
        var date = (new DateTime(1970, 1, 1)).AddMilliseconds(startdatetime);
        return date.ToString("yyyy-MM-ddTHH:mm:ss.fffZ");

    }

    public string iso8601(object ts = null)
    {
        return Iso8601(ts);
    }

    public string ymdhms(object ts, object infix = null)
    {
        if (infix == null)
        {
            infix = " ";
        }
        // check this
        if (ts == null)
        {
            return null;
        }
        var startdatetime = Convert.ToInt64(ts);
        var date = (new DateTime(1970, 1, 1)).AddMilliseconds(startdatetime);
        return date.ToString("yyyy" + "-" + "MM" + "-" + "dd" + infix + "HH:mm:ss");

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

    public Int64? parse8601(object datetime2 = null)
    {
        if (datetime2 == null || datetime2.GetType() != typeof(string))
        {
            return null;
        }
        var datetime = (string)datetime2;
        Int64 timestamp;
        try
        {
            if (datetime.IndexOf("+0") > -1)
            {
                // "2023-05-08T17:04:43+0000"
                // dates like this aren't correctly mapped to UTC
                var parts = datetime.Split('+');
                datetime = parts[0];
            }
            timestamp = (long)DateTime.Parse(datetime, null, System.Globalization.DateTimeStyles.RoundtripKind).Subtract(new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalMilliseconds;
        }
        catch (Exception e)
        {
            return null;
        }
        return timestamp;
    }
}
