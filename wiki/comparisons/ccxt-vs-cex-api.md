<!-- title: CCXT vs the CEX.IO API and cexio-spot-trading -->
<!-- description: CEX.IO's official client is Node.js only and passes calls through by name. Compare it with CCXT on languages, unified structures, streaming, rate limits and errors. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: CEX.IO's official client is a Node.js RPC passthrough — you still name endpoints and parse raw payloads. CCXT gives the same Spot Trading API 43 unified capabilities and 8 streaming methods, in eight languages. -->
<!-- weight: 100 -->

# CCXT vs the CEX.IO API and cexio-spot-trading

[CEX.IO](https://cex.io) publishes an official client for its Spot Trading API: [`@cex-io/cexio-spot-trading`](https://github.com/cex-io-exchange/cexio-spot-trading), a Node.js library covering both REST and WebSocket. [CCXT](/docs/manual) covers the same API as the exchange id `cex`, with 43 unified capabilities, 8 `watch*` streaming methods and all 28 endpoints.

They are aimed at different things, and the difference is visible in one line of code. The official client is a **passthrough**: `callPublic('get_ticker')` sends whatever you name and hands back whatever comes out. CCXT is a **translation layer**: `fetch_ticker('BTC/USDT')` returns the same structure it returns on every other exchange. The question is whether you want CEX.IO's payloads or a portable data model.

## TL;DR

- **Pick `cexio-spot-trading`** if you are in Node.js, CEX.IO is your only venue, and you would rather see the endpoint names in your own code than learn a unified vocabulary.
- **Pick CCXT** if you are not in Node.js, or you want unified structures, typed errors and precision handling, or you expect a second exchange — the same `fetch_ticker` call already works on 103 others.
- **CEX.IO's official client family is split by product.** `cexio-spot-trading`, `cexio-prime-liquidity` and `cexio-margin-trading` are three separate npm packages; `cexio-exchange-plus` is archived. CCXT's `cex` targets the Spot Trading API.

## At a glance

| | **CCXT** | **`@cex-io/cexio-spot-trading`** |
| --- | --- | --- |
| Exchanges covered | 104 (CEX.IO is one of them) | CEX.IO Spot Trading only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | **Node.js only** |
| Packages to install | **1** (`ccxt`) | one per CEX.IO product line |
| Unified market data + trading API | yes — 43 capabilities on `cex` | no — you name endpoints, you parse payloads |
| Programming model | `fetch_ticker('BTC/USDT')` | `callPublic('get_ticker')` / `callPrivate('do_my_new_order', {...})` |
| WebSockets | yes — 8 `watch*` methods | yes — `WebsocketClient`, connects and authenticates for you |
| Raw endpoint access | yes — 28 CEX.IO endpoints as implicit methods | yes, it is the whole design |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 300 ms) | not a documented feature |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status + CEX.IO error bodies |
| Testnet / sandbox | none — CEX.IO publishes no sandbox | none |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** (one package, every venue) | 7 GitHub stars · **181 npm installs/month** (sibling packages: prime-liquidity 237, margin-trading 106) |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub — usually same-day | GitHub issues, CEX.IO support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `cex-io-exchange` GitHub organisation's repository listing, the `cexio-spot-trading` README and npm metadata, and the CEX.IO Spot Trading API documentation at trade.cex.io/docs.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.cex()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **cexio-spot-trading**

```javascript
const { RestClient } = require('@cex-io/cexio-spot-trading');

const client = new RestClient();
const res = await client.callPublic('get_ticker');
console.log(res);
```

<!-- tabs:end -->

That is the whole difference in miniature. `callPublic('get_ticker')` is a string naming an endpoint, and the result is CEX.IO's payload — which you then map onto whatever your application uses. `fetch_ticker` returns a [unified ticker structure](/docs/manual#ticker-structure) with the same keys, types and units you get from Kraken, Binance or Coinbase, and it takes a unified symbol rather than CEX.IO's pair notation.

It also means typos are runtime failures on one side and method-not-found on the other, and that an IDE can complete `fetch_` but cannot complete the contents of a string.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.cex({'apiKey': '...', 'secret': '...'})
# CEX.IO does not allow API trading from the main account,
# so a sub-account name is required:
exchange.options['createOrder'] = {'accountId': 'sub-account-name'}
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 90000)
print(order['id'], order['status'])
```

#### **cexio-spot-trading**

```javascript
const { RestClient } = require('@cex-io/cexio-spot-trading');

