# U10 — `this.safeValue (recv, key)` (no default) → `this.safeDict` where every later read is a dict read

Unit: `cs90/U10` (roster line U10; upper bound ~500 no-default `this.safeValue` declaration sites).
Branch `cs90-U10`, base `d847892a6fcf5699640862316303b6344a3e4daf`, ast-transpiler pin
`404e9daa7f0ab58d085ed04aaa61a19546dfeda2` (untouched). Worktree `/root/worktrees/cs90/U10`.

**Family.** A TS declaration `const <name> = this.safeValue (<identifier receiver>, <literal key>);`
with **no default argument** — the arity that separates this unit from U08 (`{}` default) and U09
(`[]` default) — whose **every** later reference is a dict-shaped read. The call becomes
`this.safeDict (...)`, which the classifier already types from the existing `safeDict*` row
(`build/csharp-local-types.js:1436`, landed by cs-strict S25 / `retypeSafeCollectionHelpers`; the
generated C# body returns `defaultValue as IDictionary<string, object>`, so nothing on the call path
casts and a non-dictionary value degrades to the default instead of throwing).

**Delivered:** 75 TS lines in 49 files → **72 locals retyped `object` → `IDictionary<string, object>`**
and **3 `((IDictionary<string, object>)…)` casts removed** in 49 generated C# files.

**Rules / tables / passes touched: NONE.** No `build/csharp-local-types.js` or
`build/csharpTranspiler.ts` edit, no ast-transpiler change, no hand-written `cs/ccxt/base/*.cs` file,
no generated file edited by hand, `package.json` pin unchanged. The diff is `ts/src/**` plus the
regenerated `cs/ccxt/exchanges/**`.

## The acceptance rule (per declaration site)

Census space: every `const <name> = this.safeValue (<identifier>, <literal>)` declaration in
`ts/src/**.ts` (REST + pro + prediction): **579 sites**, each classified by
`campaigns/cs90/tools/U10/analyze.ts` (TS compiler API, shared program over the candidate files,
scope-resolved via `getSymbolAtLocation`, so shadowed names and closures are handled).

A site is rewritten only when **every** reference of the binding is one of:

* **a keyed `this.safe*` read with a string key** — `safeString/String2/Lower/Upper/N`,
  `safeInteger*`, `safeNumber*`, `safeFloat*`, `safeBool*`, `safeDict*`, `safeList*`, `safeValue*`,
  `safeTimestamp*`, `safeMarket`, `safeCurrency`, `safeSymbol`, `safeCurrencyCode` — where the key
  argument is a string literal or an array of string literals. These helpers guard with
  `prop ()`'s `isObject` test in the TS source and with `SafeValueN`'s dictionary branch in C#, so a
  `null`/`undefined` receiver returns the same default the old code produced for a non-dictionary
  value: **the read result is identical under both spellings** (`ts/src/base/functions/type.ts:17`,
  `cs/ccxt/base/Exchange.SafeMethods.cs` `SafeValueN` — an `IList<object>` receiver answers only
  numeric keys, i.e. a string-keyed read of a list is already `defaultValue`).
* **an argument whose resolved parameter type is a `Dict`** (`checker.getResolvedSignature` →
  `getTypeOfSymbolAtLocation`, string-index-signature test) — the "ts/src types the value as `Dict`"
  clause of the roster line: `this.parseTransaction (data)`, `this.parseOrder (sendStatus, market)`.

