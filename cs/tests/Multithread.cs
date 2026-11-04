using ccxt.pro;

namespace Tests;


public partial class BaseTest
{

    // offline: markets come from the static fixture and fetch() is mocked, so the only
    // thing exercised is the throttler lock under concurrent callers (the bug this test pins)
    public static async Task MultithreadTest()
    {
        var startDate = DateTime.UtcNow;
        var fixtures = testMainClass.ROOT_DIR + "ts/src/test/static/";
        var exchange = new ccxt.pro.okx(new Dictionary<string, object>() {
            { "markets", testMainClass.ioFileRead(fixtures + "markets/okx.json") },
            { "currencies", testMainClass.ioFileRead(fixtures + "currencies/okx.json") },
        });
        exchange.fetchResponse = new Dictionary<string, object>() {
            { "code", "0" },
            { "msg", "" },
            { "data", new List<object>() {
                new Dictionary<string, object>() {
                    { "instType", "SPOT" },
                    { "instId", "BTC-USDT" },
                    { "last", "73384.8" },
                    { "askPx", "73384.8" },
                    { "bidPx", "73384.7" },
                    { "ts", "1710328243709" },
                },
            } },
        };
        var symbol = "BTC/USDT";
        var parallelCount = 5;

        var prefetchInfo = await exchange.loadMarkets();

        var tasks = Enumerable.Range(0, parallelCount).Select(i =>
            Task.Run(async () =>
            {
                // fetchTicker's core is typed (Task<Ticker>), so no dictionary cast is needed
                var priceInfo = await exchange.FetchTicker(symbol);
                Assert(priceInfo.symbol == symbol, "multithread: ticker symbol mismatch: " + priceInfo.symbol);
                Assert(priceInfo.last == 73384.8, "multithread: ticker last mismatch: " + priceInfo.last);
            }))
            .ToArray();

        await Task.WhenAll(tasks);
        var passedTime = DateTime.UtcNow - startDate;
        Helper.Green(" [C#] Multithreaded test completed successfully. Total time: " + passedTime.TotalSeconds + " seconds");
    }
}
