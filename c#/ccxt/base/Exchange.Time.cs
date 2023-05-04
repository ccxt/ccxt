using System.Globalization;

namespace ccxt;

public partial class Exchange
{

    public long milliseconds()
    {
        // DateTimeOffset now = DateTimeOffset.UtcNow;
        // long unixTimeMilliseconds = now.ToUnixTimeMilliseconds();
        // return unixTimeMilliseconds;
        // DateTime unixEpoch = new DateTime(1970, 1, 1);

        // DateTime currentTime = DateTime.UtcNow;
        // TimeSpan elapsedTime = unixEpoch.Subtract(currentTime);

        // long unixTimstamp = (long)elapsedTime.TotalMilliseconds;
        // return unixTimstamp;
        DateTimeOffset now = (DateTimeOffset)DateTime.UtcNow;
        var res = now.ToUnixTimeMilliseconds();
        return res;
    }

    public long microseconds()
    {
        return DateTime.Now.Ticks / TimeSpan.TicksPerMicrosecond;
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

    public string iso8601(object ts = null)
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
            timestamp = (long)DateTime.Parse(datetime, null, System.Globalization.DateTimeStyles.RoundtripKind).Subtract(new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc)).TotalMilliseconds;
        }
        catch (Exception e)
        {
            return null;
        }
        return timestamp;
    }
}
