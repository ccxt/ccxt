<!-- title: CCXT vs the EXMO API and exmo_api_lib -->
<!-- description: CCXT and EXMO's official example library compared on unified structures, streaming, rate limits, precision and errors, with the same tasks written both ways. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: EXMO's official repository is a set of one-file examples in twelve languages, not a packaged SDK. CCXT gives EXMO 44 unified capabilities, 7 streaming methods and all 51 endpoints from one dependency. -->
<!-- weight: 100 -->

# CCXT vs the EXMO API and exmo_api_lib

[EXMO](https://exmo.com) publishes an official repository, [`exmo-dev/exmo_api_lib`](https://github.com/exmo-dev/exmo_api_lib), and it is worth being precise about what it is. It holds two folders — `rest` and `ws` — with a single example file per language: REST in PHP, JavaScript, Node.js, C#, C++11, Python, Objective-C, Swift, Java, Ruby, Go and R; WebSocket in .NET, Go, Java, JavaScript, Python 2 and Python 3. It is MIT-licensed and has 39 stars.

It is not a package. There is no `pip install`, no versioning, no unified return shapes — the Python file is one class with one method, `api_query(method, params)`, that signs a form body and posts it. Everything above that is yours to write.

So the comparison is between **copying a reference implementation into your codebase** and **installing [CCXT](/docs/manual)**, which speaks EXMO behind the same API it uses for 103 other venues.

## TL;DR

- **Copy `exmo_api_lib`** if you want the smallest possible thing, in a language CCXT does not cover (Objective-C, Swift, Ruby, R, C++), and you are happy writing the parsing, pacing and error handling on top.
- **Pick CCXT** if you want unified tickers, order books, orders and balances, plus seven streaming methods and a rate limiter, without maintaining any of it.
- **You lose nothing by choosing CCXT.** All 51 EXMO endpoints are generated as [implicit methods](/docs/exchanges/exmo/implicit-api), signed and rate-limited, so anything the unified layer does not model is still one call away.

## At a glance

| | **CCXT** | **exmo_api_lib** |
| --- | --- | --- |
| Venues covered | 104 (EXMO is one of them) | EXMO only |
| Form | installable package | example source files you copy into your project |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | REST examples in 12 languages, WebSocket examples in 6 |
| Unified market data + trading API | yes — 44 unified capabilities, 22 `fetch*` methods | no — one generic `api_query(method, params)` |
| Return shapes | unified structures across every venue | EXMO's raw JSON |
| Spot and margin | both, from one instance | both, as endpoint names you pass in |
| WebSockets | yes — 7 `watch*` methods with the same shapes as `fetch*` | yes — a subscribe-and-print example per language |
| Raw endpoint access | yes — 51 endpoints as implicit methods | yes, it is the whole idea |
| Built-in rate limiter | yes, on by default (`rateLimit` 100 ms — 10 requests/second) | none |
| Unified error types | yes — 41 typed exceptions in one hierarchy | EXMO's `error` string |
| Precision helpers | `amount_to_precision`, `price_to_precision`, `Precise` string math | none |
| Testnet / sandbox | not available for this venue | not available |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | 39 GitHub stars; the `exmo-api` npm package sits at version 0.1.0 (published 2016) with 46 installs/month |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `exmo-dev/exmo_api_lib` repository and its Python REST and WebSocket examples, the `exmo-api` npm registry metadata, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.exmo()
ticker = exchange.fetch_ticker('BTC/USDC')
print(ticker['last'], ticker['baseVolume'])
```

#### **exmo_api_lib**

```python
import http.client
import json

conn = http.client.HTTPSConnection('api.exmo.com')
conn.request('POST', '/v1.1/ticker')
data = json.loads(conn.getresponse().read().decode('utf-8'))
print(data['BTC_USDC']['last_trade'], data['BTC_USDC']['vol'])
```

<!-- tabs:end -->

EXMO's ticker endpoint returns every pair at once, keyed by `BTC_USDC`, with fields named `last_trade`, `buy_price`, `sell_price`, `vol` and `vol_curr`, and timestamps in seconds. CCXT maps that onto a [unified ticker structure](/docs/manual#ticker-structure) — `last`, `bid`, `ask`, `baseVolume`, `quoteVolume`, `timestamp` in milliseconds — the same keys and units as on Binance or Kraken. `fetch_tickers()` returns the whole set in that shape, and `fetch_order_books()` does the same for depth.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.exmo({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDC', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
exchange.cancel_order(order['id'], 'BTC/USDC')
```

#### **exmo_api_lib**

```python
import hashlib
import hmac
import http.client
import json
import time
import urllib.parse

API_KEY, API_SECRET = '...', b'...'

def api_query(method, params={}):
    params['nonce'] = int(round(time.time() * 1000))
    body = urllib.parse.urlencode(params)
    sign = hmac.new(API_SECRET, body.encode('utf-8'), hashlib.sha512).hexdigest()
    conn = http.client.HTTPSConnection('api.exmo.com')
    conn.request('POST', '/v1.1/' + method, body, {
        'Content-type': 'application/x-www-form-urlencoded',
        'Key': API_KEY,
        'Sign': sign,
    })
    return json.loads(conn.getresponse().read().decode('utf-8'))

order = api_query('order_create', {
    'pair': 'BTC_USDC', 'quantity': 0.001, 'price': 60000, 'type': 'buy'})
api_query('order_cancel', {'order_id': order['order_id']})
```

<!-- tabs:end -->

That second block is roughly the reference implementation, rewritten as a function. It works. What it does not do is tell you whether the order was accepted, in a shape anything else understands — EXMO answers with `{"result": true, "error": "", "order_id": ...}` and you interpret it. CCXT returns a [unified order structure](/docs/manual#order-structure) with `id`, `status`, `filled`, `remaining` and `average`, and raises a typed exception when `result` is false.

Note the nonce, too: EXMO's private API is nonce-ordered, and a nonce that goes backwards — two processes sharing a key, a clock adjustment — is rejected. CCXT manages the nonce for you and maps the rejection to `InvalidNonce`.

### Stream trades

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.exmo()
    while True:
        trades = await exchange.watch_trades('BTC/USDC')
        for t in trades:
            print(t['symbol'], t['side'], t['amount'], t['price'])

asyncio.run(main())
```

#### **exmo_api_lib**

```python
import asyncio
import websockets

async def ws_loop():
    async with websockets.connect('wss://ws-api.exmo.com:443/v1/public') as ws:
        await ws.send('{"id":1,"method":"subscribe",'
                      '"topics":["spot/trades:BTC_USDC","spot/ticker:LTC_USDC"]}')
        while True:
            print('read:', await ws.recv())

asyncio.get_event_loop().run_until_complete(ws_loop())
```

<!-- tabs:end -->

The example connects, subscribes and prints. Reconnecting, resubscribing, keeping the book merged, and logging in for private topics (`spot/orders`, `spot/user_trades` — an HMAC-SHA512 of `api_key + nonce`, base64-encoded, sent as a `login` command) are all left as an exercise.

CCXT covers seven streams for EXMO — `watchTicker`, `watchTickers`, `watchTrades`, `watchOrderBook`, `watchOrders`, `watchMyTrades` and `watchBalance` — and authenticates the private ones itself. `watch_trades` returns the same structure as `fetch_trades`, so the downstream code does not know which produced it.

## Where the differences actually bite

### Spot and margin from one instance

EXMO runs margin alongside spot, and CCXT loads both into one market list. Alongside ordinary spot trading, the venue's unified capabilities include `addMargin`, `reduceMargin`, `createStopOrder`, `createStopLimitOrder`, `createStopMarketOrder`, `createMarketOrderWithCost`, `createMarketBuyOrderWithCost`, `editOrder`, `fetchOrderTrades`, `fetchCanceledOrders`, `fetchTradingFees`, `fetchTransactionFees`, `fetchDepositWithdrawFees`, `fetchDeposit`, `fetchWithdrawal` and `fetchDepositsWithdrawals` — 44 in total, 22 of them `fetch*` methods.

### Precision and string math

EXMO publishes per-pair price and quantity limits, and rejects anything outside them. CCXT loads that with the markets and gives you rounding helpers backed by the `Precise` string-arithmetic class, so quantities never drift through float representation:

```python
amount = exchange.amount_to_precision('BTC/USDC', 0.0012345678)
price = exchange.price_to_precision('BTC/USDC', 61234.56789)
```

### Rate limits you do not have to model

CCXT's EXMO definition sets `rateLimit` to 100 ms — ten requests per second — with per-endpoint weights, and the throttler is **on by default** (`enableRateLimit = true`). You call methods in a loop; the library paces them. The reference examples send whatever you send.

### One error hierarchy

EXMO reports failures as `{"result": false, "error": "Error 50052: ..."}` on an HTTP 200. CCXT checks that field and maps the codes onto its [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `InvalidNonce`, `RateLimitExceeded` and 35 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once, and it keeps working on the next venue.

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures. `exmo_api_lib` gives you a separate example per language, each with its own shape.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.exmo ();
const ticker = await exchange.fetchTicker ('BTC/USDC');
```

#### **Python**

```python
import ccxt
exchange = ccxt.exmo()
ticker = exchange.fetch_ticker('BTC/USDC')
```

#### **Go**

```go
exchange := ccxt.NewExmo(nil)
ticker, err := exchange.FetchTicker("BTC/USDC")
```

<!-- tabs:end -->

### Nothing is hidden — the implicit API

Alongside the unified methods, **all 51 EXMO endpoints are generated as callable implicit methods**, with the `Key`/`Sign` headers, the nonce, rate limiting and error mapping applied:

```python
response = exchange.public_get_pair_settings()
```

Browse them on the [EXMO implicit API page](/docs/exchanges/exmo/implicit-api).

## What exmo_api_lib does better

Real advantages, and they are about reach and size rather than features:

- **Twelve languages, including five CCXT does not ship.** Objective-C, Swift, Ruby, R and C++11 have REST examples in the repository. If your codebase is one of those, `exmo_api_lib` is the starting point and CCXT is not an option at all.
- **One-to-one with EXMO's API reference.** `api_query('order_create', {...})` is literally the documented method name and parameters. Debugging against EXMO's docs is one hop instead of two.
- **Nothing to install and nothing to track.** The Python REST example is under fifty lines with no third-party dependency. For a script that reads one endpoint, that is smaller than all of CCXT and never needs a version bump.
- **Every endpoint is usable the day it ships.** Because the interface is "pass the method name", a brand-new EXMO endpoint works immediately — the same property CCXT gets from its implicit API, but with no library in between.

If you are writing in Swift, Ruby or R, or you want fifty dependency-free lines, the official examples are the right starting point.

## Migrating from exmo_api_lib to CCXT

| What you are doing | exmo_api_lib | CCXT |
| --- | --- | --- |
| Pairs | `BTC_USDC` | `'BTC/USDC'` |
| Pair settings | `api_query('pair_settings')` | `load_markets()` |
| Ticker | `api_query('ticker')` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `api_query('order_book', {...})` | `fetch_order_book()` / `fetch_order_books()` |
| Trades | `api_query('trades', {...})` | `fetch_trades()` |
| Candles | the candles history endpoint | `fetch_ohlcv()` |
| New order | `api_query('order_create', {...})` | `create_order()` |
| Cancel | `api_query('order_cancel', {...})` | `cancel_order()` |
| Open orders | `api_query('user_open_orders')` | `fetch_open_orders()` |
| My trades | `api_query('user_trades', {...})` | `fetch_my_trades()` |
| Balance | `api_query('user_info')` | `fetch_balance()` |
| Deposits / withdrawals | the wallet history endpoint | `fetch_deposits()` / `fetch_withdrawals()` |
| Streams | `subscribe` topics over the raw socket | `watch_*` on `ccxt.pro.exmo` |
| Anything not listed | the method name | the same endpoint as an [implicit method](/docs/exchanges/exmo/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [exmo unified API reference](/docs/exchanges/exmo).

## FAQ

**Does EXMO have an official SDK?**
It has an official *example* repository, `exmo-dev/exmo_api_lib`, with one REST file per language in twelve languages and one WebSocket file in six. It is MIT-licensed, but it is source you copy rather than a package you install — there is no versioned distribution on PyPI, and the `exmo-api` npm package is at version 0.1.0, published in 2016.

**Does CCXT support EXMO WebSockets?**
Yes — seven methods: `watchTicker`, `watchTickers`, `watchTrades`, `watchOrderBook`, `watchOrders`, `watchMyTrades` and `watchBalance`. The private ones log in over the socket for you.

**Does CCXT support EXMO margin trading?**
Yes. Margin markets load alongside spot in the same instance, and `addMargin` and `reduceMargin` are unified capabilities for the venue.

**Does EXMO have a sandbox CCXT can use?**
No. `setSandboxMode` is not available for this venue — no test URLs are declared. Test with small live orders, or against static fixtures.

**Can I still call EXMO-specific endpoints from CCXT?**
Yes — all 51 of them, as [implicit methods](/docs/exchanges/exmo/implicit-api), with signing, the nonce and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed, WebSocket support included, no paid tier.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [exmo unified API reference](/docs/exchanges/exmo)
- [exmo implicit API](/docs/exchanges/exmo/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [More comparisons](/docs/comparisons)
