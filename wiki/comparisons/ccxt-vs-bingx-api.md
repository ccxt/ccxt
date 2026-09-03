<!-- title: CCXT vs the BingX API -->
<!-- description: BingX publishes API documentation but no official client library. CCXT compared with the raw API and community SDKs on signing, streaming and demo trading. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: BingX's GitHub organisation publishes documentation repositories, not an SDK. CCXT is a certified BingX integration with 81 unified capabilities, 12 streaming methods and all 187 raw endpoints across eleven API sections. -->
<!-- weight: 100 -->

# CCXT vs the BingX API

If you are integrating [BingX](https://bingx.com/), the first thing you notice is what is missing. The [BingX-API GitHub organisation](https://github.com/BingX-API) publishes documentation repositories — `docs`, `docs-v3`, `BingX-swap-api-doc`, `BingX-swap-api-v2-doc`, `BingX-spot-api-doc`, `BingX-comm-api-doc`, `BingX-Standard-Contract-doc` — plus a proof-of-reserves tool and an AI coding-assistant skill library. There is **no official client library in any language**.

What exists instead is a set of community SDKs of varying scope, and [CCXT](/docs/manual), where BingX is a **certified** integration. The question that decides between them: **do you want a BingX-shaped client, or do you want BingX to behave like the other venues you trade?**

## TL;DR

- **Write it yourself, or use a community SDK,** if BingX is your only venue, you are in Python or PHP, and you want method names that track BingX's own reference — including surfaces like TWAP and copy trading that CCXT exposes only as raw endpoints.
- **Pick CCXT** if you want spot, USDT-M perpetuals and BingX's other product lines behind one client with 81 unified capabilities, 12 streaming methods, demo trading behind one flag, and the same method names on 103 other venues.
- **Nothing is walled off.** All 187 BingX endpoints across eleven API sections are generated as implicit methods, signed and rate-limited.

## At a glance

| | **CCXT** | **Raw BingX API and community SDKs** |
| --- | --- | --- |
| Exchanges covered | 104 (BingX is one of them) | BingX only |
| Official client library | n/a — CCXT is third-party by design | **none** — BingX publishes documentation repositories only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | whichever community client exists, or whatever you write |
| Packages to install | **1** (`ccxt`) | one per language, from a different author each time |
| Product lines in one client | spot, USDT-M perpetuals, sub-accounts, wallet, copy trading — eleven API sections behind one object | you route each section yourself |
| Unified market data + trading API | yes — 81 capabilities on `bingx` | no — BingX's own payload shapes |
| WebSockets | yes — 12 `watch*` / `unWatch*` methods | varies by SDK |
| Raw endpoint access | yes — 187 endpoints as implicit methods | yes, it is all you have |
| Built-in rate limiter | yes, on by default (`rateLimit` 100 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus BingX error codes |
| Demo trading | `exchange.set_sandbox_mode(True)` swaps every host to `open-api-vst.bingx.com` | swap the base URL yourself |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** (one package, every venue) | `bingx-python` (community) 19 stars · 234 PyPI installs/month; `ccxt/bingx-python` 16 stars · 2.7k PyPI installs/month for the `bingx` package |
| Licence | MIT | community SDKs vary; `bingx-python` is MIT |
| Support | Discord, Telegram, GitHub — usually same-day | BingX developer channels; each SDK's own issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `BingX-API` GitHub organisation's repository listing, the `tigusigalpa/bingx-python` and `ccxt/bingx-python` repositories, and install counts from PyPI and npm.</sub>

## The same job, written both ways

The community side below uses `bingx-python`, an unofficial MIT-licensed client that describes itself as covering "USDT-M and Coin-M perpetual futures, spot trading, copy trading, sub-accounts, WebSocket streaming" with 190+ methods.

### Fetch a price

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bingx()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **bingx-python (community)**

```python
from bingx import BingXClient

client = BingXClient(
    api_key="your_api_key",
    api_secret="your_api_secret"
)

price = client.market().get_latest_price("BTC-USDT")
```

<!-- tabs:end -->

BingX uses `BTC-USDT` for both spot and perpetual symbols, which means the market id alone does not tell you which book you are on. CCXT resolves that into unified symbols — `'BTC/USDT'` for spot and `'BTC/USDT:USDT'` for the USDT-margined perpetual — and returns a [unified ticker structure](/docs/manual#ticker-structure) with the same keys on every venue.

### Place an order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bingx({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **bingx-python (community)**

```python
from bingx import BingXClient

client = BingXClient(api_key="your_api_key", api_secret="your_api_secret")

order = client.trade().create_order({
    "symbol": "BTC-USDT",
    "side": "BUY",
    "type": "MARKET",
    "quantity": 0.001
})
```

<!-- tabs:end -->

Both sign with HMAC-SHA256 over the sorted query string and an `X-BX-APIKEY` header. The difference is what happens around it: CCXT loads market metadata, rounds amount and price to BingX's tick and step, routes the call to the right one of eleven API sections, and returns a [unified order structure](/docs/manual#order-structure). Switching the same order to spot is one symbol change:

```python
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)   # spot
```

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.bingx()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT:USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **bingx-python (community)**

```python
from bingx.websocket import MarketDataStream

stream = MarketDataStream()
stream.connect()

stream.subscribe_depth("BTC-USDT", 20)

def on_message(data):
    print(data)

stream.on_message(on_message)
stream.listen()  # blocking
```

<!-- tabs:end -->

The SDK delivers **raw stream messages** to a callback. CCXT returns a **maintained book**: snapshot alignment, buffered updates during the snapshot fetch, gap detection and re-sync, reconnect and resubscribe, and a bounded cache. `unWatchOrderBook`, `unWatchTicker`, `unWatchTrades` and `unWatchOHLCV` tear a subscription down without dropping the socket.

Private streams are the sharper difference. BingX's user-data socket requires a **listen key** that you create and then refresh on a timer, or the stream stops delivering. The community SDK makes that explicit — you call `client.listen_key().generate()` and pass the key to the stream yourself. CCXT manages the whole lifecycle, refreshing the key every 59 minutes, inside ordinary method calls:

```python
exchange = ccxt.pro.bingx({'apiKey': '...', 'secret': '...'})
orders = await exchange.watch_orders()
```

A forgotten refresh is a stream that goes quiet without raising anything — the failure mode you find out about from a fill you did not see.

## Where the differences actually bite

### Eleven API sections, one client

BingX's API is not one surface. CCXT models `spot`, `swap`, `contract`, `fund`, `wallets`, `user`, `subAccount`, `account`, `copyTrading`, `cswap` and a general `api` section as separate routes inside a single exchange object, each with its own path prefix and, in some cases, its own content-type and signing encoding. From your side it is one instance and one set of method names.

That is also where the **187 implicit methods** live:

```python
# any raw BingX endpoint, camelCased from its path
symbols = exchange.spot_v1_public_get_common_symbols()
balance = exchange.fund_v1_private_get_account_balance()
```

Browse them on the [bingx implicit API page](/docs/exchanges/bingx/implicit-api).

### Demo trading without a second code path

BingX runs a virtual-money environment on a separate host. CCXT swaps every one of the eleven hosts in one call:

```python
exchange = ccxt.bingx({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)   # every host becomes open-api-vst.bingx.com
```

No constant swapping, no forked configuration, and the WebSocket URLs move with it.

### Seven languages, one API

There is no official BingX client in any language, so every language is either a community project or a from-scratch integration. CCXT is written once in TypeScript and transpiled, with identical method names and return structures:

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.bingx()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.bingx ();
const ticker = await exchange.fetchTicker ('BTC/USDT:USDT');
```

#### **C#**

```csharp
var exchange = new ccxt.bingx();
var ticker = await exchange.FetchTicker("BTC/USDT:USDT");
```

#### **Go**

```go
exchange := ccxt.NewBingx(nil)
ticker, err := exchange.FetchTicker("BTC/USDT:USDT")
```

<!-- tabs:end -->

If you want a single-venue package rather than all of CCXT, the CCXT project also publishes [ccxt/bingx-python](https://github.com/ccxt/bingx-python) — MIT, generated from the same source, installed as `bingx` — so the choice of scope does not have to be a choice of maintainer.

### Derivatives features as unified methods

BingX's perpetuals machinery is unified rather than raw: `fetch_positions`, `fetch_positions_history`, `fetch_position_mode`, `set_position_mode`, `set_leverage`, `set_margin_mode`, `set_margin`, `add_margin`, `reduce_margin`, `fetch_market_leverage_tiers`, `fetch_funding_rate`, `fetch_funding_rate_history`, `fetch_funding_history`, `fetch_open_interest`, `fetch_my_liquidations`, `close_position` and `close_all_positions`. Order entry covers trailing amount and percent orders, trigger, stop-loss, take-profit, reduce-only, batch `create_orders`, `edit_order` and `cancel_all_orders_after` — 81 capabilities in total.

### Rate limits you do not have to model

CCXT sets `rateLimit = 100` ms for `bingx` and applies per-endpoint weights from the exchange definition, with a token-bucket throttler on by default. You call methods in a loop; the library paces them. Hand-rolled, pacing plus correct back-off is application code you write and maintain, and the failure mode is a temporary ban rather than a clean error.

### Precision, rounding and string math

`load_markets()` reads BingX's symbol metadata and exposes tick size, step size and minimum notional through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class, so quantities never drift through float rounding:

```python
amount = exchange.amount_to_precision('BTC/USDT:USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT:USDT', 61234.56789)
```

### One error hierarchy

CCXT maps BingX's numeric error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once instead of matching on a code and hoping it never moves.

## What the raw API and community SDKs do better

An honest list, because these are real:

- **BingX's documentation is the authority, and raw calls match it exactly.** `symbol`, `positionSide`, `quantity`, `BTC-USDT` — when you are debugging against BingX's reference, raw JSON or a BingX-shaped SDK has no translation layer between you and it. CCXT's unified names are a deliberate abstraction and one more hop.
- **New BingX features appear in the docs first.** A brand-new BingX surface is documented before it is modelled as a unified CCXT method. CCXT's implicit API closes most of that gap on day one, but a *unified* wrapper can lag.
- **Product lines CCXT does not unify.** BingX's TWAP algorithmic orders, copy trading, standard contracts and sub-account management are reachable from CCXT only as implicit methods returning raw payloads. `bingx-python` wraps them as named services with typed methods — 13 copy-trading methods, 20 sub-account methods, 7 TWAP methods by its own count. If those are the bulk of your integration, the unified layer buys you less.
- **Coin-M perpetuals.** The community SDK documents dedicated Coin-M market, trade and listen-key services. CCXT's `bingx` class is built around spot and USDT-M perpetuals.
- **A much smaller dependency.** One signed `requests` call is a few lines. For a dashboard that reads one price, CCXT is more than you need.

If BingX is your only venue and TWAP, copy trading or sub-account provisioning is the centre of your integration, a BingX-specific client is the better primary dependency.

## Migrating from a raw BingX integration to CCXT

| What you are doing | Raw BingX API | CCXT |
| --- | --- | --- |
| Symbols | `'BTC-USDT'` | `'BTC/USDT'` (spot), `'BTC/USDT:USDT'` (USDT-M perp) |
| Client | your own signed `requests` wrapper | `ccxt.bingx({'apiKey': ..., 'secret': ...})` |
| Auth | HMAC-SHA256 over sorted params, `X-BX-APIKEY` | handled |
| Symbols / contracts | `/openApi/spot/v1/common/symbols`, `/openApi/swap/v2/quote/contracts` | `load_markets()` |
| Ticker | `/openApi/spot/v1/ticker/24hr` | `fetch_ticker()` / `fetch_tickers()` |
| Depth | `/openApi/spot/v1/market/depth` | `fetch_order_book()` |
| Klines | `/openApi/spot/v1/market/kline` | `fetch_ohlcv()` |
| New order | trade order endpoint | `create_order()` / `create_orders()` |
| Edit order | trade order endpoint | `edit_order()` |
| Cancel | cancel endpoints | `cancel_order()` / `cancel_orders()` / `cancel_all_orders()` |
| Open orders | open-orders endpoint | `fetch_open_orders()` |
| Balance | `/openApi/fund/v1/account/balance` | `fetch_balance()` |
| Positions | positions endpoint | `fetch_positions()` / `fetch_position()` |
| Leverage / margin mode | leverage and margin-type endpoints | `set_leverage()` / `set_margin_mode()` |
| Funding rate | funding-rate endpoints | `fetch_funding_rate()` / `fetch_funding_rate_history()` |
| Transfers | transfer endpoints | `transfer()` / `fetch_transfers()` |
| Streams | your own socket plus listen-key refresh | `watch_*` on `ccxt.pro.bingx` |
| Demo trading | swap base URL to `open-api-vst` | `set_sandbox_mode(True)` |
| Anything not listed | native call | the same endpoint as an [implicit method](/docs/exchanges/bingx/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [bingx unified API reference](/docs/exchanges/bingx).

## FAQ

**Is there an official BingX SDK?**
No. The BingX-API GitHub organisation publishes API documentation repositories, a proof-of-reserves tool and an AI coding-assistant skill library — not a client library. Every BingX SDK you will find is community-built. CCXT is third-party too, but it is a certified BingX integration maintained across 104 venues in seven languages.

**Does CCXT support BingX perpetual futures?**
Yes. `bingx` declares both spot and swap, with positions, leverage, margin mode, funding rates, leverage tiers, liquidations and trailing/trigger order types as unified methods — 81 capabilities in total.

**Does CCXT support BingX WebSockets?**
Yes. `ccxt.pro.bingx` implements 12 streaming methods — `watchTrades`, `watchOrderBook`, `watchOHLCV`, `watchTicker`, `watchOrders`, `watchMyTrades`, `watchBalance` and `watchPositions`, plus `unWatchOHLCV`, `unWatchOrderBook`, `unWatchTicker` and `unWatchTrades` — including the listen-key refresh that keeps the private stream alive.

**Can I use BingX demo trading with CCXT?**
Yes. `exchange.set_sandbox_mode(True)` swaps every REST and WebSocket host to BingX's VST environment at `open-api-vst.bingx.com`. Use demo keys; no other code changes.

**Can I still call BingX-specific endpoints?**
Yes — all 187 of them, across eleven API sections, as [implicit methods](/docs/exchanges/bingx/implicit-api), with signing, rate limiting and error mapping applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bingx unified API reference](/docs/exchanges/bingx)
- [bingx implicit API](/docs/exchanges/bingx/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
