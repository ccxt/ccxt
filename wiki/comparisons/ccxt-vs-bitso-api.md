<!-- title: CCXT vs the Bitso API -->
<!-- description: Bitso's only maintained connector is a Java REST wrapper. Compare it with CCXT on languages, coverage, signing, rate limits, sandbox and raw endpoint access. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Bitso maintains one official SDK — a Java wrapper for REST v3, last released in July 2024. CCXT reaches the same 40 endpoints from seven languages, though neither side streams Bitso's WebSocket. -->
<!-- weight: 100 -->

# CCXT vs the Bitso API

[Bitso](https://bitso.com) is the largest exchange in Mexico and one of the larger venues in Latin America. Its public API is documented at [bitso.com/api_info](https://bitso.com/api_info), and Bitso publishes exactly one client library of its own: [bitso-java](https://github.com/bitsoex/bitso-java), an official Java wrapper for REST v3.

So the choice is narrower than it looks. If you write Java, you can use Bitso's own wrapper. In any other language you are either hand-rolling HTTP against a signed API or using [CCXT](/docs/manual). The question that decides it: **do you want a Bitso-shaped client in one language, or a venue-shaped-agnostic client in seven?**

## TL;DR

- **Pick bitso-java** if you are on the JVM, Bitso is your only venue, and you want types Bitso themselves defined (`BitsoTicker`, `BitsoOrder`, `BigDecimal` amounts) that track their docs one-for-one.
- **Pick CCXT** if you are not on the JVM, or if Bitso is one of several venues. CCXT implements 24 unified capabilities for Bitso and exposes all 40 of its REST endpoints as implicit methods, from TypeScript, JavaScript, Python, PHP, C#/.NET, Go and Java.
- **Neither one streams Bitso.** Bitso publishes a WebSocket API with `trades`, `diff-orders` and `orders` channels; CCXT implements no `watch*` methods for Bitso, and the official Java wrapper's README documents REST only. If you need a live Bitso book, you are writing that socket client yourself either way.

## At a glance

| | **CCXT** | **bitso-java (official)** |
| --- | --- | --- |
| Exchanges covered | 104 (Bitso is one of them) | Bitso only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Java |
| Unified market data + trading API | yes — same method names across every exchange | no — Bitso's own request/response shapes |
| Bitso capabilities implemented | 24 unified methods, 18 of them `fetch*` | full REST v3 surface |
| Raw endpoint access | yes — 40 Bitso endpoints as implicit methods | yes, it is the whole product |
| WebSockets | no `watch*` methods for Bitso | not documented in the README |
| Built-in rate limiter | yes, on by default (`rateLimit` 2000 ms) | not documented |
| Unified error types | yes — 41 typed exceptions in one hierarchy | Bitso error codes |
| Testnet / sandbox | `setSandboxMode(true)` switches to Bitso's staging host | environment switching added in v4.1.0 |
| Latest release read | continuous | v4.1.0, 11 July 2024 |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | 40 GitHub stars |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the bitsoex/bitso-java repository and its releases page, Bitso's published API documentation, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitso()
ticker = exchange.fetch_ticker('BTC/MXN')
print(ticker['last'], ticker['baseVolume'])
```

#### **bitso-java (Java)**

```text
BitsoTicker[] tickers = bitso.getTicker();
for (Ticker ticker : tickers) {
    System.out.println(ticker);
}
```

<!-- tabs:end -->

The CCXT call returns a [unified ticker structure](/docs/manual#ticker-structure) — the same keys, types and units you get from Kraken or Binance. The Java wrapper returns Bitso's own objects, which is more literal and less portable.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitso({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/MXN', 'limit', 'buy', 0.001, 1500000)
print(order['id'], order['status'])
```

#### **bitso-java (Java)**

```text
String buyOrderId = bitso.placeOrder("btc_mxn", BitsoOrder.SIDE.BUY,
    BitsoOrder.TYPE.LIMIT, new BigDecimal("0.1"), null,
    new BigDecimal("90000"));
```

<!-- tabs:end -->

Note the symbol. Bitso books are `btc_mxn`; CCXT normalises that to `'BTC/MXN'` and maps it back to the venue id for you, so the same strategy code addresses `'BTC/USDT'` on the next exchange without a lookup table.

## Where the differences actually bite

### Six of seven languages have no official option

There is no first-party Bitso client for Python, JavaScript, Go, PHP or C#. The community filled part of the gap — [mariorz/python-bitso](https://github.com/mariorz/python-bitso) is MIT-licensed and does cover the WebSocket channels — but it is one person's project, not a vendor commitment. CCXT gives you the same Bitso implementation in all seven of its targets, written once in TypeScript and transpiled:

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.bitso ();
const ticker = await exchange.fetchTicker ('BTC/MXN');
```

#### **Python**

```python
import ccxt
exchange = ccxt.bitso()
ticker = exchange.fetch_ticker('BTC/MXN')
```

#### **PHP**

```php
$exchange = new \ccxt\bitso();
$ticker = $exchange->fetch_ticker('BTC/MXN');
```

#### **C#**

```csharp
var exchange = new ccxt.bitso();
var ticker = await exchange.FetchTicker("BTC/MXN");
```

#### **Go**

```go
exchange := ccxt.NewBitso(nil)
ticker, err := exchange.FetchTicker("BTC/MXN")
```

<!-- tabs:end -->

### Signing is fiddly enough to be worth not writing

Bitso authenticates with an `Authorization: Bitso <key>:<nonce>:<signature>` header, where the signature is HMAC-SHA256 over the nonce, the HTTP method, the full request path *including the query string*, and the JSON body when there is one. Get the concatenation order or the path prefix wrong and you get a 401 with no hint as to which part was wrong. CCXT builds that header in `sign()` and keeps it correct across every endpoint, including the ones with path parameters like `orders/{oid}` and `order_trades/{oid}`.

### Rate limits you do not have to model

Bitso's documented limits are 60 requests per minute per IP for public endpoints and 300 requests per minute per account for private ones, with a one-minute lockout when you exceed them and longer blocks for repeat offences. CCXT ships a token-bucket throttler that is on by default, with `rateLimit` set to 2000 ms for Bitso. You write a loop; the library paces it.

### Precision and string math

Bitso quotes MXN pairs where a single tick is a meaningful amount of money. CCXT loads Bitso's market metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class, so quantities never drift through float rounding into a rejected order.

```python
amount = exchange.amount_to_precision('BTC/MXN', 0.0012345678)
price = exchange.price_to_precision('BTC/MXN', 1512345.6789)
```

### One error hierarchy

CCXT maps Bitso's error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError` and 35 more, all descending from `BaseError`. You catch `ccxt.InsufficientFunds` once and it keeps working when you add a second venue, instead of matching on Bitso's `0201` and hoping the payload never changes.

### Nothing is hidden — the implicit API

The 24 unified methods are not a ceiling. Every endpoint in Bitso's API is generated as a callable implicit method, with signing, nonce handling, rate limiting and error mapping applied:

```python
# GET /v3/account_status
status = exchange.private_get_account_status()

# GET /v3/ledger/fundings
fundings = exchange.private_get_ledger_fundings()
```

Bitso-specific endpoints — `mx_bank_codes`, `kyc_documents`, `funding_destination`, the SPEI rails — are reachable without dropping to raw HTTP. Browse them all on the [bitso implicit API page](/docs/exchanges/bitso/implicit-api).

## What bitso-java does better

An honest list:

- **It is Bitso's own code.** The wrapper is published by the exchange, so its field names and enums are exactly the ones in Bitso's documentation. When you are debugging against their API reference, there is no translation step.
- **Java-native typed models.** `BitsoTicker`, `BitsoOrder.SIDE`, `BitsoOrder.TYPE` and `BigDecimal` throughout give you compile-time safety over Bitso's actual payloads. CCXT's typed structures are deliberately *unified* — better for portability, less literal about Bitso.
- **Environment switching for JVM users.** Release v4.1.0 (July 2024) added the ability to point the client at environments other than production, which is the shape JVM shops usually want for staging.
- **Smaller dependency for a single-venue Java service.** If you trade only Bitso from a Java service, one MIT-licensed wrapper is a smaller install than all of CCXT.

If you are a JVM shop trading Bitso and only Bitso, bitso-java is a defensible choice — and CCXT's Java target is the alternative to weigh it against, not its Python one.

## Migrating from the Bitso API to CCXT

| What you are doing | Bitso REST v3 | CCXT |
| --- | --- | --- |
| Symbols | `btc_mxn` | `'BTC/MXN'` |
| Markets | `GET /v3/available_books` | `load_markets()` |
| Ticker | `GET /v3/ticker` | `fetch_ticker()` |
| Order book | `GET /v3/order_book` | `fetch_order_book()` |
| Candles | `GET /v3/ohlc` | `fetch_ohlcv()` |
| Public trades | `GET /v3/trades` | `fetch_trades()` |
| New order | `POST /v3/orders` | `create_order()` |
| Cancel order | `DELETE /v3/orders/{oid}` | `cancel_order()` |
| Cancel all | `DELETE /v3/orders/all` | `cancel_all_orders()` |
| Open orders | `GET /v3/open_orders` | `fetch_open_orders()` |
| Balance | `GET /v3/balance` | `fetch_balance()` |
| My trades | `GET /v3/user_trades` | `fetch_my_trades()` |
| Ledger | `GET /v3/ledger` | `fetch_ledger()` |
| Anything not listed | the raw endpoint | the same endpoint as an [implicit method](/docs/exchanges/bitso/implicit-api) |

## FAQ

**Does Bitso have an official Python SDK?**
No. Bitso's GitHub organisation publishes one maintained client library, [bitso-java](https://github.com/bitsoex/bitso-java), for the JVM. For Python, JavaScript, Go, PHP or C# your realistic options are CCXT or your own HTTP client; a community Python wrapper, [mariorz/python-bitso](https://github.com/mariorz/python-bitso), also exists under MIT.

**Does CCXT support Bitso WebSockets?**
No. CCXT implements zero `watch*` methods for Bitso, so streaming is not available through CCXT Pro for this venue. Bitso does publish a WebSocket API with `trades`, `diff-orders` and `orders` channels — if you need it, you connect to it directly. Everything else in this comparison still applies to the REST side.

**Can I test against Bitso without real money?**
CCXT wires `setSandboxMode(true)` to Bitso's staging host, and Bitso separately documents a sandbox server funded with Bitcoin and Ethereum testnet coins. Verify which environment your API keys were issued for before you rely on it.

**Can I still call Bitso-specific endpoints through CCXT?**
Yes — all 40 of them, as [implicit methods](/docs/exchanges/bitso/implicit-api), with the `Authorization: Bitso` header, nonce and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support for the exchanges that have it.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bitso unified API reference](/docs/exchanges/bitso)
- [bitso implicit API](/docs/exchanges/bitso/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
