using ccxt;
using ccxt.pro;
using System.Diagnostics;
using System.Collections.Concurrent;

namespace Tests.Benchmark
{
    public class BenchmarkResult
    {
        public string TestName { get; set; } = "";
        public int MessagesReceived { get; set; }
        public int Dropped { get; set; }
        public double Throughput { get; set; }
        public double AvgLatency { get; set; }
        public double MinLatency { get; set; }
        public double MaxLatency { get; set; }
        public double MedianLatency { get; set; }
        public double P50Latency { get; set; }
        public double P90Latency { get; set; }
        public double P99Latency { get; set; }
        public double RuntimeSeconds { get; set; }
        public long MemoryUsageMB { get; set; }
        public double CpuUsageMs { get; set; }
    }

    public class MetricsTracker
    {
        public int Received { get; set; } = 0;
        public int Dropped { get; set; } = 0;
        public long? LastId { get; set; } = null;
        public long? FirstId { get; set; } = null;
        public double LatencySum { get; set; } = 0;
        public double MinLatency { get; set; } = double.MaxValue;
        public double MaxLatency { get; set; } = double.MinValue;
        public List<double> Latencies { get; set; } = new List<double>();
        public int Count { get; set; } = 0;
        public long StartTime { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
        public Process CurrentProcess { get; set; } = Process.GetCurrentProcess();
        public long StartMemory { get; set; }
        public TimeSpan StartCpu { get; set; }

        public MetricsTracker()
        {
            StartMemory = CurrentProcess.WorkingSet64;
            StartCpu = CurrentProcess.TotalProcessorTime;
        }
    }

    public class BenchmarkWs
    {
        private const int NUM_CONSUMERS = 30;
        private const int RESERVOIR_SIZE = 5000;
        private static List<string> SYMBOLS = new List<string>();

