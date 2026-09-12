"""Opt-in, public-only Kraken shadow test; default execution is offline.

Run: python build/tests/arrayCacheShadow.py --live --seconds 180
One connection feeds identical frames to current and pre-performance handlers.
The shadow never opens a connection. No keys or private endpoints are loaded.
"""
import argparse
import asyncio
import copy
import json
import math
from pathlib import Path
import subprocess
import sys
import types

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / 'python'))
import ccxt.pro  # noqa: E402

BASELINE = '63951db9f44dcf425c81785d65867dbb1ac6abf1'


def baseline_exchange():
    def load(path, name):
        source = subprocess.check_output(['git', 'show', BASELINE + ':' + path], cwd=ROOT, text=True)
        module = types.ModuleType(name)
        exec(compile(source, path, 'exec'), module.__dict__)
        return module
    caches = load('python/ccxt/async_support/base/ws/cache.py', 'baseline_cache')
    exchange = load('python/ccxt/pro/kraken.py', 'baseline_kraken')
    for name in ('ArrayCache', 'ArrayCacheByTimestamp', 'ArrayCacheBySymbolById'):
        setattr(exchange, name, getattr(caches, name))
    return exchange.kraken


class OfflineClient:
    def __init__(self):
        self.subscriptions = {}

    def resolve(self, value, message_hash):
        pass

    def reject(self, error, message_hash):
        raise error


def validate_book(book):
    assert book['symbol'] == 'BTC/USD'
    for side, reverse in (('bids', True), ('asks', False)):
        rows = book[side]
        assert rows and len(rows) <= 10
        prices = [row[0] for row in rows]
        assert prices == sorted(set(prices), reverse=reverse)
        assert all(math.isfinite(row[0]) and math.isfinite(row[1]) and row[0] > 0 and row[1] > 0 for row in rows)
    assert book['bids'][0][0] <= book['asks'][0][0]


class Mirror:
    def __init__(self, current, old):
        self.current, self.old = current, old
        self.client = OfflineClient()
        self.failure = None
        self.counts = {'book_frames': 0, 'trade_frames': 0, 'ohlcv_frames': 0, 'polls': 0, 'large_slices': 0}
        self.bound = set()
        for method in ('handle_order_book', 'handle_trades', 'handle_ohlcv'):
            self.install(method)

    def check_cache(self, current, old):
        assert list(current) == list(old), 'cache rows diverged'
        assert {k: v for k, v in vars(current).items() if k != 'getLimit'} == vars(old), 'cache bookkeeping diverged'
        for selection in (slice(None), slice(None, None, -1), slice(-65, None), slice(None, 65), slice(1, None, 2)):
            assert current[selection] == old[selection], 'cache slices diverged'
        if len(current) > 64:
            self.counts['large_slices'] += 1
        if id(current) not in self.bound:
            original_poll = current.getLimit

            def poll(symbol, limit):
                actual = original_poll(symbol, limit)
                expected = old.getLimit(symbol, limit)
                assert actual == expected, 'newUpdates limits diverged'
                self.counts['polls'] += 1
                return actual

            current.getLimit = poll
            self.bound.add(id(current))

    def install(self, method):
        current_handler = getattr(self.current, method)
        old_handler = getattr(self.old, method)

        def handle(client, message):
            try:
                if self.failure:
                    return
                original = copy.deepcopy(message)
                self.client.subscriptions = copy.deepcopy(client.subscriptions)
                result = current_handler(client, message)
                old_handler(self.client, original)
                symbol = original['data'][0]['symbol']
                if method == 'handle_order_book':
                    actual, expected = self.current.orderbooks[symbol], self.old.orderbooks[symbol]
                    assert dict(actual) == dict(expected), 'order book replay diverged'
                    validate_book(actual)
                    self.counts['book_frames'] += 1
                elif method == 'handle_trades':
                    self.check_cache(self.current.trades[symbol], self.old.trades[symbol])
                    self.counts['trade_frames'] += 1
                else:
                    for timeframe, cache in self.current.ohlcvs[symbol].items():
                        self.check_cache(cache, self.old.ohlcvs[symbol][timeframe])
                    self.counts['ohlcv_frames'] += 1
                return result
            except Exception as error:
                self.failure = error
                raise

        setattr(self.current, method, handle)


