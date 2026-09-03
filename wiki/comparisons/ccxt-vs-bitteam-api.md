<!-- title: CCXT vs the raw BIT.TEAM API -->
<!-- description: BIT.TEAM publishes no SDK — its GitHub organisation is empty and its own docs name CCXT as the integration path. Raw HTTP vs 20 unified methods. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: BIT.TEAM has no client library in any language, and several of its REST endpoints are literally named /trade/api/ccxt/. CCXT is the integration path the venue points at, in eight languages. -->
<!-- weight: 100 -->

# CCXT vs the raw BIT.TEAM API

[BIT.TEAM](https://bit.team/) is a spot and P2P exchange launched in 2016 and registered in the United Kingdom. It documents a REST API at [bit.team/trade/api/documentation](https://bit.team/trade/api/documentation), and its [developer page](https://bit.team/docs) describes that API as offering "CCXT support, compatible with 3commas, OctoBot, FreqTrade".

That is the whole comparison in one sentence. BIT.TEAM's GitHub organisation, [bitteamgroup](https://github.com/bitteamgroup), has no public repositories, and there is no first-party or widely used community client in any language. So the realistic choice is **raw HTTP against a signed REST API, or [CCXT](/docs/manual)** — and the venue itself points at the second one.

## TL;DR

- **Write it yourself** if you need one or two endpoints, in one language, and would rather not take a dependency.
- **Pick CCXT** for anything larger: 20 unified capabilities, 16 of them `fetch*`, plus all 25 BIT.TEAM endpoints as implicit methods, from TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java and Rust.
- **There is no WebSocket option on either side of this page.** CCXT implements zero `watch*` methods for BIT.TEAM. If you need live data you are polling, whichever route you take.

## At a glance

| | **CCXT** | **Raw BIT.TEAM API** |
| --- | --- | --- |
| Exchanges covered | 104 (BIT.TEAM is one of them) | BIT.TEAM only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | whatever you write |
| Official vendor SDK | not applicable | none published; the GitHub organisation has no public repositories |
| Unified market data + trading API | yes — same method names across every exchange | no — BIT.TEAM's own payloads |
| BIT.TEAM capabilities implemented | 20 unified methods, 16 of them `fetch*` | you implement what you need |
| Raw endpoint access | yes — 25 BIT.TEAM endpoints as implicit methods | yes, it is all you have |
| WebSockets | no `watch*` methods for BIT.TEAM | not used by CCXT for this venue |
| Built-in rate limiter | yes, on by default | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus BIT.TEAM's payload |
| Testnet / sandbox | not wired for this venue | none documented |
| Licence | MIT | not applicable |
| Support | Discord, Telegram, GitHub issues — usually same-day | BIT.TEAM support and Telegram |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, BIT.TEAM's developer pages, and the bitteamgroup GitHub organisation.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitteam()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw HTTP**

```python
import requests

r = requests.get('https://bit.team/trade/api/pair/btc_usdt')
data = r.json()['result']
print(data)   # BIT.TEAM's own keys, strings and units
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure): the same keys, the same types, timestamps in milliseconds, prices and volumes as numbers. Raw, you get BIT.TEAM's field names and your own parsing to write and keep working.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitteam({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **Raw HTTP**

```python
import base64, requests

key, secret = '...', '...'
token = base64.b64encode((key + ':' + secret).encode()).decode()

r = requests.post(
    'https://bit.team/trade/api/ccxt/ordercreate',
    headers={'Authorization': 'Basic ' + token,
             'Content-Type': 'application/json'},
    json={'pairId': 2, 'side': 'buy', 'type': 'limit',
          'amount': '0.001', 'price': '60000'})
print(r.json())
```

<!-- tabs:end -->

Two things to notice. First, private requests authenticate with HTTP Basic — the base64 of `apiKey:secret` in an `Authorization` header — so the credential travels on every call and there is no nonce or signature to get wrong; the tradeoff is that there is nothing to bind a request to a timestamp either. Second, orders are keyed by BIT.TEAM's numeric `pairId`, not by a symbol. CCXT resolves that from `load_markets()`, so `'BTC/USDT'` is all you pass.

## Where the differences actually bite

### Portability is the whole point

BIT.TEAM is a long-tail venue, and long-tail venues are rarely anyone's only venue. Adding a second exchange to a hand-rolled BIT.TEAM integration means a second payload shape, a second symbol convention, a second auth scheme and a second error taxonomy — plus a translation layer of your own so the rest of the system can stay venue-agnostic. That translation layer is what CCXT already is:

```python
for exchange_id in ['bitteam', 'binance', 'kraken', 'okx']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT')['last'])
```

### Eight languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures. A BIT.TEAM integration prototyped in Python moves to a Go or C# service without a second parsing layer.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.bitteam ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **Python**

```python
import ccxt
exchange = ccxt.bitteam()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **PHP**

```php
$exchange = new \ccxt\bitteam();
$ticker = $exchange->fetch_ticker('BTC/USDT');
```

#### **Go**

```go
exchange := ccxt.NewBitteam(nil)
ticker, err := exchange.FetchTicker("BTC/USDT")
```

<!-- tabs:end -->

### One error hierarchy

CCXT maps BIT.TEAM's failures onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError` and 35 more, all descending from `BaseError`. You catch `ccxt.InsufficientFunds` once instead of matching on a message string that a redeploy can change.

### Precision and string math

CCXT loads BIT.TEAM's pair precisions from `trade/api/pairs/precisions` and gives you `amount_to_precision` and `price_to_precision`, backed by the `Precise` string-arithmetic class, so amounts never drift through float rounding into a rejected order.

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

### Nothing is hidden — the implicit API

The 20 unified methods are not a ceiling. Every BIT.TEAM endpoint is generated as a callable implicit method, with auth and rate limiting applied:

```python
# GET /trade/api/cmc/summary
summary = exchange.public_get_trade_api_cmc_summary()

# GET /trade/api/transactionsOfUser
txs = exchange.private_get_trade_api_transactionsofuser()
```

Browse them all on the [bitteam implicit API page](/docs/exchanges/bitteam/implicit-api).

## What the raw API does better

An honest list:

- **The endpoints are few and the auth is simple.** Twenty-five routes and HTTP Basic authentication is about as low a barrier as a signed exchange API gets. For a single read-only integration, `requests` plus a base64 header is genuinely less work than reading a library's conventions.
- **The vendor documentation is the only authoritative description.** BIT.TEAM's docs describe its own P2P and asset endpoints in its own terms; CCXT's unified names are an abstraction over them, which is one extra hop when you are cross-checking behaviour.
- **Full fidelity to the payloads.** Fields CCXT does not model reach you unchanged. CCXT keeps the raw response under `info`, but the top-level structure is unified rather than literal.
- **No WebSocket either way, so the usual CCXT Pro advantage does not apply here.** If live data matters more than portability, neither option saves you anything and you will be building a poller regardless.

If BIT.TEAM is your only venue and your integration is small, hand-rolling it is a reasonable call.

## Migrating from the raw BIT.TEAM API to CCXT

| What you are doing | BIT.TEAM REST | CCXT |
| --- | --- | --- |
| Symbols | `btc_usdt` / numeric `pairId` | `'BTC/USDT'` |
| Markets | `GET /trade/api/pairs` | `load_markets()` |
| Ticker | `GET /trade/api/pair/{name}` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `GET /trade/api/orderbooks/{symbol}` | `fetch_order_book()` |
| Candles | `GET /api/tw/history/{pairName}/{resolution}` | `fetch_ohlcv()` |
| Public trades | `GET /trade/api/trades` | `fetch_trades()` |
| New order | `POST /trade/api/ccxt/ordercreate` | `create_order()` |
| Cancel order | `POST /trade/api/ccxt/cancelorder` | `cancel_order()` |
| Open orders | `GET /trade/api/ccxt/ordersOfUser` | `fetch_open_orders()` |
| Order by id | `GET /trade/api/ccxt/order/{id}` | `fetch_order()` |
| Balance | `GET /trade/api/ccxt/balance` | `fetch_balance()` |
| My trades | `GET /trade/api/ccxt/tradesOfUser` | `fetch_my_trades()` |
| Transactions | `GET /trade/api/transactionsOfUser` | `fetch_deposits_withdrawals()` |
| Anything not listed | the raw endpoint | the same endpoint as an [implicit method](/docs/exchanges/bitteam/implicit-api) |

## FAQ

**Does BIT.TEAM have an official SDK?**
No. The bitteamgroup GitHub organisation has no public repositories, and no first-party client library is published for any language. BIT.TEAM's own developer page names CCXT as the supported integration path, alongside 3commas, OctoBot and Freqtrade.

**Does CCXT support BIT.TEAM WebSockets?**
No. CCXT implements zero `watch*` methods for BIT.TEAM, so `ccxt.pro.bitteam` is not available. Live data means polling `fetch_order_book` or `fetch_trades` on a timer.

**How does BIT.TEAM authenticate API requests?**
With HTTP Basic authentication: the base64 encoding of `apiKey:secret` in an `Authorization: Basic …` header. CCXT builds that header for you and applies it to every private endpoint, including the implicit ones.

**Can I still call BIT.TEAM-specific endpoints through CCXT?**
Yes — all 25 of them, as [implicit methods](/docs/exchanges/bitteam/implicit-api), with authentication and rate limiting applied. Choosing CCXT does not cut you off from anything the venue exposes.

**Is CCXT free?**
Yes. MIT-licensed.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bitteam unified API reference](/docs/exchanges/bitteam)
- [bitteam implicit API](/docs/exchanges/bitteam/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
