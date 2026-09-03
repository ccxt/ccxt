<!-- title: CCXT vs the OKX API and python-okx -->
<!-- description: How CCXT compares with python-okx on OKX v5 coverage, demo trading, WebSockets, rate limits, regional hosts and raw endpoint access, with tasks written both ways. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: python-okx splits OKX's v5 API into fifteen domain modules you import separately. CCXT gives you one client for spot, margin, futures, swaps and options, with demo trading behind one flag and all 433 raw endpoints still reachable. -->
<!-- weight: 40 -->

# CCXT vs the OKX API and python-okx

OKX's v5 API is a single, well-documented REST and WebSocket surface covering spot, margin, futures, perpetual swaps and options. The Python client OKX's own v5 documentation points developers at is [`python-okx`](https://github.com/okxapi/python-okx) — a wrapper whose own README describes it as "an unofficial Python wrapper for the OKX exchange v5 API".

[CCXT](/docs/manual) speaks the same v5 API, behind method names shared with 103 other venues. The question that decides between them: **is OKX the only venue your code will ever touch — and are you in Python?**

## TL;DR

- **Pick `python-okx`** if OKX is your only venue, you are in Python, and you want `instId`, `tdMode` and `ordType` to read exactly as they do in OKX's reference.
- **Pick CCXT** if you want one dependency across OKX spot, margin, futures, swaps and options — and across the next venue you add, in whichever of seven languages your service is written in.
- **Demo trading works either way.** OKX's demo environment is a header (`x-simulated-trading: 1`); CCXT sets it for you via `set_sandbox_mode(True)`.
- **Choosing CCXT does not hide anything.** All 433 raw OKX endpoints are callable as [implicit methods](/docs/exchanges/okx/implicit-api).

## At a glance

| | **CCXT** | **python-okx** |
| --- | --- | --- |
| Exchanges covered | 104 (OKX is one of them) | OKX only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python only (>= 3.7) |
| Packages to install | **1** (`ccxt`) | 1 (`python-okx`) |
| Client objects | one — `ccxt.okx()` | one per domain — `Account`, `Trade`, `MarketData`, `PublicData`, `Funding`, `Grid`, `CopyTrading`, `SubAccount`, `BlockTrading`, `Convert`, `SpreadTrading`, `TradingData`, `Status`, `DualInvest`, `FDBroker` |
| Unified market data + trading API | yes — same method names across every exchange | no — OKX's own request/response shapes |
| WebSockets | yes — 19 `watch*` / `unWatch*` methods, plus `createOrderWs`, `editOrderWs`, `cancelOrderWs`, `cancelOrdersWs`, `cancelAllOrdersWs` | yes — `WsPublicAsync` / `WsPrivateAsync` with raw channel subscribe |
| Raw endpoint access | yes — 433 OKX endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 100 ms) | not a documented feature |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status + OKX `code`/`sCode` |
| Demo trading | `exchange.set_sandbox_mode(True)` | `flag="1"` on each client you construct |
| Regional hosts | `okx`, `myokx` (EEA), `okxus` (US) as separate ids | one client, base URL is yours to manage |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** (one package, every venue) | 858 GitHub stars · 94k PyPI installs/month; community Node SDK `okx-api` 168 stars · 27k npm installs/month |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `python-okx` repository and PyPI page, OKX's published v5 documentation, the `okx-api` repository, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.okx()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **python-okx**

```python
from okx import MarketData

market = MarketData.MarketAPI(flag="0")   # "1" for demo trading
ticker = market.get_ticker(instId="BTC-USDT")
print(ticker)
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — the same keys, types and units whether the venue is OKX, Binance or Kraken. `python-okx` returns OKX's `code`/`msg`/`data` envelope, which you unwrap and parse yourself. Note where `flag` lives: in `python-okx` it is a constructor argument on every client object you build, so the demo/live decision is repeated at each construction site.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.okx({'apiKey': '...', 'secret': '...', 'password': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 30000)
print(order['id'], order['status'])
```

#### **python-okx**

```python
from okx import Trade

trade = Trade.TradeAPI(
    api_key="...",
    api_secret_key="...",
    passphrase="...",
    flag="0",
)
order = trade.place_order(
    instId="BTC-USDT", tdMode="cash", side="buy",
    ordType="limit", px="30000", sz="1",
)
```

<!-- tabs:end -->

`tdMode` is the tell. In `python-okx` you pick the trade mode (`cash`, `cross`, `isolated`) per call and match it to the instrument yourself. In CCXT the instrument is the symbol — `'BTC/USDT'` spot, `'BTC/USDT:USDT'` linear swap, `'BTC/USD:BTC'` inverse, `'BTC/USD:BTC-241227-60000-P'` option — and `create_order` derives the mode, with `params` still available when you want to override it.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.okx()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **python-okx**

```python
from okx.websocket.WsPublicAsync import WsPublicAsync

def publicCallback(message):
    print("publicCallback", message)

async def main():
    ws = WsPublicAsync(url="wss://ws.okx.com:8443/ws/v5/public")
    await ws.start()
    args = [{"channel": "tickers", "instId": "BTC-USDT"}]
    await ws.send("subscribe", args, callback=publicCallback, id="send001")
```

