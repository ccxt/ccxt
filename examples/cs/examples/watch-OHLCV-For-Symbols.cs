using ccxt;
using ccxt.pro;
namespace examples;
partial class Examples
{
async public Task watchOHLCVForSymbols()
{
    var binance = new ccxt.pro.binance(new Dictionary<string, object>() {});
    var subscriptions = new List<object>() {new List<object>() {"BTC/USDT", "5m"}, new List<object>() {"ETH/USDT", "5m"}, new List<object>() {"BTC/USDT", "1h"}};
    while (true)
    {
        var ohlcv = await binance.WatchOHLCVForSymbols(subscriptions);
        Console.WriteLine(ohlcv);
    }
}


}