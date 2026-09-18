# U13 — destructured element-0 string joins for `[ value, params ] = this.handle*AndParams (…)`

**Family.** Locals of the roster's name set (`marginMode` / `type` / `method` / `stock` /
`category` / `subType` / `marketType` / `instType`) whose value is written by a destructuring
element read `X = <tmp>[0]` (or `X = ((IList<object>)<tmp>)[0]` / `[1]`) from the
`handleMarginModeAndParams` / `handleMarketTypeAndParams` / `handleSubTypeAndParams` /
`handleOptionAndParams` helper family: the declaration becomes `string?` behind the forced
`(string)` element cast (the ELEM_CAST rule the roster names), and that cast is emitted only where
the helper's own C# body boxes a **string or null in that slot on every return path**.

**Delivered:** **64 declarations retyped** (`object` → `string?`), **60 forced element casts added**,
**0 casts removed** (this family's direction is a forced cast on a newly typed declaration, not a
cast removal). 8 files: `bybit.cs` 29, `pro/binance.cs` 12, `btse.cs` 7, `hashkey.cs` 7,
`deepcoin.cs` 5, `bingx.cs` 2, `blofin.cs` 1, `kucoin.cs` 1.

By name (base → worktree, `grep -hE '^\s+object <name> = '` over `cs/ccxt/exchanges/**`):

| name | `object` before | `object` after | `string?` before | `string?` after |
|---|---|---|---|---|
| `type` | 82 | **60** | 472 | 494 |
| `marketType` | 39 | **19** | 154 | 174 |
| `category` | 11 | **1** | 14 | 24 |
| `subType` | 11 | **4** | 129 | 136 |
| `marginMode` / `method` / `stock` / `instType` | 142 / 108 / 14 / 13 | unchanged | — | — |

59 of the 64 are in the roster's name set; the other 5 are the same mechanism's knock-ons
(`currentCategory`, `requestedType`, `rawMarketType`, `urlType` × 2 — reference copies / string
literals the base's own join rules type once the producing local is typed).

By helper + slot (64): `getBybitType` slot 0 — 28; `handleMarketTypeAndParams` slot 0 — 22;
`resolveAuthType` slot 1 — 5; `resolveAuthType` slot 0 — 3; `handleSubTypeAndParams` slot 0 — 2;
copy/ternary knock-ons — 4.

In-census accounting for the roster's ~260-site upper bound (the `sites-base.json` site list built
from the base tree): **37 sites typed, 223 unchanged** (reject table below; the 22 further typed
declarations of those names are literal-initialised sites the `= null` census does not count).

## Rules / tables / passes touched — `hotspot: build/csharp-local-types.js` (only file under `build/`)

* `DESTRUCTURED_STRING_HELPERS` += `getBybitType` (bybit), `resolveAuthType` (pro/binance), each with
  its evidence inline. bybit's element 0 is its `type` (handleMarketTypeAndParams) or its `subType`
  (handleSubTypeAndParams) on every return path — the `'option'`/`'spot'` guard only picks which;
  pro/binance's element 0 is its `type` (handleMarketTypeAndParams, option/stock kept, else the
  `'future'` / `'delivery'` literals). Both take no `defaultValue` argument (table entry `0`).
* `DESTRUCTURED_STRING_ELEMENT_INDEXES` + `stringElementIndexes()` (new): slot 0 for every audited
  helper, plus **slot 1 for `resolveAuthType`** — its `[ type, subType, params ]` puts the
  handleSubTypeAndParams box there (5 sites). Element loads at a listed slot take the same `(string)`
  cast; `installDestructuredCasts` now reads the statement's callee name (`holderHelper()`) for it.
* `destructuredStringElementProof (csharp, declaration, idNode, assignment, name, context)`:
  (a) the **literal-initialised shard** joins the same proof (the previous
  `SAFE_STRING_ELEMENT0_HELPERS`-only restriction is gone — a literal init's own box is the string
  the helper may hand back); (b) the `defaultValue` gate also accepts an argument whose own proven
  C# type is `string` / `string?` (binance pro `defaultMarket = isMarkPrice ? 'swap' : undefined`, so
  the helper still hands back a string or null); (c) the slot check is the table above.
* `literalInitElement0Type (…)` falls back to the string proof (literal init + audited helper ⇒
  `string?`, joined with the literal's own box through the base's widening edge).
* Comments updated: module header (new cs90 U13 paragraph naming what stays out and why), the
  `DESTRUCTURED_STRING_HELPERS` header, `isNullInit`'s, the `installDestructuredCasts` cast comment.

No change to `build/csharpTranspiler.ts`, no hand-written base file, no `ts/src`, no ast-transpiler
edit (pin unchanged, `404e9daa`).

## Census (campaign `census.sh`, `cs/ccxt/exchanges/**`)

