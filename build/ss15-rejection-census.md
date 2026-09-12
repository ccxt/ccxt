# SS-15 — ranked rejection census: `Object x = this.safeString*` locals

Tree: branch `ss-15`, base `3ca818ac31ec8f651121c452aed930d725f2b020`.
Population: every local whose initializer is a whole `this.safeString*` call
(`safeString`, `safeString2`, `safeStringN`, `safeStringUpper/Lower(2|N)`).

Instrumentation: `build/java-local-types.js` (env-gated `CCXT_SS15_CENSUS=1`,
recorder + outermost wrapper) and the inline hook / WS post-pass in
`build/javaTranspiler.ts`. Aggregated by `build/ss15-census-report.py`.

## Reconciliation

| metric | count |
|---|---|
| safeString-family declarations processed (population) | 9033 |
| — accepted by the inline classifier (printed `String`) | 8828 |
| — rejected by the inline classifier | 205 |
| reverted by `postProcessWsJava` "String type fixes" | 2579 |
| final tree: `Object … = this.safeString*` | 2783 |
| final tree: `String … = [(String)] this.safeString*` | 6248 |
| attributed lines (reject + revert) | 2783 |
| unattributed final lines | 0 |
| module-family rescues (classifier reject, final `String` via a cast family) | 1 |

Closure: `final Object 2783 = reverts 2579 + classifier rejects 205 − rescues 1`.

### Module-family rescues (classifier rejected, module typed with `(String)`)

- `java/lib/src/main/java/io/github/ccxt/exchanges/pro/HtxCore.java` :: safeString messageHash (shortage 1; rejects 1, reverts 4)

## Ranked reasons — first rule that rejected `String`

| # | reason | count | share of population | 3 examples (file:line) |
|---|---|---|---|---|
| 1 | `postProcessWsJava:String-type-fixes` | 2579 | 92.7% | java/lib/src/main/java/io/github/ccxt/exchanges/prediction/BinanceCore.java:593<br>java/lib/src/main/java/io/github/ccxt/exchanges/prediction/HyperliquidCore.java:2221<br>java/lib/src/main/java/io/github/ccxt/exchanges/prediction/KalshiCore.java:3339 |
| 2 | `use:write-not-string` | 154 | 5.5% | java/lib/src/main/java/io/github/ccxt/BaseExchange.java:6529<br>java/lib/src/main/java/io/github/ccxt/PredictionExchange.java:783<br>java/lib/src/main/java/io/github/ccxt/exchanges/ApexCore.java:1620 |
| 3 | `case-family-default-not-string` | 22 | 0.8% | java/lib/src/main/java/io/github/ccxt/exchanges/BybitCore.java:4934<br>java/lib/src/main/java/io/github/ccxt/exchanges/BydfiCore.java:3155<br>java/lib/src/main/java/io/github/ccxt/exchanges/CoinexCore.java:2697 |
| 4 | `use:pro-inherited-async-arg` | 13 | 0.5% | java/lib/src/main/java/io/github/ccxt/exchanges/pro/BinanceCore.java:3623<br>java/lib/src/main/java/io/github/ccxt/exchanges/pro/BybitCore.java:1862<br>java/lib/src/main/java/io/github/ccxt/exchanges/pro/CoinbaseinternationalCore.java:576 |
| 5 | `use:destructuring-write` | 11 | 0.4% | java/lib/src/main/java/io/github/ccxt/exchanges/HashkeyCore.java:1217<br>java/lib/src/main/java/io/github/ccxt/exchanges/prediction/LimitlessCore.java:2475<br>java/lib/src/main/java/io/github/ccxt/exchanges/pro/HashkeyCore.java:545 |
| 6 | `use:compound-assign` | 4 | 0.1% | java/lib/src/main/java/io/github/ccxt/exchanges/OkxCore.java:3844<br>java/lib/src/main/java/io/github/ccxt/exchanges/WooCore.java:3440 |

### Raw classifier reject counts (before revert accounting)

| reason | count |
|---|---|
| `use:write-not-string` | 154 |
| `case-family-default-not-string` | 22 |
| `use:pro-inherited-async-arg` | 13 |
| `use:destructuring-write` | 11 |
| `use:compound-assign` | 5 |

## What the other slices (SS-02..SS-12) would unlock — measured here

Counts are read from this tree (lib scope unless noted); the brief's cited numbers are
in the claim column where the task text quotes one.

| slice | scope (from the campaign split) | measured unlock | count |
|---|---|---|---|
| SS-01 | safeStringUpper/Lower producers -> `String` | case-family locals (`Object x = this.safeString{Upper,Lower}*`) still needing a cast; case-family `return (String) …` sites | 27 decls / 8 sites |
| SS-02 | reassigned locals (`let x = safeString; … x = safeString`) | classifier rejects `use:write-not-string` + `use:destructuring-write` | 165 |
| SS-03 | safeString as LEFT of `+` (Helpers.add) | classifier rejects `use:compound-assign` + `Helpers.add(this.safeString` sites (brief: 20) | 5 + 20 |
| SS-04 | redundant casts | `(String) this.safeString*` sites (brief: 454) | 454 |
| SS-05 | Object param positions | not touched by this census (params, not locals) | n/a |
| SS-06 | isEqual/isTrue/inOp/safeValue consumers | `isEqual(this.safeString` sites (brief cites 107) | 107 |
| SS-07 | pro (WebSocket) tier root cause | reverts in `exchanges/pro/**` — **consumed by the SS-15 fix** | 2058 |
| SS-08 | prediction tier + PredictionExchange | reverts in `exchanges/prediction/**` — **consumed by the SS-15 fix** | 521 |
| SS-09 | map stores (`request.put("k", safeString)`) | not in this population (no `Object x =` local) | n/a |
| SS-10 | conditional / `??` initializers | initializer is a ConditionalExpression, not a whole call — out of population | n/a |
| SS-11 | return types | `return (String) this.safeString*` sites in the tree | 8 |
| SS-12 | receiver casts `((String)x)` | tree-wide `((String)name)` wrappers (brief: 1,318 lib) | 1318 |
| SS-14 | tests/cli/examples tiers | `Object x = this.safeString*` in java/tests + java/cli + java/examples | 0 |

Reverts by accessor: `safeString` 2390, `safeString2` 171, `safeStringN` 18.

> **Overlap warning for the integrator**: the SS-15 blocker fix removes the
> `postProcessWsJava` "String type fixes" pass — that *is* the root cause SS-07 and
> SS-08 were chartered to fix. Their claims (2058 pro / 521 prediction) are already
> delivered by this branch; merge order should let SS-15 land first (or drop their
> equivalent hunks of `build/javaTranspiler.ts`).

