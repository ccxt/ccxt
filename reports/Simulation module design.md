# CCXT simulation module — design draft

Status: investigation draft, not an agreed API. All names (`ccxt.sim`, `ccxt.data`, …) are illustrative.
Background research: [Trading simulation design research.md](./Trading%20simulation%20design%20research.md).

## 0. For decision-makers

**What we learned**
- **Nobody combines what ccxt could.** Freqtrade, Jesse, NautilusTrader and hftbacktest each have their own strategy API and cover a handful of venues. No tool offers one strategy file across live, paper and backtest on 100+ exchanges, in seven languages, with keys staying on the user's machine.
- **A Strategy class plus a live runner has no dependencies.** It can start now and ship first. Backtesting depends on data.
- **Order-book history can't be backfilled.** If it isn't recorded, it's gone. Candles and trades can mostly be fetched after the fact.
- **Storage is manageable (measured).** Candles and trades for every Binance spot and USD-M symbol take well under 1 TB a year. Full order books for every symbol bring it to roughly 7–10 TB a year (§5.4).
- **Serving data is the legal risk.** Binance and Coinbase terms forbid redistributing their market data; Coinbase also forbids derived works. That makes a ccxt data API a licensing question. Vendors such as [Tardis.dev](https://tardis.dev) sell exactly this data, and a user's own Tardis subscription can plug into the simulator (§6, §7).

**Decisions needed**
1. **Build `ccxt.Strategy` and a live runner now?** One strategy file, a runner with guardrails, saved state, a journal and reconnects. It can later run unchanged in paper and backtest mode. No dependencies.
2. **Start recording market data internally, via the order router?** For example, the top 20 pairs on the top 5 exchanges: roughly 1.5–3 TB a year per exchange. Legal should confirm internal storage is allowed.
3. **Backtesting: start with a generalized market simulator?** Market-wide candles and trades with configurable fees and slippage. It avoids per-exchange licensing, and venue-specific backtests follow later (§11.1).
4. **Data API: get legal review before committing.** Do it per exchange and per data type (candles and trades vs raw order books). Also decide whether to partner with a vendor such as Tardis.

## 1. Summary

- **Core:** an in-process simulated exchange (`ccxt.sim.<exchange>`) that implements the same unified methods as the real exchange class, driven by a **virtual clock and event queue** that the simulator owns.
- **One matching engine, three modes:** backtest, paper and live differ only in the data source and the clock. The matcher that decides fills is the same in backtest and paper.
- **Pluggable data sources:** the simulator doesn't care where history comes from — ccxt's own backfill, the user's ccxt.pro recordings, exchange bulk dumps, or vendor data such as a user's own **Tardis.dev** subscription.
- **Strategy and runner on top:** an optional, thin `ccxt.Strategy` contract plus a `ccxt.run()` runner. The runner executes one strategy unchanged in backtest, paper, sandbox and live, with guardrails, saved state and a journal. It supports a create → test → optimize → deploy → monitor → re-optimize loop that a developer or an AI agent can drive (see §10).
- **Everything runs on the user's side:** CCXT does not host runners or hold users' exchange or vendor keys. An optional *local* lockstep server (for notebooks or non-ccxt clients) is a thin façade over the same core. A public CCXT-hosted archive of raw exchange data is legally blocked without licences (see §7).

## 2. Backtest vs paper vs live

| | Backtest | Paper | Live |
|---|---|---|---|
| Market data | Historical, from a dataset | Live `watch*` / `fetch*` from the real exchange | Live |
| Clock | Virtual — jumps from event to event | Real wall clock | Real wall clock |
| Orders | Matched locally by the simulator | Matched locally by the **same** simulator | Sent to the exchange |
| Balances / positions | Simulated ledger | Simulated ledger | Real account |
| Speed | As fast as the CPU allows (months in minutes) | Real time only | Real time |
| Deterministic | Yes (same data + seed → same result) | No — the market is live | No |
| API keys needed | No | Only for private *market-data* endpoints, if any | Yes |
| Answers | "Would this have worked in the past?" Fast iteration, parameter sweeps, walk-forward | "Does it work *now*, with today's data, latency, disconnects and my infrastructure?" | Real money |

Why both are needed: backtests can overfit and can hide operational bugs (reconnects, rate limits, clock drift, data gaps). Paper trading catches those with zero risk but takes real time and can't be repeated. The usual path is **backtest → paper for a few weeks → live with small size**.

Not the same as `setSandboxMode()`: a testnet is the exchange's own separate venue with its own (often thin, unrealistic) order books. Paper mode matches against the **real** live book, locally. Testnets remain useful for checking that order requests are accepted — ccxt already covers that.

A useful fourth mode falls out of the design for free — **replay-paper**: run the paper-mode stack against a recorded live session (e.g. yesterday's ccxt.pro recording). Same code path as paper, but repeatable.

## 3. Architecture

```
            strategy code  (only uses the ccxt unified API)
                       │
      ┌────────────────┴──────────────────┐
      │  ccxt.sim.<exchange>  (Exchange subclass)          ← real markets / precision / limits / fees
      │   ├─ OrderMatcher   (bar | trades | L2 models)
      │   ├─ Ledger         (balances, positions, funding, liquidation)
      │   └─ market-data views  (fetchOHLCV, fetchOrderBook, watch* …)
      └────────────────┬──────────────────┘
                       │ events
             Clock + EventQueue   (VirtualClock in backtest, LiveClock in paper)
                       │
                 DataSource  (pluggable)
     ┌───────────┬─────┴───────┬──────────────┬─────────────┐
   ccxt store   ccxt.pro      exchange dumps   Tardis.dev    user files
   (REST        recordings    (Binance         (user's key)  (CSV/Parquet)
    backfill)   (raw frames)   data.vision)
```

- Pure logic (matcher, ledger, fee/funding/liquidation models, event queue, `ccxt.sim.<exchange>`) lives in `ts/src/` and transpiles to every language.
- Anything touching the async runtime (virtual `sleep`, resolving `watch*` futures, throttler timers) is a small hand-written layer per language, following the `OrderRouter.ts` precedent and its determinism rules.
- **Prerequisite:** a clock seam. Today `ts/src/base/functions/time.ts` hard-wires `Date.now`, and `throttle.ts` and `ws/Client.ts` read it directly. Workstream D0 (§11) routes all of them through an injectable `exchange.clock`; a live-only runner does not need it.

## 4. Clock and timing model

- The simulator owns a forward-only clock. Every unified call is an event with latency legs:
  - `createOrder` at time *t* reaches the matcher at *t + entry*, is matched against state at that instant, resolves at *t + entry + response*.
  - `fetch*` resolves after a REST round trip and returns only data with `exchangeTs ≤ now − feedLatency`.
  - `watch*` resolves on the next due event.
  - OHLCV candles become visible only after they **close** (ccxt rows are open-stamped).
- Rate limits run on the virtual clock through the existing throttler.
- Strategy compute time: charged as zero by default (deterministic), or measured and charged (opt-in).
- Scheduled and injected events share the queue: candle closes, funding, liquidation checks, disconnects, `ExchangeNotAvailable`, rate-limit storms.
- Control API: `advance(ms)`, `advanceTo(ts)`, `runUntil(predicate)`, `schedule(ts, event)`, `snapshot()` / `restore()`. "Rewind" = restore a snapshot and re-simulate; the clock never moves backwards.
- Latency defaults can be measured from the data itself when it carries both exchange and local-receive timestamps (ccxt.pro recordings and Tardis do).

## 5. Data layer

### 5.1 One interface, many sources

```ts
interface DataSource {
    capabilities (): { exchange: string, types: DataType[], from: number, to: number }   // what it can serve
    markets (at: number): Promise<Market[]>          // point-in-time market metadata, if known
    stream (req: StreamRequest): AsyncIterable<SimEvent>   // time-ordered events for the requested symbols/types
}
// SimEvent = { localTs, exchangeTs, kind: 'ohlcv' | 'trade' | 'book' | 'ticker' | 'funding' | 'mark' | 'raw' | 'disconnect', symbol, payload }
```

The simulator merges several sources by `localTs` (e.g. trades from Tardis + funding from ccxt REST + markets from ccxt snapshots).

### 5.2 Sources

| Source | Data it gives | How it's obtained | Notes |
|---|---|---|---|
| **ccxt REST backfill** (`ccxt.data.backfill`) | OHLCV, trades (where the exchange allows history), funding, mark/index OHLCV, OI | `fetchOHLCV` etc. with `paginate: true` | Free; depth of history varies per exchange; no order books |
| **ccxt.pro recorder** (`ccxt.data.record`) | Everything the user subscribes to, including full L2 | Raw WS frames + local receive time + connect/disconnect markers + periodic REST snapshots | Only forward from when you start recording; replays through each exchange's own `handleMessage` |
| **Exchange bulk dumps** | e.g. Binance: trades, aggTrades, klines, funding, mark/index klines, sampled depth | Importer for data.binance.vision | Free and checksummed; **no full L2 deltas** |
| **Tardis.dev** (user's own subscription) | Tick-level trades, full incremental L2, snapshots, derivative tickers (funding/mark/OI), liquidations, options | Three paths, see §6 | ~67 venues, years of history; paid |
| **Other vendors** (Databento, Crypto Lake, CoinAPI, Kaiko) | Varies: L2/L3, snapshots | Adapters over their files/APIs | Community adapters later |
| **User files** | Anything tabular | CSV / Parquet with a column mapping | For people with their own data lakes |

### 5.3 Local store

- Layout: `<root>/<exchange>/<marketType>/<dataType>/<marketId>/<YYYY-MM-DD>.parquet` (LEAN-style partitioning), plus raw-frame files for recordings.
- Every dataset has a manifest: sources, ranges, gaps found, and a content hash. A run's report records the hash, so results are reproducible.
- **Point-in-time `markets` snapshots** (precision, limits, fees, listing/delisting) stored daily. No surveyed crypto framework has this; it is a CCXT differentiator.
- Gaps are reported, never silently filled.

### 5.4 Storage sizing (measured on Binance, 2026-09-27)

**Method.** `research_notes/Trading simulation design research/measure-binance-data-volume.mjs` recorded raw public WebSocket frames for 10 minutes: each frame plus a local timestamp, which is exactly what a recorder would store. It ran on Binance spot and USD-M perpetuals, with one busy symbol (BTC/USDT) and several quieter ones picked by 24h trade-count rank. Sizes are gzip-9 of the raw frames, scaled to a day. Raw results are in `research_notes/…/measurements/`. For comparison, brotli came out about 5% smaller than gzip, and zstd at its default level 10–20% larger.

Caveats:
- 10 minutes is a small sample. The BTC spot window was about 2.3× busier than Binance's own 24h average for that symbol, so per-day BTC spot figures are roughly 2× high. The BTC perpetual's second run matched its 24h average (103%).
- A Sunday sample. Weekday and volatile-day traffic is higher.
- COIN-M futures and options were not measured.

**Measured, per symbol per day (gzip of raw frames):**

| Stream | BTC spot | BTC perp | Quiet spot (3 pairs, rank 249–447 of 496) | Quiet perp (4 pairs, rank 184–655 of 727) |
|---|---|---|---|---|
| Trades | 16 MB | 10–22 MB | 0.02–0.2 MB | 0.03–0.4 MB |
| 1m kline pushes | 2 MB | 6–7 MB | 0.1–0.4 MB | 0.1–1.1 MB |
| 24h ticker (1 s) | 5 MB | 2 MB | 0.6–1.8 MB | 0.1–0.9 MB |
| Best bid/ask (every change) | 61–65 MB | 142–285 MB | 0.6–11.5 MB | 0.2–8.3 MB |
| L2 top-20 snapshots (100 ms) | 28–30 MB | 22–43 MB | 1.8–10.2 MB | 0.4–5.8 MB |
| **L2 full diffs (100 ms)** | **113–122 MB** | **187–387 MB** | **1.8–11.3 MB** | **1.0–9.6 MB** |
| Everything | 237–253 MB | 390–766 MB | 5.5–36 MB | 3.8–21 MB |

For reference, Binance's own daily trade files for BTC/USDT are 24–27 MB zipped, consistent with these numbers.

**Findings:**
- **Order-book traffic doesn't follow trading activity.** A pair with 4,000 trades a day (WBETH/USDT) produced more book traffic than one with 10,000 (BAT/USDT). Market makers requote regardless of trading. So a curve fitted on trade counts overestimates book data for the long tail by 3–10×. The whole-exchange estimate below therefore uses measured tail medians instead of that fit.
- **Most quiet symbols cost 2–6 MB/day each for full L2 diffs.** That is well below the 20–100 MB assumed in the earlier estimate.
- **Diffs beat snapshots only on busy books.** On quiet books, top-20 snapshots every 100 ms are about the same size as full diffs. Diffs plus a periodic snapshot remain the right default, because they are complete and seekable.

**Whole-exchange estimate, per year.** Binance has 1,368 trading spot symbols and 775 USD-M perpetuals. The model for each market is:
- the long tail: every symbol at the measured tail range;
- plus ~25 head symbols averaging about ⅓ of BTC. This head assumption is unmeasured and contributes 20–35% of the total.

| Data | Spot | USD-M | **Binance total / year** |
|---|---|---|---|
| OHLCV 1m (backfilled via REST, ~50 B/row) | 36 GB raw | 20 GB raw | **~56 GB raw, ~10–15 GB compressed** |
| Trades | 0.15–0.3 TB | ~0.4 TB | **~0.5–0.7 TB** |
| Best bid/ask | 0.8–2.3 TB | 1.5–1.8 TB | **~2.3–4 TB** |
| L2 full diffs + periodic snapshots | 1.5–3 TB | ~2.5 TB | **~4–5.5 TB** |
| L2 top-20 @100 ms (alternative to diffs) | ~1.2 TB | ~1.6 TB | ~2.8 TB |
| Tickers + mark price (1 s) | ~0.3 TB | ~0.7 TB | ~1 TB; don't store — rebuild from trades and book |

**What this means for the design:**
- **Candles + trades for every Binance symbol: well under 1 TB per year.** That fits on a laptop disk, so "all symbols, full history" is realistic by default at this tier.
- **Adding best bid/ask and full L2 for every symbol: roughly 7–10 TB per year** for Binance spot + USD-M as gzip'd raw frames. That is a single large disk or a NAS, not a data centre, but it is still too much to record by default. Keep L2 opt-in per symbol and window. For example, the top 20 pairs cost about 1.5–3 TB/year; a handful of quiet pairs cost a few GB a month.
- **Across the ~10 largest exchanges, very roughly 3–5× Binance:** about 20–50 TB/year for everything, including full L2 on every symbol. This is a loose extrapolation. Binance is the largest venue, but others (OKX, Bybit) also run large derivatives books.
- **Storage format.** Keep raw frames as the source of truth: gzip or brotli, daily files per symbol per stream. Derive columnar tables from them. Columnar compression wasn't measured; the script only estimates uncompressed columnar row sizes.
- **Re-measure before committing to numbers.** Record a few hours on a weekday and a volatile day, and add COIN-M and options.

## 6. Using Tardis.dev

Tardis stores the **raw WebSocket messages each exchange sent**, each stamped with a local receive time. That is exactly what ccxt.pro parses live, which gives CCXT three ways to use a Tardis subscription:

| Path | How | Fidelity | Caveat |
|---|---|---|---|
| **1. Raw replay → ccxt parsers** (preferred) | Fetch exchange-native slices with the user's API key (as tardis-node / tardis-python do) and feed each frame into `ccxt.pro.<exchange>.handleMessage`, like the existing static WS test harness | Highest — ccxt's own order-book, checksum and sequence-gap logic runs on real historical traffic; results are ccxt unified structures | Needs a per-exchange map from ccxt `watch*` subscriptions to Tardis channel filters (tardis-machine has ~40 such mappers to learn from). Old frames in formats ccxt no longer parses (e.g. before an exchange's API version change) fall back to path 2 |
| **2. Normalized / CSV datasets → converter** | Download Tardis CSV (trades, `incremental_book_L2`, `book_snapshot_25`, `derivative_ticker`, liquidations …) and convert to ccxt structures | High, format-stable across years | Tardis's normalized book is L2 only; ccxt's own parsing code isn't exercised |
| **3. Point at a user-run tardis-machine** | Use its `/replay-normalized` HTTP/WS API as a `DataSource` | Same as 2 | Extra process; tardis-machine has no pacing control (fine for backtests) |

What the user writes:

```ts
const data = ccxt.data.tardis ({
    apiKey: process.env.TARDIS_API_KEY,        // the user's own subscription
    exchange: 'binance', marketType: 'swap',
    symbols: [ 'BTC/USDT:USDT' ],
    types: [ 'trades', 'l2', 'funding', 'mark' ],
    from: '2024-01-01', to: '2024-02-01',
    mode: 'raw',                                // 'raw' (path 1) | 'normalized' (path 2)
    cacheDir: './data/tardis',                  // download once, reuse across runs
});
const ex = new ccxt.sim.binanceusdm ({ data, fillModel: 'l2', balance: { USDT: 10_000 } });
```

Tip for trying it: Tardis serves the first day of each month without an API key, which is enough for a demo dataset.

## 7. Could CCXT run its own data server, backfilled from Tardis?

Technically yes, but licensing decides the shape:

- **Exchanges:** Binance and Coinbase terms forbid redistributing their market data (Coinbase includes derived works) without consent. A public CCXT archive would need per-exchange agreements.
- **Tardis:** a normal subscription is for the subscriber's use. Re-serving Tardis data from a CCXT server to other users would need a redistribution / reseller agreement with Tardis. (We could not read Tardis's licence text during the research — verify with them directly.)

Viable options, in order of effort:

1. **Bring your own data (default).** CCXT ships the software; each user supplies their own Tardis key, recordings or dumps. No licensing exposure. This is the tardis-machine model.
2. ~~Hosted compute with the user's key~~ — **ruled out**: CCXT will not hold users' exchange or vendor credentials. Everything runs on the user's machine or infrastructure.
3. **Partnership.** A formal agreement with Tardis (or another vendor) so CCXT users get data through CCXT — possibly the premium offering. Needs a commercial conversation, not code.
4. **Self-recorded archive.** CCXT records its own feeds with ccxt.pro. Still subject to exchange terms for redistribution, and expensive: full L2 for a top perp is ~1–2 GB per symbol-day compressed; top ~20 symbols × ~10 venues is roughly 10–100 TB/year.

A server that holds data should store: raw frames + local timestamps (source of truth, re-parsable), derived Parquet tables (trades, L2 deltas + periodic snapshots, 1m OHLCV, funding, mark/index, OI, liquidations), and daily `markets` snapshots.

## 8. Fill models (named, recorded in every report)

| Data tier | Model | Notes |
|---|---|---|
| Bars | `bar-pessimistic` (default), `bar-ohlc` (O→H→L→C / O→L→H→C heuristic), `bar-magnifier` (drill into 1m or trades) | Gap-through fills at the open; same-bar stop/target resolved pessimistically |
| Trades | Limit fills only on trade evidence, partial fills capped by traded size | |
| L2 | Walk the book; liquidity-consumption overlay; queue models (risk-averse, probabilistic); own orders visible in `fetchOrderBook` | Recorded data is never mutated; optional impact model is opt-in and labelled |
| All | Fees from `market.maker/taker` or fee-tier override; historical funding; tiered liquidation from `fetchLeverageTiers`; validation from `precision`, `limits`, `features` | Raises the real ccxt exceptions |

## 9. Developer experience

```ts
import ccxt from 'ccxt';
import { smaCross } from './strategy';     // plain ccxt code, unchanged in every mode

const mode = process.env.MODE;             // 'backtest' | 'paper' | 'live'
const live = new ccxt.pro.binance ({ apiKey, secret });

const data = ccxt.data.merge ([
    ccxt.data.tardis ({ apiKey: process.env.TARDIS_API_KEY, exchange: 'binance', symbols: [ 'BTC/USDT' ], types: [ 'trades', 'l2' ], from: '2024-01-01', to: '2024-03-01' }),
    ccxt.data.local ('./data'),            // ccxt backfills, recordings, markets snapshots
]);

const ex =
    mode === 'backtest' ? new ccxt.sim.binance ({ data, balance: { USDT: 10_000 }, fillModel: 'l2', seed: 42 }) :
    mode === 'paper'    ? new ccxt.sim.binance ({ feed: live, balance: { USDT: 10_000 }, fillModel: 'l2' }) :
                          live;

if (mode === 'backtest') {
    const report = await ex.run (smaCross);
    console.log (report.summary, report.assumptions, report.datasetHash);
} else {
    await smaCross (ex);
}
```

Explicit control for tests and research:

```ts
const ex = new ccxt.sim.binance ({ data, balance: { USDT: 1000 }, seed: 1 });
await ex.clock.advanceTo ('2024-01-15T00:00:00Z');
ex.clock.schedule ('2024-01-15T01:00:00Z', ccxt.sim.events.disconnect ({ durationMs: 30_000 }));
const snap = ex.snapshot ();
await ex.run (myStrategy, { until: '2024-01-16' });
ex.restore (snap);                         // "rewind", then try different parameters
```

Backfilling and recording:

```bash
ccxt data backfill binance BTC/USDT --types ohlcv:1m,funding --from 2021-01-01    # REST, free
ccxt data import binance-vision BTC/USDT --types trades --from 2023-01-01          # exchange dumps
ccxt data import tardis binance BTC/USDT --types trades,l2 --from 2024-01-01 --key $TARDIS_API_KEY
ccxt data record binance BTC/USDT --types trades,l2                                # start your own archive
ccxt data info ./data                                                              # ranges, gaps, hashes
```

## 10. Strategy, runner and the development loop

### 10.1 Should ccxt have a Strategy class?

Yes, but as a **thin, optional contract, not a framework**. ccxt's value is being the exchange layer; it should not grow into Freqtrade (dataframe conventions, built-in indicators, Telegram bots). Two levels:

1. **Function strategy (always supported):** any `async (exchange, ctx) => {}` that uses the unified API. This is maximum freedom and what the earlier examples use.
2. **`ccxt.Strategy` class (opt-in):** the same code plus a few declarations that the tooling can read.

The class earns its place because the declarations unlock features a plain function can't give:

| Declaration | What it unlocks |
|---|---|
| `markets` / `subscriptions` (symbols, timeframes, data types) | The runner fetches or checks the dataset automatically in backtest, and opens the right `watch*` streams live |
| `params` with types and ranges | The optimizer knows what to sweep; agents can read and change them without editing code |
| `state` that can be serialised | Restart after a crash, resume after a deploy, and `snapshot()`/`restore()` in simulation |
| `risk` limits | Enforced by the runner, not by strategy code |
| Lifecycle hooks | One place for startup reconciliation and graceful shutdown |

```ts
import ccxt, { Strategy } from 'ccxt';

export default class SmaCross extends Strategy {
    static id = 'sma-cross';
    static version = '1.3.0';
    static params = {
        symbol: { type: 'symbol', default: 'BTC/USDT' },
        fast:   { type: 'int', default: 10, range: [ 5, 50 ] },
        slow:   { type: 'int', default: 50, range: [ 20, 300 ] },
        riskPct:{ type: 'float', default: 0.95, range: [ 0.1, 1 ] },
    };
    subscriptions () {
        return [ { symbol: this.p.symbol, type: 'ohlcv', timeframe: '1h', history: this.p.slow } ];
    }
    async onStart (ctx) {                       // live: reconcile with open orders/positions on the exchange
        await ctx.reconcile ();
    }
    async onCandle (ctx, symbol, candles) {     // called when a candle closes, in every mode
        const closes = candles.map ((c) => c[4]);
        const fast = ctx.ta.sma (closes, this.p.fast), slow = ctx.ta.sma (closes, this.p.slow);
        const pos = ctx.position (symbol);
        if (fast > slow && pos.isFlat) {
            await ctx.exchange.createOrder (symbol, 'market', 'buy', ctx.sizeFor (symbol, this.p.riskPct));
        } else if (fast < slow && !pos.isFlat) {
            await ctx.exchange.createOrder (symbol, 'market', 'sell', pos.amount);
        }
    }
    async onOrderUpdate (ctx, order) {}          // from watchOrders live, from the matcher in simulation
    async onStop (ctx) {                        // shutdown policy is a runner option (keep, cancel, flatten)
    }
}
```

`ctx.exchange` is a normal ccxt exchange object (real or simulated), so nothing inside the class is special. The hooks are sugar over `watch*` loops. `ctx.ta` is a tiny optional helper; users can bring any indicator library.

### 10.2 One runner for every mode

Name it `run`, not `execute`. The same call is used everywhere; only `mode` changes:

```ts
const result = await ccxt.run (SmaCross, {
    mode: 'backtest',                 // 'backtest' | 'paper' | 'sandbox' | 'live'
    exchange: 'binance',
    params: { fast: 12, slow: 60 },
    data: ccxt.data.local ('./data'), // backtest only; missing ranges can be backfilled automatically
    from: '2024-01-01', to: '2024-06-01',
    balance: { USDT: 10_000 },        // backtest and paper
    account: 'binance-main',          // sandbox and live: a named account from the local config, never raw keys
    risk: { maxOrderValue: 500, maxPositionValue: 2_000, maxDailyLoss: 200, maxOpenOrders: 10 },
});
```

| Mode | Exchange object | Purpose |
|---|---|---|
| `backtest` | `ccxt.sim.<id>` + historical data | Performance on the past, fast, deterministic |
| `paper` | `ccxt.sim.<id>` + live data | Performance now, zero risk |
| `sandbox` | real class with `setSandboxMode(true)` | **Integration test**: do the exchange's order types, params and error codes behave as the strategy expects? Not a performance measure (testnet books are unrealistic) |
| `live` | real class | Real money |

What the runner owns, so strategy code doesn't have to:

- **Guardrails, enforced outside the strategy:** per-order and per-position notional caps, daily loss limit, max open orders, allowed symbols, and a kill switch that cancels orders and optionally flattens positions. The live tier must be switched on in local config, never from code or an agent conversation. This reuses the safety model already in the ccxt MCP server (config-only tiers, `"trading": "live"` plus `maxOrderValue`, confirmation, journal).
- **Reliability:** reconnects, rate limits, clock-drift checks, and startup reconciliation (open orders and positions on the exchange versus saved state).
- **State and journal:** strategy state saved on every change. An append-only journal of every signal, order, fill, error and parameter change, in the **same schema as a backtest report**, so live and simulated runs can be compared line by line.
- **Recording:** a live or paper run can record its own market data (§5.2), which feeds the loop below.
- **Observability:** a status endpoint and metrics (PnL, exposure, latency, errors); `--json` output everywhere.

Deployment is plain and always on the user's side: `ccxt strategy run ./sma-cross.ts --mode live --account binance-main`, a small Docker image, or any process manager. **There is no CCXT-hosted runner** — CCXT never holds users' keys. Keys stay in the user's local config, as in the ccxt MCP server.

### 10.3 The ideal workflow

```
 create ──► backtest ──► optimize (walk-forward) ──► paper ──► sandbox check ──► live (small) ──► live (full)
   ▲                                                                                 │
   └──── re-optimize ◄── compare live vs replay ◄── record data + journal ◄──────────┘
```

Each arrow is a **promotion gate** with explicit criteria, checked by the tooling rather than by eye:

| Gate | Example criteria |
|---|---|
| backtest → optimize | Minimum number of trades; profitable after fees and funding; no look-ahead warnings |
| optimize → paper | Out-of-sample (walk-forward) results close to in-sample; deflated Sharpe above a threshold given the number of trials tried |
| paper → live small | N days of paper; paper results within tolerance of a backtest of the same period (replay-paper); no runner errors |
| sandbox check | Every order type and param the strategy uses is accepted by the exchange |
| live small → live full | Live fills within tolerance of the simulator's prediction for the same period; drawdown within limits |

Every run produces a **run manifest**: strategy id and version, code hash, params, dataset hash, fill and latency models, and seed. Results are only compared between runs whose manifests are known, which makes the loop auditable.

### 10.4 The continuous loop in production

1. **Record.** The live runner records market data and journals its own orders and fills.
2. **Reconcile.** Nightly, replay the recorded day through the simulator with the live parameters and compare with the live journal. The difference measures the simulator's error, and it is used to **calibrate** latency and slippage models for that exchange. A growing gap is an alert in itself.
3. **Re-optimize.** On a rolling window (walk-forward), produce a *challenger* parameter set. A locked hold-out period is never used for tuning.
4. **Challenge.** Run the challenger in paper mode alongside the live *champion* on the same live data.
5. **Promote or reject.** Promote only if it beats the champion by a margin that survives the multiple-testing correction, with a minimum sample size. Promotion is a versioned parameter change, hot-reloaded by the runner, with one-command rollback.
6. **Guardrails never change in the loop.** Risk limits and the live tier are set by a human in config.

### 10.5 Making it work for AI agents

An agent is fast at generating strategies and parameter sets, which also makes it a very efficient overfitting machine. The tooling should make the right thing easy and the dangerous thing impossible:

- **Everything scriptable and machine-readable:** CLI with `--json`, stable report and journal schemas, and error messages that say which gate failed and why.
- **MCP tools** on the existing ccxt MCP server: `strategy_validate`, `backtest_run`, `optimize_run`, `paper_start`, `paper_status`, `run_compare`, `promote_request`, `live_status`, `kill_switch`. `promote_request` to live **creates a request for a human to approve**; there is no tool that turns on live trading.
- **Overfitting controls:** the optimizer counts every trial an agent runs against a dataset and reports deflated Sharpe; hold-out data is locked and only usable once per candidate; reports state "N trials tried" prominently.
- **Budgets:** limits on trials, compute and paper-trading slots per agent.
- **Scaffolding:** `ccxt strategy new <name>` creates a strategy file, a test and a config; strategies can have unit tests using the simulator's clock control and injected events (outages, disconnects), which is where agents are good at writing coverage.

A typical agent session:

```bash
ccxt strategy new mean-reversion --template onCandle
ccxt data backfill binance ETH/USDT --types ohlcv:1m,funding --from 2022-01-01 --json
ccxt strategy backtest ./mean-reversion.ts --exchange binance --from 2022-01-01 --to 2025-01-01 --json
ccxt strategy optimize ./mean-reversion.ts --walk-forward train=180d,test=30d --trials 200 --json
ccxt strategy paper ./mean-reversion.ts --params best.json --days 14 --record --json
ccxt strategy compare paper-run-17 --against replay --json      # paper vs simulator on the same period
ccxt strategy promote paper-run-17 --to live --max-order-value 100   # → waits for human approval
```

## 11. Roadmap

### 11.1 Two backtesting paths

The simulator needs data, but not necessarily data served by ccxt. Users can fetch candles and trades themselves through ccxt's REST backfill, from the exchange, so ccxt redistributes nothing. They can also bring recordings, exchange bulk files or their own Tardis key. Router recordings (B) and a ccxt data API (F) add what users can't get themselves: order-book history, longer histories, and convenience.

| | Venue-specific simulator | Generalized market simulator |
|---|---|---|
| Data | That exchange's own trades, candles and order books | Market-wide data: a cross-venue composite or a representative venue |
| Exchange rules | That venue's fees, precision, limits, funding and liquidation | Configurable fees, slippage and funding; can still borrow venue precision, limits and fees from ccxt market metadata |
| Good for | Arbitrage, market making, venue-specific perpetual strategies, order-book-level fills | Candle-based strategies (trend, mean reversion, rotation), where the venue barely matters |
| Legal | Per-exchange approval if ccxt serves the data; none if users fetch it themselves | Lighter: one dataset, or a licensed aggregate. Still check terms; Coinbase restricts derived works |
| Honesty | "What would have happened on Binance" | "What would have happened in the market"; reports must say it's an approximation |

Recommendation: ship the generalized simulator first. Add venue-specific backtests next, first on user-fetched data, then on ccxt-served data per exchange as legal approvals arrive. Both use the same simulator; only the data source changes.

### 11.2 Workstreams

| Workstream | What it is | Depends on | Legal gate? | Existing competitors / alternatives |
|---|---|---|---|---|
| **A. Business and legal** | Storage and serving rights per exchange and data tier; open-source vs paid split; vendor partnership | — | — | — |
| **B. Router data recording** | Router records raw messages and daily market snapshots | — | Internal storage: confirm. Serving: yes | Tardis.dev, Crypto Lake, Kaiko, CoinAPI, Amberdata |
| **C. Library data foundations** | REST backfill, recorder and replay, local store, market snapshots, Binance bulk-file importer | — | No (user side) | cryptofeed, tardis-node, Freqtrade `download-data`, Binance bulk files |
| **E1. Strategy + live runner** | `ccxt.Strategy`, `ccxt.run()` in live and sandbox modes, guardrails, journal, state | — | No | Freqtrade, Hummingbot, OctoBot, NautilusTrader live; hosted bot platforms (e.g. 3Commas, Cryptohopper) that hold users' keys, unlike ccxt |
| **M. Matcher and ledger** | Order matching, fees, balances, positions, funding, liquidation | — | No | Nautilus `SimulatedExchange`, OctoBot exchange simulator, Hummingbot paper connector |
| **E2. Paper mode** | Runner plus the matcher on live feeds | E1, M | No | Freqtrade dry-run, Hummingbot paper trade, Alpaca/IBKR paper accounts, exchange testnets |
| **D0. Clock seam** | Replaceable clock through `Exchange`, throttler and WS client | — | No | Nautilus `VirtualClock`, LEAN time frontier |
| **D1. Generalized backtest** | Clock, matcher, market-wide data, configurable venue rules | D0, M, any data source | Lighter | TradingView strategy tester, Freqtrade, Jesse, vectorbt, Backtrader, LEAN |
| **D2. Venue-specific backtest** | Same with a venue's own data and rules, up to order-book level | D0, M, C or F | Only if ccxt serves the data | NautilusTrader, hftbacktest, Hummingbot backtesting, Freqtrade (candles) |
| **E3. Backtest mode in runner** | Same strategy file in backtest | E1, D1 or D2 | No | Freqtrade, Jesse, LEAN, Nautilus |
| **F. Data API** | Historical data served by ccxt, as a simulator data source | A, B | **Yes** | Tardis.dev, Kaiko, CoinAPI, Amberdata, Crypto Lake, CCData/CryptoCompare; Binance bulk files |
| **G. Optimization and agent loop** | Walk-forward, sweeps, promotion gates, live-vs-replay reconciliation, MCP tools | E3; better with F | No | Freqtrade hyperopt/FreqAI, VectorBT PRO, LEAN optimizer, MultiCharts walk-forward |

### 11.3 Order

```
E1 strategy + live runner ─────────► E2 paper ──► E3 backtest mode ──► G optimization/agents
M  matcher + ledger ───────────────┘               ▲
D0 clock seam ──► D1 generalized backtest ─────────┤
C  data foundations ──► D2 venue-specific backtest ─┘
A legal/business ─┐
B router recording ┴──► F data API ──► (extra data source for D1/D2)
```

1. **Now, in parallel:** A and B on the business side; E1, M, D0 and C on the library side. None depends on the others.
2. **First release:** Strategy class plus live and sandbox runner (E1), then paper mode (E2).
3. **Second release:** generalized backtest (D1) and backtest mode (E3). One strategy file then runs in every mode.
4. **Third:** venue-specific backtest (D2), first on user-fetched data, then order-book level with latency and queue models.
5. **When legal allows:** data API (F) per approved exchange and data tier. It improves D1 and D2 without code changes.
6. **Then:** optimization and agent loop (G): walk-forward, promotion gates, nightly live-vs-replay reconciliation, MCP tools with human-approved promotion.

Durations are not estimated here; they depend on team size.

## 12. Open questions

1. Scope: new core module vs a separate `ccxt-sim` package first.
2. Which data tiers a ccxt data API would cover, and whether it is paid (§0, §11).
3. Tardis redistribution terms and appetite for a partnership (§7).
4. Old-format raw frames: keep versioned parsers, or rely on Tardis normalized data for older periods?
5. Which exchange-specific `params` (post-only, reduce-only, TP/SL attached orders) the simulator supports in v1.
6. Storage format per language (Parquet support is uneven in PHP).
7. Should `ccxt.Strategy` and the runner live in every language, or start in TypeScript and Python only? The simulator core transpiles, but a long-running runner is more runtime-specific.
8. Who owns the promotion gates' default thresholds, and should they be per strategy?
