import ccxt from '../../../../ccxt.js';

// Benchmark configuration
const NUM_CONSUMERS = 100;

// Define 50 popular Binance symbols for different topics (defined once and reused)
let SYMBOLS = [];

// Types for memory and CPU usage
// These are the return types of process.memoryUsage() and process.cpuUsage()
type MemoryUsage = ReturnType<typeof process.memoryUsage>;
type CpuUsage = ReturnType<typeof process.cpuUsage>;

// Store metrics for each benchmark test
type BenchmarkResult = {
    name: string;
    received: number;
    dropped: number;
    throughput: number;
    avgLatency: number;
    minLatency: number;
    maxLatency: number;
    medianLatency: number;
    p50Latency: number;
    p90Latency: number;
    p99Latency: number;
    rssDiff: number;
    heapUsedDiff: number;
    heapTotalDiff: number;
    userCpuDiff: number;
    systemCpuDiff: number;
    actualDuration: number;
};

// Unified function to setup exchange with mock server
async function setupExchange (customWsUrl: string) {
    const exchange = new ccxt.pro.binance ({
        "enableRateLimit": false,
        "verbose": false,
    });

    // Configure WebSocket URLs to use mock server
    exchange.urls['api']['ws']['spot'] = customWsUrl;
    exchange.urls['api']['ws']['margin'] = customWsUrl;
    exchange.urls['api']['ws']['future'] = customWsUrl;

    await exchange.loadHttpProxyAgent ();
    return exchange;
}

