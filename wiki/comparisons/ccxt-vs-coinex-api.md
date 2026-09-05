<!-- title: CCXT vs the CoinEx API -->
<!-- description: CoinEx ships sample code, not an installable SDK. CCXT versus the raw v2 REST and WebSocket API on signing, rate limits, streaming and portability. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: CoinEx publishes example scripts in five languages but no installable client library, so the real comparison is CCXT against the raw v2 API. CCXT covers 72 unified capabilities, 10 streaming methods and all 251 raw endpoints. -->
<!-- weight: 100 -->

# CCXT vs the CoinEx API

CoinEx documents a v2 REST and WebSocket API at [docs.coinex.com](https://docs.coinex.com/api/v2/) and publishes [`coinex_api_demo`](https://github.com/coinexcom/coinex_api_demo) — sample code in C#, Go, Node.js, Python and Rust. What it does not publish is an installable client library: the demo repository is reference code you copy, and its README points back at the documentation.

So the choice here is not "CCXT or the vendor SDK". It is **CCXT or your own HTTP client**, and the question that decides it is how much of the signing, throttling and order-book plumbing you want to own.

## TL;DR

- **Write against the raw API** if you need one or two endpoints, want zero dependencies, and are comfortable implementing HMAC-SHA256 signing and a rate limiter yourself.
- **Pick CCXT** if you want CoinEx spot, margin and futures behind one client that already handles signing, per-endpoint throttling, gzip-framed WebSocket frames and order-book resync — and that speaks the same API on 103 other venues.
- **Choosing CCXT does not hide anything.** All 251 CoinEx endpoints are generated as [implicit methods](/docs/exchanges/coinex/implicit-api), so nothing in the raw API is out of reach.

## At a glance

| | **CCXT** | **Raw CoinEx API** |
| --- | --- | --- |
| Exchanges covered | 104 (CoinEx is one of them) | CoinEx only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | any; sample code in C#, Go, Node.js, Python, Rust |
| Installable client library | yes — `ccxt` | none published; `coinex_api_demo` is copy-paste sample code |
| Unified market data + trading API | yes — 72 unified capabilities, 35 `fetch*` methods | CoinEx's own request/response shapes |
| WebSockets | yes — 10 `watch*` methods, gzip frames decoded for you | yes — `wss://socket.coinex.com/v2/spot` and `/v2/futures`, raw |
| Raw endpoint access | yes — 251 endpoints as implicit methods | it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 2.5ms) | you model 400 req/s per IP plus per-account limits |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus CoinEx `code` values |
| Testnet / sandbox | not available for CoinEx | none documented |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `coinex_api_demo` 22 stars; `coinex_exchange_api` docs repo 196 stars |
| Licence | MIT | n/a |
| Support | Discord, Telegram, GitHub issues — usually same-day | CoinEx support ticket, docs site |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the CoinEx v2 API documentation, and the repositories published by the `coinexcom` GitHub organisation.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.coinex()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw CoinEx API**

```python
import requests

r = requests.get('https://api.coinex.com/v2/spot/ticker',
                 params={'market': 'BTCUSDT'})
data = r.json()['data'][0]
print(data['last'], data['value'])
```

<!-- tabs:end -->

