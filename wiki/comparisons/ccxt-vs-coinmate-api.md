<!-- title: CCXT vs the Coinmate API -->
<!-- description: Coinmate publishes copy-paste API clients rather than installable packages. Compared with CCXT on signing, coverage, dependencies and portability. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Coinmate's official clients are example code you vendor into your project, not published packages. CCXT ships Coinmate as an installable dependency with 18 unified capabilities and all 64 raw endpoints. -->
<!-- weight: 100 -->

# CCXT vs the Coinmate API

[Coinmate](https://coinmate.io) is a Czech exchange trading crypto against CZK and EUR. It publishes [`coinmate-api-examples`](https://github.com/coinmate-io/coinmate-api-examples) — API clients in Java 21, TypeScript 5.x, Python 3.11+ and PHP 8.2+, covering what the repository describes as 55+ endpoints, under MIT.

The catch is distribution. Those clients are not published to Maven Central, npm, PyPI or Packagist; the README's install step is `cd python && pip install -r requirements.txt`. You copy the code into your project and own it from there.

So the deciding question is: **do you want a vendored client you maintain, or a dependency someone else maintains?**

## TL;DR

- **Use Coinmate's official clients** if you want code written against Coinmate's own field names by Coinmate, you are happy vendoring a few files, and Coinmate is the only venue you will ever call.
- **Pick CCXT** if you want `pip install ccxt` (or npm, Composer, NuGet, Go modules, Maven), a unified API that already runs against 103 other venues, and someone else tracking API changes.
- **Neither choice hides the API.** CCXT generates all 64 Coinmate endpoints as [implicit methods](/docs/exchanges/coinmate/implicit-api), so the unified layer is never a ceiling.

## At a glance

| | **CCXT** | **Coinmate's official clients** |
| --- | --- | --- |
| Exchanges covered | 104 (Coinmate is one of them) | Coinmate only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Java 21, TypeScript 5.x, Python 3.11+, PHP 8.2+ — four separate codebases |
| Distribution | published packages (`ccxt` on npm, PyPI, Packagist, NuGet, Maven, Go modules) | copy the source into your project; not published to any package registry |
| Unified market data + trading API | yes — 18 unified capabilities, 13 `fetch*` methods | no — Coinmate's own request/response shapes |
| Endpoint coverage | 64 endpoints as implicit methods | "55+ endpoints" per the repository README |
| WebSockets | none for Coinmate — poll the `fetch*` methods | none documented |
| Built-in rate limiter | yes, on by default (`rateLimit` 600ms) | not described in the repository |
| Unified error types | yes — 41 typed exceptions in one hierarchy | per-client error handling |
| Testnet / sandbox | not available for Coinmate | none documented |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month | `coinmate-api-examples`: 1 star, 1 fork |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues on the examples repository, Coinmate support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}} and the `coinmate-io/coinmate-api-examples` repository and its per-language READMEs.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.coinmate()
ticker = exchange.fetch_ticker('BTC/EUR')
print(ticker['last'], ticker['baseVolume'])
```

#### **Coinmate's Python client**

```python
# after copying the `python/` folder into your project
async with CoinmateClient(config) as client:
    response = await client.get_ticker('BTC_EUR')
    if not response.error:
        print(response.data.last)
```

<!-- tabs:end -->

Two things differ. The symbol: `'BTC/EUR'` is CCXT's unified form and means the same thing on every venue, while `BTC_EUR` is Coinmate's market id. And the result: CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) with the same keys and units you get from Kraken or Bitstamp, so downstream code does not branch on which exchange produced it.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.coinmate({
    'apiKey': '...',    # publicKey
    'secret': '...',    # privateKey
    'uid': '...',       # clientId
})
order = exchange.create_order('BTC/EUR', 'limit', 'buy', 0.001, 55000)
print(order['id'], order['status'])
```

#### **Coinmate's Python client**

```python
# credentials go in a .env file read by the client's config
async with CoinmateClient(config) as client:
    response = await client.buy_limit(
        currency_pair='BTC_EUR', amount='0.001', price='55000')
    print(response.data)
```

<!-- tabs:end -->

Coinmate needs three credentials rather than the usual two — `clientId`, `publicKey` and `privateKey` — and signs requests with HMAC-SHA256 over an incrementing nonce. CCXT's `coinmate` class declares all three in `requiredCredentials` and maps them to `uid`, `apiKey` and `secret`, so the constructor tells you what is missing instead of the exchange returning an opaque authentication error.

## Where the differences actually bite

### A dependency versus vendored code

This is the practical difference. `pip install ccxt` (or `composer require ccxt/ccxt`, or `go get`) gives you a versioned dependency: when Coinmate changes a field, you bump a version. Vendored example code gives you a fork the moment you paste it — Coinmate's later fixes reach you only if you notice them and re-merge by hand.

