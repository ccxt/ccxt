# CCXT cross-language benchmark

A like-for-like benchmark of CCXT's REST and WebSocket paths across languages. Same exchange,
same endpoints, same workload, same metrics — so the only variable is the language runtime and
CCXT's per-language base implementation.

Blog write-up with results and charts:
**"Is CCXT slower in your language? We benchmarked four of them."**

## What it measures

Two workloads against a real exchange (default: Coinbase, `BTC/USD`):

| Mode | Method | Captures |
|---|---|---|
| `rest` | `fetchOrderBook` × N (default 60, with a pause between calls) | per-call latency **split into network vs. processing**, CPU per call, peak RSS, bytes per response |
| `ws` | `watchOrderBook` until N updates (default 200) | snapshot build time, steady-state gap, updates/s, CPU per update, peak RSS |
| `load` | `parseJson` + `parseOrderBook` in a tight offline loop | **compute-bound** CPU throughput (ops/s), CPU per op, peak RSS, and memory per retained parsed book — no network, so it isolates the language's raw parse speed and memory |

All metrics are collected **in-process** so they are identical across languages:

- **REST latency** — wall clock around `fetchOrderBook`, the same definition in every language.
  An earlier version split that into "network" and "processing" by instrumenting `fetch()` and
  `parseJson()`; the control in [`net-baseline/`](net-baseline/) showed those spans do not cover
  the same work across six independent implementations, so the split is not reported. Raw
  per-call samples are emitted as `latencySamplesMs` so any percentile can be recomputed.
- **CPU** — `getrusage` user/system counters (`process.cpuUsage` on Node); network wait is
  excluded, so this is total compute (including the HTTP/TLS stack) per call/update.
- **Peak memory** — `VmHWM` from `/proc/self/status` (OS-level peak RSS).
- **Bandwidth** — `exchange.last_http_response` byte length (REST only; identical across
  languages by construction).
- **Percentiles** — latency is reported as p50/p90/p95/p99, plus every raw sample.

Every script prints one machine-readable line: `##RESULT## {…json…}`.

## Files

| File | Language |
|---|---|
| `bench.mjs` | JavaScript (Node) |
| `bench.py` | Python (asyncio) |
| `bench.php` | PHP (ReactPHP async) |
| [`go/`](go/) | Go — standalone module, `replace`s the checkout in `../../../go`: `go run . load` |
| [`cs/`](cs/) | C# — `dotnet run -c Release --project examples/benchmarks/cs load` |
| [`java/`](java/) | Java — standalone gradle build, composite-includes `../../../java`: `gradle run --args=load` |
| `run.mjs` | Orchestrator: runs every language × mode × N reps, aggregates the median, writes `results.json`, prints Markdown tables |
| `trace-explorer.html` | Self-contained interactive/animated span-waterfall (Jaeger-style) of one `fetchOrderBook` call per language — open it in a browser; data mirrors `results.json` |

## Running

```bash
# one language, one mode
node   examples/benchmarks/bench.mjs rest
python examples/benchmarks/bench.py  ws
php    examples/benchmarks/bench.php rest
go run -C go ./benchmark ws

# everything, aggregated
node examples/benchmarks/run.mjs
```

### Configuration (environment variables)

| Var | Default | Meaning |
|---|---|---|
| `BENCH_EXCHANGE` | `coinbase` | any CCXT exchange id |
| `BENCH_SYMBOL` | `BTC/USD` | unified symbol |
| `BENCH_REST_ITERS` | `60` | REST calls per run |
| `BENCH_WS_UPDATES` | `200` | WS updates per run |
| `BENCH_SLEEP_MS` | `250` | pause between REST calls |
| `BENCH_LOAD_SECONDS` | `8` | duration of the `load` parse loop |
| `BENCH_LOAD_LEVELS` | `1000` | order-book depth (bids + asks) for `load` |
| `BENCH_LOAD_RETAIN` | `2000` | parsed books held to measure memory/book |
| `BENCH_ORJSON` | *(unset)* | Python `load` only: override `on_json_response` with `orjson.loads` to compare a faster JSON parser (needs `pip install orjson`) |

The runner (`run.mjs`) also reads:

| Var | Default | Meaning |
|---|---|---|
| `BENCH_PY` | `python3` | python interpreter with CCXT deps installed |
| `BENCH_GO` | *(uses `go run`)* | path to a prebuilt Go benchmark binary |
| `BENCH_LANGS` | `js,python,php,go` | subset of languages |
| `BENCH_MODES` | `rest,ws,load` | subset of modes |
| `REPS_REST` / `REPS_WS` | `3` / `2` | repetitions per mode |

## Notes

- Absolute latencies depend on your machine and network location — read the results as
  *relative* comparisons between languages, not as production latency.
- The Go build does not currently populate `Last_http_response`, so Go's REST `bytesTotal`
  reads 0; the wire payload is identical to the other languages (same request/response).
- C# and Java use the same unified methods and can be added with the same harness.
