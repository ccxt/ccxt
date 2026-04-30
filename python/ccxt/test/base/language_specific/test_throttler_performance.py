import os
import sys
import asyncio

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)

import ccxt.async_support as ccxt  # noqa: F402

async def test_throttler_performance_helper(exchange, num_requests):
    start_time = exchange.milliseconds()
    tasks = []

    for i in range(num_requests):
        tasks.append(throttle_call(exchange, i, start_time))

    await asyncio.gather(*tasks)

    end_time = exchange.milliseconds()
    total_time = (end_time - start_time)
    return total_time

async def throttle_call(exchange, index, start_time):
    try:
        # Use the throttler directly without making any API calls
        await exchange.throttle(1)  # cost of 1
        mock_result = {
            'id': 'mock',
            'timestamp': exchange.milliseconds(),
            'data': 'mock data',
        }
        assert mock_result['id'] == 'mock'
        return mock_result
    except Exception as e:
        print(f"Throttle call {index + 1} failed: {e}")
        raise e

async def test_throttler():
    exchange1 = ccxt.binance({
        'enableRateLimit': True,
        'rateLimiterAlgorithm': 'rollingWindow',
    })

    try:
        rolling_window_time = await test_throttler_performance_helper(exchange1, 100)
    finally:
        await exchange1.close()

    exchange2 = ccxt.binance({
        'enableRateLimit': True,
        'rateLimiterAlgorithm': 'leakyBucket',
    })

    try:
        leaky_bucket_time = await test_throttler_performance_helper(exchange2, 20)
    finally:
        await exchange2.close()

    exchange3 = ccxt.binance({
        'enableRateLimit': True,
        'rollingWindowSize': 0.0,
    })

    try:
        rolling_window_0_time = await test_throttler_performance_helper(exchange3, 20)
    finally:
        await exchange3.close()

    rolling_window_time_string = str(round(rolling_window_time, 2))
    leaky_bucket_time_string = str(round(leaky_bucket_time, 2))
    rolling_window_0_time_string = str(round(rolling_window_0_time, 2))  # uses leakyBucket

    assert rolling_window_time <= 1000, 'Rolling window throttler should happen immediately, but time was: ' + rolling_window_time_string
    assert leaky_bucket_time >= 500, 'Leaky bucket throttler should take at least half a second for 20 requests, but time was: ' + leaky_bucket_time_string
    assert rolling_window_0_time >= 500, 'With rollingWindowSize === 0, the Leaky bucket throttler should be used and take at least half a second for 20 requests, time was: ' + rolling_window_0_time_string

    print('┌───────────────────────────────────────────┬──────────────┬─────────────────┐')
    print('│ Algorithm                                 │ Time (ms)    │ Expected (ms)   │')
    print('├───────────────────────────────────────────┼──────────────┼─────────────────┤')
    print('│ Rolling Window                            │ ' + rolling_window_time_string.rjust(11) + '  │ ~3              │')
    print('│ Leaky Bucket                              │ ' + leaky_bucket_time_string.rjust(11) + '  │ ~950            │')
    print('│ Leaky Bucket (rollingWindowSize === 0)    │ ' + rolling_window_0_time_string.rjust(11) + '  │ ~950            │')
    print('└───────────────────────────────────────────┴──────────────┴─────────────────┘')

    # --- syncUsedWeight tests ---
    print('--- syncUsedWeight tests ---')
    exchange4 = ccxt.binance({'enableRateLimit': True, 'rateLimiterAlgorithm': 'rollingWindow'})
    throttler = exchange4.throttler
    now_ms = exchange4.milliseconds()

    # Test 1: Under-tracked
    throttler.timestamps = [{'timestamp': now_ms - 10000, 'cost': 50}, {'timestamp': now_ms - 5000, 'cost': 30}, {'timestamp': now_ms - 1000, 'cost': 20}]
    throttler.sync_used_weight(150)
    total = sum(t['cost'] for t in throttler.timestamps)
    assert abs(total - 150) < 1, 'under-tracked correction failed, got ' + str(total)
    print('  1. under-tracked correction: passed')

    # Test 2: Over-tracked
    throttler.timestamps = [{'timestamp': now_ms - 10000, 'cost': 50}, {'timestamp': now_ms - 5000, 'cost': 30}, {'timestamp': now_ms - 1000, 'cost': 20}]
    throttler.sync_used_weight(60)
    total = sum(t['cost'] for t in throttler.timestamps)
    assert abs(total - 60) < 1, 'over-tracked correction failed, got ' + str(total)
    print('  2. over-tracked correction: passed')

    # Test 3: Zero reset
    throttler.timestamps = [{'timestamp': now_ms - 1000, 'cost': 50}]
    throttler.sync_used_weight(0)
    total = sum(t['cost'] for t in throttler.timestamps)
    assert total == 0, 'zero reset failed, got ' + str(total)
    print('  3. zero reset: passed')

    # Test 4: Within tolerance
    throttler.timestamps = [{'timestamp': now_ms - 1000, 'cost': 50}]
    length_before = len(throttler.timestamps)
    throttler.sync_used_weight(50)
    assert len(throttler.timestamps) == length_before, 'tolerance no-op failed'
    print('  4. within tolerance (no-op): passed')

    # Test 5: Leaky bucket no-op
    exchange5 = ccxt.binance({'enableRateLimit': True, 'rateLimiterAlgorithm': 'leakyBucket'})
    exchange5.throttler.timestamps = [{'timestamp': now_ms, 'cost': 100}]
    exchange5.throttler.sync_used_weight(200)
    assert exchange5.throttler.timestamps[0]['cost'] == 100, 'leaky bucket should not modify'
    print('  5. leaky bucket no-op: passed')

    # Test 6: Expired entries pruned
    throttler.timestamps = [{'timestamp': now_ms - 120000, 'cost': 999}, {'timestamp': now_ms - 1000, 'cost': 20}]
    throttler.sync_used_weight(20)
    total = sum(t['cost'] for t in throttler.timestamps)
    assert abs(total - 20) < 1, 'expired entry pruning failed'
    print('  6. expired entry pruning: passed')

    # Test 7: Rate limit hit
    throttler.timestamps = [{'timestamp': now_ms - 1000, 'cost': 100}]
    throttler.sync_used_weight(1200)
    total = sum(t['cost'] for t in throttler.timestamps)
    assert abs(total - 1200) < 1, 'rate limit hit failed, got ' + str(total)
    print('  7. rate limit hit (maxWeight): passed')

    # Test 8: Custom windowSize
    throttler.timestamps = [{'timestamp': now_ms - 5000, 'cost': 50}]
    throttler.sync_used_weight(10, 1000)
    total = sum(t['cost'] for t in throttler.timestamps)
    assert abs(total - 10) < 1, 'custom windowSize failed'
    print('  8. custom windowSize: passed')

    print('--- all syncUsedWeight tests passed ---')
    await exchange4.close()
    await exchange5.close()

def test_throttler_performance():
    try:
        # Check if there's already a running event loop
        loop = asyncio.get_running_loop()
        # If we get here, there's already a loop running
        # Create a task and run it (this will be awaited by the caller)
        import concurrent.futures
        # Can't use asyncio.run() in a running loop, so we need to run in thread pool
        with concurrent.futures.ThreadPoolExecutor() as pool:
            future = pool.submit(asyncio.run, test_throttler())
            future.result()
    except RuntimeError:
        # No event loop is running, safe to use asyncio.run()
        asyncio.run(test_throttler())
