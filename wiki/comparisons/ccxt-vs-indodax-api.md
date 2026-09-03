<!-- title: CCXT vs the raw INDODAX REST API -->
<!-- description: INDODAX publishes API documentation but no client library. Hand-rolling its signing, nonces, rate limits and ticker keys compared with CCXT's indodax class. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: INDODAX ships documentation, not an SDK — the only repository on its GitHub organisation is the API docs. CCXT's indodax class gives you 19 unified capabilities and 22 signed endpoints, but no WebSocket support. -->
<!-- weight: 100 -->

# CCXT vs the raw INDODAX REST API

[INDODAX](https://indodax.com) is Indonesia's largest crypto exchange by listing count, and its API is well documented — but there is no official client library to compare against. The [`btcid` GitHub organisation](https://github.com/btcid) has exactly one public repository, [`indodax-official-api-docs`](https://github.com/btcid/indodax-official-api-docs), and it contains documentation, not code: `Public-RestAPI.md`, `Private-RestAPI.md`, `Marketdata-websocket.md`, `Private-websocket.md`, a deadman-switch guide, a self-trade-prevention guide and a changelog, plus a PHP signing example.

So the real comparison is not CCXT against an SDK. It is **CCXT against the client you would write yourself**.

## TL;DR

- **Write it yourself** if you call two or three INDODAX endpoints, never intend to add another venue, and would rather own a hundred lines than take a dependency.
- **Use CCXT** if you want the signing, nonces, pacing, precision and error mapping already done — 19 unified capabilities and all 22 endpoints, with the same method names you use on every other exchange.
- **CCXT has no WebSocket support for INDODAX.** The venue publishes market-data and private stream documentation; `indodax` has zero `watch*` methods in CCXT. If you need live streams, that part is yours to build.

## At a glance

| | **CCXT** | **Raw INDODAX API** |
| --- | --- | --- |
| Official client library | — | none published; documentation repository only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | any, you write the client |
| Symbols | `'BTC/IDR'` | `btc_idr` for public, `BTCIDR` in some payloads |
| Unified capabilities | 19, of which 15 are `fetch*` | n/a |
| Signing | built in | HMAC-SHA512 over the urlencoded body, `Key` + `Sign` headers, `nonce` or `timestamp` + `recvWindow` |
| WebSockets | **no** — `indodax` has no `watch*` methods in CCXT | documented by INDODAX; you write the client |
| Raw endpoint access | yes — 22 endpoints as implicit methods | it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 50 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | `{"success": 0, "error": "..."}` |
| Testnet / sandbox | no — INDODAX has no sandbox in CCXT | no |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month | docs repository: 172 GitHub stars, 123 forks |
| Licence | MIT | n/a |
| Support | Discord, Telegram, GitHub issues — usually same-day | INDODAX support; issues on the docs repository |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}} and the `btcid/indodax-official-api-docs` repository, including its public and private REST API documents.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.indodax()
ticker = exchange.fetch_ticker('BTC/IDR')
print(ticker['last'], ticker['baseVolume'], ticker['quoteVolume'])
```

#### **Raw REST**

```python
import requests

r = requests.get('https://indodax.com/api/ticker/btc_idr')
t = r.json()['ticker']
print(t['last'], t['vol_btc'], t['vol_idr'])
```

<!-- tabs:end -->

Look at the volume keys. INDODAX names them after the pair — `vol_btc` and `vol_idr` on `btc_idr`, `vol_eth` and `vol_btc` on `eth_btc`. Any generic parser has to build those key names from the pair it asked for. CCXT does exactly that internally and hands you `baseVolume` and `quoteVolume`, which mean the same thing on every venue.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.indodax({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/IDR', 'limit', 'buy', 0.001, 1500000000)
print(order['id'], order['status'])
```

#### **Raw REST**

