# U09 — `this.safeValue (recv, key, [])` → `this.safeList` (list-only TS usage)

Unit: `cs90/U09` (roster line U09, upper bound 144). Branch `cs90-U09`, base `d847892a6fcf5699640862316303b6344a3e4daf`
(ast-transpiler pin `404e9daa7f0ab58d085ed04aaa61a19546dfeda2`, untouched by this unit).

## Family and mechanism

`object x = this.safeValue(resp, "k", new List<object>() {});` is the C# spelling of the TS
`const x = this.safeValue (resp, 'k', [])`. `safeValue` returns whatever box the wire sent, so the
declaration can only name a type by CASTING the value — a cast that throws
`InvalidCastException` when the key holds a dict (`name only what the box already is`, brief rule 1).
The safe producer already exists: `this.safeList (recv, key, [])` is typed `any[]` in TS and
`List<object>` in the port, and it never throws — a non-list value degrades to the caller's default.
House style says exactly this (`safeValue` only for unknown shapes, `safeList`/`safeDict` when the
shape is known, `ccxt-house-style`).

So the family is a **minimal, transpile-safe TS rewrite on 83 sites**, and the C# side needs no
classifier change: `CSHARP_METHOD_RETURN_TYPES['safeList'] = 'List<object>'`
(`build/csharp-local-types.js:1439`, from cs-strict S25/`retypeSafeCollectionHelpers`) makes the
printer declare the local and drop the eventual cast.

**Rules / tables / passes touched: NONE.** No edit to `build/csharp-local-types.js`,
`build/csharpTranspiler.ts`, the ast-transpiler, or any hand-written `cs/ccxt/base` file. The diff is
`ts/src/**` + the regenerated `cs/ccxt/exchanges/**` only.

### The acceptance rule (per declaration site)

A site is rewritten only when **every** use of its local — and of every `const y = x` copy of it — is
list-shaped or shape-neutral (scope-resolved uses inside the enclosing method):

* structural list ops: `for (const v of x)`, spread, `.length`, an Array method
  (`push/map/filter/slice/concat/…`), a **numeric-literal** element read, `x as List`;
* an element read through a keyed safe\* helper with a **numeric** key
  (`this.safeString (v, 1)`, `this.safeDict (x, 0, {})`) — the receiver is the list;
* a consumer whose **own body** indexes/iterates the argument as a list with no `toArray` coercion
  (verified in the repo): `this.parseMarkets` / `this.parseOHLCVs` / `this.parseDepositAddresses`
  (base: `x.length` + `x[i]`), `this.handleDeltas` / `this.handleBidAsks` / `this.customHandleDeltas`
  (arg 1, base/pro bodies iterate it), `this.inArray (needle, x)` (arg 1,
  `haystack.includes (needle)`), `this.addPaginationCursorToResult (cursor, x)` (arg 1),
  `this.arrayConcat (x, …)` (arg 0 — `(a, b) => a.concat (b)` needs `.concat`, a dict throws);
* shape-neutral: parens/casts, truthiness and other conditions, `===`/`!==`, array-literal element,
  `.toString()`, `String(x)`.
