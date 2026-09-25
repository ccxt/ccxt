# GO-TUPLE-RET3 progress
Branch typed90-sub-go-tuple-ret3, base PR head 6cbceb9803e (merged over 71554d5011c). Baseline census out-2060go.
## Step 1: handleUntilOption -> (map[string]any, map[string]any)
- go/v4/exchange_market_type.go hand-written HandleUntilOption (MapTyped both elements; nil stays nil); TupleSlice generic over element 0.
- build/goTranspiler.ts: transpiled copy dropped, pair coercion added; build/go-local-types.js: CCXT_GO_TUPLE_RESULT_METHODS + element-0 MapTyped unwrap.
- Replay: destructurings print `a, b := / =`; aster `request = handleUntilOption(..)` and okx `[0]` keep TupleSlice (fail closed).
## Not done (fail closed): handleMarginModeAndParams (overrides print `any` locals, needs body retype), handleOptionBoolAndParams literal-default variant.
