<!-- title: CCXT vs the raw NDAX API -->
<!-- description: NDAX publishes no official SDK — its AlphaPoint-based API is documentation only. Compare hand-rolling nonce/HMAC auth, OMS ids and 2FA against CCXT's ndax class. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: NDAX ships documentation, not a client library. The comparison is CCXT's ndax class against writing the AlphaPoint auth handshake, OMS-id plumbing, 2FA sign-in and reconnect logic yourself. -->
<!-- weight: 100 -->

# CCXT vs the raw NDAX API

[NDAX](https://ndax.io) is a Canadian exchange with CAD and USDT markets. Its API is documented at [apidoc.ndax.io](https://apidoc.ndax.io/), which describes version 3.3 of the NDAX Exchange software — an [AlphaPoint](https://apidoc.ndax.io/) deployment, with the AlphaPoint conventions that come with it: an OMS id required on nearly every call, a WebSocket-first frame format, and an authentication handshake that can end in a session token rather than a per-request signature.

NDAX does not publish a client library. The repositories under its GitHub organisation are documentation — [`NDAXlO/ndax-api-documentation`](https://github.com/NDAXlO/ndax-api-documentation) is a two-commit reference for the WebSocket API with no code in it — and neither the API reference nor those repositories link to an official SDK in any language. The only third-party client this comparison found is [`RobJohnston/Ndax.Api`](https://github.com/RobJohnston/Ndax.Api), an unaffiliated .NET Standard library, MIT-licensed, with no stars and 18 commits.

So the honest comparison here is not CCXT against a vendor SDK. It is **CCXT against the code you would write yourself**.

## TL;DR

- **Write it yourself** if you need one or two NDAX endpoints, in a language CCXT does not cover, and you are comfortable owning the auth handshake and the OMS-id plumbing forever.
- **Pick CCXT** if you want NDAX with 36 unified capabilities, four `watch*` streaming methods, a rate limiter, typed errors and testnet support — in TypeScript, JavaScript, Python, PHP, C#/.NET, Go or Java.
- **Choosing CCXT does not hide the raw API.** All 104 NDAX endpoints are generated as [implicit methods](/docs/exchanges/ndax/implicit-api), signed and rate-limited, so anything the unified API does not model is still one call away.

## At a glance

| | **CCXT** | **Raw NDAX API** |
| --- | --- | --- |
| Exchanges covered | 104 (NDAX is one of them) | NDAX only |
| Official client library | n/a | **none published** |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | whatever you write; one unaffiliated .NET library exists |
| Unified market data + trading API | yes — same method names across every exchange | no — AlphaPoint request/response shapes |
| Unified capabilities implemented | 36 for `ndax`, of which 19 are `fetch*` | n/a |
| Symbols | `'BTC/CAD'`, `'BTC/USDT'` | numeric `InstrumentId`, plus `OMSId` |
| Authentication | handled — nonce + HMAC-SHA256, or session token after `sign_in()` | `Nonce` + `UserId` + `APIKey` + `Signature` headers, or Basic auth then a session token |
| Two-factor sign-in | `sign_in()` handles the `Pending2FaToken` exchange and TOTP | your code |
| OMS / account ids | injected automatically (`options['omsId']`, `fetch_accounts()`) | passed by hand on nearly every call |
| WebSockets | yes — `watchOrderBook`, `watchTrades`, `watchTicker`, `watchOHLCV` | yes, and it is the primary interface — you frame the messages |
| Raw endpoint access | yes — 104 endpoints as implicit methods | it is all raw |
| Built-in rate limiter | yes, on by default (`rateLimit` 1000 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status plus AlphaPoint error payloads |
| Testnet / staging | `set_sandbox_mode(True)` swaps in the staging host | swap the base URL yourself |
| Popularity | 43.8k GitHub stars · 4.8M PyPI + 494k npm installs/month (one package, every venue) | n/a — no package to count |
| Licence | MIT | n/a |
| Support | Discord, Telegram, GitHub — usually same-day | NDAX support desk |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the NDAX API reference at apidoc.ndax.io, the `NDAXlO` GitHub repositories and the third-party `RobJohnston/Ndax.Api` repository.</sub>

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.ndax()
ticker = exchange.fetch_ticker('BTC/CAD')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw HTTP**

```python
import requests

# instrument ids are numeric and per-OMS, so first list the instruments
instruments = requests.get(
    'https://api.ndax.io:8443/AP/GetInstruments',
    params={'OMSId': 1}).json()
instrument_id = next(i['InstrumentId'] for i in instruments
                     if i['Symbol'] == 'BTCCAD')

summary = requests.get(
    'https://api.ndax.io:8443/AP/GetLevel1',
    params={'OMSId': 1, 'InstrumentId': instrument_id}).json()
print(summary['LastTradedPx'])
```

<!-- tabs:end -->

The raw path needs the OMS id and a numeric instrument id before it can ask for anything. CCXT resolves both during `load_markets()` and returns a [unified ticker structure](/docs/manual#ticker-structure) — the same keys, types and units you get from Kraken or Coinbase.

### Place a limit order

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.ndax({
    'apiKey': '...',
    'secret': '...',
    'uid': '...',        # UserId
})
order = exchange.create_order('BTC/CAD', 'limit', 'buy', 0.001, 80000)
print(order['id'], order['status'])
```

#### **Raw HTTP**

```python
import hashlib, hmac, time, requests

nonce = str(int(time.time() * 1000))
message = nonce + user_id + api_key
signature = hmac.new(secret.encode(), message.encode(),
                     hashlib.sha256).hexdigest()

response = requests.post(
    'https://api.ndax.io:8443/AP/SendOrder',
    headers={
        'Nonce': nonce,
        'APIKey': api_key,
        'Signature': signature,
        'UserId': user_id,
        'Content-Type': 'application/json',
    },
    json={
        'OMSId': 1,
        'AccountId': account_id,   # look this up first
        'InstrumentId': instrument_id,
        'Side': 0,                 # 0 = buy
        'OrderType': 2,            # 2 = limit
        'Quantity': 0.001,
        'LimitPrice': 80000,
        'TimeInForce': 1,
    }).json()
```

<!-- tabs:end -->

CCXT implements exactly that signing scheme — `hmac(nonce + uid + apiKey, secret, sha256)` in the `Nonce` / `APIKey` / `Signature` / `UserId` headers — plus the enum tables (`Side`, `OrderType`, `TimeInForce`), the OMS id, and the account-id lookup. The `AccountId` in particular is not a constant: CCXT calls `fetch_accounts()` once and uses the first account unless you override it with `options['accountId']` or a per-call param.

### Stream an order book

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.ndax()
    while True:
        orderbook = await exchange.watch_order_book('BTC/CAD')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **Raw WebSocket**

```python
import asyncio, json, websockets

async def main():
    async with websockets.connect('wss://api.ndax.io/WSGateway') as ws:
        # AlphaPoint frames: m = message type, i = sequence, n = function, o = payload
        await ws.send(json.dumps({
            'm': 0, 'i': 2, 'n': 'SubscribeLevel2',
            'o': json.dumps({'OMSId': 1, 'InstrumentId': 1, 'Depth': 20}),
        }))
        async for message in ws:
            frame = json.loads(message)
            updates = json.loads(frame['o'])   # array-of-arrays, positional fields
            print(updates[:2])

asyncio.run(main())
```

<!-- tabs:end -->

The raw frame format is doubly encoded — the payload is a JSON string inside a JSON object — and Level 2 updates arrive as positional arrays whose meaning you look up in the reference. NDAX's docs also specify client-generated sequence numbers, recommending even numbers starting at 2.

CCXT implements four streaming methods for `ndax`: `watchOrderBook`, `watchTrades`, `watchTicker` and `watchOHLCV`. `watch_order_book` returns a live, merged book — snapshot and deltas aligned, gaps detected, cache bounded — in the same [order book structure](/docs/manual#order-book-structure) as `fetch_order_book`, with reconnection and resubscription handled underneath. There are no private (order, balance) streams for `ndax` in CCXT.

## Where the differences actually bite

### The sign-in handshake

NDAX supports two authentication paths, and CCXT implements both. The per-request path is the nonce/HMAC one above. The session path is `sign_in()`: Basic auth with `login:password`, which may come back with `Requires2FA` and a `Pending2FaToken`; CCXT then computes a TOTP code from `twofa`, posts it with the pending token, stores the resulting session token, and sends it as `APToken` on subsequent requests.

```python
exchange = ccxt.ndax({
    'apiKey': '...', 'secret': '...', 'uid': '...',
    'login': '...', 'password': '...', 'twofa': '...',
})
exchange.sign_in()
```

That is a stateful, three-step, TOTP-bearing flow. It is the kind of thing that works on the first day and breaks quietly six months later when the token expires in a way you did not model.

### Rate limits you do not have to model

CCXT ships a token-bucket throttler that is on by default (`enableRateLimit = true`, `rateLimit = 1000` ms for `ndax`). You call methods in a loop and the library paces them. On the raw path, pacing and back-off are code you write.

### One error hierarchy

CCXT's [typed exception tree](/docs/manual#error-handling) has 41 classes descending from `BaseError`. For NDAX it maps the venue's own strings — `Not_Enough_Funds` to `InsufficientFunds`, `Resource Not Found` to `OrderNotFound`, `Invalid InstrumentId` to `BadSymbol`, the 2FA-required message to `AuthenticationError` — on top of the base HTTP mapping, where a 429 becomes `RateLimitExceeded`, a 401 becomes `AuthenticationError` and transport failures become `NetworkError` subclasses. You write `except ccxt.InsufficientFunds` once and it keeps working when you add a second exchange, instead of matching on `errorcode: 101` and hoping the string never changes.

### Precision, rounding and string math

`load_markets()` pulls NDAX's tick and step sizes and exposes them through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class so quantities never drift through float rounding into a rejected order:

```python
amount = exchange.amount_to_precision('BTC/CAD', 0.0012345678)
price = exchange.price_to_precision('BTC/CAD', 81234.56789)
```

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures in every one. On the raw path, each language is a fresh implementation of the same handshake.

<!-- tabs:start -->

#### **Python**

```python
import ccxt
exchange = ccxt.ndax()
ticker = exchange.fetch_ticker('BTC/CAD')
```

#### **TypeScript**

```typescript
import ccxt from 'ccxt';
const exchange = new ccxt.ndax ();
const ticker = await exchange.fetchTicker ('BTC/CAD');
```

#### **Go**

```go
exchange := ccxt.NewNdax(nil)
ticker, err := exchange.FetchTicker("BTC/CAD")
```

<!-- tabs:end -->

### Staging without a second code path

NDAX runs a staging environment on a separate host. CCXT has it wired to the standard switch:

```python
exchange = ccxt.ndax({'apiKey': '...', 'secret': '...', 'uid': '...'})
exchange.set_sandbox_mode(True)   # swaps in the staging REST and WebSocket URLs
```

### Nothing is hidden — the implicit API

Alongside the 36 unified capabilities, **all 104 NDAX endpoints are generated as callable implicit methods**, with signing, rate-limit accounting and error mapping applied:

```python
# any raw NDAX endpoint, camelCased from its path
response = exchange.private_get_get_account_positions({
    'OMSId': 1, 'AccountId': 1})
```

Browse them on the [ndax implicit API page](/docs/exchanges/ndax/implicit-api).

## What writing it yourself does better

An honest list — hand-rolling is not always the wrong call:

- **The WebSocket API is the whole API.** AlphaPoint exposes essentially every function over the socket, including private ones. CCXT's `ndax` uses the socket for four public market-data methods and REST for everything else, so private streams — order and balance events — are simply not available through CCXT for this venue. If you need them, you write the client.
- **The docs map one-to-one onto raw frames.** Reading apidoc.ndax.io while debugging your own client is a direct correspondence: `SendOrder` is `SendOrder`. CCXT's unified names are a deliberate abstraction, which is an extra hop.
- **A far smaller dependency.** If you need three endpoints, sixty lines of `requests` code is a smaller install and a smaller attack surface than a library covering 104 exchanges.
- **Any language you like.** CCXT ships seven. If your service is in Rust, Elixir or Swift, the raw API is the only route — and `RobJohnston/Ndax.Api` shows that a focused single-venue client is a tractable weekend project.
- **AlphaPoint knowledge transfers.** The same frame format and OMS conventions appear across other AlphaPoint deployments, so a client you write is partly reusable at other white-label venues.

If NDAX is your only venue, you need its private WebSocket events, and you are in a language CCXT does not ship, writing your own client is the right answer.

## Migrating from a hand-rolled NDAX client to CCXT

| What you are doing | Raw NDAX API | CCXT |
| --- | --- | --- |
| Symbols | numeric `InstrumentId` + `OMSId` | `'BTC/CAD'` |
| Client | your signing helper | `ccxt.ndax({'apiKey': ..., 'secret': ..., 'uid': ...})` |
| Instruments | `GetInstruments` | `load_markets()` |
| Ticker | `GetLevel1` | `fetch_ticker()` |
| Order book | `GetL2Snapshot` | `fetch_order_book()` |
| Candles | `GetTickerHistory` | `fetch_ohlcv()` |
| Public trades | `GetLastTrades` | `fetch_trades()` |
| Accounts | `GetUserAccounts` | `fetch_accounts()` |
| Balance | `GetAccountPositions` | `fetch_balance()` |
| New order | `SendOrder` | `create_order()` |
| Modify order | `ModifyOrder` | `edit_order()` |
| Cancel order | `CancelOrder` | `cancel_order()` |
| Open orders | `GetOpenOrders` | `fetch_open_orders()` |
| Own trades | `GetTradesHistory` | `fetch_my_trades()` |
| Streams | `SubscribeLevel2` etc. in AlphaPoint frames | `watch_*` on `ccxt.pro.ndax` |
| Staging | swap the base URL | `set_sandbox_mode(True)` |
| Anything not listed | raw call | the same endpoint as an [implicit method](/docs/exchanges/ndax/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [ndax unified API reference](/docs/exchanges/ndax).

## FAQ

**Does NDAX have an official API SDK?**
No. NDAX publishes API documentation at apidoc.ndax.io and a documentation-only GitHub repository for the WebSocket API, but no client library in any language. The only third-party client this page found is an unaffiliated .NET Standard project, `RobJohnston/Ndax.Api`.

**What credentials does CCXT need for NDAX?**
`apiKey`, `secret` and `uid` (your NDAX `UserId`) for the per-request HMAC path. If you want the session-token path, also supply `login`, `password` and `twofa`, then call `exchange.sign_in()` — CCXT handles the `Pending2FaToken` exchange and computes the TOTP code.

**Do I have to pass OMSId and AccountId myself in CCXT?**
No. CCXT sets `OMSId` from `options['omsId']` (default 1) and resolves `AccountId` by calling `fetch_accounts()` once, using the first account. You can override either with `options` or a per-call param.

**Does CCXT support NDAX WebSockets?**
Yes, for public market data — `watchOrderBook`, `watchTrades`, `watchTicker` and `watchOHLCV`. Private order and balance streams are not implemented for this venue, even though the underlying AlphaPoint socket exposes them.

**Can I test NDAX against a staging environment?**
Yes. `exchange.set_sandbox_mode(True)` swaps in NDAX's staging REST and WebSocket hosts in one call, with no second code path.

**Is CCXT free?**
Yes. MIT-licensed, including the WebSocket support.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [ndax unified API reference](/docs/exchanges/ndax)
- [ndax implicit API](/docs/exchanges/ndax/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