const client = new RestClient(apiKey, apiSecret);
const res = await client.callPrivate('do_my_new_order', {
  clientOrderId: '...', accountId: 'sub-account-name',
  currency1: 'BTC', currency2: 'USDT',
  orderType: 'Limit', side: 'BUY', timeInForce: 'GTC',
  amountCcy1: '0.001', price: '90000', timestamp: Date.now(),
});
console.log(res);
```

<!-- tabs:end -->

CEX.IO requires API trading to run from a sub-account rather than the main account, and CCXT raises `ArgumentsRequired` if you have not named one — a clearer failure than a rejected order.

Both sign the request for you — CEX.IO's scheme is HMAC-SHA256 over `action + timestamp + body`, sent as `X-AGGR-KEY`, `X-AGGR-TIMESTAMP` and `X-AGGR-SIGNATURE`, and CCXT implements exactly that. The difference is what comes back and what you had to know to send it: `do_my_new_order` with CEX.IO's field names on one side, `create_order` with the signature CCXT uses everywhere on the other, returning a [unified order structure](/docs/manual#order-structure).

### Stream an order book

CEX.IO is one of the 76 CCXT exchanges with WebSocket support. `cex` has **8** `watch*` methods: `watchOrderBook`, `watchTicker`, `watchTickers`, `watchTrades`, `watchOHLCV`, `watchOrders`, `watchMyTrades` and `watchBalance`.

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.cex()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **cexio-spot-trading**

```javascript
const { WebsocketClient } = require('@cex-io/cexio-spot-trading');

const ws = new WebsocketClient(apiKey, apiSecret);
// the client connects and authenticates, then you subscribe
// and handle raw channel messages yourself
```

<!-- tabs:end -->

CEX.IO's client does handle connecting and authenticating the socket, which is genuinely useful. What it hands you after that is channel messages. CCXT is **pull-shaped**: `watch_order_book` returns a merged, depth-limited book as a value, so the streaming code reads like the REST code beside it, and the snapshot alignment, delta buffering, reconnect-and-resubscribe and bounded caching are already done.

## Where the differences actually bite

### Eight languages, one API

`cexio-spot-trading` is Node.js. If your service is in Python, Go, C# or PHP, there is no official CEX.IO client for it, and you are writing the signing and the payload mapping yourself.

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures:

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.cex()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.cex ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **C#**

```csharp
var exchange = new ccxt.cex();
var ticker = await exchange.FetchTicker("BTC/USDT");
```

#### **Go**

```go
exchange := ccxt.NewCex(nil)
ticker, err := exchange.FetchTicker("BTC/USDT")
```

<!-- tabs:end -->

### Rate limits you do not have to model

CEX.IO's documentation states a points budget: the public API allows **100 points per minute** by IP and the private API **200 points per minute** per API key, with most calls costing one point and a 429 when you exceed it.

CCXT sets `rateLimit = 300` ms for `cex` — exactly 200 requests per minute — and ships a token-bucket throttler that is **on by default**, with per-endpoint weights for the calls that cost more than one point (`get_processing_info` is weighted 10, `get_my_wallet_balance` and `get_my_orders` 5). You call methods in a loop; the library paces them. Neither pacing nor back-off is a documented feature of the official client.

### One error hierarchy

CCXT maps CEX.IO's error bodies onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. You write the handler once and it keeps working when you add a second exchange, instead of inspecting CEX.IO's error strings.

### Precision, rounding and string math

`load_markets()` reads CEX.IO's `get_pairs_info` and exposes tick size, step size and minimum notional through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities never drift through float rounding into a rejected order.

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 91234.56789)
```

### Nothing is hidden — the implicit API

The passthrough model's real advantage is that nothing is off-limits. CCXT keeps that: alongside the 43 unified capabilities, **all 28 CEX.IO endpoints are generated as callable implicit methods**, with signing, rate-limit accounting and error mapping applied:

```python
# any raw CEX.IO endpoint, camelCased from its name
response = exchange.private_post_get_my_account_status_v3()
```

So you get the unified API for the 95% that every venue shares, and the same passthrough access for the CEX.IO-specific 5%. Browse them on the [cex implicit API page](/docs/exchanges/cex/implicit-api).

### Portability

This is the difference that shows up six months in. Adding a second venue to a `cexio-spot-trading` integration means a second package, a second set of payload shapes and a second error convention — plus a translation layer of your own so the rest of your code stays venue-agnostic. That translation layer is what CCXT already is.

```python
for exchange_id in ['cex', 'kraken', 'binance', 'coinbase']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT')['last'])
```

## What cexio-spot-trading does better

An honest list, because these are real:

