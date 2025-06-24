import os
import sys

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))))
sys.path.append(root)

import asyncio
import ccxt.pro as ccxt
import time
import logging

# Constants
NUM_CONSUMERS = 30
SYMBOLS = []

# Set up logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)

# Unified function to setup exchange with mock server
async def setup_exchange(custom_ws_url, symbol):
    exchange = ccxt.binance({
        "enableRateLimit": False,
        "verbose": False,
    })
    # Configure WebSocket URLs to use mock server
    exchange.urls['api']['ws']['spot'] = custom_ws_url
    exchange.urls['api']['ws']['margin'] = custom_ws_url
    exchange.urls['api']['ws']['future'] = custom_ws_url
    # await exchange.watch_ticker(symbol)
    return exchange

# Unified function to calculate and display benchmark metrics
def calculate_and_display_metrics(
    received,
    dropped,
    latency_sum,
    min_latency,
    max_latency,
    latencies,
    start_time,
    benchmark_name,
    actual_runtime_seconds
):
    avg_latency = latency_sum / received if received > 0 else 0
    median_latency = median(latencies)
    p50_latency = percentile(latencies, 50)
    p90_latency = percentile(latencies, 90)
    p99_latency = percentile(latencies, 99)
    elapsed_ms = int(time.time() * 1000) - start_time
    throughput = received / (elapsed_ms / 1000) if elapsed_ms > 0 else 0
    elapsed_sec = elapsed_ms / 1000
    logger.info(f'--- Benchmark Results ({benchmark_name}) ---')
    logger.info(f'Total messages received: {received}')
    logger.info(f'Dropped messages: {dropped}')
    logger.info(f'Throughput: {throughput:.2f} msg/sec')
    logger.info(f'Elapsed time (s): {elapsed_sec:.2f}')
    logger.info(f'Actual runtime (s): {actual_runtime_seconds:.2f}')
    logger.info(f'Latency (ms): avg={avg_latency:.2f}, min={min_latency}, max={max_latency}, median={median_latency:.2f}, p50={p50_latency:.2f}, p90={p90_latency:.2f}, p99={p99_latency:.2f}')

# Unified function to create benchmark metrics tracking object
def create_metrics_tracker():
    return {
        "received": 0,
        "dropped": 0,
        "last_id": None,
        "first_id": None,
        "latency_sum": 0,
        "min_latency": float('inf'),
        "max_latency": float('-inf'),
        "latencies": [],
        "count": 0,
        "start_time": int(time.time() * 1000)
    }

# Unified function to process a ticker message and update metrics
def process_ticker_message(ticker, metrics, RESERVOIR_SIZE):
    metrics["received"] += 1
    now = int(time.time() * 1000)
    event_time = float(ticker['info']['E']) / 1e6  # E is in nanoseconds, convert to ms
    latency = now - event_time
    # Debug logger.info for first 10 messages
    metrics["latency_sum"] += latency
    metrics["count"] += 1
    reservoir_sample_push(metrics["latencies"], latency, metrics["count"], RESERVOIR_SIZE)
    if latency < metrics["min_latency"]:
        metrics["min_latency"] = latency
    if latency > metrics["max_latency"]:
        metrics["max_latency"] = latency
    id_ = ticker['info'].get('id')
    if metrics["last_id"] is not None and id_ is not None:
        if id_ > metrics["last_id"] + 1:
            metrics["dropped"] += id_ - metrics["last_id"] - 1
        # Never allow negative dropped
        if metrics["dropped"] < 0:
            metrics["dropped"] = 0
    if metrics["first_id"] is None and id_ is not None:
        metrics["first_id"] = id_
    metrics["last_id"] = id_

