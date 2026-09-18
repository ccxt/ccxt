# U59 — native `x[i]` reads on a list receiver the enclosing `for` bounds (1158 sites)

`getValue(x, i)` where `x` is a printed `List<object>` / `IList<object>` local and `i` is the
enclosing `for`'s own `int` index, bound by `x`'s own length → `x[i]`.

## Why the bound proof is mandatory (not a style choice)

`Exchange.TranspileHelpers.cs#GetValue(object, object)` answers **null** for an index off the end
of a list (`if (parsed >= listLength) return null;`, `Exchange.TranspileHelpers.cs:956-966`),
while the C# indexer throws `ArgumentOutOfRangeException`. A negative index throws in **both**
spellings (the helper's `parsed >= listLength` guard does not cover it, the indexer is reached and
throws), so the only divergence to close is `index >= length` — which is exactly what the loop
condition proves. `x[i]` is therefore emitted only where the source guarantees the index in range;
every other read keeps the helper.

## Family / where the change lives

| Layer | Change | `hotspot:` |
|---|---|---|
| ast `src/csharpTranspiler.ts` (`cs90-U59`, sha `040b8173b3a2`) | new `printElementAccessExpression` layer `csharpListIndexRead` + the bound proof (`csharpIndexIsLoopBounded`, `csharpForBoundsIndex`, `csharpIndexBoundIsVoided`, `csharpReceiverUseKeepsBound`, `csharpIdentifierIsWritten`, `csharpLengthReceiverIdentifier`, `csharpIdentifierSymbol`) and the `csharpListIndexReadTypes` stub hook | `hotspot: ast-transpiler src/csharpTranspiler.ts` |
| ccxt `build/csharp-local-types.js` | `installCsharpListIndexReads` — records the type of every emitted declaration line (a `printVariableDeclarationList` wrapper) and answers `csharpListIndexReadTypes` from it | `hotspot: build/csharp-local-types.js` |

No `ts/src` change, no hand-written base change, no new file under `build/`.
Campaign tooling: `campaigns/cs90/tools/U59/{census-u59.py,census-u59-body.py,census-u59-body2.py,audit-u59.py}`.

### The proof (all of it is required)

