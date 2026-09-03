<!-- title: CCXT vs the Coinbase APIs and coinbase-advanced-py -->
<!-- description: Coinbase runs several trading APIs with separate SDKs and auth. Compare CCXT's three Coinbase clients against Coinbase's own on coverage, WebSockets and sandbox. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Coinbase's trading API is not one API. Advanced Trade, Exchange and International each have their own base URL, their own auth scheme and their own SDK — CCXT covers all three with the same method names. -->
<!-- weight: 30 -->

# CCXT vs the Coinbase APIs and coinbase-advanced-py

There is no such thing as "the Coinbase API". Coinbase runs several separate trading products — Advanced Trade, the older Coinbase App API, Coinbase Exchange, Coinbase International Exchange, Prime, Commerce — each with its own base URL, its own authentication scheme and, mostly, its own SDK.

[CCXT](/docs/manual) models that estate as three exchange ids: `coinbase` (Advanced Trade plus the App v2 endpoints), `coinbaseexchange` and `coinbaseinternational`. The same unified method names work on all three. The question that decides between CCXT and Coinbase's own SDKs is therefore sharper than usual: **how many Coinbase products do you touch, and are any of them not Coinbase?**

## TL;DR

- **Pick `coinbase-advanced-py`** if Advanced Trade is the only Coinbase product you use, you are in Python, and you want a first-party client that Coinbase updates alongside the API.
- **Pick CCXT** if you touch more than one Coinbase product, or are not in Python, or expect to add a non-Coinbase venue — because in CCXT `fetch_ticker` is `fetch_ticker` on all three Coinbase ids and on the other 101 exchanges.
- **The fragmentation is the real cost.** Advanced Trade authenticates with CDP JWTs (ES256 or EdDSA); Exchange and International authenticate with HMAC plus a passphrase. CCXT hides that difference; three SDKs do not.
- **Choosing CCXT does not hide anything.** 91 raw Advanced Trade and App endpoints, 82 Exchange endpoints and 35 International endpoints are callable as [implicit methods](/docs/exchanges/coinbase/implicit-api).

## At a glance

| | **CCXT** | **Coinbase's own SDKs** |
| --- | --- | --- |
| Exchanges covered | 104 | Coinbase products only |
| Coinbase products in one library | `coinbase` (Advanced Trade + App v2), `coinbaseexchange`, `coinbaseinternational` | one SDK per product, per language |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python (Advanced Trade), TypeScript, Java, Go — coverage differs per product |
| Packages to install | **1** (`ccxt`) | one per product line you use |
| Unified market data + trading API | yes — same method names across every exchange and every Coinbase product | no — each product's own shapes |
| WebSockets | yes — 12 `watch*` on `coinbase`, 10 on `coinbaseexchange`, 7 on `coinbaseinternational` | yes in `coinbase-advanced-py`; the sample TypeScript SDK documents REST only |
| Raw endpoint access | yes — 91 + 82 + 35 endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default | not a documented feature |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status + Coinbase error bodies |
| Sandbox | `set_sandbox_mode(True)` on `coinbaseexchange` and `coinbaseinternational` | per-product base URLs; Advanced Trade has no sandbox |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** (one package, every venue) | `coinbase-advanced-py` 357 stars · 264k PyPI installs/month; `advanced-sdk-ts` 51 stars, `advanced-sdk-java` 50, `advanced-trade-sdk-go` 37, `exchange-sdk-go` 9, `intx-sdk-go` 6 |
| Licence | MIT | `coinbase-advanced-py` Apache-2.0 |
| Support | Discord, Telegram, GitHub — usually same-day | GitHub issues, Coinbase developer channels |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `coinbase` and `coinbase-samples` GitHub organisations' repository listings, the `coinbase-advanced-py` repository and PyPI page, and install counts from npm and PyPI.</sub>

### What the SDK estate actually looks like

Read on the day this page was written, Coinbase's first-party client libraries are split by product **and** by language, and most of them are labelled samples:

- **Advanced Trade** — `coinbase/coinbase-advanced-py` (Apache-2.0, v1.8.4 released 19 June 2026, REST + WebSocket), plus `coinbase-samples/advanced-sdk-ts` (51 stars, "Sample TypeScript SDK", REST endpoints only), `advanced-sdk-java` (50 stars) and `advanced-trade-sdk-go` (37 stars).
- **Coinbase Exchange** — `coinbase-samples/exchange-sdk-go` (9 stars). Go only.
- **Coinbase International (INTX)** — `coinbase-samples/intx-sdk-go` (6 stars). Go only.
- **Prime** — five sample SDKs, of which the Go, Java, TypeScript and Python ones are archived; the .NET one is not.

So a Python service that trades Advanced Trade and reads Coinbase Exchange has a first-party client for one of those two and not the other. In CCXT it is `ccxt.coinbase()` and `ccxt.coinbaseexchange()`, and the calling code is the same.

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.coinbase()
ticker = exchange.fetch_ticker('BTC/USDC')
print(ticker['last'], ticker['baseVolume'])
```

#### **coinbase-advanced-py**

```python
from coinbase.rest import RESTClient

