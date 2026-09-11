<!-- title: CCXT vs the HitBTC API -->
<!-- description: HitBTC publishes API documentation but no client library. What CCXT adds over calling the raw REST API — signing, rate limits, order books, precision and errors. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: HitBTC ships documentation, not an SDK, so the real comparison is CCXT against raw HTTP. CCXT unifies HitBTC's three parallel spot / margin / futures endpoint families — and the same class drives Bequant and FMFW.io. -->
<!-- weight: 100 -->

# CCXT vs the HitBTC API

HitBTC's REST and streaming API v3 is well documented and covers spot, isolated and cross margin, and futures. What it does not come with is a client library: HitBTC's own GitHub repository, `hitbtc-com/hitbtc-api`, is an API-documentation repository whose README points at the v3 reference. There is no HitBTC-maintained SDK in any language.

So the honest comparison is not CCXT against a vendor SDK. It is **CCXT against the code you would write yourself** — signing, rate limiting, pagination, order-book maintenance, precision and error handling — and that comparison has a clear shape.

## TL;DR

- **Call the raw API** if you need exactly one or two endpoints, in one language, and would rather own 200 lines than take a dependency.
- **Pick CCXT** if you need more than a handful of endpoints, want the order book maintained and the rate limiter written, or expect to touch a second venue.
- **Choosing CCXT does not hide HitBTC's API.** All 111 HitBTC endpoints are generated as [implicit methods](/docs/exchanges/hitbtc/implicit-api), signed and rate-limited like any unified call.
- **The same CCXT class already drives three venues.** `bequant` and `fmfwio` run on the HitBTC engine, and CCXT implements both by extending its `hitbtc` class — one parser, three exchanges.

## At a glance

| | **CCXT** | **The raw HitBTC API** |
| --- | --- | --- |
| Exchanges covered | 104 (HitBTC is one of them) | HitBTC only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | any language with an HTTP client, all of it your code |
| Official client library | n/a | **none** — `hitbtc-com/hitbtc-api` is a documentation repository (LGPL-3.0) |
| HitBTC products in one client | spot, margin, futures — one `ccxt.hitbtc` instance | three parallel endpoint families (`spot/*`, `margin/*`, `futures/*`) |
| Unified market data + trading API | yes — 67 unified capabilities, 35 `fetch*` methods | no — HitBTC's own request and response shapes |
| WebSockets | yes — 8 `watch*` methods, same structures as `fetch*` | raw socket, subscribe/notification protocol, your reconnect logic |
| Raw endpoint access | yes — 111 endpoints as implicit methods | yes, it is all you have |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 3.333 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus HitBTC error codes |
| Testnet / sandbox | `exchange.set_sandbox_mode(True)` | a different base URL you swap yourself |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month | the documentation repository shows 321 GitHub stars |
| Licence | MIT | n/a |
| Support | Discord, Telegram, GitHub issues — usually same-day | HitBTC support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, HitBTC's published API v3 documentation and the `hitbtc-com/hitbtc-api` repository.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.hitbtc()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw HitBTC API**

```python
import requests

url = 'https://api.hitbtc.com/api/3/public/ticker/BTCUSDT'
response = requests.get(url)
response.raise_for_status()
print(response.json())
```

<!-- tabs:end -->

