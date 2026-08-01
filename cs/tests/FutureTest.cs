using ccxt;

namespace Tests;

// regression tests for https://github.com/ccxt/ccxt/issues/29412
// a Future must never throw when it is completed twice, otherwise a concurrent
// error/close handling pass crashes the whole process from inside `async void PingLoop`

public partial class BaseTest
{
    public async Task testWsFuture()
    {
        await this.testFutureDoubleReject();
        await this.testFutureResolveThenReject();
        await this.testFutureRejectThenResolve();
        await this.testFutureRaceMultipleCompletions();
        await this.testFutureConcurrentCompletion();
        await this.testRejectFuturesConcurrentCleanup();
    }

    async Task testFutureDoubleReject()
    {
        var future = new BaseExchange.Future();
        future.reject(new ccxt.NetworkError("first"));
        future.reject(new ccxt.NetworkError("second")); // must be a no-op, not a throw
        try
        {
            await future.task;
            Assert(false, "future.task should have been faulted");
        }
        catch (ccxt.NetworkError e)
        {
            Assert(e.Message.Contains("first"), "the first rejection must win, got: " + e.Message);
        }
    }

    async Task testFutureResolveThenReject()
    {
        var future = new BaseExchange.Future();
        future.resolve("resolved");
        future.reject(new ccxt.NetworkError("late error"));
        var result = await future.task;
        Assert((result as string) == "resolved", "the first completion must win");
    }

    async Task testFutureRejectThenResolve()
    {
        var future = new BaseExchange.Future();
        future.reject(new ccxt.NetworkError("error"));
        future.resolve("late result");
        try
        {
            await future.task;
            Assert(false, "future.task should have been faulted");
        }
        catch (ccxt.NetworkError)
        {
        }
    }

    async Task testFutureRaceMultipleCompletions()
    {
        // Future.race attaches one continuation per input future to a single shared
        // future, so several sources completing must not double-complete it
        var futures = new BaseExchange.Future[10];
        for (var i = 0; i < futures.Length; i++)
        {
            futures[i] = new BaseExchange.Future();
        }
        var race = BaseExchange.Future.race(futures);
        Parallel.For(0, futures.Length, (i) =>
        {
            if (i % 2 == 0)
            {
                futures[i].resolve("value" + i);
            }
            else
            {
                futures[i].reject(new ccxt.NetworkError("error" + i));
            }
        });
        try
        {
            await race.task;
        }
        catch (Exception e)
        {
            Assert(!(e is InvalidOperationException), "race must not double-complete the shared future: " + e.Message);
        }
        foreach (var future in futures)
        {
            // observe every faulted task so it does not resurface as an unobserved exception
            try { await future.task; } catch (Exception) { }
        }
    }

    async Task testFutureConcurrentCompletion()
    {
        // the actual crash shape: PingLoop() and Receiving() rejecting the same
        // future from two thread pool threads at the same time
        for (var attempt = 0; attempt < 200; attempt++)
        {
            var future = new BaseExchange.Future();
            var barrier = new ManualResetEventSlim(false);
            var errors = new System.Collections.Concurrent.ConcurrentBag<Exception>();
            var workers = new Task[4];
            for (var i = 0; i < workers.Length; i++)
            {
                var index = i;
                workers[i] = Task.Run(() =>
                {
                    barrier.Wait();
                    try
                    {
                        if (index % 2 == 0)
                        {
                            future.reject(new ccxt.NetworkError("connection lost"));
                        }
                        else
                        {
                            future.resolve("message");
                        }
                    }
                    catch (Exception e)
                    {
                        errors.Add(e);
                    }
                });
            }
            barrier.Set();
            await Task.WhenAll(workers);
            try { await future.task; } catch (Exception) { }
            Assert(errors.IsEmpty, "concurrent completion threw: " + (errors.IsEmpty ? "" : errors.First().Message));
        }
    }

    async Task testRejectFuturesConcurrentCleanup()
    {
        // two concurrent onError() passes over the same client must not reject the
        // same future twice
        var exchange = new ccxt.pro.binance();
        var client = exchange.client("wss://test.ccxt.com/29412");
        for (var i = 0; i < 50; i++)
        {
            client.subscriptions["hash" + i] = true;
            var pending = client.future("hash" + i);
        }
        var errors = new System.Collections.Concurrent.ConcurrentBag<Exception>();
        var futures = client.futures.Values.ToList();
        var passes = new Task[4];
        for (var i = 0; i < passes.Length; i++)
        {
            passes[i] = Task.Run(() =>
            {
                try
                {
                    exchange.onError(client, new ccxt.NetworkError("connection lost"));
                }
                catch (Exception e)
                {
                    errors.Add(e);
                }
            });
        }
        await Task.WhenAll(passes);
        foreach (var future in futures)
        {
            try { await future.task; } catch (Exception) { }
        }
        Assert(errors.IsEmpty, "concurrent cleanup threw: " + (errors.IsEmpty ? "" : errors.First().ToString()));
    }
}
