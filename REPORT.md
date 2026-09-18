# U51 — `object market = null` parameters on parse*/venue helpers (cs90)

Family: the `object market` parameters cs-strict S37 left behind, retyped to
`IDictionary<string, object> market = null`. Mechanism: the existing `retypeParseMarketParams`
post-print pass + its `PARSE_MARKET_PARAM_DICTS` table in `build/csharpTranspiler.ts` (no new pass,
no ast-transpiler change, no hand-written base change).

Result: **53 names / 111 parameter declarations retyped, 0 casts removed** (a parameter family —
the local census is unchanged by construction).

## Spelling: `IDictionary<string, object>`, not `Dictionary<string, object>`

The roster line asks for `Dictionary<string, object>`; that spelling is not usable here:

* 119 of the market-position arguments feeding the admitted names are declared
  `IDictionary<string, object>` (287 are `Dictionary<string, object>`). C# has no implicit
  `IDictionary` → `Dictionary` conversion, so a `Dictionary` parameter would break all 119.
* S37 landed `IDictionary<string, object>` for the same family (their `decide.py --target IDictionary`
  default; the 64 names already in the table).

## What changed

`build/csharpTranspiler.ts` — `PARSE_MARKET_PARAM_DICTS` + 53 names (U51 block, lines 1236-1252).
The name-keyed pass rewrites **every** declaration of an admitted name, so base / venue / pro /
prediction / ws stay override-compatible.

Admitted (53): `CreateSpotOrder, CreateSwapOrder, checkContractMarket, createOrderRequest,
createPublicRequest, createSpotOrderRequest, customHandleDelta, customHandleDeltas,
customParseBidAsk, customParseOrderBook, editOrderRequest, findOutcomeInMarket, futuresRequestId,
getBybitType, getDexFromHip3Symbol, getGen2MarketId, getInstType, getMarketIdByType, getMarketType,
getOrderChannelAndMessageHash, getProductGroupFromMarket, getTypeByMarket, getUrlByMarket,
getV5LinearChannelAndMessageHash, handleOrderBookMessage, handleProductTypeAndParams,
handleSubTypeAndParams, isNativeMarket, multiOrderSpotPrepareRequest, orderBookSuffix, orderMessage,
orderToTrade, parseAmmEventToOrder, parseFundingHistories, parseFundingHistory,
parseLeverageFromMarket, parsePosition, parseTradingFees, prepareRequest, resolveAuthType,
safeLiquidation, safeMarketStructure, spotOrderPrepareRequest, subscribe, toEp, toEv,
toSandboxMarketId, unSubscribe, unWatch, unWatchPublic, unsubscribePublic, watchPublic, wathPublic`

Declarations by tree: 107 `cs/ccxt/exchanges/**` (rest + pro + prediction) + 4 generated base
(`parsePosition`, `safeLiquidation`, `handleSubTypeAndParams`, `safeMarketStructure`).

## Admission proof (census over the base tree `d847892a6`, whole C# tree incl. base + tests + examples)

`campaigns/cs90/tools/U51/` — `market-census4.py` (declaration + per-class call-site census),
`admission-verdict.py` (fixed-point closure), `body-write-census.py`, `callee-check.py`,
`override-hazard.py`, `pair-audit.py`. A name is admitted only when all four hold:

1. **Every call site** passes `null`, a `Dictionary`/`IDictionary`-typed value, a dict literal, a
   proven dict-returning producer (`this.market/safeMarket/safeMarketStructure/safeDict/extend/
   deepExtend/getMarketFromSymbols`), a default (argument not supplied), a call binding to another
   overload, or the enclosing method's own `market` parameter of another admitted name
   (fixed-point closure; self-recursion allowed).
2. **Every body use is a dict use** — the only body writes are `market = this.safeMarket(...)` /
   `market = this.market(...)` (both `Dictionary<string, object>`); no `ref`/`out`, no cast applied
   to the parameter, no callee parameter that needs a concrete type at the market position.
3. **No override hazard** — no same-arity declaration of the name in the same class hierarchy
   spells the parameter differently (a renamed `object outcomeObj` override would not be rewritten
   → CS0115).
4. The declaration line matches the pass's signature regex (single-line
   `public [async] (virtual|override) <ret> <name>(...)`).

