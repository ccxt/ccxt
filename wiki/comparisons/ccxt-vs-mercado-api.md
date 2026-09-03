<!-- title: CCXT vs the raw Mercado Bitcoin API -->
<!-- description: Mercado Bitcoin publishes an API but no official SDK. Hand-rolling its TAPI signing, nonces and rate limits compared with CCXT's mercado class. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Mercado Bitcoin ships documentation and code samples, not a client library. CCXT's mercado class gives 15 unified capabilities over the v3 trade API and v4 candles — with no WebSocket support and no v4 trading endpoints. -->
<!-- weight: 100 -->

# CCXT vs the raw Mercado Bitcoin API

[Mercado Bitcoin](https://www.mercadobitcoin.com.br) is Brazil's largest crypto exchange, and its API is free and documented at `api.mercadobitcoin.net/api/v4/docs`. What it does not publish is a client library: its developer page describes REST integration "using any programming language of your preference" and offers code samples, not an SDK.

So the comparison here is not CCXT against a vendor SDK. It is **CCXT against the client you would write yourself** — and it is worth being clear up front about what CCXT does and does not cover on this venue.

## TL;DR

- **Write it yourself** if you need Mercado Bitcoin's v4 trading endpoints, its WebSocket feed, or anything beyond the 15 capabilities CCXT unifies here.
- **Use CCXT** if you want signed requests, nonces, pacing, precision and typed errors already handled behind the same method names you use on every other exchange.
- **Know the boundary.** CCXT drives Mercado Bitcoin's **v3 trade API** for private calls plus its public and v4 candle endpoints, and implements **zero `watch*` methods** — so the v4 REST trading surface and the WebSocket feed are outside what `ccxt.mercado` gives you today.

## At a glance

| | **CCXT** | **Raw Mercado Bitcoin API** |
| --- | --- | --- |
| Official client library | — | none published; documentation and code samples only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | any, you write the client |
| Symbols | `'BTC/BRL'` | `BTC` as the coin path segment; `BRLBTC` in some payloads |
| Unified capabilities | 15, of which 9 are `fetch*` | n/a |
| API versions used | v3 trade API for private, public API and v4 candles for market data | v4 is the current documented surface |
| Signing | built in | HMAC-SHA512 over the request path plus urlencoded body, `TAPI-ID` + `TAPI-MAC` headers, incrementing `tapi_nonce` |
| WebSockets | **no** — `mercado` has no `watch*` methods in CCXT | offered for public data; you write the client |
| Raw endpoint access | yes — 21 endpoints as implicit methods | it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 1000 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | `error_message` in the response body |
| Testnet / sandbox | no — Mercado Bitcoin has no sandbox in CCXT | no |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month | n/a — no vendor package to measure |
| Licence | MIT | n/a — the API itself is free to use |
| Support | Discord, Telegram, GitHub issues — usually same-day | Mercado Bitcoin support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}} and Mercado Bitcoin's published developer page and v4 API documentation.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.mercado()
ticker = exchange.fetch_ticker('BTC/BRL')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw REST**

```python
import requests

r = requests.get('https://www.mercadobitcoin.net/api/BTC/ticker/')
t = r.json()['ticker']
print(t['last'], t['vol'])
```

<!-- tabs:end -->

The public read is genuinely simple — that is not the part CCXT earns its place on. Note the trailing slash: Mercado Bitcoin's public paths require it, and dropping it is a redirect or a 404 depending on the endpoint. CCXT returns a [unified ticker structure](/docs/manual#ticker-structure), so the same downstream code reads Mercado Bitcoin, Binance and Kraken.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.mercado({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/BRL', 'limit', 'buy', 0.001, 350000)
print(order['id'], order['status'])
```

#### **Raw REST**

```python
import hashlib, hmac, time, urllib.parse, requests

body = urllib.parse.urlencode({
    'tapi_method': 'place_buy_order',
    'tapi_nonce': int(time.time() * 1000),
    'coin_pair': 'BRLBTC',
    'quantity': '0.001',
    'limit_price': '350000',
})
message = '/tapi/v3/?' + body
mac = hmac.new(SECRET.encode(), message.encode(), hashlib.sha512).hexdigest()
r = requests.post('https://www.mercadobitcoin.net/tapi/v3/', data=body,
                  headers={'TAPI-ID': KEY, 'TAPI-MAC': mac,
                           'Content-Type': 'application/x-www-form-urlencoded'})
```

<!-- tabs:end -->

Three details in that block are where hand-rolled clients break:

1. **The signed message is the path plus `?` plus the exact body** — not the body alone, and not the full URL. Get the prefix wrong and every request fails authentication with no hint as to why.
2. **Every private call is a `POST` to `/tapi/v3/`** with the operation in `tapi_method`. `place_buy_order`, `cancel_order`, `list_orders`, `get_account_info` are all the same URL.
3. **`tapi_nonce` must strictly increase.** Two processes sharing a key, a restart, or an out-of-order retry produces a rejection that looks like a credentials problem and is not.

CCXT builds all three and returns a [unified order structure](/docs/manual#order-structure).

## Where the differences actually bite

### Symbols and the coin-pair convention

Mercado Bitcoin's public endpoints take the coin as a path segment (`/api/BTC/ticker/`), while the trade API takes a `coin_pair` written quote-first (`BRLBTC`). Two conventions for the same market, in the same integration. CCXT normalises both to `'BTC/BRL'` and keeps the venue identifiers on the market object.

### Rate limits and pacing

CCXT ships a token-bucket throttler that is on by default, with `rateLimit` at 1000 ms for Mercado Bitcoin. In a hand-rolled client, pacing and backoff are application code — and on a venue whose private surface is a single POST endpoint, an unpaced retry loop is easy to write by accident.

### One error hierarchy

Mercado Bitcoin returns failures in the response body, as an `error_message` field, often with an HTTP 200. A hand-rolled client has to inspect every response and match on strings. CCXT does that and raises from a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `RateLimitExceeded` and 36 more under `BaseError` — so one `except` block covers this venue and the next one you add.

### Precision and string math

BRL prices run to hundreds of thousands and quantities to eight decimals. CCXT applies each market's tick and step sizes through `amount_to_precision` and `price_to_precision`, backed by the `Precise` string-arithmetic class, so a value never drifts through float rounding into a rejected order.

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures. Mercado Bitcoin's documentation offers code samples; each language you support is a client you write and maintain yourself.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.mercado()
ticker = exchange.fetch_ticker('BTC/BRL')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.mercado ();
const ticker = await exchange.fetchTicker ('BTC/BRL');
```

