<!-- title: CCXT vs the Upbit API and official Upbit SDKs -->
<!-- description: Upbit ships a modern official SDK in Python, TypeScript and Go. CCXT compared on portability, JWT signing, rate limits and symbol format. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Upbit's official SDKs are genuinely good and Upbit-shaped. CCXT trades that literalness for one API across 104 venues, unified KRW symbols, JWT signing and 9 watch* methods. -->
<!-- weight: 100 -->

# CCXT vs the Upbit API and official Upbit SDKs

Upbit publishes a first-party SDK family under the [`upbit-official`](https://github.com/upbit-official) GitHub organisation: [`upbit-sdk-python`](https://github.com/upbit-official/upbit-sdk-python) (Apache-2.0, on PyPI as `upbit-sdk`), [`upbit-sdk-typescript`](https://github.com/upbit-official/upbit-sdk-typescript), [`upbit-sdk-go`](https://github.com/upbit-official/upbit-sdk-go) and a Go CLI. They are recent, actively pushed, and typed. [CCXT](/docs/manual) speaks the same REST and WebSocket APIs behind method names shared with 103 other exchanges.

This is one of the closer comparisons on this site, because the official SDK is good. The question that decides it: **is Upbit the only venue you will ever touch?**

## TL;DR

- **Pick the official Upbit SDK** if Upbit is your only venue and you want typed, Upbit-shaped requests and responses that match `global-docs.upbit.com` field for field, with sync and async clients from the same package.
- **Pick CCXT** if you want Upbit alongside other venues under one API, unified symbols instead of Upbit's reversed `KRW-BTC` market ids, and the same `watch*` streaming shape you use everywhere else.
- **CCXT is not a lowest common denominator.** All 53 Upbit endpoints are generated as [implicit methods](/docs/exchanges/upbit/implicit-api), JWT-signed and rate-limited like the unified ones.

## At a glance

| | **CCXT** | **Official Upbit SDKs** |
| --- | --- | --- |
| Exchanges covered | 104 (Upbit is one of them) | Upbit only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | Python, TypeScript, Go — separate codebases |
| Install | `pip install ccxt` / `npm i ccxt` | `pip install upbit-sdk` and the per-language equivalents |
| Unified market data + trading API | yes — same method names on every exchange | no — Upbit's own request and response shapes |
| Symbols | `'BTC/KRW'` | `'KRW-BTC'` — quote currency first |
| Sync and async | sync `ccxt`, async `ccxt.async_support`, streaming `ccxt.pro` | `Upbit` and `AsyncUpbit` in one package |
| WebSockets | yes — 9 `watch*` methods returning the same structures as `fetch*` | yes, built on `websockets` |
| Raw endpoint access | yes — 53 Upbit endpoints as implicit methods | the endpoints the SDK wraps |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 50 ms) | not a documented feature of the SDK |
| Unified error types | yes — 41 typed exceptions in one hierarchy | Upbit error names such as `jwt_verification`, `validation_error` |
| Testnet / sandbox | no — Upbit has no sandbox wired up in CCXT | no |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `upbit-sdk-python` 89 stars · 1,557 PyPI installs/month; `upbit-sdk-typescript` 82 stars |
| Licence | MIT | Apache-2.0 |
| Support | Discord, Telegram, GitHub issues — usually same-day | Upbit Developer Center, GitHub |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `upbit-official` GitHub repositories, PyPI download counts and Upbit's published API documentation.</sub>

CCXT implements **39 unified capabilities** for Upbit, **20** of them `fetch*` methods.

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.upbit()
ticker = exchange.fetch_ticker('BTC/KRW')
print(ticker['last'], ticker['baseVolume'])
```

#### **upbit-sdk**

```python
from upbit import Upbit

client = Upbit()
tickers = client.tickers.list_by_trading_pairs(markets="KRW-BTC")
print(tickers)
```

<!-- tabs:end -->

Two things differ, and the second one matters more than it looks. The SDK returns Upbit's payload; CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) with the same keys and units it returns everywhere else. And the market id is **`KRW-BTC`, not `BTC-KRW`** — Upbit puts the quote currency first. CCXT normalises that to `'BTC/KRW'`, base first, the same way it does on every other venue.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.upbit({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/KRW', 'limit', 'buy', 0.0001, 90000000)
print(order['id'], order['status'])
```

#### **upbit-sdk**

```python
import os
from upbit import Upbit

client = Upbit(
    access_key=os.environ.get("UPBIT_ACCESS_KEY"),
    secret_key=os.environ.get("UPBIT_SECRET_KEY"),
)
order = client.orders.create(
    market="KRW-BTC",
    side="bid",
    ord_type="limit",
    price="90000000",
    volume="0.0001",
)
```