<!-- tabs:end -->

These are not doing the same thing. CCXT returns a **live, fully merged order book** with the same structure as `fetch_order_book`. A raw `books` subscription delivers a snapshot followed by deltas, and everything after that is yours:

| | CCXT | raw stream |
| --- | --- | --- |
| Apply deltas onto the snapshot in order | done for you | your code |
| Verify OKX's order-book **checksum** and re-seed on mismatch | done for you | your code |
| Reconnect, re-subscribe and re-seed after a drop | done for you | your code |
| Keep a bounded, depth-limited cache | done for you | your code |
| Same structure as the REST call | yes | no |

OKX publishes a checksum with its book updates precisely because local books drift. A drifted book does not throw — it just quietly disagrees with the exchange until a fill surprises you.

## Where the differences actually bite

### One client versus fifteen modules

`python-okx` mirrors OKX's documentation structure: `okx/Account.py`, `Trade.py`, `MarketData.py`, `PublicData.py`, `Funding.py`, `Grid.py`, `CopyTrading.py`, `SubAccount.py`, `BlockTrading.py`, `Convert.py`, `SpreadTrading.py`, `TradingData.py`, `Status.py`, `DualInvest.py`, `FDBroker.py`, plus a `websocket` subpackage. A strategy that reads a book, places an order and sweeps a funding balance imports and constructs three API objects, each with its own credentials and `flag`.

CCXT gives you one `ccxt.okx()` instance for all of it, with **123 unified capabilities** and **63 `fetch*` methods** hanging off it.

### Portability is the whole point

This is the difference that shows up six months in, not on day one. A second venue means a second SDK, a second payload shape, a second symbol convention, a second error taxonomy and a second WebSocket dialect — then a translation layer of your own so the rest of the system can stay venue-agnostic. That layer is precisely what CCXT already is, across 104 venues.

