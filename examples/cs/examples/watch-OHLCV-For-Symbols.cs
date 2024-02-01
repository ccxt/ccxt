using ccxt;
using ccxt.pro;
namespace examples;
partial class Examples
{
async public Task watchOHLCVForSymbols()
{
    var binance = new ccxt.pro.binance(new Dictionary<string, object>() {});
    var subscriptions = new List<List<string>>() {new List<string>() {"BTC/USDT", "5m"}, new List<string>() {"ETH/USDT", "5m"}, new List<string>() {"BTC/USDT", "1h"}};
    while (true)
    {
        var ohlcv = await binance.WatchOHLCVForSymbols(subscriptions);
        Console.WriteLine(ohlcv);
    }
}


}