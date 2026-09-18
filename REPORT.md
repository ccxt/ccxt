# cs90 U49 — small cast families: `((object)x)` + `((Int64)x)` + `((Dictionary<string, object>)x)` + `((List<object>)x)`

Base `d847892a6fcf5699640862316303b6344a3e4daf` (branch `cs90-U49`).

## Family

The four cast families are **boundary wraps**: the printers in `build/csharp-local-types.js`
emit a retyped return path as

```
((${T})((object)(${value})))            (T non-nullable, + `!`)
```

so one site carries TWO of the four tokens — the outer `((T)` and the inner `((object)`.
A wrap is a *provable* identity (a box + an unbox of the same value, or a box + an unbox
whose value is already `T`) exactly when the printed expression's own generated C# type IS
`T`; every emitter already had a guard for that, and every remaining site was a hole in the
guard's type source. The unit therefore:

1. **extends the guard's proof** so a return path whose expression already carries the mapped
   box is emitted plain (`return value;`) instead of wrapped (this removes both tokens);
2. **retypes two producers** whose generated signature was still `object` (`safeBalance`,
   `safeLiquidation`) so the 90 call-site wraps become identity;
3. **fixes a dead branch** that made the `requestId` cast-drop unreachable.

## Changes (all in `build/csharp-local-types.js`)

| # | Where | What |
|---|---|---|
| 1 | `csharpLocalDeclaration`, the `callResultCastType` arm | the `typedRequestIdCall` cast-drop sat in an `else` branch that can never run (`callResultCastType` answers `'Int64'` for exactly those sites) — dead code since cs-strict. Moved into the live arm; the duplicated nested block removed. 87 sites. |
| 2 | new `callReturnIsMapped (csharp, expression, mapped)` + `U49_OWNED_CAST_TYPES` | the proof "the printed expression's own C# static type is exactly `mapped`", from the sources that decide the emitted signature: `CSHARP_COLLECTION_RETURN_METHODS` / `_BY_DECLARATION` (via `callCollectionReturnType`), the hand-written base signatures mirrored by `CSHARP_LOCAL_THIS_RETURN_TYPES` (via `callReturnType`), `CSHARP_ASYNC_CORE_RETURNS` for an awaited call, a `base.<name>(...)` receiver, and a bare local read the local pass itself declares with `mapped` (`identifierType`). Exact string equality only. |
| 3 | `installCsharpCollectionReturns`, `installCsharpAsyncCoreReturns`, `installCsharpMethodReturnTypes`, `needsUnboxingWrap` (numeric) | consume #2 in each return-path guard. |
| 4 | `CSHARP_COLLECTION_RETURN_METHODS` + `CSHARP_LOCAL_THIS_RETURN_TYPES` | `safeBalance` and `safeLiquidation` -> `Dictionary<string, object>`, both with a return-path proof (see "producer proofs"). |

`U49_OWNED_CAST_TYPES = { object, Int64, Int64?, Dictionary<string, object>, List<object>,
IDictionary<string, object> }` — a wrap mapped to `string?` (U47) or `IList<object>` (U48)
keeps its cast; those are sibling units' families.

## Producer proofs (the two retypes)

* `safeBalance (balance: Dict): Balances` (`ts/src/base/Exchange.ts`) — ONE declaration in the
  whole tree, ONE return path `return balance as any`, and the body's first write already
  unboxes the parameter (`((IDictionary<string,object>)balance)["free"] = …`). A caller that
  does not pass a dictionary throws **today**, inside the body. The retype moves that same
  unbox of that same value to the `return`, i.e. later than the body's own unbox: no call site
  can start failing that does not already fail. 84 call-site wraps + 3 call-site locals.
* `safeLiquidation (liquidation: Dict, market: Market = undefined): Liquidation` — same shape,
  `return liquidation as Liquidation`; the body already unboxes the parameter five statements
  earlier. All in-tree callers pass a fresh `new Dictionary<string, object>() {...}` literal.
  7 call-site wraps.

Both are the roster's `[AST]`-free route: retype the producer, drop the identity cast.

## Census

```
before  locals: object=9304 typed=44132 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
after   locals: object=9301 typed=44135 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=347 (Dictionary<string, object>)=66 (IDictionary<string,object>)=2560 (Int64)=22 (IDictionary<string, object>)=122 (List<object>)=76
```

