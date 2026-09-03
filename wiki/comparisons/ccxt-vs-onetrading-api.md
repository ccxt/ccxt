<!-- title: CCXT vs the raw One Trading API -->
<!-- description: One Trading (formerly Bitpanda Pro) publishes no maintained SDK. Compare hand-rolling its bearer-token REST and WebSocket API against CCXT's onetrading class. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: The Bitpanda Pro SDK is gone and One Trading publishes no replacement. CCXT's onetrading class covers the spot API with 30 unified capabilities and seven watch* methods — but not One Trading's newer futures endpoints. -->
<!-- weight: 100 -->

# CCXT vs the raw One Trading API

[One Trading](https://onetrading.com/) is an Austrian, EU-regulated exchange — the venue formerly known as Bitpanda Pro. Its API lives at `https://api.onetrading.com/fast` with a WebSocket feed at `wss://streams.onetrading.com/`, and it is documented at [docs.onetrading.com](https://docs.onetrading.com/).

The Bitpanda Pro era had an official Python SDK. It no longer resolves: `bitpanda-labs/bitpanda-pro-sdk-py` returns 404 on GitHub, and `bitpanda-pro-sdk` is not on PyPI. One Trading's current documentation — including its own machine-readable index at `docs.onetrading.com/llms.txt` — lists no client library in any language.

So the comparison is not CCXT against a vendor SDK. It is **CCXT against the code you would write yourself**, and the deciding question is: **is spot coverage enough, or do you need the futures endpoints CCXT does not yet model?**

## TL;DR

- **Write it yourself** if you need One Trading's futures API — positions, funding rates, portfolio summary — because CCXT's `onetrading` class is spot-only and those endpoints are not in its definition, so they are not reachable as implicit methods either.
- **Pick CCXT** if you are trading One Trading spot: 30 unified capabilities, seven `watch*` streaming methods, a rate limiter, typed errors, and the same code in TypeScript, JavaScript, Python, PHP, C#/.NET, Go or Java.
- **Authentication is the easy part on this venue.** One Trading uses a bearer API key — no secret, no HMAC, no nonce — so the value CCXT adds here is normalisation, streaming and portability rather than signing.

## At a glance

| | **CCXT** | **Raw One Trading API** |
| --- | --- | --- |
| Exchanges covered | 104 (One Trading is one of them) | One Trading only |
| Official client library | n/a | **none currently published** |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | whatever you write |
| Unified market data + trading API | yes — same method names across every exchange | no — One Trading's own request/response shapes |
| Unified capabilities implemented | 30 for `onetrading`, of which 14 are `fetch*` | n/a |
| Symbols | `'BTC/USDT'` | `instrument_code`, e.g. `BTC_USDT` |
| Products covered | **spot only** | spot **and futures** (positions, funding rates, portfolio summary) |
| Authentication | `Authorization: Bearer <apiKey>` — handled | `Authorization: Bearer <token>`, key needs the `TRADE` scope |
| WebSockets | yes — seven `watch*` methods, public and private | yes, and it also carries order entry, which CCXT does not expose |
| Raw endpoint access | yes — 20 endpoints as implicit methods | it is all raw |
| Built-in rate limiter | yes, on by default (`rateLimit` 300 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus One Trading error payloads |
| Testnet / sandbox | none — One Trading publishes no sandbox | none |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | n/a — no package to count |
| Licence | MIT | n/a |
| Support | Discord, Telegram, GitHub — usually same-day | One Trading support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}} and One Trading's published documentation at docs.onetrading.com, plus checks that `bitpanda-labs/bitpanda-pro-sdk-py` and the `bitpanda-pro-sdk` PyPI package no longer resolve.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.onetrading()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw HTTP**

```python
import requests

response = requests.get(
    'https://api.onetrading.com/fast/v1/market-ticker/BTC_USDT').json()
print(response)
```

<!-- tabs:end -->

