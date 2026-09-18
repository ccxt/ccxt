# cs90 U56 [AST] — `isTrue(bool?)` → `x == true`, `!isTrue(x)` → `x != true`

Branch `cs90-U56`, worktree `/root/worktrees/cs90/U56`, base `d847892a6fcf5699640862316303b6344a3e4daf`.
ast worktree `/root/worktrees/cs90-ast/U56`, branch `cs90-U56`, **ast sha `a0c4cd3c5bfbfd5818bf098024b3cb42c04e0f54`**
(on base pin `404e9daa`), `npx tsup` after each src edit, `readlink -f node_modules/ast-transpiler` =
`/root/worktrees/cs90-ast/U56` before every regen.
ccxt code commit **`0b52dec784c5c5e66cfeae844e688f3cedc002ff`** (package.json pin = the ast sha).
Farm **job 814, exit=0**, `branch_update=unchanged`, `generator=a0c4cd3c…`, `buildCS` 0 Warning(s) /
0 Error(s). 0 casts removed, 0 declarations typed, **81 `isTrue(...)` predicates replaced by the native
form, 155 emitted lines changed**.

## Family

S61's condition-operand hook (`csharpConditionOperandType`) already prints `bool` bare and `bool?`
as `x == true` in `if` / `while` / `&&` / `||` / `!` positions. The unit finishes that rule where the
hook was never consulted:

1. **ternary condition** (`cond ? a : b`) — the operand sits under a `ConditionalExpression`, so
   `csharpConditionPositionAllowsNative` never allowed it and `printTernaryCondition` only folded the
   printer's own `bool` (never a classifier-typed one, never a `bool?`);
2. **the `!` spelling** — `!x` on a `bool?` printed `!(x == true)`; the unit's spelling is `x != true`;
3. the **ccxt hook's await guard** — `bool? uta = await this.isUTAEnabled()` was invisible to the hook
   (no printer-side table names an awaited initializer), so every read of such a local kept `isTrue`.

## Rules / passes touched

**ast-transpiler `src/csharpTranspiler.ts` (hotspot)** — two new hook-gated methods + their call sites,
`tests/csharpTranspiler.test.ts` (+4 tests, 2 updated):

- `csharpTernaryConditionOperand(node)` — unwraps `ParenthesizedExpression`, asks the **same**
  `csharpConditionOperandType` hook, answers `bool` bare / `bool?` as `x == true`; `undefined` keeps the
  base path (`printCondition` → `isTrue`). Wired first in `printTernaryCondition`, with the existing
  `csharpConditionPrintsAsBool` fold kept as the fallback (printer-typed bools, multi-declarator edge).
- `csharpNegatedConditionOperand(operand)` — an `Identifier` the hook names `bool?` prints `x != true`;
  wired into `printPrefixUnaryExpression`'s `!` branch. `bool` keeps the base `!x`, an unnamed operand
  keeps `!isTrue(x)`.
- Untyped emission is byte-identical: with no hook installed both methods answer `undefined` (proved by
  `git show HEAD:src/csharpTranspiler.ts` → `npx tsup` → `npx jest tests/csharpTranspiler.test.ts` =
  4 failures, all in the new expectations; 117 pass).

Equivalence: `isTrue(bool?)` is `value == null ? false : value` = `x == true`; `!(x == true)` and
`x != true` are both `bool` (lifted `!=` is true for exactly the null/false pair) — checked for
`null` / `true` / `false`.

**ccxt `build/csharp-local-types.js` (hotspot)** — `retypedDeclarationTypes` (a `WeakMap`) written by
the `installCsharpLocalTypes` declaration wrapper at the exact point it emits `info.type name = value`,
and read first by `installCsharpConditionOperands`. The record **is** the emitted declaration's type,
so the hook can name an awaited-initialized local without mirroring the wrapper's own await/`new`
guards. 15 added lines; no other classifier table changed.

## Census

Campaign census (`campaigns/cs90/census.sh`, `cs/ccxt/exchanges/**`):

```
before (d847892a6fc): locals: object=9304 typed=44132 typed%=82
                      casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
                      params: object=11635  returns: object=1080
                      helpers: isTrue=1434 isEqual=12034 getValue=6761 add=8833 getArrayLength=704
after  (0b52dec784c): locals: object=9304 typed=44132 typed%=82      (unchanged: no declaration or cast moved)
                      casts: identical to before
                      params: object=11635  returns: object=1080
                      helpers: isTrue=1354 isEqual=12034 getValue=6761 add=8833 getArrayLength=704
```

**bool? sites remaining after U14's ccxt-side hook** (U14's classifier copied into this worktree,
measured with `tools/U56/census-boolq.py` — method-scoped `isTrue(<local declared bool?/bool in the
same method>)` sites in `cs/ccxt/exchanges/**`; U14's own tree = 1156 diff pairs, isTrue 1434 → 1074):

| state | isTrue | remaining `isTrue(<typed local>)` | `!(x == true)` |
|---|---|---|---|
| base (no U14, base printer) | 1434 | 63 = 57 bool? ternary + 6 bool ternary | 13 |
| U14 + base printer | 1074 | **107** = 69 bool? ternary + 30 bool? `if`/`while` + 6 bool ternary + 2 bool? `!` | 26 |
| U14 + U56 printer | 978 | 34 = 30 `if`/`while` + 2 `!` + 2 ternary (**all `uta` awaited-init**) | 0 |
| U14 + U56 printer + hook record | 944 | **0** | 0 |

