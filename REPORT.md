# U58 — `((IDictionary<string,object>)x)` receiver casts on declared dictionaries (element read/write, Object.keys/values, delete)

Family: the `((IDictionary<string,object>)x)` interface cast the C# printer wraps around a
dictionary element access **when the receiver's emitted declaration already is a concrete
dictionary** (`Dictionary<string, object>` / `IDictionary<string, object>`) — the cast only names
the box the declaration carries, so it is an identity conversion. S21/S22 (cs-strict) gated the
element WRITE for LOCALS; this unit gates the remaining shapes (element READ, `Object.keys`,
`Object.values`, `delete`) and extends the mechanism to PARAMETER receivers.

## Commits / branches

| what | ref | sha |
|---|---|---|
| ast-transpiler (`src/csharpTranspiler.ts`, `tests/csharpTranspiler.test.ts`, `dist/`) | `/root/worktrees/cs90-ast/U58` branch **cs90-U58** (base 404e9daa) | **d4cf00563d4f23c072dbb915f399e62aafcffc76** |
| ccxt family + pin (package.json → `github:ccxt/ast-transpiler#d4cf00563d4f…`, shipped via `ccxt-farm pin`) | `/root/worktrees/cs90/U58` branch cs90-U58 | **03506ca784090229090dbb9c60dda8ad943f62f7** (farm-green, job 878) |
| this REPORT (tip; adds only `REPORT.md` — `git diff 03506ca HEAD -- cs/ build/ package.json` is empty) | same branch | the commit carrying this file |

## Rules / tables / passes touched

ast-transpiler (`src/csharpTranspiler.ts`, +51/−1, `hotspot: ast-transpiler src/csharpTranspiler.ts`):

- `csharpReceiverIsDeclaredDictionary(expression)` — the single gate: the consumer's
  `csharpDeclaredReceiverType(node)` hook (S21's existing hook signature, unchanged) answering one
  of the two dictionary spellings. No hook installed → `undefined` → the upstream cast, byte for
  byte (proved by the two new jest cases, which fail on the base printer:
  `git show 404e9da:src/csharpTranspiler.ts` → `2 failed, 116 passed`).
- New call sites of that gate: `csharpNativeElementAccess` (element READ, string keys only),
  `printObjectKeysCall`, `printObjectValuesCall`, `printDeleteExpression`. The element WRITE gate
  (`csharpDictionaryElementWriteTarget`, S21) was already there and now reaches parameters too.
- `csharpParamTypes` + `printParameter` recording + `csharpPrintedParamType(receiver)` — the
  printer's own parameter arm: the type the printed SIGNATURE gives the binding (`Dict` →
  `Dictionary<string, object>` under `INFER_ARG_TYPE`). Read-only (no printer rule consults it);
  ccxt prints every parameter `object` (`INFER_ARG_TYPE: false` in the C# config, verified by
  probe), so for ccxt the parameter answer comes from the post-print layer below.

ccxt (`build/csharp-local-types.js`, +53/−20; `build/csharpTranspiler.ts`, +90/−20,
`hotspot: build/csharpTranspiler.ts`):

- `receiverDeclaredType` (the `csharpDeclaredReceiverType` hook): the `request`-only name gate is
  dropped (the printer-side gate was always generic); the answer now comes from the recorded
  emitted declaration line (`declaredLocalOfUse` + new `recordedDictType`, the same evidence S22's
  index-write hook reads), then the existing `csharpLocalType` / `getCSharpLocalType` fallback;
  a PARAMETER binding answers from `csharpPrintedParamType`.