# Unified function to calculate and return benchmark metrics as a dict
def store_metrics(
    received,
    dropped,
    latency_sum,
    min_latency,
    max_latency,
    latencies,
    start_time,
    benchmark_name,
    actual_runtime_seconds
):
    avg_latency = latency_sum / received if received > 0 else 0
    median_latency = median(latencies)
    p50_latency = percentile(latencies, 50)
    p90_latency = percentile(latencies, 90)
    p99_latency = percentile(latencies, 99)
    elapsed_ms = int(time.time() * 1000) - start_time
    throughput = received / (elapsed_ms / 1000) if elapsed_ms > 0 else 0
    return {
        'Test Name': benchmark_name,
        'Msgs Recv': received,
        'Dropped': dropped,
        'Thrput(msg/s)': throughput,
        'Avg Lat(ms)': avg_latency,
        'Min Lat(ms)': min_latency,
        'Max Lat(ms)': max_latency,
        'Med Lat(ms)': median_latency,
        'P50 Lat(ms)': p50_latency,
        'P90 Lat(ms)': p90_latency,
        'P99 Lat(ms)': p99_latency,
        'Runtime(s)': actual_runtime_seconds,
    }

# Function to display a table of all benchmark results
def display_results_table(results):
    headers = [
        'Test Name', 'Msgs Recv', 'Dropped', 'Thrput(msg/s)',
        'Avg Lat(ms)', 'Min Lat(ms)', 'Max Lat(ms)', 'Med Lat(ms)',
        'P50 Lat(ms)', 'P90 Lat(ms)', 'P99 Lat(ms)', 'Runtime(s)'
    ]
    # Calculate column widths
    col_widths = {h: max(len(h), *(len(f"{row[h]:.2f}") if isinstance(row[h], float) else len(str(row[h])) for row in results)) for h in headers}
    # Print header
    header_row = ' | '.join(h.ljust(col_widths[h]) for h in headers)
    separator = '-+-'.join('-' * col_widths[h] for h in headers)
    print('\n=== Benchmark Results Summary ===\n')
    print(header_row)
    print(separator)
    # Print rows
    for row in results:
        print(' | '.join(
            f"{row[h]:.2f}".rjust(col_widths[h]) if isinstance(row[h], float) else str(row[h]).rjust(col_widths[h])
            for h in headers
        ))

