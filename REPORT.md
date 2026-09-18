# U31 — `filterByArray` + generated `parse*` list/dict returns

Branch `cs90-U31` (flat, farm refuses slashes) · base `d847892a6fcf5699640862316303b6344a3e4daf`
(PR #30530 head) · ast-transpiler pin `404e9daa7f0ab58d085ed04aaa61a19546dfeda2` (unchanged — this is
**not** an `[AST]` unit) · code commit `1a5f3719053380663a0706440c3a1844a92f0fda`.

## Family

| callee | sites typed | mechanism | new declaration type |
|---|---|---|---|
| `this.filterByArray(objects, key, values, false)` | 27 (+2 in the generated base) | per-call-site box proof + exact cast | — (declaration stays `object`) |
| `this.filterByArray(objects, key, values)` (3-arg, `indexed` default `true`) | 3 | same | — |
| `this.parsePositions` (+ krakenfutures override) | 22 | name-keyed `CSHARP_COLLECTION_RETURN_METHODS` | `IList<object>` |
| `this.parseSettlements` (9 venue declarations, no base) | 12 | `CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION` + return-path proof | `List<object>` (8 of 9) |
| `this.parseBorrowInterests` (single base declaration) | 10 | by-declaration proof | `List<object>` |
| `this.parseTickers` (+ hollaex override) | 6 | name-keyed | `Dictionary<string, object>` |
| `this.parseBorrowRate` (base stub + 7 overrides) | 4 | name-keyed | `Dictionary<string, object>` |
| `this.parsePredictionPositions` (prediction base) | 5 | by-declaration proof | `List<object>` |

**89 locals typed** (= the census delta, `cs/ccxt/exchanges/**`), plus 2 locals in the *generated base*
files (`Exchange.BaseMethods.cs:5937`, `PredictionExchange.cs:1907`) and **22 declaration signatures**
retyped (17 inside `exchanges/**` + the 5 base/prediction-base declarations). 123 changed lines,
60 files, every pair a declaration swap, a boundary cast or one of the two justified classes below.

## Why not the roster's "split typed overloads keyed by the indexed literal"

`this.filterByArray` is hand-written (one declaration in the generated `Exchange.BaseMethods.cs`, no
venue override) and branches on the `indexed` argument: a `false` literal reaches
`return this.toArray (objects)` (declared `IList<object>`) or the `results` local (`List<object>`);
the 3-argument default and the `true` literal reach `this.indexBy (...)` (hand-written
`Dictionary<string, object>`) on **every** branch. Two C# overloads cannot be keyed on a `bool`
*value*: a `bool` 4th parameter is a better conversion target than the `object` one for the literals,
so a `List<object>`-returning `bool` overload would also bind the three `true` call sites —
`pro/gate.cs:964`, `coinbaseinternational.cs:1841`, `prediction/myriad.cs:4072` — and its
`(List<object>)` cast would throw `InvalidCastException` on `indexBy`'s dictionary. The mirror scheme
(Dictionary variant keyed on `bool`) breaks the 27 `false` sites. **Rejected.**

Implemented instead: the box is proven per call site from the same hand-written body
(`filterByArrayBoxType`, keyed on the `indexed` argument literal) and named behind the exact cast —
the same "boundary cast" mechanism the collection tables use, with the cast made exact by the
argument. The cast spelling is the **widest honest** one: `IList<object>`, never `List<object>`,
because `toArray` is hand-written `IList<object>` and its `SlimConcurrentList` branch hands back a
non-`List` `IList` (`cs/ccxt/base/Exchange.Functions.cs:151-155`), so a `(List<object>)` downcast
would throw on the values-null path. 36 casts added (32 local casts + 4 declaration boundary casts),
1 cast removed (below), net +35. `verify-diff.py` accepts the 32 local casts (declaration + `((T)`
tail) and the 4 boundary casts; the remaining 5 pairs are the two justified classes.

Independent confirmation of the dictionary branch: at all three 3-arg sites the *next* line already
hard-casts the value to `IDictionary<string,object>`
(`pro/coinex.cs:176`, `pro/xt.cs:1118`) or passes it to `isEmpty` (`pro/poloniex.cs:1169`).