<!-- tabs:end -->

`side="bid"` and `side="ask"` are Upbit's vocabulary. CCXT takes `'buy'` and `'sell'`, the same words it takes on Binance, Kraken and everything else, and translates at the boundary.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.upbit()
    while True:
        orderbook = await exchange.watch_order_book('BTC/KRW')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **raw WebSocket**

```python
import json
import uuid
import websockets

async def main():
    async with websockets.connect('wss://api.upbit.com/websocket/v1') as ws:
        await ws.send(json.dumps([
            {'ticket': str(uuid.uuid4())},
            {'type': 'orderbook', 'codes': ['KRW-BTC']},
        ]))
        while True:
            print(json.loads(await ws.recv()))
            # keep-alive, reconnect, resubscribe and caching are yours
```

<!-- tabs:end -->

CCXT returns a merged, depth-limited [order book structure](/docs/manual#order-book-structure), reconnects and resubscribes on a drop, and enforces Upbit's five-connections-per-second and five-messages-per-second limits from the same throttler it uses for REST.

## Where the differences actually bite

### Symbols are reversed, and only on Upbit

Upbit market ids read quote-first: `KRW-BTC`, `KRW-ETH`, `BTC-ETH`. Every other major venue reads base-first. If your codebase touches more than one exchange, that inversion is a permanent source of subtle bugs — a string that parses "correctly" on both sides but means the opposite pair. CCXT parses the id once in `parse_market` and gives you `'BTC/KRW'`, so the rest of your code never sees it.

### Portability is the whole point

This is the difference that shows up six months in, not on day one. Adding a second exchange to an official-SDK integration means a second SDK, a second set of payload shapes, a second symbol convention, a second error taxonomy and a second WebSocket dialect — then a translation layer of your own so the rest of your code can stay venue-agnostic. That layer is what CCXT already is.

```python
for exchange_id in ['upbit', 'binance', 'bybit', 'okx', 'kraken']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT')['last'])
```

### JWT signing you do not have to build

Upbit does not use the header-plus-HMAC scheme most exchanges use. Every private request carries a **JWT** in an `Authorization: Bearer` header, whose payload holds `access_key`, a fresh `nonce` UUID and — whenever the request has parameters — a `query_hash` that is the SHA-512 digest of the encoded query string, plus `query_hash_alg`. Miss the hash on a request that has parameters and authentication fails; compute it over the wrong encoding and it fails the same way. CCXT builds the token, the nonce and the hash on every call.

### Regional hosts, one option

Upbit runs separate hosts per region — `api.upbit.com` for Korea, `<countryCode>-api.upbit.com` for Indonesia, Singapore and Thailand, each with its own listings. In CCXT that is a constructor option, and every REST and WebSocket URL follows it:

```python
exchange = ccxt.upbit({'hostname': '<countryCode>-api.upbit.com'})
```

### Rate limits you do not have to model

Upbit meters per endpoint group, and the groups have very different budgets: quotation endpoints (`market`, `candle`, `trade`, `ticker`, `orderbook`) allow 10 requests per second per IP; the exchange `default` group allows 30 per second per account; `order` allows 8 per second; `order-cancel-all` allows one request per 2 seconds. WebSocket adds 5 connections per second and 5 messages per second up to 100 per minute. Exceed them and you get HTTP 429, then 418 if you keep going.

CCXT encodes per-endpoint costs in the exchange definition and ships a token-bucket throttler that is on by default (`enableRateLimit = True`, `rateLimit = 50` ms), so a loop over symbols paces itself rather than tripping the `order-cancel-all` budget on the third call.

### WebSockets that look like REST

`watch_order_book` returns the same structure as `fetch_order_book`; `watch_orders` the same as `fetch_orders`. Swapping polling for streaming is a one-word change. CCXT gives Upbit 9 streaming methods: `watchTicker`, `watchTickers`, `watchTrades`, `watchTradesForSymbols`, `watchOHLCV`, `watchOrderBook`, `watchOrders`, `watchMyTrades` and `watchBalance`.

### Precision, rounding and string math

Upbit uses tick-size precision, and a price that is not a multiple of the symbol's tick is rejected. CCXT loads that metadata with the markets and gives you helpers backed by the `Precise` string-arithmetic class:

```python
amount = exchange.amount_to_precision('BTC/KRW', 0.0012345678)
price = exchange.price_to_precision('BTC/KRW', 90123456.7)
```

### One error hierarchy

CCXT maps Upbit's named errors onto a [typed exception tree](/docs/manual#error-handling) — `jwt_verification` becomes `AuthenticationError`, `validation_error` becomes `BadRequest`, and `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded` and 35 more all descend from `BaseError`. You catch `ccxt.InsufficientFunds` once and it keeps working on the next venue.

### Nothing is hidden — the implicit API

Alongside the 39 unified capabilities, **all 53 Upbit endpoints are generated as callable implicit methods**, with JWT signing, query hashing, rate-limit accounting and error mapping applied. Browse them on the [Upbit implicit API page](/docs/exchanges/upbit/implicit-api).

## What the official Upbit SDKs do better

An honest list, and these are strong:

- **They are typed, modern and current.** `upbit-sdk-python` requires Python 3.9+, ships sync (`Upbit`) and async (`AsyncUpbit`) clients built on `httpx` and `websockets`, includes type definitions for request params and response fields, and handles pagination. It was last pushed in September 2026. This is not a stale vendor sample.
- **Field names match the docs exactly.** `client.candles.list_minutes()`, `client.orderbooks.list()`, `client.orders.cancel_and_new()` map one-to-one onto `global-docs.upbit.com`. When you are debugging against the vendor reference, that is one less hop than a unified structure.
- **Upbit-only features are modelled first.** Travel-rule endpoints, deposit and withdrawal flows, API-key management and "pockets" are exposed with Upbit's own vocabulary. CCXT unifies what is common across venues; venue-specific product surfaces reach it through the implicit API rather than a unified wrapper.
- **A first-party ecosystem.** The same organisation ships a Go CLI, a TypeScript SDK, and agent skills. If your tooling lives in that ecosystem, staying inside it is coherent.
- **A smaller install.** One SDK covering one exchange is a smaller dependency than a library covering 104.

If Upbit is your only venue, forever, the official SDK is a genuinely good choice and you will not regret it.

## Migrating from the Upbit SDK to CCXT

| What you are doing | Upbit SDK | CCXT |
| --- | --- | --- |
| Symbols | `'KRW-BTC'` (quote first) | `'BTC/KRW'` (base first) |
| Sides | `side="bid"` / `side="ask"` | `'buy'` / `'sell'` |
| Markets | `client.orderbooks.list_instruments()` | `load_markets()` |
| Ticker | `client.tickers.list_by_trading_pairs()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `client.orderbooks.list()` | `fetch_order_book()` |
| Candles | `client.candles.list_minutes()` / `list_days()` | `fetch_ohlcv()` |
| Trades | `client.trades.list()` | `fetch_trades()` |
| New order | `client.orders.create()` | `create_order()` |
| Cancel order | `client.orders.cancel()` | `cancel_order()` |
| Open orders | `client.orders.list_open()` | `fetch_open_orders()` |
| Closed orders | `client.orders.list_closed()` | `fetch_closed_orders()` |
| Balance | `client.accounts.list()` | `fetch_balance()` |
| Streams | the SDK's WebSocket client | `watch_*` on `ccxt.pro.upbit` |
| Anything not listed | the SDK method | the same endpoint as an [implicit method](/docs/exchanges/upbit/implicit-api) |

## FAQ

**Does Upbit have an official SDK?**
Yes. The `upbit-official` GitHub organisation publishes `upbit-sdk-python` (Apache-2.0, on PyPI as `upbit-sdk`, Python 3.9+, sync and async), `upbit-sdk-typescript`, `upbit-sdk-go` and a Go CLI. They are actively maintained.

**Why does CCXT call the market `BTC/KRW` when Upbit calls it `KRW-BTC`?**
Upbit writes market ids quote-currency-first. CCXT's unified symbol format is always `BASE/QUOTE`, so it parses `KRW-BTC` into `'BTC/KRW'` at the boundary. That keeps one convention across every exchange in the library, instead of one exception you have to remember.

**How does Upbit authenticate API requests?**
With a JWT sent as an `Authorization: Bearer` header. The payload carries `access_key` and a fresh `nonce` UUID, plus `query_hash` (a SHA-512 digest of the encoded query string) and `query_hash_alg` whenever the request has parameters. CCXT builds all of it on every private call.

**Does CCXT support Upbit WebSockets?**
Yes — 9 `watch*` methods on `ccxt.pro.upbit`, including order book, trades, tickers, candles, orders, my trades and balance. They return the same structures as the matching `fetch*` methods.

**Does CCXT support an Upbit sandbox?**
No. Upbit has no `urls.test` in CCXT, so `set_sandbox_mode(True)` will not work for it.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [upbit unified API reference](/docs/exchanges/upbit)
- [upbit implicit API](/docs/exchanges/upbit/implicit-api) — all 53 raw endpoints
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
