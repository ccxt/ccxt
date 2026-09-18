# U36 — hand-written collection-helper locals (sort / arraySlice / addPaginationCursorToResult / safeOrderBook / describeData / markets+fees)

Branch `cs90-U36`, base `d847892a6fcf5699640862316303b6344a3e4daf`.
Code commit **f350bd19b0cb486387ccd5c8153608fb866611ce** — farm job **816, exit=0**
(`state=succeeded, branch_update=unchanged, generator=404e9daa`).

## Family / mechanism (build/csharp-local-types.js only — no build/csharpTranspiler.ts, no ast src, no hand-written base file)

| sub-family | sites | mechanism |
|---|---|---|
| `this.sort(...)` → `List<string>` | 5 | `CSHARP_LOCAL_THIS_RETURN_TYPES['sort']` — the hand-written `Exchange.Functions.cs#sort` is ALREADY `public List<string> sort(object)` (every path returns the fresh `sortedList`), the TS free function's `string[] \| any` annotation just never reached the printer. |
| `this.arraySlice(...)` → `List<object>` | 3 | new `arraySliceCallIsProvenList` predicate (csharpLocalTypeOf) + `(List<object>)` declaration cast. The hand-written `Exchange.cs#arraySlice` is `object` and one path (`byte[]` receiver WITH a `second`) returns the `byte[]` slice itself, so the rule accepts a call only when the TS checker proves the receiver is an ArrayType (byte[] arrives as `Uint8Array`, an object type — probe output below). |
| `this.addPaginationCursorToResult(...)` → `List<object>` | 19 | `CSHARP_COLLECTION_RETURN_METHODS_BY_DECLARATION['addPaginationCursorToResult']` — by-declaration return-path proof: bybit (`safeListN` local) and pacifica (`safeList` local) prove, kraken (`safeValue (result, 'withdrawals')`) and deribit do not and keep `object`. |
| `this.safeOrderBook(...)` → `ccxt.pro.IOrderBook` | 5 | `ORDERBOOK_WIDENING_EDGES` (impl → interface, mirroring the existing `assignable()` edge) passed into the later-write join: the retype was already reachable, the later `orderbook = this.orderBook (…)` write made `joinTypes` bail. |
| `base.describeData()` / `base.describe()` → `Dictionary<string, object>` | 10 | new `SuperKeyword` arm in `callReturnType`, keyed ONLY on the name-keyed `CSHARP_COLLECTION_RETURN_METHODS` table (every declaration of a listed name prints the mapped type, so the parent's generated signature is proven by the same table). |
| `this.markets` / `this.fees` → `IDictionary<string, object>` | 13 | new `memberDictReadCastType` predicate (csharpLocalTypeOf) + interface cast. Writer census: `markets = null` / `createSafeDictionary()` (`ConcurrentDictionary`/`CustomConcurrentDictionary`) / `mapToSafeMap(...)` (explicit `IDictionary` cast) / `SafeValue(…, "markets") as dict` / `sourceExchange.markets`; `fees = new dict()` / `… as dict`. Nothing else ever writes either member, so the cast can never throw where the `object` box flowed on. Declaration-only: later writes of the same member keep `object` (no write-cast machinery) so the join stays conservative. |

**typed declarations 55** (`IDictionary<string, object>` 13, `List<object>` 22, `Dictionary<string, object>` 10, `List<string>` 5, `ccxt.pro.IOrderBook` 5). The campaign census metric reads **+46** because its typed-token list does not carry `List<string>` (5 of the 55). **casts removed 12** (5 dict index-write elisions, 3 `((IList<object>)x).ToArray()` skips, 2 return boundary casts + their 2 inner `(object)` boxes); 12 casts were ADDED as the declaration casts of the new cast-backed families (member reads 9 + arraySlice 3) — net cast-token count unchanged.

## Census

before (base d847892a6fc):
```
locals: object=9304 typed=44132 typed%=82
casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
params: object=11635  returns: object=1080
helpers: isTrue=1434 isEqual=12034 getValue=6761 add=8833 getArrayLength=704
```
after (f350bd19b0c):
```
locals: object=9253 typed=44178 typed%=82
casts: (string)=2113 (IList<object>)=1919 (bool)=1 (object)=670 (Dictionary<string, object>)=332 (IDictionary<string,object>)=2558 (Int64)=133 (IDictionary<string, object>)=136 (List<object>)=105
params: object=11635  returns: object=1078
helpers: isTrue=1434 isEqual=12034 getValue=6750 add=8833 getArrayLength=697
```
(`returns: object` -2 = the two retyped `addPaginationCursorToResult` declarations; `getValue` -11 / `getArrayLength` -7 are the knock-on classes below.)

## verify-diff.py HEAD

```
files=30 pairs=86 unexpected=29
```
The 29 UNEXPECTED lines are **three knock-on classes of the retyped declarations** (every one behaviour-preserving, none is a new site):

1. **`getValue(local, "lit")` → `GetValue(local, "lit")` (11 lines)** — binance/bitvavo/coinbaseinternational/coinex `fees` reads (8) and the three `parsed` reads in `pro/coinbaseexchange.cs`. `printTypedDictElementAccessIfAny` (ast-transpiler pin 404e9daa) emits the typed twin for a dict-typed receiver + string-literal key; its doc: "runs the same dictionary read the object overload's dict branch runs (null receiver or key -> null, ContainsKey -> indexer)". Identical semantics; only the declaration this unit retyped makes the printer choose it.
2. **`getArrayLength(x)` → `x?.Count ?? 0` (7 lines)** and **`((IList<object>)x).ToArray()` → `x.ToArray()` (3 lines)** — the helper→native pass for a receiver this unit proved `List<object>`/`List<string>` (`x?.Count ?? 0` is exactly `getArrayLength` for a list: null→0, else Count; the ToArray cast succeeds on null, so both spellings throw the same `ArgumentNullException`).
3. **dict index-write cast elision `((IDictionary<string,object>)x)[k] = v` → `x[k] = v` (5 lines, base + coinbaseexchange) and the two boundary casts `return ((Dictionary<string, object>)((object)(parsed)));` → `return parsed;`** — the receiver/return value is now statically the very type the cast named (identity conversion; `S22`/`installCsharpDictionaryIndexWriteCastElision` + the collection-return boundary rule).

Determinism: `--force` REST + `--ws` + `--prediction` re-runs reproduce the identical `git diff -- cs/` sha256 (`b2c2e469…`) — the tree is a fixed point, and the farm's `branch_update=unchanged` confirms it against the committed pin.

## Rejected sub-cases (with reason)

**`arraySlice` byte[] receivers (4 sites, kept `object`)** — `coinbase.cs:5899`, `pacifica.cs:4090`, `backpack.cs:2694`, `pro/backpack.cs:93` (`seed = this.arraySlice(secretBytes|byteArray, 0, 32)`). The receivers are `Uint8Array` (probe: `flags=1048576 objFlags=524292 target=Uint8Array` → not an ArrayType), i.e. exactly the one path where the hand-written helper returns a `byte[]` slice, and the consumers (`eddsa(...)`, `jwt(...)`) take the value as an opaque `object`. Typing the local would need either a `(List<object>)` cast that throws on that path or a behaviour change to the helper's byte[] branch (the TS reference returns a `Uint8Array` slice there) — rejected.

**`addPaginationCursorToResult` kraken / deribit declarations (2 declarations)** — kraken returns `this.safeValue (result, 'withdrawals')` (no default: any JSON box), deribit's single return is an unproven local. The by-declaration prover leaves both `object`; their call sites (`rawWithdrawals = …`, `settlementsWithCursor = …`) keep `object` too. Retyping them would need a TS-side `safeValue`→`safeList` swap (behaviour change in 6 ports: missing key null→`[]`) — rejected.

**`this.account()` (6 pro sites)** — the later write is `account = this.balance[code]`: the emitted C# element read on the `object`-declared `balance` member is `getValue(this.balance, code)` (static type `object`), and there is no write-cast machinery (only destructuring writes can be re-cast). Declaring the local `Dictionary<string, object>` would emit `account = this.balance[code];` → CS0266. Rejected with that proof.

**`this.safeDict(...)` leftovers (19)** — every one is blocked by a later write whose C# static type is not a dict, so the join (correctly) bails: element reads of unproven receivers (`entry = raw`, `order = rawOrder`, `account = accountData['info']`, `address = entry`, `cachedWallet = wallets[i]`), `this.safeValue (responseData, 0)` (kucoin `responseData`), a self-read ternary (`(close === undefined) ? {} : close`, kraken), a self-safeValue (`rawOrders = this.safeValue (rawOrders, 'result', rawOrders)`, pro/bybit), awaited venue helpers (`signer = await this.loadAccount(…)`, `quote = await this.fetchTradeQuote(…)`), a venue helper (`credentials = this.retrieveDydxCredentials(…)`), a ternary over two `safeValue`s (kucoin `partner`), and two genuine dict→list reassignments (`data = this.safeList (data, 'data', [])` kucoin, `fees = this.safeList (fees, 'list', [])` bybit). None of these is one box; typing any of them would need a cast at the WRITE (no mechanism) or a TS-side rewrite owned by other units. Rejected.

**`this.safeList(...)` leftovers (5)** — btse `rows` (2 sites): initialiser is `this.safeList (response, 'data') as any`, which the printer emits as `((object)…)`; naming the local needs the documented `stripObjectBox` wrapper route (not present on this branch) — out of scope for the diff budget. binance `leverages`/`assets` (2 sites): later write `leverages = response` (an API response `object`; the TS `Array.isArray (response)` guard is not a C# static proof). pro/bybit `rawOrders` (1 site): self-safeValue write. Rejected.

**`this.markets` write sites** — `let filteredMarkets = this.markets; … filteredMarkets = this.filterBy (…)` (base `getSymbolsForMarketType`) stays `object` by construction: the later write is a `List<object>`, so the join bails (correct).

## Residual risk

- The 12 new declaration casts (`IDictionary<string, object>` ×9, `List<object>` ×3) are runtime casts; each rests on a writer census (member writers, `arraySlice` receiver shape) recorded in the classifier comments. A writer added later that stores a non-dict into `this.markets`/`this.fees`, or a call site passing a `byte[]` receiver without the checker proving it an ArrayType, is the failure mode to watch.
- The 29 knock-on lines are justified per class above; the `GetValue`/`?.Count`/index-write-elision semantics come from the pinned ast-transpiler (404e9daa), not from this diff.
- The campaign census's typed-token list lacks `List<string>`, so the metric under-counts this unit by 5.
- `account` (6), `safeDict` (19), `safeList` (5) leftovers are left for a unit that owns write-casts / the element-read families (U03/U06) — the roster's "fix the join" wording does not survive the per-site proof above.

## hotspot

`hotspot: none` — no `build/csharpTranspiler.ts`, no ast-transpiler src, and **no hand-written base file** was touched (the hand-written `sort` was already `List<string>`; `arraySlice`/`markets`/`fees` are resolved classifier-side behind declaration casts; `safeOrderBook` already returns `ccxt.pro.IOrderBook`). No bridge mirrors are therefore required (`cs/tests/BaseTest.Bridge.cs`, `examples/cs/examples/Examples.Bridge.cs` untouched).

## Tooling (campaigns/cs90/tools/U36/)

`instrument.py` (adapted from U32; reject/join/decl logs for this family), `blockers.py`, `focus.py` (per-site blocker table), `probe-arrayslice.mjs` (checker verdict for every `this.arraySlice` receiver), `diff-classify.py` (buckets the emitted diff: DECL 55 / SIG 2 / KNOCK 29).
