# CCXT cross-language benchmark — Python (asyncio)
#
# Mirrors bench.mjs: same workload, same metrics, same ##RESULT## output.
#   latency / network-vs-processing trace / CPU (getrusage) /
#   peak RSS (/proc/self/status VmHWM) / bandwidth
#
# The REST path wraps the base `fetch` and `parse_json` methods to split each
# call's wall time into time on the wire and time on the CPU:
#   network    = time inside fetch()  -  time inside JSON decode
#   processing = total fetch_order_book  -  network
#
# Usage:  python bench.py rest   |   python bench.py ws

import os
import sys
import json
import time
import asyncio
import resource

sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', '..', 'python'))
import ccxt  # noqa: E402
import ccxt.async_support as ccxta  # noqa: E402
import ccxt.pro as ccxtpro  # noqa: E402

EXCHANGE = os.environ.get('BENCH_EXCHANGE', 'coinbase')
SYMBOL = os.environ.get('BENCH_SYMBOL', 'BTC/USD')
REST_ITERS = int(os.environ.get('BENCH_REST_ITERS', '60'))
WARMUP = int(os.environ.get('BENCH_REST_WARMUP', '5'))
WS_UPDATES = int(os.environ.get('BENCH_WS_UPDATES', '200'))
SLEEP_MS = int(os.environ.get('BENCH_SLEEP_MS', '250'))
LOAD_SECONDS = int(os.environ.get('BENCH_LOAD_SECONDS', '8'))
LOAD_LEVELS = int(os.environ.get('BENCH_LOAD_LEVELS', '1000'))
LOAD_RETAIN = int(os.environ.get('BENCH_LOAD_RETAIN', '2000'))


def now_ms():
    return time.perf_counter() * 1000.0


def status_kb(field):
    try:
        with open('/proc/self/status') as f:
            for line in f:
                if line.startswith(field + ':'):
                    return int(line.split()[1])
    except Exception:
        pass
    return 0


def peak_rss_kb():
    return status_kb('VmHWM')


def current_rss_kb():
    return status_kb('VmRSS')


def build_raw_book(levels):
    bids = [[1000000 - i, 500 + i] for i in range(levels)]
    asks = [[1000000 + i, 500 + i] for i in range(levels)]
    return json.dumps({'bids': bids, 'asks': asks, 'timestamp': 1700000000000})


def stats(arr):
    if not arr:
        return {'min': 0, 'p50': 0, 'p90': 0, 'p95': 0, 'p99': 0, 'max': 0, 'avg': 0}
    s = sorted(arr)
    n = len(s)

    def q(p):
        return s[min(n - 1, int(p * n))]
    return {
        'min': round(s[0], 2),
        'p50': round(q(0.5), 2),
        'p90': round(q(0.9), 2),
        'p95': round(q(0.95), 2),
        'p99': round(q(0.99), 2),
        'max': round(s[-1], 2),
        'avg': round(sum(s) / n, 2),
    }


def emit(obj):
    print('##RESULT## ' + json.dumps(obj))


def traced_exchange(base_cls, config):
    # subclass the exchange and instrument the two base methods every request
    # goes through: fetch() (the whole HTTP layer) and parse_json() (JSON decode)
    class Traced(base_cls):
        async def fetch(self, url, method='GET', headers=None, body=None):
            self._json_ms = 0.0
            t0 = now_ms()
            r = await super().fetch(url, method, headers, body)
            self._http_ms = now_ms() - t0
            return r

        def parse_json(self, http_response):
            t0 = now_ms()
            r = super().parse_json(http_response)
            self._json_ms += now_ms() - t0
            return r
    return Traced(config)


async def bench_rest():
    ex = traced_exchange(getattr(ccxta, EXCHANGE), {'enableRateLimit': False})
    w0 = now_ms()
    await ex.load_markets()
    load_markets_ms = now_ms() - w0
    # warmup: prime the TCP/TLS connection and let tiered JITs settle before we measure
    for _ in range(WARMUP):
        await ex.fetch_order_book(SYMBOL)
    r0 = resource.getrusage(resource.RUSAGE_SELF)
    latency = []
    network = []
    processing = []
    json_decode = []
    total_bytes = 0
    for _ in range(REST_ITERS):
        t0 = now_ms()
        await ex.fetch_order_book(SYMBOL)
        total = now_ms() - t0
        wire = ex._http_ms - ex._json_ms
        latency.append(total)
        network.append(wire)
        processing.append(total - wire)
        json_decode.append(ex._json_ms)
        total_bytes += len(ex.last_http_response or '')
        await asyncio.sleep(SLEEP_MS / 1000.0)
    r1 = resource.getrusage(resource.RUSAGE_SELF)
    await ex.close()
    emit({
        'language': 'Python',
        'runtime': sys.version.split()[0],
        'ccxt': ccxt.__version__,
        'mode': 'rest',
        'exchange': EXCHANGE,
        'symbol': SYMBOL,
        'iterations': REST_ITERS,
        'loadMarketsMs': round(load_markets_ms, 2),
        'latencyMs': stats(latency),
        'networkMs': stats(network),
        'processingMs': stats(processing),
        'jsonDecodeMs': stats(json_decode),
        'cpuUserSec': round(r1.ru_utime - r0.ru_utime, 3),
        'cpuSystemSec': round(r1.ru_stime - r0.ru_stime, 3),
        'peakRssMb': round(peak_rss_kb() / 1024.0, 1),
        'bytesTotal': total_bytes,
        'bytesPerCall': round(total_bytes / REST_ITERS),
    })


