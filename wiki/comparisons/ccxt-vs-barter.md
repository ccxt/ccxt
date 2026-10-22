<!-- title: CCXT vs Barter -->
<!-- description: Barter is a Rust framework with a trading engine and backtester over a handful of venues. CCXT is an MIT library covering 104 venues, now including a Rust target. -->
<!-- group: Multi-exchange libraries and frameworks -->
<!-- summary: Barter gives Rust an event-driven engine, risk components and a backtester over 8 streaming venues. CCXT now has a Rust target too, covering 104 venues with unified order entry, but no engine. -->
<!-- weight: 42 -->

# CCXT vs Barter

[Barter](https://github.com/barter-rs/barter-rs) is an "open-source Rust framework for building event-driven live-trading & backtesting systems". It is not one crate but five — Barter (the engine), Barter-Instrument, Barter-Data, Barter-Execution and Barter-Integration — and only two of them, Barter-Data and Barter-Execution, sit on the same layer as [CCXT](/docs/manual).

That is the first thing to be clear about, because it decides most of the comparison. **Barter gives you a trading system; CCXT gives you the venues.** Barter ships an event loop, pluggable Strategy and RiskManager components, indexed position state, a backtester and performance metrics — and streams from eight venues. CCXT ships no engine, no strategy abstraction and no backtester — and reaches 104 exchanges with unified order entry on every one. So: **is the hard part of your system the trading logic, or the connectivity?**

Until recently there was a second question underneath that one — whether you could use CCXT from Rust at all. You can now. CCXT ships a Rust target at the same venue parity as its other languages: `ccxt` carries the typed REST wrappers, `ccxt-pro` the `watch*` venues and `ccxt-prediction` the prediction markets, all on a shared `ccxt-base` engine, async on Tokio, and the Rust build is compiled, clippy-linted and run against the base, id and static request/response suites in CI on every push. So the comparison is no longer "Rust or not" — it is engine versus venues, in the same language.

## TL;DR

- **Pick Barter** if you are building in Rust and want the framework, not just the pipes: an Engine with `Strategy` and `RiskManager` traits, `TradingSummary` metrics (PnL, Sharpe, Sortino, drawdown), an audit stream for out-of-band monitoring, and a backtester that runs your live code path against mock components.
- **Pick CCXT** if the connectivity is your bottleneck: 104 exchanges with REST, 76 with WebSocket, unified order entry, balances, positions and funding on all of them — in Rust, or in TypeScript, JavaScript, Python, PHP, C#/.NET, Go or Java, from the same source.
- **Both are Rust crates now, so pick on what they do.** Barter is the framework — engine, strategy, risk, backtester — over 8 streaming venues. CCXT is the connectivity — 104 REST exchanges and 76 streaming ones — with no engine. Neither replaces the other.
- **Read Barter's disclaimer before you scope around it.** Its README states that the software is "provided solely for educational and research purposes" and is "not intended, designed, tested, verified or certified for commercial deployment, live trading, or production use of any kind." That is the author's own statement of what the project is for.

## At a glance

| | **CCXT** | **Barter** |
| --- | --- | --- |
| What it is | unified exchange connectivity library | event-driven trading framework (5 crates) |
| Trading engine, strategy and risk components | no — you write the loop | yes — `Engine`, `Strategy`, `RiskManager` |
| Backtester | no | yes, including concurrent backtest utilities |
| Performance metrics | no | `TradingSummary` — PnL, Sharpe, Sortino, drawdown |
| Streaming venues | **76** exchanges with `watch*` methods | 8 — Binance, Bitfinex, BitMEX, Bybit, Coinbase, Gate.io, Kraken, OKX (15 exchange/instrument constructors) |
| REST venues | **104** exchanges | Barter-Data is WebSocket-first |
| Order entry | unified `create_order` on every supported venue | `ExecutionClient` trait; the client published in `barter-execution` is `mock` |
| Stream kinds | order book, trades, tickers, OHLCV, bids/asks, mark prices, liquidations, plus private streams | `PublicTrades`, `OrderBooksL1`, `OrderBooksL2`, `OrderBooksL3`, `Liquidations`, `Candles` as `SubKind` variants |
| Private / account streams | `watch_orders`, `watch_balance`, `watch_my_trades`, `watch_positions` | `account_stream` on the `ExecutionClient` trait |
| Languages | Rust, plus TypeScript, JavaScript, Python, PHP, C#/.NET, Go and Java from one source | Rust |
| Rust venue coverage | 104 REST exchanges, 76 WebSocket venues, 7 prediction venues | 8 streaming venues |
| Rust crates | `ccxt`, `ccxt-pro`, `ccxt-prediction` over `ccxt-base` | `barter`, `barter-data`, `barter-execution`, `barter-instrument`, `barter-integration` |
| Raw endpoint access | yes — every documented endpoint as an implicit method (808 on Binance) | Barter-Integration provides REST/WebSocket building blocks |
| Latest release | continuous — v{{CCXT_VERSION}} | barter 0.14.0, barter-data 0.13.0, barter-execution 0.9.0 — all 20 August 2026 |
| Popularity | 43.8k GitHub stars · 4.7M PyPI + 494k npm installs/month | 2.3k GitHub stars · 91.2k crates.io downloads all-time for `barter` (1.9k in the last 90 days) |
| Licence | MIT | MIT |
| Stated scope | production library | "solely for educational and research purposes" per its README |
| Support | Discord, Telegram, GitHub issues — usually same-day | Discord, GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `rust/` workspace in the CCXT source tree and `.github/workflows/rust.yml`, the barter-rs repository README, the barter-data and barter-execution crate READMEs and sources on the `develop` and `main` branches, docs.rs for barter-execution 0.9.0 and barter-instrument 0.3.3, and the crates.io, npm and PyPI registries.</sub>

## The same job, written both ways

### Stream public trades from several venues

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def stream(exchange_id, symbol):
    exchange = getattr(ccxt.pro, exchange_id)()
    while True:
        trades = await exchange.watch_trades(symbol)
        for t in trades:
            print(exchange_id, t['symbol'], t['side'], t['amount'], t['price'])

async def main():
    await asyncio.gather(stream('binance', 'BTC/USDT'),
                         stream('okx', 'BTC/USDT'),
                         stream('bybit', 'BTC/USDT'))

asyncio.run(main())
```

#### **Barter**

```text
let streams = Streams::<PublicTrades>::builder()
    .subscribe([
        (BinanceSpot::default(), "btc", "usdt", InstrumentKind::Spot, PublicTrades),
        (BinanceSpot::default(), "eth", "usdt", InstrumentKind::Spot, PublicTrades),
    ])
    .subscribe([
        (Okx, "btc", "usdt", InstrumentKind::Spot, PublicTrades),
    ])
    .subscribe([
        (BybitSpot::default(), "btc", "usdt", InstrumentKind::Spot, PublicTrades),
    ])
    .init()
    .await
    .unwrap();

let mut joined_stream = streams.select_all();
while let Some(event) = joined_stream.next().await {
    println!("{event:?}");
}
```

<!-- tabs:end -->

Both normalise. Barter's `StreamBuilder` is declarative and the venue, instrument kind and subscription kind are checked at compile time — an unsupported combination does not build. CCXT resolves the exchange at runtime from a string, which is what lets `exchange_id` be a configuration value and the same loop cover 76 venues.

Each call to `subscribe()` in Barter opens a separate WebSocket connection, which its own examples use deliberately to isolate high-volume instruments; CCXT pools one client per URL and multiplexes subscriptions over it.

### Keep a live level-2 order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.binance()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Barter**

```text
let mut streams = Streams::<OrderBooksL2>::builder()
    .subscribe([
        (BinanceSpot::default(), "btc", "usdt", MarketDataInstrumentKind::Spot, OrderBooksL2),
    ])
    .init()
    .await
    .unwrap();

let mut l2_stream = streams
    .select(ExchangeId::BinanceSpot)
    .unwrap()
    .with_error_handler(|error| warn!(?error, "MarketStream generated error"));

while let Some(event) = l2_stream.next().await {
    info!("{event:?}");
}
```

<!-- tabs:end -->

Both maintain the book for you rather than handing you raw deltas — this is the part that is genuinely hard, and both projects have done it. The difference is reach: Barter-Data's published table advertises `OrderBooksL2` for BinanceSpot and BinanceFuturesUsd, and `OrderBooksL1` for those two plus Kraken. CCXT's `watch_order_book` is implemented on all 76 of its WebSocket exchanges, with the venue's checksum verified where one is published.

### Turn a signal into an order

This is where the two projects stop being comparable, so the honest version shows each doing its own job.

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.binance({'apiKey': '...', 'secret': '...'})
exchange.load_markets()

amount = exchange.amount_to_precision('BTC/USDT', 0.001)
price = exchange.price_to_precision('BTC/USDT', 60000)

order = exchange.create_order('BTC/USDT', 'limit', 'buy', amount, price)
print(order['id'], order['status'])
exchange.cancel_order(order['id'], 'BTC/USDT')
```

#### **Barter**

```text
let args = SystemArgs::new(
    &instruments,
    executions,
    LiveClock,
    DefaultStrategy::default(),
    DefaultRiskManager::default(),
    market_stream,
);

let mut system = SystemBuilder::new(args)
    .audit_mode(AuditMode::Enabled)
    .trading_state(TradingState::Disabled)
    .build::<EngineEvent, DefaultGlobalData, DefaultInstrumentMarketData>()?
    .init_with_runtime(tokio::runtime::Handle::current())
    .await?;

// the Engine routes market events through Strategy and RiskManager,
// and issues orders through the configured execution client
system.trading_state(TradingState::Enabled);
system.close_positions(InstrumentFilter::None);
```

<!-- tabs:end -->

CCXT's is a function call: you decided, now send it, and the same call works on any of 104 venues. Barter's is a system: you hand the engine a strategy and a risk manager, and it decides and sends on your behalf, tracks the resulting positions, and can be enabled, disabled and commanded from outside the process.

If you want the second shape with CCXT, you write it. If you want CCXT's breadth in Barter, you implement its `ExecutionClient` and `MarketStream` traits per venue — the crates are explicitly designed for that, and it is real work per exchange.

## Where the differences actually bite

### Venue coverage

Barter-Data's README publishes its supported subscriptions as a table: 15 exchange/instrument constructors across eight distinct venues — Binance (spot and USD-M futures), Bitfinex, BitMEX, Bybit (spot and USD perpetuals), Coinbase, Gate.io (six spot, futures, perpetual and options variants), Kraken and OKX. Twelve of those fifteen rows advertise `PublicTrades` only.

Barter-Instrument's `ExchangeId` enum is wider — 42 variants including Bitget, Bitvavo, Cryptocom, Deribit, HTX, KuCoin, MEXC and Poloniex — but an identifier is not an integration; the streaming implementations are the ones in the table.

CCXT implements 104 exchanges over REST and 76 over WebSocket, plus 7 prediction-market venues in `ccxt.prediction`. Adding a venue is a change of identifier, not a new integration:

```python
for exchange_id in ['binance', 'bybit', 'okx', 'coinbase', 'kraken', 'hyperliquid']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT')['last'])
```

### The execution layer

Barter-Execution is built around an `ExecutionClient` trait — `account_snapshot`, `account_stream`, `open_order`, `cancel_order`, `fetch_balances` and their batch forms. That trait is a good abstraction, and the crate ships a feature-rich `MockExchange` and `MockExecutionClient` behind it for backtesting and paper trading. In barter-execution 0.9.0, `mock` is the execution client the crate exposes publicly; the source tree also declares a private `binance` module, whose file is empty.

CCXT implements order entry as a first-class unified API on every exchange it supports, including the parts that are easy to underestimate — trigger, stop-loss, take-profit, trailing, post-only and reduce-only orders, leverage and margin mode, positions, funding rates and transfers, all with the same names on the next venue.

### The scope the authors declare

Barter's README carries an explicit legal disclaimer. Section 1, headed EDUCATIONAL PURPOSE, reads: "This software and related documentation ("Software") are provided solely for educational and research purposes. The Software is not intended, designed, tested, verified or certified for commercial deployment, live trading, or production use of any kind." Contributors are asked to accept the same terms.

That is a statement of intent by the author, not a bug report, and it is more forthcoming than most projects are. It is also the kind of thing a procurement or legal review will find, so it is better read at the start of an evaluation than at the end. CCXT is MIT-licensed and carries the standard MIT warranty disclaimer with no comparable scope limitation.

### One API, and now Rust is one of its targets

CCXT is written once in TypeScript and transpiled, with the same method names, arguments and return structures in every target — `fetch_ticker` in Python, `fetchTicker` in TypeScript, `FetchTicker` in Go and C#, all returning the same [ticker structure](/docs/manual#ticker-structure). A strategy researched in a Python notebook moves to a Go or C# execution service without a second data model.

Rust is now one of those targets. `rust/ccxt` exposes typed wrappers that return native Rust types rather than dynamic values, `rust/ccxt-pro` carries the 76 `watch*` venues and `rust/ccxt-prediction` the prediction markets, all over a shared `ccxt-base` engine, async on Tokio:

```text
use ccxt::{Binance, Params};

let mut exchange = Binance::new(None);
exchange.load_markets(false).await;

let ticker = exchange.fetch_ticker("BTC/USDT", Params::none()).await?;
println!("{} {:?}", ticker.symbol, ticker.last);
```

The difference that remains is shape, not language. Barter's crates give you an engine and expect you to bring venues it already adapts; CCXT's give you venues and expect you to bring the engine.

Barter is Rust and only Rust. That is a deliberate and coherent choice — see below — but it does mean the research and execution halves of a team share one language or build a bridge.

### History, rate limits and the REST surface

Barter-Data is a WebSocket integration library, and Barter-Execution reaches REST for account snapshots and order requests. Neither is a general REST client for a venue's historical endpoints.

CCXT unifies both directions: `fetch_ohlcv` to backfill candles and `watch_ohlcv` to continue live, returning the same structure, so the code downstream cannot tell which produced the bar — plus `fetch_my_trades`, `fetch_orders`, `fetch_funding_rate_history`, `fetch_positions`, `fetch_deposits` and the rest of the account surface. It also encodes each venue's per-endpoint request weights behind a throttler that is on by default, exposes `amount_to_precision` and `price_to_precision` backed by the `Precise` string-arithmetic class, and maps venue error codes onto a [typed exception tree](/docs/manual#error-handling) of 41 classes. Barter solves the precision half at the language level — `rust_decimal::Decimal` throughout rather than floats — and leaves per-venue request pacing to the integration.

## What Barter does better

Real, specific advantages. Several of them are things CCXT deliberately does not attempt:

- **It is a trading system, not a client library.** The `Engine` gives you an event loop, pluggable `Strategy` and `RiskManager` components, a centralised state store with O(1) indexed lookups, position and PnL tracking, and `TradingSummary` reports with PnL, Sharpe, Sortino and drawdown. With CCXT all of that is your code. If your team's scarce resource is engineering time rather than venue coverage, that is a large head start.
- **Backtesting shares the live code path.** Swapping in a mock `MarketStream` and the `MockExecutionClient` lets a backtest run on what its README calls "a near-identical trading system as live-trading", with utilities for running thousands of concurrent backtests. CCXT has no backtester and no simulated venue; you supply both.
- **Rust from the ground up, not generated into it.** Barter is written as Rust rather than transpiled to it, so its API is shaped by the language: typed `SubKind` variants, trait-based extension seams, `Decimal` arithmetic and data-oriented state. CCXT's Rust target inherits the vocabulary of a library designed to read the same in eight languages, which is a real cost in idiom.
- **Operational control is designed in, not bolted on.** The `AuditStream` and the EngineState replica manager give you an out-of-band channel for monitoring and persistence; `TradingState` can be flipped from an external process; and Engine Commands (`CloseAllPositions`, `OpenOrders`, `CancelOrders`) let a UI or a Telegram bot intervene while the engine keeps consuming market and account data. CCXT is a library — it has no notion of a running system to observe or command.
- **Compile-time correctness across the whole pipeline.** `barter-instrument` models exchanges, assets and instruments as types, and a Barter-Data subscription checks the venue, instrument kind and subscription kind at compile time. CCXT's equivalent is the runtime `has` capability map: you find out that a venue does not support `watchOHLCV` when you call it.
- **A clean extension seam.** `MarketStream` and `ExecutionClient` are small, well-shaped traits. Adding a venue means implementing an interface the framework already understands, rather than forking a large library.

If you are building a Rust trading system and the hard part is the engine, the risk layer and the backtest loop rather than the number of venues, Barter is the better starting point — with its own stated scope factored into your plan.

## Migrating from Barter to CCXT

Only the connectivity half maps, and you stay in Rust while you do it: the `ccxt` and `ccxt-pro` crates cover the same 104 REST and 76 WebSocket venues as every other CCXT target. The Engine, `Strategy`, `RiskManager`, backtester and `TradingSummary` have no CCXT equivalent, so if you move, you keep writing those yourself or bring another library.

| What you are doing | Barter | CCXT |
| --- | --- | --- |
| Identify a venue | `ExchangeId::BinanceSpot` | `ccxt.binance` / `ccxt.pro.binance` |
| Identify an instrument | `("btc", "usdt", InstrumentKind::Spot)` | `'BTC/USDT'` (spot), `'BTC/USDT:USDT'` (linear swap) |
| Instrument metadata | `IndexedInstruments` from `barter-instrument` | `load_markets()` |
| Public trades | `SubKind::PublicTrades` | `watch_trades()` / `fetch_trades()` |
| Order book | `SubKind::OrderBooksL2` | `watch_order_book()` / `fetch_order_book()` |
| Candles | `SubKind::Candles` | `watch_ohlcv()` / `fetch_ohlcv()` |
| Liquidations | `SubKind::Liquidations` | `watch_liquidations()` |
| Account snapshot | `ExecutionClient::account_snapshot` | `fetch_balance()` + `fetch_positions()` |
| Account stream | `ExecutionClient::account_stream` | `watch_orders()`, `watch_balance()`, `watch_my_trades()` |
| Open / cancel an order | `ExecutionClient::open_order` / `cancel_order` | `create_order(...)` / `cancel_order(id, symbol)` |
| Paper trading | `MockExecutionClient` | `set_sandbox_mode(True)` where the venue offers a testnet |
| Venue-specific calls | write it with Barter-Integration | the same endpoint as an [implicit method](/docs/exchanges/binance/implicit-api) |
| Engine, strategy, risk, backtest, metrics | built in | not provided — your code |

Start with [Install](/docs/install), then the [Manual](/docs/manual) and the [CCXT Pro manual](/docs/pro-manual).

## FAQ

**Which exchanges does Barter support?**
Barter-Data's README table lists 15 exchange/instrument constructors across eight venues: Binance (spot and USD futures), Bitfinex, BitMEX, Bybit (spot and USD perpetuals), Coinbase, Gate.io (six spot, futures, perpetual and options variants), Kraken and OKX. Most advertise public trades; level-2 order books are listed for BinanceSpot and BinanceFuturesUsd. CCXT covers 104 exchanges over REST and 76 over WebSocket.

**Can Barter place live orders?**
Its `ExecutionClient` trait defines order entry, and `barter-execution` 0.9.0 publishes a `mock` client behind it for paper trading and backtesting; a live venue client is something you implement against that trait. Barter's README also states that the software is "not intended, designed, tested, verified or certified for commercial deployment, live trading, or production use of any kind". CCXT implements unified live order entry on every venue it supports.

**Is CCXT available in Rust?**
Yes. Rust is one of the targets generated from CCXT's single TypeScript source, alongside TypeScript, JavaScript, Python, PHP, C#/.NET, Go and Java. `ccxt` carries typed REST wrappers for all 104 exchanges, `ccxt-pro` the 76 WebSocket venues and `ccxt-prediction` the prediction markets — all async on Tokio, all MIT-licensed, and all compiled, clippy-linted and run against the base, id and static request/response suites in CI. See [Install CCXT](/docs/install) for the Rust setup.

**Is CCXT slower than Barter?**
Barter is native Rust with no garbage collector and data-oriented state, so on raw per-message cost it will win, and for the workloads its design targets that gap is real. For most strategy and dashboard workloads the bottleneck is network round-trip time and your own consumer, not the parsing layer. If you are optimising microseconds you are writing custom code against a colocated endpoint anyway, which is a different comparison from either of these libraries.

**Does CCXT have a backtester or a strategy framework?**
No. CCXT is connectivity: market data, order entry, accounts and funding across venues, with unified structures. Backtesting, strategy composition, risk management and performance reporting are exactly what Barter provides and CCXT does not.

**Can I use Barter and CCXT together?**
Yes, and now in the same process. Barter's `MarketStream` and `ExecutionClient` are traits, and CCXT's Rust crates give you 104 REST and 76 WebSocket venues to implement them against — Barter's engine, strategy and risk layer on top, CCXT reaching the venues Barter does not integrate. That adapter is your integration to build and maintain, but it no longer needs a language boundary. Splitting across processes still works too: CCXT in Python or Go for research, backfill and long-tail venues, Rust on the hot path.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [Supported exchanges](/docs/exchange-markets)
- [More comparisons](/docs/comparisons)
