# Java declaration tools (JN-24 campaign instrumentation)

DEV TOOLS — not wired into any published build. **Safe to exclude from release PRs**;
they exist so the JN-24 parent can verify every agent's self-reported numbers and catch
a merge that silently alters runtime code.

| file | purpose |
| --- | --- |
| `java-decl-tools-lib.mjs` | shared tokenizer/normalizer (types → `«T»`, checkcast stripping, paren normalisation) |
| `java-local-type-census.mjs` | census of generated Java local declarations by declared type |
| `java-decl-paircheck.mjs` | validates that a diff's `-`/`+` pairs are declaration/signature-only (plus required casts/imports) |
| `java-decl-paircheck-selftest.mjs` | injects known-good and known-bad changes into a scratch repo; proves the validator flags every bad one |

## Census

```bash
node build/java-local-type-census.mjs                      # human table, default scopes
node build/java-local-type-census.mjs --json out.json      # machine-readable dump
node build/java-local-type-census.mjs --compare base.json  # delta table vs a saved dump
node build/java-local-type-census.mjs --by-file            # top files by local count
node build/java-local-type-census.mjs --root <dir>         # custom scope (repeatable)
```

Counts **local declarations** (declaration lines at brace depth ≥ 2) by declared type,
plus method return types and checkcast types, for: `exchanges/` (top level), `exchanges/pro/`,
`exchanges/prediction/`, `java/tests/src/main/java`, `java/lib/src/test/java`.

### Baseline — commit 853ab685540 (branch base of the campaign)

| scope | files (gen) | locals | returns | casts |
| --- | --- | --- | --- | --- |
| exchanges/ | 208 (208) | 64,307 | 85,630 | 86,306 |
| exchanges/pro/ | 152 (152) | 24,271 | 36,546 | 86,599 |
| exchanges/prediction/ | 14 (14) | 5,308 | 4,269 | 4,141 |
| java/tests/src/main/java | 115 (112) | 1,719 | 378 | 322 |
| java/lib/src/test/java | 30 (0, hand-written) | 576 | 65 | 83 |
| **TOTAL** | **519 (486)** | **96,181** | **126,888** | **177,451** |

Local declarations by declared type (top): `Object` 67,907 · `String` 9,742 ·
`java.util.Map<String,Object>` 8,615 · `java.util.List<Object>` 3,564 · `Long` 2,213 ·
`Boolean` 1,476 · `var` 801 · `Double` 674 · `java.util.LinkedHashMap<String,MarketInterface>` 222.

Machine-readable baseline: `java-local-type-census-baseline-853ab685540.json` (+ `.txt`).

## Pair-check validator

```bash
node build/java-decl-paircheck.mjs --base <rev> [--worktree <dir>] [--paths java/]
node build/java-decl-paircheck.mjs --diff saved.diff [--strict] [--json out.json]
```

Exit codes: `0` clean · `1` violations · `2` usage error. Per-pair categories:

* allowed — `OK_TYPE` (pure declared-type change), `OK_CAST` (type + checkcast),
  `OK_RECEIVER_PAREN` (cast-inserted receiver/ternary parens), `OK_IMPORT`, `OK_ANNOTATION`
* warn (`--strict` promotes to violation) — `COMMENT_CHANGE`
* violation — `VALUE_CHANGE`, `UNPAIRED_ADD`, `UNPAIRED_REMOVE`,
  `CAST_TERNARY_SUSPECT` (cast bound to a ternary condition — the bug that shipped once),
  `FILE_ADDED`, `FILE_DELETED`

Known deliberate limits: casts are assumed intended unless they match the
cast-ternary-condition shape; class-reference swaps between capitalised names read as
type changes; the comment/blank classes are warnings, not hard failures.

## Evidence

* **Self-test (`node build/java-decl-paircheck-selftest.mjs`): 23/23 PASS.** A scratch git
  repo gets 10 known-good mutations (decl retypes, signature changes, receiver casts,
  ternary-operand casts, imports, whitespace) → all exit 0; 10 known-bad mutations (number,
  string literal, identifier, statement removal/addition, swapped ternary arms, cast-ternary
  bug, argument value, helper swap) → all exit 1 with the expected category; comment change
  → warning by default, violation under `--strict`; mixed good+bad → exactly the bad change
  flagged. A checker that reports "0 problems" is only trusted after this run.
* **Calibration on merged PR #30367** (`git diff 853ab685540^ 853ab685540 -- java/`,
  268 files, 21,444 pairs): 21,242 pairs = declaration/cast-only; 203 flags — **all
  verified real non-declaration changes** (194 `safeValue`→`safeList`/`safeDict` swaps
  present in the same PR's `ts/src` diff; a `section`→`api` rename, a `return null`→
  `return false`, and the Limitless header-key block — all ts-regeneration syncs). Zero
  normalisation false positives.
