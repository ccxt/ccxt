# cs90 U35 — numeric helper returns + arithmetic operand proofs

Unit U35 of campaign `cs90` (roster line: `this.convertToBigInt` / `convertToBigIntCustom` /
`parseToNumeric` / `parseInt(` / `this.parseToInt` / `multiply/subtract/mathMin/mathMax/this.sum`).
Base `d847892a6fc` (PR ccxt/ccxt#30530 head), branch `cs90-U35`, worktree `/root/worktrees/cs90/U35`.

**Commit `33e8c7a5b81402a151bba11ab8c97123a6858223`** — farm job **850**, **exit=0**,
`branch_update=unchanged` (`ccxt-farm log 850 --step buildCS`: `Build succeeded. 0 Warning(s) 0 Error(s)`).

## Result

**0 casts removed / 27 sites typed** (+ 1 generated signature retype + 1 boundary cast).

- 25 `object …` declarations in `cs/ccxt/exchanges/**` (census-visible), 2 in the generated
  `cs/ccxt/base/Exchange.BaseMethods.cs`.
- 1 hand-written base signature: `Exchange.TranspileHelpers.cs#parseInt object -> Int64?`.
- No `build/csharpTranspiler.ts` change, no ast-transpiler change, no `ts/src` change, no new file
  under `build/`.

Census (`campaigns/cs90/census.sh`, cs/ccxt/exchanges/**):

```
before: locals: object=9304 typed=44132 typed%=82   returns: object=1080
after:  locals: object=9279 typed=44157 typed%=82   returns: object=1079
casts:  (string)=2113 (IList<object>)=1922 (bool)=1 (object)=673 (Dictionary<string, object>)=334
        (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        [unchanged before/after — this unit adds casts, it does not remove any]
```

Family census (`tools/U35/census-u35.py`, top-level initializer callee, object locals only):
`multiply 15->14`, `divide 2->2`, `mod 1->1`, `mathMin 6->4`, `mathMax 7->4`, `sum 25->24`,
`parseInt 9->0`, `parseToInt 3->3`, `parseToNumeric 9->9`, `convertToBigInt 16->16`,
`convertToBigIntCustom 4->0`.

## Mechanisms

1. **`parseInt (object) -> Int64?`** (`cs/ccxt/base/Exchange.TranspileHelpers.cs`, hotspot).
   Every return path of the hand-written helper was already the `Convert.ToInt64 (Math.Floor
   (Convert.ToDouble (a)))` box or `null` (the catch); the body was rewritten to the equivalent
   `return Convert.ToInt64 (floored); / catch { return null; }` so the signature names that single
   box. `CSHARP_LOCAL_BARE_RETURN_TYPES['parseInt'] = 'Int64?'` (bare-call table, one consumer:
   `callReturnType`) then names the ~10 declarations the call feeds. Call-site audit (all 51
   `parseInt (` sites in `cs/**` + `examples/**`): 15 are declaration feeds (now typed), the other
   36 keep the value in an object context — dict literal value, `request["k"] = parseInt(…)`,
   `IList<object>.Add (…)`, an `object`-typed local/param, `parseToInt`'s
   `((Int64?)((object)(parseInt (convertedNumber))))` (the box is unchanged), `parseToNumeric`'s
   `return parseInt (…)` (implicit into `object`). One `parseInt` definition exists in the tree
   (`grep -rn "public .*parseInt (" cs/ examples/`), so no overload/ambiguity is introduced; the
   `requestId` per-definition proof (`requestIdExpressionBoxType`) does not consult this table, so
   pro/bitvavo's `requestId` stays `object` (its body would otherwise not compile).
2. **`convertToBigIntCustom -> Int64?`** (`CSHARP_NUMERIC_RETURN_TYPES`, `grvt` only, 1 definition):
   its single return path is `return parseInt (x);`, i.e. the same Int64-or-null box now that (1)
   landed. `CSHARP_LOCAL_THIS_RETURN_TYPES` carries the same entry (the two tables are kept in
   sync). The header's rejected-list note was updated: the name was rejected while `parseInt` was
   declared `object`. 5 declarations typed (grvt); the 2 arithmetic grvt sites stay `object`
   (double `Math.Pow` operand).
3. **`this.sum` operand proof extended to a static `Int64?` argument**
   (`integerOrNullArgumentKind`): an `Int64?` argument is the nullable spelling of the same integer
   box, and it is the static C# type of a nested `a * b` / `a / b` / `a % b` over an `Int64?`
   operand (binds the `(Int64?, Int64?)` twin) and of `parseInt (…)`. `sum`'s object overload maps
   a null operand to 0 exactly like its `Int64?` twin, so the emitted call's own type is `Int64`
   on every path — `Int64 index = this.sum (multiply (j, batchSize), k)` (kraken), no cast. The
   existing `int`/`uint`/`long`/`Int64` spelling is unchanged; a `double` argument is still
   rejected.
4. **`Math.min` / `Math.max` — new box-exact cast family** (`mathMinMaxBoxType` +
   `mathMinMaxOperandBox`, hooked into `csharpLocalTypeOf`). `mathMin/mathMax` return ONE OF THEIR
   OPERANDS unchanged (`a == null || b == null -> null`), so only a pair whose every returnable
   box IS the named box is provable: `int+int -> int`, `Int64+Int64 -> Int64`,
   `Int64`/`Int64?` (at least one nullable) `-> Int64?`, `double`/`double?` `-> double`/`double?`.
   Every mixed pair is rejected (the other operand's box would throw the unbox). 5 sites:
   `hyperliquid significantDigits -> int` (`mathMax (5, ((string)integerPart).Length)`),
   `prediction/kalshi limit -> Int64?` (`mathMin (maxMarkets, pageLimit)`, both `Int64?`),
   `prediction/limitless totalPages -> double` (`Math.ceil` operands),
   `hibachi feeRate -> double?` (2 sites, both `double?` operands).

   **No typed overload is added** for `mathMin/mathMax`: S57's own binding audit
   (`campaigns/cs-strict/tools/S57/audit-numeric-overload-bind.txt`) modelled
   `(int,int)/(Int64,Int64)/(double,double)/(Int64?,Int64?)` twins and measured **mathMin 101
   DIVERGENT, mathMax 1** mixed-kind call sites whose RESULT box would change; with the twins OFF
   (the shipped state) both families are `UNCHANGED` at all 171/33 sites. Adding them would move
   boxes at sites this unit does not own, so the per-declaration cast is used instead.

## Rejected sub-cases (with proof)

| Sub-case | Sites | Reason (proof) |
|---|---|---|
| `this.parseToNumeric` | 9 | Body has TWO boxes: `parseFloat` (double-or-null) and `parseInt` (Int64-or-null) — `if (getIndexOf (stringVersion, ".") >= 0) return parseFloat (…); return parseInt (…);`. Not a single box; naming either would unbox the other at runtime. Same reason the base table already lists `toEn` / `calculatePricePrecision` as rejected. |
| `this.convertToBigInt` | 16 | Body has THREE boxes: `BigInteger` (the `is BigInteger` passthrough and `BigInteger.Parse`), the original `string` (the `0x` hex passthrough), and `new BigInteger (Convert.ToInt64 (value))`. Every one of the 16 sites feeds a BigInteger into the extended-starknet ABI helpers, so a scalar cast would throw on the string paths. |
| `convertToBigIntCustom` arithmetic sites | 2 | `grvt sizeInteger` / `priceInteger`: `… * sizeMultiplier / (Math.Pow (…))` — a `double` operand; `multiply`/`divide` have no `(double, double)` twin by design (an integer-valued double product re-boxes as Int64). |
| `multiply` leftovers | 14 | Each blocked by an operand that is `object` in another family's ownership: core-arg shadows `limit`/`limitVar` (U23/U24), the ternary arms (U22/U38: weex `numberOfCandles`, bydfi `timeDelta`), `getValue (…)` element reads (U07/U03: grvt), an `object i = 1` loop counter (U38: hyperliquid `secondPart`), `parseInt`-free `Math.Floor`/`Math.Pow` doubles (hyperliquid/pacifica `fundingTimestamp`, polymarket `snappedMs` — correctly rejected: the object path re-boxes an integer-valued double product as Int64, so a `double` declaration is wrong). |
| `divide` | 2 | Both grvt sites: a `double` right operand (`Math.Pow (…)`). |
| `mod` | 1 | `pro/binance normalizedIndex = mod (streamIndex, streamLimit)`: `streamIndex` is `object` (`object streamIndex = this.safeInteger (…)` held by its own self-read `add` write) → no twin binds. |
| `this.sum` leftovers | 24 | `since`/`sinceVar`/`startTime`/`startIndex` object (U42 copy / U38 literal / core-arg shadow), `getValue (…)` operands (pro/aster, pro/binance, myriad), `recvWindow` an `object` parameter (nado, pro/nado), `limit`/`maxLimit` core-arg shadow, `secondPart` (U38), and 2 sites (`binance` 11595, `tokocrypto` 2530) whose INITIALIZER is provable but whose later write `endTime = mathMin (endTime, until)` has static type `object` — no cast can be emitted on a write, and the `mathMin` twins are rejected (above), so the scan keeps them `object`. |
| `this.parseToInt` | 6 | `hyperliquid sz` — later write `sz = prefixUnaryNeg (ref sz)`: `prefixUnaryNeg` has `int`/`Int64`/`double` twins only, no `(ref Int64?)`; `kraken numBatches` / `lbank numLines` — later self-read write `x = this.sum (x, 1)` (self-read join is U32's arm; `resolveLocalReadType` answers undefined for the declaration under classification); `pro/bithumb timestamp` / `alpaca iso` — the declaration is a `-` expression with an unproven sibling (`parseToNumeric` two-box helper); `btcturk to` — `limitSeconds` blocked by the `limit` core-arg shadow. |
| `Math.min/mathMax` mixed pairs | 7 | `prediction/limitless limit = mathMin (requestedLimit, 50)` ×2 (`Int64?` beside an `int` literal — the helper can hand back the Int32 box, the `(Int64?)` unbox would throw), `coinbaseinternational newLimit` (`limit` object), `gate to` (`toTimestamp` object), `lbank parsedLimit` (`limit + 1` unproven), `prediction/hyperliquid pricePrecisionDecimals` (nested `mathMin` over an object `maxDecimals`), `okx startTime` (`since - 1` unproven). |
| `Math.max (5, len)` as a `-` operand | 2 | `hyperliquid significantDigits` (832) and `prediction/hyperliquid` (667): the box-exact spelling is `int`, and the existing scan vetoes an `int` local used as a `-` operand with an `int` sibling (`intMinusOperandIsIdentical`: the object path normalises to Int64, the `(int, int)` twin returns Int32). Correctly kept `object`. |
| `parseFloat` | 2 | Adjacent family, not on this unit's roster line: `htx` / `zaif` `object x = parseFloat (…)`. The same single-box proof applies (the `Convert.ToDouble` box or null), left for whoever owns that name. |

## verify-diff.py

`python3 campaigns/cs90/verify-diff.py HEAD~1` →
`files=17 pairs=30 unexpected=17`; **every one of the 17 unexpected lines is in the hand-written
`cs/ccxt/base/Exchange.TranspileHelpers.cs`** (the `parseInt` signature retype + the body rewrite —
a class the checker does not model: it only models generated-tree declaration/return/signature
pairs). All 16 generated files (25 declaration retypes, the `convertToBigIntCustom` signature
retype and its boundary cast `return ((Int64?)((object)(parseInt(x))));`) are accepted pairs; the
generated-tree diff has **0 unexpected lines**.

Determinism: `git diff -- cs/ | sha256sum` was identical before and after re-running the scoped
regens (`--force --noTests` rest + `--force --ws --noTests` + `--force --prediction --noTests`);
the farm's `--force` job reported `branch_update=unchanged`.

## Residual risk

- The 36 `parseInt` call sites that stay in object contexts were audited by hand (box unchanged,
  no overload resolution involved — `parseInt` has exactly one definition and no overloads). The
  riskiest two are the generated `parseToInt` body (`(Int64?)(object)(Int64?)` unbox round-trip,
  exact) and `parseToNumeric`'s `return parseInt (…)` into `object` (implicit).
- The 4 new `mathMin/mathMax` casts unbox the helper's own returned operand; the operand proof is
  box-exact, so the unbox cannot throw. Sites whose later uses are `-` operands are vetoed by the
  scan (2 sites above).
- The `sum` extension's single site (kraken) moves `multiply (j, batchSize)` from
  `multiply(object, object)` to `multiply(Int64?, Int64?)` and the enclosing `sum` to
  `sum(Int64?, Int64?)`: both are the box-identical twins the S57 differential harness covers
  (normalise + null→null / null→0).
- Sites the unit *would* claim once sibling units land (no code change needed here, the proofs
  cascade): U23/U24 (`limitVar`/`sinceVar` shadows), U38 (`object i = 1`, `object startIndex = 0`),
  U22 (ternary arms), U07 (getValue reads), U32 (self-read `sum` writes), U42 (identifier copies).
  If those land, the remaining `multiply`/`sum`/`mod` sites of this family become typed by the
  proofs already in the base + this unit's extension.
- `parseToNumeric` / `convertToBigInt` are rejected by contract, not by effort (above).

## Hotspots

- `hotspot: cs/ccxt/base/Exchange.TranspileHelpers.cs:873` — `parseInt (object) -> Int64?` (the only
  hand-written base signature this unit moves; body rewritten to the same box).
- `hotspot: build/csharp-local-types.js` — shared classifier, edits at
  `1455-1461` (`CSHARP_LOCAL_THIS_RETURN_TYPES` `convertToBigIntCustom`), `1652-1666`
  (`CSHARP_LOCAL_BARE_RETURN_TYPES` `parseInt`), `2699-2710` (`integerOrNullArgumentKind`
  `Int64?` argument arm), `2735-2815` (`mathMinMaxBoxType` + `mathMinMaxOperandBox`),
  `5796-5803` (the `csharpLocalTypeOf` chain hook), `7690-7773` (`CSHARP_NUMERIC_RETURN_TYPES`
  `convertToBigIntCustom` + the updated rejected-list note).
- No `build/csharpTranspiler.ts` and no ast-transpiler `src/` change (no `[AST]` work in this unit).

## Tooling

`campaigns/cs90/tools/U35/`: `census-u35.py` (family census by top-level initializer callee,
`--sites <callee>`), `ctx-u35.py` (statement window per site), `u35-operands.mjs` (drives the
installed classifier per declaration and per operand — operand queries need the declaration's own
`csharpEnclosingFunction` scope, or every identifier answers `undefined`), `u35-probe.mjs`,
`ids-rest/ws/pred.txt` (scoped regen id lists).
