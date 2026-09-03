<!-- title: CCXT vs the raw Bitstamp API -->
<!-- description: Bitstamp publishes no official client library. Compare hand-rolling its signed v2 REST and WebSocket API against CCXT on signing, rate limits and errors. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Bitstamp ships documentation, not an SDK — the most-used Python client is a community project whose last commit was in 2022. CCXT covers 263 Bitstamp endpoints plus three WebSocket streams in eight languages. -->
<!-- weight: 100 -->

# CCXT vs the raw Bitstamp API

[Bitstamp](https://www.bitstamp.net) has been running since 2011 and its [API documentation](https://www.bitstamp.net/api/) is unusually complete — signing examples in Python, Java and C++, a documented rate-limit policy, a v2 WebSocket feed. What it does not include is a client library. Bitstamp's GitHub organisation publishes no public repositories, and the docs link no first-party SDK in any language.

So this is not CCXT versus a vendor SDK. It is **CCXT versus code you write yourself** — or versus a community wrapper, of which the most-installed is [kmadac/bitstamp-python-client](https://github.com/kmadac/bitstamp-python-client), MIT-licensed, whose most recent commit is from October 2022.

## TL;DR

- **Write it yourself** if you need one or two Bitstamp endpoints, are comfortable with the `X-Auth-Signature` scheme, and would rather not add a dependency for a handful of HTTP calls.
- **Pick CCXT** if you need more than that: 34 unified capabilities, all 263 Bitstamp endpoints as implicit methods, a rate limiter that is on by default, and a maintained order-book stream — in TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java and Rust.
- **The community client is not a third option for most people.** It is MIT and works, but it has not had a commit since 2022 and has no WebSocket support.

## At a glance

| | **CCXT** | **Raw Bitstamp API / community client** |
| --- | --- | --- |
| Exchanges covered | 104 (Bitstamp is one of them) | Bitstamp only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | whatever you write; community wrapper is Python |
| Official vendor SDK | not applicable | none published |
| Unified market data + trading API | yes — same method names across every exchange | no — Bitstamp's own payloads |
| Bitstamp capabilities implemented | 34 unified methods, 21 of them `fetch*` | you implement what you need |
| Raw endpoint access | yes — 263 Bitstamp endpoints as implicit methods | yes, it is all you have |
| WebSockets | yes — `watchOrderBook`, `watchTrades`, `watchOrders` | raw `wss://ws.bitstamp.net`; the community Python client has none |
| Built-in rate limiter | yes, on by default (`rateLimit` 75 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus Bitstamp's `reason` payload |
| Signing | handled in `sign()` | 11-part string you concatenate and HMAC yourself |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `BitstampClient` — 142 GitHub stars · 1.6k PyPI installs/month |
| Licence | MIT | MIT (community client) |
| Support | Discord, Telegram, GitHub issues — usually same-day | Bitstamp support; GitHub issues on the community repo |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, Bitstamp's published API documentation, the kmadac/bitstamp-python-client repository and its commit history, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitstamp()
ticker = exchange.fetch_ticker('BTC/USD')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw HTTP**

```python
import requests

r = requests.get('https://www.bitstamp.net/api/v2/ticker/btcusd/')
data = r.json()
print(data['last'], data['volume'])   # strings, Bitstamp's own key names
```

<!-- tabs:end -->

Public endpoints are easy on both sides; this one is nearly a tie. The gap opens the moment you need authentication.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitstamp({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USD', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **Raw HTTP**

```python
import hashlib, hmac, time, uuid, requests
from urllib.parse import urlencode

key, secret = '...', '...'
nonce = str(uuid.uuid4())
timestamp = str(int(round(time.time() * 1000)))
payload = {'amount': '0.001', 'price': '60000'}
body = urlencode(payload)
content_type = 'application/x-www-form-urlencoded'

message = ('BITSTAMP ' + key + 'POST' + 'www.bitstamp.net'
           + '/api/v2/buy/btcusd/' + '' + content_type
           + nonce + timestamp + 'v2' + body)
signature = hmac.new(secret.encode(), message.encode(), hashlib.sha256).hexdigest()

r = requests.post('https://www.bitstamp.net/api/v2/buy/btcusd/',
                  headers={'X-Auth': 'BITSTAMP ' + key,
                           'X-Auth-Signature': signature,
                           'X-Auth-Nonce': nonce,
                           'X-Auth-Timestamp': timestamp,
                           'X-Auth-Version': 'v2',
                           'Content-Type': content_type},
                  data=body)
```

<!-- tabs:end -->

That signing string is eleven concatenated parts in a fixed order — prefix, key, method, host, path, query, content type, nonce, timestamp, version, body — and every one of them has to match what the server reconstructs. It fails with a 403 that does not tell you which part was wrong. CCXT writes it once, in `sign()`, and keeps it right for every one of the 263 endpoints.

Note also the endpoint names. Bitstamp has no single "create order" route: it has `buy/{pair}/`, `buy/market/{pair}/`, `buy/instant/{pair}/`, and the three `sell/` mirrors. CCXT's `create_order` picks the right one from the `type` and `side` you passed.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.bitstamp()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USD')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Raw WebSocket**

```python
import json, websockets, asyncio

async def main():
    async with websockets.connect('wss://ws.bitstamp.net') as ws:
        await ws.send(json.dumps({
            'event': 'bts:subscribe',
            'data': {'channel': 'diff_order_book_btcusd'},
        }))
        async for raw in ws:
            msg = json.loads(raw)
            # deltas only — you still need the REST snapshot,
            # the buffer, the sequence check and the re-sync
            print(msg)

asyncio.run(main())
```

<!-- tabs:end -->

The two snippets look comparable and are not doing the same thing. CCXT returns a **live, merged order book**; the raw socket returns **diff messages**:

| | CCXT | raw stream |
| --- | --- | --- |
| Fetch the REST snapshot and align it with the stream | done for you | your code |
| Buffer deltas arriving during the snapshot fetch, then replay them | done for you | your code |
| Detect sequence gaps and re-sync automatically | done for you | your code |
| Reconnect, re-subscribe and re-seed after a drop | done for you | your code |
| Keep a bounded, depth-limited cache instead of growing forever | done for you | your code |

None of these fail loudly. A hand-rolled book does not throw when it drifts — you find out from a fill you did not expect.

## Where the differences actually bite

### Rate limits you do not have to model

Bitstamp documents a general ceiling of 400 requests per second with a default threshold of 10,000 requests per 10 minutes, and higher limits by agreement. Those are generous numbers, which is exactly why hand-rolled clients blow through them during a backfill. CCXT's token-bucket throttler is on by default with `rateLimit` set to 75 ms for Bitstamp; you write the loop and the library paces it.

### One error hierarchy

Bitstamp returns errors as HTTP status codes plus a JSON body with a `reason` field whose shape varies by endpoint. CCXT maps those onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once and it keeps working on the next venue.

### Precision, rounding and string math

CCXT loads Bitstamp's market metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class, so quantities never drift through float rounding into a rejected order:

```python
amount = exchange.amount_to_precision('BTC/USD', 0.0012345678)
price = exchange.price_to_precision('BTC/USD', 61234.56789)
```

### Eight languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures. A Bitstamp integration prototyped in a Python notebook ports to a Go or C# execution service without redesigning the data model — and without writing that signing string a second time in a second language.

### Nothing is hidden — the implicit API

Alongside the 34 unified capabilities, **all 263 endpoints of Bitstamp's API are generated as callable implicit methods**, with signing, nonce handling, rate limiting and error mapping applied:

```python
# POST /api/v2/fees/trading/
fees = exchange.private_post_fees_trading()

# POST /api/v2/websockets_token/
token = exchange.private_post_websockets_token()
```

Bitstamp-specific surface — earn subscriptions, travel-rule contacts, liquidation addresses, `get_max_order_amount` — is reachable without dropping to raw HTTP. Browse them on the [bitstamp implicit API page](/docs/exchanges/bitstamp/implicit-api).

## What the raw API does better

An honest list, because these are real:

- **Bitstamp's documentation is the source of truth, and it is good.** It publishes working signing examples in Python, Java and C++, so a from-scratch integration has a clear starting point. CCXT's unified names are a deliberate abstraction, which is one extra hop when you are debugging against the vendor docs.
- **No dependency, no abstraction.** If your job is "poll one ticker every minute", 15 lines of `requests` is smaller, easier to audit and easier to deploy than a library covering 104 exchanges.
- **Full fidelity to Bitstamp's payloads.** Fields CCXT does not model — and the exact string formatting Bitstamp uses — reach you unchanged. CCXT preserves the raw payload under `info`, but the top-level structure is unified, not literal.
- **CCXT covers three of Bitstamp's WebSocket channels.** `watchOrderBook`, `watchTrades` and `watchOrders` are implemented; other channels Bitstamp publishes are not, so a consumer that needs one of those connects to the socket directly.

If Bitstamp is your only venue and your integration is small and read-only, hand-rolling it is a perfectly reasonable engineering decision.

## Migrating from the raw Bitstamp API to CCXT

| What you are doing | Bitstamp v2 | CCXT |
| --- | --- | --- |
| Symbols | `btcusd` | `'BTC/USD'` |
| Markets | `GET /api/v2/markets/` | `load_markets()` |
| Ticker | `GET /api/v2/ticker/{pair}/` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET /api/v2/order_book/{pair}/` | `fetch_order_book()` |
| Candles | `GET /api/v2/ohlc/{pair}/` | `fetch_ohlcv()` |
| Public trades | `GET /api/v2/transactions/{pair}/` | `fetch_trades()` |
| New order | `POST /api/v2/buy/{pair}/` and five siblings | `create_order()` |
| Cancel order | `POST /api/v2/cancel_order/` | `cancel_order()` |
| Cancel all | `POST /api/v2/cancel_all_orders/` | `cancel_all_orders()` |
| Open orders | `POST /api/v2/open_orders/{pair}/` | `fetch_open_orders()` |
| Balance | `POST /api/v2/account_balances/` | `fetch_balance()` |
| My trades | `POST /api/v2/user_transactions/` | `fetch_my_trades()` |
| Streams | `wss://ws.bitstamp.net` channels | `watch_order_book()`, `watch_trades()`, `watch_orders()` |
| Anything not listed | the raw endpoint | the same endpoint as an [implicit method](/docs/exchanges/bitstamp/implicit-api) |

## FAQ

**Does Bitstamp have an official SDK?**
No. Bitstamp publishes API documentation with signing examples in Python, Java and C++, but no client library, and its GitHub organisation has no public repositories. The libraries you find are community projects.

**What is the best Python library for the Bitstamp API?**
The two realistic options are CCXT and the community `BitstampClient` package ([kmadac/bitstamp-python-client](https://github.com/kmadac/bitstamp-python-client), MIT, 142 stars, about 1.6k PyPI installs a month). The community client has not had a commit since October 2022 and does not support WebSockets; CCXT covers 34 unified methods, 263 raw endpoints and three streaming methods, and is maintained continuously.

**Does CCXT support Bitstamp WebSockets?**
Yes — `watch_order_book`, `watch_trades` and `watch_orders`, in the same `ccxt` package via `ccxt.pro.bitstamp`. `watch_order_book` returns the same structure as `fetch_order_book`, fully merged, with reconnect and re-seed handled.

**Does Bitstamp have a testnet?**
CCXT does not wire `setSandboxMode(true)` for Bitstamp, so there is no sandbox switch through the library. Test with small live orders on a low-balance account, and see the [Manual](/docs/manual) for safe-testing guidance.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bitstamp unified API reference](/docs/exchanges/bitstamp)
- [bitstamp implicit API](/docs/exchanges/bitstamp/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
