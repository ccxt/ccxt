# JN-5 — nominal MarketInterface / CurrencyInterface for generated locals: feasibility + rejection census

Branch: `java-nt-market-locals` (from `853ab685540`). Build gate: **PASSED**
(`npm run force-transpileJava` + `npx tsx build/javaTranspiler.ts --prediction --force` +
`cd java && ./gradlew compileJava` → BUILD SUCCESSFUL, 0 errors).

## 1. Verdict (a): IMPOSSIBLE for generated-core locals without changing the box

A `MarketInterface` / `CurrencyInterface`-typed generated local would have to CONSTRUCT a
new object — there is nothing to "name". Established at four levels:

1. **The nominal types are wrapper classes, not interfaces.**
   `java/lib/src/main/java/io/github/ccxt/types/MarketInterface.java` is
   `public final class MarketInterface` with `public MarketInterface(Object raw)` — the
   constructor runs `TypeHelper.toMap(raw)` and COPIES the raw row into typed fields.
   `CurrencyInterface` is identical (`public final class`, ctor `(Object raw)`).
   `new MarketInterface(row)` is a *different object*.
2. **`this.market(symbol)` hands back the stored row itself.**
   `BaseExchange.java:10317 public Object market(Object symbol)` returns
   `Helpers.GetValue(this.markets, symbol)` — `Helpers.GetValue` is a plain
   `Map.get` (no copy), i.e. the very `HashMap` instance `setMarkets` stored. Aliasing
   matters: generated code mutates these locals in place (`Helpers.setValue`, `this.extend`,
   `addElementToObject`) and other callers observe those writes. 2,245 market/currency
   locals already carry the lossless `java.util.Map<String, Object>` box today.
3. **Every producer path is a plain `HashMap`.**
   `safeMarketStructure` / `safeCurrencyStructure` build `new java.util.HashMap<String,
   Object>() {{ ... }}`; `safeMarket` returns `Helpers.GetValue(markets_by_id, id)`,
   `createExpiredOptionMarket(...)` (object-literal row) or the caller's row; `market()` also
   returns `markets[symbol]` / `markets_by_id[symbol][i]` / `createExpiredOptionMarket(...)`.
4. **Consumers take `Object`.** `Helpers.GetValue(x, k)`, `this.safeString(x, k)`,
   `Helpers.addElementToObject`, `this.deepExtend` — a wrapper object would answer none of
   them (it is not a `Map`).

Usage census: **0** generated core files (REST, pro, prediction) reference the nominal types
in code; the only mentions in `BaseExchange.java` are two doc-comment lines. The nominal
spelling lives exclusively in the typed facade tier: 104 REST facades + 7 prediction facades,
e.g. `loadMarkets(boolean)` → `Map<String, MarketInterface>` via
`new MarketInterface(entry.getValue())`.

**Conclusion:** naming `MarketInterface`/`CurrencyInterface` in a generated core would change
the runtime box (snapshot copy, broken aliasing) — forbidden by rule 1. This confirms the
landed module's own header note with a runtime audit.

## 2. (b) Where the nominal spelling IS possible

* **Typed facade tier (`build/generateJavaWrappers.ts`)** — the only place it exists today,
  and the only SAFE place for new `market()` / `currency()` accessors:
  * facade subclasses (e.g. `Binance extends BinanceCore`) are invisible to core
    compilation: cores resolve calls against their *parents*, never subclasses, so no
    core-internal call can be rebound by an added overload (generator header contract);
  * precedent: the `loadMarkets(boolean)` / `loadMarketsAsync` specials block already
    emits `new MarketInterface(row)` conversions.
  * Suggested follow-up (additive, facade-only):
    `public MarketInterface market(String symbol) { return new MarketInterface(super.market(symbol)); }`
    (+ `currency`, `safeMarket`, `safeCurrency`). Document the snapshot/aliasing caveat in
    the javadoc — the wrapper is a copy, not the live row.
* **The hand-written base (`Exchange.java` / `BaseExchange.java`) is the WRONG place.**
  Pro cores extend the typed REST facade (`public class DeepcoinCore extends
  io.github.ccxt.exchanges.Deepcoin`), and REST cores extend `Exchange`. A `market(String)`
  overload added to that chain is visible to every core and would REBIND core-internal
  `this.market(x)` calls whose argument is now *statically String* (this campaign has
  retyped hundreds of locals to `String`) to the wrapper-constructing overload — changing
  the box at runtime. This is the same trap the `pro-inherited-async` guard already
  encodes.

## 3. Harvested wins (this branch, generated cores)

Two changes in `build/java-local-types.js`:

1. **7 audited structure-builder names added to `STRUCTURE_THIS_RETURN_TYPES`**:
   `safeTicker`, `safeOrder`, `parseMarket`, `parseCurrency`, `parseOrder`, `parseTicker`,
   `parseTrade`. Backed by a per-declaration return-shape census
   (`build/jn5-return-census.ts`, WIP commit `cc4bd5816005`): every return site of every
   generated declaration of these names (396 declarations, 411 return sites across the
   tree) was followed, transitively through all delegates (`safeMarketStructure`,
   `safeCurrencyStructure`, `safeOrder`, `safeTicker`, `safeTrade`, `extend(...)`,
   `parseSpotOrder`, `parseUtaOrder`, `parseContractOrder`, `parseSwapOrder`,
   `parseSpotMarket`, `parseSwapMarket`, `parseContractTicker`, `parseDustTrade`,
   `parseMyUtaTrade`, `parseSpotOrUtaTrade`, `parseContractTrade`, the pro
   `super.parseTicker`, and the handful of `return result` aliases) — every path yields a
   row literal / `extend(...)` map / null. `safeTrade` itself returns its caller's row and
   is deliberately NOT listed (0 local sites).
