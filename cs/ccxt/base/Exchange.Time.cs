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

    public string convertExpireDate(string date)
    {
        // parse YYMMDD to timestamp
        object year = slice(date, 0, 2);
        object month = slice(date, 2, 4);
        object day = slice(date, 4, 6);
        object reconstructedDate = add(add(add(add(add(add("20", year), "-"), month), "-"), day), "T00:00:00Z");
        return reconstructedDate;
    }

    public virtual string convertExpireDateToMarketIdDate(string date)
    {
        // parse 231229 to 29DEC23
        object year = slice(date, 0, 2);
        object monthRaw = slice(date, 2, 4);
        object month = null;
        object day = slice(date, 4, 6);
        if (isTrue(isEqual(monthRaw, "01")))
        {
            month = "JAN";
        } else if (isTrue(isEqual(monthRaw, "02")))
        {
            month = "FEB";
        } else if (isTrue(isEqual(monthRaw, "03")))
        {
            month = "MAR";
        } else if (isTrue(isEqual(monthRaw, "04")))
        {
            month = "APR";
        } else if (isTrue(isEqual(monthRaw, "05")))
        {
            month = "MAY";
        } else if (isTrue(isEqual(monthRaw, "06")))
        {
            month = "JUN";
        } else if (isTrue(isEqual(monthRaw, "07")))
        {
            month = "JUL";
        } else if (isTrue(isEqual(monthRaw, "08")))
        {
            month = "AUG";
        } else if (isTrue(isEqual(monthRaw, "09")))
        {
            month = "SEP";
        } else if (isTrue(isEqual(monthRaw, "10")))
        {
            month = "OCT";
        } else if (isTrue(isEqual(monthRaw, "11")))
        {
            month = "NOV";
        } else if (isTrue(isEqual(monthRaw, "12")))
        {
            month = "DEC";
        }
        object reconstructedDate = add(add(day, month), year);
        return reconstructedDate;
    }

    public virtual string convertMarketIdExpireDate(string date)
    {
        // parse 22JAN23 to 230122
        object monthMappping = new Dictionary<string, object>() {
            { "JAN", "01" },
            { "FEB", "02" },
            { "MAR", "03" },
            { "APR", "04" },
            { "MAY", "05" },
            { "JUN", "06" },
            { "JUL", "07" },
            { "AUG", "08" },
            { "SEP", "09" },
            { "OCT", "10" },
            { "NOV", "11" },
            { "DEC", "12" },
        };
        object year = slice(date, 0, 2);
        object monthName = slice(date, 2, 5);
        object month = this.safeString(monthMappping, monthName);
        object day = slice(date, 5, 7);
        object reconstructedDate = add(add(day, month), year);
        return reconstructedDate;
    }
}
