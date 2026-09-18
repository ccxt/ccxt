# cs90 U05 — `object symbol|url|marketId = getValue(...)`: local-name + receiver proof

Branch `cs90-U05` (worktree `/root/worktrees/cs90/U05`), base `d847892a6fcf5699640862316303b6344a3e4daf`
(cs-strict-INT), ast pin `404e9daa7f0ab58d085ed04aaa61a19546dfeda2` (unchanged — U05 is **not** an `[AST]` unit).

**Result: 25 declarations typed, 1 cast removed, farm-green (job 668, exit=0).**

## Family (what actually fired)

`const x = this.urls['k1']...['kn']` (all keys string literals, n >= 2, non-numeric) and
`const x = this.options['chainName']` — the *literal-key* reads of the two members U05 owns. The
value-box proof is the file's own `describe()` literal (the pre-existing, cs-strict-landed
`urlsDescribeStringProducer`); this unit adds the three shapes that rule could not see:

| # | rule | sites | files |
|---|---|---|---|
| 1 | `x as Dict` / any `as T` the C# printer does not cast, in the middle of an urls chain: `(this.urls['api'] as Dict)['ws']['privateV2']` | **11** | pro/kraken.cs (privateV2 x7, publicV2 x3, private x1) |
| 2 | the describe() literal lives in a sibling method: `return this.deepExtend (super.describe (), this.describeData ())` | **9** | pro/hitbtc.cs (4), pro/bybit.cs (3), pro/binance.cs (2: `baseUrl` + `url`) |
| 3 | `this.options['chainName']` with a whole-corpus per-key writer census | **5** | dydx.cs |

(1)+(2) print `string? x = ((string)getValue(getValue(...this.urls...)));`; (3) prints
`string? chainName = ((string)getValue(this.options, "chainName"));`. Sites typed = 25.
One cast removed: `((string)baseUrl).Replace(...)` -> `baseUrl.Replace(...)` (binance
`getStockWsUrl`, the string-receiver pass, because `baseUrl` is now a declared `string?`).

Reproduce: `npx tsx build/csharpTranspiler.ts --force --noTests <ids>` / `--force --ws` /
`--force --prediction` (id lists: `campaigns/cs90/tools/U05/ids-{rest,ws,pred}.txt`).

## Rules / tables touched

`build/csharp-local-types.js` only:

- `asExpressionPrintsBare()` (new) + `urlsLiteralChain()`: unwraps an `AsExpression` wrapper in the
  chain. Proof it moves no box: `ast-transpiler` `printAsExpression` emits the BARE operand for
  every `as T` except three spellings (`as any` -> `((object)x)`, `as string` -> `((string)x)`,
  `as any[]` -> `(IList<object>)(x)`, src/csharpTranspiler.ts:2102-2130); those three keep the
  chain unreachable in this rule. The emitted `getValue(getValue(this.urls, "api"), "ws")` for the
  kraken sites is byte-identical to the un-cast spelling — verified in the generated tree.
- `describeOwnLiteralMethodCall()` (new) + `ownDescribeLiteral()`: resolves the merge literal through
  a zero-argument `this.<name>()` argument of the describe() `deepExtend` when the file defines that
  method EXACTLY ONCE and its body is exactly `return { ... };`. Conservative by construction: two
  definitions, extra statements, or an early return keep the local `object`. The generated C# keeps
  the same merge (`public override Dictionary<string, object> describe() { return this.deepExtend(
  base.describe(), this.describeData()); }` in pro/hitbtc.cs:11-14) so the runtime value of
  `this.urls` is unchanged by the resolution.
- `OPTIONS_LITERAL_STRING_KEYS = ['chainName']` + `optionsLiteralStringProducer()` (new), wired into
  `csharpLocalTypeOf` after `urlsDescribeStringProducer`. Value census (ts/src, whole corpus):
  dydx `describe()` spells `options.chainName = 'dydx-mainnet-1'`; the only writer is
  `this.options['chainName'] = 'dydx-testnet-4'` in `setSandboxMode` — both string literals. The
  three dynamic `options[...]` write shapes cannot produce that key: `[cacheKey]` = 'tradeMarketsById'
  (prediction/opinion.ts), `[marketType|type]` = a market type (pro/binance.ts), and
  `[helper]` from a `marketHelperProps` list — the corpus defines exactly three lists (hyperliquid
  `['hip3TokensByName','cachedCurrenciesById']`, kraken `['marketsByAltname','delistedMarketsById']`,
  pacifica `[]`). The C# base has no other options write (`Exchange.Options.cs#initializeProperties`
  = describe() + user config). The header comment's old blanket "`this.options['key']` stays object"
  bullet is amended to name this one exception and why.

