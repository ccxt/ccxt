<!-- title: CCXT vs the Derive API and the official Derive SDKs -->
<!-- description: CCXT and derive-py compared on on-chain action signing, session keys, language coverage, streaming, RFQs and vaults, with the same tasks written both ways. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Derive ships maintained Python, TypeScript and Rust clients generated from its own specs. CCXT does the same on-chain action signing in eight languages, with 32 unified capabilities and 113 raw endpoints — but not RFQs or vaults. -->
<!-- weight: 100 -->

# CCXT vs the Derive API and the official Derive SDKs

[Derive](https://www.derive.xyz) (formerly Lyra) is a self-custodial options and perpetuals exchange: an off-chain order book whose state changes are settled on-chain, which means every order, transfer and withdrawal is a **signed action** rather than an authenticated HTTP request. You hold a wallet, you register a session key, and the exchange only settles what that key signed.

Two ways to talk to it: the official [`derive-py`](https://github.com/derivexyz/derive-py) (with siblings [`derive-ts`](https://github.com/derivexyz/derive-ts) and [`derive-rs`](https://github.com/derivexyz/derive-rs)), or [CCXT](/docs/manual), which performs the same action signing and exposes Derive behind the API it uses for 103 other venues.

The question that decides it: **do you need Derive's whole product surface — RFQs, vaults, session-key management — or the trading subset, portable across venues?**

## TL;DR

- **Pick `derive-py`** if Derive is your venue and you need the full protocol: RFQ maker and taker flows, vault operations, session-key lifecycle, on-chain deposits that create subaccounts, market-maker protection, and a `drv` command-line tool. It is generated from Derive's published OpenAPI and AsyncAPI specs, so its coverage is the whole RPC surface.
- **Pick CCXT** if you want Derive's perps, spot and options behind the same `create_order` you already use on Binance, Deribit and Hyperliquid — in eight languages, with the action hashing and secp256k1 signing done inside the library.
- **Signing is not the thing you give up.** CCXT takes `walletAddress` and `privateKey` as first-class credentials, builds the trade-module action hash and signs it itself, in Python, Go, C#, PHP, Java, JavaScript and TypeScript alike.

## At a glance

| | **CCXT** | **derive-py / derive-ts / derive-rs** |
| --- | --- | --- |
| Venues covered | 104 (Derive is one of them) | Derive only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | Python, TypeScript, Rust — separate codebases |
| Packages to install | 1 (`ccxt`) | 1 per language |
| Unified market data + trading API | yes — 32 unified capabilities, 19 `fetch*` methods | no — Derive's own RPC method names and payloads |
| Instrument addressing | unified symbols: `'BTC/USD:USDC'`, `'LBTC/USDC'`, `'BTC/USDC:USDC-261030-180000-C'` | `instrument_name`: `ETH-PERP`, `BTC-20261030-180000-C` |
| On-chain action signing | done for you from `walletAddress` + `privateKey` | done for you, from a session key |
| Session-key management | not modelled | yes — register, scope, edit, retire |
| RFQ maker/taker flows | not modelled | yes |
| Vaults | not modelled | yes |
| WebSockets | yes — 5 `watch*` methods, same shapes as `fetch*` | yes — callback subscriptions on `WebSocketClient` |
| Raw endpoint access | yes — 113 Derive endpoints as implicit methods | yes — `public_api` / `private_api`, generated from the specs |
| Built-in rate limiter | yes, on by default (`rateLimit` 50 ms) | `system.rate_limits` reports your current limits |
| Unified error types | yes — 41 typed exceptions in one hierarchy | Derive's numeric error codes |
| Command-line tool | `ccxt` CLI across all venues | `drv`, Derive-specific |
| Testnet | `exchange.set_sandbox_mode(True)` — swaps the host *and* the trade-module address | `DERIVE_ETH_CHAIN=SEPOLIA` |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `derivexyz/derive-py` repository and its README and examples, and the `derivexyz` GitHub organisation listing.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.derive()
ticker = exchange.fetch_ticker('ETH/USD:USDC')
print(ticker['last'], ticker['baseVolume'])
```

#### **derive-py**

```python
from derive_py import HTTPClient

client = HTTPClient.from_env()
ticker = client.markets.get_ticker(instrument_name="ETH-PERP")
print(ticker)
```

<!-- tabs:end -->

Derive names instruments `ETH-PERP`, `BTC-20261030-180000-C` and plain ERC-20 tickers for spot. CCXT maps those onto unified symbols — `'ETH/USD:USDC'` for the perpetual, `'BTC/USDC:USDC-261030-180000-C'` for the option, `'LBTC/USDC'` for spot — and returns a [unified ticker structure](/docs/manual#ticker-structure) with the same keys and units as every other venue.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.derive({
    'walletAddress': '0x...',   # the signer
    'privateKey': '0x...',      # session key or owner key
    'options': {'deriveWalletAddress': '0x...'},
})
order = exchange.create_order('ETH/USD:USDC', 'limit', 'buy', 0.1, 1000, {
    'subaccount_id': 130837,
    'max_fee': 100,
})
print(order['id'], order['status'])
```

#### **derive-py**

```python
from derive_py import HTTPClient
from derive_py.data_types import D, Direction, OrderType

client = HTTPClient.from_env()
client.connect()
order = client.orders.create(
    instrument_name="ETH-PERP",
    amount=D("0.1"),
    limit_price=D("1000"),
    direction=Direction.buy,
    order_type=OrderType.limit,
)
```

<!-- tabs:end -->

Both sign. `derive-py` reads `DERIVE_WALLET`, `DERIVE_SESSION_KEY` and `DERIVE_SUBACCOUNT_ID` from the environment and signs with the session key; CCXT takes the same two keys as constructor fields and asks for `subaccount_id` and `max_fee` in `params`, because Derive's trade module signs the maximum fee you accept as part of the action.

Underneath, CCXT ABI-encodes the trade-module data (asset address, sub-id, price, amount, max fee, subaccount, direction), keccak-hashes it, combines it with the action type hash, nonce, trade-module address and signature expiry, and produces the secp256k1 signature — then sends it with `X-LyraWallet`, `X-LyraTimestamp` and `X-LyraSignature` headers. None of that is your code, and it is the same code path in all eight CCXT languages.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.derive()
    while True:
        orderbook = await exchange.watch_order_book('ETH/USD:USDC')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **derive-py**

```python
import asyncio
from derive_py import WebSocketClient
from derive_py.data_types.channel_models import OrderbookSnapshot

async def main():
    client = WebSocketClient.from_env()
    await client.connect()
    def on_book(book: OrderbookSnapshot):
        print(book.bids[0], book.asks[0])
    await client.public_channels.orderbook_group_depth_by_instrument_name(
        instrument_name="ETH-PERP", group=1, depth=10, callback=on_book)
    await asyncio.sleep(60)
    await client.disconnect()

asyncio.run(main())
```

<!-- tabs:end -->

Both reconnect and resubscribe. They differ in shape: `derive-py` is callback-driven, and its own documentation is explicit that a reconnect leaves a hole — the subscriptions come back, the messages sent during the outage do not, and you have to re-read anything you assembled from the stream. CCXT is `await`-shaped: `watch_order_book` returns the same structure as `fetch_order_book`, and the library maintains the book across the drop, so a polling loop becomes a streaming loop by changing one word.

CCXT's five streaming methods for Derive are `watchTicker`, `watchTrades`, `watchOrderBook`, `watchOrders` and `watchMyTrades`, plus `unWatchTrades` and `unWatchOrderBook` to drop a subscription.

## Where the differences actually bite

### One API for perp DEXes and CEXes

Derive signs actions with a session key. Hyperliquid signs EIP-712 typed data. dYdX signs a Cosmos transaction. Binance signs an HMAC over a query string. Coinbase issues a JWT. Their symbols, order payloads, error codes and stream dialects have nothing in common. CCXT already absorbed that:

```python
for exchange_id, symbol in [('derive', 'BTC/USD:USDC'), ('hyperliquid', 'BTC/USDC:USDC'),
                            ('deribit', 'BTC/USD:BTC'), ('binance', 'BTC/USDT:USDT')]:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker(symbol)['last'])
```

Cross-venue options basis, DEX-versus-CEX hedges and volatility surfaces stitched from several exchanges stop being several integrations with a translation layer between them.

### Eight languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go, Java and Rust, with identical method names, arguments and return structures — including the signing.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.derive ({ walletAddress: '0x...', privateKey: '0x...' });
const ticker = await exchange.fetchTicker ('ETH/USD:USDC');
```

#### **Python**

```python
import ccxt
exchange = ccxt.derive({'walletAddress': '0x...', 'privateKey': '0x...'})
ticker = exchange.fetch_ticker('ETH/USD:USDC')
```

#### **Go**

```go
exchange := ccxt.NewDerive(map[string]interface{}{
    "walletAddress": "0x...",
    "privateKey":    "0x...",
})
ticker, err := exchange.FetchTicker("ETH/USD:USDC")
```

<!-- tabs:end -->

Derive publishes Python, TypeScript and Rust. CCXT covers all three plus Go, C#, PHP and Java from one source, so language is no longer what decides this one.

### Options and perpetuals in one symbol scheme

Derive lists perpetuals, dated options and ERC-20 spot. CCXT parses all three into unified symbols carrying expiry, strike and type, with `market['strike']`, `market['optionType']` and `market['expiry']` filled in, so the same option-chain code works on Derive, Deribit and Delta Exchange. On the trading side the venue's derivative surface is covered by `fetchPositions`, `fetchFundingRate`, `fetchFundingRateHistory`, `fetchFundingHistory`, `fetchLedger`, `fetchOrderTrades`, `fetchCanceledOrders` and `editOrder`.

### Testnet swaps more than the host

```python
exchange = ccxt.derive({'walletAddress': '0x...', 'privateKey': '0x...'})
exchange.set_sandbox_mode(True)
```

That points REST at `api-demo.lyra.finance` **and** switches the trade-module contract address that goes inside the signed action. Changing only the host by hand produces a signature the demo environment rejects, which is the kind of bug that costs an afternoon.

### One error hierarchy

Derive answers with numeric error codes. CCXT maps them onto its [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `BadRequest` and 35 more, all descending from `BaseError`. You write `except ccxt.InvalidOrder` once and the same handler keeps working on the next venue.

### Nothing is hidden — the implicit API

Alongside the unified methods, **all 113 Derive endpoints are generated as callable implicit methods**, with the wallet headers, signing and rate limiting applied:

```python
response = exchange.public_post_get_instruments({'currency': 'ETH', 'instrument_type': 'option'})
```

Browse them on the [Derive implicit API page](/docs/exchanges/derive/implicit-api). This is where you reach for the parts the unified layer does not model.

## What the official Derive SDKs do better

An honest list, and it is a long one for this venue:

- **RFQ flows.** `derive-py` has taker and maker RFQ modules — request quotes for a multi-leg package, execute the best one, run a bounded quoting loop. CCXT has no unified RFQ concept, so on Derive you would drive those endpoints raw.
- **Vaults.** Browsing vaults, queueing deposits, cancelling them and curator operations are first-class in the SDK. CCXT does not model vaults.
- **Session-key lifecycle.** Registering a scoped, expiring session key, editing its scopes and retiring it are SDK operations with worked examples. CCXT expects you to already hold a key that can sign.
- **Deposits that create the account.** On Derive the first deposit is what brings a subaccount into existence, and the SDK has `plan_deposit_to_new_subaccount` plus an L1 RPC path for it. CCXT starts from an account that already exists.
- **Generated from the published specs.** The client is regenerated from Derive's `openapi.json` and AsyncAPI documents, and anything not hand-wrapped is still reachable through `client.public_api` and `client.private_api` with typed models. Coverage tracks the protocol automatically.
- **A native Rust client and a CLI.** `derive-rs` is written as Rust rather than generated into it, and `drv` gives you `drv market ticker ETH-PERP` without writing code at all. CCXT ships neither a CLI for this venue nor a hand-written Rust API.
- **Market-maker protection.** MMP configuration and reset are exposed directly.

If you are building a Derive-native market maker, running vault strategies, or quoting RFQs, the official SDK is the better tool and it is not close.

## Migrating from derive-py to CCXT

| What you are doing | derive-py | CCXT |
| --- | --- | --- |
| Instruments | the `markets` module | `load_markets()` |
| Symbols | `ETH-PERP`, `BTC-20261030-180000-C` | `'ETH/USD:USDC'`, `'BTC/USDC:USDC-261030-180000-C'` |
| Credentials | `DERIVE_WALLET` + `DERIVE_SESSION_KEY` in the environment | `{'walletAddress': ..., 'privateKey': ...}` |
| Ticker | `client.markets.get_ticker(...)` | `fetch_ticker()` |
| Order book | the `orderbook` channel or the equivalent RPC | `fetch_order_book()` |
| New order | `client.orders.create(...)` | `create_order()` |
| Replace | the `orders` module's replace operation | `edit_order()` |
| Cancel | `client.orders.cancel(...)` | `cancel_order()` / `cancel_all_orders()` |
| Open orders | `client.orders` list-open | `fetch_open_orders()` |
| Positions | `client.positions` list | `fetch_positions()` |
| Balance / collateral | `client.collateral` get | `fetch_balance()` |
| Trade history | the `history` module | `fetch_my_trades()` |
| Streams | `client.public_channels.*(callback=...)` | `watch_*` on `ccxt.pro.derive` |
| RFQ, vaults, session keys | `client.rfq`, `client.vaults`, `client.account` | not unified — call the [implicit endpoints](/docs/exchanges/derive/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [derive unified API reference](/docs/exchanges/derive).

## FAQ

**Does CCXT sign Derive orders itself, or do I need a separate signer?**
CCXT signs them itself. You pass `walletAddress` and `privateKey` to the constructor; the library ABI-encodes the trade-module data, hashes it, builds the action hash with the nonce, trade-module address and signature expiry, and produces the secp256k1 signature. The same path exists in all eight CCXT languages.

**Can I use a Derive session key with CCXT?**
Yes. Pass the session key as `privateKey` and the signer address as `walletAddress`, and set `options['deriveWalletAddress']` to the Derive wallet the subaccount belongs to. Orders also take `subaccount_id` and `max_fee` in `params`.

**Does CCXT support Derive options?**
Options load as unified symbols with expiry, strike and type parsed out, and the unified trading methods work on them. What CCXT does not model is the RFQ machinery around multi-leg option packages — for that, use `derive-py` or the implicit endpoints.

**Does CCXT support Derive vaults or RFQs?**
Not as unified methods. Both are reachable through the [implicit API](/docs/exchanges/derive/implicit-api), where you construct the payload yourself. `derive-py` wraps them properly.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.derive` and call `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, WebSocket support included, no paid tier.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [derive unified API reference](/docs/exchanges/derive)
- [derive implicit API](/docs/exchanges/derive/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [More comparisons](/docs/comparisons)
