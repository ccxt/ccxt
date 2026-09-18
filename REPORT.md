# U20 — `object symbol = add(...)` + `object <name> = add(...)` over an untyped market-row / symbol leaf

Family: `object <local> = <'+' chain>` (printed `object <local> = add(add(...), ...)`) whose leaves are
values whose C# box is a **string or null** but whose printed C# call is `object` — the symbol-code
locals (`bs/base = this.safeCurrencyCode (baseId)` → `string?` box), market-row reads at a
MARKET_ROW_STRING_KEYS key (`market['id'/'base'/'quote'/'baseId'/'lowercaseId'/'symbol']`) and the
string-box locals/calls/literals around them. Roster line U20 (`UNITS.md`).

## Rules / tables / passes touched

**`build/csharp-local-types.js` only.** No `build/csharpTranspiler.ts`, no ast-transpiler source, no
hand-written base file, no `ts/src` edit, no new file under `build/`.

New (≈150 lines, comment block above `addChainLeafBoxType`):

- `addChainLeafBoxType (csharp, node, context)` — the C# box of one `+` operand: `'string'` (never
  null) / `'string?'` (string or null) / `undefined`. Proof shapes: string literal, `x as string`,
  a local this module already declares `string`/`string?` (`localIdentifierType`), a call whose
  printed signature returns `string`/`string?` (`callReturnType`), a `this.<member>` read the base
  types string (`CSHARP_LOCAL_THIS_MEMBER_TYPES`), a **market-row read at a
  MARKET_ROW_STRING_KEYS key** (`marketRowStringReadType`), and an element read of a proven string
  list (`elementAccessElementType` → the value can be null off the end of the list).
- `localValueBoxType (csharp, identifier, context)` — the value box of a local this module leaves
  `object` (`bs = this.safeCurrencyCode (...)`, `baseId = this.safeString (market, ...)`): the join of
  its initializer's proven box and every later write's, with the read/write scan's own resolution
  strictness (one binding referring to this read, a local, single declarator, declared before the
  read, cycle-guarded). A parameter, an ambiguous binding, a missing/unprovable/non-string write and
  an unmodelled write shape (`x++`, `-x`/`+x` ref sinks, `[x, y] = tuple` destructuring, spread,
  for-of/for-in target — `WRITE_TARGET_SHAPES`) all reject.
- `addChainStringBoxType (csharp, declaration, context)` — walks the left-nested `+` tree, requires
  **every leaf** to be a string box, and returns `{ type, cast: 'string' }`. `add(object, object)`
  returns null exactly when its LEFT operand is not a string box and a left-nested chain propagates
  that, so the declaration is `string?` when the **leftmost** leaf can be null and `string` when it
  cannot (a null RIGHT operand concatenates as `""` on both overloads).
- Wire-in: one `else if` in `csharpLocalTypeOf`'s `csharpType === undefined` chain (after the
  market-row bool branch) → `string?/string x = ((string)add(...));`.

Why a cast and not a cast-free `string`: the printed call is `add(object, object)` (its leaves are
`object` locals) so its own C# type is `object`; a cast-free `string` declaration would need the left
leaf's *declared* type to be `string?`, which re-binds that very `add` to `add(string, *)` and turns a
null left (a market with no base code) from `null` into `"prefix..."` — a behaviour change, so it is
rejected. The added `(string)` is the exact identity the market-row / element-read / call-result
families already use: a string box passes through unchanged, `null` in → `null` out.

## Counts

| | |
|---|---|
| typed declarations | **67** (31 `symbol`, 14 `topic`, 6 `channelName`, 3 `messageHash`, 3 `dataType`, 2 `subscriptionHash`, 2 `subMessageHash`, 2 `subHash`, 2 `name`, 1 `rawHash`, 1 `assetPair`) |
| casts removed | **2** (both knock-on, below) |
| identity casts added | 67 (the `(string)` cast-back this family needs; one per typed declaration) |
| changed files / lines | 37 files, 69 lines (67 declarations + 2 knock-on lines) |

