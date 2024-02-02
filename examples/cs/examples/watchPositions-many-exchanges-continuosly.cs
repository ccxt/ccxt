using ccxt;
using ccxt.pro;
using Newtonsoft.Json;

namespace examples;

partial class Examples
{
    async public Task<List<Position>> watchPositionsContinuously(Exchange exchange)
    {
        while (true)
        {
            try
            {
                var positions = await exchange.WatchPositions();
                Console.WriteLine("Fetched " + exchange.id + " - Positions: " + JsonConvert.SerializeObject(positions));
                return positions;
            }
            catch (Exception e)
            {
                Console.WriteLine(e);
                break;
            }
        }

        return null;
    }

    // start exchanges and fetch OHLCV loop
    async public Task initializeExchange(string exchangeName, object config)
    {
        var ex = Exchange.DynamicallyCreateInstance("ccxt.pro." + exchangeName, config);
        var promises = new List<Task<List<Position>>>() { };
        (promises).Add(watchPositionsContinuously(ex));
        await Task.WhenAll(promises);
        await ex.Close();
    }

    // main function
    async public Task watchPositionsManyExchangesContinuosly()
    {
        var exchanges = new Dictionary<string, object>()
        {
            {
                "binanceusdm", new Dictionary<string, object>()
                {
                    { "apiKey", "YOUR_API_KEY" },
                    { "secret", "YOUR_API_SECRET" },
                }
            },
            {
                "okx", new Dictionary<string, object>()
                {
                    { "apiKey", "YOUR_API_KEY" },
                    { "secret", "YOUR_API_SECRET" },
                }
            },
            {
                "huobi", new Dictionary<string, object>()
                {
                    { "apiKey", "YOUR_API_KEY" },
                    { "secret", "YOUR_API_SECRET" },
                }
            },
        };
        var promises = new List<Task>() { };
        var exchangeIds = exchanges.Keys.ToList();
        for (var i = 0; i < exchangeIds.Count; i++)
        {
            var exchangeName = exchangeIds[i];
            var config = exchanges[exchangeName];
            promises.Add(initializeExchange(exchangeName, config));
        }

        await Task.WhenAll(promises);
    }
}