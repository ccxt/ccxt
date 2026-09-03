<!-- title: CCXT vs the WOOFi Pro API and the Orderly Network connectors -->
<!-- description: CCXT compared with Orderly Network's official Python and JS connectors for WOOFi Pro on ed25519 signing, streaming, language coverage and unified structures. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: WOOFi Pro is a broker on Orderly Network, so its API is the Orderly EVM API. Orderly's own connectors are Python and a React-oriented JS monorepo; CCXT does the same ed25519 signing in seven languages, and WOOFi's docs point at it. -->
<!-- weight: 100 -->

# CCXT vs the WOOFi Pro API and the Orderly Network connectors

WOOFi Pro is an order-book perpetuals DEX built on [Orderly Network](https://orderly.network/), so "the WOOFi Pro API" is the Orderly EVM API. Orderly publishes its own connectors — [`orderly-evm-connector`](https://github.com/OrderlyNetwork/orderly-evm-connector-python) for Python and the [`js-sdk`](https://github.com/OrderlyNetwork/js-sdk) monorepo of `@orderly.network/*` packages — and WOOFi Pro is also implemented in [CCXT](/docs/manual) as the `woofipro` exchange.

Both speak the same endpoints and the same ed25519 signing scheme. The question that decides between them is: **are you building a WOOFi Pro front end, or a trading system that will eventually touch more than one venue?**

## TL;DR

- **Pick Orderly's own connectors** if you are building on Orderly itself rather than on one broker: registering accounts and Orderly keys from an EVM wallet, wiring a React trading UI, or calling broker-level endpoints one-for-one with the Orderly docs.
- **Pick CCXT** if WOOFi Pro is one venue in a system: you get 50 unified capabilities and 10 `watch*` streaming methods behind the same API that already covers 104 exchanges, in seven languages.
- **You are not choosing between them blind.** WOOFi Pro's own API-trading guide recommends CCXT and links to the [`woofipro` page](/docs/exchanges/woofipro), and CCXT still exposes all 115 raw Orderly endpoints as [implicit methods](/docs/exchanges/woofipro/implicit-api).

## At a glance

| | **CCXT** | **Orderly connectors** |
| --- | --- | --- |
| Exchanges covered | 104 (WOOFi Pro is one of them) | Orderly Network only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python (`orderly-evm-connector`); TypeScript/React (`@orderly.network/*`) |
| Packages to install | 1 (`ccxt`) | 1 for Python; a set of `@orderly.network/*` packages for JS |
| Unified market data + trading API | yes — 50 unified capabilities | no — Orderly's own request/response shapes |
| WebSockets | yes — 10 `watch*` methods | yes — `WebsocketPublicAPIClient` / `WebsocketPrivateAPIClient` |
| Raw endpoint access | yes — 115 endpoints as implicit methods | yes, it is the whole product |
| Built-in rate limiter | yes, per-endpoint weights, on by default (`rateLimit` 100 ms) | not a documented feature of the connector |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus Orderly error codes |
| Testnet / sandbox | `exchange.set_sandbox_mode(True)` | `orderly_testnet=True` constructor flag |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | `orderly-evm-connector-python` 14 stars · 987 PyPI installs/month; `js-sdk` 19 stars · `@orderly.network/hooks` 10.5k npm installs/month |
| Licence | MIT | MIT (Python connector) |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues, Orderly developer channels |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, Orderly Network's published connector repositories, and install counts from npm and PyPI.</sub>

## Credentials, before any code

WOOFi Pro does not use a plain API key and secret. Trading needs three values, created from the portfolio API-key screen: an **account id**, an **Orderly key** and an **Orderly secret**. Requests are signed with **ed25519** over `timestamp + METHOD + path + body`, base64 url-safe encoded, and sent as `orderly-account-id`, `orderly-key`, `orderly-timestamp` and `orderly-signature` headers.

CCXT models that directly:

```python
import ccxt

exchange = ccxt.woofipro({
    'apiKey': '...',       # Orderly key
    'secret': '...',       # Orderly secret
    'accountId': '0x...',  # Orderly account id
})
```

An EVM wallet private key is a separate, optional credential. CCXT only needs it for withdrawals, which Orderly requires you to sign as EIP-712 typed data against the `Orderly` domain with a withdraw nonce fetched from the API. CCXT builds that structure, fetches the nonce and signs it for you when you set `privateKey`.

## The same job, written both ways

### Fetch an order book

Note that on Orderly the order-book snapshot is a **private** endpoint, so both sides need credentials. The same is true of klines.

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.woofipro({
    'apiKey': '...', 'secret': '...', 'accountId': '0x...',
})
orderbook = exchange.fetch_order_book('BTC/USDC:USDC', 5)
print(orderbook['bids'][0], orderbook['asks'][0])
```

#### **orderly-evm-connector**

```python
from orderly_evm_connector.rest import Rest as Client

client = Client(
    orderly_key=orderly_key,
    orderly_secret=orderly_secret,
    orderly_account_id=orderly_account_id,
    orderly_testnet=False,
    timeout=5,
)
response = client.get_orderbook_snapshot("PERP_BTC_USDC", max_level=5)
print(response)
```

<!-- tabs:end -->

The CCXT call returns a [unified order book structure](/docs/manual#order-book-structure) — sorted `bids` and `asks` arrays of `[price, amount]` floats, a `timestamp` and a `nonce` — the same shape you get from every other exchange in the library. The connector returns Orderly's `{"success": true, "data": {"asks": [{"price": ..., "quantity": ...}]}}` envelope, which you unwrap and reshape yourself.

Symbols differ too: CCXT uses the unified `'BTC/USDC:USDC'` for a USDC-settled perpetual and translates it to Orderly's `PERP_BTC_USDC` on the wire.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.woofipro({
    'apiKey': '...', 'secret': '...', 'accountId': '0x...',
})
order = exchange.create_order('BTC/USDC:USDC', 'limit', 'buy', 0.01, 60000)
print(order['id'], order['status'])
```

#### **orderly-evm-connector**

```python
# same Client as above
response = client.create_order(
    symbol="PERP_NEAR_USDC",
    order_type="LIMIT",
    side="BUY",
    order_price=1.95,
    order_quantity=1,
)
```

<!-- tabs:end -->

CCXT returns a [unified order structure](/docs/manual#order-structure) with `id`, `status`, `filled`, `remaining`, `average` and `fee` already normalised, and it rounds the amount and price to the market's tick and step size first. It also implements `create_orders` for batch entry, `edit_order`, `cancel_orders` and `cancel_all_orders` against the same unified signatures.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.woofipro()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDC:USDC')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **orderly-evm-connector**

```python
from orderly_evm_connector.websocket.websocket_api import WebsocketPublicAPIClient

def message_handler(_, message):
    print(message)

wss_client = WebsocketPublicAPIClient(
    orderly_testnet=orderly_testnet,
    orderly_account_id=orderly_account_id,
    wss_id=wss_id,
    on_message=message_handler,
    on_close=on_close,
    debug=True,
)
wss_client.get_orderbook("PERP_BTC_USDC@orderbook")
```

<!-- tabs:end -->

`watch_order_book` returns exactly what `fetch_order_book` returns, so a polling loop becomes a stream by changing one word and nothing downstream changes. The connector is callback-shaped: you register handlers and parse topic strings yourself.

Underneath, CCXT handles the parts of the Orderly socket that are easy to get wrong: the public stream URL carries an account id as a path segment (CCXT substitutes yours, or a public default when you have none), the private stream at `wss://ws-private-evm.orderly.org` needs an ed25519-signed `auth` event before any subscription, and both need ping/pong keep-alive, reconnect and automatic re-subscribe. CCXT does all of that, and the bounded caches behind `watch_trades` and `watch_ohlcv` stop a long-running process growing without limit.

The 10 streaming methods on `ccxt.pro.woofipro` are `watchOrderBook`, `watchTicker`, `watchTickers`, `watchBidsAsks`, `watchOHLCV`, `watchTrades`, `watchOrders`, `watchMyTrades`, `watchPositions` and `watchBalance`.

## Where the differences actually bite

### Streaming fills a REST gap

Orderly's EVM API has no public 24-hour ticker REST endpoint of the kind most CEXes ship, so CCXT's `woofipro` reports `fetchTicker` and `fetchTickers` as unsupported. It does implement `watchTicker` and `watchTickers` over the socket. If you want a last price without opening a socket, `fetch_trades` and `fetch_funding_rates` are public REST calls and both are unified.

This is the kind of asymmetry that is invisible until you hit it. CCXT makes it explicit: `exchange.has['fetchTicker']` is `False`, `exchange.has['watchTicker']` is `True`, and you can branch on that programmatically instead of discovering it from an error.

### Portability is the whole point

Adding a second venue to an Orderly-connector integration means a second SDK, a second payload shape, a second symbol convention and a second error taxonomy. In CCXT the venue is a variable:

```python
for exchange_id in ['woofipro', 'hyperliquid', 'bybit', 'okx']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_trades('BTC/USDC:USDC')[-1]['price'])
```

WOOFi Pro's sibling venue, the centralised WOO X, is also in CCXT as `woo` — see [CCXT vs the WOO X API](/docs/comparisons/ccxt-vs-woo-api). WOOFi's own documentation notes the two APIs are similar; in CCXT they are two ids behind one set of method names.
### Seven languages, one API

The Python connector is Python. The JS SDK is TypeScript and React. CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java with identical method names and return structures.

<!-- tabs:start -->

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.woofipro ({ apiKey: '...', secret: '...', accountId: '0x...' });
const orderbook = await exchange.fetchOrderBook ('BTC/USDC:USDC');
```

#### **Python**

```python
import ccxt
exchange = ccxt.woofipro({'apiKey': '...', 'secret': '...', 'accountId': '0x...'})
orderbook = exchange.fetch_order_book('BTC/USDC:USDC')
```

<!-- tabs:end -->

### Testnet without a second code path

```python
exchange = ccxt.woofipro({'apiKey': '...', 'secret': '...', 'accountId': '0x...'})
exchange.set_sandbox_mode(True)   # swaps in testnet-api-evm.orderly.org and the testnet sockets
```

One flag swaps every REST and WebSocket URL together. `woofipro` is one of the CCXT exchanges that ships a working sandbox.

### Nothing is hidden — the implicit API

All 115 endpoints in the Orderly EVM API are generated as callable methods, so nothing the connectors can reach is out of bounds:

```python
# broker, campaign, referral, points, vault and delegate-signer endpoints, camelCased from their paths
info = exchange.v1_public_get_public_broker_name()
```

Signing, timestamping, rate-limit accounting and error mapping still apply. Browse them all on the [woofipro implicit API page](/docs/exchanges/woofipro/implicit-api).

## What the Orderly connectors do better

Real advantages, not padding:

- **Account and key onboarding.** Registering an Orderly account from an EVM wallet and adding an Orderly key is a first-class flow in Orderly's own tooling. CCXT assumes you already hold an account id, key and secret — the registration endpoints exist as implicit methods, but there is no unified helper that walks the wallet-signature steps for you.
- **A wallet and UI layer.** The `js-sdk` monorepo ships `@orderly.network/wallet-connector`, `@orderly.network/ui` and React hooks. If you are building a WOOFi Pro-style front end, that is most of the work already done. CCXT is a trading API with no wallet integration and no UI.
- **Broker-level and ecosystem endpoints, modelled.** Campaigns, points, referrals, broker fee-rate management, strategy vaults and delegate signers get named methods in the connector. CCXT reaches them through the implicit API but does not model them as unified calls.
- **Built for Orderly, not one broker.** The connectors take a broker id as a parameter and work against any Orderly-based DEX. CCXT's `woofipro` is written around WOOFi Pro specifically, down to the broker id used when signing withdrawals.

If you are building an Orderly-based exchange front end, or onboarding users from their wallets, Orderly's own SDKs are the right tool and CCXT is not a substitute for them.

## Migrating from the Orderly connectors to CCXT

| What you are doing | Orderly connector | CCXT |
| --- | --- | --- |
| Symbols | `'PERP_BTC_USDC'` | `'BTC/USDC:USDC'` |
| Credentials | `orderly_key`, `orderly_secret`, `orderly_account_id` | `apiKey`, `secret`, `accountId` |
| Testnet | `orderly_testnet=True` | `set_sandbox_mode(True)` |
| Markets | `get_futures_info_for_all_markets()` | `load_markets()` |
| Order book | `get_orderbook_snapshot()` | `fetch_order_book()` |
| Public trades | `get_market_trades()` | `fetch_trades()` |
| Candles | `get_kline()` | `fetch_ohlcv()` |
| Funding rates | `get_predicted_funding_rate_for_all_markets()` | `fetch_funding_rates()` |
| New order | `create_order()` | `create_order()` |
| Cancel order | `cancel_order()` | `cancel_order()` |
| Positions | account endpoints | `fetch_positions()` |
| Balance | `get_current_holding()` | `fetch_balance()` |
| Streams | `WebsocketPublicAPIClient` callbacks | `watch_*` on `ccxt.pro.woofipro` |
| Anything not listed | native method | the same endpoint as an [implicit method](/docs/exchanges/woofipro/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [woofipro unified API reference](/docs/exchanges/woofipro).

## FAQ

**Does CCXT support WOOFi Pro?**
Yes, as the exchange id `woofipro`. It is one of CCXT's certified exchanges, with 50 unified capabilities, 27 `fetch*` methods, 10 `watch*` streaming methods and all 115 raw Orderly endpoints exposed as implicit methods. WOOFi Pro's own API-trading guide recommends CCXT and links to the CCXT `woofipro` page.

**What credentials does CCXT need for WOOFi Pro?**
Three: `apiKey` (your Orderly key), `secret` (your Orderly secret) and `accountId` (your Orderly account id), all created from the WOOFi Pro portfolio API-key screen. A wallet `privateKey` is optional and only used for withdrawals, which Orderly requires to be signed as EIP-712 typed data.

**Why does `fetch_ticker` not work on woofipro?**
Orderly's EVM API does not expose the 24-hour ticker as a public REST endpoint, so `exchange.has['fetchTicker']` is `False`. Use `watch_ticker` on `ccxt.pro.woofipro` for a live ticker, or `fetch_trades` and `fetch_funding_rates` over REST — both are public and unified.

**Is WOOFi Pro the same as WOO X?**
No. WOO X is the centralised exchange (`woo` in CCXT); WOOFi Pro is the on-chain perpetuals DEX built on Orderly (`woofipro`). WOOFi's documentation notes that the two APIs are similar, and CCXT covers both behind the same unified method names — see [CCXT vs the WOO X API](/docs/comparisons/ccxt-vs-woo-api).

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.woofipro` and call `watch*` methods.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [woofipro unified API reference](/docs/exchanges/woofipro)
- [woofipro implicit API](/docs/exchanges/woofipro/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
