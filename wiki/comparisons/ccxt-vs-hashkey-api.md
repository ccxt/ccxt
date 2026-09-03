<!-- title: CCXT vs the raw HashKey Global REST API -->
<!-- description: HashKey Global publishes API documentation but no client SDK. What CCXT adds over raw HTTP — signing, rate limits, listen-key refresh, order books and precision. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: HashKey Global ships documentation, not an SDK, so the comparison is CCXT against raw HTTP. HashKey is a certified CCXT exchange with 59 unified capabilities, 7 streaming methods and a working sandbox. -->
<!-- weight: 100 -->

# CCXT vs the raw HashKey Global REST API

HashKey Global documents a REST API and a WebSocket API covering spot and perpetual futures, with a SIM sandbox that mirrors production. What it does not publish is a client library — HashKey's API reference explains the endpoints and shows `curl` and `openssl` examples for signing, and stops there. There is no HashKey-maintained SDK in any language.

So the comparison is not CCXT against a vendor SDK. It is **CCXT against the integration you would write yourself**, and the useful question is how much of that integration you actually want to own.

## TL;DR

- **Call the raw API** if you need one or two public endpoints in one language and would rather not take a dependency.
- **Pick CCXT** if you need signed endpoints, streaming, or more than a handful of calls. HashKey carries CCXT's **certified** badge, which means the implementation is supervised and quality-assured by the CCXT dev team and gets priority support.
- **Choosing CCXT does not hide HashKey's API.** All 67 HashKey endpoints are generated as [implicit methods](/docs/exchanges/hashkey/implicit-api), signed and rate-limited like any unified call.

## At a glance

| | **CCXT** | **The raw HashKey Global API** |
| --- | --- | --- |
| Exchanges covered | 104 (HashKey is one of them) | HashKey Global only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | any language with an HTTP client, all of it your code |
| Official client library | n/a | **none** — the documentation shows `curl` and `openssl` signing examples |
| Products in one client | spot and perpetual futures, one `ccxt.hashkey` instance | parallel `spot/*` and `futures/*` endpoint families |
| Unified market data + trading API | yes — 59 unified capabilities, 31 `fetch*` methods | no — HashKey's own request and response shapes |
| WebSockets | yes — 7 `watch*` methods, same structures as `fetch*` | raw socket, plus a listen-key you create and refresh yourself |
| Raw endpoint access | yes — 67 endpoints as implicit methods | yes, it is all you have |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 100 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus HashKey error codes |
| Testnet / sandbox | `exchange.set_sandbox_mode(True)` → `api-glb.sim.hashkeydev.com` | a different base URL you swap yourself |
| Certified | yes | n/a |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month | n/a — no package to count |
| Licence | MIT | n/a |
| Support | Discord, Telegram, GitHub issues — usually same-day | HashKey support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}} and HashKey Global's published API reference.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.hashkey()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw HashKey API**

```python
import requests

url = 'https://api-glb.hashkey.com/quote/v1/ticker/24hr'
response = requests.get(url, params={'symbol': 'BTCUSDT'})
response.raise_for_status()
print(response.json())
```

<!-- tabs:end -->

