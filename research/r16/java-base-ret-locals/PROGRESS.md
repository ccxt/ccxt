# JAVA-BASE-RET-LOCALS
Root causes (single-file replays, probe.mts/replay.sh, pin a85f57dc):
1. pro/*: the pro-async guard (isSafeToNarrow feedsInheritedAsyncCall) rejected every local passed to ANY this.<async> call,
   incl. venue-own non-override methods (unWatch/subscribe/subscribePublic) that have no typed wrapper overload.
   Fix: exempt via existing literalFeedsVenueOwnAsyncCall (declared in same file, overrides nothing). Lambdas were not skipped.
2. bare `ecdsa(...)` (base function, not this-call) never reached syncCoreCallType. Fix: bareBaseFunctionCallType reads the
   same on-disk declaration table (single non-Object type, fail closed on venue redeclarations).
Casts/GetValue drop via existing declared-map read path (no new rewrite).
Replay before->after (Object locals / GetValue / Map casts): aster 98->97 12->9; pro/bingx 42->36 casts 51->43; pro/deepcoin 34->26 24->16;
pro/hashkey 34->30; pro/htx 97->81 39->30; pro/nado 81->74; pro/xt 61->49 28->13; apex/binance/pro/binance unchanged.
