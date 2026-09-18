# cs90 unit U32 — `this.safeString*/safeInteger*/safeTimestamp/safeNumber` declarations still `object`

Branch `cs90-U32`, base `d847892a6fcf5699640862316303b6344a3e4daf` (roster line U32).
Worktree `/root/worktrees/cs90/U32`; **only** `build/csharp-local-types.js` + the regenerated `cs/` tree.

## Family and result

Family: every local whose initialiser IS a call to `this.safeString`, `safeString2`,
`safeStringLower`, `safeStringUpper`, `safeInteger`, `safeInteger2`, `safeTimestamp` or
`safeNumber` (the eight helpers the roster line names) — 266 declaration sites in the generated
tree (`cs/ccxt/exchanges/**`), the helper call being the whole initialiser (`grep -E
'^\s+object NAME = this\.safe…\('`, 95 files).

The helpers themselves are typed (`string?` / `Int64?` / `double?` table entries), so every one of
those sites reaches `csharpLocalTypeOf` with a candidate type and is then held `object` by the
later-write join or by the retype scan. This unit censused the blocker of all 266 sites
(tooling below) and fixed the one join gap that is box-identical: **a later write that READS the
declaration being classified** (`x = x * 1000`, `x = cond ? 'lit' : x`).

* **21 declarations typed** (20 family sites + 1 null-init cascade), 0 casts removed (these
  declarations carried no cast; the family's producers need none).
* 13 further changed lines are the base's own string-equality pass (`installCsharpStringEquality`)
  firing on the newly `string?`-typed receiver — one class, justified below.
* Rejected: 246 family sites stay `object`, every class proven unsafe or owned by another unit.

## Census (campaigns/cs90/census.sh, cs/ccxt/exchanges/**)

```
before: locals: object=9304 typed=44132 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        params: object=11635  returns: object=1080
        helpers: isTrue=1434 isEqual=12034 getValue=6761 add=8833 getArrayLength=704
after:  locals: object=9283 typed=44153 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        params: object=11635  returns: object=1080
        helpers: isTrue=1434 isEqual=12020 getValue=6761 add=8833 getArrayLength=704
```

`isEqual` −14 = the 13 knock-on lines (one line carries two calls). No `(string)`/`(Int64)` cast
count moved: this unit adds no cast and removes none (its producers already return the box).

Family-site census (my own tooling, tree-level, both directions):

```
before: 266 `object NAME = this.safe…(` sites        after: 246 object + 20 typed
        + 1 non-family cascade site (cs/ccxt/exchanges/whitebit.cs parseMarket)
```

## Rules / passes touched — `build/csharp-local-types.js` only (+72/−1)

All in the classifier (`build/csharpTranspiler.ts`, ast-transpiler src and the hand-written base
are **untouched — hotspot: none** for those).

| hotspot: line (after) | what |
|---|---|
| `build/csharp-local-types.js:6359-6371` | `SAFE_HELPER_LOCAL_METHODS` + `safeHelperLocalInitializer`: the eight helper names; the new arm only ever fires for a declaration whose whole initialiser is one of them (disjoint ownership: no other unit's site can be reached). |
| `build/csharp-local-types.js:6376` | `selfReadStack` — the declaration whose later write is being resolved, with the type a read of it will have. |
| `build/csharp-local-types.js:6385-6398` | `selfReadWriteType`: re-resolves one write expression with reads of that one declaration answered by the RUNNING type. Nothing else is overridden. |
| `build/csharp-local-types.js:6473-6479` | `typeFromValueOrWrites` (the join): when the plain `csharpTypeOfValue` cannot name the write, retry with `selfReadWriteType`; the result still has to pass `joinTypes` (box-identical edges only). |
| `build/csharp-local-types.js:4440-4452` | `csharpLocalIsSafeToRetype` (the retype scan): the same retry for the write's own assignability check (`x = x * 1000` is statically `multiply(Int64?, Int64?)` = `Int64?`, not `object`). |
| `build/csharp-local-types.js:4293-4298` | `resolveLocalReadType`: the read of the declaration under classification returns the running type instead of `undefined` (classification in progress). |
| `build/csharp-local-types.js:3881-3886`, `4256-4261` | **isolation**: `declarationCsharpType` / `localIdentifierType` clear the stack around the nested classification of ANOTHER declaration — that answer has to be the type the printer emits for it, which is computed without this override (see "rejected sub-case 6"). |

Why the arm is box-identical: the printed write expression is unchanged, and every arm that can
now be named is a form whose C# static type the classifier already proves with an existing proof
(`Int64?` from `multiply/divide(Int64?, Int64?)`, whose lifted twins are documented in
`Exchange.TranspileHelpers.cs` as the `(object, object)` overload's own box; `string` from a
conditional over a string literal and a `string?` read; `Int64?` from
`parse8601`/`parseToInt`/`sum(Int64?, Int64?)`; `string` from the `Precise.string*` statics).
The value keeps its printed expression, so no overload, box or value moves: the arm only answers
"what is the declared type of this local read", which the declaration itself is deciding.

## verify-diff.py (base d847892a6)

```
files=16 pairs=34 unexpected=13
```

The 13 UNEXPECTED pairs are all one class: `isEqual(<local>, "lit")` → `<local> == "lit"` (and the
negated `!isEqual(…)` → `!=`)` on lines whose receiver this unit retyped to `string?`:

| file | line |
|---|---|
| bingx / bitget | `marginType = (marginType == "crossed") ? "cross" : marginType;` |
| coinbaseinternational | `if ((tif != null) && tif != "IOC")` |
| deepcoin | `network = ((network != null) && network != "") ? network : defaultNetwork;` |
| krakenfutures | `if (type == "marginAccount" \|\| type == "margin")` |
| lighter (7 lines) | `type == "perp" / "swap" / "spot"` and the `settleId`/features rows |
| whitebit | `quoteId = (quoteId == "PERP") ? "USDT" : quoteId;` |

Proof: for a `string?` receiver the base pass's equivalence is exact — `isEqual(x, "lit")` is
false for `x == null` (its `a == null || b == null` guard) and ordinal string equality otherwise,
which is what C# `x == "lit"` does for a `string` receiver; the negated spelling is the same
identity. No other line changed (0 pairs in any other class).

## Counts

* typed declarations: **21** — 20 family sites in `cs/ccxt/exchanges/**` plus **1 cascade** site
  (`cs/ccxt/exchanges/whitebit.cs` parseMarket: `object settleId = null` → `string?`, because its
  later write `settleId = quoteId;` now reads a retyped `string?` local). The census' object total
  moves by exactly those 21 (`object 9304 → 9283`).
* casts removed: **0** (the family's sites carried none; the diff is declaration types only, plus
  the equality class above).
* sites audited and left `object` with a proof: **246**.

## Blocker census (per site) and rejected sub-cases

Tooling (`campaigns/cs90/tools/U32/`): `instrument.py` (wraps `csharpLocalIsSafeToRetype`,
`csharpLocalDeclaration`, `csharpTypeOfValue` and `typeFromValueOrWrites` with a reason log — the
same technique cs-strict S29 used), `blockers.py` / `crosscheck.py` (site ⇄ decision pairing),
`blocker-census.py` (text-level re-derivation from the emitted C#), `audit-writes.py` (independent
compile-safety audit of the retyped declarations). Decision-level census over all three tiers
(8974 decisions of which 326 kept `object`; the tree has 266 family sites — the decision log
counts repeated/nested classification calls too):

1. **123 — left operand of `+`** (`intervalString = add(interval, "h")`,
   `object symbol = add(add(add(add(baseId, "/"), quote), ":") , settle)`).
   REJECT (sound): with `string?` the call binds `add(string, string|object)`; a null LEFT then
   returns the right operand where `add(object, object)` returns `null` — a different emitted
   value on the null path. `stringPlusOperandIsProvablyString` already encodes this; the sites
   whose helper call has a proven non-null string default are already typed by the existing
   `string?`→`string` retry.
2. **~30 — later write that is an element read** (`x = market['symbol'|'base'|'settle'|'quote'|
   'type']`, `account['id']`, `orderType[0|1]`, `txidParts[0|1]`, `addressParts[0]`, `parts[0]`,
   `cachedSides[0]`, `(market as Dict)['id2']`, `x = data[0]`). REJECT: the printed write is
   `getValue(recv, key)` / `((IList<object>)x)[i]` (static `object`); naming the declaration would
   need a NEW cast on the write line, and the receiver/key proof belongs to the element-read units
   (U01/U02/U03/U05 own those producers — lower unit number).
3. **~10 — later write is a numeric literal** (`feeCost = 0`, `feeInt = 10`, `x = 1`,
   `x = 300`). REJECT (deliberate, box-different): `object x = 0` boxes an `int`, `Int64? x = 0` a
   `long`/`double` — JSON serialisation and `GetType()`-sensitive code would move. Kept `object`.
4. **~10 — arithmetic write with a nullable operand and no lifted helper**
   (`goodTillBlock = latestBlockHeight + 20` (×3), `until = since + 86400000` (×2),
   `until = this.sum(since, timeDelta)`, `amount = amount - filled`, `streamIndex + 1`,
   `offset + allTriggerPrices`). REJECT: `add`/`subtract` have no `(Int64?, Int64?)` twin (the
   lifted twins exist only for `multiply`/`divide`/`mod`), so the write's static type stays
   `object` and a cast would be needed. `multiply`/`divide` over an `Int64?` operand is exactly
   what this unit's arm now types (`timestamp = timestamp * 1000`).
5. **~10 — copies that stay `object` in the emitter** (deepcoin `quoteVolume = temp` /
   `baseVolume = quoteVolume` swap pairs, `Exchange.BaseMethods.cs` `filled = amount`).
   REJECT: `temp`/`amount` themselves stay `object` (their own joins form a copy cycle and are
   blocked by an unproven `Precise.stringAdd` write), so the write's printed type is `object` —
   typing the target would need a cast. (This class is why the *isolation* rule below is part of
   the patch: an earlier draft of the arm resolved `amount` to `string?` through a broken cycle
   and emitted `string? filled = …; filled = amount;` — CS0266. The compile error was caught by
   hand-auditing the emitted writes and reverted; the delivered tree is farm-green.)
6. **~18 — later write from another unit's producer** (`await this.findAccountId(code, params)`
   (5, coinbase — the helper's only return is an element read), `this.ethGetAddressFromPrivateKey`
   (2 sites in this family — the hand-written base is already `string`, but a
   `CSHARP_LOCAL_THIS_RETURN_TYPES`/awaited entry for the name would also fire on U34's own
   declaration sites, so it is left to U34), `this.fromEv/fromEp` (4),
   `this.convertFromRawQuantity`/`convertToRealAmount` (3), `this.networkCodeToId`,
   `this.hashMessage`, `this.fixCommaNumber`, `parseInt(rawTimestamp as string)`).
   REJECT: each needs a producer re-typed inside another unit's family (U33/U34/U35/U37); keying
   the producer here would fire on that unit's sites too (ownership rule 5).
7. **12 — destructured write** (`[x, params] = this.handleXAndParams(…)` where x is a family
   local): element 0 of a helper that is not in `DESTRUCTURED_STRING_HELPERS`, so no cast back is
   emitted → the write is `object`. REJECT.
8. **8 — compound assignment `x += r`**: REJECT (prints `x = add(x, r)`; the same left-operand
   proof as class 1).
9. **3 — prefix/postfix ref sinks** (`-x`, `x++`): no `(ref string?)`/`(ref Int64?)` twin →
   REJECT.
10. **1 — `delete obj[x]`** (prints `.Remove((string)x)`) → REJECT.
11. **10 — no candidate type at all** (prediction tier: `object timestamp =
    this.safeTimestamp(point, 't')` in opinion/kalshi/myriad): `CSHARP_PREDICTION_OWNED_RETURNS` +
    `isPredictionSource` deliberately defer the prediction tree to U44 (roster line U44 owns the
    prediction sweep). Untouched.
12. Every other decision-level `object` outcome is one of the above or a nested classification
    call (no initType row); the tree-level pairing in `crosscheck.py` leaves 12 of 246 sites
    unpaired for same-name multiples — those sites are the prediction-tree deferrals (11) and
    `pro/luno.cs thirdValue`, all with the reasons above.

## Verification

* BASELINE FIRST: scoped regen on the pristine tree (95 ids = every file carrying the family's
  pattern, three tiers) → `git diff --cs/` empty.
* After the edit: same three scoped regens, then repeated → `git diff -- cs/ | sha256sum`
  identical (**fixed point**).
* `python3 campaigns/cs90/verify-diff.py HEAD` → `files=16 pairs=34 unexpected=13` (the equality
  class above; every pair justified).
* `audit-writes.py --rev=HEAD~1` (independent, re-derives each retyped declaration's writes from
  the emitted C#): 21 sites, every write `OK` or a hand-verified shape (`Precise.stringMul/stringNeg`
  → `string`, `parseToInt`/`parse8601` → `Int64?`, `multiply(Int64?, …)` → `Int64?`,
  self-conditional → `string`).
* `node --input-type=module` load of the patched classifier + `npx tsx build/csharpTranspiler.ts`
  runs: no parse/classifier error.
* **Farm (dotnet compile, the only compile gate):**
  `ccxt-farm build --targets cs --wait` from the committed branch →
  `HEAD 3938eca221c5ab7e5e96658ca07e73988a0be657 job=767 exit=0 branch_update=unchanged
  generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`
  (`ccxt-farm status 767`: `state=succeeded, exit_code=0, failing_files=[]`).
  `branch_update=unchanged` on a forced regenerate is the full-tree fixed-point proof: the scoped
  regens reproduce the whole generated tree byte-for-byte.
* The REPORT-only tip is gated the same way (job id in "Final tip" below).

## Residual risk

* The 13 equality knock-ons come from a base pass (`installCsharpStringEquality`), not from this
  unit; they fire for any unit that types a `string?` local in the same method. Equivalence argued
  above; the farm build (0 warnings from this diff) is the other half of the gate.
* The arm's acceptance relies on `joinTypes` for box identity and on the retype scan for every
  other use; the scan's write-side retry uses the SAME arm, so it cannot accept a write the join
  rejected.
* The isolation rule is load-bearing: without it a nested classification can name a type the
  printer never emits for that other declaration (CS0266 at `filled = amount` /
  `quoteVolume = temp`). Any later change to `selfReadWriteType` must keep the two clears.
* The blocker census pairs the decision log to the emitted sites by exchange+name; 12 of 246 sites
  could not be paired (same-name multiples) and were resolved by hand (prediction deferrals).
  Counts in classes 2-6 are therefore ±2 site-level; the class definitions are exact.
* Nothing in the emitted tree outside `cs/` changed; `params`/`returns`/cast counts are identical.

## Final tip

Farm gate history on this branch (informal evidence; a REPORT-only commit does not change the
generated tree, so the tip is re-gated and its job id is recorded in the unit report JSON):

```
code commit 3938eca221c5ab7e5e96658ca07e73988a0be657  job=767 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
report tip  1908947120c3065b850bfdd1471449b98921564f  job=774 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
report tip2 f465c2ccf4dadb5e26d6c84eb12de0bbd169924a  job=778 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
```

All three shas carry the identical generated tree (`branch_update=unchanged` from the farm's own
forced regenerate of every sha), so the compile proof is tree-level, and every REPORT-only
successor is re-gated the same way (the newest job id is in the unit report JSON).

`ccxt-farm status 767` / `status 774` → `state=succeeded, exit_code=0, failing_files=[]` for both;
`branch_update=unchanged` on a forced regenerate is the whole-tree fixed-point proof. The branch
carries only this unit's commits on top of the base `d847892a6fcf5699640862316303b6344a3e4daf`.