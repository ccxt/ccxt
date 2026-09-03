<!-- title: CCXT vs the Lighter API and official Lighter SDK -->
<!-- description: Lighter is a zk-rollup perp DEX where every order is a signed transaction. CCXT's lighter class compared with the official Python and Go SDKs on signing and coverage. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Lighter orders are signed zk transactions, so both CCXT and the official SDK call the same native signer binary. CCXT adds 53 unified capabilities, 18 watch* methods and seven languages on top of it. -->
<!-- weight: 100 -->

# CCXT vs the Lighter API and official Lighter SDK

[Lighter](https://lighter.xyz/) is a zk-rollup perpetuals exchange. Its API is not a normal REST trading API: reads are ordinary HTTP, but every write — an order, a cancel, an auth token — is a **signed transaction**, and the signing scheme is implemented in a native library rather than in the client language.

Lighter publishes two official SDKs, [`elliottech/lighter-python`](https://github.com/elliottech/lighter-python) (Apache-2.0, 326 GitHub stars) and [`elliottech/lighter-go`](https://github.com/elliottech/lighter-go) (Apache-2.0, 87 stars). [CCXT](/docs/manual) speaks the same API behind method names shared with 104 other venues.

Because both sides call the same signer, the question is narrower than usual: **do you want Lighter's own client shapes, or Lighter behind the same interface as every other venue you trade?**

## TL;DR

- **Pick the official SDK** if Lighter is your only venue and you want zero setup around the signer — `lighter-python` ships the native binaries and picks the right one for your platform automatically.
- **Pick CCXT** if Lighter is one venue among several, or if you are in a language Lighter does not publish an SDK for — CCXT gives it 53 unified capabilities and 18 `watch*`/`unWatch*` streaming methods, in seven languages.
- **The signer is the same code either way.** CCXT loads the officially distributed signer binary (or a WASM build of it), so the trade-off is about API shape and portability, not about cryptography.

## At a glance

| | **CCXT** | **Official Lighter SDKs** |
| --- | --- | --- |
| Exchanges covered | 104 (Lighter is one of them) | Lighter only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python and Go |
| Signer setup | point `options['libraryPath']` at the official binary; nothing needed in Go | automatic — the Python SDK selects the right native binary for your platform |
| Unified capabilities | 53, of which 19 are `fetch*` | n/a — Lighter's own shapes |
| Symbols | `'ETH/USDC:USDC'` | market index / order-book id |
| WebSockets | yes — 18 `watch*` / `unWatch*` methods | yes, in `lighter-python`; not in `lighter-go` |
| Raw endpoint access | yes — 46 endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 1000 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status + Lighter codes |
| Testnet | `exchange.set_sandbox_mode(True)` | separate base URL |
| Licence | MIT | Apache-2.0 |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `lighter-python` 326 stars; `lighter-go` 87 stars |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}} and Lighter's two published SDK repositories and API documentation.</sub>

## Setting up the signer

This is the one thing that is different from every other CCXT exchange, so it is worth being explicit. CCXT needs your **L1 private key** as a credential, and a path to the officially distributed signer:

<!-- tabs:start -->

#### **Python / C# / PHP**

```python
import ccxt

exchange = ccxt.lighter({
    'privateKey': '0x...',                       # your L1 private key
    'options': {
        # from https://github.com/elliottech/lighter-python/tree/main/lighter/signers
        'libraryPath': 'path/to/lighter-signer-linux-arm64.so',
    },
})
```

#### **JavaScript / TypeScript**

```javascript
import ccxt from 'ccxt';

const exchange = new ccxt.lighter ({
    privateKey: '0x...',
    options: {
        // from https://github.com/ccxt/lighter-wasm
        libraryPath: '/path/to/lighter-wasm/lighter.wasm',
        wasmExecPath: '/opt/homebrew/opt/go/libexec/lib/wasm/wasm_exec.js',
    },
});
```

#### **Go**

```go
// Nothing extra: CCXT consumes the official Go package.
exchange := ccxt.NewLighter(map[string]interface{}{
    "privateKey": "0x...",
})
```

<!-- tabs:end -->

`accountIndex` and `apiKeyIndex` are optional — CCXT fetches the account index from your address if you do not set one, and defaults the API key index to 254. Set `accountIndex` explicitly when you trade a sub-account. The full setup notes are in the [FAQ](/docs/faq).

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.lighter()
ticker = exchange.fetch_ticker('ETH/USDC:USDC')
print(ticker['last'], ticker['markPrice'])
```

#### **lighter-python**

```python
import asyncio
import lighter

