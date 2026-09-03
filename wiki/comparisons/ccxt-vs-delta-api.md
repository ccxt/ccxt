<!-- title: CCXT vs the Delta Exchange API and delta-rest-client -->
<!-- description: CCXT and Delta Exchange's official Python REST client compared on symbols versus product ids, language coverage, rate limits, precision, errors and testnet handling. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Delta's official client is one Python package covering REST only. CCXT covers Delta's spot, perpetuals and options in seven languages with 43 unified capabilities — but neither side ships WebSocket support for Delta. -->
<!-- weight: 100 -->

# CCXT vs the Delta Exchange API and delta-rest-client

[Delta Exchange](https://www.delta.exchange) runs perpetuals, futures and options on BTC, ETH and a long tail of altcoins, with separate India and global deployments. Two realistic ways to integrate: the official [`delta-exchange/python-rest-client`](https://github.com/delta-exchange/python-rest-client) (published as `delta-rest-client` on PyPI), or [CCXT](/docs/manual), which speaks Delta's v2 API behind the same interface it uses for 103 other venues.

The question that decides it: **is Delta the only venue you will trade, in Python?**

## TL;DR

- **Pick `delta-rest-client`** if Delta is your only venue, you work in Python, and you want method arguments that match Delta's docs literally — numeric `product_id`, integer contract `size`, and an explicit `base_url` for India versus global.
- **Pick CCXT** if you want unified symbols and one `create_order` that means the same thing on Delta, Binance and Deribit — in seven languages, with rate limiting, precision handling and typed errors already written.
- **Neither side streams.** CCXT implements **no `watch*` methods for Delta**, and the official Python client is REST-only. If you need Delta's WebSocket feed today, you write it against the raw socket either way. That is the honest state of both projects.

## At a glance

| | **CCXT** | **delta-rest-client** |
| --- | --- | --- |
| Venues covered | 104 (Delta is one of them) | Delta Exchange only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python |
| Packages to install | 1 (`ccxt`) | 1 (`delta-rest-client`) |
| Unified market data + trading API | yes — 43 unified capabilities, 30 `fetch*` methods | no — Delta's own request and response shapes |
| Products | spot, perpetuals, futures, options from one client | all of them, addressed by numeric `product_id` |
| Instrument addressing | unified symbols: `'BTC/USDT'`, `'BTC/USDT:USDT'`, `'BTC/USDT:USDT-260905-78200-C'` | integer `product_id`, or Delta's own `symbol` strings |
| WebSockets | **no** — 0 `watch*` methods for this venue | no — REST only |
| Raw endpoint access | yes — 52 Delta endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 300 ms) | no |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus Delta's error payload |
| Testnet | `exchange.set_sandbox_mode(True)` — swaps in `testnet-api.delta.exchange` | `base_url` constructor argument, India or global, prod or testnet |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | 27 GitHub stars · 26.0k PyPI installs/month |
| Latest release | continuous | 1.0.14, uploaded April 2026 |
| Licence | MIT | see repository |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `delta-exchange/python-rest-client` repository and its source, the `delta-rest-client` PyPI metadata, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.delta()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **delta-rest-client**

```python
from delta_rest_client import DeltaRestClient

client = DeltaRestClient(base_url='https://api.delta.exchange')
ticker = client.get_ticker('BTCUSDT')
print(ticker)
```

<!-- tabs:end -->

`get_ticker` returns Delta's payload as-is. CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — same keys, same types, same units as the ticker you get from Binance or Kraken — and its symbols carry the market type, so a perpetual is `'BTC/USDT:USDT'`, spot is `'BTC/USDT'`, and an option is `'BTC/USDT:USDT-260905-78200-C'` with expiry, strike and type parsed out into `market['expiry']`, `market['strike']` and `market['optionType']`.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.delta({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 60000)
print(order['id'], order['status'])
exchange.cancel_order(order['id'], 'BTC/USDT:USDT')
```

#### **delta-rest-client**

```python
from delta_rest_client import DeltaRestClient, OrderType

