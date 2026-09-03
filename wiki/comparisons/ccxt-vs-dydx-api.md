<!-- title: CCXT vs the dYdX v4 clients -->
<!-- description: CCXT and dYdX's v4-clients compared on Cosmos transaction signing, indexer versus node, language coverage, streaming, licensing and portability. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: dYdX v4 orders are signed Cosmos transactions, and the official clients make you drive a node client and an indexer client separately. CCXT builds and broadcasts the same transaction behind one create_order, in eight languages. -->
<!-- weight: 100 -->

# CCXT vs the dYdX v4 clients

[dYdX](https://www.dydx.xyz) v4 is not a normal exchange API. It is a sovereign Cosmos SDK chain: orders are protobuf-encoded messages inside a signed transaction, broadcast to a validator, while reads come from a separate **indexer** service over ordinary HTTP and WebSocket. There is no API key. Your account is a chain address, your credential is a key, and every order carries a client-generated id, an order flag saying whether it is short-term or long-term, and a good-til-block or good-til-time.

Two ways to talk to it: the official [`dydxprotocol/v4-clients`](https://github.com/dydxprotocol/v4-clients) monorepo, or [CCXT](/docs/manual), which builds, signs and broadcasts the same transactions behind the API it uses for 103 other venues.

The question that decides it: **do you need the chain, or the exchange?**

## TL;DR

- **Pick the official clients** if you need dYdX as a *chain* — transfers, staking, governance messages, transaction simulation, the testnet faucet, short-term versus long-term order semantics spelled out — or if you work in C++.
- **Pick CCXT** if you want dYdX as an *exchange*: `create_order`, `fetch_positions`, `fetch_balance` meaning the same thing here as on Binance, Bybit and Hyperliquid, in eight languages, with the protobuf encoding and secp256k1 signing already written.
- **Signing is not the thing you give up.** CCXT encodes the order message, looks up your account number and sequence, signs the transaction and broadcasts it over the node RPC — no separate Cosmos library in your code.

## At a glance

| | **CCXT** | **dYdX v4-clients** |
| --- | --- | --- |
| Venues covered | 104 (dYdX is one of them) | dYdX only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | TypeScript (`v4-client-js`, `dydxjs`), Python and Rust (maintained by Nethermind), C++ (third-party, Linux only) |
| Packages to install | 1 (`ccxt`) | 1 per language, plus proto dependencies |
| Unified market data + trading API | yes — 29 unified capabilities, 19 `fetch*` methods | no — chain messages and indexer payloads |
| Clients to wire up | one `ccxt.dydx` instance | a node client *and* an indexer client, separately |
| Instrument addressing | unified symbols: `'BTC/USDC:USDC'` | `"BTC-USD"` ticker plus a `Market` helper for quantums and subticks |
| Transaction signing | done for you — protobuf encode, account/sequence lookup, secp256k1, broadcast | done for you, from a `Wallet` you build from a mnemonic |
| WebSockets | yes — 3 `watch*` methods (`watchOrderBook`, `watchTrades`, `watchOHLCV`) plus `unWatch*` | yes — `IndexerSocket` with per-channel handlers, including subaccount channels |
| Raw endpoint access | yes — 54 endpoints as implicit methods across indexer, node REST and node RPC | yes, it is the whole product |
| Built-in rate limiter | yes, on by default (`rateLimit` 100 ms) | manual |
| Unified error types | yes — 41 typed exceptions in one hierarchy | chain and indexer error codes |
| Testnet | `exchange.set_sandbox_mode(True)` — swaps indexer, node RPC and node REST together | `TESTNET` network constant, plus a faucet client |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | 120 GitHub stars · 246k npm installs/month (`@dydxprotocol/v4-client-js`) · 5.5k PyPI installs/month (`dydx-v4-client`) |
| Licence | MIT | see the repository `LICENSE`: MIT-style permissions conditioned on compliance with applicable law and dYdX's v4 Terms of Use (the README badge shows AGPL v3) |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues, dYdX developer channels |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `dydxprotocol/v4-clients` repository, its README, LICENSE and Python client documentation, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Read a market and its book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.dydx()
orderbook = exchange.fetch_order_book('BTC/USDC:USDC')
print(orderbook['bids'][0], orderbook['asks'][0])
```

#### **v4-client-py-v2**

```python
import asyncio
from dydx_v4_client.indexer.rest.indexer_client import IndexerClient
from dydx_v4_client.network import TESTNET

async def main():
    client = IndexerClient(TESTNET.rest_indexer)
    response = await client.markets.get_perpetual_markets(market="BTC-USD")
    print(response["markets"]["BTC-USD"])

asyncio.run(main())
```

<!-- tabs:end -->

The indexer returns dYdX's own market and order-book objects. CCXT returns a [unified order book structure](/docs/manual#order-book-structure) — sorted `bids` and `asks` as `[price, amount]` pairs, with a timestamp — the same shape as on every other venue, and its symbols are unified: `'BTC/USDC:USDC'` rather than `"BTC-USD"`. Note one gap honestly: CCXT does not implement `fetchTicker` or `fetchTickers` for dYdX, so top-of-book comes from `fetch_order_book` or from the raw market payload via an implicit method.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.dydx({
    'walletAddress': 'dydx1...',   # your dYdX chain address
    'privateKey': '0x...',
})
order = exchange.create_order('BTC/USDC:USDC', 'limit', 'sell', 0.01, 40000)
print(order['id'])
exchange.cancel_order(order['id'], 'BTC/USDC:USDC')
```

#### **v4-client-py-v2**

```python
import asyncio, random
from v4_proto.dydxprotocol.clob.order_pb2 import Order
from dydx_v4_client import MAX_CLIENT_ID, OrderFlags
from dydx_v4_client.indexer.rest.constants import OrderType
from dydx_v4_client.indexer.rest.indexer_client import IndexerClient
from dydx_v4_client.network import TESTNET
from dydx_v4_client.node.client import NodeClient
from dydx_v4_client.node.market import Market, since_now
from dydx_v4_client.wallet import Wallet

async def main():
    node = await NodeClient.connect(TESTNET.node)
    indexer = IndexerClient(TESTNET.rest_indexer)
    market = Market((await indexer.markets.get_perpetual_markets("BTC-USD"))["markets"]["BTC-USD"])
    wallet = await Wallet.from_mnemonic(node, MNEMONIC, ADDRESS)
    order_id = market.order_id(ADDRESS, 0, random.randint(0, MAX_CLIENT_ID), OrderFlags.LONG_TERM)
    await node.place_order(wallet, market.order(
        order_id, OrderType.LIMIT, Order.Side.SIDE_SELL,
        size=0.01, price=40000,
        time_in_force=Order.TIME_IN_FORCE_UNSPECIFIED,
        reduce_only=False, good_til_block_time=since_now(seconds=60)))
    wallet.sequence += 1

asyncio.run(main())
```

<!-- tabs:end -->

That second snippet is not padded — it is close to the official example, and every line is load-bearing. You connect to a node *and* an indexer, build a `Market` helper so sizes and prices can be converted into the chain's quantums and subticks, construct a `Wallet` from a mnemonic, generate an order id with a random client id and an order flag, choose between `good_til_block` and `good_til_block_time`, and increment the wallet's sequence number yourself after broadcasting.

CCXT does all of that inside `create_order`. It fetches your account number and sequence from the chain, fetches the latest block height, encodes the order message, signs the transaction with secp256k1 and broadcasts it — and hands back a [unified order structure](/docs/manual#order-structure).

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.dydx()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDC:USDC')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **v4-client-py-v2**

```python
import asyncio
from dydx_v4_client.indexer.socket.websocket import IndexerSocket
from dydx_v4_client.network import TESTNET

def handle_message(ws: IndexerSocket, message: dict):
    print("Received message:", message)

async def main():
    async with IndexerSocket(TESTNET.websocket_indexer, on_message=handle_message) as ws:
        await ws.order_book.subscribe("BTC-USD")
        while True:
            await asyncio.sleep(1)

asyncio.run(main())
```

<!-- tabs:end -->

CCXT's `watch_order_book` returns the same structure as `fetch_order_book` — snapshot applied, deltas merged, book depth-bounded, reconnect and resubscribe handled — so a polling loop becomes a streaming loop by changing one word. CCXT covers three streams for dYdX: `watchOrderBook`, `watchTrades` and `watchOHLCV`, each with an `unWatch*` counterpart. Private streams (subaccount orders and fills) are **not** implemented for this venue in CCXT; the indexer socket exposes them, and that is a real gap on CCXT's side.

## Where the differences actually bite

### Signing a Cosmos transaction is most of the integration

A dYdX order is not an HTTP body with a signature header. It is a protobuf `MsgPlaceOrder` inside a `TxBody`, with an `AuthInfo` carrying your public key, sequence number and fee, signed over a `SignDoc` bound to the chain id, then broadcast to a validator. Get the sequence wrong and the transaction is rejected; get the encoding wrong and it does not decode.

CCXT implements the whole path — `encodeDydxTxForSigning`, the secp256k1 signature, `encodeDydxTxRaw`, and the broadcast — and it exists in TypeScript, JavaScript, Python, PHP, C# and Go from the same source. It also handles **onboarding**: if you do not supply a dYdX chain key, CCXT signs the onboarding action with your Ethereum key and derives the chain credentials from that signature, the same derivation the official clients perform.

```python
exchange = ccxt.dydx({'walletAddress': 'dydx1...', 'privateKey': '0x...'})
```

One caveat, stated plainly: in Python the transaction encoding needs two extra packages — `pip install "protobuf==5.29.5" pycryptodome==3.18.0` — and CCXT raises `NotSupported` with that message if they are missing.

### One API for a chain-based DEX and everything else

dYdX signs a Cosmos transaction. Hyperliquid signs EIP-712 typed data. Derive signs an on-chain action with a session key. Binance signs an HMAC over a query string. CCXT already absorbed the differences:

```python
for exchange_id, symbol in [('dydx', 'BTC/USDC:USDC'), ('hyperliquid', 'BTC/USDC:USDC'),
                            ('binance', 'BTC/USDT:USDT'), ('bybit', 'BTC/USDT:USDT')]:
    exchange = getattr(ccxt, exchange_id)()
    book = exchange.fetch_order_book(symbol)
    print(exchange_id, book['bids'][0], book['asks'][0])
```

Basis trades, DEX-versus-CEX hedges and cross-venue liquidation monitors stop being two integrations with a translation layer between them.

### One instance instead of two clients and three hosts

dYdX v4 is served from three places: the indexer (reads), the node RPC (broadcast) and the node REST (account state). The official Python client gives you a `NodeClient` and an `IndexerClient` and expects you to know which one answers which question. CCXT wires all three into one exchange instance and routes each unified method to the right host — including in sandbox mode, where `set_sandbox_mode(True)` swaps all three at once.

### Eight languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names, arguments and return structures — the transaction signing included.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.dydx ({ walletAddress: 'dydx1...', privateKey: '0x...' });
const book = await exchange.fetchOrderBook ('BTC/USDC:USDC');
```

#### **Go**

```go
exchange := ccxt.NewDydx(map[string]interface{}{
    "walletAddress": "dydx1...",
    "privateKey":    "0x...",
})
book, err := exchange.FetchOrderBook("BTC/USDC:USDC")
```

<!-- tabs:end -->

The official clients cover TypeScript, Python and Rust, plus a third-party C++ client. CCXT covers all three of those languages and Go, C#, PHP and Java besides, so the split here is chain access versus exchange coverage rather than language.

### One error hierarchy

dYdX returns numeric error codes from the chain — `1011`, `2005`, `4008` and dozens more. CCXT maps them onto its [typed exception tree](/docs/manual#error-handling): `InvalidOrder`, `InsufficientFunds`, `OrderNotFound`, `AuthenticationError`, `RateLimitExceeded` and 36 more, all descending from `BaseError`. You write `except ccxt.InvalidOrder` once and it keeps working when the next venue words the same rejection differently.

### Nothing is hidden — the implicit API

Alongside the unified methods, **all 54 dYdX endpoints across the indexer, node REST and node RPC are generated as callable implicit methods**:

```python
response = exchange.indexer_get_candles_perpetual_markets_market({'market': 'BTC-USD', 'resolution': '1MIN'})
```

Browse them on the [dYdX implicit API page](/docs/exchanges/dydx/implicit-api).

## What the official dYdX clients do better

Real advantages, not padding:

- **The chain, not just the exchange.** `NodeClient` is a Cosmos client: it can query and send arbitrary chain messages, simulate transactions before broadcasting, and reach the parts of dYdX that are not order entry. CCXT models the exchange surface.
- **C++, and a natively written Rust client.** The third-party `v4-client-cpp` covers a language CCXT does not ship at all, and `v4-client-rs` (maintained by Nethermind) is Rust written as Rust rather than generated into it.
- **Short-term versus long-term orders, spelled out.** `OrderFlags.SHORT_TERM` and `OrderFlags.LONG_TERM`, `good_til_block` versus `good_til_block_time`, and the client-generated order id are first-class arguments. dYdX's order lifecycle genuinely differs between the two, and the official client makes you choose deliberately.
- **A faucet client.** The Python package ships a faucet module for funding a testnet account, which is a small thing that saves a real detour.
- **Private indexer channels.** Subaccount order and fill streams are available through `IndexerSocket`. CCXT's dYdX implementation streams only order books, trades and candles.
- **`dydxjs` for low-level composition.** If you want to build and broadcast Cosmos and dYdX messages yourself with the proto and amino encoding handled, that is what it is for.

If you are building on dYdX as a chain — vaults, transfers, governance, anything beyond trading — the official clients are the better tool.

## Migrating from v4-client-py-v2 to CCXT

| What you are doing | v4-client-py-v2 | CCXT |
| --- | --- | --- |
| Clients | `NodeClient` + `IndexerClient` | one `ccxt.dydx` instance |
| Symbols | `"BTC-USD"` | `'BTC/USDC:USDC'` |
| Credentials | `Wallet.from_mnemonic(node, mnemonic, address)` | `{'walletAddress': 'dydx1...', 'privateKey': '0x...'}` |
| Markets | `indexer.markets.get_perpetual_markets()` | `load_markets()` |
| Order book | indexer order-book endpoint | `fetch_order_book()` |
| Ticker | indexer market payload | not unified — use `fetch_order_book()` or an implicit method |
| Candles | indexer candles endpoint | `fetch_ohlcv()` |
| New order | `node.place_order(wallet, market.order(...))` | `create_order()` |
| Cancel | `node.cancel_order(wallet, order_id, ...)` | `cancel_order()` / `cancel_orders()` |
| Open orders | indexer subaccount orders | `fetch_open_orders()` |
| Positions | indexer perpetual positions | `fetch_position()` / `fetch_positions()` |
| Balance | indexer subaccount / asset positions | `fetch_balance()` |
| Transfers | chain transfer message | `transfer()` / `fetch_transfers()` |
| Streams | `IndexerSocket` channels | `watch_order_book` / `watch_trades` / `watch_ohlcv` on `ccxt.pro.dydx` |
| Anything not listed | the raw endpoint or chain message | the same endpoint as an [implicit method](/docs/exchanges/dydx/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [dydx unified API reference](/docs/exchanges/dydx).

## FAQ

**Does CCXT sign dYdX v4 transactions itself, or do I need a Cosmos library?**
CCXT signs them itself. It protobuf-encodes the order message, looks up your account number and sequence, produces the secp256k1 signature over the sign doc and broadcasts the raw transaction to the node RPC. In Python it needs `protobuf` and `pycryptodome` installed for the encoding step; the other languages have it built in.

**What credentials does CCXT need for dYdX?**
`walletAddress` set to your dYdX chain address — the `dydx1...` one, not an Ethereum address — and a private key. If you pass an Ethereum key instead of a chain key, CCXT signs the onboarding action and derives the chain credentials from that signature, the same derivation the official clients use.

**Does CCXT stream dYdX private data (orders, fills)?**
No. CCXT implements three streaming methods for dYdX — order book, trades and candles — plus their `unWatch*` counterparts. Subaccount order and fill channels exist on dYdX's indexer socket but are not wrapped by CCXT; use `fetch_open_orders` and `fetch_my_trades`, or the indexer socket directly.

**Is the dYdX Python client MIT-licensed?**
The Python client's README says MIT, the repository badge says AGPL v3, and the actual `LICENSE` file in `dydxprotocol/v4-clients` grants MIT-style permissions conditioned on compliance with applicable law and dYdX's v4 Terms of Use. Read the file, and if it matters commercially, have counsel read it. CCXT is plain MIT.

**Does CCXT support dYdX testnet?**
Yes. `exchange.set_sandbox_mode(True)` swaps the indexer, node RPC and node REST hosts together.

**Is CCXT free?**
Yes. MIT-licensed, WebSocket support included, no paid tier.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [dydx unified API reference](/docs/exchanges/dydx)
- [dydx implicit API](/docs/exchanges/dydx/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — the `watch*` streaming methods
- [More comparisons](/docs/comparisons)
