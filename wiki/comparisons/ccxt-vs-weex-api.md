<!-- title: CCXT vs the raw WEEX API -->
<!-- description: WEEX publishes no client library. CCXT compared on passphrase signing, weight-based rate limits, dual WebSocket hosts and typed errors. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: WEEX ships documentation but no SDK. CCXT gives it 83 unified capabilities — its widest coverage of any venue in this group — 25 streaming methods and all 76 raw endpoints. -->
<!-- weight: 100 -->

# CCXT vs the raw WEEX API

WEEX documents its API at [weex.com/api-doc](https://www.weex.com/api-doc/spot/introduction/APIBriefIntroduction) — spot, futures, broker, partner and copy-trading sections, with a signature page and an access-restrictions page. What it does not publish is a client library. There is no WEEX SDK repository, and the exchange's documentation does not reference one. A `weex-sdk` package exists on PyPI, published under Apache-2.0 by "Weex SDK Contributors", but its listed repository URL does not resolve and it is not referenced from WEEX's own documentation.

So the comparison is between [CCXT](/docs/manual) and the client you write yourself. The question that decides it: **how much of the plumbing do you want to own?**

## TL;DR

- **Go direct** if you call a handful of public endpoints, want field names identical to the docs, or need one of the endpoint families the unified API does not model — broker, partner or copy-trading.
- **Pick CCXT** if you want spot and futures from one client, four-header passphrase signing built for you, weight accounting on by default, and streaming methods that return the same structures as the REST calls.
- **CCXT is not a subset.** All 76 WEEX endpoints are generated as [implicit methods](/docs/exchanges/weex/implicit-api), signed and throttled like the unified ones.

## At a glance

| | **CCXT** | **Raw WEEX API** |
| --- | --- | --- |
| Exchanges covered | 104 (WEEX is one of them) | WEEX only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | whatever you write it in |
| Official client library | — | none published by the exchange |
| Install | `pip install ccxt` / `npm i ccxt` | your own HTTP and WebSocket client |
| Products in one client | spot and perpetual swap | separate endpoint trees and separate WebSocket hosts |
| Unified market data + trading API | yes — same method names on every exchange | no — WEEX's own request and response shapes |
| WebSockets | yes — 25 `watch*` / `unWatch*` methods implemented | two socket hosts, subscription and merge logic yours |
| Raw endpoint access | yes — 76 WEEX endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 20 ms) | your code, against `X-USED-WEIGHT-*` headers |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP 429 plus WEEX error codes |
| Testnet / sandbox | no — WEEX declares `'sandbox': false` and has no `urls.test` | no |
| Licence | MIT | — |
| Support | Discord, Telegram, GitHub issues — usually same-day | exchange support channels |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, `ts/src/pro/weex.ts` in the CCXT source tree, and WEEX's published spot API documentation.</sub>

CCXT implements **83 unified capabilities** for WEEX, **37** of them `fetch*` methods — the widest coverage of any venue on this page.

## A note on the streaming count

`ts/src/pro/weex.ts` implements 25 streaming methods, but four of them — `watchOrderBook`, `watchOrderBookForSymbols`, `unWatchOrderBook` and `unWatchOrderBookForSymbols` — are currently declared `false` in the class's `has` block, so `exchange.has['watchOrderBook']` reports `False` and capability-gated tests skip them. The implementations are there: `watchOrderBookForSymbols` subscribes to WEEX's depth channel (`<marketId>@depth200`, with a `depth` option of `'200'` or `'15'`), merges the book, and `watchOrderBook` delegates to it for a single symbol.

Treat the count as: **21 flagged streaming capabilities, 25 implemented methods**, with order-book streaming present but not yet advertised through `has`. If you rely on the `has` flags to gate behaviour, check them rather than assuming.

The 21 flagged methods are `watchTicker`, `watchTickers`, `watchTrades`, `watchTradesForSymbols`, `watchOHLCV`, `watchOHLCVForSymbols`, `watchBidsAsks`, `watchOrders`, `watchMyTrades`, `watchPositions`, `watchBalance` and their ten `unWatch*` counterparts.

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.weex()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **raw HTTP**

```python
import requests

r = requests.get('https://api-spot.weex.com/api/v3/market/ticker/24hr',
                 params={'symbol': 'BTCUSDT'},
                 headers={'User-Agent': 'my-client'})
print(r.json())
```

<!-- tabs:end -->

Note the `User-Agent`. CCXT's `weex` implementation sets one explicitly on public REST calls and on the WebSocket handshake, with a source comment that the exchange requires headers — the kind of detail you discover from a failed call rather than from the reference.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.weex({
    'apiKey': '...',
    'secret': '...',
    'password': '...',   # WEEX requires an API passphrase as well
})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **raw HTTP**

