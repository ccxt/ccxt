<!-- title: CCXT vs the Hyperliquid API and the official Hyperliquid SDK -->
<!-- description: CCXT and hyperliquid-python-sdk compared on EIP-712 signing, language coverage, streaming, rate limits and portability, with the same tasks written both ways. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Hyperliquid's whole API is two POST endpoints plus an EIP-712 signature. The official SDK covers it in Python and Rust; CCXT does the same signing in seven languages, behind the API it uses for 103 other venues. -->
<!-- weight: 100 -->

# CCXT vs the Hyperliquid API and the official Hyperliquid SDK

[Hyperliquid](https://hyperliquid.xyz) is a perpetuals DEX with an on-chain order book, and its API looks nothing like a CEX API. There are two POST endpoints — `/info` for reads and `/exchange` for everything that changes state — and every `/exchange` request carries an EIP-712 signature over a msgpack-encoded action, plus a nonce that the chain tracks per signing address.

Two ways to talk to it: the official [`hyperliquid-python-sdk`](https://github.com/hyperliquid-dex/hyperliquid-python-sdk) (with an official [Rust SDK](https://github.com/hyperliquid-dex/hyperliquid-rust-sdk) alongside it), or [CCXT](/docs/manual), which does the same signing and exposes Hyperliquid behind the API it uses for 103 other venues.

The question that decides it: **is Hyperliquid the only venue you will trade, in a language the official SDKs already cover?**

## TL;DR

- **Pick the official SDK** if Hyperliquid is your only venue, you work in Python or Rust, and you want the request payloads to match Hyperliquid's action reference literally — `order`, `modify`, `twapOrder`, `approveAgent` and the rest.
- **Pick CCXT** if you want `create_order` to mean the same thing on Hyperliquid, Binance, Bybit and OKX, in any of seven languages, with the EIP-712 signing, nonce handling and order-book maintenance already written.
- **Signing is not the thing you give up.** CCXT takes `walletAddress` and `privateKey` as first-class credentials and packs, hashes and signs each action itself — no `eth_account`, no separate signer, and the same code path in Python, Go, C#, PHP, Java, JS and TypeScript.

## At a glance

| | **CCXT** | **Official Hyperliquid SDK** |
| --- | --- | --- |
| Venues covered | 104 (Hyperliquid is one of them) | Hyperliquid only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python and Rust, separate codebases |
| Packages to install | 1 (`ccxt`) | `hyperliquid-python-sdk` plus `eth-account` for signing |
| Unified market data + trading API | yes — 71 unified capabilities, 27 `fetch*` methods | no — Hyperliquid's own action and response shapes |
| On-chain signing | done for you from `walletAddress` + `privateKey` | you construct a `LocalAccount` and pass it in |
| WebSockets | yes — 17 `watch*`/`unWatch*` methods, same shapes as `fetch*` | yes — `info.subscribe(subscription, callback)` |
| Raw endpoint access | yes — both endpoints (`POST /info`, `POST /exchange`) callable directly | yes, it is the whole product |
| Built-in rate limiter | yes, per-request weights, on by default (`rateLimit` 50 ms) | manual |
| Unified error types | yes — 41 typed exceptions in one hierarchy | Python exceptions plus Hyperliquid's error strings |
| Testnet | `exchange.set_sandbox_mode(True)` — swaps the host and the signature source byte | pass `constants.TESTNET_API_URL` |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | 1.8k GitHub stars · 618k PyPI installs/month |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `hyperliquid-dex/hyperliquid-python-sdk` repository and its README, Hyperliquid's own API documentation, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Read a price

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.hyperliquid()
ticker = exchange.fetch_ticker('BTC/USDC:USDC')
print(ticker['last'], ticker['baseVolume'])
```

#### **hyperliquid-python-sdk**

```python
from hyperliquid.info import Info
from hyperliquid.utils import constants

info = Info(constants.MAINNET_API_URL, skip_ws=True)
mids = info.all_mids()
print(mids["BTC"])
```

<!-- tabs:end -->

`all_mids()` returns a dictionary of coin to mid price as a string, which is what Hyperliquid actually sends. CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) — same keys, same types, same units as the ticker you get from Binance or Kraken — and its symbols are the unified ones, so a perp is `'BTC/USDC:USDC'` and spot is `'BTC/USDC'` rather than `"BTC"` and `"@1"`.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.hyperliquid({
    'walletAddress': '0x...',
    'privateKey': '0x...',
})
order = exchange.create_order('ETH/USDC:USDC', 'limit', 'buy', 0.2, 1100)
print(order['id'], order['status'])
exchange.cancel_order(order['id'], 'ETH/USDC:USDC')
```

#### **hyperliquid-python-sdk**

```python
import example_utils
from hyperliquid.utils import constants

address, info, exchange = example_utils.setup(
    base_url=constants.TESTNET_API_URL, skip_ws=True)

order_result = exchange.order("ETH", True, 0.2, 1100, {"limit": {"tif": "Gtc"}})
status = order_result["response"]["data"]["statuses"][0]
if "resting" in status:
    exchange.cancel("ETH", status["resting"]["oid"])
```

<!-- tabs:end -->

The SDK's `setup()` reads a `config.json`, builds an `eth_account` `LocalAccount` from your secret key and hands it to the `Exchange` constructor; you then read the order id out of a nested response, and `True` is the side. In CCXT the credentials are constructor fields, the side is `'buy'`, and the return value is a [unified order structure](/docs/manual#order-structure) with `id`, `status`, `filled` and `average` in the same places as every other exchange.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.hyperliquid()
    while True:
        orderbook = await exchange.watch_order_book('ETH/USDC:USDC')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **hyperliquid-python-sdk**

```python
import example_utils
from hyperliquid.utils import constants

address, info, _ = example_utils.setup(constants.TESTNET_API_URL)
info.subscribe({"type": "l2Book", "coin": "ETH"}, print)
info.subscribe({"type": "orderUpdates", "user": address}, print)
```

<!-- tabs:end -->

Both work. They differ in shape: the SDK is callback-driven and hands your function the raw message, so ordering, buffering and back-pressure are yours to arrange. CCXT is `await`-shaped — `watch_order_book` returns the same structure as `fetch_order_book`, so a polling loop becomes a streaming loop by changing one word and the code downstream never learns which one produced the book.

## Where the differences actually bite

### Signing is most of the integration

Every state-changing Hyperliquid request is an msgpack-encoded action, keccak-hashed together with the nonce and optional vault address, wrapped in an EIP-712 `Agent` typed-data struct, and signed with secp256k1. Hyperliquid's own documentation adds that the 100 highest nonces are stored per address, that each new nonce must exceed the smallest of them and never repeat, and that nonces must fall within `(T - 2 days, T + 1 day)`.

CCXT implements all of that inside the library — `actionHash`, the EIP-712 domain, the ECDSA signature and the nonce — and, because CCXT is written once and transpiled, the identical signing path exists in Python, Go, C#, PHP, Java and JavaScript. Outside Python and Rust, this is the part you would otherwise be porting by hand from someone else's SDK.

```python
exchange = ccxt.hyperliquid({'walletAddress': '0x...', 'privateKey': '0x...'})
```

Vault and subaccount trading uses the same methods: pass `vaultAddress` in `params` and CCXT folds it into the signed payload.

### One API for CEXes and perp DEXes

This is the difference that shows up when the strategy grows a second leg. Hyperliquid is signature-and-nonce based; Binance is HMAC over a query string; Coinbase is a JWT. Their symbols, order payloads, error codes and stream dialects have nothing in common. CCXT already absorbed that:

```python
venues = {
    'hyperliquid': 'BTC/USDC:USDC',
    'binance': 'BTC/USDT:USDT',
    'bybit': 'BTC/USDT:USDT',
    'okx': 'BTC/USDT:USDT',
}
for exchange_id, symbol in venues.items():
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker(symbol)['last'])
```

Basis trades, cross-venue hedges and DEX-versus-CEX arbitrage stop being two integrations with a translation layer between them.

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.hyperliquid ({ walletAddress: '0x...', privateKey: '0x...' });
const ticker = await exchange.fetchTicker ('BTC/USDC:USDC');
```

#### **Python**

```python
import ccxt
exchange = ccxt.hyperliquid({'walletAddress': '0x...', 'privateKey': '0x...'})
ticker = exchange.fetch_ticker('BTC/USDC:USDC')
```

#### **Go**

```go
exchange := ccxt.NewHyperliquid(map[string]interface{}{
    "walletAddress": "0x...",
    "privateKey":    "0x...",
})
ticker, err := exchange.FetchTicker("BTC/USDC:USDC")
```

<!-- tabs:end -->

The official SDKs cover Python and Rust. If your execution service is Go, C# or Java, CCXT is the shorter path.

### Rate limits you do not have to model

Hyperliquid documents an aggregated REST weight limit of 1200 per minute per IP, with `/info` requests weighted 2, 20 or 60 depending on the request type, and address-based limits on `/exchange`. CCXT encodes those per-request weights in the exchange definition — `l2Book`, `allMids`, `clearinghouseState`, `orderStatus` and friends at the cheap weight, the rest at the default — and ships a throttler that is on by default (`enableRateLimit = true`, base `rateLimit` 50 ms). You call methods in a loop; the library paces them.

### Precision, tick size and string math

Hyperliquid rejects orders that violate tick size or the minimum notional, and it says so in prose: `"Price must be divisible by tick size."`, `"Order must have minimum value of $10"`. CCXT loads the market metadata and gives you `amount_to_precision` and `price_to_precision`, backed by the `Precise` string-arithmetic class so sizes never drift through float rounding.

```python
amount = exchange.amount_to_precision('ETH/USDC:USDC', 0.20000000000000004)
price = exchange.price_to_precision('ETH/USDC:USDC', 1100.123456)
```

### One error hierarchy

CCXT maps Hyperliquid's prose errors onto its [typed exception tree](/docs/manual#error-handling): that tick-size message becomes `InvalidOrder`, `"Insufficient margin to place order."` becomes `InsufficientFunds`, a post-only order that would have crossed becomes `InvalidOrder`. You write `except ccxt.InsufficientFunds` once, and the same handler keeps working when the next venue reports the same condition as an integer error code.

### Testnet without a second code path

```python
exchange = ccxt.hyperliquid({'walletAddress': '0x...', 'privateKey': '0x...'})
exchange.set_sandbox_mode(True)
```

That swaps in `api.hyperliquid-testnet.xyz` **and** flips the source byte inside the signed phantom agent, which is the part that is easy to miss when you switch hosts by hand — a mainnet-shaped signature against testnet is simply rejected.

### The implicit API is small here, because the API is small

On most exchanges the [implicit API](/docs/exchanges/hyperliquid/implicit-api) is the escape hatch that stops a unified library from being a lowest common denominator — 792 raw methods for Binance, 637 for Bitget. Hyperliquid has **two** endpoints, so the escape hatch is `publicPostInfo` and `privatePostExchange`:

```python
response = exchange.public_post_info({'type': 'meta'})
```

That is the honest version of this section: on Hyperliquid nearly all the value is in the unified layer and the signing, not in raw endpoint coverage. Anything the unified methods do not model yet, you can still send through `privatePostExchange` — but you are then constructing the action payload yourself.

## What the official Hyperliquid SDK does better

Real advantages, not padding:

- **There is an official Rust SDK.** CCXT ships seven languages and Rust is not one of them. If your execution path is Rust, [`hyperliquid-rust-sdk`](https://github.com/hyperliquid-dex/hyperliquid-rust-sdk) is the maintained option and CCXT is not in the running.
- **One-to-one with Hyperliquid's action reference.** Hyperliquid documents `order`, `modify`, `batchModify`, `scheduleCancel`, `twapOrder`, `approveAgent`, `approveBuilderFee`, `tokenDelegate`, `reserveRequestWeight` and more. The SDK's methods track that list literally, so debugging against the docs is one hop instead of two.
- **New actions land there first.** When Hyperliquid ships a new action type, the venue's own SDK is where it appears first; a *unified* CCXT wrapper for it may follow later.
- **Signer flexibility.** The SDK's examples read an encrypted keystore file with a password prompt and support multi-sig authorised-user wallets, because signing is delegated to `eth_account`. CCXT takes a raw `privateKey` in the constructor.
- **Smaller dependency for a single-venue Python bot.** If Hyperliquid is all you will ever touch and you are in Python, the SDK is a smaller install than all of CCXT.

If you are writing a Hyperliquid-only bot in Python or Rust and you want your code to read like the Hyperliquid docs, the official SDK is the better fit.

## If you want CCXT but only this one venue

CCXT publishes a single-exchange Python distribution built from the same source: [`ccxt/hyperliquid-python`](https://github.com/ccxt/hyperliquid-python).

```bash
pip install hyperliquid
```

It exposes `HyperliquidSync`, `HyperliquidAsync` and `HyperliquidWs` — the unified methods, the signing and the WebSocket support, without the other 103 exchanges. It is MIT-licensed and tracks the same codebase, so moving to full `ccxt` later is an import change.

## Migrating from hyperliquid-python-sdk to CCXT

| What you are doing | hyperliquid-python-sdk | CCXT |
| --- | --- | --- |
| Coin / symbol | `"ETH"`, `"PURR/USDC"`, `"@1"` | `'ETH/USDC:USDC'` (perp), `'PURR/USDC'` (spot) |
| Credentials | `eth_account` `LocalAccount` + `account_address` | `{'walletAddress': ..., 'privateKey': ...}` |
| Metadata | `info.meta()` | `load_markets()` |
| Prices | `info.all_mids()` | `fetch_ticker()` / `fetch_tickers()` |
| Order book | `info.l2_snapshot(name)` | `fetch_order_book()` |
| Candles | `info.candles_snapshot(name, interval, start, end)` | `fetch_ohlcv()` |
| Account state | `info.user_state(address)` | `fetch_balance()` / `fetch_positions()` |
| Open orders | `info.open_orders(address)` | `fetch_open_orders()` |
| Fills | `info.user_fills(address)` | `fetch_my_trades()` |
| New order | `exchange.order(coin, is_buy, sz, px, order_type)` | `create_order()` |
| Cancel | `exchange.cancel(coin, oid)` | `cancel_order()` |
| Streams | `info.subscribe({...}, callback)` | `watch_*` on `ccxt.pro.hyperliquid` |
| Anything not listed | the raw action | `private_post_exchange()` / `public_post_info()` |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [hyperliquid unified API reference](/docs/exchanges/hyperliquid).

## FAQ

**Does CCXT sign Hyperliquid orders itself, or do I need eth_account?**
CCXT signs them itself. You pass `walletAddress` and `privateKey` to the constructor and the library msgpack-encodes the action, keccak-hashes it with the nonce, builds the EIP-712 typed-data struct and produces the secp256k1 signature. There is no `eth_account` dependency, and the same path exists in all seven CCXT languages.

**Can I use a Hyperliquid API wallet (agent wallet) with CCXT?**
Yes. Pass the API wallet's private key as `privateKey` and your main account's address as `walletAddress` — the same split the official SDK expresses as `LocalAccount` plus `account_address`. For vaults and subaccounts, pass `vaultAddress` in `params`.

**Does CCXT support Hyperliquid spot as well as perps?**
Yes. Perps are unified symbols like `'BTC/USDC:USDC'` and spot pairs are `'BTC/USDC'`, from the same `ccxt.hyperliquid` instance.

**Is CCXT slower than the official SDK?**
CCXT adds parsing and normalisation on top of the same HTTP and WebSocket calls, so there is a small constant per-message overhead. Signing cost is comparable — both do one keccak hash and one ECDSA signature. For anything short of latency-critical market making, network round-trip time dominates; if you are optimising microseconds, Hyperliquid's Rust SDK is the honest recommendation.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.hyperliquid` and the `watch*` methods.

**Is CCXT free?**
Yes. MIT-licensed, WebSocket support included, no paid tier.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [hyperliquid unified API reference](/docs/exchanges/hyperliquid)
- [hyperliquid implicit API](/docs/exchanges/hyperliquid/implicit-api)
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [More comparisons](/docs/comparisons)