## Census

```
before: locals: object=9304  typed=44132 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
after:  locals: object=9279  typed=44157 typed%=82
        casts: (string)=2137 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
```

(`(string)` rises because the new `string?` declarations carry the printer's `((string)...)` cast;
object locals -25, typed locals +25.) Family residual: `object url = getValue(...this.urls...)`
102 -> 83; the other 269 `symbol` + 24 `marketId` locals are untouched by design (below).

## verify-diff.py

`python3 campaigns/cs90/verify-diff.py HEAD` -> `files=5 pairs=26 unexpected=0`.
Every pair is `object x = REST` -> `string? x = ((string)REST)` (declaration-only, initializer
byte-equal modulo the added cast) plus the one cast-removal pair in binance (`((string)baseUrl).Replace`
-> `baseUrl.Replace`). Fixed point: the scoped regens re-run hash
`git diff -- cs/ | sha256sum` = `f9b1159cad41d8f0915d607064be7c950ab1bd997ed4aabae9d5a0427e04fd98` twice,
and the farm's forced transpile reported `branch_update=unchanged`.

## Farm

- code sha `7d9c8c43ee80b6c40be2b8727a707fab68bbe27c` (the only commit that touches build input)
- `ccxt-farm build --targets cs --wait` -> `HEAD 7d9c8c43ee8 job=668 exit=0 branch_update=unchanged
  generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`
- `ccxt-farm status 668`: `state=succeeded exit_code=0 targets=cs`; `buildCS` log:
  `Build succeeded. 0 Warning(s) 0 Error(s)` (ccxt + cli + tests).
- REPORT-only tip `a3e064a3b0494a5ff59b5acfed2ca14404937ca5` re-gated for completeness -> `job=675
  exit=0 branch_update=unchanged generator=404e9daa...` (`buildCS`: 0 Warning(s) 0 Error(s)). The
  later REPORT commits change no build input, so 7d9c8c4 stays the farm-green code sha.

## Rejected sub-cases (each with the reason)

1. **`object symbol = getValue(market, "symbol")` (121) + `GetValue(market, "id")` (7)** — U01 owns
   the market-row receiver+key family; the lower unit number owns a contested site. No rule added
   here, so the integrator cannot get a double-claim.
2. **`object symbol = getValue(symbols, i)` (120) + `marketId = getValue(marketIds, i)` (16)** —
   U02's loop-element family.
3. **`object url = add(add(baseUrl, ".."), ...)` / ternary-initialised url locals (~40)** —
   U19 (add) / U22 (ternary) own the join; the urls leaf proof alone does not type them.
4. **Dynamic urls keys, e.g. `this.urls['api'][api]`, `getValue(getValue(this.urls, urlKey), "ws")`
   (22 + 17)** — the literal spells a *different* key set than the runtime map (whole-section swaps
   write `urls['api'] = urls['test'|'demo']`), so no single leaf kind can be named. Unchanged from
   the pre-existing rule's own reject list.
5. **`object url = null` later written (12)** — U17's null-init join.
6. **`this.urls['api']['ws']['public']` in ts/src/pro/bydfi.ts** — the file's literal spells
   `api.ws` as a *string*, so the third key resolves to `absent`: reading a key off a string is not
   a string box. Correctly left `object`.
7. **bybit `getWs*` / poloniex `sign()` url locals** — later writes to the same local
   (`url = url[accessibility]['usdc']`, `url = this.urls['api']['swap']`) or `url += ...`; the
   scanner rejects an unprovable later write. Rejected, not weakened.