```python
import base64
import hashlib
import hmac
import json
import time
import requests

api_key, secret, passphrase = '...', '...', '...'
path = '/api/v3/order'
body = json.dumps({'symbol': 'BTCUSDT', 'side': 'BUY', 'type': 'LIMIT',
                   'price': '60000', 'quantity': '0.001'})
timestamp = str(int(time.time() * 1000))

payload = timestamp + 'POST' + path + body
signature = base64.b64encode(
    hmac.new(secret.encode(), payload.encode(), hashlib.sha256).digest()).decode()

r = requests.post('https://api-spot.weex.com' + path, data=body, headers={
    'ACCESS-KEY': api_key,
    'ACCESS-SIGN': signature,
    'ACCESS-PASSPHRASE': passphrase,
    'ACCESS-TIMESTAMP': timestamp,
    'Content-Type': 'application/json',
})
print(r.json())
```

<!-- tabs:end -->

WEEX signs a **Base64**-encoded HMAC-SHA256 over `timestamp + METHOD + requestPath + "?" + queryString + body` — not the hex digest most venues use — and requires a fourth credential, the API passphrase, in `ACCESS-PASSPHRASE`. The timestamp is rejected if it drifts more than 30 seconds from server time. Get the encoding, the concatenation order or the passphrase wrong and every private call fails identically.

### Stream trades

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.weex()
    while True:
        trades = await exchange.watch_trades('BTC/USDT')
        for t in trades:
            print(t['symbol'], t['side'], t['amount'], t['price'])

asyncio.run(main())
```

#### **raw WebSocket**

```python
import json
import websockets

async def main():
    # spot and contract are different hosts
    url = 'wss://ws-spot.weex.com/v3/ws/public'
    async with websockets.connect(url, extra_headers={'User-Agent': 'my-client'}) as ws:
        await ws.send(json.dumps({'id': '1',
                                  'method': 'SUBSCRIBE',
                                  'params': ['BTCUSDT@trade']}))
        while True:
            print(json.loads(await ws.recv()))
            # ping/pong, reconnect, resubscribe and caching are yours
```

<!-- tabs:end -->

Spot and contract markets live on **two different WebSocket hosts** — `wss://ws-spot.weex.com/v3/ws` and `wss://ws-contract.weex.com/v3/ws`. CCXT picks the right one from the market you pass and keeps one client per URL, so a strategy that watches a spot pair and a perpetual at the same time does not have to manage two connection pools.

## Where the differences actually bite

### Four credentials, one constructor

WEEX private requests need an API key, a secret **and** a passphrase. In CCXT they are `apiKey`, `secret` and `password` on the constructor, and the library assembles `ACCESS-KEY`, `ACCESS-SIGN`, `ACCESS-PASSPHRASE` and `ACCESS-TIMESTAMP` on every call, with the Base64 signature over the correct concatenation.

### Spot and swap in one client

`ccxt.weex` covers WEEX spot and perpetual swap markets in one instance. Unified symbols keep them apart — `'BTC/USDT'` for spot, `'BTC/USDT:USDT'` for the linear perpetual — and the method names do not change. Going direct means two endpoint trees, two signing hosts and two socket hosts.

### Rate limits you do not have to model

WEEX meters most endpoints by IP and order-placement endpoints by account (`userId`), reports usage in `X-USED-WEIGHT-*` and `X-REMAINING-WEIGHT-*` headers (and `X-ORDER-COUNT-*` for order endpoints), and answers 429 with a 10-second ban when you cross a limit. Public endpoints are documented at 20 requests per 2 seconds.

CCXT encodes per-endpoint costs in the exchange definition and ships a token-bucket throttler that is on by default (`enableRateLimit = True`, `rateLimit = 20` ms). You call methods in a loop and the library paces them rather than reading headers and backing off yourself.

### WebSockets that look like REST

`watch_trades` returns the same structure as `fetch_trades`; `watch_orders` the same as `fetch_orders`. Swapping polling for streaming is a one-word change, and the code downstream is untouched. Underneath, CCXT handles connection pooling per URL, ping/pong keep-alive with miss detection, automatic reconnect and resubscribe, and bounded caches.

WEEX also gets `unWatch*` counterparts for ten of those streams, so a symbol universe that changes at runtime can be unsubscribed cleanly rather than by tearing down the connection. And `watchBalance` and `watchPositions` seed themselves from a REST snapshot first (`fetchBalanceSnapshot`, `fetchPositionsSnapshot`), so the first value you receive is complete rather than the first delta that happens to arrive.

### Precision, rounding and string math

WEEX rejects orders that violate a symbol's tick size, step size or minimum notional. CCXT loads that metadata with the markets and gives you helpers backed by the `Precise` string-arithmetic class, so quantities do not drift through float rounding:

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

### One error hierarchy

CCXT maps WEEX's error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError` and 35 more, all descending from `BaseError`. You catch `ccxt.RateLimitExceeded` once instead of matching on codes and re-doing it on the next venue.

### Nothing is hidden — the implicit API

Alongside the 83 unified capabilities, **all 76 WEEX endpoints are generated as callable implicit methods**, with signing, rate-limit accounting and error mapping applied. Browse them on the [WEEX implicit API page](/docs/exchanges/weex/implicit-api).

