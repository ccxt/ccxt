# U08 — `this.safeValue (recv, key, {})` dict-default sites → `this.safeDict` (TS) → `IDictionary<string, object>` locals

**Family.** `ts/src`: `this.safeValue (<identifier receiver>, <literal key>, {})` where the produced
value is used as a **dictionary only**. The call becomes `this.safeDict (...)`, which the C# printer
already types from the existing `safeDict*` table entry (`build/csharp-local-types.js`, the
`safeDict`/`safeDict2`/`safeDictN` → `IDictionary<string, object>` rows). 85 sites in 36 files
(25 REST + 11 pro). C# effect: **71 locals retyped `object` → `IDictionary<string, object>`** and
**14 `((IDictionary<string, object>)…)` casts removed** (the cast form the cs-strict twin family had
left in front of the same `safeValue` call).

**Rules / tables / passes touched.** None under `build/` — no classifier rule, no post-print pass, no
hand-written base file, no ast-transpiler change, no `cs/` file edited by hand. The unit is a TS
source edit plus the regenerated C# tree; the typing itself rides on the classifier's existing
`safeDict` row. `package.json` pin unchanged (`ast-transpiler#404e9daa`).

## The two rules

Per site (`campaigns/cs90/tools/U08/verdict2.ts`, `--list` input `verdict-pair.json`):

* the call initialises a `const`/`let` local with an identifier name (the C# declaration is the
  deliverable — a nested call would not change a declaration),
* the receiver is an identifier (the same receiver class the classifier's own twin family accepts as
  pair evidence; `this.<member>` module state is excluded — `this.options` receivers are the U41
  family, 76 of them),
* **every** use of the local, transitively through `const y = x` copies, is a dict use: a
  string-literal keyed read (`x['k']`), a keyed `safe*` helper read with a string key (or an array of
  string literals for the `*N` variants), or the destination of `extend`/`deepExtend`,
* **no** shape-revealing use anywhere: numeric/computed key (`safeString (x, 3)`, `x[i]`),
  `.length`/`.push`/other list members, `for`-of/`for`-in over the value, `Array.isArray (x)`,
  spread/array literal, object-literal escape (`'info': x`), `return x`, comparison/arithmetic
  (`x === null`, `x !== undefined`, `x ?? d`, `add`), `typeof`, ternary, unknown call argument.

Pair rule — every (`file`, receiver identifier, key literal) pair the site belongs to
(`csharp-local-types.js`'s twin family keys on exactly that pair):

* no `[]` default and no `safeList*` mention for the pair (the file never reads that key as a list),
* no `this.safeValue (recv, key)` mention **without** a default, and
* every other bound dict-default site of the pair passes the per-site rule.

The last two are the reason the delivered set is 85 and not 119: converting a site upgrades the
pair's evidence from `dictDefault` to `dictTwin` for that family (`safeValueTwinCastType`,
`build/csharp-local-types.js` around line 3141), so a sibling that fails the per-site rule — or a
sibling without a default — is then retyped **behind a cast** instead. Reproduced on the wider
variant (119 sites): the generated diff carried 9 `object … = this.safeValue(…)` →
`IDictionary<string, object> … = ((IDictionary<string, object>)this.safeValue(…))` lines, i.e. casts
added on sites this unit's proof does not cover. Those pairs are left to the units that own the twin
rule; the delivered diff contains no line that is not the family.

## Numbers

| | before (base `d847892a6`) | after |
|---|---|---|
| `locals: object` / typed | 9304 / 44132 (82 %) | **9233 / 44203** (82 %) |
| casts `(IDictionary<string, object>)` (spaced spelling) | 127 | **113** (−14) |
| casts `(IDictionary<string,object>)` (unspaced spelling) | 2563 | 2563 |
| `params: object` / `returns: object` | 11635 / 1080 | unchanged |
| other census counters (`isTrue`, `isEqual`, `getValue`, `add`, `getArrayLength`) | — | unchanged |

`cs/` diff: **36 files, 85 changed lines** (85 insertions / 85 deletions) — no base, tests, examples
or pro/base file touched. `ts/src` diff: 36 files, 85 changed lines, each one the single token
`this.safeValue` → `this.safeDict` on a line whose third argument was already `{}` (verified
mechanically: 85/85 minus lines carry `new Dictionary<string, object>() {}` as the default).

Gates run locally:

* `git diff -- cs/` empty after a scoped baseline regen **before** editing (clean base);
* scoped regen `--force --noTests <25 REST ids>` + `--force --ws --noTests <11 pro ids>`, re-run:
  `git diff -- cs/ | sha256sum` = `7e2914ad…` both times (**fixed point**);
* TypeScript 6 type check of all 36 changed files (`extends ./tsconfig.json`, `noEmit`): exit 0;
* `eslint` (repo shim) over the same 36 files: exit 0;
* `python3 campaigns/cs90/verify-diff.py HEAD`: `files=36 pairs=85 unexpected=85` — every pair is the
  `object N = this.safeValue(…)` / `IDictionary<string, object> N = ((IDictionary…)this.safeValue(…))`
  → `… = this.safeDict(…)` family, which the script's whitelist does not model (its DECL rule
  requires the initializer to be byte-equal modulo a cast). Justified as one class here;
* `python3 campaigns/cs90/tools/U08/pair-audit.py HEAD`: `pairs=85 ok=85 T1=71 T2=14 bad=0` —
  reconstructs the plus line from the minus line and requires byte equality (T1 declaration retype,
  T2 cast removal), the `{}` default on the minus line, and equal paren balance. `--selftest` PASS:
  the checker flags a callee swap with the declaration left `object`, a retype with the callee left
  `safeValue`, a kept cast, a mutated argument, a dropped paren, a minus line without the `{}` default
  and an unpaired plus line, and passes both true pair shapes.

