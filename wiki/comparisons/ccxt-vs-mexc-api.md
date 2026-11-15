<!-- title: CCXT vs the MEXC API and official MEXC SDK -->
<!-- description: MEXC's official SDK covers spot only. CCXT covers spot, margin and futures in one client, decodes the protobuf WebSocket feed and exposes 238 raw endpoints. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: MEXC's official SDK is spot-only, has no WebSocket client, and is distributed by git clone. CCXT covers spot, margin and swap in one class, with 16 watch* methods that decode MEXC's protobuf streams. -->
<!-- weight: 100 -->

# CCXT vs the MEXC API and official MEXC SDK

MEXC publishes an official connector, [`mexcdevelop/mexc-api-sdk`](https://github.com/mexcdevelop/mexc-api-sdk), generated into five languages from one spec. It covers the spot v3 REST API. [CCXT](/docs/manual) speaks the same API, plus MEXC's margin and contract endpoints and its WebSocket feed, behind method names shared with 104 other venues.

The question that decides between them: **do you need anything beyond spot REST?**

## TL;DR

- **Pick the official MEXC SDK** if you only ever call spot REST endpoints, you want method names that match MEXC's docs literally, and a `git clone` install is acceptable in your build.
- **Pick CCXT** if you need MEXC's swap markets, margin, or its WebSocket streams — the official SDK covers none of those, and MEXC's spot streams are Protocol Buffers, not JSON.
- **CCXT is not a lowest common denominator here.** All 238 MEXC endpoints are generated as [implicit methods](/docs/exchanges/mexc/implicit-api), signed and rate-limited like everything else.

## At a glance

| | **CCXT** | **Official MEXC SDK** |
| --- | --- | --- |
| Exchanges covered | 104 (MEXC is one of them) | MEXC only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | Python, JavaScript, Go, Java, .NET — generated from one spec |
| Install | `pip install ccxt` / `npm i ccxt` | `git clone`, then unzip the `dist/` folder for your language |
| MEXC products covered | spot, margin, swap | spot |
| Unified market data + trading API | yes — same method names on every exchange | no — MEXC's own request/response shapes |
| WebSockets | yes — 16 `watch*` / `unWatch*` methods, protobuf decoded for you | not in the SDK |
| Raw endpoint access | yes — 238 MEXC endpoints as implicit methods | spot endpoints only |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 50 ms) | no |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status + MEXC error codes |
| Testnet / sandbox | no — MEXC has no sandbox in CCXT | no |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | 316 GitHub stars, 134 forks; last repository update February 2024 |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `mexcdevelop/mexc-api-sdk` repository and MEXC's published spot v3 and contract v1 API documentation.</sub>

CCXT implements **83 unified capabilities** for MEXC — 40 of them `fetch*` methods — and marks it a **certified** exchange, meaning it is covered by the static request/response regression fixtures that run in CI.

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.mexc()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **mexc-api-sdk**

```python
from mexc_sdk import Spot

spot = Spot(api_key='apiKey', api_secret='apiSecret')
response = spot.ticker24hr(symbol='BTCUSDT')
print(response)
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — same keys, same types, same units on every venue. The SDK returns MEXC's payload as it arrives.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.mexc({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **mexc-api-sdk**

```python
from mexc_sdk import Spot

spot = Spot(api_key='apiKey', api_secret='apiSecret')
response = spot.newOrder(symbol='BTCUSDT', side='BUY', orderType='LIMIT',
                         options={'quantity': 1, 'price': 30000})
print(response)
```

<!-- tabs:end -->

To reach MEXC's swap markets you change one option in CCXT and nothing else:

```python
exchange = ccxt.mexc({'apiKey': '...', 'secret': '...',
                      'options': {'defaultType': 'swap'}})