- `csharpDictionaryIndexWriteNeedsNoCast` (S22's boolean hook) reuses `recordedDictType` and the
  parameter arm, so both printer paths answer identically.
- **`retypeDictReceiverCasts(content)`** (new post-print pass, entered through
  `retypePrintedReceiverCasts` in all 4 pass chains) — a parameter's C# type exists only in the
  emitted signature (ccxt prints `object` and retypes the ones its passes own), so the pass reads
  the final signature text and strips the casts on those parameters, mirroring the existing
  `retypeStringReceiverCasts` (whose comment already covers "the typeCoreArgs-narrowed parameters,
  whose type exists only in the printed signature"). Same shadow guards: a name the body binds as a
  non-dictionary (local, lambda/foreach/catch/for/using/fixed variable) is skipped.
- No hand-written base file touched (`cs/ccxt/base/Exchange.{SafeMethods,Functions,…}.cs` and
  `cs/ccxt/ws/*` byte-identical); no `ts/src` edit.

## Census

Campaign census (`campaigns/cs90/census.sh`, cs/ccxt/exchanges/**), base d847892a6 → after:

```
before: casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
after : casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2238 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
```

`locals: object=9304 typed=44132 typed%=82` and `params/returns/helpers` lines identical before and
after — this unit is casts only.

Counts: **370 changed lines, 380 cast occurrences removed** (whole `cs/` tree; 325 in the
cs/ccxt/exchanges/** census scope, 2563 → 2238). `typed_declarations = 0` (no `object N = …`
declaration changed — every changed line is a cast removal, see the classifier below).
Shape split of the 380: `Object.keys → x.Keys` 215 · element READ `x["k"]` 131 ·
`delete → x.Remove` 15 · `Object.values → x.Values` 14 · element WRITE `x["k"] = v` **5**.
Files: 117 (venues REST/pro/prediction, generated base `Exchange.BaseMethods.cs`,
`PredictionExchange.cs`, generated tests tier).

Parameter receivers (the roster's shape): **6 sites**, all converted — the five writes in
`Exchange.BaseMethods.cs#safeCurrencyStructure(Dictionary<string, object> currency)` (param typed
post-print by `typeCoreArgs`, `CORE_DICT_ARGS['safeCurrencyStructure']=[0]`) and
`bitopro.cs#parseCancelOrders(IDictionary<string, object> data)` (`Object.keys(data)` →
`new List<object>(data.Keys)`, `CORE_IDICT_ARGS`).

## Gate output

`python3 campaigns/cs90/verify-diff.py d847892a6fc`:
`files=117 pairs=370 unexpected=370`. The shared script has no rule for a cast removed inside a
statement (it models declaration/return/signature/element-cast pairs), so all 370 report as
unexpected — the documented behaviour for statement-level cast-removal families. The unit-local
classifier `campaigns/cs90/tools/U58/classify_diff.py` (with `--selftest`) accepts a pair only when
the plus line is the minus line with a non-empty SUBSET of its `((IDictionary<string,object>)NAME)`
casts removed and nothing else changed:

```
$ python3 campaigns/cs90/tools/U58/classify_diff.py --selftest
SELFTEST PASS: 3 legal cast-removal pairs accepted; a mutated value, an added line and a foreign (IList) removal each flagged
$ python3 campaigns/cs90/tools/U58/classify_diff.py          # diff vs d847892a6fc
cast-removal pairs: 370
unclassified pairs : 0
```

Determinism: full local regen (REST + base + tests, `--ws`, `--prediction`) re-run on the committed
tree leaves `git diff -- cs/ | sha256sum` unchanged
(`ba8d63cd4c0d4e62213270f2a4a16dff441c82fb678d2da78fe5fe54c23333ea`), i.e. the tree is a fixed point.

Farm: `ccxt-farm build` for the final code sha (force-push of the tip with `-o build=cs`, job
878) →

```
HEAD 03506ca784090229090dbb9c60dda8ad943f62f7 job=878 exit=0 branch_update=unchanged generator=d4cf00563d4f23c072dbb915f399e62aafcffc76
```

`branch_update=unchanged` = the farm's own regeneration (with generator d4cf005) reproduced the
committed tree byte-for-byte; `skipped_exchanges=76` = the tree was already up to date for those
venues (the committed output is the generator's). `ccxt-farm log 878 --step buildCS` tail:
`Build succeeded. 0 Warning(s) 0 Error(s)`. Earlier identical-tree builds (job 853 for 003f19c0645,
job 873 for 05e265e552b — the pre-split commits) are superseded by this one.

## Rejected sub-cases (census over the whole `cs/` tree, `tools/U58/census3.py`)

| sub-case | sites | reason |
|---|---|---|
| `object`-typed parameter receivers (`parameters`, `headers`, `orderbook`, `body`, `request`, …) | 257 writes / 76 keys / 43 reads / 4 removes | the emitted signature is `object`; the cast is REQUIRED. Retyping those parameters is U51/U52's family (S43 rejected `params`) — nothing to drop here. |
| member receivers (`this.urls`, `this.options`, `this.features`, `this.markets`, `this.trades`) | 192 writes / 8 keys / 8 reads / 4 removes | the hook answers for bindings only; a member's C# type would need a member-type table (U05/U11/U30 families). Left byte-identical. |
| destructuring-temp receivers (`var request = ((IList<object>)tmp)[0]`) | 24 writes | the declared type is `var` = `object` (the element of `IList<object>`), so the cast is needed; only the element-cast family (U13/ELEM_CAST) can type these. |
| nested-write OUTER casts (`((IDictionary<string,object>)x["k"])[…] = v`) | 70 sites keep the outer cast | the receiver is an element access whose static type is `object` — the cast is required. The INNER cast on the typed receiver is dropped instead (that is the 131 element-READ removals, incl. the nested shape). |
| `+=` element writes | 0 sites on typed receivers | `x["k"] += v` on an `object` element needs the cast; the write gate was already `=`-only (S21) and stays so. |
| parameters typed by a pass running AFTER the post-print chain (`removeRedundantClientCasts`, ws regexes, `dropRedundantObjectBoxCasts`, `retypeCacheElementWriteCasts`) | 0 sites | census after the change: no cast site remains on a dictionary-typed parameter, so no such pass introduces one. |
| `GetValue`/`getValue` reads on typed receivers (S63 twin path) | 0 changes | the native read gate is only reached with a proven key; the twin (`GetValue(x, "k")`) is a different spelling and is not this family. |

## Residual risk

- The parameter half is a post-print text pass: it keys on the emitted signature line, so a
  signature that spans lines differently than `sigRe` expects would be skipped (safe: the cast
  stays), never mis-applied — the pass only deletes a cast token whose receiver is a
  dictionary-typed parameter and whose name has no other binding in the method.
- All 380 removals are identity conversions (`x["k"]`, `x.Keys`, `x.Values`, `x.Remove`) on
  `Dictionary<string, object>` / `IDictionary<string, object>`; a null receiver throws the same
  `NullReferenceException` before and after the change. The farm build (0 warnings, 0 errors) and
  the id-tests/static lanes are the runtime proof for the request/response paths (the affected
  lines are request building, currency-structure building and market indexing).
- The shared `verify-diff.py` has no acceptor for this family (370 unexpected); the integrator can
  add one by mirroring its own `ok_string_receiver` rule with the `((IDictionary<string,object>)NAME)`
  token — `tools/U58/classify_diff.py` is that rule with a selftest.
- Not covered by design: `this.`-member receivers and `object` parameters (table above).
