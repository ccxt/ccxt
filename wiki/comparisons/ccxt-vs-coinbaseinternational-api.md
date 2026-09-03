<!-- title: CCXT vs the Coinbase International Exchange API -->
<!-- description: Coinbase INTX has five sample SDKs with almost no users and no WebSocket support. Compare CCXT on languages, streaming, portfolios, perpetuals, sandbox and errors. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Coinbase International's five first-party SDKs are all labelled samples, are REST-only, and see 13 PyPI and 15 npm installs a month between them. CCXT covers the same API with 48 unified capabilities and 7 streaming methods. -->
<!-- weight: 36 -->

# CCXT vs the Coinbase International Exchange API

Coinbase International Exchange (INTX) is Coinbase's non-US perpetual-futures and spot venue. It is a separate product from Advanced Trade and from Coinbase Exchange — its own base URL, its own portfolio model, its own SDKs. [CCXT vs the Coinbase APIs](/docs/comparisons/ccxt-vs-coinbase-api) covers that fragmentation across the estate; **this page is about INTX specifically**, where `ccxt.coinbaseinternational` implements 48 unified capabilities, 7 `watch*` streaming methods and all 35 endpoints.

Coinbase publishes more first-party SDKs for INTX than for any of its other trading products — five, in Python, Go, Java, TypeScript and .NET. Every one of them describes itself as a sample, none of them documents WebSocket support, and between them they see fewer than thirty package installs a month. **So the question is not which library has better coverage. It is whether "sample SDK, REST only, in one language" is what your service needs.**

## TL;DR

- **Pick an INTX sample SDK** if you want Coinbase's own request and response types in Go, Java or .NET, you only need REST, and you are comfortable with a library its own README calls demonstration code.
- **Pick CCXT** if you need WebSockets — none of the five INTX SDKs provide them — or you are in PHP, or you want the same method names on Coinbase Exchange, Advanced Trade and 101 other venues.
- **The portfolio model is the fiddly part, and CCXT hides it.** Every private INTX endpoint is scoped to a portfolio. CCXT resolves your default portfolio once and threads it through, while still letting you name one per call.

## At a glance

| | **CCXT** | **Coinbase's own INTX SDKs** |
| --- | --- | --- |
| Exchanges covered | 104 (Coinbase International is one of them) | Coinbase INTX only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python, Go, Java, TypeScript, .NET — five separate codebases |
| Packages to install | **1** (`ccxt`) | one per language, plus one per other Coinbase product you touch |
| Positioning | production library | "a sample library that demonstrates the usage of the API … only available for demonstration purposes" |
| Unified market data + trading API | yes — 48 capabilities on `coinbaseinternational` | no — INTX's own shapes |
| Products | spot **and** perpetual futures from one client | spot and perpetuals, per SDK |
| WebSockets | yes — **7** `watch*` methods | **not documented in the SDK READMEs** |
| Portfolio scoping | resolved and cached; `params['portfolio']` to override | you pass a portfolio id on every call |
| Raw endpoint access | yes — 35 INTX endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 100 ms) | not a documented feature |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status + Coinbase error bodies |
| Sandbox | `set_sandbox_mode(True)` → `api-n5e1.coinbase.com` | change the base URL yourself |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** (one package, every venue) | `intx-sdk-java` 9 stars · `intx-sdk-py` 8 stars, **13 PyPI installs/month** · `intx-sdk-dotnet` 7 · `intx-sdk-go` 6 · `intx-sdk-ts` 3, **15 npm installs/month** |
| Licence | MIT | Apache-2.0 |
| Support | Discord, Telegram, GitHub — usually same-day | GitHub issues, Coinbase developer channels |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `coinbase-samples` GitHub organisation's repository listing and the `intx-sdk-py` README, Coinbase's INTX sandbox and authentication documentation, and install counts from npm and PyPI.</sub>

### What Coinbase publishes for INTX

| Repository | What it is | Language | Stars | Last updated |
| --- | --- | --- | --- | --- |
| `intx-sdk-java` | REST SDK | Java | 9 | March 2026 |
| `intx-sdk-py` | REST SDK (`pip install intx-sdk-py`) | Python | 8 | December 2025 |
| `intx-cli` | CLI for testing REST endpoints | Go | 8 | March 2024 |
| `intx-sdk-dotnet` | REST SDK | C# | 7 | August 2024 |
| `intx-sdk-go` | REST SDK | Go | 6 | July 2026 |
| `intx-scripts-py` | FIX and REST sample scripts | Python | 6 | March 2026 |
| `intx-sdk-ts` | REST SDK (`@coinbase-sample/intx-sdk-ts`) | TypeScript | 3 | February 2026 |