## What going direct does better

An honest list:

- **Field names match the docs exactly.** When you are reading `weex.com/api-doc` while debugging, a raw payload lines up with the reference one field at a time. CCXT's unified names are a deliberate abstraction and one hop away from it.
- **Endpoint families the unified API does not model.** WEEX's documentation has broker, partner and copy-trading sections. CCXT covers 76 endpoints as implicit methods, but anything outside that set — and anything published after the last release — you call yourself.
- **Weight headers are visible.** `X-USED-WEIGHT-*` and `X-REMAINING-WEIGHT-*` tell you exactly how much budget is left. CCXT's throttler is predictive: it paces from a per-endpoint cost table rather than from the response headers, which is more portable but less exact than reading the counter the exchange actually keeps.
- **Order-book streaming is a first-class subscription.** CCXT implements it but does not yet flag it in `has`, so tooling that gates on capability flags will skip it. Subscribing to `<marketId>@depth200` directly sidesteps that question entirely.
- **A smaller dependency.** Three endpoints and thirty lines of signing code is less than all of CCXT.

If WEEX is your only venue and you mostly read public data, going direct is perfectly reasonable.

## Migrating from the raw WEEX API to CCXT

| What you are doing | Raw WEEX API | CCXT |
| --- | --- | --- |
| Credentials | `ACCESS-KEY` + `ACCESS-SIGN` + `ACCESS-PASSPHRASE` + `ACCESS-TIMESTAMP` | `apiKey`, `secret`, `password` on the constructor |
| Signature | Base64 HMAC-SHA256 of `ts + METHOD + path + ?query + body` | built for you |
| Symbols | `BTCUSDT` | `'BTC/USDT'` (spot), `'BTC/USDT:USDT'` (linear swap) |
| Symbol list | `GET api/v3/exchangeInfo`, `GET capi/v3/market/exchangeInfo` | `load_markets()` |
| Ticker | `GET api/v3/market/ticker/24hr`, `GET capi/v3/market/ticker/24hr` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET api/v3/market/depth`, `GET capi/v3/market/depth` | `fetch_order_book()` |
| Candles | `GET api/v3/market/klines`, `GET capi/v3/market/klines` | `fetch_ohlcv()` |
| New order | `POST api/v3/order`, `POST capi/v3/order` | `create_order()` |
| Cancel order | `DELETE api/v3/order`, `DELETE capi/v3/order` | `cancel_order()` |
| Open orders | `GET api/v3/openOrders`, `GET capi/v3/openOrders` | `fetch_open_orders()` |
| Balance | `GET api/v3/account/`, `GET capi/v3/account/balance` | `fetch_balance()` |
| Positions | `GET capi/v3/account/position/allPosition` | `fetch_positions()` |
| Streams | `wss://ws-spot.weex.com/v3/ws` and `wss://ws-contract.weex.com/v3/ws`, each with `/public` and `/private` | `watch_*` on `ccxt.pro.weex` |
| Anything not listed | the endpoint | the same endpoint as an [implicit method](/docs/exchanges/weex/implicit-api) |

## FAQ

**Does WEEX have an official SDK?**
No. WEEX publishes API documentation but no client library, and its documentation does not reference one. A `weex-sdk` package exists on PyPI under Apache-2.0, but its listed repository URL does not resolve and it is not referenced from WEEX's documentation. CCXT is the maintained option.

**How does WEEX authenticate API requests?**
Four headers: `ACCESS-KEY`, `ACCESS-SIGN`, `ACCESS-PASSPHRASE` and `ACCESS-TIMESTAMP`. The signature is a Base64-encoded HMAC-SHA256 over `timestamp + METHOD + requestPath + "?" + queryString + body`, and the timestamp is rejected if it drifts more than 30 seconds from server time. In CCXT the passphrase is the `password` constructor field.

**Does CCXT support WEEX order-book streaming?**
The implementation is in `ts/src/pro/weex.ts` — `watchOrderBook` and `watchOrderBookForSymbols` subscribe to WEEX's depth channel and merge the book — but the class currently declares `'watchOrderBook': false` in its `has` block, so the capability flag reports `False` and capability-gated tests skip it. Call it if you need it, but do not gate on `exchange.has['watchOrderBook']` expecting `True`.

**Does CCXT cover WEEX futures as well as spot?**
Yes. One `ccxt.weex` instance covers both, and CCXT selects the right REST and WebSocket host from the market. Use `'BTC/USDT'` for spot and `'BTC/USDT:USDT'` for the linear perpetual.

**Does CCXT support a WEEX sandbox?**
No. The `weex` class declares `'sandbox': false` and defines no `urls.test`, so `set_sandbox_mode(True)` will not work for it.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [weex unified API reference](/docs/exchanges/weex)
- [weex implicit API](/docs/exchanges/weex/implicit-api) — all 76 raw endpoints
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
