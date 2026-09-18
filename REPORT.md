# U04 — `getValue(orders|orderbook|balances|positions|markets|trades|tickers|rawPositions|rawMarkets|chains, key)`

Family (UNITS.md U04), roster line only. Branch `cs90-U04`, worktree `/root/worktrees/cs90/U04`,
base `d847892a6fcf5699640862316303b6344a3e4daf` (PR #30530 head). NOT an `[AST]` unit — nothing in
`/root/ast-transpiler`, no pin change, no `ts/src` edit, no hand-written `cs/ccxt/base` edit.

## Result: 37 sites typed, 0 casts removed

```
before: locals: object=9304 typed=44132 typed%=82
after : locals: object=9267 typed=44169 typed%=82      (object -37 / typed +37)
casts : (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334
        (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        — unchanged (the family adds one cast back per site; it removes none)
```

`37 sites typed` = `ccxt.pro.ArrayCache` declarations whose initializer is a ws member cache
ELEMENT read, behind the exact cast back:

* `this.trades[key]` — **21 sites** (`stored` 8, `trades` 5, `tradesArray` 4, `cache` 3,
  `strored` 1), cs/ccxt/exchanges/pro/*.cs (19) + cs/ccxt/exchanges/prediction/*.cs (2, myriad +
  opinion);
* `this.ohlcvs[symbol][timeframe]` — **16 sites** (`stored` 11, `ohlcv` 4, `ohlcvCache` 1),
  cs/ccxt/exchanges/pro/*.cs.

26 files touched (24 pro + 2 prediction), every line a `object X = getValue(...);` →
`ccxt.pro.ArrayCache X = ((ccxt.pro.ArrayCache)getValue(...));` pair:

```
$ python3 campaigns/cs90/verify-diff.py HEAD~1
files=26 pairs=37 unexpected=0
```

## Rule / proof

The family is "an element read of a ws member cache whose ELEMENT box is provable". This is the
`this.orderbooks[symbol] -> ccxt.pro.IOrderBook` rule (`orderbookMapReadType`) extended to the other
member caches the writer census proves; the element type is named behind the same cast-back the
string-element family already uses (`elementAccessElementType`), so the emitted read is unchanged
and only the declaration line moves.

Proof (all scripts under `campaigns/cs90/tools/U04/`, run over `cs/**` at the base tree):

* **`this.trades`**: `preflight.py cs` → `trades-elem 84`, `trades-whole 4`. All 84 element writes
  across the corpus store `new ArrayCache*` / `null` / a local whose every assignment in the
  enclosing method is one of those shapes (the `stored` / `tradesArray` / `tradesCache` / `trades`
  null-init idiom: `object stored = this.safeValue(this.trades, symbol); if (stored == null)
  { …; stored = new ArrayCache(limit); }`) or a read-back of the same map (`= tradesArray` where
  `tradesArray = getValue(this.trades, symbol)`, `((symbol == null)) ? null : this.safeValue(...)`).
  No `this.safeValue(this.trades, k, <default>)` call exists anywhere, so no non-cache default can
  reach the map. The 4 whole-field writes are all EMPTY-map producers
  (`this.createSafeDictionary()` ×2, `createSafeDictionary(true)`, `new Dictionary<string,
  object>() {}`). No base/ws file writes an element (`cs/ccxt/{base,ws}/*.cs` → 0 sites).
* **`this.ohlcvs[symbol][timeframe]`**: the symbol bucket is a `Dictionary<string, object>` — its
  53 writers are dict literals (17) and `safeValue/safeDict` with a dict default (36); the bucket's
  49 element writes store `new ArrayCacheByTimestamp(limit)` or the same null-init idiom
  (`bucket_elem.py` run per read-owning class: all `ok`).
* **Inheritance**: `inheritance.py` walks the generated class graph: of the read-owning classes only
  `kucoin` (trades) and `bybit` (ohlcvs) have descendants (`kucoinfutures`, `bybiteu`), and neither
  descendant writes the cache member at all → a subclass instance cannot put a different box in the
  map the parent's typed read reads (`descendant-write sites: 0`).

Changed rule (`build/csharp-local-types.js`, +67 lines): `CSHARP_LOCAL_WS_CACHE_ELEMENT_TYPES`
(`'trades' -> 'ccxt.pro.ArrayCache'`), `wsCacheElementReadType` / `wsOhlcvsBucketReadType` (both
gated on `ts/src/` and not `ts/src/test/` or `examples/`, the same file gate the typed-dict read
uses), and one `else if` clause in `csharpLocalTypeOf` that sets `type` + `cast`. Everything else —
the use scan (`csharpLocalIsSafeToRetype`), the write join, the printer — is untouched, so any site
the scan rejects keeps `object` (a site that stays `object` is not a diff line).

## Rejected sub-cases

| N | sites | reason |
|---|---|---|
| 24 | `object bids/asks/bookSide = getValue(orderbook, "bids"\|"asks")` (and 52 argument-position reads) where `orderbook` is a proven `ccxt.pro.IOrderBook` local | `IOrderBook : IDictionary<string, object>` — the indexer contract says nothing about the value type; only the `IAsks asks` / `IBids bids` PROPERTIES are typed. The corpus writes dict-shaped orderbook rows with LIST slots into objects of this family (`extended.cs:1099` `orderbook["bids"] = this.arraySlice(...)` = `List<object>`, `pro/gemini.cs:659` writes back whatever it read, the REST parse helpers' `result["bids"] = this.sortBy(...)`), and `getOrderBook()`'s `as ccxt.pro.IOrderBook` admits anything stored in `this.orderbooks` (gemini stores a plain `Dictionary<string, object>` from its `ob` branch). A hard `(ccxt.pro.IOrderBookSide)` cast would throw where the untyped box flowed on. |
| 7 | `object cache = getValue(this.positions, type\|accountType\|instType)` (binance ×3, gate ×2, toobit ×2, bitget) | the member is not uniform: other classes write a whole `ArrayCacheBySymbolBySide` into `this.positions` (39 sites) and CSHARP_LOCAL_WS_MEMBER_TYPES' own comment documents the account-keyed `Dictionary<string, object>` writers; the field is shared by the hierarchy, so the element box needs a per-class census the member table deliberately avoided. U11's line owns the member (`this.safeValue(this.positions, …)` sits in the same methods as these reads). |
| 3 | `object market = getValue(this.markets, symbol\|marketHandle\|…)` | market-row family — U01 owns the row key tables (lower unit number), and the row's per-key types are U01's mechanism. |
| ~250 | receivers declared `List<object>` / `IList<object>` (`orders`, `balances`, `markets`, `chains`, `rawPositions`, `rawMarkets`, `trades`, `tickers`, `positions` locals) | a list element is `object` by contract (the U03 rule); the roster line assigns list element reads to the `i`-keyed units (U02/U03/U06). |
| ~50 | receivers declared `object` (parameters like `handleDelta(object orderbook, …)`, `object tickers/positions`) | no declared type to key the element box on; retyping those receivers is other units' work (U06/U11). |
| 16 | `getValue(this.ohlcvs, …)` / `getValue(this.tickers, …)` element reads | they exist only in ARGUMENT position in this tree (`this.safeValue(getValue(this.ohlcvs, symbol), tf)`, `client.resolve(getValue(this.tickers, symbol), …)`) — zero declaration sites, so the rule has nothing to retype; the locals fed by them are the `safeValue` family (U11). |
| 1 | ndax's ohlcvs bucket (`ndax.cs:364`) | `safeValue(…, timeframe, new List<object>() {})` is written back into the bucket, so THAT exchange's bucket can hold a list — the reason the ohlcvs rule is scoped to the `getValue(getValue(this.ohlcvs, …))` read shape and proven per read-owning class (`bucket_elem.py`) rather than being a member-wide element rule. ndax has no typed read site. |

## Residual risk

* The added `(ccxt.pro.ArrayCache)` cast is a runtime-checked reference cast: a non-ArrayCache box at
  the key would throw `InvalidCastException` where the untyped `object` flowed on. The census above
  covers every writer in `cs/**` for both members (84 element + 4 whole-field writes for
  `this.trades`; 49 bucket-element + 53 bucket writes for `this.ohlcvs`), plus the descendant
  analysis. `null` (an absent key) is safe: `(ccxt.pro.ArrayCache)null` → null.
* The census is textual (regex over the emitted C#), not the TS checker. Hand-checked samples:
  `hashkey.handleTrades`, `deribit.watchOHLCV`, `cex.handleTrades/handleOHLCV`,
  `whitebit.watchOHLCV` (`"unknown"` key), `bullish/coinbaseinternational/weex` (read-back writes),
  `gemini` (`storesForSymbols` alias map), `ndax` (the reject above).
* Element reads that are NOT declarations are untouched (argument position), and every site the use
  scan rejects keeps `object` — only the 37 pairs above are in the diff.
* No compile-time-only risk was accepted: the farm build compiles the whole tree
  (`buildCS`: 0 warnings, 0 errors).

## Hotspots

* `hotspot: build/csharp-local-types.js` — the shared classifier; this unit adds one table, two
  predicates and one `csharpLocalTypeOf` clause. All three are keyed by MEMBER NAME
  (`this.trades` / `this.ohlcvs`), so a sibling unit adding another member merges mechanically; the
  new clause sits in the `elementType → wsCacheElement → marketRowStringReadType` chain and must
  stay gated on the file being a `ts/src/` exchange source.
* no `build/csharpTranspiler.ts`, no `/root/ast-transpiler` src, no hand-written
  `cs/ccxt/base|ws` file, no `ts/src` file was touched (no bridge twins, no pin bump, no
  other-language output).

## Gates

* Baseline first: `git diff --stat -- cs/` empty on the untouched tree; then
  `--force --ws --noTests hashkey deribit cex toobit` on the restored (unmodified)
  `build/csharp-local-types.js` → `git diff -- cs/` still empty.
* Regen (local slots, `--local`): REST `--force --noTests <104 ids>`, then
  `--force --ws --noTests <76 ids>`, then `--force --prediction --noTests <7 ids>`.
* Determinism: after the edit, `git diff -- cs/ | sha256sum` before and after re-running the three
  scoped regens → `eddab1be4db7cb5d647ffeca0fdae197dc469491d67195c46a10ff7a1b714436` both times
  (fixed point; the farm's own forced regeneration reports `branch_update=unchanged` as well).
* `ccxt-farm build --targets cs --wait` for the code commit `7896b235e0b`
  (`HEAD 7896b235e0b6ee6519a930e2e8c963bb42b42ac4 job=669 exit=0 branch_update=unchanged
  generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`; `buildCS`: `Build succeeded. 0 Warning(s)
  0 Error(s)`; `ccxt-farm status 669` → `state: succeeded, exit_code: 0, skipped_exchanges: 76`).
* The report commit is farm-built as well (`HEAD c8c823e2118 job=681 exit=0
  branch_update=unchanged`); every commit after the code commit touches `REPORT.md` only, which is
  not a build input, and `branch_update=unchanged` re-confirms the fixed point on each of them.
* Tooling left in `campaigns/cs90/tools/U04/`: `census.py`, `sites.py`, `writers.py`,
  `writer_boxes.py`, `check_writers.py`, `bucket_elem.py`, `inheritance.py`, `preflight.py`,
  `ohlcvs_buckets.py`, `dict_casts.py`. Nothing new under `build/`.