        public static async Task Main()
        {
            var durationSeconds = 2; // Reduced for testing
            var symbol = "BTC/USDT:USDT";
            var customWsUrl = "ws://localhost:8080/ws";

            var benchmarkResults = new List<BenchmarkResult>();

            try
            {
                // First Benchmark: watch_ticker
                Console.WriteLine("=== Starting Benchmark 1: watch_ticker ===");
                var benchmarkStartTime = DateTimeOffset.UtcNow;
                var binance = await SetupExchange(customWsUrl, symbol);
                
                try
                {
                    await binance.LoadMarkets();

                    // Filter for swap/futures markets only
                    var futuresMarkets = ((Dictionary<string, object>)binance.markets).Values.Where(market => ((Dictionary<string, object>)market).ContainsKey("swap") && (bool)((Dictionary<string, object>)market)["swap"]).ToList();
                    SYMBOLS = futuresMarkets.Take(NUM_CONSUMERS).Select(market => (string)((Dictionary<string, object>)market)["symbol"]).ToList();

                    Console.WriteLine($"Benchmarking for {durationSeconds}s...");
                    var metrics1 = CreateMetricsTracker();
                    var endTime = metrics1.StartTime + durationSeconds * 1000;

                    while (DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() < endTime)
                    {
                        try
                        {
                            var ticker = await binance.WatchTicker(symbol);
                            ProcessTickerMessage(ticker, metrics1, RESERVOIR_SIZE);
                        }
                        catch (Exception e)
                        {
                            Console.WriteLine($"Error in watch_ticker: {e.Message}");
                            break; // Exit if we can't connect to mock server
                        }
                    }

                    var actualRuntime1 = (DateTimeOffset.UtcNow - benchmarkStartTime).TotalSeconds;
                    var result1 = CalculateAndStoreMetrics(metrics1, "watch_ticker", actualRuntime1);
                    benchmarkResults.Add(result1);
                    CalculateAndDisplayMetrics(metrics1, "watch_ticker", actualRuntime1);
                }
                catch (Exception e)
                {
                    Console.WriteLine($"Failed to load markets or run watch_ticker benchmark: {e.Message}");
                    Console.WriteLine("Make sure the mock WebSocket server is running on ws://localhost:8080/ws");
                    return;
                }

                // Second Benchmark: subscribe_ticker with callback (sync=true)
                Console.WriteLine("=== Starting Benchmark 2: subscribe_ticker with sync=true ===");
                benchmarkStartTime = DateTimeOffset.UtcNow;
                var metrics2 = CreateMetricsTracker();

                ConsumerFunction OnTicker2 = (Message msg) =>
                {
                    if (msg.error != null)
                    {
                        throw new Exception(msg.error.ToString());
                    }
                    ProcessTickerMessage(msg.payload, metrics2, RESERVOIR_SIZE);
                    return Task.CompletedTask;
                };

                try
                {
                    await binance.subscribeTicker(symbol, OnTicker2, true);
                    await Task.Delay(durationSeconds * 1000);

                    var actualRuntime2 = (DateTimeOffset.UtcNow - benchmarkStartTime).TotalSeconds;
                    var result2 = CalculateAndStoreMetrics(metrics2, "subscribe_ticker - sync=true", actualRuntime2);
                    benchmarkResults.Add(result2);
                    CalculateAndDisplayMetrics(metrics2, "subscribe_ticker - sync=true", actualRuntime2);
                }
                catch (Exception e)
                {
                    Console.WriteLine($"Error in subscribe_ticker sync=true: {e.Message}");
                }

                // Third Benchmark: subscribe_ticker with callback (sync=false)
                Console.WriteLine("=== Starting Benchmark 3: subscribe_ticker with sync=false ===");
                benchmarkStartTime = DateTimeOffset.UtcNow;
                await binance.Close();
                binance = await SetupExchange(customWsUrl, symbol);
                var metrics3 = CreateMetricsTracker();

                ConsumerFunction OnTicker3 = (Message msg) =>
                {
                    if (msg.error != null)
                    {
                        throw new Exception(msg.error.ToString());
                    }
                    ProcessTickerMessage(msg.payload, metrics3, RESERVOIR_SIZE);
                    return Task.CompletedTask;
                };

                await binance.subscribeTicker(symbol, OnTicker3, false);
                await Task.Delay(durationSeconds * 1000);

                var actualRuntime3 = (DateTimeOffset.UtcNow - benchmarkStartTime).TotalSeconds;
                var result3 = CalculateAndStoreMetrics(metrics3, "subscribe_ticker - sync=false", actualRuntime3);
                benchmarkResults.Add(result3);
                CalculateAndDisplayMetrics(metrics3, "subscribe_ticker - sync=false", actualRuntime3);
                await binance.Close();

                // Fourth Benchmark: NUM_CONSUMERS subscribe_ticker consumers on the same topic (sync=false)
                Console.WriteLine($"=== Starting Benchmark 4: {NUM_CONSUMERS} subscribe_ticker consumers on same topic (sync=false) ===");
                benchmarkStartTime = DateTimeOffset.UtcNow;
                binance = await SetupExchange(customWsUrl, symbol);
                var metricsList = Enumerable.Range(0, NUM_CONSUMERS).Select(_ => CreateMetricsTracker()).ToList();

                for (int i = 0; i < NUM_CONSUMERS; i++)
                {
                    var metrics = metricsList[i];
                    ConsumerFunction OnTicker4 = (Message msg) =>
                    {
                        if (msg.error != null)
                        {
                            throw new Exception(msg.error.ToString());
                        }
                        ProcessTickerMessage(msg.payload, metrics, RESERVOIR_SIZE);
                        return Task.CompletedTask;
                    };
                    await binance.subscribeTicker(symbol, OnTicker4, false);
                }

                await Task.Delay(durationSeconds * 1000);
                var actualRuntime4 = (DateTimeOffset.UtcNow - benchmarkStartTime).TotalSeconds;

                // Aggregate results
                var totalReceived = metricsList.Sum(m => m.Received);
                var totalDropped = metricsList.Sum(m => m.Dropped);
                var totalLatencySum = metricsList.Sum(m => m.LatencySum);
                var minLatency = metricsList.Min(m => m.MinLatency);
                var maxLatency = metricsList.Max(m => m.MaxLatency);
                var allLatencies = metricsList.SelectMany(m => m.Latencies).ToList();
                var startTime = metricsList.Min(m => m.StartTime);

                var result4 = CalculateAndStoreMetricsAggregated(
                    totalReceived, totalDropped, totalLatencySum, minLatency, maxLatency,
                    allLatencies, startTime, $"{NUM_CONSUMERS} subscribe_ticker (same topic, sync=false)", actualRuntime4);
                benchmarkResults.Add(result4);
                CalculateAndDisplayMetricsAggregated(
                    totalReceived, totalDropped, totalLatencySum, minLatency, maxLatency,
                    allLatencies, startTime, $"{NUM_CONSUMERS} subscribe_ticker (same topic, sync=false)", actualRuntime4);
                await binance.Close();

                // Fifth Benchmark: NUM_CONSUMERS subscribe_ticker consumers on the same topic (sync=true)
                Console.WriteLine($"=== Starting Benchmark 5: {NUM_CONSUMERS} subscribe_ticker consumers on same topic (sync=true) ===");
                benchmarkStartTime = DateTimeOffset.UtcNow;
                var binance5 = await SetupExchange(customWsUrl, symbol);
                var metricsListSyncTrue = Enumerable.Range(0, NUM_CONSUMERS).Select(_ => CreateMetricsTracker()).ToList();

                for (int i = 0; i < NUM_CONSUMERS; i++)
                {
                    var metrics = metricsListSyncTrue[i];
                    ConsumerFunction OnTicker5 = (Message msg) =>
                    {
                        if (msg.error != null)
                        {
                            throw new Exception(msg.error.ToString());
                        }
                        ProcessTickerMessage(msg.payload, metrics, RESERVOIR_SIZE);
                        return Task.CompletedTask;
                    };
                    await binance5.subscribeTicker(symbol, OnTicker5, true);
                }

                await Task.Delay(durationSeconds * 1000);
                var actualRuntime5 = (DateTimeOffset.UtcNow - benchmarkStartTime).TotalSeconds;

                // Aggregate results
                totalReceived = metricsListSyncTrue.Sum(m => m.Received);
                totalDropped = metricsListSyncTrue.Sum(m => m.Dropped);
                totalLatencySum = metricsListSyncTrue.Sum(m => m.LatencySum);
                minLatency = metricsListSyncTrue.Min(m => m.MinLatency);
                maxLatency = metricsListSyncTrue.Max(m => m.MaxLatency);
                allLatencies = metricsListSyncTrue.SelectMany(m => m.Latencies).ToList();
                startTime = metricsListSyncTrue.Min(m => m.StartTime);

                var result5 = CalculateAndStoreMetricsAggregated(
                    totalReceived, totalDropped, totalLatencySum, minLatency, maxLatency,
                    allLatencies, startTime, $"{NUM_CONSUMERS} subscribe_ticker (same topic, sync=true)", actualRuntime5);
                benchmarkResults.Add(result5);
                CalculateAndDisplayMetricsAggregated(
                    totalReceived, totalDropped, totalLatencySum, minLatency, maxLatency,
                    allLatencies, startTime, $"{NUM_CONSUMERS} subscribe_ticker (same topic, sync=true)", actualRuntime5);
                await binance5.Close();

                // Sixth Benchmark: NUM_CONSUMERS consumers, each on a different topic (sync=true)
                Console.WriteLine($"=== Starting Benchmark 6: {NUM_CONSUMERS} consumers on different topics (sync=true) ===");
                benchmarkStartTime = DateTimeOffset.UtcNow;
                var binance6 = await SetupExchange(customWsUrl, symbol);
                var symbols = SYMBOLS.Take(NUM_CONSUMERS).ToList();
                var multiTopicMetrics = new List<MetricsTracker>();

                // First, ensure setupStream is called once
                if (!((bool)binance6.isStreamingEnabled()))
                {
                    binance6.setupStream();
                }
                
                var subscribeTickerTasks = new List<Task>();
                for (int i = 0; i < NUM_CONSUMERS; i++)
                {
                    var metrics = CreateMetricsTracker();
                    multiTopicMetrics.Add(metrics);

                    ConsumerFunction OnTicker6 = (Message msg) =>
                    {
                        if (msg.error != null)
                        {
                            throw new Exception(msg.error.ToString());
                        }
                        ProcessTickerMessage(msg.payload, metrics, RESERVOIR_SIZE);
                        return Task.CompletedTask;
                    };
                    subscribeTickerTasks.Add(binance6.subscribeTicker(symbols[i], OnTicker6, true));
                }
                await Task.WhenAll(subscribeTickerTasks);

                await Task.Delay(durationSeconds * 1000);
                var actualRuntime6 = (DateTimeOffset.UtcNow - benchmarkStartTime).TotalSeconds;

                totalReceived = multiTopicMetrics.Sum(m => m.Received);
                totalDropped = multiTopicMetrics.Sum(m => m.Dropped);
                totalLatencySum = multiTopicMetrics.Sum(m => m.LatencySum);
                minLatency = multiTopicMetrics.Min(m => m.MinLatency);
                maxLatency = multiTopicMetrics.Max(m => m.MaxLatency);
                allLatencies = multiTopicMetrics.SelectMany(m => m.Latencies).ToList();
                startTime = multiTopicMetrics.Min(m => m.StartTime);

                var result6 = CalculateAndStoreMetricsAggregated(
                    totalReceived, totalDropped, totalLatencySum, minLatency, maxLatency,
                    allLatencies, startTime, $"{NUM_CONSUMERS} subscribe_ticker (different topics, sync=true)", actualRuntime6);
                benchmarkResults.Add(result6);
                CalculateAndDisplayMetricsAggregated(
                    totalReceived, totalDropped, totalLatencySum, minLatency, maxLatency,
                    allLatencies, startTime, $"{NUM_CONSUMERS} subscribe_ticker (different topics, sync=true)", actualRuntime6);
                try 
                {
                    await binance6.Close();
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"Warning: Error closing binance6 connection: {ex.Message}");
                }

                // Seventh Benchmark: NUM_CONSUMERS consumers, each on a different topic (sync=false)
                Console.WriteLine($"=== Starting Benchmark 7: {NUM_CONSUMERS} consumers on different topics (sync=false) ===");
                benchmarkStartTime = DateTimeOffset.UtcNow;
                var binance7 = await SetupExchange(customWsUrl, symbol);
                var symbols7 = SYMBOLS.Take(NUM_CONSUMERS).ToList();
                var multiTopicMetricsSyncFalse = new List<MetricsTracker>();

                // First, ensure setupStream is called once
                if (!((bool)binance7.isStreamingEnabled()))
                {
                    binance7.setupStream();
                }

                var subscribeTickerTasks7 = new List<Task>();
                for (int i = 0; i < NUM_CONSUMERS; i++)
                {
                    var metrics = CreateMetricsTracker();
                    multiTopicMetricsSyncFalse.Add(metrics);

                    ConsumerFunction OnTicker7 = (Message msg) =>
                    {
                        if (msg.error != null)
                        {
                            throw new Exception(msg.error.ToString());
                        }
                        ProcessTickerMessage(msg.payload, metrics, RESERVOIR_SIZE);
                        return Task.CompletedTask;
                    };
                    subscribeTickerTasks7.Add(binance7.subscribeTicker(symbols7[i], OnTicker7, false));
                }
                await Task.WhenAll(subscribeTickerTasks7);

                await Task.Delay(durationSeconds * 1000);
                var actualRuntime7 = (DateTimeOffset.UtcNow - benchmarkStartTime).TotalSeconds;

                totalReceived = multiTopicMetricsSyncFalse.Sum(m => m.Received);
                totalDropped = multiTopicMetricsSyncFalse.Sum(m => m.Dropped);
                totalLatencySum = multiTopicMetricsSyncFalse.Sum(m => m.LatencySum);
                minLatency = multiTopicMetricsSyncFalse.Min(m => m.MinLatency);
                maxLatency = multiTopicMetricsSyncFalse.Max(m => m.MaxLatency);
                allLatencies = multiTopicMetricsSyncFalse.SelectMany(m => m.Latencies).ToList();
                startTime = multiTopicMetricsSyncFalse.Min(m => m.StartTime);

                var result7 = CalculateAndStoreMetricsAggregated(
                    totalReceived, totalDropped, totalLatencySum, minLatency, maxLatency,
                    allLatencies, startTime, $"{NUM_CONSUMERS} subscribe_ticker (different topics, sync=false)", actualRuntime7);
                benchmarkResults.Add(result7);
                CalculateAndDisplayMetricsAggregated(
                    totalReceived, totalDropped, totalLatencySum, minLatency, maxLatency,
                    allLatencies, startTime, $"{NUM_CONSUMERS} subscribe_ticker (different topics, sync=false)", actualRuntime7);
                await binance7.Close();

                // Eighth Benchmark: NUM_CONSUMERS parallel watch_ticker calls to different symbols
                Console.WriteLine($"=== Starting Benchmark 8: {NUM_CONSUMERS} parallel watch_ticker calls to different symbols ===");
                benchmarkStartTime = DateTimeOffset.UtcNow;
                var binance8 = await SetupExchange(customWsUrl, symbol);
                var symbols8 = SYMBOLS.Take(NUM_CONSUMERS).ToList();
                var parallelMetrics = Enumerable.Range(0, NUM_CONSUMERS).Select(_ => CreateMetricsTracker()).ToList();
                var endTime8 = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() + durationSeconds * 1000;

                async Task StreamConsumer(string symbolName, int index)
                {
                    while (DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() < endTime8)
                    {
                        try
                        {
                            var ticker = await binance8.WatchTicker(symbolName);
                            ProcessTickerMessage(ticker, parallelMetrics[index], RESERVOIR_SIZE);
                        }
                        catch (Exception e)
                        {
                            Console.WriteLine($"Error in stream {index}: {e.Message}");
                        }
                    }
                }

                var streamTasks = symbols8.Select((symbolName, index) => StreamConsumer(symbolName, index)).ToArray();
                await Task.WhenAll(streamTasks);

                var actualRuntime8 = (DateTimeOffset.UtcNow - benchmarkStartTime).TotalSeconds;

                totalReceived = parallelMetrics.Sum(m => m.Received);
                totalDropped = parallelMetrics.Sum(m => m.Dropped);
                totalLatencySum = parallelMetrics.Sum(m => m.LatencySum);
                minLatency = parallelMetrics.Min(m => m.MinLatency);
                maxLatency = parallelMetrics.Max(m => m.MaxLatency);
                allLatencies = parallelMetrics.SelectMany(m => m.Latencies).ToList();
                startTime = parallelMetrics.Min(m => m.StartTime);

                var result8 = CalculateAndStoreMetricsAggregated(
                    totalReceived, totalDropped, totalLatencySum, minLatency, maxLatency,
                    allLatencies, startTime, $"{NUM_CONSUMERS} parallel watch_ticker (different symbols, total)", actualRuntime8);
                benchmarkResults.Add(result8);
                CalculateAndDisplayMetricsAggregated(
                    totalReceived, totalDropped, totalLatencySum, minLatency, maxLatency,
                    allLatencies, startTime, $"{NUM_CONSUMERS} parallel watch_ticker (different symbols, total)", actualRuntime8);
                await binance8.Close();

                // Print summary table
                DisplayResultsTable(benchmarkResults);
            }
            catch (Exception e)
            {
                Console.WriteLine($"Error in main benchmark: {e.Message}");
            }
        }

