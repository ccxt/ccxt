<!-- title: CCXT vs the Cryptomus API -->
<!-- description: Cryptomus is a payment gateway with a spot exchange attached. Compare its official PHP SDK and raw exchange API with CCXT on scope, signing, streaming and coverage. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Cryptomus's official PHP SDK covers payments and payouts, not trading — so its exchange API has no official client. CCXT covers the trading side with 13 unified capabilities and all 16 raw endpoints, but no WebSocket. -->
<!-- weight: 100 -->

# CCXT vs the Cryptomus API

[Cryptomus](https://cryptomus.com) is primarily a crypto payment platform. Its [documentation](https://doc.cryptomus.com/) covers merchant payments and invoices, static wallets, payouts and personal wallets — and, alongside those, a spot exchange with market data, order placement and WebSocket streams.

That split matters, because the official SDK follows the payments half. [`CryptomusCom/api-php-sdk`](https://github.com/CryptomusCom/api-php-sdk) — `cryptomus/api-php-sdk` on Packagist, MIT, version 1.0.0 released in July 2022, around 265,000 total and 10,900 monthly installs — exposes payments, payouts, balances and wallet management. It contains no order-placement methods at all.

So if you want to *trade* on Cryptomus, there is no official client library, and the question is whether you write one or use [CCXT](/docs/manual).

## TL;DR

- **Use the official PHP SDK** if your job is accepting crypto payments, issuing invoices or sending payouts. That is what it does, that is what Cryptomus is mostly for, and CCXT does not cover any of it.
- **Pick CCXT** if your job is spot trading on the Cryptomus exchange — order placement, balances, order books and trades — behind the same API you use on 103 other venues.
- **Know the limits up front.** CCXT's Cryptomus class is small: 13 unified capabilities, 16 raw endpoints, and **no WebSocket support** even though Cryptomus documents one.

## At a glance

| | **CCXT** | **Cryptomus's own tooling** |
| --- | --- | --- |
| What it covers | the spot exchange: markets, order book, trades, orders, balance | payments, invoices, static wallets, payouts, personal wallets — plus a documented exchange API |
| Official library | `ccxt`, installable in eight languages | `cryptomus/api-php-sdk` (PHP), payments and payouts only |
| Exchanges covered | 104 (Cryptomus is one of them) | Cryptomus only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | PHP for the SDK; any language against the raw API |
| Unified market data + trading API | yes — 13 unified capabilities, 10 `fetch*` methods | Cryptomus's own request/response shapes |
| Raw endpoint access | yes — 16 endpoints as implicit methods, including the payment and payout service listings | it is the whole product |
| WebSockets | **no** — CCXT implements no `watch*` methods for this venue | yes — token-authenticated socket with 7 stream types |
| Built-in rate limiter | yes, on by default (`rateLimit` 100ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus Cryptomus error payloads |
| Testnet / sandbox | not available for Cryptomus | none documented |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `cryptomus/api-php-sdk`: 8 GitHub stars · ~10.9k Packagist installs/month |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | Cryptomus documentation and support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the Cryptomus API documentation, the `CryptomusCom/api-php-sdk` repository and Packagist install counts.</sub>

## The same job, written both ways

### Fetch market prices

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.cryptomus()
tickers = exchange.fetch_tickers()
print(tickers['BTC/USDT']['last'])
```

#### **Raw Cryptomus API**

```python
import requests

r = requests.get('https://api.cryptomus.com/v1/exchange/market/tickers')
print(r.json())
```

<!-- tabs:end -->

Note the CCXT call: this venue has `fetchTickers` but not `fetchTicker`, so you fetch the set and index it. That is the unified API reporting what the venue actually offers rather than papering over it — `exchange.has['fetchTicker']` is falsy, and calling it raises `NotSupported` instead of failing quietly.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.cryptomus({'uid': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **Raw Cryptomus API**

```python
import base64, hashlib, json
import requests

USER_ID, API_KEY = '...', '...'
body = json.dumps({
    'market': 'BTC_USDT', 'direction': 'buy',
    'quantity': '0.001', 'price': '60000',
})
sign = hashlib.md5(
    (base64.b64encode(body.encode()).decode() + API_KEY).encode()).hexdigest()

r = requests.post('https://api.cryptomus.com/v2/user-api/exchange/orders',
                  data=body, headers={
                      'Content-Type': 'application/json',
                      'userId': USER_ID,
                      'sign': sign,
                  })
print(r.json())
```

<!-- tabs:end -->

Cryptomus signs by base64-encoding the JSON body, appending the API key, and MD5-hashing the result into a `sign` header alongside `userId`. It is short, but it is also unlike every other venue's scheme — which is the point: in CCXT it is `create_order(...)` here and `create_order(...)` on Binance, and the signer is somebody else's problem.

## Where the differences actually bite

### The exchange is one half of a payments product

Cryptomus's documented API spans merchant payments, invoices, static wallets, payouts, personal wallets *and* the exchange. CCXT models the exchange half — markets, currencies, order book, trades, orders, balance and trading fees. It does not model payments or payouts as unified methods, and it never will: those are not part of a trading API.

What CCXT does give you is reach. Its Cryptomus API block includes the payment-services, payout-services and transaction-list endpoints, so they are callable as implicit methods with signing applied even though no unified wrapper exists:

```python
services = exchange.privateGetV2UserApiPaymentServices()
```

### One error hierarchy

CCXT maps Cryptomus's error responses onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `RateLimitExceeded`, `NetworkError` and 35 more, all descending from `BaseError`. The `except` clauses you write here are the ones you already wrote for every other exchange.

### Precision and string math

CCXT loads Cryptomus market metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class, so quantities do not drift through float rounding before they reach the signature:

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

### Portability is the whole point

Cryptomus is unlikely to be the only venue in a trading system. Every venue-specific detail — MD5 over a base64 body, a `userId` header, `BTC_USDT` market ids, an order book addressed by currency pair in the path — becomes a special case in code that also talks elsewhere. In CCXT the venue is a variable:

```python
for exchange_id in ['cryptomus', 'binance', 'kucoin', 'gate']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_tickers()['BTC/USDT']['last'])
```

### Nothing is hidden — the implicit API

CCXT implements 13 unified capabilities for Cryptomus, and **all 16 endpoints in its API block are generated as callable implicit methods**, with the `userId`/`sign` scheme and throttling applied:

```python
book = exchange.publicGetV1ExchangeMarketOrderBookCurrencyPair({
    'currencyPair': 'BTC_USDT',
})
```

Browse them on the [Cryptomus implicit API page](/docs/exchanges/cryptomus/implicit-api).

## What Cryptomus's own API and SDK do better

Honest, and here the concessions are large:

- **Payments and payouts are the product, and CCXT does not touch them.** Invoices, static wallets, payment status callbacks, merchant payouts and personal wallet transfers all live in the official PHP SDK and the raw API. If that is your integration, CCXT is the wrong tool entirely.
- **The WebSocket is real, and CCXT has none for this venue.** Cryptomus documents a token-authenticated socket at `wss://api-ws.cryptomus.com/ws` carrying last price, depth, ticker, trades, orders, balances and deals — public *and* private streams. You fetch a one-time token that is valid for five minutes or until first connection, then ping every 50 seconds because the server closes idle connections after 60. CCXT implements zero `watch*` methods for Cryptomus, so live streaming means the raw socket.
- **The unified surface here is the smallest in this batch.** 13 capabilities and 16 endpoints, with no `fetchTicker` (only `fetchTickers`), no `fetchOHLCV`, and no unified deposit or withdrawal methods. Candles and transfer history mean calling the API directly.
- **The PHP SDK is genuinely widely used.** Around 265,000 total Packagist installs for a venue-specific package is real adoption, and it is maintained by Cryptomus itself.

If you are integrating Cryptomus as a payment processor, or you need its live streams, its own tooling is the right answer — and nothing stops you from using the PHP SDK for payments and CCXT for the trading side of the same account.

## Migrating from the raw Cryptomus exchange API to CCXT

| What you are doing | Raw Cryptomus API | CCXT |
| --- | --- | --- |
| Credentials | `userId` header + API key in the signature | `uid` and `secret` |
| Symbols | `'BTC_USDT'` | `'BTC/USDT'` |
| Markets | `GET /v2/user-api/exchange/markets` | `load_markets()` |
| Assets | `GET /v1/exchange/market/assets` | `fetch_currencies()` |
| Prices | `GET /v1/exchange/market/tickers` | `fetch_tickers()` |
| Order book | `GET /v1/exchange/market/order-book/{currencyPair}` | `fetch_order_book()` |
| Recent trades | `GET /v1/exchange/market/trades/{currencyPair}` | `fetch_trades()` |
| Limit order | `POST /v2/user-api/exchange/orders` | `create_order()` |
| Market order | `POST /v2/user-api/exchange/orders/market` | `create_order()` with type `'market'` |
| Cancel order | `DELETE /v2/user-api/exchange/orders/{orderId}` | `cancel_order()` |
| Active orders | `GET /v2/user-api/exchange/orders` | `fetch_open_orders()` |
| Order history | `GET /v2/user-api/exchange/orders/history` | `fetch_canceled_and_closed_orders()` |
| Balance | `GET /v2/user-api/exchange/account/balance` | `fetch_balance()` |
| Trading fees | `GET /v2/user-api/exchange/account/tariffs` | `fetch_trading_fees()` |
| Streams | `wss://api-ws.cryptomus.com/ws?token=...` | not available in CCXT for this venue |
| Payments and payouts | payment and payout endpoints | out of scope — use the official PHP SDK |

## FAQ

**Does Cryptomus have an official trading SDK?**
No. Cryptomus's official SDK is [`cryptomus/api-php-sdk`](https://github.com/CryptomusCom/api-php-sdk), and it covers merchant payments and payouts — creating payments and payouts, checking status, retrieving balances, managing wallets. It has no order-placement methods. For the exchange side, CCXT is the maintained client.

**Does CCXT support Cryptomus over WebSocket?**
No. CCXT implements zero `watch*` methods for `cryptomus`. Cryptomus itself documents a WebSocket at `wss://api-ws.cryptomus.com/ws` with public and private streams, authenticated by a single-use token that is valid for five minutes or until first connection, and requiring a ping roughly every 50 seconds. If you need those streams, use the socket directly.

**Can I use CCXT for Cryptomus payments or invoices?**
No. CCXT is a trading API — markets, orders, balances, transfers between exchange accounts. Merchant payments, invoices and payouts are a different product and are not modelled by any unified CCXT method. The payment-service and payout-service listing endpoints are reachable as implicit methods, but nothing more.

**Why does the CCXT Cryptomus constructor take `uid` instead of `apiKey`?**
Because Cryptomus identifies the account with a user id sent in the `userId` header and uses the API key only inside the signature. CCXT's class declares `uid` and `secret` as its required credentials to match.

**Why is there no `fetch_ticker` for Cryptomus?**
The venue exposes a tickers endpoint rather than a single-symbol one, so CCXT implements `fetchTickers` and leaves `fetchTicker` off. Check `exchange.has['fetchTicker']` at runtime — CCXT's `has` map reports what each venue actually supports rather than pretending.

**Is CCXT free?**
Yes. MIT-licensed.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [cryptomus unified API reference](/docs/exchanges/cryptomus)
- [cryptomus implicit API](/docs/exchanges/cryptomus/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
