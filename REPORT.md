# U55 — `isEqual(x, null)` → `x == null` for typed-reference / nullable-scalar locals

Worktree `/root/worktrees/cs90/U55`, branch `cs90-U55`, base `d847892a6fcf5699640862316303b6344a3e4daf`
(cs-strict-INT / PR #30530 head). Paired ast worktree `/root/worktrees/cs90-ast/U55`, branch `cs90-U55`,
base pin `404e9daa7f0ab58d085ed04aaa61a19546dfeda2`.

## Family

The roster's null-RHS form: `isEqual (x, null)` / `!isEqual (x, null)` (printed for TS
`x === undefined` / `x !== undefined`) becomes the native C# null test when `x` is a local whose
**emitted declaration** is a typed reference (`string`/`string?`/`IDictionary<…>`/`IList<…>`/`List<…>`/
`Dictionary<…>`/`ccxt.pro.*`/`ArrayCache`/`IOrderBook`/`Future`/`WebSocketClient`/`Delegates`) or a
nullable value scalar (`Int64?`/`bool?`/`double?`/`int?`/`long?`/…).

Null-semantics proof (`cs/ccxt/base/Exchange.TranspileHelpers.cs#isEqual`, L293): the helper's first two
guards are

```csharp
if (a == null && b == null) { return true; }
else if (a == null || b == null) { return false; }
```

so with the null literal on one side it returns exactly `x == null` — reference equality for a reference
type, `!HasValue` for a `T?` — and never reaches a typed branch. A non-nullable value scalar
(`Int64`/`bool`/`double`/`int`) is refused: `x == null` does not compile there. The operand is a bare
identifier in both spellings, so it is still evaluated exactly once.

Census first (generated tree, `cs/ccxt/exchanges/**`): **4769** identifier null-RHS sites, of which
**836** on typed locals (799 nullable-scalar + 37 string), 3339 on `this.<member>` reads, 3370 on
`object` parameters, 410 on `object` locals, 9 on non-nullable scalars, 30 on non-identifier operands.

## Rules / tables / passes touched

`hotspot: /root/worktrees/cs90-ast/U55/src/csharpTranspiler.ts` (ast printer, +79 lines):

- `CSHARP_NULL_COMPARISON_REFERENCE_HEADS` — the accepted named-reference heads.
- `csharpNullComparisonTypeIsProvable (csharpType)` — the gate: any `?`-suffixed type, or a listed
  reference head; `object`/`var`/`null`/`''` and every non-nullable value scalar refused.
- `csharpNullLiteralEquality (op, left, right, leftText, rightText)` — the rule, placed beside S60's
  `csharpStringLiteralEquality` and called immediately after it in `printCustomBinaryExpressionIfAny`
  (shapes are disjoint: string-literal RHS vs null-literal RHS).
- `csharpOperandIsNullLiteral (node)` — `null` keyword or the `undefined` identifier (both print `null`).
- `csharpNullComparisonTypeOf (node)` — **new hook stub, default `undefined`**. No hook installed ⇒ the
  emission is byte-identical to the base printer (negative tests below prove it).

`hotspot: build/csharp-local-types.js` (ccxt classifier, +60/−12 lines):

- `installCsharpStringEquality`'s printed-declaration recorder widened from `(string\??)` to any printed
  type token (`declaredType` regex); the recorded map and the exactly-one-binding proof
  (`stringEqualityBindingIsProvable`) are shared with S60.
- `csharpLocalTypeOf` (S60) still answers only `string`/`string?` — **unchanged**, so no other family's
  emission can move through it.
- new `csharpNullComparisonTypeOf` (installed only when the printer has that method, i.e. not on the base
  pin) + `nullComparisonTypeIsProvable` / `NULL_COMPARISON_REFERENCE_HEADS`.

No `build/csharpTranspiler.ts` change, no hand-written base change, no `ts/src` change.

## Before / after census (`campaigns/cs90/census.sh`)

```
before: locals: object=9304 typed=44132 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        params: object=11635  returns: object=1080
        helpers: isTrue=1434 isEqual=12034 getValue=6761 add=8833 getArrayLength=704

after:  locals: object=9304 typed=44132 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        params: object=11635  returns: object=1080
        helpers: isTrue=1434 isEqual=11168 getValue=6761 add=8833 getArrayLength=704
```

- **typed declarations: 0** (this unit names no new box — it removes helper calls).
- **casts removed: 0** (the diff contains no cast change at all).
- **`isEqual(` helper calls removed: 866** in the exchange tree (`12034 → 11168`), **895** across the
  whole committed diff (866 exchange + 29 generated base/tests).
