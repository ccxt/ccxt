<!-- title: CCXT vs the Bitbns API and official Bitbns SDKs -->
<!-- description: Bitbns ships official Python and Node clients. Compared with CCXT on symbol handling, the INR/USDT endpoint split, signing, rate limits and streaming support. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Bitbns addresses markets by bare coin ticker and uses different endpoint names for INR and USDT pairs. CCXT hides both behind unified symbols, but has no WebSocket support for Bitbns — the official Python SDK does. -->
<!-- weight: 100 -->

# CCXT vs the Bitbns API and official Bitbns SDKs

Bitbns, the Indian exchange, publishes official clients under the [bitbns-official](https://github.com/bitbns-official) GitHub organisation: [bitbnspy](https://github.com/bitbns-official/bitbnspy) for Python and [node-bitbns-api](https://github.com/bitbns-official/node-bitbns-api) for Node.js. [CCXT](/docs/manual) implements the same REST API behind method names shared with 103 other venues.

The question that decides between them is narrower here than usual, because both sides have a real gap: **do you need live streaming, or do you need portability?**

## TL;DR

- **Pick the official Bitbns SDKs** if Bitbns is your only venue and you want live order book and ticker streams — `bitbnspy` has Socket.IO-based feeds and CCXT's `bitbns` has no WebSocket support at all.
- **Pick CCXT** if you want unified symbols, one error hierarchy and the same 17 capabilities expressed the way every other exchange expresses them, in seven languages.
- **Nothing is hidden.** All 36 Bitbns endpoints CCXT models are callable as [implicit methods](/docs/exchanges/bitbns/implicit-api), signed and rate-limited.

## At a glance

| | **CCXT** | **Official Bitbns SDKs** |
| --- | --- | --- |
| Exchanges covered | 104 (Bitbns is one of them) | Bitbns only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python (`bitbnspy`), Node.js (`bitbns`) |
| Packages to install | 1 (`ccxt`) | one per language |
| Unified market data + trading API | yes — same names on every exchange | no — Bitbns's own method and payload shapes |
| Unified capabilities | 17 | n/a — endpoint wrappers |
| Symbols | `'BTC/INR'`, `'BTC/USDT'` | bare coin tickers: `'BTC'`, `'XRPUSDT'` |
| WebSockets | **no** — `bitbns` has no `watch*` methods | yes — `getOrderBookSocket`, `getTickerSocket` in `bitbnspy` |
| Raw endpoint access | yes — 36 endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 1000 ms) | not a documented feature |
| Unified error types | yes — 41 typed exceptions in one hierarchy | Bitbns `status` / `error` fields in the payload |
| Testnet / sandbox | not available for `bitbns` | not offered |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `bitbnspy` 8 stars · 628 PyPI installs/month; `bitbns` on npm 527 installs/month |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the bitbns-official repositories, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch tickers

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitbns()
ticker = exchange.fetch_ticker('BTC/INR')
print(ticker['last'], ticker['baseVolume'])
```

#### **bitbnspy**

```python
from bitbnspy import bitbns

bitbnsObj = bitbns.publicEndpoints()
print(bitbnsObj.fetchTickers())
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) for one unified symbol. The SDK returns Bitbns's payload for everything at once, and you index into it by coin name.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitbns({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('XRP/INR', 'limit', 'buy', 200, 25)
print(order['id'], order['status'])
```

#### **bitbnspy**

```python
from bitbnspy import bitbns

key = 'yourKey'
secretKey = 'yourSecretKey'
bitbnsObj = bitbns(key, secretKey)
bitbnsObj.placeBuyOrder('XRP', 200, 25)
```

<!-- tabs:end -->

Two differences worth noticing. The SDK has a separate method per side — `placeBuyOrder` and `placeSellOrder` — where CCXT takes `'buy'` / `'sell'` as an argument, so a strategy that flips direction does not branch on the method name. And the SDK's `'XRP'` is a coin, not a market: which quote currency you get depends on the endpoint you happened to call.

## Where the differences actually bite

### Symbols are markets, not coins

Bitbns addresses INR markets by the bare coin ticker (`BTC`) and USDT markets by a concatenation (`XRPUSDT`). CCXT resolves both into ordinary unified symbols — `'BTC/INR'`, `'XRP/USDT'` — with `base`, `quote`, precision and limits attached to each market. Call `load_markets()` and you get the venue's real market list rather than a coin list you have to pair up yourself.

### The INR and USDT endpoint split

This is the Bitbns-specific trap. Several operations use **different endpoint names depending on the quote currency**: cancelling an order on an INR market and cancelling one on a USDT market are different paths, and so is listing open orders. Hand-rolled code ends up carrying an `if quote == 'USDT'` branch in every trading function. CCXT keeps the branch in one place — it reads the market's quote currency and picks the endpoint — so `cancel_order(id, 'BTC/INR')` and `cancel_order(id, 'XRP/USDT')` are the same call.

### Signing

Private Bitbns requests carry three headers: `X-BITBNS-APIKEY`, `X-BITBNS-PAYLOAD` — a base64 encoding of the JSON body including a timestamp — and `X-BITBNS-SIGNATURE`, an **HMAC-SHA512** over that base64 string. You sign the encoded bytes, so key ordering inside the JSON matters. CCXT implements it once, in the base class, for all seven languages.

### Rate limits you do not have to model

CCXT ships a token-bucket throttler that is **on by default** (`enableRateLimit = true`, `rateLimit = 1000` ms for Bitbns) and maps rate-limit responses onto `RateLimitExceeded`. Bitbns's own archived endpoint documentation does not publish a numeric limit, which makes a conservative client-side pacer more useful, not less.

### One error hierarchy

Bitbns answers with a `status` field and an `error` string rather than HTTP status codes alone. CCXT translates those onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `RateLimitExceeded`, `NetworkError` and 35 more, all under `BaseError` — so `except ccxt.InsufficientFunds` is the same line of code here and on the next exchange.

### Seven languages, one API

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.bitbns ();
const ticker = await exchange.fetchTicker ('BTC/INR');
```

