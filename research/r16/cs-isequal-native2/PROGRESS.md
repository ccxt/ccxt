# CS-ISEQUAL-NATIVE (base df35a3fe545)
- Pass: build/csharpTranspiler.ts csharpIsEqualLiteralText (in nativeDeclaredHelperCalls operator edits): identifier declared
  `object` (emitted param/local) vs literal: `"lit"` -> `((x as string) == "lit")` only when the literal starts with a letter,
  charset [A-Za-z0-9_-/.: ], no nan/inf (Double.TryParse rejects it -> isEqual's type test fails for every non-string box);
  `true/false` -> `((x as bool?) == lit)` (TryParse("True") false, so numeric boxes fail too); `null` -> `(x == null)`.
- Replay on committed output: isEqual( 1379 -> 689 (before.txt / after.txt); diffcheck.py 597 pairs 0 anomalies.
- sign.api OPTION 3 not done: 8 array-api overrides index api[0]; `as string` form covers all 162 sites already.
