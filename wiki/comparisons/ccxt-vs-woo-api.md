<!-- title: CCXT vs the raw WOO X API -->
<!-- description: WOO X publishes no SDK and signs v1 and v3 endpoints differently. CCXT compared on signing, rate limits, WebSocket budgets and errors. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: WOO X ships documentation and signing examples but no client library. CCXT is a certified integration for it — 79 unified capabilities, 16 watch* methods and all 133 raw endpoints. -->
<!-- weight: 100 -->

# CCXT vs the raw WOO X API

WOO X documents its API at [docs.woox.io](https://docs.woox.io/) with signing examples in several languages. What it does not publish is a maintained client library — the SDKs under the `woonetwork` GitHub organisation are for WOOFi, the on-chain swap protocol, not for the WOO X exchange, and the exchange documentation does not reference an SDK for itself.

So this is a comparison between [CCXT](/docs/manual) and the client you write yourself. The question that decides it: **do you want to implement two different signing schemes for one exchange?**

## TL;DR

- **Go direct** if you call a handful of endpoints, want field names identical to the docs, or need something outside the 133 endpoints CCXT models.
- **Pick CCXT** if you want both of WOO X's signing schemes handled, spot, margin and perpetuals in one client, 16 streaming methods, staging endpoints behind one flag, and typed errors instead of numeric codes.
- **WOO X is a certified CCXT exchange**, meaning it is covered by the static request and response regression fixtures that run in CI on every change.

## At a glance

| | **CCXT** | **Raw WOO X API** |
| --- | --- | --- |
| Exchanges covered | 104 (WOO X is one of them) | WOO X only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | whatever you write it in |
| Official client library | — | none published for the exchange |
| Install | `pip install ccxt` / `npm i ccxt` | your own HTTP and WebSocket client |
| Products in one client | spot, margin and perpetual swap | one code path per endpoint family |
| Signing | v1 and v3 schemes, both handled | two schemes you implement and keep straight |
| Unified market data + trading API | yes — same method names on every exchange | no — WOO X's own request and response shapes |
| WebSockets | yes — 16 `watch*` / `unWatch*` methods, including `watchFundingRate` and `watchPositions` | your own socket client, inside an 80-connection / 50-topic budget |
| Raw endpoint access | yes — 133 WOO X endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 100 ms) | your code, against 10 requests per second |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP 429 plus WOO X error codes |
| Testnet / staging | `exchange.set_sandbox_mode(True)` swaps in `api.staging.woox.io` | change base URLs yourself |
| Regression coverage | certified — static request/response fixtures run in CI | — |
| Licence | MIT | — |
| Support | Discord, Telegram, GitHub issues — usually same-day | exchange support channels |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}} and WOO X's published API documentation at docs.woox.io.</sub>

CCXT implements **79 unified capabilities** for WOO X, **37** of them `fetch*` methods, and marks it a **certified** exchange — it is covered by the static request and response regression fixtures that run in CI, so a change that would alter a WOO X request shape fails the build rather than reaching you.

## The same job, written both ways

### Fetch an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.woo()
orderbook = exchange.fetch_order_book('BTC/USDT:USDT')
print(orderbook['bids'][0], orderbook['asks'][0])
```

#### **raw HTTP**

```python
import requests

r = requests.get('https://api-pub.woox.io/v1/public/orderbook/PERP_BTC_USDT')
print(r.json())
```

<!-- tabs:end -->

WOO X symbols are prefixed by product: `SPOT_BTC_USDT` for spot, `PERP_BTC_USDT` for the perpetual. CCXT normalises both into `'BTC/USDT'` and `'BTC/USDT:USDT'`, so the prefix never appears in your code, and returns a [unified order book structure](/docs/manual#order-book-structure) rather than WOO X's payload.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.woo({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **raw HTTP**

```python
import datetime
import hashlib
import hmac
import requests

api_key, api_secret = '...', '...'

def generate_signature(data):
    return hmac.new(api_secret.encode('utf-8'),
                    data.encode('utf-8'), hashlib.sha256).hexdigest()

milliseconds_since_epoch = round(datetime.datetime.now().timestamp() * 1000)
data = ('client_order_id=123456&order_price=60000&order_quantity=0.001'
        '&order_type=LIMIT&side=BUY&symbol=PERP_BTC_USDT')

