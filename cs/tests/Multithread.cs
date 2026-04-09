using ccxt.pro;

namespace Tests;


public partial class BaseTest
{

    public static async Task MultithreadTest()
    {
        return;
        var exchange = new ccxt.pro.binance();
        exchange.setSandboxMode(true);
        var symbol = "BTC/USDT";
        var parallelCount = 5;

        // Console.WriteLine("Prefetch...");
        var prefetchInfo = await exchange.loadMarkets();

        // Console.WriteLine($"Starting parallel price fetch with {parallelCount} tasks...");
        var tasks = Enumerable.Range(0, parallelCount).Select(i =>
            Task.Run(async () =>
            {
                var priceInfo = (Dictionary<string, object>)await exchange.fetchTicker(symbol);
                // Console.WriteLine($"Thread: {i,2} COMPLETE, Price: {priceInfo["ask"]}");
            }))
            .ToArray();

        await Task.WhenAll(tasks);
        // Console.WriteLine("All tasks completed.");
        Helper.Green(" [C#] Multithreaded test completed successfully.");
    }
}