## Rules / tables / passes touched (all in `build/csharp-local-types.js`)

* **new** `FILTER_BY_ARRAY_BOX_METHODS` + `filterByArrayBoxType()` (lines 2977-3018): the indexed-literal
  box rule for `filterByArray` and its three typed wrappers (each forwards its `indexed` parameter
  unchanged, so the same literal key applies). Unproven shapes: a non-literal `indexed` (e.g. the base's
  own `this.filterByArray (result, 'currency', undefined, indexed)`) and any other arity.
* `csharpLocalTypeOf()` (chain entry `filterByArrayBox`, lines 5769 + 5825): names the proven box behind
  the exact cast. Because the type is set to `IList<object>` directly, the existing
  `List<object>` → `IList<object>` retry cannot re-spell it, so no downcast can be produced.
* `CSHARP_COLLECTION_RETURN_METHODS`: `parseBorrowRate` (line 880), `parseTickers` (899),
  `parsePositions` (971) — the three names that carry a base `virtual` plus at least one override, where
  the retyped set must be all-or-nothing per name (base and override print one type). Locals follow
  through the existing mirror loop.
* `CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION`: `parseBorrowInterests` (1103),
  `parsePredictionPositions` (1106), `parseSettlements` (1111) — every declaration proves on its own
  return paths, so no boundary cast is emitted (return lines byte-identical).
* `printsBareArrayAssertion()` (1193) + `unwrapPassthroughExpression()` (1199): the return-path proof now
  looks through `x as T[]` over a named element type. Printer fact (pinned ast-transpiler
  `src/csharpTranspiler.ts#printAsExpression`): `as any[]` prints `(IList<object>)(x)`, `as string[]`
  and every other array type print the bare expression — so for `as Position[]` / `as Settlement[]` the
  printed value IS the inner expression. `any[]` and `string[]` stay opaque (the first prints a cast;
  the second asserts a box an `IList<object>` claim must not accept). This is the only change to shared
  proof plumbing; its blast radius was **measured**, see "Verification".

`hotspot: build/csharp-local-types.js` — every entry above; `filterByArrayBoxType` and
`printsBareArrayAssertion` are new shared predicates, the three table edits change print-time decisions
for 22 declarations.
No change to `build/csharpTranspiler.ts`, none to `/root/ast-transpiler`, none to any hand-written
`cs/ccxt/base/*.cs` file, no `ts/src` edit.

## Census (`campaigns/cs90/census.sh`, `cs/ccxt/exchanges/**`)

```
before: locals: object=9304 typed=44132 typed%=82
after : locals: object=9215 typed=44221 typed%=82      (-89 object / +89 typed)
before: casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
after : casts: (string)=2113 (IList<object>)=1950 (bool)=1 (object)=674 (Dictionary<string, object>)=338 (IDictionary<string,object>)=2562 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
before: returns: object=1080      after: returns: object=1063      (-17 = the 17 retyped exchange-tree declarations)
before: helpers: getArrayLength=704   after: getArrayLength=700     (-4 native rewrites, below)
```

Cast deltas reconcile exactly: `(IList<object>)` +28 = 27 exchange-tree local casts + krakenfutures'
boundary return; `(Dictionary<string, object>)` +4 = 3 local casts + hollaex's boundary return;
`(object)` +2 = those two boundary casts; `(IDictionary<string,object>)` −1 = the removed cast.

## `verify-diff.py d847892a6fcf…` output

```
files=60 pairs=123 unexpected=5
  [PAIR] cs/ccxt/exchanges/okx.cs: - ((IDictionary<string,object>)borrowRateStructure)["period"] = 31536000000;
      + borrowRateStructure["period"] = 31536000000;
  [PAIR] cs/ccxt/exchanges/prediction/binance.cs: - int positionsLength = getArrayLength(positions);
      + int positionsLength = positions?.Count ?? 0;
  [PAIR] cs/ccxt/exchanges/prediction/kalshi.cs: - for (int i = 0; isLessThan(i, getArrayLength(parsed)); postFixIncrement(ref i))
      + for (int i = 0; isLessThan(i, parsed?.Count ?? 0); postFixIncrement(ref i))
  [PAIR] cs/ccxt/exchanges/prediction/opinion.cs / polymarket.cs: same pair
```

