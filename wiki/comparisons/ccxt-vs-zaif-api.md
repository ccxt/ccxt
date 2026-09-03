<!-- title: CCXT vs the raw Zaif REST API -->
<!-- description: Zaif publishes no maintained SDK, so this compares CCXT with hand-rolled HTTP: HMAC-SHA512 signing, float nonces, rate limits and JPY market metadata. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Zaif has no maintained client library — the Python and Node wrappers stopped shipping releases in 2018 and 2017. CCXT's `zaif` class covers 11 unified capabilities and all 34 raw endpoints, including the leverage and futures groups. -->
<!-- weight: 100 -->

# CCXT vs the raw Zaif REST API

Zaif is a Japanese spot exchange with JPY-quoted markets. It documents its API thoroughly — in Japanese — but it does not publish a maintained client library in any language. The wrappers that exist are community projects that stopped shipping releases years ago: `zaifapi` on PyPI last released version 1.6.3 in August 2018, and the `zaif.jp` npm package last published version 0.1.16 in December 2017. Both are MIT-licensed and both are still linked from CCXT's own `zaif` implementation as reference documentation.

So the real choice is not CCXT versus an SDK. It is **CCXT versus the HTTP client you would write yourself** — and the question that decides it is how much of the signing, nonce, rate-limit and parsing work you want to own.

## TL;DR

- **Write it yourself** if you need one endpoint, once, from a script, and you are comfortable with HMAC-SHA512 over a urlencoded body and a monotonically increasing float nonce.
- **Pick CCXT** if you want Zaif's 34 endpoints already signed, rate-limited and error-mapped, its ticker, order book, trades, orders and balance already in the same shape as every other exchange, and a path to a second venue that is not a rewrite.
- **Know the limit before you start.** CCXT has no WebSocket support for Zaif — zero `watch*` methods. Zaif does publish a streaming socket, and if you need live pushes you will be talking to it directly.

## At a glance

| | **CCXT** | **Raw Zaif REST API** |
| --- | --- | --- |
| Exchanges covered | 104 (Zaif is one of them) | Zaif only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | whatever you write it in |
| Maintained official SDK | n/a | none published |
| Community wrappers | n/a | `zaifapi` (PyPI, last release August 2018) · `zaif.jp` (npm, last publish December 2017) |
| Unified market data + trading API | yes — 11 unified capabilities, 7 `fetch*` methods | no |
| WebSockets | **no** — Zaif has no `watch*` methods in CCXT | yes — `wss://ws.zaif.jp/stream?currency_pair=...` |
| Raw endpoint access | yes — 34 Zaif endpoints as implicit methods | yes, by definition |
| Signing | done for you (HMAC-SHA512, `Key` / `Sign` headers) | your code |
| Nonce management | done for you | your code |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 100 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | Zaif's `{"error": "..."}` strings |
| Precision and tick sizes | loaded from `currency_pairs/all` and applied on order entry | your code |
| Testnet / sandbox | none — Zaif publishes no test endpoints | none |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month | `zaifapi` 45 GitHub stars · 151 PyPI installs/month; `zaif.jp` 720 npm installs/month |
| Licence | MIT | n/a |
| Support | Discord, Telegram, GitHub issues — usually same-day | Zaif's own support channels |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, Zaif's published API documentation, and the release history of the community wrappers on PyPI and npm.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.zaif()
ticker = exchange.fetch_ticker('BTC/JPY')
print(ticker['last'], ticker['baseVolume'], ticker['quoteVolume'])
```

#### **Raw HTTP**

```python
import requests

response = requests.get('https://api.zaif.jp/api/1/ticker/btc_jpy')
ticker = response.json()
print(ticker['last'], ticker['volume'])
```

<!-- tabs:end -->

The raw call is short, and that is the honest case for it. What it returns is `{"last": ..., "high": ..., "low": ..., "vwap": ..., "volume": ..., "bid": ..., "ask": ...}` — no timestamp, no quote volume, no close, and field names that only Zaif uses.

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure): `last` and `close` both populated, `baseVolume` from Zaif's `volume`, `quoteVolume` computed as `volume × vwap` with `Precise` string arithmetic, and `timestamp` left `None` rather than invented, because Zaif does not send one. Every other exchange in the library returns the same keys, so the code that consumes it does not care which venue it came from.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.zaif({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/JPY', 'limit', 'buy', 0.001, 9000000)
print(order['id'])
```

#### **Raw HTTP**

