# hand-written throughput test for the websocket watch methods (python-only)
#
# simulates a stream that produces 100 messages per second through the same
# mocked transport the static ws tests use (frames go through the real
# handle_message path) and checks that watch_trades / watch_ticker /
# watch_order_book keep up with the stream without losing updates
#
# usage: python3 python/ccxt/test/test_ws_throughput.py

import asyncio
import json
import os
import sys
import time

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from tests_helpers import (  # noqa: E402
    inject_ws_message,
    set_fetch_response,
    setup_ws_mock_transport,
)
from tests_async import testMainClass  # noqa: E402

# messages per second, override with WS_THROUGHPUT_RATE=<n> (an env var
# because the imported test harness argparses sys.argv on import)
RATE = int(os.environ.get('WS_THROUGHPUT_RATE', '100'))
DURATION = 3  # seconds per scenario
TOTAL = RATE * DURATION
SCENARIO_TIMEOUT = 30  # hard cap per scenario so a regression fails instead of hanging

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..')) + os.sep
FIXTURE_PATH = ROOT_DIR + 'ts/src/test/static/ws/binance.json'


def load_fixture_entry(method, description_contains):
    with open(FIXTURE_PATH, encoding='utf-8') as f:
        fixture = json.load(f)
    for entry in fixture['methods'][method]:
        if description_contains in entry['description']:
            return entry
    raise RuntimeError('no ' + method + ' fixture entry matching "' + description_contains + '"')


def init_exchange():
    harness = testMainClass()
    exchange = harness.init_offline_exchange('binance', True)
    return exchange


async def paced_producer(exchange, url, frames, rate):
    # injects one frame every 1/rate seconds, scheduled against the wall
    # clock so pacing error does not accumulate
    start = time.monotonic()
    for i in range(len(frames)):
        target = start + (i / rate)
        delay = target - time.monotonic()
        if delay > 0:
            await asyncio.sleep(delay)
        else:
            await asyncio.sleep(0)  # yield so the consumer can drain
        inject_ws_message(exchange, url, frames[i])
    return time.monotonic() - start


async def run_watch_trades():
    entry = load_fixture_entry('watchTrades', 'linear swap trades')
    url = entry['url']
    symbol = entry['input'][0]
    template = next(m for m in entry['messages'] if m.get('e') == 'trade')
    frames = []
    base_id = template['t']
    for i in range(TOTAL):
        frame = dict(template)
        frame['t'] = base_id + 1 + i
        frame['E'] = template['E'] + i * 10
        frame['T'] = template['T'] + i * 10
        frames.append(frame)
    exchange = init_exchange()
    setup_ws_mock_transport(exchange, url)

    async def consume():
        seen = set()
        while len(seen) < TOTAL:
            trades = await exchange.watch_trades(symbol)
            for trade in trades:
                seen.add(trade['id'])
        return seen

    started = time.monotonic()
    consumer = asyncio.ensure_future(consume())
    await asyncio.sleep(0)  # let the first watch call register its future
    elapsed_producer = await paced_producer(exchange, url, frames, RATE)
    seen = await asyncio.wait_for(consumer, timeout=SCENARIO_TIMEOUT)
    elapsed = time.monotonic() - started
    await exchange.close()
    assert len(seen) == TOTAL, f'watch_trades lost updates: {len(seen)}/{TOTAL}'
    assert elapsed < DURATION * 1.25, f'watch_trades fell behind the stream: {elapsed:.2f}s for {DURATION}s of data'
    print(f'watch_trades      kept up: {TOTAL} unique trades in {elapsed:.2f}s '
          f'({TOTAL / elapsed:.0f} msg/s consumed, producer paced at {TOTAL / elapsed_producer:.0f} msg/s)')


async def run_watch_ticker():
    entry = load_fixture_entry('watchTicker', 'linear swap ticker')
    url = entry['url']
    symbol = entry['input'][0]
    template = next(m for m in entry['messages'] if 'e' in m)
    frames = []
    for i in range(TOTAL):
        frame = dict(template)
        frame['E'] = template['E'] + i * 10
        frame['c'] = str(60000 + i)
        frames.append(frame)
    exchange = init_exchange()
    setup_ws_mock_transport(exchange, url)
    resolutions = 0
    last_close = None

    async def consume():
        nonlocal resolutions, last_close
        while last_close != str(60000 + TOTAL - 1):
            ticker = await exchange.watch_ticker(symbol)
            resolutions += 1
            last_close = ticker['info']['c']

    started = time.monotonic()
    consumer = asyncio.ensure_future(consume())
    await asyncio.sleep(0)
    await paced_producer(exchange, url, frames, RATE)
    await asyncio.wait_for(consumer, timeout=SCENARIO_TIMEOUT)
    elapsed = time.monotonic() - started
    await exchange.close()
    assert last_close == str(60000 + TOTAL - 1), f'watch_ticker missed the last update: {last_close}'
    assert elapsed < DURATION * 1.25, f'watch_ticker fell behind the stream: {elapsed:.2f}s for {DURATION}s of data'
    print(f'watch_ticker      kept up: latest of {TOTAL} updates observed after {resolutions} resolutions '
          f'in {elapsed:.2f}s')


