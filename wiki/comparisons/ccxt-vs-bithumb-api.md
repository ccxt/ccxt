<!-- title: CCXT vs the Bithumb API -->
<!-- description: Bithumb ships no client library — its own setup guide says to install PyJWT and requests. CCXT compared with raw HTTP on signing, errors and streaming. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Bithumb's developer docs are Korean-language and ship no SDK: the official onboarding path is "install a JWT library and build the request". CCXT gives you 37 unified capabilities, 67 endpoints and 6 WebSocket methods instead. -->
<!-- weight: 100 -->

# CCXT vs the Bithumb API

Bithumb, Korea's long-running won-denominated exchange, documents its API thoroughly at [apidocs.bithumb.com](https://apidocs.bithumb.com) — in Korean — and ships **no client library**. Its own "development environment setup" guide walks you through installing `PyJWT` and `requests` in Python, or `jsonwebtoken`, `uuid` and `axios` in Node, and then building the signed request yourself.

So the comparison here is not CCXT against a vendor SDK. It is CCXT against the client you would otherwise write.

## TL;DR

- **Write it yourself** if you need one or two endpoints, want zero dependencies, and are comfortable reading Korean-language reference docs.
- **Pick CCXT** if you want unified symbols, signing, per-request pacing, typed errors and WebSocket streaming that already work, in seven languages, with the same method names you will use on the next exchange.
- **CCXT does not hide the venue.** All 67 Bithumb endpoints it models are callable as [implicit methods](/docs/exchanges/bithumb/implicit-api), signed and rate-limited.

## At a glance

| | **CCXT** | **Raw Bithumb API** |
| --- | --- | --- |
| Exchanges covered | 104 (Bithumb is one of them) | Bithumb only |
| Official client library | n/a | none — the docs point you at generic JWT and HTTP libraries |
| Documentation language | English | Korean |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | whatever you write |
| Unified market data + trading API | yes — 37 capabilities, same names on every exchange | raw JSON |
| Symbols | `'BTC/KRW'` | `BTC_KRW`, `KRW-BTC` depending on the API generation |
| Request signing | built in | your code — JWT (HS256) with a UUID nonce and a SHA-512 query hash |
| Error handling | 41 typed exceptions in one hierarchy | HTTP 200 with a numeric `status` string and a Korean message |
| WebSockets | yes — 6 `watch*` methods | yes, public and private channels |
| Raw endpoint access | yes — 67 endpoints as implicit methods | yes, by definition |
| Built-in rate limiter | yes, on by default (`rateLimit` 8.334 ms) | your code |
| Testnet / sandbox | not available for `bithumb` | not offered |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month | n/a |
| Licence | MIT | n/a |
| Support | Discord, Telegram, GitHub issues — usually same-day | Bithumb developer support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}} and Bithumb's published developer documentation, including its authentication, rate-limit and WebSocket reference pages.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bithumb()
ticker = exchange.fetch_ticker('BTC/KRW')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw HTTP**

```python
import requests

r = requests.get('https://api.bithumb.com/public/ticker/BTC_KRW')
payload = r.json()
if payload['status'] != '0000':
    raise RuntimeError(payload['message'])
print(payload['data']['closing_price'], payload['data']['units_traded_24H'])
```

<!-- tabs:end -->

