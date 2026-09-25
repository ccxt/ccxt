# CS-GETLIMIT-NATIVE
- base 77494f3abc1. Design (b): BaseCache abstract getLimit/append (ArrayCache, ArrayCacheByTimestamp override;
  subclasses already override append) + static BaseCache.getLimitOf/appendTo. nativeWsCacheCalls: proven receiver -> x.m(...),
  else static twin. Semantics: callDynamically NREs on null (obj.GetType) and non-cache (ResolveMethod null -> mi.Invoke);
  twins throw NRE for both. Only diff: exceptions inside getLimit/append no longer wrapped in TargetInvocationException (none can
  throw from getLimit on Int64?/null limits; append NRE paths identical to direct callers at the 67 native sites).
- Local replay of the pass on committed pro+prediction: 168 sites (151 getLimit, 17 append) -> twins, 54 files.
