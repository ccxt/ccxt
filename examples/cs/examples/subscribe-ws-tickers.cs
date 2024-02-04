using ccxt;
using ccxt.pro;
using Newtonsoft.Json;

namespace examples;
partial class Examples
{
// AUTO-TRANSPILE //

    public static Exchange exchange = ccxt.pro.binance(new Dictionary<string, object>() {});

    static async Task CreateSubscriptions(Exchange exchange)
    {
        await exchange.watchTickers();
    }

    static void PrintMessage(ccxt.Message message)
    {
        Console.WriteLine($"Received message: {JsonConvert.SerializeObject(message)}");
        //Console.WriteLine($"Received message from: {message.metadata.topic} : {message.payload.symbol} : {message.payload.last}");
    }

    static async Task StoreInDb(Message message)
    {
        await Task.Delay(1000); // Simulate asynchronous database storage operation
        Console.WriteLine($"Received message: {JsonConvert.SerializeObject(message)}");
    }

    static void PriceAlert(Message message)
    {
        var last = exchange.safeNumber (message.Payload, "last", 0);
        if (last > 10000)
        {
            Console.WriteLine("Price is over 10000!!!!!!!!!!");
            exchange.Stream.unsubscribe("tickers", PriceAlert);
        }
    }
    async public Task subscribeWsTickers ()
    {
        var symbols = new List<string>() {"BTC/USDT", "ETH/USDT", "DOGE/USDT"};

        // Example subscription and message handling setup
        await CreateSubscriptions(exchange);


        // subscribe synchronously to all tickers with a sync function
        exchange.Stream.subscribe("tickers", PrintMessage, true);
        // subscribe synchronously to check for errors
        exchange.Stream.subscribe("tickers", CheckForErrors, true);
        // subscribe asynchronously to all tickers with a sync function
        exchange.Stream.subscribe("tickers", PriceAlert, false);
        // subscribe synchronously to a single ticker with an async function
        exchange.Stream.subscribe("tickers.BTC/USDT", store_in_db, true);
        // subscribe to exchange wide errors
        exchange.Stream.subscribe("errors", CheckForErrors, true);

        await exchange.Sleep(10000);
        // get history length
        history = exchange.Stream.GetMessageHistory ("tickers");
        Console.WriteLine("History Length:", len(history));
        await exchange.Close();
    }

}
