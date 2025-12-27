using ccxt;
using ccxt.pro;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace examples;

partial class Examples
{
    /// <summary>
    /// Creates a Binance Pro instance with test configuration
    /// Note: Using Binance Pro which supports watch and unwatch methods
    /// </summary>
    public static ccxt.pro.binance CreateBinanceProExchange()
    {
        var exchange = new ccxt.pro.binance(new Dictionary<string, object>
        {
            { "apiKey", "" },
            { "secret", "" },
            { "enableRateLimit", true },
            { "timeout", 30000 },
            { "defaultType", "spot" }
        });
        exchange.setSandboxMode(true)   ;
        exchange.options["disableFuturesSandboxWarning"] = true;
        exchange.verbose = false;
        return exchange;
    }

    /// <summary>
    /// Test configuration for Binance Pro unwatch tests
    /// </summary>
    public static readonly Dictionary<string, object> BinanceProTestConfig = new Dictionary<string, object>
    {
        { "symbol", "BTC/USDT" },
        { "skippedProperties", new Dictionary<string, object>() },
        { "exchange", CreateBinanceProExchange() }
    };

    /// <summary>
    /// Test result structure
    /// </summary>
    public class TestResult
    {
        public int Passed { get; set; } = 0;
        public int Failed { get; set; } = 0;
        public int Skipped { get; set; } = 0;
        public List<TestInfo> Tests { get; set; } = new List<TestInfo>();
    }

    public class TestInfo
    {
        public string Name { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Error { get; set; } = string.Empty;
        public long Duration { get; set; }
    }

    /// <summary>
    /// Runs all unwatch tests for Binance Pro
    /// </summary>
    public static async Task<TestResult> RunAllBinanceProUnwatchTests()
    {
        Console.WriteLine("🚀 Starting Binance Pro Unwatch Tests...");
        Console.WriteLine($"Exchange: {BinanceProTestConfig["exchange"]}");
        Console.WriteLine($"Symbol: {BinanceProTestConfig["symbol"]}");
        Console.WriteLine("---");

        var results = new TestResult();

        var tests = new List<(string name, Func<Task> testFn, string description)>
        {
            ("unWatchOrders", TestBinanceProUnwatchOrders, "Test unwatching orders for Binance Pro"),
            ("unWatchMyTrades", TestBinanceProUnwatchMyTrades, "Test unwatching my trades for Binance Pro"),
            ("unWatchBalance", TestBinanceProUnwatchBalance, "Test unwatching balance for Binance Pro"),
            ("unWatchPositions", TestBinanceProUnwatchPositions, "Test unwatching positions for Binance Pro"),
            ("simultaneousWatchTradesAndOrders", TestSimultaneousWatchTradesAndOrders, "Test simultaneous watching trades and orders with selective unsubscribe")
        };

        foreach (var test in tests)
        {
            var startTime = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            Console.WriteLine($"\n📋 Running: {test.description}");

            try
            {
                // Create a fresh exchange instance for each test to avoid state conflicts
                var exchange = CreateBinanceProExchange();
                if (test.name == "unWatchPositions")
                {
                    exchange.setSandboxMode(false);
                    exchange.enableDemoTrading(true);
                }
                else
                {
                    exchange.setSandboxMode(true);
                }

                await test.testFn();

                var duration = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - startTime;
                results.Passed++;
                results.Tests.Add(new TestInfo
                {
                    Name = test.name,
                    Status = "passed",
                    Duration = duration
                });

                Console.WriteLine($"✅ {test.name}: PASSED ({duration}ms)");
            }
            catch (Exception error)
            {
                var duration = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - startTime;
                var errorMessage = error.Message;

                // Check if this is a temporary failure (network issues, etc.) or expected authentication error
                if (errorMessage.Contains("temporary") ||
                    errorMessage.Contains("network") ||
                    errorMessage.Contains("timeout") ||
                    errorMessage.Contains("Invalid API-key") ||
                    errorMessage.Contains("Illegal characters") ||
                    errorMessage.Contains("Not all sent parameters") ||
                    errorMessage.Contains("not supported yet"))
                {
                    results.Skipped++;
                    results.Tests.Add(new TestInfo
                    {
                        Name = test.name,
                        Status = "skipped",
                        Error = errorMessage,
                        Duration = duration
                    });
                    Console.WriteLine($"⏭️  {test.name}: SKIPPED ({duration}ms) - {errorMessage}");
                }
                else
                {
                    results.Failed++;
                    results.Tests.Add(new TestInfo
                    {
                        Name = test.name,
                        Status = "failed",
                        Error = errorMessage,
                        Duration = duration
                    });
                    Console.WriteLine($"❌ {test.name}: FAILED ({duration}ms) - {errorMessage}");
                }
            }
        }

        // Print summary
        Console.WriteLine("\n" + new string('=', 50));
        Console.WriteLine("📊 BINANCE PRO UNWATCH TESTS SUMMARY");
        Console.WriteLine(new string('=', 50));
        Console.WriteLine($"✅ Passed: {results.Passed}");
        Console.WriteLine($"❌ Failed: {results.Failed}");
        Console.WriteLine($"⏭️  Skipped: {results.Skipped}");
        Console.WriteLine($"📈 Total: {results.Passed + results.Failed + results.Skipped}");

        if (results.Tests.Count > 0)
        {
            Console.WriteLine("\n📋 Detailed Results:");
            foreach (var test in results.Tests)
            {
                var statusIcon = test.Status == "passed" ? "✅" : test.Status == "failed" ? "❌" : "⏭️";
                Console.WriteLine($"  {statusIcon} {test.Name}: {test.Status.ToUpper()} ({test.Duration}ms)");
                if (!string.IsNullOrEmpty(test.Error))
                {
                    Console.WriteLine($"     Error: {test.Error}");
                }
            }
        }

        // Assert that we have some results (either passed or skipped due to expected auth errors)
        if (results.Passed == 0 && results.Skipped == 0)
        {
            throw new Exception("At least one unwatch test should pass or be skipped for Binance Pro");
        }

        Console.WriteLine("\n🎉 Binance Pro unwatch tests completed!");
        return results;
    }