```python
import hashlib, hmac, time, urllib.parse, requests

payload = {
    'method': 'trade',
    'timestamp': int(time.time() * 1000),
    'recvWindow': 5000,
    'pair': 'btc_idr',
    'type': 'buy',
    'price': 1500000000,
    'idr': 150000,          # buy side is denominated in the quote currency
}
body = urllib.parse.urlencode(payload)
sign = hmac.new(SECRET.encode(), body.encode(), hashlib.sha512).hexdigest()
r = requests.post('https://indodax.com/tapi', data=body,
                  headers={'Key': KEY, 'Sign': sign,
                           'Content-Type': 'application/x-www-form-urlencoded'})
```

<!-- tabs:end -->

Three things in that snippet are easy to get wrong and cost you a live order each time you do:

1. **The signature is over the exact urlencoded body you send.** Re-encoding, reordering or letting a library add a parameter after signing invalidates it.
2. **Every private call is a `POST` to one endpoint** — `https://indodax.com/tapi` — with the operation in a `method` field, not a path. `trade`, `cancelOrder`, `getInfo`, `openOrders`, `getOrder`, `transHistory` are all the same URL.
3. **Buy and sell orders are denominated differently.** A buy is expressed in the quote currency, a sell in the base. CCXT takes an `amount` and converts.

CCXT's `create_order` handles all three and returns a [unified order structure](/docs/manual#order-structure).

## Where the differences actually bite

### Rate limits you do not have to model

INDODAX's own documentation sets the public API at 180 requests per minute, trade operations at 20 requests per second per account and pair — **with a five-second trading block if you exceed it** — and cancel operations at 30 per second. A block during a fast market is not a rate-limit error you retry past; it is five seconds of no trading.

CCXT ships a token-bucket throttler that is on by default, with `rateLimit` at 50 ms for INDODAX and per-endpoint costs in the exchange definition. You call methods in a loop; the library paces them.

### Nonces, timestamps and clock drift

INDODAX accepts either an incrementing `nonce` or a `timestamp` with a `recvWindow`. Incrementing nonces are the classic source of a hard-to-reproduce failure — two processes sharing a key, a restart that resets a counter, an out-of-order retry — and the error arrives as a rejected request, not an obvious bug. CCXT uses the timestamp form with a configurable `recvWindow` and manages it for you.

### Deprecations reach you as a version bump

INDODAX's private API documentation marks `tradeHistory` and `orderHistory` as deprecating in April 2026, with replacements to move to. In a hand-rolled client, that is a ticket you have to notice, schedule and land. In CCXT, `fetch_my_trades` and `fetch_closed_orders` keep the same signature and the endpoint change arrives in a release.

### Symbols and precision

INDODAX's public endpoints use `btc_idr` and some payloads use `BTCIDR`. CCXT normalises both to `'BTC/IDR'` and keeps the venue identifier on `market['id']`. It also loads each pair's price and volume increments so `amount_to_precision` and `price_to_precision` produce values the venue accepts — with IDR prices in the hundreds of millions, rounding is not a theoretical concern.

### One error hierarchy

INDODAX signals failure as `{"success": 0, "error": "..."}` with an HTTP 200. A hand-rolled client has to check the body of every response and match on error strings. CCXT does that and raises from a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `RateLimitExceeded` and 36 more under `BaseError` — so one `except` block covers this venue and the next.

