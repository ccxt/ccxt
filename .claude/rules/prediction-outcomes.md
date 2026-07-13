---
description: Outcome loading & caching pattern for prediction-market exchanges (ts/src/prediction/*)
paths:
  - ts/src/prediction/**
  - ts/src/base/PredictionExchange.ts
---

# Prediction outcomes — loading & caching pattern

Prediction exchanges address an **outcome** (e.g. `TRUMP_WINS:YES`, or its `outcomeId`) the way regular
ccxt addresses a `symbol`. The outcome cache (`this.outcomes` / `this.outcomes_by_id`) must be loaded before
an outcome can be resolved. Every outcome-addressed method auto-loads on first use, then serves from cache —
but the auto-load is **always scoped to the requested outcome** (a by-id fetch or the venue's search),
**never an implicit bulk listing download**. `fetchEvents` is the discovery entry point and **requires a
scope** (query/queries/tags/eventId/slug, plus any venue keys in `options['eventScopeParams']`) on every
venue; everything it finds lands in the cache.

## The base methods (`ts/src/base/PredictionExchange.ts`)

| Method | Sync/Async | Role |
|---|---|---|
| `this.outcome(id)` | **sync** | cache-only resolver; throws `BadSymbol` if absent. Parsers/builders (`parseOrder`, `buildClobOrderBody`, …) use this — it must stay sync (a no-await async body breaks the PHP/typed transpilers). |
| `loadOutcomes(outcomes = undefined, reload, params)` | async | with an `outcomes` list: sync-filters misses via `hasOutcome` and resolves ONLY those through `fetchOutcomes` (zero per-outcome awaits on a warm cache; respects `loadAllOutcomes` for the cold bulk-warm trade-off). Without a list: **explicit** bulk loader — `loadMarkets()` then `populateOutcomes()`, idempotent. List-addressed methods (`fetchTickers(outcomes)`, filtered `fetchPositions`, `createOrders`) call the list form; never write a per-outcome `await loadOutcome` loop. |
| `hasOutcome(id)` | **sync** | cache-only membership probe (checks `outcomes` + `outcomes_by_id`); never throws, never fetches. The predicate behind `loadOutcome`'s fast path and `loadOutcomes`' miss filter. |
| `fetchOutcomes(ids)` | async | resolve several uncached outcomes. Base default: per-outcome `fetchOutcome` loop. kalshi/polymarket **override** it to batch — kalshi `GET /markets?tickers=` (100/request), polymarket gamma repeated `clob_token_ids` params (50/request; comma-joined ids are REJECTED — polymarket's sign uses `urlencodeWithArrayRepeat`); leftovers (handles, unknown ids) fall back per-outcome. |
| `loadOutcome(id, reload = false)` | async | **per-call resolver** — cache hit → return (`reload = true` skips the cache and refetches the outcome's metadata); miss → index already-loaded markets for free → `fetchOutcome(id)`. `options.loadAllOutcomes` (default **false**) opts back into the legacy bulk warm-up on a cold miss — only hyperliquid sets it `true`. This is what single-outcome methods call. |
| `fetchOutcome(id)` | async | "fetch just one". Base default: derive a search query from the handle (`outcomeSearchQuery`) → `fetchEvents({query, limit})` → re-check cache → guidance-rich `BadSymbol`. Venues with a real by-id endpoint **override** it (kalshi by ticker, polymarket by CLOB token id) and fall back to `super` on a miss. |
| `outcomeSearchQuery(id)` | sync | handle → search text (`TRUMP_OUT_2027:YES` → `"trump out 2027"`); `undefined` for id-like inputs (numeric, `0x…`). |
| `populateOutcomes()` | sync | rebuild `this.outcomes`/`_by_id` from `this.markets`. Called by `loadOutcomes` and `setMarkets`. Don't duplicate per-exchange. |
| `safeOutcome(id)` | sync | cache-only, returns a stub (not `undefined`) on miss — for best-effort labelling, not existence checks. |
| `requireEventQuery(params)` | sync | throws `ArgumentsRequired` unless params carry a scope; venue-specific scope keys go in `options['eventScopeParams']` (kalshi: `['category', 'series_ticker']`). Call it first in **every** `fetchEvents`. |

## How to write each method

- **Single-outcome, needs the token in the request** (`fetchTicker`, `fetchOrderBook`, `fetchOHLCV`,
  `fetchTrades`, `createOrder`, …): `const outcomeObj = await this.loadOutcome (outcome);`
- **List-addressed** (`fetchTickers (outcomes)`, filtered `fetchPositions`, `createOrders`, `watchTickers`):
  `await this.loadOutcomes (outcomes);` once, then resolve each synchronously via `this.outcome (...)` /
  `this.safeOutcome (...)`. Never a per-outcome `await this.loadOutcome` loop — it costs a promise per
  outcome on a warm cache and a request per miss on a cold one.
- **All-outcomes methods must be honest** — one ccxt call ≈ one network request. `fetchTickers()` with no
  `outcomes` throws `ArgumentsRequired` (message must contain `requires an outcomes argument` — the live
  harness asserts it) unless the venue serves the whole universe in ~1 request (hyperliquid `allMids`).
  Never silently return a capped top-N subset.
- **Account-scoped methods** (`fetchPositions`, `fetchOrders`, `fetchMyTrades`, `fetchSettlements`, …):
  the request is self-contained — never bulk-warm for labelling. Labels resolve cache-only via
  `safeOutcome` (raw ids when cold). When an `outcome` arg is given, `await this.loadOutcome (outcome)`
  for the request filter only.
- **Outcome is only a labelling hint, not part of the request** (e.g. `fetchOrder(id)`): resolve
  **cache-only** (`this.safeOutcome`) or skip — never fetch. Keeps the hot path at 1 request.

## fetchEvents — scope required, tags go server-side

Every venue's `fetchEvents` starts with `this.requireEventQuery (params)` and pushes the scope to the
venue's API: kalshi (elections search / `series?tags=`&`category=` / `events?series_ticker=`), polymarket
(gamma `public-search` / `events?tag_slug=` — one listing per tag, unioned), limitless (`markets/search` /
tags→`GET /categories`→`markets/active/{categoryId}`), myriad (`markets?keyword=` — tags map to keyword
searches), hyperliquid (client-side over the single `outcomeMeta` blob). When the scope was applied
server-side in a way the client-side pass can't re-verify (tag semantics differ per venue), strip that key
before `applyEventFetchParams` — see the `omit (params, ['tags'])` in kalshi/limitless/myriad.
The unscoped top-N browse remains available explicitly via `fetchMarkets()`/`loadMarkets()` (capped,
volume-ordered where the venue supports it).

## kalshi `fetchOutcome` override — the by-id template

```ts
async fetchOutcome (outcomeSymbol: string): Promise<any> {
    // .length INLINE on strings: the standalone `const n = str.length;` statement transpiles
    // to php count() (the array hint) and TypeErrors at runtime; inline emits strlen()
    const suffix = outcomeSymbol.slice (outcomeSymbol.length - 3);
    const isNo = (suffix === '-NO');
    const baseTicker = isNo ? outcomeSymbol.slice (0, outcomeSymbol.length - 3) : outcomeSymbol;
    const response = await this.kalshiPublicGetMarketsTicker ({ 'ticker': baseTicker });
    const parsed = this.parseMarket (this.safeDict (response, 'market', response));
    if (this.markets === undefined) { this.markets = this.createSafeDictionary (); }
    this.markets[parsed['symbol']] = parsed;                          // accumulate into markets, then…
    this.indexMarketOutcomes (parsed);                                // …index just this market
    return this.outcome (outcomeSymbol);
}
```
An override's single fetch **must cache** (merge the market into `this.markets` + index it), so a repeat
lookup is a hit. polymarket's override resolves bare CLOB token ids via `gamma /markets?clob_token_ids=`
and falls back to `super.fetchOutcome` (the search path) for handle-shaped symbols.

## Cross-language / transpiler gotchas

- `loadOutcome`/`fetchOutcome` are `async` and **must contain an `await`** — a no-await async body that
  returns a value transpiles to a broken PHP promise wrapper (same reason `buildClobOrderBody` is sync).
- `this.outcome()` stays **sync**; never make it async (it's called from sync parsers/builders).
- In Go/C#/Java the base `loadMarkets` does NOT dispatch the `setMarkets` override, so `loadOutcomes`/
  `fetchOutcome` call `populateOutcomes()`/`indexMarketOutcomes()` **explicitly** to rebuild the cache.
- Avoid negative-index `.slice(-n)` — use `x.slice(x.length - n)`. Keep string `.length` INLINE:
  the standalone `const n = str.length;` form is the regex transpiler's ARRAY hint and becomes php
  `count()` (a runtime TypeError); own-line length reads are only for arrays.
- After editing the base, regenerate it per language with the `--baseClass` flag
  (`tsx build/{transpile,csharpTranspiler,goTranspiler,javaTranspiler}.ts --baseClass`) — `--prediction`
  alone only re-emits the exchanges, not `PredictionExchange`.
- New endpoints in an `api` block need `npm run emitAPI` before `tsBuild` sees the implicit method.

The live harness (`runPredictionTests` in `ts/src/test/tests.ts`) asserts the contract: unscoped
`fetchEvents()` must throw `ArgumentsRequired` ("requires at least one of"), and no-arg `fetchTickers()`
must throw on venues with `loadAllOutcomes` false ("requires an outcomes argument"). Keep those message
fragments stable or update the harness with them.