        private static async Task<Exchange> SetupExchange(string customWsUrl, string symbol)
        {
            var exchange = new ccxt.pro.binance(new Dictionary<string, object>
            {
                ["enableRateLimit"] = false,
                ["verbose"] = false,
            });

            // Configure WebSocket URLs to use mock server
            var urlsDict = (Dictionary<string, object>)exchange.urls;
            var apiDict = (Dictionary<string, object>)urlsDict["api"];
            var wsDict = (Dictionary<string, object>)apiDict["ws"];
            wsDict["spot"] = customWsUrl;
            wsDict["margin"] = customWsUrl;
            wsDict["future"] = customWsUrl;

            return exchange;
        }

        private static MetricsTracker CreateMetricsTracker()
        {
            return new MetricsTracker();
        }

        private static void ProcessTickerMessage(dynamic ticker, MetricsTracker metrics, int reservoirSize)
        {
            metrics.Received++;
            var now = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            
            // Handle different ticker structures
            double eventTime;
            long? id = null;
            
            try
            {
                // Try to access as dictionary first
                var tickerDict = ticker as Dictionary<string, object>;
                if (tickerDict != null)
                {
                    if (tickerDict.ContainsKey("info") && tickerDict["info"] is Dictionary<string, object> info)
                    {
                        if (info.ContainsKey("E"))
                        {
                            eventTime = Convert.ToDouble(info["E"]) / 1e6; // E is in nanoseconds, convert to ms
                        }
                        else
                        {
                            eventTime = now; // Fallback to current time
                        }
                        
                        if (info.ContainsKey("id"))
                        {
                            id = Convert.ToInt64(info["id"]);
                        }
                    }
                    else
                    {
                        eventTime = now;
                    }
                }
                else
                {
                    // Try to access as dynamic object
                    try
                    {
                        eventTime = Convert.ToDouble(ticker.info.E) / 1e6;
                        id = Convert.ToInt64(ticker.info.id);
                    }
                    catch
                    {
                        eventTime = now;
                    }
                }
            }
            catch
            {
                eventTime = now;
            }
            
            var latency = now - eventTime;

            metrics.LatencySum += latency;
            metrics.Count++;
            ReservoirSamplePush(metrics.Latencies, latency, metrics.Count, reservoirSize);

            if (latency < metrics.MinLatency)
                metrics.MinLatency = latency;
            if (latency > metrics.MaxLatency)
                metrics.MaxLatency = latency;

            if (metrics.LastId != null && id != null)
            {
                if (id > metrics.LastId + 1)
                {
                    metrics.Dropped += (int)(id - metrics.LastId.Value - 1);
                }
                // Never allow negative dropped
                if (metrics.Dropped < 0)
                    metrics.Dropped = 0;
            }

            if (metrics.FirstId == null && id != null)
                metrics.FirstId = id;
            metrics.LastId = id;
        }

