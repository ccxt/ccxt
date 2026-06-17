using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using ccxt;

class LmtsProbe
{
    static string root = "/Users/pablo/github/ccxt.git.prediction";

    static async Task Run(string label, Func<Task<object>> fn)
    {
        try {
            var r = await fn();
            int n = (r is System.Collections.IList list) ? list.Count : (r != null ? 1 : 0);
            Console.WriteLine("PASS  " + label + "  -> " + n + " item(s)");
        } catch (Exception e) {
            var ex = e.InnerException ?? e;
            string name = ex.GetType().Name; string msg = ex.Message ?? "";
            bool reached = name.Contains("OrderNotFound") || msg.Contains("not found") || msg.Contains("already canceled");
            Console.WriteLine((reached ? "PASS* " : "FAIL  ") + label + "  -> " + name + ": " + (msg.Length > 80 ? msg.Substring(0, 80) : msg));
        }
    }

    static async Task Main()
    {
        var keys = (Dictionary<string, object>)new ccxt.prediction.limitless().parseJson(File.ReadAllText(root + "/keys.local.json"));
        var k = (Dictionary<string, object>)keys["limitless"];
        var ex = new ccxt.prediction.limitless(new Dictionary<string, object> {
            {"apiKey", k["apiKey"]}, {"secret", k["secret"]}, {"walletAddress", k["walletAddress"]}, {"privateKey", k["privateKey"]},
        });
        await ex.LoadMarkets();
        string outcome = null, slug = null, tradeable = null;
        var markets = (Dictionary<string, object>)ex.markets;
        foreach (var entry in markets) {
            var m = (Dictionary<string, object>)entry.Value;
            var info = m.ContainsKey("info") ? m["info"] as Dictionary<string, object> : null;
            var venue = (info != null && info.ContainsKey("venue")) ? info["venue"] as Dictionary<string, object> : null;
            var outcomes = m.ContainsKey("outcomes") ? m["outcomes"] as System.Collections.IList : null;
            var s = (info != null && info.ContainsKey("slug")) ? info["slug"] as string : null;
            if (venue == null || !venue.ContainsKey("exchange") || outcomes == null || outcomes.Count == 0 || s == null) continue;
            string sym = (string)((Dictionary<string, object>)outcomes[0])["outcome"];
            if (outcome == null) { outcome = sym; slug = s; }
            if (tradeable == null && !s.Contains("5-min") && !s.Contains("hourly")) {
                try { var ob = await ex.FetchOrderBook(sym); if (ob.bids != null && ob.bids.Count > 0 && ob.bids[0][0] > 0.05) tradeable = sym; } catch (Exception) {}
            }
        }
        Console.WriteLine("reads outcome " + outcome + " | tradeable " + tradeable + "\n");
        string fake = "11111111-1111-4111-8111-111111111111";
        await Run("fetchAccounts", async () => await ex.FetchAccounts());
        await Run("fetchPositions", async () => await ex.FetchPositions());
        await Run("fetchMyTrades (all)", async () => await ex.FetchMyTrades());
        await Run("fetchMyTrades (outcome)", async () => await ex.FetchMyTrades(outcome));
        await Run("fetchOrders (outcome)", async () => await ex.FetchOrders(outcome));
        await Run("fetchOpenOrders (outcome)", async () => await ex.FetchOpenOrders(outcome));
        await Run("fetchClosedOrders (outcome)", async () => await ex.FetchClosedOrders(outcome));
        await Run("fetchOrder (fake)", async () => await ex.FetchOrder(fake, outcome));
        await Run("fetchOrdersByIds (fake)", async () => await ex.FetchOrdersByIds(new List<string> { fake }, outcome));
        await Run("cancelOrder (fake)", async () => await ex.CancelOrder(fake, outcome));
        await Run("cancelOrders (fake)", async () => await ex.CancelOrders(new List<string> { fake }, outcome));
        await Run("cancelAllOrders (no-op)", async () => await ex.CancelAllOrders(null, new Dictionary<string, object> { {"slug", slug}, {"warnOnCancelAllOrdersWithOutcome", false} }));
        // write path
        Console.WriteLine("\n>>> createOrder on " + tradeable);
        var placed = await ex.CreateOrder(tradeable, "limit", "buy", 5, 0.02, new Dictionary<string, object> { {"timeInForce", "GTC"}, {"postOnly", true} });
        Console.WriteLine("PLACED id " + placed.id + " status " + placed.status);
        await Task.Delay(4500);
        var open = await ex.FetchOpenOrders(tradeable);
        int mine = 0; foreach (var o in open) if (o.id == placed.id) mine++;
        Console.WriteLine("fetchOpenOrders: " + open.Count + " mine present: " + (mine > 0));
        await ex.CancelOrder(placed.id, tradeable);
        Console.WriteLine("CANCELED ok");
    }
}
