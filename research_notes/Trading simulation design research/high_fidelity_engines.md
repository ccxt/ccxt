# High-fidelity event-driven engines: NautilusTrader, hftbacktest, Barter-rs

Method note: the documentation sites (nautilustrader.io, hftbacktest.readthedocs.io) and github.com web pages were blocked by the network egress proxy in this environment. All three repositories were shallow-cloned with git and read directly. Citations therefore point at the GitHub source/doc files. Many of the Nautilus `docs/concepts/**` files are the sources for https://nautilustrader.io/docs/latest/concepts/..., and the hftbacktest `docs/*.rst` and `examples/*.ipynb` files are the sources for https://hftbacktest.readthedocs.io/en/latest/....

Snapshot versions (version-dependent details matter):
- NautilusTrader: `develop` @ 07db63d (27 Sep 2026), **v2.0.0rc6** (unreleased). v2.0.0rc5 came out 15 Sep 2026 and the last 1.x was 1.231.0 Beta (2 Aug 2026). v2 is the "Rust-native v2 runtime" with PyO3 bindings — [version.json](https://github.com/nautechsystems/nautilus_trader/blob/develop/version.json), [RELEASES.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/RELEASES.md), [README](https://github.com/nautechsystems/nautilus_trader/blob/develop/README.md)
- hftbacktest: `master` @ 5f3ec40 (23 Dec 2025). Rust crate `hftbacktest` 0.9.4, Python package 2.4.4, requires Python 3.11+ — [Cargo.toml](https://github.com/nkaz001/hftbacktest/blob/master/hftbacktest/Cargo.toml), [pyproject](https://github.com/nkaz001/hftbacktest/blob/master/py-hftbacktest/pyproject.toml), [README](https://github.com/nkaz001/hftbacktest/blob/master/README.rst)
- Barter-rs: `develop` @ 9770b27 (20 Aug 2026). barter 0.14.0, barter-data 0.13.0, barter-execution 0.9.0, barter-instrument 0.3.3 — [barter/Cargo.toml](https://github.com/barter-rs/barter-rs/blob/develop/barter/Cargo.toml)

---

## Q1. Data: types consumed, storage format, loaders and adapters, backfilling

### Takeaway
Nautilus has the richest data model: L3 MBO/L2 MBP deltas, depth snapshots, quotes, trades, bars, mark/index/funding updates, and more. It stores data in a Rust/DataFusion Parquet catalog and has first-class Tardis and Databento adapters. hftbacktest uses one flat 8-field numpy structured event array (npz) that carries *two timestamps* per event, plus converters for Tardis, Binance, Bybit, Databento and others. Barter has no storage layer: backtests replay an in-memory `Vec` of `MarketStreamEvent`s, loaded from JSON in the examples.

### Cited Findings
**NautilusTrader**
- Supported data in descending detail: L3 order book (market-by-order), L2 (market-by-price), L1 quotes, trades, bars. "More granular data exposes more of the recorded queue and depth, while less granular data requires more simulation assumptions" — [data-and-venues.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/data-and-venues.md)
- Data types that `BacktestDataConfig` can load: `QuoteTick`, `TradeTick`, `Bar`, `OrderBookDelta`, `OrderBookDepth`, `MarkPriceUpdate`, `IndexPriceUpdate`, `FundingRateUpdate`, `InstrumentStatus`, `OptionGreeks`, `InstrumentClose`, `Instrument` — [catalog.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/data/catalog.md)
- v2 renamed `OrderBookDepth10` to `OrderBookDepth` (in both `NautilusDataType` and the Databento/Tardis loader names) — [RELEASES.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/RELEASES.md)
- `ParquetDataCatalog` is "the Python interface to the Rust catalog and DataFusion query engine". Rust crates define Arrow schemas for built-in data. Timestamps are `Timestamp(Nanosecond, UTC)`. Storage can be local disk, S3, GCS, Azure or HTTP/WebDAV through an object-store backend. Files are named `{start_timestamp}_{end_timestamp}.parquet` in per-type/per-instrument directories. Overlapping writes raise `OSError` unless `skip_disjoint_check=True`. Each write must hold one identity (instrument or bar type) and be ordered by `ts_init` — [catalog.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/data/catalog.md)
- Legacy catalog layouts must be migrated with `nautilus catalog migrate-parquet`. v2 requires valid schemas for custom-data writes — [catalog.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/data/catalog.md), [RELEASES.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/RELEASES.md)
- Tardis integration: CSV loading and streaming functions, `run_tardis_machine_replay` (replays history and *writes Nautilus Parquet catalog files*), and a `TardisDataClient` for historical replay or real-time streams through Tardis Machine. Only Tardis *normalized* formats are supported. Mapping: `book_change`→`OrderBookDeltas`; `book_snapshot_*`→`OrderBookDepth`/`OrderBookDeltas`; `quote`→`QuoteTick`; `trade`→`TradeTick`; `trade_bar_*`→`Bar`; `derivative_ticker`→`FundingRateUpdate`/`MarkPriceUpdate`/`IndexPriceUpdate`; `option_summary`→`OptionGreeks`. `book_ticker`, `liquidation` and `error` are not parsed — [integrations/tardis.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/integrations/tardis.md)
- Databento: `DatabentoDataLoader` decodes DBN files to Nautilus objects for backtests or catalog storage. `DatabentoHistoricalClient` fetches history over HTTP. `DatabentoDataClient` serves live nodes — [integrations/databento.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/integrations/databento.md)
- Adapters in the v2 tree: architect_ax, betfair, binance, blockchain, bybit, coinbase, databento, deribit, derive, dydx, hyperliquid, interactive_brokers, kraken, lighter, okx, polymarket, sandbox, tardis — [crates/adapters](https://github.com/nautechsystems/nautilus_trader/tree/develop/crates/adapters)
- Bars used for execution must have `ts_init` = interval close. For open-stamped bars, set `ts_init = ts_event + interval_ns`. `Bar.volume` must be in instrument quantity units and size precision — [bar-execution.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/bar-execution.md), [fill-prices-and-matching.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/fill-prices-and-matching.md)
- Strict precision validation. Quotes, trades or bars whose precision mismatches the instrument are skipped with a warning. After 20 consecutive mismatches an error is logged, which can trigger `shutdown_on_error`. New orders with excess precision are rejected — [fill-prices-and-matching.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/fill-prices-and-matching.md)

**hftbacktest**
- Input is a numpy structured array with 8 fields: `ev` (u64 flags), `exch_ts` (i64), `local_ts` (i64), `px` (f64), `qty` (f64), `order_id` (u64, L3 only), `ival` (i64), `fval` (f64) — [docs/data.rst](https://github.com/nkaz001/hftbacktest/blob/master/docs/data.rst)
- Validation rules: events flagged `EXCH_EVENT` must be chronological by exchange timestamp, and events flagged `LOCAL_EVENT` chronological by local timestamp. The exchange timestamp must be earlier than the local timestamp (positive feed latency). Negative latency from clock skew is fixed by improving sync (PTP) or adding a base latency. `correct_event_order` / `validate_event_order` repair and check ordering, splitting a row into separate EXCH-only and LOCAL-only rows when needed — [docs/data.rst](https://github.com/nkaz001/hftbacktest/blob/master/docs/data.rst)
- Converters in `hftbacktest.data.utils`: binancefutures, binancehistmktdata, bybit, bybithistmktdata, databento, hyperliquid, mexc, tardis, snapshot, difforderbooksnapshot, feed_order_latency — [data/utils](https://github.com/nkaz001/hftbacktest/tree/master/py-hftbacktest/hftbacktest/data/utils)
- Tardis caveat noted by the author: Tardis's Binance Futures data uses the `E` event (send) timestamp rather than `T` transaction time, "so the latency is slightly less than it actually is". Trade files should be input before depth files — [data/utils/tardis.py](https://github.com/nkaz001/hftbacktest/blob/master/py-hftbacktest/hftbacktest/data/utils/tardis.py)
- The Binance Futures raw-stream converter can encode `markPriceUpdate` as custom event IDs (index 100, mark 101, **funding rate 102**) and `bookTicker` as 103/104. It also takes `base_latency` for correcting local timestamps — [data/utils/binancefutures.py](https://github.com/nkaz001/hftbacktest/blob/master/py-hftbacktest/hftbacktest/data/utils/binancefutures.py)
- Recommended collection path is the author's own `collector` (raw WebSocket stream plus local receipt timestamp), so feed latency is *your* latency — [docs/data.rst](https://github.com/nkaz001/hftbacktest/blob/master/docs/data.rst), [debugging discrepancies](https://github.com/nkaz001/hftbacktest/blob/master/docs/debugging_backtesting_and_live_discrepancies.rst)
- Level-3 backtesting tutorial builds L3 feed data from Databento CME market-by-order data — [Level-3 Backtesting.ipynb](https://github.com/nkaz001/hftbacktest/blob/master/examples/Level-3%20Backtesting.ipynb)
- The README says sample data is hosted by a supporter at reach.stratosphere.capital — [README](https://github.com/nkaz001/hftbacktest/blob/master/README.rst)

**Barter-rs**
- barter-data subscription kinds: `PublicTrades`, `OrderBooksL1`, `OrderBooksL2`, `OrderBooksL3`, `Candles`, `Liquidations` — [barter-data/src/subscription](https://github.com/barter-rs/barter-rs/tree/develop/barter-data/src/subscription)
- barter-data describes itself as "High performance & normalised WebSocket integration for leading cryptocurrency exchanges": a live streaming library, not a historical store — [barter-data/Cargo.toml](https://github.com/barter-rs/barter-rs/blob/develop/barter-data/Cargo.toml)
- Backtest data source is the `BacktestMarketData` trait (first-event time plus a `Stream` of `MarketStreamEvent`s). The only implementation is `MarketDataInMemory`, an `Arc<Vec<...>>` cloned lazily — [backtest/market_data.rs](https://github.com/barter-rs/barter-rs/blob/develop/barter/src/backtest/market_data.rs)
- Example data files are JSON (`binance_spot_trades_l1_btcusdt_ethusdt_solusdt.json`, `binance_spot_market_data_with_disconnect_events.json`) — [barter/examples/data](https://github.com/barter-rs/barter-rs/tree/develop/barter/examples/data)

### Inferences
- For CCXT, two formats are useful as templates. Nautilus-style Parquet/Arrow has typed per-instrument partitions named by time range, so time-filtered queries can prune files. hftbacktest-style flat event rows with `exch_ts` + `local_ts` + flag bits are the most compact way to carry feed latency.
- A CCXT recorder (watchOrderBook/watchTrades plus local receipt time) would produce hftbacktest-grade data directly. The dual timestamp is the key field to keep.
- Barter shows that a minimal "iterator of normalized events" interface is enough to decouple storage from the engine.

### Gaps
- No Nautilus-published catalog read throughput (rows/sec) was found in the docs.
- I did not verify how Nautilus handles gaps and resyncs in delta streams (e.g., Tardis `disconnect` is "Ignored").

---

## Q2. Clock and event loop: simulated time, timers, ordering, ts_event vs ts_init, stepping/rewind, chunked streaming

### Takeaway
Nautilus drives a deterministic virtual clock (Rust `VirtualClock`, formerly `TestClock`) from data sorted by `ts_init`, with a well-specified per-timestamp phase order, and supports chunked streaming. Time only moves forward. hftbacktest has the strategy itself pull time forward (`elapse`, `wait_next_feed`, `wait_order_response`), with separate exchange-side and local-side timelines. Barter's `HistoricalClock` is not a true virtual clock: it adds *wall-clock* elapsed time to the last event's exchange time.

### Cited Findings
**NautilusTrader**
- Data is ordered by `ts_init` using a stable sort, which "gives backtests deterministic replay". DeFi data breaks ties by block/tx/log index — [data/index.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/data/index.md)
- `ts_event` = when the event occurred (venue time). `ts_init` = when Nautilus initialized the object (usually local receipt). `ts_init - ts_event` measures latency only with synchronized clocks. In live trading `ts_init` is not guaranteed ≥ `ts_event` — [data/index.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/data/index.md)
- Each `add_data()` creates an independent stream, which the engine sorts and then merges chronologically, instead of re-sorting a cumulative list — [apis-and-runs.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/apis-and-runs.md)
- Main loop per data point: (1) the simulated exchange updates its book and iterates the matching engine, filling existing orders; (2) the data engine dispatches to strategies (`on_quote`, `on_bar`, …); (3) venues are settled by draining queued commands and re-iterating matching until no eligible commands remain, so cascading orders settle in the same timestamp. "Resting orders see the incoming market before newly submitted orders do." Timer events batch by timestamp: all callbacks at T run, then venues settle for T, before advancing — [execution-flow.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/execution-flow.md)
- Timer-only backtests (no market data) are supported, and timers fire in chronological order — [execution-flow.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/execution-flow.md)
- `VirtualClock` is "a deterministic clock for controlled time advancement". It stores a manual timestamp, schedules `VirtualTimer`s, and returns due events without waiting for wall-clock time. It is thread-affine. `advance_time(to_time_ns, set_time)` returns due events in ascending order by timestamp and timer name, and **panics if `to_time_ns` < current time** ("time must be non-decreasing"), so there is no rewind — [crates/common/src/clock/virtual.rs](https://github.com/nautechsystems/nautilus_trader/blob/develop/crates/common/src/clock/virtual.rs)
- v2 renamed Rust `TestClock`/`TestTimer` to `VirtualClock`/`VirtualTimer` without aliases. `LiveClock` remains for live and sandbox — [RELEASES.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/RELEASES.md), [crates/common/src/live/clock.rs](https://github.com/nautechsystems/nautilus_trader/blob/develop/crates/common/src/live/clock.rs)
- Rewind is replaced by reset. `BacktestEngine.reset()` clears orders, positions, balances, component state, counters and timestamps, but keeps loaded data, instruments, venues and registered components, so parameter sweeps can reuse data — [apis-and-runs.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/apis-and-runs.md)
- Streaming large datasets:
  - Low-level API: loop `add_data(batch)`, `run(streaming=True)`, `clear_data()`, then `end()`. `run(streaming=True)` pauses when data is exhausted without finalizing or advancing timers past the batch.
  - High-level API: `BacktestNode` chunks catalog data automatically via `chunk_size` in [1, 1,000,000].
  - There is no generator-based `add_data_iterator()`.
  — [apis-and-runs.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/apis-and-runs.md)
- Streaming batches must keep all data for one timestamp together (BacktestNode does this automatically) — [execution-flow.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/execution-flow.md)
- Internally aggregated time bars close on a timer. `time_bars_build_delay` (µs) lets same-timestamp data arrive before the bar closes — [bar-execution.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/bar-execution.md)
- Running multiple `LiveNode`/`BacktestNode` instances concurrently in one process is not supported. Logging uses global state, and backtests switch the logging clock between static and real-time modes — [architecture.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/architecture.md)

**hftbacktest**
- Time is advanced by the strategy loop: `elapse(duration)` returns false at end of data. `elapse_bt(duration)` elapses only in backtest (ignored live) to simulate compute time, because "`elapse()` exclusively manages time during backtesting, meaning that factors such as computing time are not properly accounted for". Also available: `wait_order_response`, `wait_next_feed`, and `feed_latency()` / `order_latency()` accessors — [src/types.rs](https://github.com/nkaz001/hftbacktest/blob/master/hftbacktest/src/types.rs)
- Canonical loop: `while hbt.elapse(10_000_000) == 0: ...` (10 ms steps, in ns). README: "Complete tick-by-tick simulation with a customizable time interval or based on the feed and order receipt" — [README](https://github.com/nkaz001/hftbacktest/blob/master/README.rst)
- Two processors per asset, local and exchange, each reading the same data by its own timestamp column. A shared data cache lets "both the local processor and exchange processor … access the same or different data based on their timestamps without the need for reloading" — [backtest/data/reader.rs](https://github.com/nkaz001/hftbacktest/blob/master/hftbacktest/src/backtest/data/reader.rs)
- An `EventSet` of `EventIntent { timestamp, asset_no, kind }` "manages the event timestamps to determine the next event to be processed" across all assets (multi-asset, multi-exchange ordering) — [backtest/evs.rs](https://github.com/nkaz001/hftbacktest/blob/master/hftbacktest/src/backtest/evs.rs)
- Chunking: a data source can be a numpy file path, "loaded when needed and released when no Processor is reading the data". The `parallel_load(true)` builder option loads the next file in parallel with backtesting, trading memory for speed. `goto_end()` exists — [reader.rs](https://github.com/nkaz001/hftbacktest/blob/master/hftbacktest/src/backtest/data/reader.rs), [backtest/mod.rs](https://github.com/nkaz001/hftbacktest/blob/master/hftbacktest/src/backtest/mod.rs)
- `latency_offset` adjusts feed latency. It is intended for cross-exchange backtests where data was collected at a different site from where the strategy will run — [backtest/mod.rs](https://github.com/nkaz001/hftbacktest/blob/master/hftbacktest/src/backtest/mod.rs)

**Barter-rs**
- `EngineClock` trait with a `LiveClock` (`Utc::now()`) for live and a `HistoricalClock` for backtesting. The historical clock uses "processed event timestamps to estimate current historical time". — [engine/clock.rs](https://github.com/barter-rs/barter-rs/blob/develop/barter/src/engine/clock.rs)
- `HistoricalClock::time()` returns `time_exchange_last + (Utc::now() - time_live_last_event)`, so it adds real wall-clock elapsed time. Out-of-order events are logged, not applied — [engine/clock.rs](https://github.com/barter-rs/barter-rs/blob/develop/barter/src/engine/clock.rs)
- `EngineFeedMode::Iterator` (sync, blocking thread, default) or `Stream` (async tokio, "useful when running concurrent backtests at scale") — [system/builder.rs](https://github.com/barter-rs/barter-rs/blob/develop/barter/src/system/builder.rs)
- `run_backtests` runs many backtests concurrently over shared constant args (instruments, execution configs, market data) with per-run strategy/risk variations. The example uses NUM_BACKTESTS = 10000 — [backtest/mod.rs](https://github.com/barter-rs/barter-rs/blob/develop/barter/src/backtest/mod.rs), [examples/backtests_concurrent.rs](https://github.com/barter-rs/barter-rs/blob/develop/barter/examples/backtests_concurrent.rs)

### Inferences
- Nautilus's three-phase-per-timestamp contract (exchange consumes data, strategy reacts, venue settles until quiescent) is a clean, documentable spec that CCXT could adopt nearly verbatim.
- For CCXT's async-everything API, a hftbacktest-like "strategy pulls time" model (awaiting `watch*` resolves the next due event) maps naturally onto `watch*` futures. A virtual clock must still never read wall time; Barter's hybrid clock shows the nondeterminism trap.
- Rewind is not offered by any engine. Reset-and-replay is the pattern.

### Gaps
- Nautilus's cross-venue tie-breaking beyond the stable `ts_init` sort plus insertion order (e.g., identical `ts_init` across venues) is not further documented beyond the ordered-map guarantees in DST.

---

## Q3. Matching and fill models

### Takeaway
Nautilus's in-process `OrderMatchingEngine` supports L1/L2/L3 books. Recorded data is never mutated, with optional `liquidity_consumption` accounting. Explicit queue tracking comes from trades. Bars are converted to four synthetic ticks. A family of pluggable `FillModel`s covers probabilistic touch-fills, slippage and synthetic depth. hftbacktest centres on queue-position estimation: a risk-averse model, a family of probabilistic models with power/log functions, and L3 FIFO. It offers two exchange models (no-partial vs partial fill). None of the engines lets own orders move the replayed book (no market impact). Barter's MockExchange fills only market orders, instantly, at the requested price.

### Cited Findings
**NautilusTrader – book types and data applicability**
- Venue `book_type`: `L1_MBP` (default), `L2_MBP`, `L3_MBO`. `QuoteTick` and `Bar` update only L1 books. `OrderBookDelta(s)` update only L2/L3. `OrderBookDepth` updates all three. `TradeTick` triggers matching in all. Nautilus "cannot generate higher granularity data (L2 or L3) from lower-level data". With L2/L3 and no deltas, "orders may appear as though they are never filled" — [data-and-venues.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/data-and-venues.md)

**Fill prices**
- L2/L3: market-style orders walk crossed levels. Limit orders take crossed prices as taker or their limit price as maker. Partial fills occur when crossed size is insufficient — [fill-prices-and-matching.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/fill-prices-and-matching.md)
- L1: market-style orders fill displayed size and then any residual one tick worse (a deterministic rule, separate from probabilistic slippage). `MARKET_TO_LIMIT` rests the remainder at its first fill price — [fill-prices-and-matching.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/fill-prices-and-matching.md)
- Price protection: `price_protection_points` caps market and stop-market walks at ask + N·tick (buy) or bid − N·tick (sell). The sim config default is 0, meaning disabled — [fill-prices-and-matching.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/fill-prices-and-matching.md), [crates/backtest/src/config.rs](https://github.com/nautechsystems/nautilus_trader/blob/develop/crates/backtest/src/config.rs)

**Immutability and liquidity consumption**
- "A simulated fill never decrements the historical book." By default each matching iteration can reuse the full recorded size.
- With `liquidity_consumption=True`, the engine tracks `original_size - consumed` per level until fresh data at that level resets it. Example: a 1,000-unit passive buy limit gets 30 filled when a 30-unit ask crosses it, and 970 remain.
- Consumption tracking "estimates available size, not order priority".
- Trade-driven fills are "opportunistic: a print proves that liquidity existed momentarily".
— [fill-prices-and-matching.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/fill-prices-and-matching.md)

**Trade-driven execution**
- `trade_execution=True` (default) lets trades fill passive orders on the opposite side of the aggressor. `NO_AGGRESSOR` affects both sides.
- Fills are capped at `min(leaves_qty, trade.size)`. If the book lacks the trade price level, the fill uses the order's *limit* price, not the better trade price.
- L1 trades set both top-of-book sides to the trade price. After the iteration, matching references are restored from the quote baseline.
— [trade-execution.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/trade-execution.md)

**Queue position (`queue_position=True`, LIMIT orders only)**
- On acceptance, the order snapshots same-side displayed size at its price. Correct-side trades at that price reduce the quantity ahead, and only trade volume beyond the cleared queue fills.
- L2: DELETE clears the queue. UPDATE caps quantity ahead at the new size. Snapshots rebase, and new liquidity never pushes the order back.
- L3 MBO: per-order deletes and decreases ahead of the order advance it.
- Price amend resets the queue position. Quantity-only amend keeps it.
- The same flags work in sandbox.
- Limitations: independent per-order estimates, no hidden orders, and `NO_AGGRESSOR` trades reduce both sides, which is "optimistic".
— [trade-execution.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/trade-execution.md)

**Bars to ticks**
- Bar execution applies only when `bar_execution=True`, the venue is L1_MBP, and the bars are externally aggregated.
- Each bar becomes 4 synthetic updates with volume split evenly (remainder to close, minimum one `size_increment`). Order is O→H→L→C by default. With `bar_adaptive_high_low_ordering=True`, whichever extreme is closer to the open goes first; this is "a deterministic heuristic, not a reconstruction".
- Matching runs after each synthetic update. The complete bar is dispatched to strategies *after* the sweep, so orders submitted in `on_bar` see the close.
- There is no native next-bar-open fill mode, a look-ahead guard.
— [bar-execution.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/bar-execution.md)
- Stop and MIT gap handling with bars: if the bar *opens* beyond the trigger, the order fills at the open (a sell stop at 100 fills at 90 on a gap). If the path crosses intrabar, it fills at the trigger price — [fill-prices-and-matching.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/fill-prices-and-matching.md)

**FillModel**
- `prob_fill_on_limit` (default 1.0) applies when the price is touched but not crossed. `prob_slippage` (default 0.0) gives one tick adverse on each L1 fill (maker and taker alike) and is not applied on L2/L3. `random_seed` makes draws reproducible. `DefaultFillModel` is used when none is set.
- Built-ins: `BestPriceFillModel` (unlimited at best), `OneTickSlippageFillModel`, `ProbabilisticFillModel`, `TwoTierFillModel` (10 at best, rest +1 tick), `ThreeTierFillModel` (50/30/20), `LimitOrderPartialFillModel`, `SizeAwareFillModel`, `CompetitionAwareFillModel` (`liquidity_factor` default 0.3), `VolumeSensitiveFillModel`, `MarketHoursFillModel`.
- Custom Python models implement `is_limit_filled()` and `is_slipped()`, optionally `fill_limit_inside_spread()` and `get_orderbook_for_fill_simulation(...)`, which returns a synthetic `OrderBook`. Custom models are accepted only via low-level `add_venue`, and synthetic books bypass consumption tracking.
— [fill-models.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/fill-models.md)
- Model families: Fill, Fee (`MakerTakerFeeModel`, `FixedFeeModel`, `PerContractFeeModel`, option fee models), Latency (`StaticLatencyModel`), Margin — [behavioral_models.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/behavioral_models.md)
- Trade IDs are deterministic: `T-{FNV-1a(venue, raw_id, ts_init):016x}-{count:03d}` — [execution-flow.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/execution-flow.md)

**hftbacktest**
- "HftBacktest is a market-data replay-based backtesting tool, which means your order cannot make any changes to the simulated market, no market impact is considered" — [docs/order_fill.rst](https://github.com/nkaz001/hftbacktest/blob/master/docs/order_fill.rst)
- `NoPartialFillExchange` (default):
  - A buy fills fully if price ≥ best ask, or price > sell trade price, or (front of queue and price == sell trade price).
  - Taker orders fully fill at the best price "regardless of the quantity at the best".
  — [order_fill.rst](https://github.com/nkaz001/hftbacktest/blob/master/docs/order_fill.rst)
- `PartialFillExchange`:
  - At the front of the queue with price == trade price, the order is filled by the (remaining) trade quantity.
  - Taker orders fill against book quantity, although the replayed book does not change.
  — [order_fill.rst](https://github.com/nkaz001/hftbacktest/blob/master/docs/order_fill.rst)
- L3 processors: `l3_nopartialfillexchange.rs`, `l3_local.rs` — [backtest/proc](https://github.com/nkaz001/hftbacktest/tree/master/hftbacktest/src/backtest/proc)
- Queue models:
  - `RiskAdverseQueueModel` (the docs text says "RiskAverse"): cancellations happen only at the tail, and the order advances only on trades at its price.
  - `ProbQueueModel`: decreases are split between ahead and behind by probability, following Rigtorp 2013 and a quant.SE post. Variants are `PowerProbQueueFunc`/`2`/`3` and `LogProbQueueFunc`/`2`. The function must satisfy f(0)=0 and f(1)=1.
  - Custom models implement the `QueueModel` / `L3QueueModel` traits.
  — [order_fill.rst](https://github.com/nkaz001/hftbacktest/blob/master/docs/order_fill.rst)
- Queue formulas:
  - Prob functions: `PowerProbQueueFunc` uses f(back)/(f(back)+f(front)) with f(x)=x^n. `LogProbQueueFunc` uses the same form with f(x)=ln(1+x). `…Func2` uses f(back)/f(back+front). `PowerProbQueueFunc3` uses 1 − f(front/(front+back)).
  - On a level decrease `chg` (net of this order's cumulative trade quantity), the front estimate becomes `est_front = front − (1−p)·chg + min(back − p·chg, 0)`, capped at the new quantity. Increases don't move front.
  - An `L3FIFOQueueModel` exists for MBO.
  — [backtest/models/queue.rs](https://github.com/nkaz001/hftbacktest/blob/master/hftbacktest/src/backtest/models/queue.rs)
- L2 vs L3 comparison: "Level-2 estimates queue positions using a model, whereas Level-3 determines queue positions directly from the order data". Even L3 CME data lacks implied orders — [Level-3 Backtesting.ipynb](https://github.com/nkaz001/hftbacktest/blob/master/examples/Level-3%20Backtesting.ipynb)
- Accelerated mode (a tutorial technique): precompute fill conditions per interval, ignoring queue position and order-response latency, with strict crossing required. Result: "accelerated backtest: 416 ms; full backtest: 1 min 49 s — roughly 260× faster", with differences largest where queue fills matter (large-tick assets) — [Accelerated Backtesting.ipynb](https://github.com/nkaz001/hftbacktest/blob/master/examples/Accelerated%20Backtesting.ipynb)

**Barter-rs**
- `MockExchange::validate_order_kind_supported` rejects anything but `OrderKind::Market` ("MockExchange does not supported OrderKind").
- `open_order` fills immediately at `request.state.price × quantity` plus `fees_percent`, checking balance sufficiency. It does not consult any order book.
- `cancel_order` is `unimplemented!()`.
— [barter-execution/src/exchange/mock/mod.rs](https://github.com/barter-rs/barter-rs/blob/develop/barter-execution/src/exchange/mock/mod.rs)

### Inferences
- CCXT can reuse Nautilus's layered approach: a book-type-aware matcher, an immutable replay book with an optional consumption ledger, trade-evidence fills capped at print size, and pluggable fill-model hooks. The hftbacktest queue-model math is small and self-contained enough to port into TS (transpilable), including the power/log functions.
- Barter's mock is a paper-trading stub, not a matching engine. It is not a design reference for fills.

### Gaps
- Neither Nautilus nor hftbacktest implements market impact or book perturbation from own orders. I found no published empirical calibration of Nautilus fill models against live fills.

---

## Q4. Latency models

### Takeaway
hftbacktest has the most complete latency treatment, with three separate legs: feed latency (from dual timestamps), order entry, and order response. `IntpOrderLatency` interpolates recorded latency. Nautilus has a single `StaticLatencyModel`: a base delay plus insert, update and delete legs, applied to inbound commands through a venue inflight queue, with carefully specified release rules. Barter sleeps real wall-clock time with tokio.

### Cited Findings
- hftbacktest latency legs: feed latency (exchange send to local receipt, captured via `exch_ts`/`local_ts`), order entry latency (request to matching engine), and order response latency (matching engine to local, which also affects fill notifications) — [docs/latency_models.rst](https://github.com/nkaz001/hftbacktest/blob/master/docs/latency_models.rst)
- `ConstantLatency`, and `IntpOrderLatency`, which interpolates recorded rows of `req_ts, exch_ts, resp_ts`. The latter is "the most accurate among the provided models if you have the data with a fine time interval"; collect the data "by submitting unexecutable orders regularly". A custom `LatencyModel` trait is available — [latency_models.rst](https://github.com/nkaz001/hftbacktest/blob/master/docs/latency_models.rst)
- Without recorded order latency, generate it from feed latency (the tutorial models order latency as proportional to feed latency, with a multiplier and offset, resampled to ~1 s) — [Order Latency Data.ipynb](https://github.com/nkaz001/hftbacktest/blob/master/examples/Order%20Latency%20Data.ipynb)
- The author notes that latency and the queue model are the two main sources of backtest/live discrepancy. Artificially lowering latency can quantify the value of infrastructure or tier upgrades — [debugging_backtesting_and_live_discrepancies.rst](https://github.com/nkaz001/hftbacktest/blob/master/docs/debugging_backtesting_and_live_discrepancies.rst)
- Nautilus `StaticLatencyModel` "adds a base delay to separately configured insert, update, and cancel delays". It is the only latency model exposed to Python — [behavioral_models.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/behavioral_models.md)
- Nautilus inflight queue: a due command is released by market data for *the same instrument*, by a timer, by a funding-settlement point, or by the shutdown drain. "Market data for another instrument does not activate an older command against stale market state." With bar-only data, a delayed order sees the first bar at or after arrival *after* its OHLC sweep — [execution-flow.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/execution-flow.md), [bar-execution.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/bar-execution.md)
- Sandbox latency covers the inbound leg only. Venue-generated events (accepts, fills, cancels) are not delayed. A cancel-all cancels only orders the venue has "received". Contingent orders (OTO/OCO) respect venue receipt — [execution-flow.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/execution-flow.md)
- Barter `MockExecutionConfig { latency_ms, fees_percent, … }`. Responses and notifications are delayed by `tokio::time::sleep(latency_ms)`, and the exchange time is set to request time + latency_ms/2 — [barter-execution mock](https://github.com/barter-rs/barter-rs/blob/develop/barter-execution/src/exchange/mock/mod.rs), [client/mock](https://github.com/barter-rs/barter-rs/blob/develop/barter-execution/src/client/mock/mod.rs)

### Inferences
- The minimum viable design for CCXT is separate `feedLatency` (from recorded `localTs - exchTs`) plus entry and response latency, with a pluggable model (constant, or interpolated from recorded probes).
- Nautilus's same-instrument release rule is an important subtle correctness point to copy.
- Nautilus's lack of response-leg latency in the sandbox is a known asymmetry.

### Gaps
- No stochastic or heavy-tail latency model ships in either engine (only constant and interpolated).

---

## Q5. Code parity across backtest, sandbox/paper and live; in-process vs out-of-process

### Takeaway
All three engines run the strategy in-process with the simulator. Nautilus has the strongest parity story: one `NautilusKernel` shared by backtest, sandbox and live, and the sandbox reuses the same `OrderMatchingEngine` against live data. hftbacktest runs the same `Bot`-trait algorithm in backtest and live (Rust only), with live orders going through a separate `connector` process over shared-memory IPC. Barter targets parity through its `ExecutionClient` trait, but the open-source repo has only the mock client (the Binance client file is empty).

### Cited Findings
- Nautilus: "Backtest, sandbox, and live systems share the `NautilusKernel` struct from the `nautilus-system` crate". Environment contexts are `Backtest` (historical data, simulated execution), `Sandbox` (real-time data, simulated execution) and `Live` — [architecture.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/architecture.md)
- "The same strategy and execution-algorithm code can run across backtest and live environments." The docs list differences that simulation may not reproduce: venue capabilities, transport (unknown command outcomes), timing (no global FIFO live), persistence, external activity, and reconciliation — [live.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/live.md)
- Sandbox crate: "a simulated execution client that uses the `OrderMatchingEngine` to simulate order execution against live market data", advertising "research-to-live semantic parity" — [crates/adapters/sandbox/src/lib.rs](https://github.com/nautechsystems/nautilus_trader/blob/develop/crates/adapters/sandbox/src/lib.rs)
- The sandbox shares matching flags (`queue_position`, `liquidity_consumption`, `book_type`) and `latency_model` via `SandboxExecutionClientConfig`. Deterministic trade IDs are used in both backtest and sandbox — [trade-execution.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/trade-execution.md), [execution-flow.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/execution-flow.md)
- Nautilus backtest entry points: `BacktestEngine` (low-level) and `BacktestNode` (config/catalog-driven). Live uses `LiveNode` (v2 naming; the architecture doc refers to `LiveNode`/`BacktestNode`) — [apis-and-runs.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/apis-and-runs.md), [architecture.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/architecture.md)
- hftbacktest: "Deployment of a live trading bot for quick prototyping and testing using the same algorithm code: currently for Binance Futures and Bybit. (Rust-only)" — [README](https://github.com/nkaz001/hftbacktest/blob/master/README.rst)
- hftbacktest Connector: a separate executable (`connector --name bf --connector binancefutures --config …`). It "communicates with bots via shared memory, both Connector and the bots must run on the same machine". Any process following the IPC protocol can serve as a connector. Binance Futures is "tested on the Testnet" and Bybit is "under development", with the warning "Use at your own risk". Connector sources include binancefutures, binancespot and bybit — [connector/README.md](https://github.com/nkaz001/hftbacktest/blob/master/connector/README.md), [connector/src](https://github.com/nkaz001/hftbacktest/tree/master/connector/src)
- hftbacktest's backtest itself runs in-process (Numba JIT in Python via Rust bindings, or pure Rust) — [README](https://github.com/nkaz001/hftbacktest/blob/master/README.rst)
- Barter: "Rust framework for building high-performance live-trading, paper-trading and back-testing systems". Its example "Paper Trading With Live Market Data & Mock Execution" pairs a live barter-data stream with the MockExchange — [barter/README.md](https://github.com/barter-rs/barter-rs/blob/develop/barter/README.md)
- barter-execution: "execute (live or mock) orders … MockExchange and MockExecutionClient to assist with backtesting and paper-trading". The `ExecutionClient` trait provides a unified interface to "every real or MockExchange" — [barter-execution/src/lib.rs](https://github.com/barter-rs/barter-rs/blob/develop/barter-execution/src/lib.rs)
- As of develop@9770b27 the only `ExecutionConfig` variant is `Mock(MockExecutionConfig)`, and `barter-execution/src/client/binance/mod.rs` is a 1-line empty file — [system/config.rs](https://github.com/barter-rs/barter-rs/blob/develop/barter/src/system/config.rs), [client/binance/mod.rs](https://github.com/barter-rs/barter-rs/blob/develop/barter-execution/src/client/binance/mod.rs)
- The Barter MockExchange runs as an in-process tokio task receiving `MockExchangeRequest`s over an mpsc channel — [exchange/mock/mod.rs](https://github.com/barter-rs/barter-rs/blob/develop/barter-execution/src/exchange/mock/mod.rs)

### Inferences
- The shared pattern is one strategy API with pluggable data and execution clients, and a simulated venue that implements the same execution-client interface. For CCXT, the equivalent is a simulated `Exchange` subclass that implements `createOrder`/`watchOrders`/`fetchBalance` etc. over a replay feed. Paper trading is the same simulated venue fed by live `watch*` streams, which mirrors Nautilus's sandbox.
- hftbacktest's out-of-process connector solves a latency and isolation problem that CCXT does not need for simulation.

### Gaps
- It is unclear whether Barter maintainers ship live execution clients in a separate or private repo; only the open-source state was verified.

---

## Q6. Fees, funding, margin and liquidation for perpetuals

### Takeaway
Only Nautilus models the perpetuals lifecycle end to end. It has venue-level fee models, funding settlement driven by `FundingRateUpdate` data at `next_funding_ns`, margin models, and an opt-in maintenance-margin liquidation. hftbacktest has fee models and linear/inverse asset valuation, but no funding, margin or liquidation; funding can only be carried as custom events. Barter's mock has a flat percent fee and spot-style balances.

### Cited Findings
- Nautilus fees belong to the venue: "Every venue needs an explicit `fee_model`, including an explicit zero-rate model" (e.g., `MakerTakerFeeModel(maker_rate, taker_rate)`) — [apis-and-runs.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/apis-and-runs.md)
- Nautilus funding:
  - With `next_funding_ns`, the exchange stores the latest rate and the backtest clock emits one `FundingSettlement` at that time. Without it, settlement happens only when `ts_event` hits the interval boundary.
  - A positive rate debits longs and credits shorts, via `PositionAdjusted` (Funding) plus an `AccountState` update.
  - "Perpetual funding remains part of `SimulatedExchange` and is not a simulation module."
  — [accounts-and-margin.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/accounts-and-margin.md), [simulation-modules.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/simulation-modules.md)
- Nautilus account types are `CASH`, `MARGIN` and `BETTING`. Margin models are `LeveragedMarginModel` (default, reduced by leverage) and `StandardMarginModel` (fixed initial/maintenance percentages) — [accounts-and-margin.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/accounts-and-margin.md)
- Nautilus liquidation:
  - Config: `liquidation_enabled` (default **false**), `liquidation_trigger_ratio` (equity/maintenance margin, default 1.0), `liquidation_cancel_open_orders` (default true).
  - `process_liquidations` closes positions only in the breached settlement currency. A code note says a future `cross_margin_mode` could liquidate across currencies. Positions close "at best bid/ask" through synthetic `LIQUIDATION-…` orders.
  — [crates/backtest/src/config.rs](https://github.com/nautechsystems/nautilus_trader/blob/develop/crates/backtest/src/config.rs), [crates/backtest/src/exchange.rs](https://github.com/nautechsystems/nautilus_trader/blob/develop/crates/backtest/src/exchange.rs), [matching_engine/mod.rs](https://github.com/nautechsystems/nautilus_trader/blob/develop/crates/execution/src/matching_engine/mod.rs)
- Nautilus `MarkPriceUpdate` covers "prices for margining, liquidation checks, and unrealized PnL calculations" — [data/mark_price_update.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/data/mark_price_update.md)
- Nautilus `SimulationModule` extension point (pre_process, process, acknowledge) returns `Money` adjustments. Built-ins are FX rollover and CFD swap — [simulation-modules.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/simulation-modules.md)
- hftbacktest fee models: `TradingValueFeeModel` (maker/taker rate on value), `TradingQtyFeeModel`, `FlatPerTradeFeeModel`, and `CommonFees`/`DirectionalFees` (e.g., stamp duty). Asset types: `LinearAsset` and `InverseAsset` (notional in quote) — [models/fee.rs](https://github.com/nkaz001/hftbacktest/blob/master/hftbacktest/src/backtest/models/fee.rs), [assettype.rs](https://github.com/nkaz001/hftbacktest/blob/master/hftbacktest/src/backtest/assettype.rs)
- hftbacktest backtest source (`hftbacktest/src/backtest`) contains no funding, margin or liquidation logic (grep verified). The funding rate appears only as custom event 102 in the Binance converter — [binancefutures.py](https://github.com/nkaz001/hftbacktest/blob/master/py-hftbacktest/hftbacktest/data/utils/binancefutures.py)
- Barter mock: a buy requires quote balance ≥ price·qty·(1+fees_percent). It asserts `balance.total == balance.free` because only market orders are supported. There is no leverage or margin logic — [exchange/mock/mod.rs](https://github.com/barter-rs/barter-rs/blob/develop/barter-execution/src/exchange/mock/mod.rs)

### Inferences
- CCXT can source funding history (`fetchFundingRateHistory`) and mark price, and has `market.maker/taker` fees. That is enough to replicate Nautilus-style data-driven funding settlement and a maintenance-margin liquidation check. CCXT's `fetchLeverageTiers`/`fetchMarketLeverageTiers` could supply tiered maintenance margin, which none of the three engines models.

### Gaps
- Nautilus liquidation does not model tiered maintenance margin, insurance fund or ADL in backtests (not documented). ADL/liquidation are handled only as external events in live reconciliation.

---

## Q7. Determinism, reproducibility and performance

### Takeaway
Nautilus makes explicit, auditable determinism guarantees: stable `ts_init` sort, ordered maps, seeded fill models, deterministic trade IDs, and a DST (deterministic simulation testing) contract. hftbacktest is deterministic by construction (single-threaded replay, no RNG in the default models) and fast, but prioritizes accuracy over speed. Barter's historical clock reads wall time, and its mock latency uses real sleeps, so results can depend on run speed. No engine publishes a canonical events/second benchmark for backtesting.

### Cited Findings
- Nautilus DST: "one seed determines task scheduling, timer firings, and random values. Two runs with the same seed, binary, configuration, and platform produce identical observable behavior." `BacktestEngine.venues` and `SimulatedExchange.matching_engines` preserve iteration order for settlement, expiration, liquidation and seeded `FillModel` draws — [dst.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/dst.md)
- The Nautilus `random_seed` covers only the model's own draws — "It does not configure randomness or execution ordering outside that model" — [fill-prices-and-matching.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/fill-prices-and-matching.md)
- Nautilus deterministic `TradeId`s are "Deterministic across runs … so downstream dedup and golden-output comparisons stay stable". Venue order and position IDs are random only if `use_random_ids` is set — [execution-flow.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/execution-flow.md)
- Nautilus performance claims: "Rust core with the mimalloc allocator", "Engine fast enough to train AI trading agents (RL/ES)", and a "deterministic event-driven runtime". Rust benchmarks exist for hot paths (matching, message bus, serialization), but no backtest events/sec figure is published in the docs — [README](https://github.com/nautechsystems/nautilus_trader/blob/develop/README.md), [nautilus-backtest on docs.rs](https://docs.rs/nautilus-backtest/latest/nautilus_backtest/)
- hftbacktest accuracy-vs-speed statement: "hftbacktest provides highly accurate results, but it is relatively slow". The accelerated variant was 260× faster in the tutorial (416 ms vs 1 min 49 s) — [Accelerated Backtesting.ipynb](https://github.com/nkaz001/hftbacktest/blob/master/examples/Accelerated%20Backtesting.ipynb)
- hftbacktest philosophy: backtests should neither be overly pessimistic nor optimistic, and should be validated so that the backtest of a live period "closely align[s] with the actual results" — [README](https://github.com/nkaz001/hftbacktest/blob/master/README.rst)
- Barter claims "Fast … Minimal allocations. Data-oriented state management system with direct index lookups" with O(1) indexed `EngineState` — [barter/README.md](https://github.com/barter-rs/barter-rs/blob/develop/barter/README.md)
- Barter `HistoricalClock::time()` adds `Utc::now()` deltas, and the mock exchange sleeps `latency_ms` of real time — [engine/clock.rs](https://github.com/barter-rs/barter-rs/blob/develop/barter/src/engine/clock.rs), [exchange/mock/mod.rs](https://github.com/barter-rs/barter-rs/blob/develop/barter-execution/src/exchange/mock/mod.rs)

### Inferences
- Barter backtests are not bit-reproducible under load: the strategy-visible time and the ordering of mock responses can vary between runs. This is an anti-pattern for CCXT.
- CCXT's design should require: (a) a virtual clock that never reads wall time in backtest; (b) a stable sort plus a documented tie-break; (c) seeded RNG scoped per model; (d) deterministic IDs derived from (venue, seq, ts).

### Gaps
- No independent, like-for-like throughput benchmark comparing the three engines was found.

---

## Q8. Known limitations called out by the authors

### Takeaway
Every author states that replay cannot capture market impact or hidden liquidity. Nautilus adds granularity mismatches, bar path heuristics and queue-model optimism. hftbacktest adds its no-impact assumption and unrealistic large taker fills. Barter's limits are implicit in its code (market orders only, unimplemented cancel).

### Cited Findings
- Nautilus: a recorded book "cannot show how a simulated order would have changed the market". It cannot upsample L1 to L2/L3. Bars cannot establish intrabar order, spread, depth or queue position — [data-and-venues.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/data-and-venues.md)
- Nautilus: queue tracking applies to LIMIT orders only. Estimates are independent per order. "Historical data cannot reveal hidden orders or every venue-specific priority rule". NO_AGGRESSOR handling is optimistic — [trade-execution.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/trade-execution.md)
- Nautilus: the adaptive OHLC path is a heuristic backed only by an exploratory EUR/USD analysis. There is no next-bar-open fill mode — [bar-execution.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/bar-execution.md)
- Nautilus: in the Python high-level config, fill models are built-in only (no import-path loading), latency is `StaticLatencyModel` only, and setters for `VolumeSensitiveFillModel`/`MarketHoursFillModel` are not exposed — [fill-models.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/fill-models.md), [behavioral_models.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/behavioral_models.md)
- Nautilus: shutdown semantics mean `on_stop` commands get no priority over inflight commands. Strategy handlers don't fire for post-stop fills. Deterministic flattening requires an exit-only state before stopping — [execution-flow.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/backtesting/execution-flow.md)
- Nautilus: multiple nodes can't run concurrently in one process (global logging state) — [architecture.md](https://github.com/nautechsystems/nautilus_trader/blob/develop/docs/concepts/architecture.md)
- hftbacktest: no market impact. Taker orders fill at the best price regardless of size (NoPartialFill), or against an unchanged book (PartialFill), which "may cause unrealistic fill simulations if you attempt to execute a large quantity" — [order_fill.rst](https://github.com/nkaz001/hftbacktest/blob/master/docs/order_fill.rst)
- hftbacktest: discrepancies with live come mainly from latency and the queue model. Start live with small size and scale up while comparing — [debugging discrepancies](https://github.com/nkaz001/hftbacktest/blob/master/docs/debugging_backtesting_and_live_discrepancies.rst)
- hftbacktest live: "Live trading features may not function correctly in all cases". Live is Rust-only — [connector/README.md](https://github.com/nkaz001/hftbacktest/blob/master/connector/README.md), [README](https://github.com/nkaz001/hftbacktest/blob/master/README.rst)
- hftbacktest maintenance: the last commit on master was 23 Dec 2025, about 9 months before this snapshot — [repo](https://github.com/nkaz001/hftbacktest)
- Barter: the MockExchange supports only Market orders and `cancel_order` is `unimplemented!()` — [exchange/mock/mod.rs](https://github.com/barter-rs/barter-rs/blob/develop/barter-execution/src/exchange/mock/mod.rs)

### Inferences
- A CCXT simulator should surface these assumptions explicitly as configuration: book type, queue model, consumption on/off, bar path, and latency legs. It should report which assumptions were active in each run's result metadata, as Nautilus effectively does via venue config.

### Gaps
- I found no author talks or blog posts beyond the repository docs. The docs sites and GitHub web UI were unreachable from this environment, so rendered-site-only content (e.g., hosted tutorials not in the repo) was not checked.
