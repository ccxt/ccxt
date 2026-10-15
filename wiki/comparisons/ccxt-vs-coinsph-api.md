<!-- title: CCXT vs the Coins.ph API and its official connectors -->
<!-- description: Coins.ph publishes connectors in Python, Java, JavaScript and Go. Compared with CCXT on distribution, structures, WebSockets and rate limits. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Coins.ph maintains four official connectors, one per language, with uneven distribution and coverage. CCXT ships 30 unified capabilities and all 78 raw endpoints in eight languages — but has no WebSocket support for this venue. -->
<!-- weight: 100 -->

# CCXT vs the Coins.ph API and its official connectors

[Coins.ph](https://coins.ph/) runs a Philippine exchange whose REST API is documented at [docs.coins.ph/rest-api](https://docs.coins.ph/rest-api/). That documentation lists four official connectors — [Python](https://github.com/coins-docs/coins-connector-python), [Java](https://github.com/coins-docs/coins-java-api), [JavaScript](https://github.com/coins-docs/coins-js-api) and [Go](https://github.com/coins-docs/coins-go-api) — plus a [Postman collection](https://github.com/coins-docs/coins-api-postman).

They are real, and they are separate codebases with different maturity: the JavaScript one is on npm as `coins-js-api`, the Python one is installed by cloning the repository, and each covers a different slice of the product.

The question that decides between them and [CCXT](/docs/manual) is whether you are integrating **Coins.ph the product** — which includes Convert, Fiat, P2P transfer and invoice payment — or **Coins.ph the exchange**, alongside other exchanges.

## TL;DR

- **Use the official connectors** if you need Coins.ph's non-trading product lines (Convert, Fiat, P2P transfer, invoice payment), or if you want streaming and are working in Python.
- **Pick CCXT** if you want spot trading and market data behind an API shared with 103 other venues, installable from one package in eight languages, with unified structures and a built-in rate limiter.
- **Know the gap up front:** CCXT has **no WebSocket support for Coins.ph** — zero `watch*` methods. Coins.ph documents WebSocket streams and the official Python connector wraps them. If you need live streams here, that is the connector's job, not CCXT's.

## At a glance

| | **CCXT** | **Official Coins.ph connectors** |
| --- | --- | --- |
| Exchanges covered | 104 (Coins.ph is one of them) | Coins.ph only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | Python, Java, JavaScript/TypeScript, Go — four separate codebases |
| Packages to install | 1 (`ccxt`) | one per language; `coins-js-api` is on npm, the Python connector is installed by cloning the repo |
| Unified market data + trading API | yes — 30 unified capabilities, 20 `fetch*` methods | no — Coins.ph's own request/response shapes |
| Product lines covered | spot trading, market data, deposits and withdrawals | spot trading, wallet, convert, fiat, P2P transfer, invoice payment |
| WebSockets | **no** — CCXT implements no `watch*` methods for this venue | documented streams; wrapped by the Python connector |
| Raw endpoint access | yes — 78 endpoints as implicit methods | the connector's own method surface |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 50ms) | you respect 120 req/min per IP and 180 req/min per UID yourself |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus Coins.ph error codes |
| Testnet / sandbox | not available for Coins.ph | none documented |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `coins-connector-python` 4 stars; `coins-java-api` 3 stars; `coins-js-api` 1 star, 17 npm installs/month; `coins-go-api` 0 stars |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues on each connector |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the Coins.ph REST API documentation, the four `coins-docs` connector repositories, and npm install counts.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.coinsph()
ticker = exchange.fetch_ticker('BTC/PHP')
print(ticker['last'], ticker['baseVolume'])
```

#### **coins-connector-python**

```python
# installed by cloning the repository, not from PyPI
from coins.spot import Client

client = Client()
response = client.time()
print(response)
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) keyed by a portable symbol. The connector returns the payload Coins.ph sends, addressed by the venue's market id (`BTCPHP`), which is fine until the same code has to read a price from a second exchange.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.coinsph({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/PHP', 'limit', 'buy', 0.001, 3500000)
print(order['id'], order['status'])
```

#### **coins-js-api**

```javascript
const client = new CoinsApiClient(config);

