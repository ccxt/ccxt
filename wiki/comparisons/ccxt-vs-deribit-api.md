<!-- title: CCXT vs the raw Deribit API -->
<!-- description: Deribit publishes no client library, so this compares CCXT against hand-written JSON-RPC: auth tokens, credit rate limits, options, order books and errors. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Deribit's GitHub organisation has no public repositories and its docs link no SDK, so integrating means hand-writing JSON-RPC. CCXT covers 64 unified capabilities, 12 streaming methods and all 122 endpoints, including options. -->
<!-- weight: 100 -->

# CCXT vs the raw Deribit API

[Deribit](https://www.deribit.com) is an options-first derivatives venue, and its API is unusually well specified: one JSON-RPC 2.0 surface exposed three ways — over WebSocket ("recommended for most use cases"), over HTTP, and over FIX — covering futures, perpetuals, spot, options and combos.

What it does not have is a client library. The `deribit` GitHub organisation lists **no public repositories**, and the current documentation links no SDK in any language. The one package that carries Deribit's name on PyPI, `deribit_api`, has a most recent release — 1.1.1 — uploaded in **September 2017**, and the repository it points at is no longer public. So the real choice is not "CCXT or the vendor SDK". It is **CCXT or the JSON-RPC client you write yourself**.

## TL;DR

- **Write it yourself** if you need something CCXT does not model — the FIX interface, combo (multi-leg) instruments as first-class objects, or order entry over the same socket you read from.
- **Pick CCXT** if you want Deribit's options, futures, perpetuals and spot behind one typed API, with the `deri-hmac-sha256` signing, the credit-based rate limiter, order-book maintenance and reconnects already written — in eight languages.
- **Choosing CCXT does not hide the API.** All 122 Deribit endpoints are generated as [implicit methods](/docs/exchanges/deribit/implicit-api), signed and rate-limited, so anything the unified layer does not cover is still one call away.

## At a glance

| | **CCXT** | **Raw Deribit API** |
| --- | --- | --- |
| Venues covered | 104 (Deribit is one of them) | Deribit only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | whatever you write it in |
| Official client library | n/a | none published; `deribit_api` on PyPI last released 1.1.1 in September 2017 |
| Unified market data + trading API | yes — 64 unified capabilities, 33 `fetch*` methods | no — Deribit's own JSON-RPC method names and payloads |
| Products in one client | spot, futures, perpetuals, options | all of them, as `kind` values you handle yourself |
| Options-specific methods | `fetchOption`, `fetchOptionChain`, `fetchGreeks`, `fetchVolatilityHistory` | `public/get_instruments`, `public/get_book_summary_by_currency`, etc. |
| WebSockets | yes — 12 `watch*` methods, same shapes as `fetch*` | yes — `public/subscribe` over JSON-RPC |
| Raw endpoint access | yes — 122 endpoints as implicit methods | yes, it is all you have |
| Authentication | signed per request (`deri-hmac-sha256`); WS uses `grant_type=client_signature` | `public/auth` plus access-token and refresh-token lifecycle |
| Built-in rate limiter | yes, on by default (`rateLimit` 50 ms), per-endpoint weights | you model the credit pools |
| Unified error types | yes — 41 typed exceptions in one hierarchy | JSON-RPC error codes |
| Testnet | `exchange.set_sandbox_mode(True)` — swaps in `test.deribit.com` | change the host yourself |
| FIX interface | no | yes |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | n/a |
| Licence | MIT | n/a |
| Support | Discord, Telegram, GitHub issues — usually same-day | Deribit support and the API console |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, Deribit's published API documentation and rate-limit article, the `deribit` GitHub organisation page, the `deribit_api` PyPI metadata, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.deribit()
ticker = exchange.fetch_ticker('BTC/USD:BTC')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw JSON-RPC**

```python
import requests

response = requests.post('https://www.deribit.com/api/v2/public/ticker', json={
    'jsonrpc': '2.0',
    'id': 1,
    'method': 'public/ticker',
    'params': {'instrument_name': 'BTC-PERPETUAL'},
})
result = response.json()['result']
print(result['last_price'], result['stats']['volume'])
```

<!-- tabs:end -->

The instrument name is the first thing you inherit. Deribit speaks `BTC-PERPETUAL`, `BTC_USDC-PERPETUAL`, `BTC-26MAR27` and `BTC-26MAR27-100000-C`. CCXT maps those onto unified symbols — `'BTC/USD:BTC'` for the inverse perpetual, `'BTC/USDC:USDC'` for the USDC-margined one, `'BTC/USD:BTC-270326-100000-C'` for the option — and returns a [unified ticker structure](/docs/manual#ticker-structure) whose keys, types and units match every other exchange.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.deribit({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USD:BTC', 'limit', 'buy', 10, 60000)
print(order['id'], order['status'])
exchange.cancel_order(order['id'], 'BTC/USD:BTC')
```

#### **Raw JSON-RPC**

```python
import hashlib
import hmac
import time
import requests

client_id, client_secret = '...', '...'
timestamp = str(int(time.time() * 1000))
nonce = timestamp
uri = '/api/v2/private/buy?instrument_name=BTC-PERPETUAL&amount=10&price=60000&type=limit'
request_data = 'GET' + '\n' + uri + '\n' + '' + '\n'
string_to_sign = timestamp + '\n' + nonce + '\n' + request_data
signature = hmac.new(client_secret.encode(), string_to_sign.encode(), hashlib.sha256).hexdigest()

response = requests.get('https://www.deribit.com' + uri, headers={
    'Authorization': f'deri-hmac-sha256 id={client_id},ts={timestamp},sig={signature},nonce={nonce}',
})
print(response.json()['result']['order']['order_id'])
```

<!-- tabs:end -->

Deribit documents three grant types — `client_credentials`, `client_signature` and `refresh_token` — and the token path means minting an access token, tracking its `expires_in`, and refreshing before it lapses. CCXT uses the per-request signature scheme above, so there is no token to store, refresh or lose; the signed string, the newline placement, the 60-second timestamp window and the lowercase hex are all inside the library. What comes back is a [unified order structure](/docs/manual#order-structure) with `id`, `status`, `filled` and `average` in the same places as on Binance or Bybit.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.deribit()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USD:BTC')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Raw JSON-RPC**

```python
import asyncio
import json
import websockets

async def main():
    async with websockets.connect('wss://www.deribit.com/ws/api/v2') as ws:
        await ws.send(json.dumps({
            'jsonrpc': '2.0', 'id': 1, 'method': 'public/subscribe',
            'params': {'channels': ['book.BTC-PERPETUAL.100ms']},
        }))
        while True:
            message = json.loads(await ws.recv())
            print(message)

asyncio.run(main())
```

<!-- tabs:end -->

These two do not do the same thing. The second prints whatever Deribit sends — a snapshot, then a stream of `change` messages carrying `change_id` and `prev_change_id`. Turning that into a book you can read a top-of-book price off is the work:

| | CCXT | raw stream |
| --- | --- | --- |
| Apply the snapshot, then the deltas, in order | done for you | your code |
| Check `prev_change_id` against the last `change_id` and re-subscribe on a gap | done for you | your code |
| Reconnect, re-subscribe and re-seed after a drop | done for you | your code |
| Keep a depth-bounded book instead of a dictionary that grows | done for you | your code |
| Ping/pong keep-alive and stale-connection detection | done for you | your code |
| Authenticate first if you want the `raw` (uncoalesced) interval | done for you | your code |

CCXT's `watch_order_book` returns the same structure as `fetch_order_book`, so a polling loop becomes a streaming loop by changing one word. The twelve streaming methods are `watchTicker`, `watchTickers`, `watchBidsAsks`, `watchTrades`, `watchTradesForSymbols`, `watchOHLCV`, `watchOHLCVForSymbols`, `watchOrderBook`, `watchOrderBookForSymbols`, `watchOrders`, `watchMyTrades` and `watchBalance`; the private ones authenticate with `grant_type=client_signature` on your behalf.

## Where the differences actually bite

### Credit-based rate limits, modelled for you

Deribit does not meter in requests per second. It meters in **credits**, from a pool per sub-account, and the shape differs by request type:

- Non-matching-engine requests (market data, account queries) cost **500 credits** against a **50,000** maximum, refilled at **10,000 credits/second** — 20 requests per second sustained, roughly 100 in a burst.
- Matching-engine requests (placing and cancelling orders) are **tier-based on trailing 7-day volume**, from 30 requests/second at Tier 1 down to 5 at Tier 4, with bursts of 100 down to 20.
- Some methods have their own pools: `public/get_instruments` costs 10,000 credits against a 500,000 maximum (about 1 request/second), `public/subscribe` 3,000 against 30,000, `private/get_transaction_log` 10,000 against 80,000, and `private/move_positions` 100,000 against 600,000 plus a cap of 100 uses per 168 hours.

Run out and you get error 10028, `too_many_requests`, and your session is terminated. CCXT ships a token-bucket throttler that is **on by default** (`enableRateLimit = true`, base `rateLimit` 50 ms) with per-endpoint weights in the exchange definition. You call methods in a loop; the library paces them.

### Options are a first-class part of the unified API

This is what most people come to Deribit for, and it is where a generic HTTP wrapper stops being enough. CCXT models the option surface directly:

```python
exchange = ccxt.deribit()
chain = exchange.fetch_option_chain('BTC')                       # every listed BTC option
option = exchange.fetch_option('BTC/USD:BTC-270326-100000-C')    # one contract
greeks = exchange.fetch_greeks('BTC/USD:BTC-270326-100000-C')    # delta, gamma, vega, theta, rho
vol = exchange.fetch_volatility_history('BTC')                   # historical volatility
```

Unified option symbols carry the expiry, strike and type — `BASE/QUOTE:SETTLE-YYMMDD-STRIKE-C|P` — so the same parsing code works on Deribit, Delta Exchange and OKX options. Alongside those, `fetchOpenInterest`, `fetchFundingRate`, `fetchFundingRateHistory`, `fetchLiquidations` and `fetchMyLiquidations` cover the derivative side.

### Precision, tick size and string math

Deribit rejects orders that violate an instrument's tick size or minimum amount, and contract sizes differ across instruments. CCXT loads that metadata with the markets and gives you rounding helpers backed by the `Precise` string-arithmetic class, so sizes never drift through float rounding:

```python
amount = exchange.amount_to_precision('BTC/USD:BTC', 10.0000000001)
price = exchange.price_to_precision('BTC/USD:BTC', 60123.456789)
```

### One error hierarchy

Deribit returns JSON-RPC errors with numeric codes and short names — `not_enough_funds`, `price_too_high`, `order_not_found`, `too_many_requests`. CCXT maps them onto its [typed exception tree](/docs/manual#error-handling): `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError` and 36 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once and it keeps working on the next venue, instead of matching on integers that only mean something to Deribit.

### Testnet without a second code path

```python
exchange = ccxt.deribit({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)   # swaps in test.deribit.com for REST and WebSocket
```

One flag, both transports. No constant swapping and no forked configuration.

### Eight languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures. A hand-written Deribit client is written once per language, by you.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.deribit ();
const ticker = await exchange.fetchTicker ('BTC/USD:BTC');
```

#### **Go**

```go
exchange := ccxt.NewDeribit(nil)
ticker, err := exchange.FetchTicker("BTC/USD:BTC")
```

<!-- tabs:end -->

### Nothing is hidden — the implicit API

Alongside the 64 unified capabilities, **all 122 Deribit endpoints are generated as callable implicit methods**, camelCased from their JSON-RPC paths, with signing, rate-limit accounting and error mapping applied:

```python
response = exchange.public_get_get_instruments({'currency': 'BTC', 'kind': 'option'})
```

Browse them all on the [Deribit implicit API page](/docs/exchanges/deribit/implicit-api).

## What the raw Deribit API does better

Real advantages of writing it yourself, not padding:

- **FIX.** Deribit publishes a FIX interface alongside JSON-RPC. CCXT does not speak FIX at all. If your OMS is FIX-native, that is the integration and CCXT is not in the running.
- **Order entry over the same socket you read from.** Deribit's WebSocket carries the whole JSON-RPC surface, so `private/buy` and `private/cancel` can go down the connection you are already streaming on. CCXT's Deribit implementation streams over WebSocket but sends orders over REST — there are no `createOrderWs` / `cancelOrderWs` methods for this venue.
- **Combos as first-class instruments.** `future_combo` and `option_combo` let you execute a multi-leg strategy as one trade. CCXT recognises combo instruments when loading markets, but the unified order API is built around single-leg orders, so combo execution and the block-trade endpoints are better reached raw.
- **Market-maker plumbing.** Mass quoting, cancel-on-disconnect, `private/move_positions` and the per-method rate-limit introspection in `private/get_account_summary` are exposed directly by the API and are not part of a unified abstraction.
- **New endpoints on day one.** Whatever Deribit ships is callable the moment it exists. A *unified* CCXT wrapper for it may follow later — though the [implicit API](/docs/exchanges/deribit/implicit-api) closes most of that gap immediately.

If you are a market maker on Deribit alone, quoting options over FIX or over a single authenticated socket, hand-written is the honest recommendation.

## Migrating from raw Deribit calls to CCXT

| What you are doing | Deribit JSON-RPC | CCXT |
| --- | --- | --- |
| Instruments | `public/get_instruments` | `load_markets()` |
| Symbols | `BTC-PERPETUAL`, `BTC-26MAR27-100000-C` | `'BTC/USD:BTC'`, `'BTC/USD:BTC-270326-100000-C'` |
| Ticker | `public/ticker` | `fetch_ticker()` |
| Order book | `public/get_order_book` | `fetch_order_book()` |
| Candles | `public/get_tradingview_chart_data` | `fetch_ohlcv()` |
| New order | `private/buy` / `private/sell` | `create_order()` |
| Cancel | `private/cancel` | `cancel_order()` |
| Open orders | `private/get_open_orders_by_currency` | `fetch_open_orders()` |
| Balance | `private/get_account_summary` | `fetch_balance()` |
| Positions | `private/get_positions` | `fetch_positions()` |
| Option chain | `public/get_book_summary_by_currency` | `fetch_option_chain()` |
| Greeks | fields on the instrument payload | `fetch_greeks()` |
| Streams | `public/subscribe` channels | `watch_*` on `ccxt.pro.deribit` |
| Anything not listed | the JSON-RPC method | the same endpoint as an [implicit method](/docs/exchanges/deribit/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [deribit unified API reference](/docs/exchanges/deribit).

## FAQ

**Does Deribit have an official Python or JavaScript SDK?**
Not a maintained one. The `deribit` GitHub organisation shows no public repositories, and the current documentation links no client library. The `deribit_api` package on PyPI names Deribit as its author, but its most recent release, 1.1.1, was uploaded in September 2017 and predates the v2 API. Everything else on npm and PyPI is community-maintained.

**Does CCXT support Deribit options?**
Yes. Options, futures, perpetuals and spot come from the same `ccxt.deribit` instance. Option symbols carry expiry, strike and type, and `fetchOption`, `fetchOptionChain`, `fetchGreeks` and `fetchVolatilityHistory` are implemented for the venue.

**Can I place orders over the WebSocket with CCXT on Deribit?**
No. CCXT Pro streams Deribit data over WebSocket — 12 `watch*` methods, including private orders, fills and balance — but order entry goes over REST. If sending orders down the streaming socket matters to you, that is a reason to write against `private/buy` directly.

**How does CCXT handle Deribit's credit-based rate limits?**
It ships a throttler that is on by default, with per-endpoint weights encoded in the exchange definition and a base `rateLimit` of 50 ms. You call methods in a loop and the library paces them, rather than modelling the credit pools and the tier your 7-day volume puts you in.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.deribit` and call `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, WebSocket support included, no paid tier.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [deribit unified API reference](/docs/exchanges/deribit)
- [deribit implicit API](/docs/exchanges/deribit/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [More comparisons](/docs/comparisons)