async def main():
    duration_seconds = 5
    symbol = 'BTC/USDT:USDT'
    custom_ws_url = 'ws://localhost:8080/ws'
    RESERVOIR_SIZE = 5000

    benchmark_results = []

    # --- First Benchmark: watch_ticker ---
    logger.info('=== Starting Benchmark 1: watch_ticker ===')
    benchmark_start_time = time.time()
    binance = await setup_exchange(custom_ws_url, symbol)
    await binance.load_markets()
    # Filter for swap/futures markets only
    futures_markets = [market for market in binance.markets.values() if market.get('swap')]
    SYMBOLS = [market['symbol'] for market in futures_markets[:NUM_CONSUMERS]]
    logger.info(f'Benchmarking for {duration_seconds}s...')
    metrics1 = create_metrics_tracker()
    end_time = metrics1["start_time"] + duration_seconds * 1000
    while int(time.time() * 1000) < end_time:
        try:
            ticker = await binance.watch_ticker(symbol)
            process_ticker_message(ticker, metrics1, RESERVOIR_SIZE)
        except Exception as e:
            logger.info('Error:', e)
    actual_runtime1 = time.time() - benchmark_start_time
    calculate_and_display_metrics(
        metrics1["received"],
        metrics1["dropped"],
        metrics1["latency_sum"],
        metrics1["min_latency"],
        metrics1["max_latency"],
        metrics1["latencies"],
        metrics1["start_time"],
        'watch_ticker',
        actual_runtime1
    )
    benchmark_results.append(store_metrics(
        metrics1["received"],
        metrics1["dropped"],
        metrics1["latency_sum"],
        metrics1["min_latency"],
        metrics1["max_latency"],
        metrics1["latencies"],
        metrics1["start_time"],
        'watch_ticker',
        actual_runtime1
    ))

    # --- Second Benchmark: subscribe_ticker with callback (sync=True) ---
    logger.info('=== Starting Benchmark 2: subscribe_ticker with sync=True ===')
    benchmark_start_time = time.time()
    metrics2 = create_metrics_tracker()
    def on_ticker(msg):
        if hasattr(msg, 'error') and msg.error:
            raise msg.error
        process_ticker_message(msg.payload, metrics2, RESERVOIR_SIZE)
    await binance.subscribe_ticker(symbol, on_ticker, True)
    await asyncio.sleep(duration_seconds)
    actual_runtime2 = time.time() - benchmark_start_time
    calculate_and_display_metrics(
        metrics2["received"],
        metrics2["dropped"],
        metrics2["latency_sum"],
        metrics2["min_latency"],
        metrics2["max_latency"],
        metrics2["latencies"],
        metrics2["start_time"],
        'subscribe_ticker - sync=True',
        actual_runtime2
    )
    benchmark_results.append(store_metrics(
        metrics2["received"],
        metrics2["dropped"],
        metrics2["latency_sum"],
        metrics2["min_latency"],
        metrics2["max_latency"],
        metrics2["latencies"],
        metrics2["start_time"],
        'subscribe_ticker - sync=True',
        actual_runtime2
    ))

    # --- Third Benchmark: subscribe_ticker with callback (sync=False) ---
    logger.info('=== Starting Benchmark 3: subscribe_ticker with sync=False ===')
    benchmark_start_time = time.time()
    await binance.close()
    binance = await setup_exchange(custom_ws_url, symbol)
    metrics3 = create_metrics_tracker()
    def on_ticker3(msg):
        if hasattr(msg, 'error') and msg.error:
            raise msg.error
        process_ticker_message(msg.payload, metrics3, RESERVOIR_SIZE)
    await binance.subscribe_ticker(symbol, on_ticker3, False)
    await asyncio.sleep(duration_seconds)
    actual_runtime3 = time.time() - benchmark_start_time
    calculate_and_display_metrics(
        metrics3["received"],
        metrics3["dropped"],
        metrics3["latency_sum"],
        metrics3["min_latency"],
        metrics3["max_latency"],
        metrics3["latencies"],
        metrics3["start_time"],
        'subscribe_ticker - sync=False',
        actual_runtime3
    )
    benchmark_results.append(store_metrics(
        metrics3["received"],
        metrics3["dropped"],
        metrics3["latency_sum"],
        metrics3["min_latency"],
        metrics3["max_latency"],
        metrics3["latencies"],
        metrics3["start_time"],
        'subscribe_ticker - sync=False',
        actual_runtime3
    ))
    await binance.close()

    # --- Fourth Benchmark: NUM_CONSUMERS subscribe_ticker consumers on the same topic (sync=False) ---
    logger.info(f'=== Starting Benchmark 4: {NUM_CONSUMERS} subscribe_ticker consumers on same topic (sync=False) ===')
    benchmark_start_time = time.time()
    binance = await setup_exchange(custom_ws_url, symbol)
    metrics_list = [create_metrics_tracker() for _ in range(NUM_CONSUMERS)]
    def make_on_ticker(metrics):
        def on_ticker(msg):
            if hasattr(msg, 'error') and msg.error:
                raise msg.error
            process_ticker_message(msg.payload, metrics, RESERVOIR_SIZE)
        return on_ticker
    for i in range(NUM_CONSUMERS):
        await binance.subscribe_ticker(symbol, make_on_ticker(metrics_list[i]), False)
    await asyncio.sleep(duration_seconds)
    actual_runtime4 = time.time() - benchmark_start_time
    # Aggregate results
    total_received = sum(m["received"] for m in metrics_list)
    total_dropped = sum(m["dropped"] for m in metrics_list)
    total_latency_sum = sum(m["latency_sum"] for m in metrics_list)
    min_latency = min(m["min_latency"] for m in metrics_list)
    max_latency = max(m["max_latency"] for m in metrics_list)
    all_latencies = []
    for m in metrics_list:
        all_latencies.extend(m["latencies"])
    start_time = min(m["start_time"] for m in metrics_list)
    calculate_and_display_metrics(
        total_received,
        total_dropped,
        total_latency_sum,
        min_latency,
        max_latency,
        all_latencies,
        start_time,
        f'{NUM_CONSUMERS} subscribe_ticker (same topic, sync=False)',
        actual_runtime4
    )
    benchmark_results.append(store_metrics(
        total_received,
        total_dropped,
        total_latency_sum,
        min_latency,
        max_latency,
        all_latencies,
        start_time,
        f'{NUM_CONSUMERS} subscribe_ticker (same topic, sync=False)',
        actual_runtime4
    ))
    await binance.close()

    # --- Fifth Benchmark: NUM_CONSUMERS subscribe_ticker consumers on the same topic (sync=True) ---
    logger.info(f'=== Starting Benchmark 5: {NUM_CONSUMERS} subscribe_ticker consumers on same topic (sync=True) ===')
    benchmark_start_time = time.time()
    binance5_same_topic = await setup_exchange(custom_ws_url, symbol)
    metrics_list_sync_true = [create_metrics_tracker() for _ in range(NUM_CONSUMERS)]
    def make_on_ticker_sync_true(metrics):
        def on_ticker(msg):
            if hasattr(msg, 'error') and msg.error:
                raise msg.error
            process_ticker_message(msg.payload, metrics, RESERVOIR_SIZE)
        return on_ticker
    for i in range(NUM_CONSUMERS):
        await binance5_same_topic.subscribe_ticker(symbol, make_on_ticker_sync_true(metrics_list_sync_true[i]), True)
    await asyncio.sleep(duration_seconds)
    actual_runtime5 = time.time() - benchmark_start_time
    # Aggregate results
    total_received = sum(m["received"] for m in metrics_list_sync_true)
    total_dropped = sum(m["dropped"] for m in metrics_list_sync_true)
    total_latency_sum = sum(m["latency_sum"] for m in metrics_list_sync_true)
    min_latency = min(m["min_latency"] for m in metrics_list_sync_true)
    max_latency = max(m["max_latency"] for m in metrics_list_sync_true)
    all_latencies = []
    for m in metrics_list_sync_true:
        all_latencies.extend(m["latencies"])
    start_time = min(m["start_time"] for m in metrics_list_sync_true)
    calculate_and_display_metrics(
        total_received,
        total_dropped,
        total_latency_sum,
        min_latency,
        max_latency,
        all_latencies,
        start_time,
        f'{NUM_CONSUMERS} subscribe_ticker (same topic, sync=True)',
        actual_runtime5
    )
    benchmark_results.append(store_metrics(
        total_received,
        total_dropped,
        total_latency_sum,
        min_latency,
        max_latency,
        all_latencies,
        start_time,
        f'{NUM_CONSUMERS} subscribe_ticker (same topic, sync=True)',
        actual_runtime5
    ))
    await binance5_same_topic.close()

    # --- Sixth Benchmark: NUM_CONSUMERS consumers, each on a different topic (sync=True) ---
    logger.info(f'=== Starting Benchmark 6: {NUM_CONSUMERS} consumers on different topics (sync=True) ===')
    benchmark_start_time = time.time()
    binance6 = await setup_exchange(custom_ws_url, symbol)
    symbols = SYMBOLS[:NUM_CONSUMERS]
    multi_topic_metrics = []
    
    # Run watch_ticker calls in batches of 10
    batch_size = 10
    for i in range(0, len(symbols), batch_size):
        batch_symbols = symbols[i:i + batch_size]
        watch_tasks = [binance6.watch_ticker(symbol_name) for symbol_name in batch_symbols]
        await asyncio.gather(*watch_tasks)
    
    def make_on_ticker_multi_topic(metrics):
        def on_ticker(msg):
            if hasattr(msg, 'error') and msg.error:
                raise msg.error
            process_ticker_message(msg.payload, metrics, RESERVOIR_SIZE)
        return on_ticker
    for i in range(NUM_CONSUMERS):
        metrics = create_metrics_tracker()
        multi_topic_metrics.append(metrics)
        await binance6.subscribe_ticker(symbols[i], make_on_ticker_multi_topic(metrics), True)
    await asyncio.sleep(duration_seconds)
    actual_runtime6 = time.time() - benchmark_start_time
    total_received = sum(m["received"] for m in multi_topic_metrics)
    total_dropped = sum(m["dropped"] for m in multi_topic_metrics)
    total_latency_sum = sum(m["latency_sum"] for m in multi_topic_metrics)
    min_latency = min(m["min_latency"] for m in multi_topic_metrics)
    max_latency = max(m["max_latency"] for m in multi_topic_metrics)
    all_latencies = []
    for m in multi_topic_metrics:
        all_latencies.extend(m["latencies"])
    start_time = min(m["start_time"] for m in multi_topic_metrics)
    calculate_and_display_metrics(
        total_received,
        total_dropped,
        total_latency_sum,
        min_latency,
        max_latency,
        all_latencies,
        start_time,
        f'{NUM_CONSUMERS} subscribe_ticker (different topics, sync=True)',
        actual_runtime6
    )
    benchmark_results.append(store_metrics(
        total_received,
        total_dropped,
        total_latency_sum,
        min_latency,
        max_latency,
        all_latencies,
        start_time,
        f'{NUM_CONSUMERS} subscribe_ticker (different topics, sync=True)',
        actual_runtime6
    ))
    await binance6.close()

    # --- Seventh Benchmark: NUM_CONSUMERS consumers, each on a different topic (sync=False) ---
    logger.info(f'=== Starting Benchmark 7: {NUM_CONSUMERS} consumers on different topics (sync=False) ===')
    benchmark_start_time = time.time()
    binance7 = await setup_exchange(custom_ws_url, symbol)
    symbols7 = SYMBOLS[:NUM_CONSUMERS]
    multi_topic_metrics_sync_false = []
    
    # Run watch_ticker calls in batches of 10
    for i in range(0, len(symbols7), batch_size):
        batch_symbols = symbols7[i:i + batch_size]
        watch_tasks7 = [binance7.watch_ticker(symbol_name) for symbol_name in batch_symbols]
        await asyncio.gather(*watch_tasks7)
    
    def make_on_ticker_multi_topic_sync_false(metrics):
        def on_ticker(msg):
            if hasattr(msg, 'error') and msg.error:
                raise msg.error
            process_ticker_message(msg.payload, metrics, RESERVOIR_SIZE)
        return on_ticker
    for i in range(NUM_CONSUMERS):
        metrics = create_metrics_tracker()
        multi_topic_metrics_sync_false.append(metrics)
        await binance7.subscribe_ticker(symbols7[i], make_on_ticker_multi_topic_sync_false(metrics), False)
    await asyncio.sleep(duration_seconds)
    actual_runtime7 = time.time() - benchmark_start_time
    total_received = sum(m["received"] for m in multi_topic_metrics_sync_false)
    total_dropped = sum(m["dropped"] for m in multi_topic_metrics_sync_false)
    total_latency_sum = sum(m["latency_sum"] for m in multi_topic_metrics_sync_false)
    min_latency = min(m["min_latency"] for m in multi_topic_metrics_sync_false)
    max_latency = max(m["max_latency"] for m in multi_topic_metrics_sync_false)
    all_latencies = []
    for m in multi_topic_metrics_sync_false:
        all_latencies.extend(m["latencies"])
    start_time = min(m["start_time"] for m in multi_topic_metrics_sync_false)
    calculate_and_display_metrics(
        total_received,
        total_dropped,
        total_latency_sum,
        min_latency,
        max_latency,
        all_latencies,
        start_time,
        f'{NUM_CONSUMERS} subscribe_ticker (different topics, sync=False)',
        actual_runtime7
    )
    benchmark_results.append(store_metrics(
        total_received,
        total_dropped,
        total_latency_sum,
        min_latency,
        max_latency,
        all_latencies,
        start_time,
        f'{NUM_CONSUMERS} subscribe_ticker (different topics, sync=False)',
        actual_runtime7
    ))
    await binance7.close()

    # --- Eighth Benchmark: NUM_CONSUMERS parallel watch_ticker calls to different symbols ---
    logger.info(f'=== Starting Benchmark 8: {NUM_CONSUMERS} parallel watch_ticker calls to different symbols ===')
    benchmark_start_time = time.time()
    binance8 = await setup_exchange(custom_ws_url, symbol)
    symbols8 = SYMBOLS[:NUM_CONSUMERS]
    parallel_metrics = [create_metrics_tracker() for _ in range(NUM_CONSUMERS)]
    end_time8 = int(time.time() * 1000) + duration_seconds * 1000
    async def stream_consumer(symbol_name, index):
        while int(time.time() * 1000) < end_time8:
            try:
                ticker = await binance8.watch_ticker(symbol_name)
                process_ticker_message(ticker, parallel_metrics[index], RESERVOIR_SIZE)
            except Exception as e:
                logger.info(f'Error in stream {index}:', e)
    stream_tasks = [stream_consumer(symbols8[i], i) for i in range(NUM_CONSUMERS)]
    await asyncio.gather(*stream_tasks)
    actual_runtime8 = time.time() - benchmark_start_time
    total_received = sum(m["received"] for m in parallel_metrics)
    total_dropped = sum(m["dropped"] for m in parallel_metrics)
    total_latency_sum = sum(m["latency_sum"] for m in parallel_metrics)
    min_latency = min(m["min_latency"] for m in parallel_metrics)
    max_latency = max(m["max_latency"] for m in parallel_metrics)
    all_latencies = []
    for m in parallel_metrics:
        all_latencies.extend(m["latencies"])
    start_time = min(m["start_time"] for m in parallel_metrics)
    calculate_and_display_metrics(
        total_received,
        total_dropped,
        total_latency_sum,
        min_latency,
        max_latency,
        all_latencies,
        start_time,
        f'{NUM_CONSUMERS} parallel watch_ticker (different symbols, total)',
        actual_runtime8
    )
    benchmark_results.append(store_metrics(
        total_received,
        total_dropped,
        total_latency_sum,
        min_latency,
        max_latency,
        all_latencies,
        start_time,
        f'{NUM_CONSUMERS} parallel watch_ticker (different symbols, total)',
        actual_runtime8
    ))
    await binance8.close()

    # Print summary table
    display_results_table(benchmark_results)

# Helper functions
def median(arr):
    if not arr:
        return 0
    sorted_arr = sorted(arr)
    mid = len(sorted_arr) // 2
    if len(sorted_arr) % 2 == 0:
        return (sorted_arr[mid - 1] + sorted_arr[mid]) / 2
    else:
        return sorted_arr[mid]

def percentile(arr, p):
    if not arr:
        return 0
    sorted_arr = sorted(arr)
    k = (len(sorted_arr) - 1) * (p / 100)
    f = int(k)
    c = k - f
    if f + 1 < len(sorted_arr):
        return sorted_arr[f] * (1 - c) + sorted_arr[f + 1] * c
    else:
        return sorted_arr[f]

def reservoir_sample_push(reservoir, value, count, size):
    if len(reservoir) < size:
        reservoir.append(value)
    else:
        import random
        j = int(random.random() * count)
        if j < size:
            reservoir[j] = value

if __name__ == "__main__":
    asyncio.run(main())