## Census (campaign `census.sh`, cs/ccxt/exchanges/**)

```
before: locals: object=9304 typed=44132 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334
               (IDictionary<string,object>)=2563 (IDictionary<string, object>)=127 (Int64)=133 (List<object>)=102
        params: object=11635   returns: object=1080
after:  locals: object=9304 typed=44132 typed%=82          (unchanged — parameter family)
        casts: byte-identical to before (all nine targets)
        params: object=11528   returns: object=1080        (-107 in exchanges/**; -111 tree-wide)
```
The cast and local lines are unchanged: this unit removes no casts and retypes no locals.

## Gates

* `verify-diff.py d847892a6` → `files=67 pairs=111 unexpected=111` — every pair is the declared
  parameter retype; the campaign grammar models declaration/return retypes and cast removals only,
  it has no rule for a parameter-type swap (documented trap for param units). No other hunk exists
  in the diff (`git diff --numstat` = 111/111).
* Unit-owned pair audit (`pair-audit.py`, `--selftest` proves it flags a wrong target type, a
  retyped position outside the table, a foreign parameter name and a call-site pair):
  `pairs=111 param-retype=111 unexpected=0`; **prediction vs emission** `predicted decls=111
  emitted=111 missing=0 extra=0` (the base-tree census predicts the exact (file,line) set the
  transpiler rewrites).
* `ccxt-farm build --targets cs --wait` — job **861**, sha `83878590d2d129416c590f5f50b16c7c2f963d17`,
  `exit=0` (`buildCS`: *Build succeeded. 0 Warning(s) 0 Error(s)*; generator `404e9daa`, matching the
  campaign pin). An earlier 110-declaration variant was job 836, also exit=0.
* Census after: `object market` target names 104 → 51; all 53 admitted names fully retyped, no
  leftovers, no new target names.

## Rejected sub-cases

1. **`parseTrade` (96 declarations)** — every call site is admissible, but three body writes assign
   an `object`-declared producer into the parameter: `bitstamp.cs:1728`
   `market = this.getMarketFromTrade(trade)`, `kraken.cs:1665` `market = foundMarket`
   (`findMarketByAltnameOrId`), `kraken.cs:1669` `market = this.getDelistedMarketById(marketId)`.
   All three producers are declared `object` (their values are a market row or null at runtime, but
   statically `object`). Retyping needs an inserted cast at those writes — an assertion, not the
   "static type already equals the target" case the round sanctions. Fix path: retype those three
   venue helpers' return types (return-path proof, U37's family) → `parseTrade` then joins.
2. **Fixed-point-only rejections (20 names)** — only blocker is a `market` argument that is the
   enclosing method's own parameter of another *rejected* name: `parseContractOrder`,
   `parseContractTicker`, `parseContractTrade`, `parseDustTrade`, `parseMyUtaTrade`,
   `parseSpotOrUtaTrade`, `parseSpotOrder`, `parseSwapOrder`, `parseUtaOrder`, `parseTrades`,
   `parseTradesHelper`, `parseOHLCV`, `fromEp`, `fromEr`, `fromEv`, `safeSymbol`, `safeOrder`,
   `safeTicker`, `safeTrade`, `safeOpenInterest`, `getOutcomeBySlugAndLabel`, `parsePredictionTrade`
   (each transitively gated by a name below). They open as soon as the blocking name does.
