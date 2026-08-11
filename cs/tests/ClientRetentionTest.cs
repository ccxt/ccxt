using ccxt;

namespace Tests;

// native cs test, hand-written: the ws base test transpile stage is per-file
// hardcoded and the WebSocketClient is a hand-written base class per lane.
// Mirrors python/ccxt/pro/test/base/test_client_retention.py from
// https://github.com/ccxt/ccxt/pull/29720 and the ts and php native siblings,
// plus a concurrency hammer a transpiled single-threaded test cannot express:
// resolve racing future()'s pending-results check against the futures
// GetOrAdd must never lose a value or strand a waiter (the cs cousin of the
// go lost-wakeup fixed in https://github.com/ccxt/ccxt/pull/29719)

public partial class BaseTest
{
    private static BaseExchange.WebSocketClient createRetentionTestClient()
    {
        return new BaseExchange.WebSocketClient("ws://localhost:1234", null, null);
    }

    async public Task testWsClientRetention()
    {
        // baseline: the waiter-present path is unchanged
        var client = createRetentionTestClient();
        var waited = client.future("a");
        client.resolve("first", "a");
        Assert((string)(await waited) == "first", "waiter-present resolve must deliver");
        Assert(!client.pendingResults.ContainsKey("a"), "waiter-present resolve must not retain");

        // latest-wins: values resolved without a waiter are retained, latest only
        client = createRetentionTestClient();
        client.resolve("stale", "b");
        client.resolve("fresh", "b");
        Assert((string)(await client.future("b")) == "fresh", "retained value must be the latest");

        // drain-once: the retained value is delivered exactly once, the spent
        // future stays out of the map, the next consumer waits for fresh data
        Assert(!client.pendingResults.ContainsKey("b"), "drain must clear the retained value");
        var second = client.future("b");
        Assert(client.futures.ContainsKey("b"), "post-drain future must wait in the map");
        client.resolve("third", "b");
        Assert((string)(await second) == "third", "post-drain future must receive fresh data");

        // reject-clears-value: stale pre-error values must not satisfy
        // post-error consumers
        client = createRetentionTestClient();
        client.resolve("preError", "c");
        var error = new Exception("rejected");
        client.reject(error, "c");
        Assert(!client.pendingResults.ContainsKey("c"), "reject must clear the retained value");
        var thrown = (Exception)null;
        try
        {
            await client.future("c");
        }
        catch (Exception e)
        {
            thrown = e;
        }
        Assert(ReferenceEquals(thrown, error), "future after reject must throw the retained rejection");

        // resolve-supersedes-stale-rejection: a recovered stream must not
        // fail a later waiter with a stale error
        client = createRetentionTestClient();
        client.reject(new Exception("stale"), "d");
        client.resolve("recovered", "d");
        Assert(!client.rejections.ContainsKey("d"), "resolve retention must clear the stale rejection");
        Assert((string)(await client.future("d")) == "recovered", "recovered stream must deliver the value");

        // broadcast wipe: a broadcast reject fails live waiters and wipes
        // every retained value
        client = createRetentionTestClient();
        client.resolve("retained", "e");
        var live = client.future("f");
        var broadcastError = new Exception("broadcast");
        client.reject(broadcastError);
        thrown = null;
        try
        {
            await live;
        }
        catch (Exception e)
        {
            thrown = e;
        }
        Assert(ReferenceEquals(thrown, broadcastError), "broadcast reject must fail live waiters");
        Assert(client.pendingResults.Count == 0, "broadcast reject must wipe retained values");
        _ = client.future("e"); // intentionally not awaited, the entry must wait for fresh data
        Assert(client.futures.ContainsKey("e"), "post-broadcast consumer must wait for fresh data");

        // concurrency hammer: a resolver thread races consumers calling
        // future() on the same hash; every resolved value must reach exactly
        // one consumer promptly, no value may be lost in the check-then-act
        // gap and no consumer may hang
        client = createRetentionTestClient();
        const int rounds = 2000;
        var received = 0;
        var consumer = Task.Run(async () =>
        {
            for (var i = 0; i < rounds; i++)
            {
                var value = await client.future("hammer");
                Assert(value != null, "hammer consumer must never receive null");
                Interlocked.Increment(ref received);
            }
        });
        var producer = Task.Run(() =>
        {
            for (var i = 0; i < rounds; i++)
            {
                client.resolve(i, "hammer");
                while (Volatile.Read(ref received) < i + 1 && !consumer.IsCompleted)
                {
                    Thread.SpinWait(50);
                }
            }
        });
        await Task.WhenAny(Task.WhenAll(consumer, producer), Task.Delay(30000));
        Assert(consumer.IsCompleted && producer.IsCompleted, "hammer must complete without stranded waiters");
        await consumer; // surface any assertion failure
        Assert(received == rounds, "hammer must deliver every resolved value");
    }
}
