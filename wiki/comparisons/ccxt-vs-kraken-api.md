<!-- title: CCXT vs the Kraken Spot and Futures APIs -->
<!-- description: Kraken Spot and Kraken Futures are separate APIs with separate keys and hosts. Compare CCXT's two Kraken clients against krakenex and python-kraken-sdk. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Kraken Spot and Kraken Futures are two different APIs with two sets of credentials and no official SDK between them. CCXT ships them as kraken and krakenfutures, with the same unified method names on both. -->
<!-- weight: 50 -->

# CCXT vs the Kraken Spot and Futures APIs

Kraken is really two exchanges wearing one brand. **Spot** lives at `api.kraken.com` with its own REST and WebSocket dialects. **Futures** lives at `futures.kraken.com/derivatives/api/v3` with a different dialect, a different WebSocket host, and — as Kraken's own derivatives documentation makes explicit when it tells you to authenticate a particular call with "a Spot API key" — a different set of credentials.

Kraken does not publish an official client library. The Python libraries people actually use are community-maintained: [`krakenex`](https://github.com/veox/python3-krakenex), a deliberately minimal REST wrapper, and [`python-kraken-sdk`](https://github.com/btschwertfeger/python-kraken-sdk), which covers Spot and Futures in one package but through separate client classes.

[CCXT](/docs/manual) ships the split as two exchange ids — `kraken` and `krakenfutures` — that answer to the same unified method names. The question that decides between them: **do you want to learn Kraken's two dialects, or one API that happens to speak them?**

## TL;DR

- **Pick `krakenex`** if you want the smallest possible dependency, only need a handful of Spot REST endpoints, and LGPL-3.0 is fine for your project.
- **Pick `python-kraken-sdk`** if you want Spot, xStocks and Futures in one Apache-2.0 Python package with a CLI and WebSocket clients, and you are happy importing a different class per product.
- **Pick CCXT** if you want Spot and Futures behind one method vocabulary, in any of seven languages, with the rate limiting, nonce handling, error taxonomy and order-book reconciliation already written — and the same code shape on the next exchange.
- **Choosing CCXT does not hide anything.** All 61 raw Spot endpoints and 39 raw Futures endpoints are callable as [implicit methods](/docs/exchanges/kraken/implicit-api).

## At a glance

| | **CCXT** | **krakenex** | **python-kraken-sdk** |
| --- | --- | --- | --- |
| Exchanges covered | 104 | Kraken Spot only | Kraken Spot + Futures |
| Spot and Futures in one vocabulary | yes — `ccxt.kraken()` and `ccxt.krakenfutures()`, same method names | Spot only | separate `kraken.spot` and `kraken.futures` clients |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python | Python (>= 3.11) |
| Unified market data + trading API | yes — same method names across every exchange | no — you pass Kraken method names as strings | no — Kraken's own shapes |
| WebSockets | yes — 13 `watch*` on Spot, 12 on Futures, plus `createOrderWs`, `editOrderWs`, `cancelOrderWs`, `cancelOrdersWs`, `cancelAllOrdersWs` | **no** — REST only | yes, Spot and Futures WS clients |
| Raw endpoint access | yes — 61 Spot + 39 Futures endpoints as implicit methods | yes, it is the whole product | yes, via a generic `request()` |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 1000 ms Spot, 600 ms Futures) | no | not a documented feature |
| Nonce handling | automatic | you pass `nonce` yourself in `data` | handled by the client |
| Unified error types | yes — 41 typed exceptions in one hierarchy | Kraken's `error` string array | Kraken exception classes |
| Sandbox | `set_sandbox_mode(True)` on `krakenfutures` (demo-futures) | none | Futures sandbox documented |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** (one package, every venue) | 726 stars · 88k PyPI installs/month | 83 stars · 131k PyPI installs/month |
| Licence | **MIT** | **LGPL-3.0** (core; examples BSD) | Apache-2.0 |
| Latest release read | continuous | v2.2.2, 1 July 2024 | v3.3.0, 7 July 2026 |
| Support | Discord, Telegram, GitHub — usually same-day | GitHub issues | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, Kraken's published REST and derivatives documentation, the `python3-krakenex` and `python-kraken-sdk` repositories and PyPI pages, and install counts from PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

spot = ccxt.kraken()
print(spot.fetch_ticker('BTC/USD')['last'])

futures = ccxt.krakenfutures()
print(futures.fetch_ticker('BTC/USD:USD')['last'])
```

#### **python-kraken-sdk**

```python
from kraken.spot import Market as SpotMarket
from kraken.futures import Market as FuturesMarket