So the printer change closes the ternary half (75 of 107) and the hook record closes the rest (32);
the 3 `isTrue(uta)` left in the tree are **parameter** reads (`pro/bitget#getInstType(object uta)`),
which the hook deliberately does not name. The 22 remaining `!isTrue(x)` sites are operands with no
`bool`/`bool?` declaration in scope (out of family).

## Diff audit

`tools/U56/pair-audit.py --selftest` (5 clean pairs classified, 4 corruptions rejected, an unbalanced
hunk flagged) then `tools/U56/pair-audit.py d847892a6fc`:

```
pairs=155 classes=BQ=24 NOT=13 PAR=61 TQ=57
balanced_hunks=True
```

- **TQ=57** `isTrue(x) ?` / `isTrue((x)) ?` → `x == true ?` (the roster family; 24 of them carry source
  parentheses, e.g. `settleFractionRaw = isTrue((winnerRaw)) ? 1 : 0;`)
- **NOT=13** `!(x == true)` → `x != true`
- **BQ=24** `isTrue(x) ?` → `x ?` — the same ternary fold for a `bool` the classifier typed (the printer's
  own table could not see it); sound knock-on of the one rule
- **PAR=61** `(x) ?` → `x ?` — source parentheses unwrapped on the same `bool` ternary operands
  (`(isV3) ? "api/v3" : "v2"`), required for the `bool?` half and applied uniformly

No `BLOCK` hunks: every changed line is a line whose only difference is one substitution
(155 insertions / 155 deletions, 55 files). Determinism: the full local regen
(`--local npx tsx build/csharpTranspiler.ts --force --rest-and-ws` + `--force --prediction`) twice →
`git diff -- cs/ | sha256sum` = `650aaa4bf0ac2a54…` both times.

`verify-diff.py d847892a6fc`: `files=55 pairs=155 unexpected=155` — the shared gate models
declaration/return/signature/cast pairs only and has no rule for a condition-line rewrite, so all 155
report as UNEXPECTED; they are the four classes above, each an identity on the emitted value.

## Gates

- ast: `npx tsup` clean; `npx tsc -p tsconfig.json --noEmit` exit 0; `npx jest tests/csharpTranspiler.test.ts`
  121/121; the new expectations fail on the base printer (4 failures) — the rule is genuinely new.
- ccxt: baseline first (`--local … --noTests binance bybit okx kraken gate`, `git diff --stat -- cs/`
  empty on the untouched base); scoped regens over the family's ids, then the two full local tiers;
  fixed point as above.
- farm: `ccxt-farm build --targets cs --wait` from the worktree → `HEAD 0b52dec784c job=814 exit=0
  branch_update=unchanged generator=a0c4cd3c5bfbfd5818bf098024b3cb42c04e0f54`; `ccxt-farm log 814
  --step buildCS` = "Build succeeded. 0 Warning(s) 0 Error(s)". `branch_update=unchanged` means the
  farm's own full transpile on the pushed generator reproduced this tree byte-for-byte, so the branch
  carries only `0b52dec784c` (no `[Automated changes]` commit to reset away) and
  `git diff farm/cs90-U56 HEAD -- cs/` is empty.

## Rejected sub-cases

- **`isTrue(<parameter>)` / `isTrue(<member>)` / `isTrue(<call>)`** — the hook names declarations only;
  parameters (`pro/bitget` `object uta`, the tests tier's `ascending`/`strictCheck`) and member reads
  keep `isTrue`. Of the 130 base ternary sites in `cs/ccxt/exchanges`, 80 are native now and 50 remain
  of this shape.
- **`for (...; x; ...)` / `do … while` conditions** — 0 sites in the corpus; the position gate was left
  untouched rather than widened (reject on doubt).
- **`new`-initialized and initializer-less declarations** — the wrapper's rewrite (and therefore the
  record) never fires on them; the hook's existing `new`/`await` guards stay for the fallback path.
- **`!(x == true)` where the operand is not an identifier** (e.g. `!(isLinear && …)` in htx) — unchanged;
  only a hook-named `bool?` identifier gets the `!= true` spelling.

## Residual risk

- The `!= true` / `== true` spellings are new emitted text: 155 lines across 55 files, all proven
  equivalent per class and compiled by the farm (0 warnings, 0 errors). Runtime behaviour is unchanged
  (`bool?` comparison is lifted, null → false/true exactly as `isTrue`).
- `retypedDeclarationTypes` is additive and its effect on the **base** tree is nil (the 155-pair diff is
  identical with and without it — verified); it only fires once U14/U29-style awaited `bool`/`bool?`
  declarations exist. If those units land differently, the hook still answers exactly the emitted
  declaration's type, so the worst case is a redundant `== true` on a `bool` (never a wrong type).
- `PAR`/`BQ` (85 lines) are the same rule's `bool` arm rather than the roster's `bool?` half; they are
  single-token parenthesization/fold changes on lines the ternary unit left in the base printer's shape.

## Tools (campaign dir, not in the repo)

`campaigns/cs90/tools/U56/census-boolq.py` (method-scoped typed-operand census, `--all`),
`census-rev.sh` (census of any rev via `git grep`, no checkout), `pair-audit.py` (4-class pair checker
with `--selftest`).