### Eight languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures. INDODAX's documentation ships a PHP signing example; every other language is yours to write and re-write.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.indodax()
ticker = exchange.fetch_ticker('BTC/IDR')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.indodax ();
const ticker = await exchange.fetchTicker ('BTC/IDR');
```

#### **PHP**

```php
$exchange = new \ccxt\indodax();
$ticker = $exchange->fetch_ticker('BTC/IDR');
```

<!-- tabs:end -->

### Nothing is hidden — the implicit API

Alongside the 19 unified capabilities, **all 22 INDODAX endpoints are generated as implicit methods**, with signing and rate-limit accounting applied. If INDODAX ships something CCXT has not unified yet, you can still call it:

```python
response = exchange.private_post_get_info()
```

Browse them on the [indodax implicit API page](/docs/exchanges/indodax/implicit-api).

## What going direct does better

Real advantages of writing your own client:

- **WebSockets.** INDODAX documents both a market-data stream and a private stream, and **CCXT implements neither** — `indodax` has zero `watch*` methods. If your system needs a live book or live order updates from this venue, a hand-rolled client is currently the only way to get them.
- **Endpoints CCXT has not unified.** INDODAX's docs cover a deadman switch and self-trade prevention. CCXT exposes the underlying endpoints as implicit methods, but there is no unified wrapper, so calling them directly is no worse than calling them through CCXT — and you skip a dependency.
- **A hundred lines you can read in full.** For a two-endpoint integration, `requests` plus the HMAC-SHA512 block is less code to audit than a 104-exchange library, and there is no version to track.
- **The docs are the API.** The `method` field names in `Private-RestAPI.md` are exactly what you send. CCXT's unified names are an abstraction you translate back when debugging.

If INDODAX is your only venue, your usage is read-mostly, and you need its WebSocket streams, writing the client is a defensible choice.

## Migrating from a hand-rolled INDODAX client to CCXT

| What you are doing | Raw INDODAX API | CCXT |
| --- | --- | --- |
| Symbols | `btc_idr` | `'BTC/IDR'` |
| Pairs | `GET /api/pairs` | `load_markets()` |
| Ticker | `GET /api/ticker/{pair}` | `fetch_ticker()` |
| Order book | `GET /api/depth/{pair}` | `fetch_order_book()` |
| Trades | `GET /api/trades/{pair}` | `fetch_trades()` |
| Server time | `GET /api/server_time` | `fetch_time()` |
| Balance | `tapi` `method=getInfo` | `fetch_balance()` |
| New order | `tapi` `method=trade` | `create_order()` |
| Cancel order | `tapi` `method=cancelOrder` | `cancel_order()` |
| Order status | `tapi` `method=getOrder` | `fetch_order()` |
| Open orders | `tapi` `method=openOrders` | `fetch_open_orders()` |
| Transfers history | `tapi` `method=transHistory` | `fetch_deposits_withdrawals()` |
| Streams | documented, no client | not available in CCXT for this venue |
| Anything not listed | the `method` name | the same endpoint as an [implicit method](/docs/exchanges/indodax/implicit-api) |

## FAQ

**Does INDODAX have an official SDK?**
No. INDODAX publishes official documentation — the [`btcid/indodax-official-api-docs`](https://github.com/btcid/indodax-official-api-docs) repository is the only public repository on its GitHub organisation, and it contains Markdown documents and a PHP signing example rather than a client library.

**Does CCXT support INDODAX WebSockets?**
No. `indodax` has zero `watch*` methods in CCXT. INDODAX documents both a market-data WebSocket and a private WebSocket, but CCXT does not currently implement them, so streaming from this venue means writing your own client.

**How does CCXT sign INDODAX private requests?**
It POSTs a urlencoded body containing the operation in a `method` field, a millisecond `timestamp` and a `recvWindow`, to `https://indodax.com/tapi`, and sends the HMAC-SHA512 of that exact body in a `Sign` header alongside your key in a `Key` header. You supply `apiKey` and `secret`.

**What are INDODAX's rate limits?**
Its documentation states 180 requests per minute on the public API, 20 trade requests per second per account and pair — exceeding that triggers a five-second trading block — and 30 cancel requests per second. CCXT's throttler is on by default and paces requests for you.

**Does INDODAX have a testnet?**
CCXT defines no sandbox URLs for INDODAX, so `setSandboxMode(True)` will not switch you to a test environment.

**Is CCXT free?**
Yes. MIT-licensed.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [indodax unified API reference](/docs/exchanges/indodax)
- [indodax implicit API](/docs/exchanges/indodax/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