Census (`campaigns/cs90/census.sh`, cs/ccxt/exchanges/**):

```
before: locals: object=9304 typed=44132 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
after:  locals: object=9237 typed=44199 typed%=82
        casts: (string)=2179 (IList<object>)=1922 (bool)=1 (object)=671 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
```

`object` locals −67 and typed +67 exactly; `(string)` +66 = 67 added − 1 removed; `(object)` −1 is the
unbox removal below.

## verify-diff.py (HEAD)

```
files=37 pairs=69 unexpected=1
  [PAIR] cs/ccxt/exchanges/pro/cex.cs: - return ((string?)((object)(symbol)));
      + return symbol;
```

The single UNEXPECTED pair is justified: `symbol` is now declared `string?` in the same diff, so
`((string?)((object)(symbol)))` is two identity conversions on a reference-typed value (box/unbox of a
`string?` is a reference conversion — null stays null, no unboxing, no overload change) and
`stringReturnIsTyped` (the module's own boundary-cast gate) drops it. Direction, operand and box are
unchanged; only the redundant cast pair is gone.

## Knock-on lines (2)

1. `pro/cex.cs` — `return ((string?)((object)(symbol)));` → `return symbol;` (above).
2. `mudrex.cs` — `this.safeList(assetTicks, ((string)assetPair).ToLower(), ...)` →
   `this.safeList(assetTicks, assetPair.ToLower(), ...)`: S09's string-receiver cast elision, gated on
   the receiver's declaration (`string?`); string → `.ToLower()` is the same call on the same box.

Neither line moves a value; both are the module's existing passes reacting to a newly typed
declaration.

## Rejected sub-cases (with reason)

1. **A later write of the chain's own local — 41 of the 74 `object symbol = add(...)` sites.** The
   dominant shape is `symbol = add(add(symbol, ":"), settle);` after the declaration (binance.cs:5338
   with three writes at 5344/5347/5351, onetrading.cs:596, okx.cs:2773, gate.cs:2554, bybit.cs:3105,
   kucoin/bitget/delta/coinbase/…). Typing `symbol` `string?` re-binds that later `add` from
   `add(object, object)` to `add(string, *)`, so a null `symbol` (a market whose base code is absent)
   would become `":"+settle` instead of `null` — a behaviour change. `csharpLocalIsSafeToRetype`'s
   left-`+`-operand rule rejects the declaration and the site keeps `object`. (A cast-free `string`
   declaration is not available for the same reason: `bs` stays `object`.)
2. **A later READ as the left operand of `+` — 2 more symbol sites with no later write**
   (zebpay.cs:1973 `{ "symbol", add(add(symbol, ":"), settle) }`, and the read inside the same
   expression class): same overload-move veto, no write needed.
3. **A leaf written by a destructuring assignment** (`pro/binance.cs:1427/1530` `rawHash` — leaf
   `name`; `pro/kucoin.cs:394/450` `topic` — leaf `method`): the tuple print is
   `name = nameparametersVariable[0];` (an element read of the hand-written
   `handleOptionAndParams` result), whose box the leaf scan cannot model → the leaf rejects. (This
   rule was added after a first pass typed pro/kucoin's two `topic` sites wrongly; the corrected rule
   is in the committed diff.)
4. **A leaf that is a `List<object>` element read** (`bithumb.cs:1294` — `quote` from `quotes[i]`;
   `pro/okx.cs:2366` — `getValue (marketIds, i)`): the element is the caller's data; naming it needs
   the receiver-side list proof, which is roster U02/U03's family, not this one.
5. **A leaf that is a parameter or an unproven call** (`pro/bybit.cs:1928` `method` — same
   destructuring class as 3; venue-helper call leaves stay with U19): rejected; a parameter's box is
   whatever the caller passed.
6. **The S63 static twin does not help**: for a `Dictionary<string, object>` receiver the market-row
   read prints `GetValue(market, "id")`, whose declared return is `object` (`Exchange.TranspileHelpers.cs`),
   so the chain's own type stays `object` and the leaf can only be named through the `(string)` cast —
   no typed overload can be added for `GetValue(Dictionary, string)` (the receiver is a
   `Dictionary`-typed local, the argument a literal key; both already bind the twin).

## Dedupe / ownership note (for the integrator)

Roster U20 says "pairs with U19 … add the leaf proof locally … the integrator dedupes". This unit adds
the leaf proof locally: the market-row/symbol leaf box (`addChainLeafBoxType`'s ElementAccess case +
`localValueBoxType`), which is the part U01/U02 own as *declaration* rules. Nothing was rebased; the
leaf proof here is limited to what the `+` chain needs (a box of "string or null").

Overlap with U19 is by **mechanism, not by name**: U19's lever is the cast-free route ("the typed
`add(string,string)` overload binds → `string`"), which needs every leaf to be *statically* string;
this rule only fires where `csharpTypeOfValue` returned `undefined`, i.e. exactly where the leaves are
statically `object` (`GetValue(market, "id")`, an `object` local with a `string?` box). A site
U19's mechanism can type is therefore never claimed here, and a site claimed here cannot be typed by
U19's mechanism (the leaf's printed type is `object`, so `string` would not compile without the cast).
29 of the 67 sites carry U19-shaped names (`topic`/`channelName`/`messageHash`/`subMessageHash`/
`subHash`) but all of them have a market-row operand and an `object` leaf, so they are the "`object
<name> = add(...)` where an operand is a `getValue (market/…)` read" half of the U20 roster line.

## Residual risk

- The 67 added declarations move `object` → `string?`/`string` behind an identity cast. Every cast is
  exact for a string box (null included) and every leaf's box is proven by the module's own tables
  (safeCurrencyCode/safeString `string?`, MARKET_ROW_STRING_KEYS values, `string`/`string?` locals,
  string literals). A leaf that is a non-string box at runtime would make the cast throw — the same
  inputs would already throw inside `add(object, object)`'s `(string)b` branch, and the type tables
  are the ones the tree already relies on for the same reads.
- The read sites of the retyped locals were audited (dict-literal values, `((IList<object>)l).Add(x)`,
  `this.market/safeMarket(x)`, `inOp(this.markets, x)`, `add("lit", x)`, `((IDictionary…)d)[(string)x] = v`,
  `this.watch/subscribe/unWatch(...)` whose parameters are `object`): no string-vs-object overload
  exists next to any of them (`isEqual`/`isTrue` have a single `(object, object)` form,
  `add(string, *)` accepts a `string?` right operand identically). No `x.Split/.Length/.ToUpper`
  receiver, `delete`, `throw`, `ref` sink, destructuring target or `+=` write is among them.
- The `string` (non-null) declarations (2, `pro/kucoin.cs`) rely on the leftmost leaf being a
  non-null string box; the value is then non-null on every path (concatenation of two string boxes
  with a non-null left can never be null), including the null right operand case.
- Volumes are beyond hand-verification for the mkdir-style parseMarket bodies, but the change class is
  mechanical: 67 declarations, 2 cast lines, all paired and audited by `verify-diff.py` plus the
  per-site leaf audit in `tools/U20/` (every leaf's emitted declaration is `object` + a `string?`
  producer, `string`, or `string?`).
- Not run locally (dotnet is farm-only): the compile and runtime gates are the farm build for the
  sha recorded in the unit summary.

## Gates / evidence

- BASELINE: scoped regen on the untouched tree → `git diff -- cs/` empty.
- Fixed point: full REST (104 ids) + pro (76 ids) + prediction (7 ids) forced regen → the changed set
  is exactly the 37 files below (nothing else moves); a repeat of the scoped regens reproduces the
  same diff (`sha256` of `git diff -- cs/` identical before/after).
- `python3 campaigns/cs90/verify-diff.py HEAD` → `files=37 pairs=69 unexpected=1` (the pair above).
- Farm (`ccxt-farm build --targets cs --wait`): see the farm line below.

## hotspot

None — the BRIEF's hotspots are `build/csharpTranspiler.ts`, ast-transpiler `src/`, and the
hand-written base files; this unit touches only `build/csharp-local-types.js`.

## Farm

```
(codesha)  ccxt-farm build --targets cs --wait   ->  job=<J1> exit=0   [code tree]
(final tip) ccxt-farm build --targets cs --wait  ->  job=<J2> exit=0   [REPORT.md-only delta]
```
