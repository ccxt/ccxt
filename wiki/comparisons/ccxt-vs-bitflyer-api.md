<!-- title: CCXT vs the bitFlyer API -->
<!-- description: bitFlyer publishes no official client library. What CCXT's bitflyer class adds over hand-rolled HTTP: unified symbols, signing, rate limits and typed errors. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: bitFlyer's Lightning documentation lists no official client libraries, so the real comparison is CCXT against hand-written HTTP. CCXT covers 16 capabilities and 35 endpoints — but has no WebSocket support for bitFlyer. -->
<!-- weight: 100 -->

# CCXT vs the bitFlyer API

bitFlyer's [Lightning API documentation](https://lightning.bitflyer.com/docs?lang=en) is thorough — base endpoint, signature scheme, product codes and rate limits are all spelled out — but it lists **no official client libraries**. So the honest comparison here is not CCXT against a vendor SDK. It is CCXT against the HTTP client you would otherwise write yourself.

The question that decides between them: **how much of that plumbing do you want to own?**

## TL;DR

- **Write it yourself** if you need one or two endpoints, want zero dependencies, or need bitFlyer's Realtime API — which CCXT does not currently wrap.
- **Pick CCXT** if you want signing, per-request pacing, unified symbols for `FX_BTC_JPY` and the expiring futures, typed errors and precision handling that already work, in eight languages.
- **Be aware of the gap.** CCXT's `bitflyer` class is REST-only: it has **no** `watch*` methods, so live streaming from bitFlyer is not something CCXT does today.

## At a glance

| | **CCXT** | **Raw bitFlyer Lightning API** |
| --- | --- | --- |
| Exchanges covered | 104 (bitFlyer is one of them) | bitFlyer only |
| Official client library | n/a | none listed in bitFlyer's documentation |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | whatever you write |
| Unified market data + trading API | yes — 16 capabilities, same names on every exchange | raw JSON from `/v1/...` |
| Symbols | `'BTC/JPY'`, `'BTC/JPY:JPY'`, `'BTC/JPY:JPY-YYMMDD'` | product codes: `BTC_JPY`, `FX_BTC_JPY`, `BTCJPY11MAR2022` |
| Regional market lists | handled — `getmarkets`, `getmarkets/usa`, `getmarkets/eu` | you pick the endpoint per region |
| Request signing | built in — `ACCESS-KEY` / `ACCESS-TIMESTAMP` / `ACCESS-SIGN`, HMAC-SHA256 | your code |
| Raw endpoint access | yes — 35 endpoints as implicit methods | yes, by definition |
| Built-in rate limiter | yes, on by default (`rateLimit` 1000 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status + bitFlyer error payloads |
| WebSockets | **no** — `bitflyer` has no `watch*` methods | yes — Socket.IO 2.0 and JSON-RPC 2.0 over WebSocket |
| Testnet / sandbox | not available for `bitflyer` | not offered |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month | n/a |
| Licence | MIT | n/a |
| Support | Discord, Telegram, GitHub issues — usually same-day | bitFlyer support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}} and bitFlyer's published Lightning API and Realtime API documentation.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitflyer()
ticker = exchange.fetch_ticker('BTC/JPY')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw HTTP**

```python
import requests

r = requests.get('https://api.bitflyer.com/v1/getticker',
                 params={'product_code': 'BTC_JPY'})
data = r.json()
print(data['ltp'], data['volume_by_product'])
```

<!-- tabs:end -->

