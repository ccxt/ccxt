<!-- title: CCXT vs Blankly -->
<!-- description: Blankly is a Python strategy framework with backtesting and paper trading; CCXT is a connectivity library. Compared on venues, asset classes and licence. -->
<!-- group: Multi-exchange libraries and frameworks -->
<!-- summary: Blankly gives you a backtester, paper trading and stocks and forex alongside crypto; CCXT gives you 104 crypto venues in seven languages and no strategy layer at all. They solve different halves of the problem. -->
<!-- weight: 44 -->

# CCXT vs Blankly

[Blankly](https://github.com/blankly-finance/blankly) is a Python framework whose GitHub description reads "Easily build, backtest and deploy your algo in just a few lines of code. Trade stocks, cryptos, and forex across exchanges w/ one package." [CCXT](/docs/manual) is a connectivity library: it reaches exchanges and normalises what comes back, and stops there.

They overlap on one layer — placing an order on more than one venue through one interface. The question that decides between them is **whether you need a strategy runtime and a backtester, or exchange coverage.**

## TL;DR

- **Pick Blankly** if you want a backtest engine, paper trading, a scheduling loop and stocks or forex alongside crypto, all in Python, and its venue list covers what you trade.
- **Pick CCXT** if you need exchange coverage — 104 venues, 76 of them with WebSocket — in any of seven languages, and you already have (or intend to write) your own strategy layer.
- **CCXT does not backtest and does not paper trade.** That is not an omission a future release fixes; it is outside what the library is. If backtesting is the reason you are reading this, that is the finding.

## At a glance

| | **CCXT** | **Blankly** |
| --- | --- | --- |
| What it is | connectivity + normalisation library | strategy framework with a backtest engine |
| Crypto exchanges | 104 REST, 76 with WebSocket | Coinbase Pro, Binance, Binance Futures, KuCoin, OKX, FTX, FTX Futures, Kraken (in development) |
| Non-crypto venues | none | Alpaca (US equities), OANDA (forex) |
| Prediction markets | 7 venues in `ccxt.prediction` | none |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java | Python (README lists 3.7–3.10 as tested) |
| Backtesting | **no** | **yes** — event-driven, with custom event streams |
| Paper trading | no — exchange sandboxes via `setSandboxMode(true)` | yes — `PaperTrade` wrapper on any exchange |
| Strategy runtime | no — you write the loop | yes — `Strategy` + `add_price_event`, scheduling and warm-up handled |
| Indicators | none | `blankly.indicators` |
| Unified order entry | yes — `create_order` across every venue | yes — `interface.market_order` / `limit_order` |
| Raw endpoint access | yes — every venue endpoint as an implicit method (808 for Binance) | `interface.get_calls()` returns the underlying client |
| Built-in rate limiter | yes, per-endpoint weights, on by default | not a documented feature |
| Unified error types | yes — 41 typed exceptions in one hierarchy | Python exceptions, not a unified hierarchy |
| Licence | **MIT** | **LGPL-3.0** |
| Latest release | continuous, v{{CCXT_VERSION}} | `1.18.25b0` on PyPI, uploaded 23 July 2023 |
| Last commit on default branch | active daily | 30 December 2024 ("support more python versions") |
| Popularity | 43.8k GitHub stars · 4.7M PyPI + 494k npm installs/month | 2.5k GitHub stars · 12k PyPI installs/month |
| Support | Discord, Telegram, GitHub — usually same-day | Discord, GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the blankly-finance/blankly repository (2,474 stars, 312 forks, LGPL-3.0, not archived), its README support table and `setup.py`, its PyPI release history, and install counts from npm and PyPI.</sub>

One observation about that support table, stated as a fact rather than a judgement: it still lists **FTX** and **FTX Futures** among supported venues, and `blankly/__init__.py` still exports `FTX` and `FTXFutures`. FTX ceased operating in November 2022.

## The same job, written both ways

### Place a market order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.binance({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'market', 'buy', 0.001)
print(order['id'], order['status'], order['filled'])
```

#### **Blankly**

```python
from blankly import Alpaca, CoinbasePro

stocks = Alpaca()
crypto = CoinbasePro()

stocks.interface.market_order('AAPL', 'buy', 1)
crypto.interface.market_order('BTC-USD', 'buy', 1)
```

<!-- tabs:end -->

The Blankly snippet is doing something CCXT cannot: buying a share of AAPL and a Bitcoin position through the same call. The CCXT snippet is doing something Blankly cannot: that same line runs unchanged against any of 104 exchanges, and returns a [unified order structure](/docs/manual#order-structure) with the same keys on each.

### An RSI strategy

This is the comparison that matters, so it is worth showing honestly rather than pretending the two produce similar code.

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt
import time

exchange = ccxt.coinbase({'apiKey': '...', 'secret': '...'})
holding = False

while True:
    candles = exchange.fetch_ohlcv('BTC/USD', '1d', limit=150)
    closes = [c[4] for c in candles]
    rsi = my_rsi(closes)            # you supply this
    if rsi < 30 and not holding:
        exchange.create_order('BTC/USD', 'market', 'buy', 0.001)
        holding = True
    elif rsi > 70 and holding:
        exchange.create_order('BTC/USD', 'market', 'sell', 0.001)
        holding = False
    time.sleep(exchange.rateLimit / 1000)
```

#### **Blankly**

```python
import blankly

def price_event(price, symbol, state: blankly.StrategyState):
    state.variables['history'].append(price)
    rsi = blankly.indicators.rsi(state.variables['history'])
    if rsi[-1] < 30 and not state.variables['owns_position']:
        buy = blankly.trunc(state.interface.cash / price, 2)
        state.interface.market_order(symbol, side='buy', size=buy)
        state.variables['owns_position'] = True

def init(symbol, state: blankly.StrategyState):
    state.variables['history'] = state.interface.history(
        symbol, to=150, return_as='deque', resolution=state.resolution)['close']
    state.variables['owns_position'] = False

strategy = blankly.Strategy(blankly.CoinbasePro())
strategy.add_price_event(price_event, symbol='BTC-USD', resolution='1d', init=init)

results = strategy.backtest(to='1y', initial_values={'USD': 10000})
```

<!-- tabs:end -->

Blankly supplies the RSI, the warm-up history, the scheduler, the position state and — the part with no CCXT equivalent at all — `strategy.backtest(to='1y')`, which runs the identical `price_event` function over a year of history and returns metrics. Switching to live is `strategy.start()`.

The CCXT version has none of that and never will. What it has instead is `ccxt.coinbase` swapped for any of 103 other ids on the first line, and the same code in Go or C# if the execution service is not written in Python.

## Where the differences actually bite

### Coverage versus runtime

This is the whole comparison. Blankly's README support table lists ten venues plus a keyless backtesting source, with three US brokerages marked as planned. CCXT lists 104 exchanges with REST support and 76 with WebSocket, plus 7 prediction-market venues.

If the venue you trade is not in Blankly's table, no amount of framework quality helps. If the framework feature you need is a backtester, no amount of CCXT's coverage helps. Neither library is a substitute for the other on the axis where it is weak.

### Symbols and structures

Blankly passes venue-shaped symbols through — `'BTC-USD'` on Coinbase Pro, `'AAPL'` on Alpaca. CCXT uses [unified symbols](/docs/manual#symbols-and-market-ids): `'BTC/USDT'` for spot, `'BTC/USDT:USDT'` for a linear swap, resolved to the venue's own market id at call time. On one venue the difference is cosmetic. Across five it is the difference between a symbol map you maintain and one you do not.

The same applies below the symbol: CCXT returns a fixed [order](/docs/manual#order-structure), [ticker](/docs/manual#ticker-structure) and [order book](/docs/manual#order-book-structure) structure with the same keys, types and units on every exchange, and does its precision and rounding in string arithmetic so a float never eats a satoshi.

### Seven languages, one API

Blankly is Python. CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java with identical method names and return structures, so research in Python and execution in Go share a data model rather than a translation layer.

### The licence

Blankly is **LGPL-3.0**; CCXT is **MIT**. LGPL is far less demanding than AGPL — linking an unmodified library into a proprietary program is the case it is designed to permit — but modifications to Blankly itself carry a reciprocity obligation, and the practical shape of that is a question for your counsel rather than for a docs page. MIT does not raise the question.

### Release cadence

State the observable facts and draw your own conclusion. Blankly's most recent commit on `main` is dated 30 December 2024; its most recent PyPI release, `1.18.25b0`, was uploaded on 23 July 2023; its README lists Python 3.7 through 3.10 as the tested versions. CCXT ships releases continuously — v{{CCXT_VERSION}} is current as this page was written — because exchange APIs change weekly and a connectivity library that does not track them stops connecting.

For a backtester this matters less than it does for live connectivity: a backtest engine is mostly independent of what the venues did last Tuesday.

## What Blankly does better

- **It backtests, and that is a large piece of software.** An event-driven engine that replays your `price_event` over historical prices, values the account as it goes, and returns metrics — plus `add_custom_events` for replaying non-price streams such as a JSON file of tweets alongside the prices. The project documents its simulation-accuracy engineering separately in `blankly/BACKTESTING_ENGINEERING.md`. CCXT has nothing in this area and is not trying to.
- **It paper trades.** `PaperTrade` wraps any supported exchange with a simulated account, so the same strategy code runs against fake money on a real feed. CCXT's equivalent is whatever sandbox the venue itself offers, via `setSandboxMode(true)`, and many venues offer none.
- **Stocks and forex, not just crypto.** Alpaca for US equities and OANDA for forex sit behind the same `interface` as the crypto venues. CCXT covers cryptocurrency exchanges and prediction markets only, so a cross-asset book is out of scope for it entirely.
- **It gives you the loop.** `blankly init` scaffolds a project; `Strategy` plus `add_price_event` handles scheduling, resolution, warm-up history and per-symbol state; `blankly.indicators` supplies the indicators. With CCXT all of that is yours to write.
- **One line from backtest to live.** `strategy.backtest(to='1y')` becomes `strategy.start()` with no other change, which is a genuinely useful property and one most frameworks get wrong.

If you are writing a Python strategy against venues Blankly already supports, want a backtester you did not write, and value cross-asset reach over crypto-venue breadth, Blankly is the better choice.

## Migrating from Blankly to CCXT

| What you are doing | Blankly | CCXT |
| --- | --- | --- |
| Construct a client | `blankly.Binance()` (keys from `keys.json`) | `ccxt.binance({'apiKey': '...', 'secret': '...'})` |
| Symbols | `'BTC-USD'`, `'AAPL'` — venue-shaped | `'BTC/USDT'` spot, `'BTC/USDT:USDT'` linear swap |
| List markets | `interface.get_products()` | `load_markets()` |
| Last price | `interface.get_price(symbol)` | `fetch_ticker(symbol)['last']` |
| Candles | `interface.history(symbol, to=..., resolution=...)` | `fetch_ohlcv(symbol, timeframe, since, limit)` |
| Market order | `interface.market_order(symbol, side, size)` | `create_order(symbol, 'market', side, amount)` |
| Limit order | `interface.limit_order(symbol, side, price, size)` | `create_order(symbol, 'limit', side, amount, price)` |
| Stop loss / take profit | `interface.stop_loss_order()` / `take_profit_order()` | `create_order(..., params={'triggerPrice': ...})` — see [trigger orders](/docs/manual#trigger-order) |
| Cancel | `interface.cancel_order(symbol, order_id)` | `cancel_order(id, symbol)` |
| Open orders | `interface.get_open_orders(symbol)` | `fetch_open_orders(symbol)` |
| One order | `interface.get_order(symbol, order_id)` | `fetch_order(id, symbol)` |
| Balance | `interface.get_account()` / `interface.cash` | `fetch_balance()` |
| Fees | `interface.get_fees(symbol)` | `fetch_trading_fee(symbol)` |
| Streams | `TickerManager` / `OrderbookManager` | `watch_ticker` / `watch_order_book` on `ccxt.pro.<id>` |
| Backtesting | `strategy.backtest(to='1y')` | **no equivalent** — keep Blankly, or feed CCXT candles to a backtester |
| Paper trading | `PaperTrade(exchange)` | `exchange.set_sandbox_mode(True)` where the venue offers a testnet |
| Anything not listed | `interface.get_calls()` for the raw client | the same endpoint as an [implicit method](/docs/exchanges/binance/implicit-api) |

## FAQ

**Does CCXT have a backtester?**
No. CCXT connects to exchanges and normalises market data, orders, balances and positions; it has no simulation engine, no historical archive and no strategy runtime. People commonly pull candles with `fetch_ohlcv` and feed them to a separate backtester, or use a framework like Blankly that includes one.

**Can Blankly trade stocks as well as crypto?**
Yes — that is one of its distinguishing features. Alpaca provides US equities and OANDA provides forex, behind the same `interface` as the crypto exchanges. CCXT is cryptocurrency exchanges and prediction markets only.

**Which supports more exchanges, CCXT or Blankly?**
CCXT, by a wide margin on crypto: 104 exchanges with REST and 76 with WebSocket, against the ten venues plus a keyless backtesting source in Blankly's README table. Blankly reaches two asset classes CCXT does not.

**Is CCXT's WebSocket support a paid add-on?**
No. CCXT Pro is bundled in the `ccxt` package under the MIT licence. Use `ccxt.pro.<exchange>` and the `watch*` methods — see the [CCXT Pro manual](/docs/pro-manual).

**Can I use Blankly and CCXT together?**
Yes, and it is a reasonable split: Blankly for research and backtesting against the venues it covers, CCXT for live connectivity to the venues it does not — or for the execution service if that is written in Go, C# or Java rather than Python.

**Is Blankly still maintained?**
Its repository is not archived. The most recent commit on `main` is dated 30 December 2024 and the most recent PyPI release, `1.18.25b0`, was uploaded on 23 July 2023. Its README support table still lists FTX and FTX Futures, which ceased operating in November 2022. Judge those facts against how quickly your venues change their APIs.

## Next steps

- [Install CCXT](/docs/install)
- [Manual](/docs/manual) — unified structures and conventions
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [Supported exchanges](/docs/exchange-markets)
- [More comparisons](/docs/comparisons)
