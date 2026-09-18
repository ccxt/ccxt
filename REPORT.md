# U27 — `object x = await this.watch*(...)` : 72 locals typed `ccxt.pro.IOrderBook`

Family: the ws/pro (and prediction) awaited subscriber cores — `object <name> = await this.<ws>(...)`
over `watch`, `watchMultiple`, `watchPublic`, `watchPrivate`, `watchPublicMultiple`, `watchTopics`,
`watchMany`, `watchMultiHelper`, `watchMultipleWrapper`, `subscribe*`, `negotiate` and the two
venue-local spellings that reach the same bridge (`helperForWatchMultipleConstruct`, hashkey's
`wathPublic`).

Result: **72 declarations typed, 0 casts removed** (the family names a type the awaited call does not
return, so each retype carries the identity cast back: `ccxt.pro.IOrderBook x = ((ccxt.pro.IOrderBook)await this.watch(...))`).
Everything else in the family is documented below as rejected with a reason.

## Files / rules touched

* `build/csharp-local-types.js` — new proof `wsOrderBookWatchType` (`CSHARP_WS_WATCH_METHOD_NAMES`,
  `wsWatchAwaitMethodName`, `statementAfter`, `statementCallsLimitOn`) + one branch at the head of the
  `csharpTypeOfValue === undefined` chain in `csharpLocalTypeOf` (type + cast).
* `cs/ccxt/exchanges/**` — regenerated (62 files, declaration lines only, see the diff audit).
* **hotspot: none.** `build/csharpTranspiler.ts`, the ast-transpiler printer (`/root/ast-transpiler`)
  and every hand-written `cs/ccxt/base` / `cs/ccxt/ws` file are untouched. No `[AST]` component, so no
  ast branch/sha. (`cs/ccxt/base/Exchange.Options.cs` already declares `orders`/`myTrades` as
  `ccxt.pro.ArrayCache` on the base — used only as evidence below, not edited.)

## Census (`campaigns/cs90/census.sh`)

```
before (HEAD d847892a6):  locals: object=9304 typed=44132 typed%=82
after  (this unit):       locals: object=9232 typed=44204 typed%=82
```
Exactly −72 object / +72 typed (−70 on the ws tree measured before the 2 venue-helper names were added,
−1 prediction, −1 more ws); casts, params, returns and helper counts are byte-identical to the base
(`casts: (string)=2113 (IList<object>)=1922 … (IDictionary<string, object>)=127 (List<object>)=102`).

## The rule and its proof

`this.watch (url, messageHash, message, subscribeHash)` is `cs/ccxt/ws/Exchange.WsBridge.cs#watch`,
which returns `await client.future (messageHash)` — the value IS whatever the handler resolved for that
message hash. A type can therefore only be named from the resolve side of the hash.

**Rule (fires only on the immediate next statement).** `const <name> = await this.<ws>(...)` is typed
`ccxt.pro.IOrderBook` when the statement immediately after it is a `return` whose expression calls
`<name>.limit ()`. `.limit ()` is declared on `ccxt.pro.IOrderBook` alone (`cs/ccxt/ws/OrderBook.cs:11`,
implementation at `:189`); `ArrayCache` has `getLimit`, `OrderBookSide` has `void limit ()`, neither is a
watch value. So on every path that works today the box is an `IOrderBook`, and the retyped declaration
is the identity conversion `IOrderBook → object → IOrderBook`. It declines whenever the deref is inside
a branch (a hard cast would move a conditional failure to the declaration), and whenever any later write
/ `ref`-sink / spread / `delete` use exists — the shared `csharpLocalIsSafeToRetype` scan rejects those.

**Independent evidence, same class, per site** (`tools/U27/resolve_proof.py`, re-runnable):