The raw call is short — this is not an API where authentication or signing is the hard part. What CCXT adds is the [unified ticker structure](/docs/manual#ticker-structure): the same keys, the same types, the same units as Kraken or Binance, with the instrument code translated to and from `'BTC/USDT'` and precision loaded from `/instruments`.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.onetrading({'apiKey': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **Raw HTTP**

```python
import requests

response = requests.post(
    'https://api.onetrading.com/fast/v1/account/orders',
    headers={
        'Authorization': 'Bearer ' + api_key,   # key needs the TRADE scope
        'Content-Type': 'application/json',
    },
    json={
        'instrument_code': 'BTC_USDT',
        'type': 'LIMIT',
        'side': 'BUY',
        'amount': '0.001',
        'price': '60000',
        'time_in_force': 'GOOD_TILL_CANCELLED',
    }).json()
```

<!-- tabs:end -->

CCXT returns a [unified order structure](/docs/manual#order-structure) with `id`, `status`, `filled`, `remaining`, `average` and `cost` normalised, and accepts One Trading's stop orders through unified params (`create_order(..., 'limit', ..., {'triggerPrice': 58000})`) rather than a different body shape.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.onetrading()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Raw WebSocket**

```python
import asyncio, json, websockets

async def main():
    async with websockets.connect('wss://streams.onetrading.com/') as ws:
        await ws.send(json.dumps({
            'type': 'SUBSCRIBE',
            'channels': [{
                'name': 'ORDER_BOOK',
                'depth': 20,
                'instrument_codes': ['BTC_USDT'],
            }],
        }))
        async for message in ws:
            frame = json.loads(message)
            # ORDER_BOOK_SNAPSHOT once, then update frames carrying `changes` —
            # merging them, detecting gaps and re-seeding is your code
            print(frame['type'])

asyncio.run(main())
```

<!-- tabs:end -->

One Trading's documentation separates `Orderbook Snapshot` from `Orderbook Update` for exactly the reason every venue does: a live book is a snapshot plus a delta stream, and keeping the two aligned is the work. CCXT does that for you and hands back the same [order book structure](/docs/manual#order-book-structure) as `fetch_order_book`.

CCXT implements seven streaming methods for `onetrading`: `watchOrderBook`, `watchTicker`, `watchTickers`, `watchOHLCV`, `watchBalance`, `watchOrders` and `watchMyTrades` — public and private, over the same authenticated connection.

## Where the differences actually bite

### Rate limits you do not have to model

CCXT ships a token-bucket throttler that is on by default (`enableRateLimit = true`, `rateLimit = 300` ms for `onetrading`). You call methods in a loop and the library paces them. On the raw path, pacing and back-off on a 429 are code you write and maintain.

### One error hierarchy

CCXT maps One Trading's error responses onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once and it still works on the next exchange.

### Precision, rounding and string math

One Trading's `/instruments` endpoint publishes per-instrument precision and minimum and maximum trading limits. CCXT loads them in `load_markets()` and exposes them through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities never drift through float rounding into a rejected order:

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures in every one. On the raw path, each language is a fresh implementation.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.onetrading()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.onetrading ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **C#**

```csharp
var exchange = new ccxt.onetrading();
var ticker = await exchange.FetchTicker("BTC/USDT");
```

#### **Go**

```go
exchange := ccxt.NewOnetrading(nil)
ticker, err := exchange.FetchTicker("BTC/USDT")
```

<!-- tabs:end -->

### Nothing is hidden — but the definition is spot-shaped

Alongside the 30 unified capabilities, **all 20 endpoints in CCXT's One Trading definition are generated as callable implicit methods**, with authentication, rate-limit accounting and error mapping applied:

```python
# any endpoint in the definition, camelCased from its path
response = exchange.private_get_account_fees()
```

Those 20 are the spot market-data and trading endpoints. One Trading's documentation also publishes futures endpoints — funding payments, futures positions, funding-rate settings, current funding rate, funding-rate history and a futures portfolio summary — and those are **not** in CCXT's definition, so they are not available as implicit methods either. If your integration needs them, you call them with an ordinary HTTP client alongside CCXT, or you write the whole client. Browse what is covered on the [onetrading implicit API page](/docs/exchanges/onetrading/implicit-api).

### Portability

CCXT's `onetrading` is the same object shape as its `kraken`, `bitvavo` and `binance` objects, so adding a second EU venue is a variable, not a second integration:

```python
for exchange_id in ['onetrading', 'bitvavo', 'kraken']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/EUR')['last'])
```

## What writing it yourself does better

An honest list, and the first item is decisive for some readers:

- **Futures.** One Trading documents a futures product — open positions, funding payments, funding-rate history and methodology, portfolio summary — and CCXT's `onetrading` class declares `swap: false` and models none of it. A hand-rolled client is the only way to reach those endpoints today.
- **WebSocket order entry.** One Trading's stream documentation includes trading channels: create order, cancel order, cancel all, move order, plus order-booked, order-rejected, order-closed and trade-executed events. CCXT uses the socket for market data and private state, but does not expose `createOrderWs` / `cancelOrderWs` for this venue. Latency-sensitive order entry over the socket means your own client.
- **Field names match the docs exactly.** `instrument_code`, `time_in_force`, `GOOD_TILL_CANCELLED` — reading docs.onetrading.com while debugging your own client is a direct correspondence. CCXT's unified names are a deliberate abstraction.
- **A far smaller dependency.** Bearer-token auth with no signing means a useful One Trading client is genuinely small. If you need four endpoints, that is less code and less surface than a library covering 104 exchanges.
- **Any language you like.** CCXT ships seven. There is nothing about this API that makes a Rust or Elixir client hard.

If you trade One Trading futures, or you want order entry over the socket, writing your own client is the right answer today.

## Migrating from a hand-rolled One Trading client to CCXT

| What you are doing | Raw One Trading API | CCXT |
| --- | --- | --- |
| Symbols | `instrument_code`, e.g. `BTC_USDT` | `'BTC/USDT'` |
| Client | your `requests` session with a bearer header | `ccxt.onetrading({'apiKey': '...'})` |
| Instruments | `GET /v1/instruments` | `load_markets()` |
| Currencies | `GET /v1/currencies` | `fetch_currencies()` |
| Ticker | `GET /v1/market-ticker/{instrument_code}` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET /v1/order-book/{instrument_code}` | `fetch_order_book()` |
| Candles | `GET /v1/candlesticks/{instrument_code}` | `fetch_ohlcv()` |
| Server time | `GET /v1/time` | `fetch_time()` |
| Balance | `GET /v1/account/balances` | `fetch_balance()` |
| Fees | `GET /v1/account/fees` | `fetch_trading_fees()` |
| New order | `POST /v1/account/orders` | `create_order()` |
| Cancel order | `DELETE /v1/account/orders/{order_id}` | `cancel_order()` |
| Cancel all | `DELETE /v1/account/orders` | `cancel_all_orders()` |
| Open orders | `GET /v1/account/orders` | `fetch_open_orders()` |
| Own trades | `GET /v1/account/trades` | `fetch_my_trades()` |
| Trades for an order | `GET /v1/account/orders/{order_id}/trades` | `fetch_order_trades()` |
| Streams | `SUBSCRIBE` frames per channel | `watch_*` on `ccxt.pro.onetrading` |
| Futures endpoints | raw call | **not modelled in CCXT** |
| Anything else listed | raw call | the same endpoint as an [implicit method](/docs/exchanges/onetrading/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [onetrading unified API reference](/docs/exchanges/onetrading).

## FAQ

**Is there an official One Trading or Bitpanda Pro SDK?**
Not one that currently resolves. The Bitpanda Pro Python SDK repository returns 404 and the `bitpanda-pro-sdk` package is not on PyPI. One Trading's own documentation index lists no client library in any language, so CCXT is the maintained normalised implementation for this venue.

**Does CCXT support One Trading futures?**
No. CCXT's `onetrading` class declares `spot: true` and `swap: false`, and its 20-endpoint definition contains only the spot market-data and trading endpoints. One Trading's futures endpoints are documented on their side but are not reachable through CCXT, including via the implicit API.

**Does CCXT support One Trading WebSockets?**
Yes — seven methods: `watchOrderBook`, `watchTicker`, `watchTickers`, `watchOHLCV`, `watchBalance`, `watchOrders` and `watchMyTrades`. Order entry over the socket, which One Trading's docs also describe, is not exposed by CCXT for this venue.

**What credentials does CCXT need for One Trading?**
Just an API key: `ccxt.onetrading({'apiKey': '...'})`. One Trading authenticates with a bearer token — there is no secret and no request signing — and the key needs the `TRADE` scope to place orders.

**Does One Trading have a sandbox I can use with CCXT?**
No. One Trading publishes no sandbox environment, so `set_sandbox_mode(True)` has nothing to point at for this exchange. Test against CCXT's offline static fixtures and small live orders.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [onetrading unified API reference](/docs/exchanges/onetrading)
- [onetrading implicit API](/docs/exchanges/onetrading/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
