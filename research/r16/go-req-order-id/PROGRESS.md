# GO-REQ-ORDER-ID (base 49447fc25f5 = PR head)
- measure.cjs now tags `if (p === undefined) { throw }` (no else) as GRD (the generic Go `if false` rule), not BAD.
- m0.txt: 9 BAD pairs -> m1.txt: 2 BAD (both genuinely optional, excluded).
- Added to GO_UNIFIED_REQUIRED_ID_PARAMS: cancelOrder/fetchOrder/editOrder/fetchOrderTrades [0], withdraw [0],
  transfer [0,3], setMarginMode [0] (lighter guard was already GRD). exchange_interface.go: 4 params any->string.
- OPTION 3 ts/src (dead branches on documented-required `@param {string}` params; BEHAVIOUR NOTES):
  btse cancelOrder/editOrder, weex cancelOrder/fetchOrder: `else if (id === undefined) throw` removed (clientOrderId path kept);
  weex cancelOrder trigger / fetchOrder non-spot `id === undefined` throws removed;
  btse fetchOrderTrades `(clientOrderId, id) both undefined` throw removed;
  upbit editOrder: id always sent as prev_order_uuid (params.clientOrderId no longer switches to prev_order_identifier;
  it stays in params, so an explicit clientOrderId is forwarded raw) - BEHAVIOUR CHANGE;
  dydx cancelOrder `id !== undefined &&` removed (id.toString() already dereferenced it);
  hyperliquid/modetrade/woofipro withdraw: `code !== undefined` wrappers removed (USDC check now unconditional);
  hyperliquid transfer isUsdc `code === undefined ||` removed (spot-branch throw stays, now GRD);
  apex transfer `fromAccount !== undefined &&` x2; aster transfer from/to nil branches removed (convertTypeToAccount
  always called); extended transfer `toAccount === undefined ||` removed.
  prediction kalshi/opinion/polymarket/predictfun/sxbet fetchOrder `id: Str` -> `id: string` (all use id as required).
- EXCLUDED (genuinely optional): withdraw address (kraken: documented "not required, can be '' or undefined"),
  transfer fromAccount (extended: documented "defaults to the authenticated account id").
- Fixtures: fixfix.py quoted 73 integer ids in 28 static request/response files (21 exchanges); strfixtures bad 0.
  JS request+response tests pass for those 21 + btse weex upbit dydx apex extended kraken; tsc 0; lint 0 errors.
- Replays (tr.mjs, 18 files) rc0; unified sigs now `id string` etc.; new StringArg only at forwarding callers
  (kraken transfer(code), bithumb cancelUnifiedOrder GetValue(order,"id")).
- GATE: ts/src edited -> root-only --targets all on head below.