const order = await client.spotTrading().newOrder({
  symbol: 'BTCUSDT',
  side: 'BUY',
  type: 'LIMIT',
  quantity: '0.001',
  price: '50000',
});
```

<!-- tabs:end -->

Both are readable. The difference shows when you add a second venue: `create_order('BTC/PHP', 'limit', 'buy', 0.001, 3500000)` is the same call on Binance, Kraken and 101 others, while `newOrder({symbol, side, type, quantity, price})` is Coins.ph's shape and stops at Coins.ph.

## Where the differences actually bite

### Rate limits you do not have to model

Coins.ph enforces two independent budgets over all `/openapi/*` endpoints: **120 requests per minute per IP** and **180 requests per minute per UID**. Individual endpoints carry weights, so heavy calls consume more than one unit. Exceeding a limit returns HTTP 429 with a `Retry-After` header, and repeated violations escalate to HTTP 418 IP bans lasting from two minutes to three days.

CCXT encodes those per-endpoint weights in the exchange definition — including the conditional ones, such as the 24-hour ticker endpoint costing 1 for a single symbol and 40 when called with no symbol at all — and ships a throttler that is on by default (`enableRateLimit = true`, `rateLimit = 50`ms). You call methods in a loop; the library paces them.

### Signing, timestamps and clock skew

Signed endpoints take an `X-COINS-APIKEY` header and an HMAC-SHA256 signature over the full query string, plus a millisecond `timestamp` and an optional `recvWindow` (default 5000ms, maximum 60000ms). The server rejects a request whose timestamp falls outside that window, which turns a drifting clock into an intermittent authentication failure. CCXT computes the signature, manages the timestamp and exposes `options.recvWindow` if you need to widen it.

### Eight languages, one API

Coins.ph maintains four connectors as four codebases. CCXT is written once in TypeScript and transpiled to eight languages with identical method names and return structures:

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.coinsph()
ticker = exchange.fetch_ticker('BTC/PHP')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.coinsph ();
const ticker = await exchange.fetchTicker ('BTC/PHP');
```

#### **Go**

```go
exchange := ccxt.NewCoinsph(nil)
ticker, err := exchange.FetchTicker("BTC/PHP")
```

#### **C#**

```csharp
var exchange = new ccxt.coinsph();
var ticker = await exchange.FetchTicker("BTC/PHP");
```

<!-- tabs:end -->

### One error hierarchy

CCXT maps Coins.ph's error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `RateLimitExceeded`, `DDoSProtection`, `NetworkError` and 34 more, all descending from `BaseError`. The 418 ban case surfaces as a rate-limit exception rather than an unhelpful HTTP status.

### Precision and string math

PHP-quoted pairs mean large prices and small amounts in the same order. CCXT loads Coins.ph market metadata and exposes `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class:

```python
amount = exchange.amount_to_precision('BTC/PHP', 0.0012345678)
price = exchange.price_to_precision('BTC/PHP', 3512345.6789)
```

### Nothing is hidden — the implicit API

Alongside the 30 unified capabilities, **all 78 endpoints in CCXT's Coins.ph API block are generated as callable implicit methods**, with signing, timestamping and throttling applied:

```python
response = exchange.publicGetOpenapiQuoteV1TickerBookTicker({'symbol': 'BTCPHP'})
```

Browse them on the [Coins.ph implicit API page](/docs/exchanges/coinsph/implicit-api).

## What the official connectors do better

Real advantages, and one of them is decisive for some workloads:

- **Streaming.** CCXT has no WebSocket implementation for Coins.ph at all — zero `watch*` methods. The official Python connector wraps Coins.ph's documented WebSocket streams and user data stream. If you need live order-book or order updates from this venue, the connector does it and CCXT does not.
- **They cover product lines CCXT does not model.** `coins-js-api` describes itself as covering Spot Trading, Wallet, Convert, Fiat, P2P Transfer and Invoice Payment. CCXT is a trading API: convert quotes, fiat rails, peer-to-peer transfer and invoice payment are outside its unified surface entirely.
- **One-to-one mapping with the Coins.ph docs.** Field and method names line up with the reference you are reading. CCXT's unified names are a deliberate abstraction, which is an extra hop when debugging against vendor docs.
- **TypeScript models built for Coins.ph payloads.** `coins-js-api` ships type definitions for the venue's own request and response shapes. CCXT gives you typed *unified* structures instead — better for portability, less literal about this venue.

If you are building a Philippine payments or P2P product on Coins.ph rather than a multi-venue trading system, the official connectors are the right starting point.

## Migrating from a Coins.ph connector to CCXT

| What you are doing | Coins.ph connector | CCXT |
| --- | --- | --- |
| Symbols | `'BTCPHP'` | `'BTC/PHP'` |
| Exchange info | `GET /openapi/v1/exchangeInfo` | `load_markets()` |
| 24h ticker | `GET /openapi/quote/v1/ticker/24hr` | `fetch_ticker()` / `fetch_tickers()` |
| Depth | `GET /openapi/quote/v1/depth` | `fetch_order_book()` |
| Klines | `GET /openapi/quote/v1/klines` | `fetch_ohlcv()` |
| New order | `POST /openapi/v1/order` | `create_order()` |
| Cancel order | `DELETE /openapi/v1/order` | `cancel_order()` |
| Open orders | `GET /openapi/v1/openOrders` | `fetch_open_orders()` |
| My trades | `GET /openapi/v1/myTrades` | `fetch_my_trades()` |
| Account | `GET /openapi/v1/account` | `fetch_balance()` |
| Deposit address | wallet endpoints | `fetch_deposit_address()` |
| Streams | connector WebSocket client | not available in CCXT for this venue |
| Anything not listed | the endpoint URL | the same endpoint as an [implicit method](/docs/exchanges/coinsph/implicit-api) |

## FAQ

**Does CCXT support Coins.ph over WebSocket?**
No. CCXT implements zero `watch*` methods for `coinsph`, so there is no CCXT WebSocket support for this venue — use `fetch*` methods and poll, or use Coins.ph's own connector for streams. CCXT does have WebSocket support for 76 of the 104 exchanges it covers; Coins.ph is not one of them today.

**Does Coins.ph have an official Python SDK on PyPI?**
There is an official Python connector at [coins-docs/coins-connector-python](https://github.com/coins-docs/coins-connector-python), MIT-licensed, but it is not published to PyPI — the documented install path is cloning the repository and installing its requirements. The JavaScript connector is on npm as `coins-js-api`.

**What are Coins.ph's rate limits?**
120 requests per minute per IP and 180 requests per minute per UID, across all `/openapi/*` endpoints, with per-endpoint weights. HTTP 429 responses carry a `Retry-After` header, and repeated violations escalate to HTTP 418 bans of two minutes to three days. CCXT's throttler is on by default and models the weights, including conditional ones.

**Can I trade PHP fiat pairs through CCXT?**
Yes. Coins.ph's PHP-quoted markets appear as ordinary unified symbols — a market whose id is `BTCPHP` becomes `'BTC/PHP'` — with precision and limits loaded from `load_markets()`. Call `load_markets()` and pick symbols from what it returns rather than assuming a particular pair is listed; Coins.ph also runs USDT-quoted markets such as `'BTC/USDT'`.

**Can I still call Coins.ph-specific endpoints through CCXT?**
Yes — all 78 endpoints in the class's API block are generated as [implicit methods](/docs/exchanges/coinsph/implicit-api), with signing, timestamping and throttling applied.

**Is CCXT free?**
Yes. MIT-licensed.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [coinsph unified API reference](/docs/exchanges/coinsph)
- [coinsph implicit API](/docs/exchanges/coinsph/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
