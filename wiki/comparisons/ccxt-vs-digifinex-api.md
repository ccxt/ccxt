<!-- title: CCXT vs the raw DigiFinex REST API -->
<!-- description: DigiFinex publishes docs but no client library, so this compares CCXT against hand-written HTTP: signing, weight budgets, field naming, precision and errors. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: DigiFinex's GitHub repository is docs only and no SDK is published on npm or PyPI. CCXT gives its spot, margin and swap products 48 unified capabilities and all 88 endpoints — but no WebSocket support. -->
<!-- weight: 100 -->

# CCXT vs the raw DigiFinex REST API

[DigiFinex](https://www.digifinex.com) documents two separate product lines — spot (v3 REST, v1 WebSocket) and swap (v2 REST, v2 WebSocket) — with signed requests, a weight budget and escalating bans when you exceed it.

What it does not publish is a client library. The [`DigiFinex/api`](https://github.com/DigiFinex/api) repository on GitHub contains three markdown files and no code; its README is stamped `Version：1.5.20, Update: 2019-05-20` and documents an older MD5 signing scheme than the HMAC-SHA256 one the current v3 docs describe. There is no `digifinex` package on PyPI, and nothing official on npm. The docs offer sample snippets in PHP, JavaScript, Python and Go, and that is the extent of it.

So the choice is **CCXT or the HTTP client you write yourself**.

## TL;DR

- **Write it yourself** if you need DigiFinex's WebSocket feeds, which CCXT does not cover for this venue, or if you want the response fields exactly as DigiFinex names them.
- **Pick CCXT** if you want spot, margin and swap behind one typed API with the signing, weight budget, precision handling and error mapping already written — in eight languages, and identical to how you already call Binance or OKX.
- **Nothing is hidden.** All 88 DigiFinex endpoints are generated as [implicit methods](/docs/exchanges/digifinex/implicit-api), signed and rate-limited, so the unified layer is never a ceiling.

## At a glance

| | **CCXT** | **Raw DigiFinex API** |
| --- | --- | --- |
| Venues covered | 104 (DigiFinex is one of them) | DigiFinex only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | whatever you write it in |
| Official client library | n/a | none — `DigiFinex/api` is documentation only; nothing on npm or PyPI |
| Unified market data + trading API | yes — 48 unified capabilities, 32 `fetch*` methods | no — DigiFinex's own field names and shapes |
| Products in one client | spot, margin, swap | two documented API surfaces at different versions and paths |
| Instrument addressing | unified symbols: `'BTC/USDT'`, `'BTC/USDT:USDT'` | `btc_usdt` for spot, `BTCUSDTPERP` for swap |
| WebSockets | **no** — 0 `watch*` methods for this venue | yes — spot v1 and swap v2 feeds |
| Raw endpoint access | yes — 88 endpoints as implicit methods | yes, it is all you have |
| Authentication | signed for you: `ACCESS-KEY` / `ACCESS-TIMESTAMP` / `ACCESS-SIGN` | HMAC-SHA256 over URL-encoded, ASCII-sorted params |
| Built-in rate limiter | yes, on by default (`rateLimit` 900 ms; 300 ms for posts) | you model the 1200-weight budget |
| Unified error types | yes — 41 typed exceptions in one hierarchy | numeric `code` field per response |
| Testnet / sandbox | not available for this venue | not documented |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | n/a |
| Licence | MIT | n/a |
| Support | Discord, Telegram, GitHub issues — usually same-day | DigiFinex support and the API Telegram group |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, DigiFinex's published spot v3 REST documentation, the `DigiFinex/api` repository, live responses from `openapi.digifinex.com`, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.digifinex()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'], ticker['quoteVolume'])
```

#### **Raw HTTP**

```python
import requests

response = requests.get('https://openapi.digifinex.com/v3/ticker',
                        params={'symbol': 'btc_usdt'})
ticker = response.json()['ticker'][0]
print(ticker['last'], ticker['vol'], ticker['base_vol'])
```

<!-- tabs:end -->

Look at the last line. In DigiFinex's spot ticker, `vol` is the **base**-denominated 24h volume and `base_vol` is the **quote**-denominated one — the opposite of what the names suggest. CCXT maps `vol` to `baseVolume` and `base_vol` to `quoteVolume` and hands you a [unified ticker structure](/docs/manual#ticker-structure), so nothing downstream has to remember that. Multiply it across `buy`/`bid`, `sell`/`ask`, `change`, `date` in seconds versus `timestamp` in milliseconds, and per-field translation is most of what a hand-written client is.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.digifinex({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
exchange.cancel_order(order['id'], 'BTC/USDT')
```

