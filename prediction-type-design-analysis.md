# Prediction types: `extends` vs standalone — design analysis

> Context: ttodua flagged that `PredictionPosition extends Position` (and `PredictionOrder extends Order`, etc.) drag ~20 inapplicable derivatives fields into prediction structures, confusing devs. This doc records the full analysis of whether/how to make the prediction structures standalone, and why we landed where we did. Keep for future reference before anyone re-opens this.

## The concern (valid)

Prediction parsers explicitly write ~16 meaningless fields to satisfy the base shape. Example — kalshi `parsePosition`:

```
contractSize: 1, leverage: 1, marginMode: 'cross', hedged: false,
notional: undefined, collateral: undefined, markPrice: undefined,
liquidationPrice: undefined, maintenanceMargin: undefined, initialMargin: undefined,
marginRatio: undefined, maintenanceMarginPercentage: undefined,
initialMarginPercentage: undefined, percentage: undefined, marginType: 'cross', ...
```

So `console.log(position)` shows a dozen bogus derivatives fields with real-looking values (`leverage: 1`). That is the genuine dev-facing confusion.

## Why `extends` exists — it is load-bearing, not incidental

The base `Exchange` declares `createOrder(): Promise<Order>`, `fetchPositions(): Promise<Position[]>`, `parseOrder(): Order`, etc. Prediction overrides them returning `PredictionOrder`/`PredictionPosition`. **TypeScript only allows an override to change the return type if the new type is assignable to the base's** (covariant return). So `PredictionOrder` must be assignable to `Order` — i.e. it must `extends Order`.

`extends` is precisely the mechanism that lets every base + concrete prediction method return the *typed* prediction structure for free. Remove it and those overrides stop type-checking.

## What the standalone prototype proved (empirical)

Making `PredictionOrder` standalone (not `extends Order`) produced **31 `TS2416` errors** from one type:
- 9 in the `PredictionExchange` base (`createOrder`, `cancelOrder`, `fetchOrders`, `fetchClosedOrders`, `createOrders`, `cancelOrders`, `createMarketBuy/SellOrderWithCost`, `watchOrders`) + 2 broken `as PredictionOrder` casts.
- ~20 across the 5 concrete exchanges (`parseOrder`, `fetchOrder`, `fetchOpenOrders`, `cancelAllOrders`, `editOrder`, `fetchCanceledOrders`).

To fix, every one of those must widen to `any`. Scaled across Order/Trade/Position/Ticker ≈ **50–60 base method signatures widened to `any`**, plus de-embedding the Go/C#/Java structs (they currently `struct { Order; ... }`) and regenerating.

### The typed-return loss is real (this was the crux)

Widening a base method to `any` means every exchange that **inherits** it (rather than overriding it) exposes `any` to users. Measured for Order:

| base method | overridden by | inheriting exchanges expose |
|---|---|---|
| `createMarketSellOrderWithCost` | 0/5 | **all 5 → `any`** |
| `createMarketBuyOrderWithCost` | 1/5 | 4 → `any` |
| `watchOrders` | 2/5 | 3 → `any` |
| `createOrders` | 2/5 | 3 → `any` |
| `cancelOrders` | 4/5 | 1 → `any` |
| `cancelOrder` | 5/5 | (stays typed) |

So standalone types buy cleaner autocomplete at the cost of `any` on base-inherited convenience methods. `createMarketSellOrderWithCost` would return `any` on all five venues.

## The full option space

| Option | Standalone types | Typed returns preserved | Blast radius |
|---|---|---|---|
| **`extends`** (current) | ✗ | ✅ full | none |
| standalone + `any` shims | ✅ | ✗ (lost on inherited base methods) | high (50–60 base widenings + cross-lang struct de-embed + regen) |
| generics on `Exchange` (`Exchange<TOrder=Order>`) | ✅ | ✅ | **doesn't transpile** — TS generics don't survive Go/C#/Java. Out. |
| composition (PredictionExchange *has* an Exchange) | ✅ | ✅ | thousands of `this.x`→`this.exchange.x` rewrites + override dispatch breaks. Worse. |
| **shared `BaseExchange`, sibling classes** | ✅ | ✅ full | **highest** |
| **A: keep `extends` + clean runtime + JSDoc** | ✗ (clean-ish autocomplete) | ✅ full | low |

### The only clean way to get standalone types *without* losing typed returns: `BaseExchange` siblings

```
BaseExchange           ← the 322 shared utilities prediction calls: safe*, crypto, http/sign,
│                         loadMarkets/market, throttle, parse8601/iso8601, ... (Exchange is 9,382 LOC / 644 methods)
├─ Exchange            ← adds typed spot/deriv methods: createOrder(): Order, fetchPositions(): Position[]
└─ PredictionExchange  ← adds typed prediction methods: createOrder(): PredictionOrder, ...
```

With `Order` and `PredictionOrder` as **siblings** (no inheritance between them), `PredictionOrder` can be fully standalone, there is no covariance constraint, and base prediction methods return the typed prediction structure freely. This is the textbook-correct design.

Cost: split the single most critical class in ccxt — the one **300+ exchanges** inherit — into two layers, deciding which of 644 methods are "base utility" vs "trading", across all 6 languages **and** the transpiler's base-class handling (hand-written per-language base tops + the `METHODS BELOW THIS LINE ARE TRANSPILED` marker). Needs ccxt-maintainer sign-off; it is a core-architecture RFC, not a prediction-PR change.

## Decision (for the current PR)

**Option A.** Keep `extends` (covariance intact, zero typed-return loss, zero cross-language risk), but:
1. Stop the parsers writing the dummy fields → clean runtime objects (`console.log` shows only relevant fields).
2. Add JSDoc naming the canonical fields (`outcome`, not `symbol`; price = probability 0..1; amount = shares; cost = collateral).

That kills the actual dev-facing confusion at ~5% of the cost. The `BaseExchange` split is the documented "proper" path if the team later wants textbook separation — raise it with carlos/ccxt maintainers as a standalone RFC.

## Note on `PredictionMarket`

`Market` is *also* returned through a covariant override chain (`parseMarket(): Market`, `fetchMarkets(): Market[]`), so a naive `PredictionMarket` return hits the same cascade. The difference is the market **cache**: prediction reuses the base symbol-keyed `this.markets` (`Dictionary<MarketInterface>`) + `market()` resolver + `populateOutcomes()` reading `market['outcomes']`. Adopting `PredictionMarket` cleanly is tied to whether prediction can run off `loadOutcomes()` instead of `loadMarkets()`. Tracked separately.