client = DeltaRestClient(
    base_url='https://api.delta.exchange',
    api_key='...',
    api_secret='...',
)
product_id = 139         # BTCUSDT — you look this up first
order = client.place_order(
    product_id=product_id,
    size=1,
    side='buy',
    limit_price='60000',
    order_type=OrderType.LIMIT,
)
client.cancel_order(product_id, order['id'])
```

<!-- tabs:end -->

The visible difference is `product_id`. Delta's API addresses instruments by an integer that you resolve first — from `get_product()` or `get_assets()` — and carry through every subsequent call, including cancellation. CCXT resolves it for you at `load_markets()` time and keeps the numeric id on `market['numericId']` if you want it. The return value is a [unified order structure](/docs/manual#order-structure), so `order['status']`, `order['filled']` and `order['average']` sit where they sit on every other exchange.

## Where the differences actually bite

### Symbols, contract size and precision

Delta quotes derivatives in **contracts**, not base units, and every product has its own `contract_value` and `tick_size`. CCXT loads that with the markets, so `market['contractSize']` and the precision helpers are there before you send anything:

```python
exchange = ccxt.delta()
exchange.load_markets()
market = exchange.market('BTC/USDT:USDT')
print(market['contractSize'], market['precision']['price'], market['limits']['amount']['min'])

amount = exchange.amount_to_precision('BTC/USDT:USDT', 3.0000001)
price = exchange.price_to_precision('BTC/USDT:USDT', 60123.456789)
```

The rounding is backed by the `Precise` string-arithmetic class, so quantities never drift through float representation — the failure mode where a price that looks fine in Python is rejected as off-tick.

### Options, positions and margin are unified

Delta's option and derivatives surface is covered by named methods rather than raw payloads: `fetchOption`, `fetchGreeks`, `fetchSettlementHistory`, `fetchOpenInterest`, `fetchFundingRate`, `fetchFundingRates`, `fetchPosition`, `fetchPositions`, `fetchPositionsADLRank`, `setLeverage`, `setMarginMode`, `fetchMarginMode`, `fetchLeverage`, `addMargin`, `reduceMargin` and `closeAllPositions`. Forty-three unified capabilities in total, thirty of them `fetch*` methods.

```python
greeks = exchange.fetch_greeks('BTC/USDT:USDT-260905-78200-C')
positions = exchange.fetch_positions()
exchange.set_leverage(10, 'BTC/USDT:USDT')
```

The same method names do the same thing on Deribit, OKX and Bybit, which is the point.

### Rate limits you do not have to model

CCXT ships a token-bucket throttler that is **on by default** (`enableRateLimit = true`, base `rateLimit` 300 ms for Delta) with per-endpoint weights in the exchange definition. You call methods in a loop; the library paces them. With a thin REST wrapper, backing off correctly is application code you write and maintain.

### One error hierarchy

CCXT maps Delta's error payloads onto its [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError` and 35 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once and it keeps working when you add a second venue that words the same condition differently.

### Testnet without a second code path

```python
exchange = ccxt.delta({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)   # swaps in testnet-api.delta.exchange
```

