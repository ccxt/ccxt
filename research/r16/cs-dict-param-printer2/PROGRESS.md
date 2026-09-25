# CS-DICT-PARAM-PRINTER2 (base 587e994765c)
ROOT CAUSE of j2056 CS0115: the D-17 base/override guard's `related()` saw only imports of the
declaring module basename; prediction venues reach PredictionExchange.ts via abstract/prediction/<x>.ts,
and the guard never looked at the declaring file's own ancestors (PredictionExchange.ts' fetchEvent is
the base; its overrides live in files that don't import it by basename -> base typed, overrides not).
FIX (build/csharp-local-types.js D-17): corpus `parents` table (each `class X extends Y` resolved through
its import binding to a file); guard walks ancestors of the declaring file and rejects any same-named
declaration in an ancestor or descendant file (fail closed).
PROBE (dump.mts, probe-files.txt; single-file replays, 17 files): IDictionary public params 74 -> 71; the 3
removed are exactly PredictionExchange fetchEvent/fetchSettlements + pro/coinbaseexchange
watchMyTradesForSymbols. override_check.py (selftested) on j2056 output flags exactly the 11 CS0115;
on j2052 (green) only 7 vendored/abstract false positives (getlimit, gethashcode).