For one public endpoint the raw call is shorter, and that is fair. The gap opens at the second endpoint, and it opens wide at the first signed one.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.hashkey({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **Raw HashKey API**

```python
import hashlib
import hmac
import time
import requests
from urllib.parse import urlencode

api_key = '...'
secret = '...'

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
query = urlencode(params)
signature = hmac.new(secret.encode(), query.encode(), hashlib.sha256).hexdigest()

response = requests.post(
    'https://api-glb.hashkey.com/api/v1/spot/order',
    params={**params, 'signature': signature},
    headers={'X-HK-APIKEY': api_key},
)
response.raise_for_status()
print(response.json())
```

<!-- tabs:end -->

HashKey signs the concatenation of the query string and the request body with HMAC-SHA256, keyed on your secret, with a millisecond `timestamp` and a `recvWindow` that defaults to 5000 ms. That is thirty lines you now maintain, plus clock-skew handling, plus the same thirty lines again for the futures endpoint family. In CCXT it is one `create_order` call, and the futures order is the same call with a `'BTC/USDT:USDT'` symbol.

## Where the differences actually bite

### Spot and futures are two endpoint families, one CCXT class

HashKey mirrors its shapes across `api/v1/spot/*` and `api/v1/futures/*`: separate order, open-orders, cancel, batch, trade-history and balance endpoints for each, plus futures-only endpoints for leverage, margin type, position margin and risk limits. Written by hand that is two parsers.

CCXT's `ccxt.hashkey` covers both with 59 unified capabilities and 31 `fetch*` methods. The unified symbol picks the family: `'BTC/USDT'` routes to spot, `'BTC/USDT:USDT'` to the perpetual, and `set_leverage`, `fetch_positions` and `set_margin_mode` are unified methods rather than futures-specific paths you look up.

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names, arguments and return structures. A raw integration is written once per language, by you.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.hashkey()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.hashkey ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **PHP**

```php
$exchange = new \ccxt\hashkey();
$ticker = $exchange->fetch_ticker('BTC/USDT');
```

#### **C#**

```csharp
var exchange = new ccxt.hashkey();
var ticker = await exchange.FetchTicker("BTC/USDT");
```

#### **Go**

```go
exchange := ccxt.NewHashkey(nil)
ticker, err := exchange.FetchTicker("BTC/USDT")
```

<!-- tabs:end -->

### WebSockets, and the listen key nobody budgets for

CCXT Pro — bundled in the same `ccxt` package, no separate purchase — gives HashKey 7 streaming methods: `watchOrderBook`, `watchTicker`, `watchTrades`, `watchOHLCV`, `watchOrders`, `watchMyTrades` and `watchBalance`.

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.hashkey()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

Private streams on HashKey are gated by a **listen key**: you `POST /api/v1/userDataStream` to create one, embed it in the socket URL, `PUT` it periodically to keep it alive and `DELETE` it when done. Forget the refresh and your order stream dies silently after the key expires. CCXT creates the key, builds the URL and refreshes it on a timer for you.

The same applies to the public book: CCXT fetches the REST snapshot, buffers the deltas that arrive while it is in flight, replays them in order, detects sequence gaps, reconnects and resubscribes, and keeps the cache bounded. Every one of those is a place a hand-rolled book drifts rather than fails.

### Rate limits you do not have to model

HashKey documents roughly 5 requests per second on query endpoints and 20 per second on order endpoints, returns `429` when you exceed them, and escalates to an IP block with `418` if you keep going. CCXT encodes the relative cost of each endpoint in its `api` block — `api/v1/spot/order` costs 1, `api/v1/spot/batchOrders` costs 5 — and ships a token-bucket throttler that is on by default (`enableRateLimit = true`, `rateLimit = 100` ms). You call methods in a loop; the library paces them, and a `429` is raised as `RateLimitExceeded` rather than a bare HTTP error.

### Precision, rounding and string math

HashKey rejects orders that violate tick size, lot size or minimum notional. CCXT loads that metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities do not drift through float rounding.

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

### One error hierarchy

CCXT maps HashKey's error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all under `BaseError`. `except ccxt.InsufficientFunds` keeps working when you add a second exchange.

### Sandbox without a second code path

```python
exchange = ccxt.hashkey({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)   # swaps in api-glb.sim.hashkeydev.com
```

One flag swaps the REST and WebSocket hosts to HashKey's SIM environment. HashKey recommends testing there first, and CCXT's [live test runner](/docs/manual) drives the same flag with `--sandbox`.

### Nothing is hidden — the implicit API

Alongside the 59 unified capabilities, all 67 endpoints in CCXT's HashKey `api` block are generated as callable implicit methods, camelCased from their paths:

```python
positions = exchange.private_get_api_v1_futures_positions()
vip = exchange.private_get_api_v1_account_vip_info()
```

Signing, timestamping, rate-limit accounting and error mapping still apply. Browse them on the [HashKey implicit API page](/docs/exchanges/hashkey/implicit-api).

## What the raw HashKey API does better

An honest list, because these are real:

- **Zero dependencies.** If your integration is "poll one public ticker every minute", twelve lines and `requests` is genuinely the right answer, and it will never break because a library changed.
- **Literal fidelity to the documentation.** The raw payload is the payload in HashKey's reference. Every field is there, in HashKey's own names, with nothing normalised away — one fewer hop when you are debugging against the vendor docs.
- **Endpoints and flows CCXT does not unify.** Sub-account order queries, address authorisation, asset transfers between account types, VIP fee tiers and the futures risk-limit endpoints are HashKey-specific. CCXT reaches them as raw implicit calls, but they are not unified methods with typed structures.
- **You control the failure modes.** Retry, timeout and backoff policy are exactly what you wrote, with no library behaviour to reason about.

If HashKey is your only venue and your integration is small, static and public-data-only, the raw API is a perfectly reasonable choice.

## Migrating from the raw HashKey API to CCXT

| What you are doing | HashKey REST | CCXT |
| --- | --- | --- |
| Symbols | `BTCUSDT` | `'BTC/USDT'` (spot), `'BTC/USDT:USDT'` (perpetual) |
| Product selection | `api/v1/spot/*` vs `api/v1/futures/*` | the unified symbol, or `options.defaultType` |
| Symbol list | `/api/v1/exchangeInfo` | `load_markets()` |
| Ticker | `/quote/v1/ticker/24hr` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `/quote/v1/depth` | `fetch_order_book()` |
| Candles | `/quote/v1/klines` | `fetch_ohlcv()` |
| Public trades | `/quote/v1/trades` | `fetch_trades()` |
| New order | `POST /api/v1/spot/order` | `create_order()` |
| Batch orders | `POST /api/v1/spot/batchOrders` | `create_orders()` |
| Cancel order | `DELETE /api/v1/spot/order` | `cancel_order()` |
| Cancel everything | `DELETE /api/v1/spot/openOrders` | `cancel_all_orders()` |
| Open orders | `GET /api/v1/spot/openOrders` | `fetch_open_orders()` |
| My trades | `/api/v1/account/trades` | `fetch_my_trades()` |
| Balance | `/api/v1/account` | `fetch_balance()` |
| Positions | `/api/v1/futures/positions` | `fetch_positions()` |
| Leverage | `POST /api/v1/futures/leverage` | `set_leverage()` |
| Funding rate | `/api/v1/futures/fundingRate` | `fetch_funding_rate()` |
| Private streams | create and refresh a listen key | `watch_*` on `ccxt.pro.hashkey` |
| Anything not listed | the raw endpoint | the same endpoint as an [implicit method](/docs/exchanges/hashkey/implicit-api) |

## FAQ

**Does HashKey Global have an official SDK?**
Not as of this writing. HashKey's API reference documents the REST and WebSocket endpoints and shows `curl` and `openssl` examples for HMAC-SHA256 signing, but publishes no client library. CCXT is the maintained multi-language option, and HashKey is a certified CCXT exchange.

**Does CCXT support HashKey perpetual futures, or only spot?**
Both, from one `ccxt.hashkey` instance. Pass `'BTC/USDT'` for spot and `'BTC/USDT:USDT'` for the perpetual; leverage, margin mode, positions and funding rates are unified methods.

**How do I use the HashKey SIM sandbox with CCXT?**
Call `exchange.set_sandbox_mode(True)`, which swaps the REST host to `api-glb.sim.hashkeydev.com` and the WebSocket host to the matching SIM stream. Get sandbox credentials from HashKey's SIM site.

**How does HashKey authentication work, and does CCXT handle it?**
HashKey signs the concatenation of query string and request body with HMAC-SHA256 keyed on your secret, passes the key in an `X-HK-APIKEY` header, and requires a millisecond `timestamp` with a `recvWindow` (default 5000 ms). CCXT does all of it, including the timestamp, on every private call.

**Can I still call HashKey-specific endpoints through CCXT?**
Yes — all 67 endpoints in CCXT's HashKey definition are generated as [implicit methods](/docs/exchanges/hashkey/implicit-api), with signing, rate limiting and error mapping applied.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.hashkey` and call `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [hashkey unified API reference](/docs/exchanges/hashkey)
- [hashkey implicit API](/docs/exchanges/hashkey/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
