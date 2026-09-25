# MINMAX-NATIVE (C#)
Base e4ac7cc3c54 (TS7 pin 43259d5fe75). Route: ccxt build layer (installCsharpGuardedMinMax in build/csharp-local-types.js,
wired in build/csharp-worker.ts), no generator change, no ts/src change.
Rule: Math.min/max(p, N) / (N, p) where p is a narrowed Int64? core parameter (parameterArithmeticType) that the printer's
csharpNullGuardAdmitsRead proves non-null, N a non-negative int literal, result a request-field value
(`x[k] = call` / `{k: call}`) -> `Math.Min(p.Value, N)`.
Box proof: helper returns p's Int64 box or N's Int32 box; native always Int64 = a box the consumer already receives whenever
p < N; request dicts are serialized (urlencode ToString / json) -> identical text.
Replay (probe.mts, 8 exchanges): 10 sites native, diff vs rule-OFF == exactly those lines; check.py: every `.Value` operand
is declared `Int64? x = null` in the committed signature (10/10).
Fail-closed residual: ternary arms, locals (limitResolved/limitValue), maxLimit-typed locals, non-param operands.
