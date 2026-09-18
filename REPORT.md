# cs90 U39 — literal collection inits (`object x = new List<object>()` / `new Dictionary<string, object>()`)

**Result: 4 typed declarations / 5 casts removed / 3 generated files changed (12 lines) — and the
census shows the roster's proposed mechanism is already in place for this family, so the remaining
60 sites are blocked by producers owned by other units or by genuinely unnameable boxes.**

Base `d847892a6fcf5699640862316303b6344a3e4daf` (branch `cs-strict-INT`), branch `cs90-U39`.
Roster line: `UNITS.md` U39 — "literal collection inits still object → later write is a
`this.safeList/safeDict/omit/extend` result (interface) or `this.arrayConcat`: extend the WIDENING
edges (List→IList, Dictionary→IDictionary interface-first) per cs-strict U26 rules; census each".
Scope: U39 only. No `build/csharpTranspiler.ts`, ast-transpiler or hand-written-base file touched
(**hotspot: none**).

## 1. Result

| # | site (ts) | declaration before → after | proof |
|---|---|---|---|
| 1 | `ts/src/gate.ts:5534` `request` | `object` → `Dictionary<string, object>` | `[ request, params ] = spot ? this.multiOrderSpotPrepareRequest (…) : this.prepareRequest (…)` — both arms are audited fresh-request-Dict builders (§3.2) |
| 2 | `ts/src/pro/kraken.ts:289` `request` | `object` → `Dictionary<string, object>` | `[ request, params ] = this.orderRequestWs (…)` — single `return [ request, params ]` (`ts/src/pro/kraken.ts:266`), element 0 is the caller's own Dict |
| 3 | `ts/src/pro/kraken.ts:357` `request` | `object` → `Dictionary<string, object>` | same helper, `editOrderWs` site |
| 4 | `ts/src/pro/poloniex.ts:156` `marketIds` | `object` → `IList<object>` | `marketIds = (ids === undefined) ? [] : ids` with `IList<object> ids` — the conditional's natural C# type is the interface (§3.3) |

Generated diff: 4 declaration retypes + 3 destructured-element casts forced by the retype
(`request = (Dictionary<string, object>)((IList<object>)tmp)[0];`, the spelling `cs/ccxt/exchanges/poloniex.cs:2341`
already emits) + **5 cast removals** — the S22 dictionary index-write elision on the now-typed
`request` (`((IDictionary<string,object>)request)["status"] = status;` → `request["status"] = status;`
and 4 more: `limit`, `from`, `to`, `last_id`).

```
cs/ccxt/exchanges/gate.cs         | 14 +++++++-------
cs/ccxt/exchanges/pro/kraken.cs   |  8 ++++----
cs/ccxt/exchanges/pro/poloniex.cs |  2 +-
```

## 2. Census

```
base  d847892a6: locals: object=9304 typed=44132 typed%=82   casts: (IDictionary<string,object>)=2563
after U39      : locals: object=9300 typed=44136 typed%=82   casts: (IDictionary<string,object>)=2558
                 (object -4 / typed +4 / 5 casts removed)
```

64 sites in the family on the base (39 `new List<object>() {}` + 25 `new Dictionary<string, object>() {}`,
`campaigns/cs90/census.sh` and `tools/U39/gen_sites.py`); 4 are typed by this unit, **60 remain
`object`** with a per-site reason in §4. The blocker histogram below is machine-produced by
`tools/U39/verdict_table.py` from the classifier probe `tools/U39/u39-blockers.mjs` (the installed
`csharpLocalDeclaration` / `csharpTypeOfValue`, not a re-implementation):