3. **Names with a call site passing an `object`-typed value** — `parseTicker` (94 decls,
   `hyperliquid.cs:1373` `object market = getValue(response, i)`), `parseOrder` (93,
   `extended.cs:3227/3321`, `lighter.cs:3692`, `pro/lighter.cs:1352/1390`), `parseWsTrade` (45,
   `pro/bitrue.cs:600`), `parseWsTicker` (25, `pro/bitrue.cs:833`), `parseWsOHLCV` (17,
   `pro/bitrue.cs:730`), `safeMarket` (10, `bitstamp.cs:3069`), `parseOHLCVs` (2,
   `prediction/kalshi.cs:1477` `((object)outcomeObj)`, `hyperliquid.cs:1624`), `parseMarket` (45,
   20 sites — `getValue(markets, i)` element reads, `object asset/entry/raw` locals, plus 7
   renamed-parameter overrides), `parseSpotMarket`/`parseSwapMarket` (`phemex.cs:1362/1353`),
   `parsePredictionOrder/Position/Ticker/Trade/OpenInterest` (`((object)outcomeObj)` casts and
   `object outcomeObj` locals in the prediction tree), `handleMarketTypeAndParams` (3,
   `getValue(markets, 0)`), `indexMarketOutcomes`, `parseContractMarket`, `parseMarketToEvent`,
   `parseTradeQuote`, `parseTradeTx`, `createPublicSubscriptionRequest`. The blockers are
   `object`-typed locals fed from `getValue(list, i)` (U01/U06's local-typing family) and
   `((object)x)` upcasts (U49's cast family); a call-site cast mechanism (precedented by
   `castCoreArgCallSites` and S40's handler-message cast) would open ~200 more declarations but
   converts a static error into a runtime assertion — rejected on the round's "reject on doubt" rule.
4. **Renamed-parameter overrides** — `parsePredictionOrder/Position/Trade` are additionally
   un-retypable as-is: `prediction/binance.cs:1081/1509/1670` declare the market position as
   `object outcomeObj`; a name-keyed retype would leave those declarations `object` while the
   prediction base becomes `IDictionary` → CS0115. Same class: 7 `parseMarket` declarations
   (`alpaca asset`, `bitbank/btcturk entry`, `gemini rawResponse/pairInfo`, `mudrex asset`,
   `kalshi rawMarket`).
5. **Test-driver helpers** (`tcoAssertFilledOrder`, `tcoCreateFillableOrder`,
   `tcoCreateUnfillableOrder`, `tcoGetMinimumAmountForLimitPrice`, `tcoMininumAmount`,
   `tcoMininumCost`, `testMarket` — `cs/tests/Generated/Exchange/test.*.cs`): declarations are
   `public async Task<object> tcoX(...)` — no `virtual|override`, so the pass's signature regex
   cannot reach them, and their own callers pass `object market` locals. Excluded, not retyped.

## Residual risk

* The change is declaration-only; the farm build (0 warnings) plus the caller census cover binding.
  For a **non-dict** value the compiler now rejects the call — intended tightening; no such call
  exists in the tree, but future callers must pass a dict.
* Dynamic dispatch: no `callDynamically`/`MethodInfo.Invoke`/method-group use of any admitted name
  (grepped tree-wide; the only string references are `methodName` arguments such as
  `getBybitType("createOrderRequest", market, parameters)`, which is itself admitted).
* The 4 base-file retypes propagate to every venue override by C# invariance — all 111 declarations
  were rewritten in the same commit (prediction-vs-emission 111/111, missing 0, extra 0).
* 587 declarations of the remaining 51 names are still `object market` (the family total is 698);
  they need sibling work (U01/U06 locals, U37 producer returns, U49 `((object)x)` casts) or a
  call-site cast pass (rejected 1-3 above).

## Tool notes (census bugs found and fixed while proving the negative)

* string literals were not blanked, so `" parseMarket() is not supported yet"` read as a call site;
* generic type commas split arguments (`new Dictionary<string, object>()` became two arguments) —
  this is also why S37's tooling blocked `parsePosition` (`bingx.cs:6765` passes a dict literal);
* pro/prediction parent resolution picked `cs/ccxt/api/<id>.cs` instead of the REST venue file.
  Cross-checked against S37's `/tmp/s37-blockers.md`: this unit admits three names their tool
  blocked — `parsePosition` (dict literal), `parseAmmEventToOrder` (`myriad.cs:1693` declares
  `IDictionary<string, object> outcomeObj`), `parseFundingHistory` (`bitget.cs:11712` declares
  `Dictionary<string, object> market`) — each verified by hand at the exact site.

## hotspot

* `build/csharpTranspiler.ts:1218-1256` — `PARSE_MARKET_PARAM_DICTS` (+53 names, U51 block 1236-1252).
* No ast-transpiler src change; no hand-written base file touched (the 4 base declarations live in
  the generated `cs/ccxt/base/Exchange.BaseMethods.cs`).

## Commits

* code (farm-green, job 861): `83878590d2d129416c590f5f50b16c7c2f963d17`
* this report: committed on top of it (branch `cs90-U51`, worktree `/root/worktrees/cs90/U51`).
