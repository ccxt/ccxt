<!-- title: CCXT vs the Pacifica API and the Pacifica Python examples -->
<!-- description: Pacifica signs every write with a Solana Ed25519 key over sorted JSON. Compare its Python examples repo with CCXT on signing, coverage, streaming and rate limits. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Pacifica's "Python SDK" is an examples repository, not an installable package. CCXT implements the same Ed25519 sorted-JSON signing as a library, with 59 unified capabilities, 13 watch*/unWatch* methods and credit-aware rate limiting. -->
<!-- weight: 100 -->

# CCXT vs the Pacifica API and the Pacifica Python examples

[Pacifica](https://www.pacifica.fi) is a Solana-based perpetuals DEX. Every state-changing request is signed with a Solana Ed25519 key: you build a header of `{type, timestamp, expiry_window}`, nest your payload under `data`, sort the JSON keys recursively, serialise it compactly, sign the bytes, and base58-encode the signature.

The client library Pacifica's own [API documentation](https://docs.pacifica.fi/api-documentation/api) points at is [`pacifica-fi/python-sdk`](https://github.com/pacifica-fi/python-sdk). Read on the day this page was written, it is an **examples repository**, not a package: `rest/`, `ws/` and `common/` folders, a `requirements.txt`, no releases, no PyPI distribution, and a README whose instructions are "Modify the `PRIVATE_KEY` in the desired example file… run `python3 -m rest.create_market_order`". It is actively maintained — 40 commits, most recent in February 2026 — and it is genuinely useful as a reference for the signing scheme. It is not a dependency you install.

[CCXT](/docs/manual) implements the same signing scheme as a library, behind method names shared with 103 other venues. The question: **do you want to copy the reference implementation into your codebase, or import one?**

## TL;DR

- **Use Pacifica's examples** if you are learning the signing scheme, want a one-file-per-endpoint reference alongside the docs, or need something CCXT does not do — hardware-wallet signing in particular.
- **Pick CCXT** if you want an installable dependency: 59 unified capabilities, 13 `watch*` / `unWatch*` streaming methods, credit-aware rate limiting and testnet support, in eight languages.
- **The cryptography is identical.** CCXT's `sortJsonKeys` / `prepareMessage` / `signMessage` produce the same bytes as the examples' `sort_json_keys` / `prepare_message` / `sign_message`, including agent-wallet support. The choice is about packaging and coverage, not signing.

## At a glance

| | **CCXT** | **`pacifica-fi/python-sdk`** |
| --- | --- | --- |
| Exchanges covered | 104 (Pacifica is one of them) | Pacifica only |
| Distribution | `pip install ccxt`, `npm install ccxt`, … | clone the repository; no PyPI package, no releases |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | Python only |
| Unified market data + trading API | yes — same method names across every exchange | no — one script per endpoint |
| Unified capabilities implemented | 59 for `pacifica`, of which 24 are `fetch*` | n/a |
| Symbols | `'BTC/USDC:USDC'` | `"BTC"` |
| Credentials | `privateKey` (base58 Solana key); agent wallets via `options['agentAddress']` | `PRIVATE_KEY` edited into each script |
| Hardware wallet signing | no | yes — `sign_with_hardware_wallet()` shells out to `solana sign-offchain-message` |
| WebSockets | yes — 7 `watch*` plus 6 `unWatch*` methods | yes — raw `websockets` connections, one script per subscription |
| Raw endpoint access | yes — 67 endpoints as implicit methods | it is all raw |
| Built-in rate limiter | yes, on by default (`rateLimit` 600 ms) with Pacifica's fractional credit costs modelled | none |
| Unified error types | yes — 41 typed exceptions in one hierarchy | raw `requests` responses; you check `status_code` |
| Testnet | `set_sandbox_mode(True)` swaps in `test-api.pacifica.fi` and `test-ws.pacifica.fi` | change the constant |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | 18 GitHub stars, 23 forks, 40 commits |
| Licence | MIT | no licence file in the repository |
| Support | Discord, Telegram, GitHub — usually same-day | GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `pacifica-fi/python-sdk` repository (README, `rest/`, `ws/`, `common/utils.py`, commit history) and Pacifica's published API and rate-limit documentation.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.pacifica()
tickers = exchange.fetch_tickers(['BTC/USDC:USDC'])
print(tickers['BTC/USDC:USDC']['last'])
```

#### **pacifica-fi/python-sdk**

```python
import requests

REST_URL = "https://api.pacifica.fi/api/v1"

response = requests.get(f"{REST_URL}/info/prices").json()
print(response)
```

<!-- tabs:end -->

CCXT returns a [unified ticker structure](/docs/manual#ticker-structure) keyed by unified symbol — the same keys, types and units you get from Binance or Hyperliquid — with `"BTC"` translated to and from `'BTC/USDC:USDC'`.

### Place a market order

This is where the difference is largest, because Pacifica's write path is a signing exercise.

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.pacifica({'privateKey': '...'})   # base58 Solana key
order = exchange.create_order('BTC/USDC:USDC', 'market', 'buy', 0.1)
print(order['id'], order['status'])
```

#### **pacifica-fi/python-sdk**

```python
import time, uuid, requests
from solders.keypair import Keypair

from common.constants import REST_URL
from common.utils import sign_message

API_URL = f"{REST_URL}/orders/create_market"
PRIVATE_KEY = ""

keypair = Keypair.from_base58_string(PRIVATE_KEY)
public_key = str(keypair.pubkey())
timestamp = int(time.time() * 1_000)

signature_header = {
    "timestamp": timestamp,
    "expiry_window": 5_000,
    "type": "create_market_order",
}
signature_payload = {
    "symbol": "BTC",
    "reduce_only": False,
    "amount": "0.1",
    "side": "bid",
    "slippage_percent": "0.5",
    "client_order_id": str(uuid.uuid4()),
}
message, signature = sign_message(signature_header, signature_payload, keypair)

request = {
    "account": public_key,
    "signature": signature,
    "timestamp": signature_header["timestamp"],
    "expiry_window": signature_header["expiry_window"],
    **signature_payload,
}
response = requests.post(API_URL, json=request,
                         headers={"Content-Type": "application/json"})
```

<!-- tabs:end -->

That second snippet is the example file verbatim, and it is not padding — every write endpoint in the repository repeats that structure with a different `type` and payload. The parts that must be exactly right are the header field names, the recursive key sort, the compact JSON separators, and the base58 encoding of the signature. CCXT implements all of it (`sortJsonKeys`, `prepareMessage`, `signMessage`), including the agent-wallet path where a delegated key signs while `walletAddress` stays the main account:

```python
exchange = ccxt.pacifica({
    'privateKey': '...',            # agent key
    'walletAddress': '...',         # main account address
    'options': {'agentAddress': '...'},
})
```

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.pacifica()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDC:USDC')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **pacifica-fi/python-sdk**

```python
import asyncio, json, websockets

from common.constants import WS_URL

async def exec_main():
    async with websockets.connect(WS_URL, ping_interval=30) as websocket:
        ws_message = {"method": "subscribe", "params": {"source": "prices"}}
        await websocket.send(json.dumps(ws_message))
        async for message in websocket:
            print(json.loads(message))

asyncio.run(exec_main())
```

<!-- tabs:end -->

The example is a raw socket with a ping interval. What it does not have — because it is an example, not a library — is reconnect, resubscribe-after-reconnect, order-book snapshot/delta merging, gap detection or a bounded cache. Those are the parts that do not fail loudly: a hand-rolled book does not throw, it drifts, and you find out from a fill you did not expect.

CCXT implements 7 streaming methods for `pacifica` — `watchOrderBook`, `watchTrades`, `watchOHLCV`, `watchTicker`, `watchTickers`, `watchOrders` and `watchMyTrades` — plus 6 matching `unWatch*` methods for tearing subscriptions down cleanly. `watch_order_book` returns the same [order book structure](/docs/manual#order-book-structure) as `fetch_order_book`.

## Where the differences actually bite

### Rate limits modelled as credits, not requests

Pacifica does not meter requests; it meters **credits**. Its documentation gives an unidentified IP 125 credits per 60 seconds and a valid API config key 300, rising with fee tier to 40,000 at VIP3. Standard requests cost 1 credit, **order cancellations cost 0.5**, and heavy GETs cost 1–3 or 3–12 depending on whether you are identified. When the bucket empties you get HTTP 429.

CCXT encodes that. `rateLimit` is 600 ms, the throttler is on by default, and the per-endpoint cost function models the fractional cancel cost and the identified-versus-anonymous heavy-GET difference, so a cancel-heavy strategy is not paced as though every call cost the same.

WebSocket limits are documented too — a maximum of 300 concurrent connections per IP and 20 subscriptions per channel per connection. CCXT pools one client per URL and multiplexes subscriptions over it, so a strategy watching thirty symbols does not open thirty sockets.

### One error hierarchy

CCXT maps Pacifica's error responses onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. The examples hand you a `requests.Response` and print `status_code`.

### Precision, rounding and string math

Pacifica publishes `tick_size`, `lot_size`, `min_order_size` and `max_order_size` per market. `load_markets()` loads them, and CCXT exposes them through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities never drift through float rounding into a rejected order:

```python
amount = exchange.amount_to_precision('BTC/USDC:USDC', 0.0012345678)
price = exchange.price_to_precision('BTC/USDC:USDC', 61234.56789)
```

### Coverage beyond order entry

The unified surface for `pacifica` is 59 capabilities, including `fetchPositions`, `fetchLeverage` / `setLeverage`, `fetchMarginMode` / `setMarginMode`, `fetchFundingRates` and `fetchFundingRateHistory`, `fetchOpenInterest` / `fetchOpenInterests`, `fetchLedger`, `fetchTradingFee`, `createOrders`, `editOrder`, `cancelOrders` and `createOrderWithTakeProfitAndStopLoss` — each returning a unified structure. Reproducing that from the examples means one signing block per operation.

### Eight languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures — including the Ed25519 signing, which is base-class code rather than something you re-derive per language.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.pacifica()
tickers = exchange.fetch_tickers(['BTC/USDC:USDC'])
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.pacifica ();
const tickers = await exchange.fetchTickers (['BTC/USDC:USDC']);
```

#### **Go**

```go
exchange := ccxt.NewPacifica(nil)
markets, err := exchange.LoadMarkets()
```

<!-- tabs:end -->

### Testnet without a second code path

```python
exchange = ccxt.pacifica({'privateKey': '...'})
exchange.set_sandbox_mode(True)   # test-api.pacifica.fi and test-ws.pacifica.fi
```

### Nothing is hidden — the implicit API

Alongside the 59 unified capabilities, **all 67 endpoints in the API definition are generated as callable implicit methods**, with signing, rate-limit accounting and error mapping applied. Browse them on the [pacifica implicit API page](/docs/exchanges/pacifica/implicit-api).

## What Pacifica's examples repository does better

An honest list, and some of these are real gaps:

- **Hardware-wallet signing.** `common/utils.py` includes `sign_with_hardware_wallet()`, which shells out to `solana sign-offchain-message` with a Ledger keypath. CCXT signs with an in-process base58 private key and has no hardware-wallet path, so if your keys live on a Ledger, the examples are the reference and CCXT is not an option.
- **It is the canonical reference for the signing scheme.** When you need to know exactly what bytes get signed, reading `prepare_message()` and `sign_message()` is more direct than reading a transpiled library.
- **New endpoints appear there first.** Pacifica writes the API and the examples. Subaccount creation, leverage updates and other recent additions show up as example scripts as they ship, ahead of any unified wrapper.
- **One file per operation is a good teaching shape.** `rest/create_market_order.py` shows the whole request — header, payload, signature, HTTP call — on one screen. A library necessarily hides that.
- **A far smaller footprint.** `requests` plus `solders` plus `base58` is a much smaller dependency set than a library covering 104 exchanges.

If Pacifica is your only venue, you are in Python, and especially if you sign with a hardware wallet, working from the examples is the right call.

## Migrating from the Pacifica examples to CCXT

| What you are doing | Pacifica examples | CCXT |
| --- | --- | --- |
| Symbols | `"BTC"` | `'BTC/USDC:USDC'` |
| Credentials | `PRIVATE_KEY` in each script | `ccxt.pacifica({'privateKey': '...'})` |
| Signing | `sign_message(header, payload, keypair)` | handled inside every private method |
| Markets | `GET /info` | `load_markets()` |
| Prices | `GET /info/prices` | `fetch_tickers()` |
| Order book | `GET /book` | `fetch_order_book()` |
| Candles | `GET /kline` | `fetch_ohlcv()` |
| Public trades | `GET /trades` | `fetch_trades()` |
| Market order | `POST /orders/create_market` | `create_order(symbol, 'market', side, amount)` |
| Limit order | `POST /orders/create` | `create_order(symbol, 'limit', side, amount, price)` |
| Cancel order | `POST /orders/cancel` | `cancel_order()` |
| Cancel all | `POST /orders/cancel_all` | `cancel_all_orders()` |
| Edit order | `POST /orders/edit` | `edit_order()` |
| Open orders | `GET /orders` | `fetch_open_orders()` |
| Positions | `GET /positions` | `fetch_positions()` |
| Balance | `GET /account` | `fetch_balance()` |
| Leverage | `POST /account/leverage` | `fetch_leverage()` / `set_leverage()` |
| Margin mode | `POST /account/margin` | `fetch_margin_mode()` / `set_margin_mode()` |
| Funding | `GET /funding_rate/history`, `GET /funding/history` | `fetch_funding_rates()` / `fetch_funding_rate_history()` / `fetch_funding_history()` |
| Streams | raw `websockets` subscription per script | `watch_*` / `un_watch_*` on `ccxt.pro.pacifica` |
| Testnet | uncomment the testnet `REST_URL` / `WS_URL` constants | `set_sandbox_mode(True)` |
| Anything not listed | raw signed call | the same endpoint as an [implicit method](/docs/exchanges/pacifica/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [pacifica unified API reference](/docs/exchanges/pacifica).

## FAQ

**Does Pacifica have an official SDK I can pip install?**
Not as of this writing. `pacifica-fi/python-sdk` — the repository Pacifica's own documentation links to — is an examples repository: it has `rest/`, `ws/` and `common/` folders and a `requirements.txt`, but no releases and no PyPI package. CCXT is an installable dependency that implements the same API.

**How does Pacifica authentication work, and does CCXT handle it?**
Yes. Pacifica signs each write with a Solana Ed25519 key over a compact, recursively key-sorted JSON message of `{type, timestamp, expiry_window, data}`, base58-encoding the signature. CCXT implements exactly that, including agent wallets: pass the agent key as `privateKey`, the main account as `walletAddress`, and the agent address in `options['agentAddress']`.

**Can CCXT sign Pacifica orders with a Ledger?**
No. CCXT signs with an in-process base58 private key. Pacifica's examples include a `sign_with_hardware_wallet()` helper that shells out to the Solana CLI's `sign-offchain-message`; there is no equivalent in CCXT.

**Does CCXT support Pacifica WebSockets?**
Yes — 7 `watch*` methods (order book, trades, OHLCV, ticker, tickers, orders, own trades) and 6 matching `unWatch*` methods, with reconnection, resubscription and order-book merging handled for you.

**Does CCXT respect Pacifica's credit-based rate limits?**
Yes. The throttler is on by default and the per-endpoint cost function models Pacifica's published weights, including the 0.5-credit cost of a cancellation and the different cost of heavy GETs with and without an API config key.

**Can I test on Pacifica's testnet?**
Yes. `exchange.set_sandbox_mode(True)` swaps in `test-api.pacifica.fi` and `test-ws.pacifica.fi` in one call.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [pacifica unified API reference](/docs/exchanges/pacifica)
- [pacifica implicit API](/docs/exchanges/pacifica/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
