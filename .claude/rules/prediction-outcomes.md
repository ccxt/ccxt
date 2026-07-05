---
description: Outcome loading & caching pattern for prediction-market exchanges (ts/src/prediction/*)
paths:
  - ts/src/prediction/**
  - ts/src/base/PredictionExchange.ts
---

# Prediction outcomes — loading & caching pattern

Prediction exchanges address an **outcome** (e.g. `TRUMP_WINS:YES`, or its `outcomeId`) the way regular
ccxt addresses a `symbol`. The outcome cache (`this.outcomes` / `this.outcomes_by_id`) must be loaded before
an outcome can be resolved. This mirrors regular ccxt's `loadMarkets()` + `this.market(symbol)` — **every
outcome-addressed method auto-loads on first use, then serves from cache**. Do NOT make a method throw
"call fetchEvents first"; auto-load instead.

## The six base methods (`ts/src/base/PredictionExchange.ts`)

| Method | Sync/Async | Role |
|---|---|---|
| `this.outcome(id)` | **sync** | cache-only resolver; throws `BadSymbol` if absent. Parsers/builders (`parseOrder`, `buildClobOrderBody`, …) use this — it must stay sync (a no-await async body breaks the PHP/typed transpilers). |
| `loadOutcomes(reload, params)` | async | bulk loader: `loadMarkets()` then `populateOutcomes()`. Idempotent; `reload`/`params` mirror `loadMarkets`. Call from "all-outcomes" methods (`fetchTickers()` / `fetchPositions()` with no arg). |
| `loadOutcome(id)` | async | **per-call resolver** — cache hit → return; miss → if `options.loadAllOutcomes` (default `true`) bulk-warm + re-check → else `fetchOutcome(id)`. This is what single-outcome methods call. |
| `fetchOutcome(id)` | async | "fetch just one". Base default = bulk fallback + resolve. Exchanges with a by-id market endpoint **override** it to fetch only the requested outcome and cache it (see kalshi). |
| `populateOutcomes()` | sync | rebuild `this.outcomes`/`_by_id` from `this.markets` (markets carry a nested `outcomes` list). Called by `loadOutcomes` and `setMarkets`. Don't duplicate this per-exchange. |
| `safeOutcome(id)` | sync | cache-only, returns a stub (not `undefined`) on miss — for best-effort labelling, not existence checks. |

## How to write each method

- **Single-outcome, needs the token in the request** (`fetchTicker`, `fetchOrderBook`, `fetchOHLCV`,
  `fetchTrades`, `createOrder`, …): `const outcomeObj = await this.loadOutcome (outcome);`
- **All-outcomes** (`fetchTickers()`/`fetchPositions()` with no outcome → iterate the full set):
  `await this.loadOutcomes ();` then `this.outcome (id)` per item.
- **Outcome is only a labelling hint, not part of the request** (e.g. `fetchOrder(id)` — request is just
  `{id}`): resolve **cache-only** (`this.safeOutcome`) or skip — never fetch. Keeps the hot path at 1 request.
- **Conditional** (`if (outcome !== undefined) { … }`): only load when actually resolving an outcome; the
  fetch-all branch should not force a load.

## Bulk vs on-demand — `options.loadAllOutcomes`

- Most exchanges leave it at the default `true`: the first cache miss bulk-loads every outcome once
  (`loadOutcomes`), then every later lookup is a 0-network cache hit.
- **kalshi** sets `'loadAllOutcomes': false` in `describe().options` because it has tens of thousands of
  markets — bulk-loading is slow *and* bounded. With `false`, `loadOutcome` skips the bulk and calls
  `fetchOutcome`, which kalshi **overrides** to fetch the single market by ticker (~1s, cached). A user can
  flip it to `true` to pay the listing scan once. The decision lives in the base `loadOutcome` (the option),
  not in `fetchOutcome` (which stays a clean single-fetch).

## kalshi `fetchOutcome` override — the on-demand template

```ts
async fetchOutcome (outcomeSymbol: string): Promise<any> {
    const symbolLength = outcomeSymbol.length;                       // positive-index slicing (transpiler-safe)
    const suffix = outcomeSymbol.slice (symbolLength - 3);
    const isNo = (suffix === '-NO');
    const baseTicker = isNo ? outcomeSymbol.slice (0, symbolLength - 3) : outcomeSymbol;
    const response = await this.kalshiPublicGetMarketsTicker ({ 'ticker': baseTicker });
    const parsed = this.parseMarket (this.safeDict (response, 'market', response));
    if (this.markets === undefined) { this.markets = this.createSafeDictionary (); }
    this.markets[parsed['symbol']] = parsed;                          // accumulate into markets, then…
    this.populateOutcomes ();                                         // …rebuild the cache (same as loadOutcomes)
    return this.outcome (outcomeSymbol);
}
```
An override's single fetch **must cache** (merge the market into `this.markets` + `populateOutcomes()`), so a
repeat lookup is a hit.

## Cross-language / transpiler gotchas

- `loadOutcome`/`fetchOutcome` are `async` and **must contain an `await`** — a no-await async body that
  returns a value transpiles to a broken PHP promise wrapper (same reason `buildClobOrderBody` is sync).
- `this.outcome()` stays **sync**; never make it async (it's called from sync parsers/builders).
- In Go/C#/Java the base `loadMarkets` does NOT dispatch the `setMarkets` override, so `loadOutcomes`/
  `fetchOutcome` call `populateOutcomes()` **explicitly** to rebuild the cache.
- Avoid negative-index `.slice(-n)`; hoist `const len = x.length;` and use `x.slice(len - n)`.
- After editing the base, regenerate it per language with the `--baseClass` flag
  (`tsx build/{transpile,csharpTranspiler,goTranspiler,javaTranspiler}.ts --baseClass`) — `--prediction`
  alone only re-emits the exchanges, not `PredictionExchange`.

There is no `checkEvents()` — it was the old throw-instead-of-load guard and has been removed. If you see it
referenced, it's stale.
