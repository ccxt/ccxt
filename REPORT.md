# U03 — `getValue(data|rows|results|response|result|entry|item|row, i)` element reads of list receivers

Family: UNITS.md U03, roster line only. Branch `cs90-U03`, worktree `/root/worktrees/cs90/U03`, base
`d847892a6fcf5699640862316303b6344a3e4daf` (PR #30530 head, ast-transpiler pin `404e9daa`).
NOT an `[AST]` unit — nothing in `/root/ast-transpiler`, no pin change, no `ts/src` edit, no
hand-written `cs/ccxt/base|ws` edit, no other language moved.

## Result: 1 site typed, 0 casts removed

The roster line's own warning holds: this family is **element reads of a list receiver, and the
element of a `List<object>` is `object` by contract** — so the whole element side is a written 0
(evidence below), and the only provable part is the *receiver-side copy*. Exactly one such copy was
provable in the corpus:

```
cs/ccxt/exchanges/btse.cs:3629   object rows = this.safeList(response, "data");
                              -> List<object> rows = this.safeList(response, "data");
```

One declaration-type-only pair, one file. The initializer is `let rows = this.safeList (response,
'data') as any;` in `ts/src/btse.ts:3267` (fetchPositions, whose `response` IS the implicit API's
`List<object>`); the twin in `fetchTrades` (`ts/src/btse.ts:1745`) is rejected — see the table.

```
$ python3 campaigns/cs90/verify-diff.py HEAD
files=1 pairs=1 unexpected=0
```

## Census

```
before: locals: object=9304 typed=44132 typed%=82
after : locals: object=9303 typed=44133 typed%=82      (object -1 / typed +1)
casts : (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334
        (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        — unchanged; this family inserts no cast (the named type is the initializer's own C# type)
params: object=11635  returns: object=1080  (unchanged)
```

Family sizes measured on the base tree, tooling in `campaigns/cs90/tools/U03/`:

| measure | count | script |
|---|---|---|
| numeric-index element reads tree-wide (`object <name> = getValue(<recv>, i)`) | 1177 | `census-u03.py` |
| …receiver already `List<object>` / `IList<object>` (element `object` by contract) | 754 | `census-u03.py` |
| …receiver declared `object` (56 of them inside the U03 receiver set) | 395 | `census-u03.py` |
| **STRICT family** (receiver ∈ {data,rows,results,response,result,entry,item,row}, declared name ∈ entry\|item\|row\|raw*) | **104** | `census-u03.py` |
| …of which receiver is `List<object>` (77) / `IList<object>` (2) | 79 | `census-u03.py` |
| …receiver `object` (20) / `Dictionary<string, object>` (3) / `IDictionary<string, object>` (2) | 25 | `census-u03.py` |
| family sites on the TS side (checker run, exchange+pro+prediction trees) | 99 | `tscheck-family.txt` |
| …TS element type `any` | 78 | `tscheck-family.txt` |
| …TS receiver not even an array (numeric index on an untyped/Dict receiver) | 19 | `tscheck-family.txt` |
| …TS element a TS-only interface (`OpenInterest`) / `Dict` | 1 / 1 | `tscheck-family.txt` |
| `object <x> = this.safeList* (…)` receiver copies (5 exchange-tree + 1 base-tree) | 6 | `receiver-copies.py` |

## The rule (what this family can and cannot name)

1. **The element box is not provable (0 typed).** `getValue(<list>, i)` prints an element read of a
   `List<object>`/`IList<object>` receiver, whose static type is `object`. Naming a box there means
   **inserting** a runtime cast (`(IDictionary<string, object>)`, `(string)`, …) that throws on any
   element of another shape — the exact failure class the round's rule 1 forbids. The "the later use
   is exclusively a dict helper" heuristic is **not** a shape proof: the value is whatever the wire
   put in the JSON array, and the corpus carries counter-examples of the same read shape holding a
   *list* — `cs/ccxt/exchanges/binance.cs:15871` `object entry = getValue(byLimit, i);` immediately
   indexes it (`getValue(entry, 0)` / `getValue(entry, 1)`), and bybit's
   `object entry = getValue(grouped, marketId);` is walked with `getArrayLength(entry)` +
   `getValue(entry, j)`. The TS checker agrees: 78/99 family sites have element type `any` and 19
   more have a receiver that is not an array at all, so no annotation justifies a cast either.
2. **The receiver copy is provable — and one was left untyped.** `object <name> = this.safeList*
   (…) [as any]` receives exactly the producer's own `List<object>` (the hand-written/retyped
   `safeList/safeList2/safeListN` C# signatures — `CSHARP_LOCAL_THIS_RETURN_TYPES`). The one gap was
   the printer's `((object)…)` box: a TS `as any` prints `((object)x)` (`printAsExpression`), and
   `dropRedundantObjectBoxCasts` strips it back only for an `object n = …` target, so
   `csharpTypeOfValue` sees an `AsExpression(any)` and answers `undefined` for the whole
   declaration. Naming the box moves no value (an `as` assertion is compile-time-only; the identity
   upcast is erased) and every later write is still re-scanned.

## Changed rule (`build/csharp-local-types.js`, +56 lines — no other file)

* `SAFE_LIST_PRODUCER_CALLS` + `asAnySafeListReceiverCopy(initializer)` — an `AsExpression(any)`
  whose operand is `this.<safeList|safeList2|safeListN>(…)`, answering that name's
  `CSHARP_LOCAL_THIS_RETURN_TYPES` box (own-key lookup only). Deliberately **not** a general
  `as any` unwrap: the corpus holds 9 `let x = <expr> as any` declarations, 7 of which are not list
  producers (pro-luno's `safeString (bidask, thirdKey) as any`, the prediction `market as any` /
  `orderbook['bids'] as any` template values) and keep `object`.
* one clause in `csharpLocalTypeOf` (`csharpType === undefined && asAnySafeListReceiverCopy !==
  undefined` → `csharpType`, `stripObjectBox = true`) and `stripObjectBox` on the returned info.
* one 5-line block in the `installCsharpLocalTypes` declaration wrapper: when `stripObjectBox` is
  set and the printed value is exactly `((object)…)`, the identity wrapper is dropped so the emitted
  line is a declaration-type-only pair. The regex is anchored and the flag is only ever set by the
  rule above, so no other family can reach it.

Everything else — the use scan (`csharpLocalIsSafeToRetype`), the write join
(`typeFromValueOrWrites`), the printer and every post-print pass — is untouched; a site the scan
rejects keeps `object` (and is therefore not a diff line).

## Rejected sub-cases (with reason)

| N | sub-case | reason |
|---|---|---|
| 79 | family element reads whose receiver is declared `List<object>` / `IList<object>` (77 + 2) | the element is `object` by contract; a named element type would insert a throwing downcast. See the counter-examples above. |
| 78 | family sites whose TS element type is `any` (checker) | no box exists to name; the receiver's own TS annotation says nothing about the element. |
| 19 | family sites whose TS receiver is not an array at all (`response[i]` / `data[0]` on `any` or `Dict` receivers) | the numeric index is a keyed read of an untyped value; nothing is provable from any side. |
| 1 | `binance.cs:16839` `object item = getValue(result, i)` — TS element type `OpenInterest` | `OpenInterest` is a TS-only interface: the C# runtime box is the `Dictionary<string, object>` row that `ccxt.BaseExchange.ToOpenInterest(item)` converts. Typing it `ccxt.OpenInterest` would add a cast that throws on every real element. |
| 1 | `cs/ccxt/exchanges/pro/gate.cs:986` `object rawTicker = getValue(results, i)` — TS element type `Dict` (`let results: Dict[] = []`) | the *only* genuinely provable element box in the family, and still a reject here: the proof is a TS-side annotation on a local, not a proof about the C# box (`results` is `List<object>`: `safeList(message, "result", [])` + `[rawTicker]`), so it needs a per-site runtime proof of the annotation — the checker-element mechanism the roster assigns to U06 (`isObjectLiteralType`), not to this unit. Left for U06/the integrator, with the site recorded here. |
| 1 | `btse.cs:1916` `object rows = this.safeList(response, "data")` (fetchTrades twin) | the same method later writes `rows = response;` and its `response` is the venue's `object response = null;` (`let response: NullableDict = undefined`) — the write can box a Dictionary, so `List<object>`/`IList<object>` is not assignable there. |
| 2 | `binance.cs:14964` `leverages` / `binance.cs:17403` `assets` (`object … = this.safeList(response, "positions", new List<object>() {})`) | `if (Array.isArray (response)) { leverages = response; }` writes the same `object response` local — the write is unprovable (same reject as above), so the join keeps `object`. |
| 1 | `pro/bybit.cs:2240` `object rawOrders = this.safeList(message, "data", new List<object>() {})` | the later write `rawOrders = this.safeValue(rawOrders, "result", rawOrders);` boxes whatever the wire put at `result` (its default is an *identifier*, so the safeValue-twin family cannot name it either). |
| 1 | `bitget.cs:11748` `object bills = this.safeList2(data, "bills", "list", new List<object>() {})` | the later write `bills = this.filterByArray(bills, …)` is unprovable *today*: `filterByArray` is the hand-written helper U31 retypes to `List<object>` in this round. This site becomes typed with U31's change, not with U03's — deliberately left alone (it is U31's table entry, and a duplicate here would collide on the same file). |
| 1 | base tree: `cs/ccxt/base/Exchange.BaseMethods.cs:2906` `object fees = this.safeList(container, "fees")` (`ts/src/base/Exchange.ts:5192`) | blocked by a copy chain, not by the producer: `fees = reducedFees` / `reducedFees = this.reduceFeesByCurrency (fees)` joins through a local whose own declaration is `object` (its initializer is a read of `fees` itself), so the write-join returns `undefined`. A fixpoint-shaped write join is a different mechanism; also outside the unit's `cs/ccxt/exchanges/**` scope. |
| 2 | `okx.cs:10063` / `xt.cs:5425` `entry = getValue(data\|response, i)` — the two cleanest "the later use is exclusively dict" sites in the strict family (each read with `this.safeString (entry, …)` and handed to a dict-shaped parse helper, `parseGreeks` / `parseMarketLeverageTiers`) | still a reject: an inserted `(IDictionary<string, object>)` cast throws on any non-dict element, and the corpus has the same read shape holding lists (counter-examples above). The use pattern is a heuristic, not a proof. |
| — | `getValue(<dict-typed receiver>, <numeric literal>)` sites (3 `Dictionary<string, object>` + 2 `IDictionary<string, object>` receivers inside the family set) | a keyed read on a dictionary receiver; the value type of `Dictionary<string, object>` is `object` too, and the dict-receiver families are U04/U06/U10 (receiver-keyed). |

## Residual risk

* The change types **1 declaration and inserts no cast**, so it cannot change a runtime value: the
  initializer is byte-identical and the named type is the initializer's own C# static type
  (`List<object>` from `safeList`'s signature); the only touched token is the declared type of the
  local, plus the printer's erased `(object)` identity wrapper.
* `rows` can be null (the two-argument `safeList` returns its `null` default), which the reference
  local spelling already allowed; the later `(rows == null)` branch and `rows = response` are
  unchanged, and CS8600-style nullable-assignment warnings are covered by the csproj `NoWarn` list
  the campaign relies on (the farm's `buildCS` reports 0 warnings).
* The element side stays `object`; no site in the family gains a cast, so no new
  `InvalidCastException` surface is introduced by this unit. The one rejected "provable element"
  (pro/gate `rawTicker`) is documented above and remains `object`.
* The census is textual/regex over the emitted C# plus the TS checker for the element side; the
  strict family was measured twice (C# 104 sites, TS 99+9 base) and both numbers are in the tooling
  output. Sites the strict filter does not cover (other receiver or local names) belong to the
  sibling `i`-keyed units (U02/U04/U06).

## Hotspots

* `hotspot: build/csharp-local-types.js` — the shared classifier: one named-constant list, one
  predicate (`asAnySafeListReceiverCopy`), one `csharpLocalTypeOf` clause and one declaration-wrapper
  block (`stripObjectBox`). All four are keyed on the safeList* names and the `as any` shape, so a
  sibling unit touching `csharpTypeOfValue`/`csharpLocalTypeOf` merges mechanically; the
  `stripObjectBox` field is inert (`undefined`) for every other family.
* no `build/csharpTranspiler.ts`, no ast-transpiler src, no hand-written `cs/ccxt/base|ws` file, no
  `ts/src` file was touched (no bridge twins, no pin bump, no other-language output).

## Gates

* Baseline first: full local regen on the untouched tree (`--force --noTests` + `--force --ws
  --noTests`) → `git diff --stat -- cs/` empty. Every run below is `ccxt-perf-slot.sh --local`
  (the worktree links the pinned ast checkout, so scoped/full regens run locally).
* After the edit: `--force --noTests` (REST+prediction), `--force --noTests --ws` (pro) and
  `--tests` (base+exchange+ws tests) → the whole tree is regenerated, diff is the single
  btse pair.
* Determinism / fixed point (`regen-check.sh`): four forced regenerations
  (REST, REST, WS, prediction) each produced the identical
  `git diff -- cs/ | sha256sum` = `029ce00fbe12f8b3bb322ef373a27ec430930ef43ff5500c1147fadda24c2f3d`
  — 1 file changed, 1 insertion, 1 deletion.
* `verify-diff.py HEAD` → `files=1 pairs=1 unexpected=0` (no UNEXPECTED line to justify).
* Farm (compile gate; `dotnet` is never run locally):
  `ccxt-farm build --targets cs --wait` for the code+report commit — see the Farm block below.

## Farm

```
$ ccxt-farm build --targets cs --wait          # for the code+report commit
HEAD bf835f3333d1c12b2cc2b3b037cd6e4d9e300b6f job=688 exit=0 branch_update=unchanged
     generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2

$ ccxt-farm status 688
{"job": 688, "source": "bf835f3333d1c12b2cc2b3b037cd6e4d9e300b6f",
 "state": "succeeded", "exit_code": 0, "targets": "cs", "skipped_exchanges": 0,
 "branch_update": "unchanged", "failing_step": "", "failing_files": []}

$ ccxt-farm log 688 --step buildCS --tail 25
  Build succeeded.
    0 Warning(s)
    0 Error(s)
```

`branch_update=unchanged` is the fixed point: the farm's own regeneration of the committed tree
produced no changes, and `buildCS` compiled the whole solution (ccxt + tests + cli) with 0 warnings.
The report-carrying tip is gated the same way below (the only delta over `bf835f3333d1c` is this
file).

```
$ ccxt-farm build --targets cs --wait          # for the tip that carries this report
```

## Tooling (nothing new under `build/`)

`campaigns/cs90/tools/U03/`: `census-u03.py` (family + receiver census, method-scoped),
`receiver-copies.py` (the `object <x> = <producer>(…)` gap census), `tscheck-family.txt` (+
`tscheck-family-clean.txt`, the raw TS-checker element-type evidence, collected through a temporary
env-gated hook that is **not** part of the commit), `dict-heuristic-counterexample.py`,
`same-file-both-shapes.py`, `regen-check.sh` (+ its log), `census-after*.txt`,
`receiver-copies-out.txt`.