8. **Non-null `string` (instead of `string?`) for chains whose every sibling section spells the
   suffix as a string (would unlock `getUrl(): url + '/business'` in okx/hollaex and the
   self-concat `url = url + '?'` in coinbaseexchange, ~4 sites)** — rejected on doubt: the fence
   that proves `string?` cannot prove *non-null*, because the base `setSandboxMode` writes
   `urls['api'] = urls['test']` and a literal that does not spell `test` hands back the base's null.
   A `string` declaration would move `add(object, object)` (null left -> null) to `add(string, *)`
   (null left -> the RIGHT operand), i.e. `getUrl() === '/business'` instead of `null`. Not taken.
9. **`object chainName` as non-nullable `string`** — same class: the value today is always a string,
   but the user config can override `options.chainName` (`initializeProperties` deepExtends it), so
   the box is only provably string-or-absent, hence `string?`.
10. **The other `this.options` keys (chainId 13, ws 4, listenKey 4, versions 3, auths 3, sandboxMode,
    requestId, recvWindow, orderTypes, tickerSubs, authToken, advanced, access, settlementCurrencies,
    networkNamesByChainIds, coinbaseAccountsByCurrencyId, delistedMarketsById, fetchMyTradesMethod,
    _temp_currencies_chains)** — per-key census rejects each: `chainId` = 11155111 (Int64) in
    ts/src/dydx.ts, `requestId` = Int64 counters, `sandboxMode` = bool, `versions`/`auths`/`access`/
    `tickerSubs`/`orderTypes`/`settlementCurrencies`/... = dictionaries or lists. The blanket reject
    in the header stands for all of them.
11. **`getValue(<row>, "symbol")` on row dictionaries whose receiver is an element read or a
    parameter (`trade = trades[j]`, `ticker`, `parsed`, `order`, `fee`, `fundingRate`, ...
    ~100 sites)** — the value at the key is a string in every row builder, but the *receiver's* box
    is not provable at the read (the printer emits the lowercase `getValue`, i.e. an `object`
    receiver; a parameter's box is only narrowed after printing). This is the header's documented
    "receivers that are parameters / a this.safeList result / a dictionary" reject class. Census +
    per-receiver list: `campaigns/cs90/tools/U05/`.

## Hotspots

- `hotspot: build/csharp-local-types.js` — three additions (as-cast unwrap in `urlsLiteralChain`,
  `describeOwnLiteralMethodCall` in `describeOwnLiteral`, `optionsLiteralStringProducer` +
  `OPTIONS_LITERAL_STRING_KEYS` + the header census comment), ~120 lines including comments.
- `build/csharpTranspiler.ts` — **untouched**. ast-transpiler src — **untouched** (no `[AST]` work,
  no pin bump). Hand-written `cs/ccxt/base/**` — **untouched**.

## Residual risk

- The `(string)` cast now heads 25 more declarations. For every one of them the value box is a
  string-or-null by the describe()-literal / per-key census, exactly the class cs-strict already
  landed; a **user config** that writes a non-string under the same literal path (e.g.
  `{'urls': {'api': {'ws': 123}}}` or `{'options': {'chainName': 123}}`) throws
  `InvalidCastException` at that line where the untyped code passed the value through. This is the
  pre-existing rule's accepted hole, not widened by this unit (the new shapes are resolved to the
  SAME literal, one method call further away).
- 9 of the 25 sites depend on the sibling-method literal resolution; the guard is structural
  (single zero-argument definition, single `return { ... }` statement), but a future edit that turns
  `describeData()` into a computed/merged literal would need the rule re-checked — it would keep
  returning a literal (or `undefined`), never a *different* object.
- Runtime lanes were not re-run in this unit (farm build only): the affected paths are ws URL
  selection (kraken/bybit/hitbtc/binance pro) and dydx order signing (`chainName`). Both consume the
  value as an argument (`this.watch...`, `this.client(url)`, `signDydxTx(..., chainName, ...)`), and
  the emitted C# initializer expression is byte-identical to the pre-change one.

## Campaign tooling (outside the repo, `campaigns/cs90/tools/U05/`)

`urls-fence-census.mjs` (independent AST census of every urls chain read + fence verdict),
`u05-sites.py` / `u05-shapes.py` (per-site classifier verdict table from the instrumented run),
`u05-url-sites.py` (residual family list from the generated tree), `ids-{rest,ws,pred}.txt`.
