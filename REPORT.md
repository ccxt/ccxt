# U60 [AST] — `inOp(x, k)` → `x?.ContainsKey(k) == true` on classifier-typed dict receivers

Roster line: `[AST] inOp(x, "k")` where x is typed IDictionary/Dictionary → `x.ContainsKey("k")`
(prove inOp's dict branch == ContainsKey incl. null receiver) — census + hook.

Worktree `/root/worktrees/cs90/U60`, branch `cs90-U60`, base `d847892a6fcf5699640862316303b6344a3e4daf`.
Paired ast worktree `/root/worktrees/cs90-ast/U60`, branch `cs90-U60`, base (pin) `404e9daa7f0ab58d085ed04aaa61a19546dfeda2`.
**ast commit `b74ddeb909e99c51104e1827fe5669e4c7816769`** (pushed to the farm's pin mirror; `package.json`
in the ccxt commit pins it).

## Result

| | before | after |
|---|---|---|
| locals | `object=9304 typed=44132 typed%=82` | `object=9304 typed=44132 typed%=82` |
| casts | `(string)=2113 (IList<object>)=1922 …` | identical (no declaration or cast changed) |
| params / returns | `object=11635 / object=1080` | identical |
| `inOp(` in `cs/ccxt/exchanges/**` | 787 | 718 |
| `ContainsKey(` in `cs/ccxt/exchanges/**` | 67 | 136 |

`casts_removed = 0`, `typed_declarations = 0` — this family moves no declaration: it replaces a helper
CALL. **84 helper calls removed** (`inOp` → the native member), 40 files: 34 REST exchange sites
(21 files), 28 prediction sites (7), 7 pro sites (5), 6 generated-base sites (2:
`Exchange.BaseMethods.cs` 5, `PredictionExchange.cs` 1), 9 generated-test sites (5).
`git diff <base> -- cs/` = `40 files changed, 84 insertions(+), 84 deletions(-)`, i.e. 84 one-line
pairs and no other line.

## The proof (why the emission is exactly inOp's dictionary branch)

`cs/ccxt/base/Exchange.TranspileHelpers.cs`:

```csharp
public bool inOp(Dictionary<string, object> obj, string key) => (obj != null) && (key != null) && obj.ContainsKey(key);
public bool inOp(object obj, object key) => InOp(obj, key);   // InOp: null obj/key -> false; `obj is IDictionary<string, object>` -> ContainsKey
```

For a receiver whose **emitted declaration** is `Dictionary<string, object>` or
`IDictionary<string, object>` and a key that is already a C# string:

* `x?.ContainsKey(k) == true` — null receiver → `false` (`inOp`'s `obj != null` guard); non-null →
  `ContainsKey`. Identical, including the S58 `inOp(Dictionary<string, object>, string)` overload.
* a **null key** would make a bare `ContainsKey` throw `ArgumentNullException` where `inOp` returns
  false, so for an identifier key (the only key shape the rule accepts besides a literal) the
  helper's own guard is emitted back: `((k != null) && (x?.ContainsKey(k) == true))`. The key is read
  twice, but it is an identifier with no intervening write — same value.
* a string literal key is never null: `(x?.ContainsKey("k") == true)`.

Why the receiver's *emitted* declaration is the proof and not the TS type: the classifier retypes
`object x = …` lines AFTER the printer printed them, and for these receivers the TS checker often
sees `any` (`deepExtend`, `safeDict` results, `in`-guarded copies), so the printer's existing
checker-gated branch (`csharpIsDictionaryType`) cannot fire even though the C# static type is a dict.

## Rules / passes touched

`hotspot:` **`/root/worktrees/cs90-ast/U60/src/csharpTranspiler.ts`** (ast printer, `[AST]` unit):

1. `csharpNativeInExpression` — the two early returns folded into one `if` with the same conditions,
   the same order and the same result (the existing checker path is byte-identical); the new
   fallback arm runs only where that path answers `undefined`.
2. new `csharpDeclaredDictInExpression(key, obj)` — identifier receiver + hook answer containing
   `Dictionary<` + a printed C# string key → the emission above.
3. new `csharpDeclaredStringKey(key)` — the key's string proof, falling back to the classifier's
   `csharpLocalTypeOf` (the S60 isEqual-twin hook) when the printer's own tables name no string.
4. new hook stub `csharpDeclaredDictReceiverType(node)` → `undefined` (next to `csharpLocalTypeOf`).
   Without the ccxt installer the emission is unchanged — proven by regenerating the tree with the
   installer call disabled: the scoped files are byte-identical to the base.

`hotspot:` **`build/csharp-local-types.js`** (new `installCsharpDictInOp`, called from
`installCsharpLocalTypes` after `installCsharpStringEquality` so its `printVariableDeclarationList`
wrapper sees the final line): records the printed declaration text per (enclosing function, name) for
`Dictionary<string, object>` / `IDictionary<string, object>`, answers the hook for an identifier read
when the name has exactly ONE recorded type and passes the isEqual twin's single-binding proof
(`stringEqualityBindingIsProvable`: one binding, single declarator, read after the declaration).
No table (`CSHARP_*`), no other installer and no hand-written base file touched;
`build/csharpTranspiler.ts` and `ts/src` untouched.

## Gates

* **Shared gate**: `python3 campaigns/cs90/verify-diff.py d847892a6fcf5699640862316303b6344a3e4daf`
  → `files=40 pairs=84 unexpected=84`. The shared gate models declaration/return/signature/cast
  pairs only; a helper call replaced by a native member has no rule there (same situation the
  cast-removal units documented). All 84 are one class, re-derived below.
* **Unit-local re-derivation** `campaigns/cs90/tools/U60/verify-inop.py <wt> <base>`: pairs the i-th
  `-` with the i-th `+` of each hunk, rebuilds the expected `+` from the `-` line's `inOp(recv, key)`
  call, then re-reads the POST-IMAGE file and requires the receiver's declaration (parameters +
  earlier declarations of the enclosing method) to be a dict type and an identifier key to be
  declared `string`/`string?`: **`changed line pairs: 84 … PASS`**, buckets
  `51 Dictionary<string,object> ident / 21 Dictionary literal / 9 IDictionary ident / 3 IDictionary literal`.
  `--selftest` (mutates one pair by dropping `?.`) is reported `FAIL`, and a negative control that
  swaps the expected type set (`DICT_TYPES = ('List<object>',)`) fails all 84 — the type check is
  live, not vacuous.
* **Determinism**: re-running `--force --noTests`, `--force --prediction`, `--tests` (and
  `--force --ws --noTests`) leaves the same 84 lines (`git diff --numstat` sum stable).
* **Farm**: `ccxt-farm build --targets cs --wait` on the code tip
  `c054a56003daefa0d465d80273caa0e93aae7a9f` → **job 826, exit=0**, `state=succeeded`,
  `transpile_forced_by=generator`, `generator=b74ddeb909e99c51104e1827fe5669e4c7816769`,
  **`branch_update=unchanged`** (the farm's own repo-wide regeneration equals the committed tree),
  `buildCS` `0 Warning(s) / 0 Error(s)`. `ccxt-farm status 826` is the evidence.
  The only later edit on the branch is this REPORT.md; it changes no build input
  (`git diff <code tip> HEAD -- cs/ build/ package.json` empty) and its own farm job is recorded in
  the handoff.
* ast side: `npx tsc -p tsconfig.json --noEmit` clean, `npx jest tests/csharpTranspiler.test.ts`
  **120 passed** (4 new U60 cases); the positive case fails on the base printer
  (`git show 404e9daa:src/csharpTranspiler.ts` → 1 failed), so the tests pin the new rule.

## Rejected sub-cases

* **`object` receivers stay `inOp`** — 359 `inOp` sites whose receiver is an emitted-`object`
  parameter (e.g. `inOp(market, "base")` in `safeMarketStructure`, `inOp(trade, "side")`) and 69
  object-declared locals: the box is `object`, so no `ContainsKey` exists on the static type and the
  helper's own `is IList` / `is IDictionary` dispatch must stay.
* **Key not a C# string** (22 remaining dict-receiver sites): the printer names no string for the key
  and neither does the classifier record — e.g. `inOp(networks, networkCode)`,
  `inOp(networkIdsByCodes, preferredChain)` (`Exchange.BaseMethods.cs`), `inOp(dataById, baseId)`
  (coinbase), `inOp(futureMarketIdsForSymbols, symbolOrMarketId)` (htx). `ContainsKey` needs a
  `string` argument; a key whose C# type is `object` would not compile.
* **Key is a call / expression** (2 sites): `inOp(fiat, GetValue(market, "quote"))` (bitfinex),
  `inOp(symbolsByOrderId, getValue(first, "id"))` (pro/kraken). The rule accepts only literals and
  identifiers because the null-guarded spelling reads the key twice.
* **Key bound more than once in the enclosing function** — e.g. `limitless.cs:423`
  `inOp(eventGroups, eventKey)` in `FetchMarkets`, where `eventKey` is declared twice (`string?`
  ternary at 418, `string?` from a list at 445): the isEqual twin's single-binding proof rejects, so
  the same shape in a method with one binding (line 3375) converts and this one keeps the helper.
* **String-typed parameters as keys** (bitflyer `FetchOrder`, poloniex `FetchOrderStatus`): the
  printer's tables name locals, not parameters, and the classifier's printed-declaration record
  covers declarations only — kept, conservative (same reason the existing `inOp` path rejects them).
* **`this.<member>` / `client.<member>` receivers** (e.g. `this.orderbooks`, `client.subscriptions`):
  they belong to the printer's existing `CSHARP_NATIVE_FIELDS` / `CSHARP_OBJECT_DICT_FIELDS` path,
  which is unchanged (its spelling is not null-guarded and is out of this unit's family).
* A census of pre-change candidates (`tools/U60/inop-census.py`, 116 dict-receiver sites with a
  literal/identifier key) vs the 84 converted: the difference is exactly the buckets above plus
  sites where the receiver's dict-typed line is recorded but the read precedes the declaration or
  the name is shadowed.

## Residual risk

* The `(k != null)` re-test is redundant where the TS source already guards the key (visible in the
  diff, e.g. `((code != null)) && !(((code != null) && (result?.ContainsKey(code) == true)))`). It is
  the helper's own guard, kept uniform because the printed key type does not always carry
  nullability; it reads an identifier twice with no intervening write.
* A `Dictionary<string, object>` / `IDictionary<string, object>` static receiver can only hold that
  box (the assignment would not compile otherwise), so `ContainsKey` is the same call the helper
  makes; the only behaviour delta is the null receiver, which is `false` in both spellings.
* `csharpDeclaredStringKey` reads the shared `csharpLocalTypeOf` slot (installed by the S60 isEqual
  twin). If a sibling unit re-installs that hook without the string answers, the 18 key-fallback
  sites (of the 84) revert to `inOp` at integration time — a merge-time regression the integrator's
  regen would show, not a correctness risk.
* The rule is hook-gated: with the ccxt installer absent the emission is byte-identical (checked).
  The farm build is the hard gate for the emitted member access (a wrong receiver type is CS1061).
* Volume: 84 sites, all machine-checked against the post-image declarations; the 8 census sites
  labelled `SHOULD-FIRE` in `tools/U60/inop-census.py --rejects` were each spot-checked and are
  correctly rejected (multi-binding key, string parameter key, or an `object`-declared key whose
  name-resolution in the census found another binding).

## Tooling (`campaigns/cs90/tools/U60/`)

* `inop-census.py <tree>` — receiver/key census of every `inOp` site; `--rejects` buckets the
  remaining dict-receiver sites by reason.
* `verify-inop.py <tree> [<base>] [--selftest]` — the pair re-derivation described above.
* `census-ref.sh <ref>` — the campaign census read at a commit (before/after without a second tree).
