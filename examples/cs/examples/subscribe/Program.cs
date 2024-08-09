namespace Example;

using ccxt;
using ccxt.pro;
using Newtonsoft.Json;

public static class Program
{
// AUTO-TRANSPILE //

    public static Exchange exchange = new ccxt.pro.binance(new Dictionary<string, object>() {});

    public static async Task PrintMessage(ccxt.pro.Message message)
    {
        Console.WriteLine($"Received message from: {message.metadata.topic}, index: ${message.metadata.index}");
        /// return Task.CompletedTask;
    }

    public static async Task StoreInDb(Message message)
    {
        await Task.Delay(1000); // Simulate asynchronous database storage operation
        Console.WriteLine($"Stored message from : {message.metadata.topic}, index: ${message.metadata.index} in the database.");
    }

    // public static async Task PriceAlert(Message message)
    // {
    //     var payload = (IDictionary<string, object>)payload;
    //     var last = payload["last"] as int;
    //     if (last > 10000)
    //     {
    //         Console.WriteLine("Price is over 10000!!!!!!!!!!");
    //     }
    // }

    public static async Task Main(string[] args)
    {
        Console.WriteLine("strating program!");
        exchange = new ccxt.pro.binance(new Dictionary<string, object>() {});
        // exchange.verbose = true;
        var symbols = new List<string>() {"BTC/USDT", "ETH/USDT", "DOGE/USDT"};

        ConsumerFunction printMessage = PrintMessage;
        ConsumerFunction storeInDb = StoreInDb;

        // subscribe synchronously to all tickers with a sync function
        await exchange.subscribeTrades ("BTC/USDT", printMessage, false);
        // subscribe asynchronously to all tickers with a sync function
        // subscribe synchronously to a single ticker with an async function
        await exchange.subscribeTrades ("BTC/USDT", storeInDb, true);
        // subscribe to exchange wide errors
        exchange.stream.subscribe("errors", printMessage, true);
        exchange.stream.unsubscribe ("trades::BTC/USDT", printMessage);

        await exchange.sleep(10000);
        // get history length
        var history = exchange.stream.GetMessageHistory ("trades");
        Console.WriteLine("History Length:" + history.Count);
        // close exchange
        await exchange.close();
    }

}