```python
import hashlib
import hmac
import time
import urllib.parse
import requests

API_KEY = '...'
API_SECRET = b'...'

def private(method, **params):
    params['method'] = method
    params['nonce'] = '%.8f' % time.time()
    body = urllib.parse.urlencode(params)
    signature = hmac.new(API_SECRET, body.encode(), hashlib.sha512).hexdigest()
    response = requests.post(
        'https://api.zaif.jp/tapi',
        data=body,
        headers={
            'Key': API_KEY,
            'Sign': signature,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    )
    payload = response.json()
    if payload.get('success') != 1:
        raise RuntimeError(payload.get('error'))
    return payload['return']

result = private('trade', currency_pair='btc_jpy', action='bid',
                 amount=0.001, price=9000000)
print(result['order_id'])
```

<!-- tabs:end -->

That is the whole private API in one function, and it is not hard — but every line of it is a place to be subtly wrong. `bid` and `ask` mean buy and sell, not the sides of the book. The signature covers the urlencoded body exactly as sent, so any re-encoding between signing and posting breaks it. `success` is `1`, not `true`. And the nonce is the part that bites.

## Where the differences actually bite

### The nonce

Zaif's trading API requires the `nonce` to increase on every request for a given key, and its documentation explicitly allows fractional increments. CCXT generates it as the current time in seconds to eight decimal places, which keeps it increasing across process restarts and gives room for many requests inside the same second.

Get this wrong and you do not get a clear error — you get intermittent rejections that depend on how fast your loop is running, and they get worse under load. If two processes share one API key, they will fight over the nonce. This is a Zaif-specific trap that CCXT has already been through.

### Rate limits you do not have to model

Zaif's documented limits differ sharply per endpoint. CCXT encodes them as per-endpoint weights in the exchange definition and paces requests with a token-bucket throttler that is on by default:

| Endpoint | Documented limit | CCXT weight |
| --- | --- | --- |
| `trade_history` | 12 requests / 60 seconds | 50 |
| `get_info` | 10 requests / 10 seconds | 10 |
| `get_info2` | 20 requests / 10 seconds | 5 |
| `active_orders` | 10 requests / 5 seconds | 5 |
| `tlapi` `get_positions` | 10 requests / 60 seconds | 66 |
| `tlapi` `create_position` | 3 requests / 10 seconds | 33 |

With `enableRateLimit = True` (the default) you call methods in a loop and the library spaces them out. Hand-rolled, backing off correctly per endpoint is application code you write and keep in sync with the docs.

### Precision and JPY markets

Zaif's `currency_pairs/all` endpoint returns `item_unit_step`, `aux_unit_point`, `item_unit_min` and `aux_unit_min` per pair. CCXT loads them into the [market structure](/docs/manual#market-structure) as `precision` and `limits`, and applies them:

```python
amount = exchange.amount_to_precision('BTC/JPY', 0.0012345678)
price = exchange.price_to_precision('BTC/JPY', 9123456.789)
```

JPY quotes make this more than cosmetic: prices are large integers with a step size, and floats that look fine in Python arrive at the venue with a trailing digit that gets the order rejected.

### Failures arrive as HTTP 200

Zaif signals a failed private call with `{"success": 0, "error": "..."}` and a failed public call with `{"error": "unsupported currency_pair"}` — both inside a 200 response. Code that only checks the status code will treat a rejected order as a placed one.

CCXT inspects `error` and `success` on every Zaif response and raises rather than returning. The messages it recognises map to typed exceptions (`unsupported currency_pair` becomes `BadRequest`); anything else becomes `ExchangeError`. Both descend from `BaseError`, as do the transport, timeout and rate-limit errors the base class raises for every exchange, so one `except ccxt.BaseError` block covers Zaif and everything else you add later. Zaif's message-to-exception map is thinner than a large venue's simply because Zaif publishes fewer distinct error strings.

### Nothing is hidden — the implicit API

CCXT models 11 unified capabilities for Zaif, which is a small number because Zaif's spot API is small. All 34 endpoints are still generated as callable methods, including the API groups CCXT does not model as unified calls:

```python
# leverage trading (tlapi)
positions = exchange.tlapi_post_active_positions({'type': 'margin'})

# futures public data (fapi)
depth = exchange.fapi_get_depth_group_id_pair({'group_id': 1, 'pair': 'btc_jpy'})

# invoicing (ecapi)
invoice = exchange.ecapi_post_get_invoice({'invoice_id': '...'})
```