async def run_watch_order_book():
    entry = load_fixture_entry('watchOrderBook', 'linear swap orderbook')
    url = entry['url']
    symbol = entry['input'][0]
    template = next(m for m in entry['messages'] if m.get('e') == 'depthUpdate')
    subscription_ack = next(m for m in entry['messages'] if 'e' not in m)
    snapshot = entry['httpResponse']
    last_update_id = snapshot['lastUpdateId']
    # the ack triggers the snapshot fetch that seeds the book - without it the
    # depth frames are buffered forever
    frames = [subscription_ack]
    previous_u = None
    for i in range(TOTAL):
        frame = dict(template)
        update_base = last_update_id + 1 + (i * 10)
        frame['U'] = update_base
        frame['u'] = update_base + 9
        # binance futures continuity: pu must chain to the previous frame's u,
        # and the first frame must straddle the rest snapshot's lastUpdateId
        frame['pu'] = previous_u if (previous_u is not None) else last_update_id
        frame['E'] = template['E'] + i * 10
        frame['T'] = template['T'] + i * 10
        frame['b'] = [['60000', str(1 + (i % 5))]]
        frame['a'] = [['60001', str(1 + (i % 5))]]
        previous_u = frame['u']
        frames.append(frame)
    exchange = init_exchange()
    setup_ws_mock_transport(exchange, url)
    set_fetch_response(exchange, snapshot)
    resolutions = 0
    final_nonce = None

    async def consume():
        nonlocal resolutions, final_nonce
        while final_nonce != previous_u:
            orderbook = await exchange.watch_order_book(symbol)
            resolutions += 1
            final_nonce = orderbook['nonce']

    started = time.monotonic()
    consumer = asyncio.ensure_future(consume())
    await asyncio.sleep(0)
    await paced_producer(exchange, url, frames, RATE)
    await asyncio.wait_for(consumer, timeout=SCENARIO_TIMEOUT)
    elapsed = time.monotonic() - started
    await exchange.close()
    assert final_nonce == previous_u, f'watch_order_book did not apply every delta: nonce {final_nonce} != {previous_u}'
    assert elapsed < DURATION * 1.25, f'watch_order_book fell behind the stream: {elapsed:.2f}s for {DURATION}s of data'
    print(f'watch_order_book  kept up: {TOTAL} deltas applied (final nonce {final_nonce}) after {resolutions} '
          f'resolutions in {elapsed:.2f}s')


async def run_burst_benchmark():
    # not paced: measures the raw handler throughput so a slowdown shows up
    # as a number even while the paced assertions still pass
    burst_total = 1000
    entry = load_fixture_entry('watchTrades', 'linear swap trades')
    url = entry['url']
    symbol = entry['input'][0]
    template = next(m for m in entry['messages'] if m.get('e') == 'trade')
    exchange = init_exchange()
    setup_ws_mock_transport(exchange, url)
    exchange.options['tradesLimit'] = burst_total  # keep every trade in the cache
    watch_future = asyncio.ensure_future(exchange.watch_trades(symbol))
    await asyncio.sleep(0)
    started = time.monotonic()
    for i in range(burst_total):
        frame = dict(template)
        frame['t'] = template['t'] + 1 + i
        inject_ws_message(exchange, url, frame)
    elapsed = time.monotonic() - started
    await asyncio.wait_for(watch_future, timeout=SCENARIO_TIMEOUT)
    trades = exchange.trades[symbol]
    await exchange.close()
    rate = burst_total / elapsed
    assert len(trades) == burst_total, f'burst lost trades: {len(trades)}/{burst_total}'
    assert rate > RATE * 5, f'handler throughput too low: {rate:.0f} msg/s'
    print(f'burst benchmark   handled {burst_total} trade frames in {elapsed * 1000:.0f}ms ({rate:.0f} msg/s)')


async def main():
    print(f'simulating a {RATE} msg/s stream for {DURATION}s per watch method (mocked transport, '
          'real handle_message path)')
    await run_watch_trades()
    await run_watch_ticker()
    await run_watch_order_book()
    await run_burst_benchmark()
    print(f'[TEST_SUCCESS] all watch methods handled the {RATE} msg/s stream')


if __name__ == '__main__':
    asyncio.run(main())