headers = {
    'x-api-timestamp': str(milliseconds_since_epoch),
    'x-api-key': api_key,
    'x-api-signature': generate_signature(data + '|' + str(milliseconds_since_epoch)),
    'Content-Type': 'application/x-www-form-urlencoded',
}
r = requests.post('https://api.woox.io/v1/order', headers=headers, data=data)
print(r.json())
```

<!-- tabs:end -->

Look at the string being signed. On **v1** endpoints it is the query and body parameters **in alphabetical order**, then a literal `|`, then the timestamp — form-encoded, with `Content-Type: application/x-www-form-urlencoded`. On **v3** endpoints it is the timestamp, then the HTTP method, then the request path, then the JSON body, with `Content-Type: application/json`. Same exchange, same credentials, two incompatible schemes, and the failure mode for getting one wrong is an authentication error that tells you nothing about which part was wrong.

CCXT picks the scheme from the endpoint version and builds the string either way.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.woo()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT:USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **raw WebSocket**

```python
import json
import websockets

async def main():
    url = 'wss://wss.woox.io/ws/stream/<application_id>'  # CCXT takes this as `uid`
    async with websockets.connect(url) as ws:
        await ws.send(json.dumps({
            'id': '1',
            'event': 'subscribe',
            'topic': 'PERP_BTC_USDT@orderbookupdate',
        }))
        while True:
            print(json.loads(await ws.recv()))
            # snapshot alignment, sequence gaps, ping/pong, reconnect: yours
```

<!-- tabs:end -->

CCXT returns a merged, depth-limited order book on every update, re-seeds after a drop, and keeps one client per URL — which matters here, because WOO X caps concurrent WebSocket connections at 80 per account with at most 50 topics per connection. Fan out naively and you hit the ceiling; CCXT multiplexes topics onto shared connections by default.

## Where the differences actually bite

### Two signing schemes, one exchange

This is the WOO X-specific one, and it is the main reason a hand-rolled client here takes longer than you expect. WOO X's v1 and v3 endpoint families sign different strings, use different content types, and put the parameters in different places. A client written against the v1 docs breaks the moment you reach for a v3 endpoint, and the error message does not say why.

In CCXT the version is a property of the endpoint definition. You call `create_order` or a v3 implicit method and the right scheme is applied.

### Spot, margin and perpetuals in one client

`ccxt.woo` covers WOO X spot, margin and perpetual swap markets in one instance. Unified symbols keep them apart — `'BTC/USDT'` for spot, `'BTC/USDT:USDT'` for the perpetual — and the method names do not change between them.

### Rate limits you do not have to model

WOO X documents 10 requests per second per IP on public endpoints and 10 per second per account on private ones, with HTTP 429 when you exceed them. CCXT encodes per-endpoint costs in the exchange definition and ships a token-bucket throttler that is on by default (`enableRateLimit = True`, `rateLimit = 100` ms). You call methods in a loop and the library paces them.

### WebSocket budgets you do not have to count

WOO X caps 80 concurrent WebSocket connections per account, 50 topics per connection, and 1,000 concurrent connections per IP. CCXT keeps one `Client` per URL and multiplexes subscriptions onto it, so a strategy watching thirty symbols uses one connection rather than thirty.

CCXT gives WOO X 16 streaming methods: `watchTicker`, `watchTickers`, `watchBidsAsks`, `watchTrades`, `watchOHLCV`, `watchOrderBook`, `watchFundingRate`, `watchOrders`, `watchMyTrades`, `watchPositions`, `watchBalance` and five `unWatch*` counterparts. `watchFundingRate` in particular is not something you get from a generic WebSocket wrapper — it is a WOO X-specific stream modelled as a unified method.

### WebSockets that look like REST

`watch_order_book` returns the same structure as `fetch_order_book`; `watch_orders` the same as `fetch_orders`. Swapping a polling loop for a stream is a one-word change, and the code downstream is untouched. Underneath, CCXT handles ping/pong keep-alive with miss detection, automatic reconnect and resubscribe, and bounded caches for trades and candles.

### Precision, rounding and string math

WOO X rejects orders that violate a symbol's tick size, step size or minimum notional. CCXT loads that metadata with the markets and gives you helpers backed by the `Precise` string-arithmetic class, so quantities do not drift through float rounding:

```python
amount = exchange.amount_to_precision('BTC/USDT:USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT:USDT', 61234.56789)
```

### One error hierarchy

CCXT maps WOO X's error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError` and 35 more, all descending from `BaseError`. You catch `ccxt.InsufficientFunds` once and it keeps working on the next venue.

### Staging without a second code path

```python
exchange = ccxt.woo({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)   # swaps in api.staging.woox.io
```

One flag swaps every REST and WebSocket URL, including the public host. No constant swapping, no forked configuration.

### Nothing is hidden — the implicit API