        private static void CalculateAndDisplayMetrics(MetricsTracker metrics, string benchmarkName, double actualRuntimeSeconds)
        {
            var avgLatency = metrics.Received > 0 ? metrics.LatencySum / metrics.Received : 0;
            var medianLatency = Median(metrics.Latencies);
            var p50Latency = Percentile(metrics.Latencies, 50);
            var p90Latency = Percentile(metrics.Latencies, 90);
            var p99Latency = Percentile(metrics.Latencies, 99);
            var elapsedMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - metrics.StartTime;
            var throughput = metrics.Received / (elapsedMs / 1000.0);
            var elapsedSec = elapsedMs / 1000.0;

            var endMemory = metrics.CurrentProcess.WorkingSet64;
            var endCpu = metrics.CurrentProcess.TotalProcessorTime;
            var memoryDiff = (endMemory - metrics.StartMemory) / 1024 / 1024; // MB
            var cpuDiff = (endCpu - metrics.StartCpu).TotalMilliseconds;

            Console.WriteLine($"--- Benchmark Results ({benchmarkName}) ---");
            Console.WriteLine($"Total messages received: {metrics.Received}");
            Console.WriteLine($"Dropped messages: {metrics.Dropped}");
            Console.WriteLine($"Throughput: {throughput:F2} msg/sec");
            Console.WriteLine($"Elapsed time (s): {elapsedSec:F2}");
            Console.WriteLine($"Actual runtime (s): {actualRuntimeSeconds:F2}");
            Console.WriteLine($"Latency (ms): avg={avgLatency:F2}, min={metrics.MinLatency}, max={metrics.MaxLatency}, median={medianLatency:F2}, p50={p50Latency:F2}, p90={p90Latency:F2}, p99={p99Latency:F2}");
            Console.WriteLine($"Memory usage (MB): {memoryDiff:F2}");
            Console.WriteLine($"CPU usage (ms): {cpuDiff:F2}");
        }

