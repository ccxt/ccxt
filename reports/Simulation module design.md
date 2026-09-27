# CCXT simulation module — design draft

Status: investigation draft, not an agreed API. All names (`ccxt.sim`, `ccxt.data`, …) are illustrative.
Background research: [Trading simulation design research.md](./Trading%20simulation%20design%20research.md).

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
- **Prerequisite:** a clock seam. Today `ts/src/base/functions/time.ts` hard-wires `Date.now`, and `throttle.ts` and `ws/Client.ts` read it directly. Phase 0 routes all of them through an injectable `exchange.clock`.

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

## 11. Phases

| Phase | Deliverable |
|---|---|
| 0. Clock seam | Injectable `exchange.clock` used by `Exchange`, throttler and WS `Client`; no live behaviour change |
| 1. Data layer | `DataSource` interface; ccxt REST backfill; local Parquet store with manifests and `markets` snapshots; Binance dumps importer; ccxt.pro recorder |
| 2. Backtest (bars + trades) | `ccxt.sim.<exchange>` with bar/trade fill models, ledger, fees, funding, tiered liquidation, time frontier, control API, reports |
| 3. Paper + replay-paper | Same simulator on live `watch*` feeds, and on recordings |
| 4. L2 + Tardis | Raw-frame replay into `handleMessage` (recordings and Tardis raw); Tardis CSV converter; L2 matcher, queue and latency models |
| 5. Strategy + runner | `ccxt.Strategy` contract, `ccxt.run()` for all four modes, guardrails, state and journal, run manifests, `ccxt strategy` CLI |
| 6. Loop + agents | Walk-forward, sweeps, purged CV, deflated Sharpe; promotion gates; live-vs-replay reconciliation and model calibration; champion/challenger; MCP tools with human-approved promotion |
| 7. Premium | Optional local lockstep server; vendor partnerships (data only — no hosted runners or key custody) |

Phase 5 can start as soon as phase 2 exists: a runner over backtest and live alone is already useful.

## 12. Open questions

1. Scope: new core module vs a separate `ccxt-sim` package first.
2. Tardis redistribution terms and appetite for a partnership (§7).
3. Old-format raw frames: keep versioned parsers, or rely on Tardis normalized data for older periods?
4. Which exchange-specific `params` (post-only, reduce-only, TP/SL attached orders) the simulator supports in v1.
5. Storage format per language (Parquet support is uneven in PHP).
6. Should `ccxt.Strategy` and the runner live in every language, or start in TypeScript and Python only? The simulator core transpiles, but a long-running runner is more runtime-specific.
7. Who owns the promotion gates' default thresholds, and should they be per strategy?
