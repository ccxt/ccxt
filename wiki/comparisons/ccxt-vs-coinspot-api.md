<!-- title: CCXT vs the CoinSpot API -->
<!-- description: CoinSpot's only official SDK is a Node package from 2014. CCXT versus the raw v2 REST API on signing, coverage, rate limits and portability. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: CoinSpot's official Node SDK predates its v2 API, so the real comparison is CCXT against the raw REST API. CCXT covers 9 unified capabilities and all 69 raw v1 and v2 endpoints — a deliberately small surface for a small API. -->
<!-- weight: 100 -->

# CCXT vs the CoinSpot API

[CoinSpot](https://www.coinspot.com.au) is an Australian exchange quoting everything against AUD. Its [API documentation](https://www.coinspot.com.au/api) says: "We currently have a node.js SDK, if you are interested in getting an SDK in another language Contact us." That SDK is [`coinspot-api`](https://www.npmjs.com/package/coinspot-api) on npm — MIT, version 0.1.20, last published in June 2014, and predating the [v2 API](https://www.coinspot.com.au/v2/api) that CoinSpot now recommends.

In practice that leaves two options: write against the raw v2 REST API, or use [CCXT](/docs/manual). The question that decides between them is whether AUD spot on CoinSpot is the whole job or one venue among several.

## TL;DR

- **Write against the raw API** if you need CoinSpot's instant buy/sell/swap quotes, order editing, bulk cancels or withdrawal endpoints — CCXT does not model those as unified methods, though it can call them.
- **Pick CCXT** if you want CoinSpot behind the same API you use for every other exchange, with signing, throttling and unified structures handled, in any of eight languages.
- **CCXT's CoinSpot surface is small on purpose** — 9 unified capabilities — but all 69 v1 and v2 endpoints are reachable as [implicit methods](/docs/exchanges/coinspot/implicit-api).

## At a glance

| | **CCXT** | **Raw CoinSpot API** |
| --- | --- | --- |
| Exchanges covered | 104 (CoinSpot is one of them) | CoinSpot only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | any; official SDK is Node only, last published June 2014 |
| Installable client library | yes — `ccxt` | `coinspot-api` on npm, v0.1.20, targets the v1 API |
| Unified market data + trading API | yes — 9 unified capabilities, 6 `fetch*` methods | CoinSpot's own request/response shapes |
| Endpoint coverage | 69 v1 and v2 endpoints as implicit methods | it is the whole product |
| WebSockets | none for CoinSpot — poll the `fetch*` methods | none documented |
| Built-in rate limiter | yes, on by default (`rateLimit` 1000ms) | you pace yourself under 1000 requests/minute |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus CoinSpot's `status` field |
| Testnet / sandbox | not available for CoinSpot | none documented |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `coinspot-api` 101 npm installs/month |
| Licence | MIT | MIT (the Node SDK) |
| Support | Discord, Telegram, GitHub issues — usually same-day | CoinSpot support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, CoinSpot's v1 and v2 API documentation, and npm registry metadata for `coinspot-api`.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.coinspot()
ticker = exchange.fetch_ticker('BTC/AUD')
print(ticker['bid'], ticker['ask'], ticker['last'])
```

#### **Raw CoinSpot API**

```python
import requests

r = requests.get('https://www.coinspot.com.au/pubapi/v2/latest/btc')
print(r.json()['prices'])   # {'bid': ..., 'ask': ..., 'last': ...}
```

<!-- tabs:end -->

The raw public call is short — CoinSpot's public API is GET-only and unsigned. CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) with the full key set and a portable `'BTC/AUD'` symbol instead of the `btc` coin type in a path segment.

### Place an order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.coinspot({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/AUD', 'limit', 'buy', 0.001, 90000)
print(order['id'])
```

#### **Raw CoinSpot API**

```python
import hashlib, hmac, json, time
import requests

KEY, SECRET = '...', '...'
body = json.dumps({
    'nonce': int(time.time() * 1000),   # must always increase
    'cointype': 'btc', 'amount': 0.001, 'rate': 90000,
})
sign = hmac.new(SECRET.encode(), body.encode(), hashlib.sha512).hexdigest()

r = requests.post('https://www.coinspot.com.au/api/my/buy',
                  data=body, headers={
                      'Content-Type': 'application/json',
                      'key': KEY,
                      'sign': sign,
                  })
print(r.json())
```

<!-- tabs:end -->

Every authenticated CoinSpot call is a POST whose JSON body contains an always-increasing `nonce`, signed with HMAC-SHA512 and sent as the `sign` header alongside `key`. The nonce is the part that bites: two processes sharing one API key will race each other into authentication failures. CCXT implements the signer once and gives each exchange instance its own nonce sequence.

## Where the differences actually bite

### Rate limits you do not have to model

CoinSpot documents a flat **1000 requests per minute**. CCXT's throttler is on by default with `rateLimit = 1000`ms for this venue, so a naive loop paces itself instead of walking into a block. You do not have to write a limiter, and the same `enableRateLimit` switch behaves identically on every other exchange in your codebase.

### One error hierarchy

CoinSpot returns a `status` field in the response body rather than signalling failures purely through HTTP codes. CCXT maps those onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `AuthenticationError`, `RateLimitExceeded`, `NetworkError` and 36 more, all descending from `BaseError` — so failure handling looks the same here as it does on Binance.

### Precision and string math

CCXT exposes `amount_to_precision`, `price_to_precision` and `cost_to_precision` backed by the `Precise` string-arithmetic class, so AUD amounts and small crypto quantities do not drift through float rounding:

```python
amount = exchange.amount_to_precision('BTC/AUD', 0.0012345678)
price = exchange.price_to_precision('BTC/AUD', 90123.456789)
```

### Portability is the whole point

CoinSpot's request shape is unusual — POST-only private calls, a body-embedded nonce, coin types instead of pairs. Every one of those becomes a special case in code that also talks to other venues. In CCXT the venue is a variable:

```python
for exchange_id in ['coinspot', 'btcmarkets', 'independentreserve', 'kraken']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/AUD')['last'])
```

### Nothing is hidden — the implicit API

CCXT implements 9 unified capabilities for CoinSpot, but **all 69 endpoints in its API block are generated as callable implicit methods** — both the v1 group and the full v2 group, including the read-only (`ro/`) endpoints CoinSpot exposes for read-only API keys:

```python
response = exchange.v2PrivatePostRoMyBalances()
```

Browse them on the [CoinSpot implicit API page](/docs/exchanges/coinspot/implicit-api).

## What the raw CoinSpot API does better

Honest advantages, and here they are substantial:

- **The unified surface is genuinely small.** CCXT implements 9 capabilities for CoinSpot: `fetchTicker`, `fetchTickers`, `fetchOrderBook`, `fetchTrades`, `fetchMyTrades`, `fetchBalance`, `createOrder` and `cancelOrder`. There is no `fetchOHLCV`, no `fetchOrder`, no `fetchOpenOrders`, no unified deposit or withdrawal methods, and `create_order()` accepts limit orders only. Calling the endpoint directly is less indirect for anything on that list.
- **Instant buy/sell/swap and order editing have no unified equivalent.** CoinSpot's v2 API exposes `quote/buy/now`, `quote/sell/now`, `quote/swap/now`, `my/buy/edit`, `my/sell/edit` and bulk cancel endpoints. CCXT can call them as implicit methods, but there is no unified wrapper — no parsed order structure, no cross-venue behaviour.
- **CCXT's CoinSpot market list is a static table.** The class hardcodes its AUD markets rather than fetching them, so a newly listed coin is not tradeable through the unified API until CCXT is updated. Calling `/pubapi/v2/latest` directly always reflects what CoinSpot actually lists today.
- **Zero dependencies.** The raw signer is about fifteen lines. For a single-venue script that reads a price and places an order, that may be the whole integration.

If CoinSpot is your only venue and you need its instant-order or withdrawal endpoints, going direct is the sensible choice.

## Migrating from the raw CoinSpot API to CCXT

| What you are doing | Raw CoinSpot API | CCXT |
| --- | --- | --- |
| Symbols | `cointype` such as `'btc'` | `'BTC/AUD'` |
| Latest prices | `GET /pubapi/v2/latest` | `fetch_tickers()` |
| One coin's price | `GET /pubapi/v2/latest/{cointype}` | `fetch_ticker()` |
| Open orders on the book | `GET /pubapi/v2/orders/open/{cointype}` | `fetch_order_book()` |
| Completed public trades | `GET /pubapi/v2/orders/completed/{cointype}` | `fetch_trades()` |
| Balances | `POST /api/v2/ro/my/balances` | `fetch_balance()` |
| New order | `POST /api/my/buy` or `my/sell` | `create_order()` (limit only) |
| Cancel order | `POST /api/my/buy/cancel` or `my/sell/cancel` | `cancel_order()` |
| My transactions | `POST /api/ro/my/transactions` | `fetch_my_trades()` |
| Streams | none — CoinSpot documents no WebSocket | none — poll `fetch*` |
| Anything not listed | the endpoint URL | the same endpoint as an [implicit method](/docs/exchanges/coinspot/implicit-api) |

## FAQ

**Does CoinSpot have an official Python SDK?**
No. CoinSpot's documentation points to one SDK, for Node.js — the `coinspot-api` npm package, whose latest version 0.1.20 was published in June 2014, before CoinSpot's v2 API existed. For Python, PHP, Go, C# or Java, CCXT is the maintained option.

**Does CCXT support CoinSpot over WebSocket?**
No. CCXT implements zero `watch*` methods for `coinspot`, and CoinSpot's own documentation describes no WebSocket API — every documented call is HTTP. Use `fetch*` methods and poll.

**How does CoinSpot authenticate API requests?**
Private endpoints are POST-only. The JSON body carries an always-increasing `nonce`, and the whole body is signed with HMAC-SHA512 using your secret; the digest goes in the `sign` header alongside `key`. CoinSpot also offers read-only API keys, whose endpoints live under the `ro/` prefix. CCXT implements the signer and includes the read-only endpoints in its API block.

**Which CoinSpot markets can I trade through CCXT?**
CCXT's `coinspot` class carries a static list of AUD-quoted markets — `'BTC/AUD'`, `'ETH/AUD'`, `'USDT/AUD'`, `'XRP/AUD'` and others. Call `load_markets()` and read the keys rather than assuming a pair exists; a very recently listed coin may not be in the table yet.

**Can I still call CoinSpot-specific endpoints through CCXT?**
Yes — all 69 endpoints across the v1 and v2 groups are generated as [implicit methods](/docs/exchanges/coinspot/implicit-api), with signing and throttling applied. That includes instant buy/sell/swap quotes and the read-only endpoints.

**Is CCXT free?**
Yes. MIT-licensed.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [coinspot unified API reference](/docs/exchanges/coinspot)
- [coinspot implicit API](/docs/exchanges/coinspot/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
