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
    })

    try:
        rolling_window_time = await test_throttler_performance_helper(exchange1, 100)
    finally:
        await exchange1.close()

    exchange2 = ccxt.binance({
        'enableRateLimit': True,
        'rollingWindowSize': 0.0,
    })

    try:
        leaky_bucket_time = await test_throttler_performance_helper(exchange2, 20)
    finally:
        await exchange2.close()

    rolling_window_time_string = str(round(rolling_window_time, 2))
    leaky_bucket_time_string = str(round(leaky_bucket_time, 2))

    assert rolling_window_time <= 1000, 'Rolling window throttler happen immediately, time was: ' + rolling_window_time_string
    assert leaky_bucket_time >= 500, 'Leaky bucket throttler should take at least half a second for 20 requests, time was: ' + leaky_bucket_time_string

    print('┌─────────────────┬──────────────┬─────────────────┐')
    print('│ Algorithm       │ Time (ms)    │ Expected (ms)   │')
    print('├─────────────────┼──────────────┼─────────────────┤')
    print('│ Rolling Window  │ ' + rolling_window_time_string.rjust(11) + '  │ ~3              │')
    print('│ Leaky Bucket    │ ' + leaky_bucket_time_string.rjust(11) + '  │ ~950            │')
    print('└─────────────────┴──────────────┴─────────────────┘')

def test_throttler_performance():
    asyncio.run(test_throttler())
