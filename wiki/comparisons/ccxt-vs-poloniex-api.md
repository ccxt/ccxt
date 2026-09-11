<!-- title: CCXT vs the Poloniex API and official Poloniex SDKs -->
<!-- description: Poloniex splits spot and futures across separate SDKs, one archived. CCXT compared on coverage, WebSocket order entry, rate limits and errors. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Poloniex's official spot and futures SDKs are separate repositories, and the futures one is archived. CCXT covers spot and v3 futures in one class, with 9 watch* methods and WebSocket order entry. -->
<!-- weight: 100 -->

# CCXT vs the Poloniex API and official Poloniex SDKs

Poloniex publishes two official Python SDKs and one Java SDK, listed from its own [API documentation](https://api-docs.poloniex.com/spot/): [`poloniex/polo-sdk-python`](https://github.com/poloniex/polo-sdk-python) for spot, [`poloniex/polo-futures-sdk-python`](https://github.com/poloniex/polo-futures-sdk-python) for futures, and [`poloniex/polo-sdk-java`](https://github.com/poloniex/polo-sdk-java). [CCXT](/docs/manual) speaks the same REST and WebSocket APIs behind method names shared with 103 other venues.

The question that decides between them: **do you trade both Poloniex spot and Poloniex futures?**

## TL;DR

- **Pick the official SDK** if you only touch spot, you want response payloads named exactly as Poloniex's docs name them, and a `git clone` install is acceptable in your build.
- **Pick CCXT** if you need spot and futures from one client, want the futures side maintained on the same cadence as everything else, or want WebSocket order entry — the official futures SDK repository is archived.
- **CCXT is not a lowest common denominator.** All 101 Poloniex endpoints are generated as [implicit methods](/docs/exchanges/poloniex/implicit-api), signed and rate-limited like the unified ones.

## At a glance

| | **CCXT** | **Official Poloniex SDKs** |
| --- | --- | --- |
| Exchanges covered | 104 (Poloniex is one of them) | Poloniex only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | Python (spot), Python (futures), Java |
| Install | `pip install ccxt` / `npm i ccxt` | `git clone` — `polosdk` is not published on PyPI |
| Poloniex products in one client | spot and v3 futures | separate packages, separate clients |
| Futures SDK status | same class, same release cadence | `polo-futures-sdk-python` is **archived**, last push July 2024 |
| Unified market data + trading API | yes — same method names on every exchange | no — Poloniex's own request and response shapes |
| WebSockets | yes — 9 `watch*` methods, plus `createOrderWs`, `cancelOrderWs`, `cancelOrdersWs`, `cancelAllOrdersWs` | yes — public and authenticated callback clients |
| Raw endpoint access | yes — 101 Poloniex endpoints as implicit methods | the endpoints the SDK wraps |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 5 ms) | not built in |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus Poloniex error codes |
| Testnet / sandbox | `exchange.set_sandbox_mode(True)` swaps in `sand-spot-api-gateway.poloniex.com` | change base URLs yourself |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `polo-sdk-python` 14 stars; `polo-futures-sdk-python` 6 stars, archived; `polo-sdk-java` 1 star |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub, plus `api-support@poloniex.com` |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `poloniex/*` GitHub repositories and Poloniex's published spot API documentation.</sub>

CCXT implements **54 unified capabilities** for Poloniex, **23** of them `fetch*` methods.

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.poloniex()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **polosdk**

```python
from polosdk import SpotRestClient

client = SpotRestClient()
response = client.markets().get_price('BTC_USDT')
print(response)
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — the same keys, types and units on Poloniex as on Kraken or Bybit. The SDK returns Poloniex's payload, which you parse yourself.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.poloniex({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.00025, 20000)
print(order['id'], order['status'])
```

#### **polosdk**

```python
import os
from polosdk import SpotRestClient

client = SpotRestClient(os.environ['POLO_API_KEY'], os.environ['POLO_API_SECRET'])
response = client.orders().create(price='20000',
                                  quantity='0.00025',
                                  side='BUY',
                                  symbol='BTC_USDT',
                                  type='LIMIT')
print(response)
```

<!-- tabs:end -->

To place the same order on a Poloniex perpetual with the official SDKs you install the second package — the archived one — and learn a second client. In CCXT the symbol carries the product:

```python
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.001, 60000)
```

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.poloniex()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **polosdk**

```python
import asyncio
from polosdk import SpotWsClientPublic

def on_message(msg):
    print(msg)

async def main():
    ws_client_public = SpotWsClientPublic(on_message)
    await ws_client_public.connect()
    await ws_client_public.subscribe(['book_lv2'], ['BTC_USDT'])
    await asyncio.sleep(3600)

asyncio.run(main())
```

<!-- tabs:end -->

These do not do the same thing. CCXT hands you a **merged, depth-limited order book** on every update. The SDK hands you **raw channel messages** — snapshot then deltas — and the merge, the sequence-gap detection, the re-seed after a drop and the bounded cache are yours to write.

## Where the differences actually bite

### Spot and futures in one class

`ccxt.poloniex` covers Poloniex spot and its v3 futures endpoints from one instance. Unified symbols keep them apart: `'BTC/USDT'` for spot, `'BTC/USDT:USDT'` for the linear perpetual. `options.defaultType` sets the default. The official SDKs split that across two packages, and the futures repository is archived — so the two halves of a hedged strategy have different maintenance stories.

### Order entry over the WebSocket

CCXT Pro implements `createOrderWs`, `cancelOrderWs`, `cancelOrdersWs` and `cancelAllOrdersWs` for Poloniex alongside the nine `watch*` methods. You place and cancel over the already-open socket instead of paying a fresh HTTP handshake per order, and the call signature is the same as the REST version:

