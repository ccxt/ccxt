<!-- title: CCXT vs the raw Toobit API -->
<!-- description: Toobit publishes signing examples, not an SDK. CCXT compared on signing, weight-based rate limits, spot and swap coverage and streaming. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Toobit ships code examples, not a maintained SDK. CCXT gives it 44 unified capabilities, 11 watch* streaming methods and all 59 raw endpoints behind one client. -->
<!-- weight: 100 -->

# CCXT vs the raw Toobit API

Toobit documents its API at [api-docs.toobit.com](https://api-docs.toobit.com/) and provides signing examples in Python, Java, Node.js, Go and cURL. What it does not publish is a maintained client library — the repositories under its `toobit-docs` organisation are documentation, a Python API demo and an agent kit, not an SDK. The one full-featured third-party library, [`JKorf/Toobit.Net`](https://github.com/JKorf/Toobit.Net), is a C#/.NET wrapper maintained outside the exchange.

So the comparison is between [CCXT](/docs/manual) and your own HTTP and WebSocket client. The question that decides it: **how much of the plumbing do you want to own?**

## TL;DR

- **Go direct** if you call two or three endpoints, want request fields named exactly as the docs name them, or are on .NET and would rather use a Toobit-shaped typed wrapper.
- **Pick CCXT** if you want spot and perpetual swap from one client, signing and weight accounting handled, 11 streaming methods that return the same structures as the REST calls, and 41 typed errors instead of numeric codes.
- **CCXT is not a subset.** All 59 Toobit endpoints are generated as [implicit methods](/docs/exchanges/toobit/implicit-api), signed and throttled like the unified ones.

## At a glance

| | **CCXT** | **Raw Toobit API** |
| --- | --- | --- |
| Exchanges covered | 104 (Toobit is one of them) | Toobit only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | whatever you write it in |
| Official client library | — | none; docs ship signing examples in Python, Java, Node.js, Go, cURL |
| Install | `pip install ccxt` / `npm i ccxt` | your own HTTP and WebSocket client |
| Products in one client | spot and perpetual swap | one code path per product family |
| Unified market data + trading API | yes — same method names on every exchange | no — Toobit's own request and response shapes |
| WebSockets | yes — 11 `watch*` methods, including `watchOrderBookForSymbols` and `watchTradesForSymbols` | your own socket client |
| Raw endpoint access | yes — 59 Toobit endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 20 ms) | your code, against `REQUEST_WEIGHT` and `ORDERS` budgets |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP 429 plus numeric codes such as `-1003`, `-1015` |
| Testnet / sandbox | no — Toobit has no sandbox wired up in CCXT | no |
| Licence | MIT | — |
| Support | Discord, Telegram, GitHub issues — usually same-day | exchange support channels |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}} and the published Toobit API documentation.</sub>

CCXT implements **44 unified capabilities** for Toobit, **23** of them `fetch*` methods.

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.toobit()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **raw HTTP**

```python
import requests

r = requests.get('https://api.toobit.com/quote/v1/ticker/24hr',
                 params={'symbol': 'BTCUSDT'})
print(r.json())
```

<!-- tabs:end -->

Public reads are the easy half. CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) whose keys, types and units are the same on Toobit as on Binance or Kraken; the raw call returns Toobit's payload for you to parse.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.toobit({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **raw HTTP**

```python
import hashlib
import hmac
import time
import urllib.parse
import requests

api_key, secret = '...', '...'
params = {
    'symbol': 'BTCUSDT',
    'side': 'BUY',
    'type': 'LIMIT',
    'timeInForce': 'GTC',
    'quantity': '0.001',
    'price': '60000',
    'recvWindow': 5000,
    'timestamp': int(time.time() * 1000),
}
body = urllib.parse.urlencode(params)
signature = hmac.new(secret.encode(), body.encode(), hashlib.sha256).hexdigest()

r = requests.post('https://api.toobit.com/api/v1/spot/order',
                  data=body + '&signature=' + signature,
                  headers={'X-BB-APIKEY': api_key,
                           'Content-Type': 'application/x-www-form-urlencoded'})
print(r.json())
```

