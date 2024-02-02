using ccxt;
using ccxt.pro;
using Newtonsoft.Json;

namespace examples;

partial class Examples
{
    async public Task fetchOHLCVContinuously(Exchange exchange, string symbol)
    {
        while (true)
        {
            try
            {
                var ohlcv = await exchange.FetchOHLCV(symbol);
                var ohlcvLength = ohlcv.Count;
                Console.WriteLine(JsonConvert.SerializeObject(ohlcv));
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                break;
            }
        }
    }

    // start exchanges and fetch OHLCV loop
    async public Task startExchange(string exchangeName, List<string> symbols)
    {
        var ex = Exchange.DynamicallyCreateInstance(exchangeName);
        var promises = new List<Task>() { };
        for (var i = 0; i < symbols.Count; i++)
        {
            var symbol = symbols[i];
            promises.Add(fetchOHLCVContinuously(ex, symbol));
        }

        await Task.WhenAll(promises);
        await ex.close();
    }

    // main function
    async public Task fetchOhlcvManyExchangesContinuosly()
    {
        var exchanges = new List<string>() { "binance", "okx", "kraken" };
        var symbols = new List<string>() { "BTC/USDT", "ETH/USDT" };
        var promises = new List<Task>() { };
        for (var i = 0; i < exchanges.Count; i++)
        {
            var exchangeName = exchanges[i];
            promises.Add(startExchange(exchangeName, symbols));
        }
        await Task.WhenAll(promises);
    }
}