```
$ python3 tools/U27/resolve_proof.py cs/ccxt/exchanges
sites: 72  caller-proof(A): 72  file-resolve-proof(B): 72  both: 72
every site: caller deref AND a same-file order book resolve
```
* **A (caller)** — the next statement dereferences `<name>` through `.limit ()`, an `IOrderBook`-only member.
* **B (handler resolve, message-hash family)** — the same generated class contains
  `callDynamically(client, "resolve", new object[] { V, H })` where `H`'s literal names the order book
  hash (`orderbook:` / `orderbook::` / `orderbook.` / `uta:orderbook:` / the venue's order-book channel)
  and `V` is an order book cache at its declaration: `ccxt.pro.IOrderBook orderbook = this.getOrderBook
  (this.orderbooks, symbol)`, `= this.safeOrderBook (...)`, or a local the handler itself derefs as
  `(V as IOrderBook)` / stores into `this.orderbooks` (bitopro `:118-130`, dydx `:262-274`, coinone
  `:122-135`, onetrading `:415-424`, kucoin `:1886`/`:1952` use the `this.getOrderBook (...)` inline form).

The checker is not vacuous — deleting the order book resolve from `coinone.cs` makes exactly that site
fail (`sites: 70 … both: 69`, missing site `coinone.cs:80`), then the file is restored.

## Diff audit

```
$ python3 /root/.hermes/profiles/deepseek/campaigns/cs90/verify-diff.py HEAD
files=62 pairs=75 unexpected=3
  [PAIR] cs/ccxt/exchanges/pro/extended.cs:      - });      + }));
  [PAIR] cs/ccxt/exchanges/pro/kraken.cs:        - }, this.extend(requiredParams, parameters));   + }, this.extend(requiredParams, parameters)));
  [PAIR] cs/ccxt/exchanges/pro/krakenfutures.cs: - }, parameters);   + }, parameters));
```
* 72 pairs are the accepted `object N = REST` → `TYPE N = (TYPE)REST` declaration retype (byte-equal rest).
* The 3 UNEXPECTED lines are the **same pair split across a line break**: those three calls take a
  dict-literal argument, so the value spans lines and the cast's closing paren lands on the
  continuation line (`}); ` → `}));`). Paren-balanced C#, no other token changed; the farm build compiles
  them (job 648). Kept on purpose: the rule fires on the value, not on its line shape.
* Nothing else in the generated tree changed: REST (`cs/ccxt/exchanges/*.cs`) regenerated to a byte-equal
  tree (0 files), and a forced `--ws` rerun reproduces the same diff hash
  (`git diff -- cs/ | sha256sum` stable across runs — fixed point).

## Farm

```
ccxt-farm build --targets cs --wait
HEAD 7e08c64191f209eecebb639f2ab9207103fa6bcb job=648 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
```
(exit=0, no warnings from the diff; `generator=` is the base pin.)

## Survey — what the caller does next (all 443 family sites, `tools/U27/report_table.py`)

| next use | sites | verdict |
|---|---|---|
| `callDynamically(x, "getLimit" / "append")` + `filterBy*(x, …)` | 193 | **rejected** — ArrayCache family |
| `(x as IOrderBook).limit()` | 72 | **typed** (rule A) — 70 first-pass, 1 multi-line ws helper each for gemini/kraken(krakenfutures) after the venue-helper names were added |
| `getValue(x, …)` / `this.safe*(x, …)` | 58 | **rejected** — dict box, no unique type |
| `ccxt.BaseExchange.To*(this.filterBy*(x, …))` converters | 41 | **rejected** — list/cache box |
| `filterByArray/filterBySinceLimit(x, …)` | 40 | **rejected** — list box |
| `return x;` / `x.Count` / other (incl. `this.options` writes, kucoin `negotiate` url) | 39 | **rejected** — no type-requiring use |

(the 72 row includes the 2 sites the rule declines on purpose — `bitget.cs:945`, `coinex.cs:915` — whose
`.limit()` sits inside a branch; the typed count is 70 + 2 venue-helper names = **72**.)

Typed / total family sites per method (tree census, `tools/U27/candidates.py`): `watch` 28/142 ·
`watchPublic` 11/38 · `watchMultiple` 7/51 · `subscribe` 5/27 · `subscribePublic` 5/17 ·
`subscribeMultiple` 3/19 · `watchPublicMultiple` 3/13 · `watchTopics` 2/14 · `watchMultipleWrapper` 2/7 ·
`watchMultiHelper` 2/9 · `subscribePublicUta` 1/2 · `watchMany` 1/2 · `helperForWatchMultipleConstruct` 1/1 ·
`wathPublic` 1/1 · **0 for** `watchPrivate` 0/32, `subscribePrivate` 0/20, `negotiate` 0/13,
`watchRequest` 0/6, `watchPrivateMultiple` 0/3, `watchMultiTickerHelper` 0/3, `subscribeMyriadChannel` 0/3,
`subscribeOpinionChannel` 0/3, `subscribePublicMultiple` 0/3, `watchMultipleSubscription` 0/3,
`subscribeUserChannel` 0/2, `watchPrivateSubscribe` 0/2, `subscribePublicMultipleUta` 0/1,
`subscribePrivateUta` 0/1, `watchStockMarketStream` 0/3, `watchExecuteRequest` 0/4
(each declined for one of the reasons below — list/dict/converter value or no type-naming use).

## Rejected sub-cases (with reason)

1. **`watchPrivate` / `watchOrders` / `watchMyTrades` / `watchBalance` / `watchPositions` cores (32+ sites).**
   The caller does `if (isTrue(this.newUpdates)) { … callDynamically(x, "getLimit", …) … }` — the only
   type-requiring use sits INSIDE a conditional branch, while the declaration runs unconditionally. A
   hard cast would turn a conditional failure into an unconditional one on any path that never touches
   `x` (e.g. venues whose first reply is not a cache), i.e. it would change behaviour where the current
   code does not. Also the use names no unique class (`ArrayCache` base vs
   `ArrayCacheByTimestamp`/`BySymbolById`/`ByOutcomeById`/`BySymbolBySide`).
2. **The `ArrayCache` base spelling (193 sites).** Truthful as a base type but it does not name the box,
   and the same conditional-branch objection applies. Deferred: the ws cache member reads
   (`this.ohlcvs[…]`, `trades.getLimit`) are U04/U11/U45 territory (`CSHARP_LOCAL_WS_MEMBER_TYPES`),
   not this unit's initializer family.
3. **`bitget.cs:945`, `coinex.cs:915`** — same `.limit()` deref, but not the IMMEDIATE next statement
   (`if (incrementalFeed …` / `if (isTrue(this.newUpdates)) …`): the branch objection of (1) applies, so
   the rule declines by construction.
4. **`object x = await this.watch(...)` used as a dict/list** (58 + 41 + 40 sites): `this.safeDict (x, …)`,
   `getValue (x, …)`, `ToTradeList (this.filterBySymbolSinceLimit (x, …))`, `filterByArray (x, …)`. `watch`
   hands back caches AND lists (`watchTickers` resolves a list of tickers) through the same bridge and the
   hand-written consumers take `object`; no unique C# type is named.
5. **`kucoin negotiate` (13 sites, `object url = await this.negotiate(false, isFuturesMethod)`).** The
   return path is two hops (`negotiate` awaits a `Future` stored under `this.options['urls'][connectId]`
   that is `spawn(negotiateHelper, …)`-ed; `negotiateHelper` builds the url with
   `add(add(endpoint, "?"), this.urlencode(…))`), and no use of `url` names a C# type (it is passed
   straight to `this.watch (url, …)`, an `object` parameter). Typing it needs the async-core
   return-path mechanism (`installCsharpAsyncCoreReturns` / `CSHARP_ASYNC_CORE_RETURNS`), which U28 owns
   for the sister `getUrlByMarketType` / `getUrlByMarket` family; recorded here rather than done in this
   unit to avoid two units retyping the same callee.