| primary blocker | sites |
|---|---|
| `B2` read of an `object`-declared local/param (incl. implicit-API result locals) | 42 |
| `B4` box conflict — a later write proves the other collection box | 7 |
| `B3` TS union annotation / `as any` box (unnameable in C#) | 6 |
| `B6` producer still `object` and owned by a lower unit (U30/U31/U37/U40) | 3 |
| `B7` element read (`assets[i]`, `sorted[0]`) | 2 |

15 sites carry a `B4` box conflict in addition to their primary blocker; 6 sites carry an
interface-typed write (`IList<object>` / `IDictionary<string, object>`) *and* one of the blockers
above — the roster's premise holds at those 6 sites, but none of them is provable (§4.2).

## 3. Rules touched (all in `build/csharp-local-types.js`; no other file)

### 3.1 The roster's widening edges were ALREADY in place — nothing to extend there

The two edges the roster asks for exist for exactly this family on the base tree:

* `WIDENING_EDGES` carries `[ 'List<object>', 'IList<object>' ]` (`build/csharp-local-types.js:2288`)
  and is the default edge set of `joinTypes` (`:2333-2347`), i.e. of every later-write join.
* `DICTIONARY_LITERAL_WIDENING_EDGES` carries `[ 'Dictionary<string, object>', 'IDictionary<string, object>' ]`
  (`:2325-2327`) and is passed **only** for a declaration whose initializer is an object literal
  (`:5835-5836`), which is precisely the 25 `new Dictionary<string, object>() {}` sites.

So both directions of the requested widening are applied to all 64 sites already. The census proves
it is not the blocker anywhere: **0 of 64 sites have a provable write set** — every site is held
`object` by a write the join cannot type (`B2`/`B3`/`B6`/`B7`) or by a write proving the *other*
box (`B4`). Adding the edges a second time would be dead code, so none was added.

### 3.2 `DESTRUCTURED_DICT_HELPERS` += `'orderRequestWs'` (`:5896-5908`)

`[ request, params ] = this.orderRequestWs (…)` prints the holder plus an untyped element read
(`request = ((IList<object>)tmp)[0]`). The table is the campaign's audited list of request builders
whose element 0 is the Dictionary it was handed; `ts/src/pro/kraken.ts:123-266` is the same shape as
the already-listed `orderRequest` (`ts/src/poloniex.ts`, `ts/src/zebpay.ts`): one `return [ request, params ]`
(`:266`), `request` is the caller's own `Dict` argument mutated in place, `params` is the caller's
params. With the entry, the declaration's write-join accepts the destructured write and
`installDestructuredCasts` reprints the element read with the cast back to the declared type — the
identical spelling the two already-typed `orderRequest` sites emit.

### 3.3 `destructuredWriteIsCastable` — conditional arms (`:6094-6120`)

The gate site destructures a **conditional** whose arms are two calls (`spot ? multiOrderSpotPrepareRequest (…) : prepareRequest (…)`).
Both are in `DESTRUCTURED_DICT_HELPERS` (fresh request Dict on every return path), so element 0 of
the conditional is one too. The check now reads `whenTrue`/`whenFalse` as the candidate call set
**for the dict family only** (`csharpType === 'Dictionary<string, object>'`); the string and
element-0 families keep the single-call shape they were audited on, so no other family widens.
Full-regen blast radius measured: 1 site.

### 3.4 `ARM_COLLECTION_WIDENING_PAIRS` += `[ 'List<object>', 'IList<object>' ]` (`:2396-2402`)

The list twin of the dict arm pair already in the table: in `marketIds = (ids === undefined) ? [] : ids`
(`IList<object> ids`) the C# conditional's natural type is `IList<object>` — `List<object>` converts
to `IList<object>` and nothing converts back — so both arms are the same `List` box and naming the
interface moves no value. ARMS ONLY, as the table's own comment requires (the later-write join keeps
its narrower list). Full-regen blast radius measured: 1 site.

## 4. Rejected sub-cases (60 sites, each with its reason)

Machine table (`tools/U39/verdict_table.py`; per-site write types from the classifier probe):

