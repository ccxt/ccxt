# cs90 U41 — `object x = this.handleOption (method, key, <literal>)` + `this.safeValue (this.options, key, <literal>)`: per-key writer census

Branch `cs90-U41` (worktree `/root/worktrees/cs90/U41`), base `d847892a6fcf5699640862316303b6344a3e4daf`
(cs-strict-INT), ast pin `404e9daa7f0ab58d085ed04aaa61a19546dfeda2` (unchanged — U41 is **not** an `[AST]` unit).

**Result: 66 declarations typed, 0 casts removed, 8 `isEqual(x, "lit")` → `x == "lit"` knock-ons (one
declared class), farm-green (job 839, exit=0, 0 Warning(s) 0 Error(s)).**

## Family (what actually fired)

`object x = this.handleOption (method, key, <bool|string literal>)` (57 sites) and
`object x = this.safeValue (this.options, key, <string literal>)` (3 sites) become
`bool|string x = ((bool|string)<call>)`. `handleOption` resolves through `handleOptionAndParams`
with an **empty params dict** (Exchange.BaseMethods.cs:5036-5040, ts/src/base/Exchange.ts:6877-6880),
so no caller input can reach the value; `safeValue (this.options, …)` is the same read at the
top-level path. The value is therefore one of

    options[method][key] / options[method]['default'+Key] / options[key] / options['default'+Key]
    / the call's own defaultValue

and the site's own default literal is a type token the call already spells. The rule fires when
that literal's kind equals the option-key path's whole-corpus writer census
(`OPTIONS_LITERAL_DEFAULT_CAST_KINDS`, 21 paths, build/csharp-local-types.js:5508-5536) — the cast
back names the box the call hands back.

| kind | paths | sites |
|---|---|---|
| bool | `watchPositions/fetchPositionsSnapshot` (12 writers), `watchPositions/awaitPositionsSnapshot` (12), `watchOrderBook/checksum` (7), `watchBalance/fetchBalanceSnapshot` (7), `createOrder/quoteOrderQty` (5), `postActionRequest/builderFee` (15 incl. the `this.options['builderFee'] = false` writes), `transfer/fillResponseFromRequest` (6), `watchPosition/fetchPositionSnapshot`, `watchPosition/awaitPositionSnapshot`, `fetchMarkets/loadAllOptions`, `fetchMarkets/loadExpiredOptions`, `fetchMarkets/usePrivateInstrumentsInfo`, `createOrder/warnOnSTPForInverse`, `setMarginMode/throwMarginModeAlreadySet` | 57 |
| string | `fetchMarkets\|fetchBalance\|fetchOrdersByStates\|createOrder\|cancelOrders/method` (44 writers), `fetchOrderBook/precision`, `code` (5), `fetchMarketsMethod`, `fetchTickerMethod` | 9 |

29 generated files changed (10 REST + 19 pro). No prediction-tier site fires. Nothing else in the
tree moved: `build/csharpTranspiler.ts`, `ts/src/**`, `cs/ccxt/base/**` and the ast-transpiler
checkout are untouched.

Reproduce: `campaigns/cs90/tools/U41/ids-{rest,ws,pred}.txt` (the 38 REST / 34 ws / 1 prediction
site files) or `campaigns/cs90/tools/U41/{all-rest,all-ws,all-pred}.txt` (the full tree).

## The census the table encodes (whole `ts/src` corpus)

- Every writer of every lookup path is a **literal of one kind** — no `null`, `undefined`,
  expression or assignment writer exists for any of the 21 paths (the only `this.options[…] = …`
  writes of a listed key are `builderFee = false` in aster/grvt/hyperliquid/lighter, bool).
- The three DYNAMIC `this.options[<expr>] =` shapes in ts/src cannot produce these keys:
  `options[cacheKey] = cached` with cacheKey = `'tradeMarketsById'` (ts/src/prediction/opinion.ts),
  `options[helper] = sourceExchange.options[helper]` with helper from a `marketHelperProps` list
  (ts/src/base/Exchange.ts; the corpus defines exactly three lists — hyperliquid, kraken, pacifica),
  `options[marketType|type] = this.extend (options, {...})` (ts/src/pro/binance.ts, market-type names).
