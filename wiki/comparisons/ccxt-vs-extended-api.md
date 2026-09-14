<!-- title: CCXT vs the Extended (x10) Python SDK -->
<!-- description: CCXT and x10-python-trading-starknet compared on StarkNet order signing, onboarding, streaming, rate limits and portability across eight languages. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Extended's official SDK is Python-only and leans on a Rust library for Stark signing. CCXT does the same Poseidon hashing and Stark signature in eight languages, with 53 unified capabilities and 10 streaming methods. -->
<!-- weight: 100 -->

# CCXT vs the Extended (x10) Python SDK

[Extended](https://app.extended.exchange) is a perpetuals exchange settled on StarkNet. Its API takes an ordinary `X-Api-Key` header for authentication, but that is not what makes an order valid: every order, transfer and withdrawal carries a **settlement** signed with a Stark private key over a Poseidon hash, and the exchange settles what that key signed.

Two ways to talk to it: the official [`x10xchange/python_sdk`](https://github.com/x10xchange/python_sdk), published as `x10-python-trading-starknet`, or [CCXT](/docs/manual), which computes the same message hashes and Stark signatures and exposes Extended behind the API it uses for 103 other venues.

The question that decides it: **is Extended your only venue, in Python?**

## TL;DR

- **Pick the official SDK** if Extended is your only venue and you work in Python. Its Rust-backed Stark signing, its onboarding flow that derives a Stark key pair from an Ethereum account, and its vault and builder-code modules have no CCXT equivalent.
- **Pick CCXT** if you want `create_order` to mean the same thing on Extended, Hyperliquid, Binance and Bybit, in any of eight languages, with the Poseidon hashing, Stark signing and account lookup already written.
- **Signing is not the thing you give up.** CCXT takes `apiKey` and `privateKey` as credentials, fetches your L2 vault and Stark key from the account endpoint, builds the settlement and signs it — the same path in Python, Go, C#, PHP, Java, JavaScript and TypeScript.

## At a glance

| | **CCXT** | **x10-python-trading-starknet** |
| --- | --- | --- |
| Venues covered | 104 (Extended is one of them) | Extended only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | Python 3.10+ |
| Packages to install | 1 (`ccxt`) | the SDK plus a compiled Rust Stark-crypto wrapper |
| Unified market data + trading API | yes — 53 unified capabilities, 31 `fetch*` methods | no — Extended's own request and response models |
| Instrument addressing | unified symbols: `'BTC/USDC:USDC'` | market names: `BTC-USD` |
| Stark signing | done for you from `apiKey` + `privateKey` | done for you, from a `StarkPerpetualAccount` |
| Credentials needed | `apiKey`, `privateKey` — the L2 vault and Stark public key are fetched | `api_key`, `public_key`, `private_key`, `vault` |
| Onboarding from an Ethereum account | not modelled | yes — EIP-712 signature, Stark key derivation |
| WebSockets | yes — 10 `watch*` methods, same shapes as `fetch*` | yes — a stream client per topic, plus a multiplexed RPC stream client |
| Raw endpoint access | yes — 51 endpoints as implicit methods | yes, and the OpenAPI specs ship in the repo |
| Built-in rate limiter | yes, on by default (`rateLimit` 600 ms, CCXT's setting for Extended's default request tier) | manual |
| Unified error types | yes — 41 typed exceptions in one hierarchy | Extended's numeric error codes |
| Testnet | `exchange.set_sandbox_mode(True)` — swaps in `api.starknet.sepolia.extended.exchange` | `TESTNET_CONFIG` |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | 39 GitHub stars |
| Latest release | continuous | 2.6.0, uploaded August 2026 |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues, Discord |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `x10xchange/python_sdk` repository, its README and examples, the `x10-python-trading-starknet` PyPI metadata, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.extended()
ticker = exchange.fetch_ticker('BTC/USDC:USDC')
print(ticker['last'], ticker['baseVolume'])
```

#### **x10 Python SDK**

```python
import asyncio
from x10.core.stark_account import StarkPerpetualAccount
from x10.config import TESTNET_CONFIG
from x10.clients.rest import RestApiClient

async def main():
    rest_client = RestApiClient(TESTNET_CONFIG)
    markets = await rest_client.markets_info.get_markets_dict()
    market = markets["BTC-USD"]
    print(market.market_stats.bid_price, market.market_stats.ask_price)

asyncio.run(main())
```

<!-- tabs:end -->

The SDK gives you Extended-shaped typed models — `market.trading_config.min_order_size`, `market.market_stats.bid_price`, `market.trading_config.round_price(...)`. CCXT gives you a [unified ticker structure](/docs/manual#ticker-structure) and a [unified market structure](/docs/manual#market-structure), with the same keys, types and units as on every other exchange, and unified symbols: `'BTC/USDC:USDC'` rather than `BTC-USD`.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.extended({'apiKey': '...', 'privateKey': '0x...'})
order = exchange.create_order('BTC/USDC:USDC', 'limit', 'buy', 0.001, 60000, {
    'postOnly': True,
})
print(order['id'], order['status'])
exchange.cancel_order(order['id'], 'BTC/USDC:USDC')
```

#### **x10 Python SDK**

```python
from x10.models.order import OrderSide, TimeInForce
from x10.signing.order_object import create_order_object

markets_dict = await rest_client.markets_info.get_markets_dict()
market = markets_dict["BTC-USD"]

new_order = create_order_object(
    account=rest_client.stark_account,
    starknet_domain=rest_client.config.signing.starknet_domain,
    market=market,
    side=OrderSide.BUY,
    amount_of_synthetic=market.trading_config.min_order_size,
    price=market.trading_config.round_price(60000),
    time_in_force=TimeInForce.GTT,
    reduce_only=False,
    post_only=True,
)
placed_order = await rest_client.orders.place_order(order=new_order)
```

<!-- tabs:end -->

Both sign. The SDK builds the order object first — passing the account, the StarkNet signing domain and the market so the settlement can be constructed — then posts it. CCXT does the same work inside `create_order`: it fetches your account's `l2Key` and `l2Vault`, converts amount and price into Stark-resolution integers, assembles the settlement (`baseAssetId`, `baseAmount`, `quoteAssetId`, `quoteAmount`, `feeAssetId`, `feeAmount`, expiration, salt), computes the SNIP-12 Poseidon message hash and produces the Stark signature — then returns a [unified order structure](/docs/manual#order-structure).

The practical difference is the credential surface: the SDK asks for four values (`api_key`, `public_key`, `private_key`, `vault`); CCXT asks for two and reads the rest from the account endpoint.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.extended()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDC:USDC')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **x10 Python SDK**

```python
async with stream_client.subscribe_to_orderbooks("BTC-USD") as orderbook_stream:
    while True:
        msg = await orderbook_stream.recv()
        print(msg.type, msg.seq, msg.data.market)
```

<!-- tabs:end -->

Both are `await`-shaped and both are reasonable. The difference is what a stream returns: the SDK hands you the message it received, sequence number included, and the SDK's plain streaming client opens **one WebSocket connection per topic** (a separate RPC streaming client multiplexes several topics onto one socket). CCXT keeps one connection per URL, merges the book itself, and returns the same structure `fetch_order_book` returns, so a polling loop becomes a streaming loop by changing one word.

CCXT's ten streaming methods for Extended are `watchOrderBook`, `watchTrades`, `watchOHLCV`, `watchMarkPrice`, `watchIndexPrice`, `watchFundingRate`, `watchBalance`, `watchOrders`, `watchMyTrades` and `watchPositions`.

## Where the differences actually bite

### Eight languages, one API — signing included

This is the largest practical gap. The official SDK is Python, and its Stark signing is accelerated by a compiled Rust wrapper with per-platform wheels (Linux glibc and musl on x86 and arm64, macOS arm64, Windows x86; Windows arm64 is marked experimental). Porting that to Go or C# is not a translation exercise, it is a cryptography project.

CCXT implements `extendedStarknetSign`, the Poseidon hash and the selector derivation in its base class in every language it ships, so the same order-signing path exists in TypeScript, JavaScript, Python, PHP, C#, Go, Java and Rust.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.extended ({ apiKey: '...', privateKey: '0x...' });
const ticker = await exchange.fetchTicker ('BTC/USDC:USDC');
```

#### **Python**

```python
import ccxt
exchange = ccxt.extended({'apiKey': '...', 'privateKey': '0x...'})
ticker = exchange.fetch_ticker('BTC/USDC:USDC')
```

#### **Go**

```go
exchange := ccxt.NewExtended(map[string]interface{}{
    "apiKey":     "...",
    "privateKey": "0x...",
})
ticker, err := exchange.FetchTicker("BTC/USDC:USDC")
```

<!-- tabs:end -->

### One API for perp DEXes and CEXes

Extended signs a Stark settlement. Hyperliquid signs EIP-712 typed data. dYdX signs a Cosmos transaction. Binance signs an HMAC over a query string. Their symbols, order payloads, error codes and stream dialects have nothing in common. CCXT already absorbed that:

```python
for exchange_id, symbol in [('extended', 'BTC/USDC:USDC'), ('hyperliquid', 'BTC/USDC:USDC'),
                            ('binance', 'BTC/USDT:USDT'), ('bybit', 'BTC/USDT:USDT')]:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker(symbol)['last'])
```

### The derivatives surface is unified

Fifty-three unified capabilities cover more than order entry: `fetchPositions`, `fetchPosition`, `fetchPositionsHistory`, `fetchFundingRateHistory`, `fetchFundingHistory`, `fetchOpenInterestHistory`, `fetchMarkOHLCV`, `fetchIndexOHLCV`, `fetchLeverage`, `setLeverage`, `fetchTradingFee`, `fetchTradingFees`, `fetchLedger`, `fetchTransfers`, `transfer` and `fetchAccounts`. Order management includes `editOrder`, `cancelOrders`, `cancelAllOrders` and `cancelAllOrdersAfter` — the dead-man's-switch that cancels everything if your process stops calling in.

```python
exchange.cancel_all_orders_after(30000)   # cancel everything if I go quiet for 30s
```

### Rate limits and precision

CCXT ships a throttler that is **on by default**, with `rateLimit` set to 600 ms for Extended's default request tier and per-endpoint weights in the exchange definition. Precision is handled by `amount_to_precision` and `price_to_precision`, backed by the `Precise` string-arithmetic class — which matters more than usual here, because the Stark settlement encodes amounts as integers at the instrument's resolution and a rounding error changes the hash you signed.

```python
amount = exchange.amount_to_precision('BTC/USDC:USDC', 0.0012345678)
price = exchange.price_to_precision('BTC/USDC:USDC', 61234.56789)
```

### Testnet without a second code path

```python
exchange = ccxt.extended({'apiKey': '...', 'privateKey': '0x...'})
exchange.set_sandbox_mode(True)   # api.starknet.sepolia.extended.exchange
```

One flag swaps the REST and WebSocket hosts. Extended's testnet accounts and keys are separate from mainnet, as they are with the SDK's `TESTNET_CONFIG`.

### Nothing is hidden — the implicit API

Alongside the unified methods, **all 51 Extended endpoints are generated as callable implicit methods**, with the API-key header, rate limiting and error mapping applied. Browse them on the [Extended implicit API page](/docs/exchanges/extended/implicit-api).

## What the official Extended SDK does better

Real advantages, not padding:

- **Onboarding from an Ethereum account.** The SDK derives a Stark key pair from an Ethereum signature over an EIP-712 `AccountCreation` struct, and creates the account and API keys for you. CCXT starts from credentials you already hold.
- **Rust-accelerated Stark crypto.** Signing and hashing go through a compiled wrapper rather than pure Python, which matters when you are signing at quoting frequency.
- **Vaults and builder codes.** Vault public data and user vault token management, plus builder-specific data, are first-class modules. CCXT does not model either.
- **A multiplexed RPC streaming client.** Alongside the per-topic stream client, the SDK offers a single-connection client that carries many topics, and a blocking trading client for synchronous code.
- **The OpenAPI specs ship in the repository.** `specs/` gives you the machine-readable definition to generate against, which is useful whether or not you use the SDK.
- **An experimental MCP server.** `x10-mcp` exposes the SDK to Model Context Protocol clients, with the appropriate warnings about executing real transactions.

If Extended is your only venue and you are writing Python — especially if you are onboarding programmatically or running vault strategies — the official SDK is the better fit.

## Migrating from the x10 SDK to CCXT

| What you are doing | x10 Python SDK | CCXT |
| --- | --- | --- |
| Markets | `rest_client.markets_info.get_markets_dict()` | `load_markets()` |
| Symbols | `BTC-USD` | `'BTC/USDC:USDC'` |
| Credentials | `StarkPerpetualAccount(api_key, public_key, private_key, vault)` | `{'apiKey': ..., 'privateKey': ...}` |
| Ticker | `market.market_stats` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | the order-book endpoint or stream | `fetch_order_book()` |
| Candles | the candles endpoint | `fetch_ohlcv()` |
| New order | `create_order_object(...)` then `orders.place_order(order=...)` | `create_order()` |
| Cancel | `orders` cancel | `cancel_order()` / `cancel_orders()` / `cancel_all_orders()` |
| Open orders | the account order endpoints | `fetch_open_orders()` |
| Positions | the account position endpoints | `fetch_positions()` / `fetch_positions_history()` |
| Balance | the account balance endpoint | `fetch_balance()` |
| Leverage | the account leverage endpoint | `set_leverage()` / `fetch_leverage()` |
| Streams | `stream_client.subscribe_to_*` | `watch_*` on `ccxt.pro.extended` |
| Vaults, builder codes, onboarding | `vault`, `builder`, `auth` modules | not unified — call the [implicit endpoints](/docs/exchanges/extended/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [extended unified API reference](/docs/exchanges/extended).

## FAQ

**Does CCXT sign Extended orders itself, or do I need the x10 SDK?**
CCXT signs them itself. It builds the order settlement, computes the SNIP-12 Poseidon message hash and produces the Stark-curve signature in its base class — implemented natively in all eight CCXT languages, with no Rust wrapper to install.

**What credentials does CCXT need for Extended?**
`apiKey` and `privateKey`. Your L2 vault id and Stark public key are read from the account endpoint on first use, so you do not pass them in. The official SDK asks for all four up front.

**Can CCXT onboard a new Extended account from an Ethereum wallet?**
No. Account creation and the Ethereum-to-Stark key derivation are SDK features. Create the account and API key through Extended's interface or the SDK, then use CCXT with the resulting credentials.

**Does CCXT stream private Extended data?**
Yes — `watchBalance`, `watchOrders`, `watchMyTrades` and `watchPositions`, alongside `watchOrderBook`, `watchTrades`, `watchOHLCV`, `watchMarkPrice`, `watchIndexPrice` and `watchFundingRate`.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.extended` and call `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, WebSocket support included, no paid tier.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [extended unified API reference](/docs/exchanges/extended)
- [extended implicit API](/docs/exchanges/extended/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [More comparisons](/docs/comparisons)
