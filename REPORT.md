# U65 — `limit` core-arg shadow copies + `ArrayCache.getLimit` → `Int64?`: 269 sites typed, 0 casts removed

Unit: **U65** (branch `cs90-U65`, worktree `/root/worktrees/cs90/U65`) — the user-approved escalation
of U23 (`campaigns/cs90/WAVE1.md`, USER DECISIONS 2026-09-18 #1: "retype `ArrayCache.getLimit/_getLimit`
(+`ArrayCacheByTimestamp.getLimit`, `cs/ccxt/ws/ArrayCache.cs`) to `Int64?` … update
`cs/tests/ArrayCacheRegressionTest.cs` to the new box"). Base `d847892a6fcf5699640862316303b6344a3e4daf`
(PR #30530 head). **Not an `[AST]` unit**: no ast-transpiler `src` edit, no pin bump, no `ts/src` edit,
no `build/csharp-local-types.js` edit.

## Result

* **sites typed: 269** — `Int64? limitVar = limit;` × 268 + `Int64? requestLimit = limit;` × 1 (mudrex;
  same family: a copy of the `limit` core arg).
* **casts removed: 0.** The unit *adds* the `((Int64?)…)` cast at **274** writes: 205 ×
  `limitVar = callDynamically (<cache>, "getLimit", …)` and 69 × integer-literal writes (`??=` included).
* the family is 310 sites: 274 typed (269 new + 5 already typed by rounds 2/3) + 36 left `object`,
  each with a measured blocker (§Rejected sub-cases).
* the deliberate box normalisation the user approved: a `limitVar` write now boxes an **Int64** where
  the `object` spelling boxed an Int32 (literals) or whatever `getLimit` returned (Int32 for the
  `Math.Min`/counter paths, Int64 through the `return limit2` path). Every consumer of that box was
  censused — §"Box/overload audit".

## Product change

1. **`cs/ccxt/ws/ArrayCache.cs`** (hand-written) — `ArrayCache.getLimit` / `ArrayCache._getLimit`
   (`object` → `Int64?`), `ArrayCacheByTimestamp.getLimit` / `._getLimit` (`int` → `Int64?`). The one
   `return limit2;` path becomes `return ccxt.BaseExchange.ToInt64Arg(limit2);` — `ToInt64Arg` is the
   existing null-preserving, box-normalising conversion
   (`Exchange.TranspileHelpers.cs:1359`), so a null limit still returns null (a plain
   `Convert.ToInt64` would have turned it into 0). The Int32 arithmetic (`Math.Min(int,int)`,
   `int? newUpdatesValue`) is unchanged and widens implicitly at the return. Every `getLimit` in
   `cs/**` is one of these four declarations (no other class defines it; no bridge twin in
   `cs/tests/BaseTest.Bridge.cs` or `examples/cs/examples/Examples.Bridge.cs` mentions `ArrayCache`
   or `getLimit` — the "mirror any bridge twins" step is a no-op).
2. **`cs/tests/ArrayCacheRegressionTest.cs`** (hand-written) — the named block 174–181 and its three
   twins (the `bySide` assert, the two counter asserts, the `clear()` counter assert) now read the
   Int64 box (`Convert.ToInt32` → `Convert.ToInt64`); `getLimit("ETH/USDT", null) == null` unchanged.
3. **`build/csharpTranspiler.ts`** (`hotspot:`) — `retypeCoreArgCopies` / `coreArgShadowIsProvable`:
   two write forms admitted **for the `limit` source only** (`CORE_ARG_SHADOW_LIMIT_SOURCE`), each
   with the `((Int64?)…)` cast the typed declaration needs, emitted by `coreArgShadowLimitCastWrite`
   (all-or-nothing: a write line the rewrite cannot reproduce byte-for-byte — e.g. an unknown shape —
   keeps the whole site `object`):
   * `callDynamically(<ident>, "getLimit", new object[] { … })` — the hand-written ws cache accessor,
     now `Int64?` on every implementation, so the cast names the box the value already has;
   * `= <integer literal>` / `??= <integer literal>` — the approved box change, spelled explicitly
     at the site (trailing `//` comments are reproduced verbatim).

## Census (`campaigns/cs90/census.sh`; before = the base tree)

```
before  locals: object=9304 typed=44132 typed%=82
after   locals: object=9035 typed=44401 typed%=83
casts   before == after: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 → 676
        (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133
        (IDictionary<string, object>)=127 (List<object>)=102
params: object=11635  returns: object=1080   (unchanged)
```
`(object)` 672 → 676 is the S20 F1 class below (4 lines). `((Int64?)` is not one of the census's cast
spellings, so it does not move any cast bucket.

Family census (`tools/U65/census-out.py` → `tools/U65/census-out.txt`): 274 `Int64?` / 36 `object`
declarations out of 310; the 36 residuals bucketed by blocker.

## Gates

```
# local, scoped (--local keeps the pinned ast checkout; dotnet never runs here)
npx tsx build/csharpTranspiler.ts --force --noTests  <51 REST ids>      rc 0
npx tsx build/csharpTranspiler.ts --force --noTests --ws <67 ws ids>    rc 0
npx tsx build/csharpTranspiler.ts --force --noTests --prediction binance polymarket   rc 0
# full, local: all REST ids / all 76 ws ids / prediction + --tests + --baseTests
npx tsx build/csharpTranspiler.ts --force --noTests        rc 0   (103 files changed, no new file)
npx tsx build/csharpTranspiler.ts --force --ws --noTests   rc 0   (76 files, diff unchanged)
npx tsx build/csharpTranspiler.ts --force --prediction --noTests   rc 0
npx tsx build/csharpTranspiler.ts --tests / --baseTests    rc 0   (tests tier: no change)
# determinism: diff sha256 identical across two full scoped re-runs (9e2d15fe53800dbb)
python3 campaigns/cs90/verify-diff.py d847892a6fc   -> files=103 pairs=556 unexpected=302 (see below)
python3 tools/U65/pair-audit.py d847892a6fc  -> pairs=547 DECL=269 CAST=274 S20=4 unexpected=0  (rc 0)
python3 tools/U65/handwritten-audit.py d847892a6fc -> pairs=18 WS-SIG=4 WS-RET=1 WS-COMMENT=5 TEST-CONV=6 TEST-COMMENT=2 unexpected=0  (rc 0)
python3 tools/U65/pair-audit.py --selftest   -> SELFTEST PASS (wrong target type / mutated RHS / wrong cast / mutated line / unrelated line all flagged)
python3 tools/U65/handwritten-audit.py --selftest -> SELFTEST PASS
readlink -f node_modules/ast-transpiler      -> /root/worktrees/cs90-ast/pin (before AND after every regen)
# (the audits take the BASE sha: once this change is committed, `HEAD` no longer shows the diff)
```

`verify-diff.py` has no rule for a **write-line cast insertion** (only declaration/return/signature
retypes) and none for the S20 F1 box, so it reports `unexpected=302`, decomposed exactly as:
274 cast insertions + 4 S20 lines + 24 entries from the two hand-written files (3 BLOCK hunks, 12
unpaired `+`/`-` lines of added comments/signatures, 9 signature/return pairs). Both classes are
proven by the unit-owned audits above — `pair-audit.py` re-derives each changed line of the generated
tree from its pair (`object N = limit;` → `Int64? N = limit;`; `N <op> RHS;` → `N <op> ((Int64?)RHS);`;
`X.ToString()` → `((object)X).ToString()`), `handwritten-audit.py` the same for `ArrayCache.cs` /
`ArrayCacheRegressionTest.cs` (`WS-SIG` = the four `getLimit/_getLimit` retypes, `WS-RET` = the
`ToInt64Arg` return, comment additions, `Convert.ToInt32(` → `Convert.ToInt64(`).

Farm (dotnet is farm-only):
```
ccxt-farm build --targets cs --wait
HEAD 6b1872028c70e368f771f2e9d35110b68693794e job=837 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
ccxt-farm status 837 -> {"state":"succeeded","exit_code":0,"branch_update":"unchanged","failing_step":"","failing_files":[]}
ccxt-farm log 837 --step buildCS -> Build succeeded.  0 Warning(s)  0 Error(s)
```
The tests project is part of that build, so the hand-written `ArrayCacheRegressionTest.cs` edits and
the retyped `ArrayCache` compile against each other. `branch_update=unchanged` on the farm's own
transpile is the fixed-point proof that the committed tree is what the generator emits. The farm's
`--test` lane is red on the base for network reasons (no runtime lane was run — see residual risk).

## Box/overload audit (rule 1)

* **`callDynamically` write** — `callDynamically` returns `object`; the `((Int64?)…)` unbox is exact
  for every implementation of `getLimit` in `cs/**` (ArrayCache + ArrayCacheByTimestamp, both
  `Int64?`; subclasses inherit). Boxed Int64 → Int64, `null` → `null`. The reflective call itself is
  unaffected: `coerceArgs` skips `object` parameters (`Exchange.TranspileHelpers.cs:1297`).
* **the 274 typed sites' reads** were re-censused on the emitted tree (innermost callee of every alias
  occurrence): `filterBySinceLimit` 124, `isEqual` 88, `filterBySymbolSinceLimit` 85, `multiply` 20,
  `parseOHLCVs` 18, `isGreaterThan` 13, `fetchPaginatedCallDeterministic` 10, `parseOrders` 9,
  `parseTrades` 7, `subtract` 7, `mathMin` 7, `ToInt64Arg` 7, `parseTransactions` 6, `numberToString` 4,
  `inArray` 3, `parseOpenInterestsHistory` 2, `fetchPaginatedCallCursor` 2, `filterByOutcomeSinceLimit` 2,
  `sum` 1, `parseBorrowRateHistory` 1, `parseTransfers` 1, `fetchPaginatedCallDynamic` 1, plus 208
  object-array/dictionary-initializer elements, 31 `IDictionary` element writes and returns — every
  callee is in the existing `CORE_ARG_SHADOW_CALLEES` / `_NEW_CALLEES` tables (object-typed positions),
  or an identity cast / `object` box. `isEqual`/`isGreaterThan`/`isLessThan*` have no typed twins
  (object-only), so no rebinding there.
* **the one real rebinding class**: `multiply` / `divide` / `sum` / `subtract` DO have
  `Int64`/`Int64?` twins, so a read like `multiply(limitVar, 86400000)` now binds
  `multiply(Int64?, Int64?)` instead of `multiply(object, object)` (28 such lines, listed in
  `tools/U65/census-out.txt`). Those twins are value-, box- and exception-identical by their own
  documented contract in the base (`Exchange.TranspileHelpers.cs:593-646`: `multiply(Int64?,Int64?)`
  = the object overload's `a is Int64 && b is Int64` branch lifted, null → null; `divide(Int64?,Int64?)`
  likewise; `sum(Int64?,Int64?)` **delegates to the object overload** and converts its result;
  `subtract(Int64,Int64)` = the object overload's `(Int64)a - (Int64)b` branch) — introduced and
  differentially harnessed by cs-strict S57/S18 for exactly this static type. The cascade
  (`sum(Int64?,Int64?)` → `subtract(Int64,int)` → `subtract(Int64,Int64)`) is the same identity.
* **S20 F1 knock-on (4 lines)**: `limitVar.ToString()` → `((object)limitVar).ToString()`. The S20 pass
  keeps the box for a nullable value receiver because `((object)null).ToString()` throws
  NullReferenceException where `((Int64?)null).ToString()` would return `""` — i.e. the box PRESERVES
  the previous `object`-declared behaviour (NRE on null, identical string otherwise).

## Rejected sub-cases (36 sites left `object`, each with reason)

| n | blocker | why it cannot be typed here |
|---|---|---|
| 17 | write `limitVar = mathMin/mathMax/sum(…)` | the helpers return `object` (CS0266); a typed overload would convert the literal arm and change its box — outside the approved classes (U23 #4). |
| 12 | write `limitVar = cond ? <literal> : …` | the conditional's natural type (and the box of the literal arm) changes; not in the user decision's two named classes (U23 #3). |
| 3 | read at a callee outside the table: `this.parseTradingViewOHLCV(…, limitVar)` (mercado), `this.arraySlice(collected, 0, limitVar)` (prediction/binance), `this.findNearestCeiling(new List<object>(){…}, limitVar)` (grvt) | the callee/argument shape is not admitted (`arraySlice`/`parseTradingViewOHLCV` are not in the shadow-callee table; `coreArgShadowCallee` bails at the `}` of the preceding list initializer for grvt). Adding names would fire on sibling units' copies (shared `newRules`), so it is left to a follow-up. |
| 2 | write `limitVar = maxLimit; / = defaultLimit;` | object/int local → CS0266 (U23 #5). |
| 1 | read `object userLimit = limitVar;` (phemex `fetchOHLCV`, also `limitVar = maxLimit;`) | the alias inside another local's `object` declaration is not an admitted read shape (U23 #7). |
| 1 | read/ref-sink: `arraySlice(candles, prefixUnaryNeg(ref limitVar))` (prediction/polymarket) | no `ref Int64?` overload exists (`prefixUnaryNeg(ref int/Int64/double/object)` only) — the family the base documents as a veto (U23 #7). |
| — | 76 int-literal / 204 getLimit sites per the U23 census | **taken** — 69 literal writes and 205 getLimit writes are typed; the missing 7 literals are inside sites blocked by one of the rows above (their literal write is typed wherever the site fires). |

Not taken, deliberately: extending the shadow-callee table (`arraySlice`, `parseTradingViewOHLCV`),
the ternary/literal-arm relaxation, and typed overloads for `mathMin/mathMax/sum` — all three would
change boxes at sites the user decision did not cover and/or fire on sibling units' families
(disjoint ownership, rule 5).

## hotspot: lines

```
hotspot: build/csharpTranspiler.ts:1151-1166   the limit write-form constants + comment
hotspot: build/csharpTranspiler.ts:3045-3064   coreArgShadowLimitWriteRhs / coreArgShadowLimitCastWrite
hotspot: build/csharpTranspiler.ts:3111-3128   coreArgShadowIsProvable: limitCasts collector
hotspot: build/csharpTranspiler.ts:3571-3595   retypeCoreArgCopies: limit cast plumbing
hotspot: cs/ccxt/ws/ArrayCache.cs:162-208, 285-302   hand-written base retype (4 signatures + 1 return)
hotspot: cs/tests/ArrayCacheRegressionTest.cs:167-196, 232   hand-written test to the new box
```
No ast-transpiler `src`, no `ts/src`, no generated-file hand edit, no `build/csharp-local-types.js`.
`build/csharpTranspiler.ts` is shared with U24 (same functions): the change is additive and keyed on
`source === 'limit'`, so a merge keeps both units' write forms (`CORE_ARG_SHADOW_LIMIT_*` vs
`CORE_ARG_SHADOW_OWNED_SOURCES`).

## Residual risk

* **Box normalisation is the deliverable's risk, not a bug**: 274 writes now box Int64 where an Int32
  box could flow before. All consumers were censused (§Box/overload audit) and `normalizeIntIfNeeded`
  already maps int→Int64 inside every numeric helper, so value comparisons are unaffected; a consumer
  doing an exact `(int)` unbox of that box would be the failure mode — none exists in `cs/**` (every
  callee types the position `object`).
* **No runtime lane was executed** (the farm's `--test` lane is red on the base for network reasons,
  and dotnet does not run on this VM). The static gates are: farm build 0/0 (compiles), the
  `ArrayCacheRegressionTest` cases reason through statically against the retyped signatures, and the
  generated test tier's `object limited = cache.getLimit(…)` comparisons use `isEqual`, which compares
  mixed int/Int64 numerically (`IsInteger` branch) — no exact-box comparison anywhere in that file.
* 36 family sites remain `object` (missed typing opportunity, not a behaviour risk).
* The census numbers are re-derivable from `tools/U65/*.py`; `census-out.txt` is the frozen output of
  the committed tree.

## Artifacts (profile side — nothing new under `build/`)

```
campaigns/cs90/tools/U65/limitvar-census.py     family census: declarations + use shapes per site
campaigns/cs90/tools/U65/census-out.py          residual buckets + site list -> census-out.txt
campaigns/cs90/tools/U65/census-out.txt         the frozen output for the committed tree
campaigns/cs90/tools/U65/pair-audit.py          generated-tree pair audit (--selftest)
campaigns/cs90/tools/U65/handwritten-audit.py   hand-written-file pair audit (--selftest)
```
