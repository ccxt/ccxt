# U44 — prediction-tier sweep (cs/ccxt/exchanges/prediction/**, cs/ccxt/base/PredictionExchange.cs)

Branch `cs90-U44` off base `d847892a6fcf5699640862316303b6344a3e4daf`. No ast-transpiler change
(the unit is classifier-only); no hand-written base change; `build/csharpTranspiler.ts` untouched.

## Family

Every rule this unit adds is gated on `isPredictionSource` / `predictionTreeSource`, so the REST and
pro trees stay byte-identical (verified: a full 104-id REST regen and a full 76-id ws regen leave
`git diff -- cs/` unchanged outside the prediction tier).

1. **Typed-core funnel** (`predictionFunnelCallType`, `CSHARP_PREDICTION_FUNNEL_BOXES`).
   `build/csharpTranspiler.ts#wrapTypedCoreConsumers` rewrites `await this.<core>(...)` into
   `ccxt.BaseExchange.From<Family>(await this.<Core>(...))`. The helper's object overload
   (Exchange.TypedCores.cs / Exchange.TranspileHelpers.cs) hands the argument back on a non-matching
   arm and builds the box on the matching one; the funnel wraps only the cores whose C# return type
   IS that argument type, so the arm is the only reachable one. Boxes read from those bodies:
   `FromDict` -> `Dictionary<string, object>` (typed overload, no cast); `FromDictList`,
   `FromTradeList`, `FromPredictionTradeList/OrderList/EventList/PositionList` -> `List<object>`;
   `FromPredictionOrder/Event/OrderBook/Position` -> `Dictionary<string, object>`. The helper name is
   read from the generated prediction file on disk (the file the C# compiler compiles), exactly as
   `awaitedApiReturnTypes` reads the implicit-api wrappers — so a site the pass never visited has no
   funnel line and keeps `object`. **The regex tolerates its own emitted cast** (`= ((T)ccxt.BaseExchange.FromX(`)
   — without that the rule oscillates run-to-run (it would read its own typed output as "no funnel line").
2. **Base-property string reads** (`CSHARP_PREDICTION_STRING_MEMBERS`, `predictionMemberStringRead`,
   `thisMemberArmType`). `Exchange.Options.cs` declares apiKey / secret / password / walletAddress /
   privateKey as `public string <name> { get; set; }`; a read's C# static type is that property's type
   (null while unset), so the declaration is `string?` — no cast (the property is already a string).
3. **Landed-returntable locals** (`predictionRetypedCallType`). A prediction-tier local fed by a helper
   whose DECLARATION a landed retype table (`CSHARP_STRING_RETURN_METHODS`,
   `CSHARP_COLLECTION_RETURN_METHODS`, `CSHARP_WS_ROW_BUILDER_RETURNS`, `CSHARP_NUMERIC_RETURN_TYPES`,
   `CSHARP_METHOD_RETURN_TYPES`) already rewrites: the call's own C# type is that box, no cast.
4. **Prediction-only helper return tables** (roster line: loadOutcome/safeOutcome/parseOutcome*/
   parsePredictionPositions). `CSHARP_COLLECTION_RETURN_METHODS` += 9 names, each on a return-path
   proof read from its own declaration(s) in the prediction tree (all 9 are prediction-only: 0 hits in
   `cs/ccxt/exchanges/*.cs` and `pro/*.cs`): parsePredictionPositions -> `List<object>`,
   safePredictionPosition / parsePredictionPosition / parseMyriadMarket / parseTopicMarket /
   parseOutcomeMarket / getPositionFromClobEntry -> `Dictionary<string, object>`,
   getOutcomeBySlugAndLabel / opinionOutcomeByMarketIdSide -> `IDictionary<string, object>`.
   (`loadOutcome` / `safeOutcome` were already retyped by the cs-strict line; `parsePolyTimestamp` and
   `outcomeEncoding` were rejected by that line's numeric census — not re-litigated, see below.)
5. **Deferrals from U22/U32** — the prediction gate is lifted:
   `CSHARP_PREDICTION_OWNED_RETURNS` (safeTimestamp / safeTimestamp2 / safeTimestampN -> `Int64?`),
   the `nonNullStringDefaultCall` `string?` -> `string` retry, `thisMemberArmType` at the conditional
   arm, and the Dictionary/IDictionary arm pair (`unifyArms (…, true)`, the interface-first widening).
6. **Null-init scalar annotations** (`let x: Num;` / `: Str;` / `: Int;` / `: Bool;` -> `object x = null;`):
   both no-init gates admit a scalar annotation for a prediction source; the later-write scan still
   rejects a write the box cannot hold.

## Census

```
prediction tier (cs/ccxt/exchanges/prediction/*.cs + cs/ccxt/base/PredictionExchange.cs)
  before: object=751  typed=3068  typed%=80
  after:  object=662  typed=3157  typed%=82
whole tree (campaigns/cs90/census.sh, cs/ccxt/exchanges/**)
  before: locals: object=9304 typed=44132 typed%=82   casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (List<object>)=102
  after:  locals: object=9216 typed=44220 typed%=82   casts: (string)=2116 (IList<object>)=1922 (bool)=1 (object)=689 (Dictionary<string, object>)=350 (IDictionary<string,object>)=2560 (Int64)=133 (IDictionary<string, object>)=131 (List<object>)=119
```

**89 declarations typed** (751 -> 662). 0 casts removed: this unit adds casts where a producer's
static type is `object` but the value is a known box (the funnel family) and removes none.

Diff shape (`git diff -U0 -- cs/`, 8 files, 159 -/+ lines):
* 89 `object X = <init>` declaration retypes (the typed_declarations count);
* 16 method-signature retypes (the 9 helper names above, on their own declarations);
* 19 return-path boundary casts (`return X;` -> `return ((T)((object)(X)));`) — the retyped
  declarations' unboxing, emitted by `installCsharpCollectionReturns`; the multi-line dict-literal
  returns pair as 2 lines each in verify-diff;
* 14 `getArrayLength(x)` -> `x?.Count ?? 0` (the printer's list-receiver native form, exact for a
  typed list: null -> 0, otherwise Count);
* 16 `getValue(x, "k")` -> `GetValue(x, "k")` (the printer's typed-dict element-access twin fires on
  the now-`Dictionary`-typed receiver — same helper, same semantics);
* 3 `((IDictionary<string,object>)x)["k"] = v` -> `x["k"] = v` (the dict index-write cast elision).

`verify-diff.py HEAD`: `files=8 pairs=159 unexpected=44` — all 44 are the five classes listed above
(14 + 16 + 19 boundary-cast lines counted as 11 single-line + 8 multi-line tails, and 3).

Determinism: three consecutive `--force --prediction` regens produced byte-identical output
(`git diff -- cs/ | sha256sum` = `f1d657e5c586760b5c48f9a8ce133db0aecd6df5480b36ffce7f96c2d4d424c9`),
i.e. the tree is a fixed point of the classifier.

## Rejected sub-cases (with the reason)

* **`getValue`/`GetValue` element reads (151 index-read sites)** — receivers are `List<object>`/
  `IList<object>` locals (68), `object` locals (32), or `object` params (18): the element is `object`
  by contract, and "the later use is dict-shaped" is not a proof of the runtime box (roster U03).
  A `List<Dictionary<string, object>>` receiver would still print `getValue` returning `object`
  (`List<T>` is invariant), so no spelling names it.
* **Key reads (34 sites)** — `GetValue(signature, "r"|"s")` (10), `GetValue(outcomeObj, "outcomeId")`
  (5), `getValue(this.urls, "api")` (6), `this.urls['api']['ws'|'wsUser']` (3),
  `getValue(eventGroup|parsedEvent|eventEntry|eventVar, "markets")` (6), `this.options["requestId"]`:
  the receiver is a `Dict` in TS (checker answers `any` at the element), so no element proof exists
  without a per-(receiver, key) writer census; the one-key `this.urls['api']` chain is also below
  `urlsLiteralChain`'s 2-key minimum. Left for a follow-up unit with that census.
* **`this.omit(parameters|rest, [...])` (39)** — the receiver is the `object parameters` core param;
  no dict-receiver overload binds and the param-retype pilot is rejected (cs-strict S43).
* **Param/local copies (52)** — `object limitVar = limit`, `object reqLimit = pageLimit`: the source
  is an `object` param, or a local that itself stays `object` (`pageLimit` is blocked by an int-literal
  write into an `Int64?`). The param-copy family belongs to U23/U24/U42.
* **`add(...)` chains (21)** — a leaf is an `object` param or an untyped element read; a nullable left
  operand is not equivalent (`add(object, object)` returns null where `add(string, *)` returns the
  right operand), so no leaf proof exists here (U19/U20/U43 families).
* **Implicit-API awaits (11) + `await this.watch` (4)** — implicit-API endpoints are `Task<object>`
  (cs-strict S26); the awaited ws-subscriber local's type is the resolve value, provable only through
  the message-hash census (U27).
* **Crypto/encode helpers** — `this.hash(..., "hex")` (8), `signMessage` (6), `stringToCharsArray` (5),
  `remove0xPrefix` (3), `ethGetAddressFromPrivateKey` (3), `binaryToBase16` (2), `ethRpc` (5),
  `sendEvmTransaction` (2): U34's family (a digest-literal-keyed `hash` overload and the encode
  retypes); not duplicated here.
* **Numeric arithmetic** — `this.sum` (7), `subtract` (9), `multiply` (3), `mathMin` (4), `mathMax` (2):
  operands are `object` params / untyped locals (U35's family). `outcomeEncoding` (2) and
  `parsePolyTimestamp` (3) were rejected by the base numeric census ("sum" / "identifier-parameter
  passthrough"); no new evidence, so not re-litigated.
* **`safeString`/`safeString2` as `+` left operands (18)** — `add(x, ...)` with a `string?` left; the
  non-null proof for the left operand is U43's family.
* **Literal inits** — `object x = 0;` (20), `new List<object>() {}` (13), `false` (5), `""` (4):
  the later writes are unprovable in this tier (`x = this.safeInteger(...)` then an int literal is a
  box change; `handleOptionAndParams` element-0 writes are the destructured family U14).
* **`this.outcomes` arm** — `object outcomesMap = cond ? this.outcomes : {}`: the property is `object`
  in the generated PredictionExchange.cs, so the arm names nothing.

## Residual risk

* The funnel family's cast (`((List<object>)ccxt.BaseExchange.FromX(...))`) is sound only while the
  argument IS the arm's struct type; the funnel pass keys on the core's declared C# return type, and
  every box is read from the object overload's own body, so a site the pass did not wrap is not typed.
  A null argument matches no arm and comes back null, which every one of these boxes holds.
* `GetValue(x, "k")` and `x?.Count ?? 0` knock-ons are the printer's own typed-receiver passes; both
  are semantic identities for the boxes involved (`GetValue` is the dict-receiver twin of `getValue`;
  `?.Count ?? 0` reproduces `getArrayLength` for a list).
* Boundary casts unbox on the return path: a wrong box would throw there instead of flowing on — the
  return-path census for each of the 9 helper names is in the table comment, and the farm build is the
  compile gate. The multi-line dict-literal returns are the only ones verify-diff cannot pair.
* The prediction base file (`cs/ccxt/base/PredictionExchange.cs`) is generated; its `parse*` retypes
  appear there only when the prediction-base pass is regenerated (`--force`), which the full-regen
  command in BRIEF.md and the farm's regen both do.
* Untouched and deliberately so: `PredictionExchange.cs`'s hand-written-adjacent `this.outcomes`
  fields stay `object` (a generated `public object outcomes { get; set; }`).

## Hotspot

* `hotspot: build/csharp-local-types.js` (the campaign's shared hot file — every rule above is in it;
  all new code is prediction-gated so sibling units' REST/pro families cannot fire on the same site).
* No `build/csharpTranspiler.ts`, no `/root/ast-transpiler` src, no hand-written `cs/ccxt/base/*.cs`
  change.

## Farm gate

```
ccxt-farm build --targets cs --wait          # from /root/worktrees/cs90/U44
farm: job 875 admitted on slot 0 (targets=cs (cli) transpile_force=0)
HEAD a006472cb497f475516d9f642b208046fb47dd59 job=875 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
HEAD 4aa2dcfa61aca48ec3da7e469a862a0925770499 job=882 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
```

`exit=0` (no error, no warning from this diff) and `branch_update=unchanged` — the farm's own forced
full-repo regeneration reproduced the committed tree byte-for-byte (the classifier's fixed point holds
on the farm too), and the job note names the pinned generator `404e9daa`. Job steps:
`ccxt-farm status 875` (`state=succeeded`, `targets=cs`, `failing_files=[]`).
`a006472cb` is the code commit (build/csharp-local-types.js + cs/ + REPORT.md); `4aa2dcfa` is its
REPORT-only amend (the second line above) and the delivered tip is one more REPORT-only amend of that
same tree — the compiled subtree is byte-identical across all three (`git rev-parse <sha>:cs` =
`3655014c40b17720eab537dc5b8ed67bf7141369`, `git rev-parse <sha>:build` =
`4746fe983d2a127486621bfde6040d81f436db90`), so the green `buildCS` result carries over, and the
delivered tip was re-gated the same way (its own job note resolves via `ccxt-farm status <sha>`).
