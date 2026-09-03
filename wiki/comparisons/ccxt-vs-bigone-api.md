<!-- title: CCXT vs the raw BigONE API -->
<!-- description: BigONE publishes OpenAPI specs but no client library, so the comparison is CCXT against hand-rolled HTTP: per-request JWTs, two API generations and errors. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: BigONE ships OpenAPI specifications and no SDK in any language. CCXT covers 29 unified capabilities and all 41 endpoints across the v3 spot and v2 contract APIs — but implements no WebSocket support for this venue. -->
<!-- weight: 100 -->

# CCXT vs the raw BigONE API

[BigONE](https://big.one) documents its API at [open.big.one](https://open.big.one/docs/api.html), and publishes machine-readable specifications in [bigone-eng/openapi-specs](https://github.com/bigone-eng/openapi-specs) — five OpenAPI YAML files covering spot trading, contract trading, wallet and asset management, and one-click swap. What it does not publish is a client library. The specs repository has no released SDK, and BigONE's getting-started page offers token-generation snippets in Python, Go and JavaScript rather than a package to install.

The most-starred community option, [jeffkit/bigone-python](https://github.com/jeffkit/bigone-python), describes itself as "An unofficial Python implementation of the latest Open API for big.one exchange", is MIT-licensed with 4 stars and 12 commits, and targets the **v2** API — while BigONE's current documented version is **v3**.

So the real comparison here is not CCXT against a vendor SDK. It is **CCXT against the HTTP client you were about to write**.

## TL;DR

- **Write it yourself** if you need two public endpoints, work in a language CCXT does not target, or you specifically need BigONE's **WebSocket feeds** — which CCXT does not implement for this exchange.
- **Pick CCXT** if you want per-request JWT signing, rate limiting, precision handling, pagination and typed errors already written and tested, with 29 unified capabilities and all 41 BigONE endpoints exposed.
- **BigONE's auth is a JWT you mint per request**, not a static HMAC header, and spot and contracts live on two different API generations. Both are small things that cost an afternoon the first time.

## At a glance

| | **CCXT** | **Raw BigONE REST API** |
| --- | --- | --- |
| Exchanges covered | 104 (BigONE is one of them) | BigONE only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | whatever you write it in |
| Packages to install | **1** (`ccxt`) | an HTTP client, a JWT library, and your own wrapper |
| First-party client library | n/a | **none** — OpenAPI specifications only |
| Unified market data + trading API | yes — 29 capabilities on `bigone` | no — raw JSON payloads |
| Spot and contracts in one client | yes — v3 spot and v2 contract hosts behind one object | two API generations, five base paths |
| WebSockets | **no** — 0 `watch*` methods for `bigone` | BigONE documents Spot and Contract WebSocket guides you would implement yourself |
| Raw endpoint access | yes — 41 endpoints as implicit methods | yes, it is all you have |
| Built-in rate limiter | yes, on by default (`rateLimit` 20 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus BigONE error payloads |
| Testnet / sandbox | none — BigONE publishes no sandbox | none |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** | `openapi-specs` 0 stars; `bigone-python` 4 stars (unofficial, v2) |
| Licence | MIT | n/a (`bigone-python` is MIT) |
| Support | Discord, Telegram, GitHub — usually same-day | BigONE support channels |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, BigONE's getting-started documentation, the `bigone-eng/openapi-specs` and `jeffkit/bigone-python` repositories, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bigone()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw REST**

```python
import requests

r = requests.get('https://big.one/api/v3/asset_pairs/BTC-USDT/ticker')
data = r.json()['data']
# 'asset_pair_name', 'bid', 'ask', 'open', 'high', 'low', 'close', 'volume', ...
print(data['close'], data['volume'])
```

<!-- tabs:end -->

The raw call is short, which is why people write it. What it does not give you is a [unified ticker structure](/docs/manual#ticker-structure): consistent key names, milliseconds instead of BigONE's own timestamp format, base volume separated from quote volume, and the same shape on the next exchange.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bigone({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **Raw REST**

```python
import jwt, time, requests

token = jwt.encode({
    'type': 'OpenAPIV2',
    'sub': API_KEY,
    'nonce': str(time.time_ns()),   # nanoseconds
}, API_SECRET, algorithm='HS256')

r = requests.post(
    'https://big.one/api/v3/viewer/orders',
    headers={'Authorization': 'Bearer ' + token,
             'Content-Type': 'application/json'},
    json={'asset_pair_name': 'BTC-USDT',
          'side': 'BID',            # BID / ASK, not buy / sell
          'type': 'LIMIT',
          'price': '60000',
          'amount': '0.001'})
print(r.json())
```

<!-- tabs:end -->

Four details in that snippet are easy to get wrong and produce the same unhelpful rejection: the credential is a **JWT you mint for every request** with `type`, `sub` and a **nanosecond** nonce; the side values are `BID` and `ASK` rather than `buy` and `sell`; price and amount are strings; and for a **market buy**, BigONE expects the `amount` field to carry the quote-currency cost rather than the base quantity. CCXT handles all four, and does the equivalent for the other 103 exchanges without you learning each one's variant.

## Where the differences actually bite

### Two API generations behind one client

BigONE's spot API is v3, at `https://big.one/api/v3` with private calls under `/api/v3/viewer`. Its contract API is a different generation entirely, at `https://big.one/api/contract/v2`. CCXT models `public`, `private`, `contractPublic`, `contractPrivate` and `webExchange` as five base URLs inside a single exchange object, so spot and swap markets are loaded together and `fetch_ticker` works on both:

```python
exchange = ccxt.bigone()
exchange.load_markets()          # spot (v3) and swap (contract v2) in one call
```

Hand-rolled, that is two clients, two signing paths and two response vocabularies to keep in step.

### Rate limits you do not have to model

BigONE's documentation references rate limits in general terms without publishing per-endpoint numbers. CCXT ships a concrete, tunable default — `rateLimit = 20` ms, recorded in the exchange file as 500 requests per 10 seconds — and a token-bucket throttler that is on by default. You write a loop; the library paces it. If you need it stricter or looser, it is one constructor option:

```python
exchange = ccxt.bigone({'enableRateLimit': True, 'rateLimit': 50})
```

### One error hierarchy

CCXT maps BigONE's responses onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. Matching on BigONE's error codes and hoping the wording never changes is the alternative, and it does not survive adding a second venue.

### Precision, rounding and string math

`load_markets()` reads BigONE's asset-pair metadata and exposes tick size, step size and minimum notional through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class. BigONE takes prices and amounts as strings, which is exactly where naive float formatting produces a rejected order:

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

### Seven languages, one API

There is no BigONE client in any language, so every language is a from-scratch integration. CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and structures:

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.bigone()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.bigone ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **C#**

```csharp
var exchange = new ccxt.bigone();
var ticker = await exchange.FetchTicker("BTC/USDT");
```

#### **Go**

```go
exchange := ccxt.NewBigone(nil)
ticker, err := exchange.FetchTicker("BTC/USDT")
```

<!-- tabs:end -->

### Nothing is hidden — the implicit API

BigONE's API is compact: **41 endpoints**, and CCXT generates every one of them as a callable implicit method with JWT signing, rate limiting and error mapping applied:

```python
# any raw BigONE endpoint, camelCased from its path
pairs = exchange.public_get_asset_pairs()
contract_account = exchange.contract_private_get_accounts()
```

Browse them on the [bigone implicit API page](/docs/exchanges/bigone/implicit-api).

### Portability

In CCXT the exchange id is a variable, so listing the same pair on a second venue is a configuration change rather than a second integration:

```python
for exchange_id in ['bigone', 'binance', 'okx', 'kucoin']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT')['last'])
```

## What hand-rolling the raw API does better

An honest list, because these are real:

- **BigONE's WebSocket feeds.** CCXT implements **zero** `watch*` methods for `bigone`, so there is no `ccxt.pro.bigone`. BigONE's documentation includes a Spot WebSocket Guide and a Contract WebSocket Guide. If you want live socket data from this venue, you are writing that client — CCXT will not do it for you.
- **The OpenAPI specifications.** BigONE publishes five OpenAPI YAML files. That is genuinely useful: you can generate a typed client for almost any language with standard tooling and get request/response models that mirror the docs exactly. CCXT gives you unified structures instead, which is a different trade.
- **A far smaller dependency.** One `requests` call against `/api/v3/asset_pairs/BTC-USDT/ticker` is three lines and no third-party library. For a dashboard that reads one price, CCXT is more than you need.
- **Endpoints CCXT does not model as unified methods.** BigONE's convert / one-click-swap product and parts of its contract API are reachable from CCXT only as implicit methods returning raw payloads. If those are the bulk of your integration, the unified layer buys you less.
- **Field-for-field fidelity with the docs.** `asset_pair_name`, `BID`, `filled_amount` — when you are reading BigONE's reference while debugging, raw JSON has no translation layer between you and it.

If BigONE is your only venue, you need streaming, and you are comfortable owning the JWT signing, writing it directly is a defensible choice.

## Migrating from a raw BigONE integration to CCXT

| What you are doing | Raw BigONE API | CCXT |
| --- | --- | --- |
| Symbols | `asset_pair_name: 'BTC-USDT'` | `'BTC/USDT'` |
| Client | your own JWT-signing `requests` wrapper | `ccxt.bigone({'apiKey': ..., 'secret': ...})` |
| Auth | mint an HS256 JWT per request | handled |
| Asset pairs | `GET /api/v3/asset_pairs` | `load_markets()` |
| Ticker | `GET /api/v3/asset_pairs/{pair}/ticker` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET /api/v3/asset_pairs/{pair}/depth` | `fetch_order_book()` |
| Trades | `GET /api/v3/asset_pairs/{pair}/trades` | `fetch_trades()` |
| Candles | `GET /api/v3/asset_pairs/{pair}/candles` | `fetch_ohlcv()` |
| New order | `POST /api/v3/viewer/orders` | `create_order()` |
| Cancel order | `POST /api/v3/viewer/orders/{id}/cancel` | `cancel_order()` |
| Cancel all | `POST /api/v3/viewer/orders/cancel` | `cancel_all_orders()` |
| Orders | `GET /api/v3/viewer/orders` | `fetch_orders()` / `fetch_open_orders()` / `fetch_closed_orders()` |
| Balance | `GET /api/v3/viewer/accounts` | `fetch_balance()` |
| My trades | `GET /api/v3/viewer/trades` | `fetch_my_trades()` |
| Deposits / withdrawals | `GET /api/v3/viewer/deposits`, `/withdrawals` | `fetch_deposits()` / `fetch_withdrawals()` |
| Transfers | `POST /api/v3/viewer/transfer` | `transfer()` |
| Contracts | `GET /api/contract/v2/...` | the same client — swap markets load alongside spot |
| Streams | BigONE WebSocket guides, hand-written | **not available in CCXT for `bigone`** |
| Anything not listed | native call | the same endpoint as an [implicit method](/docs/exchanges/bigone/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [bigone unified API reference](/docs/exchanges/bigone).

## FAQ

**Is there an official BigONE SDK?**
No. BigONE publishes OpenAPI specifications in `bigone-eng/openapi-specs` and code snippets for generating an auth token, but no client library in any language. The community `bigone-python` package is unofficial, has 4 GitHub stars, and targets the v2 API rather than the current v3.

**Does CCXT support BigONE WebSockets?**
No. `bigone` has zero `watch*` methods, so there is no `ccxt.pro.bigone`. REST is fully covered — 29 unified capabilities and all 41 endpoints — but BigONE's documented Spot and Contract WebSocket feeds are not implemented.

**How does CCXT authenticate with BigONE?**
It mints a JWT for every private request, signed HS256 with your API secret, whose payload is `{"type": "OpenAPIV2", "sub": <your api key>, "nonce": <nanoseconds>}`, and sends it as `Authorization: Bearer <token>`. You never write that code.

**Does CCXT cover BigONE's contract (swap) markets?**
Yes. `bigone` declares both `spot` and `swap`, and CCXT models BigONE's v3 spot API and v2 contract API as separate base URLs behind one client, so both market types load from a single `load_markets()`.

**Does BigONE have a testnet?**
No sandbox environment is published, so `set_sandbox_mode(True)` has nothing to point at for `bigone`. Test against CCXT's offline static fixtures and small live orders.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support for the 76 exchanges that have it.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bigone unified API reference](/docs/exchanges/bigone)
- [bigone implicit API](/docs/exchanges/bigone/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