- The hand-written C# base writes options only from `describe()` and the user config
  (`Exchange.Options.cs#initializeProperties` deep-extends `getDefaultOptions()`; `extendExchangeOptions`).
- Test/example tree: the only write of a listed key is `exchange.options['checksum'] = false`
  (ts/src/test/tests.ts:288 — the branch the **C#** driver takes; the generated
  `cs/tests/Generated/TestMethods.cs:281` carries the same bool write). No other override of a
  listed key exists in `ts/src/test`, `examples/ts`, `examples/cs`, `cs/tests`.
- The writer census is complete for the `describeData()` sibling-method form too (10 pro files,
  incl. binance/bybit/gate/hitbtc pro) — the first census pass missed it and was re-run with it.

## Rules / tables touched

`build/csharp-local-types.js` only:

- `OPTIONS_LITERAL_DEFAULT_CAST_KINDS` (new, 21 paths) + `optionsLiteralDefaultParts` /
  `optionsLiteralDefaultKind` / `optionsLiteralDefaultCastType` (new), wired into `csharpLocalTypeOf`
  after `urlsDescribeStringProducer`. The declared spelling is **non-nullable** `bool`/`string`: every
  writer is a non-empty literal and `safeValueN` skips `null`/`''` (falling through to the non-null
  default literal), so the box can never be null here. (U05's `this.options['chainName']` is `string?`
  because *its* absent case is a real null — no default literal.)