        private static void CalculateAndDisplayMetricsAggregated(
            int received, int dropped, double latencySum, double minLatency, double maxLatency,
            List<double> latencies, long startTime, string benchmarkName, double actualRuntimeSeconds)
        {
            var avgLatency = received > 0 ? latencySum / received : 0;
            var medianLatency = Median(latencies);
            var p50Latency = Percentile(latencies, 50);
            var p90Latency = Percentile(latencies, 90);
            var p99Latency = Percentile(latencies, 99);
            var elapsedMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - startTime;
            var throughput = received / (elapsedMs / 1000.0);
            var elapsedSec = elapsedMs / 1000.0;

            Console.WriteLine($"--- Benchmark Results ({benchmarkName}) ---");
            Console.WriteLine($"Total messages received: {received}");
            Console.WriteLine($"Dropped messages: {dropped}");
            Console.WriteLine($"Throughput: {throughput:F2} msg/sec");
            Console.WriteLine($"Elapsed time (s): {elapsedSec:F2}");
            Console.WriteLine($"Actual runtime (s): {actualRuntimeSeconds:F2}");
            Console.WriteLine($"Latency (ms): avg={avgLatency:F2}, min={minLatency}, max={maxLatency}, median={medianLatency:F2}, p50={p50Latency:F2}, p90={p90Latency:F2}, p99={p99Latency:F2}");
        }

