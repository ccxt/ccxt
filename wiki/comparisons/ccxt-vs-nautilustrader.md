<!-- title: CCXT vs NautilusTrader -->
<!-- description: NautilusTrader is a Rust-native trading engine with 18 venue adapters; CCXT is an MIT client for 104 exchanges. Compared on coverage, licence and architecture. -->
<!-- group: Multi-exchange libraries and frameworks -->
<!-- summary: NautilusTrader is an engine: deterministic backtesting, an order-management model and live execution across 18 adapters, under LGPL-3.0. CCXT is a client for 104 exchanges under MIT, with no engine. -->
<!-- weight: 34 -->

# CCXT vs NautilusTrader

[NautilusTrader](https://github.com/nautechsystems/nautilus_trader) describes itself in its README as "an open-source, production-grade, Rust-native engine for multi-asset, multi-venue trading systems," spanning "research, deterministic simulation, and live execution within a single event-driven architecture, with Python serving as the control plane." [CCXT](/docs/manual) is a client library: it speaks to exchanges and normalises what comes back. It has no engine, no backtester and no strategy lifecycle.

So the two overlap in exactly one layer — the venue adapter — and the question that decides between them is whether you need an execution engine or a way to reach a venue.

## TL;DR

- **Pick NautilusTrader** if you want the engine: nanosecond-resolution event-driven backtests, an order and position model with OCO/OUO/OTO contingencies and post-only, reduce-only and iceberg execution instructions, and the same strategy code running against a simulated venue and a live one. That is a large, well-specified system that CCXT does not attempt.
- **Pick CCXT** if the venue you need is not one of the 18 NautilusTrader lists, or you want the same API in eight languages, or LGPL-3.0 is not a licence your legal team will sign off on.
- **They are not really substitutes.** CCXT is a component; NautilusTrader is an architecture. A common arrangement is NautilusTrader running strategies on the venues it adapts, and CCXT handling everything else — data collection, account and funding operations, and the long tail of exchanges.

## At a glance

| | **CCXT** | **NautilusTrader** |
| --- | --- | --- |
| What it is | unified exchange client (market data + trading) | event-driven trading engine with venue adapters |
| Venue coverage | 104 exchanges with REST, 76 of them with WebSocket | 18 integrations in the README table — 16 venues plus Databento and Tardis as data providers |
| Crypto venues | 104, plus 7 prediction-market venues in `ccxt.prediction` | 13 crypto exchanges (7 CEX, 5 DEX, 1 perpetuals exchange) plus Polymarket |
| Non-crypto venues | none | Betfair (sports betting), Interactive Brokers (multi-venue brokerage) |
| Backtesting engine | none — you bring your own | yes — multi-venue, multi-instrument, nanosecond resolution |
| Order/position model | unified order and position structures per call | full OMS with contingency orders (OCO, OUO, OTO), emulated orders, position tracking |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust | Rust core, Python control plane via PyO3; systems can also be written entirely in Rust |
| Python versions | 3.10–3.14 (PyPI classifiers) | 3.12–3.14 |
| Raw endpoint access | yes — every endpoint as an implicit method (808 for Binance) | adapter surface; anything beyond it means editing or writing an adapter |
| Adapter stability grades | not applicable — one interface for all venues | `planned`, `building`, `beta`, `stable`; all 18 currently marked `stable` |
| State persistence | none — stateless client | optional Redis-backed cache and message bus |
| Licence | **MIT** | **LGPL-3.0** (contributions require a CLA) |
| Popularity | 43.8k GitHub stars · 4.68M PyPI + 494k npm installs/month | 28.3k GitHub stars · 361k PyPI installs/month |
| Support | Discord, Telegram, GitHub issues | Discord, GitHub issues, support email |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the NautilusTrader GitHub repository and `develop` README (last commit 3 September 2026, latest release 2.0.0rc4 on 2 September 2026), and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Place a limit order on Binance

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.binance({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **NautilusTrader**

```python
from nautilus_trader.model import OrderSide

class MyStrategy(Strategy):
    def buy(self) -> None:
        order = self.order_factory.limit(
            instrument_id=self.instrument_id,
            order_side=OrderSide.BUY,
            quantity=self.instrument.make_qty(self.trade_size),
            price=self.instrument.make_price(60_000.00),
        )
        self.submit_order(order)
```

<!-- tabs:end -->

The CCXT call is a request that returns a value. The NautilusTrader call is a command onto a message bus: the order is created by a factory bound to the instrument's precision, submitted through a risk engine, and its lifecycle arrives back as `on_order_accepted`, `on_order_filled` and `on_position_opened` events. That is more ceremony and considerably more machinery — the machinery is the product.

### Stream quotes and react to them

<!-- tabs:start -->

#### **CCXT**

```python
import asyncio
import ccxt.pro

async def main():
    exchange = ccxt.pro.binance()
    while True:
        book = await exchange.watch_order_book('BTC/USDT')
        print(book['bids'][0], book['asks'][0])

asyncio.run(main())
```

#### **NautilusTrader**

```python
class MyStrategy(Strategy):
    def on_start(self) -> None:
        self.instrument = self.cache.instrument(self.instrument_id)
        self.subscribe_quotes(self.instrument_id)

    def on_quote(self, quote) -> None:
        self.log.info(f"{quote.bid_price} / {quote.ask_price}")
```

<!-- tabs:end -->

CCXT is pull-shaped — `await` a method, get a value, and the surrounding code is an ordinary loop. NautilusTrader is push-shaped, and the same handler fires whether the quote came off a live WebSocket or out of a backtest data catalogue. That equivalence is the point of the design.

### Run a backtest

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.binance()
candles = exchange.fetch_ohlcv('BTC/USDT', '1h', limit=1000)
# CCXT stops here. The simulation loop, fill model,
# fee model and portfolio accounting are yours to write.
```

#### **NautilusTrader**

```python
engine = BacktestEngine(config=BacktestEngineConfig())
engine.add_venue(
    venue=SIM,
    oms_type=OmsType.NETTING,
    account_type=AccountType.MARGIN,
    starting_balances=[Money(1_000_000, USD)],
    base_currency=USD,
    default_leverage=Decimal(1),
)
engine.add_instrument(EURUSD)
engine.add_data(bars)
engine.add_strategy(strategy)
engine.run()
```

<!-- tabs:end -->

This is the honest shape of the difference. CCXT hands you clean historical candles for 104 venues and nothing else. NautilusTrader hands you a venue simulator with an order-matching model, account types, leverage and multi-venue accounting — and it only runs against the instruments and data its own model understands.

## Where the differences actually bite

### Coverage versus depth

NautilusTrader's README lists 18 integrations, all currently marked `stable` on a four-level scale (`planned`, `building`, `beta`, `stable`). Of those, 13 are crypto exchanges — Binance, BitMEX, Bybit, Coinbase, Deribit, Kraken and OKX on the CEX side; Derive, dYdX, Hyperliquid, Lighter and Lighter on Robinhood on the DEX side; plus AX Exchange — with Polymarket, Betfair and Interactive Brokers alongside, and Databento and Tardis as data providers.

Each of those adapters models the venue properly: instrument definitions, product types, order types the venue actually accepts. The Binance adapter, for example, covers spot (including Binance US), USDT-margined futures and coin-margined futures, with `LIVE`, `DEMO` and `TESTNET` environments, and its documentation states that margin trading is unsupported.

CCXT covers 104 exchanges behind one interface, plus 7 prediction-market venues. The depth per venue is a unified surface rather than a bespoke domain model. If your venue is on NautilusTrader's list, its adapter probably knows more about it than a unified interface can. If your venue is not on that list, CCXT is a one-line change and NautilusTrader is an adapter to write.

### The licence

NautilusTrader is **LGPL-3.0**; its README links the GNU Lesser General Public License v3.0, and its security notes say Rust dependencies are checked "against an allow list of licenses compatible with NautilusTrader's `LGPL-3.0-only` license." Contributions require signing a CLA.

CCXT is **MIT**.

These are different obligations, not better and worse ones. LGPL-3.0 permits linking from proprietary code but attaches conditions — around modification, relinking and conveying the library — that MIT does not. Which matters to you depends on how you ship. It is a legal review, not an engineering preference, and it is worth doing before you build on either.

### Eight languages versus a Rust core with a Python control plane

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go, Java and Rust with the same method names and return structures in each. A Go execution service and a Python research notebook see the same `fetch_ohlcv` and the same OHLCV shape.

NautilusTrader is Rust and Python: Python bindings via PyO3 for the v2 runtime, with the option of writing systems entirely in Rust. Its supported Python range is 3.12–3.14 on Linux (x86_64 and ARM64), macOS (ARM64) and Windows (x86_64). If your stack is Rust or Python, that is a strength. If part of it is C# or PHP, it is a wall.

### What each project says is out of scope

NautilusTrader's roadmap states that the open-source project "focuses on single-node backtesting and live trading for individual and small-team quantitative traders" and that "UI dashboards, distributed orchestration, and built-in AI/ML tooling are out of scope."

CCXT's scope boundary is different and larger: no engine, no backtester, no scheduler, no persistence, no strategy lifecycle. What it does cover is every endpoint each venue publishes — 808 implicit methods for Binance alone — with signing, rate limiting and error mapping applied.

### One error hierarchy versus adapter-native errors

CCXT maps venue error codes into 41 typed exception classes in a single hierarchy, so `InsufficientFunds` means the same thing on Kraken as on Bybit and your retry logic does not need a per-venue branch. NautilusTrader handles venue errors inside each adapter and surfaces them through order rejection and denial events, which is the right shape for an engine but not a portable exception taxonomy you can catch across venues.

## What NautilusTrader does better

- **It has a backtester, and a serious one.** Multiple venues, instruments and strategies simultaneously, with quote ticks, trade ticks, bars, order book data and custom data at nanosecond resolution. CCXT has nothing in this area at all.
- **Research-to-live parity is a design guarantee, not a convention.** The same strategy class, the same event handlers, the same time model and the same execution semantics run in simulation and in production. Anyone who has maintained a backtester and a live bot as two codebases knows what this is worth.
- **The order model is far richer.** Time-in-force `IOC`, `FOK`, `GTC`, `GTD`, `DAY`, `AT_THE_OPEN` and `AT_THE_CLOSE`; execution instructions for post-only, reduce-only and icebergs; contingency orders including `OCO`, `OUO` and `OTO`; order emulation. CCXT unifies order placement, not order choreography.
- **The Rust core is genuinely fast, and the project treats it seriously.** mimalloc allocation, tokio networking, a stated Soundness Pledge, optional Redis-backed state persistence, and configurable precision modes (128-bit with 16 decimals, or 64-bit with 9).
- **It is not crypto-only.** Interactive Brokers, Databento and Betfair adapters put equities, futures, options and betting markets in the same engine as the crypto venues. CCXT is crypto and prediction markets only.
- **Supply-chain rigour is documented in detail.** Signed commits on protected branches, pinned lock files, cargo-vet and cargo-deny, CodeQL, SLSA build provenance and Sigstore-signed container images with SBOMs.

If you are building a single event-driven trading system in Python or Rust, on venues NautilusTrader already adapts, and you want backtest and live execution to share one codebase — NautilusTrader is the better tool, and CCXT is not really competing for that job.

## Using them together

Migration is the wrong frame here: nobody moves from an execution engine to an exchange client. The two sit at different layers, and the productive question is which layer you are actually shopping for.

- **NautilusTrader for the engine.** Strategy lifecycle, risk engine, order management, backtesting and live execution on its adapted venues.
- **CCXT for reach.** Historical candle collection across many venues, account and balance reconciliation, funding rates, transfers and deposit addresses, and trading on the exchanges NautilusTrader has no adapter for.

If what you are comparing is only the venue-adapter layer — because you are deciding what to build a new integration on — the mapping looks like this:

| Adapter concern | NautilusTrader | CCXT |
| --- | --- | --- |
| Instruments / symbols | `InstrumentProvider`, `InstrumentId` like `BTCUSDT.BINANCE` | `load_markets()`, unified `'BTC/USDT'` and `'BTC/USDT:USDT'` |
| Market data client | adapter `DataClient` per venue | `fetch_ticker`, `fetch_order_book`, `fetch_ohlcv` |
| Live streams | adapter data client feeding `on_quote` / `on_bar` | `watch_*` on `ccxt.pro.<id>` |
| Execution client | adapter `ExecutionClient` per venue | `create_order`, `cancel_order`, `fetch_open_orders` |
| Sandbox / testnet | per-adapter environment enum, e.g. `BinanceEnvironment.TESTNET` | `exchange.set_sandbox_mode(True)` |
| Venue with no support | write an adapter (RFC issue first, per the roadmap) | usually already supported; otherwise implicit methods |

## FAQ

**Does NautilusTrader use CCXT?**
No. Its adapters are written directly against each venue's REST and WebSocket APIs, in Rust with Python bindings, and its README lists 18 such integrations. There is no CCXT dependency.

**Can I use CCXT inside NautilusTrader?**
Not as a drop-in adapter — NautilusTrader adapters implement its own data-client and execution-client interfaces against its domain model. Teams more commonly run CCXT alongside the engine for data collection, account reconciliation and venues the engine does not adapt.

**Does CCXT have a backtester?**
No. CCXT gives you unified historical data (`fetch_ohlcv`, `fetch_trades`) and live execution; the simulation loop, fill model and portfolio accounting are yours or another library's. If you want that supplied, NautilusTrader supplies it.

**Which supports more crypto exchanges?**
CCXT — 104 with REST, 76 of them with WebSocket, plus 7 prediction-market venues. NautilusTrader lists 13 crypto exchanges plus Polymarket, all currently marked `stable`.

**Is LGPL-3.0 a problem for a closed-source trading firm?**
That is a question for your lawyers, not a technical one. LGPL-3.0 allows use from proprietary software but attaches conditions that MIT does not. If you run the software internally and never distribute it, the practical exposure is different again. CCXT's MIT licence does not raise the question.

**Do I need a paid tier for CCXT's WebSocket support?**
No. CCXT Pro ships inside the `ccxt` package under MIT. Use `ccxt.pro.<id>` and the `watch*` methods.

## Next steps

- [Install CCXT](/docs/install)
- [Manual](/docs/manual) — unified structures and conventions
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [Supported exchanges](/docs/exchange-markets)
- [Binance implicit API](/docs/exchanges/binance/implicit-api)
- [More comparisons](/docs/comparisons)