Alongside the 79 unified capabilities, **all 133 WOO X endpoints are generated as callable implicit methods**, with version-appropriate signing, rate-limit accounting and error mapping applied. Browse them on the [WOO X implicit API page](/docs/exchanges/woo/implicit-api).

## What going direct does better

An honest list:

- **Field names match the docs exactly.** When you are reading `docs.woox.io` while debugging, a payload whose keys are `order_price`, `order_quantity` and `client_order_id` lines up with the reference one field at a time. CCXT's unified names are a deliberate abstraction and one hop away from it.
- **The docs ship working signing examples.** WOO X's authentication page has runnable Python for both signing schemes. If you only need two endpoints, copying that is faster than learning a library.
- **`api-recvwindow` and other per-request controls.** WOO X exposes an optional `api-recvwindow` header for VIP accounts, and various endpoint-specific parameters. CCXT passes unrecognised `params` straight through, but a hand-rolled client makes those controls immediately visible rather than something you look up.
- **Endpoints outside the 133 CCXT models.** Anything WOO X adds is callable over HTTP the moment it ships. CCXT's implicit API picks it up on the next release; a *unified* wrapper may lag longer.
- **A smaller dependency.** Three endpoints and thirty lines of signing code is less than all of CCXT.

If WOO X is your only venue and you only touch v1 public endpoints, going direct is perfectly reasonable.

## Migrating from the raw WOO X API to CCXT

| What you are doing | Raw WOO X API | CCXT |
| --- | --- | --- |
| Base URLs | `api.woox.io`, `api-pub.woox.io`, `api.staging.woox.io` | handled by the exchange definition |
| Symbols | `SPOT_BTC_USDT`, `PERP_BTC_USDT` | `'BTC/USDT'`, `'BTC/USDT:USDT'` |
| Auth | `x-api-key` + `x-api-signature` + `x-api-timestamp`, two signing schemes | `apiKey` and `secret` on the constructor |
| Instruments | `GET /v1/public/info` | `load_markets()` |
| Ticker | `GET /v1/public/futures` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET /v1/public/orderbook/:symbol` | `fetch_order_book()` |
| Candles | `GET /v1/public/kline` | `fetch_ohlcv()` |
| New order | `POST /v1/order` | `create_order()` |
| Cancel order | `DELETE /v1/order` | `cancel_order()` |
| Open orders | the orders endpoint with a status filter | `fetch_open_orders()` |
| Balance | the balances endpoint | `fetch_balance()` |
| Positions | the positions endpoint | `fetch_positions()` |
| Funding rate | `GET /v1/public/funding_rate/{symbol}` | `fetch_funding_rate()` / `watch_funding_rate()` |
| Streams | `wss://wss.woox.io/ws/stream/<application_id>` (public), `wss://wss.woox.io/v2/ws/private/stream/<application_id>` (private) | `watch_*` on `ccxt.pro.woo`, with the id as `uid` |
| Anything not listed | the endpoint | the same endpoint as an [implicit method](/docs/exchanges/woo/implicit-api) |

## FAQ

**Does WOO X have an official SDK?**
No. WOO X publishes API documentation with signing examples, but no maintained client library for the exchange. The SDKs under the `woonetwork` GitHub organisation target WOOFi, its on-chain swap protocol, not WOO X.

**Why does WOO X need two different signatures?**
Its v1 and v3 endpoint families were designed at different times. v1 signs the query and body parameters in alphabetical order, followed by `|` and the millisecond timestamp, and sends form-encoded bodies. v3 signs the timestamp, HTTP method, request path and JSON body, and sends JSON. Both use HMAC-SHA256 in the `x-api-signature` header. CCXT selects the right one per endpoint.

**Does CCXT support the WOO X staging environment?**
Yes. `exchange.set_sandbox_mode(True)` swaps every REST and WebSocket URL to WOO X's staging hosts, including the public one.

**Is `woo` a certified CCXT exchange?**
Yes. WOO X is marked certified, which means it is covered by CCXT's static request and response regression fixtures — a change that would alter a WOO X request or misparse a WOO X response fails CI rather than shipping.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.woo` and call `watch*` methods — WOO X has 16 of them, including `watch_funding_rate` and `watch_positions`.

**Can I install just WOO X support instead of all of CCXT?**
Yes, if you are in Python. CCXT publishes a single-exchange build for this venue as `woo-api` on PyPI, from [`ccxt/woo-python`](https://github.com/ccxt/woo-python), with `WooSync`, `WooAsync` and WebSocket clients. It is MIT-licensed and generated from the same source as the main library.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [woo unified API reference](/docs/exchanges/woo)
- [woo implicit API](/docs/exchanges/woo/implicit-api) — all 133 raw endpoints
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