Note what the raw version has to do. Everything is a **string**, the last price lives in `data.closing_price`, and the request either succeeded or it did not — you find out from `status`, not from the HTTP code. A request for a coin that is not listed returns **HTTP 200** with `{"status":"5500","message":"상장 코인이 아닙니다."}`. If your error handling keys on `raise_for_status()`, it will never fire.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bithumb({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/KRW', 'limit', 'buy', 0.001, 100000000)
print(order['id'], order['status'])
```

#### **Raw HTTP**

```python
import hashlib, jwt, requests, time, uuid
from urllib.parse import urlencode

body = {'market': 'KRW-BTC', 'side': 'bid', 'order_type': 'limit',
        'price': '100000000', 'volume': '0.001'}
query = urlencode(body)

payload = {
    'access_key': 'YOUR_KEY',
    'nonce': str(uuid.uuid4()),
    'timestamp': round(time.time() * 1000),
    'query_hash': hashlib.sha512(query.encode('utf-8')).hexdigest(),
    'query_hash_alg': 'SHA512',
}
token = jwt.encode(payload, 'YOUR_SECRET')

r = requests.post('https://api.bithumb.com/v2/orders', json=body, headers={
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json; charset=utf-8',
})
print(r.json())
```

<!-- tabs:end -->

That is the documented scheme: a JWT carrying the access key, a per-request UUID nonce, a millisecond timestamp, and — whenever the request has parameters — a SHA-512 hash of those parameters *urlencoded into a query string*, plus the literal `query_hash_alg: "SHA512"`. That last part catches people out: the body you POST is JSON, but the string you hash is the urlencoded form of it. Every field is required, and a mismatch produces an authentication error that does not say which part was wrong.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.bithumb()
    while True:
        orderbook = await exchange.watch_order_book('BTC/KRW')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Raw WebSocket**

```python
import asyncio, json, websockets

async def main():
    url = "wss://ws-api.bithumb.com/websocket/v1"
    async with websockets.connect(url) as ws:
        await ws.send(json.dumps([
            {"ticket": "example"},
            {"type": "orderbook", "codes": ["KRW-BTC"]},
        ]))
        while True:
            print(json.loads(await ws.recv()))

asyncio.run(main())
```

<!-- tabs:end -->

The raw subscription is easy. What is not easy is everything after it: reconnecting when the socket drops, resending the ticket and subscription on reconnect, keeping the book bounded rather than letting it grow, and converting Bithumb's `KRW-BTC` codes back into whatever your system calls that market. `watch_order_book` returns the [unified order book structure](/docs/manual#order-book-structure), the same one `fetch_order_book` returns, and handles the rest.

## Where the differences actually bite

### Two API generations, one class

Bithumb's public surface has grown in layers: the older `/public/...` endpoints use `BTC_KRW`-style pairs, while the newer `/v1/...` endpoints use `KRW-BTC` market codes and the JWT authentication above. Which naming convention a given endpoint wants is a detail you carry in your head when you write the client yourself. In CCXT the symbol is always `'BTC/KRW'`, and the class maps it to whatever the endpoint expects.

### Private WebSocket auth is a JWT too

Bithumb's private streams — order and asset events — authenticate with the same JWT scheme, delivered as an `Authorization: Bearer` header on the socket handshake. CCXT builds it for you: `watch_orders()` and `watch_balance()` mint the token, including the UUID nonce, and reconnect with a fresh one.

### Rate limits you do not have to model

Bithumb meters **by IP and by API category**, not per endpoint, so calls in the same category share a budget. Its documentation sets public categories — candles, order book, ticker, trades and everything else — at 150 requests per second each, private categories at 140 per second each, and bulk order creation and cancellation at 20 per second. Mapping your call sites onto those categories is real work.

CCXT ships a token-bucket throttler that is **on by default** (`enableRateLimit = true`, `rateLimit = 8.334` ms for Bithumb) and maps rate-limit responses onto `RateLimitExceeded`, so a naive loop does not walk into a ban.

### Errors that arrive as HTTP 200

This is the failure mode most likely to reach production. Bithumb returns a `status` string — `"0000"` for success, `"5500"` and friends for failures — inside an HTTP 200 response, with a human-readable message in Korean. CCXT inspects that field and raises from a [typed exception tree](/docs/manual#error-handling): `AuthenticationError`, `PermissionDenied`, `InvalidAddress`, `BadRequest`, `ExchangeNotAvailable`, `InsufficientFunds`, `InvalidOrder` and 34 more, all under `BaseError`. Your `except` clauses read the same as they do on every other venue, and they do not depend on matching a Korean string.

### Precision and string math

Bithumb prices are large numbers in KRW and sizes are small decimals, and every value in its responses arrives as a string. CCXT loads the market metadata and gives you `amount_to_precision` and `price_to_precision`, backed by the `Precise` string-arithmetic class, so nothing drifts through float rounding on the way to a rejected order:

```python
amount = exchange.amount_to_precision('BTC/KRW', 0.0012345678)
price = exchange.price_to_precision('BTC/KRW', 106354321.4)
```

### Seven languages, one API

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.bithumb ();
const ticker = await exchange.fetchTicker ('BTC/KRW');
```

#### **Python**

```python
import ccxt
exchange = ccxt.bithumb()
ticker = exchange.fetch_ticker('BTC/KRW')
```

#### **C#**

```csharp
var exchange = new ccxt.bithumb();
var ticker = await exchange.FetchTicker("BTC/KRW");
```

<!-- tabs:end -->

Bithumb's setup guide shows the JWT construction separately for Node, Python and Java, because there is no shared client to point at. CCXT is written once and transpiled to seven languages, so the token construction is the same code everywhere.

### Nothing is hidden — the implicit API

```python
# any raw Bithumb endpoint, camelCased from its path
info = exchange.public_get_network_info()
```

All 67 endpoints CCXT models are reachable this way, with signing, rate-limit accounting and error mapping applied. Browse them on the [bithumb implicit API page](/docs/exchanges/bithumb/implicit-api).

## What going direct does better

Real advantages, and they are not trivial for this venue:

- **The API surface is larger than CCXT's unified layer.** Bithumb's reference covers TWAP orders, bulk order creation and cancellation (up to 30 per request), KRW deposit and withdrawal flows, withdrawal allow-lists and API-key expiry listings. CCXT reaches these through implicit methods, but they have no unified cross-exchange wrapper.
- **The newest endpoints appear in the docs first.** Bithumb versions its API (v1.2.0, v2.1.0, v2.1.5) and publishes migration guides — for example the private WebSocket `myOrder` v1-to-v2 migration. A hand-rolled client can adopt a new version the day it is documented.
- **Bithumb ships tooling of its own.** Alongside the reference it publishes an "AI Trade Kit" — a CLI, an MCP server and agent skills — for driving the API without writing a client at all. That is a different, and for some workflows better, answer than a library.
- **Zero dependencies.** If your program reads one ticker, a `requests` call and a `status` check is a dozen lines and no supply chain.

If you need TWAP orders, bulk order batches or the KRW banking endpoints, going direct — or going direct alongside CCXT — is the right call.

## Migrating from raw Bithumb HTTP to CCXT

| What you are doing | Bithumb API | CCXT |
| --- | --- | --- |
| Symbols | `BTC_KRW` / `KRW-BTC` | `'BTC/KRW'` |
| Markets | market-list endpoint | `load_markets()` |
| Ticker | `/public/ticker/{pair}` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `/public/orderbook/{pair}` | `fetch_order_book()` |
| Public trades | `/public/transaction_history/{pair}` | `fetch_trades()` |
| Candles | `/public/candlestick/{pair}/{interval}` | `fetch_ohlcv()` |
| New order | order-request endpoint | `create_order()` |
| Cancel order | order-cancel endpoint | `cancel_order()` |
| Open orders | pending-order list | `fetch_open_orders()` |
| Order detail | individual-order lookup | `fetch_order()` |
| Balance | account/balance endpoint | `fetch_balance()` |
| Signing | JWT with UUID nonce + SHA-512 query hash, by hand | automatic |
| Error checking | compare `status` to `"0000"` | typed exceptions |
| Streams | ticket + subscription JSON on the socket | `watch_*` on `ccxt.pro.bithumb` |
| Anything not listed | the endpoint | the same endpoint as an [implicit method](/docs/exchanges/bithumb/implicit-api) |

## FAQ

**Does Bithumb have an official SDK?**
Not a client library. Its developer documentation ships reference pages, quick-start guides and an AI Trade Kit (CLI, MCP server, agent skills), and its environment-setup guide instructs you to install generic JWT and HTTP packages — `PyJWT` and `requests`, or `jsonwebtoken`, `uuid` and `axios` — and construct the signed request yourself.

**Does CCXT support Bithumb WebSockets?**
Yes. `ccxt.pro.bithumb` implements 6 `watch*` methods — `watch_order_book`, `watch_ticker`, `watch_tickers`, `watch_trades`, `watch_orders` and `watch_balance` — including the JWT handshake for the private streams.

**How does CCXT handle Bithumb's HTTP-200 errors?**
It reads the `status` field rather than the HTTP status code and raises a typed exception — `AuthenticationError`, `PermissionDenied`, `BadRequest`, `ExchangeNotAvailable` and so on — so a failed call raises instead of returning a payload your code then treats as data.

**Does `setSandboxMode` work for Bithumb?**
No. CCXT's `bithumb` class does not declare sandbox URLs, so test with the smallest permitted order size on a low-balance key instead.

**Can I still call Bithumb-specific endpoints from CCXT?**
Yes — all 67 endpoints CCXT models are available as [implicit methods](/docs/exchanges/bithumb/implicit-api), with signing and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bithumb unified API reference](/docs/exchanges/bithumb)
- [bithumb implicit API](/docs/exchanges/bithumb/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
