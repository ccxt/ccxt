# cs90 U48 — `((IList<object>)x)` casts: drop the identity casts

Unit: roster line U48 (UNITS.md §J). Base `d847892a6fcf5699640862316303b6344a3e4daf`, branch `cs90-U48`,
worktree `/root/worktrees/cs90/U48`. Sibling cast units: U46 (`((IDictionary<string,object>)x)["k"] = v`),
U47 (`((string)x)`), U49 (`((object)/(Int64)/(Dictionary)/(List<object>)x)`) — nothing here is keyed on
those targets.

`casts_removed = 1552`, `typed_declarations = 0`. Diff vs base: 155 files, +1719/−1554
(`build/csharpTranspiler.ts` +167/−2, the rest 154 generated `cs/` files, 1552 deletions of cast tokens).

## Family

Every `((IList<object>)…)` cast in the generated tree (1922 on the base). A cast is an **identity** —
and therefore droppable — exactly when the receiver's emitted static C# type already IS
`List<object>`/`IList<object>`: the cast names the box the value is in, and the member the printer
reached through it resolves on the declaration itself. 455 casts are left in place, each with a
proof of unsafety (see Rejected sub-cases).

## Rules / passes touched

- **`build/csharpTranspiler.ts` (hotspot, +167/−2)** — the post-print list pass
  (`nativeListHelperCalls`, the S15 helper→native pass) now also drops the identity cast. New:
  - `CSHARP_IDENTITY_LIST_CAST` — `((IList<object>)NAME)` in front of `.Add(`, `[`, `.ToArray()`,
    `.First()`, `.Last()`. Only those five: they resolve identically on both spellings.
    `.Reverse()/.Sort()` are **List INSTANCE** methods (void, in place) where the cast spelling
    reached the Linq extension — they are deliberately not matched.
  - `CSHARP_ORDERBOOK_CACHE_CAST` — the same identity around the hand-written ws cache,
    `((IList<object>)(x as ccxt.pro.OrderBook).cache).Add(v)` and its doubly-cast spelling.
  - `csharpIdentityListCasts(region, lists, temps)` — the rewrite, on the same masked method
    regions the S15 pass uses.
  - `csharpTempHolderListTypes` / `csharpTempHolderListType` / `csharpAwaitedType` — the
    destructuring-holder proof (below).
  - `csharpFileReturnTypes` — method name → declared return type from the emitted signatures of ONE
    file; a name the file declares twice with different return types answers nothing.
- **No** `build/csharp-local-types.js` change, **no** `ts/src` change (generator-side only → no other
  language moves), no new file under `build/`.
- Tooling: `campaigns/cs90/tools/U48/` (`census_ilist_casts.py`, `census_stringlist_receivers.py`,
  `census_shapes.py`, `census_temps.py`, `pair-audit.py`).

### The two receiver proofs

1. **A binding the enclosing method declares a list.** `csharpTypedListReceivers` (S15) collects
   params + single-declarator locals + `foreach` + bare declarations of the method region and keeps a
   name whose declared type is **exactly one** type and that type is `List<object>`/`IList<object>`.
   Same proof, same map, as the `getArrayLength(x)` → `x.Count` family — so the two can never
   disagree about a receiver.
