# GO-REQ-SYMBOL2 progress (base 2eead460a71)
- Guard family already handled by bcb4eb4c258 (ancestor): go-local-types installCcxtGoStringParamNilGuards admits
  `if (p === undefined) { throw }` guards on table-typed string params and prints the compare as `false`
  (JS/Py/PHP keep the throw; Go boundary = StringArg panic ArgumentsRequired). measure.cjs now tags them GRD.
- Per-hierarchy: prediction overrides of fetchOrderBook/fetchTicker/fetchOHLCV/fetchTrades/watch* all use
  `outcome` as required (no nil compare except sxbet fetchTrades throw guard); base PredictionExchange declares
  fetchTicker/fetchOHLCV/fetchTrades/watch* `outcome: string` already, only fetchOrderBook was `Str`.
  OPTION 3: 24 prediction signatures `outcome: Str` -> `outcome: string` (+ seedOrderBook myriad/opinion,
  its only callers pass watchOrderBook's string). tsc 0 errors, lint 0 errors. Both hierarchies now agree ->
  single name-keyed table entry is truthful for both; no generator keying needed.
- Added to table: fetchOrderBook fetchTicker fetchOHLCV watchOrderBook watchTicker fetchTradingFee fetchFundingRate.
- Real-optional (not changed, BAD in m1.txt): fetchTrades derive/hitbtc/hyperliquid/revolutx, watchTrades
  pro/paradex, editOrder alpaca/deepcoin/hitbtc/mudrex, fetchLeverage gate, fetchMarginMode delta,
  setMargin coinbaseinternational, fetchPosition prediction/binance (outcome optional).
