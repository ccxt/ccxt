<!-- title: CCXT vs the Bybit API and pybit -->
<!-- description: How CCXT compares with pybit and Bybit's other connectors on language coverage, WebSockets, rate limits, demo trading and raw endpoint access. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Bybit publishes official connectors in eight languages, but their traction varies from 671 stars to zero. CCXT covers spot, linear, inverse and options from one client and still exposes all 403 raw V5 endpoints. -->
<!-- weight: 20 -->

# CCXT vs the Bybit API and pybit

Bybit's V5 API is one of the tidier exchange APIs: a single `category` parameter (`spot`, `linear`, `inverse`, `option`) selects the product line, so one connector can cover all four. Bybit publishes official connectors for several languages, and there is an unusually good community Node SDK on top of that.

[CCXT](/docs/manual) speaks the same V5 API, but behind method names shared with 103 other venues. The question that decides between them is the usual one: **is Bybit the only venue your code will ever touch?**

## TL;DR

- **Pick an official Bybit connector** if Bybit is your only venue and you want `category`/`orderType`/`qty` to read exactly as they do in Bybit's own reference.
- **Pick CCXT** if you want one dependency and one mental model across Bybit spot, USDT/USDC perpetuals, inverse contracts and options — and across the next exchange you add.
- **The community Node SDK is genuinely strong.** If you are in TypeScript and Bybit-only, [`bybit-api`](https://github.com/tiagosiebler/bybit-api) is a serious option and this page says so below.
- **Choosing CCXT does not hide anything.** All 403 raw Bybit endpoints are callable as [implicit methods](/docs/exchanges/bybit/implicit-api).

## At a glance

| | **CCXT** | **Bybit's own + community connectors** |
| --- | --- | --- |
| Exchanges covered | 104 (Bybit is one of them) | Bybit only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python, Go, Java, .NET, JS, PHP, Ruby, Rust — separate codebases, very uneven traction |
| Packages to install | **1** (`ccxt`) | one per language, plus a separate `bybit_p2p` package for P2P |
| Bybit products in one client | spot, linear, inverse, options | yes — V5's `category` parameter does this too |
| Unified market data + trading API | yes — same method names on every exchange | no — Bybit's own request/response shapes |
| WebSockets | yes — 25 `watch*` / `unWatch*` methods, plus `createOrderWs`, `editOrderWs`, `cancelOrderWs` | yes, per-connector stream clients |
| Raw endpoint access | yes — 403 Bybit endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 20 ms) | not documented in pybit's README |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status + Bybit `retCode` |
| Testnet | `exchange.set_sandbox_mode(True)` | `HTTP(testnet=True)` |
| Demo trading | `exchange.enable_demo_trading(True)` | separate base URL |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** (one package, every venue) | pybit 671 stars · 254k PyPI installs/month; community `bybit-api` (Node) 344 stars · 113k npm installs/month |
| Licence | MIT | pybit MIT; `bybit-api` MIT |
| Support | Discord, Telegram, GitHub — usually same-day | GitHub issues, Bybit developer channels |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `bybit-exchange` GitHub organisation's repository listing, the pybit and `bybit-api` repositories and package pages, and install counts from npm and PyPI.</sub>

### One connector per language is not one API in seven languages

Bybit's V5 documentation names official SDKs for Python, Go, Java and .NET, and points at a community Node SDK. The organisation also publishes JavaScript, PHP, Ruby and Rust connectors. They are separate codebases with separate idioms, and their adoption is wildly uneven — read on the day this page was written, `pybit` had 671 stars, `bybit.go.api` 85, `bybit-java-api` 41, `bybit.net.api` 27, `bybit-rust-api` 3, and `bybit.js.api`, `bybit.php.api` and `bybit.ruby.api` had none.

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java. The method names, arguments and return structures are identical in all seven, so a Python research notebook and a Go execution service share a data model rather than agreeing to disagree about one.

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bybit()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **pybit**

```python
from pybit.unified_trading import HTTP

session = HTTP(testnet=False)
print(session.get_tickers(category="linear", symbol="BTCUSDT"))
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — same keys, same types, same units, whether the venue is Bybit, Kraken or Hyperliquid. pybit returns Bybit's `retCode`/`retMsg`/`result` envelope, which you unwrap and parse yourself. The `category="linear"` argument disappears in CCXT because it is encoded in the symbol: `BTC/USDT` is spot, `BTC/USDT:USDT` is the linear perpetual, `BTC/USD:BTC` the inverse one.

### Place an order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bybit({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT:USDT', 'market', 'buy', 0.001)
print(order['id'], order['status'])
```

#### **pybit**

```python
from pybit.unified_trading import HTTP

session = HTTP(testnet=False, api_key="...", api_secret="...")
print(session.place_order(
    category="linear",
    symbol="BTCUSDT",
    side="Buy",
    orderType="Market",
    qty="0.001",
))
```

