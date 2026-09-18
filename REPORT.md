# U01 — market-row reads: `getValue(market, "<key>")` + parameter/helper receivers

Worktree `/root/worktrees/cs90/U01`, branch `cs90-U01`, base `d847892a6fcf5699640862316303b6344a3e4daf`
(cs-strict-INT / PR #30530 head, ast-transpiler pin `404e9daa7f0ab58d085ed04aaa61a19546dfeda2`).

## Family

The roster's 134-site family: an `object N = <init>` local whose initializer is a market-row element
read with a literal key — `market['symbol']`, `market['quoteId']`, … — printed as
`object N = getValue(market, "<key>")` (or the `GetValue` static twin where the receiver is a typed
dictionary). Everything below is the same declaration-initializer family: the receiver proof (which
market rows count) and the key tables (which value box each key carries).

Two sub-families, 140 declarations typed in total:

| # | receiver shape | key(s) | new declaration |
|---|---|---|---|
| 121 | `market: Market` parameter (or the existing local producers) | symbol/quote/quoteId/baseId/settle | `string?` |
| 6 | `const market = this.getMarketFromClientAndMessage/getMarketFromSymbols(...)` (venue ws resolver) | symbol | `string?` |
| 6 | `const firstMarket = this.getMarketFromSymbols(...)` | contract (bool key) | `bool?` |
| 7 | `market: Market` test-driver parameter (`cs/tests/Generated/Exchange/Base/test.market.cs`) | spot/contract/swap/future/option/linear/inverse | `bool?` |

## Rules / tables / passes touched (`build/csharp-local-types.js` only)

- `MARKET_ROW_STRING_KEYS` += `uppercaseId`, `subType`, `optionType`, `expiryDatetime`, `feeSide`
  (1 site fires: `uppercaseId`).
- `MARKET_ROW_BOOL_KEYS` += `inverse`, `index`, `stock` (0 sites today; `contract`/`spot`/`swap` were
  already in the table and fire via the new receivers).
- **new** `MARKET_ROW_DICT_KEYS = [ 'precision', 'limits' ]` + `marketRowDictReadType` + a
  `csharpLocalDeclaration` branch: `object precision = GetValue(market, "precision")` becomes
  `IDictionary<string, object> … = ((IDictionary<string, object>)GetValue(market, "precision"))`.
  0 sites in the tree today.
- **new** `MARKET_ROW_PARAM_TYPES = [ 'Market', 'MarketInterface' ]` + `marketRowParamAnnotation` +
  the parameter branch of `marketRowReadKey` (below).
- **new** `MARKET_ROW_HELPER_PRODUCERS = [ getMarketFromSymbols, getMarketFromClientAndMessage,
  getMarketFromOrder ]`, wired into `marketRowProducer`.
- Header bullets for the MARKET_ROW family updated (string/bool/dict receivers + reject lists).
- No changes to `build/csharpTranspiler.ts`, to ast-transpiler `src/`, or to the hand-written base.

### Receiver proof extension (parameters)

`marketRowReadKey` resolved the receiver only through `indexScope().declarations` (VariableDeclarations),
so a market row that arrives as a **parameter** (`parseTrade (trade, market: Market = undefined)`,
the 121 sites) failed with `candidates=0`. The new branch accepts a `Parameter` binding when

1. the parameter's TS type annotation is literally `Market` or `MarketInterface`
   (`ts/src/base/types.ts:1001` — `Market = MarketInterface | undefined`, so ts/src callers can only
   pass a market row, `undefined` or `null`), **and**
2. the existing use scan holds: every write to the parameter inside the enclosing function is
   `marketRowValueOrNullish` (`market = this.safeMarket (marketId, market)`, `= this.market (…)`,
   `= undefined/null`), and no use aliases/rebinds it otherwise.

118 of the 121 sites also carry a dominating row write (`market = this.safeMarket (…)` as an
unconditional statement before the read), i.e. their box is a `safeMarket` result — the same producer
the existing local rule already accepts. The remaining three sites rest on the annotation contract:
`bitget#handleProductTypeAndParams` line 2055 (annotation only, no write), `hyperliquid#parseOrder` line
3516 (`if/else` where both arms write `this.safeMarket`), `pro/bitstamp#parseTrade` line 308 (`if
(market === undefined) market = this.safeMarket (…)` + fall-through). Their corpus callers are all
`Market`-typed (`handleProductTypeAndParams` is called with the caller's `market` local or `undefined`,
21 call sites in bitget.ts; the other two take the market row the handler already resolved).
`market: any` parameters are **not** accepted (below). The split is the r2-param-probe verdict census:
118 dominating writes, 3 annotation-only, 11 `any`, 2 `Dict`, 7 test-driver sites.

### Receiver proof extension (venue helpers)

`const market = this.getMarketFromSymbols (symbols)` prints as a typed
`Dictionary<string, object> market = …` (the helper's C# declaration is already retyped by
`CSHARP_COLLECTION_RETURN_METHODS`), yet the read kept `object` because `marketRowProducer` only knew
`this.market/safeMarket/safeMarketStructure`. The three helpers are the ws handlers' market resolvers;
their return paths are exactly the ones the existing table already records
(base `getMarketFromSymbols`: `this.market (firstMarket)` or two `return undefined`s; weex
`getMarketFromClientAndMessage`: the `this.safeMarket (…)` local; aster `getMarketFromOrder`:
`this.safeMarket (…)`), so the local that holds the call is a market row on every path.

## Census (campaigns/cs90/census.sh, cs/ccxt/exchanges/**)

```
before: locals: object=9304 typed=44132 typed%=82
after:  locals: object=9171 typed=44265 typed%=82
```
`object` locals converted: **133** (exchanges/**); the generated test driver adds **7** more
(`cs/tests/Generated/Exchange/Base/test.market.cs`) — 140 declarations in the committed diff.

```
before: casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
after:  casts: (string)=2240 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
```
```
before: helpers: isTrue=1434 isEqual=12034 getValue=6761 add=8833 getArrayLength=704
after:  helpers: isTrue=1434 isEqual=12027 getValue=6761 add=8833 getArrayLength=704
```

**Casts: 0 removed, 127 `(string)` + 6 `(bool?)` added.** A market-row read is `getValue(...)`, whose
C# type is `object`; naming the value box is only possible through the unboxing cast — the same
mechanism the landed market-row family uses (`string? symbol = ((string)getValue(market, "symbol"));`).
The added casts are exact unboxings of a value the key-table census proves is that box on every writer
(they can never throw where the `object` box flowed on: a missing key returns `null`, and `(string)null`
/ `(bool?)null` are the same `null` the untyped code carried). The only *removed* helper calls are the
7 `isEqual(settle, "…")` → native `==` rewrites (5 lines) that `installCsharpStringEquality` performs
once `settle` prints as `string?`.

### Fixed point

All three tiers re-transpiled over the full id lists (`exchanges.json`: 104 rest / 76 ws / 7 prediction)
plus `--tests`; `git diff -- cs/` sha256 is identical before and after the second full regen
(`7affa0ea757e3b68c713eb8daa4b1d370fa4cabbbb79894461defddb75110162`). The farm's own `--force`
regeneration of the committed sha returned `branch_update=unchanged`.

## verify-diff.py (vs the base tree)

```
files=70 pairs=145 unexpected=5
  [PAIR] cs/ccxt/exchanges/bitget.cs: - } else if (isEqual(settle, "USDT"))
      + } else if (settle == "USDT")
  … USDC, SUSDT, SUSDC, and the ||-chain (SBTC/SETH/SEOS)
```
The 5 unexpected pairs are one class, justified: `const settle = market['settle']` is now declared
`string?`, so `installCsharpStringEquality` binds the operand's printed declaration and rewrites
`isEqual(x, "lit")` → `x == "lit"` (7 helper calls on 5 lines). Per that pass's own proof: a string
literal is never null, `isEqual`'s string branch is `((string)a) == ((string)b)`, so the native form is
the same ordinal comparison and a null `settle` is `false` in both spellings — behaviour-identical.

## Farm

```
HEAD a71084237d75b133bdd2fdc6cd29855b5a9068da job=674 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
ccxt-farm status 674 → state=succeeded exit_code=0 targets=cs transpile_force=1
ccxt-farm log 674 --step buildCS → "Build succeeded. 0 Warning(s) 0 Error(s)" (csproj + tests + cli)
```
Job 674 was run from the code commit `a71084237d75b133bdd2fdc6cd29855b5a9068da`. The REPORT.md tip is
report-only (no build input); it is gated separately — see `## Farm (report tip)` at the end.

## Rejected sub-cases (each with the reason)

1. **`market: any` parameters (7 exchange-tree sites, 0 typed).** `mexc#createSpotOrderRequest`
   (mexc.cs:2713), `mexc#createSwapOrder` (mexc.cs:2886), `pro/bitrue#parseWsTicker`
   (pro/bitrue.cs:748), `pro/deepcoin#createPublicRequest` (pro/deepcoin.cs:115), `pro/luno` ×2,
   `pro/poloniex` ×1 — no market-row annotation, no write, so nothing proves the parameter's box.
2. **Markets-map element reads (8 sites, 0 typed).** `whitebit.cs:1388` (`const market = markets[marketId]`
   with `markets = this.markets`), `htx.cs:2846` (`const market = futureMarkets[i]` with
   `futureMarkets = this.filterBy (this.markets, 'future', true)`), `pro/bitrue.cs:431/587/613/721/826/841`
   (`const market = this.findSwapMarketByWsBaseQuote (…)`, whose only other return is
   `markets[symbols[i]]`). All six need the "every value in `this.markets` is a market row" invariant
   (`setMarkets` stores `deepExtend (this.safeMarketStructure (), …)` rows; the only element writes are
   prediction rows) — a real proof, but a new receiver shape outside this unit's roster line; left for a
   follow-up rather than asserted without the writer census.
3. **`market['info']` (1 site, hyperliquid.cs:1372).** `info` has a STRING writer on a market row
   (independentreserve) plus 58 `any`-typed writers, so no dict cast can name its box.
4. **`add(<local>, …)` LEFT operands (9 sites).** `pro/binance` ×4 (`lowercaseId` → `streamId`),
   `pro/bydfi` (`id` → `marketId`), `pro/grvt` ×4 (`id` → `marketId`): the receiver proof holds, but the
   read's local is rejected by the classifier's retarget scan because the value is the left operand of
   `add(…)` (the typed `add(string?, …)` binding changes null handling) — that family is not U01's.
5. **Alias-written `let market: Market` (1 site, `pro/gate.ts:1583`).** `let market: Market = undefined;
   … const marketResolved = this.market (symbol); market = marketResolved;` — the write is an identifier
   copy, not a producer call, so `marketRowValueOrNullish` cannot follow it (no alias hop in that rule).
6. **Test-driver `exchange.market(…)` receivers (2 sites, TestMethods.cs:576/1442).** The receiver is a
   call on the test driver's `exchange` local, not on `this`; `marketRowProducer` only accepts `this.`
   calls. `test.fetchMarkets.cs` / `test.createOrder.cs` (3 sites) additionally read a
   `Object.values(exchange.markets)` element — reject 2.
7. **Numeric keys — `MARKET_ROW_NUMERIC_KEYS` deliberately NOT added.** Census
   (tools/U01/key-value-census.mjs): `contractSize` 118 fields (55 undefined, 22 `parseNumber`, 17
   identifiers, 14 `safeNumber`, 9 conditionals, 1 `quoteMultiplier`), `strike` 120 (101 undefined, 12
   `parseNumber`, 4+1+1 identifiers, 1 `safeNumber`), `expiry` 118 (85 undefined, 23 identifiers, 6
   `timestamp`, 1 `parse8601`, 1 conditional, 1 numeric literal), `numericId` 5. The TS `Num`/`Int`
   spellings cover *both* C# boxes: a `parseNumber`/`safeNumber` value boxes a `double`, a
   `safeInteger`/`parse8601`/`this.milliseconds()` value an `Int64`, and integer literals an `int` — so
   a `(double?)` or `(Int64?)` cast would throw `InvalidCastException` on the writers of the other box
   where the `object` declaration flows on today. Recorded as the reason the table stays out; the keys
   also have 0 declaration sites in the tree.
8. **Bool keys `margin` / `active` / `quanto` / `prediction` / `percentage` / `tierBased` not added.**
   `margin` (120 fields) and `active` (121) have `this.safeValue (market, 'margin_enabled'|'is_active'|…)`
   writers typed `any` (5 sites) plus `identifier:status`/`safeValue` writers — no static proof the box
   is a boolean; `quanto` has exactly one writer, typed `any`; `percentage`/`tierBased` each have one
   `fees['percentage']`-style `any` writer (weex). Rejected on doubt (0 sites today).
9. **`fees` (0 writers) and `marginModes` (4 object literals + 3 dict-typed identifiers)** not added to
   the dict table: `fees` is not a market-row key at all; `marginModes`' identifier writers
   (`binance`, `bitget`) have no proven C# box.
10. **`GetValue(market, "precision")` nested reads (3 sites).** `object precision =
    getValue(GetValue(market, "precision"), "price")` — the declaration's receiver is the precision
    dict, not the market row; the inner read's box is a dict whose element read is not a market-row key
    table entry (a different family).

## Residual risk

- The parameter-receiver proof rests on the TS annotation (`Market`) plus the corpus: ts/src compiles
  against it (the transpiler itself type-checks) and 120/121 sites additionally have a dominating
  `safeMarket` write. An external C# caller that passes a non-market dict to a generated `object market
  = null` parameter would hit the new `(string)` cast; the corpus never does, and the same argument
  already underpins the landed `this.safeMarket (…)` producer rule.
- 3 sites (bitget/hyperliquid/bitstamp) rely on the annotation alone (no dominating write) — called out
  above; their callers are enumerated in ts/src and all pass a market row or `undefined`.
- `Market`-interface keys are typed `Str`/`Bool`, i.e. nullable: the new locals are `string?`/`bool?`,
  never non-null, so a null box stays null.
- Volume: 140 declarations across 70 files were audited only by the gates below (verify-diff pair
  equality + farm build + fixed-point hash); spot-checking the largest files (bitget.cs, weex.cs,
  pacifica.cs, paradex.cs) shows declaration-line-only diffs.
- The markets-map receiver shape (reject 2) is the largest remaining untyped slice of this family
  (8 exchange sites + 5 test sites); it needs its own writer census before it can be typed.

## `hotspot:`

- `hotspot: build/csharp-local-types.js` — MARKET_ROW_* tables + `marketRowReadKey` receiver branch +
  `marketRowProducer` helper list (lines ~5075–5310 and the `csharpLocalDeclaration` chain ~5770).
  This is the only build file touched.
- `hotspot: none` — `build/csharpTranspiler.ts` untouched.
- `hotspot: none` — ast-transpiler `src/` untouched (`[AST]` unit not needed; no ast worktree commit,
  no pin change).
- `hotspot: none` — hand-written base (`cs/ccxt/base/*.cs`, `cs/ccxt/ws/*.cs`) untouched.

## Tools (campaign dir, not `build/`)

`campaigns/cs90/tools/U01/`: `market-row-local-census.mjs` (TS receiver census),
`r2-param-probe.mjs` (parameter-receiver verdicts), `key-value-census.mjs` (per-key writer/value-kind
census + element writes), `join-census.py`, `ids-{rest,ws}.txt`.

## Farm (report tip)

See the commit list: the code commit `a71084237d75b133bdd2fdc6cd29855b5a9068da` is farm-green
(job 674, exit=0, 0 warnings). This REPORT.md tip carries no build input; its own gate is recorded in
the campaign's final summary (`ccxt-farm status <tip sha>`).