- **It is first-party and it tracks the API.** CEX.IO writes it, so the field names in the client are the field names in the CEX.IO documentation, with no abstraction in between. When you are reading `trade.cex.io/docs` while debugging, that is one less hop.
- **The passthrough model never lags.** A new CEX.IO endpoint is usable the moment it ships — `callPrivate('the_new_thing', {...})` — with no library release required. CCXT's implicit API closes most of this gap, but a *unified* wrapper for a new capability may still lag.
- **The WebSocket client authenticates itself.** `WebsocketClient` connects and performs the auth handshake on the server without you scripting it, which is a real convenience for private channels.
- **Sibling packages for the other CEX.IO products.** `cexio-prime-liquidity` and `cexio-margin-trading` cover the Prime Liquidity and Margin Trading APIs, which CCXT's `cex` does not model. If those are your products, the vendor packages are the option that exists.
- **A much smaller dependency.** For a Node service that calls three CEX.IO endpoints, one small package is a smaller install than a library covering 104 exchanges.

If you are on Node, trading only CEX.IO spot, and you prefer naming endpoints directly, `cexio-spot-trading` is a sensible choice.

## Migrating from cexio-spot-trading to CCXT

| What you are doing | `cexio-spot-trading` | CCXT |
| --- | --- | --- |
| Symbols | `pair: 'BTC-USDT'` | `'BTC/USDT'` |
| Client | `new RestClient(apiKey, apiSecret)` | `ccxt.cex({'apiKey': ..., 'secret': ...})` |
| Pairs | `callPublic('get_pairs_info')` | `load_markets()` |
| Ticker | `callPublic('get_ticker')` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `callPublic('get_order_book')` | `fetch_order_book()` |
| Candles | `callPublic('get_candles')` | `fetch_ohlcv()` |
| Trades | `callPublic('get_trade_history')` | `fetch_trades()` |
| New order | `callPrivate('do_my_new_order', {...})` | `create_order()` |
| Cancel order | `callPrivate('do_cancel_my_order', {...})` | `cancel_order()` |
| Cancel all | `callPrivate('do_cancel_all_orders', {...})` | `cancel_all_orders()` |
| Open orders | `callPrivate('get_my_orders', {...})` | `fetch_open_orders()` / `fetch_closed_orders()` |
| Balance | `callPrivate('get_my_wallet_balance')` | `fetch_balance()` |
| Trading fees | `callPrivate('get_my_current_fee')` | `fetch_trading_fees()` |
| Deposit address | `callPrivate('get_deposit_address', {...})` | `fetch_deposit_address()` |
| Internal transfer | `callPrivate('do_my_internal_transfer', {...})` | `transfer()` |
| Ledger | `callPrivate('get_my_transaction_history', {...})` | `fetch_ledger()` |
| Streams | `new WebsocketClient(...)` + channel handlers | `watch_*` on `ccxt.pro.cex` |
| Anything not listed | `callPrivate('endpoint_name', {...})` | the same endpoint as an [implicit method](/docs/exchanges/cex/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [cex unified API reference](/docs/exchanges/cex).

## FAQ

**Which CEX.IO API does CCXT's `cex` exchange target?**
The Spot Trading API at `trade.cex.io` — public calls on `/api/spot/rest-public` and private calls on `/api/spot/rest`, the same API `@cex-io/cexio-spot-trading` wraps. CEX.IO's Prime Liquidity and Margin Trading APIs are separate products with their own packages, and are not modelled as CCXT exchange ids.

**Is there an official CEX.IO Python SDK?**
No. CEX.IO's official clients are Node.js. CCXT's Python support for CEX.IO is a normal `pip install ccxt`, and the same code works in six other languages.

**Does CCXT support CEX.IO WebSockets?**
Yes — 8 `watch*` methods on `ccxt.pro.cex`, covering the order book, tickers, trades, candles, orders, own trades and balance. `watch_order_book` returns the same structure as `fetch_order_book`.

**Does CEX.IO have a testnet I can use with CCXT?**
No sandbox environment is published, so `set_sandbox_mode(True)` has nothing to point at for `cex`. Test against CCXT's offline static fixtures and small live orders.

**Can I still call CEX.IO-specific endpoints through CCXT?**
Yes — all 28 of them, as [implicit methods](/docs/exchanges/cex/implicit-api), with signing, rate limiting and error mapping applied. The passthrough style you get from `callPrivate` is preserved.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.cex` and call `watch*` methods.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [cex unified API reference](/docs/exchanges/cex)
- [cex implicit API](/docs/exchanges/cex/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
