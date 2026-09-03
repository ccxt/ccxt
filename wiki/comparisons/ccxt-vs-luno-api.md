<!-- title: CCXT vs the Luno API and official Luno SDKs -->
<!-- description: Luno publishes Python, Go and PHP SDKs. They are compared with CCXT's luno class on symbols, language coverage, streaming, rate limits and error handling. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Luno's own SDKs cover Python, Go and PHP with one method per endpoint. CCXT gives Luno 25 unified capabilities in eight languages — but only two watch* methods, against Go's fuller streaming client. -->
<!-- weight: 100 -->

# CCXT vs the Luno API and official Luno SDKs

Luno maintains three API client libraries on GitHub: [`luno-python`](https://github.com/luno/luno-python), [`luno-go`](https://github.com/luno/luno-go) and [`luno-php`](https://github.com/luno/luno-php), all MIT-licensed. They are close to the API — one method per endpoint, Luno's own field names, Luno's own pair codes like `XBTZAR`.

[CCXT](/docs/manual) speaks the same API behind method names shared with 104 other venues, and turns `XBTZAR` into `'BTC/ZAR'`.

The question that decides between them: **is Luno the only venue you will ever trade?**

## TL;DR

- **Pick a Luno SDK** if Luno is your only venue, you work in Python, Go or PHP, and you want field names identical to Luno's reference — or if you need the fuller streaming behaviour in `luno-go`.
- **Pick CCXT** if you want unified symbols, structures and error types across Luno and everything else, in eight languages, from one dependency.
- **Streaming is the honest caveat.** CCXT implements only two `watch*` methods for Luno — `watch_order_book` and `watch_trades` — and both require API credentials, because Luno's Streaming API is authenticated even for market data.

## At a glance

| | **CCXT** | **Official Luno SDKs** |
| --- | --- | --- |
| Exchanges covered | 104 (Luno is one of them) | Luno only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | Python, Go, PHP (the Java SDK repository is archived) |
| Symbols | `'BTC/ZAR'`, `'ETH/ZAR'` | `XBTZAR`, `ETHZAR` |
| Unified capabilities | 25, of which 18 are `fetch*` | one method per endpoint |
| WebSockets | 2 methods — `watch_order_book`, `watch_trades` | `luno-go/streaming` maintains a book and auto-reconnects; `luno-python` has a stream client; `luno-php` — not published as a streaming client |
| Raw endpoint access | yes — 40 endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 200 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | Luno error codes |
| Testnet / sandbox | no — Luno has no sandbox in CCXT | no |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `luno-go` 94 GitHub stars; `luno-python` 71 stars · ~1.3k PyPI installs/month; `luno-php` 12 stars |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues, Luno support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the Luno GitHub organisation and PyPI download counts for `luno-python`.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.luno()
ticker = exchange.fetch_ticker('BTC/ZAR')
print(ticker['last'], ticker['bid'], ticker['ask'])
```

#### **luno-python**

```python
from luno_python.client import Client

c = Client(api_key_id='key_id', api_key_secret='key_secret')
try:
    res = c.get_ticker(pair='XBTZAR')
    print(res)
except Exception as e:
    print(e)
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — the same keys, types and units whether the venue is Luno, Kraken or Binance. The SDK returns Luno's payload under Luno's names, keyed by Luno's pair code. Note the `XBT` versus `BTC` difference: CCXT normalises Luno's `XBT` to the unified `BTC` code, so `XBTZAR` becomes `'BTC/ZAR'` and your downstream code does not need a per-venue alias table.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.luno({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/ZAR', 'limit', 'buy', 0.001, 1200000)
print(order['id'], order['status'])
```

#### **luno-python**

```python
from luno_python.client import Client

c = Client(api_key_id='key_id', api_key_secret='key_secret')
res = c.post_limit_order(pair='XBTZAR', type='BID',
                         volume='0.001', price='1200000')
print(res)
```

<!-- tabs:end -->

`type='BID'`/`'ASK'` is Luno's convention; CCXT takes `'buy'`/`'sell'` and returns a [unified order structure](/docs/manual#order-structure) with `id`, `status`, `filled`, `remaining`, `average` and `fee` populated the same way as on every other exchange.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    # Luno's Streaming API is authenticated, so credentials are required
    exchange = ccxt.pro.luno({'apiKey': '...', 'secret': '...'})
    while True:
        orderbook = await exchange.watch_order_book('BTC/ZAR')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **luno-go**

```go
c, err := streaming.Dial(keyID, keySecret, "XBTZAR")
if err != nil {
    log.Fatal(err)
}
defer c.Close()
bids, asks := c.Snapshot()
```

<!-- tabs:end -->

Both maintain a live book from Luno's Streaming API, and both require credentials — Luno authenticates the stream even for market data. CCXT gives you `watch_order_book` and `watch_trades` returning the same structures as `fetch_order_book` and `fetch_trades`, so switching a polling loop to a stream is a one-word change.

## Where the differences actually bite

### Eight languages, one API

Luno publishes Python, Go and PHP; the Java SDK repository is archived. CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java with identical method names and return structures:

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.luno()
ticker = exchange.fetch_ticker('BTC/ZAR')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.luno ();
const ticker = await exchange.fetchTicker ('BTC/ZAR');
```

#### **C#**

```csharp
var exchange = new ccxt.luno();
var ticker = await exchange.FetchTicker("BTC/ZAR");
```

<!-- tabs:end -->

If your service is C#, Java or TypeScript, CCXT is the maintained path to Luno.

### Portability, and Luno's market position

Luno's role in most systems is local-fiat pairs — its own documentation's worked example is `XBTZAR` — while depth and derivatives come from a global venue. That is exactly the situation that ends up multi-venue: Luno for the local on and off ramp, something else for the rest. In CCXT both sit behind the same methods:

```python
for exchange_id in ['luno', 'binance', 'kraken']:
    exchange = getattr(ccxt, exchange_id)()
    exchange.load_markets()
```

With per-venue SDKs, that reconciliation layer is code you write and maintain.

### Ledgers, accounts and fees are unified too

Luno models balances as named accounts with a transaction ledger. CCXT exposes that through `fetch_accounts`, `fetch_ledger` and `fetch_balance` — the same three method names it uses on any exchange with the same shape — along with `fetch_trading_fee`, `fetch_deposit_address` and `create_deposit_address`. Twenty-four unified capabilities in total, 18 of them `fetch*`.

### Rate limits, precision and errors

CCXT's throttler is on by default with `rateLimit` at 200 ms for Luno. `amount_to_precision` and `price_to_precision` apply each market's `volume_scale` and `price_scale` through the `Precise` string-arithmetic class. Luno's errors map onto CCXT's [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `RateLimitExceeded` and 36 more under `BaseError`.

### Nothing is hidden — the implicit API

Alongside the unified methods, **all 40 Luno endpoints are generated as implicit methods**, with signing and rate-limit accounting applied. Browse them on the [luno implicit API page](/docs/exchanges/luno/implicit-api).

## What Luno's official SDKs do better

Honestly:

- **Complete endpoint coverage, generated from the API.** The SDKs expose one method per endpoint, including versioned variants like `get_order_v2` and `get_order_v3` and the parts of Luno's product CCXT does not model as unified methods. If you need an endpoint CCXT has not unified, the SDK method already exists with typed arguments.
- **`luno-go`'s streaming client is more capable than CCXT's Luno WebSocket support.** It maintains the order book, exposes monotonic sequence numbers on updates, and its documentation states the connection reconnects automatically on error. CCXT gives Luno only `watch_order_book` and `watch_trades` — no private streams, no ticker stream.
- **Luno's own field names, end to end.** `pair`, `volume`, `counter`, `BID`/`ASK` — exactly what Luno's reference documents. CCXT's unified names are a deliberate abstraction, which is one extra hop when debugging against the vendor docs.
- **A much smaller dependency.** For a single-venue Luno integration in Python, Go or PHP, the official SDK is a fraction of the size of a 104-exchange library.

If Luno is your only venue and you work in Python, Go or PHP — especially if you need rich streaming — the official SDK is the better fit.

## Migrating from a Luno SDK to CCXT

| What you are doing | Luno SDK | CCXT |
| --- | --- | --- |
| Symbols | `XBTZAR` | `'BTC/ZAR'` |
| Markets | `markets()` | `load_markets()` |
| Ticker | `get_ticker()` / `get_tickers()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `get_order_book()` | `fetch_order_book()` |
| Candles | `get_candles()` | `fetch_ohlcv()` |
| Trades | `list_trades()` | `fetch_trades()` |
| Limit order | `post_limit_order()` | `create_order()` |
| Market order | `post_market_order()` | `create_order()` with `'market'` |
| Cancel order | `stop_order()` | `cancel_order()` |
| Open orders | `list_orders()` | `fetch_open_orders()` |
| Balances | `get_balances()` | `fetch_balance()` |
| Accounts / ledger | account endpoints | `fetch_accounts()` / `fetch_ledger()` |
| Streams | `streaming.Dial()` (Go), `stream_client` (Python) | `watch_order_book()`, `watch_trades()` on `ccxt.pro.luno` |
| Anything not listed | the endpoint method | the same endpoint as an [implicit method](/docs/exchanges/luno/implicit-api) |

## FAQ

**Does Luno have an official SDK?**
Yes — MIT-licensed clients for [Python](https://github.com/luno/luno-python), [Go](https://github.com/luno/luno-go) and [PHP](https://github.com/luno/luno-php), maintained under Luno's GitHub organisation. A Java SDK repository exists but is archived.

**Why does CCXT call Luno's `XBTZAR` pair `BTC/ZAR`?**
Because `XBT` and `BTC` are the same asset under two conventions, and CCXT normalises to one so that portfolio, risk and logging code does not need a per-venue alias table. The original identifier is still available on `market['id']`.

**Does CCXT support Luno WebSockets?**
Partially. `ccxt.pro.luno` implements `watch_order_book` and `watch_trades` — two methods — and both need API credentials because Luno's Streaming API authenticates even market-data connections. There are no private streams for Luno in CCXT. `luno-go`'s streaming package is the fuller client.

**Which markets does Luno expose through CCXT?**
Whatever Luno lists to your account. CCXT reads them at runtime with `load_markets()` from Luno's `markets` endpoint, so each pair appears as a unified symbol — `XBTZAR` becomes `'BTC/ZAR'` — with its tick size, step size and minimum volume already parsed.

**Does Luno have a testnet?**
CCXT defines no sandbox URLs for Luno, so `setSandboxMode(True)` will not switch you to a test environment.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [luno unified API reference](/docs/exchanges/luno)
- [luno implicit API](/docs/exchanges/luno/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
