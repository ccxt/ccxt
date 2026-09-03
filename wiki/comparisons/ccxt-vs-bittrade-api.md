<!-- title: CCXT vs the raw BitTrade API -->
<!-- description: BitTrade publishes API docs but no client library. Hand-rolling its v2 HMAC signing and GZIP WebSocket, compared with CCXT's unified methods. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: BitTrade's only public GitHub repository is documentation — there is no SDK in any language. CCXT covers 31 unified methods, 110 raw endpoints and four WebSocket streams for the venue. -->
<!-- weight: 100 -->

# CCXT vs the raw BitTrade API

[BitTrade](https://www.bittrade.co.jp) is a Japanese registered exchange, formerly Huobi Japan, and its API is documented in detail at [api-doc.bittrade.co.jp](https://api-doc.bittrade.co.jp/). The documentation is thorough — signature protocol v2, per-endpoint rate limits, public and private WebSocket feeds. What it does not include is a client library.

BitTrade's GitHub organisation, [BitTrade-Inc](https://github.com/BitTrade-Inc), has exactly one public repository: [BitTrade-api-docs](https://github.com/BitTrade-Inc/BitTrade-api-docs), described as "Official Documentation for the BitTrade APIs", last updated in April 2024. There is no first-party SDK in any language.

So the question is not which SDK to use. It is **whether you write the signing, the GZIP socket and the reconnect logic yourself, or use [CCXT](/docs/manual), which already has.**

## TL;DR

- **Write it yourself** if you need a couple of public endpoints and nothing else — the market data routes are unauthenticated and plain JSON.
- **Pick CCXT** as soon as you need private endpoints or streaming: 31 unified capabilities, 110 BitTrade endpoints as implicit methods, and four `watch*` methods, from TypeScript, JavaScript, Python, PHP, C#/.NET, Go and Java.
- **BitTrade's WebSocket feed is GZIP-compressed and requires a bidirectional heartbeat.** That is two more things to get right in a hand-rolled client, and two things CCXT does not make you think about.

## At a glance

| | **CCXT** | **Raw BitTrade API** |
| --- | --- | --- |
| Exchanges covered | 104 (BitTrade is one of them) | BitTrade only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | whatever you write |
| Official vendor SDK | not applicable | none — the only public repository is documentation |
| Unified market data + trading API | yes — same method names across every exchange | no — BitTrade's own payloads |
| BitTrade capabilities implemented | 31 unified methods, 19 of them `fetch*` | you implement what you need |
| Raw endpoint access | yes — 110 BitTrade endpoints as implicit methods | yes, it is all you have |
| WebSockets | yes — `watchTicker`, `watchTrades`, `watchOrderBook`, `watchOHLCV` | raw sockets, GZIP framing and heartbeats are yours |
| Built-in rate limiter | yes, on by default (`rateLimit` 100 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | BitTrade `err-code` strings |
| Testnet / sandbox | not wired for this venue | none documented |
| Licence | MIT | not applicable |
| Support | Discord, Telegram, GitHub issues — usually same-day | BitTrade support; the docs repository |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, BitTrade's published API reference at api-doc.bittrade.co.jp, and the BitTrade-Inc GitHub organisation.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bittrade()
ticker = exchange.fetch_ticker('BTC/JPY')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw HTTP**

```python
import requests

r = requests.get('https://api-cloud.bittrade.co.jp/market/detail/merged',
                 params={'symbol': 'btcjpy'})
tick = r.json()['tick']
print(tick['close'], tick['amount'])   # BitTrade's own key names
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — `last`, `bid`, `ask`, `baseVolume`, `quoteVolume`, a millisecond `timestamp` and an ISO `datetime` — identical in shape to what you get from any of the other 103 exchanges.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bittrade({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/JPY', 'limit', 'buy', 0.001, 9000000)
print(order['id'], order['status'])
```

#### **Raw HTTP**

```python
import base64, hashlib, hmac, json, requests
from datetime import datetime, timezone
from urllib.parse import urlencode, quote

key, secret = '...', '...'
host, path = 'api-cloud.bittrade.co.jp', '/v1/order/orders/place'
params = {
    'AccessKeyId': key,
    'SignatureMethod': 'HmacSHA256',
    'SignatureVersion': '2',
    'Timestamp': datetime.now(timezone.utc).strftime('%Y-%m-%dT%H:%M:%S'),
}
canonical = urlencode(sorted(params.items()), quote_via=quote)
payload = '\n'.join(['POST', host, path, canonical])
signature = base64.b64encode(
    hmac.new(secret.encode(), payload.encode(), hashlib.sha256).digest()).decode()

r = requests.post(
    'https://' + host + path + '?' + canonical + '&Signature=' + quote(signature),
    headers={'Content-Type': 'application/json'},
    data=json.dumps({'account-id': '...', 'symbol': 'btcjpy',
                     'type': 'buy-limit', 'amount': '0.001', 'price': '9000000'}))
print(r.json())
```

<!-- tabs:end -->

BitTrade's signature protocol v2 signs four newline-joined parts — method, lowercase host, request path, and the ASCII-sorted URL-encoded query string — then base64-encodes the HMAC-SHA256 and appends it as a query parameter. The sort order and the encoding of the encoded signature are both easy to get subtly wrong, and the failure is a rejection that does not say which part was at fault. There is also an `account-id` to look up before you can place anything. CCXT does all of that in `sign()` and `fetch_accounts()`.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.bittrade()
    while True:
        orderbook = await exchange.watch_order_book('BTC/JPY')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Raw WebSocket**

```python
import gzip, json, asyncio, websockets

async def main():
    async with websockets.connect('wss://api-cloud.bittrade.co.jp/ws') as ws:
        await ws.send(json.dumps({'sub': 'market.btcjpy.mbp.150', 'id': '1'}))
        async for raw in ws:
            msg = json.loads(gzip.decompress(raw))   # every frame is GZIP
            if 'ping' in msg:
                await ws.send(json.dumps({'pong': msg['ping']}))   # or you are dropped
                continue
            print(msg)

asyncio.run(main())
```

<!-- tabs:end -->

Every frame on BitTrade's public feed is GZIP-compressed, and the server sends `ping` messages that you must answer with a matching `pong` or the connection is closed. On top of that, a production book still needs the snapshot, the delta buffer, the sequence check and the reconnect-and-re-seed path:

| | CCXT | raw stream |
| --- | --- | --- |
| GZIP decompression on every frame | done for you | your code |
| Ping/pong heartbeat with miss detection | done for you | your code |
| Merge deltas into a live book | done for you | your code |
| Reconnect, re-subscribe and re-seed after a drop | done for you | your code |
| Bounded caches for trades and candles | done for you | your code |

## Where the differences actually bite

### Rate limits you do not have to model

BitTrade documents 10 requests per second per IP on public endpoints and 10 per second per API key on signed ones, with tighter per-endpoint limits in places (match results allows 10 calls per 2 seconds), plus WebSocket limits of 100 new connections per second per IP and a maximum of 10 concurrent private connections per API key. CCXT's token-bucket throttler is on by default with `rateLimit` set to 100 ms for BitTrade, so a backfill loop paces itself rather than earning a block.

### One error hierarchy

BitTrade returns errors as `err-code` strings inside a 200-status body — the sort of thing a naive client treats as success. CCXT checks the status field, maps the codes onto a [typed exception tree](/docs/manual#error-handling), and raises `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError` or one of 36 others, all descending from `BaseError`.

### Precision and string math

CCXT loads BitTrade's symbol precisions and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class. JPY pairs have large prices and small amounts — exactly the shape where float rounding produces a rejected order.

```python
amount = exchange.amount_to_precision('BTC/JPY', 0.0012345678)
price = exchange.price_to_precision('BTC/JPY', 9123456.789)
```

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures — so the v2 signing scheme is implemented once for you rather than once per language in your codebase.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.bittrade ();
const ticker = await exchange.fetchTicker ('BTC/JPY');
```

#### **Python**

```python
import ccxt
exchange = ccxt.bittrade()
ticker = exchange.fetch_ticker('BTC/JPY')
```

#### **PHP**

```php
$exchange = new \ccxt\bittrade();
$ticker = $exchange->fetch_ticker('BTC/JPY');
```

#### **Go**

```go
exchange := ccxt.NewBittrade(nil)
ticker, err := exchange.FetchTicker("BTC/JPY")
```

<!-- tabs:end -->

### Nothing is hidden — the implicit API

Alongside the 31 unified capabilities, **all 110 BitTrade endpoints are generated as callable implicit methods**, with v2 signing, rate limiting and error mapping applied:

```python
# GET /v2/account/ledger
ledger = exchange.v2_private_get_account_ledger()

# GET /v2/etp/reference
etp = exchange.v2_private_get_etp_reference()
```

BitTrade's sub-account management, C2C lending, algo orders and ETP creation and redemption routes are all reachable this way. Browse them on the [bittrade implicit API page](/docs/exchanges/bittrade/implicit-api).

## What the raw API does better

An honest list, because these are real:

- **The documentation is detailed and authoritative.** BitTrade inherited a mature Huobi-lineage API reference, with per-endpoint rate limits, error-code tables and worked signing examples. When behaviour is in question, that reference is the answer; CCXT's unified names are one hop away from it.
- **Private WebSocket channels.** BitTrade publishes an authenticated feed at `wss://api-cloud.bittrade.co.jp/ws/v2` for order and account updates. CCXT's four `watch*` methods for BitTrade cover public market data only, so a live private order stream is something you build against the raw socket.
- **Full fidelity to the payloads.** Fields CCXT does not model — and BitTrade's own units and formatting — reach you unchanged. CCXT preserves the raw response under `info`, but the top-level structure is unified rather than literal.
- **No dependency for a read-only job.** Polling one public ticker is a dozen lines of `requests` and no library at all.

If you only need public market data from BitTrade in one language, hand-rolling it is a reasonable decision.

## Migrating from the raw BitTrade API to CCXT

| What you are doing | BitTrade REST | CCXT |
| --- | --- | --- |
| Symbols | `btcjpy` | `'BTC/JPY'` |
| Markets | `GET /v1/common/symbols` | `load_markets()` |
| Ticker | `GET /market/detail/merged` | `fetch_ticker()` |
| All tickers | `GET /market/tickers` | `fetch_tickers()` |
| Order book | `GET /market/depth` | `fetch_order_book()` |
| Candles | `GET /market/history/kline` | `fetch_ohlcv()` |
| Public trades | `GET /market/history/trade` | `fetch_trades()` |
| Accounts | `GET /v1/account/accounts` | `fetch_accounts()` |
| New order | `POST /v1/order/orders/place` | `create_order()` |
| Cancel order | `POST /v1/order/orders/{id}/submitcancel` | `cancel_order()` |
| Open orders | `GET /v1/order/openOrders` | `fetch_open_orders()` |
| Balance | `GET /v1/account/accounts/{id}/balance` | `fetch_balance()` |
| My trades | `GET /v1/order/matchresults` | `fetch_my_trades()` |
| Streams | `wss://api-cloud.bittrade.co.jp/ws`, GZIP | `watch_ticker()`, `watch_trades()`, `watch_order_book()`, `watch_ohlcv()` |
| Anything not listed | the raw endpoint | the same endpoint as an [implicit method](/docs/exchanges/bittrade/implicit-api) |

## FAQ

**Does BitTrade have an official SDK?**
No. BitTrade's GitHub organisation publishes one public repository and it contains documentation, not code. There is no first-party client library for Python, JavaScript, Java, Go or any other language, so CCXT or your own HTTP client are the realistic options.

**Does CCXT support BitTrade WebSockets?**
Yes, for public market data: `watch_ticker`, `watch_trades`, `watch_order_book` and `watch_ohlcv` via `ccxt.pro.bittrade`. GZIP decompression and the ping/pong heartbeat are handled inside the library. BitTrade's authenticated `ws/v2` order stream is not currently exposed as a `watch*` method.

**How does BitTrade sign API requests?**
Signature protocol v2: HMAC-SHA256 over the newline-joined HTTP method, lowercase host, request path and ASCII-sorted URL-encoded query string, base64-encoded and passed as a `Signature` query parameter alongside `AccessKeyId`, `SignatureMethod`, `SignatureVersion` and `Timestamp`. CCXT builds this for every private endpoint including the implicit ones.

**Can I still call BitTrade-specific endpoints through CCXT?**
Yes — all 110 of them, as [implicit methods](/docs/exchanges/bittrade/implicit-api), including sub-account management, algo orders, C2C and ETP routes, with signing and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bittrade unified API reference](/docs/exchanges/bittrade)
- [bittrade implicit API](/docs/exchanges/bittrade/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