Coinmate maintains four separate client implementations, one per language. CCXT is written once in TypeScript and transpiled to seven languages with identical method names and return structures:

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.coinmate()
ticker = exchange.fetch_ticker('BTC/EUR')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.coinmate ();
const ticker = await exchange.fetchTicker ('BTC/EUR');
```

#### **PHP**

```php
$exchange = new \ccxt\coinmate();
$ticker = $exchange->fetch_ticker('BTC/EUR');
```

#### **Go**

```go
exchange := ccxt.NewCoinmate(nil)
ticker, err := exchange.FetchTicker("BTC/EUR")
```

<!-- tabs:end -->

### Fiat pairs without special cases

Coinmate quotes in CZK and EUR. In CCXT those are ordinary unified symbols — `'BTC/CZK'`, `'BTC/EUR'`, `'ETH/CZK'` — parsed through the same `safe_symbol` machinery as `'BTC/USDT'`, with the same precision and limits metadata loaded from `load_markets()`. Code that already handles one venue's fiat pairs handles Coinmate's.

### One error hierarchy

CCXT maps Coinmate's error responses onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `RateLimitExceeded`, `NetworkError` and 35 more, all descending from `BaseError`. The `except` clauses you write for Coinmate keep working when you add another exchange.

### Precision and string math

CCXT loads Coinmate's market metadata and exposes `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class, so order sizes never drift through float rounding:

```python
amount = exchange.amount_to_precision('BTC/EUR', 0.0012345678)
price = exchange.price_to_precision('BTC/EUR', 55123.456789)
```

### Nothing is hidden — the implicit API

Alongside the 18 unified capabilities, **all 64 endpoints in CCXT's Coinmate API block are generated as callable implicit methods**, with signing and rate limiting applied:

```python
response = exchange.publicGetTickerAll()
```

Browse them on the [Coinmate implicit API page](/docs/exchanges/coinmate/implicit-api).

## What Coinmate's official clients do better

Real advantages, and they matter for some projects:

- **Written by the venue, against the venue's own field names.** When you are reading Coinmate's API reference, the official client's method and field names line up with it directly. CCXT's unified names are a deliberate abstraction, which is one extra hop when debugging against the vendor docs.
- **They cover endpoints CCXT does not model as unified methods.** The repository claims 55+ endpoints implemented; CCXT's unified layer implements 18 capabilities and, notably, has no `fetchOHLCV` for Coinmate — candles are only reachable through the implicit API, if at all. If you need a Coinmate-specific endpoint with typed models around it, the official client has already shaped it.
- **Typed request/response models per language.** Java 21 and TypeScript 5.x models built for Coinmate's payloads are more literal about that payload than CCXT's typed *unified* structures, which are optimised for portability instead.
- **No dependency at all.** Vendored code means your build has nothing extra to resolve, audit or pin. For a small internal tool touching one venue, that is a genuine simplification.

If Coinmate is your only venue and you value literal fidelity to their docs over portability and dependency management, their official clients are a defensible choice.

## Migrating from Coinmate's clients to CCXT

| What you are doing | Coinmate client | CCXT |
| --- | --- | --- |
| Credentials | `clientId`, `publicKey`, `privateKey` | `uid`, `apiKey`, `secret` |
| Symbols | `'BTC_EUR'` | `'BTC/EUR'` |
| Markets | `get_trading_pairs()` | `load_markets()` |
| Ticker | `get_ticker()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `get_order_book()` | `fetch_order_book()` |
| Trading fees | `get_trading_fees()` | `fetch_trading_fee()` |
| New order | `buy_limit()` / `sell_limit()` | `create_order()` |
| Cancel order | `cancel_order()` | `cancel_order()` |
| Cancel everything | `cancel_all_open_orders()` | `cancel_order()` per id |
| Open orders | `get_open_orders()` | `fetch_open_orders()` |
| Balance | `get_balances()` | `fetch_balance()` |
| Anything not listed | the endpoint URL | the same endpoint as an [implicit method](/docs/exchanges/coinmate/implicit-api) |

## FAQ

**Does Coinmate have an official SDK on PyPI or npm?**
No. Coinmate publishes [`coinmate-api-examples`](https://github.com/coinmate-io/coinmate-api-examples) with client implementations in Java, TypeScript, Python and PHP, but they are not published to any package registry — the install step is copying the source and installing its requirements. CCXT is the installable option.

**Does CCXT support Coinmate over WebSocket?**
No. CCXT implements no `watch*` methods for Coinmate, and Coinmate's own examples repository documents no WebSocket API either. Use the `fetch*` methods and poll.

**Can I trade Coinmate's CZK and EUR pairs through CCXT?**
Yes. They are ordinary unified symbols — `'BTC/CZK'`, `'BTC/EUR'` — with precision and limits loaded from `load_markets()`, exactly like a crypto-to-crypto pair.

**Why does CCXT's Coinmate constructor need three credentials?**
Because Coinmate's private API signs with `clientId`, `publicKey` and `privateKey`. CCXT maps them to `uid`, `apiKey` and `secret` and declares all three in `requiredCredentials`, so a missing one raises immediately instead of failing at the exchange.

**Can I still call Coinmate-specific endpoints through CCXT?**
Yes — all 64 endpoints in the class's API block are generated as [implicit methods](/docs/exchanges/coinmate/implicit-api), with signing, throttling and error mapping applied.

**Is CCXT free?**
Yes. MIT-licensed.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [coinmate unified API reference](/docs/exchanges/coinmate)
- [coinmate implicit API](/docs/exchanges/coinmate/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