6. **`subscribe*` cores whose value is a list/ticker/dict** (e.g. `subscribeOpinionChannel` /
   `subscribeMyriadChannel` → `filterBySinceLimit`, `watchMultiTickerHelper` → `ToTickers`): no
   type-naming use.
7. **`x.limit()` inside a `try`/`catch`** (bittrade `:440`, bitvavo `:910`, htx `:716`): typed — the
   deref is the immediate next statement and the `catch` is outside the declaration's block.

## Residual risk

* The family ADDS a cast; the campaign's standard risk applies: a value that is not an `IOrderBook`
  would now throw `InvalidCastException` at the declaration instead of `NullReferenceException` at the
  `.limit ()` deref on the same statement (both escape the core — no `catch` in any of the 72 methods).
  `null` behaves identically (a cast of `null` to a reference type yields `null`, then the same NRE).
* Evidence B is a per-file (per-class) correlation, not a hash-path trace: it shows the class resolves
  an order book cache for an `orderbook`-worded hash, plus (A) that the core itself cannot work unless
  the value is one. It does not symbolically follow the hash from the subscription to the resolve.
* The 3 multi-line casts are the only non-declaration-line diff lines; a reviewer who prefers a strictly
  one-line-per-declaration gate can drop the rule's multi-line case (3 sites) without touching the other
  69.
* `wathPublic` (hashkey) is a misspelling in the venue source; it is listed literally so the proof still
  fires on that core. It is not a normalisation of the identifier (the emitted name is unchanged).

## Tooling (campaigns/cs90/tools/U27/)

`survey.py` (per-site next-use context) · `evidence.py` (use-pattern histogram) · `candidates.py` (the
`(x as IOrderBook)` site list) · `report_table.py` (per-method survey table above) · `resolve_proof.py`
(the A/B proof checker with the coinone selftest).