async def live(seconds, new_updates):
    config = {'newUpdates': new_updates, 'options': {'tradesLimit': 128, 'OHLCVLimit': 128}}
    current, old = ccxt.pro.kraken(config), baseline_exchange()(config)
    tasks = []
    try:
        await asyncio.wait_for(current.load_markets(), 40)
        old.set_markets_from_exchange(current)
        old.options = copy.deepcopy(current.options)
        mirror = Mirror(current, old)
        counts = {'watchOrderBook': 0, 'watchTrades': 0, 'watchOHLCV': 0}

        async def consume(name, watch):
            while True:
                result = await asyncio.wait_for(watch(), 35)
                if mirror.failure:
                    raise mirror.failure
                assert result, name + ' returned empty data'
                if name == 'watchOrderBook':
                    validate_book(result)
                elif name == 'watchTrades':
                    assert all(row['symbol'] == 'BTC/USD' and row['price'] > 0 and row['amount'] > 0 for row in result)
                else:
                    assert all(len(row) == 6 and row[2] >= max(row[1], row[4]) and row[3] <= min(row[1], row[4]) for row in result)
                counts[name] += 1

        tasks = [
            asyncio.create_task(consume('watchOrderBook', lambda: current.watch_order_book('BTC/USD', 10))),
            asyncio.create_task(consume('watchTrades', lambda: current.watch_trades('BTC/USD'))),
            asyncio.create_task(consume('watchOHLCV', lambda: current.watch_ohlcv('BTC/USD', '1m'))),
        ]
        finished, _ = await asyncio.wait(tasks, timeout=seconds, return_when=asyncio.FIRST_COMPLETED)
        for task in finished:
            task.result()
        if mirror.failure:
            raise mirror.failure
        summary = {'exchange': 'kraken', 'symbol': 'BTC/USD', 'newUpdates': new_updates, 'seconds': seconds,
                   'baseline': BASELINE, **counts, **mirror.counts}
        print(json.dumps(summary), flush=True)
        assert all(value >= 2 for value in counts.values()), 'need repeated live updates for every watch method'
        assert mirror.counts['large_slices'] > 0, 'live stream did not exercise the optimized >64-row slice path'
        if new_updates:
            assert mirror.counts['polls'] > 0
        print(json.dumps({**summary, 'result': 'PASS'}), flush=True)
    finally:
        for task in tasks:
            task.cancel()
        await asyncio.gather(*tasks, return_exceptions=True)
        await current.close()
        await old.close()


async def offline():
    config = {'options': {'tradesLimit': 128}}
    current, old = ccxt.pro.kraken(config), baseline_exchange()(config)
    try:
        market = {'id': 'XXBTZUSD', 'symbol': 'BTC/USD', 'base': 'BTC', 'quote': 'USD', 'baseId': 'XXBT', 'quoteId': 'ZUSD',
                  'type': 'spot', 'spot': True, 'swap': False, 'future': False, 'option': False, 'contract': False,
                  'precision': {'amount': 0.00000001, 'price': 0.1}, 'limits': {}, 'info': {}}
        current.set_markets([market])
        old.set_markets_from_exchange(current)
        mirror = Mirror(current, old)
        client = OfflineClient()
        snapshot = {'channel': 'book', 'type': 'snapshot', 'data': [{'symbol': 'BTC/USD',
                    'bids': [{'price': 100, 'qty': 2}], 'asks': [{'price': 101, 'qty': 3}]}]}
        current.handle_order_book(client, snapshot)
        for index in range(150):
            current.handle_trades(client, {'channel': 'trade', 'type': 'update', 'data': [{'symbol': 'BTC/USD',
                'side': 'buy', 'price': 100, 'qty': 1, 'ord_type': 'market', 'trade_id': index,
                'timestamp': '2026-09-08T00:00:00.000000Z'}]})
            if index % 7 == 0:
                current.trades['BTC/USD'].getLimit(None, 65)
        assert not mirror.failure
        assert mirror.counts['large_slices'] > 0
        # Prove the comparator fails closed when one side is deliberately wrong.
        old.trades['BTC/USD']._deque[0]['price'] = -1
        try:
            mirror.check_cache(current.trades['BTC/USD'], old.trades['BTC/USD'])
        except AssertionError:
            pass
        else:
            raise AssertionError('shadow comparator failed to detect a deliberately corrupted row')
        print('Offline shadow-harness replay and mismatch-detection tests passed', flush=True)
    finally:
        await current.close()
        await old.close()


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--live', action='store_true')
    parser.add_argument('--seconds', type=int, default=180)
    args = parser.parse_args()
    asyncio.run(offline())
    if args.live:
        for mode in (True, False):
            asyncio.run(live(args.seconds, mode))