        private static BenchmarkResult CalculateAndStoreMetrics(MetricsTracker metrics, string benchmarkName, double actualRuntimeSeconds)
        {
            var avgLatency = metrics.Received > 0 ? metrics.LatencySum / metrics.Received : 0;
            var medianLatency = Median(metrics.Latencies);
            var p50Latency = Percentile(metrics.Latencies, 50);
            var p90Latency = Percentile(metrics.Latencies, 90);
            var p99Latency = Percentile(metrics.Latencies, 99);
            var elapsedMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - metrics.StartTime;
            var throughput = metrics.Received / (elapsedMs / 1000.0);

            var endMemory = metrics.CurrentProcess.WorkingSet64;
            var endCpu = metrics.CurrentProcess.TotalProcessorTime;
            var memoryDiff = (endMemory - metrics.StartMemory) / 1024 / 1024; // MB
            var cpuDiff = (endCpu - metrics.StartCpu).TotalMilliseconds;

            return new BenchmarkResult
            {
                TestName = benchmarkName,
                MessagesReceived = metrics.Received,
                Dropped = metrics.Dropped,
                Throughput = throughput,
                AvgLatency = avgLatency,
                MinLatency = metrics.MinLatency,
                MaxLatency = metrics.MaxLatency,
                MedianLatency = medianLatency,
                P50Latency = p50Latency,
                P90Latency = p90Latency,
                P99Latency = p99Latency,
                RuntimeSeconds = actualRuntimeSeconds,
                MemoryUsageMB = memoryDiff,
                CpuUsageMs = cpuDiff
            };
        }

