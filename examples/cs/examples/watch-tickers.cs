using ccxt;
using ccxt.pro;
using Newtonsoft.Json;

namespace examples;
partial class Examples
{
// AUTO-TRANSPILE //
async public Task watchTickers()
{
    var binance = new ccxt.pro.binance(new Dictionary<string, object>() {});
    var symbols = new List<string>() {"BTC/USDT", "ETH/USDT", "DOGE/USDT"};
    while (true)
    {
        var tickers = await binance.WatchTickers(symbols);
        Console.WriteLine(JsonConvert.SerializeObject(tickers["BTC/USDT"]));
    }
}


}