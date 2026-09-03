<!-- title: CCXT vs PMXT -->
<!-- description: PMXT and CCXT both unify prediction-market venues. They differ on venue count, hosted service versus plain library, custody and signing, and language coverage. -->
<!-- group: Multi-exchange libraries and frameworks -->
<!-- summary: PMXT lists 15 prediction venues behind a hosted API with a credit meter. CCXT covers 7 prediction venues plus 104 crypto exchanges as a library that signs locally and calls nothing but the venue. -->
<!-- weight: 22 -->

# CCXT vs PMXT

[PMXT](https://github.com/pmxt-dev/pmxt) describes itself on GitHub as "CCXT for prediction markets. PMXT is a unified API for trading on Polymarket, Kalshi, and more." [CCXT](/docs/manual) ships prediction-market support of its own in the `ccxt.prediction` namespace, so the two genuinely overlap.

The question that decides between them is not which normalises Polymarket better. It is **whether you want a hosted service in the path of your trading, and how much of the rest of the market you also need to reach.**

## TL;DR

- **Pick PMXT** if prediction markets are the whole job and you want the widest venue list — its compliance matrix names 15 venues against CCXT's 7 — plus a hosted catalog that searches and matches the same question across venues.
- **Pick CCXT** if you want a library with nothing between you and the venue: 7 prediction venues *and* 104 spot/derivatives exchanges behind one interface, in 8 languages, with keys that never leave your process.
- **The overlap is smaller than the tagline suggests.** PMXT's default mode is a metered hosted API with a free tier and paid plans; CCXT has no service, no API key of its own and no meter. PMXT can also be self-hosted, which narrows the gap considerably.

## At a glance

| | **CCXT** | **PMXT** |
| --- | --- | --- |
| Prediction venues | 7 — Polymarket, Kalshi, Limitless, Myriad, Opinion, plus Binance and Hyperliquid prediction products | 15 listed in `core/COMPLIANCE.md` |
| Crypto spot / derivatives exchanges | 104, same unified API | none |
| Languages | TypeScript, JavaScript, Python, PHP, C#/.NET, Go, Java, Rust | TypeScript (`pmxtjs`), Python (`pmxt`) |
| Default network path | your process → the venue | your process → PMXT's hosted API → the venue |
| Self-hosted option | it is the only mode | yes — `pmxt-core`, no API key, requests go direct to venues |
| Service API key required | no | yes for hosted mode (`pmxt_api_key`); no for self-hosted |
| Metering | none | credits — "1 REST call = 1 credit. 1 WebSocket message = 0.1 credits." |
| Order signing | in-process, always (EIP-712 for Polymarket, RSA for Kalshi) | self-hosted: your keys locally. Hosted: "end-to-end hosted trading with PreFundedEscrow custody" |
| WebSockets | `watch*` on 3 of the 7 prediction venues | hosted plans cap concurrent streams (5 / 20 / 100 by tier) |
| Raw endpoint access | yes — 128 Polymarket and 74 Kalshi endpoints as implicit methods | not documented as a unified feature |
| Cross-venue market matching | no | yes — shared catalog, `fetch_matched_market_clusters` |
| Cost | free | free tier (25,000 credits/month), then $29.99 and $99.99/month |
| Licence | MIT | MIT |
| Popularity | 43.8k GitHub stars · 4.7M PyPI + 494k npm installs/month (one package, every venue) | 2.1k GitHub stars · 8.6k PyPI (`pmxt`) + 9.9k npm (`pmxtjs`) installs/month |

<sub>Figures verified September 2026 against CCXT v{{CCXT_VERSION}}, the pmxt-dev/pmxt repository (2,114 stars, 262 forks, MIT, not archived, last commit 18 July 2026), pmxt.dev's docs and pricing pages, and install counts from npm and PyPI.</sub>

## The same job, written both ways

### Find a market and read its order book

<!-- tabs:start -->

#### **CCXT**

```typescript
import ccxt from 'ccxt';

const exchange = new ccxt.prediction.polymarket ();

const events = await exchange.fetchEvents ({ 'query': 'election', 'limit': 5 });
const outcome = events[0].markets[0].outcomes[0].outcome;  // a "MARKET:LABEL" handle

const book = await exchange.fetchOrderBook (outcome);
console.log ('best bid:', book.bids[0]);
```

#### **PMXT**

```typescript
import { Polymarket } from "pmxtjs";

const polymarket = new Polymarket({
  pmxtApiKey: "pmxt_live_...",
  walletAddress: "0xYourWalletAddress",
});

const markets = await polymarket.fetchMarkets({ query: 'election' });
const outcomeId = markets[0].outcomes[0].outcomeId;  // Polymarket CLOB token id

const orderBook = await polymarket.fetchOrderBook(outcomeId);
console.log('Best bid:', orderBook.bids[0].price);
```

<!-- tabs:end -->

Two things differ. CCXT starts from `fetchEvents` and addresses the tradeable unit with a portable outcome **handle**; PMXT's data methods take an `outcomeId`, which its API reference documents as venue-native — a CLOB token id on Polymarket, a market ticker on Kalshi. And the CCXT client is talking to `gamma-api.polymarket.com` and `clob.polymarket.com` directly, with no key at all for public data.

### Read your balance and positions

<!-- tabs:start -->

#### **CCXT**

```python
import asyncio
import ccxt.prediction

async def main():
    exchange = ccxt.prediction.polymarket({
        'privateKey': '0x...',     # EOA key — derives the L2 creds and signs orders in-process
        'walletAddress': '0x...',  # your Polymarket account (proxy) wallet
    })
    balance = await exchange.fetch_balance()
    positions = await exchange.fetch_positions()
    print(balance['USDC']['total'], len(positions))
    await exchange.close(True)

asyncio.run(main())
```

#### **PMXT**

```python
import pmxt

client = pmxt.Polymarket(
    pmxt_api_key="pmxt_live_...",
    wallet_address="0xYourWalletAddress",
)

positions = client.fetch_positions()
balance = client.fetch_balance()
```

<!-- tabs:end -->

The PMXT snippet is shorter because the hosted API resolves the wallet for you. The CCXT snippet is longer because it holds the key that signs. Which of those you prefer is the real decision on this page.

## Where the differences actually bite

### Prediction markets are not the only market

This is the largest difference and it does not show up in a feature table. CCXT's prediction classes extend `PredictionExchange`, which extends the same base as the 104 crypto exchanges. `fetch_order_book`, `create_order`, `cancel_order`, `fetch_positions`, `watch_order_book` have the same names and the same return structures on `ccxt.prediction.polymarket` as on `ccxt.binance`.

If your strategy hedges a Kalshi position on a Binance perpetual, or prices a Polymarket outcome against an implied vol you pull from Deribit, that is one dependency and one data model in CCXT. PMXT covers prediction venues only, so a mixed book means two libraries and two sets of structures.

### Venue coverage runs the other way inside prediction markets

Be honest about the direction: PMXT's compliance matrix lists Polymarket, Polymarket US, Kalshi, Limitless, Probable, Baozi, Myriad, Opinion, Metaculus, Smarkets, Hyperliquid, Gemini Titan, SuiBets, Rain and Hunch — 15 venues. CCXT ships 7. If your target venue is Smarkets, Metaculus, Probable or Rain, CCXT does not have it today and PMXT does.

### Hosted service versus library

PMXT's own documentation splits this cleanly. Hosted mode is the default: "PMXT's hosts give you a shared catalog, cross-venue search, and end-to-end hosted trading with PreFundedEscrow custody." Self-hosted mode is described as "No API key, no external dependency. Your requests go directly to the venues," installed as `pmxt-core` and spawned locally by the SDK.

CCXT only has the second shape. There is no CCXT service, so there is no key to rotate, no credit balance to top up, no rate tier, and no third party whose availability your order entry depends on. The published PMXT plans meter REST calls at one credit each and WebSocket messages at 0.1 credits, with 25,000 credits and five concurrent streams on the free tier. A book-watching bot on a busy market can move through that budget quickly, which is a sizing question you never have with a plain library.

### Custody and signing

On CCXT the private key stays in the process. `ccxt.prediction.polymarket` takes a `privateKey`, derives the Polymarket L2 credentials from it and signs each order with EIP-712 locally; `ccxt.prediction.kalshi` RSA-signs each request with a PEM key you supply. Nothing is forwarded to a third party, because there is no third party.

PMXT's self-hosted mode is described the same way — venue-native credentials, used locally. Its hosted trading path is described differently, as "end-to-end hosted trading with PreFundedEscrow custody". Whether pre-funded escrow is acceptable is a risk decision, not an engineering one, and it is worth making deliberately rather than by accepting the default constructor.

### Eight languages

CCXT is written once in TypeScript and transpiled to JavaScript, Python, PHP, C#/.NET, Go and Java, with the same method names and return structures in each. The prediction classes come along: `ccxt.prediction.polymarket()` in Python, `new ccxt.prediction.polymarket()` in C#, `ccxtprediction.NewPolymarket()` in Go. PMXT publishes TypeScript and Python clients.

### Nothing is hidden

Every endpoint in each prediction venue's API is generated as a callable implicit method with signing, rate limiting and error mapping applied — 128 for Polymarket, 74 for Kalshi, 58 for Limitless. Unified coverage never becomes a ceiling; if the venue exposes something CCXT has not modelled yet, you can still call it.

## What PMXT does better

- **More prediction venues.** 15 against 7. Metaculus, Smarkets, Probable, Baozi, SuiBets, Rain, Hunch, Gemini Titan and Polymarket US have no CCXT equivalent today. If one of those is your venue, the comparison ends there.
- **Cross-venue market matching.** The hosted catalog matches the same underlying question across venues and exposes it through `fetch_matched_market_clusters`, with relation types and confidence scores. Deciding that a Kalshi contract and a Polymarket outcome are the same event is a genuinely hard problem, and CCXT does not attempt it — you would build that yourself.
- **A hosted catalog you do not have to run.** Cross-venue search served from PMXT's infrastructure means no crawling, no normalising and no storage of your own, with a free tier at 25,000 credits per month to try it.
- **A documented migration path off the Dome API.** The repository advertises a drop-in Dome API replacement with an automatic codemod, which is a concrete piece of work done for a specific set of users.

If prediction markets are the entire scope of your system, you want the widest venue list available, and cross-venue question matching is a feature you would otherwise have to build, PMXT is the better fit.

## Migrating from PMXT to CCXT

On the six venues both cover — Polymarket, Kalshi, Limitless, Myriad, Opinion and Hyperliquid — the shapes map closely. The main change is that CCXT threads a single **outcome handle** through every method where PMXT passes `marketId` and `outcomeId` separately.

| What you are doing | PMXT | CCXT |
| --- | --- | --- |
| Construct a client | `pmxt.Polymarket(pmxt_api_key=..., wallet_address=...)` | `ccxt.prediction.polymarket({'privateKey': ..., 'walletAddress': ...})` — no service key |
| Discover markets | `fetchMarkets({ query })` | `fetch_events({'query': ..., 'limit': ...})`, or `fetch_markets()` for a volume-ordered browse |
| Address the tradeable unit | `outcomeId` — venue-native (CLOB token id, Kalshi ticker) | the outcome handle `"MARKET:LABEL"`, or the venue's outcome id |
| Order book | `fetchOrderBook(outcomeId)` | `fetch_order_book(outcome, limit)` |
| Candles | `fetchOHLCV(outcomeId, params)` | `fetch_ohlcv(outcome, timeframe, since, limit)` |
| Trades | `fetchTrades(outcomeId, params)` | `fetch_trades(outcome, since, limit)` |
| New order | `createOrder({ marketId, outcomeId, side, type, amount, price })` | `create_order(outcome, type, side, amount, price)` |
| Cancel order | `cancelOrder(...)` where the venue supports it | `cancel_order(id, outcome)` |
| Positions | `fetchPositions()` | `fetch_positions(outcomes)` |
| Balance | `fetchBalance()` | `fetch_balance()` |
| Streams | hosted WebSocket streams, metered per message | `watch_order_book` / `watch_trades` on Polymarket, Myriad and Opinion |
| Cross-venue question matching | `fetch_matched_market_clusters()` | **no equivalent** — keep PMXT, or build it |
| A venue CCXT does not have | Smarkets, Metaculus, Probable, Baozi, Rain, Hunch, … | **no equivalent** — keep PMXT for those |
| Anything not listed | — | the same endpoint as an implicit method (128 on Polymarket, 74 on Kalshi) |

Nothing stops you running both: PMXT for the venues and the cross-venue catalog CCXT does not cover, CCXT for the six it does plus every crypto exchange you hedge on.

## FAQ

**Does CCXT support Polymarket and Kalshi?**
Yes. Both are in the `ccxt.prediction` namespace, alongside Limitless, Myriad, Opinion and the Binance and Hyperliquid prediction products — 7 venues as of v{{CCXT_VERSION}}. Public market data needs no credentials; trading takes a `privateKey` (and `walletAddress` for Polymarket and Hyperliquid). See the [prediction markets guide](/docs/prediction).

**Which covers more prediction markets, CCXT or PMXT?**
PMXT. Its compliance matrix lists 15 venues; CCXT ships 7. CCXT covers those 7 alongside 104 crypto spot and derivatives exchanges behind the same unified API, which is the trade the two are actually making.

**Do I need an API key or a subscription to use CCXT for prediction markets?**
No. CCXT is an MIT-licensed library with no service behind it — you supply the venue's own credentials for trading and nothing else. PMXT's hosted mode uses a `pmxt_api_key` with a credit meter and a free tier; its self-hosted `pmxt-core` mode needs no key either.

**Where does my private key go?**
With CCXT, nowhere. Orders are signed in your process — EIP-712 for Polymarket, RSA request signing for Kalshi — and only the signed payload reaches the venue. PMXT's self-hosted mode is described the same way; its hosted trading path is described as using PreFundedEscrow custody, which is a different trust model.

**Can I stream prediction-market order books over WebSocket with CCXT?**
On 3 of the 7 venues — Polymarket, Myriad and Opinion — using `watch_order_book`, `watch_trades` and the other `watch*` methods directly on the `ccxt.prediction.<id>` client, keyed by the same outcome handle the `fetch*` methods take. The remaining four are REST-only in CCXT today.

**Is CCXT's prediction support a separate package?**
No. It is the `prediction` namespace inside the same `ccxt` package, under the same MIT licence, with no paid tier.

## Next steps

- [Install CCXT](/docs/install)
- [Prediction markets guide](/docs/prediction) — events, markets, outcomes and the unified methods
- [Polymarket reference](/docs/prediction/polymarket)
- [Kalshi reference](/docs/prediction/kalshi)
- [Manual](/docs/manual) — unified structures and conventions
- [More comparisons](/docs/comparisons)
