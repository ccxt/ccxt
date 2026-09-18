# U57 [AST] — `add (x, y)` → native `(x + y)` for a proven string left operand

Branch `cs90-U57` (ccxt worktree `/root/worktrees/cs90/U57`).
ast-transpiler: branch `cs90-U57` in `/root/worktrees/cs90-ast/U57`,
**sha `ceb8a83b8591fe8b276a9c184d09b939e4ef98ec`** (base pin `404e9daa7f0ab58d085ed04aaa61a19546dfeda2`).
ccxt code sha `1f145031921e602ece7c35521c70c34af84f5489`; farm job **852, exit=0**,
`branch_update=unchanged`, `generator=ceb8a83b859…` (the farm regenerated the whole cs tree with this
pin and produced no change, i.e. the committed tree is the fixed point). REPORT tip gated separately —
see the `farm` section.

## Family

`x + y` prints `add (x, y)`. When the LEFT operand's printed C# static type is a string, the call the
compiler binds is `add(string, string)` (`a + b`) or `add(string, object)` (`a + b?.ToString()`) —
`cs/ccxt/base/Exchange.TranspileHelpers.cs` — and C#'s string concatenation computes exactly those
values for **every** input, null operands included:

| x | y | emitted `add(x, y)` | native `(x + y)` |
|---|---|---|---|
| `string` | `string` | `add(string, string)` = `x + y` | `String.Concat` = `x + y` |
| `string` | null | `x + null` = `x` | `x + null` = `x` |
| null | `string` | `null + y` = `y` | `null + y` = `y` |
| null | null | `null + null` = `""` | `null + null` = `""` |
| `string` | `object`/numeric | `x + y?.ToString()` | `x + y` = `x + (y?.ToString() ?? "")` — same value |

The one divergent overload is `add(object, object)` (null LEFT → **null**, and a `(string)b` cast that
throws `InvalidCastException` on a non-string right). It is selected only when the left operand is not
statically a string, so the rule is gated on a **proven** string left and can never reach it. A
`string?` left is accepted only when the right operand is a proven string too: the call then binds
`add(string, string)`, whose body IS `a + b`, i.e. literally the expression emitted here.

## Rules / passes touched

* **ast** `src/csharpTranspiler.ts` (+22): new hook `csharpNativeStringConcat(left, right, leftText,
  rightText)` returning `undefined` by default (the untyped emission stays byte-identical — proven by a
  scoped regen of binance/bybit/okx/kraken/gate with the hook absent: empty `git diff -- cs/`), and the
  call site in `printCustomBinaryExpressionIfAny`'s `PlusToken` branch. The result is **parenthesised**:
  the printer embeds a subexpression's text in receivers and arguments, where `+` binds looser than
  `.`/`(` (an unparenthesised emission would need an audit of every embedding site; parens make the
  text an atom like the call it replaces).
* **ccxt** `build/csharp-local-types.js` (+159): `installCsharpNativeStringConcat` (installed from
  `installCsharpLocalTypes`, after `installCsharpStringEquality`) records every **printed** declaration
  line (`string`/`string?`) per enclosing function and answers the hook through `concatOperandType`,
  which is type-precise (so a `string?` left can demand a string right) and otherwise reuses the
  module's own operand prover arms: string literal, `as string`, `this.<string member>`
  (`CSHARP_LOCAL_THIS_MEMBER_TYPES`), `.toString()`, `callReturnType` string/`string?` entries, and a
  nested `+` chain that converts (its printed form is a native concat, i.e. a string).
  `dropRedundantAddCast` now recognises the native-concat argument text (`concatArgumentText`) so the
  landed `((string)add (a, b))` cast-drop keeps firing on converted arguments.
* **ccxt** `build/csharpTranspiler.ts` (+8) — **hotspot**: `coreArgShadowUseKind` accepts a `+` operand
  as a read. Without it every core-arg shadow whose only read sits inside a converted concat lost its
  retype (`object typeVar = type;` regressed to `object` in foxbit/digifinex — found by the pair audit).
  Gated on `newRules` so the `timeframe` shadow (unit S04's family, lower unit number owns contested
  sites) keeps only the base rules.

## Census (campaigns/cs90/census.sh, `cs/ccxt/exchanges/**`)

```
before: locals: object=9304 typed=44132 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        helpers: isTrue=1434 isEqual=12034 getValue=6761 add=8833 getArrayLength=704
after:  locals: object=9304 typed=44132 typed%=82          <- unchanged
        casts:  identical                                  <- no cast added, none removed
        helpers: isTrue=1434 isEqual=12034 getValue=6761 add=2503 getArrayLength=704
```

**7494 `add (` helper calls removed tree-wide** (`cs/`: 10546 → 3052), 6330 of them in
`cs/ccxt/exchanges/**` (8833 → 2503). Left-operand shapes of the emitted native concats (measured off
the `+` lines of the diff): `this.<member>` 2984, string literal 1852, call/nested chain 1427,
cast/nested chain 979, local read 252.