- identifier null-RHS sites, `cs/ccxt/exchanges/**`: **4769 → 3903**.
- typed-local null-RHS bucket (tools/U55/null-census.py): **836 → 51** (nullable-scalar 799 → 14,
  string 37 → 37 — the residual 51 are the post-print `*Var` shadows, rejected below).
- changed lines: **837** pairs over **136 files**, `837 insertions / 837 deletions` in `cs/` (every line
  paired; no added or removed line outside the family).

Converted sites by re-derived declaration type (all nullable value scalars):

| type | sites | example |
|---|---|---|
| `Int64?` | 492 | `Exchange.BaseMethods.cs:1535 timestamp` |
| `double?` | 297 | `Exchange.BaseMethods.cs:1529 final` |
| `bool?` | 100 | `Exchange.BaseMethods.cs:1929 currencyDeposit` |
| `int?` | 6 | `digifinex.cs:2254 postOnlyParsed` |

`== null` on `T?` is the C# lifted null test (`!HasValue`) with no user code involved, so no custom
`operator ==` can change the result — the four types above have none, and the reference half of the gate
(which fires 0 times in this tree) is the helper's own reference guard.

## verify-diff.py (shared gate, vs base `d847892a6`)

```
files=136 pairs=837 unexpected=837
  [PAIR] cs/ccxt/base/Exchange.BaseMethods.cs: - return ((double?)((object)((isEqual(final, null)) ? defaultValue : final)));
      + return ((double?)((object)(((final == null)) ? defaultValue : final)));
  …
  [PAIR] cs/ccxt/exchanges/coinbase.cs: - double? taker = (!isEqual(takerFeeRate, null) && !isEqual(takerFeeRate, null) && !isEqual(takerFeeRate, 0)) ? takerFeeRate : this.parseNumber("0.06");
      + double? taker = ((takerFeeRate != null) && (takerFeeRate != null) && !isEqual(takerFeeRate, 0)) ? takerFeeRate : this.parseNumber("0.06");
```

`verify-diff.py` models declaration/return/signature/cast pairs only — it has **no rule for a
statement-level helper→native rewrite** (the same limitation the ast-transpiler skill records for the
Go/Java cast families), so all 837 pairs are reported UNEXPECTED and it exits 1. They are one class, and
the class is accepted by the unit-local audit:

```
$ python3 campaigns/cs90/tools/U55/pair-audit.py d847892a6fcf5699640862316303b6344a3e4daf
pairs=837 accepted=837 substituted_sites=895 isEqual_calls_removed=895
exit 0
$ python3 campaigns/cs90/tools/U55/pair-audit.py --selftest
  selftest accepted family pair               problems=no
  selftest mutated identifier                 problems=yes
  selftest foreign rewrite                    problems=yes
  selftest unproven identifier                problems=yes
  selftest unpaired hunk                      problems=yes
SELFTEST PASS: mutated / foreign / unproven / unpaired cases are all flagged
```

The audit is the family's own acceptor: (1) the `+` line must be the `-` line with a **subset** of its
`isEqual (x, null)` sites replaced in place by `(x == null)`/`(x != null)` — nothing else may differ;
(2) the `isEqual(` occurrence count must drop by exactly the number of substituted sites
(895 = 895, the 1:1 proof); (3) every substituted identifier must re-derive an accepted declaration type
in the **post image** (an `object`/`var`/non-nullable-scalar/parameter identifier fails, which the
selftest proves by flagging the still-`isEqual(symbol, null)` parameter site at `binance.cs:4342`).

## Farm

```
code commit 0f53eaf2cef549ead133b33a8a69ae990fd98f0a job=813 exit=0 branch_update=unchanged generator=978697f0d35378ed89d47e367be60a41b3f33e7c
report-only tip                              job=823 exit=0 branch_update=unchanged generator=978697f0d35378ed89d47e367be60a41b3f33e7c
ccxt-farm status 813/823 → state=succeeded exit_code=0 targets=cs transpile_forced_by=generator
ccxt-farm log 813/823 --step buildCS → "Build succeeded. 0 Warning(s) 0 Error(s)" (ccxt + tests + cli)
```

`branch_update=unchanged` is the farm's own `--force` regeneration of the committed sha returning the
same tree — the committed generated tree is exactly the one that compiled. The report commits carry no
build input (`git diff 0f53eaf2cef <tip> -- cs/ build/ ts/src package.json` is empty) and the branch has
no farm `[Automated changes]` commit on top, so the unit branch is only this unit's own commits.

Fixed point locally: the four tier regens (104 rest ids / 76 ws ids / 7 prediction ids / `--tests`) were
run twice; `git diff -- cs/ | sha256sum` is identical both times
(`6414aadbb5a34321aa44455e39e55150e89d3e29859924cd4e867b9daf5f1374`).

## [AST] side