| | before (base `d847892a6`) | after |
|---|---|---|
| `locals: object` / typed | 9304 / 44132 (82 %) | **9240 / 44196 (82 %)** |
| `casts: (string)` | 2113 | 2113 (this unit *adds* single-paren `(string)` element casts; that counter counts `((string)`) |
| `isEqual` helper calls | 12034 | 11971 (the 55 equality rewrites below) |
| `params: object` / `returns: object` | 11635 / 1080 | unchanged |
| other cast counters (`IList<object>`, `IDictionary…`, `(object)`, `Int64`, `List<object>`) | — | unchanged |

## Gates run

* **Baseline first**: scoped regen on the untouched base left `git diff -- cs/` empty.
* Full local regen (104 REST ids + 76 ws ids + 7 prediction ids + `--baseClass`), run **twice**:
  `git diff -- cs/ | sha256sum` = `ee6eea794c889ca4c38c96060931a261820379ec18bae3b5daa4fc8d97f5b330`
  both times — **fixed point**; only ` M` entries under `cs/` (no deletions, no untracked output).
* `campaigns/cs90/tools/U13/audit-diff.py . HEAD`: `179 pairs = 64 decl-swap + 60 element-cast +
  55 equality-rewrite, unmatched=0` — every changed line is one of the three shapes.
* `campaigns/cs90/tools/U13/check-uncast-elements.py .`: 582 string-typed element writes tree-wide
  carry the `(string)` cast, **0 missing** (the compile gate: an uncast element read into a
  `string?` local is CS0266).
* `campaigns/cs90/verify-diff.py HEAD`: `files=8 pairs=179 unexpected=79` — both unexpected classes
  justified below.
* `eslint build/csharp-local-types.js`: **not usable on this box** — `typescript-eslint` crashes
  before parsing (`TypeError: Cannot read properties of undefined (reading 'Cjs')`, exit 2, no lint
  output) and reproduces on an unchanged file. No TS source changed in this unit.

## `verify-diff.py` unexpected lines — two classes, both proven

1. **55 equality rewrites.** A name the module declares `string`/`string?` in the enclosing function
   is reported to the printer by the *base* pass `installCsharpStringEquality` (cs-strict S60), which
   then prints `x == "lit"` / `x != "lit"` where the untyped name printed `isEqual (x, "lit")`.
   Identity: for `x` a string or null, `isEqual (null, "lit")` is `false`
   (`cs/ccxt/base/Exchange.TranspileHelpers.cs:303`) and `null == "lit"` is `false`; for a string both
   are ordinal string equality. This is the base mechanism's intended output for a typed string
   local, not a rule of this unit.
2. **24 element casts on the typed-holder spelling.** `X = XparametersVariable[0];` →
   `X = (string)XparametersVariable[0];`. `verify-diff.py` models this rule only as `ELEM_CAST` over
   the untyped-holder spelling `((IList<object>)tmp)[i]` (36 of this unit's 60 casts are accepted
   that way); here the holder is already `IList<object>` (the base's `retypeDestructuringTemp` types
   it for the `*andle*` callee names), so there is no inner cast token to match. Same rule, same
   proof; `audit-diff.py` verifies all 60 pair-wise (same target, holder and index, only the cast
   token added).

## Rejected sub-cases (distinct declarations, post-change instrumented census)

| n | class | reason |
|---|---|---|
| 124 | `handleMarginModeAndParams` slot 0 (`marginMode`; + `customHandleMarginModeAndParams` 1, `handleOptionAndParams2` 6 folded in below) | **element 0 is the caller's params value.** `Exchange.BaseMethods.cs#handleOptionAndParams` (the only method the helper returns) stores `object value = this.safeValue2 (parameters, optionName, defaultOptionName)`, then `value = ((value != null)) ? value : defaultValue;` — a `(string)` cast would throw for a non-string `params['marginMode']` where the untyped box flows on today. Same verdict as #30502 U04 and cs-strict S27; campaign rule 1 forbids naming a box that is not there. |
| 50 | `handleOptionAndParams` slot 0 (`method`, `stock` (bool shard), `type`, `subType`, `instType`) | same body, same `value` slot. |
| 11 | `getInstType` (bitget pro) | element 0 is its `instypeAux` — `handleOptionAndParams (parameters, methodName, "instType", instType)`, the caller's params value again. |
| 6 | `handleOptionAndParams2` (`method`, `marginMode`, `subType`) | same body (`handleOptionAndParams` + the second option key). |
| 1 | `customHandleMarginModeAndParams` (cryptocom) | element 0 threads `handleMarginModeAndParams`. |
| 2 | `parseOrderTypeTimeInForceAndPostOnly` (venue helper) | element 0 is not an audited box (its own reads are `handleOptionAndParams`-shaped); not added to the table. |
| 4 | `D2` — destructuring callee is not `this.<name>(…)` | the element proof cannot attribute the tuple's producer. |
| 2 | `D8` — same printed name declared twice in one function (gate `createOrder`, `marginMode` from `getMarginMode`) | the element proof **holds**, but the injected cast is keyed on the printed name per function, so the pass declines (`bindingCounts != 1`). A per-assignment-node record would fix it; left out because that record is shared with the dict-helper injection (`DESTRUCTURED_DICT_HELPERS`) and the gain is 2 declarations. |
| 19 | `R14` — candidate `string?` with an unprovable later write | e.g. `marketType = getValue (market, 'type')` (the U01 market-row key), a `.toUpperCase()` into the same local, or an unprovable ternary arm; the write-join rejects, so the declaration stays `object`. |
| 16 | `R16` — candidate `string?` used as the **LEFT operand of `+`** | `stringPlusOperandIsProvablyString` fails (the other operand is a parameter / untyped local, or the local is nullable so `add(string?, x)` diverges from `add(object, object)` on a null left). Includes the two pro/binance `resolveAuthType` slot-0 sites (`watchBalance`, `watchPositions`: `type + ':fetchBalanceSnapshot'` / `type + ':positions'`). Owned by the `add` families. |

