<!-- title: CCXT vs the Crypto.com Exchange API -->
<!-- description: Crypto.com Exchange ships a Rust CLI, not a client library. CCXT versus the raw v1 REST and WebSocket API on signing, rate limits, streaming and sandbox. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Crypto.com publishes documentation and a Rust CLI but no official client library, so integrations are hand-rolled against the v1 API. CCXT covers 58 unified capabilities, 12 streaming methods, order entry over WebSocket and all 129 raw endpoints. -->
<!-- weight: 100 -->

# CCXT vs the Crypto.com Exchange API

The [Crypto.com Exchange](https://crypto.com/exchange) v1 API covers spot, margin, perpetual swaps, futures and options over REST and WebSocket. What it does not come with is a client library: the [`crypto-com/crypto-exchange`](https://github.com/crypto-com/crypto-exchange) repository was archived in November 2021 and now contains only a pointer to the documentation, and the API reference itself lists no official SDK — it provides reference code samples in JavaScript, Python, C# and Java for you to adapt.

Crypto.com does publish [`cdcx-cli`](https://github.com/crypto-com/cdcx-cli): a Rust CLI, MCP server and terminal dashboard, dual-licensed MIT/Apache-2.0, covering 95 REST endpoints generated from the exchange's OpenAPI specification plus WebSocket streaming. It is a genuinely useful tool — but it is a binary you run, not a library you import.

So the real comparison is **CCXT against your own client**, and the question is how much of the signing, throttling and stream plumbing you want to own.

## TL;DR

- **Write against the raw API** if you want field-for-field fidelity with Crypto.com's documentation, or if `cdcx-cli` already does what you need from a terminal or an AI agent.
- **Pick CCXT** if you want spot, margin, swaps, futures and options behind one client that handles the signature scheme, per-endpoint rate limits, order-book maintenance and the UAT sandbox — in seven languages, with the same API on 103 other venues.
- **Choosing CCXT does not hide anything.** All 129 Crypto.com endpoints are generated as [implicit methods](/docs/exchanges/cryptocom/implicit-api).

## At a glance

| | **CCXT** | **Raw Crypto.com Exchange API** |
| --- | --- | --- |
| Exchanges covered | 104 (Crypto.com is one of them) | Crypto.com only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | any; docs give reference samples in JavaScript, Python, C#, Java |
| Official client library | `ccxt` — installable from every major package registry | none; `cdcx-cli` is a Rust CLI/MCP server/TUI, not a library |
| Products in one client | spot, margin, swap, future, option | one API, but you model each product yourself |
| Unified market data + trading API | yes — 58 unified capabilities, 26 `fetch*` methods | Crypto.com's own request/response shapes |
| WebSockets | yes — 12 `watch*` methods plus `unWatch*`, and order entry over the socket | yes — `wss://stream.crypto.com/exchange/v1/user` and `/market`, raw |
| Raw endpoint access | yes — 129 endpoints as implicit methods | it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 10ms) | you model 15 req/100ms on order entry, 1 req/s on history, and more |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus Crypto.com `code` values |
| Testnet / sandbox | `exchange.set_sandbox_mode(True)` swaps in the UAT hosts | swap `uat-api.3ona.co` and `uat-stream.3ona.co` in by hand |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `cdcx-cli` 25 stars; community `cryptocom-exchange` Python library 71 stars |
| Licence | MIT | `cdcx-cli` is MIT/Apache-2.0 |
| Support | Discord, Telegram, GitHub issues — usually same-day | Crypto.com developer documentation and support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the Crypto.com Exchange v1 API reference, and the `crypto-com` GitHub organisation's published repositories.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.cryptocom()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['bid'], ticker['ask'], ticker['baseVolume'])
```

#### **Raw Crypto.com API**

```python
import requests

r = requests.get('https://api.crypto.com/exchange/v1/public/get-tickers',
                 params={'instrument_name': 'BTC_USDT'})
data = r.json()['result']['data'][0]
print(data['a'], data['b'], data['k'], data['v'])
```

<!-- tabs:end -->

Crypto.com's ticker payload uses single-letter keys: `i` instrument, `a` last, `b` bid, `k` ask, `h` high, `l` low, `v` base volume, `vv` quote volume, `c` change, `oi` open interest, `t` timestamp. CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) with the same names and units you get everywhere else, so nothing downstream needs a Crypto.com-specific decoder ring.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.cryptocom({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **Raw Crypto.com API**

```python
import hashlib, hmac, json, time
import requests

API_KEY, SECRET = '...', '...'

def params_to_str(obj):
    out = ''
    for key in sorted(obj):
        value = obj[key]
        if isinstance(value, dict):
            out += key + params_to_str(value)
        elif isinstance(value, list):
            out += key + ''.join(
                params_to_str(v) if isinstance(v, dict) else str(v) for v in value)
        else:
            out += key + ('' if value is None else str(value))
    return out

request = {
    'id': 1,
    'method': 'private/create-order',
    'api_key': API_KEY,
    'params': {
        'instrument_name': 'BTC_USDT', 'side': 'BUY', 'type': 'LIMIT',
        'price': '60000', 'quantity': '0.001',      # numbers must be strings
    },
    'nonce': int(time.time() * 1000),
}
payload = (request['method'] + str(request['id']) + request['api_key']
           + params_to_str(request['params']) + str(request['nonce']))
request['sig'] = hmac.new(SECRET.encode(), payload.encode(),
                          hashlib.sha256).hexdigest()

r = requests.post('https://api.crypto.com/exchange/v1/private/create-order',
                  json=request)
print(r.json())
```

<!-- tabs:end -->

Crypto.com's signature is the most intricate in this batch. You sort the parameter keys in ascending order, concatenate them as `key` + `value` with no delimiter, then hash `method` + `id` + `api_key` + that parameter string + `nonce` with HMAC-SHA256 and hex-encode the result. Nested objects and arrays have to be flattened recursively by the same rule — Crypto.com's own reference sample uses recursive helpers for exactly this — and every number in the request must be sent as a quoted string, or the digest the server computes will not match yours.

CCXT implements that once, and switching the same order to a perpetual is a symbol change:

```python
order = exchange.create_order('BTC/USD:USD', 'limit', 'buy', 0.001, 60000)
```

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.cryptocom()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Raw Crypto.com WebSocket**

```python
import json, asyncio, websockets

async def main():
    url = 'wss://stream.crypto.com/exchange/v1/market'
    async with websockets.connect(url) as ws:
        await ws.send(json.dumps({
            'method': 'subscribe',
            'params': {'channels': ['book.BTC_USDT.50']},
            'nonce': 1,
        }))
        async for frame in ws:
            message = json.loads(frame)
            if message.get('method') == 'public/heartbeat':
                await ws.send(json.dumps({
                    'id': message['id'], 'method': 'public/respond-heartbeat',
                }))
                continue
            print(message)      # raw book update, not a merged book

asyncio.run(main())
```

<!-- tabs:end -->

The raw socket sends a `public/heartbeat` message that you must answer with `public/respond-heartbeat` or the connection is dropped — that is the `if` in the middle of the loop, and forgetting it is the classic first bug. Past that, the messages are book updates, not a book.

| | CCXT | raw stream |
| --- | --- | --- |
| Answer `public/heartbeat` on time | done for you | your code |
| Merge updates into a full order book | done for you | your code |
| Detect gaps and re-seed from a fresh snapshot | done for you | your code |
| Reconnect, re-subscribe and keep bounded caches | done for you | your code |
| Authenticate the user stream and route private messages | done for you | your code |

## Where the differences actually bite

### Rate limits you do not have to model

Crypto.com's limits are per endpoint and not uniform: `private/create-order`, `private/cancel-order` and `private/cancel-all-orders` allow 15 requests per 100ms each, `private/get-order-detail` allows 30 per 100ms, everything else allows 3 per 100ms — but `private/get-trades` and `private/get-order-history` allow **1 request per second**. On the socket, the User API accepts 150 requests per second and Market Data 100.

That last one is the trap: a backfill loop written against the general limit will be rejected on history endpoints. CCXT encodes per-endpoint weights in the exchange definition and ships a throttler that is on by default (`enableRateLimit = true`, `rateLimit = 10`ms). You call methods in a loop; the library paces them.

### Five product lines, one client

Spot, margin, perpetual swaps, futures and options are all served by one `ccxt.cryptocom` instance. Unified symbols carry the distinction — `'BTC/USDT'` for spot, `'BTC/USD:USD'` for the USD-settled perpetual — and the method names do not change. Positions, funding rates, funding-rate history, settlement history, leverage and `closePosition` are unified methods, not per-product code paths.

### Order entry over the socket

CCXT Pro implements 12 `watch*` methods for Crypto.com — `watchOrderBook`, `watchOrderBookForSymbols`, `watchTicker`, `watchTickers`, `watchBidsAsks`, `watchTrades`, `watchTradesForSymbols`, `watchOHLCV`, `watchOrders`, `watchMyTrades`, `watchBalance` and `watchPositions` — plus their `unWatch*` counterparts for tearing a subscription down without dropping the connection.

It also implements **order entry over the same socket**: `create_order_ws`, `edit_order_ws`, `cancel_order_ws` and `cancel_all_orders_ws`. Sending an order on the connection you are already streaming on avoids a second TCP and TLS handshake per request.

```python
exchange = ccxt.pro.cryptocom({'apiKey': '...', 'secret': '...'})
order = await exchange.create_order_ws('BTC/USDT', 'limit', 'buy', 0.001, 60000)
```

### Testnet without a second code path

Crypto.com runs a UAT environment on different hosts — `uat-api.3ona.co` for REST and `uat-stream.3ona.co` for both WebSocket endpoints. Written directly, that is a base-URL constant threaded through every module, plus a matching swap for the socket URLs.

```python
exchange = ccxt.cryptocom({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)   # swaps in the UAT REST and WebSocket hosts
```

One flag, every URL.

### One error hierarchy

CCXT maps Crypto.com's numeric `code` values onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`.

### Precision and string math

CCXT loads Crypto.com's market metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class. That matters more here than usual: the API requires numeric fields to be sent as strings, so float formatting is not cosmetic — the same value also feeds the signature.

### Nothing is hidden — the implicit API

Alongside the 58 unified capabilities, **all 129 endpoints in CCXT's Crypto.com API block are generated as callable implicit methods**, with the full signature scheme, nonce handling, throttling and error mapping applied:

```python
response = exchange.v1PublicGetPublicGetTickers({'instrument_name': 'BTC_USDT'})
```

Browse them on the [Crypto.com implicit API page](/docs/exchanges/cryptocom/implicit-api).

## What the raw API and `cdcx-cli` do better

Honest advantages:

- **`cdcx-cli` is a different kind of tool, and a good one.** A single ~11MB Rust binary with no runtime dependencies, a full-screen TUI dashboard, a paper-trading engine that needs no credentials, and an MCP server so an AI agent can drive the exchange with safety tiers. CCXT is a library; none of that is in scope for it.
- **It is generated from the OpenAPI specification.** `cdcx-cli` exposes 95 REST endpoints derived directly from Crypto.com's spec, so its surface tracks the published contract mechanically rather than through hand-written wrappers.
- **Field-for-field fidelity with the docs, and new endpoints on day one.** Calling `public/get-tickers` directly means what the reference says is what you get, and a newly shipped endpoint is callable by URL immediately — a *unified* CCXT method for it may follow later. CCXT's unified names are a deliberate abstraction, which is one extra hop when debugging against vendor documentation.
- **A focused community Python library exists.** [`cryptocom-exchange`](https://github.com/goincrypto/cryptocom-exchange) is an MIT, async-native Python client for the v1 API built on httpx and websockets. If you want one venue, in Python, with a small dependency, it is a real option.

If Crypto.com is your only venue, or you want a terminal dashboard and an MCP endpoint rather than a library, the raw API and `cdcx-cli` are the better fit.

## Migrating from the raw Crypto.com API to CCXT

| What you are doing | Raw Crypto.com API | CCXT |
| --- | --- | --- |
| Symbols | `'BTC_USDT'`, `'BTCUSD-PERP'` | `'BTC/USDT'`, `'BTC/USD:USD'` |
| Instruments | `public/get-instruments` | `load_markets()` |
| Ticker / book / candles | `public/get-tickers`, `public/get-book`, `public/get-candlestick` | `fetch_ticker()`, `fetch_order_book()`, `fetch_ohlcv()` |
| New order | `private/create-order` | `create_order()` |
| Cancel / amend order | `private/cancel-order`, `private/amend-order` | `cancel_order()`, `edit_order()` |
| Open orders | `private/get-open-orders` | `fetch_open_orders()` |
| Balance / positions | `private/user-balance`, `private/get-positions` | `fetch_balance()`, `fetch_positions()` |
| Streams | `wss://stream.crypto.com/exchange/v1/market` and `/user` | `watch_*` on `ccxt.pro.cryptocom` |
| Sandbox | `uat-api.3ona.co` + `uat-stream.3ona.co` | `set_sandbox_mode(True)` |
| Anything not listed | the endpoint URL | the same endpoint as an [implicit method](/docs/exchanges/cryptocom/implicit-api) |

## FAQ

**Does Crypto.com Exchange have an official Python SDK?**
No. The `crypto-com/crypto-exchange` repository was archived in 2021 and now only links to the documentation, and the API reference lists no client library — it gives reference code samples in JavaScript, Python, C# and Java. Crypto.com's own current tool is `cdcx-cli`, a Rust CLI, MCP server and TUI. For a Python, PHP, Go, C# or Java *library*, CCXT is the maintained option, alongside the community `cryptocom-exchange` package.

**Does CCXT support Crypto.com derivatives?**
Yes. Spot, margin, perpetual swaps, futures and options are served by one `ccxt.cryptocom` instance, across 58 unified capabilities including positions, funding rates, settlement history and `closePosition`.

**Can I use the Crypto.com sandbox through CCXT?**
Yes. `exchange.set_sandbox_mode(True)` swaps in the UAT hosts — `uat-api.3ona.co` for REST and `uat-stream.3ona.co` for the market and user WebSocket endpoints — with no other change to your code.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.cryptocom` and call `watch*` methods — 12 of them here — plus `create_order_ws`, `edit_order_ws`, `cancel_order_ws` and `cancel_all_orders_ws` for order entry over the same socket.

**Why do my hand-signed Crypto.com requests fail authentication?**
Usually one of three rules: parameter keys must be sorted ascending and concatenated as `key` + `value` with no separator, nested objects and arrays must be flattened by the same rule recursively, and every numeric field must be sent as a quoted string. The signed payload is `method` + `id` + `api_key` + parameter string + `nonce`, hashed with HMAC-SHA256 and hex-encoded. CCXT implements all of it — and applies it to all 129 endpoints exposed as [implicit methods](/docs/exchanges/cryptocom/implicit-api).

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [cryptocom unified API reference](/docs/exchanges/cryptocom)
- [cryptocom implicit API](/docs/exchanges/cryptocom/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