async def bench_ws():
    ex = getattr(ccxtpro, EXCHANGE)({})
    await ex.load_markets()
    # the first update builds the full snapshot (a large one-time cost); measure it
    # separately and start the CPU/steady-state counters only AFTER it
    s0 = now_ms()
    await ex.watch_order_book(SYMBOL)
    first_ms = now_ms() - s0
    steady = WS_UPDATES - 1
    r0 = resource.getrusage(resource.RUSAGE_SELF)
    t0 = now_ms()
    last = t0
    gaps = []
    for _ in range(steady):
        await ex.watch_order_book(SYMBOL)
        t = now_ms()
        gaps.append(t - last)
        last = t
    steady_ms = now_ms() - t0
    r1 = resource.getrusage(resource.RUSAGE_SELF)
    await ex.close()
    cpu_user = r1.ru_utime - r0.ru_utime
    emit({
        'language': 'Python',
        'runtime': sys.version.split()[0],
        'ccxt': ccxt.__version__,
        'mode': 'ws',
        'exchange': EXCHANGE,
        'symbol': SYMBOL,
        'updates': steady,
        'firstUpdateMs': round(first_ms, 2),
        'gapMs': stats(gaps),
        'updatesPerSec': round(steady / (steady_ms / 1000.0), 2),
        'cpuPerUpdateMs': round(cpu_user * 1000.0 / steady, 3),
        'cpuUserSec': round(cpu_user, 3),
        'cpuSystemSec': round(r1.ru_stime - r0.ru_stime, 3),
        'peakRssMb': round(peak_rss_kb() / 1024.0, 1),
    })


def bench_load():
    base = getattr(ccxt, EXCHANGE)
    label = 'Python'
    if os.environ.get('BENCH_ORJSON'):
        import orjson
        # CCXT decodes JSON via `on_json_response = staticmethod(json.loads)`;
        # swap in orjson.loads to measure whether a faster C parser helps.
        class OrjsonExchange(base):
            def on_json_response(self, http_response):
                return orjson.loads(http_response)
        ex = OrjsonExchange({})
        label = 'Python (orjson)'
    else:
        ex = base({})
    raw = build_raw_book(LOAD_LEVELS)
    for _ in range(200):
        ex.parse_order_book(ex.parse_json(raw), SYMBOL)
    # Part A — CPU throughput, time-boxed
    r0 = resource.getrusage(resource.RUSAGE_SELF)
    t0 = now_ms()
    deadline = t0 + LOAD_SECONDS * 1000
    ops = 0
    sink = 0
    while now_ms() < deadline:
        ob = ex.parse_order_book(ex.parse_json(raw), SYMBOL)
        sink += len(ob['bids'])
        ops += 1
    wall_a = now_ms() - t0
    r1 = resource.getrusage(resource.RUSAGE_SELF)
    cpu = (r1.ru_utime - r0.ru_utime) + (r1.ru_stime - r0.ru_stime)
    # Part B — memory footprint of retained structures
    rss_before = current_rss_kb()
    kept = []
    for _ in range(LOAD_RETAIN):
        kept.append(ex.parse_order_book(ex.parse_json(raw), SYMBOL))
    rss_after = current_rss_kb()
    per_book_kb = round((rss_after - rss_before) / LOAD_RETAIN, 2)
    emit({
        'language': label,
        'runtime': sys.version.split()[0],
        'ccxt': ccxt.__version__,
        'mode': 'load',
        'levels': LOAD_LEVELS,
        'seconds': LOAD_SECONDS,
        'ops': ops,
        'opsPerSec': round(ops / (wall_a / 1000.0), 1),
        'cpuUserSec': round(r1.ru_utime - r0.ru_utime, 3),
        'cpuSystemSec': round(r1.ru_stime - r0.ru_stime, 3),
        'cpuPerOpUs': round(cpu * 1e6 / ops, 2),
        'peakRssMb': round(peak_rss_kb() / 1024.0, 1),
        'retainBooks': LOAD_RETAIN,
        'perBookKb': per_book_kb,
        'keptLen': len(kept) + (0 if sink > -1 else 1),
    })


mode = sys.argv[1] if len(sys.argv) > 1 else 'rest'
if mode == 'load':
    bench_load()
else:
    asyncio.run(bench_rest() if mode == 'rest' else bench_ws())