Both classes are knock-ons of the retyped locals, emitted by passes this unit does not touch:

1. **`getArrayLength(x)` → `x?.Count ?? 0` (4 sites)** — the existing `nativeListHelperCalls` post-print
   pass, which binds only names a region declares exactly once as `List<…>`/`IList<…>`. For a
   list-typed receiver `x?.Count ?? 0` is exactly `getArrayLength` (`null` → 0, else `Count`); the
   receivers are the just-retyped `positions` (prediction/binance) and `parsed`
   (kalshi/opinion/polymarket) locals, both fresh lists from `parsePredictionPositions`.
2. **one identity dict cast removed (okx)** — `borrowRateStructure` is now declared
   `Dictionary<string, object>`, so the printer emits the receiver's own indexer; `Dictionary`'s
   indexer set is the same operation as `IDictionary`'s. No runtime difference, fewer casts.

## Rejected sub-cases

* **`filterByArray` / `filterByArrayPositions` / `filterByArrayTickers` / `filterByArrayADLRanks`
  declared typed** — rejected: every one of the four has both a list and a dictionary return path
  selected by the `indexed` value at runtime; naming either box would throw on the other. (The wrappers
  also forward their `indexed` *parameter*, so not even the call-site literal rule can name them.) All
  four declarations keep `object`. No local is fed by the three wrappers — their call sites are
  `return ccxt.BaseExchange.ToXxx (…)` (the U30 converter path).
* **`this.parseDepositAddresses` (11 locals) — rejected.** Its single return is the local `result`, which
  is written by `this.filterByArray (result, 'currency', undefined, indexed)` — a **non-literal**
  `indexed`, i.e. a dictionary box whenever `indexed` is truthy (the TS `DepositAddress[]` annotation is
  optimistic there). The local's own retype is vetoed by the same mixed writes, so the declaration's
  proof fails on `return result` (declared `object`) and both the declaration and the 11 locals stay
  `object`. Proof of the mixed box is in the emitted body
  (`cs/ccxt/base/Exchange.BaseMethods.cs:6036-6056`).
* **`this.parseIds` (4 locals, okx + blofin) — rejected.** Both declarations hand the **caller's** box
  back on the non-string path (`return ids;` — a parameter), the documented "caller-provided box" reject;
  the proof cannot see through it and a caller census would have to cover `parseIds(ids)` self-writes
  inside the loops (`okx.cs:5055`, `blofin.cs:2749`). 0 changes.
* **`parseSettlements` in bitmex — rejected.** Its only return is
  `this.filterBySymbolSinceLimit (sorted, symbol, since, limit)`, i.e. `IList<object>`, which is not the
  by-declaration `List<object>`, so that one declaration keeps `object` (8 of 9 prove). The name has no
  base declaration, so the two spellings never meet in one class hierarchy and nothing is CS0508.
* **`filterByArray` / `filterOutByArray` bound with a non-literal `indexed`** — rejected by construction
  (`filterByArrayBoxType` returns undefined); only the `false` literal, the `true` literal and the
  three-argument default are named. `filterOutByArray` is the same shape but not in the roster's U31
  family: untouched, 0 sites.
* **`parseTickers` / `parsePositions` via the by-declaration route** — not used: the base declaration is
  a `virtual` with an override (hollaex / krakenfutures), so the pair must print one type; the proof
  would have had to hold for the override as well (krakenfutures' `return result` over a `List<object>`
  does not prove `IList<object>` statically). The name-keyed route retypes both and emits the boundary
  cast where the printed expression does not already carry the type.

## Verification