`casts removed = 0`, `sites typed = 0` — this unit changes the emission only; the `(string)` casts it
touches are the *preserved* drops of the landed redundant-cast family (the census is byte-identical
before/after, so no cast regressed either).

## Verification

* `python3 campaigns/cs90/tools/U57/audit-concat.py` — pair audit over `git diff -U5 -- cs/`:
  **pairs=5103 matched=5103 ins=5103 dels=5103 anomalies=0**; `--selftest` PASS (injected mutated
  right-hand side, foreign line, added line and dropped line are each flagged). Every changed line is
  the same line with `add (A, B)` → `(A + B)` and nothing else; multi-line statements are joined with
  their unchanged continuation lines before the comparison.
* `python3 campaigns/cs90/verify-diff.py HEAD` — **files=203 pairs=5103 unexpected=5103** (exit 1).
  Expected: the shared gate models declaration/return/signature/cast pairs only and has no rule for an
  expression-level helper → operator rewrite; the whole diff is that one class, which is why the
  unit-local audit above (with selftest) is the gate for it. The shared script was not widened
  (siblings edit it concurrently).
* ast tests: `npx jest tests/csharpTranspiler.test.ts` → **120 passed** (4 new U57 tests). With the
  base printer restored (`git show HEAD:src/csharpTranspiler.ts`) the two positive tests FAIL and the
  two negative ones pass, so the tests pin the new rule.
* Regen coverage: REST + base + prediction base + prediction REST (7 files), pro/WS (68 files),
  tests tier (25 files) — `--force` REST, `--force --ws`, then `--tests`; no `examples/cs` change is
  needed (its only `add (` mentions are the hand-written `Examples.Bridge.cs` overloads).
* Farm: `ccxt-farm build --targets cs --wait` → `HEAD 1f145031921… job=852 exit=0
  branch_update=unchanged generator=ceb8a83b859…`; `ccxt-farm status 852` is the evidence.

## Rejected sub-cases

* **Left operand is a parameter** (4 sites measured): the emitted signature is rewritten by the
  post-print `typeCoreArgs` pass, so the printer cannot name a parameter's emitted type at print time.
* **`+=` / self-concat** (`x = add (x, y)`, 83 sites of that exact shape, 3 with a string-declared `x`):
  the hook is consulted from the `PlusToken` branch only; the `PlusEqualsToken` branch prints
  `x = add (x, y)` and would need its own assignment-target proof for a marginal gain. Left as is.
* **`this.<member>` reads outside `CSHARP_LOCAL_THIS_MEMBER_TYPES`, untyped locals, `getValue (...)`
  calls and every other operand whose printed type may be `object`**: rejected by construction — this
  is the `add(object, object)` class (null LEFT → null), the divergence the unit must not reach.
* **`string?` left with a right operand that is not provably a string** (e.g. `add (x_string?, y_object)`):
  rejected even though the emitted call is `add(string, object)` (which also matches the operator); the
  conservative rule keeps the `string?` half of the family on the two overloads whose bodies are exactly
  the concatenation. Measured `string?`-left sites: 2 (pro/messageHash locals, both with a literal
  right, both accepted).
* **`timeframeVar` shadow sites**: the first version of the `coreArgShadowUseKind` arm also fired for the
  `timeframe` copy (5 sites) and widened unit S04's accepts; the arm is now gated on `newRules` so those
  sites keep the base decision.

## Residual risk

* The `callReturnType` / `CSHARP_LOCAL_THIS_MEMBER_TYPES` arms reuse the module's own operand prover
  (`isProvablyStringOperand`), i.e. the same trust level the landed declaration-typing rules and the
  redundant-cast family already rely on. If one of those tables over-answered, the emitted native
  concat would sit where `add(object, object)` was bound: a null left would come back as the right
  operand instead of null. Mitigations: the tables drive both the emitted signatures and the locals'
  declarations (the declaration census is unchanged), and the whole-tree farm build with the new pin is
  green with `branch_update=unchanged`.
* The `coreArgShadowUseKind` `+` arm accepts any `+` operand as a read; the only `+` operators in the
  generated tree are this unit's concats (the printer emits `add (...)`, `subtract (...)`, … elsewhere),
  so the widening is scoped to the sites this rule creates. It shares `build/csharpTranspiler.ts` with
  U24/U25 — **hotspot**.
* Multi-line right operands are emitted inside the added parens; 5 such statements exist and are
  verified by the audit's context-joining path. A trailing `//` inside an operand text would break the
  parens, but the printer attaches comments at statement level, not inside expressions.
* 1107 of the changed lines are declaration lines (`object x = add (...)` → `object x = (…)`) that
  U19/U20-style branches also retype; expect **line-level conflicts** there at integration (take the
  sibling's declaration plus this concat). No `cs/ccxt/base/*.cs`, `ts/src/*.ts` or hand-written base
  file was touched.