print(SpotMarket().get_ticker(pair="XBTUSD"))
print(FuturesMarket().get_tickers())
```

#### **krakenex**

```python
import krakenex

k = krakenex.API()
print(k.query_public('Ticker', {'pair': 'XXBTZUSD'}))
```

<!-- tabs:end -->

Three things are visible here. First, the **asset codes**: Kraken calls Bitcoin `XBT`, and its Spot REST API prefixes many assets with `X` or `Z` — `XXBTZUSD` is the pair you pass to `Ticker`. CCXT normalises that to `BTC/USD` and keeps Kraken's own id on `market['id']` for when you need it.

Second, the **split**: Spot and Futures are different clients with different method names (`get_ticker(pair=...)` versus `get_tickers()`), because they are different APIs. In CCXT they are different classes with the *same* method name.

Third, `krakenex` is a **transport**, not a model. `query_public('Ticker', ...)` passes the Kraken method name through as a string and hands you the raw JSON back; there is no ticker structure, and no autocomplete.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.kraken({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USD', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **python-kraken-sdk**

```python
from kraken.spot import Trade

trade = Trade(key=key, secret=secret)
trade.create_order(
    ordertype="limit",
    side="buy",
    volume=1,
    pair="BTC/EUR",
    price=0.01,
)
```

<!-- tabs:end -->

In `krakenex` the same order is `k.query_private('AddOrder', {...})` with Kraken's own field names and a nonce you supply. And the same order on Kraken **Futures** is a different endpoint, a different parameter vocabulary and a different client object in all three of the alternatives. In CCXT it is `ccxt.krakenfutures(...).create_order('BTC/USD:USD', 'limit', 'buy', 1, 60000)` — one symbol changed, one class changed, nothing else.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.kraken()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USD')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **python-kraken-sdk**

```python
import asyncio
from kraken.spot import SpotWSClient

class Client(SpotWSClient):
    async def on_message(self, message):
        print(message)

async def main():
    client = Client()
    await client.start()
    await client.subscribe(params={"channel": "ticker", "symbol": ["BTC/USD"]})
    while not client.exception_occur:
        await asyncio.sleep(6)

asyncio.run(main())
```

<!-- tabs:end -->

`krakenex` has no WebSocket support at all, so there is no third tab: streaming Kraken with `krakenex` means writing a WebSocket client yourself.

The two shown are not doing the same thing either. CCXT is **pull-shaped** and returns a **live, fully merged order book** with the same structure as `fetch_order_book`. A raw subscription is **push-shaped** and delivers snapshot and delta messages:

| | CCXT | raw stream |
| --- | --- | --- |
| Apply deltas onto the snapshot in order | done for you | your code |
| Verify Kraken's CRC32 book **checksum** | implemented, opt-in per call | your code |
| Reconnect, re-subscribe and re-seed after a drop | done for you | your code |
| Keep a bounded, depth-limited cache | done for you | your code |
| Same structure as the REST call | yes | no |

Kraken publishes a CRC32 checksum with its book updates because local books drift. CCXT implements the check and leaves it off by default for Kraken — the exchange's checksum has not been reliable enough to re-seed on — so you turn it on with `exchange.options['watchOrderBook']['checksum'] = True` when you want it. Either way, a drifted book does not throw: it quietly disagrees with the exchange until a fill surprises you, which is why the reconciliation belongs in a library that maintains it rather than in your strategy.

## Where the differences actually bite

### Two APIs, one method vocabulary

This is the Kraken-specific one, and it is the reason this page exists.

```python
for exchange_id in ['kraken', 'krakenfutures']:
    exchange = getattr(ccxt, exchange_id)()
    exchange.load_markets()
    symbol = 'BTC/USD' if exchange_id == 'kraken' else 'BTC/USD:USD'
    print(exchange_id, exchange.fetch_order_book(symbol)['bids'][0])