// Unified function to calculate and display benchmark metrics
function calculateAndDisplayMetrics (
    received: number,
    dropped: number,
    latencySum: number,
    minLatency: number,
    maxLatency: number,
    latencies: number[],
    startTime: number,
    benchmarkName: string,
    startMemory: MemoryUsage,
    endMemory: MemoryUsage,
    startCpu: CpuUsage,
    endCpu: CpuUsage
) {
    const avgLatency = received > 0 ? latencySum / received : 0;
    const medianLatency = median (latencies);
    const p50Latency = percentile (latencies, 50);
    const p90Latency = percentile (latencies, 90);
    const p99Latency = percentile (latencies, 99);
    const elapsedMs = Date.now () - startTime;
    const elapsedSec = elapsedMs / 1000;
    const throughput = received / (elapsedMs / 1000);

    // Memory usage in MB
    const rssDiff = (endMemory.rss - startMemory.rss) / 1024 / 1024;
    const heapUsedDiff = (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024;
    const heapTotalDiff = (endMemory.heapTotal - startMemory.heapTotal) / 1024 / 1024;

    // CPU usage in milliseconds
    const userCpuDiff = (endCpu.user - startCpu.user) / 1000;
    const systemCpuDiff = (endCpu.system - startCpu.system) / 1000;

    console.log ('--- Benchmark Results (' + benchmarkName + ') ---');
    console.log ('Total messages received: ' + received);
    console.log ('Dropped messages: ' + dropped);
    console.log ('Throughput: ' + throughput.toFixed (2) + ' msg/sec');
    console.log ('Elapsed time (s): ' + elapsedSec.toFixed (2));
    console.log ('Elapsed time (ms): ' + elapsedMs.toFixed (2));
    console.log ('Latency (ms): avg=' + avgLatency.toFixed (2) + ', min=' + minLatency + ', max=' + maxLatency + ', median=' + medianLatency.toFixed (2));
    console.log ('Latency percentiles (ms): p50=' + p50Latency.toFixed (2) + ', p90=' + p90Latency.toFixed (2) + ', p99=' + p99Latency.toFixed (2));
    console.log ('Memory usage (MB): rss=' + rssDiff.toFixed (2) + ', heapUsed=' + heapUsedDiff.toFixed (2) + ', heapTotal=' + heapTotalDiff.toFixed (2));
    console.log ('CPU usage (ms): user=' + userCpuDiff.toFixed (2) + ', system=' + systemCpuDiff.toFixed (2));
}

// Unified function to create benchmark metrics tracking object
function createMetricsTracker () {
    return {
        "received": 0,
        "dropped": 0,
        "lastId": undefined,
        "latencySum": 0,
        "minLatency": Number.POSITIVE_INFINITY,
        "maxLatency": Number.NEGATIVE_INFINITY,
        "latencies": [],
        "count": 0,
        "startTime": Date.now (),
        "startMemory": process.memoryUsage (),
        "startCpu": process.cpuUsage ()
    };
}

// Unified function to process a ticker message and update metrics
function processTickerMessage (
    ticker: any,
    metrics: any,
    RESERVOIR_SIZE: number
) {
    metrics.received++;
    const now = Date.now ();
    const eventTime = Number (ticker.info.E) / 1e6; // E is in nanoseconds, convert to ms
    const latency = now - eventTime;
    metrics.latencySum += latency;
    metrics.count++;
    reservoirSamplePush (metrics.latencies, latency, metrics.count, RESERVOIR_SIZE);
    if (latency < metrics.minLatency) metrics.minLatency = latency;
    if (latency > metrics.maxLatency) metrics.maxLatency = latency;
    const id = ticker.info.id;
    if (metrics.lastId !== undefined && id !== metrics.lastId + 1) {
        // metrics.dropped += id - metrics.lastId - 1;
        metrics.dropped++;
    }
    metrics.lastId = id;
}

function storeMetrics (
    received: number,
    dropped: number,
    latencySum: number,
    minLatency: number,
    maxLatency: number,
    latencies: number[],
    startTime: number,
    benchmarkName: string,
    startMemory: MemoryUsage,
    endMemory: MemoryUsage,
    startCpu: CpuUsage,
    endCpu: CpuUsage
): BenchmarkResult {
    const avgLatency = received > 0 ? latencySum / received : 0;
    const medianLatency = median (latencies);
    const p50Latency = percentile (latencies, 50);
    const p90Latency = percentile (latencies, 90);
    const p99Latency = percentile (latencies, 99);
    const elapsedMs = Date.now () - startTime;
    const elapsedSec = elapsedMs / 1000;
    const throughput = received / (elapsedMs / 1000);

    // Memory usage in MB
    const rssDiff = (endMemory.rss - startMemory.rss) / 1024 / 1024;
    const heapUsedDiff = (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024;
    const heapTotalDiff = (endMemory.heapTotal - startMemory.heapTotal) / 1024 / 1024;

    // CPU usage in milliseconds
    const userCpuDiff = (endCpu.user - startCpu.user) / 1000;
    const systemCpuDiff = (endCpu.system - startCpu.system) / 1000;

    return {
        'name': benchmarkName,
        'received': received,
        'dropped': dropped,
        'throughput': throughput,
        'avgLatency': avgLatency,
        'minLatency': minLatency,
        'maxLatency': maxLatency,
        'medianLatency': medianLatency,
        'p50Latency': p50Latency,
        'p90Latency': p90Latency,
        'p99Latency': p99Latency,
        'rssDiff': rssDiff,
        'heapUsedDiff': heapUsedDiff,
        'heapTotalDiff': heapTotalDiff,
        'userCpuDiff': userCpuDiff,
        'systemCpuDiff': systemCpuDiff,
        'actualDuration': elapsedMs,
    };
}

function displayResultsTable (results: BenchmarkResult[]) {
    // Define column headers and their formatting functions
    const columns = {
        'Test Name': ((r: BenchmarkResult) => r.name),
        'Msgs Recv': ((r: BenchmarkResult) => r.received.toString ()),
        'Dropped': ((r: BenchmarkResult) => r.dropped.toString ()),
        'Thrput(msg/s)': ((r: BenchmarkResult) => r.throughput.toFixed (2)),
        'Avg Lat(ms)': ((r: BenchmarkResult) => r.avgLatency.toFixed (2)),
        'Min Lat(ms)': ((r: BenchmarkResult) => r.minLatency.toFixed (2)),
        'Max Lat(ms)': ((r: BenchmarkResult) => r.maxLatency.toFixed (2)),
        'Med Lat(ms)': ((r: BenchmarkResult) => r.medianLatency.toFixed (2)),
        'P50 Lat(ms)': ((r: BenchmarkResult) => r.p50Latency.toFixed (2)),
        'P90 Lat(ms)': ((r: BenchmarkResult) => r.p90Latency.toFixed (2)),
        'P99 Lat(ms)': ((r: BenchmarkResult) => r.p99Latency.toFixed (2)),
        'RSS(MB)': ((r: BenchmarkResult) => r.rssDiff.toFixed (2)),
        'Heap Used(MB)': ((r: BenchmarkResult) => r.heapUsedDiff.toFixed (2)),
        'Heap Tot(MB)': ((r: BenchmarkResult) => r.heapTotalDiff.toFixed (2)),
        'CPU User(ms)': ((r: BenchmarkResult) => r.userCpuDiff.toFixed (2)),
        'CPU Sys(ms)': ((r: BenchmarkResult) => r.systemCpuDiff.toFixed (2)),
        'Actual Duration(ms)': ((r: BenchmarkResult) => r.actualDuration.toFixed (2)),
    };

    // Calculate column widths
    const columnWidths = Object.keys (columns).map ((header) => Math.max (
        header.length,
        ...results.map ((r) => columns[header] (r).length)
    ));

    // Create header row
    const headers = Object.keys (columns);
    const headerRow = headers.map ((h, i) => h.padEnd (columnWidths[i])).join (' | ');
    const separator = columnWidths.map ((w) => '-'.repeat (w)).join (' | ');

    // Create data rows
    const dataRows = results.map ((result) => headers.map (
        (h, i) => columns[h] (result).padEnd (columnWidths[i])
    ).join (' | '));

    // Print the table
    console.log ('\n=== Benchmark Results Summary ===\n');
    console.log (headerRow);
    console.log (separator);
    dataRows.forEach ((row) => console.log (row));
}

(async () => {
    const durationSeconds = 2; // Temporarily reduced for debugging
    const symbol = 'BTC/USDT:USDT';
    const customWsUrl = 'ws://localhost:8080/ws';
    const RESERVOIR_SIZE = 5000;
    const benchmarkResults: BenchmarkResult[] = [];

    // --- First Benchmark: watchTicker (original) ---
    let binance = await setupExchange (customWsUrl);
    await binance.loadMarkets ();

    // Filter for futures markets (swap and future types) and get their market IDs
    const futuresMarkets = Object.values (binance.markets).filter ((market) => market.swap);
    SYMBOLS = futuresMarkets.slice (0, NUM_CONSUMERS).map ((market) => market.symbol);

    console.log ('Benchmarking for ' + durationSeconds + 's... (original streamProduce)');

    const metrics1 = createMetricsTracker ();
    const endTime1 = metrics1.startTime + durationSeconds * 1000;

    await binance.watchTicker (symbol);

    while (Date.now () < endTime1) {
        try {
            const ticker = await binance.watchTicker (symbol);
            processTickerMessage (ticker, metrics1, RESERVOIR_SIZE);
        } catch (e) {
            console.error ('Error:', e);
        }
    }

    const endMemory1 = process.memoryUsage ();
    const endCpu1 = process.cpuUsage (metrics1.startCpu);
    benchmarkResults.push (storeMetrics (
        metrics1.received,
        metrics1.dropped,
        metrics1.latencySum,
        metrics1.minLatency,
        metrics1.maxLatency,
        metrics1.latencies,
        metrics1.startTime,
        'watchTicker (original)',
        metrics1.startMemory,
        endMemory1,
        metrics1.startCpu,
        endCpu1
    ));

    // --- Second Benchmark: subscribeTicker with callback (sync=true) ---
    binance = await setupExchange (customWsUrl);
    const metrics2 = createMetricsTracker ();

    const onTicker = (msg) => {
        if (msg.error) {
            throw msg.error;
        }
        processTickerMessage (msg.payload, metrics2, RESERVOIR_SIZE);
    };

    await binance.subscribeTicker (symbol, onTicker, true);
    await new Promise ((resolve) => { setTimeout (resolve, durationSeconds * 1000); });

    const endMemory2 = process.memoryUsage ();
    const endCpu2 = process.cpuUsage (metrics2.startCpu);
    benchmarkResults.push (storeMetrics (
        metrics2.received,
        metrics2.dropped,
        metrics2.latencySum,
        metrics2.minLatency,
        metrics2.maxLatency,
        metrics2.latencies,
        metrics2.startTime,
        'subscribeTicker (sync=true)',
        metrics2.startMemory,
        endMemory2,
        metrics2.startCpu,
        endCpu2
    ));

    // --- Third Benchmark: subscribeTicker with callback (sync=false) ---
    await binance.close ();
    binance = await setupExchange (customWsUrl);
    await binance.watchTicker (symbol);

    const metrics3 = createMetricsTracker ();

    const onTicker3 = (msg) => {
        if (msg.error) {
            throw msg.error;
        }
        processTickerMessage (msg.payload, metrics3, RESERVOIR_SIZE);
    };

    await binance.subscribeTicker (symbol, onTicker3, false);
    await new Promise ((resolve) => { setTimeout (resolve, durationSeconds * 1000); });

    const endMemory3 = process.memoryUsage ();
    const endCpu3 = process.cpuUsage (metrics3.startCpu);
    benchmarkResults.push (storeMetrics (
        metrics3.received,
        metrics3.dropped,
        metrics3.latencySum,
        metrics3.minLatency,
        metrics3.maxLatency,
        metrics3.latencies,
        metrics3.startTime,
        'subscribeTicker (sync=false)',
        metrics3.startMemory,
        endMemory3,
        metrics3.startCpu,
        endCpu3
    ));

    await binance.close ();

    // --- Fourth Benchmark: NUM_CONSUMERS subscribeTicker consumers on the same topic (individual performance) ---
    binance = await setupExchange (customWsUrl);
    await binance.watchTicker (symbol);

    // Create separate metrics trackers for each consumer
    const consumerMetrics = [];
    const consumerCallbacks = [];

    for (let i = 0; i < NUM_CONSUMERS; i++) {
        const metrics = createMetricsTracker ();
        consumerMetrics.push (metrics);

        const onTickerCallback = (msg) => {
            if (msg.error) {
                throw msg.error;
            }
            // Debug: Log which consumer is receiving which symbol
            const messageSymbol = msg.payload.symbol;
            processTickerMessage (msg.payload, metrics, RESERVOIR_SIZE);
        };
        consumerCallbacks.push (onTickerCallback);
    }

    // Subscribe all consumers to the same symbol
    for (let i = 0; i < NUM_CONSUMERS; i++) {
        await binance.subscribeTicker (symbol, consumerCallbacks[i], true);
    }
    await new Promise ((resolve) => { setTimeout (resolve, durationSeconds * 1000); });

    // Calculate average performance across all consumers (since they all get the same messages)
    const avgMetrics = {
        'received': 0,
        'dropped': 0,
        'latencySum': 0,
        'minLatency': Number.POSITIVE_INFINITY,
        'maxLatency': Number.NEGATIVE_INFINITY,
        'latencies': [],
        'startTime': consumerMetrics[0].startTime,
        'startMemory': consumerMetrics[0].startMemory,
        'startCpu': consumerMetrics[0].startCpu
    };

    // Calculate averages across all consumers
    consumerMetrics.forEach ((metrics) => {
        avgMetrics.received += metrics.received;
        avgMetrics.latencySum += metrics.latencySum;
        if (metrics.minLatency < avgMetrics.minLatency) {
            avgMetrics.minLatency = metrics.minLatency;
        }
        if (metrics.maxLatency > avgMetrics.maxLatency) {
            avgMetrics.maxLatency = metrics.maxLatency;
        }
        // Merge latency arrays (take samples from each)
        avgMetrics.latencies.push (...metrics.latencies);
    });

    // Since all consumers get the same messages, divide by number of consumers to get per-consumer metrics
    const numConsumers = consumerMetrics.length;
    avgMetrics.received = Math.round (avgMetrics.received / numConsumers);
    avgMetrics.dropped = consumerMetrics[0].dropped;
    avgMetrics.latencySum = avgMetrics.latencySum / numConsumers;

    // If we have too many latency samples, sample them down to RESERVOIR_SIZE
    if (avgMetrics.latencies.length > RESERVOIR_SIZE) {
        const sampled = [];
        const step = avgMetrics.latencies.length / RESERVOIR_SIZE;
        for (let i = 0; i < RESERVOIR_SIZE; i++) {
            const index = Math.floor (i * step);
            sampled.push (avgMetrics.latencies[index]);
        }
        avgMetrics.latencies = sampled;
    }

    const endMemory4 = process.memoryUsage ();
    const endCpu4 = process.cpuUsage (avgMetrics.startCpu);
    benchmarkResults.push (storeMetrics (
        avgMetrics.received,
        avgMetrics.dropped,
        avgMetrics.latencySum,
        avgMetrics.minLatency,
        avgMetrics.maxLatency,
        avgMetrics.latencies,
        avgMetrics.startTime,
        NUM_CONSUMERS + ' subscribeTicker (same topic, avg per consumer)',
        avgMetrics.startMemory,
        endMemory4,
        avgMetrics.startCpu,
        endCpu4
    ));

    await binance.close ();

    // --- Fifth Benchmark: NUM_CONSUMERS consumers, each on a different topic (sync=true) ---
    console.log ('--- Fifth Benchmark: ' + NUM_CONSUMERS + ' consumers on different topics (sync=true) ---');
    const binance5 = await setupExchange (customWsUrl);

    // Create separate metrics trackers for each consumer
    const multiTopicMetrics = [];
    const multiTopicCallbacks = [];

    let promises5 = [];
    for (let i = 0; i < NUM_CONSUMERS; i++) {
        promises5.push (binance5.watchTicker (SYMBOLS[i]));
    }
    await Promise.all (promises5);

    for (let i = 0; i < NUM_CONSUMERS; i++) {
        const metrics = createMetricsTracker ();
        multiTopicMetrics.push (metrics);

        const onTickerCallback = (msg) => {
            if (msg.error) {
                throw msg.error;
            }
            // Debug: Log which consumer is receiving which symbol
            const messageSymbol = msg.payload.symbol;
            if (messageSymbol !== SYMBOLS[i]) {
                console.log ('Consumer ' + i + ' received message for symbol: ' + messageSymbol + ' (expected: ' + SYMBOLS[i] + ')');
            }
            processTickerMessage (msg.payload, metrics, RESERVOIR_SIZE);
        };
        multiTopicCallbacks.push (onTickerCallback);
    }

    // Subscribe each consumer to a different symbol with sync=true
    promises5 = [];
    for (let i = 0; i < NUM_CONSUMERS; i++) {
        promises5.push (binance5.subscribeTicker (SYMBOLS[i], multiTopicCallbacks[i], true));
    }
    await Promise.all (promises5);
    await new Promise ((resolve) => { setTimeout (resolve, durationSeconds * 1000); });

    // Calculate total performance across all consumers (each gets different messages)
    const totalMetrics = {
        'received': 0,
        'dropped': 0,
        'latencySum': 0,
        'minLatency': Number.POSITIVE_INFINITY,
        'maxLatency': Number.NEGATIVE_INFINITY,
        'latencies': [],
        'startTime': multiTopicMetrics[0].startTime,
        'startMemory': multiTopicMetrics[0].startMemory,
        'startCpu': multiTopicMetrics[0].startCpu
    };

    // Sum up metrics from all consumers
    multiTopicMetrics.forEach ((metrics, index) => {
        console.log ('Consumer ' + index + ' received ' + metrics.received + ' messages for symbol ' + SYMBOLS[index]);
        totalMetrics.received += metrics.received;
        totalMetrics.dropped += metrics.dropped;
        totalMetrics.latencySum += metrics.latencySum;
        if (metrics.minLatency < totalMetrics.minLatency) {
            totalMetrics.minLatency = metrics.minLatency;
        }
        if (metrics.maxLatency > totalMetrics.maxLatency) {
            totalMetrics.maxLatency = metrics.maxLatency;
        }
        // Merge latency arrays (take samples from each)
        totalMetrics.latencies.push (...metrics.latencies);
    });

    // If we have too many latency samples, sample them down to RESERVOIR_SIZE
    if (totalMetrics.latencies.length > RESERVOIR_SIZE) {
        const sampled = [];
        const step = totalMetrics.latencies.length / RESERVOIR_SIZE;
        for (let i = 0; i < RESERVOIR_SIZE; i++) {
            const index = Math.floor (i * step);
            sampled.push (totalMetrics.latencies[index]);
        }
        totalMetrics.latencies = sampled;
    }

    const endMemory5 = process.memoryUsage ();
    const endCpu5 = process.cpuUsage (totalMetrics.startCpu);
    benchmarkResults.push (storeMetrics (
        totalMetrics.received,
        totalMetrics.dropped,
        totalMetrics.latencySum,
        totalMetrics.minLatency,
        totalMetrics.maxLatency,
        totalMetrics.latencies,
        totalMetrics.startTime,
        NUM_CONSUMERS + ' subscribeTicker (different topics, sync=true, total)',
        totalMetrics.startMemory,
        endMemory5,
        totalMetrics.startCpu,
        endCpu5
    ));

    await binance5.close ();

    // --- Fifth-B Benchmark: NUM_CONSUMERS subscribeTicker consumers on the same topic (sync=false) ---
    console.log ('--- Fifth-B Benchmark: ' + NUM_CONSUMERS + ' consumers on same topic (sync=false) ---');
    binance = await setupExchange (customWsUrl);
    await binance.watchTicker (symbol);

    // Create separate metrics trackers for each consumer
    const consumerMetricsSyncFalse = [];
    const consumerCallbacksSyncFalse = [];

    for (let i = 0; i < NUM_CONSUMERS; i++) {
        const metrics = createMetricsTracker ();
        consumerMetricsSyncFalse.push (metrics);

        const onTickerCallback = (msg) => {
            if (msg.error) {
                throw msg.error;
            }
            processTickerMessage (msg.payload, metrics, RESERVOIR_SIZE);
        };
        consumerCallbacksSyncFalse.push (onTickerCallback);
    }

    // Subscribe all consumers to the same symbol with sync=false
    const promises5b = [];
    for (let i = 0; i < NUM_CONSUMERS; i++) {
        promises5b.push (binance.subscribeTicker (symbol, consumerCallbacksSyncFalse[i], false));
    }
    await Promise.all (promises5b);
    await new Promise ((resolve) => { setTimeout (resolve, durationSeconds * 1000); });

    // Calculate average performance across all consumers (since they all get the same messages)
    const avgMetricsSyncFalse = {
        'received': 0,
        'dropped': 0,
        'latencySum': 0,
        'minLatency': Number.POSITIVE_INFINITY,
        'maxLatency': Number.NEGATIVE_INFINITY,
        'latencies': [],
        'startTime': consumerMetricsSyncFalse[0].startTime,
        'startMemory': consumerMetricsSyncFalse[0].startMemory,
        'startCpu': consumerMetricsSyncFalse[0].startCpu
    };

    // Calculate averages across all consumers
    consumerMetricsSyncFalse.forEach ((metrics) => {
        avgMetricsSyncFalse.received += metrics.received;
        avgMetricsSyncFalse.latencySum += metrics.latencySum;
        if (metrics.minLatency < avgMetricsSyncFalse.minLatency) {
            avgMetricsSyncFalse.minLatency = metrics.minLatency;
        }
        if (metrics.maxLatency > avgMetricsSyncFalse.maxLatency) {
            avgMetricsSyncFalse.maxLatency = metrics.maxLatency;
        }
        // Merge latency arrays (take samples from each)
        avgMetricsSyncFalse.latencies.push (...metrics.latencies);
    });

    // Since all consumers get the same messages, divide by number of consumers to get per-consumer metrics
    const numConsumersSyncFalse = consumerMetricsSyncFalse.length;
    avgMetricsSyncFalse.received = Math.round (avgMetricsSyncFalse.received / numConsumersSyncFalse);
    avgMetricsSyncFalse.dropped = consumerMetricsSyncFalse[0].dropped;
    avgMetricsSyncFalse.latencySum = avgMetricsSyncFalse.latencySum / numConsumersSyncFalse;

    // If we have too many latency samples, sample them down to RESERVOIR_SIZE
    if (avgMetricsSyncFalse.latencies.length > RESERVOIR_SIZE) {
        const sampled = [];
        const step = avgMetricsSyncFalse.latencies.length / RESERVOIR_SIZE;
        for (let i = 0; i < RESERVOIR_SIZE; i++) {
            const index = Math.floor (i * step);
            sampled.push (avgMetricsSyncFalse.latencies[index]);
        }
        avgMetricsSyncFalse.latencies = sampled;
    }

    const endMemory5SyncFalse = process.memoryUsage ();
    const endCpu5SyncFalse = process.cpuUsage (avgMetricsSyncFalse.startCpu);
    benchmarkResults.push (storeMetrics (
        avgMetricsSyncFalse.received,
        avgMetricsSyncFalse.dropped,
        avgMetricsSyncFalse.latencySum,
        avgMetricsSyncFalse.minLatency,
        avgMetricsSyncFalse.maxLatency,
        avgMetricsSyncFalse.latencies,
        avgMetricsSyncFalse.startTime,
        NUM_CONSUMERS + ' subscribeTicker (same topic, sync=false, avg per consumer)',
        avgMetricsSyncFalse.startMemory,
        endMemory5SyncFalse,
        avgMetricsSyncFalse.startCpu,
        endCpu5SyncFalse
    ));

    await binance.close ();

    // --- Fifth-C Benchmark: NUM_CONSUMERS consumers, each on a different topic (sync=false) ---
    console.log ('--- Fifth-C Benchmark: ' + NUM_CONSUMERS + ' consumers on different topics (sync=false) ---');
    const binance5c = await setupExchange (customWsUrl);

    // Create separate metrics trackers for each consumer
    const multiTopicMetricsSyncFalse = [];
    const multiTopicCallbacksSyncFalse = [];

    let promises5c = [];
    for (let i = 0; i < NUM_CONSUMERS; i++) {
        promises5c.push (binance5c.watchTicker (SYMBOLS[i]));
    }
    await Promise.all (promises5c);

    for (let i = 0; i < NUM_CONSUMERS; i++) {
        const metrics = createMetricsTracker ();
        multiTopicMetricsSyncFalse.push (metrics);

        const onTickerCallback = (msg) => {
            if (msg.error) {
                throw msg.error;
            }
            // Debug: Log which consumer is receiving which symbol
            const messageSymbol = msg.payload.symbol;
            processTickerMessage (msg.payload, metrics, RESERVOIR_SIZE);
        };
        multiTopicCallbacksSyncFalse.push (onTickerCallback);
    }

    // Subscribe each consumer to a different symbol with sync=false
    promises5c = [];
    for (let i = 0; i < NUM_CONSUMERS; i++) {
        promises5c.push (binance5c.subscribeTicker (SYMBOLS[i], multiTopicCallbacksSyncFalse[i], false));
    }
    await Promise.all (promises5c);
    await new Promise ((resolve) => { setTimeout (resolve, durationSeconds * 1000); });

    // Calculate total performance across all consumers (each gets different messages)
    const totalMetricsSyncFalse = {
        'received': 0,
        'dropped': 0,
        'latencySum': 0,
        'minLatency': Number.POSITIVE_INFINITY,
        'maxLatency': Number.NEGATIVE_INFINITY,
        'latencies': [],
        'startTime': multiTopicMetricsSyncFalse[0].startTime,
        'startMemory': multiTopicMetricsSyncFalse[0].startMemory,
        'startCpu': multiTopicMetricsSyncFalse[0].startCpu
    };

    // Sum up metrics from all consumers
    multiTopicMetricsSyncFalse.forEach ((metrics) => {
        totalMetricsSyncFalse.received += metrics.received;
        totalMetricsSyncFalse.dropped += metrics.dropped;
        totalMetricsSyncFalse.latencySum += metrics.latencySum;
        if (metrics.minLatency < totalMetricsSyncFalse.minLatency) {
            totalMetricsSyncFalse.minLatency = metrics.minLatency;
        }
        if (metrics.maxLatency > totalMetricsSyncFalse.maxLatency) {
            totalMetricsSyncFalse.maxLatency = metrics.maxLatency;
        }
        // Merge latency arrays (take samples from each)
        totalMetricsSyncFalse.latencies.push (...metrics.latencies);
    });

    // If we have too many latency samples, sample them down to RESERVOIR_SIZE
    if (totalMetricsSyncFalse.latencies.length > RESERVOIR_SIZE) {
        const sampled = [];
        const step = totalMetricsSyncFalse.latencies.length / RESERVOIR_SIZE;
        for (let i = 0; i < RESERVOIR_SIZE; i++) {
            const index = Math.floor (i * step);
            sampled.push (totalMetricsSyncFalse.latencies[index]);
        }
        totalMetricsSyncFalse.latencies = sampled;
    }

    const endMemory5cSyncFalse = process.memoryUsage ();
    const endCpu5cSyncFalse = process.cpuUsage (totalMetricsSyncFalse.startCpu);
    benchmarkResults.push (storeMetrics (
        totalMetricsSyncFalse.received,
        totalMetricsSyncFalse.dropped,
        totalMetricsSyncFalse.latencySum,
        totalMetricsSyncFalse.minLatency,
        totalMetricsSyncFalse.maxLatency,
        totalMetricsSyncFalse.latencies,
        totalMetricsSyncFalse.startTime,
        NUM_CONSUMERS + ' subscribeTicker (different topics, sync=false, total)',
        totalMetricsSyncFalse.startMemory,
        endMemory5cSyncFalse,
        totalMetricsSyncFalse.startCpu,
        endCpu5cSyncFalse
    ));

    await binance5c.close ();

    // --- Sixth Benchmark: NUM_CONSUMERS parallel watchTicker calls to different symbols ---
    console.log ('--- Sixth Benchmark: ' + NUM_CONSUMERS + ' parallel watchTicker calls to different symbols ---');
    const binance6 = await setupExchange (customWsUrl);

    // Create separate metrics trackers for each watchTicker stream
    const parallelMetrics = [];

    // Create metrics trackers for each stream
    for (let i = 0; i < NUM_CONSUMERS; i++) {
        const metrics = createMetricsTracker ();
        parallelMetrics.push (metrics);
    }

    // Start consuming from all streams in parallel
    const endTime6 = Date.now () + durationSeconds * 1000;

    // Create individual watchTicker loops for each symbol
    const streamPromises = SYMBOLS.slice (0, NUM_CONSUMERS).map (async (symbolName, index) => {
        console.log ('Starting watchTicker for ' + symbolName);
        while (Date.now () < endTime6) {
            try {
                const ticker = await binance6.watchTicker (symbolName);
                processTickerMessage (ticker, parallelMetrics[index], RESERVOIR_SIZE);
            } catch (e) {
                console.error ('Error in stream ' + index + ' (' + symbolName + '):', e);
            }
        }
    });

    // Wait for all streams to complete
    await Promise.all (streamPromises);

    // Calculate total performance across all parallel streams
    const totalParallelMetrics = {
        'received': 0,
        'dropped': 0,
        'latencySum': 0,
        'minLatency': Number.POSITIVE_INFINITY,
        'maxLatency': Number.NEGATIVE_INFINITY,
        'latencies': [],
        'startTime': parallelMetrics[0].startTime,
        'startMemory': parallelMetrics[0].startMemory,
        'startCpu': parallelMetrics[0].startCpu
    };

    // Sum up metrics from all parallel streams
    parallelMetrics.forEach ((metrics) => {
        totalParallelMetrics.received += metrics.received;
        totalParallelMetrics.dropped += metrics.dropped;
        totalParallelMetrics.latencySum += metrics.latencySum;
        if (metrics.minLatency < totalParallelMetrics.minLatency) {
            totalParallelMetrics.minLatency = metrics.minLatency;
        }
        if (metrics.maxLatency > totalParallelMetrics.maxLatency) {
            totalParallelMetrics.maxLatency = metrics.maxLatency;
        }
        // Merge latency arrays (take samples from each)
        totalParallelMetrics.latencies.push (...metrics.latencies);
    });

    // If we have too many latency samples, sample them down to RESERVOIR_SIZE
    if (totalParallelMetrics.latencies.length > RESERVOIR_SIZE) {
        const sampled = [];
        const step = totalParallelMetrics.latencies.length / RESERVOIR_SIZE;
        for (let i = 0; i < RESERVOIR_SIZE; i++) {
            const index = Math.floor (i * step);
            sampled.push (totalParallelMetrics.latencies[index]);
        }
        totalParallelMetrics.latencies = sampled;
    }

    const endMemory6 = process.memoryUsage ();
    const endCpu6 = process.cpuUsage (totalParallelMetrics.startCpu);
    benchmarkResults.push (storeMetrics (
        totalParallelMetrics.received,
        totalParallelMetrics.dropped,
        totalParallelMetrics.latencySum,
        totalParallelMetrics.minLatency,
        totalParallelMetrics.maxLatency,
        totalParallelMetrics.latencies,
        totalParallelMetrics.startTime,
        NUM_CONSUMERS + ' parallel watchTicker (different symbols, total)',
        totalParallelMetrics.startMemory,
        endMemory6,
        totalParallelMetrics.startCpu,
        endCpu6
    ));

    await binance6.close ();

    // Display the final results table
    displayResultsTable (benchmarkResults);

}) ();

function median (arr: number[ ]): number {
    if (arr.length === 0) return 0;
    const sorted = [ ...arr ].sort ((a, b) => a - b);
    const mid = Math.floor (sorted.length / 2);
    if (sorted.length % 2 === 0) {
        return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    return sorted[mid];
}

function percentile (arr: number[], p: number): number {
    if (arr.length === 0) return 0;
    const sorted = [ ...arr ].sort ((a, b) => a - b);
    const index = Math.ceil ((p / 100) * sorted.length) - 1;
    return sorted[Math.max (0, index)];
}

function reservoirSamplePush (reservoir: any[], value: any, count: number, size: number) {
    if (reservoir.length < size) {
        reservoir.push (value);
    } else {
        const j = Math.floor (Math.random () * count);
        if (j < size) {
            reservoir[j] = value;
        }
    }
}