2. **As-cast refinement for map-typed locals.** The printer's `printAsExpression`
   (ast-transpiler pin) erases every `as`-cast whose type is not `string` / `any` / array,
   and prints `((Object) x)` for `as any` — byte-identical output for an `Object` and a
   `java.util.Map<String, Object>` declared local, so those casts can no longer block the
   retype. `as string` (`((String) x)`) and `as <T>[]` (`(java.util.List<...>) (x)`) stay
   rejected (inconvertible on a map local).

**Measured result** (87 generated java files, vs `853ab685540`):

* 181 declarations retyped (every changed line is
  `Object x = rhs` → `java.util.Map<String, Object> x = (java.util.Map<String, Object>) rhs`;
  validated mechanically, 0 unexpected hunk lines); +4 later writes on newly-narrowed
  locals gained the same checkcast.
* By family: `parseOrder` 56, `parseTicker` 46, `parseTrade` 29, `market` 15,
  `safeTicker` 8, `parseCurrency` 7, `parseMarket` 6, `safeOrder` 6, and 8 map-typed
  locals of other families (await-endpoint / object-literal) unblocked by the as-cast
  refinement (`parseIsolatedBorrowRates`, coinbaseinternational, krakenfutures, mexc,
  mudrex ×3, onetrading).
* No signature, parameter or return-type changed anywhere; second transpile run produces
  the byte-identical diff (idempotent).
* In-family census: untyped market/currency/ticker/order/trade locals **226 → 48**.

## 4. Ranked rejection census (the 48 remaining, blockers first)

| # | n | Blocker | Where | Why it stays Object |
|---|--:|---------|-------|---------------------|
| 1 | 33 | `pro-inherited-async` | `market` locals in pro/deepcoin 8, pro/xt 10, pro/htx 4, pro/hashkey 4, pro/bingx 4, pro/nado 3 | The local is passed into an inherited async call (`this.watchPublic(market, ...)` etc.). Pro cores extend the TYPED REST facade; a concrete `Map<String, Object>` static type makes the facade's typed overload win Java overload resolution → the call would change box/behavior. **Blocked by design**; needs a pro-tier redesign (e.g. distinct wrapper method names), out of this slice. |
| 2 | 1 | self-referential write | pro/htx `handleMyTrade`: `parsedTrade = this.extend (parsedTrade, extendParams)` | The write value reads the local being typed — the documented self-referential accumulator family (write-join is circular). |
| 3 | 6 | producer not provable | `parseTickers` (ndax, kucoin, htx, gemini, bigone, backpack) | `parseTickers` funnels through `filterByArray`, which returns a LIST or a keyed dict (argument-dependent) — deliberately absent from both tables. |
| 4 | 4 | list family + `as Order[]` / filter write | `parseOrders` (pacifica, paradex, bitflyer, indodax) | These are `java.util.List<Object>` locals; 2 are blocked only by `orders as Order[]` (safe to relax with the same print-identity argument — follow-up above the structure family), 2 by a `filterBy(...) as Order[]` write. |
| 5 | 3 | list family, no table entry | `parseCurrencies` (apex, bitteam, pro/bitvavo) | `parseCurrencies` is array-shaped; not a structure-table candidate. |
| 6 | 1 | list family, no table entry | `parseMarkets` (pro/bitvavo) | array-shaped. |

Pre-change rejection histogram (2558 distinct candidate declarations tracked):
`no-table-entry` 174 (`parseOrder` 57, `parseTicker` 46, `parseTrade` 29, `safeTicker` 8,
`parseCurrency` 8, `safeOrder` 6, `parseTickers` 6, `parseCurrencies` 3, `parseMarkets` 1),
`unsafe-use` 52 (33 pro-async, 15 `as-cast` + 2 `as-cast` on list locals, 2 writes).

**Follow-ups unlocked by this census:**
* Extend the as-cast refinement to `java.util.List<Object>` locals (`as Order[]` prints the
  erased expression; `as any[]` prints the identity `(java.util.List<Object>) (x)`; only
  `as string[]` is inconvertible) → harvests the 2 `parseOrders` rows.
* Add `parseCurrencies` / `parseMarkets` to the list table after their own return-shape
  audit (both are array-shaped on the base path).
* Typed `market()` / `currency()` accessors in the facade tier (section 2).

## 5. Method / reproducibility

* Temporary census instrumentation lived in `build/java-local-types.js` (env
  `CCXT_JAVA_MARKET_CENSUS=1`, one log line per candidate declaration with the first
  reject reason from a mirror of `isSafeToNarrow`) — preserved in WIP commit
  `cc4bd5816005`, REMOVED from the final tree.
* Commands: `CCXT_JAVA_MARKET_CENSUS=1 npx tsx build/javaTranspiler.ts --rest-and-ws --force`
  and `… --prediction --force`; return-shape census: `npx tsx build/jn5-return-census.ts ./ts/src`.