Seven repositories, all first-party, all labelled samples. That is more attention than Coinbase gives its Exchange API — and still no PHP client, no WebSocket client, and 13 PyPI plus 15 npm installs a month across the two packaged ones.

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.coinbaseinternational()
ticker = exchange.fetch_ticker('BTC/USDC:USDC')
print(ticker['last'], ticker['baseVolume'])
```

#### **intx-sdk-py**

```python
from intx_sdk import IntxServicesClient
from intx_sdk.services.portfolios import ListPortfoliosRequest

client = IntxServicesClient.from_env()
request = ListPortfoliosRequest()
response = client.portfolios.list_portfolios(request)
print(response)
```

<!-- tabs:end -->

The SDK's shape is one service object per endpoint family and one request class per call. It is consistent and readable, and it is INTX-shaped: the same intent against Coinbase Exchange is a different call in a different package.

`'BTC/USDC:USDC'` is CCXT's unified notation for a USDC-settled linear perpetual; spot is plain `'BTC/USDC'`. The returned [unified ticker structure](/docs/manual#ticker-structure) is the same on `coinbase`, `coinbaseexchange`, `coinbaseinternational` and every other venue.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.coinbaseinternational({
    'apiKey': '...', 'secret': '...', 'password': '...',   # the passphrase
})
order = exchange.create_order('BTC/USDC:USDC', 'limit', 'buy', 0.001, 90000)
print(order['id'], order['status'])
```

#### **intx-sdk-py**

```python
from intx_sdk import IntxServicesClient
from intx_sdk.credentials import Credentials

credentials = Credentials(
    access_key="...", passphrase="...", signing_key="...")
client = IntxServicesClient(credentials)
# then build the order request for the orders service, naming
# the portfolio id, the instrument, side, type, size and price
```

<!-- tabs:end -->

Both sides sign with HMAC-SHA256 over `timestamp + method + requestPath + body`, base64-encoded, sent as `CB-ACCESS-KEY`, `CB-ACCESS-SIGN`, `CB-ACCESS-TIMESTAMP` and `CB-ACCESS-PASSPHRASE` — and Coinbase requires the timestamp to be within 30 seconds of server time. CCXT implements that, so a clock-skew failure surfaces as a typed `AuthenticationError` rather than as an unexplained rejection.

The visible difference is the **portfolio**. Every private INTX endpoint is scoped to one, and the SDK expects you to supply the id. CCXT looks it up once and caches it:

```python
# CCXT resolves your default portfolio automatically; override per call when needed
positions = exchange.fetch_positions(params={'portfolio': 'your-portfolio-id'})
# or set it once
exchange.options['portfolio'] = 'your-portfolio-id'
```

If you have not set one and CCXT cannot resolve one, it raises `ArgumentsRequired` naming the parameter — not a 400 you have to decode.

### Stream an order book

This is the gap. `coinbaseinternational` has **7** `watch*` methods in CCXT — `watchOrderBook`, `watchOrderBookForSymbols`, `watchTicker`, `watchTickers`, `watchTrades`, `watchTradesForSymbols` and `watchOHLCV`. None of the five INTX SDKs documents WebSocket support.

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.coinbaseinternational()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDC:USDC')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Raw WebSocket feed**

```python
# connect and authenticate, subscribe to the level2 channel, then:
#   - align the snapshot with the delta stream
#   - track sequencing and detect gaps
#   - reconnect, resubscribe and re-seed after a drop
#   - keep the local book bounded instead of growing forever
```

<!-- tabs:end -->

`watch_order_book` returns the same structure as `fetch_order_book`, already merged and depth-limited, so swapping a polling loop for a stream leaves the downstream code untouched. CCXT handles connection pooling per URL, ping/pong keep-alive, automatic reconnect and resubscribe, and bounded caches — the parts that are tedious rather than hard, and quietly wrong when you get them slightly off.

One honest limit: CCXT's INTX streaming methods are market-data only. There are no `watchOrders`, `watchPositions` or `watchBalance` methods for this venue, so private state is polled through the REST methods.

