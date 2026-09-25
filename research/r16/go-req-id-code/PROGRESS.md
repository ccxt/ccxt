# GO-REQ-ID-CODE progress
- branch typed90-sub-go-req-id-code, base fda3eb00efb merged with PR head cbfdbd3959f.
- measure.cjs (non-symbol required `string` params of async base Exchange methods): m0.txt 58 pairs, 47 OK / 11 BAD.
- Table: separate const GO_UNIFIED_REQUIRED_ID_PARAMS (35 methods, 40 indexes) merged into GO_UNIFIED_STRING_PARAMS
  after its literal; exchange_interface.go 16 params any->string (iface.mjs). Non-async OKs (request/fetch2 path,
  fetchPaginatedCall* method, loadOrderBook, safeDeterministicCall, fetchWebEndpoint) left out: not unified API.
- EXCLUDED (fail closed): cancelOrder/editOrder/fetchOrder/fetchOrderTrades id (nil guards btse/extended/weex/kucoin/
  hyperliquid/upbit/dydx; prediction fetchOrder id Str), withdraw code (coinbase/hyperliquid/modetrade/woofipro nil
  compares) + address (kraken), transfer code (hyperliquid) + fromAccount/toAccount (apex/aster/dydx/extended),
  setMarginMode marginMode (lighter guard).
- replays (tr.mjs, 80 files) all transpile rc0 (no generator throw); new StringArg sites in blockchaincom, gate,
  hashkey, kucoin x4, okx, weex x3 (callers forwarding untyped id/code).
