using ccxt;

namespace Tests;

// native cs test, hand-written - one frame settles two hashes; the waiter woken by
// the first re-watches the second and must get a fresh future, never the sibling
// the same frame settles (js resolves on a microtask, after the handler returns).

public partial class BaseTest
{
    async public Task testWsDispatchSettlesAfterHandlerReturns()
    {
        var client = new BaseExchange.WebSocketClient("ws://localhost:1234/dispatch-order", null, (c, m) =>
        {
            c.resolve("a", "first");
            c.resolve("b", "second");
        });
        client.keepAlive = null; // offline: never dialed
        var first = client.future("first");
        var second = client.future("second");
        bool sawSecondPending = true;
        BaseExchange.Future? rewatched = null;
        var woken = first.task.ContinueWith(_ =>
        {
            sawSecondPending = client.futures.ContainsKey("second");
            rewatched = client.future("second");
        }, CancellationToken.None, TaskContinuationOptions.ExecuteSynchronously, TaskScheduler.Default);

        client.dispatchMessage("frame");
        await woken;
        Assert(!sawSecondPending, "the waiter woken by the first hash must not see the second still pending");
        Assert(!object.ReferenceEquals(rewatched, second), "a re-watch of the second hash must not take the future the same frame settles");
        Assert(second.task.IsCompleted && (string)second.task.Result == "b", "the second future must be settled by the frame");
    }
}
