<!-- title: CCXT vs QuantConnect Lean -->
<!-- description: Lean is an Apache-2.0 multi-asset trading engine with six crypto brokerages; CCXT is a client for 104 exchanges. Compared on coverage, data, licence and scope. -->
<!-- group: Multi-exchange libraries and frameworks -->
<!-- summary: Lean is an engine spanning eleven asset classes, with six crypto brokerage plugins and a paid data market behind it. CCXT is crypto-only, covers 104 venues, and has no engine. -->
<!-- weight: 40 -->

# CCXT vs QuantConnect Lean

[Lean](https://github.com/QuantConnect/Lean) is described by its own readme as "an event-driven, professional-caliber algorithmic trading platform built with a passion for elegant engineering and deep quant concept modeling," and as "modular in design, with each component pluggable and customizable." It is written in C# with first-class Python support, licensed Apache-2.0, and it is the engine behind QuantConnect's hosted platform.

[CCXT](/docs/manual) is not an engine. It is the layer Lean calls a brokerage: connect to a venue, normalise its market data, place and track orders. The decision comes down to one question — **do you need a multi-asset backtesting and execution platform, or do you need to reach a lot of crypto exchanges?**

## TL;DR

- **Pick Lean** if you want a complete platform: event-driven backtesting, an algorithm framework with alpha, portfolio-construction, risk and execution models, parameter optimisation, research notebooks, and eleven asset classes from US equities and options through futures, forex, CFD and crypto. CCXT does none of this.
- **Pick CCXT** if your work is crypto-only and coverage is the binding constraint. Lean's documentation lists six crypto brokerages for local live trading; CCXT supports 104 exchanges with REST, 76 with WebSocket, and 7 prediction-market venues.
- **The data story differs as much as the code.** CCXT pulls history straight from each exchange with `fetch_ohlcv`. Lean runs on a local data directory you populate — from the QuantConnect Dataset Market (priced per file in QuantConnect Credits), from a brokerage, from a third-party provider, or by converting your own files into Lean's documented format.

## At a glance

| | **CCXT** | **Lean** |
| --- | --- | --- |
| What it is | unified exchange client (market data + trading) | event-driven multi-asset trading engine |
| Asset classes | crypto spot, margin, futures, options, perpetuals; 7 prediction-market venues | US Equity, Equity Options, Crypto, Crypto Futures, Forex, Futures, Future Options, Index, Index Options, CFD, India Equity |
| Crypto venue coverage | 104 exchanges with REST, 76 with WebSocket | 6 crypto brokerages for local live trading: Binance, Bybit, Kraken, Coinbase, Bitfinex, dYdX |
| Non-crypto brokerages | none | Interactive Brokers, TradeStation, Charles Schwab, Tastytrade, Alpaca, Tradier, Webull, Public, Bloomberg EMSX, SSC Eze, Trading Technologies, Samco, Zerodha |
| Backtesting engine | none | yes — the core of the product |
| Strategy framework | none | alpha, portfolio construction, risk and execution models; `lean optimize`; `lean research` notebooks |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust | C# and Python; local build needs the .NET 10 SDK |
| Historical data | fetched live from the exchange, free | local data directory populated from the QuantConnect Dataset Market (per-file pricing in QuantConnect Credits), a brokerage, a third-party provider, or your own converted files |
| Raw endpoint access | yes — every venue endpoint as an implicit method (808 for Binance) | brokerage plugin surface; beyond it means writing C# |
| Install | `pip install ccxt` (or npm, NuGet, Go, Maven) | `pip install lean` for the CLI, which runs Lean in Docker; or clone and `dotnet build` |
| Licence | **MIT** | **Apache-2.0** |
| Popularity | 43.8k GitHub stars · 4.68M PyPI + 494k npm installs/month (one package, every venue) | 21.5k GitHub stars · 21.4k PyPI installs/month for the `lean` CLI package |
| Support | Discord, Telegram, GitHub issues | LEAN Forum, Discord, GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the QuantConnect/Lean GitHub repository (last commit 1 September 2026), the QuantConnect documentation for asset classes, brokerages and datasets, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### A moving-average crossover on BTC

<!-- tabs:start -->

#### **Lean**

```python
from AlgorithmImports import *

class CryptoCross(QCAlgorithm):
    def initialize(self):
        self.set_start_date(2024, 1, 1)
        self.set_cash("USDT", 10000)
        self.set_brokerage_model(BrokerageName.BINANCE, AccountType.CASH)
        symbol = self.add_crypto("BTCUSDT", Resolution.MINUTE).symbol
        self.fast = self.ema(symbol, 30, Resolution.MINUTE)
        self.slow = self.ema(symbol, 60, Resolution.MINUTE)

    def on_data(self, data):
        if self.fast > self.slow:
            self.set_holdings("BTCUSDT", 1)
        else:
            self.liquidate("BTCUSDT")
```

#### **CCXT**

```python
import ccxt

exchange = ccxt.binance({'apiKey': '...', 'secret': '...'})
candles = exchange.fetch_ohlcv('BTC/USDT', '1m', limit=120)
closes = [c[4] for c in candles]

fast = sum(closes[-30:]) / 30
slow = sum(closes[-60:]) / 60
if fast > slow:
    exchange.create_order('BTC/USDT', 'market', 'buy', 0.01)
```

<!-- tabs:end -->

The Lean version is a strategy the engine runs — the same class backtests over 2024 and, with a brokerage configured, trades live. The CCXT version is a script: it fetches, computes and sends, and the scheduling, state and portfolio accounting are yours. That asymmetry is the whole comparison in ten lines.

### Place a limit order

<!-- tabs:start -->

#### **Lean**

```python
limit_price = round(self.securities["BTCUSD"].price * 0.95, 2)
quantity = self.portfolio.cash_book["USD"].amount * 0.5 / limit_price
self.limit_order("BTCUSD", quantity, limit_price)
```

#### **CCXT**

```python
ticker = exchange.fetch_ticker('BTC/USDT')
price = exchange.price_to_precision('BTC/USDT', ticker['last'] * 0.95)
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, price)
print(order['id'], order['status'])
```

<!-- tabs:end -->

Lean's order goes through the engine, which knows the account's cash book, the brokerage's order rules and the fill model; it returns an order ticket and the outcome arrives in `on_order_event`. CCXT's order goes to the exchange and returns a [unified order structure](/docs/manual#order-structure) with the same keys on all 104 venues.

### Get historical candles onto your machine

<!-- tabs:start -->

#### **Lean**

```bash
# Downloads into the local data directory that Lean reads from.
# Sources: the QuantConnect Dataset Market (per-file pricing in
# QuantConnect Credits), a brokerage, or a third-party provider.
lean data download
```

#### **CCXT**

```python
import ccxt

exchange = ccxt.binance()
candles = exchange.fetch_ohlcv('BTC/USDT', '1h', since=start_ms, limit=1000)
# [[timestamp, open, high, low, close, volume], ...]
```

<!-- tabs:end -->

This is the difference people underestimate. Lean is data-directory-driven: it reads `data/crypto`, `data/equity`, `data/forex` and the rest, and you fill those directories by purchasing from the Dataset Market, downloading from a brokerage, or converting your own files to Lean's documented format. CCXT asks the exchange for candles and hands them back.

## Where the differences actually bite

### Reach: eleven asset classes versus 104 crypto venues

Lean's reach across markets is far wider than CCXT's, and that is not a close call. Its documentation lists US Equity, Equity Options, Crypto, Crypto Futures, Forex, Futures, Future Options, Index, Index Options, CFD and India Equity, with brokerage connectivity that includes Interactive Brokers, Charles Schwab, TradeStation, Bloomberg EMSX and Trading Technologies. If your strategy trades SPY options against BTC perpetuals, CCXT cannot be your only dependency.

Within crypto the ranking reverses. Lean's documentation lists six crypto brokerages for local live trading — Binance, Bybit, Kraken, Coinbase, Bitfinex and dYdX — implemented as separate `Lean.Brokerages.*` repositories (the `Brokerages` folder in the Lean repo itself holds the base framework: `Brokerage.cs`, `BrokerageFactory.cs`, `BaseWebsocketsBrokerage.cs`, `DefaultOrderBook.cs` and the WebSocket wrappers). CCXT supports 104 exchanges with REST and 76 with WebSocket, plus 7 prediction-market venues under `ccxt.prediction`. For MEXC, Bitget, Gate, HTX, Hyperliquid, KuCoin, Deribit, BitMEX, Upbit, Bithumb and most of the long tail, there is no Lean plugin and there is a CCXT implementation.

### Open-source engine, commercial platform around it

Lean the engine is Apache-2.0 and you can clone it, `dotnet build QuantConnect.Lean.sln` and run the launcher with no account. That is real, and the readme recommends the CLI (`pip install lean`) as the easier path for most users.

What sits around it is a commercial platform. The recommended data source is the QuantConnect Dataset Market, where, per the CLI documentation, "Data from the Dataset Market is priced on a per-file per-download basis, meaning you pay a certain number of QuantConnect Credits (QCC) for each file you download." Downloading historical data from a brokerage through the CLI carries its own requirement: "To use the CLI, you must be a member in an organization on a paid tier." QuantConnect's pricing page shows a free plan alongside Researcher, Team, Trading Firm and Institution tiers.

None of that makes Lean less open source. It does mean the practical cost of running it is not the licence, and it is worth pricing before you commit. CCXT has no account, no credits, no tiers and no data marketplace — it reads from the exchange you are already connected to.

### Eight languages versus C# and Python

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go, Java and Rust, with the same method names and return structures in every one. Lean is a C# engine with Python algorithm support through `AlgorithmImports`; a local build needs the .NET 10 SDK, which is why the CLI ships Docker images instead.

If your stack is .NET or Python, Lean fits. If parts of it are Go, PHP or Java, CCXT is the layer that can live in all of them.

### The exchange surface beyond trading

Lean's brokerage abstraction models what an engine needs: submit, update, cancel, holdings, cash balance, historical bars. CCXT's surface is the exchange itself — funding rates, open interest, mark and index prices, position mode, leverage and margin mode, transfers between account types, deposit addresses, ledgers, and every raw endpoint the venue publishes as an [implicit method](/docs/exchanges/binance/implicit-api), 808 of them for Binance alone. Errors arrive as 41 typed exception classes in one hierarchy, so `InsufficientFunds` means the same thing on Kraken as on Bybit.

For strategy execution, Lean's narrower model is sufficient and cleaner. For treasury movement, reconciliation, venue-specific features and market-data capture, it is not the right shape.

## What Lean does better

- **It is a complete engine and CCXT is not one.** Event-driven backtesting with a fill model, a fee model, a slippage model and portfolio accounting; `lean backtest`, `lean optimize` and `lean research` as first-class commands. Building any of that on CCXT is your project, not a dependency.
- **Eleven asset classes, including everything CCXT will never cover.** US equities, equity and index options, futures and future options, forex, CFD and India equity, alongside crypto and crypto futures. CCXT is crypto and prediction markets, by design.
- **Institutional brokerage connectivity.** Interactive Brokers, Charles Schwab, TradeStation, Tastytrade, Bloomberg EMSX, SSC Eze, Trading Technologies. These are not venues a crypto library reaches, and getting them right is years of work.
- **A genuine plug-in architecture.** `IBrokerage`, `IDataQueueHandler` and `IHistoryProvider` in `Common/Interfaces` are documented extension points, and the readme's claim that Lean "ships with models for all major plug-in points" is borne out by the brokerage plugins living as independent repositories.
- **The algorithm framework.** Alpha models, portfolio construction, risk management and execution as separate composable pieces, so the same signal can be run through different sizing and execution policies without rewriting the strategy.
- **Local-to-cloud continuity.** The same algorithm runs on your machine and on QuantConnect's hosted platform, with a data library, live deployment and a research environment attached.
- **Apache-2.0** carries an explicit patent grant, which some legal departments prefer over a bare permissive licence.

If you are building multi-asset strategies, need equities or options in the same engine as crypto, or want backtesting and live execution supplied rather than assembled, Lean is the better choice and CCXT is not competing for that job.

## Using them together

Migration is the wrong frame — nobody replaces a backtesting engine with an exchange client. The comparable layer is narrower than the two projects, and it is worth naming exactly: **Lean's brokerage and data-provider plugins are the part that overlaps with CCXT.** Everything above that layer — the engine, the framework, the optimiser, the research environment — has no CCXT equivalent, and everything CCXT does outside order routing has no Lean equivalent.

Scoped to that layer, the mapping is:

| Venue-layer concern | Lean | CCXT |
| --- | --- | --- |
| Symbols | `add_crypto("BTCUSDT")`, `Symbol` objects | `'BTC/USDT'` spot, `'BTC/USDT:USDT'` linear swap |
| Venue selection | `set_brokerage_model(BrokerageName.BINANCE, ...)` | `ccxt.binance(...)` — 104 ids, same methods |
| Historical bars | local data directory, `self.history(...)` | `fetch_ohlcv(symbol, timeframe, since, limit)` |
| Live streams | `IDataQueueHandler` implementation per brokerage | `watch_*` on `ccxt.pro.<id>` |
| Order entry | `market_order`, `limit_order`, `set_holdings` | `create_order(symbol, type, side, amount, price)` |
| Account state | `self.portfolio`, `self.portfolio.cash_book` | `fetch_balance()`, `fetch_positions()` |
| Venue with no plugin | write a C# `IBrokerage` / `IHistoryProvider` | usually already supported |

Two practical ways to run both:

- **CCXT as the data collector.** Pull candles from any of 104 venues with `fetch_ohlcv`, convert them to Lean's documented file format, and drop them into the `data/crypto` directory Lean reads from. That gets Lean backtesting venues it has no plugin for.
- **CCXT as the execution path for the long tail.** Run Lean for research, backtesting and the brokerages it supports; route orders on other venues through CCXT. CCXT publishes a `ccxt` NuGet package, so a custom `IBrokerage` or `IHistoryProvider` written against it is a route people take when a venue has no Lean plugin — that is a plugin you would write, not one that ships today.

## FAQ

**Does Lean use CCXT?**
No. Lean's crypto connectivity comes from its own C# brokerage plugins — `Lean.Brokerages.Binance`, `.ByBit`, `.Kraken`, `.Coinbase`, `.Bitfinex` and `.dYdX` — each an independent Apache-2.0 repository implementing Lean's `IBrokerage` interface.

**Which crypto exchanges can Lean trade live?**
QuantConnect's documentation for local live trading with the LEAN CLI lists Binance, Bybit, Kraken, Coinbase, Bitfinex and dYdX among the crypto exchanges, alongside a long list of traditional brokerages. CCXT supports 104 exchanges.

**Is Lean free?**
The engine is Apache-2.0 and runs locally. The data most users run it on is not: the recommended source is the QuantConnect Dataset Market, priced per file in QuantConnect Credits, and the CLI documentation for downloading brokerage data states you must be a member in an organization on a paid tier. QuantConnect's pricing page shows a free plan plus four paid tiers.

**Can CCXT backtest a strategy?**
No. CCXT provides unified historical data (`fetch_ohlcv`, `fetch_trades`) and live execution, but no simulation loop, fill model or portfolio accounting. Lean provides all three.

**Can I use CCXT data in Lean?**
Yes, with a conversion step. Lean reads a local data directory whose subdirectories carry `readme.md` files documenting the expected file format; QuantConnect's documentation states that users with their own data can convert it to a LEAN-compatible format. Fetching that data with `fetch_ohlcv` across 104 venues is one way to obtain it.

**Do I need a paid tier or a separate package for CCXT's WebSockets?**
No. CCXT Pro is bundled in the `ccxt` package under MIT, with no account and no tier. Use `ccxt.pro.<id>` and the `watch*` methods.

## Next steps

- [Install CCXT](/docs/install)
- [Manual](/docs/manual) — unified structures and conventions
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [Supported exchanges](/docs/exchange-markets)
- [Binance implicit API](/docs/exchanges/binance/implicit-api)
- [More comparisons](/docs/comparisons)