<!-- tabs:end -->

To place the same order on spot, in CCXT you change the symbol to `'BTC/USDT'`. In pybit you change `category` to `"spot"` — and then discover the fields that behave differently between categories, which is exactly the per-category detail CCXT's `create_order` already normalises.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.bybit()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT:USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **pybit**

```python
from pybit.unified_trading import WebSocket

ws = WebSocket(testnet=True, channel_type="linear")

def handle_message(message):
    print(message)

ws.orderbook_stream(50, "BTCUSDT", handle_message)
```

<!-- tabs:end -->

These are not doing the same thing. CCXT returns a **live, fully merged order book** with the same structure as `fetch_order_book`. The raw stream hands you **snapshot and delta messages** and leaves the merging, sequencing and re-sync to you:

| | CCXT | raw stream |
| --- | --- | --- |
| Apply deltas onto the snapshot in order | done for you | your code |
| Detect a sequence gap and re-seed the book | done for you | your code |
| Reconnect, re-subscribe and re-seed after a drop | done for you | your code |
| Keep a bounded, depth-limited cache | done for you | your code |
| Same structure as the REST call | yes | no |

None of those failure modes throw. A book that has quietly drifted looks fine until a fill surprises you.

## Where the differences actually bite

### Portability is the whole point

This is the difference that shows up six months in. A second venue means a second SDK, a second payload shape, a second symbol convention, a second error taxonomy and a second WebSocket dialect — then a translation layer of your own so the rest of the system can stay venue-agnostic. That translation layer is what CCXT already is, maintained across 104 venues.

```python
for exchange_id in ['bybit', 'binance', 'okx', 'kraken', 'coinbase']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT')['last'])
```

### WebSockets that look like REST

CCXT Pro is bundled in the same `ccxt` package — no separate purchase — and gives Bybit **25 streaming methods**: `watchOrderBook`, `watchOrderBookForSymbols`, `watchTrades`, `watchTradesForSymbols`, `watchOHLCV`, `watchTicker`, `watchTickers`, `watchBidsAsks`, `watchBalance`, `watchOrders`, `watchPositions`, `watchMyTrades`, `watchLiquidations` and their `unWatch*` counterparts. Order entry over the socket is there too: `createOrderWs`, `editOrderWs` and `cancelOrderWs`.

`watch_order_book` returns the same structure as `fetch_order_book`; `watch_orders` the same as `fetch_orders`. Swapping a polling loop for a stream is a one-word change and nothing downstream moves.

### Testnet and demo trading are different things, and CCXT models both

Bybit has two non-production modes and they are not interchangeable: a **testnet** on separate hosts, and **demo trading**, which runs against `api-demo` with your live-account credentials. CCXT exposes them as two explicit switches:

```python
exchange = ccxt.bybit({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)      # testnet hosts

exchange = ccxt.bybit({'apiKey': '...', 'secret': '...'})
exchange.enable_demo_trading(True)   # api-demo hosts
```

Turning both on at once raises `NotSupported` rather than silently sending demo orders at a testnet host. Every REST and WebSocket URL moves with the flag; there is no second configuration path in your code.

### Rate limits you do not have to model

Bybit meters per endpoint and per account tier. CCXT encodes the weights in the exchange definition and ships a token-bucket throttler that is **on by default** — `rateLimit` is 20 ms for Bybit, with a 5-second rolling window configured for the endpoints that need one. You call methods in a loop; the library paces them. With a raw connector, respecting the limits and backing off on a 403 or `retCode` 10006 is application code you write and keep working.

### One error hierarchy

CCXT maps Bybit's `retCode` values onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. `except ccxt.InsufficientFunds` keeps working when you add a second exchange; matching on `retCode == 110007` does not.

### Precision, rounding and string math

Bybit rejects orders that violate tick size, qty step or minimum notional. CCXT loads Bybit's instrument metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class, so quantities do not drift through float rounding.

```python
amount = exchange.amount_to_precision('BTC/USDT:USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT:USDT', 61234.56789)
```

### Nothing is hidden — the implicit API

The usual objection to a unified library is that it must be a lowest common denominator. It is not. Alongside the **124 unified capabilities** CCXT implements for Bybit, **all 403 endpoints in Bybit's API are generated as callable implicit methods**, with signing, rate-limit accounting and error mapping still applied:

```python
# any raw Bybit endpoint, camelCased from its path
response = exchange.private_get_v5_account_info()
```

So the unified API covers what every venue shares, and the implicit API covers the Bybit-specific remainder — without dropping to raw HTTP or adding a second dependency. Browse them on the [Bybit implicit API page](/docs/exchanges/bybit/implicit-api).

## What pybit and bybit-api do better

