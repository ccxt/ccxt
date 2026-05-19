import os
import sys
import asyncio

root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
sys.path.append(root)

import ccxt.async_support as ccxt  # noqa: F402


def test_config_update():
    exchange = ccxt.Exchange({'id': 'test', 'rateLimit': 100})
    assert exchange.rateLimit == 100

    exchange.set_rate_limit(50)

    assert exchange.rateLimit == 50
    assert exchange.throttler.config['rateLimit'] == 50
    assert exchange.throttler.config['refillRate'] == 1 / 50


def test_throttler_not_replaced():
    exchange = ccxt.Exchange({'id': 'test', 'rateLimit': 1000})
    original_throttler = exchange.throttler

    exchange.set_rate_limit(100)

    assert exchange.throttler is original_throttler


async def _test_new_rate_applied():
    exchange = ccxt.Exchange({'id': 'test', 'rateLimit': 1})
    exchange.set_rate_limit(40)

    start = exchange.milliseconds()
    for _ in range(5):
        await exchange.throttle(1)
    elapsed = exchange.milliseconds() - start

    assert elapsed >= 100, 'expected throttling delay, got only ' + str(elapsed) + 'ms'
    assert elapsed < 800, 'throttling took too long: ' + str(elapsed) + 'ms'


async def _run_test_set_rate_limit():
    test_config_update()
    test_throttler_not_replaced()
    await _test_new_rate_applied()


def test_set_rate_limit():
    try:
        asyncio.get_running_loop()
        import concurrent.futures
        with concurrent.futures.ThreadPoolExecutor() as pool:
            future = pool.submit(asyncio.run, _run_test_set_rate_limit())
            future.result()
    except RuntimeError:
        asyncio.run(_run_test_set_rate_limit())


if __name__ == '__main__':
    test_set_rate_limit()
