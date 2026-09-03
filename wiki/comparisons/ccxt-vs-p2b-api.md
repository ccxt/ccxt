<!-- title: CCXT vs the P2B API and the official PHP client -->
<!-- description: P2B publishes one PHP client, last touched in 2022. Compare it and the raw P2B API with CCXT on languages, streaming, nonce handling, rate limits and error types. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: P2B's only official client is a four-commit PHP library from 2022 that requires PHP 7.2. CCXT covers the same v2 API in seven languages, with six streaming methods and a rate limiter tuned to P2B's documented 10 requests per second. -->
<!-- weight: 100 -->

# CCXT vs the P2B API and the official PHP client

[P2B](https://p2pb2b.com/) (formerly p2pb2b) is a spot exchange with a small, well-documented v2 REST API and a public WebSocket feed. Its documentation lives in a single markdown file at [`P2B-team/p2b-api-docs`](https://github.com/P2B-team/p2b-api-docs), with the socket protocol in a companion repository.

P2B publishes exactly one client library: [`P2B-team/php-p2b-api`](https://github.com/P2B-team/php-p2b-api). It is PHP only, MIT-licensed, four commits, three stars, last committed in October 2022, and its `composer.json` requires `php: ^7.2` and `guzzlehttp/guzzle: ^6.0`. There is no Python, JavaScript, Go, C# or Java client.

[CCXT](/docs/manual) speaks the same v2 API behind method names shared with 103 other venues. The question: **is a PHP-only wrapper enough, or do you want P2B in the language you actually write, with streaming and a rate limiter?**

## TL;DR

- **Pick the official PHP client** if you are writing PHP, you only need a few endpoints, and you would rather vendor a 200-line wrapper than a general-purpose library — with the caveat that it targets PHP 7.2 and Guzzle 6.
- **Pick CCXT** if you want P2B in any of seven languages, with 22 unified capabilities, six streaming methods, typed errors and a throttler set to P2B's own documented limit of 10 requests per second.
- **Nothing is hidden either way.** All 18 P2B endpoints are generated as [implicit methods](/docs/exchanges/p2b/implicit-api) in CCXT, signed and rate-limited, so the unified API is not a ceiling.

## At a glance

| | **CCXT** | **`php-p2b-api`** |
| --- | --- | --- |
| Exchanges covered | 104 (P2B is one of them) | P2B only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | PHP only (`php: ^7.2`, `guzzlehttp/guzzle: ^6.0`) |
| Distribution | `pip install ccxt`, `npm install ccxt`, … | clone the repository (its `composer.json` names it `p2pb2b/php-p2pb2b-api`) |
| Repository activity | continuous releases | 4 commits, last in October 2022 |
| Unified market data + trading API | yes — same method names across every exchange | no — P2B's own request/response shapes |
| Unified capabilities implemented | 22 for `p2b`, of which 11 are `fetch*` | the documented endpoints, returned as raw JSON |
| Symbols | `'BTC/USDT'` | `'ETH_BTC'` |
| WebSockets | yes — `watchOrderBook`, `watchTrades`, `watchTradesForSymbols`, `watchTicker`, `watchTickers`, `watchOHLCV` | none |
| Raw endpoint access | yes — 18 endpoints as implicit methods | it is all raw |
| Built-in rate limiter | yes, on by default (`rateLimit` 100 ms = the documented 10 req/s) | not a documented feature |
| Nonce handling | generated per request | generated per request |
| Unified error types | yes — 41 typed exceptions in one hierarchy | an `Exceptions` folder; error codes documented separately |
| Testnet / sandbox | none — P2B publishes no sandbox | none |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `php-p2b-api` 3 GitHub stars; the docs repository has 18 |
| Licence | MIT | MIT (declared in `composer.json`) |
| Support | Discord, Telegram, GitHub — usually same-day | GitHub issues, P2B support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `P2B-team/php-p2b-api` repository (README, `composer.json`, commit history) and P2B's `api-doc.md` and WebSocket documentation.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.p2b()
ticker = exchange.fetch_ticker('BTC/USDT')
print(ticker['last'], ticker['baseVolume'])
```

#### **php-p2b-api**

```php
<?php

require_once '../Api.php';
require_once '../vendor/autoload.php';

$api = new P2pb2b\Api();

$market = 'ETH_BTC';

$response = $api->ticker($market);
print_r($response . PHP_EOL);
```

<!-- tabs:end -->

The PHP client returns P2B's raw JSON as a string. CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — the same keys, types and units you get from Kraken or Binance — with `ETH_BTC` translated to and from `'ETH/BTC'`.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.p2b({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDT', 'limit', 'sell', 0.001, 100000)
print(order['id'], order['status'])
```

#### **php-p2b-api**

```php
<?php

require_once '../Api.php';
require_once '../vendor/autoload.php';

$api = new P2pb2b\Api();

$market = 'ETH_BTC';
$side = 'sell';
$amount = '0.001';
$price = '100000.00';

$response = $api->createOrder($market, $side, $amount, $price);
print_r($response . PHP_EOL);
```

<!-- tabs:end -->

Both sides implement the same signing scheme, and it is a slightly unusual one: the request body — including a `request` field holding the endpoint path and a `nonce` — is JSON-encoded, then base64-encoded into `X-TXC-PAYLOAD`, and that base64 string is signed with HMAC-SHA512 into `X-TXC-SIGNATURE`, alongside `X-TXC-APIKEY`. P2B's documentation adds a constraint that catches people: the nonce must be a millisecond timestamp, and **repeated nonces within the last one second are rejected**. CCXT generates a monotonic nonce for every request, so a burst of orders does not collide.

CCXT also returns a [unified order structure](/docs/manual#order-structure) with `id`, `status`, `filled`, `remaining` and `average` normalised, rather than P2B's raw payload.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.p2b()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Raw WebSocket**

```python
import asyncio, json, websockets

async def main():
    # php-p2b-api has no WebSocket support — this is the raw protocol
    async with websockets.connect('wss://apiws.p2pb2b.com/') as ws:
        await ws.send(json.dumps({
            'method': 'depth.subscribe',
            'params': ['BTC_USDT', 100, '0.001'],
            'id': 1,
        }))
        # the server closes an idle connection after 100 seconds,
        # so you also need a server.ping loop and a reconnect path
        async for message in ws:
            print(json.loads(message))

asyncio.run(main())
```

<!-- tabs:end -->

P2B's socket protocol is JSON-RPC shaped: `{"method": ..., "params": [...], "id": ...}`, with channels for depth, last price, klines, market status and deals. The documentation states plainly that "Connection will be closed by server in cause of inactivity after 100 seconds", so a keep-alive is not optional.

CCXT implements six streaming methods for `p2b` — `watchOrderBook`, `watchTrades`, `watchTradesForSymbols`, `watchTicker`, `watchTickers` and `watchOHLCV` — with the ping loop, reconnect, resubscribe and order-book merging handled underneath. `watch_order_book` returns the same [order book structure](/docs/manual#order-book-structure) as `fetch_order_book`. P2B's socket carries public data only, so there are no private streams on either side.

## Where the differences actually bite

### Seven languages, one API

This is the main event for P2B. The only official client is PHP; CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java with identical method names and return structures.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.p2b()
ticker = exchange.fetch_ticker('BTC/USDT')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.p2b ();
const ticker = await exchange.fetchTicker ('BTC/USDT');
```

#### **PHP**

```php
$exchange = new \ccxt\p2b();
$ticker = $exchange->fetch_ticker('BTC/USDT');
```

#### **Go**

```go
exchange := ccxt.NewP2b(nil)
ticker, err := exchange.FetchTicker("BTC/USDT")
```

<!-- tabs:end -->

Note the PHP row: choosing CCXT does not cost you PHP support. It costs you PHP 7.2 pinning.

### Rate limits you do not have to model

P2B's documentation states: "The number of user requests to the endpoints of the protected API is limited. Not more than 10 requests per second." CCXT's `rateLimit` for `p2b` is 100 ms — exactly that limit — and the token-bucket throttler is on by default (`enableRateLimit = true`). You call methods in a loop and the library paces them. The PHP client documents no throttler; pacing and back-off on a rejection are your code.

### One error hierarchy

CCXT maps P2B's error responses onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. You write `except ccxt.InsufficientFunds` once and it keeps working when you add a second exchange, instead of matching on codes from P2B's `errors.md`.

### Precision, rounding and string math

`load_markets()` pulls P2B's per-market trading rules and exposes them through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities never drift through float rounding into a rejected order:

```python
amount = exchange.amount_to_precision('BTC/USDT', 0.0012345678)
price = exchange.price_to_precision('BTC/USDT', 61234.56789)
```

P2B's documentation notes that "Orders that do not pass market limits will not be created" — this is the code that stops that happening.

### Nothing is hidden — the implicit API

Alongside the 22 unified capabilities, **all 18 P2B endpoints are generated as callable implicit methods**, with signing, nonce generation, rate-limit accounting and error mapping applied:

```python
# any raw P2B endpoint, camelCased from its path
response = exchange.private_post_account_executed_history()
```

Browse them on the [p2b implicit API page](/docs/exchanges/p2b/implicit-api).

### Portability

CCXT's `p2b` is the same object shape as its `binance`, `kraken` and `okx` objects, so a long-tail listing venue does not need its own integration layer:

```python
for exchange_id in ['p2b', 'binance', 'kraken']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT')['last'])
```

## What the official PHP client does better

An honest list, because these are real:

- **It is first-party.** P2B wrote it, and the docs repository links to it as the client library. If P2B changes a payload, their own wrapper is the canonical reference for what the new shape is.
- **Field names match `api-doc.md` exactly.** `ETH_BTC`, `market`, `side`, `amount` — while you are reading P2B's documentation, that is a direct correspondence rather than a hop through CCXT's unified names.
- **Configuration is trivially simple.** Credentials come from a `.env` file, a `php-p2pb2b-api-config.json`, or the constructor — three lines and you are calling endpoints, with one worked example per endpoint in the `Examples` folder.
- **A far smaller dependency.** `Api.php` plus an `Exceptions` folder and Guzzle is a much smaller install and attack surface than a library covering 104 exchanges.
- **The examples are the documentation.** Eighteen example files, one per endpoint, is a genuinely fast way to learn a small API.
- **It wraps two endpoints CCXT's definition does not.** The PHP client exposes `cancelAllOrders()` and `accountAllExecutedHistory()`; CCXT's `p2b` definition contains neither, so those are not available as unified methods or as implicit ones. Cancelling a whole book through CCXT means iterating `fetch_open_orders()`.

If you are writing PHP against a PHP 7-era stack, need three or four endpoints, and no streaming, the official client is the smaller and more direct route.

## Migrating from `php-p2b-api` to CCXT

| What you are doing | `php-p2b-api` | CCXT |
| --- | --- | --- |
| Symbols | `'ETH_BTC'` | `'ETH/BTC'` |
| Client | `new P2pb2b\Api($apiKey, $secret)` | `ccxt.p2b({'apiKey': ..., 'secret': ...})` |
| Markets | `markets()` / `market()` | `load_markets()` |
| Ticker | `ticker()` / `tickers()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `book()` / `depth()` | `fetch_order_book()` |
| Candles | `kline()` | `fetch_ohlcv()` |
| Public trades | `history()` | `fetch_trades()` |
| New order | `createOrder()` | `create_order()` |
| Cancel order | `cancelOrder()` | `cancel_order()` |
| Cancel all orders | `cancelAllOrders()` | **not available in CCXT for `p2b`** — iterate `fetch_open_orders()` |
| Open orders | `orders()` | `fetch_open_orders()` |
| Order history | `accountOrderHistory()` | `fetch_closed_orders()` |
| Trades for an order | `accountOrderDeals()` | `fetch_order_trades()` |
| Own trades | `accountExecutedHistory()` | `fetch_my_trades()` |
| Balance | `accountBalance()` / `accountBalances()` | `fetch_balance()` |
| Streams | not available | `watch_*` on `ccxt.pro.p2b` |
| Anything not listed | raw call | the same endpoint as an [implicit method](/docs/exchanges/p2b/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [p2b unified API reference](/docs/exchanges/p2b).

## FAQ

**Does P2B have an official Python or JavaScript SDK?**
No. The only client library P2B publishes is `P2B-team/php-p2b-api`, which is PHP-only and was last committed in October 2022. For every other language, CCXT is the maintained normalised implementation.

**Does CCXT support P2B WebSockets?**
Yes — six methods: `watchOrderBook`, `watchTrades`, `watchTradesForSymbols`, `watchTicker`, `watchTickers` and `watchOHLCV`, against `wss://apiws.p2pb2b.com/`. The official PHP client has no WebSocket support. P2B's socket carries public data only, so there are no private streams.

**How does P2B authentication work, and does CCXT handle it?**
Yes, fully. P2B signs by JSON-encoding the request body — with the endpoint path in a `request` field and a millisecond `nonce` — base64-encoding it into `X-TXC-PAYLOAD`, and signing that with HMAC-SHA512 into `X-TXC-SIGNATURE`, alongside `X-TXC-APIKEY`. CCXT builds all three headers and generates the nonce, which matters because P2B rejects repeated nonces within one second.

**What are P2B's rate limits?**
P2B's documentation states not more than 10 requests per second on the protected API. CCXT's default `rateLimit` for `p2b` is 100 ms, which is exactly that, and the throttler is on by default.

**Does P2B have a sandbox?**
No. P2B publishes no test environment, so `set_sandbox_mode(True)` has nothing to point at for this exchange. Test against CCXT's offline static fixtures and small live orders.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [p2b unified API reference](/docs/exchanges/p2b)
- [p2b implicit API](/docs/exchanges/p2b/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
