<!-- title: CCXT vs the BloFin API and official SDK -->
<!-- description: BloFin's official SDK is Python-only and installs from source. Compared with CCXT on languages, streaming, demo trading, rate limits and raw endpoints. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: BloFin's official Python SDK installs from source and was last updated in January 2025. CCXT covers the same venue with 54 unified capabilities, 13 streaming methods and 79 raw endpoints in seven languages. -->
<!-- weight: 100 -->

# CCXT vs the BloFin API and official SDK

[BloFin](https://www.blofin.com) is a perpetual-futures venue with a documented REST and WebSocket API at [docs.blofin.com](https://docs.blofin.com/) and a demo-trading environment at `demo-trading-openapi.blofin.com`. It publishes one first-party client library: [blofin-sdk-python](https://github.com/blofin/blofin-sdk-python), Apache-2.0, covering REST and WebSockets including BloFin's copy-trading and affiliate APIs.

Two things narrow the choice. That SDK exists in Python only — BloFin's other public repositories are a UI library, a CLI, an MCP server and a skills hub, not SDKs. And it is installed from source (`pip install -e .`), not from a package index; the `blofin` name on PyPI belongs to a separate community project.

So the deciding question is: **is Python the only language you need, and is copy trading part of what you are building?**

## TL;DR

- **Pick blofin-sdk-python** if you are on Python and you need BloFin's copy-trading or affiliate APIs as typed methods, and you do not mind vendoring the repository.
- **Pick CCXT** for anything else: 54 unified capabilities, 26 of them `fetch*`, 13 `watch*` streaming methods and all 79 BloFin endpoints — copy trading and affiliate routes included — as implicit methods, in TypeScript, JavaScript, Python, PHP, C#/.NET, Go and Java.
- **Demo trading works in both.** BloFin's SDK gives you a `DemoClient`; CCXT gives you `set_sandbox_mode(True)`, which swaps the REST and both WebSocket URLs in one call.

## At a glance

| | **CCXT** | **blofin-sdk-python (official)** |
| --- | --- | --- |
| Exchanges covered | 104 (BloFin is one of them) | BloFin only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python |
| Install | `pip install ccxt` and equivalents | `pip install -e .` from a clone |
| Unified market data + trading API | yes — same method names across every exchange | no — BloFin's own request/response shapes |
| BloFin capabilities implemented | 54 unified methods, 26 of them `fetch*` | REST plus WebSocket across trading, market, copytrading, affiliate |
| Raw endpoint access | yes — 79 BloFin endpoints as implicit methods | yes, it is the whole product |
| WebSockets | yes — 13 `watch*` methods, same shapes as `fetch*` | yes — public, private and copytrading clients |
| Copy trading | via implicit methods (`copytrading/*` routes) | first-class `CopyTradingAPI` |
| Built-in rate limiter | yes, on by default (`rateLimit` 100 ms) | not provided |
| Unified error types | yes — 41 typed exceptions in one hierarchy | BloFin error codes |
| Demo trading | `set_sandbox_mode(True)` swaps REST and WebSocket URLs | `DemoClient`, or `isDemo=True` |
| Latest repository update read | continuous | 30 January 2025 |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | 4 GitHub stars; the community `blofin` PyPI package — a separate project — has about 1k installs/month |
| Licence | MIT | Apache-2.0 |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the blofin GitHub organisation's repository listing, the blofin-sdk-python README and examples, BloFin's published API documentation, and install counts from PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.blofin()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **blofin-sdk-python**

```python
from blofin.client import Client
from blofin.rest_market import MarketAPI

client = Client(apiKey='...', apiSecret='...', passphrase='...')
market = MarketAPI(client)
tickers = market.getTickers(instId='BTC-USDT')
print(tickers)
```

<!-- tabs:end -->

BloFin instruments are `BTC-USDT`; CCXT normalises the linear perpetual to `'BTC/USDT:USDT'` — the unified notation that says "BTC against USDT, settled in USDT" and reads identically on Bybit, OKX or Hyperliquid. The CCXT call returns a [unified ticker structure](/docs/manual#ticker-structure); the SDK returns BloFin's payload for you to parse.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.blofin({'apiKey': '...', 'secret': '...', 'password': '...'})
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **blofin-sdk-python**

```python
import time
from blofin.client import Client
from blofin.rest_trading import TradingAPI

client = Client(apiKey='...', apiSecret='...', passphrase='...')
trading = TradingAPI(client)
result = trading.placeOrder(
    instId='BTC-USDT',
    marginMode='cross',
    positionSide='net',
    side='buy',
    orderType='limit',
    size='0.1',
    price='60000',
    clientOrderId=f'test_{int(time.time())}')
print(result)
```

<!-- tabs:end -->

`marginMode` and `positionSide` are BloFin's terms, and every venue spells them differently. CCXT reads sensible defaults from the market and lets you override them through unified helpers — `set_margin_mode`, `set_position_mode`, `set_leverage` — that have the same names on every derivatives venue it supports.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.blofin()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT:USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **blofin-sdk-python**

```python
from blofin.websocket_client import BlofinWsPublicClient

public_client = BlofinWsPublicClient()            # production
demo_client = BlofinWsPublicClient(isDemo=True)   # demo trading
# subscribe to the books channel, then handle messages in a callback
```

<!-- tabs:end -->

CCXT returns a live, merged order book as a value you `await`; the SDK gives you a socket client you subscribe on and handle in callbacks. Underneath, CCXT does the parts that are easy to get wrong: applying the snapshot, merging updates, detecting drops, reconnecting and re-subscribing, and keeping bounded caches for trades and candles.

## Where the differences actually bite

### One language versus seven

BloFin's SDK is Python-only. CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java with identical method names and return structures, so research in a Python notebook ports to a Go or C# execution service without a second data model:

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.blofin ();
const ticker = await exchange.fetchTicker ('BTC/USDT:USDT');
```

#### **Python**

```python
import ccxt
exchange = ccxt.blofin()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
```

#### **C#**

```csharp
var exchange = new ccxt.blofin();
var ticker = await exchange.FetchTicker("BTC/USDT:USDT");
```

#### **Go**

```go
exchange := ccxt.NewBlofin(nil)
ticker, err := exchange.FetchTicker("BTC/USDT:USDT")
```

<!-- tabs:end -->

### Signing five headers, correctly, every time

BloFin private requests carry `ACCESS-KEY`, `ACCESS-SIGN`, `ACCESS-TIMESTAMP`, `ACCESS-NONCE` and `ACCESS-PASSPHRASE`, where the signature is a base64-encoded HMAC-SHA256 over the request path, method, timestamp, nonce and body concatenated in that order. Both the SDK and CCXT build that for you — the difference is that CCXT builds it in all seven languages, and applies it to the implicit methods too.

### Rate limits you do not have to model

BloFin documents up to 500 requests per minute per IP, 1500 per five minutes, and a tighter 30 requests per 10 seconds on trading endpoints, with timed suspensions when you exceed them. The official SDK does not ship a throttler. CCXT's token-bucket limiter is **on by default**, with `rateLimit` set to 100 ms for BloFin, so a loop paces itself.

### Demo trading without a second code path

```python
exchange = ccxt.blofin({'apiKey': '...', 'secret': '...', 'password': '...'})
exchange.set_sandbox_mode(True)   # swaps REST and both WebSocket URLs
```

One flag moves REST to `demo-trading-openapi.blofin.com` and both socket URLs with it. The SDK's equivalent is a different client class (`DemoClient`) or an `isDemo=True` argument on each client you construct.

### One error hierarchy

CCXT maps BloFin's numeric error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError` and 35 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once and it survives adding a second venue, instead of matching on codes like `152007`.

### Derivatives features, unified

BloFin is a perpetuals venue, and CCXT models the parts that matter as unified methods: `fetch_positions`, `fetch_funding_rate`, `fetch_funding_rate_history`, `fetch_funding_history`, `set_leverage`, `set_margin_mode`, `set_position_mode`, `close_position`, `fetch_leverages`, `fetch_positions_adl_rank`, plus `create_order_with_take_profit_and_stop_loss`, `create_trigger_order`, `create_stop_loss_order` and `create_take_profit_order`. The same method names work on Bybit, OKX and the rest.

### Nothing is hidden — the implicit API

Alongside the 54 unified capabilities, **all 79 BloFin endpoints are generated as callable implicit methods**, with the five-header signing, rate limiting and error mapping applied — and that includes the copy-trading and affiliate routes the official SDK wraps:

```python
# GET /api/v1/copytrading/account/balance
balance = exchange.private_get_copytrading_account_balance()

# GET /api/v1/affiliate/invitees
invitees = exchange.private_get_affiliate_invitees()
```

Browse them all on the [blofin implicit API page](/docs/exchanges/blofin/implicit-api).

## What the official BloFin SDK does better

An honest list, because these are real:

- **Copy trading and affiliate APIs as typed methods.** `CopyTradingAPI` and `AffiliateAPI` wrap those endpoints with named parameters. CCXT reaches the same routes through implicit methods, but has no *unified* copy-trading abstraction — those are BloFin-specific products, so there is nothing to unify them against.
- **One-to-one naming with BloFin's docs.** `instId`, `marginMode`, `positionSide`, `orderType` are BloFin's own field names, so debugging against the API reference has no translation step. CCXT's unified names are a deliberate abstraction.
- **A dedicated copy-trading WebSocket client.** `BlofinWsCopytradingClient` connects to `wss://openapi.blofin.com/ws/copytrading/private`, a channel CCXT does not expose as a `watch*` method.
- **New BloFin features land there first.** A new endpoint appears in BloFin's own SDK before it is modelled as a unified CCXT method; CCXT's implicit API closes most of that gap on day one, but a unified wrapper can lag.
- **BloFin also ships developer tooling around it.** The same organisation publishes an MCP server and a CLI for the exchange, which are useful if you are building agent- or terminal-driven workflows against BloFin specifically.

If you are writing Python, trading only BloFin, and copy trading is central to what you are building, the official SDK is a defensible choice.

## Migrating from blofin-sdk-python to CCXT

| What you are doing | blofin-sdk-python | CCXT |
| --- | --- | --- |
| Symbols | `'BTC-USDT'` | `'BTC/USDT:USDT'` |
| Client | `Client(...)` / `DemoClient(...)` | `ccxt.blofin({'apiKey', 'secret', 'password'})` + `set_sandbox_mode()` |
| Instruments | `MarketAPI.getInstruments()` | `load_markets()` |
| Ticker | `MarketAPI.getTickers()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `MarketAPI` books endpoint | `fetch_order_book()` |
| Candles | `MarketAPI` candles endpoint | `fetch_ohlcv()` |
| New order | `TradingAPI.placeOrder()` | `create_order()` |
| Batch orders | `TradingAPI.placeBatchOrders()` | `create_orders()` |
| Cancel order | `TradingAPI` cancel endpoint | `cancel_order()` |
| Open orders | `TradingAPI` pending-orders endpoint | `fetch_open_orders()` |
| Positions | `TradingAPI` positions endpoint | `fetch_positions()` / `fetch_position()` |
| Leverage | `TradingAPI` set-leverage endpoint | `set_leverage()` |
| Balance | `TradingAPI` balance endpoint | `fetch_balance()` |
| Streams | `BlofinWsPublicClient` / `BlofinWsPrivateClient` | `watch_*` on `ccxt.pro.blofin` |
| Copy trading | `CopyTradingAPI` | `copytrading/*` [implicit methods](/docs/exchanges/blofin/implicit-api) |
| Anything not listed | native method | the same endpoint as an [implicit method](/docs/exchanges/blofin/implicit-api) |

## FAQ

**Does BloFin have an official SDK?**
Yes, one: [blofin-sdk-python](https://github.com/blofin/blofin-sdk-python), Apache-2.0, covering REST and WebSockets including copy trading and the affiliate API. Its README installs it from a clone with `pip install -e .` rather than from PyPI, and the repository was last updated on 30 January 2025. There is no official SDK for any other language.

**Is the `blofin` package on PyPI the official SDK?**
No. That package points at `nomeida/blofin-python`, a separate MIT-licensed community project. If you want BloFin's own code, clone the `blofin/blofin-sdk-python` repository.

**Does CCXT support BloFin WebSockets?**
Yes — 13 `watch*` methods via `ccxt.pro.blofin`, covering tickers, bids/asks, trades, candles, order books, orders, positions, balance and funding rates, plus the `*ForSymbols` multi-symbol variants. Reconnect, re-subscribe and book merging are handled by the library.

**Can I use BloFin demo trading through CCXT?**
Yes. `exchange.set_sandbox_mode(True)` switches the REST base URL and both public and private WebSocket URLs to `demo-trading-openapi.blofin.com`. Use API keys issued for the demo environment.

**Does CCXT support BloFin spot trading?**
CCXT models BloFin as a swap venue — perpetual futures — which is what the exchange's API is built around. Unified symbols are of the form `'BTC/USDT:USDT'`.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [blofin unified API reference](/docs/exchanges/blofin)
- [blofin implicit API](/docs/exchanges/blofin/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
