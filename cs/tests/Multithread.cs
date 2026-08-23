using ccxt.pro;

namespace Tests;


public partial class BaseTest
{

    public static async Task MultithreadTest()
    {
        var startDate = DateTime.UtcNow;
        var exchange = new ccxt.pro.okx();
        exchange.setSandboxMode(true);
        var symbol = "BTC/USDT";
        var parallelCount = 5;

        // Console.WriteLine("Prefetch...");
        var prefetchInfo = await exchange.loadMarkets();

        // Console.WriteLine($"Starting parallel price fetch with {parallelCount} tasks...");
        var tasks = Enumerable.Range(0, parallelCount).Select(i =>
            Task.Run(async () =>
            {
                // fetchTicker's core is typed (Task<Ticker>), so no dictionary cast is needed
                var priceInfo = await exchange.fetchTicker(symbol);
                // Console.WriteLine($"Thread: {i,2} COMPLETE, Price: {priceInfo.ask}");
            }))
            .ToArray();

        await Task.WhenAll(tasks);
        // Console.WriteLine("All tasks completed.");
        var passedTime = DateTime.UtcNow - startDate;
        Helper.Green(" [C#] Multithreaded test completed successfully. Total time: " + passedTime.TotalSeconds + " seconds");
    }
}