1. receiver is an identifier whose **emitted declaration line** carries `List<object>` /
   `IList<object>` (recorded while that line was printed, so the printer's own table and this
   module's rewrite are both covered — an awaited initializer the wrapper skips stays `object`);
2. index is an identifier whose emitted declaration line carries `int` (the for-header box), so
   `x[i]` binds the indexer of both receiver spellings and an `object` index keeps the helper
   (`x[i]` would not compile);
3. the read is inside the **body** of an ancestor `for` whose condition is `i < x.length`, both
   sides resolved by **symbol identity** to the very identifiers the read uses (sibling loops that
   reuse `i` cannot answer for each other);
4. `(x as List).length` counts as `x.length` (parentheses and `as T` print the bare expression for
   every T but `any` / `string` / `T[]`); `as any` / `as T[]` keep the helper;
5. nothing in the body can move either name: the index is never a write target (`=`, compound,
   `++`/`--`, destructuring), the receiver is never written, never the receiver of a method call,
   never an argument, never a bare read — only element reads/writes (`recv[…]`) and property reads
   (`recv.Count`) are allowed;
6. a read under a nested function (closure) is not dominated by the condition → rejected.

## Census (campaign `census.sh`, `cs/ccxt/exchanges/**`)

```
before: locals: object=9304 typed=44132 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        params: object=11635  returns: object=1080
        helpers: isTrue=1434 isEqual=12034 getValue=6761 add=8833 getArrayLength=704
after:  locals: object=9304 typed=44132 typed%=82          (unchanged — this unit retypes nothing)
        casts:  identical                                (unchanged — this unit removes no cast)
        params: identical  returns: identical
        helpers: isTrue=1434 isEqual=12034 getValue=5664 add=8833 getArrayLength=704
```

`getValue` calls −1097 on the exchange tiers (6761 → 5664); 1158 occurrences removed over the whole
diff (the extra 61 sit in `cs/ccxt/base/Exchange.BaseMethods.cs` + `cs/ccxt/base/PredictionExchange.cs`,
which the census glob does not cover). **typed_declarations = 0, casts_removed = 0** — this unit's
deliverable is the helper call itself (the roster line asks for the native read, not a box change).

Diff: 159 files, 1144 changed lines, 1158 conversions, `+`/`-` balanced (1144/1144 lines).
Determinism: the full local regen (REST + prediction + base, then `--ws`) run twice gives the same
`git diff | sha256sum` (`9239bfef1e0b…`), i.e. the tree is a fixed point of the rule.

## Gates

* `python3 campaigns/cs90/verify-diff.py d847892a6fc` → `files=159 pairs=1144 unexpected=1144`.
  Expected: the shared gate models declaration-type-only, return-retype, signature-retype and
  *declaration* cast-removal pairs only — a helper call replaced inside a statement is outside its
  grammar (same class as the cs-strict cast-removal families). Every one of the 1144 pairs is
  justified as the single class below; the shared script was **not** edited.
* Unit-local re-derivation audit (independent of the printer, re-derived from the post-image):
  `python3 campaigns/cs90/tools/U59/audit-u59.py --selftest` → `SELFTEST PASS` (flags a mutated
  right-hand side, an added line, an `object`-declared receiver, a receiver mutated in the body, an
  unbounded loop, an index write);
  `python3 …/audit-u59.py d847892a6fc .` → **`files=159 pairs=1144 conversions=1158 problems=0
  residual_qualifying=0`**.
  Every changed line is asserted to be the minus line modulo the read form, and every converted read
  is re-checked against the post-image (receiver declaration, `for (int <idx> = …)` header bounding
  `<idx>` by the receiver's `Count`, clean body). `residual_qualifying=0` means no read that satisfies
  the re-derived shape was left unconverted.
* ast gates: `npx tsc -p tsconfig.json --noEmit` clean, `npx jest tests/csharpTranspiler.test.ts`
  137/137 (19 of them the new U59 block), `npm run lint` 0 errors. The 6 positive U59 tests fail on
  the base printer (`git show 404e9daa:src/csharpTranspiler.ts`) and pass on this one.
* Farm: **job 870, `HEAD 37ec38ea40ee job=870 exit=0 branch_update=fast_forward
  generator=040b8173b3a2d2ba21e730ae2f93dd7d1fa24069`** for sha `14e82a05d55` (the code commit,
  branch `cs90-U59`). The farm's own forced regen also produced the `cs/tests/Generated/**` tier
  (21 files, same shape: `getValue(x, i)` → `x[i]`) and compiled the full C# tree with it.
  After the green build the branch was reset to `14e82a05d55` per the campaign rule, so the unit
  branch carries only its own commits (the farm's `[Automated changes]` commit stays on the farm ref).

## Rejected sub-cases (each with its reason)

| Rejected | Reason |
|---|---|
| `while (i < x.length)` / `for` whose condition is not `<` (incl. `i <= x.length - 1`) | the roster's proof is the enclosing `for`'s own `<` test; no other condition shape is proven |
| read in the loop **header** (initializer / condition / incrementor) | the condition does not dominate it (audit-tested) |
| read inside a nested **function**/closure in the body | the condition no longer dominates the read |
| index written in the body (`i = …`, `i++`, destructuring target) | the value the condition tested is not the value the read uses |
| receiver written in the body (`x = …`, `x.length = n`, `x++`) | the condition tested the previous value |
| receiver is a **method-call receiver**, an **argument**, or a **bare read** in the body | a callee can shrink the list; only `recv[…]` and `recv.Count` are allowed (this is what rejects the 29 candidate loops the textual census flagged) |
| receiver's emitted declaration is not `List<object>` / `IList<object>` | `x[i]` on an `object` receiver does not compile (farm-red, not a silent win) |
| index's emitted declaration is not `int` | e.g. `xt.cs:5522 for (object i = 0; …)` — the classifier leaves that index `object` (another unit's family); the read keeps `getValue(brackets, i)` — the single remaining site the audit's re-derivation still qualifies |
| `(x as any).length` / `(x as T[]).length` | `printAsExpression` casts those, so the printed bound is `getArrayLength(((object)x))` — kept as a helper read by choice (sound, but not this unit's shape) |
| numeric-literal keys (`x[0]`), string keys (`x["k"]`) | owned by the existing native-element-access / typed-dict layers; untouched |
| element **writes** (`x[i] = v`) | owned by the S14 write family (cast path); untouched here — a line with both a write and a read converts only the read |
| one line with two helper reads, only one of them bounded | only the bounded occurrence converts (`prediction/polymarket.cs` `this.extend(getValue(requests, i), response[i])`); the audit models this as a subset replacement |

## Residual risk

* The proof is *local*: a callee that shrinks the list through an **alias** declared outside the loop
  body is not detectable here (the body scan rejects any bare use of the receiver, so an alias can
  only pre-date the loop). Census of the 1084 landed sites: **0** loop bodies declare or assign an
  alias of the receiver (`= recv;`), so the landed set carries none.
* A `null` receiver at runtime: the emitted bound `x?.Count ?? 0` (or `getArrayLength(x)`, which
  answers 0 for null) makes the body unreachable for an `int i` starting at 0, and the TS condition
  `x.length` would already throw — no new divergence.
* `x[i]` throws where `getValue` returned null only if the receiver shrank between the condition and
  the read; every statically visible way to do that is rejected (above).
* The farm's test-tier regen (21 files) is compiled but not committed on the unit branch — the
  integrator's full regen reproduces it.
* **Finding for the integrator (not touched by this unit):** the S14 element-write cast skip
  (`((List<object>)x)[Convert.ToInt32(i)] = v` → `x[Convert.ToInt32(i)] = v`) is currently **dead**:
  `installCsharpStringEquality` overwrites `csharp.csharpLocalTypeOf` with a string-only answer,
  which also disables `csharpReceiverIsDeclaredList` (`x.push (v)`). This unit deliberately used a
  separate hook (`csharpListIndexReadTypes`) instead of re-composing that shared hook, so landing it
  does not resurrect another unit's family.

## Deliverable summary

* ast branch `cs90-U59` @ **`040b8173b3a2d2ba21e730ae2f93dd7d1fa24069`** (pushed to the farm with
  `ccxt-farm push-generator`), ccxt pin set to that sha in the same commit as the code.
* ccxt branch `cs90-U59` @ **`14e82a05d555ce8c26ccd5d5c7b09d0c0de6c805`** — farm job **870 exit=0**.
