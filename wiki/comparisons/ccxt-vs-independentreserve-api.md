<!-- title: CCXT vs the Independent Reserve API -->
<!-- description: Independent Reserve publishes an official .NET client only. CCXT compared with it and the raw REST API on languages, signing, rate limits and streaming. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Independent Reserve's only official client library is for .NET. CCXT covers the same API in eight languages, handles its unusual comma-joined HMAC signing, and adds order-book and trade streaming. -->
<!-- weight: 100 -->

# CCXT vs the Independent Reserve API

Independent Reserve is an Australian and New Zealand exchange with a JSON-over-HTTP API: public data on `GET`, private calls on `POST`, and an HMAC-SHA256 signature over a comma-joined, order-sensitive parameter string. It also runs a WebSocket service for order and trade events.

On the client side, Independent Reserve maintains **one** client library, and it is for .NET (`IndependentReserve.Client`, Apache-2.0, .NET Standard 2.0), plus an iOS sample client in Objective-C. Its WebSocket repository is documentation and JavaScript samples rather than a library. The Node.js, PHP, Java, Python and Rust wrappers listed on its API page are third-party-authored.

So the question is: **do you write C#, or do you write something else?**

## TL;DR

- **Pick `IndependentReserve.Client`** if you work in .NET, Independent Reserve is your only venue, and you want the vendor's own request and response models — including the choice between nonce-based and timestamp-based expiry.
- **Pick CCXT** if you write in anything else — Python, TypeScript, PHP, Go, Java or JavaScript have no official client — or if Independent Reserve is one venue among several.
- **Choosing CCXT does not hide the API.** All 39 Independent Reserve endpoints are generated as [implicit methods](/docs/exchanges/independentreserve/implicit-api), signed and rate-limited like any unified call.

## At a glance

