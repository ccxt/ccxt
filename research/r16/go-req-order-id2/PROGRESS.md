# GO-REQ-ORDER-ID2 (from 37f8209f50a, merged PR head 7dac08e0706)
- ts/src/upbit.ts, weex.ts, btse.ts restored byte-identical to 49447fc25f5 (git diff empty), so their JS/Python/PHP output is unchanged.
- Generic rule (build/go-local-types.js installCcxtGoStringParamNilGuards): a param in the unified string table with goType `string`
  accepts any nil compare; printInlineEquality then prints it as the constant `false`/`true` (the rule for other params stays throw-guard-only).
- Table: editOrder[0], fetchOrderTrades[0] admitted. cancelOrder[0] and fetchOrder[0] were REMOVED and exchange_interface.go was reverted to `id any`:
  base cancelUnifiedOrder/fetchUnifiedOrder pass `this.safeString(order,'id')` (a nilable value, which would hit StringArg and panic),
  and so do bithumb cancelUnifiedOrder `order['id']` and test.createOrder (`orderId: Str`). No internal caller passes nil to editOrder
  (callers: editLimitOrder id string, editOrderWithClientOrderId '') or to fetchOrderTrades (no callers).

| exchange | method | branch | class | note |
|---|---|---|---|---|
| btse | editOrder | `else if (id === undefined) throw` | constant-in-Go (`else if false`) | JS/Py/PHP unchanged |
| btse | fetchOrderTrades | `clientOrderId===undefined && id===undefined` throw | constant-in-Go (`&& (false)`) | unchanged |
| btse | cancelOrder | id nil throw | kept (id any) | unchanged |
| upbit | editOrder | `if (id !== undefined) prev_order_uuid else prev_order_identifier` | constant-in-Go (`if true`); clientOrderId path dead in Go only | feature kept in JS/Py/PHP |
| weex | cancelOrder / fetchOrder | id nil throws, trigger/non-spot | kept (id any) | unchanged |
| dydx | cancelOrder | `id !== undefined &&` removed | removed (dead: id.toString() first) | none |
| hyperliquid/modetrade/woofipro | withdraw | `code !== undefined` wrapper removed | removed | USDC check unconditional; code documented required |
| hyperliquid/apex/aster/extended | transfer | code/from/toAccount nil branches removed | removed | documented required string params |
| kalshi/opinion/polymarket/predictfun/sxbet | fetchOrder | `id: Str` -> `string` | typed | sxbet keeps its throw guard (GRD) |

- Replays (tr.mjs) btse upbit weex kucoin hyperliquid extended dydx: rc 0, no errors; out/ has the Go output.
- tsc: no ts/src exchange errors (only pre-existing sparse-checkout test errors); lint 0 errors; strfixtures f320178167b: pairs 200, bad 0.
- JS static tests: could not run in this sparse worktree (ccxt.js missing); the reverted files are byte-identical to 49447fc25f5.
- HEAD for the root all-langs gate: see git log.