## Farm

`ccxt-farm build --targets cs --wait` from the committed worktree:

```
HEAD f3134d57df572b61c6f6f22182c3b6936a90ce62 job=658 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
```

`branch_update=unchanged` is the farm's own repo-wide `--force` transpile reproducing this tree
byte-for-byte, i.e. the committed `cs/` tree is the generator's fixed point (the local scoped regen
did not miss a file).

## Rejected sub-cases

Candidate space = `this.safeValue (<identifier receiver>, <string-literal key>, {})` bound to a local:
**285 sites before the change** (85 converted + 200 rejected). The 200:

| n | reason |
|---|---|
| 94 | **pair reads the same key as a list** elsewhere in the file: a `[]` default or a `safeList*` twin for the same (receiver, key) — e.g. bitget's `response::'data'` is a dict on the ticker endpoints and a list on the candlestick ones, so the exchange's own file contradicts the dict claim |
| 39 | **pair has a `safeValue (recv, key)` sibling without a default** — the twin family would retype that sibling behind a cast once this pair carries a `safeDict` mention (observed: 9 such lines on a wider variant) |
| 18 | **sibling site reads the same local with a numeric or non-literal key** (`safeString (x, 3)`, `x[i]`) — a numeric key is a list operation on the same object (bitfinex `pairObj[1]` rows), so the pair is not dict-only |
| 9 | sibling use is a **spread / array literal** (`[...x]`, `[ x ]`) — that enumerates the value |
| 5 | sibling use is `.length` |
| 4 each | sibling passes the value to `parseOrder` / `parseWsTicker` / `parseBalanceHelper` / `handleMarginModeAndParams` — the consumer body is not provably keyed-only (a row parser may enumerate its input) |
| 3 | sibling use is `safeIntegerProduct (x)` |
| 2 each | sibling use is an **object-literal escape** (`'info': x`), `createSpotOrderRequest (…, x)`, or `Array.isArray (x)` — hollaex/phemex answer `{}` to an `isArray` test, the class the roster calls out: the value is *both* shapes by design there |
| 1 each | sibling use is `typeof`, `parseNumber`, `indexBy`, `createOrderRequest`, a plain assignment, a ternary, `binop:+`, `parseTicker`, `parseWsTrade`, `createSpotOrderRequest#6` |

Outside the candidate space (never convertible, not counted above), over the 419 dict-default
`this.safeValue` calls in `ts/src` (census after the change): **149 whose receiver is not an
identifier** — `this.options` 76 (U41's family) plus `client.subscriptions`, `market['id']`-style
element reads; **28 with a numeric key** (`safeValue (candles, i, {})` loop elements); **98 with a
computed key**; **62 nested** (not a declaration initializer, so no C# declaration changes).
28 files with bound dict-default sites end with 0 accepted sites — the largest: bitbank (8),
digifinex (9), lbank (9), pro/cex (9), p2b (6), pro/bitget (5), pro/deribit (5 of its 6 pair sites
rejected as `pair-has-no-default-sibling`).

## Residual risk

* **Semantic delta (one class, 85 sites).** `safeValue (x, 'k', {})` returns the value for *any*
  non-`undefined` value; `safeDict (x, 'k', {})` returns the value only when it is a dictionary,
  otherwise the `{}` the author already passed as the default. Every accepted site's consumers are
  string-keyed reads only (rule above), whose result on a non-dictionary is `undefined` — identical
  to reading the `{}` — so no accepted site can observe the difference except through a `null` value
  (previously `null`, now `{}`), and no accepted site tests the value against `null`/`undefined` or
  for truthiness (those uses are rejected). This applies to all seven language ports, since the
  change is in the shared TS source; each port's `safeDict` guards with the same dictionary test.
* The **pair veto is keyed on the receiver identifier text + key literal**, exactly like the
  classifier's twin rule. A same-key read under a *different* receiver identifier (e.g. `msg` vs
  `message`) in the same file is invisible to both.
* The generated declaration is sound **by construction** — `safeDict` has no cast on the call path
  (`return defaultValue as IDictionary<string, object>`), so a non-dictionary value yields `{}`/null
  rather than an `InvalidCastException`. Sites the classifier's own guards veto simply stay `object`.
* Not run here: the behavioural suites (`id-tests-cs`, `request-cs`, `response-cs`) — no dotnet on
  this VM; the farm job compiles the C# tree only. The 85 sites are REST/pro request/response paths,
  which those suites would exercise.
* 85 of the roster's ≤386: the remaining 200 dict-default candidates are rejected above; the
  rejections are conservative (no site was accepted on a pair with list evidence or with a sibling
  this rule cannot prove).

## hotspot:

* `ts/src/*.ts` (36 files, 85 one-token edits) — **the hotspot of this unit**: every TS edit is
  shared with js/python/php/go/java/rust generation, so it is kept to a single-token
  `safeValue` → `safeDict` swap on lines already carrying the `{}` default; no other TS token changes
  (`safeDict` is the house-style accessor once the shape is known).
* `build/csharp-local-types.js:3141` (`this.safeValue` twin family) — **not modified**, but it is what
  the pair rule protects: converting a site makes the pair's evidence a `safeDict` twin, so a pair
  with an unprovable sibling is left alone.
* `campaigns/cs90/tools/U08/` — the census/verdict/convert/pair-audit tooling (not committed to
  `build/`).