| | **CCXT** | **Independent Reserve's own clients** |
| --- | --- | --- |
| Exchanges covered | 104 (Independent Reserve is one of them) | Independent Reserve only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust — one API | **C#/.NET only** (plus an Objective-C iOS sample client) |
| Packages to install | 1 (`ccxt`) | 1 (`IndependentReserve.Client` on NuGet) |
| Unified market data + trading API | yes — 18 unified capabilities, 11 `fetch*` methods | no — Independent Reserve's own request and response shapes |
| WebSockets | yes — `watchOrderBook` and `watchTrades` | not in the .NET client; the WebSocket repository is documentation plus JavaScript samples |
| Raw endpoint access | yes — 39 endpoints as implicit methods | yes, it wraps the public and private methods |
| Signing handled | yes — comma-joined, order-sensitive HMAC-SHA256 | yes, with `expiryMode` selectable as `Nonce` or `Timestamp` |
| Built-in rate limiter | yes, on by default (`rateLimit` 1000 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus Independent Reserve error codes |
| Testnet / sandbox | **no** — the venue publishes none, `set_sandbox_mode(True)` raises `NotSupported` | none |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | the `dotNetApiClient` repository shows 6 GitHub stars |
| Licence | MIT | Apache-2.0 |
| Support | Discord, Telegram, GitHub issues — usually same-day | GitHub issues, Independent Reserve support |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `independentreserve` GitHub organisation and Independent Reserve's published API page.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.independentreserve()
ticker = exchange.fetch_ticker('BTC/AUD')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw Independent Reserve API**

```python
import requests

url = 'https://api.independentreserve.com/Public/GetMarketSummary'
response = requests.get(url, params={
    'primaryCurrencyCode': 'xbt',
    'secondaryCurrencyCode': 'aud',
})
response.raise_for_status()
print(response.json())
```

<!-- tabs:end -->

Note `xbt`. Independent Reserve uses `Xbt` as its currency code for Bitcoin, and pairs are split across two query parameters rather than one symbol string. CCXT maps that onto `'BTC/AUD'` and returns a [unified ticker structure](/docs/manual#ticker-structure) with the same keys and units every other exchange returns.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.independentreserve({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/AUD', 'limit', 'buy', 0.001, 90000)
print(order['id'], order['status'])
```

#### **Raw Independent Reserve API**

```python
import hashlib
import hmac
import json
import time
import requests

api_key = '...'
secret = '...'
url = 'https://api.independentreserve.com/Private/PlaceLimitOrder'
nonce = int(time.time() * 1000)

params = {
    'primaryCurrencyCode': 'Xbt',
    'secondaryCurrencyCode': 'Aud',
    'orderType': 'LimitBid',
    'price': 90000,
    'volume': 0.001,
}

# the signed message is a comma-joined string, and the ORDER of the parts matters
parts = [url, f'apiKey={api_key}', f'nonce={nonce}']
parts += [f'{k}={v}' for k, v in params.items()]
signature = hmac.new(secret.encode(), ','.join(parts).encode(),
                     hashlib.sha256).hexdigest().upper()

body = {'apiKey': api_key, 'nonce': nonce, 'signature': signature, **params}
response = requests.post(url, data=json.dumps(body),
                         headers={'Content-Type': 'application/json'})
response.raise_for_status()
print(response.json())
```

<!-- tabs:end -->

That comment is the whole point. Independent Reserve signs a **comma-joined string whose element order must match the order of the fields in the body**, prefixed by the full URL, with the signature upper-cased. Get the ordering wrong and you get an authentication failure with no hint as to why. CCXT builds that string for you on every private call, and `'LimitBid'` versus `'LimitOffer'` is derived from the unified `side` argument rather than something you look up.

## Where the differences actually bite

### Eight languages, one API

This is the decisive difference. The only official client is for .NET. If you write Python, TypeScript, PHP, Go, Java or JavaScript, your maintained options are CCXT or your own wrapper — the community libraries on Independent Reserve's API page are third-party-authored, with no vendor commitment behind them.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.independentreserve()
ticker = exchange.fetch_ticker('BTC/AUD')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.independentreserve ();
const ticker = await exchange.fetchTicker ('BTC/AUD');
```

#### **PHP**

```php
$exchange = new \ccxt\independentreserve();
$ticker = $exchange->fetch_ticker('BTC/AUD');
```

#### **C#**

```csharp
var exchange = new ccxt.independentreserve();
var ticker = await exchange.FetchTicker("BTC/AUD");
```

#### **Go**

```go
exchange := ccxt.NewIndependentreserve(nil)
ticker, err := exchange.FetchTicker("BTC/AUD")
```

<!-- tabs:end -->

### Fiat pairs and currency-code translation

Independent Reserve quotes in AUD, NZD, USD and SGD, and uses its own currency codes (`Xbt` for Bitcoin, for instance) split across `primaryCurrencyCode` and `secondaryCurrencyCode` parameters. CCXT resolves all of that through `load_markets()` and gives you ordinary unified symbols — `'BTC/AUD'`, `'ETH/NZD'` — so an AUD-denominated strategy reads the same as a USDT-denominated one on another venue.

### Streaming, with two methods

CCXT Pro — bundled in the same `ccxt` package, no separate purchase — gives Independent Reserve two streaming methods, `watchOrderBook` and `watchTrades`, over `wss://websockets.independentreserve.com`:

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.independentreserve()
    while True:
        orderbook = await exchange.watch_order_book('BTC/AUD')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

`watch_order_book` returns the same structure as `fetch_order_book`, so switching a polling loop to a stream is a one-word change. The vendor's WebSocket material is a specification plus JavaScript samples — you would be assembling the snapshot-plus-event merge, gap detection and reconnect logic yourself. There are no `watchTicker`, `watchOrders` or `watchBalance` methods for this venue in CCXT; those still need polling.

### Rate limits and a slow-by-default throttle

CCXT sets `rateLimit = 1000` ms for Independent Reserve — one request per second — and the token-bucket throttler is on by default (`enableRateLimit = true`). That is a deliberately conservative pace for a venue that documents caching rather than published per-endpoint quotas. You call methods in a loop; the library paces them.

### Precision and string math

CCXT loads Independent Reserve's minimum order volumes and price precision and gives you `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities do not drift through float rounding.

```python
amount = exchange.amount_to_precision('BTC/AUD', 0.0012345678)
price = exchange.price_to_precision('BTC/AUD', 91234.56789)
```

### One error hierarchy

CCXT maps Independent Reserve's failures onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 35 more, all under `BaseError`. `except ccxt.InsufficientFunds` keeps working when you add a second exchange.

### No sandbox, on either side

Independent Reserve publishes no test environment, so `exchange.set_sandbox_mode(True)` raises `NotSupported`. Plan to validate against a small live account, and use CCXT's [static request and response fixtures](/docs/manual) for regression testing.

### Nothing is hidden — the implicit API

Alongside the 18 unified capabilities, all 39 endpoints in CCXT's Independent Reserve `api` block are generated as callable implicit methods, camelCased from their paths:

```python
fx = exchange.public_get_get_fx_rates()
minimums = exchange.public_get_get_order_minimum_volumes()
fees = exchange.private_post_get_brokerage_fees()
```

Signing, nonce handling, rate-limit accounting and error mapping still apply. Browse them on the [Independent Reserve implicit API page](/docs/exchanges/independentreserve/implicit-api).

## What Independent Reserve's own client does better

An honest list, because these are real:

- **It is the vendor's .NET client, with the vendor's own models.** `IndependentReserve.Client` targets .NET Standard 2.0 and encapsulates the public and private methods with Independent Reserve's own types. If you are on .NET and want request objects that mirror the API reference exactly, that is a real advantage over CCXT's unified structures.
- **Selectable expiry mode.** The .NET client lets you switch between `Nonce` and `Timestamp` expiry for request authentication. CCXT signs with a nonce; the timestamp mode is not exposed as a unified option.
- **A working sample application.** The repository ships a WPF sample that demonstrates the calls and their responses end to end, which is a fast way to see what an endpoint actually returns before you write against it.
- **Endpoints CCXT does not unify.** Fiat bank accounts, fiat withdrawal requests, deposit-address synchronisation with the blockchain, and the currency configuration endpoints are Independent Reserve specifics. CCXT reaches them as raw implicit calls, but they are not unified methods with typed structures.

If you build on .NET and Independent Reserve is your only venue, the official client is a defensible choice.

## Migrating from the Independent Reserve API to CCXT

| What you are doing | Independent Reserve REST | CCXT |
| --- | --- | --- |
| Symbols | `primaryCurrencyCode=Xbt` + `secondaryCurrencyCode=Aud` | `'BTC/AUD'` |
| Currency list | `/Public/GetValidPrimaryCurrencyCodes` and `/Public/GetValidSecondaryCurrencyCodes` | `load_markets()` (`fetch_currencies` is not supported here) |
| Ticker | `/Public/GetMarketSummary` | `fetch_ticker()` |
| Order book | `/Public/GetOrderBook` | `fetch_order_book()` |
| Public trades | `/Public/GetRecentTrades` | `fetch_trades()` |
| Minimum sizes | `/Public/GetOrderMinimumVolumes` | market metadata from `load_markets()` |
| New limit order | `/Private/PlaceLimitOrder` | `create_order(..., 'limit', ...)` |
| New market order | `/Private/PlaceMarketOrder` | `create_order(..., 'market', ...)` |
| Cancel order | `/Private/CancelOrder` | `cancel_order()` |
| Open orders | `/Private/GetOpenOrders` | `fetch_open_orders()` |
| Closed orders | `/Private/GetClosedOrders` | `fetch_closed_orders()` |
| Order detail | `/Private/GetOrderDetails` | `fetch_order()` |
| My trades | `/Private/GetTrades` | `fetch_my_trades()` |
| Balance | `/Private/GetAccounts` | `fetch_balance()` |
| Deposit address | `/Private/GetDigitalCurrencyDepositAddress2` | `fetch_deposit_address()` |
| Streams | the WebSocket specification and JS samples | `watch_order_book()` / `watch_trades()` on `ccxt.pro.independentreserve` |
| Anything not listed | the raw endpoint | the same endpoint as an [implicit method](/docs/exchanges/independentreserve/implicit-api) |

## FAQ

**Does Independent Reserve have an official Python or JavaScript SDK?**
No. The only official client library is `IndependentReserve.Client` for .NET, alongside an Objective-C iOS sample client. The WebSocket repository is documentation plus JavaScript samples, not a library. The Node.js, PHP, Java, Python and Rust wrappers listed on Independent Reserve's API page are third-party-authored. CCXT is the maintained multi-language option.

**Does CCXT support Independent Reserve's AUD and NZD pairs?**
Yes. CCXT maps Independent Reserve's `primaryCurrencyCode`/`secondaryCurrencyCode` pair — including its `Xbt` code for Bitcoin — onto ordinary unified symbols such as `'BTC/AUD'` and `'ETH/NZD'`. Call `load_markets()` and read the symbols from it.

**Does Independent Reserve have a testnet?**
No. The venue publishes no sandbox, so `set_sandbox_mode(True)` raises `NotSupported` in CCXT. Test against a small live account.

**Does CCXT stream Independent Reserve data?**
Partly. `ccxt.pro.independentreserve` supports `watch_order_book` and `watch_trades`. There are no `watchTicker`, `watchOrders`, `watchMyTrades` or `watchBalance` methods for this venue — poll the corresponding `fetch*` methods instead.

**Why does my hand-rolled Independent Reserve signature keep failing?**
Because the signed message is a comma-joined string whose element order must match the order of the fields you send, prefixed with the full request URL, and the resulting hex digest must be upper-cased. It is easy to get subtly wrong. CCXT builds it for you on every private call.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [independentreserve unified API reference](/docs/exchanges/independentreserve)
- [independentreserve implicit API](/docs/exchanges/independentreserve/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
