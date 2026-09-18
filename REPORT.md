# U45 — pro-tree residuals: ws cache field reads, awaited `client.future` resolve boxes, `subMessageHashes` elements, `client.futures` / `this.clients` locals

Branch `cs90-U45`, worktree `/root/worktrees/cs90/U45`, base `d847892a6fcf5699640862316303b6344a3e4daf`
(PR #30530 head). Single commit `72e02348d5a85220bff616042480b3f3824d3c1a` on the base.
Farm job **879** `exit_code=0` `branch_update=unchanged` `generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`.

## Result

**136 declarations typed, 8 casts removed** (+1 justified value rewrite). Every retype carries an exact
identity cast back, or no cast where the producer's own C# signature already names the box.

| family | sites | declaration | cast |
|---|---|---|---|
| `this.positions` / `this.liquidations` whole-field reads (`object cache = this.positions`) | 42 / 7 | `ccxt.pro.ArrayCache` | `((ccxt.pro.ArrayCache)…)` |
| `await client.future (HASH)` resolve boxes (U29's deferred census) | 14 | `ccxt.pro.ArrayCache` | `((ccxt.pro.ArrayCache)…)` |
| `object orderbook = this.safeOrderBook(this.orderbooks, symbol)` twins | 5 | `ccxt.pro.IOrderBook` | none (hand-written signature) |
| `getValue(subMessageHashes\|unsubMessageHashes, i)` element reads (`subHash`) | 11 | `string?` | `(string)` |
| `this.markets_by_id` member reads (1 pro + 1 REST + 2 base) | 4 | `IDictionary<string, object>` | none (property type) |
| `client.futures[…]` / `this.safeValue(client.futures, …)` reads (roster's `object future = …`) | 49 | `Future` | `((Future)…)` |
| `this.safeValue(this.clients, url)` reads (roster's `this.clients`) | 4 | `WebSocketClient` | `((WebSocketClient)…)` |
| **total** | **136** | | |

Cast removals (8 lines): the printer's redundant `((WebSocketClient)client)` receiver cast dropped in
`cex` (3), `onetrading` (2), `whitebit` (3) once the `client` local is declared `WebSocketClient`
(`((WebSocketClient)client).subscriptions` → `client.subscriptions`).

Knock-on (1 line): `bybit.cs` `bool usePrefix = (subHash == "orders") || …` — the `isEqual(x, "lit")` →
native `==` emission for a now-`string?` local.

Census (campaign `census.sh`, `cs/ccxt/exchanges/**`):

```
before: locals: object=9304 typed=44132 typed%=82   casts: (string)=2113 … isEqual=12034
after:  locals: object=9221 typed=44266 typed%=82   casts: (string)=2124 … isEqual=12031
```

`object` −83 / typed +134 in the census file set (81 + 49 + 4); the other 2 `object` retypes live in
`cs/ccxt/base/Exchange.BaseMethods.cs`, which the census does not scan.

## Rules / tables / passes touched

Only `build/csharp-local-types.js` (the classifier). No `build/csharpTranspiler.ts` pass, no
ast-transpiler source, no hand-written `cs/ccxt/base/*` edit.

1. **`WS_CACHE_FIELD_READ_TYPES` + `wsCacheFieldFileCensus`** — `this.positions` / `this.liquidations` /
   `this.myLiquidations` whole-field reads. The field is declared `object` (`Exchange.Options.cs`), so the
   local names its box behind the exact cast. Proof = a file-scoped writer census: every
   `this.<member> = RHS` in the same file stores an ArrayCache-family constructor, `undefined`/`null`, or a
   read-back of the same field; ≥1 constructor; **any** element write (`this.<member>[k] = …`, i.e. the
   field is a map) rejects the member. Tree-wide cross-check (`grep -rn "this\.positions = " cs/`):
   ArrayCache constructors + `null` (`Exchange.BaseMethods.cs`) + the five dict-writing venues
   (binance / gate / htx / bitget / toobit) — none of which has a whole-field read; descendants
   (`bybiteu ← bybit`, `kucoinfutures ← kucoin`, `myokx`/`okxus ← okx`, `gateeu ← gate`) write no
   non-cache value. `wsCacheElementReadType` is the element-read twin used only by the resolve census.
   The prediction tier is excluded (U44's sweep).
2. **`awaitedClientFutureBox`** — `object snapshot = await client.future (HASH)`. `Future.GetAwaiter()`
   returns `object` (`cs/ccxt/ws/Future.cs`), so the nameable type is the **resolve** value. The rule
   resolves the message-hash family per file: (a) direct `client.resolve (VALUE, HASH)` with the awaited
   hash text, plus (b) the explicit `future.resolve (VALUE)` inside a method the file spawns with that
   hash (`this.spawn (this.<M>, client, messageHash, …)` where `messageHash` is bound to the awaited hash
   expression in the spawning method). Every settle must be boxed and all boxes must agree, else `object`.
3. **`ORDERBOOK_WIDENING_EDGES`** — the 5 `orderbook` twins stayed `object` only because the later
   `orderbook = this.orderBook (…)` write did not join the map-read initializer (`typeFromValueOrWrites`
   had no `OrderBook → IOrderBook` edge). `assignable` already had it; the join now has the same edge, so
   the declaration keeps the interface and the constructor write stays valid.
4. **`subMessageHashesProducer`** — `this.safeList (subscription, 'subMessageHashes', [])` (and
   `'unsubMessageHashes'`) as a string-elements producer for `elementAccessElementType`. Proof: every
   writer of that key in the same file stores a string array, decided by the TS checker's element type
   (`checkerElementIsString`); `as List` unwraps (no runtime effect). Reads then take the family's existing
   `string?` + `(string)` cast.
5. **`markets_by_id`** added to `CSHARP_LOCAL_WS_MEMBER_TYPES` — `public IDictionary<string, object>
   markets_by_id` is the read's static type (every writer stores createSafeDictionary / a sibling map /
   null); no cast. No generated class declares or hides the property.
6. **`futuresReadCastType` wired** (it existed unwired) — `client.futures[key]` / `this.safeValue
   (client.futures, key)` → `Future`. The hand-written `WebSocketClient.futures` is
   `IDictionary<string, Future>` and its writers store `new Future()`. The roster's `object future = …`
   sites reach the classifier as `var future = …`: the ws text pass (`build/csharpTranspiler.ts:1822`)
   rewrites `object future = ` → `var future = ` *after* printing, so 47 of the 49 pairs are
   `var X = read` → `Future X = ((Future)read)`.
7. **`clientsMapReadCastType`** — `this.clients[url]` / `this.safeValue (this.clients, url)` →
   `WebSocketClient` (+cast). The hand-written `ConcurrentDictionary<string, WebSocketClient> clients`
   (`cs/ccxt/ws/Exchange.WsBridge.cs`) holds only WebSocketClients; the same 4 sites also carry the
   printer's `((WebSocketClient)client)` receiver casts, which the typed local makes redundant.
   Declaration family only — the ternary-arm table (`CSHARP_LOCAL_THIS_ARM_MEMBER_TYPES`) keeps `clients`
   out on purpose. (`var client = this.client (url)`, 113 sites, needs nothing: the C# signature returns
   `WebSocketClient`, so `var` already infers it.)

## verify-diff.py

`python3 campaigns/cs90/verify-diff.py d847892a6fcf5699640862316303b6344a3e4daf` →

```
files=44 pairs=145 unexpected=60
```

All 60 UNEXPECTED pairs are three uniform, mechanically audited classes:

* **51 ×** `var X = <map read>;` → `TYPE X = ((TYPE)<read>);` — 47 × `Future future = ((Future)getValue
  (client.futures, …));` and 4 × `WebSocketClient client = ((WebSocketClient)this.safeValue
  (this.clients, url));`. Same name, same initializer, only the declared type named and the exact cast
  added; `verify-diff.py` models the `object N = …` spelling, and these arrive as the ws text pass's `var`
  spelling of the roster's `object X = …` items.
* **8 ×** the `((WebSocketClient)client)` receiver cast dropped, rest byte-identical
  (`((WebSocketClient)client).subscriptions` → `client.subscriptions`).
* **1 ×** `bool usePrefix = (isEqual(subHash, "orders")) || …` → `bool usePrefix = (subHash == "orders")
  || …` — `installCsharpConditionOperands` emits the native comparison for a `string?` local; `==` on
  `string` is ordinal equality, identical to `isEqual(string, string)` for every input (null included).

Audit: `campaigns/cs90/tools/U45/pair-audit.py <base>` classifies all 145 pairs —
`63 decl+identity-cast ccxt.pro.ArrayCache`, `49 decl+identity-cast Future`, `11 decl+identity-cast
string?`, `8 receiver-cast-drop WebSocketClient`, `5 decl-only ccxt.pro.IOrderBook`, `4 decl-only
IDictionary<string, object>`, `4 decl+identity-cast WebSocketClient`, `1 isEqual-knockon`, `bad=0`. Its
`--selftest` injects a mutated value and must flag it (verified).

Fixed point: `git diff -- cs/ | sha256sum` identical before/after a forced scoped ws regen
(`ee829c4895d8639f1c69e73cd3ad52d28e73d3a77ab37df6de63319fe6eeb0c4`), `--tests` regen left the tree
untouched, and the farm's own `--force` regen reported `branch_update=unchanged` on the final sha.

## Farm

```
job 879  source/head 72e02348d5a85220bff616042480b3f3824d3c1a  targets=cs  state=succeeded
exit_code=0  branch_update=unchanged  generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2  slot 2
```

Admitted via `git push --force farm HEAD:refs/heads/cs90-U45 -o build=cs` (the branch had been gated once
at an earlier tip, so each squash needed a force push; the result note is keyed by sha).

## The `client.future` resolve-value census (U29 deferred)

All 14 awaited sites are typed; the resolve box per message-hash family, per file (the resolve site is
`(future as Future).resolve(cache)` inside `if (messageHash in client.futures)`, in the method the file
spawns with that hash):

| file | awaited hash | resolve value | box |
|---|---|---|---|
| apex 731 | `'fetchPositionsSnapshot'` | `cache = this.positions` after `this.positions = new ArrayCacheBySymbolBySide ()` | ArrayCacheBySymbolBySide |
| aster 1740 | `'fetchPositionsSnapshot'` | same | ArrayCacheBySymbolBySide |
| binance 5683 | `type + ':fetchPositionsSnapshot'` | `this.positions[type] = new ArrayCacheBySymbolBySide (); cache = this.positions[type]` | ArrayCacheBySymbolBySide |
| bingx 1418 | `type + ':fetchPositionsSnapshot'` | `cache = this.positions` after the constructor | ArrayCacheBySymbolBySide |
| bybit 1719 | `'fetchPositionsSnapshot'` | same | ArrayCacheBySymbolBySide |
| cryptocom 1070 | `'fetchPositionsSnapshot'` | same | ArrayCacheBySymbolBySide |
| kucoin 3166 | `'fetchPositionSnapshot:' + symbol` | `loadPositionSnapshot`: `this.positions = new ArrayCacheBySymbolById ()` | ArrayCacheBySymbolById |
| kucoin 3218 | `'fetchPositionsSnapshot'` | `loadPositionsSnapshot`: `new ArrayCacheBySymbolById ()` | ArrayCacheBySymbolById |
| modetrade 1132 | `'fetchPositionsSnapshot'` | `new ArrayCacheBySymbolBySide ()` | ArrayCacheBySymbolBySide |
| toobit 1159 | `type + ':fetchPositionsSnapshot'` | `this.positions[type] = new ArrayCacheBySymbolBySide ()` | ArrayCacheBySymbolBySide |
| weex 1962 | `'fetchPositionsSnapshot'` | `new ArrayCacheBySymbolById ()` | ArrayCacheBySymbolById |
| woo 1480 | `'fetchPositionsSnapshot'` | `new ArrayCacheBySymbolBySide ()` | ArrayCacheBySymbolBySide |
| woofipro 1135 | `'fetchPositionsSnapshot'` | same | ArrayCacheBySymbolBySide |
| xt 748 | `'fetchPositionsSnapshot'` | same | ArrayCacheBySymbolBySide |

## Rejected sub-cases

* **`this.safeValue (this.<ws member>, key)` per-key reads (62 sites)** — U11's family
  (`CSHARP_LOCAL_WS_CACHE_MEMBERS` writer census, landed on `cs90-U11`, 101 typed). Lower unit owns it;
  not re-litigated.
* **`object cache = getValue (this.positions, type)` (8 sites: binance 5735/5796/6405, gate
  1634/1687, bitget 1590, toobit 1203/1253)** — U04/U11's ws-cache element-read family (their census
  accepts the field being a dictionary when the element writers are constructors). Not re-litigated.
* **`object cachedOrders = isTriggerOrder ? this.triggerOrders : this.orders` (kucoin 2489)** — U22's
  ternary family; `this.triggerOrders` is `object` (no writer census proves its box).
* **`object cache = (this.positions as ArrayCache).hashmap` (kucoin 3239)** — the `.hashmap` member
  read; `arrayCacheHashmapReadType` models the call shape (`this.safeValue (cache.hashmap, key)`), not a
  bare member read. Left `object` (1 site, out of this unit's keyed families).
* **`object orderbookSide = getValue (orderbook, side)` (bithumb 588, coinbase 998)** — element read of
  an `object orderbook` local that U27's awaited-`watch` family owns; no proof for the receiver here.
* **gate `object subHash = getValue (subMessageHashes, i)`** — the only writer of the
  `'subMessageHashes'` key in `ts/src/pro/gate.ts` is the parameter `subMessageHashes: any`
  (`unSubscribePublicMultiple`); `any` has no element proof. 1 site rejected on doubt.
* **binance `object cache = this.myLiquidations`** — the field's only writer in `binance.ts` is a
  read-back local (`this.myLiquidations = cache` with `cache = this.myLiquidations`); the census requires
  an ArrayCache constructor producer for the field in the file. 1 site rejected.
* **prediction tier `object stored = this.positions` (`cs/ccxt/exchanges/prediction/myriad.cs`)** —
  excluded by design: U44's roster line owns every prediction-tree local (rule 5, lower unit). The same
  rule fires there and would type it identically; the integrator can dedupe by line if U44 lands it.
* **`var client = getValue (clients, i)` (binance 3651)** — a loop over a local list of clients; the
  element is read from a `List<object>` whose writer census is not `ConcurrentDictionary`-shaped, so the
  element box is not proven here (1 site).
* **U04/U11/U29's rejected `client.subscriptions`** (mixed bool/string/Future writers) — not re-litigated.
* **0 sites** spelled `object client = …` / `object future = …` on the base: the ws text pass rewrites both
  to `var` (`build/csharpTranspiler.ts:1821-1822`). The `var future` / `var client = this.safeValue
  (this.clients, …)` sites are the family and are typed (49 + 4).

## Residual risk

* The 49 `ccxt.pro.ArrayCache` casts (42 `this.positions` + 7 `this.liquidations`) throw
  `InvalidCastException` if the field ever holds a non-cache. Proven per file by the writer census; the
  five dict-writing venues have no whole-field read, and the base writes only `null`. A future venue
  adding `this.positions = <dict>` in one of the 23 read-owning files would make the cast wrong — the
  census is per file and would need re-running (same assumption U11's landed census makes).
* The 14 `await client.future` casts are exact only while the message-hash family's settle sites stay in
  the same file and keep their box. A settle reached from another file (a shared `Client` keyed by a
  venue-stable hash) would not be seen by the census. All 14 files resolve the hash locally.
* `Future` locals: the cast is exact for the hand-written `IDictionary<string, Future> futures`
  (writers: `client.future` GetOrAdd / `reusableFuture` / `rejectFutures` clearing). Behaviour-neutral:
  the value flows on unchanged, and the printed `(future as Future)` / `callDynamically(future, …)` still
  compile.
* `WebSocketClient client` locals: the map is `ConcurrentDictionary<string, WebSocketClient>`; the
  dropped `((WebSocketClient)client)` casts were identity casts on a value the local now statically is.
* `subHash` = `string?`: a non-string element at that key would throw on the cast; the checker proves the
  element type of every writer in the file (gate rejected for `any`).
* No runtime/lane gate was run locally (dotnet is farm-only): job 879 compiles the whole `cs` target,
  0 errors, 0 warnings from this diff.

## Hotspot

* `hotspot: build/csharp-local-types.js` — the classifier is the campaign's shared hot file (U02 moved
  `CORE_LIST_ARGS` into it, U18/U11 edited `csharpLocalIsSafeToRetype`/`assignable`/the ws-cache census).
  My edits are additive and keyed: the U45 family section after `orderbookMapReadType`, the
  `clientsMapReadCastType` block before it, the new arms in `csharpLocalTypeOf`'s `csharpType ===
  undefined` chain, one entry in `CSHARP_LOCAL_WS_MEMBER_TYPES`, one edge table, the
  `subMessageHashesProducer` branch in `elementAccessElementType`, and the
  `awaitedCallIsPrintedAsProven` guard. Merge order: `git merge-file` on this file, never union-concat.
* No `build/csharpTranspiler.ts`, ast-transpiler source, or hand-written base file touched.

## Tools

`campaigns/cs90/tools/U45/`: `census-family.py` (initial per-family census), `member-writer-census.py`
(whole-field writer census per file), `pair-audit.py <base> [--selftest]` (pair classifier, base defaults
to HEAD). Reproduce: `bash campaigns/cs90/census.sh`; scoped regen
`/root/.hermes/scripts/ccxt-perf-slot.sh --local npx tsx build/csharpTranspiler.ts --force --ws <76 pro ids>`;
`--force --noTests` for the REST/base tree; `--tests` for the test tier.
