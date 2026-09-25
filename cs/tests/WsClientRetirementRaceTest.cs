using ccxt;

namespace Tests;

// native cs test, hand-written - pins WebSocketClient retirement to the client
// object rather than to its registry url key, mirroring js Client.error and
// Client.reset. all offline: the synthetic url is never dialed.
// see https://github.com/ccxt/ccxt/issues/30463

public partial class BaseTest
{
    private const string RetirementUrl = "ws://localhost:1234/retirement-race";

    private BaseExchange.WebSocketClient makeRetirementClient()
    {
        var client = new BaseExchange.WebSocketClient(RetirementUrl, null, (c, m) => { });
        client.keepAlive = null; // no ping loop in an offline test
        return client;
    }

    async public Task testWsRetirementReplacementSurvivesRace()
    {
        var exchange = new BaseExchange();
        var caller = makeRetirementClient();
        var replacement = makeRetirementClient();

        var callerFuture = caller.future("caller-pending");
        caller.subscriptions["caller-subscription"] = new object();
        var replacementFuture = replacement.future("replacement-pending");
        replacement.subscriptions["replacement-subscription"] = new object();

        // the reconnect got there first: the registry already holds the
        // replacement when cleanup for the erroring caller runs
        exchange.clients[RetirementUrl] = replacement;
        caller.onErrorCallback = exchange.onError;
        caller.onError(new NetworkError("transport failed"));

        Assert(callerFuture.task.IsCompleted, "the erroring client's own pending future must be settled");
        Assert(caller.error != null, "the erroring client must be marked retired");
        Assert(caller.futures.Count == 0, "the erroring client's futures must be drained");
        Assert(caller.subscriptions.Count == 0, "the erroring client's subscriptions must be cleared");

        Assert(!replacementFuture.task.IsCompleted, "the replacement's consumers must not be settled");
        Assert(replacement.error == null, "the replacement must not be retired");
        Assert(replacement.subscriptions.Count == 1, "the replacement's subscriptions must survive");
        Assert(exchange.clients.ContainsKey(RetirementUrl), "the replacement must keep its registry slot");
        Assert(ReferenceEquals(exchange.clients[RetirementUrl], replacement), "the registry must still hold the replacement");
        await Task.CompletedTask;
    }

    async public Task testWsRetirementSameReferenceLeavesNothingBehind()
    {
        var exchange = new BaseExchange();
        var client = makeRetirementClient();
        var pending = client.future("pending");
        client.subscriptions["sub"] = new object();

        exchange.clients[RetirementUrl] = client;
        client.onErrorCallback = exchange.onError;
        client.onError(new NetworkError("transport failed"));

        Assert(pending.task.IsCompleted, "the pending future must be rejected");
        Assert(client.futures.Count == 0, "futures must be drained");
        Assert(client.subscriptions.Count == 0, "subscriptions must be cleared");
        Assert(!exchange.clients.ContainsKey(RetirementUrl), "the retired client must leave the registry");
        await Task.CompletedTask;
    }

    async public Task testWsRetirementIsIdempotent()
    {
        var client = makeRetirementClient();
        await client.Close();
        var firstError = client.error;
        Assert(firstError != null, "Close must mark the client retired");

        // a late transport error after Close() must not re-retire with a new error
        client.onError(new NetworkError("late close"));
        Assert(ReferenceEquals(client.error, firstError), "retirement must happen at most once");
    }

    async public Task testWsRetirementConcurrentClosersElectOneWinner()
    {
        // the futuresSync lock must elect a single retirement winner even when
        // every lifecycle path arrives at once on different threadpool threads
        for (var attempt = 0; attempt < 64; attempt++)
        {
            var client = makeRetirementClient();
            var pending = client.future("pending");
            var start = new ManualResetEventSlim(false);
            var racers = new List<Task>();
            for (var i = 0; i < 4; i++)
            {
                var mine = new NetworkError("racer");
                racers.Add(Task.Run(() =>
                {
                    start.Wait();
                    client.onError(mine);
                }));
            }
            start.Set();
            await Task.WhenAll(racers);
            Assert(client.error != null, "a concurrent race must still retire the client");
            Assert(pending.task.IsCompleted, "the pending future must be settled exactly once");
            Assert(client.futures.Count == 0, "futures must be drained after the race");
        }
    }

    async public Task testWsExchangeCloseRetiresReplacement()
    {
        // exchange-wide Close must retire a replacement installed under the url
        // while the original was closing, not silently detach it (#30643)
        var exchange = new BaseExchange();
        var original = makeRetirementClient();
        var replacement = makeRetirementClient();
        var replacementFuture = replacement.future("replacement-pending");
        original.onErrorCallback = (c, e) => exchange.clients[RetirementUrl] = replacement;
        exchange.clients[RetirementUrl] = original;
        await exchange.Close();
        Assert(original.error != null, "the original client must be retired");
        Assert(replacement.error != null, "the replacement removed from the registry must be retired");
        Assert(replacementFuture.task.IsCompleted, "the replacement's consumers must be settled");
        Assert(!exchange.clients.ContainsKey(RetirementUrl), "the registry must be empty after Close");
    }

    async public Task testWsClientRetirementRace()
    {
        await testWsRetirementReplacementSurvivesRace();
        await testWsExchangeCloseRetiresReplacement();
        await testWsRetirementSameReferenceLeavesNothingBehind();
        await testWsRetirementIsIdempotent();
        await testWsRetirementConcurrentClosersElectOneWinner();
    }
}