        private static BenchmarkResult CalculateAndStoreMetricsAggregated(
            int received, int dropped, double latencySum, double minLatency, double maxLatency,
            List<double> latencies, long startTime, string benchmarkName, double actualRuntimeSeconds)
        {
            var avgLatency = received > 0 ? latencySum / received : 0;
            var medianLatency = Median(latencies);
            var p50Latency = Percentile(latencies, 50);
            var p90Latency = Percentile(latencies, 90);
            var p99Latency = Percentile(latencies, 99);
            var elapsedMs = DateTimeOffset.UtcNow.ToUnixTimeMilliseconds() - startTime;
            var throughput = received / (elapsedMs / 1000.0);

            return new BenchmarkResult
            {
                TestName = benchmarkName,
                MessagesReceived = received,
                Dropped = dropped,
                Throughput = throughput,
                AvgLatency = avgLatency,
                MinLatency = minLatency,
                MaxLatency = maxLatency,
                MedianLatency = medianLatency,
                P50Latency = p50Latency,
                P90Latency = p90Latency,
                P99Latency = p99Latency,
                RuntimeSeconds = actualRuntimeSeconds,
                MemoryUsageMB = 0, // Not tracked for aggregated results
                CpuUsageMs = 0     // Not tracked for aggregated results
            };
        }

