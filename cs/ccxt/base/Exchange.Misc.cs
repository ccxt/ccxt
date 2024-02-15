namespace ccxt;

using dict = Dictionary<string, object>;
public partial class Exchange
{

    public object roundTimeframe(object timeframe, object timestamp, object direction = null)
    {
        direction ??= ROUND_DOWN;
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

    // public object buildOHLCVC(object trades, object timeframe, object since, object limit)
    // {
    //     return null; // stub to implement
    // }

}