#### **Go**

```go
exchange := ccxt.NewMercado(nil)
ticker, err := exchange.FetchTicker("BTC/BRL")
```

<!-- tabs:end -->

### Portability

Mercado Bitcoin is usually one venue in a Brazilian system, not the whole of it — the BRL on-ramp alongside a global venue for depth. In CCXT the venue is a variable and the reconciliation layer is the library:

```python
for exchange_id in ['mercado', 'binance', 'kraken']:
    exchange = getattr(ccxt, exchange_id)()
    exchange.load_markets()
```

### Nothing is hidden — the implicit API

Alongside the 15 unified capabilities, **all 21 endpoints CCXT models for Mercado Bitcoin are generated as implicit methods**, with signing and rate-limit accounting applied:

```python
response = exchange.private_post_get_account_info()
```

Browse them on the [mercado implicit API page](/docs/exchanges/mercado/implicit-api).

## What going direct does better

These are real, and on this venue they are more substantial than usual:

- **The v4 API is the current surface, and CCXT drives v3 for trading.** Mercado Bitcoin's documented flow is to create an API key with 2FA, authenticate against an Authorize endpoint for a token, then read your account id from a List Accounts endpoint. CCXT's private path uses the older v3 trade API with `TAPI-ID`/`TAPI-MAC` signing instead. If you want the v4 trading endpoints, you call them yourself.
- **WebSockets.** Mercado Bitcoin offers a WebSocket for public data. `mercado` has **zero `watch*` methods** in CCXT, so any live feed from this venue is a client you write.
- **Endpoints CCXT does not model.** CCXT covers 21 endpoints here — a small subset of what a full v4 integration exposes. Anything outside that set is a direct call regardless.
- **A small, readable client.** For a read-mostly BRL price feed, `requests` plus a URL is a handful of lines, with no dependency to track.

If your Mercado Bitcoin integration needs v4 trading or streaming, going direct is not a compromise — it is the only route today.

## Migrating from a hand-rolled Mercado Bitcoin client to CCXT

| What you are doing | Raw Mercado Bitcoin API | CCXT |
| --- | --- | --- |
| Symbols | `BTC` path segment / `BRLBTC` coin pair | `'BTC/BRL'` |
| Coin list | `GET /api/coins` | `load_markets()` |
| Ticker | `GET /api/{coin}/ticker/` | `fetch_ticker()` |
| Order book | `GET /api/{coin}/orderbook/` | `fetch_order_book()` |
| Trades | `GET /api/{coin}/trades/` | `fetch_trades()` |
| Candles | v4 `candles` | `fetch_ohlcv()` |
| Balance | `tapi_method=get_account_info` | `fetch_balance()` |
| Limit buy / sell | `place_buy_order` / `place_sell_order` | `create_order()` |
| Market buy / sell | `place_market_buy_order` / `place_market_sell_order` | `create_order()` with `'market'` |
| Cancel order | `cancel_order` | `cancel_order()` |
| Order status | `get_order` | `fetch_order()` |
| Open orders | `list_orders` | `fetch_open_orders()` |
| Streams | offered by the venue, no client | not available in CCXT for this venue |
| Anything not listed | the `tapi_method` name | the same endpoint as an [implicit method](/docs/exchanges/mercado/implicit-api) |

## FAQ

**Does Mercado Bitcoin have an official SDK?**
No. Its developer page describes REST integration in the language of your choice and provides code samples, with documentation at `api.mercadobitcoin.net/api/v4/docs`. There is no vendor-published client library, so any comparison is against a client you write.

**Does CCXT support Mercado Bitcoin WebSockets?**
No. `mercado` has zero `watch*` methods in CCXT. The venue offers a WebSocket for public data, so streaming means writing your own client.

**Which Mercado Bitcoin API version does CCXT use?**
Private calls go through the v3 trade API at `/tapi/v3/`, signed with HMAC-SHA512 in a `TAPI-MAC` header. Market data comes from the public API and, for candles, from the v4 endpoints. The v4 Authorize-token trading flow is not what CCXT drives.

**How does CCXT sign Mercado Bitcoin private requests?**
It POSTs a urlencoded body containing `tapi_method` and an incrementing `tapi_nonce` to `/tapi/v3/`, and signs the string `/tapi/v3/?` followed by that exact body with HMAC-SHA512, sending your key in `TAPI-ID` and the digest in `TAPI-MAC`. You supply `apiKey` and `secret`.

**Does Mercado Bitcoin have a testnet?**
CCXT defines no sandbox URLs for Mercado Bitcoin, so `setSandboxMode(True)` will not switch you to a test environment.

**Is CCXT free?**
Yes. MIT-licensed.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [mercado unified API reference](/docs/exchanges/mercado)
- [mercado implicit API](/docs/exchanges/mercado/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