```python
for exchange_id in ['okx', 'binance', 'bybit', 'kraken', 'coinbase']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT')['last'])
```

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names, arguments and return structures in all seven. `python-okx` is Python-only; the well-maintained community Node SDK [`okx-api`](https://github.com/tiagosiebler/okx-api) covers TypeScript, and beyond that you are writing your own.

<!-- tabs:start -->

#### **Python**

```python
exchange = ccxt.okx()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **TypeScript**

```typescript
const exchange = new ccxt.okx ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **C#**

```csharp
var exchange = new ccxt.okx();
var ticker = await exchange.FetchTicker("BTC/USDT");
```

#### **Go**

```go
exchange := ccxt.NewOkx(nil)
ticker, err := exchange.FetchTicker("BTC/USDT")
```

<!-- tabs:end -->

A strategy prototyped in a Python notebook ports to a Go or C# execution service without redesigning the data model.

### Demo trading behind one flag

OKX's demo environment is not a separate host with separate keys — it is the live host with `x-simulated-trading: 1` in the header. CCXT wires that into the standard sandbox switch, so the rest of your code does not change:

```python
exchange = ccxt.okx({'apiKey': '...', 'secret': '...', 'password': '...'})
exchange.set_sandbox_mode(True)   # sets x-simulated-trading: 1
```

Turn it off and the header is removed. In `python-okx` the equivalent is `flag="1"`, passed to every client object you construct — correct, but repeated at each construction site rather than set once on the instance.

### Regional hosts as first-class ids

OKX operates regional entities on separate hosts. CCXT ships `myokx` for the EEA entity and `okxus` for the US one as separate exchange ids that inherit the full `okx` implementation, so switching region is a class name, not a base-URL edit threaded through your configuration.

### WebSockets that look like REST

CCXT Pro is bundled in the same `ccxt` package — no separate purchase — and gives OKX **19 streaming methods**: `watchOrderBook`, `watchOrderBookForSymbols`, `watchTrades`, `watchTradesForSymbols`, `watchOHLCV`, `watchTicker`, `watchTickers`, `watchBidsAsks`, `watchMarkPrice`, `watchMarkPrices`, `watchFundingRate`, `watchFundingRates`, `watchBalance`, `watchOrders`, `watchPositions`, `watchMyTrades`, `watchLiquidationsForSymbols`, `watchMyLiquidationsForSymbols` and their `unWatch*` counterparts. Order entry over the socket is there too: `createOrderWs`, `editOrderWs`, `cancelOrderWs`, `cancelOrdersWs` and `cancelAllOrdersWs`.

`watch_order_book` returns the same structure as `fetch_order_book`; `watch_orders` the same as `fetch_orders`. Swapping a polling loop for a stream is a one-word change.

### Rate limits you do not have to model

OKX meters per endpoint, with different budgets for public and private routes and some per-instrument sublimits. CCXT encodes those weights in the exchange definition and ships a token-bucket throttler that is **on by default** (`rateLimit` 100 ms for OKX). You call methods in a loop; the library paces them. With a raw wrapper, pacing and backing off on OKX's `50011` rate-limit code is application code you write and maintain.

### One error hierarchy

CCXT maps OKX's `code` and per-order `sCode` values onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. `except ccxt.InsufficientFunds` keeps working when you add a second exchange; matching on `"51008"` does not.

### Precision, rounding and string math

OKX rejects orders that violate lot size, tick size or minimum size, and contract sizes differ per instrument. CCXT loads OKX's instrument metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class, so quantities never drift through float rounding into a rejected order at 3am.

### Nothing is hidden — the implicit API

Alongside the 123 unified capabilities, **all 433 endpoints in OKX's API are generated as callable implicit methods**, with signing, rate-limit accounting and error mapping still applied:

```python
# any raw OKX endpoint, camelCased from its path
response = exchange.public_get_market_tickers({'instType': 'SPOT'})
```

So the unified API covers what every venue shares, and the implicit API covers the OKX-specific remainder — without dropping to raw HTTP or adding a second dependency. Browse them on the [OKX implicit API page](/docs/exchanges/okx/implicit-api).

## What python-okx does better

An honest list, because these are real:

- **It is a literal mirror of OKX's v5 reference.** `instId`, `tdMode`, `ordType`, `px`, `sz`, `posSide` — the names in your code are the names on the documentation page you are reading, and the module you import tells you which docs section you are in. CCXT's unified names are a deliberate abstraction, which is one extra hop when debugging against the vendor docs.
- **New v5 endpoints appear as methods almost immediately.** A thin pass-through wrapper can add a documented endpoint the week it ships; a *unified* CCXT method modelled across 104 venues can trail. (CCXT's implicit API closes most of that gap on day one, but the unified wrapper may lag.)
- **The dependency surface is tiny.** One MIT-licensed Python package targeting one exchange is much less to install and audit than all of CCXT, if OKX in Python is genuinely the whole job.
- **The demo `flag` is explicit at every call site.** Some teams prefer that to an instance-level mode: it is impossible to be confused about which environment a given client object is talking to.
- **It is what OKX's own docs point at.** If you file a question against OKX's developer channels with a `python-okx` traceback, you are speaking the same language as the reference material.

If OKX is your only venue, forever, and you are writing Python, `python-okx` is a defensible choice.

## Migrating from python-okx to CCXT

| What you are doing | python-okx | CCXT |
| --- | --- | --- |
| Symbols | `instId="BTC-USDT"` | `'BTC/USDT'` spot, `'BTC/USDT:USDT'` linear swap, `'BTC/USD:BTC'` inverse |
| Client | one API class per module | `ccxt.okx({'apiKey': ..., 'secret': ..., 'password': ...})` |
| Instruments | `PublicData.PublicAPI().get_instruments()` | `load_markets()` |
| Ticker | `MarketData.MarketAPI().get_ticker()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `MarketData.MarketAPI().get_orderbook()` | `fetch_order_book()` |
| Candles | `MarketData.MarketAPI().get_candlesticks()` | `fetch_ohlcv()` |
| New order | `Trade.TradeAPI().place_order()` | `create_order()` |
| Cancel order | `Trade.TradeAPI().cancel_order()` | `cancel_order()` |
| Open orders | `Trade.TradeAPI().get_order_list()` | `fetch_open_orders()` |
| Balance | `Account.AccountAPI().get_account_balance()` | `fetch_balance()` |
| Positions | `Account.AccountAPI().get_positions()` | `fetch_positions()` |
| Streams | `WsPublicAsync(...).send("subscribe", args, ...)` | `watch_*` on `ccxt.pro.okx` |
| Demo trading | `flag="1"` on each client | `set_sandbox_mode(True)` |
| Anything not listed | native method | the same endpoint as an [implicit method](/docs/exchanges/okx/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [okx unified API reference](/docs/exchanges/okx).

## FAQ

**Is python-okx an official OKX SDK?**
OKX's own v5 documentation points developers at the `python-okx` package on PyPI, and the repository lives in the `okxapi` GitHub organisation — but the README itself opens with "This is an unofficial Python wrapper for the OKX exchange v5 API". Treat it as OKX-endorsed rather than OKX-guaranteed.

**Does CCXT support OKX demo trading?**
Yes. `exchange.set_sandbox_mode(True)` adds OKX's `x-simulated-trading: 1` header to every request and removes it again when you turn the flag off. That is the same mechanism `python-okx` exposes as `flag="1"`.

**Does CCXT support OKX futures, swaps, margin and options?**
Yes — spot, margin, dated futures, perpetual swaps and options from one `ccxt.okx` instance. The product is selected by the unified symbol, with `options.defaultType` setting the default (`spot`, `margin`, `swap`, `future`, `option`, `funding`).

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.okx` and call `watch*` methods — 19 of them for OKX, plus five `*Ws` methods for order entry over the socket.

**Can I still call OKX-specific endpoints?**
Yes — all 433 of them, as [implicit methods](/docs/exchanges/okx/implicit-api), with signing and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [okx unified API reference](/docs/exchanges/okx)
- [okx implicit API](/docs/exchanges/okx/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
