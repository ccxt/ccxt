# JAVA-TUPLE-PARAMS-MAP
Base 7dac08e0706 (PR head). Ccxt-side only: build/java-local-types.js (handle* tuple section), pin unchanged.
## Fix
- element-1 proof reads the producer's `params` parameter position (was arguments[0]: wrong for handleMarketTypeAndParams/SubType/MarginMode/UntilOption...), and an omitted arg with a `{}` default.
- venue producers (HANDLE_VENUE_ELEMENT_TYPES) type slot 1 when declared `[T, Dict]` and every `return [x, p]` proves p a Dict.
- `let p = undefined; [a, p] = this.handleX(...)` targets: Map when every write is an element-1 write of a proven producer, null, or omit of a proven dict (same predicate the declaration retype and the toMapArg drop read via HANDLE_TYPED_BINDINGS / java-09 table).
- removed the "omit(x,'k') blocks Map typing" guard: the value is a proven Map, so Map/Object omit overloads run the same Functions.omit path.
- isTriggerOrder (base passthrough of handleTriggerAndParams) joins the base producer set.
## Replay (14 largest toMapArg files; research/r16/java-tuple-params-map/replay.sh + diffcheck.py)
toMapArg 402 -> 342 (-60); 326 decl/write-cast retypes; 0 other lines except pro/binance `String urlType = type` (copy family now sees a typed String binding).
Omit locals Object 73 -> 20 (Map-typed omit 51 -> 104). Extend residual 14 (pro sources untyped): left.
No BaseExchange omit overload added (not needed: omit locals type through section 25 once sources are Map).