<!-- tabs:end -->

Toobit signs a lowercase hex HMAC-SHA256 over the concatenated query string and body, and **the parameter order in the request must match the order used for the signature** — reorder a dict and the request fails authentication for a reason that is not obvious from the error. The timestamp must be within one second of server time and inside `recvWindow` (default 5000 ms). CCXT builds all of it, and keeps the ordering stable.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.toobit()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **raw WebSocket**

```python
import json
import websockets

async def main():
    async with websockets.connect('wss://stream.toobit.com/quote/ws/v1') as ws:
        await ws.send(json.dumps({
            'symbol': 'BTCUSDT',
            'topic': 'depth',
            'event': 'sub',
        }))
        while True:
            print(json.loads(await ws.recv()))
            # snapshot vs delta, sequence gaps, ping/pong, reconnect: yours
```

<!-- tabs:end -->

CCXT hands you a merged, depth-limited [order book structure](/docs/manual#order-book-structure) on every update. The raw feed hands you snapshots and deltas and leaves the merge, the gap detection, the re-seed after a drop, the keep-alive and the resubscribe to you. `watch_order_book_for_symbols` does the same across a basket of symbols on one connection.

## Where the differences actually bite

### Spot and swap in one client

`ccxt.toobit` covers Toobit spot and perpetual swap markets in one instance. Unified symbols keep them apart — `'BTC/USDT'` for spot, `'BTC/USDT:USDT'` for the linear perpetual — and the method names do not change between them. Going direct means two sets of endpoint paths, two symbol conventions and two response shapes.

### Rate limits you do not have to model

Toobit publishes two budgets: `REQUEST_WEIGHT` at 3,000 units per minute and `ORDERS` at 60 requests per 2 seconds, with HTTP 429 and error codes `-1003` and `-1015` when you exceed them, plus an `X-Api-Limit-Reset-Timestamp` header telling you when to retry. CCXT encodes per-endpoint costs in the exchange definition and ships a token-bucket throttler that is on by default (`enableRateLimit = True`, `rateLimit = 20` ms). You call methods in a loop and the library paces them.

### WebSockets that look like REST

`watch_order_book` returns the same structure as `fetch_order_book`; `watch_orders` the same as `fetch_orders`. Swapping a polling loop for a stream is a one-word change, and the code downstream is untouched. Underneath, CCXT handles connection pooling per URL, ping/pong keep-alive with miss detection, automatic reconnect and resubscribe, and bounded caches for trades and candles.

CCXT gives Toobit 11 streaming methods: `watchTicker`, `watchTickers`, `watchTrades`, `watchTradesForSymbols`, `watchOHLCV`, `watchOHLCVForSymbols`, `watchOrderBook`, `watchOrderBookForSymbols`, `watchOrders`, `watchMyTrades` and `watchBalance`. The private ones also need a `listenKey`, obtained from `POST api/v1/listenKey` and kept alive on a timer — CCXT manages that lifecycle so your user-data stream does not quietly stop delivering.

### Precision, rounding and string math

Toobit rejects orders that violate a symbol's tick size, step size or minimum notional. CCXT loads that metadata with the markets and gives you helpers backed by the `Precise` string-arithmetic class, so quantities do not drift through float rounding:

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

### One error hierarchy

CCXT maps Toobit's numeric codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError` and 35 more, all descending from `BaseError`. You write `except ccxt.RateLimitExceeded` once instead of matching on `-1003` and `-1015` separately and re-doing it on the next venue.

### Nothing is hidden — the implicit API

Alongside the 44 unified capabilities, **all 59 Toobit endpoints are generated as callable implicit methods**, with signing, rate-limit accounting and error mapping applied. Browse them on the [Toobit implicit API page](/docs/exchanges/toobit/implicit-api).

## What going direct does better

An honest list:

- **Field names match the docs exactly.** When you are reading `api-docs.toobit.com` while debugging, a payload whose keys are `origQty`, `executedQty` and `timeInForce` lines up with the reference one field at a time. CCXT's unified names are a deliberate abstraction and one hop away from it.
- **The API is Binance-shaped, so existing tooling transfers.** `X-BB-APIKEY`, HMAC-SHA256 over the query string, `recvWindow`, `-1003`/`-1015` error codes and `REQUEST_WEIGHT`/`ORDERS` budgets will look familiar if you have written a Binance client. Pointing that client at Toobit is a smaller job than it looks.
- **`Toobit.Net` gives strongly typed .NET models.** [`JKorf/Toobit.Net`](https://github.com/JKorf/Toobit.Net) covers spot and futures REST and WebSocket with Toobit-shaped types. It is third-party rather than official, but if you are on .NET and want the exchange's own vocabulary, it exists.
- **New endpoints are available the moment they ship.** Anything Toobit adds is callable over HTTP immediately. CCXT's implicit API picks it up on the next release; a *unified* wrapper may lag longer.
- **A smaller dependency.** Three endpoints and thirty lines of signing code is less than all of CCXT.

If Toobit is your only venue and you only read public market data, going direct is perfectly reasonable.

## Migrating from the raw Toobit API to CCXT

| What you are doing | Raw Toobit API | CCXT |
| --- | --- | --- |
| Base URL | `https://api.toobit.com` | handled by the exchange definition |
| Symbols | `BTCUSDT` | `'BTC/USDT'` (spot), `'BTC/USDT:USDT'` (linear swap) |
| Auth | `X-BB-APIKEY` + hex HMAC-SHA256 + `timestamp` + `recvWindow` | credentials on the constructor |
| Exchange info | `GET api/v1/exchangeInfo` | `load_markets()` |
| 24h ticker | `GET quote/v1/ticker/24hr` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET quote/v1/depth` | `fetch_order_book()` |
| Candles | `GET quote/v1/klines` | `fetch_ohlcv()` |
| New order | `POST api/v1/spot/order` | `create_order()` |
| Cancel order | `DELETE api/v1/spot/order` | `cancel_order()` |
| Open orders | `GET api/v1/spot/openOrders` | `fetch_open_orders()` |
| Balance | `GET api/v1/account` | `fetch_balance()` |
| Streams | your own socket client | `watch_*` on `ccxt.pro.toobit` |
| Anything not listed | the endpoint | the same endpoint as an [implicit method](/docs/exchanges/toobit/implicit-api) |

## FAQ

**Does Toobit have an official SDK?**
No maintained client library. The documentation at `api-docs.toobit.com` provides signing and request examples in Python, Java, Node.js, Go and cURL, and the `toobit-docs` GitHub organisation hosts documentation, an API demo and an agent kit rather than an SDK. The most complete third-party library is `JKorf/Toobit.Net` for .NET.

**How does Toobit authenticate API requests?**
API keys go in the `X-BB-APIKEY` header. Signed endpoints take a lowercase hex HMAC-SHA256 of the concatenated query string and request body, using the secret as the key, with a millisecond `timestamp` and an optional `recvWindow` (default 5000 ms). Parameter order in the request must match the order used to compute the signature. CCXT builds all of this for you.

**Does CCXT support Toobit perpetual swaps as well as spot?**
Yes. One `ccxt.toobit` instance covers both. Use `'BTC/USDT'` for spot and `'BTC/USDT:USDT'` for the linear perpetual.

**Does CCXT support a Toobit testnet?**
No. Toobit has no `urls.test` in CCXT, so `set_sandbox_mode(True)` will not work for it.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.toobit` and call `watch*` methods — Toobit has 11 of them.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [toobit unified API reference](/docs/exchanges/toobit)
- [toobit implicit API](/docs/exchanges/toobit/implicit-api) — all 59 raw endpoints
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
