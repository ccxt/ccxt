# U30 — ccxt.BaseExchange.From* typed-core funnel: typed overloads + typed funnel locals

**Family.** `ccxt.BaseExchange.From<Family>(…)` / `From<Family>List(…)` — the reverse converters
`build/csharpTranspiler.ts#wrapTypedCoreConsumers` wraps around every consuming
`await this.<typed core>(…)`, plus the hand-written funnel identities in
`cs/ccxt/base/Exchange.TranspileHelpers.cs`. Roster line U30 (254 locals; the tree carries 283
`object` funnel declarations + 62 in other positions = 345 funnel mentions).

**Result: 282 funnel locals typed (254 exchanges + 28 base), 5 knock-on declaration retypes,
0 casts removed, 138 knock-on helper rewrites, farm-green.**

## What changed

1. `build/generateTypedCoreHelpers.py` (+45 lines) — emits, for every family in `emit_from`
   (74 families), the typed overloads `From<X>(X value)` and `From<X>List(List<X> values)`
   next to the existing object helpers, plus a 5-line header note. `typed_from_box()`,
   `emit_typed_from()`, `emit_typed_from_list()`.
2. `cs/ccxt/base/Exchange.TypedCores.cs` (+745 lines, **generated** by the script above;
   `python3 build/generateTypedCoreHelpers.py` reproduces it byte for byte) — 148 typed
   overloads. Purely additive: 0 deletions.
3. `hotspot: cs/ccxt/base/Exchange.TranspileHelpers.cs` (+22 lines, hand-written base) — the same
   typed twins for the three hand-written funnels that still returned `object`
   (`FromDictList(List<Dictionary<string, object>>) -> List<object>`,
   `FromOHLCVList(List<OHLCV>) -> List<object>`,
   `FromOHLCVDict(Dictionary<string, Dictionary<string, List<OHLCV>>>) -> Dictionary<string, object>`).
   `FromDict`, `FromInt64`, `FromStringValue`, `FromStringList` already carried their typed
   twin (S56); `FromOHLCVList`/`FromOHLCVDict` needed one because the `--ws`/`--prediction`
   tiers reach them.
4. `build/csharp-local-types.js` (+145 lines) — the classifier rule, no printer change:
   - `csharpTypedCoreFunnelTypes()` reads the typed overloads from
     `cs/ccxt/base/{Exchange.TypedCores,Exchange.TranspileHelpers}.cs` — the files the C# compiler
     compiles — into a `helper -> box` table (148 entries, one box each; the object-only overloads
     are skipped by the `param != object`/return-in-box-set gate).
   - `csharpFunnelFiles(node)` / `csharpFunnelFileContent(file)` / `csharpFunnelHelper(content,
     name, core)` confirm the site on the venue's own generated file (the previous run's output;
     the base classes are printed from `Exchange.nooverloads.<pid>.ts`, so that suffix is stripped
     before the lookup).
   - `typedCoreFunnelType(csharp, declaration)` = the box, wired as the first branch of
     `csharpLocalTypeOf`'s `csharpType === undefined` chain; every later-write join and the
     `csharpLocalIsSafeToRetype` scan then apply exactly as for any other candidate type. No cast
     is emitted: the printed call already carries the overload's return type.

**No `build/csharpTranspiler.ts` change, no ast-transpiler src change, no `ts/src` change.**

## Why overloads (and not a retyped `FromX(object)`)

`FromX(object)` must keep its non-matching pass-through arm — `FromTyped`'s runtime switch,
`AwaitAsObject`'s reflective rebox, the hand-written PredictionExchange call sites and
`cs/tests/FromTypedReboxTest.cs` (which asserts `ReferenceEquals` for an already-untyped list)
all rely on it. Retyping the single helper would force a cast on the pass-through path and throw
where the untyped box flowed on (the `omit` failure class). The typed overload is the sanctioned
route (BRIEF: "keep the `(object, …)` overload; C# picks the most specific"):

- **Every generated family is a C# `struct`** (census over `Exchange.Types.cs` /
  `PredictionTypes.cs`: 81/81 families, none generic), so for `FromX(X value)` the object
  overload's `value is X` test is *always true*: the matching arm is the only reachable one and
  its result is the fresh `new Dictionary<string, object>()` the reachable box is read from.
  (`typed_from_box()` still skips any family whose matching arm returns a box it cannot name.)
- `FromXList(List<X> values)` — a null list takes the object overload's null arm and the cast
  passes null through, a non-null `List<X>` always takes the arm that builds `new List<object>`.