For one public endpoint the raw call is shorter, and that is a fair point. The difference starts at the second endpoint: you now own symbol mapping, timestamp units, string-versus-float number handling and a response shape that differs from every other venue you will ever add.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.hitbtc({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **Raw HitBTC API**

```python
import requests
from requests.auth import HTTPBasicAuth

url = 'https://api.hitbtc.com/api/3/spot/order'
payload = {
    'symbol': 'BTCUSDT',
    'side': 'buy',
    'type': 'limit',
    'time_in_force': 'GTC',
    'quantity': '0.001',
    'price': '60000',
}
response = requests.post(url, json=payload,
                         auth=HTTPBasicAuth('API_KEY', 'API_SECRET'))
response.raise_for_status()
print(response.json())
```

<!-- tabs:end -->

HitBTC documents two authentication schemes — HTTP Basic with the key and secret, and an `HS256` HMAC-SHA256 signature with a timestamp window. Basic auth is the easy one to write and the one that makes key rotation and request replay your problem; CCXT implements the signing and you never see it.

Note the endpoint path. Placing the same order on margin is `POST /margin/order`, and on futures it is `POST /futures/order` — three families with three balance endpoints, three history endpoints and three order endpoints. In CCXT they are one `create_order` call, selected by the unified symbol and `options.defaultType`.

## Where the differences actually bite

### Three endpoint families, one unified surface

HitBTC's v3 API mirrors the same shapes across `spot/*`, `margin/*` and `futures/*`: separate `balance`, `order`, `history/order`, `history/trade`, `fee` and `account` endpoints for each. That is a clean API design, and it also means a hand-rolled integration writes the same parser three times.

CCXT's `ccxt.hitbtc` covers all three with 67 unified capabilities and 35 `fetch*` methods. `fetch_balance()`, `fetch_open_orders()` and `create_order()` route to the right family based on the market type of the symbol you pass.

### One implementation, three venues

Bequant and FMFW.io both run on the HitBTC engine, so their APIs are HitBTC-shaped. CCXT implements them as classes that extend `hitbtc` rather than as duplicated parsers:

```python
import ccxt

for exchange_id in ['hitbtc', 'bequant', 'fmfwio']:
    exchange = getattr(ccxt, exchange_id)()
    markets = exchange.load_markets()
    print(exchange_id, len(markets), 'markets')
```

Credentials and listings are each venue's own — these are different exchanges, not aliases — but the request and response handling is shared. A fix to HitBTC parsing lands in all three. See [CCXT vs the Bequant API](/docs/comparisons/ccxt-vs-bequant-api) and [CCXT vs the FMFW.io API](/docs/comparisons/ccxt-vs-fmfwio-api).

### Rate limits you do not have to model

HitBTC meters per endpoint group with burst allowances — public market data at roughly 30 requests per second with a burst of 50, order placement at roughly 300 per second with a burst of 450, and lower limits on wallet and history endpoints. CCXT encodes the relative cost of each endpoint in its `api` block (you can see the per-endpoint weights: `spot/order` costs 1, `spot/balance` costs 15, `wallet/*` costs 30) and ships a token-bucket throttler that is on by default, with `rateLimit = 3.333` ms as the base interval.

You call methods in a loop; the library paces them. With raw HTTP you write and maintain that, including backing off correctly on a `429`.

### WebSockets that look like REST

CCXT Pro — bundled in the same `ccxt` package, no separate purchase — gives HitBTC 8 streaming methods: `watchOrderBook`, `watchTicker`, `watchTickers`, `watchBidsAsks`, `watchTrades`, `watchOHLCV`, `watchOrders` and `watchBalance`.

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.hitbtc()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

`watch_order_book` returns the same structure as `fetch_order_book`. Underneath, CCXT does the work a raw stream leaves to you:

| | CCXT | raw stream |
| --- | --- | --- |
| Subscribe and correlate responses to requests | done for you | your code |
| Merge snapshot and incremental updates into a live book | done for you | your code |
| Detect sequence gaps and re-sync | done for you | your code |
| Reconnect, re-authenticate and re-subscribe after a drop | done for you | your code |
| Keep a bounded, depth-limited cache | done for you | your code |

None of those fail loudly. A hand-rolled book drifts, and you find out from a fill you did not expect.

### Precision, rounding and string math

HitBTC uses tick-size precision, and rejects orders that violate tick size, quantity increment or minimum notional. CCXT loads that metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities do not drift through float rounding.

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

### One error hierarchy

CCXT maps HitBTC's error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all under `BaseError`. `except ccxt.InsufficientFunds` keeps working when you add a second exchange; matching on numeric codes does not.

### Demo environment without a second code path

```python
exchange = ccxt.hitbtc({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)   # swaps in api.demo.hitbtc.com
```

One flag swaps the REST and WebSocket hosts to HitBTC's demo environment. No constant swapping, no forked configuration.

### Nothing is hidden — the implicit API

Alongside the 67 unified capabilities, all 111 endpoints in CCXT's HitBTC `api` block are generated as callable implicit methods, camelCased from their paths:

```python
converted = exchange.public_get_public_converted_candles()
subaccounts = exchange.private_get_sub_account()
```

Signing, rate-limit accounting and error mapping still apply. Browse them on the [HitBTC implicit API page](/docs/exchanges/hitbtc/implicit-api).

## What the raw HitBTC API does better

An honest list, because these are real:

- **Zero dependencies and a smaller surface.** If your integration is "poll one public ticker every minute", `requests.get` plus twelve lines is genuinely the right answer, and it will never break because a library changed.
- **Literal fidelity to the documentation.** The raw payload is the payload in HitBTC's reference. Every field is there, in HitBTC's own names, with nothing normalised away. When you are debugging against the vendor docs that is one fewer hop.
- **Endpoints and fields CCXT does not unify.** Sub-account ACLs, airdrops, amount locks, internal withdrawals and the crypto-address check-mine endpoint are HitBTC-specific. CCXT reaches them as raw implicit calls, but they are not unified methods with typed structures.
- **You control the failure modes.** Your own client's retry, timeout and backoff policy is exactly what you wrote, with no library behaviour to reason about.

If HitBTC is your only venue and your integration is small and static, the raw API is a perfectly reasonable choice.

## Migrating from the raw HitBTC API to CCXT

| What you are doing | HitBTC REST v3 | CCXT |
| --- | --- | --- |
| Symbols | `BTCUSDT` | `'BTC/USDT'` (spot), `'BTC/USDT:USDT'` (futures) |
| Product selection | `spot/*`, `margin/*`, `futures/*` paths | `options.defaultType` and the unified symbol |
| Symbol list | `/public/symbol` | `load_markets()` |
| Currencies | `/public/currency` | `fetch_currencies()` |
| Ticker | `/public/ticker/{symbol}` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `/public/orderbook/{symbol}` | `fetch_order_book()` |
| Candles | `/public/candles/{symbol}` | `fetch_ohlcv()` |
| Public trades | `/public/trades/{symbol}` | `fetch_trades()` |
| New order | `POST /spot/order` | `create_order()` |
| Cancel order | `DELETE /spot/order/{client_order_id}` | `cancel_order()` |
| Open orders | `GET /spot/order` | `fetch_open_orders()` |
| Order history | `/spot/history/order` | `fetch_closed_orders()` |
| My trades | `/spot/history/trade` | `fetch_my_trades()` |
| Balance | `/spot/balance`, `/wallet/balance` | `fetch_balance()` |
| Positions | `/futures/account` | `fetch_positions()` |
| Streams | raw WebSocket subscribe protocol | `watch_*` on `ccxt.pro.hitbtc` |
| Anything not listed | the raw endpoint | the same endpoint as an [implicit method](/docs/exchanges/hitbtc/implicit-api) |

## FAQ

**Does HitBTC have an official SDK?**
No client library, as of this writing. HitBTC's GitHub repository `hitbtc-com/hitbtc-api` is a documentation repository — its README introduces API v3 and links to the reference. The Python, Node, C# and Java wrappers you will find in search results are community projects, not HitBTC-maintained. CCXT is the maintained multi-language option.

**Does CCXT support HitBTC futures and margin, or only spot?**
All three. `ccxt.hitbtc` covers spot, isolated and cross margin, and futures from one instance, with 67 unified capabilities. Select with the unified symbol and `options.defaultType`.

**Are Bequant and FMFW.io the same exchange as HitBTC?**
No — they are separate venues with their own accounts, listings and credentials, but they run on the HitBTC engine, so their APIs are HitBTC-shaped. CCXT implements `bequant` and `fmfwio` as classes extending `hitbtc`, which means one parser is maintained for three venues. Your HitBTC API keys do not work on the other two.

**How do I use HitBTC's demo environment with CCXT?**
Call `exchange.set_sandbox_mode(True)`, which swaps the REST and WebSocket hosts to `api.demo.hitbtc.com`. Generate demo credentials from HitBTC's demo site.

**Can I still call HitBTC-specific endpoints through CCXT?**
Yes — all 111 endpoints in CCXT's HitBTC definition are generated as [implicit methods](/docs/exchanges/hitbtc/implicit-api), with signing, rate limiting and error mapping applied.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.hitbtc` and call `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [hitbtc unified API reference](/docs/exchanges/hitbtc)
- [hitbtc implicit API](/docs/exchanges/hitbtc/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [CCXT vs the Bequant API](/docs/comparisons/ccxt-vs-bequant-api) and [CCXT vs the FMFW.io API](/docs/comparisons/ccxt-vs-fmfwio-api)
- [More comparisons](/docs/comparisons)