async def main():
    client = lighter.ApiClient()
    order_api = lighter.OrderApi(client)
    stats = await order_api.exchange_stats()
    print(stats)

asyncio.run(main())
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) keyed by unified symbol. The SDK returns Lighter's own models, generated from its OpenAPI spec, indexed by market id.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.lighter({'privateKey': '0x...',
                         'options': {'libraryPath': '.../lighter-signer-linux-arm64.so'}})
order = exchange.create_order('ETH/USDC:USDC', 'limit', 'buy', 0.05, 3000)
print(order['id'], order['status'])
```

#### **lighter-python**

```python
# SignerClient wraps the native signer; every order is a signed transaction
tx, tx_hash, err = await client.create_order(
    market_index=market_index,
    client_order_index=123,
    base_amount=1000,
    price=4050_00,
    is_ask=True,
    order_type=client.ORDER_TYPE_LIMIT,
    time_in_force=client.ORDER_TIME_IN_FORCE_GOOD_TILL_TIME,
    reduce_only=False,
    trigger_price=0,
    nonce=nonce,
    api_key_index=api_key_index,
)
```

<!-- tabs:end -->

The SDK works in Lighter's own units: market index, integer base amount, integer price, `is_ask` instead of a side. CCXT takes a unified symbol, a human amount and a human price, converts them with the market's precision, builds the transaction, signs it, and returns a [unified order structure](/docs/manual#order-structure).

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.lighter()
    while True:
        orderbook = await exchange.watch_order_book('ETH/USDC:USDC')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **lighter-python**

```python
import lighter

