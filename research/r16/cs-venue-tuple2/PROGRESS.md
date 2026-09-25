# CS-VENUE-TUPLE-DICT2
- base cbfdbd3959f (merged into fda3eb00efb + cherry-pick bbae3c833c7 -> b16898ba56e)
- root cause j2032: printer reads non-handle tuples as `((IList<object>) tmp)[1]`; retypeElement1Params regex only matched `tmp[1]`, so
  declaration stayed `var` while omitReceiverIsDictionary (element1ParamsRead -> element1ParamsBinding proof) said dict.
- fix: element1ParamsRead now reads a WeakSet filled only when the declaration line was actually rewritten (one predicate, fail closed);
  regex accepts both read shapes. Replay bybit/gate: 0 `Dictionary X = this.omit(var Y)` mismatches; bybit untyped slot-1 32 -> 8.
