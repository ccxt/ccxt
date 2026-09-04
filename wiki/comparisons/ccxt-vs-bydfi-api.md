<!-- title: CCXT vs the raw BYDFi API -->
<!-- description: BYDFi publishes documentation but no client library in any language. Compare CCXT and hand-written HTTP on signing, derivatives, streaming and errors. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: BYDFi ships no SDK — there is no bydfi package on npm or PyPI, and its only GitHub repository is documentation. CCXT implements 60 unified capabilities and 10 streaming methods against its perpetual-futures API. -->
<!-- weight: 100 -->

# CCXT vs the raw BYDFi API

[BYDFi](https://bydfi.com/) documents a perpetual-futures trading API at [developers.bydfi.com](https://developers.bydfi.com/en/). What it does not publish is a client library.

That is not a guess. There is no `bydfi`, `bydfi-api` or `bydfi-sdk` package on npm, and none on PyPI. The `bydfi-official/api-docs` repository on GitHub contains documentation and configuration files only — no client code. A GitHub search for repositories matching "bydfi" returns referral pages, personal bots and scraping scripts, and no first-party wrapper in any language.

So the comparison here is not CCXT against a vendor SDK. It is **CCXT against the HTTP client you were about to write** — and against the derivatives plumbing that comes with it.

## TL;DR

- **Write it yourself** if you need three endpoints, you are in a language CCXT does not target, or you want the signing visible in your own repository.
- **Pick CCXT** if you want signing, streaming, leverage and margin-mode handling, position bookkeeping, precision and typed errors already implemented against the live venue — 60 unified capabilities, 10 `watch*` methods and all 45 endpoints.
- **The derivatives surface is what you would spend the time on.** Leverage, margin mode, hedge-vs-one-way position mode, reduce-only and trailing orders, sub-wallets and position history are all things CCXT already models with the same names it uses on Bybit, OKX and Binance futures.

## At a glance

| | **CCXT** | **Raw BYDFi REST API** |
| --- | --- | --- |
| Exchanges covered | 104 (BYDFi is one of them) | BYDFi only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | whatever you write it in |
| Official client library | n/a | **none published** — no package on npm or PyPI, no client code on GitHub |
| Products covered | perpetual futures (linear swaps) | perpetual futures |
| Unified market data + trading API | yes — 60 capabilities on `bydfi` | no — raw JSON payloads |
| WebSockets | yes — 10 `watch*` methods | you implement the socket client |
| Raw endpoint access | yes — 45 BYDFi endpoints as implicit methods | yes, it is all you have |
| Built-in rate limiter | yes, on by default (`rateLimit` 50 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status + BYDFi `code`/`message` bodies |
| Leverage / margin mode / position mode | `set_leverage`, `set_margin_mode`, `set_position_mode` and their `fetch_*` counterparts | separate endpoints, your own state handling |
| Testnet / sandbox | none — BYDFi publishes no sandbox | none |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** | `bydfi-official/api-docs` 0 stars, documentation only |
| Licence | MIT | n/a |
| Support | Discord, Telegram, GitHub — usually same-day | BYDFi support channels |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `bydfi-official/api-docs` repository, a GitHub repository search for BYDFi client libraries, and npm and PyPI registry lookups.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bydfi()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw REST**

```python
import requests

r = requests.get('https://api.bydfi.com/api/v1/fapi/market/ticker/24hr',
                 params={'symbol': 'BTC-USDT'})
print(r.json()['data'])
```

<!-- tabs:end -->

`'BTC/USDT:USDT'` is CCXT's unified notation for a USDT-settled linear perpetual — the same string identifies the equivalent contract on Bybit, OKX or Binance. `BTC-USDT` is BYDFi's own market id, which CCXT resolves for you through `load_markets()`.

The CCXT call returns a [unified ticker structure](/docs/manual#ticker-structure): consistent keys, milliseconds, base and quote volume separated. The raw call returns BYDFi's payload wrapped in a `{code, message, data}` envelope you unwrap yourself.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bydfi({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 0.001, 90000)
print(order['id'], order['status'])
```

#### **Raw REST**

```python
import hashlib, hmac, json, time, requests

timestamp = str(int(time.time() * 1000))
# parameters must be key-sorted before they are serialised
body = json.dumps({'price': '90000', 'quantity': '0.001',
                   'side': 'BUY', 'symbol': 'BTC-USDT',
                   'type': 'LIMIT', 'wallet': 'W001'}, sort_keys=True)
signature = hmac.new(API_SECRET.encode(),
                     (API_KEY + timestamp + body).encode(),
                     hashlib.sha256).hexdigest()

r = requests.post('https://api.bydfi.com/api/v1/fapi/trade/place_order',
                  headers={'Content-Type': 'application/json',
                           'X-API-KEY': API_KEY,
                           'X-API-TIMESTAMP': timestamp,
                           'X-API-SIGNATURE': signature},
                  data=body)
print(r.json())
```

<!-- tabs:end -->

The signed payload differs by HTTP method — `apiKey + timestamp + urlencoded_query` on `GET`, `apiKey + timestamp + json_body` on `POST` — and in both cases the parameters must be **key-sorted first** or the signature will not match. CCXT does that internally, and does the equivalent for the other 103 exchanges without you learning each variant.

### Stream an order book

BYDFi is one of the 76 CCXT exchanges with WebSocket support. `bydfi` has **10** `watch*` methods: `watchOrderBook`, `watchOrderBookForSymbols`, `watchTicker`, `watchTickers`, `watchOHLCV`, `watchOHLCVForSymbols`, `watchOrders`, `watchOrdersForSymbols`, `watchPositions` and `watchBalance`.

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.bydfi()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT:USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Raw WebSocket**

```python
# open the socket, send a subscribe frame, then:
#   - fetch a REST snapshot and align it with the stream,
#     buffering deltas that arrive while it is in flight
#   - detect sequence gaps and re-sync
#   - reconnect, resubscribe and re-seed after a drop
#   - keep the local book bounded instead of growing forever
```

<!-- tabs:end -->

`watch_order_book` returns the same structure as `fetch_order_book`, already merged and depth-limited, so swapping a polling loop for a stream leaves the downstream code untouched. Every line in the right-hand column is a place a hand-rolled book goes quietly wrong — it does not throw, it drifts, and you find out from a fill you did not expect. `watch_positions` and `watch_balance` matter more on a derivatives venue than on spot: liquidation risk is a function of margin you want pushed to you, not polled.

## Where the differences actually bite

### The derivatives surface is already modelled

This is the bulk of the work you would otherwise do yourself. CCXT implements, with the same names it uses on every other futures venue:

```python
exchange.set_leverage(10, 'BTC/USDT:USDT')
exchange.set_margin_mode('isolated', 'BTC/USDT:USDT')
exchange.set_position_mode(True)                       # hedge mode
positions = exchange.fetch_positions(['BTC/USDT:USDT'])
history   = exchange.fetch_positions_history(['BTC/USDT:USDT'])
funding   = exchange.fetch_funding_rate('BTC/USDT:USDT')
```

Order types too: stop-loss, take-profit, stop-limit, post-only, reduce-only and trailing-percent orders are unified params on `create_order`, not four separate request shapes. `create_orders` and `edit_orders` map onto BYDFi's batch endpoints, and `edit_order_with_client_order_id` lets you amend by your own id rather than the exchange's.

BYDFi also has sub-wallets — `W001` is the default contract wallet — and CCXT threads that through as `params['wallet']` on the methods that need it.

### Rate limits you do not have to model

CCXT ships a token-bucket throttler that is on by default, at `rateLimit = 50` ms for `bydfi`. BYDFi also exposes an endpoint that reports your own rate-limit configuration, which CCXT surfaces as an implicit method:

```python
limits = exchange.public_get_v1_public_api_limits()
```

Hand-rolled, pacing and back-off on a 429 are your code, and the endpoint above is one you have to remember exists.

### One error hierarchy

CCXT maps BYDFi's `{code, message}` envelopes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once instead of matching on numeric codes and hoping the wording never changes.

### Precision, rounding and string math

`load_markets()` reads BYDFi's contract metadata — tick size, step size, minimum and maximum quantity for both limit and market orders — and exposes it through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class.

```python
amount = exchange.amount_to_precision('BTC/USDT:USDT', 0.0012345678)
```

On a leveraged venue this is not cosmetic: a rejected order because a quantity drifted in the last decimal place is a position you did not open or did not close.

### Eight languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go, Java and Rust, with identical method names and return structures. Since BYDFi publishes nothing first-party, every language starts from zero without it.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.bydfi()
ticker = exchange.fetch_ticker('BTC/USDT:USDT')
```

#### **C#**

```csharp
var exchange = new ccxt.bydfi();
var ticker = await exchange.FetchTicker("BTC/USDT:USDT");
```

#### **Go**

```go
exchange := ccxt.NewBydfi(nil)
ticker, err := exchange.FetchTicker("BTC/USDT:USDT")
```

<!-- tabs:end -->

### Nothing is hidden — the implicit API

Alongside the 60 unified capabilities, **all 45 BYDFi endpoints are generated as callable implicit methods**, with signing, rate limiting and error mapping applied — including the affiliate and agent endpoints that have no unified equivalent:

```python
# any raw BYDFi endpoint, camelCased from its path
response = exchange.private_get_v1_agent_affiliate_commission()
```

Browse them on the [bydfi implicit API page](/docs/exchanges/bydfi/implicit-api).

## What going direct to the BYDFi API does better

An honest list, because these are real:

- **A far smaller dependency.** One `requests` call is three lines. For a price display or a one-off backfill, all of CCXT is more than you need.
- **Field-for-field fidelity with the docs.** `positionSide`, `workingType`, `activatePrice`, `wallet` — reading BYDFi's reference while debugging is one hop shorter when there is no translation layer. CCXT's unified names are a deliberate abstraction.
- **Cancelling a single order.** CCXT reports `has['cancelOrder'] == False` for `bydfi`; what is implemented is `cancel_all_orders(symbol)`, matching BYDFi's complete-cancellation endpoint. If you need finer-grained cancellation than that, you reach for the raw endpoint either way.
- **New endpoints the day they ship.** BYDFi's documentation changes when the API does. A *unified* CCXT method for a brand-new feature can lag, even though the implicit API reaches the endpoint immediately.
- **Spot markets.** CCXT's `bydfi` models perpetual futures; `features.spot` is undefined and the unified market list is contracts only. Deposits, withdrawals and transfers are unified, but there are no unified spot trading pairs.

If BYDFi is your only venue and your integration is a handful of futures endpoints, writing it directly is a defensible choice.

## Migrating from a direct BYDFi integration to CCXT

| What you are doing | Raw BYDFi API | CCXT |
| --- | --- | --- |
| Symbols | `symbol: 'BTC-USDT'` | `'BTC/USDT:USDT'` |
| Client | your own signed `requests` wrapper | `ccxt.bydfi({'apiKey': ..., 'secret': ...})` |
| Contract list | `GET /v1/fapi/market/exchange_info` | `load_markets()` |
| Ticker | `GET /v1/fapi/market/ticker/24hr` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET /v1/fapi/market/depth` | `fetch_order_book()` |
| Trades | `GET /v1/fapi/market/trades` | `fetch_trades()` |
| Candles | `GET /v1/fapi/market/klines` | `fetch_ohlcv()` |
| Funding rate | `GET /v1/fapi/market/funding_rate` | `fetch_funding_rate()` / `fetch_funding_rate_history()` |
| New order | `POST /v1/fapi/trade/place_order` | `create_order()` |
| Batch orders | `POST /v1/fapi/trade/batch_place_order` | `create_orders()` |
| Amend order | `POST /v1/fapi/trade/edit_order` | `edit_order()` / `edit_order_with_client_order_id()` |
| Cancel | `POST /v1/fapi/trade/cancel_all_order` | `cancel_all_orders()` |
| Open orders | `GET /v1/fapi/trade/open_order` | `fetch_open_orders()` |
| Order history | `GET /v1/fapi/trade/history_order` | `fetch_canceled_and_closed_orders()` |
| Balance | `GET /v1/fapi/account/balance` | `fetch_balance()` |
| Positions | `GET /v1/fapi/trade/positions` | `fetch_positions()` / `fetch_positions_for_symbol()` |
| Leverage, margin mode, position mode | `POST /v1/fapi/trade/leverage`, `/user_data/margin_type`, `/user_data/position_side/dual` | `set_leverage()`, `set_margin_mode()`, `set_position_mode()` and their `fetch_*` counterparts |
| Transfers | `POST /v1/account/transfer` | `transfer()` / `fetch_transfers()` |
| Deposits, withdrawals | `GET /v1/spot/deposit_records`, `/withdraw_records` | `fetch_deposits()` / `fetch_withdrawals()` |
| Streams | your own socket client and book merge | `watch_*` on `ccxt.pro.bydfi` |
| Anything not listed | native call | the same endpoint as an [implicit method](/docs/exchanges/bydfi/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [bydfi unified API reference](/docs/exchanges/bydfi).

## FAQ

**Is there an official BYDFi SDK?**
None was published as of September 2026. There is no `bydfi` package on npm or PyPI, and BYDFi's only GitHub repository, `bydfi-official/api-docs`, contains documentation rather than client code. CCXT is the maintained option in eight languages.

**Does CCXT support BYDFi WebSockets?**
Yes. `bydfi` has 10 `watch*` methods, including `watch_order_book`, `watch_ohlcv`, `watch_orders`, `watch_positions` and `watch_balance`, plus the `*ForSymbols` multi-symbol variants. Use `ccxt.pro.bydfi`.

**Does CCXT support BYDFi spot trading?**
CCXT's `bydfi` models the perpetual-futures API — the unified markets are linear swaps like `'BTC/USDT:USDT'`, and there is no unified spot market list. Account-side spot endpoints are still covered: `fetch_deposits`, `fetch_withdrawals`, `transfer` and `fetch_transfers` all work.

**How do I cancel one BYDFi order in CCXT?**
`has['cancelOrder']` is `false` for this venue; CCXT implements `cancel_all_orders(symbol)`, which maps to BYDFi's complete-cancellation endpoint. For finer control, call the raw endpoint as an implicit method.

**Does BYDFi have a testnet I can use with CCXT?**
No sandbox environment is published, so `set_sandbox_mode(True)` has nothing to point at for `bydfi`. Test against CCXT's offline static fixtures and small live orders.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bydfi unified API reference](/docs/exchanges/bydfi)
- [bydfi implicit API](/docs/exchanges/bydfi/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