| site (ts/src) | box | later writes (C# types) | blocker |
|---|---|---|---|
| `apex.ts:1500` `currency` | Dict | object | element read -> `object` |
| `aster.ts:1331` `request` | Dict | List | box conflict (Dictionary vs List) |
| `binance.ts:14409` `liquidationsList` | List | List, Dictionary<string, object> | box conflict (List vs Dictionary) |
| `bingx.ts:3525` `result` | Dict | object, IDictionary<string, object>, IDictionary<string, object> | read of an `object` local/param |
| `bitget.ts:4834` `candles` | List | object, List | read of an `object` local/param |
| `bitget.ts:6578` `order` | Dict | IDictionary<string, object>, Dictionary<string, object>, object | read of an `object` local/param |
| `bithumb.ts:1080` `tickers` | List | object, List | read of an `object` local/param |
| `bithumb.ts:1335` `data` | List | object, List | read of an `object` local/param |
| `bithumb.ts:1567` `data` | List | object, List | read of an `object` local/param |
| `bitrue.ts:1390` `data` | Dict | object, IDictionary<string, object> | unprovable write |
| `bitrue.ts:1472` `data` | List | object, List | unprovable write |
| `bitrue.ts:2351` `data` | List | List, Dictionary<string, object> | box conflict (List vs Dictionary) |
| `bitrue.ts:2553` `data` | List | List, Dictionary<string, object> | box conflict (List vs Dictionary) |
| `bitteam.ts:675` `feesByNetworkId` | Dict | object | read of an `object` local/param |
| `btse.ts:3752` `rows` | List | object, List | read of an `object` local/param |
| `bybit.ts:2117` `preLaunchMarkets` | List | IDictionary<string, object> | box conflict (List vs IDictionary) |
| `coinsph.ts:909` `tickers` | List | Dictionary, List, object | box conflict (List vs Dictionary); box conflict (Dictionary vs List); union / `as any` box |
| `coinsph.ts:942` `ticker` | Dict | Dictionary, List, object | box conflict (Dictionary vs List); unprovable write |
| `gate.ts:2607` `withdrawFees` | Dict | Dictionary<string, object>, double? | box conflict (Dictionary vs double?) |
| `htx.ts:3589` `result` | Dict | object, Dictionary<string, object>, object, object, object | U37 safeBalance still `object` |
| `hyperliquid.ts:1286` `response` | List | object, object, object, object | unprovable write |
| `hyperliquid.ts:1547` `candles` | List | object | read of an `object` local/param |
| `hyperliquid.ts:1640` `fills` | List | object | read of an `object` local/param |
| `hyperliquid.ts:3093` `fundings` | List | object | read of an `object` local/param |
| `hyperliquid.ts:3173` `rawOrders` | List | object | read of an `object` local/param |
| `hyperliquid.ts:3302` `historicalOrders` | List | object | read of an `object` local/param |
| `hyperliquid.ts:3663` `myFills` | List | object | read of an `object` local/param |
| `hyperliquid.ts:4669` `depositLedger` | List | object | read of an `object` local/param |
| `hyperliquid.ts:4677` `deposits` | List | object | U31 filterByArray still `object` |
| `hyperliquid.ts:4739` `withdrawalLedger` | List | object | read of an `object` local/param |
| `hyperliquid.ts:4747` `withdrawals` | List | object | U31 filterByArray still `object` |
| `nado.ts:1452` `tx` | Dict | object | read of an `object` local/param |
| `nado.ts:1531` `product` | Dict | object | read of an `object` local/param |
| `pacifica.ts:2512` `lastInfo` | Dict | object | element read -> `object` |
| `poloniex.ts:2386` `response` | Dict | List, object, List | box conflict (Dictionary vs List); unprovable write |
| `prediction/binance.ts:373` `rawTopics` | List | object, List, object | unprovable write |
| `prediction/hyperliquid.ts:686` `allMids` | Dict | object | read of an `object` local/param |
| `prediction/hyperliquid.ts:891` `candles` | List | object | read of an `object` local/param |
| `prediction/hyperliquid.ts:1020` `allMids` | Dict | object | read of an `object` local/param |
| `prediction/hyperliquid.ts:1484` `rawOrders` | List | object | read of an `object` local/param |
| `prediction/hyperliquid.ts:1521` `historicalOrders` | List | object | read of an `object` local/param |
| `prediction/hyperliquid.ts:1580` `orderStatus` | Dict | object | read of an `object` local/param |
| `prediction/hyperliquid.ts:1737` `trades` | List | object, IList | read of an `object` local/param |
| `prediction/hyperliquid.ts:1784` `fills` | List | object, IList | read of an `object` local/param |
| `prediction/kalshi.ts:2194` `rawEvents` | List | object, List, object | unprovable write |
| `prediction/limitless.ts:283` `responseRows` | List | Dictionary<string, object> | box conflict (List vs Dictionary) |
| `prediction/limitless.ts:1409` `responseRows` | List | Dictionary<string, object> | box conflict (List vs Dictionary) |
| `prediction/myriad.ts:230` `rawMarkets` | List | object, object | unprovable write |
| `prediction/polymarket.ts:359` `rawEvents` | List | object, object | unprovable write |
| `prediction/polymarket.ts:729` `outcomePrices` | List | object | read of an `object` local/param |
| `prediction/polymarket.ts:2438` `rawEvents` | List | List, object, object | unprovable write |
| `prediction/polymarket.ts:2706` `query` | Dict | object | unprovable write |
| `pro/alpaca.ts:631` `request` | Dict | object | unprovable write |
| `pro/binance.ts:2723` `rawTickers` | List | object | read of an `object` local/param |
| `pro/bitfinex.ts:239` `ohlcvs` | List | object, List | read of an `object` local/param |
| `pro/bithumb.ts:87` `request` | Dict | List | box conflict (Dictionary vs List) |
| `pro/bithumb.ts:151` `message` | Dict | List, Dictionary | box conflict (Dictionary vs List); box conflict (List vs Dictionary) |
| `pro/bithumb.ts:387` `request` | Dict | List, Dictionary | box conflict (Dictionary vs List); box conflict (List vs Dictionary) |
| `pro/bithumb.ts:571` `request` | Dict | List, Dictionary | box conflict (Dictionary vs List); box conflict (List vs Dictionary) |
| `tokocrypto.ts:1535` `data` | List | object, List, List | read of an `object` local/param |

### 4.1 `B2` — a later write is a read of an `object`-declared local/parameter (42)

The single largest class. Two shapes:

* **implicit-API / awaited venue-helper results** (U28's family: the C# returns `object`):
  `const response = await this.publicPostInfo (…)` then `candles = response;` (hyperliquid ×8 REST,
  ×6 prediction), `await this.publicGetOpenapiQuoteV1Ticker24hr (…)` (coinsph ×2),
  `await this.fetchRawEventsBySearch/List (…)` / `await this.fetchEventsByQuery (…)` (prediction
  polymarket/kalshi/myriad/binance). A U39-side rule cannot name these boxes without retyping the
  producers, which is U28's (landed: "implicit-API returns object (rejected cs-strict S26)").
* **plain `object` locals/parameters** (`data`, `rows`, `message`, `rawTx`, `parsedPrices`, …).
  Not provable from the declaration side; the local's own family owns it.

### 4.2 Guarded writes — rejected (16 sites, the largest *near-miss*)

`candles = response;` sits inside the printed `if (((response is IList<object>) || (response.GetType().IsGenericType && response.GetType().GetGenericTypeDefinition().IsAssignableFrom(typeof(List<>)))))`
(the printer's `Array.isArray (response)`). It looks like a list guard, but it is **not a cast
proof**: the second disjunct compares generic type *definitions*, so it is also true for a
`List<string>` (and for a `List<Dictionary<string, object>>`), boxes on which
`(IList<object>)response` throws `InvalidCastException`. Naming `IList<object>` and casting that
write would therefore convert a currently-safe flow into a throwing one — refused (rule 1/4). The
same reasoning refuses the `this.toArray (response)` twin on those two prediction sites (its
`IList<object>` write is fine, the guarded `response` write beside it is not).

### 4.3 `B4` — box conflicts (15 sites)

The later writes prove *different* collection boxes: `aster.ts:1331` / `gate.ts:5534` assign the
`[request, params]` **tuple** (`List<object>`) to a dict local (the TS assigns `this.handleUntilOption (…)`
/ a conditional of tuples without destructuring — a TS-level type confusion that compiles because
the helpers are `any`-typed); `bybit.ts:2117` `preLaunchMarkets` is a `[]` literal later assigned
`this.safeDict (…)`; `binance.ts:14409` / `bitrue.ts:2351,2553` assign an `object` that the C#
declares `Dictionary<string, object>` into a list local. No single C# type holds both boxes, and
choosing one would make the other write throw — refused.

### 4.4 `B3` — TS union annotations / `as any` (6 sites)

`let message: Dict | Dict[]` (pro/bithumb ×4), `let tickers: Dict | List` (coinsph),
`let withdrawFees: Num | Dict` (gate), `let response: Dict | string` (bingx). A union is exactly
what `object` is for; the printed conditional/assignment forms cannot be narrowed to one box
without proving the runtime shape, which the code does not do.

`pro/alpaca.ts:631 request` is the `as any` case: the write prints `((object)new Dictionary<string, object>() {…})`.
Its box strip is the S20 F2 family (`dropRedundantObjectBoxCasts` rewrites an `object n = …` target
only), and the write's static type is `object`; out of this unit's family.

### 4.5 `B6` — producers owned by a lower unit (3 primary, 6 sites total)

`this.filterByArray (…)` → `object` (U31), `this.safeBalance (…)` → `object` (U37),
`this.omit (params, …)` → `object` (U40), `ccxt.BaseExchange.FromDictList/FromMarketInterfaceList (…)`
→ `object` (U30). Ownership rule 5: the lower unit number owns a contested site, so these stay with
U30/U31/U37/U40 — and once those producers are typed, these declarations join automatically (their
remaining writes are already provable: e.g. `prediction/polymarket.ts:2438`'s first write
`(responseIsArray) ? response : []` is `List<object>` today).

### 4.6 Named but NOT implemented

* **`var`-declared conditional destructuring targets** (`pro/gate.cs:257,290`, `gate.cs:6563,7063,7326`):
  the same conditional shape as §3.3 but the target is printed `var request = ((IList<object>)holder)[0]`
  by the printer's own destructuring path, i.e. it is not an `object x = …` declaration and is not in
  this unit's census (the campaign census counts `object` locals). Typing them needs the printer's
  destructuring-holder proof (`csharpDestructuringTempType`, keyed on `andle`-named helpers), a
  different mechanism and a different unit's family.
* **`as any` declaration box strip** (`pro/cex.ts:278` `let message = {…} as any`): the declaration
  prints `object message = ((object)new Dictionary<string, object>() {…})` — not one of the 64
  census sites (the census greps `= new Dictionary<string, object>() {}`); it is the S20 F2 family.

## 5. Gates

```
python3 campaigns/cs90/verify-diff.py d847892a6fcf5699640862316303b6344a3e4daf
  files=3 pairs=12 unexpected=5
```
The 5 UNEXPECTED pairs are one class: the landed S22 dictionary index-write cast elision
(`((IDictionary<string,object>)request)["status"] = status;` → `request["status"] = status;`), which
fires because `request` is now declared `Dictionary<string, object>`. The spelling is the tree's own
norm — 3529 such lines already exist on the base tree (`cs/ccxt/exchanges/gate.cs:2505,2672,2675,…`).
Dedicated audit with selftest (`tools/U39/pair_audit.py --selftest` → 8 cases, incl. mutated key /
value / receiver / callee and a wrong declaration retype all flagged):

```
python3 tools/U39/pair_audit.py d847892a6fcf5699640862316303b6344a3e4daf
  pairs=12 A=4 B=3 C=5 unpaired=0        (A decl retype, B element cast added, C index-write elision)
```

Determinism: full local regen of all three tiers (REST 104 ids, WS 76 ids, prediction 7 ids) with
`--force`; the scoped re-run of the changed files reproduces `git diff -- cs/ | sha256sum` byte-for-byte
(`6aae96357b511ed1` before and after). Blast radius of the three rule edits over the whole generated
tree: exactly the 3 files above, 12 lines.

Classifier probe re-run after the change: 64 → **60** undecided literal-init declarations, no
newly-undecided site (`tools/U39/u39-probe.mjs`).

Farm (dotnet is farm-only): `ccxt-farm build --targets cs --wait` on the work commit — the job id
and exit code are recorded in §6 (filled in by the follow-up report commit, the U26 convention).
No `build/csharpTranspiler.ts`, ast-transpiler src or hand-written base file touched, so no
`hotspot:` line applies; the only hot file is the shared classifier `build/csharp-local-types.js`
(3 additive edits).

## 6. Farm evidence

```
PENDING — recorded by the follow-up REPORT.md commit after the farm gate.
```

## 7. Residual risk

* The retype moves only static views: `Dictionary<string, object>` / `IList<object>` are the same
  references the `object` locals already held (`new Dictionary<…>() {}` / `new List<object>() {}`
  initializers, a `(Dictionary<string, object>)` identity cast on a proven Dict element, a
  conditional whose arms are both `List<object>`).
* Two overload moves are involved and are proven identical:
  `request = this.omit (request, "account")` now binds `omit(Dictionary<string, object>, object)`
  instead of `omit(object, object)` — the base's own comment (`cs/ccxt/base/Exchange.Functions.cs:103-107`)
  argues the dict receiver can never be the `IList<object>` pass-through, so both overloads return
  the fresh `outDict`; and the `Dictionary` indexer writes are the S22-established shape (same
  receiver, key and value text, only the redundant receiver cast dropped).
* Runtime lanes were NOT run for this unit (farm build only). The 4 retyped sites sit on the
  order-request path (`gate.prepareOrdersByStatusRequest`, `kraken.CreateOrderWs/EditOrderWs`,
  `poloniex` pro `subscribe`) — recommend `npm run id-tests-cs` on the integration branch.
* 2 of the 4 retypes rest on a single-return-path helper audit (`orderRequestWs`, `ts/src/pro/kraken.ts:266`);
  if that helper gains a return path in a later edit the entry must be re-audited (the table's
  comment names the file and the proof).
* 60 of 64 family sites stay `object`; §4 gives the per-site reason and names the owning unit, so
  the family can be re-censused once U28/U30/U31/U37/U40 land their producers.

## 8. Tools (campaign tooling, not committed to `build/`)

`campaigns/cs90/tools/U39/`: `gen_sites.py` (generated-tree site census), `census_sites.py`,
`u39-probe.mjs` (classifier decision per site), `u39-blockers.mjs` (per-write type + blocker chain),
`verdicts.py`, `verdict_table.py` (blocker histogram + table), `pair_audit.py` (pair checker with
`--selftest`).
