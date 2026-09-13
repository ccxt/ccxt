using ccxt;

namespace examples;

// OrderRouter — ask the router how to convert one asset into another.
//
// The router holds live L2 books from many venues and answers "what is the
// cheapest way to turn X into Y right now, and on which venues" — book-walked
// to your actual size, fee-adjusted, and split across venues when that beats
// any single one.
//
// This example is READ-ONLY: it asks for a recommendation and prints it. It
// never places an order. Execution lives behind router.Execute(plan, venues),
// which defaults to dry_run and refuses to trade unless explicitly told to.
//
// Usage:
//   ORDER_ROUTER_API_KEY=or_live_... dotnet run
//
// Get a key from https://docs.ccxt.com/router

partial class Examples
{
    public async static Task OrderRouterExample()
    {
        var apiKey = Environment.GetEnvironmentVariable("ORDER_ROUTER_API_KEY");
        if (string.IsNullOrEmpty(apiKey))
        {
            Console.WriteLine("set ORDER_ROUTER_API_KEY (get one at https://docs.ccxt.com/router)");
            return;
        }

        var router = new OrderRouter(new Dictionary<string, object>() {
            { "apiKey", apiKey },
            // { "baseUrl", "https://docs.ccxt.com/router/api" },  // the default
        });

        // Exactly one of amountIn or amountOut — never both, and never neither.
        // They are different book traversals, not a unit conversion: amountIn
        // walks until the money runs out, amountOut until the size is reached.
        var route = await router.FetchRoute("USDT", "BTC", new Dictionary<string, object>() {
            { "amountIn", 20 },
            { "strategy", "split_optimal" },
        });

        // An unroutable pair comes back as a result with a reason, NOT an
        // exception. Refusing to quote is a deliberate outcome, not an error.
        if (route.ContainsKey("unroutableReason") && route["unroutableReason"] != null)
        {
            Console.WriteLine($"unroutable: {route["unroutableReason"]}");
            return;
        }

        Console.WriteLine($"{route["amountIn"]} {route["from"]} -> {route["amountOut"]} {route["to"]}");
        Console.WriteLine($"effective rate   {route["effectiveRate"]}");
        Console.WriteLine($"price impact     {route["impactBps"]} bps");  // positive is worse
        Console.WriteLine($"fill ratio       {route["fillRatio"]}");

        // One hop is a direct conversion; more than one means it was bridged
        // (e.g. SOL -> USDT -> BTC), and each hop is a separate order.
        var hops = (IList<object>)route["hops"];
        for (var i = 0; i < hops.Count; i++)
        {
            var hop = (IDictionary<string, object>)hops[i];
            var legs = (IList<object>)hop["legs"];
            Console.WriteLine($"hop {i + 1} {hop["pair"]} {hop["side"]} - {legs.Count} venue(s)");
            foreach (var legObject in legs)
            {
                var leg = (IDictionary<string, object>)legObject;
                Console.WriteLine($"    {leg["exchangeId"]} {leg["amount"]} @ {leg["effectivePrice"]}");
            }
        }
    }
}