| family | before | after | removed |
|---|---|---|---|
| `(object)` | 672 | 347 | **325** |
| `(Dictionary<string, object>)` | 334 | 66 | **268** |
| `(Int64)` | 133 | 22 | **111** |
| `(List<object>)` | 102 | 76 | **26** |
| `(IDictionary<string, object>)` (spaced wrap form) | 127 | 122 | 5 |
| `(IDictionary<string,object>)` (unspaced, U46's) | 2563 | 2560 | 3 (knock-on) |

**casts removed, four roster families, census-measured: 730.** With the two knock-on classes
below the whole-tree diff removes 789 cast tokens and adds 6, i.e. **783 net**; the census
(which covers `cs/ccxt/exchanges/**` only) shows 738.

**typed declarations: 4** (`object` -> `Dictionary<string, object>`), all knock-ons of the
`safeBalance` retype:
* `cs/ccxt/exchanges/htx.cs` — `result` (`result = this.safeBalance(result)` later write)
* `cs/ccxt/exchanges/pro/bydfi.cs` — `parsedBalance`
* `cs/ccxt/exchanges/pro/kraken.cs` — `balance`
* `cs/tests/Generated/Base/test.mergeBalanceAccount.cs` — `balance` (test tree, added by the
  farm's regen, see Farm)

Diff: **133 files, 507 insertions / 507 deletions** (declaration-type-only + cast removal; the
133rd file is the generated test-tree knock-on listed under Farm).

### Changed-line classes (from `tools/U49/pair-audit.py`)

| class | lines |
|---|---|
| boundary-wrap removal (409 lines = 353 wraps, 56 of them closing lines of a multi-line value) | 409 |
| `((Int64)this.requestId(...))` declaration cast removal | 87 |
| declaration retype (`object x = …` -> `Dictionary<string, object> x = …`) | 4 |
| element-write cast drop `((IDictionary<string,object>)result)[k] = v` -> `result[k] = v` | 3 |
| return-signature retype (`public virtual object safeBalance/safeLiquidation(`) | 2 |
| boundary-cast addition (the two retyped bodies' own `return`) | 2 |

Wrap outer targets: `Dictionary<string, object>` 280, `List<object>` 41, `Int64` 24,
`Int64?` 3, `IDictionary<string, object>` 5.

## Gates

* `verify-diff.py d847892a6`: `files=133 pairs=507 unexpected=412`. verify-diff models the wrap in
  the ADDITION direction only (`BOUNDARY` / `NUM_UNBOX`); a wrap REMOVAL is not one of its
  accepted pairs, so 400 pairs report as `[PAIR]` UNEXPECTED. They are justified as one class
  (the boundary-wrap removal) and checked line-by-line by `tools/U49/pair-audit.py`:
  **`files=133 changed-lines=507 problems=0`** — every pair is a deletion-only change that
  removes exactly one opening chunk `((T)((object)(` with `T` in this unit's family and one
  closing chunk `)))` / `))!)`, with equal `(` and `)` removed; plus the five shapes above
  (`sig_retype` / `boundary_addition` / `decl_retype` / `element_write_cast_drop` /
  `decl_cast_removal`), each of which verify-diff.py or the class table already models.
  `--selftest`: `7 corruptions flagged, 10 real shapes accepted` (mutated argument, added
  line, unowned cast type, paren collapse, no deletion, sibling-unit cast, unbalanced
  removal).
* Determinism: three full scoped regens (REST 104 ids `--force`, ws 76 ids `--force --ws`,
  prediction 7 ids `--force --prediction`); `git diff -- cs/ | sha256sum` identical across
  runs (`8233db56a95ddf21fa436f24107f066c5b01f71ba5fcdfe6ed8745036f85cb1c`).

## Rejected sub-cases (with the proof)

1. **`((object)(true))` / `((object)(false))` inside the boolean boundary wrap — 83 sites
   (44 false / 39 true).** Shape `return ((bool?)((object)(false)));`. The value's static type
   is `bool`, the method's is `bool?` — an implicit nullable conversion, not an identity, and
   `installCsharpBooleanReturnCasts`' guard is deliberately exact ("no nullability (and no
   spelling) is crossed"). BRIEF rule 2 forbids cross-widening scalars. The census does not
   even count `((bool?)` (`(bool)=1`), so these are the S1x bool family, not this unit's.
2. **`((Int64)((object)(subtract(this.milliseconds(), getValue(this.options, "timeDifference")))))!` — 22 sites.** `subtract` is hand-written with an `object` return, so the unbox is
   genuine, not identity. Typing `subtract` is U35's family (numeric arithmetic operands).
3. **`((string?)((object)(add(add(add(scheme, "//"), domain), "/"))))` — 21 sites.** The outer
   target is `string?` -> U47.
4. **`((IDictionary<string, object>)((object)(this.parseOrder(data, market))))` and the
   `this.safeDict(...)` twins — 37 sites.** The producer's generated signature is
   `Dictionary<string, object>` while the mapped type is `IDictionary<string, object>`; the
   concrete box is not the cast target, so rule 1 keeps the cast (the conversion is implicit
   but not an identity). Only the sites whose value is a local the local pass declares
   `IDictionary<string, object>` flip (5).
5. **`((List<object>)this.safeValue(msg, "k", new List<object>() {}))` — 31 sites.** A
   declaration cast on `safeValue`, which returns `object` by contract (its own census).
   Typing it is U08/U09/U36's TS-side `safeValue`->`safeList` family, not a cast removal.
6. **`((List<object>)parsed)[i]` / `((List<object>)copy)[i] = v` — ~35 sites.** Element
   accesses on locals the local pass ALREADY declares `List<object>` — identity casts, but
   they are emitted by the printer's `printElementAccessExpression`, i.e. they need either an
   ast-transpiler change (this unit is not an `[AST]` unit) or a new post-print pass in
   `build/csharpTranspiler.ts`. Left for a dedicated cast-removal unit rather than folded in
   here.
7. **`((object)outcomeObj)` / `((object)result)` / `((object)precise).ToString()` — ~60
   standalone sites** (`as any` prints `((object)x)`). Removing an argument cast changes the
   static type at the call site and therefore overload resolution (`f((object)x)` vs `f(x)`),
   which rule 1 requires to be proven identical per callee; and `((object)precise).ToString()`
   is a receiver cast. Rejected wholesale.
8. **`((object)(this.safeBalance(result)))` sites where the enclosing method's mapped type is
   NOT the producer's box** — none found; all 84 resolved.

## Residual risk

* **The two producer retypes are the only runtime-relevant change.** Both move an unbox of the
  caller's own value from the call site into the callee body, on a value the body already
  unboxes: the throw (if any) happens on the same object either way. The 3 knock-on local
  retypes are pure declaration spelling (the later write already produced that box).
* The wrap removals are compile-time identity conversions; the guard proves the printed
  expression's static type equals the mapped type, and every source it reads is the same table
  that decides the emitted signature, so a table that lies would fail the farm compile rather
  than the runtime.
* `callReturnIsMapped`'s `base.<name>(...)` arm trusts `CSHARP_LOCAL_THIS_RETURN_TYPES` for the
  base declaration; a venue override that changed the printed type would be CS0508-invalid in
  the tree already.
* `identifierType` is called at print time for every return path in the four emitters: it is
  the same resolver the local declarations use, cached, and returns `undefined` on any doubt.

## Hotspots

* `hotspot: build/csharp-local-types.js` — the campaign's shared classifier (5.7k lines), also
  edited by U02 / U18 / U24 / U25; WAVE1.md's merge order (sequential `git merge-file`, never
  union-concat) applies. All four edits are additive: two new top-level helpers, one new
  `Set`, four one-line guard extensions, and two table rows.
* Not touched: `build/csharpTranspiler.ts`, the ast-transpiler `src/`, and every hand-written
  `cs/ccxt/base/*.cs` file. `cs/ccxt/base/Exchange.BaseMethods.cs` and
  `cs/ccxt/base/PredictionExchange.cs` are GENERATED and changed only by the regen.

## Farm

| sha | job | exit | note |
|---|---|---|---|
| `a0f675f5e0b` | 821 | **0** | first gate (`--targets cs --wait`); the farm's own `--force` regen then added `[Automated changes] CS files` — `cs/tests/Generated/Base/test.mergeBalanceAccount.cs`, `object balance = exchange.safeBalance(result)` -> `Dictionary<string, object> balance = ...`, a knock-on of the `safeBalance` retype in the generated TEST tree (my local scoped regens used `--noTests`). Folded into the unit commit. |
| `f0391eb3088` | 832 | **0** | `branch_update=unchanged` — the farm's regeneration reproduced the committed tree byte-for-byte, i.e. the branch is a fixed point (the strongest form of the determinism gate). Re-gated after the amend with `git push --force farm HEAD:refs/heads/cs90-U49 -o build=cs` (the farm's branch ref carried the superseded sha). |
| `a56323a0194` | 842 | **0** | same shape after the REPORT.md amend: `branch_update=unchanged`, `generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`, `failing_files=[]`. |

Every re-gate after a REPORT-only amend has this same shape (nothing in `cs/` moves, so
`branch_update=unchanged`): the branch tip's own sha is always the last row's `source`, and
`ccxt-farm status <that sha>` returns the same `exit_code: 0` object. The unit branch carries
ONE commit on top of the base.