## Where the differences actually bite

### Spot and perpetuals in one client

INTX lists both, and CCXT selects between them with the symbol:

```python
spot = exchange.fetch_ticker('ETH/USDC')             # instrument type SPOT
perp = exchange.fetch_ticker('ETH/USDC:USDC')        # instrument type PERP

positions = exchange.fetch_positions(['ETH/USDC:USDC'])
funding   = exchange.fetch_funding_rate_history('ETH/USDC:USDC')
history   = exchange.fetch_funding_history('ETH/USDC:USDC')
```

`fetch_position`, `fetch_positions`, `set_margin`, `fetch_transfers` and `transfer()` between portfolios all carry the names CCXT uses on Bybit, OKX and Binance futures.

### Sandbox without a second code path

INTX has a real sandbox, and CCXT knows its hostname:

```python
exchange = ccxt.coinbaseinternational({'apiKey': '...', 'secret': '...', 'password': '...'})
exchange.set_sandbox_mode(True)   # api-n5e1.coinbase.com
```

Coinbase's documentation describes it as a USDC-funded environment with transfers, deposits and withdrawals disabled, reachable after onboarding through your Coinbase account team. One flag swaps every REST and WebSocket URL — no forked configuration.

### One error hierarchy

CCXT maps INTX's error bodies onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. Since Advanced Trade, Exchange and International each have their own error convention, one handler covering all three is worth more here than on a single-product venue.

### Precision, rounding and string math

`load_markets()` reads INTX's instrument metadata — `base_increment`, `quote_increment`, `min_notional_value`, `position_limit_qty` and the initial-margin factor — and exposes it through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class, so quantities never drift through float rounding into a rejected order.

### Seven languages, one API

Coinbase's five INTX SDKs are five separate codebases with five release cadences, and none of them is PHP. CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures — `exchange.fetch_ticker('BTC/USDC:USDC')` in Python is `exchange.FetchTicker("BTC/USDC:USDC")` in C# and `exchange.FetchTicker("BTC/USDC:USDC")` in Go, against the same data model.

### Nothing is hidden — the implicit API

Alongside the 48 unified capabilities, **all 35 INTX endpoints are generated as callable implicit methods**, with signing, portfolio scoping, rate limiting and error mapping applied:

```python
# any raw INTX endpoint, camelCased from its path
response = exchange.v1_public_get_instruments()
```

Browse them on the [coinbaseinternational implicit API page](/docs/exchanges/coinbaseinternational/implicit-api).

### One client for three Coinbase products

`ccxt.coinbase()`, `ccxt.coinbaseexchange()` and `ccxt.coinbaseinternational()` differ only in the credentials they take — CDP JWT for the first, HMAC plus passphrase for the other two — and answer to the same unified method names. Five INTX SDKs plus separate Exchange and Advanced Trade SDKs do not compose like that. See [CCXT vs the Coinbase Exchange API](/docs/comparisons/ccxt-vs-coinbaseexchange-api) for the sibling venue.

## What Coinbase's own INTX SDKs do better

An honest list, because these are real:

- **Five first-party languages, including .NET and Java.** `intx-sdk-java`, `intx-sdk-dotnet` and `intx-sdk-go` are Coinbase-authored, with Coinbase-shaped typed request and response models. If you value literal fidelity to the INTX reference over portability, that is a genuine advantage.
- **FIX.** `intx-scripts-py` covers INTX's FIX order-entry, market-data and drop-copy sessions, which the sandbox also supports. CCXT does not speak FIX for any exchange, so for latency-sensitive institutional flow this is not a comparison CCXT enters.
- **`intx-cli` for poking endpoints.** A Go CLI built on the SDK that speaks Coinbase's exact vocabulary is a good debugging companion while you are learning the API.
- **New INTX features land there first.** Coinbase updates its own SDKs when the API changes. A *unified* CCXT method for a brand-new INTX capability may lag, even though the implicit API reaches the endpoint immediately.
- **Explicit portfolio handling.** CCXT's automatic portfolio resolution is a convenience; if you run many portfolios and want every call to state which one it targets, the SDK's requirement that you name it is arguably the safer default.

If you are an institutional desk on FIX, or a .NET or Java shop trading only INTX, Coinbase's own SDKs are the sensible starting point.