positions = exchange.fetch_positions(['BTC/USDT:USDT'])
```

The official SDK has no contract client at all.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.mexc()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Raw MEXC WebSocket**

```python
# MEXC publishes .proto schemas, not a client:
#   https://github.com/mexcdevelop/websocket-proto
# You compile the 16 .proto files, open the socket, subscribe,
# decode each binary frame, fetch a REST snapshot, align it with
# the diff stream, and re-seed on every gap and reconnect.
```

<!-- tabs:end -->

This is the largest practical gap between the two options. MEXC's spot streams are **Protocol Buffers**: the exchange publishes schemas in [`mexcdevelop/websocket-proto`](https://github.com/mexcdevelop/websocket-proto) — 16 `.proto` files covering tickers, depths, trades, klines, account, orders and deals — and leaves the client to you. CCXT decodes those frames internally and hands you the same order book, trade and order structures that `fetch_order_book`, `fetch_trades` and `fetch_orders` return.

It also runs the parts around the socket: the REST snapshot fetch and delta alignment, reconnect and resubscribe, bounded caches, and the private-stream **`listenKey` refresh on a 20-minute timer** so your user-data stream does not expire silently.

## Where the differences actually bite

### The official SDK is spot-only

MEXC's spot v3 API and its contract v1 API are separate products with different base URLs and different signing headers — spot signs `totalParams` with HMAC-SHA256 into a `signature` query parameter, contract signs `accessKey + timestamp + requestParam` into a `Signature` header alongside `ApiKey` and `Request-Time`. The official SDK implements the first and not the second.

CCXT implements both behind one class. `options.defaultType` picks `spot` or `swap`; `'BTC/USDT'` and `'BTC/USDT:USDT'` pick the market.

One thing to know before you plan around it: MEXC's own contract documentation carries a notice dated 2022-07-25 stating that the contract *place order* and *cancel order* endpoints are closed temporarily while query endpoints stay available, and marks those endpoints "(Under maintenance)". CCXT exposes them either way — the availability is MEXC's call, not the library's.

### Installation

The official SDK is not published to PyPI or npm by MEXC. Its README installs it by cloning the repository and unzipping the `dist/` folder for your language. That works, but it does not pin cleanly in a lockfile or a container build. CCXT is one package from your language's ordinary registry.

### Eight languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go, Java and Rust, with identical method names and return structures.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.mexc()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.mexc ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **Go**

```go
exchange := ccxt.NewMexc(nil)
ticker, err := exchange.FetchTicker("BTC/USDT")
```

<!-- tabs:end -->

MEXC's SDK is also generated into five languages, but each is a MEXC-shaped client — not a portable API you can point at a second venue.

### Rate limits you do not have to model

MEXC meters per endpoint with weights, at 500 requests per 10 seconds per endpoint by IP and again by UID, and disconnects WebSocket clients above 100 messages per second. CCXT encodes the weights in the exchange definition and ships a token-bucket throttler that is on by default (`enableRateLimit = true`, `rateLimit = 50` ms). You write loops; the library paces them.

### One error hierarchy

CCXT maps MEXC's numeric codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `OnMaintenance` and 35 more, all under `BaseError`. You catch `ccxt.InsufficientFunds` once instead of matching on a code that may be re-used differently on the next venue.

### Nothing is hidden — the implicit API

Alongside the 83 unified capabilities, **all 238 MEXC endpoints are callable as implicit methods**, with signing, timestamping and rate-limit accounting applied:

```python
response = exchange.spot_private_get_capital_config_getall()
```

Browse them on the [mexc implicit API page](/docs/exchanges/mexc/implicit-api).

## What the official MEXC SDK does better

Honestly, and these are real:

- **Literal fidelity to MEXC's docs.** `ticker24hr()`, `newOrder()`, `depth()` — the names and fields are exactly what you are reading in the MEXC API reference. CCXT's unified names are a deliberate abstraction, which is one extra hop when you are debugging against the vendor documentation.
- **Vendor-generated across five languages from one spec.** The Python, JavaScript, Go, Java and .NET builds come from the same generator, so a team split across languages sees the same MEXC-shaped surface. MEXC also publishes a [Postman collection](https://github.com/mexcdevelop/mexc-api-postman) for exploring endpoints before writing code.
- **A much smaller dependency for spot-only work.** If all your process does is poll spot tickers, the SDK is a fraction of the size of CCXT.
- **New MEXC spot features land in the vendor's own client first.** A unified CCXT wrapper for a brand-new MEXC feature may lag the vendor SDK, even though the implicit API closes most of that gap on day one.

If MEXC spot REST is the whole of your integration and it always will be, the official SDK is a defensible choice. As soon as futures or streaming enters the plan, you are writing the missing client yourself.

There is also a widely used community Python wrapper, [`makarworld/pymexc`](https://github.com/makarworld/pymexc) — MIT, 65 GitHub stars, roughly 2.9k PyPI installs a month — which does cover spot and futures HTTP plus WebSocket classes. It describes itself as unofficial.

## Migrating from the MEXC SDK to CCXT

| What you are doing | MEXC SDK | CCXT |
| --- | --- | --- |
| Symbols | `'BTCUSDT'` | `'BTC/USDT'` spot, `'BTC/USDT:USDT'` swap |
| Product selection | spot client only | `options.defaultType` = `spot` / `margin` / `swap` |
| Exchange info | `exchangeInfo()` | `load_markets()` |
| 24h ticker | `ticker24hr()` | `fetch_ticker()` / `fetch_tickers()` |
| Depth | `depth()` | `fetch_order_book()` |
| Klines | `klines()` | `fetch_ohlcv()` |
| New order | `newOrder()` | `create_order()` |
| Cancel order | `cancelOrder()` | `cancel_order()` |
| Open orders | `openOrders()` | `fetch_open_orders()` |
| Account | `accountInfo()` | `fetch_balance()` |
| Streams | not in the SDK | `watch_*` on `ccxt.pro.mexc` |
| Anything not listed | — | the same endpoint as an [implicit method](/docs/exchanges/mexc/implicit-api) |

## FAQ

**Does MEXC have an official Python SDK?**
Yes — [`mexcdevelop/mexc-api-sdk`](https://github.com/mexcdevelop/mexc-api-sdk), MIT-licensed, generated into Python, JavaScript, Go, Java and .NET. It covers the spot v3 REST API. It is installed by cloning the repository and unzipping the `dist/` folder rather than from PyPI, and it does not include a WebSocket client or the contract API.

**Does CCXT support MEXC futures?**
Yes. `ccxt.mexc` covers spot, margin and swap markets from one instance, selected with `options.defaultType` and unified symbols such as `'BTC/USDT:USDT'`. Note that MEXC's own contract docs flag the contract order-placement endpoints as under maintenance; that is a venue-side status, not a CCXT limitation.

**How do I read MEXC's protobuf WebSocket feed?**
MEXC publishes `.proto` schemas rather than a client. CCXT decodes those frames for you: use `ccxt.pro.mexc` and call `watch_order_book`, `watch_trades`, `watch_ohlcv`, `watch_ticker`, `watch_orders`, `watch_my_trades` or `watch_balance` — 16 `watch*`/`unWatch*` methods in total — and you get the same structures the REST methods return.

**Does MEXC have a testnet, and does `setSandboxMode` work?**
CCXT does not define sandbox URLs for MEXC, so `setSandboxMode(True)` will not switch you to a test environment. Test against small live orders or against the static fixtures instead.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is bundled in the `ccxt` package under MIT. Use `ccxt.pro.mexc` and call `watch*` methods.

**Can I still call MEXC-specific endpoints through CCXT?**
Yes — all 238 of them, as [implicit methods](/docs/exchanges/mexc/implicit-api), with signing and rate limiting applied.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [mexc unified API reference](/docs/exchanges/mexc)
- [mexc implicit API](/docs/exchanges/mexc/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