- ast branch `cs90-U55`, sha **`978697f0d35378ed89d47e367be60a41b3f33e7c`** (`npx tsup` before commit;
  `src/`, `tests/`, `dist/` in the commit).
- Gates: `npx tsc -p tsconfig.json --noEmit` exit 0; `npx jest` 13 suites / **786 tests pass**;
  `npx jest tests/csharpTranspiler.test.ts` **123 pass**.
- Base-printer proof: restoring `git show HEAD:src/csharpTranspiler.ts` makes exactly the three positive
  tests fail (`a nullable-scalar declaration prints the native null test`, `typed references print the
  native null test`, `a null literal on the left prints the same native null test`) while the negative
  controls (`without the hook keeps the helper`, `object/var/scalar keeps the helper`, non-identifier
  operand) pass on both printers — i.e. the untyped emission is byte-identical.
- `ccxt-farm push-generator 978697f0d35378ed89d47e367be60a41b3f33e7c` from
  `CCXT_FARM_GENERATOR_SRC=/root/ast-transpiler` → "generator … pushed"; the ccxt commit sets
  `package.json`'s pin to that sha.

## Rejected sub-cases (each with the reason)

1. **`this.<member>` operands — 3339 sites (`this.markets` 3089, `orders` 56, `positions` 46, …), 0
   converted.** A member read has no print-time, hook-gated type proof: the declaration lives in the
   hand-written base (`Exchange.Options.cs:79 public object markets { get; set; } = null;`, `positions`/
   `liquidations` are `object`, `orders`/`myTrades` are `ccxt.pro.ArrayCache`). The printer's own
   `CSHARP_NATIVE_FIELDS`/`CSHARP_OBJECT_DICT_FIELDS` tables would answer printer-side only, and the
   campaign rule for `[AST]` units forbids changing the untyped emission. A follow-up needs a
   member-name → declared-type table plus a **class-level** declaration census over base + 100+
   exchange classes (the name census here mixes locals; `markets` alone has 87 declaration lines).
2. **`object`-declared locals (410 before / 413 after) and `object` parameters (3370 / 3374).** The
   unproven box. `x == null` would be reference-identical, but the roster's family is *typed* references
   and nullable scalars, and the printer's own `csharpOperandIsValueTyped` veto keeps a TS
   number/boolean operand on the helper exactly because the classifier may still retype that local to a
   value scalar. (The ±3 drift is this census script's region-attribution artifact, not a conversion:
   every converted identifier re-derived a nullable scalar.)
3. **Post-print-retyped shadows — 51 sites (37 `string` + 14 nullable-scalar).** `symbolVar`/
   `timeframeVar`/`until`-style copies print `object xVar = x;` and are retyped by
   `retypeCoreArgCopies`/`typeCoreArgs` **after** printing, so the print-time hook cannot see the final
   type and correctly declines. These are U23/U24's shadow families by ownership; a follow-up would need
   a post-print text pass in `build/csharpTranspiler.ts` (hotspot) with its own pair-acceptance rule
   (not hook-gated).
4. **Non-nullable value scalars — 9 sites (`int`).** `x == null` does not compile for a non-nullable
   value type; the gate refuses them (the `int` locals are always assigned, so the helper call is
   semantically `false` — no rewrite is possible without changing the box).
5. **Non-identifier operands — 30 sites (26 `GetValue(…)`, 4 calls such as
   `this.outcomeSearchQuery(outcomeSymbol)`).** The hook names identifiers only; a call/member result
   has no print-time declaration proof.

## Residual risk

- The reference half of the gate (`string?`/`IDictionary`/`IList`/…) fires **0 times** in the committed
  tree — it is covered by the ast unit tests and by the same helper-guard proof, but it is unexercised
  against real ccxt output. If a later unit types such a local, the rewrite is the identical
  reference-equality proof.
- The proof is tied to the hand-written helper body (`Exchange.TranspileHelpers.cs#isEqual` L293): the
  null guards must stay the first two branches. No comment was added to the hand-written base (campaign
  rule: base edits only when they unblock a family).
- Runtime lanes (`id-tests-cs` / static request / response) were not run for this unit; the farm
  `buildCS` compile gate is green and the change is a null test, not a value transformation — a
  non-compiling operand is the only failure mode the gate cannot see, and `x == null` on `T?` is a lifted
  operator with no user code.
- Observation for the integrator (pre-existing, **not** touched here): `csharpLocalTypeOf` is assigned by
  `installCsharpListCastSkips`, `installCsharpElementAccessCastSkips` and `installCsharpStringEquality`,
  and the last assignment wins — in the current install chain the list/element-access answers are
  shadowed (the tree carries 1249 `((IList<object>)x).Add(…)` and 0 bare `.Add(`). This is why U55 adds a
  **separate** hook instead of widening the shared one; reviving those two rules would move ~1249
  unrelated lines.
