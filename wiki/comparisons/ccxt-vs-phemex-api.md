<!-- title: CCXT vs the Phemex API and Phemex sample clients -->
<!-- description: Phemex ships sample clients, not an SDK, and encodes prices as scaled integers. CCXT compared on scaling, signing, rate limits and streaming. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Phemex's API encodes prices and quantities as scaled integers (priceEp, valueEv). CCXT decodes them into decimals, covers spot and swap in one class, and exposes all 115 raw endpoints. -->
<!-- weight: 100 -->

# CCXT vs the Phemex API and Phemex sample clients

Phemex publishes its API reference at [phemex-docs.github.io](https://phemex-docs.github.io/) and a set of sample clients on GitHub — [`phemex/phemex-python-api`](https://github.com/phemex/phemex-python-api), [`phemex/java-client`](https://github.com/phemex/java-client), [`phemex/phemex-cpp-api`](https://github.com/phemex/phemex-cpp-api) and [`phemex/phemex-node-example`](https://github.com/phemex/phemex-node-example). The Python one describes itself as "a python example code for Phemex API" that "implements a subset of APIs of Phemex". Phemex's own documentation states that CCXT is its authorized SDK provider.

So the real choice is not between two SDKs. It is between [CCXT](/docs/manual) and writing your own client against the raw API — and the thing that decides it is **whether you want to handle Phemex's scaled integers yourself**.

## TL;DR

- **Go direct** if you want request and response fields named exactly as `phemex-docs.github.io` names them, you are on the JVM and want the Apache-2.0 Java client, or you only need two or three endpoints.
- **Pick CCXT** if you want Phemex's scaled integers converted to decimals for you, spot and perpetual swap in one client, a rate limiter that already knows Phemex's per-group budgets, and eight streaming methods that return the same structures as the REST calls.
- **CCXT is not a subset.** All 115 Phemex endpoints are generated as [implicit methods](/docs/exchanges/phemex/implicit-api), signed and throttled like everything else.

## At a glance

| | **CCXT** | **Phemex sample clients / raw API** |
| --- | --- | --- |
| Exchanges covered | 104 (Phemex is one of them) | Phemex only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python, Java, C++, Node.js sample repos, each written separately |
| Install | `pip install ccxt` / `npm i ccxt` | `git clone` a sample repo, or write your own client |
| Phemex products in one client | spot and perpetual swap | one code path per product family |
| Scaled integers (`priceEp`, `qtyEv`, `Er`) | decoded to decimals from each market's `priceScale` / `valueScale` / `ratioScale` | your code |
| Unified market data + trading API | yes — same method names on every exchange | no — Phemex's own request and response shapes |
| WebSockets | yes — 8 `watch*` methods | your own socket client |
| Raw endpoint access | yes — 115 Phemex endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 120.5 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus Phemex error codes |
| Testnet / sandbox | `exchange.set_sandbox_mode(True)` swaps in `testnet-api.phemex.com` | change base URLs yourself |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `phemex-python-api` 24 stars, last push February 2020; `java-client` 17 stars, Apache-2.0, last push October 2023 |
| Licence | MIT | Java client Apache-2.0; the Python sample repo declares no licence |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues on the docs and sample repos |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `phemex/*` GitHub repositories and the published Phemex API reference.</sub>

CCXT implements **55 unified capabilities** for Phemex, **28** of them `fetch*` methods.

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.phemex()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **phemex-python-api**

```python
from phemex.client import Client

client = Client("api_key", "api_secret", True)
r = client.query_24h_ticker("BTCUSD")
print(r)
```

<!-- tabs:end -->

The sample client hands back Phemex's payload, in which the price fields are integers scaled by the product's `priceScale`. CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) whose `last`, `bid`, `ask` and volume fields are already decimals in the units you would type into the exchange UI.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.phemex({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **phemex-python-api**

```python
import time
from phemex.client import Client

client = Client("api_key", "api_secret", True)
r = client.place_order({
    "symbol": Client.SYMBOL_BTCUSD,
    "clOrdID": "Test1" + str(time.time()),
    "side": Client.SIDE_BUY,
    "orderQty": 10,
    "priceEp": 95000000,
    "ordType": Client.ORDER_TYPE_LIMIT,
    "timeInForce": Client.TIF_GOOD_TILL_CANCEL,
})
```

<!-- tabs:end -->

`"priceEp": 95000000` is the whole story. That is 9,500.0000 for a product whose `priceScale` is 4. Get the scale wrong and the order is off by four orders of magnitude — and nothing in the request looks wrong.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.phemex()
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
    async with websockets.connect('wss://ws.phemex.com') as ws:
        await ws.send(json.dumps({
            'id': 1,
            'method': 'orderbook.subscribe',
            'params': ['BTCUSD'],
        }))
        while True:
            msg = json.loads(await ws.recv())
            # snapshot vs incremental, sequence gaps, scaled prices,
            # keep-alive and reconnect are all yours from here
            print(msg)
```

<!-- tabs:end -->

CCXT returns a merged, depth-limited [order book structure](/docs/manual#order-book-structure) with decimal prices. The raw feed returns snapshots and increments in scaled integers, and leaves you to merge them, detect sequence gaps, re-seed after a drop and keep the connection alive. The channel name is also not constant: USDT-settled swaps use `orderbook_p.subscribe` and a different payload key, which CCXT selects for you from the market.

## Where the differences actually bite

### Scaled integers

This is the Phemex-specific one. Phemex encodes numbers as integers with a suffix that names the scale: `Ep` for prices (scaled by the product's `priceScale`), `Ev` for values (scaled by the settlement currency's `valueScale`), `Er` for ratios such as fees and leverage. The documentation explains the scheme, but every field you touch has to be converted on the way in and on the way out, and the scale differs per product and per currency.

CCXT reads `priceScale`, `valueScale` and `ratioScale` out of Phemex's product definitions when it loads markets, and converts in both directions. You pass `60000` and `0.001` to `create_order`; you read `ticker['last']` as a decimal. The scale never appears in your code.

### Spot and swap in one client

`ccxt.phemex` covers Phemex spot and perpetual swap markets in one instance. Unified symbols keep them apart — `'BTC/USDT'` for spot, `'BTC/USDT:USDT'` for the linear perpetual — and the method names do not change between them.

### Rate limits you do not have to model

Phemex publishes limits per API group: 500 requests per minute for the contract group, 500 per minute for spot orders, 100 per minute for others, and an IP ceiling of 5,000 requests per 5 minutes. CCXT encodes per-endpoint costs in the exchange definition and ships a token-bucket throttler that is on by default (`enableRateLimit = True`, `rateLimit = 120.5` ms). You call methods in a loop and the library paces them.

### Signing

Every private Phemex request is signed with HMAC-SHA256 over the URL path, the query string, an expiry timestamp and the body, and sent with `x-phemex-access-token`, `x-phemex-request-expiry` and `x-phemex-request-signature`. The expiry is a near-future epoch second, not a nonce, so a clock that drifts fails requests rather than rejecting them cleanly. CCXT builds all of it, including the client order id, on every call.

### One error hierarchy

CCXT maps Phemex's numeric error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError` and 35 more, all descending from `BaseError`. You catch `ccxt.InsufficientFunds` once and it keeps working when you add a second venue.

### Testnet without a second code path

```python
exchange = ccxt.phemex({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)   # swaps in testnet-api.phemex.com
```

One flag swaps every REST and WebSocket URL.

### Nothing is hidden — the implicit API

Alongside the 55 unified capabilities, **all 115 endpoints in Phemex's API are generated as callable implicit methods**, with signing, expiry handling, rate-limit accounting and error mapping applied. Browse them on the [Phemex implicit API page](/docs/exchanges/phemex/implicit-api).

## What going direct does better

An honest list:

- **Field names match the docs exactly.** When you are debugging against `phemex-docs.github.io`, a payload whose keys are `ordStatus`, `cumQty` and `priceEp` is easier to line up than a unified structure. CCXT's names are a deliberate abstraction, and that is one hop of indirection while you read the vendor reference.
- **The Java client is real and Apache-2.0.** [`phemex/java-client`](https://github.com/phemex/java-client) was last pushed in October 2023 and gives you Phemex-shaped types on the JVM. If your service is Java-only and you want the vendor's own model classes, it is a defensible pick.
- **New Phemex features appear in the docs first.** A brand-new endpoint is in `phemex-api-docs` the day it ships. CCXT's implicit API reaches it immediately too, but a *unified* wrapper for it may lag.
- **Scaled integers are lossless.** Integers with an explicit scale never round. CCXT converts to decimals using string arithmetic and does not introduce float drift either, but if your accounting layer prefers to hold the raw integer, the raw API hands it to you unchanged.
- **A smaller dependency.** If you call three endpoints and nothing else, `requests` plus twenty lines of signing code is smaller than all of CCXT.

If Phemex is your only venue, you are on the JVM, and you would rather work in the exchange's own units, going direct is a reasonable choice.

## Migrating from the raw Phemex API to CCXT

| What you are doing | Raw Phemex API | CCXT |
| --- | --- | --- |
| Symbols | `BTCUSD`, `BTCUSDT` | `'BTC/USDT'` (spot), `'BTC/USDT:USDT'` (linear swap) |
| Prices and sizes | `priceEp`, `orderQty`, `valueEv` | decimals, scaled for you |
| Products | `GET exchange/public/products` | `load_markets()` |
| 24h ticker | `GET md/spot/ticker/24hr`, `GET md/v2/ticker/24hr` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET md/orderbook`, `GET md/v2/orderbook` | `fetch_order_book()` |
| Candles | `GET md/v2/kline` | `fetch_ohlcv()` |
| New order | `POST g-orders/create` | `create_order()` |
| Cancel | `DELETE g-orders/cancel` | `cancel_order()` |
| Open orders | `GET g-orders/activeList` | `fetch_open_orders()` |
| Balance and positions | `GET g-accounts/accountPositions` | `fetch_balance()` / `fetch_positions()` |
| Streams | `orderbook.subscribe`, `trade.subscribe` | `watch_*` on `ccxt.pro.phemex` |
| Anything not listed | the endpoint | the same endpoint as an [implicit method](/docs/exchanges/phemex/implicit-api) |

## FAQ

**Does Phemex have an official SDK?**
Phemex publishes sample clients rather than a maintained SDK family. The Python repository is described as example code implementing a subset of the API and was last pushed in February 2020; the Java client is more recent (October 2023) and Apache-2.0. Phemex's own documentation names CCXT as its authorized SDK provider.

**What are `priceEp` and `valueEv` in Phemex responses?**
They are scaled integers. `Ep` fields are scaled by the product's `priceScale` and `Ev` fields by the settlement currency's `valueScale`, so a price of 9,500.0000 at `priceScale` 4 is sent as `95000000`. CCXT reads those scales from the market definitions and converts in both directions, so your code deals in decimals.

**Does CCXT support Phemex perpetual swaps as well as spot?**
Yes. One `ccxt.phemex` instance covers both. Use `'BTC/USDT'` for spot and `'BTC/USDT:USDT'` for the linear perpetual; the method names are the same.

**Does CCXT support the Phemex testnet?**
Yes. `exchange.set_sandbox_mode(True)` swaps every REST and WebSocket URL to `testnet-api.phemex.com`.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.phemex` and call `watch*` methods — Phemex has 8 of them.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [phemex unified API reference](/docs/exchanges/phemex)
- [phemex implicit API](/docs/exchanges/phemex/implicit-api) — all 115 raw endpoints
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
