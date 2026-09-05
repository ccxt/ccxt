namespace ccxt;

using dict = Dictionary<string, object>;
public partial class BaseExchange
{
    public Int64 floorDiv(Int64 value, Int64 divisor)
    {
        var quotient = value / divisor;
        var remainder = value % divisor;
        if ((remainder != 0) && ((remainder > 0) != (divisor > 0)))
        {
            quotient -= 1;
        }
        return quotient;
    }

    public object roundTimeframe(object timeframe, object timestamp, object direction = null)
    {
        direction ??= ROUND_DOWN;
        var timeframeString = (string)timeframe;
        var timestampValue = (Int64)timestamp;
        var amountParsed = Int32.TryParse(timeframeString.Substring(0, timeframeString.Length - 1), out var amount);
        var unit = timeframeString.Substring(timeframeString.Length - 1);
        if (((unit == "w") || (unit == "M") || (unit == "y")) && (amount >= 1) && amountParsed)
        {
            var date = DateTimeOffset.FromUnixTimeMilliseconds(timestampValue).UtcDateTime;
            DateTime rounded;
            if (unit == "w")
            {
                var daysSinceMonday = ((int)date.DayOfWeek + 6) % 7;
                var monday = date.Date.AddDays(-daysSinceMonday);
                var epochMonday = new DateTime(1970, 1, 5, 0, 0, 0, DateTimeKind.Utc);
                var weeksSinceEpochMonday = (Int64)(monday - epochMonday).TotalDays / 7;
                rounded = epochMonday.AddDays(floorDiv(weeksSinceEpochMonday, amount) * amount * 7);
                if ((int)direction == ROUND_UP)
                {
                    rounded = rounded.AddDays(amount * 7);
                }
            }
            else if (unit == "M")
            {
                var monthsSinceYearZero = date.Year * 12 + date.Month - 1;
                var roundedMonths = floorDiv(monthsSinceYearZero, amount) * amount;
                var year = floorDiv(roundedMonths, 12);
                var month = roundedMonths % 12 + 1;
                rounded = new DateTime((int)year, (int)month, 1, 0, 0, 0, DateTimeKind.Utc);
                if ((int)direction == ROUND_UP)
                {
                    rounded = rounded.AddMonths(amount);
                }
            }
            else
            {
                var year = floorDiv(date.Year, amount) * amount;
                rounded = new DateTime((int)year, 1, 1, 0, 0, 0, DateTimeKind.Utc);
                if ((int)direction == ROUND_UP)
                {
                    rounded = rounded.AddYears(amount);
                }
            }
            return new DateTimeOffset(rounded).ToUnixTimeMilliseconds();
        }
        var ms = parseTimeframe(timeframe) * 1000;
        var offset = (Int64)timestamp % ms;
        return (Int64)timestamp - offset + (((int)direction == ROUND_UP) ? ms : 0);
    }

    public object implodeParams(object path2, object parameter2)
    {

        var path = (string)path2;
        if (parameter2.GetType() != typeof(List<object>))
        {
            var parameter = (dict)parameter2;
            var keys = new List<string>(((dict)parameter).Keys);
            var outList = new List<object>();
            foreach (string key in keys)
            {
                var value = parameter[key];
                if (value == null)
                {
                    continue;
                }
                if (value.GetType() != typeof(List<object>))
                {
                    path = path.Replace("{" + key + "}", Convert.ToString(value));
                }
                // outList.Add(key + "=" + parameter[key]);
            }
            return path;
            // return (string)path2 + "?" + string.Join("&", outList);

        }
        else
        {
            return (string)path2;
        }
    }

    public void addFetchCache(Object data) {
        if (fetchHistoryCacheSize <= 0) {
            return;
        }
        fetchHistoryCache.Enqueue(data as Dictionary<string,object>);
        while (fetchHistoryCache.Count > fetchHistoryCacheSize)
            fetchHistoryCache.TryDequeue(out _); // drops oldest
    }

    public List<Dictionary<string, object>> getFetchCache()
    {
        return fetchHistoryCache.ToList();
    }
    // public object buildOHLCVC(object trades, object timeframe, object since, object limit)
    // {
    //     return null; // stub to implement
    // }

    // returns the version of the ccxt library, e.g. "4.5.54"
    public virtual object getCcxtVersion()
    {
        return ccxtVersion;
    }

}
