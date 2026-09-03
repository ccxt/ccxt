<!-- title: CCXT vs the Bitfinex API and official Bitfinex SDKs -->
<!-- description: CCXT and Bitfinex's official connectors compared on language coverage, positional array responses, rate limits, derivatives symbols and WebSockets. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Bitfinex v2 returns positional arrays with no field names and splits its official connectors across five separate repositories. CCXT gives you named unified structures, spot, margin and derivatives in one client, and 136 raw endpoints when you need them. -->
<!-- weight: 100 -->

# CCXT vs the Bitfinex API and official Bitfinex SDKs

Bitfinex maintains its own open-source connectors — [bitfinex-api-py](https://github.com/bitfinexcom/bitfinex-api-py), [bitfinex-api-node](https://github.com/bitfinexcom/bitfinex-api-node) and Go, Ruby and PHP siblings listed on its [open source libraries page](https://docs.bitfinex.com/docs/open-source-libraries). [CCXT](/docs/manual) speaks the same v2 REST and WebSocket API, but behind method names shared with 103 other venues.

Both work. The question that decides between them: **is Bitfinex the only venue your code will ever talk to?**

## TL;DR

- **Pick the official Bitfinex SDKs** if Bitfinex is your only venue and you want typed models named exactly the way Bitfinex's own reference names them — `Notification[Order]`, `TradingPairTicker`, `tBTCUSD`.
- **Pick CCXT** if you want one dependency covering Bitfinex spot, margin and perpetuals, in seven languages, with the same method names you will use on the next exchange.
- **Choosing CCXT does not hide the venue.** All 136 Bitfinex endpoints CCXT knows about are callable as [implicit methods](/docs/exchanges/bitfinex/implicit-api), signed and rate-limited.

## At a glance

| | **CCXT** | **Official Bitfinex SDKs** |
| --- | --- | --- |
| Exchanges covered | 104 (Bitfinex is one of them) | Bitfinex only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python, Node.js, Go, Ruby, PHP — separate repositories, coverage varies |
| Packages to install | 1 (`ccxt`) | one per language |
| Unified market data + trading API | yes — same names on every exchange | no — Bitfinex's own request/response shapes |
| Response format | named unified structures | Python SDK maps arrays to dataclasses; raw v2 returns positional arrays |
| Bitfinex products in one client | spot, margin, perpetual swaps | one client, Bitfinex-shaped endpoints |
| WebSockets | yes — 11 `watch*` / `unWatch*` methods | yes, event/callback based |
| Raw endpoint access | yes — 136 endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default | not a documented feature |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP + Bitfinex error payloads |
| Testnet / sandbox | not available for `bitfinex` | not offered |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `bitfinex-api-py` 219 stars · 2.2k PyPI installs/month; `bitfinex-api-node` 479 stars · 13.1k npm installs/month |
| Licence | MIT | `bitfinex-api-py` Apache-2.0; `bitfinex-api-node` MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the Bitfinex connector repositories and documentation, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitfinex()
ticker = exchange.fetch_ticker('BTC/USD')
print(ticker['last'], ticker['baseVolume'])
```

#### **bitfinex-api-py**

```python
from bfxapi import Client, REST_HOST

bfx = Client(rest_host=REST_HOST)
ticker = bfx.rest.public.get_t_ticker("tBTCUSD")
print(ticker.last_price, ticker.volume)
```

<!-- tabs:end -->

The SDK does real work here that raw HTTP does not. Bitfinex's v2 REST returns **positional arrays with no field names** — `GET /v2/ticker/tBTCUSD` answers with a bare eleven-element list, and index 6 is the last price only because the docs say so. The Python SDK maps that onto a `TradingPairTicker` dataclass; CCXT maps it onto the [unified ticker structure](/docs/manual#ticker-structure) whose keys are identical on Kraken, OKX and every other venue.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitfinex({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USD', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **bitfinex-api-py**

```python
from bfxapi import Client, REST_HOST
from bfxapi.types import Notification, Order

bfx = Client(rest_host=REST_HOST, api_key="...", api_secret="...")

notification: Notification[Order] = bfx.rest.auth.submit_order(
    type="EXCHANGE LIMIT", symbol="tBTCUSD", amount=0.165212, price=30264.0)

order: Order = notification.data
```

<!-- tabs:end -->

Note the two Bitfinex-specific things the SDK asks you to carry: the order type string carries the account (`EXCHANGE LIMIT` for the exchange wallet, `LIMIT` for margin), and the side is encoded in the *sign* of `amount`. CCXT takes `'buy'` / `'sell'` and a positive amount, and picks the wallet from the market type.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.bitfinex()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USD')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **bitfinex-api-py**

```python
from bfxapi import Client, PUB_WSS_HOST

bfx = Client(wss_host=PUB_WSS_HOST)

@bfx.wss.on("open")
async def on_open():
    await bfx.wss.subscribe("ticker", symbol="tBTCUSD")

@bfx.wss.on("candles_update")
def on_candles_update(sub, candle):
    print(f"Candle update: {candle}")

bfx.wss.run()
```

<!-- tabs:end -->

Two different programming models. CCXT is pull-shaped: `await` a method, get a merged, depth-limited order book back, and decide in the same function. The SDK is push-shaped: register handlers and hand control to `wss.run()`. Underneath, CCXT also does the book maintenance — applying Bitfinex's channel updates into a live book, reconnecting and resubscribing after a drop, and keeping the cache bounded rather than growing forever.

## Where the differences actually bite

### Named fields instead of array indices

This is the single biggest day-to-day difference on Bitfinex specifically. Every v2 endpoint answers with positional arrays, and the position of a field changes between endpoints — a trade array is not laid out like a ticker array, and an authenticated order array is longer again. CCXT parses each of them into the same named structures (`order['id']`, `order['filled']`, `trade['fee']['cost']`) so a field never moves when you change endpoint or exchange.

### Spot, margin and derivatives in one client

CCXT's `bitfinex` class declares `spot`, `margin` and `swap` support and 61 unified capabilities, including `fetchPositions`, `fetchFundingRates`, `fetchFundingRateHistory`, `fetchOpenInterest`, `fetchLiquidations`, `setMargin` and `createTrailingAmountOrder`. Derivative ids like `tBTCF0:USTF0` become the unified symbol `'BTC/USDT:USDT'`, so the same `create_order` call works on spot and on the perpetual.

### Rate limits you do not have to model

Bitfinex documents its rate limit as varying per endpoint, "in the range of 10 to 90 requests per minute". CCXT encodes those per-endpoint costs against a `rateLimit` of 250 ms and ships a token-bucket throttler that is **on by default** (`enableRateLimit = true`). You call methods in a loop; the library paces them. Rolling your own means tracking a different budget per path.

### Signing, nonces and the parts that go wrong at 3am

Private Bitfinex requests are signed with `bfx-apikey`, `bfx-nonce` and `bfx-signature`, where the signature is an HMAC-SHA384 over the path, nonce and body. Nonces must increase monotonically per key, which is exactly the thing that breaks when two processes share one key. CCXT implements the scheme and the nonce discipline once, in the base class, for every language.

### Seven languages, one API

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.bitfinex ();
const ticker = await exchange.fetchTicker ('BTC/USD');
```

#### **Python**

```python
import ccxt
exchange = ccxt.bitfinex()
ticker = exchange.fetch_ticker('BTC/USD')
```

#### **Go**

```go
exchange := ccxt.NewBitfinex(nil)
ticker, err := exchange.FetchTicker("BTC/USD")
```

<!-- tabs:end -->

Bitfinex publishes connectors in five languages too, but they are five codebases with five sets of idioms and five release schedules — not one API expressed seven ways.

### One error hierarchy

CCXT maps Bitfinex's error payloads onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError` and 35 more, all under `BaseError`. `except ccxt.InsufficientFunds` keeps working when you add a second venue.

### Nothing is hidden — the implicit API

Alongside the 61 unified capabilities, all 136 Bitfinex endpoints CCXT models are callable directly:

```python
# any raw Bitfinex endpoint, camelCased from its path
status = exchange.public_get_platform_status()
```

Signing, rate-limit accounting and error mapping still apply. Browse them on the [bitfinex implicit API page](/docs/exchanges/bitfinex/implicit-api).

## What the official Bitfinex SDKs do better

An honest list:

- **Literal fidelity to the Bitfinex reference.** `submit_order`, `get_t_ticker`, `tBTCUSD`, `fUSD` — the SDK names match the docs you are reading. CCXT's unified names are a deliberate abstraction, which is one extra hop when you are debugging against Bitfinex's own reference.
- **Typed Bitfinex-shaped models with mypy support.** `bitfinex-api-py` ships dataclasses and generics such as `Notification[Order]`, and documents an optional typing extra. CCXT gives you typed *unified* structures instead — better for portability, less literal about Bitfinex's payloads.
- **Funding-market coverage is first class.** Bitfinex's lending/funding book (`f`-prefixed symbols, `get_f_ticker`, `get_f_book`, funding offers) is a Bitfinex-specific product with a direct SDK surface. In CCXT you reach it through implicit methods rather than a unified funding-market API.
- **New Bitfinex features land there first.** A brand-new endpoint usually appears in Bitfinex's own connector before it is modelled as a unified CCXT method. CCXT's implicit API closes most of that gap on day one, but the *unified* wrapper can lag.

If Bitfinex is your only venue and you want your code to read like the Bitfinex reference, the official SDKs are a defensible choice.

## Migrating from a Bitfinex SDK to CCXT

| What you are doing | Bitfinex SDK | CCXT |
| --- | --- | --- |
| Symbols | `'tBTCUSD'`, `'tBTCF0:USTF0'` | `'BTC/USD'`, `'BTC/USDT:USDT'` |
| Order side | sign of `amount` | `'buy'` / `'sell'` |
| Wallet selection | `'EXCHANGE LIMIT'` vs `'LIMIT'` | market type + unified params |
| Ticker | `get_t_ticker()` | `fetch_ticker()` |
| Order book | `get_t_book()` | `fetch_order_book()` |
| Candles | `get_candles_hist()` | `fetch_ohlcv()` |
| New order | `submit_order()` | `create_order()` |
| Cancel order | cancel-order endpoint | `cancel_order()` |
| Open orders | active-orders endpoint | `fetch_open_orders()` |
| Balance | wallets endpoint | `fetch_balance()` |
| Streams | `wss.subscribe()` + handlers | `watch_*` on `ccxt.pro.bitfinex` |
| Anything not listed | native method | the same endpoint as an [implicit method](/docs/exchanges/bitfinex/implicit-api) |

## FAQ

**Does CCXT support Bitfinex derivatives and margin?**
Yes. The `bitfinex` class declares spot, margin and swap support, with `fetch_positions`, `fetch_funding_rates`, `fetch_funding_rate_history`, `fetch_open_interest`, `fetch_liquidations` and `set_margin` among its 61 unified capabilities. Perpetuals use unified symbols like `'BTC/USDT:USDT'`.

**How do I deal with Bitfinex's array responses in CCXT?**
You do not — that is the point. CCXT parses the positional arrays into named unified structures before you see them. If you want the raw array anyway, every parsed structure keeps it under the `info` key.

**Does Bitfinex have a testnet I can use through CCXT?**
Not through `setSandboxMode`. CCXT's `bitfinex` class does not declare sandbox URLs, so test against small live orders on a low-balance key instead.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.bitfinex` and call `watch*` methods — 11 of them are implemented for Bitfinex, including `watch_order_book`, `watch_trades`, `watch_ohlcv`, `watch_orders`, `watch_my_trades` and `watch_balance`.

**Can I still call Bitfinex-specific endpoints from CCXT?**
Yes — 136 of them, as [implicit methods](/docs/exchanges/bitfinex/implicit-api), with signing and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bitfinex unified API reference](/docs/exchanges/bitfinex)
- [bitfinex implicit API](/docs/exchanges/bitfinex/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