Signing, nonce generation, rate-limit accounting and error mapping all still apply. Browse them on the [zaif implicit API page](/docs/exchanges/zaif/implicit-api).

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures. A hand-rolled Zaif client is a hand-rolled Zaif client in each language you need it in — and the HMAC-SHA512-over-urlencoded-body detail has to be re-derived every time.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.zaif ();
const ticker = await exchange.fetchTicker ('BTC/JPY');
```

#### **Python**

```python
import ccxt
exchange = ccxt.zaif()
ticker = exchange.fetch_ticker('BTC/JPY')
```

#### **PHP**

```php
$exchange = new \ccxt\zaif();
$ticker = $exchange->fetch_ticker('BTC/JPY');
```

<!-- tabs:end -->

## What the raw API does better

Real advantages, and for Zaif some of them matter more than usual:

- **Streaming.** Zaif documents a WebSocket at `wss://ws.zaif.jp/stream?currency_pair={currency_pair}` that pushes the order book, trades and last price. CCXT has **no** `watch*` methods for Zaif, so if you need live pushes rather than polling, you have to open that socket yourself. Zaif's docs ask you to keep new connections to roughly four per second per IP.
- **Leverage and futures trading.** Zaif's leverage API (`tlapi`) and futures public API (`fapi`) are not modelled as unified CCXT methods — `exchange.has['margin']` is not `True`, and there is no unified `create_position`. You can call every one of those endpoints through CCXT's implicit API, but the request and response shapes are Zaif's, so at that point you are writing Zaif-specific code either way.
- **The payment and invoicing API.** Zaif's `ecapi` invoice endpoints have nothing to do with trading and no unified equivalent anywhere in CCXT. Raw calls, or CCXT implicit methods, are the only options.
- **The documentation is the source of truth.** Zaif's reference is detailed, is written in Japanese, and includes sample code per endpoint. If you read Japanese and are only ever calling Zaif, working straight from it removes an abstraction layer.

If you need exactly one Zaif endpoint, or you need the streaming socket, or you are building on the leverage API, going direct is reasonable. If you need a normalised ticker, order book, order lifecycle and balance — and you might add another exchange — that is the case CCXT exists for.

## Migrating from raw HTTP to CCXT

| What you are doing | Raw Zaif API | CCXT |
| --- | --- | --- |
| Symbols | `'btc_jpy'` | `'BTC/JPY'` |
| Markets | `GET /api/1/currency_pairs/all` | `load_markets()` |
| Ticker | `GET /api/1/ticker/{pair}` | `fetch_ticker()` |
| Order book | `GET /api/1/depth/{pair}` | `fetch_order_book()` |
| Public trades | `GET /api/1/trades/{pair}` | `fetch_trades()` |
| New order | `POST /tapi` `method=trade` | `create_order()` (limit only) |
| Cancel order | `POST /tapi` `method=cancel_order` | `cancel_order()` |
| Open orders | `POST /tapi` `method=active_orders` | `fetch_open_orders()` |
| Trade history | `POST /tapi` `method=trade_history` | `fetch_closed_orders()` |
| Balance | `POST /tapi` `method=get_info` | `fetch_balance()` |
| Leverage positions | `POST /tlapi` | implicit `tlapi_post_*` methods |
| Anything not listed | the endpoint | the same endpoint as an [implicit method](/docs/exchanges/zaif/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [zaif unified API reference](/docs/exchanges/zaif).

## FAQ

**Does Zaif have an official API library?**
Not a maintained one. The best-known wrappers are community projects: `zaifapi` for Python, whose most recent PyPI release is version 1.6.3 from August 2018, and `zaif.jp` for Node, whose most recent publish is version 0.1.16 from December 2017. Both are MIT-licensed. CCXT's `zaif` implementation is actively maintained alongside 103 other exchanges.

**Does CCXT support Zaif WebSockets?**
No. `zaif` has zero `watch*` methods in CCXT, so there is no `ccxt.pro.zaif` streaming support. Zaif does publish a streaming endpoint at `wss://ws.zaif.jp/stream`, and you would consume it directly. Everything else — ticker, order book, trades, orders, balance — is available over REST through CCXT.

**How do I sign a Zaif private request?**
POST to `https://api.zaif.jp/tapi` with the parameters urlencoded in the body, including a `method` field naming the call and an always-increasing `nonce`. Send your key in a `Key` header and the HMAC-SHA512 of the exact body, keyed by your secret, in a `Sign` header. CCXT does this for you, including generating a fractional nonce that survives process restarts.

**Can CCXT place market orders on Zaif?**
No. `create_order` on `zaif` accepts `'limit'` only and raises otherwise, because the underlying `trade` endpoint requires a price.

**Can I use CCXT for Zaif's leverage trading?**
Not through unified methods. The leverage endpoints are reachable as implicit methods (`tlapi_post_active_positions`, `tlapi_post_create_position` and the rest), with signing and rate limiting applied, but the request and response shapes are Zaif's own.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support for the 76 exchanges that have it.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [zaif unified API reference](/docs/exchanges/zaif)
- [zaif implicit API](/docs/exchanges/zaif/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