- The bodies delegate (`return (Box)FromX((object)value);`) so there is exactly one conversion
  implementation; the struct round-trip is the same box/unbox the call site performed before.
- Overload resolution is unambiguous: for a `X` argument the `X` overload wins over `object`
  (identity beats boxing), for `List<X>` the `List<X>` overload wins; an `object`/`IList<object>`
  argument still binds the object overload, so `FromTyped`, `AwaitAsObject` and the rebox test are
  untouched.

## Call-site verification (every funnel call site)

`campaigns/cs90/tools/U30/verify-funnel-sites.py` resolves the awaited call's static C# type for
every `ccxt.BaseExchange.FromX(await this.<core>(…))` site through the venue class chain (file →
`ccxt.<id>` → `Exchange` → base files, plus a reported GLOBAL fallback):

- 345 sites, 283 of them `object <name> = …` declarations (254 in `cs/ccxt/exchanges/**` pro
  files included, 28 in the generated base, 1 in the hand-written `cs/ccxt/ws/Exchange.WsBridge.cs`).
- **0 mismatches**: every site's awaited wrapper `Task<T>` maps to exactly the box the bound
  helper returns (`Dictionary<string, object>` 180, `List<object>` 143, `Int64` 16, `string` 5,
  `List<string>` 1 across all sites).
- Boxes of the 282 retyped locals: Dictionary 142, List<object> 119, Int64 15, string 5,
  List<string> 1.

## Diff audit

`campaigns/cs90/tools/U30/audit-diff.py` classifies every changed line pair (0 unexpected):

| class | lines |
|---|---|
| funnel declaration retype (`object x = FromX(…)` → box) | 282 |
| knock-on declaration retype (copy / write-join over a now-typed funnel local) | 5 |
| `getArrayLength(x)` → `x?.Count ?? 0` (nativeListHelperCalls, receiver now `List<object>`) | 39 |
| `getValue(x, "k")` → `GetValue(x, "k")` (S63 typed-dict twin) | 14 |
| additive typed overloads (`Exchange.TypedCores.cs` 745 + `Exchange.TranspileHelpers.cs` 22) | 767 |