client = RESTClient()  # reads CDP key/secret from the environment
product = client.get_product("BTC-USD")
print(product.price)
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — the same keys, types and units on `coinbase`, `coinbaseexchange`, `coinbaseinternational` and every other venue. The SDK returns an Advanced Trade product object, which is a different shape from what the Exchange API returns for the same instrument.

### Place an order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.coinbase({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDC', 'limit', 'buy', 0.001, 60000)
print(order['id'], order['status'])
```

#### **coinbase-advanced-py**

```python
from coinbase.rest import RESTClient

client = RESTClient(api_key="...", api_secret="...")
order = client.market_order_buy(
    client_order_id="clientOrderId",
    product_id="BTC-USD",
    quote_size="1",
)
```

<!-- tabs:end -->

The SDK's helpers (`market_order_buy`, and its limit and stop siblings) encode Advanced Trade's `order_configuration` shapes for you, which is genuinely convenient. They are also Advanced-Trade-shaped: the same intent against Coinbase Exchange is a different call in a different package. CCXT's `create_order` has one signature across all three Coinbase ids and the other 101 exchanges, with venue-specific extras passed through `params`.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.coinbase()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDC')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **coinbase-advanced-py**

```python
from coinbase.websocket import WSClient

def on_message(msg):
    print(msg)