Total rejected declarations: 235 (200 at the element-0 proof + 35 at the outer safety scan), against
64 typed. The 8 `<no-destructure>` `type` locals (binance, bithumb, bitstamp, btcbox, coinsph,
latoken, mercado, mexc) have no plain write in their method (only `??=`), so there is no element
proof to make; the `<other-write>` locals (`method`, `marketType`, `category`, `marginMode`,
`subType` — 22 sites) are written by `this.safeValue (methods, …)`, `getValue (market, 'type')`,
`safeString*` or a non-destructuring assignment, i.e. other families' producers.

## Residual risk

* **The added cast is the deliverable's risk.** For every accepted helper the slot is proven to hold
  the audited string-or-null box (handleMarketTypeAndParams with its gated `defaultValue` argument
  and its market-row `'type'` census from S27; handleSubTypeAndParams; and through them bybit's
  `getBybitType` and binance's `resolveAuthType`), but the *inherited* hole is the base's own:
  `handleSubTypeAndParams` still admits `this.options[methodName]['subType']` /
  `this.options['subType']` (module state the user can set) — exactly the evidence the base accepted
  when the helper was added (cs-strict S27). This unit only inherits it (bybit's `subType`, and
  pro/binance slot 1). A user passing a non-string there now throws `InvalidCastException` where the
  untyped box flowed on; sites whose slot comes from the **caller's params** (the 192 rejected ones)
  are left `object` precisely to avoid that.
* **55 equality rewrites** move `isEqual (x, "lit")` to `x == "lit"` for the newly typed names (the
  base S60 mechanism, behaviour-identical — see above). It widens the diff beyond declaration lines;
  it is that pass's own output, not an edit of this unit.
* The 5 knock-on declarations follow from the base's copy/ternary join rules once the producing local
  is typed; each write is a reference copy or a string literal.
* **Ownership note.** U21's roster line also claims string-literal-init joins; per rule 5 the lower
  unit number owns a contested site and U13's line explicitly owns the destructuring write, so the
  literal-init + destructuring sites are delivered here. If U21's branch implements that join
  independently the integrator should dedupe by line.
* Merge surface for sibling units: `bybit.cs`, `pro/binance.cs`, `btse.cs`, `hashkey.cs`,
  `deepcoin.cs`, `bingx.cs`, `blofin.cs`, `kucoin.cs` (declaration lines, element loads and equality
  lines only).
* Tooling (in `campaigns/cs90/tools/U13/`, never committed): `sites.py` (base site census),
  `site-outcome.py` (per-site before/after), `audit-diff.py` (3-shape pair audit),
  `check-uncast-elements.py` (compile gate), `instrument-rejects.py` + `instrument-destructured.py`
  (temporary classifier instrumentation for the reject table — the classifier is committed
  un-instrumented, `md5 ce9fcddfd0809d6049fd906818fcbc71` re-verified after the last census).

## Farm

* code commit `b42b2791041` (the tree this file's numbers describe, `cs/` + `build/csharp-local-types.js`):
  `ccxt-farm build --targets cs --wait` → `HEAD b42b279104144697da1969ba4a7e6dd39a49372c job=747
  exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`. `exit=0` is the
  dotnet build (0 errors / 0 warnings from this diff) and `branch_update=unchanged` is the farm's own
  repo-wide `--force` transpile reproducing this tree byte-for-byte — i.e. the committed `cs/` tree is
  the generator's fixed point and the local regens missed no file.
* tip commits after that one add only this report (no build input); their own farm note is recorded in
  the unit summary.