The raw call is short because public market data is unsigned. CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — same keys, same types, same units as on every other venue — and you did not have to know that CoinEx wraps its payload in `data` and calls quote volume `value`.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.coinex({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **Raw CoinEx API**

```python
import hashlib, hmac, json, time
import requests

ACCESS_ID, SECRET = '...', '...'
path = '/v2/spot/order'
body = json.dumps({
    'market': 'BTCUSDT', 'market_type': 'SPOT', 'side': 'buy',
    'type': 'limit', 'amount': '0.001', 'price': '60000',
})
ts = str(int(time.time() * 1000))
prepared = 'POST' + path + body + ts
sign = hmac.new(SECRET.encode(), prepared.encode(), hashlib.sha256).hexdigest().lower()

r = requests.post('https://api.coinex.com' + path, data=body, headers={
    'X-COINEX-KEY': ACCESS_ID,
    'X-COINEX-SIGN': sign,
    'X-COINEX-TIMESTAMP': ts,
    'Content-Type': 'application/json',
})
print(r.json())
```

<!-- tabs:end -->

CoinEx signs `method + request_path + body + timestamp` with HMAC-SHA256 and expects the digest as lowercase hex in `X-COINEX-SIGN`. That is not hard, but it is exactly the kind of code that breaks silently: get the body serialisation wrong by one character and every private call fails authentication. CCXT implements it once, per venue, and it is tested on every release.

Switching that same order to futures is one option change, not a new signing path:

```python
exchange = ccxt.coinex({'apiKey': '...', 'secret': '...',
                        'options': {'defaultType': 'swap'}})
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.001, 60000)
```

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.coinex()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Raw CoinEx WebSocket**

```python
import gzip, json, asyncio, websockets

async def main():
    async with websockets.connect('wss://socket.coinex.com/v2/spot') as ws:
        await ws.send(json.dumps({
            'method': 'depth.subscribe',
            'params': {'market_list': [['BTCUSDT', 10, '0', True]]},
            'id': 1,
        }))
        async for frame in ws:
            message = json.loads(gzip.decompress(frame))
            print(message)          # raw depth update, not a merged book

asyncio.run(main())
```

<!-- tabs:end -->

These two snippets are not doing the same job. CCXT returns a **live, merged order book**; the raw socket returns update messages that you must decompress, apply to a local snapshot in the right order, and re-seed after a gap or a reconnect.

| | CCXT | raw stream |
| --- | --- | --- |
| Decompress the gzip-framed messages | done for you | your code |
| Merge depth updates into a full book | done for you | your code |
| Detect gaps and re-subscribe from a fresh snapshot | done for you | your code |
| Keep the connection alive (`server.ping`) | done for you | your code |
| Reconnect and re-subscribe after a drop | done for you | your code |
| Bounded caches instead of unbounded growth | done for you | your code |

## Where the differences actually bite

### Rate limits you do not have to model

CoinEx applies a **400 requests per second limit per IP** on top of per-account short-cycle limits that differ by endpoint group — 30 r/s to place or edit spot orders, 60 r/s to cancel, 50 r/s to query orders, but only 10 r/s for spot order history, and 20 r/s to place or edit futures orders. Batch requests consume quota per sub-request, and there are additional long-cycle windows measured over 1, 4, 8 and 24 hours.

CCXT encodes per-endpoint weights in the exchange definition and ships a throttler that is on by default (`enableRateLimit = true`, `rateLimit = 2.5`ms). You call methods in a loop; the library paces them.

### One error hierarchy

CoinEx returns a numeric `code` in the response body. CCXT maps those onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError` and 35 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once, and it keeps working when you add a second exchange.

### Precision and string math

CoinEx rejects orders that violate tick size, step size or minimum notional. CCXT loads market metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities never drift through float rounding.

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

### Portability is the whole point

Adding a second venue to a hand-rolled CoinEx integration means a second signing scheme, a second symbol convention, a second error taxonomy and a second WebSocket dialect. That translation layer is what CCXT already is, across 104 venues:

```python
for exchange_id in ['coinex', 'binance', 'okx', 'bybit', 'kucoin']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT')['last'])
```

### Nothing is hidden — the implicit API

Alongside the 72 unified capabilities CCXT implements for CoinEx, **all 251 endpoints in its API block are generated as callable implicit methods**, with signing, rate-limit accounting and error mapping applied:

```python
response = exchange.v2PublicGetSpotTicker({'market': 'BTCUSDT'})
```

Browse the full list on the [CoinEx implicit API page](/docs/exchanges/coinex/implicit-api).

## What the raw CoinEx API does better

Honest advantages of going direct:

- **Zero dependencies and a smaller footprint.** A single signed `requests` call has no library between you and the venue. If your service reads one endpoint on a schedule, CCXT is more machinery than the job needs.
- **The demo repository covers five languages CoinEx tested itself.** `coinex_api_demo` has working signing examples in C#, Go, Node.js, Python and Rust — useful if you are porting the signer into a runtime CCXT does not target, or want to see CoinEx's own reference implementation of it.
- **New endpoints are usable the day they ship.** A brand-new CoinEx endpoint is callable by URL immediately; a *unified* CCXT wrapper for it may follow later. (CCXT's implicit API closes most of this gap, but only after the endpoint is added to the exchange's API block.)
- **Field-for-field fidelity with the docs.** Reading the CoinEx reference and calling the endpoint directly means what you see in the docs is what you get back. CCXT's unified names are a deliberate abstraction, which is one extra hop when debugging.

If CoinEx is your only venue, you need a couple of endpoints, and you would rather own 60 lines of signing code than add a dependency, going direct is a defensible choice.

## Migrating from the raw CoinEx API to CCXT

| What you are doing | Raw CoinEx API | CCXT |
| --- | --- | --- |
| Symbols | `'BTCUSDT'` | `'BTC/USDT'` (spot), `'BTC/USDT:USDT'` (futures) |
| Product selection | different path prefix and market type | `options.defaultType` = `spot` / `margin` / `swap` |
| Market list | `GET /v2/spot/market` | `load_markets()` |
| Ticker | `GET /v2/spot/ticker` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET /v2/spot/depth` | `fetch_order_book()` |
| Candles | `GET /v2/spot/kline` | `fetch_ohlcv()` |
| New order | `POST /v2/spot/order` | `create_order()` |
| Cancel order | `POST /v2/spot/cancel-order` | `cancel_order()` |
| Open orders | `GET /v2/spot/pending-order` | `fetch_open_orders()` |
| Balance | `GET /v2/assets/spot/balance` | `fetch_balance()` |
| Streams | `wss://socket.coinex.com/v2/spot` | `watch_*` on `ccxt.pro.coinex` |
| Anything not listed | the endpoint URL | the same endpoint as an [implicit method](/docs/exchanges/coinex/implicit-api) |

## FAQ

**Does CoinEx have an official Python SDK?**
Not an installable one. CoinEx publishes [`coinex_api_demo`](https://github.com/coinexcom/coinex_api_demo), a repository of sample scripts in C#, Go, Node.js, Python and Rust, and points developers at [docs.coinex.com](https://docs.coinex.com/api/v2/). If you want a maintained client library for CoinEx, CCXT is the practical option.

**Does CCXT support CoinEx futures and margin?**
Yes. Spot, margin and futures are all served by one `ccxt.coinex` instance, selected with `options.defaultType` and unified params. CCXT implements 72 unified capabilities for CoinEx, including positions, leverage, funding rates, leverage tiers and margin adjustment history.

**Does CCXT stream CoinEx over WebSocket?**
Yes — 10 `watch*` methods: `watchOrderBook`, `watchOrderBookForSymbols`, `watchTicker`, `watchTickers`, `watchBidsAsks`, `watchTrades`, `watchTradesForSymbols`, `watchOrders`, `watchMyTrades` and `watchBalance`. CCXT decompresses the gzip-framed messages and maintains the merged order book for you.

**Is there a CoinEx testnet I can use with `setSandboxMode`?**
No. CCXT's CoinEx class does not declare a sandbox, because CoinEx does not publish testnet base URLs. Test against small live orders or against static fixtures instead.

**Can I still call CoinEx-specific endpoints through CCXT?**
Yes — all 251 of them, as [implicit methods](/docs/exchanges/coinex/implicit-api), with signing, throttling and error mapping applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [coinex unified API reference](/docs/exchanges/coinex)
- [coinex implicit API](/docs/exchanges/coinex/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