`python3 /root/.hermes/profiles/deepseek/campaigns/cs90/verify-diff.py HEAD` →
`files=91 pairs=340 unexpected=972` (exit 1). `tools/U30/verify-inventory.py` enumerates the
unexpected entries: **767 additive `+` lines + 152 BLOCK entries** (both from the two helper
files — the unit's deliverable) and **53 PAIR entries = 39 `getArrayLength` + 14 `getValue`
rewrites**. Every one of the 53 is justified:

- `x?.Count ?? 0` is exactly `getArrayLength(x)` for a `List<object>` receiver (`null → 0`, else
  `Count`); the pass is the documented `nativeListHelperCalls` post-pass and the retype of the
  receiver is what exposes it. 2 of the 39 sit on one long line (both replacements on it).
- `getValue(x, "k")` is the object wrapper `public object getValue(object a, object b) => GetValue(a, b);`
  — the call is the same call; S63's static twin takes the object overload's dict branch and nothing
  else, and the receiver is a proven dictionary local (its string/IsArray branches are unreachable).
- The 5 knock-on declarations: 3 copies of a now-typed funnel local
  (`depositAddressesRaw` → `depositAddresses` cryptocom, `chainsIndexedByIdRaw → chainsIndexedById`
  gate, `responseRaw → response` okx) and 2 write-joins (`goodTillBlock = this.safeInteger (…)`
  joined with `goodTillBlock = add (latestBlockHeight, 20)`, dydx cancelOrder/cancelOrders). All are
  declaration-type-only; the copy/join machinery is the campaign's own.

## Determinism

- `git diff -- cs/ | sha256sum` = `5eadabb0b1132b84aab56bb25ba5ea9cd560c2ad07c4ccf07880c9f7ab2eb8dc`
  identical before and after a second full scoped regen (`--force --noTests <48 rest ids>` +
  `--force --ws --noTests <31 pro ids>` + `--force --prediction --noTests <7 prediction ids>`),
  so the rule is a fixed point over its own output (it confirms the funnel on that output).
- The id lists are the 86 venue ids whose committed output carries a funnel declaration
  (`git grep` on HEAD); the farm's forced transpile of the committed tree reported
  `branch_update=unchanged`, i.e. the scoped regen equals the full-repo regen.
- `npx tsx build/csharpTranspiler.ts --tests` leaves `cs/tests` byte-identical (no `git status`
  entry).

## Rejected sub-cases

1. **Retyping `FromX(object)` itself** — the pass-through arm is load-bearing (rebox test,
   `FromTyped`, `AwaitAsObject`); rejected in favour of typed overloads.
2. **`cs/ccxt/ws/Exchange.WsBridge.cs:321`** (`object orderBook = ccxt.BaseExchange.FromOrderBook
   (await this.FetchRestOrderBookSafe (…))`) — stays `object`: the file is hand-written, the
   classifier never runs on it and the local is never printed. 1 of 283.
3. **`FromTyped(object)`'s switch arms** — untouched: they pass a statically `object` value, which
   still binds the object overloads (verified by the build + `--test`).
4. **`FromDictList(List<object>)` twin** — not added: the printer emits `FromDictList` only for a
   `List<Dictionary<string, object>>`-typed core (`typedCoreFromHelper`), so no call site can pass
   a `List<object>` into the funnel; the object overload keeps that shape.
5. **Sub-cases the classifier's scan rejected** — none: every one of the 283 sites passed
   `csharpLocalIsSafeToRetype` (the 28 base-file sites were unreachable only because the base is
   printed from `…nooverloads.<pid>.ts`; that suffix is stripped in `csharpFunnelFiles`).
6. **Families without a nameable matching box** (`typed_from_box` → None) — none in the current
   table (0 `wholeinfo` families in `emit_from`); a future one keeps its object-only funnel until
   its field type is a nameable box.
7. **`cs/tests`, `examples/cs`, `ts/src`** — untouched (the funnel never appears in the test tier:
   the generated tests hold the exchange in a local/parameter, and the classifier's rule needs a
   venue source file).

## Residual risk

- The rule confirms the funnel on the venue's **previous** generated file. If a funnel site moves
  or its pass conditions change in a way that removes the funnel while the on-disk line still
  matches, the declaration would name a box the emitted call does not carry — a **compile error**
  (CS0266/CS0029), never a silent runtime break, and the farm build is the gate. The reverse
  (table gains a type, on-disk file has none) only loses coverage.
- The `name + core` match is file-scoped: a second local with the same name awaiting the same core
  in another method of the same file is retyped too. The pass funnels every *consuming* site of a
  typed core, so the emitted call carries the same box; a consuming site inside a method the pass
  does not visit (not `public async … Task`) would fail to compile instead.
- The typed overloads add one boxing round-trip for the generated families at the funnel call
  sites: identical to the box/unbox every call site performed before (the argument was passed to
  a `(object)` parameter), so no new allocation in the hot path beyond the delegation.
- Runtime lanes: the farm's `--test` lane (`testCS` = base tests) was run for completeness on a
  throwaway branch (job 772, exit=1) and **fails identically on the campaign base commit
  `d847892a6fcf5699640862316303b6344a3e4daf`** (job 775, exit=1): `Tests.BaseTest.MultithreadTest`
  performs a live `okx GET https://www.okx.com/api/v5/public/instruments` and the farm has no route
  to it (`ccxt.NetworkError … Resource temporarily unavailable (www.okx.com:443)`). Every other step
  of both jobs exited 0, so that red is environmental and pre-existing, not this unit's. The
  static request/response/id lanes (`npm run *-cs`) run in CI, which has network.

## Farm

- code sha `238edc4146d65e92f4d21eb1ef9aeba34c82a53d` (the only commit that touches build input)
- `ccxt-farm build --targets cs --wait` →
  `HEAD 238edc4146d65e92f4d21eb1ef9aeba34c82a53d job=765 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`
- job 765 steps all exit 0: `resolve-generator`, `restore-mtime`, `pre-transpile`,
  `transpileCS` (35 s, the forced full-repo regen — `branch_update=unchanged`), `buildCS` (30 s),
  `stage-cs`, `discard-rest`. `buildCS` log:
  `ccxt -> ccxt.dll` / `cli -> cli.dll` / `tests -> tests.dll` / `Build succeeded. 0 Warning(s) 0 Error(s)`
  — the whole solution (library, cli, generated tests) compiled against this tree.
- `branch_update=unchanged` is also the completeness proof for the scoped local regen: the farm's
  forced transpile of the committed tree (all tiers) reproduced it byte for byte.
- This REPORT.md commit is a REPORT-only tip on top of that sha (a gate that touches no build
  input).
