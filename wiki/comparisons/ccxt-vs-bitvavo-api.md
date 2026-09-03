<!-- title: CCXT vs the official Bitvavo SDKs -->
<!-- description: Bitvavo maintains Python and Node SDKs and has archived its Java, Go and PHP ones. Compared with CCXT on languages, streaming model and rate limits. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Bitvavo's Python and Node SDKs are maintained; its Java, Go and PHP wrappers are archived. CCXT covers Bitvavo in all seven of its languages with 74 unified capabilities and 17 streaming methods. -->
<!-- weight: 100 -->

# CCXT vs the official Bitvavo SDKs

[Bitvavo](https://bitvavo.com/) is a Dutch exchange with a well-documented API at [docs.bitvavo.com](https://docs.bitvavo.com/), and it is one of the few venues its size that ships first-party client libraries. Two of them are maintained: [python-bitvavo-api](https://github.com/bitvavo/python-bitvavo-api) and [node-bitvavo-api](https://github.com/bitvavo/node-bitvavo-api), both ISC-licensed. Three more once existed and are now marked Archived on GitHub: the Java, Go and PHP wrappers.

That shapes the decision. If you write Python or JavaScript, you have a real vendor SDK to weigh against [CCXT](/docs/manual). If you write Java, Go, C# or PHP, Bitvavo's first-party option is either archived or was never there — and CCXT covers all of them.

## TL;DR

- **Pick the official SDK** if you are on Python or Node, Bitvavo is your only venue, and you want a client whose method names are Bitvavo's own — `ticker24h`, `placeOrder`, `getRemainingLimit` — mapping one-for-one onto their docs.
- **Pick CCXT** if you are on any other language, or if Bitvavo is one of several venues: 74 unified capabilities, 33 of them `fetch*`, 17 `watch*` streaming methods and all 41 Bitvavo endpoints as implicit methods, in eight languages.
- **The archived wrappers are the argument.** Bitvavo's Java, Go and PHP clients are read-only repositories now; the same Bitvavo integration in those languages ships in CCXT and is maintained alongside 103 other venues.

## At a glance

| | **CCXT** | **Official Bitvavo SDKs** |
| --- | --- | --- |
| Exchanges covered | 104 (Bitvavo is one of them) | Bitvavo only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | Python and Node maintained; Java, Go and PHP wrappers archived |
| Packages to install | 1 (`ccxt`) | 1 per language (`python-bitvavo-api`, `bitvavo` on npm) |
| Unified market data + trading API | yes — same method names across every exchange | no — Bitvavo's own request/response shapes |
| Bitvavo capabilities implemented | 74 unified methods, 33 of them `fetch*` | full Bitvavo API surface |
| Raw endpoint access | yes — 41 Bitvavo endpoints as implicit methods | yes, it is the whole product |
| WebSockets | yes — 17 `watch*` methods, same shapes as `fetch*` | yes — callback-based socket client |
| Programming model | `await` a method, get a value back | callbacks registered on a socket object |
| Built-in rate limiter | yes, on by default (`rateLimit` 60 ms ≈ 1000 weight/min) | `getRemainingLimit()` — you decide when to stop |
| Unified error types | yes — 41 typed exceptions in one hierarchy | Bitvavo error codes |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `python-bitvavo-api` 44 stars · 7.8k PyPI installs/month; `bitvavo` on npm 24 stars · 1.2k installs/month |
| Licence | MIT | ISC |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues, Bitvavo support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the bitvavo GitHub organisation's repository listing and READMEs, the npm registry, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitvavo()
ticker = exchange.fetch_ticker('BTC/EUR')
print(ticker['last'], ticker['baseVolume'])
```

#### **python-bitvavo-api**

```python
from python_bitvavo_api.bitvavo import Bitvavo

bitvavo = Bitvavo({'APIKEY': '...', 'APISECRET': '...'})
socket = bitvavo.newWebsocket()

def on_ticker(response):
    for market in response:
        if market['market'] == 'BTC-EUR':
            print(market['bid'], market['ask'])

socket.ticker24h({}, on_ticker)
```

<!-- tabs:end -->

The SDK's documented quickstart is callback-shaped: you create a socket, hand it a function, and your logic runs when the response arrives. CCXT is value-shaped — you `await` a method and get a [unified ticker structure](/docs/manual#ticker-structure) back, with the same keys and units you get from every other exchange.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitvavo({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/EUR', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **python-bitvavo-api**

```python
from python_bitvavo_api.bitvavo import Bitvavo

bitvavo = Bitvavo({'APIKEY': '...', 'APISECRET': '...'})
socket = bitvavo.newWebsocket()

def on_order(response):
    print(response)

socket.placeOrder('BTC-EUR', 'buy', 'limit',
                  {'amount': '0.001', 'price': '60000'},
                  on_order)
```

<!-- tabs:end -->

Note the market id: Bitvavo uses `BTC-EUR`, CCXT normalises to `'BTC/EUR'` and maps back to the venue id. And note the optional-parameter convention — Bitvavo's SDKs pass required arguments positionally and everything else in a dictionary; CCXT puts venue-specific extras in `params`, with the common ones promoted to named arguments that work the same way on every exchange.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.bitvavo()
    while True:
        orderbook = await exchange.watch_order_book('BTC/EUR')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **node-bitvavo-api**

```javascript
const bitvavo = require('bitvavo')()

bitvavo.websocket.subscriptionBook('BTC-EUR', (book) => {
  console.log(book.bids[0], book.asks[0])
})
```

<!-- tabs:end -->

Both give you a maintained local book — Bitvavo's SDKs do handle the snapshot-plus-deltas reconciliation for you, which is more than most vendor clients manage. The difference is shape, not correctness: CCXT's `watch_order_book` returns the same structure as `fetch_order_book`, so swapping a polling loop for a stream is a one-word change and the code downstream is untouched.

## Where the differences actually bite

### Four of eight languages have no maintained first-party client

Bitvavo's Java, Go and PHP wrappers are archived on GitHub — read-only, no further commits — and there has never been a C#/.NET one. CCXT covers Bitvavo in all seven of its targets from a single TypeScript source, so a Bitvavo integration is available and maintained in the language your execution service is actually written in:

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.bitvavo ();
const ticker = await exchange.fetchTicker ('BTC/EUR');
```

#### **Python**

```python
import ccxt
exchange = ccxt.bitvavo()
ticker = exchange.fetch_ticker('BTC/EUR')
```

#### **PHP**

```php
$exchange = new \ccxt\bitvavo();
$ticker = $exchange->fetch_ticker('BTC/EUR');
```

#### **C#**

```csharp
var exchange = new ccxt.bitvavo();
var ticker = await exchange.FetchTicker("BTC/EUR");
```

#### **Go**

```go
exchange := ccxt.NewBitvavo(nil)
ticker, err := exchange.FetchTicker("BTC/EUR")
```

<!-- tabs:end -->

### Rate limits you do not have to model

Bitvavo meters by weight: 1000 points per IP or per API key per minute, with the weight of each endpoint published in its docs, and a ban when you exceed it. The official SDKs expose `getRemainingLimit()` so you can read your remaining budget — useful, but it is still your code that has to decide when to slow down.

CCXT encodes the weights in the exchange definition and ships a token-bucket throttler that is **on by default**, with `rateLimit` set to 60 ms for Bitvavo, which is the same 1000 requests per minute expressed as pacing rather than as a budget you watch. You write the loop; the library spaces the calls.

### Two programming models

This is the difference you feel on day one. The official SDKs are callback-based: you register a function and hand control to the socket. CCXT is pull-based: you `await` a method and get a value, so streaming code sits in ordinary control flow next to the REST code and composes with it. Neither is better in the abstract — push suits a long-running collector, pull suits a strategy that reads a book, decides, and sends an order in the same function.

### One error hierarchy

CCXT maps Bitvavo's error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once and it keeps working when you add a second exchange.

### Precision, rounding and string math

CCXT loads Bitvavo's market metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class, so quantities never drift through float rounding into a rejected order:

```python
amount = exchange.amount_to_precision('BTC/EUR', 0.0012345678)
price = exchange.price_to_precision('BTC/EUR', 61234.56789)
```

### Nothing is hidden — the implicit API

Alongside the 74 unified capabilities, **all 41 Bitvavo endpoints are generated as callable implicit methods**, with signing, rate limiting and error mapping applied:

```python
# GET /v2/account/fees
fees = exchange.private_get_account_fees()

# GET /v2/subaccounts
subaccounts = exchange.private_get_subaccounts()
```

Bitvavo's staking balance, sub-account transfers and institutional sub-account routes are reachable without leaving the library. Browse them on the [bitvavo implicit API page](/docs/exchanges/bitvavo/implicit-api).

## What the official Bitvavo SDKs do better

An honest list, because these are real:

- **One-to-one mapping with Bitvavo's docs.** `ticker24h`, `placeOrder`, `getRemainingLimit`, `newWebsocket` — the method names are the ones in the API reference, so there is no translation step when you are debugging against the vendor documentation. CCXT's unified names are a deliberate abstraction.
- **`getRemainingLimit()` is genuinely useful.** Reading your remaining weight budget directly is something CCXT's throttler abstracts away; if you want to make scheduling decisions based on how much budget is left, the SDK hands you the number.
- **New Bitvavo features land there first.** A new endpoint or parameter shows up in Bitvavo's own wrapper before it is modelled as a *unified* CCXT method. CCXT's implicit API closes most of that gap immediately, but a unified wrapper can lag.
- **A smaller install for a single-venue app.** If all you do is read Bitvavo tickers from a Node service, one small ISC-licensed package is less code than a library covering 104 exchanges.
- **Bitvavo's Market Data Pro WebSocket API.** Bitvavo documents a separate low-latency full-fidelity market data feed alongside the exchange WebSocket API; if that is what you need, work directly against Bitvavo's own documentation for it.

If Bitvavo is your only venue and you write Python or Node, the official SDK is a defensible choice.

## Migrating from the Bitvavo SDKs to CCXT

| What you are doing | Bitvavo SDK | CCXT |
| --- | --- | --- |
| Symbols | `'BTC-EUR'` | `'BTC/EUR'` |
| Markets | `markets({})` | `load_markets()` |
| Ticker | `ticker24h({})` / `tickerPrice({})` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `book('BTC-EUR', {})` | `fetch_order_book()` |
| Candles | `candles('BTC-EUR', '1h', {})` | `fetch_ohlcv()` |
| Public trades | `publicTrades('BTC-EUR', {})` | `fetch_trades()` |
| New order | `placeOrder(market, side, type, body)` | `create_order()` |
| Edit order | `updateOrder(...)` | `edit_order()` |
| Cancel order | `cancelOrder(market, orderId)` | `cancel_order()` |
| Open orders | `ordersOpen({})` | `fetch_open_orders()` |
| Balance | `balance({})` | `fetch_balance()` |
| My trades | `trades('BTC-EUR', {})` | `fetch_my_trades()` |
| Streams | `newWebsocket()` plus callbacks | `watch_*` on `ccxt.pro.bitvavo` |
| Rate-limit budget | `getRemainingLimit()` | throttler on by default; `exchange.rateLimit` |
| Anything not listed | native method | the same endpoint as an [implicit method](/docs/exchanges/bitvavo/implicit-api) |

## FAQ

**Does Bitvavo have an official Python SDK?**
Yes — [python-bitvavo-api](https://github.com/bitvavo/python-bitvavo-api), ISC-licensed, about 7.8k PyPI installs a month. There is also an official Node SDK published to npm as `bitvavo`. The Java, Go and PHP wrappers Bitvavo once published are archived on GitHub.

**Is there an official Bitvavo SDK for Java, Go, C# or PHP?**
Not a maintained one. `java-bitvavo-api` and `go-bitvavo-api` are archived, `php-bitvavo-api` is archived and marked deprecated, and there is no C#/.NET wrapper. CCXT supports Bitvavo in all of those languages with the same unified API it uses everywhere else.

**Do I need CCXT Pro separately for Bitvavo WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.bitvavo` and the 17 `watch*` methods — `watch_ticker`, `watch_tickers`, `watch_bids_asks`, `watch_trades`, `watch_ohlcv`, `watch_order_book`, `watch_orders` and `watch_my_trades`.

**How does CCXT handle Bitvavo's weight-based rate limit?**
It paces requests with a token-bucket throttler that is on by default, with `rateLimit` set to 60 ms — 1000 requests per minute, matching Bitvavo's documented budget. You can still read and adjust `exchange.rateLimit`, or turn the throttler off with `enableRateLimit = False` if you are metering yourself.

**Can I still call Bitvavo-specific endpoints through CCXT?**
Yes — all 41 of them, as [implicit methods](/docs/exchanges/bitvavo/implicit-api), with signing and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bitvavo unified API reference](/docs/exchanges/bitvavo)
- [bitvavo implicit API](/docs/exchanges/bitvavo/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
