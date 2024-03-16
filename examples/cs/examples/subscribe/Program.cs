namespace Example;

using ccxt;
using ccxt.pro;
using Newtonsoft.Json;

public static class Program
{
// AUTO-TRANSPILE //

    public static Exchange exchange = new ccxt.pro.poloniex(new Dictionary<string, object>() {});

    public static async Task CreateSubscriptions(Exchange exchange)
    {
        exchange.verbose = true;
        await exchange.watchTrades("BTC/USDT");
    }

    public static void PrintMessage(ccxt.pro.Message message)
    {
        Console.WriteLine($"Received message: {JsonConvert.SerializeObject(message)}");
        //Console.WriteLine($"Received message from: {message.metadata.topic} : {message.payload.symbol} : {message.payload.last}");
    }

    // public async Task StoreInDb(Message message)
    // {
    //     await Task.Delay(1000); // Simulate asynchronous database storage operation
    //     Console.WriteLine($"Received message: {JsonConvert.SerializeObject(message)}");
    // }

    public static void PriceAlert(Message message)
    {
        // var last = exchange.safeNumber (message.Payload, "last", 0) as int;
        // if (last > 10000)
        // {
        //     Console.WriteLine("Price is over 10000!!!!!!!!!!");
        //     exchange.stream.unsubscribe("tickers", PriceAlert);
        // }
    }
    public static async Task Main(string[] args)
    {
        Console.WriteLine("strating program!");
        exchange = new ccxt.pro.poloniex(new Dictionary<string, object>() {});
        var symbols = new List<string>() {"BTC/USDT", "ETH/USDT", "DOGE/USDT"};

        // Example subscription and message handling setup
        await CreateSubscriptions(exchange);


        // subscribe synchronously to all tickers with a sync function
        //exchange.stream.subscribe("tickers", PrintMessage, true);
        // subscribe synchronously to check for errors
        // exchange.stream.subscribe("tickers", CheckForErrors, true);
        // subscribe asynchronously to all tickers with a sync function
        //exchange.stream.subscribe("tickers", PriceAlert, false);
        // subscribe synchronously to a single ticker with an async function
        // exchange.stream.subscribe("tickers.BTC/USDT", StoreInDb, true);
        // subscribe to exchange wide errors
        // exchange.stream.subscribe("errors", CheckForErrors, true);

        await exchange.sleep(10000);
        // get history length
        //var history = exchange.stream.GetMessageHistory ("tickers");
        // Console.WriteLine("History Length:", len(history));
        await exchange.close();
    }

}
