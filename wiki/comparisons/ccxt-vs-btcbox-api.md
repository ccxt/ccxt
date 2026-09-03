<!-- title: CCXT vs the raw BtcBox API -->
<!-- description: BtcBox publishes an 11-endpoint REST API, a sample script and no SDK. Hand-rolling its MD5-keyed HMAC signing, compared with CCXT in seven languages. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: BtcBox has no client library — the only first-party code is a four-commit demo script. Its API is small enough that the real question is whether you want portability, not whether you can write it. -->
<!-- weight: 100 -->

# CCXT vs the raw BtcBox API

[BtcBox](https://www.btcbox.co.jp/) is a Japanese exchange trading a handful of coins against JPY. Its [API documentation](https://blog.btcbox.jp/en/archives/8762) describes eleven endpoints in total — four public, six private, one internal — under `https://www.btcbox.co.jp/api/v1`.

There is no SDK. The only first-party code BtcBox links is [btcbox/python3-demo](https://github.com/btcbox/python3-demo), a four-commit sample script whose README describes it as a "python3-api-request-demo". That is a reference, not a library.

An eleven-endpoint API is genuinely small enough to write yourself, so this page is not going to argue that you cannot. The question is narrower: **is BtcBox the only venue in your system, and will it stay that way?**

## TL;DR

- **Write it yourself** if BtcBox is your only venue and you need two or three endpoints. Eleven routes and one `coin` parameter is not a large surface.
- **Pick CCXT** if BtcBox is one venue among several, or if you want the JPY pairs behind the same interface as everything else: 12 unified capabilities, 9 of them `fetch*`, all 11 endpoints as implicit methods, in TypeScript, JavaScript, Python, PHP, C#/.NET, Go and Java.
- **Neither side streams.** BtcBox publishes no WebSocket API, and CCXT implements no `watch*` methods for it. Live data means polling either way.

## At a glance

| | **CCXT** | **Raw BtcBox API** |
| --- | --- | --- |
| Exchanges covered | 104 (BtcBox is one of them) | BtcBox only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | whatever you write |
| Official vendor SDK | not applicable | none — only a four-commit demo script |
| Unified market data + trading API | yes — same method names across every exchange | no — BtcBox's own payloads |
| BtcBox capabilities implemented | 12 unified methods, 9 of them `fetch*` | you implement what you need |
| Raw endpoint access | yes — 11 BtcBox endpoints as implicit methods | yes, it is all you have |
| WebSockets | no `watch*` methods for BtcBox | BtcBox publishes no WebSocket API |
| Built-in rate limiter | yes, on by default (`rateLimit` 1000 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | numeric `code` in a 200-status body |
| Testnet / sandbox | not wired for this venue | none documented |
| Licence | MIT | not applicable |
| Support | Discord, Telegram, GitHub issues — usually same-day | BtcBox support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, BtcBox's published API documentation, and the btcbox/python3-demo repository.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.btcbox()
ticker = exchange.fetch_ticker('BTC/JPY')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw HTTP**

```python
import requests

r = requests.get('https://www.btcbox.co.jp/api/v1/ticker/', params={'coin': 'btc'})
data = r.json()
print(data['last'], data['vol'])   # BtcBox's own key names
```

<!-- tabs:end -->

Public reads are a near tie, as they should be for an API this size. CCXT's version returns a [unified ticker structure](/docs/manual#ticker-structure) with millisecond timestamps and numeric fields, identical to what you get from Kraken or Binance; the raw call returns BtcBox's keys for you to map.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.btcbox({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/JPY', 'limit', 'buy', 0.001, 9000000)
print(order['id'], order['status'])
```

#### **Raw HTTP**

```python
import hashlib, hmac, time, requests
from urllib.parse import urlencode

key, secret = '...', '...'
query = {
    'key': key,
    'nonce': str(int(time.time() * 1000)),
    'coin': 'btc',
    'amount': '0.001',
    'price': '9000000',
    'type': 'buy',
}
# the HMAC key is the MD5 hex digest of your secret, not the secret itself
md5_secret = hashlib.md5(secret.encode()).hexdigest()
query['signature'] = hmac.new(md5_secret.encode(),
                              urlencode(query).encode(),
                              hashlib.sha256).hexdigest()

r = requests.post('https://www.btcbox.co.jp/api/v1/trade_add/',
                  headers={'Content-Type': 'application/x-www-form-urlencoded'},
                  data=urlencode(query))
print(r.json())
```

<!-- tabs:end -->

Two details bite here. The HMAC key is the **MD5 digest of your secret**, not the secret — an unusual step that is easy to miss on a first read of the docs. And the parameter order in the string you sign has to match the order you send, because the server rebuilds the signature from what it received. Get either wrong and you get a rejection that does not say which. CCXT's `sign()` handles both, for every private endpoint.

## Where the differences actually bite

### Portability is the whole point

Nobody trades only BtcBox forever. Adding a second venue to a hand-rolled BtcBox integration means a second payload shape, a second symbol convention, a second signing scheme and a second error taxonomy — plus a translation layer of your own so the strategy code can stay venue-agnostic. That translation layer is what CCXT already is:

```python
for exchange_id in ['btcbox', 'bitflyer', 'kraken', 'binance']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/JPY')['last'])
```

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures — so the MD5-keyed signing is implemented once for you, not once per language in your codebase:

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.btcbox ();
const ticker = await exchange.fetchTicker ('BTC/JPY');
```

#### **Python**

```python
import ccxt
exchange = ccxt.btcbox()
ticker = exchange.fetch_ticker('BTC/JPY')
```

#### **PHP**

```php
$exchange = new \ccxt\btcbox();
$ticker = $exchange->fetch_ticker('BTC/JPY');
```

#### **Go**

```go
exchange := ccxt.NewBtcbox(nil)
ticker, err := exchange.FetchTicker("BTC/JPY")
```

<!-- tabs:end -->

### Errors that arrive with a 200

BtcBox reports failures as a numeric `code` inside a successful HTTP response — the shape a naive client treats as a placed order. CCXT inspects the body, maps the codes onto a [typed exception tree](/docs/manual#error-handling), and raises `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `RateLimitExceeded` or one of 36 others, all descending from `BaseError`.

### Precision and string math

JPY pairs price in millions and trade in fractions of a coin, which is exactly the shape where float arithmetic produces an amount the venue rejects. CCXT gives you `amount_to_precision` and `price_to_precision`, backed by the `Precise` string-arithmetic class:

```python
amount = exchange.amount_to_precision('BTC/JPY', 0.0012345678)
price = exchange.price_to_precision('BTC/JPY', 9123456.789)
```

### Rate limits you do not have to model

BtcBox publishes limits per endpoint — `trade_add` allows two calls per second, `trade_list` one. CCXT ships a token-bucket throttler that is on by default, with `rateLimit` set to 1000 ms for BtcBox, so a polling loop paces itself rather than depending on you to remember which endpoint was which.

### Nothing is hidden — the implicit API

The 12 unified methods are not a ceiling. Every BtcBox endpoint is generated as a callable implicit method, with signing, nonce handling and rate limiting applied:

```python
# POST /api/v1/wallet
wallet = exchange.private_post_wallet({'coin': 'btc'})

# POST /api/v1/trade_view
view = exchange.private_post_trade_view({'coin': 'btc', 'id': '12345'})
```

Browse them all on the [btcbox implicit API page](/docs/exchanges/btcbox/implicit-api).

## What the raw API does better

An honest list:

- **The API is small enough that a library is arguably overhead.** Eleven endpoints, one `coin` parameter, form-encoded bodies. For a single-purpose script — poll a price, write it to a database — thirty lines of `requests` is smaller and easier to audit than a dependency covering 104 exchanges.
- **Per-endpoint rate limits are published, and CCXT flattens them.** BtcBox documents two calls per second on `trade_add` and one on `trade_list`; CCXT applies a single 1000 ms pacing value across the venue. If you want to run right at the documented ceiling on a specific route, hand-rolled pacing gets you closer.
- **BtcBox's own demo script shows the exact signing sequence.** `btcbox/python3-demo` is short and readable, and it is the authoritative illustration of the MD5-then-HMAC step. Worth reading whichever route you take.
- **No WebSocket on either side, so CCXT Pro's usual advantage does not apply.** BtcBox publishes no streaming API and CCXT implements no `watch*` methods for it. If live data is what you need, neither option saves you the polling loop.
- **Full fidelity to the payloads.** Fields CCXT does not model reach you unchanged. CCXT keeps the raw response under `info`, but the top-level structure is unified rather than literal.

If BtcBox is your only venue and your integration is small, hand-rolling it is a perfectly reasonable engineering decision.

## Migrating from the raw BtcBox API to CCXT

| What you are doing | BtcBox v1 | CCXT |
| --- | --- | --- |
| Symbols | `coin=btc`, JPY implied | `'BTC/JPY'` |
| Markets | derived from `tickers` | `load_markets()` |
| Ticker | `GET /api/v1/ticker/` | `fetch_ticker()` |
| All tickers | `GET /api/v1/tickers/` | `fetch_tickers()` |
| Order book | `GET /api/v1/depth/` | `fetch_order_book()` |
| Public trades | `GET /api/v1/orders/` | `fetch_trades()` |
| New order | `POST /api/v1/trade_add/` | `create_order()` |
| Cancel order | `POST /api/v1/trade_cancel/` | `cancel_order()` |
| Order by id | `POST /api/v1/trade_view/` | `fetch_order()` |
| Orders | `POST /api/v1/trade_list/` | `fetch_orders()` / `fetch_open_orders()` |
| Balance | `POST /api/v1/balance/` | `fetch_balance()` |
| Deposit address | `POST /api/v1/wallet/` | the same endpoint as an [implicit method](/docs/exchanges/btcbox/implicit-api) |

## FAQ

**Does BtcBox have an official SDK?**
No. BtcBox publishes API documentation and a small sample repository, [btcbox/python3-demo](https://github.com/btcbox/python3-demo), which its own docs describe as a request demo. There is no client library in any language, so CCXT or your own HTTP code are the realistic options.

**How does BtcBox sign API requests?**
Private endpoints are form-encoded POSTs including `key` and a `nonce`. The `signature` is an HMAC-SHA256 over the URL-encoded parameters, keyed with the **MD5 hex digest of your API secret** rather than the secret itself, and the parameter order in the signed string must match the order sent. CCXT builds this in `sign()` for every private endpoint including the implicit ones.

**Does CCXT support BtcBox WebSockets?**
No, and neither does BtcBox — the exchange publishes no WebSocket API. CCXT implements zero `watch*` methods for the venue, so live data means polling `fetch_ticker` or `fetch_order_book` on a timer.

**Which markets does CCXT support on BtcBox?**
The JPY spot pairs BtcBox lists, as unified symbols like `'BTC/JPY'`. CCXT maps the unified symbol onto BtcBox's `coin` parameter for you, so you never pass `coin=btc` yourself.

**Can I still call BtcBox-specific endpoints through CCXT?**
Yes — all 11 of them, as [implicit methods](/docs/exchanges/btcbox/implicit-api), with signing, nonce handling and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [btcbox unified API reference](/docs/exchanges/btcbox)
- [btcbox implicit API](/docs/exchanges/btcbox/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
