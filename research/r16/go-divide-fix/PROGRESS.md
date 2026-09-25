# GO-DIVIDE-FIX
- Root cause: goGetArgCopyTarget vetoes a copy local whose write classifies as a Go value type. e3da's native
  `now - (1000*60)*60*24*90` classifies int64 via the host classifier (was Subtract -> any), so the bullish
  `startTimestamp` copy target was dropped and `since` fell to GetArg/any.
- Fix ast a85f57dc596 (fork branch typed90-go-divide-fix): native int64/float64 arithmetic writes are not value-family
  writes (goGetArgWriteIsNativeArithmetic); copy still `var x any = since`. jest 1863 green, tsc clean, test fails w/o fix.
- Single-file replay bullish: `var since *int64 = GetArgInt64Ptr(optionalArgs, 0, nil)` recovered.
