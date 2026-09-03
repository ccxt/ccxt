<!-- title: CCXT vs the raw BTCTurk API -->
<!-- description: BTCTurk publishes no maintained SDK, so the comparison is CCXT against hand-rolled HTTP: signing, rate limits, three base URLs, precision and error handling. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: BTCTurk's only first-party clients are a C# wrapper last pushed in 2021 and an Objective-C one from 2015, so most integrations are hand-written HTTP. CCXT covers 14 unified capabilities and all 16 endpoints — but implements no WebSocket support for this venue. -->
<!-- weight: 100 -->

# CCXT vs the raw BTCTurk API

[BTCTurk](https://www.btcturk.com) is Turkey's largest TRY-denominated spot exchange, running on BTCTrader's white-label platform. Its API is documented at [docs.btcturk.com](https://docs.btcturk.com/) and in the [BTCTrader/broker-api-docs](https://github.com/BTCTrader/broker-api-docs) repository.

What it does not have is a maintained client library. The `BTCTrader` GitHub organisation publishes `broker-api-csharp` (C#, MIT, 6 stars, last pushed November 2017), `broker-api-csharp-v2` (C#, 5 stars, last pushed September 2021) and `broker-api-objectivec` (7 stars, last pushed August 2015). There is no first-party Python, JavaScript, Go or Java client. The Python packages on PyPI — `btcturk-api` 1.8.1 (April 2021) and `btcturk` 0.0.5 (October 2018) — are community projects by individual authors.

So the real comparison is not CCXT against a vendor SDK. It is **CCXT against the HTTP client you were about to write**.

## TL;DR

- **Write it yourself** if you need two public endpoints, in a language CCXT does not target, or you specifically need BTCTurk's **WebSocket feed** — which CCXT does not implement for this exchange.
- **Pick CCXT** if you want signing, rate limiting, precision handling, pagination and typed errors already written and tested against a live venue, with 14 unified capabilities and all 16 BTCTurk endpoints exposed.
- **Hand-rolling BTCTurk is not hard — it is fiddly.** The signature is HMAC-SHA256 of `apiKey + nonce` over a **base64-decoded** secret, base64-encoded again; the public and private endpoints live on **different API versions**; and there is a third host for chart data. Each of those is a small thing that costs an afternoon the first time.

## At a glance

| | **CCXT** | **Raw BTCTurk REST API** |
| --- | --- | --- |
| Exchanges covered | 104 (BTCTurk is one of them) | BTCTurk only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | whatever you write it in |
| Packages to install | **1** (`ccxt`) | an HTTP client plus your own wrapper |
| First-party client library | n/a | C# (2021, 2017) and Objective-C (2015) only |
| Unified market data + trading API | yes — 14 capabilities on `btcturk` | no — raw JSON payloads |
| WebSockets | **no** — 0 `watch*` methods for `btcturk` | BTCTurk documents a WebSocket feed you would implement yourself |
| Raw endpoint access | yes — 16 endpoints as implicit methods | yes, it is all you have |
| Multiple base URLs | handled — public `v2`, private `v1`, graph host, one client | you juggle three hosts |
| Built-in rate limiter | yes, on by default (`rateLimit` 100 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status + BTCTurk error strings |
| Testnet / sandbox | none — BTCTurk publishes no sandbox | none |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** | `broker-api-docs` 106 stars; `broker-api-csharp` 6 stars, `broker-api-csharp-v2` 5 |
| Licence | MIT | n/a (`broker-api-csharp` is MIT) |
| Support | Discord, Telegram, GitHub — usually same-day | BTCTurk support; the docs repository has 42 open issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `BTCTrader` GitHub organisation's repository listing, the `broker-api-docs` README, and PyPI package metadata.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.btcturk()
ticker = exchange.fetch_ticker('BTC/TRY')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw REST**

```python
import requests

r = requests.get('https://api.btcturk.com/api/v2/ticker',
                 params={'pairSymbol': 'BTCTRY'})
data = r.json()['data'][0]
# 'pair', 'pairNormalized', 'last', 'bid', 'ask', 'high', 'low',
# 'volume', 'average', 'daily', 'dailyPercent', 'denominatorSymbol', ...
print(data['last'], data['volume'])
```

<!-- tabs:end -->

The raw call is short, which is why people write it. What it does not give you is a [unified ticker structure](/docs/manual#ticker-structure): consistent key names, milliseconds instead of seconds, base volume separated from quote volume, and the same shape on the next exchange.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.btcturk({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/TRY', 'limit', 'buy', 0.001, 3000000)
print(order['id'], order['status'])
```

#### **Raw REST**

```python
import base64, hashlib, hmac, json, time, requests

nonce = str(int(time.time() * 1000))
secret = base64.b64decode(API_SECRET)
signature = base64.b64encode(
    hmac.new(secret, (API_KEY + nonce).encode(), hashlib.sha256).digest()
).decode()

r = requests.post(
    'https://api.btcturk.com/api/v1/order',
    headers={'X-PCK': API_KEY, 'X-Stamp': nonce,
             'X-Signature': signature, 'Content-Type': 'application/json'},
    data=json.dumps({'pairSymbol': 'BTCTRY', 'orderType': 'buy',
                     'orderMethod': 'limit', 'price': '3000000',
                     'quantity': '0.001'}))
print(r.json())
```

<!-- tabs:end -->

Three details in that snippet are easy to get wrong and produce the same unhelpful 401: the secret is **base64-decoded before** it is used as the HMAC key, the signed payload is `apiKey + nonce` and nothing else, and the nonce must be milliseconds synchronised against BTCTurk's server clock. CCXT does all three, and does the same for the other 103 exchanges without you learning each one's variant.

Note also that the order endpoint is on `/api/v1` while the ticker is on `/api/v2`. CCXT models public, private and graph as three separate base URLs behind one client, so `fetch_ticker` and `create_order` are the same object.

## Where the differences actually bite

### Rate limits you do not have to model

BTCTurk's documentation is explicit: *"/api/v2/ticker requests are limited to 10 requests per 100 miliseconds. Other requests are limited to 1 request per 100 miliseconds. If you make more than 50 consequent unauthorized requests, your IP address will be blocked."*

CCXT sets `rateLimit = 100` ms for `btcturk` and ships a token-bucket throttler that is on by default, with per-endpoint weights (the ticker endpoint is weighted at 0.1 of a normal call, which is exactly the 10× allowance above). You write a loop; the library paces it. Hand-rolled, pacing plus back-off is your code, and the failure mode is an IP block rather than a clean error.

### One error hierarchy

CCXT maps BTCTurk's responses onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. Matching on error strings in a Turkish-market API and hoping the wording never changes is the alternative.

### Precision, rounding and string math

`load_markets()` reads BTCTurk's `server/exchangeinfo` and exposes tick size, step size and minimum notional through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class. TRY prices run to seven figures, which is exactly where float rounding starts producing rejected orders.

```python
amount = exchange.amount_to_precision('BTC/TRY', 0.0012345678)
price = exchange.price_to_precision('BTC/TRY', 3123456.789)
```

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and structures. BTCTurk's only first-party clients are C# and Objective-C, so in every other language you are starting from zero.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.btcturk()
ticker = exchange.fetch_ticker('BTC/TRY')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.btcturk ();
const ticker = await exchange.fetchTicker ('BTC/TRY');
```

#### **C#**

```csharp
var exchange = new ccxt.btcturk();
var ticker = await exchange.FetchTicker("BTC/TRY");
```

#### **Go**

```go
exchange := ccxt.NewBtcturk(nil)
ticker, err := exchange.FetchTicker("BTC/TRY")
```

<!-- tabs:end -->

### Nothing is hidden — the implicit API

BTCTurk's API is small: **16 endpoints**, and CCXT generates every one of them as a callable implicit method with signing, rate limiting and error mapping applied.

```python
# any raw BTCTurk endpoint, camelCased from its path
response = exchange.public_get_server_exchangeinfo()
```

Browse them on the [btcturk implicit API page](/docs/exchanges/btcturk/implicit-api).

### Portability

TRY liquidity is one leg of a trade, not the whole of it. In CCXT the exchange id is a variable, so adding an offshore venue for the other leg is a configuration change rather than a second integration:

```python
for exchange_id in ['btcturk', 'binance', 'okx']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT')['last'])
```

## What hand-rolling the raw API does better

An honest list, because these are real:

- **BTCTurk's WebSocket feed.** CCXT implements **zero** `watch*` methods for `btcturk`. BTCTurk documents a WebSocket feed with its own authentication message (type `114`, carrying public key, timestamp, nonce and an HMAC-SHA256 signature). If you want live socket data from this venue, you are writing that client — CCXT will not do it for you.
- **A far smaller dependency.** Two `requests` calls against `/api/v2/ticker` are a few lines and no third-party library. For a dashboard that reads one price, CCXT is more than you need.
- **Field-for-field fidelity with the docs.** `pairSymbol`, `orderMethod`, `dailyPercent` — when you are reading BTCTurk's reference while debugging, raw JSON has no translation layer between you and it. CCXT's unified names are a deliberate abstraction and one more hop.
- **Endpoints CCXT does not model as unified methods.** BTCTurk's fiat and crypto transaction endpoints and the `graph-api` chart host are reachable from CCXT only as implicit methods, returning raw payloads. If those are the bulk of your integration, the unified layer is buying you less.

If BTCTurk is your only venue, you need streaming, and you are comfortable owning the signing code, writing it directly is a defensible choice.

## Migrating from a raw BTCTurk integration to CCXT

| What you are doing | Raw BTCTurk API | CCXT |
| --- | --- | --- |
| Symbols | `pairSymbol: 'BTCTRY'` | `'BTC/TRY'` |
| Client | your own signed `requests` wrapper | `ccxt.btcturk({'apiKey': ..., 'secret': ...})` |
| Exchange info | `GET /api/v2/server/exchangeinfo` | `load_markets()` |
| Ticker | `GET /api/v2/ticker` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET /api/v2/orderbook` | `fetch_order_book()` |
| Trades | `GET /api/v2/trades` | `fetch_trades()` |
| Candles | `GET /api/v2/ohlc`, or `graph-api.btcturk.com/v1/klines/history` | `fetch_ohlcv()` |
| New order | `POST /api/v1/order` | `create_order()` |
| Cancel order | `DELETE /api/v1/order` | `cancel_order()` |
| Open orders | `GET /api/v1/openOrders` | `fetch_open_orders()` |
| Order history | `GET /api/v1/allOrders` | `fetch_orders()` |
| Balance | `GET /api/v1/users/balances` | `fetch_balance()` |
| My trades | `GET /api/v1/users/transactions/trade` | `fetch_my_trades()` |
| Streams | BTCTurk WebSocket feed, hand-written | **not available in CCXT for `btcturk`** |
| Anything not listed | native call | the same endpoint as an [implicit method](/docs/exchanges/btcturk/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [btcturk unified API reference](/docs/exchanges/btcturk).

## FAQ

**Is there an official BTCTurk Python SDK?**
No. BTCTrader's only first-party clients are C# (`broker-api-csharp`, last pushed November 2017, and `broker-api-csharp-v2`, September 2021) and Objective-C (2015). The `btcturk-api` and `btcturk` packages on PyPI are community projects, last released in 2021 and 2018. CCXT's Python support for BTCTurk is a normal `pip install ccxt`.

**Does CCXT support BTCTurk WebSockets?**
No. `btcturk` has zero `watch*` methods, so there is no `ccxt.pro.btcturk`. REST is fully covered — 14 unified capabilities and all 16 endpoints — but BTCTurk's documented WebSocket feed is not implemented.

**How does CCXT sign BTCTurk requests?**
It sends `X-PCK` (your API key), `X-Stamp` (a millisecond nonce) and `X-Signature`, where the signature is HMAC-SHA256 of `apiKey + nonce` using the base64-decoded secret as the key, base64-encoded. You never write that code, and you never have to notice that the secret is decoded first.

**Does BTCTurk have a testnet?**
No sandbox environment is published, so `set_sandbox_mode(True)` has nothing to point at for `btcturk`. Test against CCXT's offline static fixtures and small live orders.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support for the 76 exchanges that have it.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [btcturk unified API reference](/docs/exchanges/btcturk)
- [btcturk implicit API](/docs/exchanges/btcturk/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
