# U37 — venue-local generated helpers: return-path proofs

Branch `cs90-U37` (flat, farm refuses slashes) · base `d847892a6fcf5699640862316303b6344a3e4daf`
(PR #30530 head) · ast-transpiler pin `404e9daa7f0ab58d085ed04aaa61a19546dfeda2` (unchanged — this is
**not** an `[AST]` unit) · code commit `06bd8b7df5f322a6448af4d3f50a083eeb1ed243`.

## Family

| callee | sites typed | mechanism | new declaration type |
|---|---|---|---|
| `this.isLinear` / `this.isInverse` | 12 | name-keyed bool table (call site only; the definitions already print `bool` from the `: boolean` annotation) | `bool` |
| `this.liquidations` (7 ws `object cache = …` reads) | 7 | hand-written field retype + `CSHARP_LOCAL_WS_MEMBER_TYPES` | `ccxt.pro.ArrayCache` |
| `this.parseTokenAndFeeTemp` (woo / woofipro / modetrade) | 9 | `CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION` (per declaration; `return fee;` of a `Dictionary` local) | `Dictionary<string, object>` |
| `this.convertFromRawQuantity` (bitmex) | 6 | **new** per-definition numeric proof `CSHARP_LOCAL_SAME_FILE_NUMERIC_RETURNS` (4 `this.parseNumber(...)` paths) | `double?` |
| `this.convertToRealAmount` (bitmex) | 5 | `CSHARP_METHOD_RETURN_TYPES` + boundary cast; caller census below | `string?` |
| `this.fromEp` / `fromEv` / `fromEr` (phemex + pro override) | 18 | `CSHARP_METHOD_RETURN_TYPES` + boundary cast; caller census below | `string?` |
| `this.signOrder` (nado / derive) | 4 | `CSHARP_METHOD_RETURN_TYPES` (both declarations return their own `signHash`, whose add chain boxes a string) | `string?` |
| `this.retrieveCredentials` (dydx) | 5 | `CSHARP_COLLECTION_RETURN_METHODS`; hand-written `retrieveDydxCredentials` stub retyped | `IDictionary<string, object>` |
| `this.createOrderRequest` (dydx / pacifica / lighter) | 3 | `CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION` **extended to a set of admissible boxes** per name | `List<object>` |

**79 locals typed** (= the census delta over `cs/ccxt/exchanges/**`; 69 are the roster's sites, 10 are
same-method knock-ons: `feeCost`/`after`/`costString`/`feeRateString`/`baseVolume`/`amount`(bidask) and
the `object cost/amount = null` pair in bitmex `parseOrder`), **19 declaration signatures retyped**
(18 in `cs/ccxt/exchanges/**` + 2 hand-written base members), **5 casts removed**, plus 5
`getValue → GetValue` typed-receiver rewrites, 15 `isTrue(x) → x` (bool) rewrites and 1
`getArrayLength(x) → x?.Count ?? 0` (List receiver). 148 changed line pairs, 21 files.

## Census (`campaigns/cs90/census.sh`)

```
before: locals: object=9304 typed=44132 typed%=82   returns: object=1080  helpers: isTrue=1434 getValue=6761 getArrayLength=704
after:  locals: object=9225 typed=44211 typed%=82   returns: object=1061  helpers: isTrue=1419 getValue=6754 getArrayLength=703
```

`object` locals −79, typed +79; `returns: object` −19 (the retyped signatures); `getValue` −7
(5 dydx typed-dict reads + 2 from the retyped `parseTokenAndFeeTemp`/`retrieveCredentials` receivers);
`getArrayLength` −1.

## Gate output

`python3 campaigns/cs90/verify-diff.py HEAD` → `files=21 pairs=148 unexpected=33` (27 unexpected
pairs + one `BLOCK` of 1 removed / 4 added lines). Every one is one of the justified classes below —
0 unexplained lines:

1. **`cs/ccxt/base/Exchange.Options.cs`** (1) — `public object liquidations;` →
   `public ccxt.pro.ArrayCache liquidations;`. Hand-written base field; verify-diff's `DECL` regex
   needs an `=`, so a bare field retype is reported. Writers census: `Exchange.BaseMethods.cs:390`
   (`= null`, same shape as the already-typed `orders`/`myTrades`) and 8 × `this.liquidations =
   new ArrayCache(limit)` (pro binance/bitmex/bybit×2/gate/lighter/okx×2). Reads: `isEqual(…, null)`,
   `filterBySymbolsSinceLimit(this.liquidations, …)` (single `object` parameter), the 7 retyped locals,
   and `cs/tests/Generated/Base/test.afterConstructor.cs` (`isEqual(exchange.liquidations, null)`).
   No other writer or reader exists in `cs/**`.
