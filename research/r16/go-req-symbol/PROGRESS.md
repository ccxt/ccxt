# GO-REQ-SYMBOL progress
- base ba2d3740f1b (j2021). measure.cjs (TS6 AST over ts/src): 117 base methods with required `symbol: string`;
  m0.txt: 103 OK / 15 BAD. Mechanism already exists: GO_UNIFIED_STRING_PARAMS (generator prints `string` on base +
  every override, throws at transpile if a body nil-compares/writes non-string; non-string call args -> StringArg;
  CallInternalMethod string-kind params -> StringArg).
- EXCLUDED (fail closed): fetchOrderBook/fetchTicker/fetchTrades/fetchOHLCV/watchTicker/watchOrderBook/watchTrades
  (prediction overrides `outcome: Str` and/or bodies `symbol === undefined` / `!== undefined` optional-use),
  editOrder, fetchTradingFee, fetchFundingRate, fetchPosition, fetchLeverage, fetchMarginMode, setMargin (nil compares).
  Sync helpers (createOHLCVObject, calculateFee, featureValue, OrderRouter internals) left out: not unified async.
- ADDED symbol index for 89 async names (names.txt, apply.mjs) + exchange_interface.go 20 params any->string.