# examples/websocket/ws.py in the SDK
client = lighter.WsClient(
    order_book_ids=[0, 1],
    account_ids=[1, 2],
    on_order_book_update=on_order_book_update,
    on_account_update=on_account_update,
)
client.run()
```

<!-- tabs:end -->

Both stream. The difference is the shape: the SDK is callback-driven and hands you Lighter's messages; CCXT's `watch_order_book` returns the same structure as `fetch_order_book`, so a polling loop becomes a streaming loop by changing one word and nothing downstream changes.

CCXT implements 18 streaming methods for Lighter: `watchOrderBook`, `watchTrades`, `watchTicker`, `watchTickers`, `watchMarkPrice`, `watchMarkPrices`, `watchOrders`, `watchMyTrades`, `watchBalance`, `watchLiquidations`, and eight matching `unWatch*` methods for tearing a subscription down without dropping the connection.

## Where the differences actually bite

### Seven languages against two

Lighter publishes Python and Go. CCXT gives you the same Lighter API in TypeScript, JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures, because it is written once in TypeScript and transpiled. If your execution service is C# or Java, CCXT is currently the way you reach Lighter with a maintained client.

Note the split: `lighter-python` has both HTTP and WebSocket support, while `lighter-go` is described by its own README as the reference implementation of signing and hashing plus a basic HTTP client — no WebSocket.

### Perp-specific concepts are unified, not bolted on

`fetch_positions`, `fetch_funding_rates`, `set_leverage`, `set_margin_mode`, `add_margin`, `reduce_margin`, `transfer` and `cancel_all_orders_after` are all part of the 53 capabilities — and they carry the same names on Hyperliquid, Bybit and OKX. A strategy written against CCXT's perp surface moves between DEX and CEX without a rewrite.

### Testnet without a second code path

Lighter runs a testnet on a parallel host. In CCXT that is one flag:

```python
exchange = ccxt.lighter({'privateKey': '0x...'})
exchange.set_sandbox_mode(True)
```

Every REST and WebSocket URL switches. No constant swapping.

### Rate limits and precision

CCXT's throttler is on by default with `rateLimit` set to 1000 ms for Lighter, matching its normal-account budget of 60 requests a minute. Order sizes and prices go through `amount_to_precision` and `price_to_precision`, backed by the `Precise` string-arithmetic class, so the integer amounts the chain expects are derived from the market metadata rather than from float maths you wrote.

### One error hierarchy

Lighter's numeric codes are mapped onto CCXT's [typed exception tree](/docs/manual#error-handling) — `InvalidOrder`, `BadRequest`, `RateLimitExceeded`, `NotSupported`, `ExchangeError` and 36 more, all under `BaseError`. The same `except` block works on the next venue.

### Nothing is hidden — the implicit API

Alongside the unified methods, **all 46 Lighter endpoints are generated as implicit methods**, with auth-token creation and rate-limit accounting applied. Browse them on the [lighter implicit API page](/docs/exchanges/lighter/implicit-api).

## What the official Lighter SDK does better

Genuinely, and these matter on this venue more than most:

- **Signer setup is automatic.** `lighter-python` bundles the native signer for Linux, macOS and Windows on both amd64 and arm64, and selects the right one at import time. CCXT asks you to download the binary (or the [WASM build](https://github.com/ccxt/lighter-wasm) in JavaScript, plus a `wasm_exec.js` path) and point `options['libraryPath']` at it. That is a real extra step, and in JavaScript it also means the signing path only runs under Node, not in a browser.
- **It is the reference implementation.** `lighter-go` *is* the signing and hashing spec; everything else, CCXT included, consumes binaries compiled from it. When the transaction format changes, that repository changes first.
- **Account and key lifecycle tooling.** The SDK's examples cover generating API keys, rotating them, and creating auth tokens for HTTP and WebSocket endpoints — the setup work that happens before any trading, and that is documented against the SDK rather than against a unified library.
- **Models generated one-for-one from the OpenAPI spec.** Every field Lighter returns is present under Lighter's own name, which is the shortest path when you are reading `apidocs.lighter.xyz` and want to know exactly what came back.

If Lighter is your only venue, you work in Python, and you want the smallest possible distance to the protocol, the official SDK is the better fit.

## Migrating from the Lighter SDK to CCXT

| What you are doing | Lighter SDK | CCXT |
| --- | --- | --- |
| Markets | `order_api.order_books()` | `load_markets()` |
| Symbols | market index / order-book id | `'ETH/USDC:USDC'` |
| Ticker | `order_api.exchange_stats()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `order_api.order_book_orders()` | `fetch_order_book()` |
| Candles | `candlesticks` endpoint | `fetch_ohlcv()` |
| New order | `SignerClient.create_order()` | `create_order()` |
| Modify order | `SignerClient.modify_order()` | `edit_order()` |
| Cancel order | `SignerClient.cancel_order()` | `cancel_order()` |
| Cancel all | `SignerClient.cancel_all_orders()` | `cancel_all_orders()` / `cancel_all_orders_after()` |
| Open orders | `order_api.account_active_orders()` | `fetch_open_orders()` |
| Positions | `account_api.account()` | `fetch_positions()` |
| Balance | `account_api.account()` | `fetch_balance()` |
| Streams | `WsClient` callbacks | `watch_*` on `ccxt.pro.lighter` |
| Anything not listed | the endpoint | the same endpoint as an [implicit method](/docs/exchanges/lighter/implicit-api) |

## FAQ

**How does CCXT authenticate with Lighter?**
With your **L1 private key**, set as the `privateKey` credential. CCXT derives your account index from it (or you set `options['accountIndex']` for a sub-account), defaults `apiKeyIndex` to 254, and signs every transaction and auth token with Lighter's official signer binary, which you point at with `options['libraryPath']`. Go users need no binary — CCXT consumes the official Go package directly.

**Why does CCXT need a signer binary at all?**
Because Lighter's transaction signing is a zk-friendly scheme implemented in Go, not something reproducible from generic HMAC or ECDSA helpers. Rather than reimplement it per language, CCXT calls the officially distributed binaries over FFI, or a WASM build of the same code in JavaScript and TypeScript. It is the same signing code the official SDK uses.

**Does CCXT support Lighter WebSockets?**
Yes — 18 methods, including `watch_order_book`, `watch_trades`, `watch_tickers`, `watch_mark_prices`, `watch_orders`, `watch_my_trades`, `watch_balance` and `watch_liquidations`, plus `unWatch*` counterparts. They return the same structures as the matching `fetch*` methods.

**Can I use Lighter's testnet through CCXT?**
Yes. `exchange.set_sandbox_mode(True)` swaps every REST and WebSocket URL to Lighter's testnet hosts.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.lighter` and call `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [FAQ — how to use Lighter in CCXT](/docs/faq) — credentials and signer setup
- [lighter unified API reference](/docs/exchanges/lighter)
- [lighter implicit API](/docs/exchanges/lighter/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