One flag. Note the scope honestly: CCXT ships Delta's **global** hosts, `api.delta.exchange` and `testnet-api.delta.exchange`. Delta also runs a separate India deployment on `api.india.delta.exchange` with its own accounts, keys and product ids; the official client makes that a constructor argument, and in CCXT you would override `exchange.urls['api']` yourself.

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.delta ();
const ticker = await exchange.fetchTicker ('BTC/USDT:USDT');
```

#### **Python**

```python
import ccxt
exchange = ccxt.delta()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
```

#### **Go**

```go
exchange := ccxt.NewDelta(nil)
ticker, err := exchange.FetchTicker("BTC/USDT:USDT")
```

<!-- tabs:end -->

The official client is Python. Delta's organisation also publishes a `node-client` repository, last updated December 2022.

### Nothing is hidden — the implicit API

Alongside the unified methods, **all 52 Delta endpoints are generated as callable implicit methods**, with signing, rate-limit accounting and error mapping applied:

```python
response = exchange.public_get_products()
```

Browse them all on the [Delta implicit API page](/docs/exchanges/delta/implicit-api).

## What delta-rest-client does better

Real advantages, not padding:

- **Batch order entry.** The client exposes `batch_create`, `batch_cancel` and `batch_edit`, which submit up to five orders on a product in one request. CCXT's Delta integration has `createOrder`, `editOrder`, `cancelOrder` and `cancelAllOrders`, but no unified batch order-entry methods for this venue — you would reach for the implicit endpoint.
- **India and global as a first-class choice.** `DeltaRestClient(base_url=...)` documents all four environments — India production, India testnet, global production, global testnet — and treats switching between them as normal. CCXT ships the global pair and expects you to override the URLs for India.
- **One-to-one with Delta's docs.** `product_id`, `size` in contracts, `stop_order_type`, `trail_amount`, `post_only`, `reduce_only` — the arguments are Delta's arguments. Debugging against the vendor reference is one hop instead of two.
- **New endpoints land there first.** Whatever Delta ships appears in their own client before a *unified* CCXT method models it, though CCXT's implicit API closes most of that gap on day one.
- **Smaller dependency.** For a Delta-only Python bot, `delta-rest-client` is a much smaller install than all of CCXT.

If Delta is your only venue and you are writing Python, the official client is a defensible choice — particularly if you batch orders.

## Migrating from delta-rest-client to CCXT

| What you are doing | delta-rest-client | CCXT |
| --- | --- | --- |
| Instruments | `get_product(product_id)` / `get_assets()` | `load_markets()` |
| Addressing | integer `product_id` | `'BTC/USDT:USDT'`, `'BTC/USDT'`, dated option symbols |
| Ticker | `get_ticker(symbol)` | `fetch_ticker()` |
| Order book | `get_l2_orderbook(product_id)` | `fetch_order_book()` |
| Candles | history endpoints | `fetch_ohlcv()` |
| New order | `place_order(...)` / `create_order(order)` | `create_order()` |
| Stop order | `place_stop_order(...)` | `create_order()` with `params['triggerPrice']` |
| Cancel | `cancel_order(product_id, order_id)` | `cancel_order()` |
| Open orders | `get_live_orders()` | `fetch_open_orders()` |
| Fills | `fills(query, page_size)` | `fetch_my_trades()` |
| Balance | `get_balances(asset_id)` | `fetch_balance()` |
| Position | `get_position(product_id)` | `fetch_position()` / `fetch_positions()` |
| Leverage | `set_leverage(product_id, leverage)` | `set_leverage()` |
| Anything not listed | the raw path | the same endpoint as an [implicit method](/docs/exchanges/delta/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [delta unified API reference](/docs/exchanges/delta).

## FAQ

**Does CCXT support Delta Exchange WebSockets?**
No. CCXT implements zero `watch*` methods for Delta, so streaming is not available through CCXT for this venue. The official Python client does not stream either. Delta documents a WebSocket feed, and today you would consume it directly.

**Does CCXT support Delta options?**
Yes. Options load as unified symbols carrying expiry, strike and type — `'BTC/USDT:USDT-260905-78200-C'` — and `fetchOption`, `fetchGreeks`, `fetchSettlementHistory` and `fetchOpenInterest` are implemented for the venue.

**Can CCXT talk to Delta Exchange India?**
CCXT ships the global hosts (`api.delta.exchange` and, in sandbox mode, `testnet-api.delta.exchange`). The India deployment runs on its own host with its own keys and product ids; you would override `exchange.urls['api']` to point at it. The official client makes that a constructor argument.

**Is CCXT slower than delta-rest-client?**
CCXT adds parsing and normalisation on top of the same HTTP calls, so there is a small constant overhead per response. Network round-trip time dominates it for anything short of latency-critical market making.

**Can I still call Delta-specific endpoints from CCXT?**
Yes — all 52 of them, as [implicit methods](/docs/exchanges/delta/implicit-api), with signing and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed, no paid tier.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [delta unified API reference](/docs/exchanges/delta)
- [delta implicit API](/docs/exchanges/delta/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
