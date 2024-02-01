using ccxt;
using ccxt.pro;

namespace examples;

partial class Examples
{
    async public Task fetchOhlcv()
    {
        var myex = new ccxt.okx(new Dictionary<string, object>() { });
        var fromTimestamp = myex.milliseconds() - (86400 * 1000); // last 24 hrs
        var ohlcv = await myex.FetchOHLCV("BTC/USDT", "1m", fromTimestamp, 3, new Dictionary<string, object>()
        {
            { "whatever", 123 },
        });
        var length = ohlcv.Count;
        if (length > 0)
        {
            var lastCandle = ohlcv[length - 1];
            var lastPrice = lastCandle.close;
            Console.WriteLine("Fetched " + length + " candles for " + myex.id + ":  last close " + lastPrice);
        }
        else
        {
            Console.WriteLine("No candles have been fetched");
        }
    }
}