* **Farm** (dotnet is farm-only): `ccxt-farm build --targets cs --wait` from this branch, code commit
  `1a5f3719053380663a0706440c3a1844a92f0fda` → `job=716 exit=0 branch_update=unchanged
  generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`, `failing_files=[]` (`ccxt-farm status 716`); the
  earlier commit of the same tree `35c7c546b87…` → `job=673 exit=0 branch_update=unchanged` with
  `ccxt-farm log 673` showing every step exit 0 (pre-transpile, transpileCS, buildCS, stage-cs,
  discard-rest) and *"Build succeeded. 0 Warning(s) 0 Error(s)"*. `branch_update=unchanged` means the
  farm's own regenerated tree equals this commit. `ccxt-farm build --targets cs --force --rebuild`
  (job 735: `transpile_force=1`, `transpile_forced_by=generator`, `state=succeeded`, `exit_code=0`,
  `branch_update=unchanged`) is the full-tree fixed point: the farm's forced regeneration of every
  exchange, the base and the tests tree reproduced this commit byte-for-byte. This REPORT-only tip is
  gated by the same command (`ccxt-farm status <tip-sha>`; job id in the unit summary).
* **Fixed point** — the three scoped regens (`--force --noTests <rest ids>`, `--force --ws --noTests
  <ws ids>`, `--force --prediction --noTests <pred ids>`) were re-run three times (before the commit, after
  it, and after the comment trim): `git diff d847892a6fcf… -- cs/ | sha256sum` =
  `86162d9b1b2452083f29f7163c29609a0e4ea26fb494683896eb7a82969f354d`, 60 files / 123+123 lines, identical
  on every run.
* **Coverage** — the id lists are derived by grepping every `cs/**` file for the 9 family names, i.e.
  every file whose output can change; the base files and the prediction base are regenerated by any
  multi-id scoped run (verified in the diff: `Exchange.BaseMethods.cs`, `PredictionExchange.cs`).
  `cs/tests` and `examples/cs` mention none of the names (0 matches), so `--noTests` is complete; the
  farm regenerated the tests tree anyway and found nothing to add.
* **Blast radius of the shared proof change** — `unwrapPassthroughExpression` feeds every by-declaration
  proof, so the run before/after adding `printsBareArrayAssertion` was diffed over the full scoped set:
  the only new lines are this unit's family. Independently re-checked with an AST census
  (`campaigns/cs90/tools/U31/array-as-blast-radius.mjs`, all 22 by-declaration names, 446 declarations):
  `hits=2`, both `parseBorrowInterests` / `parsePredictionPositions` — i.e. no other unit's declaration
  can newly prove.
* **Reconciliation** — the typed-locals list was re-derived from the emitted tree: 30 exchange-tree
  `filterByArray` locals + 22 + 12 + 10 + 6 + 4 + 5 = 89, and the only `object` locals left for the
  family are the 11 `parseDepositAddresses` + 4 `parseIds` rejects (15) — exactly the rejected set.

## Residual risk

* The 32 `filterByArray` casts are proved from the **hand-written body**, not from a type: if
  `filterByArray`'s return paths ever change (a new object-typed path, `indexBy` on the `false` branch),
  the cast throws where the untyped box flowed. The rule is keyed on the argument literal, so a body
  change does not re-verify it — the failing site would be a runtime `InvalidCastException`.
* The three `parse*` **name-keyed** entries retype every declaration of the name without a proof: a
  future venue override that returns a different box would print the mapped type and get a boundary cast
  that throws. Today the names have 1/2/8 declarations, all censused here (parseBorrowRate: stub + 7
  dict-literal overrides; parsePositions: base + krakenfutures `List<object>`; parseTickers: base +
  hollaex `Dictionary`).
* `IList<object>` (not `List<object>`) for `parsePositions` keeps the `toArray` non-List `IList` branch
  safe, at the cost of the narrower spelling the roster sketched; consumers that need `List<object>`
  would need a downcast, and the classifier refuses to create one from this producer.
* The `as T[]` unwrap is a statement about the *printer* (pinned ast-transpiler); a pin bump that starts
  printing a cast for a named array type would silently invalidate it — the proof would then skip a
  printed cast and the `(T)((object)(x))` boundary cast would remain correct only by luck. Re-check the
  `printAsExpression` array branch on any pin bump.
* 60 files / 123 lines is too much to hand-verify line by line; the two automated classes above
  (verify-diff pairs + the census reconciliation) are the coverage. Spot-checked by hand: okx,
  krakenfutures, hollaex, binance, the three pro-tree dictionary sites, the four prediction locals.
