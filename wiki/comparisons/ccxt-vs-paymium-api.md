<!-- title: CCXT vs the raw Paymium API -->
<!-- description: Paymium's own API documentation uses ccxt in its examples. Compare CCXT's paymium class with hand-rolling the nonce/HMAC auth — and where CCXT stops, at streaming. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Paymium publishes no client library in any language CCXT covers, and its documentation's own examples use ccxt. CCXT implements 12 capabilities and all 24 endpoints for BTC/EUR — but has no WebSocket support for this venue. -->
<!-- weight: 100 -->

# CCXT vs the raw Paymium API

[Paymium](https://www.paymium.com) is a long-running French BTC/EUR exchange. Its v1 API is documented at [paymium.github.io/api-documentation](https://paymium.github.io/api-documentation/), with the OpenAPI source in [`Paymium/api-documentation`](https://github.com/Paymium/api-documentation).

Paymium publishes no client library in Python, JavaScript, PHP, Go, C# or Java. Its documentation is explicit about what to use instead: "Examples in the documentation are using the `ccxt` library, which supports Paymium's API and is available for Python, JavaScript and PHP." There is a Ruby gem, `paymium_api` (MIT, v0.0.14 published November 2025), which is outside every language CCXT ships; and a single-release PyPI package named `paymium` from 2019 by an unaffiliated author.

So the comparison here is not CCXT against a vendor SDK. It is **CCXT against the code you would write yourself**, with one honest caveat: Paymium publishes a socket.io feed and CCXT does not implement it.

## TL;DR

- **Write it yourself** if you need Paymium's real-time socket.io feed, or its merchant payment endpoints — CCXT has **zero** `watch*` methods for `paymium`, so live streaming is not available through it.
- **Pick CCXT** if you want REST: 12 unified capabilities, all 24 endpoints as implicit methods, the nonce/HMAC signing done for you, typed errors and a rate limiter, in eight languages.
- **Paymium's own docs point at CCXT.** For REST, this is one of the rare venues where the exchange itself treats CCXT as the reference client.

## At a glance

| | **CCXT** | **Raw Paymium API** |
| --- | --- | --- |
| Exchanges covered | 104 (Paymium is one of them) | Paymium only |
| Official client library | n/a | **none** in Python, JS, PHP, Go, C# or Java; a Ruby gem exists |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | whatever you write |
| Unified market data + trading API | yes — same method names across every exchange | no — Paymium's own request/response shapes |
| Unified capabilities implemented | 12 for `paymium`, of which 6 are `fetch*` | n/a |
| Markets | one: `'BTC/EUR'` | `/data/eur/...` |
| Authentication | handled — `Api-Key`, `Api-Nonce`, `Api-Signature` | HMAC-SHA256 hexdigest of nonce + full URL + body; OAuth2 also offered |
| **WebSockets** | **no** — 0 `watch*` methods for `paymium` | yes — a socket.io v1.3 endpoint at path `/ws/socket.io` |
| Raw endpoint access | yes — 24 endpoints as implicit methods | it is all raw |
| Built-in rate limiter | yes, on by default (`rateLimit` 2000 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus Paymium error payloads |
| Testnet / sandbox | none — Paymium publishes no sandbox | none |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | n/a — no package to count |
| Licence | MIT | n/a |
| Support | Discord, Telegram, GitHub — usually same-day | Paymium support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, Paymium's published API documentation at paymium.github.io/api-documentation, the `Paymium/api-documentation` repository, and the RubyGems and PyPI records for `paymium_api` and `paymium`.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.paymium()
ticker = exchange.fetch_ticker('BTC/EUR')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw HTTP**

```python
import requests

response = requests.get('https://paymium.com/api/v1/data/eur/ticker').json()
print(response)
```

<!-- tabs:end -->

Public data on Paymium needs no authentication, so the raw call is short. What CCXT adds is the [unified ticker structure](/docs/manual#ticker-structure) — the same keys, types and units as Kraken or Bitstamp, so a EUR-desk dashboard does not need a Paymium-shaped branch.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.paymium({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/EUR', 'limit', 'buy', 0.001, 55000)
print(order['id'])
```

#### **Raw HTTP**

```python
import hashlib, hmac, json, time, requests

url = 'https://paymium.com/api/v1/user/orders'
nonce = str(int(time.time() * 1000))
body = json.dumps({
    'type': 'LimitOrder',
    'currency': 'eur',
    'direction': 'buy',
    'amount': 0.001,
    'price': 55000,
})
# the signed string is nonce + the full URL + the request body
signature = hmac.new(secret.encode(), (nonce + url + body).encode(),
                     hashlib.sha256).hexdigest()

response = requests.post(url, data=body, headers={
    'Api-Key': api_key,
    'Api-Nonce': nonce,
    'Api-Signature': signature,
    'Content-Type': 'application/json',
}).json()
```

<!-- tabs:end -->

Paymium's documentation describes `Api-Signature` as "the hexdigest of the HMAC-SHA256 hash of the nonce concatenated with the full URL and body of the HTTP request, encoded using your API secret key", and `Api-Nonce` as "a positive integer number that must increase with every request you make". Two details make that easy to get subtly wrong: the *full* URL includes the query string for GET requests, and the body must be byte-identical to what you signed. CCXT builds the string the same way for both cases and generates a monotonic nonce, so concurrent calls do not collide.

CCXT also returns a [unified order structure](/docs/manual#order-structure) rather than Paymium's raw payload.

## Where the differences actually bite

### There is no CCXT WebSocket support here — and that is worth saying first

`paymium` has **zero** `watch*` methods in CCXT. There is no `ccxt.pro.paymium`. Paymium does publish a real-time feed — socket.io v1.3, connecting to `https://paymium.com/<public or user>` with the `path` option set to `/ws/socket.io` — and if live ticks are your requirement, this page is not going to talk you out of writing that client. CCXT's coverage of `paymium` is REST: 12 unified capabilities and all 24 endpoints.

### Rate limits you do not have to model

CCXT ships a token-bucket throttler that is on by default (`enableRateLimit = true`, `rateLimit = 2000` ms for `paymium`). You call methods in a loop and the library paces them. On the raw path, pacing and back-off are your code.

### One error hierarchy — partly

CCXT's [typed exception tree](/docs/manual#error-handling) has 41 classes descending from `BaseError`, and the transport-level ones apply here: a 401 becomes `AuthenticationError`, a 429 becomes `RateLimitExceeded`, a 403 becomes `ExchangeNotAvailable`, and connection failures and timeouts become `NetworkError` subclasses. That alone means one `except` clause that also works on the next exchange.

Be precise about the limit, though: Paymium's own error bodies are not finely mapped. CCXT raises a generic `ExchangeError` carrying the response when Paymium returns an `errors` field, so `except ccxt.InsufficientFunds` will not fire on this venue the way it does on Binance or Kraken. That is a real gap and worth knowing before you write handlers around it.

### Eight languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures. Paymium's docs mention Python, JavaScript and PHP because those are the CCXT languages they know about; C#, Go and Java come with the same package.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.paymium()
ticker = exchange.fetch_ticker('BTC/EUR')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.paymium ();
const ticker = await exchange.fetchTicker ('BTC/EUR');
```

#### **PHP**

```php
$exchange = new \ccxt\paymium();
$ticker = $exchange->fetch_ticker('BTC/EUR');
```

#### **Go**

```go
exchange := ccxt.NewPaymium(nil)
ticker, err := exchange.FetchTicker("BTC/EUR")
```

<!-- tabs:end -->

### Nothing is hidden — the implicit API

The unified surface for `paymium` is small — 12 capabilities, because the exchange is a single BTC/EUR book with a wallet and a merchant product attached. **All 24 endpoints are generated as callable implicit methods**, with signing, nonce generation, rate-limit accounting and error mapping applied, so the parts CCXT does not model as unified methods are still one call away:

```python
# any raw Paymium endpoint, camelCased from its path
alerts = exchange.private_get_user_price_alerts()
payment = exchange.private_post_merchant_create_payment({...})
```

Browse them on the [paymium implicit API page](/docs/exchanges/paymium/implicit-api).

### Portability

CCXT's `paymium` is the same object shape as its `kraken`, `bitstamp` and `binance` objects, so a French EUR venue does not need its own integration layer:

```python
for exchange_id in ['paymium', 'kraken', 'bitstamp']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/EUR')['last'])
```

## What writing it yourself does better

An honest list, and the first item is decisive for some readers:

- **The socket.io feed.** Paymium publishes a real-time socket.io endpoint for public and user data. CCXT implements no `watch*` methods for this venue, so a live tape or a live book means your own client — and socket.io is a protocol on top of WebSocket, so a generic WS library will not do; you need a socket.io client.
- **The merchant API as a first-class thing.** Paymium's API includes merchant payment creation and retrieval, price alerts, email transfers and payment requests. CCXT reaches those through the implicit API, which works, but a purpose-built client can model them properly with typed request objects.
- **OAuth2.** Paymium supports an OAuth2 authorization-code flow alongside API keys. CCXT authenticates with the key/nonce/signature triple only. If you are building something a user authorises rather than something running on your own key, you need your own client.
- **A far smaller dependency.** Paymium is one market and a handful of endpoints. Fifty lines of `requests` is a smaller install and a smaller attack surface than a library covering 104 exchanges.
- **Any language you like.** CCXT ships eight; the Ruby gem `paymium_api` shows a single-venue client is a tractable project in whatever language you are already writing.

If you need the live feed, OAuth2, or the merchant endpoints modelled properly, writing your own client is the right answer.

## Migrating from a hand-rolled Paymium client to CCXT

| What you are doing | Raw Paymium API | CCXT |
| --- | --- | --- |
| Symbols | `eur` in the path | `'BTC/EUR'` |
| Client | your signing helper | `ccxt.paymium({'apiKey': ..., 'secret': ...})` |
| Ticker | `GET /v1/data/eur/ticker` | `fetch_ticker()` |
| Order book | `GET /v1/data/eur/depth` | `fetch_order_book()` |
| Public trades | `GET /v1/data/eur/trades` | `fetch_trades()` |
| Balance | `GET /v1/user` | `fetch_balance()` |
| New order | `POST /v1/user/orders` | `create_order()` |
| Cancel order | `DELETE /v1/user/orders/{uuid}/cancel` | `cancel_order()` |
| Deposit addresses | `GET /v1/user/addresses` | `fetch_deposit_addresses()` / `fetch_deposit_address()` |
| New deposit address | `POST /v1/user/addresses` | `create_deposit_address()` |
| Email transfer | `POST /v1/user/email_transfers` | `transfer()` |
| Price alerts | `GET`/`POST /v1/user/price_alerts` | [implicit method](/docs/exchanges/paymium/implicit-api) |
| Merchant payments | `POST /v1/merchant/create_payment` | [implicit method](/docs/exchanges/paymium/implicit-api) |
| Streams | socket.io at `/ws/socket.io` | **not available in CCXT for `paymium`** |
| Anything not listed | raw call | the same endpoint as an [implicit method](/docs/exchanges/paymium/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [paymium unified API reference](/docs/exchanges/paymium).

## FAQ

**Is there an official Paymium SDK?**
Not in any language CCXT covers. Paymium's own documentation says its examples use the `ccxt` library, which it notes is available for Python, JavaScript and PHP. A Ruby gem, `paymium_api`, exists on RubyGems; there is also a one-release PyPI package named `paymium` from 2019 by an unaffiliated author.

**Does CCXT support Paymium WebSockets?**
No. `paymium` has zero `watch*` methods in CCXT, so there is no `ccxt.pro.paymium`. Paymium's own real-time feed is socket.io v1.3, reached by connecting to `https://paymium.com/public` or `https://paymium.com/user` with the `path` option set to `/ws/socket.io` — you would use a socket.io client for that.

**How does Paymium authentication work, and does CCXT handle it?**
Yes. Paymium takes three headers: `Api-Key`, `Api-Nonce` (a strictly increasing integer) and `Api-Signature` (the HMAC-SHA256 hexdigest of the nonce concatenated with the full URL and the request body, keyed with your secret). CCXT builds all three, including getting the query string into the signed URL on GET requests.

**Which markets does CCXT support on Paymium?**
One: `'BTC/EUR'`. That is the exchange's book, not a CCXT limitation.

**Does Paymium have a sandbox?**
No. Paymium publishes no test environment, so `set_sandbox_mode(True)` has nothing to point at for this exchange. Test against CCXT's offline static fixtures and small live orders.

**Is CCXT free?**
Yes. MIT-licensed.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [paymium unified API reference](/docs/exchanges/paymium)
- [paymium implicit API](/docs/exchanges/paymium/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