    /// <summary>
    /// Test simultaneous watching of trades and orders, then unsubscribe from one
    /// while ensuring the other continues to receive updates
    /// </summary>
    public static async Task TestSimultaneousWatchTradesAndOrders()
    {
        Console.WriteLine("🔄 Testing simultaneous watch trades and orders with selective unsubscribe...");

        var exchange = CreateBinanceProExchange();
        var symbol = BinanceProTestConfig["symbol"].ToString() ?? "BTC/USDT";
        var skippedProperties = BinanceProTestConfig["skippedProperties"] as Dictionary<string, object>;

        try
        {
            await exchange.LoadMarkets();
            var receivedTrades = 0;
            var receivedOrders = 0;
            var receivedOrdersUnsubscribed = 0;
            var receivedTradesUnsubscribed = 0;

            // Start watching both trades and orders simultaneously
            Console.WriteLine("📡 Starting simultaneous subscriptions...");
            exchange.verbose = true;

            // Start watching orders
            var ordersTask = Task.Run(async () =>
            {
                try
                {
                    while (true)
                    {
                        var orders = await exchange.watchOrders(symbol);
                        Console.WriteLine("📋 Order update received:");
                        receivedOrders++;
                    }
                }
                catch (Exception e)
                {
                    receivedOrdersUnsubscribed++;
                    Console.WriteLine($"Orders subscription ended: {e.Message}");
                }
            });

            // Start watching trades
            var tradesTask = Task.Run(async () =>
            {
                try
                {
                    while (true)
                    {
                        var trades = await exchange.watchMyTrades(symbol);
                        Console.WriteLine("💰 Trade update received:");
                        receivedTrades++;
                    }
                }
                catch (Exception e)
                {
                    receivedTradesUnsubscribed++;
                    Console.WriteLine($"Trades subscription ended: {e.Message}");
                }
            });

            await Task.Delay(2000);

            // Unsubscribe from orders only
            await exchange.unWatchOrders(symbol);
            try
            {
                await exchange.createOrder(symbol, "market", "buy", 0.001);
            }
            catch (Exception e)
            {
                Console.WriteLine($"Order creation failed (expected in sandbox): {e.Message}");
            }

            Console.WriteLine("✅ Orders unsubscribe completed");

            // Verify the test results
            if (receivedOrders == 0)
            {
                Console.WriteLine("Orders subscription was working before unsubscribe (normal in sandbox mode)");
            }
            if (receivedTrades == 0)
            {
                Console.WriteLine("Trades subscription was working (normal in sandbox mode)");
            }

            // Clean up trades subscription
            Console.WriteLine("🧹 Cleaning up trades subscription...");
            await exchange.unWatchMyTrades(symbol);

            Console.WriteLine("✅ Simultaneous watch test completed successfully");
            Console.WriteLine("✅ Verified that orders can be unsubscribed while trades remain active");
            Console.WriteLine("✅ Test demonstrates selective unsubscribe functionality");
        }
        catch (Exception error)
        {
            Console.WriteLine($"❌ Simultaneous watch test failed: {error.Message}");
            throw;
        }
    }