client = WSClient(api_key=api_key, api_secret=api_secret, on_message=on_message)
client.open()
client.subscribe(product_ids=["BTC-USD"], channels=["ticker"])
```

<!-- tabs:end -->

CCXT is **pull-shaped**: you `await` a method and get a merged, depth-limited order book back, so the streaming code reads like the REST code next to it. The SDK is **push-shaped**: you register a callback and parse raw channel messages, including the level-2 snapshot-and-delta bookkeeping if what you want is a book rather than a message feed.

## Where the differences actually bite

### Three products, three auth schemes, one client

This is the Coinbase-specific one. The three APIs do not authenticate the same way, and CCXT normalises the difference into `requiredCredentials`:

```python
adv   = ccxt.coinbase({'apiKey': '...', 'secret': '...'})                       # CDP JWT
exch  = ccxt.coinbaseexchange({'apiKey': '...', 'secret': '...', 'password': '...'})
intx  = ccxt.coinbaseinternational({'apiKey': '...', 'secret': '...', 'password': '...'})
```

Under the hood `coinbase` signs with a JWT (ES256 for ECDSA keys, EdDSA for Ed25519 ones), while `coinbaseexchange` and `coinbaseinternational` sign with HMAC-SHA256 and send `CB-ACCESS-PASSPHRASE`. Above the hood, all three answer to `fetch_ticker`, `fetch_order_book`, `fetch_ohlcv`, `create_order`, `cancel_order`, `fetch_open_orders` and `fetch_balance`.

### The `coinbase` id is not only Advanced Trade

CCXT's `coinbase` covers both API generations behind one client: the Advanced Trade v3 brokerage endpoints **and** the older Coinbase App v2 endpoints — accounts, addresses, transactions, buys, sells, deposits, withdrawals and payment methods. That is what most of the 91 implicit endpoints are. `coinbase-advanced-py` targets Advanced Trade; the App API is a separate integration.

It also covers more than spot: Coinbase's dated futures and perpetual instruments appear as unified symbols like `BTC/USD:USD-240426` and `ADA/USDC:USDC` alongside spot `BTC/USDC`.

### Sandbox where a sandbox exists

Coinbase Exchange and Coinbase International have sandbox environments; Advanced Trade does not. CCXT reflects that honestly rather than pretending otherwise:

```python
exchange = ccxt.coinbaseexchange({'apiKey': '...', 'secret': '...', 'password': '...'})
exchange.set_sandbox_mode(True)   # api-public.sandbox.exchange.coinbase.com
```

Calling `set_sandbox_mode(True)` on `ccxt.coinbase()` raises `NotSupported`, because there is nothing to point it at.

### WebSockets that look like REST

CCXT Pro is bundled in the same `ccxt` package — no separate purchase — and gives `coinbase` 12 streaming methods (`watchOrderBook`, `watchOrderBookForSymbols`, `watchTrades`, `watchTradesForSymbols`, `watchTicker`, `watchTickers`, `watchOrders` and their `unWatch*` counterparts), `coinbaseexchange` 10 including `watchMyTrades`, and `coinbaseinternational` 7 including `watchOHLCV` and `watchFundingRates`.

`watch_order_book` returns the same structure as `fetch_order_book`. Underneath, CCXT handles connection pooling per URL, ping/pong keep-alive, automatic reconnect and resubscribe, order-book sequencing and bounded caches — the parts that are tedious rather than hard, and quietly wrong when you get them slightly off.

### One error hierarchy

Three Coinbase products means three error-body conventions. CCXT maps all of them onto a single [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. You write the handler once.

### Precision, rounding and string math

CCXT loads each product's market metadata and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class, so quantities never drift through float rounding into a rejected order.

```python
amount = exchange.amount_to_precision('BTC/USDC', 0.0012345678)
price = exchange.price_to_precision('BTC/USDC', 61234.56789)
```

### Nothing is hidden — the implicit API

Alongside the **69 unified capabilities** CCXT implements for `coinbase` (42 for `coinbaseexchange`, 48 for `coinbaseinternational`), every endpoint is generated as a callable implicit method, with signing, rate limiting and error mapping applied:

```python
# any raw Advanced Trade endpoint, camelCased from its path
response = exchange.v3_public_get_brokerage_market_products()
```

Browse them on the [coinbase implicit API page](/docs/exchanges/coinbase/implicit-api).

## What Coinbase's own SDKs do better

An honest list, because these are real:

- **`coinbase-advanced-py` handles CDP key formats natively and first.** It supports both Ed25519 and ECDSA keys and builds the JWT for you, and it is the reference implementation Coinbase updates when Advanced Trade changes. When key formats or auth requirements move, they move there first.
- **Order helpers that mirror Advanced Trade's own model.** `market_order_buy`, `limit_order_gtc` and their siblings encode Coinbase's `order_configuration` structures directly, and the response objects use dot-notation access on Advanced-Trade-shaped fields. If you are reading Coinbase's reference while you write, the mapping is one-to-one.
- **First-party starting points in Go, Java and TypeScript.** `advanced-trade-sdk-go`, `advanced-sdk-java` and `advanced-sdk-ts` are Coinbase-authored, and the Exchange and INTX Go SDKs are the only first-party clients for those products at all.
- **CCXT does not cover every Coinbase product.** There is no CCXT id for Coinbase Prime or Coinbase Commerce. If your integration is a Prime custody workflow or a Commerce payment flow, Coinbase's own SDKs are not merely better — they are the option that exists.
- **The SDK's WebSocket client reconnects with exponential backoff.** That is documented behaviour in the README, not something you have to add.

If Advanced Trade in Python is the whole of your Coinbase integration and you have no plans for a second venue, `coinbase-advanced-py` is a sensible choice.

## Migrating from coinbase-advanced-py to CCXT

| What you are doing | coinbase-advanced-py | CCXT |
| --- | --- | --- |
| Symbols | `product_id="BTC-USD"` | `'BTC/USDC'` spot, `'ADA/USDC:USDC'` perpetual |
| Client | `RESTClient(api_key=..., api_secret=...)` | `ccxt.coinbase({'apiKey': ..., 'secret': ...})` |
| Products | `get_products()` | `load_markets()` |
| Ticker | `get_product()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `get_product_book()` | `fetch_order_book()` |
| Candles | `get_candles()` | `fetch_ohlcv()` |
| New order | `market_order_buy()` / `limit_order_gtc()` | `create_order()` |
| Cancel order | `cancel_orders()` | `cancel_order()` |
| Open orders | `list_orders()` | `fetch_open_orders()` |
| Balance | `get_accounts()` | `fetch_balance()` |
| Streams | `WSClient(...).subscribe(...)` | `watch_*` on `ccxt.pro.coinbase` |
| Coinbase Exchange | a different SDK | `ccxt.coinbaseexchange()`, same method names |
| Coinbase International | a different SDK | `ccxt.coinbaseinternational()`, same method names |
| Anything not listed | native method | the same endpoint as an [implicit method](/docs/exchanges/coinbase/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [coinbase unified API reference](/docs/exchanges/coinbase).

## FAQ

**Which CCXT exchange id is "Coinbase"?**
Three of them, because Coinbase runs three trading APIs. `coinbase` is Advanced Trade plus the older Coinbase App v2 endpoints. `coinbaseexchange` is the Coinbase Exchange API (the platform previously known as Coinbase Pro). `coinbaseinternational` is Coinbase International Exchange. All three expose the same unified methods.

**Does CCXT support Coinbase Advanced Trade CDP keys?**
Yes. `ccxt.coinbase` signs Advanced Trade requests with a JWT, using ES256 for ECDSA keys and EdDSA for Ed25519 keys. Pass the CDP key name as `apiKey` and the private key as `secret`.

**Is there a Coinbase sandbox in CCXT?**
For Coinbase Exchange and Coinbase International, yes — `set_sandbox_mode(True)` swaps in their sandbox hosts. Advanced Trade has no sandbox, so calling it on `ccxt.coinbase()` raises `NotSupported` rather than silently doing nothing.

**Does CCXT support Coinbase Prime or Coinbase Commerce?**
No. Those are separate Coinbase products with no CCXT id. Use Coinbase's own SDKs for them.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.coinbase` (or `ccxt.pro.coinbaseexchange` / `ccxt.pro.coinbaseinternational`) and call `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [coinbase unified API reference](/docs/exchanges/coinbase)
- [coinbase implicit API](/docs/exchanges/coinbase/implicit-api) — every raw endpoint
- [coinbaseexchange unified API reference](/docs/exchanges/coinbaseexchange)
- [coinbaseinternational unified API reference](/docs/exchanges/coinbaseinternational)
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