```

`load_markets`, `fetch_ticker`, `fetch_order_book`, `fetch_ohlcv`, `fetch_trades`, `create_order`, `cancel_order`, `fetch_open_orders`, `fetch_my_trades`, `fetch_balance` — all present on both, with the same signatures and the same [return structures](/docs/manual#ticker-structure). `krakenfutures` adds the derivatives-only ones: `fetch_positions`, `set_leverage`, `fetch_funding_rates`, `fetch_leverage_tiers`. CCXT implements **59 unified capabilities on `kraken`** and **50 on `krakenfutures`**.

### No official SDK means you are hand-rolling either way

Kraken's documentation shows cURL and community libraries rather than a first-party client. Whatever you pick, somebody has to write:

- **Nonce management.** Kraken Spot requires a strictly increasing nonce per key, and getting it wrong returns `EAPI:Invalid nonce` intermittently under concurrency. CCXT generates and signs it for you; with `krakenex` you pass it yourself.
- **Rate-limit accounting.** Kraken meters Spot by a decaying counter, with different costs per endpoint and per tier. CCXT ships a token-bucket throttler that is on by default, with a base `rateLimit` of 1000 ms for Spot and 600 ms for Futures and a 10-second rolling window for the endpoints that need one.
- **Error parsing.** Kraken returns errors as an array of strings. CCXT maps them onto a [typed exception tree](/docs/manual#error-handling): `EAPI:Invalid key` becomes `AuthenticationError`, `EQuery:Invalid asset pair` becomes `BadSymbol`, `EFunding:Invalid amount` becomes `InsufficientFunds`, `EAPI:Rate limit exceeded` and `EGeneral:Too many requests` become `DDoSProtection`, `EAPI:Invalid nonce` becomes `InvalidNonce`, `EService:Unavailable` becomes `ExchangeNotAvailable` — 41 typed exceptions in total, all descending from `BaseError`.
- **Asset-code translation.** `XBT` versus `BTC`, and the `X`/`Z` prefixes on Spot pair ids. CCXT does this in `load_markets` and keeps the raw id available.
- **Precision and rounding.** Kraken rejects orders that violate lot size, tick size or minimum order volume, and its Futures contracts have their own sizing rules. CCXT gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class, so quantities never drift through float rounding into a rejected order.

### Seven languages, one API

`krakenex` and `python-kraken-sdk` are Python-only. CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures in all seven:

<!-- tabs:start -->

#### **Python**

```python
exchange = ccxt.kraken()
ticker = exchange.fetch_ticker('BTC/USD')
```

#### **TypeScript**

```typescript
const exchange = new ccxt.kraken ();
const ticker = await exchange.fetchTicker ('BTC/USD');
```

#### **Go**

```go
exchange := ccxt.NewKraken(nil)
ticker, err := exchange.FetchTicker("BTC/USD")
```

<!-- tabs:end -->

A strategy prototyped in a Python notebook ports to a Go or C# execution service without redesigning the data model.

### WebSockets that look like REST

CCXT Pro is bundled in the same `ccxt` package — no separate purchase. `kraken` gets **13 streaming methods** (`watchOrderBook`, `watchOrderBookForSymbols`, `watchTrades`, `watchTradesForSymbols`, `watchOHLCV`, `watchTicker`, `watchTickers`, `watchBidsAsks`, `watchBalance`, `watchOrders`, `watchMyTrades` among them) plus order entry over the socket: `createOrderWs`, `editOrderWs`, `cancelOrderWs`, `cancelOrdersWs` and `cancelAllOrdersWs`. `krakenfutures` gets **12**, including `watchPositions`.

`watch_order_book` returns the same structure as `fetch_order_book`. Swapping a polling loop for a stream is a one-word change and nothing downstream moves.

### Sandbox where a sandbox exists

Kraken Futures has a demo environment; Kraken Spot does not. CCXT reflects that rather than pretending otherwise:

```python
exchange = ccxt.krakenfutures({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)   # demo-futures.kraken.com, REST and WebSocket
```

Calling `set_sandbox_mode(True)` on `ccxt.kraken()` raises `NotSupported`, because there is no Spot sandbox to point it at.

### Nothing is hidden — the implicit API

Alongside the unified capabilities, every endpoint on both APIs is generated as a callable implicit method, with signing, nonce, rate limiting and error mapping applied:

```python
spot = ccxt.kraken()
response = spot.public_get_asset_pairs()

futures = ccxt.krakenfutures()
response = futures.public_get_tickers()
```

Browse them on the [kraken implicit API](/docs/exchanges/kraken/implicit-api) and [krakenfutures implicit API](/docs/exchanges/krakenfutures/implicit-api) pages.

## What krakenex and python-kraken-sdk do better

An honest list, because these are real:

- **`krakenex` is genuinely minimal.** Two methods — `query_public` and `query_private` — plus `load_key`, `close` and `json_options`. If you only need a couple of Spot endpoints, that is a tiny amount of code to read, audit and reason about, against a library that models 104 exchanges.
- **`krakenex` passes Kraken's own method names straight through.** `query_public('Ticker', ...)`, `query_private('AddOrder', ...)`: what you write is what the documentation page says, with no abstraction between you and the payload. When Kraken adds an endpoint, it works immediately with no library update at all.
- **`python-kraken-sdk` models xStocks explicitly.** Kraken's tokenised-stock instruments are a first-class part of its Spot clients, and it also ships a command-line tool alongside the SDK — neither of which CCXT provides.
- **`python-kraken-sdk` has a `request()` escape hatch with a first-party feel.** `client.request("GET", "/derivatives/api/v3/accounts")` takes the raw path, so unmapped endpoints need no special support. (CCXT's implicit methods do the same job, but from a camelCased name rather than a literal path.)
- **Kraken-shaped parameters are easier to debug against Kraken's docs.** `ordertype`, `volume`, `pair` in the alternatives versus CCXT's `type`, `amount`, `symbol` — when you are staring at Kraken's reference and an error string, literal is one fewer hop.

Two caveats worth knowing before you choose: `krakenex`'s core is **LGPL-3.0**, which for some proprietary work is a legal question before it is an engineering one, and its last release read at the time of writing was v2.2.2 from July 2024 with **no WebSocket support at all**. `python-kraken-sdk` is Apache-2.0 and actively released, but requires Python 3.11 or newer.

If you are in Python, Kraken-only, and want a maintained community library that covers both Spot and Futures with Kraken's own vocabulary, `python-kraken-sdk` is a reasonable choice.

## Migrating from krakenex to CCXT

| What you are doing | krakenex | CCXT |
| --- | --- | --- |
| Symbols | `'XXBTZUSD'` | `'BTC/USD'` Spot, `'BTC/USD:USD'` Futures |
| Client | `krakenex.API(key=..., secret=...)` | `ccxt.kraken({'apiKey': ..., 'secret': ...})` |
| Nonce | you pass it in `data` | automatic |
| Asset pairs | `query_public('AssetPairs')` | `load_markets()` |
| Ticker | `query_public('Ticker')` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `query_public('Depth')` | `fetch_order_book()` |
| Candles | `query_public('OHLC')` | `fetch_ohlcv()` |
| New order | `query_private('AddOrder')` | `create_order()` |
| Cancel order | `query_private('CancelOrder')` | `cancel_order()` |
| Open orders | `query_private('OpenOrders')` | `fetch_open_orders()` |
| Balance | `query_private('Balance')` | `fetch_balance()` |
| Trade history | `query_private('TradesHistory')` | `fetch_my_trades()` |
| Streams | not supported | `watch_*` on `ccxt.pro.kraken` |
| Kraken Futures | not supported | `ccxt.krakenfutures()`, same method names |
| Anything not listed | `query_public` / `query_private` with the method name | the same endpoint as an [implicit method](/docs/exchanges/kraken/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [kraken unified API reference](/docs/exchanges/kraken).

## FAQ

**Does CCXT support Kraken Futures?**
Yes, as a separate exchange id: `ccxt.krakenfutures()`. Kraken Spot and Kraken Futures are separate APIs on separate hosts with separate credentials, so CCXT models them as separate clients — but they answer to the same unified method names, so the calling code is nearly identical.

**Why does CCXT call it `BTC/USD` when Kraken calls it `XXBTZUSD`?**
Kraken uses `XBT` for Bitcoin and prefixes many Spot assets with `X` or `Z`. CCXT normalises symbols across all 104 exchanges so the same string works everywhere, and keeps Kraken's native id available on `market['id']` for when you need to talk to Kraken in its own terms.

**Is there an official Kraken SDK?**
Kraken's API documentation does not publish a first-party client library; its examples reference community packages. The widely used Python libraries — `krakenex` and `python-kraken-sdk` — are community-maintained, and `python-kraken-sdk`'s own README states that Kraken is in no way associated with its authors.

**Does Kraken have a sandbox I can use through CCXT?**
Kraken Futures does — `ccxt.krakenfutures().set_sandbox_mode(True)` points every REST and WebSocket URL at `demo-futures.kraken.com`. Kraken Spot has no sandbox, so the same call on `ccxt.kraken()` raises `NotSupported`.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.kraken` or `ccxt.pro.krakenfutures` and call `watch*` methods — 13 and 12 of them respectively.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support. That matters here: `krakenex`'s core is LGPL-3.0, which is a licence-review question that MIT does not raise.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [kraken unified API reference](/docs/exchanges/kraken)
- [kraken implicit API](/docs/exchanges/kraken/implicit-api) — every raw endpoint
- [krakenfutures unified API reference](/docs/exchanges/krakenfutures)
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
