<!-- title: CCXT vs the Nado API and the official Nado SDKs -->
<!-- description: Nado's own SDKs work in product ids, X18 prices and EIP-712 payloads. CCXT wraps the same venue in unified symbols, 63 capabilities and 24 streaming methods. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Nado's own SDKs expose the protocol as it really is — product ids, X18 fixed-point, EIP-712 payloads. CCXT hides all of that behind 63 unified capabilities and 24 streaming methods, in eight languages. -->
<!-- weight: 100 -->

# CCXT vs the Nado API and the official Nado SDKs

[Nado](https://www.nado.xyz/) is an orderbook DEX for perpetuals and spot, settling on Ink. It has no API keys: every private request is an [EIP-712](https://docs.nado.xyz/developer-resources/get-started/core-concepts) signature from your wallet, and accounts are `bytes32` subaccounts rather than user ids. Nado publishes three official SDKs — [TypeScript](https://github.com/nadohq/nado-typescript-sdk), [Python](https://github.com/nadohq/nado-python-sdk) and [Rust](https://crates.io/crates/nado-sdk) — plus a CLI and an MCP server.

So this is not a case of a venue with no client library. The question is narrower: **do you want the protocol's own vocabulary, or the same vocabulary you already use on every other exchange?**

## TL;DR

- **Pick a Nado SDK** if Nado is the system, not one venue in it — you are working with subaccounts, linked signers, NLP mint/burn, isolated positions and health groups, and you want the protocol's own types.
- **Pick CCXT** if Nado is one of several venues: 63 unified capabilities, 24 `watch*`/`unWatch*` streaming methods, unified symbols like `'BTC/USDT0:USDT0'` instead of numeric product ids, and the same code against 103 other exchanges.
- **CCXT still signs like Nado does.** It takes `walletAddress` and `privateKey`, builds the same EIP-712 `Order`, `Cancellation` and trigger payloads, and posts them to the same gateway — nothing is proxied or simplified away.

## At a glance

| | **CCXT** | **Official Nado SDKs** |
| --- | --- | --- |
| Exchanges covered | 104 (Nado is one of them) | Nado only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | TypeScript, Python, Rust |
| Packages to install | 1 (`ccxt`) | `@nadohq/client` + `viem` + `bignumber.js`, or `nado-protocol`, or `nado-sdk` |
| Unified market data + trading API | yes — same method names across every exchange | no — Nado's own protocol types |
| Nado capabilities implemented | 63 unified methods, 25 of them `fetch*` | full protocol surface, including NLP and linked signers |
| Symbols | `'BTC/USDT0:USDT0'` | numeric `product_id` |
| Order sizing | decimal amounts and prices | `priceX18`, base units, `to_x18()` helpers |
| WebSockets | yes — 24 `watch*`/`unWatch*` methods | subscription message builders; you own the socket |
| Raw endpoint access | yes — 14 Nado endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint costs, on by default | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | Nado's numeric `error_code` |
| Testnet | `exchange.set_sandbox_mode(True)` | `NadoClientMode` / `chainEnv` selection |
| Popularity | 43.8k GitHub stars · 4.7M PyPI + 494k npm installs/month (one package, every venue) | `@nadohq/client` 7.2k npm · `nado-protocol` 16k PyPI installs/month |
| Licence | MIT | ISC (TypeScript), MIT OR Apache-2.0 (Rust) |
| Support | Discord, Telegram, GitHub issues — usually same-day | Nado Telegram community, support tickets |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the Nado developer documentation and SDK repositories, and package metadata and install counts from npm, PyPI and crates.io.</sub>

## The same job, written both ways

### Fetch a market price

<!-- tabs:start -->

#### **CCXT**

```typescript
import ccxt from 'ccxt';

const exchange = new ccxt.nado ();
const ticker = await exchange.fetchTicker ('BTC/USDT0:USDT0');
console.log (ticker['last'], ticker['quoteVolume']);
```

#### **@nadohq/engine-client**

```typescript
import { EngineClient, ENGINE_CLIENT_ENDPOINTS } from '@nadohq/engine-client';
import { createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { ink } from 'viem/chains';

const walletClient = createWalletClient({
  account: privateKeyToAccount('0x...'),
  chain: ink,
  transport: http(),
});

const engine = new EngineClient({
  url: ENGINE_CLIENT_ENDPOINTS.inkMainnet,
  walletClient,
});

const price = await engine.getMarketPrice({ productId: 1 });
```

<!-- tabs:end -->

The Nado SDK wants a `viem` wallet client, a chain, an endpoint constant and a numeric `productId`. CCXT resolves `'BTC/USDT0:USDT0'` to Nado's `BTC-PERP_USDT0` ticker and its product id from `load_markets()`, and hands back a [unified ticker structure](/docs/manual#ticker-structure).

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.nado({
    'walletAddress': '0x...',
    'privateKey': '0x...',
})
order = exchange.create_order('BTC/USDT0:USDT0', 'limit', 'buy', 0.1, 10000)
print(order['id'], order['status'])
```

#### **nado-protocol**

```python
from nado_protocol.client import create_nado_client, NadoClientMode
from nado_protocol.engine_client.types.execute import (
    OrderParams, PlaceOrderParams, SubaccountParams)
from nado_protocol.utils.expiration import OrderType, get_expiration_timestamp
from nado_protocol.utils.math import to_pow_10, to_x18
from nado_protocol.utils.nonce import gen_order_nonce
from nado_protocol.utils.order import build_appendix

client = create_nado_client(NadoClientMode.DEVNET, "0x...")
owner = client.context.engine_client.signer.address
order = OrderParams(
    sender=SubaccountParams(subaccount_owner=owner, subaccount_name="default"),
    priceX18=to_x18(20000),
    amount=to_pow_10(1, 17),
    expiration=get_expiration_timestamp(40),
    nonce=gen_order_nonce(),
    appendix=build_appendix(order_type=OrderType.POST_ONLY),
)
res = client.market.place_order({"product_id": 1, "order": order})
```

<!-- tabs:end -->

Both end up posting the same signed payload to `POST /v1/execute`:

```json
{
  "place_order": {
    "product_id": 2,
    "order": {
      "sender": "0x123000000000000000000000000000000000012364656661756c740000000000",
      "priceX18": "10000000000000000000000",
      "amount": "100000000000000000",
      "expiration": "4294967295",
      "nonce": "1870132061784768512",
      "appendix": "1266640143977021441"
    },
    "signature": ""
  }
}
```

CCXT builds the `bytes32` sender from your wallet address and subaccount name, scales the price to X18 and the amount to base units, packs the order type into `appendix`, generates the nonce, and signs the EIP-712 `Order` struct with `secp256k1` — from five ordinary arguments.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.nado()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDT0:USDT0')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Nado subscriptions API**

```json
{
  "method": "subscribe",
  "stream": {
    "type": "book_depth",
    "product_id": 0
  },
  "id": 10
}
```

<!-- tabs:end -->

These are not the same thing. Nado's `book_depth` stream delivers **incremental depth diffs, batched roughly every 50 ms, containing only the changed price levels**. CCXT returns a **live, fully merged order book** with the same structure `fetch_order_book` returns.

| | CCXT | raw subscription |
| --- | --- | --- |
| Seed the book from a snapshot and align it with the diff stream | done for you | your code |
| Apply and prune incremental levels | done for you | your code |
| Send a ping frame every 30 seconds, as the docs require | done for you | your code |
| Negotiate `permessage-deflate`, which the endpoint requires | done for you | your code |
| Reconnect, re-subscribe and re-seed after a drop | done for you | your code |
| Keep a bounded, depth-limited cache | done for you | your code |

## Where the differences actually bite

### Unified symbols instead of product ids

Nado addresses markets by numeric `product_id`, and subaccounts by a 32-byte value that packs the owner address together with a padded subaccount name. Every SDK example carries that vocabulary. In CCXT the market is `'BTC/USDT0:USDT0'`, the subaccount is `options['subaccount']` (default `'default'`), and the encoding happens inside `load_markets()` and the order builder.

### No X18 arithmetic in your code

Prices go over the wire as `priceX18` — the price multiplied by 10^18 — and amounts in base units. Getting that wrong is a silent 10^18-factor bug, which is why the SDKs ship `to_x18()` and `to_pow_10()` helpers. CCXT takes decimal `amount` and `price`, applies the market's tick and step through `amount_to_precision` / `price_to_precision`, and does the scaling with the `Precise` string-arithmetic class so nothing routes through a float.

### WebSockets that look like REST

CCXT Pro is bundled in the same `ccxt` package and gives Nado **24 streaming methods**: `watchOrderBook`, `watchOrderBookForSymbols`, `watchTicker`, `watchTickers`, `watchTrades`, `watchTradesForSymbols`, `watchOHLCV`, `watchOHLCVForSymbols`, `watchBidsAsks`, `watchOrders`, `watchMyTrades`, `watchPositions`, and an `unWatch*` counterpart for each.

`watch_order_book` returns the same structure as `fetch_order_book`; `watch_orders` returns the same structure as `fetch_orders`. Swapping a polling loop for a stream changes one word. Nado's TypeScript SDK exposes `client.ws` as, in its own README's words, "WebSocket query, execute, and subscription message builders" — it builds the messages; the socket lifecycle, reconnects and book merging stay yours.

### Rate limits you do not have to model

Nado's limiter is weight-based and split across three buckets: IP addresses get 2400 weight per minute (400 per 10 seconds) for queries, wallet addresses get 600 per minute (100 per 10 seconds) for executes, order placement is capped separately — 600 per minute with spot leverage, 30 per minute without — and cancellations get their own 600 per minute. Individual queries carry weights from 1 to 20, and some are computed from your query parameters.

CCXT ships a token-bucket throttler that is on by default, with a 25 ms base `rateLimit` and per-endpoint costs, so a loop of calls paces itself instead of collecting 429s.

### One error hierarchy

Nado answers failures with `{"status": "failure", "error_code": 2007, "error": "..."}`. CCXT maps those codes onto a [typed exception tree](/docs/manual#error-handling): `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `PermissionDenied`, `RestrictedLocation`, `OnMaintenance`, `OperationRejected` and 33 more, all descending from `BaseError`. You catch `ccxt.InsufficientFunds` once and it keeps working on the next venue.

### Testnet without a second code path

```python
exchange = ccxt.nado({'walletAddress': '0x...', 'privateKey': '0x...'})
exchange.set_sandbox_mode(True)   # gateway/archive/trigger all move to *.test.nado.xyz
```

One flag swaps every REST and WebSocket host to Nado's testnet, including the archive indexer and the trigger service.

### The implicit API, and its honest limit

Every Nado endpoint is generated as a callable implicit method:

```python
symbols = exchange.gateway_public_get_symbols()
tickers = exchange.archivev2_public_get_tickers()
```

There are only 14 of them, and that is a property of the venue rather than of CCXT: Nado multiplexes almost everything through `POST /v1/execute` and `POST /v1/query`, so the interesting variation lives in the request body, not the path. Calling `gateway_private_post_execute` directly means constructing and signing the payload yourself. Browse the list on the [nado implicit API page](/docs/exchanges/nado/implicit-api).

## What the official Nado SDKs do better

An honest list, because these are real:

- **They cover protocol surface CCXT does not unify.** NLP mint and burn, `getMaxOrderSize`, `getMaxWithdrawable`, health groups, isolated positions, insurance, referrals and on-chain deposits are first-class methods in `@nadohq/client`. CCXT models the exchange-shaped subset — markets, orders, positions, balances, funding — because that is what has to look the same on 104 venues.
- **Linked signers and 1-Click Trading.** The SDKs expose `linkSigner` and `engine.setLinkedSigner()` for delegated signing. That is a Nado-specific account model with no unified CCXT equivalent.
- **They talk to the contracts, not just the API.** `@nadohq/client` composes a `viem` public and wallet client, so deposits, withdrawals and token allowances are in the same object as the trading calls. CCXT is an exchange-API library; on-chain calls are out of scope.
- **A Rust SDK written as Rust.** `nado-sdk` is on crates.io under MIT OR Apache-2.0, with an API shaped by the language. CCXT's Rust crate is generated from its TypeScript source, so for a latency-sensitive market maker who wants idiomatic Rust, `nado-sdk` is the closer fit.
- **They are the reference for new protocol features.** A new Nado product type appears in the first-party SDKs before it is modelled as a unified CCXT method.

If Nado is the venue you are building *on* rather than one of several you connect *to*, the official SDKs will fit better.

## Migrating from a Nado SDK to CCXT

| What you are doing | Nado SDK | CCXT |
| --- | --- | --- |
| Credentials | wallet private key / `viem` wallet client | `{'walletAddress': ..., 'privateKey': ...}` |
| Markets | `getAllMarkets()`, `getSymbols()` | `load_markets()` |
| Market identifier | numeric `product_id` | `'BTC/USDT0:USDT0'` |
| Subaccount | `bytes32` sender | `options['subaccount']`, default `'default'` |
| Price / amount | `priceX18`, base units | decimal `price`, `amount` |
| Ticker | archive `tickers` query | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `getMarketLiquidity()`, `orderbook` | `fetch_order_book()` |
| Candles | indexer candlesticks | `fetch_ohlcv()` |
| New order | `placeOrder()` / `place_order()` | `create_order()` |
| Amend | `cancelAndPlace()` | `edit_order()` |
| Cancel | `cancelOrders()`, `cancelProductOrders()` | `cancel_order()`, `cancel_orders()`, `cancel_all_orders()` |
| Open orders | `getSubaccountOrders()` | `fetch_open_orders()` |
| Balance | `getSubaccountSummary()` | `fetch_balance()` |
| Positions | `getIsolatedPositions()`, subaccount summary | `fetch_positions()` |
| Streams | subscription message builders | `watch_*` on `ccxt.pro.nado` |
| Anything not listed | native method | the same endpoint as an [implicit method](/docs/exchanges/nado/implicit-api) |

## FAQ

**Does CCXT support Nado WebSockets?**
Yes. CCXT implements 24 `watch*`/`unWatch*` methods for Nado, covering order books, tickers, trades, candles, best bid/ask, orders, own trades and positions. Use `ccxt.pro.nado` and `await exchange.watch_order_book('BTC/USDT0:USDT0')` — the order book comes back merged, not as raw depth diffs.

**How do I authenticate to Nado through CCXT — there are no API keys?**
You pass `walletAddress` and `privateKey` instead of `apiKey` and `secret`. CCXT builds the `bytes32` subaccount sender, constructs the EIP-712 typed data for orders, cancellations and trigger requests, and signs with `secp256k1` — the same scheme the official SDKs use.

**Does Nado have an official SDK?**
Yes, three: a TypeScript monorepo (`@nadohq/client` and friends, ISC), a Python SDK (`nado-protocol` on PyPI), and a Rust SDK (`nado-sdk` on crates.io, MIT OR Apache-2.0). There is also a CLI and an MCP server. This page compares against them, not against raw HTTP.

**Can I use Nado's testnet through CCXT?**
Yes. `exchange.set_sandbox_mode(True)` moves the gateway, archive and trigger hosts to their `*.test.nado.xyz` equivalents in one call, including the WebSocket endpoints.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.nado` and call `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [nado unified API reference](/docs/exchanges/nado)
- [nado implicit API](/docs/exchanges/nado/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [More comparisons](/docs/comparisons)