Two things the raw version leaves to you. The last traded price is `ltp`, not `last`. And there are two volume fields — `volume` and `volume_by_product` — where only the second is the base-asset volume for that product; CCXT maps that one to `baseVolume` so the number means the same thing here as on Binance or Kraken.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitflyer({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/JPY', 'limit', 'buy', 0.001, 12000000)
print(order['id'], order['status'])
```

#### **Raw HTTP**

```python
import hashlib, hmac, json, time, requests

timestamp = str(int(time.time()))
method, path = 'POST', '/v1/me/sendchildorder'
body = json.dumps({'product_code': 'BTC_JPY', 'child_order_type': 'LIMIT',
                   'side': 'BUY', 'price': 12000000, 'size': 0.001})
sign = hmac.new(b'YOUR_SECRET',
                (timestamp + method + path + body).encode(),
                hashlib.sha256).hexdigest()

r = requests.post('https://api.bitflyer.com' + path, data=body, headers={
    'ACCESS-KEY': 'YOUR_KEY',
    'ACCESS-TIMESTAMP': timestamp,
    'ACCESS-SIGN': sign,
    'Content-Type': 'application/json',
})
print(r.json())
```

<!-- tabs:end -->

That is the whole signing scheme: HMAC-SHA256 over the timestamp, HTTP method, path and body concatenated. It is not hard — it is just something you now own in every language your stack uses, along with the part where the body you sign must be byte-identical to the body you send.

## Where the differences actually bite

### Product codes are not symbols

bitFlyer's product codes carry the product type in the string. `BTC_JPY` is spot. `FX_BTC_JPY` is the perpetual. `BTCJPY11MAR2022` is an expiring future, and it may also carry an alias like `BTCJPY_MAT1WK` meaning "the contract maturing in one week", which points at a different contract every week.

CCXT reads bitFlyer's `market_type` field and the alias, parses the expiry out of the code, and produces stable unified symbols:

| bitFlyer product code | `market_type` | CCXT symbol |
| --- | --- | --- |
| `BTC_JPY` | `Spot` | `BTC/JPY` |
| `ETH_BTC` | `Spot` | `ETH/BTC` |
| `FX_BTC_JPY` | `FX` | `BTC/JPY:JPY` |
| `BTCJPY11MAR2022` | `Futures` | `BTC/JPY:JPY-220311` |

Code that subscribes to "the weekly future" no longer has to re-resolve an alias by hand every Friday.

### Three regional market lists

bitFlyer runs Japanese, US and EU entities, and the market list differs: `getmarkets`, `getmarkets/usa` and `getmarkets/eu` are three endpoints. CCXT's `bitflyer` class knows about all three, so `load_markets()` returns the right set and every later call uses ids from it.

### Rate limits you do not have to model

bitFlyer publishes several limits at once: roughly 500 queries per 5 minutes per IP for the public API, 500 per 5 minutes for private API calls, a tighter 300 per 5 minutes on the order-placement and cancellation endpoints, and a separate cap of 100 placements per minute for orders of 0.1 or smaller. Modelling four overlapping budgets is exactly the kind of code that gets written once, badly, and then quietly throttles you in production.

CCXT ships a token-bucket throttler that is **on by default** (`enableRateLimit = true`, `rateLimit = 1000` ms for bitFlyer) and maps rate-limit responses onto `RateLimitExceeded`.

### Precision and string math

bitFlyer rejects orders that violate a product's size or price step. CCXT loads the market metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so a quantity never drifts through float rounding into a rejection:

```python
amount = exchange.amount_to_precision('BTC/JPY', 0.0012345678)
price = exchange.price_to_precision('BTC/JPY', 12345678.9)
```

### One error hierarchy

CCXT maps bitFlyer's error payloads onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `RateLimitExceeded`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all under `BaseError`. Raw HTTP gives you a status code and a JSON body whose shape you match on with string comparisons.

### Derivatives and collateral are covered

Among the 16 capabilities CCXT implements for bitFlyer: `fetch_positions`, `fetch_funding_rate`, `fetch_trading_fee`, `fetch_my_trades`, `fetch_orders`, `fetch_deposits` and `fetch_withdrawals`. The FX and futures products have their own collateral endpoints on bitFlyer's side; CCXT's unified `fetch_balance` and `fetch_positions` cover the common ground with the same signatures they have on every other derivatives venue.

### Eight languages, one API

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.bitflyer ();
const ticker = await exchange.fetchTicker ('BTC/JPY');
```

#### **Python**

```python
import ccxt
exchange = ccxt.bitflyer()
ticker = exchange.fetch_ticker('BTC/JPY')
```

#### **Go**

```go
exchange := ccxt.NewBitflyer(nil)
ticker, err := exchange.FetchTicker("BTC/JPY")
```

<!-- tabs:end -->

A hand-rolled bitFlyer client is written once per language. CCXT is written once and transpiled to seven, so the signing code and the alias parsing are the same code everywhere.

### Nothing is hidden — the implicit API

```python
# any raw bitFlyer endpoint, camelCased from its path
health = exchange.public_get_gethealth()
```

All 35 endpoints CCXT models are reachable this way, with `ACCESS-KEY` / `ACCESS-TIMESTAMP` / `ACCESS-SIGN` signing, rate-limit accounting and error mapping applied. Browse them on the [bitflyer implicit API page](/docs/exchanges/bitflyer/implicit-api).

## What the raw bitFlyer API does better

Honest, and the first one matters:

- **The Realtime API.** bitFlyer publishes a streaming API supporting Socket.IO 2.0 and JSON-RPC 2.0 over WebSocket, with public and private channels. CCXT's `bitflyer` class has **no** `watch*` methods, so if you need live ticks, executions or board updates from bitFlyer, going direct is the only option of the two.
- **Endpoints CCXT does not model as unified methods.** Chat, board state, collateral history and the exchange-health endpoints are all in the Lightning API. CCXT reaches them through implicit methods, but there is no unified wrapper with a stable cross-exchange shape.
- **Zero dependencies.** The signature is four concatenated strings and an HMAC. If your program calls two endpoints, a hand-written client is a few dozen lines and no supply chain.
- **The documentation is the contract.** Reading bitFlyer's reference and writing the request yourself means no translation layer between what the docs say and what your process sends — useful when you are debugging a rejected order.

If you need bitFlyer streaming, or you only need a couple of endpoints, going direct is the right call.

## Migrating from raw bitFlyer HTTP to CCXT

| What you are doing | bitFlyer Lightning API | CCXT |
| --- | --- | --- |
| Symbols | `product_code=BTC_JPY` | `'BTC/JPY'` |
| Perpetual | `product_code=FX_BTC_JPY` | `'BTC/JPY:JPY'` |
| Markets | `GET /v1/getmarkets` | `load_markets()` |
| Ticker | `GET /v1/getticker` | `fetch_ticker()` |
| Order book | `GET /v1/getboard` | `fetch_order_book()` |
| Public trades | `GET /v1/getexecutions` | `fetch_trades()` |
| Funding rate | `GET /v1/getfundingrate` | `fetch_funding_rate()` |
| New order | `POST /v1/me/sendchildorder` | `create_order()` |
| Cancel order | `POST /v1/me/cancelchildorder` | `cancel_order()` |
| Open orders | `GET /v1/me/getchildorders` | `fetch_orders()` |
| Balance | `GET /v1/me/getbalance` | `fetch_balance()` |
| Positions | `GET /v1/me/getpositions` | `fetch_positions()` |
| My trades | `GET /v1/me/getexecutions` | `fetch_my_trades()` |
| Trading fee | `GET /v1/me/gettradingcommission` | `fetch_trading_fee()` |
| Signing | `ACCESS-KEY` / `ACCESS-TIMESTAMP` / `ACCESS-SIGN` by hand | automatic |
| Streams | Realtime API | not available in CCXT for `bitflyer` |
| Anything not listed | the endpoint | the same endpoint as an [implicit method](/docs/exchanges/bitflyer/implicit-api) |

## FAQ

**Does bitFlyer have an official SDK?**
Its Lightning API documentation does not list one. Several third-party wrappers exist on GitHub in various languages, but they are community projects rather than exchange-published clients — which is why this page compares CCXT with the raw API instead.

**Does CCXT support bitFlyer WebSockets?**
No. CCXT's `bitflyer` class is REST-only and has no `watch*` methods. CCXT Pro covers 76 of the 104 supported exchanges; bitFlyer is not currently one of them. bitFlyer's own Realtime API supports Socket.IO 2.0 and JSON-RPC 2.0 over WebSocket if you need streaming.

**How does CCXT name bitFlyer's FX and futures products?**
`FX_BTC_JPY` becomes the unified swap symbol `'BTC/JPY:JPY'`, and an expiring contract such as `BTCJPY11MAR2022` becomes `'BTC/JPY:JPY-220311'`. CCXT parses the expiry from the product code — and from the `_MAT1WK`-style alias when one is present — so you do not track it by hand.

**Does `setSandboxMode` work for bitFlyer?**
No. CCXT's `bitflyer` class does not declare sandbox URLs, so test with the smallest permitted order size on a low-balance key instead.

**Can I still call bitFlyer-specific endpoints from CCXT?**
Yes — all 35 endpoints CCXT models are available as [implicit methods](/docs/exchanges/bitflyer/implicit-api), with signing and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bitflyer unified API reference](/docs/exchanges/bitflyer)
- [bitflyer implicit API](/docs/exchanges/bitflyer/implicit-api) — every raw endpoint
- [Supported exchanges](/docs/exchange-markets)
- [More comparisons](/docs/comparisons)