* `return x` (no site needed it; the rule reads the enclosing function's list return annotation).

Accepted sites: **83** (23 `safeValue(x,num)`, 19 `safeString(x,num)`, 9 `safeDict(x,num)`,
3 `safeNumber(x,num)`, 2 `safeInteger(x,num)` element reads; 13 `handleDeltas`, 4 `handleBidAsks`,
1 `customHandleDeltas`, 7 `arrayConcat` (arg 0), 4 `parseDepositAddresses`, 2 `parseMarkets`,
2 `inArray`, 1 `addPaginationCursorToResult`; 3 neutral shapes).

Rewrites: `ts/src/**` 83 lines, `this.safeValue|safeValue2|safeValueN` → `this.safeList|safeList2|safeListN`
(byte-exact apart from the callee token; audited, see below). 37 TS files.

## C# result

37 files, **87 changed line pairs**:

| class | pairs |
|---|---|
| `object X = this.safeValue(R, K, new List<object>() {})` → `List<object> X = this.safeList(R, K, …)` | 69 |
| `List<object> X = ((List<object>)this.safeValue(…))` → `List<object> X = this.safeList(…)` (cast removed) | 14 |
| knock-on, see below | 4 (2 sites) |

Counts: **71 `object` locals typed** (69 family + 2 knock-on), **13 casts removed net**
(14 removed, 1 added by a knock-on: `(List<object>)` census 102 → 89).

Census (`campaigns/cs90/census.sh`, base tree via `git archive HEAD cs` vs the working tree):

```
before: locals: object=9304 typed=44132 typed%=82   helpers: getArrayLength=704 safeValue=1855 safeList=1931
after : locals: object=9233 typed=44203 typed%=82   helpers: getArrayLength=702 safeValue=1772 safeList=2014
casts before: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334
              (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
casts after : (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334
              (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=89
```

## Verification

* **TS type gate**: `npx tsc --noEmit -p tsconfig.json` → exit 0, no output. It is what caught the one
  wrong verdict of the first pass (below).
* **Tree scope / fixed point**: full local regen
  (`ccxt-perf-slot.sh --local npx tsx build/csharpTranspiler.ts --force --noTests`, then
  `--force --ws --noTests`) reproduces the same 37 files / 87 pairs and changes **nothing else** in
  `cs/` — base files, tests, every other exchange byte-identical. 83 TS rewrites = 83 family pairs
  (bijection checked: the only TS→C# name deviations are the printer's `params`→`parameters` and
  `currency['id']`→`GetValue(currency, "id")`).
* **`verify-diff.py HEAD`**: `files=37 pairs=87 unexpected=85`. **Every one of the 85 is this family's
  declaration pair** — a declaration whose initializer also renames its callee, which the checker has
  no rule for (it models a declaration retype with an unchanged remainder, or a cast removal, not
  `object X = f()` → `T X = g()`). The 2 pairs it accepts are the knock-ons. Dedicated pair audit
  `campaigns/cs90/tools/U09/audit_pairs.py` (byte-exact remainder, only the named token(s) may differ,
  `--selftest` proves it rejects a mutated `key` and an unchanged callee): **87 pairs, 0 FAIL**.
* **Farm**: `ccxt-farm build --targets cs --wait` from the committed branch —
  `job 651`, `exit=0`, `Build succeeded. 0 Warning(s) 0 Error(s)`, generator
  `404e9daa7f0ab58d085ed04aaa61a19546dfeda2`, `branch_update=unchanged` (the farm's own `--force`
  transpile reproduced the committed `cs/` tree byte-for-byte), sha
  `ad346830654634047474fbc62658493314a8efab`.

## Rejected sub-cases (111 of 194 sites)

| # | class | reason |
|---|---|---|
| 27 | not-a-declaration | the call is an argument/return (`this.parseOrders (this.safeValue (…, []), …)`), so it prints no `object x = …` declaration; skipping keeps the TS diff to sites with a measurable C# effect |
| 11 | dict-use | the local is read as a dict: `Object.keys (x)` (bitso `withdrawal_fees` ×2, gate `balances`), `this.safeString (x, 'k')` (cryptocom `result`, pro/lbank `rawOHLCV`), `this.safeDict (x, 'k')` (pro/hyperliquid `data`), `Array.isArray (x)` (mudrex, pro/bingx, pro/hitbtc), `typeof x` (mudrex), `id in x` (kraken `fetchOrder` `result` — `response['result']` is a DICT there; the rewrite would have been a real regression) |
| 32 | coercing consumer | the consumer's body calls `toArray` = `Object.values` (`ts/src/base/functions/generic.ts:27`), i.e. it accepts **both** shapes and converts: `parseTrades` 7, `parseCurrencies` 5, `parseLedger` 4, `parseTransactions` 4, `parseOrders` 3, `toArray` 2, `indexBy` 2, `groupBy` 2, `filterBy` 1, `sortBy` 1, `filterByArray` 1. For gemini `parseCurrencies (currenciesArray)` the wire value is a dict, so `safeList` would silently empty the result — no proof, rejected |
| 6 | `arrayConcat` arg 1 | `[].concat (x)` accepts a non-list, only arg 0 (the receiver) is proven (e.g. htx `errors` rejected while its sibling `success` is arg 0 and accepted) |
| 20 | unknown consumer | `this.parseBalance` 3, `this.parseBorrowInterests` 2, `client.resolve (x, hash)` 2, `this.parseMarketLeverageTiers`, `this.parseFundingRateHistories`, `this.parseTicker`, `this.parseAccounts`, `this.parseBorrowRates`, `this.parseLeverageTiers`, `this.parseSettlements`, `this.parseIsolatedBorrowRates`, `this.parseFundingRates`, `this.parsePublicDepositWithdrawFees`, `this.parseWsTrade`, `this.parseWSBalances`, `this.parseWsBalance`, `this.parseOrderBook`, `cache.append (x)`: the consumer's body is not in the base (per-exchange generated parser) or is a promise/append hand-off — rejecting, per `reject on doubt` |
| 5 | dict-literal value | `this.safeOrder ({ … 'trades': x … })` (bitstamp, bitvavo, mercado, onetrading, tokocrypto) — the value escapes into a unified structure, its own uses prove nothing |
| 2 | store-into-field | `order['trades'] = x` (deribit ×2) — same escape, as a dict-field store |
| 4 | later-write | a later write re-boxes the local (bingx `ohlcvs`, pro/bybit `data`, pro/okx `args`, bitrue `spotMarkets`) — the declaration type would no longer be the value's box |
| 2 | element-dynamic-index | `x[id]` where the index is not a numeric literal — a keyed (dict) read; part of the kraken rule above |

The first census pass (43 accepted) also rejected, and the second pass re-classified after review:
keyed safe\* helpers with a numeric key (kraken/bitfinex ticker arrays), positional list consumers
(`handleDeltas`/`handleBidAsks`/`inArray`/`addPaginationCursorToResult`), `arrayConcat` arg 0 and
`parseMarkets`/`parseOHLCVs`/`parseDepositAddresses` — each verified in the consumer's own body.

## Knock-on sites (2, both caused by this unit's TS edits, produced by pre-existing rules)

1. `cs/ccxt/exchanges/gate.cs` `object addresses = this.safeValue(response, "multichain_addresses")`
   → `List<object> addresses = ((List<object>)…)` (+ `getArrayLength(addresses)` → `addresses?.Count ?? 0`).
   The safeValue-twin rule (`build/csharp-local-types.js:3141-3293`, cs-strict S25) now sees a
   `safeList` twin for that (receiver, key) pair — my rewrite of the *other* site of the pair
   (`chains`, gate.ts:2416) — and types the pair. The site's own TS usage is list-only
   (`addresses.length` + `addresses[i]`), which is why both sites agree; the twin rule names the cast,
   my rewrite names the producer.
2. `cs/ccxt/exchanges/pro/bitfinex.cs` `object ohlcvs = new List<object>() {};` → `List<object> ohlcvs`
   (+ `int ohlcvsLength = getArrayLength(ohlcvs)` → `ohlcvs.Count`): the later-write join (U13–U18
   family, pre-existing) now sees a typed `safeList` producer writing `ohlcvs`; the helper→native pass
   then rewrites the two `getArrayLength` reads of that non-null list. Value and behaviour identical.

Both are the campaign's own mechanisms firing on a strengthened proof; they are the only lines outside
the `safeValue`→`safeList` class and both are listed by `audit_pairs.py` (`KNOCK_DECL` ×2,
`KNOCK_NATIVE` ×2).

## Residual risk

* **This unit is a behaviour change in all six ports, not a pure declaration typing.** When the wire
  value under the key is present but is NOT an array, `safeValue` returned that value and `safeList`
  returns the caller's `[]`. Every accepted site's own uses are list-only (a dict there already threw
  or produced garbage: for-of on a non-iterable, `.map` is not a function, `safeString (x, 1)` on a
  dict is `undefined`), so no *working* path changes; a malformed-response path degrades to "empty"
  instead of "garbage". Sites where the value can legitimately be a dict (the `toArray`-coercing
  consumers, `Array.isArray` handlers) are in the reject table above and were NOT rewritten.
* The 83 rewrites touch 37 exchange files across REST and pro; they were reviewed by the classifier
  rule above, not by hand, one file at a time. The strongest single mitigation: the full-tree regen
  and the farm build both reproduce exactly the 37 files listed here.
* Cross-language: Python/PHP/Go/Java/Rust are generated from the same `ts/src` by their own
  pipelines; each port's `safe_list`/`safeList` has the same "return the default when the value is not
  a list" semantics, so the change is uniform. The generated non-C# trees are NOT part of this branch
  (integrator's regeneration).
* `safeList`'s C# body returns `defaultValue as List<object>` and the default is a non-null
  `new List<object>() {}` literal, so the declared local can never be null — the knock-on
  `?.Count ?? 0` → `Count` rewrite is safe for the same reason.

## Hotspots

* `hotspot: none` — `build/csharpTranspiler.ts`, `build/csharp-local-types.js`, the ast-transpiler
  (`/root/worktrees/cs90-ast/pin`, pin unchanged) and every hand-written `cs/ccxt/base/*.cs` file are
  untouched by this unit.

## Artifacts (campaign tooling, not committed to the repo — brief rule 6)

`/root/.hermes/profiles/deepseek/campaigns/cs90/tools/U09/`: `census.js` (site census + verdict rules
+ `--json` accept/reject dump), `apply-edits.js` (byte-exact callee rewrite from the accept dump),
`audit_pairs.py` (C# pair audit + `--selftest`). Raw dumps used for this report:
`/tmp/u09_accept.json` (pre-edit verdicts), `/tmp/u09_verify.txt` (`verify-diff.py`), `/tmp/u09_pre_edit.txt`.

## Farm

`ccxt-farm build --targets cs --wait` on the final commit — job id + exit + sha: see the "Farm" line
under **Verification** (job 651, exit 0). Branch tip carries this REPORT.md.