```python
order = await exchange.create_order_ws('BTC/USDT', 'limit', 'buy', 0.00025, 20000)
```

### WebSockets that look like REST

`watch_order_book` returns the same structure as `fetch_order_book`; `watch_orders` the same as `fetch_orders`. Swapping polling for streaming is a one-word change, and the code downstream does not know which produced the value. Underneath, CCXT handles connection pooling per URL, ping/pong keep-alive with miss detection, automatic reconnect and resubscribe, and bounded caches for trades and candles.

### Rate limits you do not have to model

Poloniex meters per endpoint, and the cost differs — `markets` and `markets/{symbol}/trades` are far more expensive than `markets/{symbol}/price`. CCXT encodes those weights in the exchange definition and ships a token-bucket throttler that is on by default (`enableRateLimit = True`, `rateLimit = 5` ms). You call methods in a loop; the library paces them.

### Signing

Poloniex signs with HMAC-SHA256 over a newline-delimited string of the HTTP method, the path and either the sorted query parameters or the JSON body, all with a `signTimestamp`, base64-encoded and sent as `key`, `signTimestamp` and `signature` headers. The GET form sorts parameters; the POST form does not. CCXT builds both.

### Precision, rounding and string math

Poloniex rejects orders that violate a symbol's tick size, step size or minimum notional. CCXT loads that metadata with the markets and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities do not drift through float rounding.

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

### One error hierarchy

CCXT maps Poloniex's numeric codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError` and 35 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once instead of matching on `21709` and hoping the string never changes.

### Nothing is hidden — the implicit API

Alongside the 54 unified capabilities, **all 101 Poloniex endpoints are generated as callable implicit methods**, with signing, rate-limit accounting and error mapping applied. Browse them on the [Poloniex implicit API page](/docs/exchanges/poloniex/implicit-api).

## What the official Poloniex SDKs do better

An honest list:

- **The payloads match the docs one-for-one.** `client.markets().get_price('BTC_USDT')` returns exactly what `api-docs.poloniex.com` shows for that endpoint. When you are reading the vendor reference while debugging, that is one less hop than a unified structure.
- **A vendor support channel.** Poloniex's API docs publish `api-support@poloniex.com` for API questions. CCXT's support is excellent but it is community and maintainer support for the library, not for your exchange account.
- **A first-party Java SDK.** [`polo-sdk-java`](https://github.com/poloniex/polo-sdk-java) gives Poloniex-shaped types on the JVM. CCXT has a Java build too, but its types are unified rather than Poloniex-literal.
- **The callback WebSocket model suits recorders.** `SpotWsClientPublic` pushes every raw message into your handler. For a process whose job is to write every message to disk or Kafka, push shape is a better fit than CCXT's `await`-a-value shape.
- **A smaller install.** If all you do is read spot prices, one small module is less than all of CCXT.

If Poloniex spot is the only thing you touch and you value literal fidelity to the vendor docs over portability, the official spot SDK is a reasonable choice.

## Migrating from the Poloniex SDK to CCXT

| What you are doing | Poloniex SDK | CCXT |
| --- | --- | --- |
| Symbols | `'BTC_USDT'`, `'BTC_USDT_PERP'` | `'BTC/USDT'`, `'BTC/USDT:USDT'` |
| Product selection | a different package | `options.defaultType` = `spot` / `swap`, or the symbol |
| Markets | `client.get_markets()` | `load_markets()` |
| Ticker | `client.markets().get_ticker24h()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `client.markets().get_orderbook()` | `fetch_order_book()` |
| Candles | `client.markets().get_candles()` | `fetch_ohlcv()` |
| New order | `client.orders().create()` | `create_order()` |
| Cancel order | `client.orders().cancel_by_id()` | `cancel_order()` |
| Open orders | `client.orders().get_all()` | `fetch_open_orders()` |
| Balance | `client.accounts().get_balances()` | `fetch_balance()` |
| Streams | `SpotWsClientPublic` + `subscribe()` | `watch_*` on `ccxt.pro.poloniex` |
| Anything not listed | the endpoint | the same endpoint as an [implicit method](/docs/exchanges/poloniex/implicit-api) |

## FAQ

**Does Poloniex have an official Python SDK?**
Yes, two: [`polo-sdk-python`](https://github.com/poloniex/polo-sdk-python) for spot, which is MIT-licensed and was last pushed in February 2025, and [`polo-futures-sdk-python`](https://github.com/poloniex/polo-futures-sdk-python) for futures, which is archived and was last pushed in July 2024. Neither is published on PyPI — both are installed by cloning the repository.

**Does CCXT cover Poloniex futures?**
Yes. Poloniex spot and its v3 futures endpoints live in the same `ccxt.poloniex` class. Use `'BTC/USDT:USDT'` for the linear perpetual, or set `options.defaultType` to `'swap'`.

**Can I place orders over the Poloniex WebSocket with CCXT?**
Yes. CCXT Pro implements `create_order_ws`, `cancel_order_ws`, `cancel_orders_ws` and `cancel_all_orders_ws` for Poloniex, with the same arguments as their REST counterparts.

**Does CCXT support the Poloniex sandbox?**
Yes. `exchange.set_sandbox_mode(True)` swaps in `sand-spot-api-gateway.poloniex.com`.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.poloniex` and call `watch*` methods — Poloniex has 9 of them.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [poloniex unified API reference](/docs/exchanges/poloniex)
- [poloniex implicit API](/docs/exchanges/poloniex/implicit-api) — all 101 raw endpoints
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
