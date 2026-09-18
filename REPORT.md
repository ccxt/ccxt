# U06 — row-list element reads (`object <row-name> = getValue (recv, i|key)`)

Family (roster line U06): the 12 element-read local names
`balance / order / rawOrder / position / rawPosition / trade / rawTrade / ticker / account / tier /
chain / networkEntry` initialised by `recv[i]` / `recv[key]` (printed `getValue (recv, key)`), typed
`IDictionary<string, object>` when the TS checker proves the receiver's **element** is a ccxt row
shape.

## What changed

- `build/csharp-local-types.js` (only file touched; no ast-transpiler, no hand-written base, no ts/src):
  - new section `U06: dictionary ROW element reads` — `DICT_ROW_LOCAL_NAMES` (the 12 names),
    `DICT_ROW_STRING_METHODS`, `dictRowUsesAreConsistent ()`, `dictRowElementReadType ()`;
  - one new branch in `csharpLocalTypeOf` (after `urlsDescribeStringProducer`, before
    `omitDictionaryProducer`): `csharpType = 'IDictionary<string, object>'`, `cast = 'IDictionary<string, object>'`;
  - one bullet in the file header's family list.

Declaration shape (one changed line per site, plus the knock-ons below):

```
-            object rawOrder = getValue(orders, i);
+            IDictionary<string, object> rawOrder = ((IDictionary<string, object>)getValue(orders, i));
```

**78 declarations typed, 0 casts removed** (76 in `cs/ccxt/exchanges/**` — the census scope — plus 2
in the generated base methods `cs/ccxt/base/Exchange.BaseMethods.cs` and
`cs/ccxt/base/PredictionExchange.cs`, whose receivers are the `buildOHLCVC (trades: Trade[])` /
`safePredictionOrder` parse-result `trades` list).

Receiver/element breakdown of the 78 (checker census over `ts/src`, 315 sites in the family):