## Migrating from an INTX SDK to CCXT

| What you are doing | INTX SDK / API | CCXT |
| --- | --- | --- |
| Symbols | `instrument: 'BTC-PERP'` | `'BTC/USDC:USDC'` perpetual, `'BTC/USDC'` spot |
| Client | `IntxServicesClient(credentials)` | `ccxt.coinbaseinternational({'apiKey': ..., 'secret': ..., 'password': ...})` |
| Credentials | `access_key`, `passphrase`, `signing_key` | `apiKey`, `password`, `secret` |
| Portfolio | passed on every request | resolved and cached; `params['portfolio']` to override |
| Instruments | `GET /v1/instruments` | `load_markets()` |
| Ticker | `GET /v1/instruments/{id}/quote` | `fetch_ticker()` / `fetch_tickers()` |
| Candles | `GET /v1/instruments/{id}/candles` | `fetch_ohlcv()` |
| Funding | `GET /v1/instruments/{id}/funding` | `fetch_funding_rate_history()` / `fetch_funding_history()` |
| New order | `POST /v1/orders` | `create_order()` |
| Amend order | `PUT /v1/orders/{id}` | `edit_order()` |
| Cancel order | `DELETE /v1/orders/{id}` | `cancel_order()` |
| Cancel all | `DELETE /v1/orders` | `cancel_all_orders()` |
| Open orders | `GET /v1/orders` | `fetch_open_orders()` |
| Balances | `GET /v1/portfolios/{p}/balances` | `fetch_balance()` |
| Positions | `GET /v1/portfolios/{p}/positions` | `fetch_positions()` / `fetch_position()` |
| Fills | `GET /v1/portfolios/fills` | `fetch_my_trades()` |
| Transfers | `POST /v1/portfolios/transfer` | `transfer()` / `fetch_transfers()` |
| Streams | not in the SDKs — hand-written | `watch_*` on `ccxt.pro.coinbaseinternational` |
| Sandbox | swap the base URL | `set_sandbox_mode(True)` |
| Anything not listed | native call | the same endpoint as an [implicit method](/docs/exchanges/coinbaseinternational/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [coinbaseinternational unified API reference](/docs/exchanges/coinbaseinternational).

## FAQ

**What is Coinbase International Exchange in CCXT?**
It is the exchange id `coinbaseinternational`, covering Coinbase's non-US INTX venue — spot instruments and USDC-settled perpetual futures. It is a different product from `coinbase` (Advanced Trade plus the Coinbase App v2 endpoints) and `coinbaseexchange` (the institutional Exchange API), and all three answer to the same unified method names.

**Do the official Coinbase INTX SDKs support WebSockets?**
None of the five READMEs documents WebSocket support; they are REST clients. CCXT implements 7 `watch*` methods for `coinbaseinternational`, covering the order book, trades, tickers and candles. Private streams — orders, positions, balance — are not implemented for this venue, so poll those over REST.

**How does CCXT handle INTX portfolios?**
Every private INTX endpoint is portfolio-scoped. CCXT resolves your default portfolio the first time it needs one and caches it, so you do not pass it on every call. Override it per call with `params={'portfolio': '...'}`, or set `exchange.options['portfolio']` once. If none can be resolved, CCXT raises `ArgumentsRequired`.

**Can I use the INTX sandbox with CCXT?**
Yes. `exchange.set_sandbox_mode(True)` points every URL at `api-n5e1.coinbase.com`. Coinbase's documentation describes it as a USDC-funded environment with transfers, deposits and withdrawals disabled; onboarding goes through your Coinbase account team.

**Does CCXT support INTX perpetual futures?**
Yes. Perpetuals appear as unified symbols like `'BTC/USDC:USDC'` from the same client as spot, with `fetch_positions`, `fetch_funding_rate_history`, `fetch_funding_history` and `set_margin` available.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [coinbaseinternational unified API reference](/docs/exchanges/coinbaseinternational)
- [coinbaseinternational implicit API](/docs/exchanges/coinbaseinternational/implicit-api) — every raw endpoint
- [CCXT vs the Coinbase APIs](/docs/comparisons/ccxt-vs-coinbase-api) — the whole Coinbase estate
- [CCXT vs the Coinbase Exchange API](/docs/comparisons/ccxt-vs-coinbaseexchange-api)
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
