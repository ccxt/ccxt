<!-- title: CCXT vs the Gate API and gateapi-python -->
<!-- description: CCXT compared with Gate's OpenAPI-generated SDKs on package count, REST versus WebSocket split, language coverage, rate limits and unified structures. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Gate's official clients are generated from its OpenAPI spec, so coverage is exhaustive but machine-shaped, and WebSockets live in a second package. CCXT is a curated unified API in seven languages with REST and streaming in one install. -->
<!-- weight: 100 -->

# CCXT vs the Gate API and gateapi-python

Gate publishes official API clients for Python, Node/TypeScript, Go, Java, PHP and C#, all generated from its OpenAPI specification by [OpenAPI Generator](https://openapi-generator.tech). The Python one is [`gate-api`](https://github.com/gate/gateapi-python); WebSockets are a separate library, [`gatews`](https://github.com/gate/gatews), which the repository describes as "intended to work along with `gateapi-*` series".

[CCXT](/docs/manual) is the alternative: a hand-curated unified API that speaks Gate natively and covers 103 other venues with the same method names, REST and streaming in one package.

The choice comes down to one question: **do you want a client shaped like Gate's API, or a client shaped like every exchange's API?**

## TL;DR

- **Pick the official Gate SDKs** if Gate is your only venue and you want a generated client whose classes, fields and version numbers track Gate's own API surface exactly.
- **Pick CCXT** if you want one dependency covering Gate spot, margin, perpetual futures, delivery futures and options — plus the next hundred exchanges — with WebSockets in the same install.
- **Generated is not the same as complete-for-you.** A generated SDK gives you every endpoint; it does not give you a merged order book, a rate limiter, tick-size rounding or one error type across venues. Those are the parts you would write yourself.

## At a glance

| | **CCXT** | **Official Gate SDKs** |
| --- | --- | --- |
| Exchanges covered | 104 (Gate is one of them) | Gate only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python, Node/TypeScript, Go, Java, PHP, C# — separate generated codebases |
| Packages to install | **1** (`ccxt`) — REST and WebSocket | **2** in Python: `gate-api` for REST, `gate-ws` for streaming |
| Gate products in one client | spot, margin, perpetual futures, delivery futures, options | one generated API class per product line (`SpotApi`, `FuturesApi`, `OptionsApi`, `UnifiedApi`, `AccountApi`, …) |
| Unified market data + trading API | yes — 115 unified capabilities, 51 `fetch*` methods | no — Gate's generated request and response models |
| WebSockets | yes — 16 `watch*`/`unWatch*` methods, same shapes as `fetch*` | yes, in `gate-ws`: `Connection` plus per-channel classes and callbacks |
| Raw endpoint access | yes — 339 Gate endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 50 ms) | manual |
| Unified error types | yes — 41 typed exceptions in one hierarchy | `GateApiException` carrying Gate's `label` and `message` |
| Testnet / sandbox | `exchange.set_sandbox_mode(True)` — swaps in `api-testnet.gateapi.io` | set `host` on `Configuration` yourself |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `gate-api` 64k PyPI installs/month; the repository moved to `gate/gateapi-python` (26 stars), leaving `gateio/gateapi-python` archived at 344 |
| Licence | MIT | Apache-2.0 (per the `gate-api` package metadata) |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `gate/gateapi-python` and `gate/gatews` repositories and their READMEs, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.gate()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **gate-api**

```python
import gate_api
from gate_api.exceptions import ApiException, GateApiException

api_client = gate_api.ApiClient()
spot_api = gate_api.SpotApi(api_client)

try:
    tickers = spot_api.list_tickers(currency_pair='BTC_USDT')
    print(tickers[0].last)
except GateApiException as ex:
    print("Gate api exception, label: %s, message: %s" % (ex.label, ex.message))
```

<!-- tabs:end -->

