<!-- title: CCXT vs the Bullish API -->
<!-- description: Bullish ships example scripts and signers rather than a packaged SDK. Compare CCXT and the raw Bullish API on auth, session tokens, streaming and sandbox. -->
<!-- group: Exchange APIs and official SDKs -->
<!-- summary: Bullish's own Python client is archived and what remains is a folder of example scripts, so most integrations hand-roll the login-token flow. CCXT implements it — 51 unified capabilities, 7 streaming methods, and the simnext sandbox behind one flag. -->
<!-- weight: 100 -->

# CCXT vs the Bullish API

[Bullish](https://bullish.com/) is a regulated spot and perpetual-futures exchange with a REST, WebSocket and FIX API documented at [docs.exchange.bullish.com](https://docs.exchange.bullish.com/). [CCXT](/docs/manual) supports it as the exchange id `bullish`, with 51 unified capabilities, 7 `watch*` streaming methods and all 58 endpoints callable directly.

The thing that decides between them is not coverage. It is the **session model**: Bullish's private API does not take an API key on each request. You log in, receive a JWT, carry it as a bearer token, and re-log in before it expires — and every private call needs a `tradingAccountId` as well. Someone has to implement that. The question is whether it is you.

## TL;DR

- **Go direct to the API** if you want the authentication flow visible in your own code, you need FIX, or you are in a language CCXT does not target — Bullish's `api-examples` repository is a genuinely good starting point in Python and Java.
- **Pick CCXT** if you want the login-token lifecycle, the trading-account lookup, the nonce window, the sandbox switch and the order-book streaming already implemented and tested, in seven languages, under MIT.
- **Bullish has no packaged SDK to lose.** The `python-bullish-client` repository is a public archive, as are `python-signer`, `java-signer` and `cpp-signer`. What is maintained is `api-examples` (Python and Java scripts) and `js-signer`. There is no `bullish` package on PyPI.

## At a glance

| | **CCXT** | **Bullish's own repositories** |
| --- | --- | --- |
| Exchanges covered | 104 (Bullish is one of them) | Bullish only |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java — one API | Python and Java examples; a TypeScript signer |
| Packaged client library | **1** (`ccxt`), on npm and PyPI | none — `python-bullish-client` is archived, nothing published to PyPI |
| Unified market data + trading API | yes — 51 capabilities on `bullish` | no — raw payloads from the examples |
| Session/login handling | automatic — HMAC login, JWT cached and refreshed | `generate_jwt_hmac.py` / `generate_jwt_ecdsa.py`, then your own refresh logic |
| Trading account id | resolved and cached for you | you supply it on every private call |
| WebSockets | yes — 7 `watch*` methods | `multi_orderbook_web_socket.py` example |
| Raw endpoint access | yes — 58 Bullish endpoints as implicit methods | yes, it is all you have |
| Built-in rate limiter | yes, on by default (`rateLimit` 20 ms) | your code |
| Unified error types | yes — 41 typed exceptions in one hierarchy | HTTP status + Bullish error bodies |
| Sandbox | `set_sandbox_mode(True)` → `api.simnext.bullish-test.com` | change the hostname in `.env` |
| Popularity | 43.8k GitHub stars · **4.8M PyPI + 494k npm installs/month** (one package, every venue) | `api-examples` 7 stars · `js-signer` 6 · `python-bullish-client` 3 (archived) |
| Licence | MIT | no licence file shown on `api-examples` |
| Support | Discord, Telegram, GitHub — usually same-day | Bullish support desk, GitHub issues |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the `bullish-exchange` GitHub organisation's repository listing and READMEs, and the published Bullish WebSocket rate-limit documentation.</sub>

### What Bullish actually publishes

Read on the day this page was written, the `bullish-exchange` GitHub organisation holds nine repositories:

| Repository | What it is | Language | Stars | Last updated | Status |
| --- | --- | --- | --- | --- | --- |
| `api-examples` | example scripts | Python, Java | 7 | October 2025 | public |
| `api-docs` | offline API docs | HTML | 2 | September 2025 | public |
| `js-signer` | request signing helper | TypeScript | 6 | December 2024 | public |
| `ccxt-bullish-python` | "ccxt exchange module for Bullish" | Python | 2 | April 2024 | **archived** |
| `cpp-signer` | R1-key signing helper | C++ | 0 | January 2024 | **archived** |
| `python-signer` | signing helper | Python | 1 | November 2023 | **archived** |
| `python-bullish-client` | Python API wrapper | Python | 3 | November 2022 | **archived** |
| `java-signer` | signing helper | Java | 1 | September 2022 | **archived** |

Two things stand out. First, the only client wrapper Bullish ever published is archived, and the maintained artefacts are examples and signers — building blocks, not a library. Second, `ccxt-bullish-python` exists: Bullish's own answer to "how do I use this from Python" was, at one point, a CCXT exchange module. That module is archived because `bullish` now ships in CCXT itself.

## The same job, written both ways

### Fetch a ticker

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bullish()
ticker = exchange.fetch_ticker('BTC/USDC')
print(ticker['last'], ticker['baseVolume'])
```

#### **Raw REST**

```python
import requests

r = requests.get('https://api.exchange.bullish.com/trading-api/v1/markets/BTC-USDC/tick')
print(r.json())
```

<!-- tabs:end -->

Public market data is easy on either side. CCXT returns a [unified ticker structure](/docs/manual#ticker-structure), which matters once a second venue is involved; the raw call returns Bullish's own tick payload, which does not.

### Place a limit order

This is where the two sides stop looking alike.

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt

exchange = ccxt.bullish({'apiKey': '...', 'secret': '...'})
order = exchange.create_order('BTC/USDC', 'limit', 'buy', 0.001, 90000)
print(order['id'], order['status'])
```

#### **Raw REST**

```python
# 1. sign a login request:  HMAC-SHA256 over timestamp + nonce + "GET" + path,
#    sent as BX-TIMESTAMP / BX-NONCE / BX-SIGNATURE with BX-PUBLIC-KEY
# 2. GET /trading-api/v1/users/hmac/login -> {"token": "...", "authorizer": "..."}
# 3. cache the token; it expires and must be refreshed
# 4. GET /trading-api/v1/accounts/trading-accounts -> pick a tradingAccountId
# 5. only now sign and send the order:
#    for POST, the payload is hashed with SHA-256 first, and the *digest*
#    is what gets HMAC'd -- not the payload
# 6. send Authorization: Bearer <token> alongside the BX-* headers
```

<!-- tabs:end -->

Every one of those six steps is real, and step 5 is the one that costs an afternoon: on `POST` requests Bullish signs the SHA-256 **digest** of `timestamp + nonce + method + path + body`, not the string itself. Get it wrong and you get an authentication error that looks identical to a wrong key.

CCXT implements the whole flow. `signIn()` is exposed if you want to trigger it explicitly, but you do not need to — the client logs in on first private use, caches the token with its expiry, and re-logs in when it lapses. The trading account id is resolved once and reused, and can still be overridden per call:

```python
exchange = ccxt.bullish({'apiKey': '...', 'secret': '...'})
orders = exchange.fetch_open_orders('BTC/USDC', params={'tradingAccountId': '111054475936334'})
```

### Stream an order book

Bullish is one of the 76 CCXT exchanges with WebSocket support. `bullish` has **7** `watch*` methods: `watchOrderBook`, `watchTicker`, `watchTrades`, `watchOrders`, `watchMyTrades`, `watchBalance` and `watchPositions`.

<!-- tabs:start -->

#### **CCXT**

```python
import ccxt.pro
import asyncio

async def main():
    exchange = ccxt.pro.bullish()
    while True:
        orderbook = await exchange.watch_order_book('BTC/USDC')
        print(orderbook['bids'][0], orderbook['asks'][0])

asyncio.run(main())
```

#### **api-examples**

```python
# multi_orderbook_web_socket.py in bullish-exchange/api-examples:
# open the socket, send a subscribe frame, then handle raw
# snapshot and delta messages yourself -- including re-seeding
# after a reconnect and keeping the local book bounded.
```

<!-- tabs:end -->

`watch_order_book` returns the same structure as `fetch_order_book`, already merged and depth-limited. Underneath, CCXT handles connection pooling per URL, ping/pong keep-alive, automatic reconnect and resubscribe, snapshot/delta sequencing and bounded caches. Bullish's documented connection limits — a maximum of 100 open unauthenticated connections per IP address and 10 authenticated connections per API key — are the reason connection reuse is worth having done for you rather than discovered in production.

## Where the differences actually bite

### Spot and perpetuals in one client

`bullish` covers both spot and perpetual futures from one instance, selected by the symbol:

```python
spot = exchange.fetch_ticker('BTC/USDC')          # BTC-USDC
perp = exchange.fetch_ticker('ETH/USDC:USDC')     # ETH-USDC-PERP
positions = exchange.fetch_positions(['ETH/USDC:USDC'])
funding = exchange.fetch_funding_rate_history('ETH/USDC:USDC')
```

The `:USDC` suffix is CCXT's unified notation for a linear contract settled in USDC. The same convention identifies perpetuals on every other venue CCXT supports.

### Sandbox without a second code path

Bullish runs a simnext test environment, and CCXT knows its hostname:

```python
exchange = ccxt.bullish({'apiKey': '...', 'secret': '...'})
exchange.set_sandbox_mode(True)   # api.simnext.bullish-test.com
```

One flag swaps every REST and WebSocket URL. No forked configuration, no constant swapping, and the rest of your code does not change.

### Rate limits you do not have to model

CCXT ships a token-bucket throttler that is on by default, at `rateLimit = 20` ms for `bullish`. Bullish also uses a rate-limit token on some order endpoints; CCXT passes it through as `params['rateLimitToken']` and sets the `BX-RATE-LIMIT-TOKEN` header for you.

### One error hierarchy

CCXT maps Bullish's error bodies onto a [typed exception tree](/docs/manual#error-handling) — `InsufficientFunds`, `InvalidOrder`, `OrderNotFound`, `RateLimitExceeded`, `AuthenticationError`, `NetworkError`, `ExchangeNotAvailable` and 34 more, all descending from `BaseError`. Notably, an expired session surfaces as `AuthenticationError` rather than as an opaque 401 you have to correlate with the token clock.

### Precision, rounding and string math

`load_markets()` reads Bullish's base, quote, quantity, price and cost precisions along with min and max limits, and exposes them through `amount_to_precision`, `price_to_precision` and `cost_to_precision`, backed by the `Precise` string-arithmetic class.

```python
amount = exchange.amount_to_precision('BTC/USDC', 0.0012345678)
price = exchange.price_to_precision('BTC/USDC', 91234.56789)
```

### Seven languages, one API

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with identical method names and return structures. Bullish's examples are Python and Java; its maintained signer is TypeScript. In Go, PHP or C# there is nothing first-party to start from.

### Nothing is hidden — the implicit API

Alongside the 51 unified capabilities, **all 58 Bullish endpoints are generated as callable implicit methods**, with login, signing, rate limiting and error mapping applied:

```python
# any raw Bullish endpoint, camelCased from its path
response = exchange.public_get_v1_markets()
```

Browse them on the [bullish implicit API page](/docs/exchanges/bullish/implicit-api).

## What going direct to the Bullish API does better

An honest list, because these are real:

- **FIX.** Bullish documents a FIX interface alongside REST and WebSocket. CCXT does not speak FIX, for Bullish or for anyone. If FIX order entry is the requirement, this comparison does not apply.
- **ECDSA (R1 key) authentication.** Bullish's `api-examples` includes `generate_jwt_ecdsa.py` and `create_order_ecdsa.py` alongside the HMAC variants, and the archived `cpp-signer` and `java-signer` exist specifically for R1 keys. CCXT's `bullish` implementation uses the HMAC login path. If your keys are R1, the vendor examples are the reference.
- **The examples are current and readable.** `api-examples` has 122 commits and was updated in October 2025. Reading `create_order_hmac.py` end to end teaches you exactly what the API expects, which is worth doing once even if you then use CCXT.
- **Nothing between you and new features.** Bullish's own docs and examples change the day the API does. A *unified* CCXT wrapper for a brand-new Bullish feature may lag, even though the implicit API reaches the endpoint immediately.

If you need FIX, or your credentials are ECDSA keys, going direct is not a compromise — it is the option that works.

## Migrating from a direct Bullish integration to CCXT

| What you are doing | Raw Bullish API | CCXT |
| --- | --- | --- |
| Symbols | `BTC-USDC`, `ETH-USDC-PERP` | `'BTC/USDC'`, `'ETH/USDC:USDC'` |
| Client | signed `requests` wrapper + JWT cache | `ccxt.bullish({'apiKey': ..., 'secret': ...})` |
| Login | `GET /v1/users/hmac/login`, cache token, refresh | automatic; `sign_in()` if you want it explicit |
| Trading account | `GET /v1/accounts/trading-accounts`, pass on every call | resolved and cached; `params['tradingAccountId']` to override |
| Markets | `GET /v1/markets` | `load_markets()` |
| Ticker | `GET /v1/markets/{symbol}/tick` | `fetch_ticker()` |
| Order book | `GET /v1/markets/{symbol}/orderbook/hybrid` | `fetch_order_book()` |
| Candles | `GET /v1/markets/{symbol}/candle` | `fetch_ohlcv()` |
| New order | `POST /v2/orders` with digest signing | `create_order()` |
| Cancel order | `POST /v2/command` | `cancel_order()` / `cancel_all_orders()` |
| Open orders | `GET /v2/orders` | `fetch_open_orders()` |
| Balance | `GET /v1/accounts/asset` | `fetch_balance()` |
| Positions | `GET /v1/derivatives-positions` | `fetch_positions()` |
| Streams | subscribe frames + your own book merge | `watch_*` on `ccxt.pro.bullish` |
| Sandbox | swap the hostname | `set_sandbox_mode(True)` |
| Anything not listed | native call | the same endpoint as an [implicit method](/docs/exchanges/bullish/implicit-api) |

Start with [Install](/docs/install), then the [Manual](/docs/manual), then the [bullish unified API reference](/docs/exchanges/bullish).

## FAQ

**Is there an official Bullish Python SDK?**
Not a maintained one. `bullish-exchange/python-bullish-client` is a public archive last updated in November 2022, and nothing is published to PyPI under that name. What Bullish maintains is `api-examples`, a set of Python and Java scripts. CCXT's Python support for Bullish is a normal `pip install ccxt`.

**How does CCXT handle the Bullish login token?**
It performs the HMAC login for you, caches the returned JWT with its expiry, and re-authenticates automatically when it lapses. `sign_in()` is available if you want to force it. You never write the token-refresh loop.

**Do I have to pass a trading account id to every Bullish call in CCXT?**
No. CCXT looks it up once and reuses it. You can still override it per call with `params={'tradingAccountId': '...'}` if you trade several accounts from one key.

**Does CCXT support Bullish perpetual futures?**
Yes. Perpetuals appear as unified symbols like `'ETH/USDC:USDC'` from the same `ccxt.bullish` instance as spot, with `fetch_positions`, `fetch_funding_rate_history` and `fetch_open_interest` available.

**Can I use the Bullish sandbox from CCXT?**
Yes. `exchange.set_sandbox_mode(True)` points every REST and WebSocket URL at `api.simnext.bullish-test.com`.

**Do I need CCXT Pro separately for WebSockets?**
No. CCXT Pro is included in the `ccxt` package. Use `ccxt.pro.bullish` and call the 7 `watch*` methods.

## Next steps

- [Install CCXT](/docs/install) in your language
- [Manual](/docs/manual) — the unified API, structures and conventions
- [bullish unified API reference](/docs/exchanges/bullish)
- [bullish implicit API](/docs/exchanges/bullish/implicit-api) — every raw endpoint
- [CCXT Pro manual](/docs/pro-manual) — WebSocket methods
- [More comparisons](/docs/comparisons)