An honest list, because these are real:

- **pybit is a thin, literal mirror of the V5 docs.** `category`, `orderType`, `qty`, `retCode` — the names in your code are the names on the documentation page you are reading. CCXT's unified names are a deliberate abstraction, which is one extra hop when you are debugging against Bybit's reference.
- **pybit's dependency surface is tiny.** It is Python-only and builds on `requests` and `websocket-client`. If Bybit is your only venue and you only need a handful of endpoints, that is a much smaller thing to install and audit than all of CCXT.
- **The community Node SDK is excellent, and better than most exchanges' official ones.** [`bybit-api`](https://github.com/tiagosiebler/bybit-api) is MIT, TypeScript-first, and its README documents thorough type declarations for most requests and responses including the WebSocket API, configurable heartbeats, and automatic reconnect-then-resubscribe. It shipped v4.7.5 on 1 September 2026 and pulls 113k npm installs a month — a release cadence and an install base comparable to a well-run official SDK. If you are Bybit-only in TypeScript, it is a defensible choice and we would not argue with it.
- **`bybit-api` also advertises venue-side perks CCXT users do not get.** Its README states that rate limits are raised to 400 requests per second for SDK users, and that orders can go as low as $1 notional against the usual $5 minimum. Those are agreements between that SDK and Bybit, not properties of the API — no third-party library can hand them to you.
- **New V5 endpoints land in a thin connector first.** A brand-new Bybit endpoint appears in a pass-through SDK the day it is documented; a *unified* CCXT method for it may lag. (CCXT's implicit API closes most of that gap immediately, but the unified wrapper can trail.)

If Bybit is your only venue, forever, and you value literal fidelity to their reference over portability, pybit in Python or `bybit-api` in TypeScript are both reasonable choices.

## Migrating from pybit to CCXT

| What you are doing | pybit | CCXT |
| --- | --- | --- |
| Symbols | `symbol="BTCUSDT"` + `category="linear"` | `'BTC/USDT'` spot, `'BTC/USDT:USDT'` linear, `'BTC/USD:BTC'` inverse |
| Client | `HTTP(api_key=..., api_secret=...)` | `ccxt.bybit({'apiKey': ..., 'secret': ...})` |
| Instruments | `get_instruments_info()` | `load_markets()` |
| Ticker | `get_tickers()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `get_orderbook()` | `fetch_order_book()` |
| Candles | `get_kline()` | `fetch_ohlcv()` |
| Public trades | `get_public_trade_history()` | `fetch_trades()` |
| New order | `place_order()` | `create_order()` |
| Cancel order | `cancel_order()` | `cancel_order()` |
| Open orders | `get_open_orders()` | `fetch_open_orders()` |
| Balance | `get_wallet_balance()` | `fetch_balance()` |
| Positions | `get_positions()` | `fetch_positions()` |
| Streams | `WebSocket(...).orderbook_stream(...)` | `watch_*` on `ccxt.pro.bybit` |
| Testnet | `HTTP(testnet=True)` | `set_sandbox_mode(True)` |
| Demo trading | separate base URL | `enable_demo_trading(True)` |
| Anything not listed | native method | the same endpoint as an [implicit method](/docs/exchanges/bybit/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [bybit unified API reference](/docs/exchanges/bybit).

## FAQ

**Is CCXT slower than calling the Bybit API directly?**
CCXT adds parsing and normalisation on top of the same HTTP and WebSocket calls, so there is a small constant overhead per message. For anything short of latency-sensitive market making, network round-trip time dominates it. If you are optimising microseconds you are writing custom code against a colocated endpoint anyway, which is not a comparison between two general-purpose libraries.

**Does CCXT support Bybit's unified account, inverse contracts and options?**
Yes. One `ccxt.bybit` instance covers spot, USDT and USDC linear perpetuals and futures, inverse contracts and options. The product is selected by the unified symbol — `BTC/USDT:USDT`, `BTC/USD:BTC`, `BTC/USDC:USDC-241227-55000-P` — with `options.defaultType` setting the default.

**Can I use Bybit demo trading through CCXT?**
Yes, with `exchange.enable_demo_trading(True)`, which swaps every REST and WebSocket URL to Bybit's `api-demo` hosts. That is separate from `set_sandbox_mode(True)`, which switches to testnet; enabling both at once raises `NotSupported`.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.bybit` and call `watch*` methods — 25 of them for Bybit, plus `createOrderWs`, `editOrderWs` and `cancelOrderWs` for order entry over the socket.

**Can I still call Bybit-specific endpoints?**
Yes — all 403 of them, as [implicit methods](/docs/exchanges/bybit/implicit-api), with signing and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bybit unified API reference](/docs/exchanges/bybit)
- [bybit implicit API](/docs/exchanges/bybit/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