`list_tickers` returns Gate's own model with Gate's field names and string numbers. CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — the same keys, types and units you get from Binance, Kraken or Hyperliquid — so the code that consumes it does not care which venue produced it.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.gate({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
exchange.cancel_order(order['id'], 'BTC/USDT')
```

#### **gate-api**

```python
import gate_api
from gate_api import Order

configuration = gate_api.Configuration(
    host="https://api.gateio.ws/api/v4",
    key="YOUR_API_KEY",
    secret="YOUR_API_SECRET",
)
spot_api = gate_api.SpotApi(gate_api.ApiClient(configuration))

order = Order(amount='0.001', price='60000', side='buy', currency_pair='BTC_USDT')
created = spot_api.create_order(order)
```

<!-- tabs:end -->

To place that order on Gate's perpetual futures with the official SDK you move to `FuturesApi`, a different order model and a settle-currency argument. In CCXT you change the symbol:

```python
order = exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 60000)   # USDT-settled perpetual
```

### Stream trades

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.gate()
    while True:
        trades = await exchange.watch_trades('BTC/USDT')
        for t in trades:
            print(t['symbol'], t['side'], t['amount'], t['price'])

asyncio.run(main())
```

#### **gate-ws**

```python
import asyncio
from gate_ws import Configuration, Connection
from gate_ws.spot import SpotPublicTradeChannel

def print_message(conn, response):
    if response.error:
        conn.close()
        return
    print(response.result)

async def main():
    conn = Connection(Configuration())
    channel = SpotPublicTradeChannel(conn, print_message)
    channel.subscribe(["BTC_USDT"])
    await conn.run()

asyncio.run(main())
```

<!-- tabs:end -->

Two things are different here, and only one of them is style. The style difference is push versus pull: `gate-ws` gives you a callback and a connection to run, CCXT gives you a value to `await`. The other difference is the install — streaming Gate data with the official libraries means a second package with its own release cadence, while `watch_trades` is in the same `ccxt` you already imported.

## Where the differences actually bite

### Generated breadth, curated depth

A generated SDK is a faithful projection of an OpenAPI document: every endpoint, every field, no interpretation. That is genuinely useful, and it is also exactly where the work stops. It does not merge order-book diffs into a live book, model per-endpoint rate-limit weights, round an amount to Gate's tick size, or turn Gate's error labels into types you can catch across venues.

CCXT's Gate implementation is hand-written on top of the same endpoints and does those things. That is the trade: less literal about Gate's payloads, more finished as a client.

### Five product lines, one client

`ccxt.gate` declares `spot`, `margin`, `swap`, `future` and `option` all true. The unified symbol chooses the venue-side product:

```python
exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)          # spot
exchange.create_order('BTC/USDT:USDT', 'limit', 'buy', 1, 60000)         # USDT perpetual
exchange.create_order('BTC/USD:BTC', 'limit', 'buy', 1, 60000)           # inverse contract
```

With the official SDK each of those is a different generated API class with its own models and its own settle-currency plumbing.

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.gate ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **Python**

```python
import ccxt
exchange = ccxt.gate()
ticker = exchange.fetch_ticker('BTC/USDT')
```

<!-- tabs:end -->

Gate also publishes clients in six languages, but they are six generated codebases with six idioms — not one API expressed seven ways. A strategy prototyped in Python ports to Go or C# without redesigning the data model.

### Rate limits you do not have to model

Gate meters per endpoint. CCXT encodes those costs in the exchange definition and ships a token-bucket throttler that is **on by default** (`enableRateLimit = true`, base `rateLimit` 50 ms). You call methods in a loop; the library paces them. With a generated client, backing off correctly is application code you write and maintain.

### Precision, rounding and string math

Gate rejects orders that violate its tick size, amount increment or minimum notional. CCXT loads the market metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities never drift through float rounding.

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

### One error hierarchy

`GateApiException` tells you Gate's `label` and `message`, which is precise and Gate-specific. CCXT maps those labels onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError` and 35 more under one `BaseError`. You write `except ccxt.InsufficientFunds` once and the handler still works when the next venue calls the same condition something else.

### Testnet without a second code path

```python
exchange = ccxt.gate({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)   # swaps in api-testnet.gateapi.io
```

One flag swaps every REST and WebSocket URL, instead of threading a different `host` through each `Configuration` and a different endpoint through the WebSocket library.

### Nothing is hidden — the implicit API

Alongside the 115 unified capabilities CCXT implements for Gate, **all 339 endpoints in Gate's API are generated as callable implicit methods**:

```python
response = exchange.private_spot_get_accounts()
```

Signing, timestamping, rate-limit accounting and error mapping still apply, so the unified API covers what every venue shares and the implicit API covers the Gate-specific remainder. Browse them on the [gate implicit API page](/docs/exchanges/gate/implicit-api).

## What the official Gate SDKs do better

Real advantages:

- **Exhaustive, machine-checked coverage.** Because the clients are regenerated from Gate's OpenAPI spec, every endpoint and every field is present and typed the moment Gate publishes it, in all six languages at once, with a generated reference page per API class.
- **Version numbers that tell you which API you are on.** From 4.15.2 onwards the package's MINOR and PATCH match the REST API version, with MAJOR bumped for breaking changes. Pinning `gate-api` pins a known Gate API version — CCXT versions track CCXT, not Gate.
- **Gate-native error identity.** `GateApiException.label` is Gate's own error label, with no mapping in between. If you are writing venue-specific recovery logic, that is the shortest path.
- **Very wide Python support.** The README states support for Python 2.7 and 3.4 or later, which matters if you are stuck on a legacy runtime.
- **Smaller dependency for one product line.** If all you do is read Gate spot tickers, `gate-api` alone is a smaller install than all of CCXT.

If Gate is your only venue and you value a literal, generated projection of its API over portability, the official SDKs are a defensible choice.

## If you want CCXT but only this one venue

CCXT publishes a single-exchange Python distribution built from the same source: [`ccxt/gate-python`](https://github.com/ccxt/gate-python).

```bash
pip install gate-io-api
```

It exposes `GateSync`, `GateAsync` and `GateWs` — unified methods, WebSockets and the implicit endpoints, without the other 103 exchanges — from the same codebase, so moving to full `ccxt` later is an import change.

## Migrating from gate-api to CCXT

| What you are doing | gate-api / gate-ws | CCXT |
| --- | --- | --- |
| Symbols | `'BTC_USDT'` | `'BTC/USDT'` spot, `'BTC/USDT:USDT'` perpetual |
| Product selection | `SpotApi` / `FuturesApi` / `OptionsApi` | the symbol, or `options.defaultType` |
| Credentials | `gate_api.Configuration(key=…, secret=…)` | `ccxt.gate({'apiKey': …, 'secret': …})` |
| Pairs list | `list_currency_pairs()` | `load_markets()` |
| Ticker | `list_tickers()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `list_order_book()` | `fetch_order_book()` |
| Candles | `list_candlesticks()` | `fetch_ohlcv()` |
| New order | `create_order(Order(...))` | `create_order()` |
| Balance | `list_spot_accounts()` | `fetch_balance()` |
| Streams | `gate_ws` channel classes + callbacks | `watch_*` on `ccxt.pro.gate` |
| Anything not listed | native method | the same endpoint as an [implicit method](/docs/exchanges/gate/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [gate unified API reference](/docs/exchanges/gate).

## FAQ

**Where did gateio/gateapi-python go?**
Gate moved its GitHub organisation: the SDK now lives at `gate/gateapi-python`, and the old `gateio/gateapi-python` repository is archived. The PyPI package name is unchanged — `pip install gate-api`.

**Do I need a second package for Gate WebSockets?**
With the official libraries, yes — REST is `gate-api` and streaming is `gate-ws`, a separate repository and package. With CCXT, `watch*` methods are in the same `ccxt` package as `fetch*`, under the same MIT licence.

**Does CCXT support Gate futures, options and margin?**
Yes — spot, margin, USDT-settled perpetuals, inverse contracts, delivery futures and options, from one `ccxt.gate` instance selected by the unified symbol and `options.defaultType`.

**Can I still call Gate-specific endpoints through CCXT?**
Yes — all 339 of them, as [implicit methods](/docs/exchanges/gate/implicit-api), with signing and rate limiting applied. Choosing CCXT does not lock you out of anything Gate publishes.

**Does CCXT support the Gate testnet?**
Yes. `exchange.set_sandbox_mode(True)` swaps the REST and WebSocket URLs to Gate's testnet host.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [gate unified API reference](/docs/exchanges/gate)
- [gate implicit API](/docs/exchanges/gate/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [More comparisons](/docs/comparisons)