2. **A destructuring holder** (`var <name> = <initializer>`; the printer's `const [a, b] = f()`).
   `var` is the compiler's inference, so the holder's static type is the initializer's:
   `this.M(…)` → `M`'s declared return type **in the same emitted file**; `await this.M(…)` → the
   `Task<T>` argument; `new List<object> …` / `….ToList<object>()` → `List<object>`. A name the
   region binds with two different producers answers nothing. Anything the text does not prove (a
   base helper, another tier's method, a conditional) keeps the cast.

`(x as ccxt.pro.OrderBook).cache` is `IList<object>` on the hand-written cache
(`cs/ccxt/ws/OrderBook.cs:22` interface, `:33` class), so that member read needs no cast either.

### Why the printer-side hook did not already do this

The pinned printer already asks `csharpReceiverIsDeclaredList` in `printArrayPushCall`
(ast-transpiler `src/csharpTranspiler.ts`, "the cast is an identity conversion on such a receiver"),
and `build/csharp-local-types.js` installs the answer — but **three installers overwrite the same
`csharpLocalTypeOf` hook** (`installCsharpListCastSkips` → `installCsharpElementAccessCastSkips` →
the string-equality / typed-dict-element installers), so the list arm is not the one in force and
every `x.push(v)` still printed its cast. That is why 1222 identity `.Add` casts survived S11/S15.
The post-print layer is the right place for this unit anyway: it reads the **emitted** declaration
line, which is the fact the proof is about (a printer-side prediction can disagree with the
classifier's rewrite; the emitted text cannot). Reported, not fixed here — the hook collision is
another unit's surface.

## Census

```
before  locals: object=9304 typed=44132 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334
               (IDictionary<string,object>)=2563 (Int64)=133 (List<object>)=102
after   locals: object=9304 typed=44132 typed%=82
        casts: (string)=2113 (IList<object>)=455 (bool)=1 (object)=672 (Dictionary<string, object>)=334
               (IDictionary<string,object>)=2563 (Int64)=133 (List<object>)=102
```

`(IList<object>)` 1922 → 455. The 1467 exchange-tree removals plus 85 in the generated base files
(`Exchange.BaseMethods.cs` 81 → 11, `PredictionExchange.cs` 17 → 2) = **1552**. By shape:

| removed shape | count |
|---|---|
| `((IList<object>)NAME).Add(v)` — NAME a declared list | 1305 |
| `((IList<object>)NAME)[i]` — NAME a proven destructuring holder | 234 |
| `((IList<object>)(x as ccxt.pro.OrderBook).cache).Add(v)` | 13 |

## Verification

- **BASELINE FIRST**: scoped forced regen on the untouched tree → `git diff --stat -- cs/` empty.
- **Determinism**: `sha256(git diff -- cs/)` = `c1fcad7d265afe92…` identical across three full
  regens (REST `--force --noTests` + `--ws --force --noTests`) — the tree is a fixed point of the
  pass, not a stale-disk artifact.
- **`verify-diff.py d847892a6fcf…`** → `files=154 pairs=1552 unexpected=1552` (rc=1). Every
  UNEXPECTED line is the same class: an inline cast removal that does not head a declaration or a
  return, which `verify-diff.py` has no rule for (its `ok_decl_cast_removal` models the
  `T x = (T)f()` shape only). Justified as one class, and replaced by a dedicated audit:
- **`tools/U48/pair-audit.py --selftest`** → PASS: the checker accepts the three legal deletions
  (declared list `.Add`, temp-holder index read, the doubly-cast `.cache`) and flags a mutated
  argument, a retargeted receiver, an added statement and a no-op line.
- **`tools/U48/pair-audit.py --rederive d847892a6fcf…`** → `pairs=1552 failures=0`,
  `rederive: casts checked=1552 failures=0`. The re-derivation is a second, independent
  implementation (Python, from the emitted tree) of the proof: for every deleted cast the receiver's
  declared type in the enclosing method of the new file is `List<object>`/`IList<object>`, or a
  proven destructuring holder, or the `.cache` member read. A pair that is anything but
  "minus line with exactly one cast token deleted" fails it.
- **Farm** (`ccxt-farm build --targets cs --wait`, code tip `1f561af91e0ed8b492d43aecd47f985d7dce7ec7`):
  **job 802, exit=0**, `branch_update=unchanged`, `generator=404e9daa…`, `buildCS` =
  `Build succeeded. 0 Warning(s) 0 Error(s)`. `branch_update=unchanged` is the farm's own repo-wide
  force-regeneration reproducing this commit's tree byte-for-byte. The dotnet build is also the
  independent proof of the *declaration* claim: a receiver that is not really a list has no
  `.Add`/indexer and the build would be CS1061/CS0021 red. The REPORT.md-only tip was gated the same
  way: **job 809, exit=0, branch_update=unchanged** (same tree modulo this file — no build input).
- Tests tree: `--force --tests` regen → `git diff -- cs/tests` empty (the generated tests are emitted
  by the worker path, which does not run the post-print chain), so the checked-in tests stay a
  fixed point.

## Rejected sub-cases (455 casts kept, with the reason)

1. **194** destructuring holders whose callee is declared **`Task<object>`** — `handleUTAAndParams`
   (76), `handleAccountIndex` (52), `handlePortfolioAndParams` (24), `handleNetworkIdAndParams`,
   `requestWalletHistoryRows`, `signAndCreateOrder`, `signAndCancelOrder`, `watchTopics`,
   `watchPublic`, `watchMultipleWrapper`, …: `var tmp = await this.handleUTAAndParams(…)` is
   statically `object` (`cs/ccxt/exchanges/bitget.cs:3619 public async virtual Task<object>
   handleUTAAndParams(…)`), so the cast is a **downcast** and dropping it is CS0021 (`object` has no
   indexer). The fix is the producer retype (U28/U33 return-path family), not a cast drop.
2. **151** holders whose callee is not declared in the same file: `watchMultiple`,
   `createOrderRequest` / `parseCreateEditOrderArgs` in the pro tree (declared in the REST partial),
   `lighterSign*` (declared in `lighter.cs`, called from `pro/lighter.cs`),
   `base.handleMarginModeAndParams`, `await promiseAll(…)` (base helper). A text pass that reads a
   *sibling* generated file is unsound — the sibling may be rewritten by the same run — so these
   keep the cast. Most are `Task<object>`/`object` anyway.
3. **8** holders whose callee is declared `object` (`this.safeValue(…)` etc.) — downcast.
4. **59** receivers declared `object` (34 `.ToArray()`, 24 `.Add`, 1 `.First()`): `object result =
   this.safeValue(response, "result", …)`, `object ids = …` from a dict index read, `parseJson`
   results. The cast is a real unbox (it throws where the untyped box flowed on); the fix is a typed
   producer (U08/U10/U39).
5. **20** receivers that are CALL results — `((IList<object>)getValue(result, side)).Add(…)`,
   `((IList<object>)GetValue(request, "base")).Add(…)`, `((IList<object>)((object)
   (this.filterBySymbolSinceLimit(…))))`: `object` by contract, no proof.
6. **14 + 2** unbound/ambiguous receivers: the name is not declared in the enclosing region as one
   type (`result` in `poloniex.cs:2105`, `grouped` in `prediction/myriad.cs:3229`,
   `AMBIG(Dictionary<string, object>, List<object>)` in `pacifica.cs:4063`,
   `AMBIG(IList<object>, object)` in `myriad.cs`). No proof → keep.
7. **6** multi-line / composite operands: `((IList<object>)((IDictionary<string,object>)
   orderedEntries)["bids"]).Add(…)` (a dict index read), `((IList<object>)(response), …)`,
   `((IList<object>)new List<object>() {…})` inside `String.Join`. `object` receivers.
8. **1** `ccxt.pro.ArrayCache` receiver (`pro/krakenfutures.cs:952`, a `[i] = v` write): the static
   type is a list-typed class but is not spelled `List<object>`/`IList<object>`, and an index WRITE is
   the S21/S22 index-write family's surface.
9. **`List<string>` receivers — 0 sites** (`tools/U48/census_stringlist_receivers.py` over the whole
   tree): no `((IList<object>)x)` cast sits on a `List<string>` / `IList<string>` / `string[]` /
   `object[]` receiver. The rule is a veto, not a live site: `List<T>` is **invariant**, so
   `((IList<object>)someListOfString)` compiles (List<T> is unsealed) and throws
   `InvalidCastException` at run time — such a cast can never be an identity, and the pass's rule
   (declared type exactly `List<object>`/`IList<object>`) keeps it.

## Residual risk

- The proof is textual (the emitted declaration), not compiler-checked by the pass itself. The farm's
  force build is the backstop and it is green with 0 warnings: a receiver without `.Add`/an indexer
  fails the build.
- `CSHARP_ORDERBOOK_CACHE_CAST` names a hand-written member. If `ccxt.pro.OrderBook.cache` is ever
  narrowed, the farm build goes red (loud, never silent).
- The temp rule only reads the same file's signatures. A venue helper whose declared return type is
  later changed away from a list makes the pass stop firing (safe direction); the reverse cannot
  happen under C# typing.
- `((IList<object>)tmp)[i]` → `tmp[i]`: `List<T>.this[int]` for a `List<object>` receiver, the
  `IList<object>` indexer for the interface — same element, same `ArgumentOutOfRangeException` on a
  bad index, same behaviour on a write.
- Volume: 1552 rewritten lines, all machine-checked (pair audit + re-derivation); the 13 `.cache`
  sites and a sample of the 234 index reads were read by hand.

## Hotspot

`hotspot: build/csharpTranspiler.ts` +167/−2 — the post-print pass chain (`nativeListHelperCalls`),
2 new regex constants, 5 new methods. No ast-transpiler change (this is a ccxt-side unit).
