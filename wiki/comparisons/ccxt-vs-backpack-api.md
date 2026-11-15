<!-- title: CCXT vs the Backpack Exchange API and its SDKs -->
<!-- description: Backpack's only official client is Rust. CCXT compared with the community Python SDKs on ED25519 signing, language coverage, streaming and unified structures. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Backpack ships one official client, in Rust; every other language is community-built and unendorsed. CCXT covers Backpack's spot, margin and perpetual markets with 69 unified capabilities in eight languages. -->
<!-- weight: 100 -->

# CCXT vs the Backpack Exchange API and its SDKs

[Backpack Exchange](https://backpack.exchange/) has an unusual client situation. Its own repository, [backpack-exchange/bpx-api-client](https://github.com/backpack-exchange/bpx-api-client), is titled "Official API clients for Backpack Exchange" and states plainly: *"Currently, only a `Rust` client is available."* Backpack's [API Clients](https://support.backpack.exchange/exchange/api-and-developer-docs/api-clients) page then lists clients for Python, JavaScript, TypeScript, Go and Rust, prefaced with a caveat — *"Some of the SDKs listed below are community-built and are not officially maintained or endorsed by the Backpack team."*

So unless you write Rust, the choice is between a community SDK and a unified library. The question that decides it: **do you want a Backpack-shaped client, or do you want Backpack to look like the other venues you trade?**

## TL;DR

- **Pick a community SDK** if Backpack is your only venue, you are in Python, and you want method and field names that match Backpack's own reference exactly — `execute_order`, `Bid`, `SOL_USDC`.
- **Pick CCXT** if you want one maintained dependency covering Backpack's spot, margin and perpetual markets with the same 69 unified capabilities and the same method names you already use elsewhere, in eight languages.
- **Backpack's request signing is ED25519, not HMAC**, over a payload prefixed with a per-endpoint `instruction` string. It is a small piece of code to get wrong, and CCXT has already written it.

## At a glance

| | **CCXT** | **Backpack SDKs** |
| --- | --- | --- |
| Venues covered | 104 (Backpack is one of them) | Backpack only |
| Official client languages | n/a — CCXT is third-party by design | **Rust only** (`bpx-api-client`) |
| Community client languages | n/a | Python, JavaScript, TypeScript, Go — listed but unendorsed |
| Languages you can use it from | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | whichever client exists for your language |
| Packages to install | **1** (`ccxt`) | 1 per language, from a different author each time |
| Markets in one client | spot, margin and perpetuals | per SDK |
| Unified market data + trading API | yes — 69 capabilities on `backpack` | no — Backpack's own payload shapes |
| ED25519 request signing | built in | built in by each SDK |
| WebSockets | yes — 15 `watch*` / `unWatch*` methods | varies: `bpx-py`'s README documents REST only, `backpack-exchange-sdk` ships a `WebSocketClient` |
| Raw endpoint access | yes — 56 endpoints as implicit methods | yes |
| Built-in rate limiter | yes, on by default (`rateLimit` 50 ms) | not documented in either Python SDK README |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus Backpack error payloads |
| Testnet / sandbox | **none** — Backpack publishes no sandbox in CCXT | none |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** (one package, every venue) | `bpx-api-client` (Rust, official) 46 stars; `bpx-py` 29 stars · 974 PyPI installs/month; `backpack_exchange_sdk` 42 stars · 162 PyPI installs/month |
| Licence | MIT | `bpx-api-client` Apache-2.0; `bpx-py` Apache-2.0; `backpack_exchange_sdk` MIT |
| Support | Discord, Telegram, GitHub — usually same-day | each SDK's own GitHub issues; Backpack's Discord for the API itself |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `backpack-exchange/bpx-api-client`, `sndmndss/bpx-py` and `solomeowl/backpack_exchange_sdk` repositories, Backpack's API Clients support page, and install counts from PyPI and npm.</sub>

## The same job, written both ways

The Python side below uses `backpack-exchange-sdk`, the community SDK that documents both REST and WebSocket coverage.

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.backpack()
ticker = exchange.fetch_ticker('SOL/USDC')
print(ticker['last'], ticker['baseVolume'])
```

#### **backpack-exchange-sdk**

```python
from backpack_exchange_sdk import PublicClient

client = PublicClient()

markets = client.get_markets()
ticker = client.get_ticker("SOL_USDC")
depth = client.get_depth("SOL_USDC")
```

<!-- tabs:end -->

Backpack's market ids are underscore-separated — `SOL_USDC` for spot and `SOL_USDC_PERP` for the perpetual. CCXT translates those into unified symbols, `'SOL/USDC'` and `'SOL/USDC:USDC'`, and returns a [unified ticker structure](/docs/manual#ticker-structure) whose keys are the same on every venue.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.backpack({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('SOL/USDC', 'limit', 'buy', 1, 100)
print(order['id'], order['status'])
```

#### **backpack-exchange-sdk**

```python
from backpack_exchange_sdk import AuthenticationClient

client = AuthenticationClient("<API_KEY>", "<SECRET_KEY>")

order = client.execute_order(
    orderType="Limit",
    side="Bid",
    symbol="SOL_USDC",
    price="100",
    quantity="1"
)
```

<!-- tabs:end -->

Backpack's own vocabulary is `Bid`/`Ask` rather than `buy`/`sell`, `orderType` rather than `type`, and quantities as strings. CCXT maps those onto the unified `create_order(symbol, type, side, amount, price)` signature and returns a [unified order structure](/docs/manual#order-structure), so the call is the same one you make on Binance or Bybit.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.backpack()
    while True:
        orderbook = await exchange.watch_order_book('SOL/USDC')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **backpack-exchange-sdk**

```python
from backpack_exchange_sdk import WebSocketClient

ws = WebSocketClient()

def on_message(data):
    print(data)

ws.subscribe(
    streams=["bookTicker.SOL_USDC"],
    callback=on_message
)
```

<!-- tabs:end -->

The SDK hands you raw stream messages through a callback. CCXT hands you a **maintained order book**: the REST snapshot is fetched and aligned with the stream, updates arriving during the fetch are buffered and replayed, sequence gaps trigger a re-sync, and the socket reconnects and resubscribes after a drop. `watch_order_book` returns the same structure as `fetch_order_book`, so swapping polling for streaming does not change the code downstream.

CCXT also implements `watchOrderBookForSymbols`, `watchTradesForSymbols` and `watchOHLCVForSymbols` for multiplexing several symbols onto one connection, plus `unWatchTrades`, `unWatchTradesForSymbols`, `unWatchOrders` and `unWatchPositions` for tearing a subscription down without dropping the socket.

## Where the differences actually bite

### ED25519 signing, with an instruction prefix

Backpack does not sign with HMAC. Each private request is signed with **ED25519** over a payload that begins with a per-endpoint `instruction` string — `orderExecute`, `balanceQuery`, `orderCancelAll` and so on — followed by the request parameters in sorted order, a millisecond timestamp and a window. The signature goes out as `X-Signature` alongside `X-Timestamp`, `X-Window` and `X-API-Key`, and your secret is a base64-encoded seed rather than a shared HMAC key.

None of that is hard, and all of it is easy to get subtly wrong — a parameter sorted in the wrong order or a missing instruction produces the same unhelpful rejection. CCXT carries the instruction map for every endpoint and does the signing in all eight languages.

### Spot, margin and perpetuals in one client

`backpack` in CCXT declares `spot`, `margin` and `swap`, and the derivatives capabilities are unified methods rather than raw calls: `fetch_positions`, `fetch_funding_rate`, `fetch_funding_rate_history`, `fetch_funding_history`, `fetch_open_interest`, `fetch_open_interest_history`, `fetch_mark_ohlcv` and `fetch_index_ohlcv`. Order entry covers `create_orders` for batching, `create_order_with_take_profit_and_stop_loss`, `create_trigger_order`, `create_post_only_order` and `create_reduce_only_order` — 69 capabilities in total, with the same names on the next venue.

### Eight languages, one API

Backpack's only official client is Rust, and CCXT now targets Rust too — so on that axis the choice is no longer forced. In TypeScript, Python, PHP, C#, Go or Java, CCXT is the maintained option where otherwise you would pick a community project or write your own:

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.backpack()
ticker = exchange.fetch_ticker('SOL/USDC')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.backpack ();
const ticker = await exchange.fetchTicker ('SOL/USDC');
```

#### **C#**

```csharp
var exchange = new ccxt.backpack();
var ticker = await exchange.FetchTicker("SOL/USDC");
```

#### **Go**

```go
exchange := ccxt.NewBackpack(nil)
ticker, err := exchange.FetchTicker("SOL/USDC")
```

<!-- tabs:end -->

### Rate limits you do not have to model

CCXT sets `rateLimit = 50` ms for `backpack` — the exchange file records the venue's allowance of twenty requests per second — and ships a token-bucket throttler that is on by default. You call methods in a loop; the library paces them. Neither Python SDK's README documents a rate limiter, so with those the pacing and the back-off are yours to write.

### Precision, rounding and string math

`load_markets()` reads Backpack's market metadata and exposes tick size, step size and minimum order size through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class. Backpack expects prices and quantities as strings anyway, which is exactly where float formatting quietly ruins an order:

```python
amount = exchange.amount_to_precision('SOL/USDC', 1.23456789)
price = exchange.price_to_precision('SOL/USDC', 100.987654321)
```

### One error hierarchy

CCXT maps Backpack's error payloads onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`.

### Nothing is hidden — the implicit API

Alongside the 69 unified capabilities, **all 56 endpoints CCXT defines for Backpack are generated as callable implicit methods**, signed and rate-limited:

```python
# any raw Backpack endpoint, camelCased from its path
markets = exchange.public_get_api_v1_markets()
```

Browse them on the [backpack implicit API page](/docs/exchanges/backpack/implicit-api).

## What the Backpack SDKs do better

An honest list, because these are real:

- **A first-party Rust client, written as Rust.** `bpx-api-client` is Backpack's own and Apache-2.0, with an API shaped by the language rather than transpiled into it. CCXT reaches Rust too, but through a generated crate that carries the same vocabulary as its seven other targets.
- **Endpoint coverage.** `backpack_exchange_sdk` describes itself as supporting "all 70 API endpoints including REST and WebSocket", including RFQ and strategy endpoints. CCXT defines 56 endpoints for `backpack`, so a handful of Backpack's newer surfaces are not reachable even as implicit methods.
- **Lend and borrow.** Backpack's borrow/lend product is present in CCXT only as raw implicit endpoints (`api/v1/borrowLend`, `api/v1/borrowLend/positions`) — the source file marks the unified wrappers as still to do. If lending is central to your integration, a Backpack-specific SDK models it directly.
- **Field-for-field fidelity.** `Bid`, `orderType`, `SOL_USDC_PERP`, `TimeInForce.GTC` — when you are reading Backpack's docs while debugging, an SDK that uses those exact names removes a translation step. CCXT's unified names are a deliberate abstraction.
- **Typed enums and hints.** `backpack_exchange_sdk` ships enums for order type, side, time in force and self-trade prevention with full type annotations, which is a nicer editing experience than passing unified strings if you only ever target this venue.

If Backpack is your only venue and you want a Rust client written natively as Rust — or you need its RFQ, strategy or lending endpoints — a Backpack-specific client is the better dependency.

## Migrating from a Backpack SDK to CCXT

| What you are doing | Backpack SDK | CCXT |
| --- | --- | --- |
| Symbols | `"SOL_USDC"`, `"SOL_USDC_PERP"` | `'SOL/USDC'`, `'SOL/USDC:USDC'` |
| Client | `PublicClient` + `AuthenticationClient` | one `ccxt.backpack({'apiKey': ..., 'secret': ...})` |
| Markets | `get_markets()` | `load_markets()` |
| Ticker | `get_ticker(symbol)` / `get_tickers()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `get_depth(symbol)` | `fetch_order_book()` |
| Candles | `get_klines(...)` | `fetch_ohlcv()` |
| Mark price / open interest | `get_mark_price()`, `get_open_interest()` | `fetch_funding_rate()`, `fetch_open_interest()` |
| New order | `execute_order(orderType=..., side=...)` | `create_order()` |
| Batch orders | per-SDK | `create_orders()` |
| Cancel order | cancel-order call | `cancel_order()` / `cancel_all_orders()` |
| Open orders | open-orders call | `fetch_open_orders()` |
| Order history | `get_order_history(symbol=...)` | `fetch_orders()` |
| Fills | `get_fill_history(...)` | `fetch_my_trades()` |
| Balances | `get_balances()` | `fetch_balance()` |
| Positions | positions call | `fetch_positions()` |
| Streams | `WebSocketClient.subscribe(streams=[...], callback=...)` | `watch_*` on `ccxt.pro.backpack` |
| Anything not listed | native SDK method | the same endpoint as an [implicit method](/docs/exchanges/backpack/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [backpack unified API reference](/docs/exchanges/backpack).

## FAQ

**Is there an official Backpack Python SDK?**
No. Backpack's own repository says only a Rust client is available, and its API Clients page warns that "Some of the SDKs listed below are community-built and are not officially maintained or endorsed by the Backpack team." The Python options — `bpx-py` and `backpack-exchange-sdk` — are community projects. CCXT is a third-party library too, but one maintained across 104 venues in eight languages.

**How does CCXT sign Backpack requests?**
With ED25519. Your `secret` is a base64-encoded seed; CCXT builds a payload of `instruction=<per-endpoint instruction>&<sorted params>&timestamp=<ms>&window=<ms>`, signs it, and sends `X-API-Key`, `X-Timestamp`, `X-Window` and `X-Signature`. You never write that code.

**Does CCXT support Backpack WebSockets?**
Yes. `ccxt.pro.backpack` implements 15 streaming methods, including `watchOrderBook`, `watchOrderBookForSymbols`, `watchTicker`, `watchTickers`, `watchBidsAsks`, `watchTrades`, `watchTradesForSymbols`, `watchOHLCV`, `watchOHLCVForSymbols`, `watchOrders` and `watchPositions`, plus four `unWatch*` counterparts.

**Does Backpack have a testnet?**
Not one CCXT can point at. There is no sandbox URL for `backpack`, so `set_sandbox_mode(True)` has nothing to swap in. Test against CCXT's offline static fixtures and small live orders.

**Does CCXT cover Backpack perpetuals?**
Yes. `backpack` declares spot, margin and swap, with `fetch_positions`, funding-rate methods, open interest, mark and index candles, reduce-only and trigger orders all as unified methods.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [backpack unified API reference](/docs/exchanges/backpack)
- [backpack implicit API](/docs/exchanges/backpack/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