        private static void DisplayResultsTable(List<BenchmarkResult> results)
        {
            var headers = new[]
            {
                "Test Name", "Msgs Recv", "Dropped", "Thrput(msg/s)",
                "Avg Lat(ms)", "Min Lat(ms)", "Max Lat(ms)", "Med Lat(ms)",
                "P50 Lat(ms)", "P90 Lat(ms)", "P99 Lat(ms)", "Runtime(s)"
            };

            // Calculate column widths
            var colWidths = headers.ToDictionary(h => h, h => Math.Max(h.Length, 
                results.Max(r => h switch
                {
                    "Test Name" => r.TestName.Length,
                    "Msgs Recv" => r.MessagesReceived.ToString().Length,
                    "Dropped" => r.Dropped.ToString().Length,
                    "Thrput(msg/s)" => r.Throughput.ToString("F2").Length,
                    "Avg Lat(ms)" => r.AvgLatency.ToString("F2").Length,
                    "Min Lat(ms)" => r.MinLatency.ToString("F2").Length,
                    "Max Lat(ms)" => r.MaxLatency.ToString("F2").Length,
                    "Med Lat(ms)" => r.MedianLatency.ToString("F2").Length,
                    "P50 Lat(ms)" => r.P50Latency.ToString("F2").Length,
                    "P90 Lat(ms)" => r.P90Latency.ToString("F2").Length,
                    "P99 Lat(ms)" => r.P99Latency.ToString("F2").Length,
                    "Runtime(s)" => r.RuntimeSeconds.ToString("F2").Length,
                    _ => 0
                })));

            // Print header
            var headerRow = string.Join(" | ", headers.Select(h => h.PadRight(colWidths[h])));
            var separator = string.Join("-+-", headers.Select(h => new string('-', colWidths[h])));
            Console.WriteLine("\n=== Benchmark Results Summary ===\n");
            Console.WriteLine(headerRow);
            Console.WriteLine(separator);

            // Print rows
            foreach (var row in results)
            {
                var values = new[]
                {
                    row.TestName.PadRight(colWidths["Test Name"]),
                    row.MessagesReceived.ToString().PadLeft(colWidths["Msgs Recv"]),
                    row.Dropped.ToString().PadLeft(colWidths["Dropped"]),
                    row.Throughput.ToString("F2").PadLeft(colWidths["Thrput(msg/s)"]),
                    row.AvgLatency.ToString("F2").PadLeft(colWidths["Avg Lat(ms)"]),
                    row.MinLatency.ToString("F2").PadLeft(colWidths["Min Lat(ms)"]),
                    row.MaxLatency.ToString("F2").PadLeft(colWidths["Max Lat(ms)"]),
                    row.MedianLatency.ToString("F2").PadLeft(colWidths["Med Lat(ms)"]),
                    row.P50Latency.ToString("F2").PadLeft(colWidths["P50 Lat(ms)"]),
                    row.P90Latency.ToString("F2").PadLeft(colWidths["P90 Lat(ms)"]),
                    row.P99Latency.ToString("F2").PadLeft(colWidths["P99 Lat(ms)"]),
                    row.RuntimeSeconds.ToString("F2").PadLeft(colWidths["Runtime(s)"])
                };
                Console.WriteLine(string.Join(" | ", values));
            }
        }

        private static double Median(List<double> arr)
        {
            if (arr.Count == 0) return 0;
            var sorted = arr.OrderBy(x => x).ToList();
            var mid = sorted.Count / 2;
            if (sorted.Count % 2 == 0)
            {
                return (sorted[mid - 1] + sorted[mid]) / 2;
            }
            return sorted[mid];
        }

        private static double Percentile(List<double> arr, double p)
        {
            if (arr.Count == 0) return 0;
            var sorted = arr.OrderBy(x => x).ToList();
            var k = (sorted.Count - 1) * (p / 100);
            var f = (int)k;
            var c = k - f;
            if (f + 1 < sorted.Count)
            {
                return sorted[f] * (1 - c) + sorted[f + 1] * c;
            }
            return sorted[f];
        }

        private static void ReservoirSamplePush(List<double> reservoir, double value, int count, int size)
        {
            if (reservoir.Count < size)
            {
                reservoir.Add(value);
            }
            else
            {
                var random = new Random();
                var j = (int)(random.NextDouble() * count);
                if (j < size)
                {
                    reservoir[j] = value;
                }
            }
        }
    }
} 