#### **Python**

```python
import ccxt
exchange = ccxt.bitbns()
ticker = exchange.fetch_ticker('BTC/INR')
```

#### **PHP**

```php
$exchange = new \ccxt\bitbns();
$ticker = $exchange->fetch_ticker('BTC/INR');
```

<!-- tabs:end -->

Bitbns publishes Python and Node clients. CCXT gives you the same API in seven languages from one source of truth, so a Python research script and a Go execution service share a data model.

### Nothing is hidden — the implicit API

```python
# any raw Bitbns endpoint, camelCased from its path
status = exchange.v1_get_platform_status()
```

All 36 endpoints CCXT models are reachable this way, with the `X-BITBNS-*` signature, rate-limit accounting and error mapping applied. Browse them on the [bitbns implicit API page](/docs/exchanges/bitbns/implicit-api).

## What the official Bitbns SDKs do better

These are real, and the first one is the big one:

- **They stream and CCXT does not.** `bitbnspy` exposes `getOrderBookSocket(coinName, marketName)` and `getTickerSocket(marketName)` as Socket.IO event feeds. CCXT has **no** `watch*` methods for Bitbns — if you need a live book or live ticks from this venue, the official SDK is the only one of the two that offers them.
- **Bitbns-specific products are wrapped.** The Python SDK covers ground CCXT does not model as unified methods, including margin, swap and futures endpoints and Bitbns's FIP subscription calls.
- **Names match the API one-for-one.** `placeBuyOrder`, `getSellOrderBook`, `currentCoinBalance` — you can read Bitbns's endpoint list and type the call, with no unified-symbol translation in between.
- **A Node client exists as a first-party package.** `bitbns` on npm is published by the exchange; if your service is Node-only and Bitbns is your only venue, that is a smaller dependency than CCXT.

If Bitbns is your only venue and you need live streams, use the official SDK — or use both, with the SDK for the socket feeds and CCXT for order entry and account state.

## Migrating from a Bitbns SDK to CCXT

| What you are doing | Bitbns SDK | CCXT |
| --- | --- | --- |
| Symbols | `'BTC'`, `'XRPUSDT'` | `'BTC/INR'`, `'XRP/USDT'` |
| Market list | ticker payload keys | `load_markets()` |
| Ticker | `fetchTickers()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `getBuyOrderBook()` / `getSellOrderBook()` | `fetch_order_book()` |
| Buy | `placeBuyOrder()` | `create_order(symbol, 'limit', 'buy', ...)` |
| Sell | `placeSellOrder()` | `create_order(symbol, 'limit', 'sell', ...)` |
| Stop-loss | stop-loss buy/sell methods | `create_order(..., params={'triggerPrice': ...})` |
| Cancel | cancel-order method (INR / USDT variants) | `cancel_order()` |
| Open orders | `listOpenOrders()` | `fetch_open_orders()` |
| Order status | order-status method | `fetch_order()` |
| Balance | `currentCoinBalance()` | `fetch_balance()` |
| My trades | trade-history method | `fetch_my_trades()` |
| Deposit address | `getCoinAddress()` | `fetch_deposit_address()` |
| Deposits / withdrawals | history methods | `fetch_deposits()` / `fetch_withdrawals()` |
| Streams | `getOrderBookSocket()` / `getTickerSocket()` | not available in CCXT for `bitbns` |
| Anything not listed | native method | the same endpoint as an [implicit method](/docs/exchanges/bitbns/implicit-api) |

## FAQ

**Does CCXT support Bitbns WebSockets?**
No. CCXT's `bitbns` class implements REST only — there are no `watch*` methods for this venue. CCXT Pro covers 76 of the 104 supported exchanges; Bitbns is not one of them. For live streams from Bitbns today, use the official `bitbnspy` socket helpers.

**How do Bitbns INR and USDT markets work in CCXT?**
Both are ordinary unified symbols — `'BTC/INR'` and `'BTC/USDT'`. CCXT reads the quote currency from the market and routes to the correct endpoint, which differs between INR and USDT pairs on several operations. You never write that branch yourself.

**Does `setSandboxMode` work for Bitbns?**
No. CCXT's `bitbns` class does not declare sandbox URLs, so test with small orders on a low-balance key instead.

**Which Bitbns Python package is current?**
The `bitbnspy` repository is the one Bitbns points at; the older `python-bitbns-api` README says to use Bitbnspy instead. `bitbnspy` is MIT-licensed, and its most recent PyPI release, 0.3.1, was published in July 2022.

**Can I still call Bitbns-specific endpoints from CCXT?**
Yes — all 36 endpoints CCXT models are available as [implicit methods](/docs/exchanges/bitbns/implicit-api), with signing and rate limiting applied.

**Is CCXT free?**
Yes. MIT-licensed.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bitbns unified API reference](/docs/exchanges/bitbns)
- [bitbns implicit API](/docs/exchanges/bitbns/implicit-api) — every raw endpoint
- [Supported exchanges](/docs/exchange-markets)
- [More comparisons](/docs/comparisons)
