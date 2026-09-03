<!-- title: CCXT vs the Bitrue API -->
<!-- description: Bitrue says its listed SDKs are not officially produced. CCXT compared with raw HTTP on spot and futures hosts, weighted rate limits and typed errors. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Bitrue publishes API docs and two demo repositories, and says in writing that the SDKs listed are not officially produced. CCXT covers spot and futures with 40 unified capabilities, 65 endpoints and 6 WebSocket methods. -->
<!-- weight: 100 -->

# CCXT vs the Bitrue API

Bitrue documents its [spot](https://github.com/Bitrue-exchange/Spot-official-api-docs) and futures APIs on GitHub and links a couple of demo repositories from its [API portal](https://www.bitrue.com/api-docs). It also says, on that same page, that "the following SDKs are provided by partners and users, and are not officially produced" and that Bitrue "does not make any commitment to the safety and performance of the SDKs".

Taking that at face value: there is no exchange-maintained client library to compare against. So the comparison is CCXT against the HTTP client you would otherwise write.

## TL;DR

- **Write it yourself** if you need one or two endpoints and want zero dependencies — Bitrue's spot API is Binance-shaped, so an `X-MBX-APIKEY` header and an HMAC-SHA256 signature get you a long way.
- **Pick CCXT** if you want spot and futures behind one client, weighted rate limiting, typed errors and WebSocket streaming that already work, in seven languages.
- **Nothing is hidden.** All 65 Bitrue endpoints CCXT models are callable as [implicit methods](/docs/exchanges/bitrue/implicit-api), signed and rate-limited.

## At a glance

| | **CCXT** | **Raw Bitrue API** |
| --- | --- | --- |
| Exchanges covered | 104 (Bitrue is one of them) | Bitrue only |
| Official client library | n/a | none — Bitrue states the listed SDKs are "not officially produced" |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | whatever you write |
| Unified market data + trading API | yes — 40 capabilities, same names on every exchange | raw JSON |
| Spot and futures | one `ccxt.bitrue` instance, selected by symbol or `defaultType` | separate hosts and separate docs sets |
| Symbols | `'BTC/USDT'`, `'BTC/USDT:USDT'` | `BTCUSDT` |
| Request signing | built in — `X-MBX-APIKEY` + HMAC-SHA256 | your code |
| Raw endpoint access | yes — 65 endpoints as implicit methods | yes, by definition |
| Built-in rate limiter | yes, per-endpoint weights including weight-by-`limit`, on by default | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status + Bitrue error codes |
| WebSockets | yes — 6 `watch*` methods | yes, spot and futures sockets on different hosts |
| Testnet / sandbox | not available for `bitrue` | not offered |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month | n/a |
| Licence | MIT | n/a |
| Support | Discord, Telegram, GitHub issues — usually same-day | Bitrue support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, Bitrue's published API documentation and GitHub organisation, and live responses from its public endpoints.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitrue()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw HTTP**

```python
import requests

r = requests.get('https://openapi.bitrue.com/api/v1/ticker/24hr',
                 params={'symbol': 'BTCUSDT'})
data = r.json()[0]
print(data['lastPrice'], data['volume'])
```

<!-- tabs:end -->

The payload looks like Binance's — same field names, same shape — which is convenient right up to the point where it is not. Several of those fields come back **null or zero** on Bitrue: `weightedAvgPrice`, `prevClosePrice` and `lastQty` are `null`, and `openTime`, `closeTime` and `count` are `0`. Code lifted from a Binance integration will not crash; it will quietly carry nulls into your data model. CCXT parses defensively and returns a [unified ticker structure](/docs/manual#ticker-structure) with `None` where a value genuinely is not published, and the same keys as every other exchange where it is.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitrue({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **Raw HTTP**

```python
import hashlib, hmac, time, requests
from urllib.parse import urlencode

params = {'symbol': 'BTCUSDT', 'side': 'BUY', 'type': 'LIMIT',
          'quantity': '0.001', 'price': '60000',
          'timestamp': int(time.time() * 1000), 'recvWindow': 5000}
query = urlencode(params)
params['signature'] = hmac.new(b'YOUR_SECRET', query.encode(),
                               hashlib.sha256).hexdigest()

r = requests.post('https://openapi.bitrue.com/api/v1/order', params=params,
                  headers={'X-MBX-APIKEY': 'YOUR_KEY'})
print(r.json())
```

<!-- tabs:end -->

Straightforward — until you need the same thing on futures, which lives on a different host with a different docs set, and until you need it in a second language.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.bitrue()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Raw WebSocket**

```python
import asyncio, gzip, json, websockets

async def main():
    async with websockets.connect('wss://ws.bitrue.com/market/ws') as ws:
        await ws.send(json.dumps({'event': 'sub', 'params': {
            'cb_id': 'btcusdt',
            'channel': 'market_btcusdt_simple_depth_step0'}}))
        while True:
            message = json.loads(gzip.decompress(await ws.recv()))
            if 'ping' in message:          # keep-alive; unanswered means disconnect
                await ws.send(json.dumps({'pong': message['ping']}))
                continue
            print(message['tick']['buys'][0], message['tick']['asks'][0])

asyncio.run(main())
```

<!-- tabs:end -->

Three things the raw version has to get right before it works at all: every frame is **gzip-compressed**, the server sends `{"ping": ...}` frames that you must answer with `{"pong": ...}` or it drops you, and the book arrives under `tick.buys` / `tick.asks` rather than `bids` / `asks`. Then there is reconnect, resubscribe and cache bounding on top.

Switching that snippet to the futures book means a **different host** — Bitrue's spot market socket and its futures kline socket are separate services with different channel names. In CCXT it is one character:

```python
orderbook = await exchange.watch_order_book('BTC/USDT:USDT')
```

## Where the differences actually bite

### Spot and futures are three hosts, not one

Bitrue's spot API, USDⓈ-M futures API and COIN-M futures API live behind different base URLs and different documentation sets, and its WebSocket feeds are split the same way. CCXT models all of them inside one `bitrue` class: pick the product with `options.defaultType` or just use a swap symbol.

```python
exchange = ccxt.bitrue({'apiKey': '...', 'secret': '...',
                        'options': {'defaultType': 'swap'}})
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 60000)
```

The 40 unified capabilities include the derivatives ones — `set_leverage`, `set_margin`, `create_reduce_only_order`, `create_stop_order`, `transfer`, `fetch_transfers` — with the signatures they have on every other derivatives venue.

### Rate limits, including weight that depends on your arguments

CCXT encodes a cost for each of the 65 endpoints against a `rateLimit` of 10 ms, and the throttler is **on by default** (`enableRateLimit = true`). Some endpoints are weighted by what you ask for rather than by how often you ask — the order-book call costs 0.24 at `limit=100`, 1.2 at `limit=500` and 2.4 at `limit=1000`:

```text
'depth': { 'cost': 1, 'byLimit': [ [ 100, 0.24 ], [ 500, 1.2 ], [ 1000, 2.4 ] ] }
```

Getting this right by hand means reading the weight table, mapping it onto your call sites, and re-reading it whenever the exchange changes it. CCXT ships the table.

### Binance-shaped, but not Binance

Bitrue's spot API borrows Binance's conventions — `X-MBX-APIKEY`, `timestamp` and `recvWindow` parameters, HMAC-SHA256 over the query string, `BTCUSDT` symbols. That similarity is why people reach for a Binance client and then debug for an afternoon. Field population differs, some endpoints do not exist, and the futures side diverges further. CCXT maintains Bitrue as its own implementation with its own parsers and its own static request/response fixtures, rather than as a Binance derivative.

### One error hierarchy

CCXT maps Bitrue's error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `RateLimitExceeded`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once and it keeps working when you add a second exchange.

### Precision and string math

CCXT loads Bitrue's symbol metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class, so quantities never drift through float rounding into a rejected order:

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

### Seven languages, one API

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.bitrue ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **Python**

```python
import ccxt
exchange = ccxt.bitrue()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **Go**

```go
exchange := ccxt.NewBitrue(nil)
ticker, err := exchange.FetchTicker("BTC/USDT")
```

<!-- tabs:end -->

Bitrue's two demo repositories are one in Java and one in PHP. CCXT gives you the same API in seven languages from one source of truth, so the signing code and the futures routing are the same code everywhere.

### Nothing is hidden — the implicit API

```python
# any raw Bitrue endpoint, camelCased from its path
info = exchange.spot_v1_public_get_exchangeinfo()
```

All 65 endpoints CCXT models are reachable this way, with `X-MBX-APIKEY` signing, rate-limit accounting and error mapping applied. Browse them on the [bitrue implicit API page](/docs/exchanges/bitrue/implicit-api).

## What going direct does better

Honest advantages:

- **The API surface is bigger than CCXT's unified layer.** Bitrue documents spot v1, v2 and v3, USDⓈ-M futures, COIN-M futures and a copy-trading API. CCXT models 65 endpoints across spot and futures; the rest — copy trading in particular — has no unified wrapper.
- **Binance familiarity transfers.** If your team already has a Binance integration, the spot signing scheme, parameter names and symbol format are the same, so a minimal client is genuinely quick to write.
- **Zero dependencies.** For a read-only price feed, `requests.get` on a public endpoint is three lines and no supply chain.
- **You control the failure modes.** No abstraction means no surprise about which field a library chose to populate — you see Bitrue's payload exactly as sent, nulls and all.

If you need Bitrue's copy-trading endpoints, or you only need a public price, going direct is reasonable.

## Migrating from raw Bitrue HTTP to CCXT

| What you are doing | Bitrue API | CCXT |
| --- | --- | --- |
| Symbols | `BTCUSDT` | `'BTC/USDT'` (spot), `'BTC/USDT:USDT'` (swap) |
| Product selection | different host and docs set | `options.defaultType` or the symbol |
| Exchange info | `GET /api/v1/exchangeInfo` | `load_markets()` |
| Ticker | `GET /api/v1/ticker/24hr` | `fetch_ticker()` / `fetch_tickers()` |
| Best bid/ask | book-ticker endpoint | `fetch_bids_asks()` |
| Order book | `GET /api/v1/depth` | `fetch_order_book()` |
| Public trades | `GET /api/v1/trades` | `fetch_trades()` |
| Candles | kline endpoint | `fetch_ohlcv()` |
| New order | `POST /api/v1/order` | `create_order()` |
| Cancel | `DELETE /api/v1/order` | `cancel_order()` |
| Open orders | open-orders endpoint | `fetch_open_orders()` |
| Order history | all-orders endpoint | `fetch_closed_orders()` |
| Balance | account endpoint | `fetch_balance()` |
| My trades | my-trades endpoint | `fetch_my_trades()` |
| Leverage | futures leverage endpoint | `set_leverage()` |
| Transfers | transfer endpoint | `transfer()` / `fetch_transfers()` |
| Signing | `X-MBX-APIKEY` + HMAC-SHA256 by hand | automatic |
| Streams | spot and futures sockets on different hosts | `watch_*` on `ccxt.pro.bitrue` |
| Anything not listed | the endpoint | the same endpoint as an [implicit method](/docs/exchanges/bitrue/implicit-api) |

## FAQ

**Does Bitrue have an official SDK?**
Not one it stands behind. Its API portal lists SDK links with the note that they "are provided by partners and users, and are not officially produced", and that Bitrue makes no commitment to their safety or performance. The two SDK repositories in its GitHub organisation are labelled "Demo for Bitrue Futures Open APIs" (Java) and "Demo for Bitrue Spot Open APIs" (PHP).

**Can I just use a Binance client against Bitrue?**
The spot API is Binance-shaped — `X-MBX-APIKEY`, HMAC-SHA256 over the query string, `BTCUSDT` symbols — so simple calls often work. But several ticker fields come back null or zero on Bitrue where Binance populates them, some endpoints do not exist, and the futures API diverges further. CCXT maintains Bitrue as its own implementation with its own parsers and regression fixtures.

**Does CCXT support Bitrue futures?**
Yes. The `bitrue` class declares spot and swap, with `set_leverage`, `set_margin`, `create_reduce_only_order`, `fetch_transfers` and the rest among its 40 unified capabilities. Select the product with `options.defaultType` or by using a swap symbol such as `'BTC/USDT:USDT'`.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.bitrue` and call `watch*` methods — 6 are implemented: `watch_order_book`, `watch_ticker`, `watch_trades`, `watch_ohlcv`, `watch_orders` and `watch_balance`, routed to the right socket host for spot or futures.

**Does `setSandboxMode` work for Bitrue?**
No. CCXT's `bitrue` class does not declare sandbox URLs, so test with small orders on a low-balance key instead.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bitrue unified API reference](/docs/exchanges/bitrue)
- [bitrue implicit API](/docs/exchanges/bitrue/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
