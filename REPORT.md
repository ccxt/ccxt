# cs90 U53 — `object since/limit/until/amount/price` params on NON-core venue helpers → `Int64?`/`double?`

Branch `cs90-U53`, base `d847892a6fcf5699640862316303b6344a3e4daf` (PR #30530 head), ast pin
`404e9daa7f0ab58d085ed04aaa61a19546dfeda2` (unchanged — no ast-transpiler edit, no `[AST]` work).

## Family

Roster line U53 (UNITS.md §K): the `object since / limit / until / amount / price` PARAMETERS of the
generated **non-core** helpers — venue request builders (`createEditOrderRequest`, `editSpotOrderRequest`,
`createTpslOrderRequest`, `buildOrderbookOrder`, `buildClobOrderBody`, `orderRequestWs`,
`encodeWithdrawMessage`, `calcOrderPrice`, `convertCurrencyNetwork`, `signAndCreateOrder`), the
`parse*`/`filter*` helper families that carry a trailing `since`/`limit` pair (`parseLedger`,
`parseIncomes`, `parseLiquidation[s]`, `parseFundingHistories`, `parseFundingRateHistories`,
`parseBorrowRateHistories`, `parseSettlements`, `parseConversions`, `parseTransactionsByType`,
`parseCreateEditOrderArgs`, `parseTradingViewOHLCV`, `parseWsTrades`, `parseWsOHLCVs`,
`parsePredictionOrders`, `parsePredictionTrades`, `parseLongShortRatioHistory`, `filterBySymbolsSinceLimit`,
`filterByOutcomesSinceLimit`, `fetchPaginatedCallIncremental`, `getAssetHistoryRows`,
`requestWalletHistoryRows`, `queryTransactionsByEventType`, `internalFetchTransfers`, `tokenizedConvertHistory`,
`seedOrderBook`, `handlePaginationParams`, `getClosestLimit`, `prepareAccountRequest[WithCurrencyCode]`),
the fee/precision helpers (`calculateFee`, `borrowMargin`, `amountToPredictionPrecision`,
`priceToPredictionPrecision`, `opinionOrderRawAmounts`, `parseContractOrderBook`).

Cores are OUT of scope: any (name, position) that a core table already owns is excluded
(`TYPED_CORES` / `PREDICTION_TYPED_CORES` / `SYNC_TYPED_CORES` / `VENUE_TYPED_CORES` = whole-name exclusion;
`CORE_NUMERIC_ARGS` / `CORE_STRING_ARGS` / `CORE_DICT_ARGS` / `CORE_IDICT_ARGS` / `CORE_LIST_ARGS` /
`SIGNATURE_ARG_TYPES` = position exclusion, so e.g. `parseTransactionsByType` keeps its S45-typed `code`
position while its `since`/`limit` positions are narrowed here). 98 candidate groups fell out that way.

## Rules / tables / passes touched

* `build/csharpTranspiler.ts` — **new table** `VENUE_NUMERIC_ARGS` (name → position → `Int64?`/`double?`)
  at **line 1164** + `VENUE_NUMERIC_ARG_NAMES` at 1162; **new pass** `typeVenueNumericArgs` at **line 3467**;
  wired into the four emission chains at **lines 5891** (BaseExchange), **5899** (Exchange trading
  methods), **5947** (PredictionExchange), **6293** (venue/pro/prediction files).
* No `build/csharp-local-types.js` change, no `ts/src` change, no hand-written base change,
  no ast-transpiler change.
* The pass is the numeric twin of S45's `typeVenueStringArgs`: signature-line retype only, plus the
  `object <name>Var = <name>;` shadow + body rename when a body assigns to the parameter (no admitted
  position needs it — see rejects).

### Admission (all four must hold; re-derivable, not asserted)

1. **Caller gate (whole tree: `cs/**` + `examples/cs/**`).** Every call site of the name at that
   position passes an argument whose static type is *exactly* `Int64`/`Int64?` (for an `Int64?` target)
   or `double`/`double?` (for `double?`) or `null`. No literal, no `int`, no `object`: any conversion at
   the call site would change the box the parameter holds (`object` + `1000` boxes `Int32`, `Int64?` +
   `1000` boxes `Int64`).
2. **Declaration gate (tree-wide).** Every declaration of the name at that position is
   `object <numeric-name>` and generated. Keyed by name+position because C# overrides are invariant on
   parameter types; a same-name helper that spells that position differently (prediction hyperliquid's
   `calculatePricePrecision(object midPx)`) vetoes its group instead of being rewritten.
3. **Body gate.** Every use of the parameter inside the body is an identity under the narrowed type:
   argument at a callee position whose *every* declaration is `object` (so no `multiply(Int64?, Int64?)`
   / `divide` / `mod` / `sum` twin can re-bind), cast to the target type or to `object`, list/dict
   initializer element, `Dictionary<string, object>` indexer write, indexer key, `return` of an
   object-returning method.
4. **No `this.<name>` method-group reference** (`spawn(...)` / DynamicInvoker) anywhere in the tree.

Tooling (all in `campaigns/cs90/tools/U53/`, committed): `census-num-params.py` (parser + type oracle),
`census2.py` (the four gates), `final_table.py` (table emitter), `verify_tree.py` (re-derivation from the
EMITTED tree), `pair-audit.py` (diff auditor, `--selftest`), `detail.py`, `fixpoint.py`.

## Census

```
before  locals: object=9304 typed=44132 typed%=82   params: object=11635  returns: object=1080
after   locals: object=9304 typed=44132 typed%=82   params: object=11572  returns: object=1080
```

* **75 groups admitted / 95 parameter declarations retyped** (63 in `cs/ccxt/exchanges/**` + 32 in
  `cs/ccxt/base/{Exchange.BaseMethods,PredictionExchange}.cs`). The census `params: object=` delta is
  exactly the 63 venue-tree positions (the census only scans the venue trees).
* **0 `object` locals converted, 0 casts removed** — this is a parameter-surface unit; it adds no
  locals and removes none (no shadow is inserted anywhere).
* Targets: 50 × `Int64?`, 25 × `double?`.
* Files touched: 34 generated files (2 base + 32 venue/pro/prediction).
* 417 `object <numeric-name>` declarations remain in the tree (the family is ~480 declarations; the
  rest are the rejects below).

## Gates

* `python3 campaigns/cs90/verify-diff.py HEAD` → `files=34 pairs=56 unexpected=56` (rc=1). Expected:
  `verify-diff.py`'s `ok_param_retype` only models `object <name>` → `string?`/`string`, so a NUMERIC
  parameter retype has no rule and every pair lands in UNEXPECTED (same class as S45's numeric-free
  string pairs; the skill documents this). All 56 pairs are one declared class: a signature line whose
  only change is `object <numeric-name>` → `Int64?`/`double?` at a tabled position, default text
  byte-equal.
* **Unit-owned pair audit** `tools/U53/pair-audit.py` (this is the proof for that class):
  `files=34 pairs=56 retyped-positions=95 rejected=0` (rc=0). It checks indent/modifiers/return
  type/name/arity equality, byte-equal defaults, the name being in the family, and the target matching
  `VENUE_NUMERIC_ARGS` — and `--selftest` (rc=0) proves it flags a wrong target type, an unclaimed
  position, a `typed → object` flip, a changed default, a body-line change and an arity change.
* **Re-derivation** `tools/U53/verify_tree.py` on the emitted tree: `typed as tabled: 95`,
  `still object though tabled: 0`, `typed differently than tabled: 0`. (It never reads the pass.)
* **Determinism**: `git diff -- cs/ | sha256sum` identical before/after re-running the scoped
  REST/ws/prediction regens on the ids carrying the family.
* **Farm**: `ccxt-farm build --targets cs --wait` (dotnet is farm-only; never run locally). Code+REPORT
  commit `1e6093d58396593c96f645ca058f3e89f72fbe38` → `job 891 exit=0 branch_update=unchanged
  generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2` (`ccxt-farm status 891`); REPORT-tip commit
  `12037334c826f78c82f07d93d94e0545583344a7` → `job 895 exit=0 branch_update=unchanged` (same generator);
  this REPORT's own commit `7f48922d809260f33b66ab4ad0751ca491deea83` → `job 897 exit=0 branch_update=unchanged`.
  `branch_update=unchanged` on a `transpile_force=0` build means the farm's own transpile reproduced
  this tree byte-for-byte (fixed point), and the generator is the campaign pin.

## Rejected sub-cases (with the reason)

* **`caller-not-box` (103 groups)** — at least one caller passes an `object`/literal/other box.
  Notable, and *not* fixable inside this unit:
  * `parseTrades`/`parseOHLCVs`/`parseOrders` `since`/`limit` (196/88/180 sites): 2–35 of the sites pass
    the **`object sinceVar`/`limitVar` shadow locals** that `typeCoreArgs` inserts for the cores
    (`CORE_ARG_SHADOW_SKIP_POSITIONS` leftovers). Those copies are U23/U24's family (lower unit number);
    once they are typed these groups become admissible — re-check after the merge. Rejected rather than
    adding a `ToInt64Arg(...)` wrap at the call sites, which would change the value for a boxed `Int32`
    (`ToInt64Arg` unboxes via `Convert`, and the untyped path never converted).
  * `createOrderRequest` amount/price (64 sites): the typed wrapper path passes `double`, but the
    `CreateOrders` path passes an `object amount` (ccxt allows string amounts in the order list) — a
    mixed-box position, so no single target type names what the callers already pass.
  * `modifyMarginHelper` amount (34 sites, 17 declarations): `gate`/`poloniex` pass
    `prefixUnaryNeg(ref amountVar)` — an `object` expression (and a `ref` sink), not the box.
  * `amountToPrecision`/`priceToPrecision` (234/460 sites): S42's explicit "keep `object`" decision —
    the precision helpers are the user-input funnel; reconfirmed by the census (224/454 non-box callers).
  * `FetchTransactionsHelper` `since`/`limit`, `editOrderRequest`, `createSpotOrderRequest`,
    `createUtaOrderRequest`, `parseFundingHistories`(other venues), `handleSinceAndUntil`,
    `getPrice`, `applyScale`, `toEp`/`toEv`, `orderMessage`, `orderRequest*`, `signAndCreateOrder`
    amount (lighter: the body forwards it into `createOrderRequest`, whose position is mixed-box).
* **`other-decl` (41 groups)** — another class declares the same name at the same position with a
  *different* parameter (`orderRequest` pos 2 = `object type` in kraken, pos 3 = `object request` in
  zebpay; `watchPrivate` pos 2/3 = `parameters`/`subscriptionHash`/`unsubscribe`; `parseLastPrice`
  pos 0 = `object entry` in aster/binance/hashkey; `store` = the hand-written ws `OrderBookSide`;
  `calculatePricePrecision` = prediction hyperliquid's `object midPx`). Rewriting by position would
  retype a different method — rejected; the pass additionally keys on the parameter NAME.
* **`decl-not-generated` (7 groups)** — a declaration lives in hand-written base / generated tests
  (`loadOrderBook` in `cs/ccxt/ws/Exchange.WsBridge.cs`, `tcoGetMinimumAmountForLimitPrice` in
  `cs/tests/Generated/Exchange/test.createOrder.cs`). The pass only rewrites generated output, so the
  group cannot be narrowed consistently.
* **`bad-body-uses` (14 groups)** — a body use is not an identity under the narrowed type:
  `applyScale` (`Precise.stringMul(amount, scale)` takes strings), `buildClobOrderBody` price
  (`polymarketOrderRawAmounts` position is not uniformly `object`), `prepareOrdersByStatusRequest`,
  `fetchMyTradesRequest`/`fetchOrdersRequest` (body forwards into the `*Ws` cores).
* **`reflective-ref` (1 group)** — `loadOrderBook`: `this.loadOrderBook` is referenced as a method group
  7 times (`spawn(...)`/DynamicInvoker binds boxed elements at runtime), so no static caller census exists.
* **`no-call-sites` (2 groups kept, 5 rejected)** — 5 admitted groups have **zero in-tree call sites**
  (`calculateFee` amount/price, `borrowMargin`, `convertCurrencyNetwork`, `parseLongShortRatioHistory`,
  `parseWsTrades`/`parseWsOHLCVs` since/limit, `priceToPredictionPrecision`, `tokenizedConvertHistory`):
  the census is vacuous, the retype is a pure signature change (bodies verified identity). They are kept
  for consistency with the landed precedent (S45 already retyped `calculateFee`'s `type`/`side` positions
  with the same 0-site census) and listed here as their own class. `loadOrderBook` and
  `tcoGetMinimumAmountForLimitPrice` were rejected for the reasons above, not for being uncalled.
* **`shadow` body (1 group, not admitted)** — `pro:bingx.getOrderBookLimitByMarketType(object limit)`
  assigns `limit = 100` (an `Int32` literal) and `limit = this.findNearestCeiling(List<object>, object)`,
  so the pass would have to insert `object limitVar = limit;` — that ADDS an `object` local, i.e. the
  campaign's primary metric would go backwards by one for a one-parameter gain. Rejected.
* **`until`** — no declaration of a parameter named `until` exists on this tree (0 candidates); the name
  is kept in the family list for completeness.
* **Core-owned (98 groups)** — `WatchOHLCVForSymbols`, `FetchClosedOrdersWs`/`FetchOpenOrdersWs`/
  `FetchTradesWs`/`FetchOrderBookWs`/`FetchDepositsWs`/`WithdrawWs`, `TransferIn`/`TransferOut`/
  `TransferBetween*`, `CreateGiftCode`, `FetchMarginAdjustmentHistory`, `futuresTransfer`,
  `internalFetchTransfers` position 0, … — S42/S44 and U23/U24 own those; not touched.

## Residual risk

* **External callers.** A parameter retype is a source-breaking change for user code that passes an
  `object`/`int`-literal argument to these helpers (e.g. `exchange.parseLedger(data, currency, 1000, 5)`).
  In-tree callers are proven identical; outside the tree nothing can be. The class of change is the one
  the campaign's core-arg work already ships (and the wrappers' PascalCase API is unaffected).
* **Box fidelity inside the bodies.** Every admitted body use was classified as an identity, and the
  callee-position rule refuses positions with any numeric overload (so `multiply`/`divide`/`mod`/`sum`
  cannot re-bind). The one place the box can still move is a body that passes the parameter to a
  hand-written helper whose own parameter is `object` (box of `Nullable<T>` holding `T` == box of `T`,
  `null` stays `null`) — that is the identity claim, not a proof from the compiler.
* **`string?` interplay.** `calculateFee`'s `type`/`side` are narrowed by the S45 string pass in the same
  file. Chain ORDER matters there: with the numeric pass placed *inside* `typeVenueStringArgs`
  (i.e. running first) the base declaration silently LOST the `string? type, string? side` retype
  (measured: `Exchange.BaseMethods.cs` emitted `object type, object side`). Placing the numeric pass
  OUTSIDE (running last) restores it; the final tree carries both retypes on all three `calculateFee`
  declarations. Any future pass that rebuilds a signature line must keep that order.
* **Base-helper public surface.** 32 of the 95 positions are on generated base virtuals
  (`parseLedger`, `filterBySymbolsSinceLimit`, …) whose venue overrides declare the same arity; the
  tree-wide declaration gate verified that every override is `object <name>` too, so no CS0508 remains.
* The `params: object=` census only covers `cs/ccxt/exchanges/**`; the base-file positions (32) are
  invisible to it, so the campaign-level delta understates this unit.

## Hotspots

```
hotspot: build/csharpTranspiler.ts:1162-1210  (VENUE_NUMERIC_ARG_NAMES + VENUE_NUMERIC_ARGS table)
hotspot: build/csharpTranspiler.ts:3467-3538  (typeVenueNumericArgs pass)
hotspot: build/csharpTranspiler.ts:5891,5899,5947,6293 (chain wiring, outermost numeric pass)
```

No ast-transpiler source, no hand-written base file and no `ts/src` file was touched.
