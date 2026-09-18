# U11 — ws member-cache element reads + handler-table reads

Roster line U11 (`campaigns/cs90/UNITS.md`):

- `object <name> = this.safeValue (this.ohlcvs|trades|orders|myTrades|positions|balance…, key)` (73)
- `object <name> = this.safeValue (client.subscriptions, …)` (23)
- `object <name> = this.safeValue (methods, …)` (45)
- `object <name> = this.safeValue (this.options, "watchOrderBook")` (45)

**Result: 101 declarations converted (52 `ccxt.pro.ArrayCache` + 1 `ccxt.pro.ArrayCacheByTimestamp`
+ 5 `IDictionary<string, object>` + 43 `Delegate`), 0 casts removed — each conversion adds the
identity cast-back that names the box the hand-written `object` helper hands back (`safeValue`
returns `object`; the declaration is the only place the box can be named). Two of the four
sub-families are rejected with a writer census proof (`client.subscriptions` 53 sites,
`this.options` 29 no-default sites).**

## Family as implemented

Two new read families in `build/csharp-local-types.js` (classifier only — no
`build/csharpTranspiler.ts`, no ast-transpiler src, no hand-written base file touched):

1. `wsCacheElementReadType` — `this.safeValue (this.<member>, <key>)` with **exactly 2 arguments**
   (defaulted reads are the dict/list-default families' sites, U08/U09/U41) and `<member>` in
   `CSHARP_LOCAL_WS_CACHE_MEMBERS` = trades / ohlcvs / positions / liquidations / myLiquidations /
   orders / myTrades / triggerOrders. The named box comes from a cached **per-(file, member) writer
   census** (each exchange class owns its own cache field, so the venue's own file is the whole
   writer set):
   - every element write `this.<member>[k] = rhs` must store an ArrayCache constructor, a dict
     literal, `createSafeDictionary`/`safeDict`, a read-back of the same map (`this.<member>[k]` /
     `safeValue` / `getValue`), `null` / `undefined`, a `?:` over those shapes, or a local whose
     every assignment **to that binding** (resolved scope-aware inside the writer's own function)
     proves one of those;
   - a nested `this.<member>[k][k2] = …` proves the value at `k` is a dictionary (that is how the
     printer spells the nested write: `((IDictionary<string,object>)getValue(this.ohlcvs, sym))[tf] = …`);
   - every `this.<member> = rhs` (the map itself) must stay dictionary-shaped — a member that IS
     the cache (lighter's `this.liquidations = new ArrayCache (limit)`) disqualifies it;
   - the constructors the census saw decide the declared type: the ArrayCache family →
     `ccxt.pro.ArrayCache`; only `ArrayCacheByTimestamp` → `ccxt.pro.ArrayCacheByTimestamp`; a mix
     of the two → `ccxt.pro.BaseCache` (the family's common base — `ArrayCacheByTimestamp` derives
     from `BaseCache`, NOT from `ArrayCache`, cs/ccxt/ws/ArrayCache.cs:257); a dictionary → `IDictionary<string, object>`.
2. `handlerTableReadType` — `this.safeValue (methods|handlers, <key>)` (2 args) where the local's
   own initializer is an object literal whose **every** value is a `this.<name>` reference to a
   method declared in the same file → `Delegate` (the box `DynamicInvoker.InvokeMethod`, i.e. the
   `.call` rewrite, already reads back with `action as Delegate`). Any other entry value rejects
   the whole table.

Supporting edits (same file):
- `cacheElementWideningEdges(target)` — the later-write join edges for a cache-element read: every
  ArrayCache constructor name (bare + `ccxt.pro.` spelling) → the declaration's own type, so the
  cache-setup write (`stored = new ArrayCache (tradesLimit)`) joins it.
- `assignable`: an `ArrayCache`-target accepts the ArrayCache-family constructors (both spellings);
  a `BaseCache` target accepts the whole family; an `ArrayCacheByTimestamp` target accepts only
  itself. Written after the farm build rejected the first submission (CS0029: the Alpaca OHLCV
  cache is an `ArrayCacheByTimestamp`, which is not an `ArrayCache`).
- correction note on `ARRAY_CACHE_SUBTYPES` (ByTimestamp is not an ArrayCache subclass) — its
  existing use (the `this.orders`/`this.myTrades` family) is bytes-identical (full-tree regen diff).

## Sites typed (base census on `d847892a6fc`)

| receiver / shape | sites in base | typed | box |
|---|---|---|---|
| `this.safeValue (this.trades, k)` | 49 | 49 | `ccxt.pro.ArrayCache` |
| `this.safeValue (this.positions, k)` | 4 | 4 | 3 `ccxt.pro.ArrayCache`, 1 `IDictionary<string, object>` (htx, two-level map) |
| `this.safeValue (this.ohlcvs, k)` | 7 | 5 | 4 `IDictionary<string, object>`, 1 `ccxt.pro.ArrayCacheByTimestamp` (alpaca) |
| `this.safeValue (methods, k)` (declaration) | 40 | 37 | `Delegate` |
| `this.safeValue (handlers, k)` (declaration) | 7 | 6 | `Delegate` |
| **total** | | **101** | 52 `ArrayCache` + 1 `ArrayCacheByTimestamp` + 5 `IDictionary` + 43 `Delegate` |

## Census

before (`campaigns/cs90/census.sh` on the base):
```
locals: object=9304 typed=44132 typed%=82
casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
params: object=11635  returns: object=1080
helpers: isTrue=1434 isEqual=12034 getValue=6761 add=8833 getArrayLength=704
```
after:
```
locals: object=9203 typed=44190 typed%=82
casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=132 (List<object>)=102
params: object=11635  returns: object=1080
helpers: isTrue=1434 isEqual=12034 getValue=6761 add=8833 getArrayLength=704
```
`object` −101 (every converted declaration), `typed` +58 (53 `ccxt.pro.*` cache spellings + 5
`IDictionary<string, object>` — both are in the census regex), `(IDictionary<string, object>)` +5
(the new cast-backs). No other counter moved; in particular `(string)` stays 2113 — this unit
removes no cast, it adds the identity cast that names the read's box.

`Delegate` is not an alternative in the census regex, so those 43 locals only show up as the
`object` decrease. (They are real conversions: the declaration no longer says `object`.)

## Gates

- `verify-diff.py d847892a6fcf5699640862316303b6344a3e4daf` (the campaign base) →
  `files=57 pairs=101 unexpected=0`: every pair is `object N = REST` → `TYPE N = ((TYPE)REST)`
  for the same name + initializer.
- fixed point: full local regen `--force --noTests` + `--force --ws --noTests` +
  `--force --prediction --noTests` run twice; `git diff -- cs/ | sha256sum` identical both times
  (`e5f3e52e17cffc363b9de9010f283b312c3dd22931168320fc2c01ed459ac87e`).
- farm build (`ccxt-farm build --targets cs --wait`), generator pin `404e9daa` (the base pin):
  - job **692** — **exit=1** on the first submission: `cs/ccxt/exchanges/pro/alpaca.cs:216 CS0029:
    Cannot implicitly convert type 'ccxt.pro.ArrayCacheByTimestamp' to 'ccxt.pro.ArrayCache'`.
    That is the class-hierarchy fact this file now encodes (`ArrayCacheByTimestamp : BaseCache`);
    the fix is the constructor split in `wsCacheElementBoxUncached`/`assignable` plus the
    dedicated `ccxt.pro.ArrayCacheByTimestamp` spelling for the Alpaca OHLCV map.
  - job **783** — **exit=0** on the code commit `b361e716bf1` (`branch_update=unchanged`,
    `failing_files: []`), and job **787** — **exit=0** on the report-only tip
    `824b98092ca` (the same C# tree).
  - every later tip of this branch differs from a green one in this file only
    (`git diff <green sha> <tip> -- cs/` is empty), and each was re-gated with the same result;
    the job id of the final tip is recorded in the integration handoff.
- runtime lanes (`id-tests-cs`, `request-cs`, `response-cs`) are farm/CI-only; not run locally.

## Rejected sub-cases (with proof)

1. **`this.safeValue (client.subscriptions, k)` — 53 sites, 0 typed.** The field is
   `public IDictionary<string, object> subscriptions` (`cs/ccxt/ws/Client.cs:21`) and the tree
   writes values of five different shapes into it, so no cast on a read is exact:
   `= true` (bool — `pro/binance.cs:3208`, `pro/coinex.cs:1624`, `pro/nado.cs:1986`),
   `= subscriptionHash|messageHash|channelId|subMessageHash` (string — `pro/kucoin.cs:180/210/241/317/344/573/2931`,
   `pro/bitfinex.cs:104/202/1118/1126`), `= future` (Future — `pro/phemex.cs:1746`, `pro/deribit.cs:1218`,
   `pro/bitvavo.cs:2001`, `pro/poloniex.cs:131`), `= this.handleAuthenticate` (Delegate — `pro/phemex.cs:1743`),
   `= null` (`pro/onetrading.cs:1163/1443`), and dict writers. The reads are by a computed
   message hash, i.e. they can land on any of those. cs-strict recorded the same veto
   ("still object on purpose, dict|true") in the ws/pro notes — not re-litigated.
2. **`this.safeValue (this.options, k)` — 115 sites (29 without a default), 0 typed.** The 29
   no-default sites read 20 distinct option keys whose runtime boxes differ by key and by writer:
   list (`stableCoins` phemex.ts:5154 → `this.inArray (code, stableCoins)`; `coinbaseAccounts`
   coinbaseexchange.ts:2158, an API response list), bool (`oldPrecision` bitmex.ts:619 →
   `!== true`; `createMarketBuyOrderRequiresPrice` upbit.ts:1238), string (`utaToken`
   pro/kucoin.ts:251; `listenKey` pro/bitrue.ts:856), dict (`networks` hitbtc.ts:1047;
   `streamLimits` pro/binance.ts:236). `this.options` is a public `ConcurrentDictionary` written
   at runtime (`this.options['coinbaseAccounts'] = accounts`, coinbaseexchange.ts:2161) and
   caller-overridable, so even the keys whose describe() literal is a dict cannot carry an exact
   cast. Defaulted reads of the same receiver belong to U41.
3. **`this.safeValue (this.liquidations, k)` — 1 site (pro/lighter.cs:1039), 0 typed.** The file
   writes the cache itself (`this.liquidations = new ArrayCache (limit)`, lighter.ts:947) and the
   local is later assigned from that member read (`stored = this.liquidations`), so neither the
   element census nor the write scan can prove a per-key box.
4. **Defaulted cache reads — left alone** (2 × `this.safeValue (this.ohlcvs, symbol, {})`:
   pro/pacifica.cs:1188, pro/mexc.cs:715; 1 × `this.safeValue (this.balance, type, {})`
   pro/kraken.cs:1701; 2 × `this.safeValue (this.currencies, code, {})`): the dict/list-default
   families (U08/U09/U41) own defaulted sites — the rule matches exactly 2 arguments. A dict
   default additionally proves a dict, not an ArrayCache.
5. **3 handler-table declarations with a later table write** (`pro/woofipro.cs:1471`,
   `pro/bitvavo.cs:2150`, `pro/woo.cs:1815`): the later `method = this.safeValue (methods, topic)`
   prints as a plain assignment of an `object` expression; naming the local `Delegate` needs that
   line to carry a cast back, and the declaration wrapper only rewrites declarations (no pass
   emits casts on assignment lines). The write scan rejects, correctly.
6. **10 handler-table ternaries** (`object method = ((a == null)) ? null : this.safeValue (methods, k)`,
   e.g. pro/upbit.cs:783, pro/poloniex.cs:1409): a cast on the initializer would wrap the whole
   conditional (`((Delegate)((a == null)) ? null : …)` — the cast binds to the condition), and
   without a cast the `object` arm is CS0266. The conditional-initialiser shape is U22's family.
   (A `?:` on the **right** side of a write is handled: ndax's
   `let tradesArray = (symbol === undefined) ? undefined : this.safeValue (this.trades, symbol)`
   joins as "no information", which is why ndax types.)
7. **`pro/deribit.cs:1148` `handlers` table** — one entry is a call, not a method reference
   (`{ "user", this.safeValue (userHandlers, this.safeString (parts, 1)) }`), so the content guard
   rejects the whole table (the read stays `object`).
8. **Same-name locals across methods** (gemini/ndax, found by the farm/regression loop): the census
   resolves the element write's local scope-aware inside its own function, so a `stored` in the
   trades handler and a `stored` in the OHLCV handler of the same file are not conflated; a name
   that cannot be resolved to exactly one binding stays `object`.
9. **Out of family (not touched):** `getValue (this.<member>, k)` element reads (U04 owns getValue
   receivers; e.g. prediction/myriad.cs:3937), `this.safeValue (this.fees|currencies|tickers|
   accountsById|markets_by_id|outcomes_by_id|urls, k)` (REST-side caches; U04/U05/U06 own them),
   and `this.safeValue (subscriptionsById, k)` (bittrade's local map).

## Residual risk

- The cast-backs are only exact while every writer keeps storing the proven box. The proof is the
  per-file census + a tree-wide check that no element write to these eight members exists outside
  the ws / prediction trees (a REST sibling class of the same venue is a different file; the only
  REST-tree element writes found are the prediction tree's own ArrayCache writes). A future venue
  that stores a foreign box would make its own file's census fail, so the declaration reverts to
  `object` on the next regen instead of throwing.
- 43 of the 101 conversions are `Delegate`: not matched by the census's `typed` alternative, so
  they count through the `object` decrease only. `Delegate` rests on C# 10's natural type for
  method groups (the emitted `new Dictionary<string, object> { { "k", this.handleX } }` tables
  already rely on it, and `DynamicInvoker.InvokeMethod` does `action as Delegate`), so the box is
  a `Delegate` or `null`; a table mixing in another value shape is rejected by the content guard
  (deribit, above).
- The Alpaca OHLCV cache is the only `ArrayCacheByTimestamp` site; the other 52 ArrayCache-family
  sites are `ArrayCache`/`ArrayCacheBySymbolById`/`ArrayCacheBySymbolBySide`, which do derive from
  `ArrayCache`. If a venue later mixes the two in one map, the census names `ccxt.pro.BaseCache`
  (their common base) rather than failing.
- The compile gate is the farm build; the C# runtime lanes were not run here (farm-only).

## Files

- `build/csharp-local-types.js` — classifier (the two families, the census, the edges, `assignable`).
- `cs/` regenerated: 57 files, 101 changed lines, all in the two families.