Everything else rejects, including: a **numeric-keyed** helper read (`safeString (info, 1)` — the
value is a list there), a **dynamic key**, `x['k']`/`x[i]` element access (a raw read throws on
`undefined` where the old code still answered), `Object.keys`, `Array.isArray`, `typeof`, a
comparison/truthiness test (`x !== undefined` — the value's presence is exactly what changes),
`return x`, a property read (`x.length`), an object-literal/property escape (`'info': x`), a
`for…of`, a spread, a write to the binding, a call argument whose parameter is not a `Dict`, a
non-identifier receiver (`this.options`-style module state), a nested call (no C# declaration), and
any binding that already carries a TS type annotation.

## The pair rule (one revert, with proof)

The classifier's pre-existing safeValue-twin family (`build/csharp-local-types.js:3141-3293`)
keys its evidence on the (`receiver identifier`, `literal key`) pair **per file**: a pair that
carries both a dict mention and a list mention names nothing, and every one of its sites keeps
`object`. Converting a no-default site adds a `safeDict` mention to that pair, so it can **flip a
sibling list site back to `object`** — a typed→object change, which the brief forbids.

Measured: exactly one delivered site had that effect — `ts/src/pro/poloniex.ts:1367`
(`data = this.safeValue (message, 'data')`, a second site of the pair whose other site is
`data = this.safeValue (message, 'data', [])`, typed `List<object>` in the base). Its conversion
produced
`- List<object> data = ((List<object>)this.safeValue(message, "data", new List<object>() {}));` /
`+ object data = …` in `cs/ccxt/exchanges/pro/poloniex.cs`. **Reverted** — the delivered diff
contains no typed→object line (audited, see below), and the list site keeps its typing.

## Numbers

| | before (base `d847892a6`) | after |
|---|---|---|
| `locals: object` / typed | 9304 / 44132 (82 %) | **9232 / 44204** (82 %) |
| casts `(IDictionary<string, object>)` (spaced spelling, the one this family removes) | 127 | **124** (−3) |
| casts `(IDictionary<string,object>)` (unspaced spelling) | 2563 | 2563 |
| `params: object` / `returns: object` | 11635 / 1080 | unchanged |
| `isTrue` / `isEqual` / `getValue` / `add` / `getArrayLength` | — | unchanged |

`cs/` diff: **49 files, 75 changed line pairs** — 72 `object X = this.safeValue(…)` →
`IDictionary<string, object> X = this.safeDict(…)`, 3
`IDictionary<string, object> X = ((IDictionary<string, object>)this.safeValue(…))` →
`IDictionary<string, object> X = this.safeDict(…)` (cast removed: `bitbank.cs` ×2,
`pro/bitget.cs` ×1). No other file class touched (no base, tests, examples, ws, prediction).

`ts/src` diff: 49 files, 75 changed lines, each one the single token `this.safeValue` →
`this.safeDict` on the same line (4 of them additionally append the type-level ` as Dict`, see
below); verified mechanically by `tools/U10/audit_ts.py` (`pairs=75 blocks=0 violations=0`).

## Gates run locally

* Baseline first: scoped regen on the untouched tree
  (`…csharpTranspiler.ts --noTests binance bybit okx kraken gate`) → `git diff -- cs/` **empty**;
* `npx tsc --noEmit -p tsconfig.json` (TS 7 native, `strict` + `strictNullChecks`) → **exit 0** over
  all 75 edits; the checker was proven live in the same run (removing one ` as Dict` produced
  `TS2345: Argument of type 'Dictionary<any> | undefined' is not assignable to parameter of type 'Dict'`);
* scoped regen `--noTests <19 REST ids>` + `--noTests --ws <30 pro ids>`; reverted `cs/`, re-ran both:
  `git diff --stat -- cs/` = 75 insertions / 75 deletions both times (**fixed point**), and the
  census line is byte-identical either way;
* `python3 campaigns/cs90/census.sh` before/after (table above) — the only moving counters are the
  two this family moves;
* `python3 campaigns/cs90/verify-diff.py HEAD`: `pairs=75 unexpected=75` — the script's DECL rule
  requires the initializer to be byte-equal modulo a cast, and this family's deliverable is exactly
  a *callee swap* (`safeValue` → `safeDict`) next to the declaration swap, so it models none of the
  75 pairs. Justified as one class here (the roster's own mechanism), and audited mechanically by
  `tools/U10/audit_cs.py`;
* `python3 campaigns/cs90/tools/U10/audit_cs.py`: `retype+swap=72 cast-removed=3 violations=0`.
  It reconstructs each plus line from its minus line (same indent, same name, same argument list,
  declaration `object`→`IDictionary<string, object>` / callee `safeValue`→`safeDict`) and requires
  byte equality everywhere else. `--selftest` PASS: it flags a stray added line, a mutated argument
  list, and a typed→object flip, and accepts both true pair shapes.
* `python3 campaigns/cs90/tools/U10/final_audit.py d847892a6` — the same two checkers over the
  **committed range** (base → branch tip, i.e. the state the farm saw):
  `cs/ : retype+swap=72 cast-removed=3 violations=0` and `ts/ : pairs=75 blocks=0 violations=0`.

## The ` as Dict` assertion (4 sites + 1 calibration site)

Without a default argument `safeDict` is typed `Dictionary<any> | undefined`
(`ts/src/base/Exchange.ts:3220`) while a `parse*` parameter is `Dict`, so a site whose value reaches
a `Dict` parameter needs the type-level assertion — the idiom already used upstream
(`ts/src/bingx.ts:2182` `this.safeDict (response, 'data', {}) as Dict`,
`ts/src/bitbank.ts:804` `this.parseOrder (data as Dict, market)`). It is erased in every port
(verified on the currently generated trees: Python/Go emit no cast for the same construct) and the
C# printer emits the plain `IDictionary<string, object> X = this.safeDict(…);` — checked in the
generated diff. Sites: `bingx.ts:6322`, `coinmate.ts:821`, `krakenfutures.ts:1436`,
`pro/bitvavo.ts:1364`, `bitbank.ts:850`. No TS-level assertion exists on the other 70 sites.

## Rejected sub-cases

579 sites classified; 74 accepted by the rule, 1 of those reverted by the pair rule (above), and the
2 calibration sites (`bitbank.ts:850`, `kucoin.ts:8386`, both converted while the rule was being
tuned and both passing it) make the delivered 75. **505 sites rejected**:

| n | class | reason |
|---|---|---|
| 204 | `binary` / test | the local is compared (`data === undefined` 4, `error !== undefined` 10, `fee !== undefined` 8, `fees !== undefined` 4, `success === true` 7, …): presence/truthiness is exactly what the rewrite changes, so those sites reject |
| 153 | `name-owned-by-sibling` | the local's name is a sibling unit's family: `amount` 26, `price` 25, `stopLoss` 19, `takeProfit` 19 (U12), `method` 9 (U11), `order` 8 (U06), `takeProfitPrice`/`stopLossPrice` 12 (U12), `params` 8 (U26), `ticker` 6 (U06), `trades` 5, `symbol` 4, … — rejected on ownership, not on shape, so a follow-up unit can take them |
| 91 | `call-param-not-dict` | the value escapes into a call whose parameter type the checker resolves to something else: `Array.isArray` (14), `this.parseOrderBook(orderbook: object)` 9, `this.numberToString(any)` 7, `Object.keys` 5, `this.market(string)` 2, `this.isEmpty(any[] | Dictionary<any>)` 2, `this.createOrderRequest(number)` 28, `this.parseWsTrade/parseOHLCV/…` — no `Dict` parameter, no proof |
| 20 | `other` | object-literal / property escapes (`'info': x`, `{ x }` — 18 are `PropertyAssignment`), i.e. the value leaves the method's local proof |
| 19 | `property-access` | a dict member read (`data.length` 5, `x.push`, `x.map`, …) — a list operation on the same object |
| 9 | `helper-numeric-key` | a keyed helper read with a **numeric** key (`safeString (info, 1)`) — the value is a list there (bitfinex transaction rows) |
| 2 | `element-literal` | a raw `x['k']` read (the C# `getValue(x, "k")` spelling): legal on a dict, but it throws on `undefined` where the old code answered — rejected on doubt |
| 2 | `helper-no-key`, 2 `call-unknown-param`, 1 `helper-dynamic-key`, 1 `test`, 1 `annotated` | `this.safe*(x)` without a key, a callee the checker cannot resolve, a non-literal key, a bare condition, an already-annotated binding |

Beyond the 579-site space (never convertible, not counted above): calls whose receiver is not an
identifier (`this.options`, `client.subscriptions`, `market['id']` — U11/U41 families),
`this.safeValue2/safeValueN` (U12), and calls nested in another expression (no C# declaration).
Roster-named locals delivered: 52 of the 75 (`first` 26, `data` 15, `result` 4, `info` 2, `error` 1,
`fee` 1, `withdraw` 1, `response` 1, `tick` 1 — `response_data`/`payload` appear only on rejected
sites); the other 23 are the same shape on locals no sibling roster line names
(`firstDelta` 3, `feesValue`, `firstAddress`, `currencyInfo`, `baseData`, `quoteData`, `sendStatus`,
`orderPriorExecution`, `auxiliary`, `firstError`, `granularity`, `symbolTradeLimit`, `marketInfo`,
`bid`, `ask`, `deposit`, `kline`, `msgData`, `arg`, `event`, `tickerData`).

## Residual risk

* **The unit is a behaviour change in all seven ports, not a pure declaration typing.** When the
  wire value under the key exists but is *not* a dictionary, `safeValue` returned that value and
  `safeDict` returns its default (`undefined` in TS, `null` in C#). Every accepted site's own reads
  are string-keyed `safe*` helper calls or `Dict`-parameter consumers, and for those the result is
  identical (`prop ()`'s `isObject` guard / `SafeValueN`'s dictionary branch both answer "default"
  for a list/string/number receiver). The unproven corner is the `Dict`-parameter class (5 sites):
  there the callee now receives `undefined`/`null` instead of a non-dictionary value — inspected
  (`bitbank.parseOrder`, `krakenfutures.parseOrder`, `bingx/coinmate/pro.bitvavo.parseTransaction`)
  and each body reads its argument only through `safe*` helpers, so it degrades to the same
  empty-parsed object instead of garbage. Sites where the value can legitimately be a list are all
  rejected (`helper-numeric-key`, `safeList` siblings, the pair rule).
* **Pair-evidence coupling.** A conversion strengthens the (`receiver`, `key`) pair for the
  classifier's twin family in that one file. One instance was measured and reverted (pro/poloniex,
  above); the local full-tree regen plus the farm's repo-wide `--force` transpile are the check that
  no other pair flipped — the delivered `cs/` diff contains no line outside the two classes.
* **Sibling overlap at integration.** U08/U09 rewrote the same files' *defaulted* `safeValue` sites;
  their branches add `safeDict`/`safeList` mentions to pairs this branch also touches (e.g.
  `bitbank response::'data'`), which is the same direction (dict) and cannot disagree with the
  delivered typing. Where a pair has both a dict site (this unit) and a list site (U09), the revert
  above keeps the list typing — the integrator should re-run the census after merging U08/U09.
* **Not run here:** the behavioural suites (`id-tests-cs`, `request-cs`, `response-cs`) — dotnet is
  farm-only on this VM; the farm job compiles the C# tree only. The 75 sites are REST/pro
  request/response paths those suites would exercise.
* The generated non-C# trees are not part of this branch (other ports regenerate from the same
  `ts/src` in their own lanes); each port's `safe_dict`/`safeDict` has the same "default when the
  value is not a dictionary" semantics, so the change is uniform.

## Hotspots

* `hotspot: none` — `build/csharpTranspiler.ts`, `build/csharp-local-types.js`, the ast-transpiler
  (`/root/worktrees/cs90-ast/pin`, pin unchanged) and every hand-written `cs/ccxt/base/*.cs` file are
  untouched by this unit.
* `ts/src/*.ts` (49 files, 75 one-token edits) is the unit's real hotspot (shared with 6 other
  languages); every edit is a callee-token swap on a line that already carried the dict proof, plus
  the 5 type-level ` as Dict` assertions.

## Artifacts (campaign tooling, not committed to the repo — brief rule 6)

`/root/.hermes/profiles/deepseek/campaigns/cs90/tools/U10/`: `analyze.ts` (site census + use-shape
verdicts via the TS compiler API + `--json` dump), `apply.py` (byte-exact rewrite from the accepted
dump, adds ` as Dict` only where the value reaches a `Dict` parameter), `audit_ts.py` (TS pair
audit), `audit_cs.py` (C# pair audit + `--selftest`), `cs_sites.py` (C#-side census),
`context.py`/`context2.py` (hand-review context printer), `final_audit.py` (both audits over a committed ref range). Raw dumps: `/tmp/u10_analysis.json`
(579 verdicts), `/tmp/u10_census_before.txt`, `/tmp/u10_census_after.txt`.

## Farm

`ccxt-farm build --targets cs --wait` on the code commit `4d66e34c0bd`:

```
HEAD 4d66e34c0bdad165970cf09fffa2911b811abf0f job=671 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
```

`exit=0` = the C# tree compiles (0 errors, 0 warnings from this diff);
`branch_update=unchanged` = the farm's repo-wide `--force` transpile reproduced the committed `cs/`
tree byte-for-byte, i.e. the scoped local regen did not miss a file and the committed tree is the
generator's fixed point. This report-only commit touches no build input.