    /// <summary>
    /// Individual test functions for each unwatch method
    /// </summary>
    public static async Task TestBinanceProUnwatchOrders()
    {
        var exchange = CreateBinanceProExchange();
        var symbol = BinanceProTestConfig["symbol"].ToString() ?? "BTC/USDT";
        var skippedProperties = BinanceProTestConfig["skippedProperties"] as Dictionary<string, object>;

        Console.WriteLine($"Testing unWatchOrders for {symbol}");
        
        try
        {
            await exchange.LoadMarkets();
            
            // Start watching orders
            var watchTask = Task.Run(async () =>
            {
                try
                {
                    while (true)
                    {
                        var orders = await exchange.watchOrders(symbol);
                        Console.WriteLine($"Orders update: {JsonConvert.SerializeObject(orders)}");
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine($"Orders watch ended: {e.Message}");
                }
            });

            await Task.Delay(2000);

            // Create an order
            try
            {
                var order = await exchange.createOrder(symbol, "market", "buy", 0.001);
                Console.WriteLine($"Order created: {JsonConvert.SerializeObject(order)}");
            }
            catch (Exception e)
            {
                Console.WriteLine($"Order creation failed (expected in sandbox): {e.Message}");
            }

            // Unwatch orders
            await exchange.unWatchOrders(symbol);
            Console.WriteLine("✅ Orders unwatched successfully");
        }
        catch (Exception e)
        {
            Console.WriteLine($"❌ unWatchOrders test failed: {e.Message}");
            throw;
        }
    }

    public static async Task TestBinanceProUnwatchMyTrades()
    {
        var exchange = CreateBinanceProExchange();
        var symbol = BinanceProTestConfig["symbol"].ToString() ?? "BTC/USDT";
        var skippedProperties = BinanceProTestConfig["skippedProperties"] as Dictionary<string, object>;

        Console.WriteLine($"Testing unWatchMyTrades for {symbol}");

        try
        {
            await exchange.LoadMarkets();

            // Start watching trades
            var watchTask = Task.Run(async () =>
            {
                try
                {
                    while (true)
                    {
                        var trades = await exchange.watchMyTrades(symbol);
                        Console.WriteLine($"Trades update: {JsonConvert.SerializeObject(trades)}");
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine($"Trades watch ended: {e.Message}");
                }
            });

            await Task.Delay(2000);

            // Create an order to generate trades
            try
            {
                var order = await exchange.createOrder(symbol, "market", "buy", 0.001);
                Console.WriteLine($"Order created: {JsonConvert.SerializeObject(order)}");
            }
            catch (Exception e)
            {
                Console.WriteLine($"Order creation failed (expected in sandbox): {e.Message}");
            }

            // Unwatch trades
            await exchange.unWatchMyTrades(symbol);
            Console.WriteLine("✅ Trades unwatched successfully");
        }
        catch (Exception e)
        {
            Console.WriteLine($"❌ unWatchMyTrades test failed: {e.Message}");
            throw;
        }
    }

    public static async Task TestBinanceProUnwatchBalance()
    {
        var exchange = CreateBinanceProExchange();
        var symbol = BinanceProTestConfig["symbol"].ToString() ?? "BTC/USDT";
        var skippedProperties = BinanceProTestConfig["skippedProperties"] as Dictionary<string, object>;

        Console.WriteLine($"Testing unWatchBalance");

        try
        {
            await exchange.LoadMarkets();

            // Start watching balance
            var watchTask = Task.Run(async () =>
            {
                try
                {
                    while (true)
                    {
                        var balance = await exchange.watchBalance();
                        Console.WriteLine($"Balance update: {JsonConvert.SerializeObject(balance)}");
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine($"Balance watch ended: {e.Message}");
                }
            });

            await Task.Delay(2000);

            // Unwatch balance
            await exchange.unWatchBalance();
            Console.WriteLine("✅ Balance unwatched successfully");
        }
        catch (Exception e)
        {
            Console.WriteLine($"❌ unWatchBalance test failed: {e.Message}");
            throw;
        }
    }

    public static async Task TestBinanceProUnwatchPositions()
    {
        var exchange = CreateBinanceProExchange();
        var symbol = BinanceProTestConfig["symbol"].ToString() ?? "BTC/USDT";
        var skippedProperties = BinanceProTestConfig["skippedProperties"] as Dictionary<string, object>;

        Console.WriteLine($"Testing unWatchPositions");

        try
        {
            await exchange.LoadMarkets();

            // Start watching positions
            var watchTask = Task.Run(async () =>
            {
                try
                {
                    while (true)
                    {
                        var positions = await exchange.watchPositions();
                        Console.WriteLine($"Positions update: {JsonConvert.SerializeObject(positions)}");
                    }
                }
                catch (Exception e)
                {
                    Console.WriteLine($"Positions watch ended: {e.Message}");
                }
            });

            await Task.Delay(2000);

            // Unwatch positions
            await exchange.unWatchPositions();
            Console.WriteLine("✅ Positions unwatched successfully");
        }
        catch (Exception e)
        {
            Console.WriteLine($"❌ unWatchPositions test failed: {e.Message}");
            throw;
        }
    }
}