#### **Raw HTTP**

```python
import hashlib
import hmac
import time
import urllib.parse
import requests

api_key, secret = '...', '...'
params = {'market': 'spot', 'symbol': 'btc_usdt',
          'type': 'buy', 'amount': '0.001', 'price': '60000'}
body = urllib.parse.urlencode(sorted(params.items()))
signature = hmac.new(secret.encode(), body.encode(), hashlib.sha256).hexdigest()

response = requests.post('https://openapi.digifinex.com/v3/spot/order/new',
    data=body,
    headers={
        'ACCESS-KEY': api_key,
        'ACCESS-TIMESTAMP': str(int(time.time())),
        'ACCESS-SIGN': signature,
        'Content-Type': 'application/x-www-form-urlencoded',
    })
print(response.json())
```

<!-- tabs:end -->

The signature is the part that eats an afternoon: parameters URL-encoded, sorted by ASCII, HMAC-SHA256 with the secret, and a timestamp that the server rejects if it is more than five seconds behind (tunable with an `ACCESS-RECV-WINDOW` header). CCXT does all of it, and the return value is a [unified order structure](/docs/manual#order-structure) with `id`, `status`, `filled` and `average` in the same places as every other venue.

## Where the differences actually bite

### Two product lines, one client

DigiFinex documents spot and swap as separate APIs, at different versions, with different paths, different instrument-id conventions (`btc_usdt` versus `BTCUSDTPERP`) and different response shapes. CCXT loads both into one market list and selects between them by symbol:

```python
exchange = ccxt.digifinex()
exchange.fetch_ticker('BTC/USDT')          # spot
exchange.fetch_ticker('BTC/USDT:USDT')     # USDT-margined perpetual
exchange.fetch_funding_rate('BTC/USDT:USDT')
exchange.fetch_positions()
```

Margin is in the same instance: `fetchCrossBorrowRate`, `fetchCrossBorrowRates`, `fetchBorrowInterest`, `fetchLeverageTiers`, `fetchMarketLeverageTiers`, `setLeverage`, `setMarginMode`, `addMargin` and `reduceMargin` are all unified capabilities for this venue, alongside `transfer`, `fetchTransfers`, `fetchLedger`, `fetchDepositWithdrawFees` and `withdraw`.

### The weight budget you do not have to model

DigiFinex meters by weight, and the documented rule is blunt: the summed weight for any IP, API key or user must not exceed **1200**, and exceeding it bans you for **2 minutes** the first three times in 24 hours, **10 minutes** after that, and longer on repeat. There is no gentle 429-and-retry.

CCXT ships a token-bucket throttler that is **on by default** (`enableRateLimit = true`, `rateLimit` 900 ms, 300 ms for posts) with per-endpoint weights in the exchange definition. You call methods in a loop; the library paces them, and the pacing is the same code you already trust on other venues.

### Precision, step size and string math

Every exchange rejects orders that violate its tick size, step size or minimum notional. CCXT loads DigiFinex's market metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class, so quantities never drift through float rounding:

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

Note that DigiFinex answers with `code: 0` on success and a non-zero code on failure — including on HTTP 200. A hand-written client has to check the body of every response, not the status line.

### One error hierarchy

DigiFinex's documented codes include `10005` (request frequency exceeds the limit), `10008` (timestamp invalid), `20007` (price precision error), `20008` (amount precision error) and `20011` (insufficient balance). CCXT maps them onto its [typed exception tree](/docs/manual#error-handling): `DDoSProtection`, `InvalidNonce`, `InvalidOrder`, `InsufficientFunds` and 37 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once and it keeps working on the next exchange, instead of matching on `20011`.

### Eight languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures. A hand-written DigiFinex client is written once per language, by you — and DigiFinex's own sample snippets cover four.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.digifinex ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **Python**

```python
import ccxt
exchange = ccxt.digifinex()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **Go**

```go
exchange := ccxt.NewDigifinex(nil)
ticker, err := exchange.FetchTicker("BTC/USDT")
```

<!-- tabs:end -->

### Nothing is hidden — the implicit API

Alongside the 48 unified capabilities, **all 88 DigiFinex endpoints are generated as callable implicit methods**, with signing, rate-limit accounting and error mapping applied:

```python
response = exchange.public_spot_get_markets()
```

Browse them all on the [DigiFinex implicit API page](/docs/exchanges/digifinex/implicit-api).

## What the raw DigiFinex API does better

Real advantages of writing it yourself:

- **WebSockets.** CCXT implements **no `watch*` methods for DigiFinex**. DigiFinex documents a spot v1 and a swap v2 WebSocket feed, and if you need live order books or trade streams from this venue, that is a raw integration regardless of what else you use CCXT for.
- **Exact field fidelity.** If you are reading DigiFinex's reference while debugging, the raw response matches it one-for-one. CCXT's unified names are a deliberate abstraction, which is an extra hop.
- **New endpoints on day one.** Anything DigiFinex ships is callable the moment it exists. A *unified* CCXT method may follow later — though the implicit API closes most of that gap immediately.
- **No dependency, no version to track.** For a script that hits two endpoints, `requests` plus twenty lines of signing is smaller than all of CCXT and never needs upgrading when an unrelated exchange changes.
- **Endpoints outside the trading surface.** Loan, sub-account and OTC-style endpoints that no unified abstraction models are simply HTTP calls when you write the client yourself.

If you need DigiFinex's streaming feeds, or you are writing a single-purpose script against two endpoints, hand-written is the honest recommendation.

## Migrating from raw DigiFinex calls to CCXT

| What you are doing | DigiFinex REST | CCXT |
| --- | --- | --- |
| Markets | `GET /v3/markets`, swap `/public/instruments` | `load_markets()` |
| Symbols | `btc_usdt`, `BTCUSDTPERP` | `'BTC/USDT'`, `'BTC/USDT:USDT'` |
| Ticker | `GET /v3/ticker` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET /v3/order_book` | `fetch_order_book()` |
| Candles | `GET /v3/kline` | `fetch_ohlcv()` |
| New order | `POST /v3/spot/order/new` | `create_order()` |
| Batch orders | the batch endpoint | `create_orders()` |
| Cancel | `POST /v3/spot/order/cancel` | `cancel_order()` / `cancel_orders()` |
| Open orders | `GET /v3/spot/order/current` | `fetch_open_orders()` |
| Balance | `GET /v3/spot/assets` | `fetch_balance()` |
| Positions | swap position endpoints | `fetch_positions()` |
| Funding rate | swap funding endpoints | `fetch_funding_rate()` / `fetch_funding_rate_history()` |
| Transfers | `POST /v3/transfer` | `transfer()` / `fetch_transfers()` |
| Anything not listed | the raw path | the same endpoint as an [implicit method](/docs/exchanges/digifinex/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [digifinex unified API reference](/docs/exchanges/digifinex).

## FAQ

**Does DigiFinex have an official Python or JavaScript SDK?**
Not one that is published. The `DigiFinex/api` repository on GitHub contains only markdown documentation — a README, a v2 API document and a WebSocket document — and there is no `digifinex` package on PyPI or an official one on npm. The current docs give sample snippets in PHP, JavaScript, Python and Go, which you copy and maintain yourself.

**Does CCXT support DigiFinex WebSockets?**
No. CCXT implements zero `watch*` methods for DigiFinex, so streaming is not available through CCXT for this venue. DigiFinex documents spot and swap WebSocket feeds you would consume directly.

**Does CCXT support DigiFinex swap and margin, or only spot?**
All three. Spot, margin and swap load into one `ccxt.digifinex` instance, selected by symbol, with 48 unified capabilities covering positions, funding rates, leverage tiers, borrow rates and transfers.

**Does DigiFinex have a testnet CCXT can use?**
`setSandboxMode` is not available for this venue in CCXT — no test URLs are declared. Test against small live orders, or against static fixtures.

**Can I still call DigiFinex-specific endpoints from CCXT?**
Yes — all 88 of them, as [implicit methods](/docs/exchanges/digifinex/implicit-api), with signing and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed, no paid tier.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [digifinex unified API reference](/docs/exchanges/digifinex)
- [digifinex implicit API](/docs/exchanges/digifinex/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