2. **`cs/ccxt/base/Exchange.cs`** (BLOCK, 1 removed / 4 added) — the hand-written
   `retrieveDydxCredentials` stub (`public object …` → `public Dictionary<string, object> …`) plus its
   3-line rule+proof comment. The body is a single `throw`, so it has no return path to carry a cast;
   the Dictionary spelling is what lets dydx's `credentials` local join its `safeDict` initializer
   (IDictionary) with that write. Precedent: the same file already carries hand-written stub types.
3. **binance `isTrue(x) → x`** (15 pairs) — the existing isTrue-on-a-bool rewrite
   (`Exchange.TranspileHelpers.cs:227`, "S58 identity twin: a statically bool argument is this same
   value"); the argument became `bool` in this diff.
4. **dydx** (7 pairs) — 2 × `((IDictionary<string,object>)credentials)[…] = …` → `credentials[…] = …`
   (cast removal on the retyped local) and 5 × `getValue(credentials, "privateKey")` →
   `GetValue(credentials, "privateKey")` (`Exchange.TranspileHelpers.cs:899`: "typed twin of
   GetValue(object, object) for a receiver the C# printer proved is a string-keyed dictionary … the
   same null-safe ContainsKey-then-indexer read").
5. **woo / woofipro / modetrade** (3 pairs) — `((IDictionary<string,object>)fee)["cost"] = feeCost;` →
   `fee["cost"] = feeCost;` (cast removal on the retyped `Dictionary` local).
6. **lighter** (1 pair) — `int totalOrderRequests = getArrayLength(orderRequests);` →
   `orderRequests?.Count ?? 0` (the documented helper→native rewrite for a `List`-typed receiver:
   null → 0, else `Count`).

All other pairs are declaration retypes, signature retypes (`object` → concrete, verified by the
`SIG` rule), or `return ((T)((object)(x)))` boundary casts — accepted by verify-diff.

## Farm

* `06bd8b7df5f322a6448af4d3f50a083eeb1ed243` — **job 820, exit=0**, `branch_update=unchanged`,
  `generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`. `branch_update=unchanged` is the full-tree
  fixed point: the farm's forced regeneration of every exchange, the base and the tests tree
  reproduced this commit byte-for-byte.
* This REPORT-only tip is gated by the same command (`ccxt-farm status <tip-sha>`; job id in the unit
  summary).

## Rejected sub-cases (with proof)

* **`this.createOrderRequest` okx** (`okx.cs:4653`) — the local is later written
  `request = new List<object>() {request};` (the batch-order wrapper): a `Dictionary` + `List<object>`
  join is not box-identical, so the declaration keeps `object`. (okx's own definition IS retyped
  `Dictionary<string, object>` by the by-declaration proof, so its C# call already returns the dict.)
* **`this.createOrderRequest` paradex** (3 sites: `2239`, `2307`, `2378`) — every one is later written
  `request = await this.signOrderRequest(request)`, and paradex's `signOrderRequest` is the generated
  `Task<object>` core (`paradex.cs:2146`); an `object` write cannot join the Dictionary proof.
  Retyping `signOrderRequest` is the async-core family (`CSHARP_ASYNC_CORE_RETURNS`/`VENUE_TYPED_CORES`),
  not this unit's roster line.
* **`this.convertFromRawQuantity` pro/bitrue** (5 sites: `488`, `618`, `756`, `844`, `845`) — the
  declaration's return paths are `return undefined`, `return rawQuantity` (the caller's own box) and
  `return rawQuantity * (contractSize as number)` (an add over an object parameter). No single box can
  be named, which is exactly why the name-keyed numeric table rejected the name (see the comment at
  `CSHARP_NUMERIC_RETURN_TYPES`); the per-definition proof leaves the declaration `object` and its
  call sites unchanged (verified: `cs/ccxt/exchanges/pro/bitrue.cs` is not in the diff).
* **`this.convertToRealAmount` param-passthrough path** — accepted only with the caller census below;
  had one caller passed a non-string the family would have been rejected outright (the path is a hard
  unbox: `((string?)((object)(amount)))`).
* **`this.liquidations` sibling `myLiquidations`** — same shape in `pro/binance.cs` (2 sites) but not on
  this unit's roster line; left to its owner (no proof of unsafety, just ownership).

## Caller censuses behind the two param-passthrough families

`convertToRealAmount` (bitmex only, 11 call sites, all in `cs/ccxt/exchanges/bitmex.cs`): `887`
(`rawQuantity`, itself only ever a `safeString*` result / `qty` / `remaining` — see below), `1297/1298`
(`string? free/total`), `1738` (`string? amountString`), `1751/1760` (`object feeCost/after` whose only
writes are `safeString` results and this call), `1767` (`Precise.stringAbs(amountString)`), `1946/1948`
(`string? amountStringAbs/feeCostString`), `3160/3161` (`this.safeString(position, …)`). The one
indirect argument, `convertFromRawQuantity`'s `rawQuantity` parameter, is passed only `safeString`
results at its 8 call sites (`1415`, `2099`, `2270`, `2405` + the self tail-call `894`), `string? qty`
(`2398/2401`) and `string? remaining` (`2443`).

`fromEp` / `fromEv` / `fromEr` (49 call sites, all in `phemex.cs` + `pro/phemex.cs`): every argument is
a `safeString`/`safeString2` result, a `string?`-typed local (`amountEv`, `priceString`, `amountString`,
`lastString`), `this.omitZero(this.safeString(...))` (hand-written `string?` overload) or a local whose
only writes are those shapes (`object amount = this.safeString(bidask, amountKey)` — the local is typed
`string?` by this same diff). No call site outside those two files exists in `cs/**`.

## Residual risk

* The three `CSHARP_METHOD_RETURN_TYPES` families (`fromEp/fromEv/fromEr`, `convertToRealAmount`,
  `signOrder`) now unbox on every return path. For `signOrder` the box is a string on both
  declarations' single path (their own `signHash` add chain over `padHex`/`intToBase16`/literals), so
  the cast is an identity. For the two param-passthrough families the cast throws for a non-string
  argument: the census above covers every in-tree call site (closed corpus — the tree is regenerated
  from the same `ts/src`), but a *future* caller passing a number/null-boxed value would throw where
  the untyped box flowed on. These are internal helpers (no generated public wrapper calls them with a
  user value).
* `retrieveDydxCredentials` is a throw-only hand-written stub, so its retype is inert at runtime; if a
  venue ever implements it for real, the type must be re-proved (the C# dydx path is documented as
  unsupported in that file).
* The per-declaration table now accepts a **set** of boxes for a name
  (`createOrderRequest: [Dictionary, List]`). The change is backward compatible (single strings are
  wrapped by `declarationMappedTypes`), but it does widen a shared proof path
  (`methodReturnsProveCollection` / `declarationCollectionReturnType` / `byDeclarationCollectionReturnIsProven`):
  a future venue whose declaration proves the *second* box would now print it. The full-tree regen
  (REST + ws + prediction, all 104+76+7 ids, `--force`) is the blast-radius check: only the 5
  `createOrderRequest` declarations named here changed.
* `liquidations` as `ccxt.pro.ArrayCache` rests on the writer census; a venue that stored a list there
  would now be a compile error (which is the desired failure mode) or a runtime cast failure in
  `callDynamically(cache, "append", …)` (unchanged path).
* Test tier: `--tests` + `--baseTests` regens produced **no** changes, i.e. no generated test mentions
  these names as producers; `examples/cs` untouched.

## hotspot: lines

* `build/csharp-local-types.js`
  * `CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION` — `createOrderRequest` value is now an array
    (~line 1045) + `declarationMappedTypes` / `declarationCollectionReturnType` /
    `byDeclarationCollectionReturnIsProven` (shared collection machinery, ~1254–1350).
  * new per-definition numeric section `CSHARP_LOCAL_SAME_FILE_NUMERIC_RETURNS` +
    `sameFileMethodReturnsProve` / `numericReturnExpressionProves` / `sameFileNumericDeclarationType`
    / `sameFileNumericReturnType` (~3167–3270) and its two hooks (`callReturnType` ~3572,
    `csharpMethodReturnType` ~7830).
  * bool table (`isLinear`/`isInverse`, ~1705), `CSHARP_LOCAL_WS_MEMBER_TYPES` + `wsCacheMemberRead`
    (~2127/2209), `CSHARP_COLLECTION_RETURN_METHODS` (+2 entries, ~1095), `CSHARP_METHOD_RETURN_TYPES`
    (+5 entries, ~6533), `CSHARP_LOCAL_THIS_RETURN_TYPES` (+5 entries, ~1442).
* `cs/ccxt/base/Exchange.Options.cs` (field retype) and `cs/ccxt/base/Exchange.cs` (stub retype) —
  hand-written base.
* `build/csharpTranspiler.ts` **not touched** (no hotspot).

## Fixed point / determinism

The three scoped regens (`--force --noTests <104 rest ids>`, `--force --ws --noTests <76 ws ids>`,
`--force --prediction --noTests <7 prediction ids>`) plus `--tests`/`--baseTests` were re-run after the
last edit; the tree stayed at 21 files / 148 pairs. The farm job's `branch_update=unchanged` is the
independent full-tree fixed point on the committed sha.
