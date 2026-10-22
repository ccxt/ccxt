<!-- title: CCXT vs the bitbank API and python_bitbankcc -->
<!-- description: CCXT compared with bitbank's official Python, Node, Java and Ruby clients on signing, language coverage, streaming and unified structures for JPY spot. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: bitbank maintains its own clients in four languages, documented in Japanese and installed from Git. CCXT covers 15 unified capabilities and all 28 endpoints in eight languages — but implements no WebSocket support for this venue. -->
<!-- weight: 100 -->

# CCXT vs the bitbank API and python_bitbankcc

[bitbank](https://bitbank.cc/) is a Japanese exchange trading crypto against the yen, and it is unusually well served by its own tooling. The [bitbankinc](https://github.com/bitbankinc) GitHub organisation maintains [bitbank-api-docs](https://github.com/bitbankinc/bitbank-api-docs) — "Official Documentation for the bitbank.cc APIs and Streams", 126 stars — plus first-party clients in four languages: [python-bitbankcc](https://github.com/bitbankinc/python-bitbankcc) (66 stars, MIT), [node-bitbankcc](https://github.com/bitbankinc/node-bitbankcc) (TypeScript, 30 stars, MIT), [ruby_bitbankcc](https://github.com/bitbankinc/ruby_bitbankcc) (9 stars) and [java-bitbankcc](https://github.com/bitbankinc/java-bitbankcc) (6 stars).

That is a real vendor SDK situation, not an absence. The question that decides between them: **is bitbank the only venue you will ever touch, and is one of those four languages yours?**

## TL;DR

- **Pick bitbank's own client** if bitbank is your only venue, you work in Python, Node, Ruby or Java, and you want method names that match bitbank's own reference — or you need its **real-time streams**, which CCXT does not implement for this exchange.
- **Pick CCXT** if you want bitbank's spot markets behind the same API you use everywhere else, in eight languages, with rate limiting, precision handling and typed errors included.
- **Be clear about the gap:** `bitbank` in CCXT has **zero** `watch*` methods. bitbank documents both public and private streams; if you need them, that is code you write, or a reason to use the vendor client.

## At a glance

| | **CCXT** | **bitbank's official clients** |
| --- | --- | --- |
| Exchanges covered | 104 (bitbank is one of them) | bitbank only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | Python, Node/TypeScript, Ruby, Java — four separate codebases |
| Packages to install | **1** (`ccxt`) | one per language |
| Install route | `pip install ccxt`, `npm install ccxt`, and so on | `node-bitbankcc` is on npm; `python_bitbankcc`'s README recommends `pip install git+https://github.com/bitbankinc/python-bitbankcc@<commit_hash>` |
| Documentation language | English | Japanese (with English code samples) |
| Unified market data + trading API | yes — 15 capabilities on `bitbank` | no — bitbank's own payload shapes |
| WebSockets / streams | **no** — 0 `watch*` methods for `bitbank` | bitbank documents `public-stream` and `private-stream`; `node-bitbankcc`'s README covers REST |
| Raw endpoint access | yes — 28 endpoints as implicit methods | yes, it is the whole product |
| Auth modes | `ACCESS-NONCE` | `ACCESS-NONCE` **and** `ACCESS-TIME-WINDOW` |
| Built-in rate limiter | yes, on by default (`rateLimit` 100 ms, per-endpoint weights) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | bitbank error codes |
| Testnet / sandbox | none — bitbank publishes no sandbox | none |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** (one package, every venue) | `python-bitbankcc` 66 stars; `node-bitbankcc` 30 stars · 211 npm installs/month; `bitbank-api-docs` 126 stars |
| Licence | MIT | MIT |
| Support | Discord, Telegram, GitHub — usually same-day | GitHub issues on each repository |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `bitbankinc` GitHub organisation's repository listing, the `python-bitbankcc` README and `setup.py`, the `node-bitbankcc` README, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitbank()
ticker = exchange.fetch_ticker('BTC/JPY')
print(ticker['last'], ticker['baseVolume'])
```

#### **python_bitbankcc**

```python
import json
import python_bitbankcc

pub = python_bitbankcc.public()

value = pub.get_ticker('btc_jpy')
print(json.dumps(value))
```

<!-- tabs:end -->

bitbank's pair ids are lowercase and underscore-separated — `btc_jpy`, `eth_jpy`, `xrp_jpy`. CCXT maps them to unified symbols and returns a [unified ticker structure](/docs/manual#ticker-structure): the same keys, the same units, milliseconds for timestamps, and the same shape on the next exchange.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bitbank({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/JPY', 'limit', 'buy', 0.0001, 131594)
print(order['id'], order['status'])
```

#### **python_bitbankcc**

```python
import python_bitbankcc

prv = python_bitbankcc.private(API_KEY, API_SECRET, config={'auth_method': 'nonce'})

value = prv.order(
    'btc_jpy',   # pair
    '131594',    # price (None for a market order)
    '0.0001',    # amount
    'buy',       # side: buy | sell
    'limit',     # type: limit | market | stop | stop_limit
)
```

<!-- tabs:end -->

The vendor client's `order()` takes **positional arguments** in bitbank's own order, with prices and amounts as strings and further optional positional parameters after the type — `post_only`, `trigger_price`, and a margin position side. CCXT's `create_order(symbol, type, side, amount, price)` is the same signature you use on every other exchange, and returns a [unified order structure](/docs/manual#order-structure).

## Where the differences actually bite

### Three hosts, one client

bitbank splits public market data onto `public.bitbank.cc` and private trading onto `api.bitbank.cc`, with a third route for the pair list. CCXT models those as separate base URLs inside one exchange object, so `fetch_ticker` and `create_order` are calls on the same instance and `load_markets()` pulls the pair list without you knowing there was a third host.

### Signing, done once

CCXT signs bitbank requests with `ACCESS-KEY`, `ACCESS-NONCE` and `ACCESS-SIGNATURE`, where the signature is HMAC-SHA256 over the nonce concatenated with either the JSON body (POST) or the request path and query string (GET). That asymmetry between GET and POST is the part people get wrong on the first afternoon. You never write it.

### Rate limits with per-endpoint weights

CCXT sets `rateLimit = 100` ms for `bitbank` and carries per-endpoint weights taken from bitbank's own documented limits — the trading POST endpoints (`user/spot/order`, `user/spot/cancel_order`, `user/spot/orders_info`) are weighted more heavily than the read endpoints. The token-bucket throttler is on by default, so you write a loop and the library paces it.

### One error hierarchy

CCXT maps bitbank's numeric error codes onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. One `except ccxt.InsufficientFunds` keeps working when the order goes to a different venue.

### Precision, rounding and string math

`load_markets()` reads bitbank's `spot/pairs` metadata and exposes tick size, step size and minimum order size through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class. JPY prices for BTC run to seven figures while amounts run to eight decimals — precisely the range where float rounding starts producing rejected orders:

```python
amount = exchange.amount_to_precision('BTC/JPY', 0.00012345678)
price = exchange.price_to_precision('BTC/JPY', 13159412.3456)
```

### Eight languages, one API

bitbank's own clients cover Python, Node/TypeScript, Ruby and Java. CCXT covers TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java and Rust with **identical** method names and return structures, because it is one codebase transpiled rather than four codebases maintained in parallel:

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.bitbank()
ticker = exchange.fetch_ticker('BTC/JPY')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.bitbank ();
const ticker = await exchange.fetchTicker ('BTC/JPY');
```

#### **C#**

```csharp
var exchange = new ccxt.bitbank();
var ticker = await exchange.FetchTicker("BTC/JPY");
```

#### **Go**

```go
exchange := ccxt.NewBitbank(nil)
ticker, err := exchange.FetchTicker("BTC/JPY")
```

<!-- tabs:end -->

If your execution service is Go, PHP or C#, there is no bitbank client for it at all.

### Portability

A JPY book is one leg of a trade. In CCXT the exchange id is a variable, so pricing the other leg offshore is a configuration change rather than a second integration:

```python
import ccxt

print('bitbank', ccxt.bitbank().fetch_ticker('BTC/JPY')['last'])
for exchange_id in ['binance', 'kraken', 'okx']:
    exchange = getattr(ccxt, exchange_id)()
    print(exchange_id, exchange.fetch_ticker('BTC/USDT')['last'])
```

### Nothing is hidden — the implicit API

bitbank's API is compact: **28 endpoints**, and CCXT generates every one of them as a callable implicit method with signing, rate limiting and error mapping applied:

```python
# any raw bitbank endpoint, camelCased from its path
info = exchange.public_get_pair_circuit_break_info({'pair': 'btc_jpy'})
positions = exchange.private_get_user_margin_positions()
```

Browse them on the [bitbank implicit API page](/docs/exchanges/bitbank/implicit-api).

## What bitbank's own clients do better

An honest list, because these are real:

- **The real-time streams.** This is the decisive one. bitbank's documentation repository includes `public-stream.md` and `private-stream.md`, and CCXT implements **zero** `watch*` methods for `bitbank`. If you want live ticker, depth or order updates from this venue over a socket, CCXT will not give them to you — that is code you write against bitbank's own stream documentation.
- **`ACCESS-TIME-WINDOW` authentication.** `python_bitbankcc` supports both auth modes: a nonce, or a request timestamp with a time window (`'auth_method': 'request_time', 'time_window': 5000`). CCXT uses the nonce mode only. The time-window mode is friendlier when several processes share one API key, because it removes the strictly-increasing-nonce constraint.
- **Margin positions.** `python_bitbankcc` exposes `get_margin_positions()` directly, and its `order()` accepts a margin position side. CCXT's `bitbank` class declares spot only; margin positions are reachable only as the raw `user/margin/positions` implicit endpoint.
- **Endpoints CCXT does not model as unified methods.** Circuit-break info, deposit confirmation (`user/confirm_deposits`), unconfirmed deposits and deposit originators are unified-API gaps that the vendor client wraps directly.
- **Field-for-field fidelity with the Japanese documentation.** `btc_jpy`, `post_only`, `1hour` candle types — bitbank's docs and its clients use the same names, which removes a translation step when you are debugging. CCXT's unified names are a deliberate abstraction and one more hop.

If bitbank is your only venue, you need its streams, or you rely on margin, its own client is the better dependency.

## Migrating from python_bitbankcc to CCXT

| What you are doing | python_bitbankcc | CCXT |
| --- | --- | --- |
| Symbols | `'btc_jpy'` | `'BTC/JPY'` |
| Client | `python_bitbankcc.public()` + `.private(key, secret)` | one `ccxt.bitbank({'apiKey': ..., 'secret': ...})` |
| Pairs | `spot/pairs` | `load_markets()` |
| Ticker | `pub.get_ticker(pair)` | `fetch_ticker()` |
| Order book | `pub.get_depth(pair)` | `fetch_order_book()` |
| Trades | `pub.get_transactions(pair)` | `fetch_trades()` |
| Candles | `pub.get_candlestick(pair, '1hour', 'YYYYMMDD')` | `fetch_ohlcv()` |
| New order | `prv.order(pair, price, amount, side, type)` | `create_order()` |
| Cancel order | `prv.cancel_order(pair, order_id)` | `cancel_order()` |
| Order by id | `prv.get_order(pair, order_id)` | `fetch_order()` |
| Open orders | `prv.get_active_orders(pair)` | `fetch_open_orders()` |
| My trades | `prv.get_trade_history(pair, count)` | `fetch_my_trades()` |
| Balance | `prv.get_asset()` | `fetch_balance()` |
| Trading fees | asset payload | `fetch_trading_fees()` |
| Withdrawal address | `prv.get_withdrawal_account(asset)` | `fetch_deposit_address()` |
| Margin positions | `prv.get_margin_positions()` | raw `user/margin/positions` implicit method |
| Streams | bitbank's public and private stream docs | **not available in CCXT for `bitbank`** |
| Anything not listed | native method | the same endpoint as an [implicit method](/docs/exchanges/bitbank/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [bitbank unified API reference](/docs/exchanges/bitbank).

## FAQ

**Does CCXT support bitbank WebSockets?**
No. `bitbank` has zero `watch*` methods, so there is no `ccxt.pro.bitbank`. REST is fully covered — 15 unified capabilities and all 28 endpoints — but bitbank's documented public and private streams are not implemented. If streaming is a requirement, use bitbank's own stream documentation or one of its clients.

**Is there an official bitbank SDK?**
Yes, four of them — Python, Node/TypeScript, Ruby and Java, all under the `bitbankinc` GitHub organisation and all maintained. Note that `python_bitbankcc` is not distributed on PyPI: its README recommends installing from GitHub pinned to a commit hash. `node-bitbankcc` is on npm.

**How does CCXT authenticate with bitbank?**
It sends `ACCESS-KEY`, `ACCESS-NONCE` and `ACCESS-SIGNATURE`, where the signature is HMAC-SHA256 over the nonce plus the JSON body for POST requests, or the nonce plus the path and query string for GET requests. CCXT does not currently use bitbank's alternative `ACCESS-TIME-WINDOW` mode.

**Does CCXT cover bitbank margin trading?**
Not as unified methods. `bitbank` declares spot only. The `user/margin/positions` endpoint is reachable as an implicit method returning bitbank's raw payload.

**Does bitbank have a testnet?**
No sandbox environment is published, so `set_sandbox_mode(True)` has nothing to point at for `bitbank`. Test against CCXT's offline static fixtures and small live orders.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support for the 76 exchanges that have it.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bitbank unified API reference](/docs/exchanges/bitbank)
- [bitbank implicit API](/docs/exchanges/bitbank/implicit-api) — every raw endpoint
- [More comparisons](/docs/comparisons)