- `optionsLiteralAsPrintsBare` (new): unwraps an `AsExpression` wrapper when the printer prints the
  bare operand (`ast-transpiler` casts only `as any` / `as string` / `as any[]`; `… as Bool` in
  ts/src/binance.ts#createOrder emits the plain call). The one `as string` site of this family
  (bittrade `fetchOpenOrders/method`) keeps its pre-existing printer cast and is skipped — no double cast.

## Census

```
before: locals: object=9304  typed=44132 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
after:  locals: object=9238  typed=44198 typed%=82
        casts: (string)=2122 (IList<object>)=1922 (bool)=58 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
```

object locals −66, typed locals +66, `(bool)` casts 1 → 58 (+57), `(string)` casts 2113 → 2122 (+9),
`isEqual(` 12034 → 12025 (−9: 8 rewritten condition lines, one of which held two `isEqual` calls).

## Gates

- `python3 campaigns/cs90/verify-diff.py HEAD` → `files=29 pairs=74 unexpected=8`. The 8 UNEXPECTED
  pairs are one declared class: `if (isEqual(method, "lit"))` → `if (method == "lit")`, the printer's
  string-equality rewrite for a now-`string` local (bittrade ×4, blofin ×1, gemini ×2 lines; the
  bittrade `fetchOrdersByStates` line holds two calls). Equivalent for every input: `isEqual` is
  `(object, object)` (Exchange.TranspileHelpers.cs:293) and `method` is a non-null string by the cast.
- `campaigns/cs90/tools/U41/pair-audit.py` → `CLEAN` (all 74 pairs are class A
  `object N = REST;` → `T N = ((T)REST);` with REST byte-equal, or class B the `isEqual` rewrite);
  `--selftest` → `SELFTEST PASS: 10/10` (mutated operand, wrong cast target, renamed local, trailing
  comma, literal mutation and a dropped second `isEqual` all flagged).
- `campaigns/cs90/tools/U41/output-audit.py` (independent, reads the generated tree): 67 typed
  declarations of this shape (66 mine + bittrade's pre-existing `as string` site), **0 with zero
  reads** (no CS0219), use lines = 61 `isEqual(x, true)` + 17 benign (dict values `{ "precision",
  precision }`, the rewritten `==` conditions, `add(…, method)` right operands, `safeString2(…,
  defaultSlippage)`'s default argument, blofin's later `method = "privatePostTradeCancelTpsl"`
  string write, and one sibling declaration in the same method).
- Determinism / fixed point: the scoped regens over the 73 site ids and the full forced regen over
  all 104+76+7 ids produce the **same** diff —
  `git diff -U0 -- cs/ | grep -E '^[+-]' | grep -vE '^(---|\+\+\+)' | md5sum` =
  `bbd3246a0a6854961d225e23a280b7a2` in both runs; the farm's forced transpile reported
  `branch_update=unchanged`.

## Farm

- code sha `db897077a07e5caaa71b8496cc7965de18bc459e` (the only commit that touches build input)
- `ccxt-farm build --targets cs --wait` → `HEAD db897077a07e5caaa71b8496cc7965de18bc459e job=839
  exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`
- `ccxt-farm status 839` → `state=succeeded exit_code=0 targets=cs skipped_exchanges=75
  failing_files=[]`; `buildCS` log tail: `Build succeeded. 0 Warning(s) 0 Error(s)` (ccxt + cli + tests).
- REPORT-only tip `05997ce2b00e14ab9818e2574eef90c055687796` re-gated from a throwaway branch
  (`cs90-U41-gate`, deleted afterwards; the farm's note is keyed by SHA) → `job=855 exit=0
  branch_update=unchanged generator=404e9daa…`. Any later REPORT-only commit changes no build input,
  so `db897077a07` stays the farm-green code sha.

## Rejected sub-cases (each with the reason)

1. **`int` literal defaults (10 sites)** — `object snapshotDelay = this.handleOption ("watchOrderBook",
   "snapshotDelay", 5|6|10|25)`, `… ("watchOHLCV", "limit", 1000)`, `… ("method",
   "maxCostHugeWithApiKey", 3)`, `… ("watchOrderBook", "maxRetries", 3)`. The C# default literal boxes
   as **Int32** (the printer emits `5`, not `5L`), and every option writer is an Int32 literal too, so
   an `Int64` declaration with an `(Int64)` cast would throw `InvalidCastException` on the *default*
   path — the very path the option being unset takes. Rejected on the box, not on the census.
2. **No-default calls (37 sites)** — the rule's first clause (a default literal) is unsatisfiable and
   the absent value is a `null` the site never spells. This includes the 6 sites whose key census is
   uniformly bool (`bybit fetchMarkets/loadAllOptions` + `loadExpiredOptions`,
   `xt watchPositions/fetchPositionsSnapshot`, `upbit createMarketBuyOrderRequiresPrice`,
   `bitmex oldPrecision`, `binance createOrder/warnOnSTPForInverse`): all six are read as
   `isEqual(x, true)` (or its negation), so a `bool?` spelling would have to name a box the call can
   only produce when the option is *absent*, and the null-exact unbox is not what the site spells.
3. **`pacifica createOrder/defaultSlippage` (1 site)** — the key's whole-corpus census **disagrees**:
   hyperliquid writes `'defaultSlippage': 0.05` (a double), pacifica a string. Per-exchange scoping
   would accept it; the global census is the stronger gate and rejects.
4. **Collection defaults (6 sites)** — `fiatCurrencies` (×3), `quoteCurrencies`, `brokenCurrencies`,
   `currenciesValuedInUsd`: the default is a collection literal, i.e. U08/U09's dict/list shape, not a
   scalar type token; the scalar census says nothing about the collection box.
5. **Keys with no writer / non-literal writers** — `execType` (no writer at all), `settings`
   (pacifica: written as `this.createSafeDictionary ()` / a variable), `timeframes`
   (dict writers), `networks` (dict writers + an `extend` write), `batchOrdersMax` (int writer, no
   default), `stableCoins` (list writer), `currenciesByNumericId` (`indexBy…` writers),
   `broker` (9 string + 3 dict writers in tokocrypto — disagreeing kinds).
6. **`method` with a non-literal default** — `pacifica.cs:4038` `this.handleOption (method,
   "maxCostHugeWithApiKey", 3)` uses a *variable* method name (`method`), so the path cannot be keyed;
   `bit2c.cs:558` `this.handleOption ("fetchTrades", "method", optionValue)` has a variable default.
   Both stay `object`.
7. **`object checksum = this.handleOption (…)` sites whose read is `=== true`** — **not** rejected:
   typed with the cast (the accepted hole below), not coerced. The truthiness-coercion route
   (`bool x = isTrue (…)`, the U29/destructured-element-0 mechanism) does **not** apply to any of the
   57 bool sites: every one of them is read as `x === true` (printed `isEqual(x, true)`), where a
   coercion would *flip* the branch for a non-bool override instead of throwing — a silent
   behaviour change the campaign's coercion family explicitly forbids.
8. **bittrade `fetchOpenOrders/method` (`as string`)** — pre-existing: the printer already emits
   `((string)this.handleOption (…))` and the base's own local table types it. The new rule skips
   `AsExpression` shapes that print a cast, so no double cast and no double claim.

## Residual risk

- **The added cast is the family's risk**, the same class the market-row / urls / element-read
  families already carry: a **user config** that writes a non-conforming value under one of the 21
  paths (e.g. `{'options': {'watchOrderBook': {'checksum': 'yes'}}}` or `{'options': {'method': 5}}`)
  now throws `InvalidCastException` at that line where the untyped box flowed on. Every *in-repo*
  writer is a literal of the declared kind and the test tree writes the key with the same kind
  (`exchange.options['checksum'] = false`, the branch the C# driver takes), but no census can exclude
  a runtime config. Every bool site is read as `x === true` (printed `isEqual(x, true)`, or its
  negation) and never as a bare truthiness test, so for an out-of-contract config this turns a
  silently-skipped branch into a loud failure instead of a silent flip.
- **4 of the 66 sites** live in files whose own `describe()` does not spell the key (cex
  `transfer/fillResponseFromRequest`, bitget pro `watchOrderBook/checksum`, toobit pro
  `watchPositions/fetchPositionsSnapshot`, whitebit pro `watchBalance/fetchBalanceSnapshot`): there
  the default literal is the only writer for that instance. The global census still bounds the box (no
  writer anywhere disagrees), but the per-file fence U05 used is *not* part of this proof — that is
  the one place the rule leans on the snapshot table alone.
- **Snapshot, not a re-derivable check**: the classifier cannot re-run the census at classification
  time (no cross-file access in the worker), so `OPTIONS_LITERAL_DEFAULT_CAST_KINDS` is a table with
  its census in the comment, like `MARKET_ROW_*` / `OPTIONS_LITERAL_STRING_KEYS`. A future writer of a
  different kind under one of these paths would need the table re-checked.
- **Compile-time re-binding only, provably identical**: bittrade's three
  `add(add(add(this.id, "…"), method), " method")` error paths move from `add(string, object)` to
  `add(string, string)`. The base documents the invariant (Exchange.TranspileHelpers.cs:484-494) and
  the operand is a RIGHT operand (only LEFT operands may not be typed), non-null by the census.
- **Runtime lanes were not re-run** (farm build only): the touched paths are the ws snapshot gates
  (pro watchPositions/watchBalance/watchPosition, watchOrderBook checksum), binance's
  `quoteOrderQty`/`loadAllOptions`/margin-mode guards, pacifica's builder-fee check and the
  bittrade/blofin/gemini `method` dispatch.

## Hotspots

- `hotspot: build/csharp-local-types.js` — one new family block after `urlsDescribeStringProducer`
  (lines 5470-5620: census comment, `OPTIONS_LITERAL_DEFAULT_CAST_KINDS`,
  `optionsLiteralAsPrintsBare`, `optionsLiteralDefaultParts`, `optionsLiteralDefaultKind`,
  `optionsLiteralDefaultCastType`) plus two edits inside `csharpLocalTypeOf` (line 5848 hoists
  `optionsDefaultType`, line 5873-5879 the branch). ~160 added lines including comments.
- `build/csharpTranspiler.ts` — **untouched**. ast-transpiler src — **untouched** (no `[AST]` work, no
  pin bump). Hand-written `cs/ccxt/base/**` — **untouched**. `ts/src/**` — **untouched** (no TS edit,
  so no other language port is affected).

## Campaign tooling (outside the repo, `campaigns/cs90/tools/U41/`)

`census-options.py` (site + describe()/describeData() writer extraction), `writers.py` (per-key writer
census incl. `this.options[…] =` writes), `verdict.py` (per-site verdict table from the census),
`reads.py` (per-site use-shape census), `pair-audit.py` (`--selftest`), `output-audit.py`, and the
`ids-*` / `all-*` id lists.