| receiver | element type | sites |
|---|---|---|
| `orders` param `OrderRequest[]` | `OrderRequest` | 34 |
| `orders` param `CancellationRequest[]` | `CancellationRequest` | 5 |
| `positions` (`fetchPositions ()`, `Promise.all` result, `parsePredictionPositions`) | `Position` / `PredictionPosition` | 18 |
| `trades` (`parseTrades`, `parseWsTrades`, `buildOHLCVC` param, tests' `Object.values`) | `Trade` / `PredictionTrade` | 8 |
| `accounts` (`this.accounts`, `loadAccounts ()`, `fetchAccounts ()`) | `Account` | 6 |
| `parsed` / `parsedTrades` (`parseOrders`, `parseTrades`, `parsePredictionPositions`) | `Order` / `PredictionOrder` / `Trade` | 6 |
| `networkEntries` (`rawCurrency as Dict[]`) | `Dict` | 1 |

## Census

```
before: locals: object=9304 typed=44132 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        helpers: isTrue=1434 isEqual=12034 getValue=6761 add=8833 getArrayLength=704
after:  locals: object=9228 typed=44208 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2562 (Int64)=133 (IDictionary<string, object>)=203 (List<object>)=102
        helpers: isTrue=1434 isEqual=12034 getValue=6749 add=8833 getArrayLength=704
```

`(IDictionary<string, object>)` +76 (this family's identity cast back), `(IDictionary<string,object>)`
−1 (the class-B knock-on below), `getValue(` −12 (the class-A knock-on), every other counter identical.

## Gates

```
$ python3 campaigns/cs90/verify-diff.py d847892a6fc
files=55 pairs=94 unexpected=16
```

All 16 unexpected pairs are the two knock-on classes below, audited by
`campaigns/cs90/tools/U06/knockon-audit.py`:

```
$ python3 campaigns/cs90/tools/U06/knockon-audit.py --selftest
SELFTEST PASS: getValue->GetValue and element-write pairs accepted; retargeted receiver / changed
key / mutated tail / mutated write / unrelated line flagged
$ python3 campaigns/cs90/tools/U06/knockon-audit.py d847892a6fc
pairs: decl=78 A(getValue->GetValue)=15 B(identity cast drop)=1 unclassified=0
```

- **A (15 lines)** — `getValue (x, "k")` → `GetValue (x, "k")`: the S63 typed twin
  (`cs/ccxt/base/Exchange.TranspileHelpers.cs`), bound because `x` is now a declared
  `IDictionary<string, object>` local. Same line otherwise, literal string key, receiver declared by
  this diff in the same file. `GetValue(IDictionary<string,object>, string)` performs exactly the
  object overload's dict branch (null check, `ContainsKey`, indexer); its string/array branches are
  unreachable for a dictionary receiver — behaviour-identical, and this is the mechanism S63 ships
  for every dict-typed receiver.
- **B (1 line)** — `((IDictionary<string,object>)trade)["symbol"] = symbol;` →
  `trade["symbol"] = symbol;` (pro/toobit): the receiver-declared-type hook drops an identity cast
  around a local this diff declares a dictionary. Same indexer write on the same object.

Farm (compile gate, `dotnet` never run locally):

```
job 664  sha 8a70d5f6659c152451da7f2d150db40d79b698f3  targets=cs  exit_code=0
state=succeeded  branch_update=unchanged  generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
```

`branch_update=unchanged` on the farm's own `--force` regeneration is the fixed-point proof: the
committed tree is byte-for-byte what the classifier emits. Job 659 (the previous sha) was red with
`CS0103: The name 'GetValue' does not exist in the current context` — that is the tests-tree
sub-case below; both trees are green after the gate.

## Rejected sub-cases (with reason)

1. **234 sites whose receiver element type is `any`** (`balances`, `data`, `response`, `chains`,
   `feeTiers`, `info`, `positions: any[]`, ... every venue's untyped parse loop). The checker offers
   no element type, so the box could be a row, a list, a scalar or null — stays `object`. This is
   the bulk of the ~350-site family.
2. **4 sites with a `string` element** — `order = success[i]` (bittrade, htx, receiver
   `success: Strings`), `ticker = tickers[i]` (nado, receiver `Object.keys (response)`). A string box
   is not a row; the string-element family (`stringElementsProducer`, S24) owns those.
3. **1 site on a string-keyed dictionary receiver** — pro/nado `ticker = tickers[symbol]` with
   `tickers: Tickers` (`Dictionary<Ticker>`). Dict-receiver element reads belong to the
   receiver-keyed families (U04, lower unit number); the rule rejects any receiver with a string
   index signature, so U06 can never claim one. Measured: exactly this one site in the corpus.
4. **The generated TESTS tree** (6 declarations + 2 class-A knock-ons in
   `cs/tests/Generated/Exchange/**`: `ticker = values[i]`, `order = orders[i]`,
   `trade = response[i]`, `symbol = trade["symbol"]`, ...). Rejected by a source-path gate. Reason
   is machine-proven: the tests are not exchange classes (they hold the exchange in a parameter and
   only have the hand-written `BaseTest.getValue` bridge, `cs/tests/BaseTest.Bridge.cs`), so the S63
   twin my declaration triggers does not resolve there — farm job 659 failed with
   `CS0103: The name 'GetValue' does not exist in the current context` at
   `cs/tests/Generated/Exchange/Ws/test.watchTickers.cs:76`. Widening S63 to print
   `Exchange.GetValue(...)` in test files is a different unit's mechanism, not this one's.
5. **Class / array / tuple / union element types** — the rule rejects them by construction; the
   corpus contains none (checked: all 315 sites are `any`, a scalar, or an interface).

No site was rejected by the use-consistency veto or by `csharpLocalIsSafeToRetype`: all 76 in-scope
candidates passed (the veto list — string-member receivers, arithmetic operands, spreads,
destructuring, `ref` sinks — fires on none of them).

## Residual risk

- **The 39 param-receiver sites** (`orders: OrderRequest[]` / `CancellationRequest[]`) rest on the
  caller honouring the documented row contract, which C# does not enforce. The only in-tree caller is
  the generated id-test (`cs/tests/Generated/TestMethods.cs:3029-3041`), which passes
  `List<object>` of `Dictionary<string, object>`; every in-body use is a `safe*` read, so a non-dict
  element was never usable: today a **string** element already throws (`getValue`'s string branch runs
  `Convert.ToInt32 (key)` on `"symbol"` → `FormatException`), a numeric element yields nulls and then
  `BadSymbol` from `this.market (null)`. The new cast converts the first class into
  `InvalidCastException` at the declaration; both fail the call.
- **C# view structs of the same names exist** (`cs/ccxt/base/Exchange.Types.cs`: `struct OrderRequest`,
  `CancellationRequest`, `Position`, `Trade`, `Order`, `Ticker`, `Account`) with public constructors
  taking a row. In-tree they are only ever built by the typed-core `To*List` converters on the typed
  RETURN path, and `From*List` converts them back to `Dictionary<string, object>` before any receiver
  in this family reads an element (verified for all 15 pro/prediction sites) — so no in-tree path can
  put a struct box in front of the cast. A *hand-written caller* could still pass a
  `List<OrderRequest>` / `List<Position>` (the parameter is `object`): today's untyped read tolerates
  that through `SafeValueN`'s reflection fallback (`value2.GetType().GetProperty ("symbol")`), the
  declared `IDictionary<string, object>` cast throws `InvalidCastException` there instead. No caller
  in the tree does this (`grep -rn 'new OrderRequest (\|new CancellationRequest (\|new Position ('
  cs/` → only TypedCores' own `new Position (value)` inside a `value is Position ? … :` re-box);
  dropping this sub-case is a receiver-kind test in `dictRowElementReadType` (39 of the 78 sites).
- **Why `IDictionary<string, object>` and not `Dictionary<string, object>`**: JSON rows are concrete
  `Dictionary<string, object>` (`JsonHelper.ToObject`), but a caller-supplied row (or
  `createSafeDictionary ()` / `options` values) can be any `IDictionary` implementation, and the
  concrete cast throws on those where the interface cast is an identity. Every acceptance test in
  this family was run with the interface spelling.
- **Widening beyond the literal roster wording**: the roster line says "type only where the TS
  receiver type's element is `Dict`/object-literal (checker `isObjectLiteralType`), otherwise reject".
  Taken literally that is **1 site** (digifinex `Dict[]`); the interfaces the checker reports
  (`OrderRequest`/`Position`/`Trade`/`Account`/`Order`/`Ticker`/`CancellationRequest`/`Prediction*`)
  are object types but not `ObjectLiteral`-flagged. This unit types them too, on the roster line's own
  other clause ("the box is a dict per TS annotation on the parse* param") plus the runtime proof, and
  the runtime proof was re-derived per receiver producer **in the emitted C#**, not from the TS type
  name alone:
  - `this.parseTrades / parseWsTrades / parseOrders / parsePredictionPositions /
    parsePredictionTrades` — the parse row builders, whose every return is a dictionary or null;
  - `ccxt.BaseExchange.FromPositionList / FromAccountList / FromOrderList / FromPredictionOrderList /
    FromPredictionTradeList` — the typed-core converters the pro/prediction tree wraps its
    `await this.FetchX (...)` in: `FromPosition (row)` and its siblings rebuild each row as
    `new Dictionary<string, object> ()` field by field (`FromPositionList`, TypedCores.cs:5060),
    so even the typed-struct path hands the loop dictionaries;
  - `this.accounts` / `loadAccounts ()` / `fetchAccounts ()` — `this.accounts = await this.fetchAccounts
    (params)` (ts/src/base/Exchange.ts:6497) over parseAccount rows;
  - `networkEntries = rawCurrency as Dict[]` — the TS cast asserts `Dict` per element.
  Narrowing the rule to `Dict`/object-literal only is a one-line change in
  `dictRowElementReadType`, giving 1 declaration.
- `cs/tests`, `examples/cs` and the hand-written base are unchanged; the `build/` diff is one file.
- Not run here (dotnet is farm-only and the farm gate is compile-only): `npm run id-tests-cs`,
  `request-cs`, `response-cs`. They should be run at integration — the 39 param-receiver sites are
  exercised by `id-tests-cs` (binance `CreateOrders`).

## hotspot lines

```
hotspot: build/csharp-local-types.js — new U06 section + one csharpLocalTypeOf branch (classifier only)
```

No ast-transpiler src change (pin stays `404e9daa7f0ab58d085ed04aaa61a19546dfeda2`), no hand-written
base file touched, no `build/csharpTranspiler.ts` change.

## Tools added (campaign dir, not the repo)

- `campaigns/cs90/tools/U06/u06-census.mjs` — checker census of the family (receiver type, element
  type, object flags) over the batch program the printer uses.
- `campaigns/cs90/tools/U06/u06-uses.mjs` — per-site receiver declaration + every use of the local.
- `campaigns/cs90/tools/U06/knockon-audit.py` — the class-A/class-B pair audit, `--selftest` proven.
