# U46 — element-write receivers: `((IDictionary<string,object>)x)["k"] = v`

Branch `cs90-U46`, base `d847892a6fcf5699640862316303b6344a3e4daf` (cs-strict-INT, ast pin
`404e9daa7f0ab58d085ed04aaa61a19546dfeda2`). **345 casts removed, 0 declarations typed.**

## Family

The C# element-access printer emits `((IDictionary<string,object>)x)["k"] = v` for every
dictionary-key write whose receiver type it cannot name. The cast is an *implicit upcast* —
an identity conversion — exactly when the receiver's emitted C# static type already implements
`IDictionary<string, object>`: the interface's `set_Item` and the receiver's own indexer are the
same callvirt, so deleting the cast moves no value and changes no failure mode.

Two hooks can name that type, and the printer asks the receiver-type hook **first**
(`csharpDictionaryElementWriteTarget` → `csharpDeclaredReceiverType`), falling back to the base
printer's S22 recorded-local gate (`csharpDictionaryIndexWriteNeedsNoCast`):

* S22 (`declaredLocalLines`, `build/csharp-local-types.js`) keys on the **printed declaration line**
  of a local and already covers the generated locals — including the ones this classifier retypes.
  It bails on any receiver that is not a named local (`this.x`, a call result, `x["a"]["b"]`).
* S21 (`receiverDeclaredType`, same file) answered only for receivers *named* `request`.

This unit audits that hook: it censuses which receivers still carry the cast and extends the hook
to the receiver shapes whose type the declaration already carries.

## Change (`build/csharp-local-types.js`, +62/−5 lines; no other `build/` file)

1. `receiverDeclaredType` — the `request`-only name gate is gone. It now answers, for any receiver:
   * `this.<member>` whose hand-written base declaration is a dictionary
     (`CSHARP_DICT_WRITE_MEMBER_TYPES`, each entry annotated with `cs/ccxt/base/Exchange.Options.cs`):
     `options` (ConcurrentDictionary<string, object>), `features` / `timeframes` / `has` / `api`
     (Dictionary<string, object>), `markets_by_id` (IDictionary<string, object>), `commonCurrencies`;
   * an identifier whose *declared* type is a ws orderbook type
     (`CSHARP_DICT_WRITE_LOCAL_TYPES`): `ccxt.pro.IOrderBook` / `OrderBook` / `IndexedOrderBook` /
     `CountedOrderBook` all implement `IDictionary<string, object>` (`cs/ccxt/ws/OrderBook.cs:9,25,313,367`);
   * `request` keeps the previous answer path unchanged.
   The identifier proof chain is unchanged and is now `identifierDeclaredType` (one binding per
   scope → checker `resolveReference` → the classifier's own `csharpLocalType`, then the printer's
   `getCSharpLocalType`), i.e. exactly the type the emitted line carries.
2. `dictionaryWriteReceiverIdentifier` (S22 half) — unwraps `ParenthesizedExpression` before the
   `AsExpression` arm. `(parsed as Dict)['fees'] = fees` reaches the printer as
   `ParenthesizedExpression(AsExpression)`, so the identifier unwrap never fired and 6 sites kept a
   cast the recorded line already contradicted.

No other printer/classifier path is touched: `csharpElementAccessTypedReceiver` (the S63 READ
twin), `csharpLocalTypeOf`, the declaration rewrite and every return-type table are untouched, and
`this.<member>` receivers the base declares `object` stay cast-wrapped.

## Census (`campaigns/cs90/census.sh`; before = `git archive HEAD~1 cs/ccxt`)

```
before  casts: (IDictionary<string,object>)=2563  (IDictionary<string, object>)=127   [exchanges/**]
after   casts: (IDictionary<string,object>)=2228  (IDictionary<string, object>)=127
before  cs/ccxt/base: 183    after: 173        (Exchange.BaseMethods.cs, generated)
total   removed: 345   (diff: +345/-345, 102 files)
locals: object=9304 typed=44132 typed%=82   (identical before/after — no declaration retyped)
```

Removed casts by receiver (345 lines):

| receiver | sites | why it is an identity |
|---|---|---|
| `this.options` | 210 | `ConcurrentDictionary<string, object>` (Exchange.Options.cs:76) |
| `orderbook` | 101 | local declared `ccxt.pro.IOrderBook` (`this.getOrderBook(this.orderbooks, sym)`) |
| `storedOrderBook` | 11 | local declared `ccxt.pro.IOrderBook` |
| `parsed` | 6 | `Dictionary<string, object>` + parenthesized `as Dict` receiver (fix 2) |
| `ob` | 4 | `ccxt.pro.IOrderBook` |
| `this.markets_by_id` | 3 | `IDictionary<string, object>` (Exchange.Options.cs:47) |
| `this.features` | 3 | `Dictionary<string, object>` (Exchange.Options.cs:75) |
| `currentOrderBook` | 3 | `ccxt.pro.IOrderBook` |
| `legacyOrderbook` | 2 | `ccxt.pro.IOrderBook` |
| `this.commonCurrencies` | 1 | `Dictionary<string, object>` (Exchange.Options.cs:57) |
| `orderBook` | 1 | `ccxt.pro.IOrderBook` |

Distribution: 217 member receivers, 122 orderbook-typed locals, 6 parenthesized-assertion locals.

## Gates

```
pair-audit.py --selftest      SELFTEST PASS: 8 pair shapes + block
pair-audit.py HEAD            files=102 pairs=345 unexpected=0        (exit 0)
soundness-check.py HEAD       sites=345 ok=345 bad=0                  (every receiver resolves to a dict type)
verify-diff.py HEAD           files=102 pairs=345 unexpected=345      (see below)
determinism                   git diff -- cs/ sha256 664fd3437f8b9aad before == after a second
                              full REST + WS regen  (fixed point)
tests tree                    `--force --tests` produces no diff (no write site in cs/tests carries
                              this family; the change is scoped to the exchange/base trees)
farm                          code 331b7b85165104de0ede1ee392c8ea3d7a5dcd07 job=824 exit=0
                              "Build succeeded. 0 Warning(s) 0 Error(s)"
                              branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
                              report tip 8b832cdcab78ea78b59970b9c3d71ebf45e4136c job=840 exit=0
                              branch_update=unchanged  (REPORT.md is not a build input: every
                              report-only tip carries the byte-identical cs/ tree of the code sha)
```

`verify-diff.py` has no rule for an inline statement cast (it models cast removals that head a
declaration/return), so it reports this unit's whole family as UNEXPECTED: 345/345. The
family-specific `campaigns/cs90/tools/U46/pair-audit.py` proves the stronger invariant instead —
each `+` line is its `-` line with one or more `((IDictionary<string,object>)RECV)` wrappers
deleted and every other byte identical (key, value, receiver text, trailing comment) — and its
`--selftest` rejects a changed key, a changed value, a renamed receiver, a kept cast and a
different cast target. `soundness-check.py` independently re-derives each removed cast's receiver
type from the generated tree (345/345 dictionary-typed).

No runtime lane was run: dotnet is farm-only for this campaign and the compile gate (job 824,
exit=0, 0 warnings) is the contract's gate. The removed casts are identity conversions, so no
runtime path changes shape — see residual risk.

## Rejected sub-cases (with the proof that rejected them)

1. **`object`-local receivers — 170 sites.** The emitted declaration is `object`, so the cast is a
   runtime conversion, not an identity; deleting it does not compile. Sub-families belong to other
   units: `this.account()` (18, U36), `this.safeValue(previousOrders|orders|ordersBySymbol, …)`
   (39, U08/U10), `getValue(...)` element reads (U03/U06), null-init later-write joins (U13–U18),
   venue helpers `safeOrderBook`/`parseTokenAndFeeTemp`/`createOrderRequest`/`omit` (U36/U37/U40).
2. **`var` receivers — 23 sites** (`gate.cs`/`pro/gate.cs`: `var request =
   ((IList<object>) requestrequestParamsVariable)[0];`). The element of an `IList<object>` is
   `object` by contract and the declaration prints `var`; the classifier rewrites only an exact
   `object <name> = ` prefix, so no hook answer can match the emitted line. Needs the destructuring
   element-type family (U13/U16/U26) or an [AST] change — rejected here.
3. **`object x = new Dictionary<string, object>() {}` receivers — 9 sites** (bitteam, bingx, gate ×2
   + `request`/`result` variants). The initializer proves a dict, but the *declaration* is `object`;
   retyping it is U39's literal-collection family (U39 < U46 owns the site), and a hook that
   answered would not compile. Rejected.
4. **`object` parameters — 362 sites** (`parameters` 137, `headers` 135, `request` 48, `orderbook`
   31, `subscription` 4, `body`/`data` 2 each, `sigPayload`/`ticker`/`message` 1). The signature
   carries `object`; narrowing it is U50–U52's param family (the params pilot was rejected as S43).
   No hook can name a type the signature does not carry.
5. **`this.<member>` receivers the base declares `object` — 511 sites** (`balance` 118,
   `orderbooks` 115, `trades` 84, `tickers` 75, `ohlcvs` 53, `bidsasks` 23, `markets` 13,
   `positions` 11, `fundingRates` 10, `urls` 6, `headers`/`outcomes`/`outcomes_by_id` 1 each).
   `((IDictionary<string,object>)this.orderbooks)[k] = v` is a *runtime* cast on an `object` field
   whose writers store `CustomConcurrentDictionary`, `ArrayCache` and orderbook values — the cast
   is load-bearing. Rejected; would need the field retyped first (U04/U11's family).
6. **Nested element-access receivers — 45 sites in `pro/binance.cs` alone**
   (`((IDictionary<string,object>)((IDictionary<string,object>)request)["create"])["quantity"] = …`,
   foxbit/gate shapes). The outer receiver is an element of a typed dict, whose C# type is `object`
   → runtime downcast. Rejected.
7. **Read casts on the same receivers** (`((IDictionary<string,object>)creds)["apiKey"]` inside a
   value expression, `((IDictionary<string,object>)query).Keys`, `.Remove(...)`): reads, not element
   writes — the S63/`csharpElementAccessTypedReceiver` family (U58/U63). Untouched here; the 4
   `creds` reads that share a line with one of my removals keep their cast, which is visible in the
   diff as `this.options["apiKey"] = ((IDictionary<string,object>)creds)["apiKey"];`.

## Residual risk

* **Member table is a mirror.** `CSHARP_DICT_WRITE_MEMBER_TYPES` hard-codes the seven dictionary
  members of `cs/ccxt/base/Exchange.Options.cs` with their file/line in a comment. If that file's
  declaration for one of them changes, the table must follow — the same maintenance contract as
  `CSHARP_LOCAL_WS_MEMBER_TYPES`. A member the table does not list keeps its cast (fail-closed).
* **Orderbook arm trusts the declared type.** The answer fires only when the emitted declaration
  already names a `ccxt.pro.*OrderBook*` type; the `object orderbook = await this.watch(...)`
  locals (U27's rejected sub-case) are unaffected — the hook returns undefined for them and they
  keep the cast.
* **Runtime shape.** Every removal is an upcast to an interface the receiver's static type already
  implements, so the emitted callvirt target is identical; the C# compiler enforces this at the
  build gate (job 824 exit=0). The `this.options` property can be reassigned, but only to a
  `ConcurrentDictionary<string, object>`, so the indexer identity holds for every value the field
  can hold. No id-tests/request/response lane was run on this VM (farm-only); the integrator's
  full test lane is the first runtime gate.
* **`x["k"] = v` on an `IOrderBook` receiver** relies on `IOrderBook` *not* redeclaring an indexer
  (`cs/ccxt/ws/OrderBook.cs:9-23` — it declares `limit/reset/Copy/update/asks/bids/symbol/nonce/
  timestamp/cache` only), so the inherited `IDictionary<string, object>` setter is the one the cast
  named.

## Hotspots

`hotspot:` none — no change to `build/csharpTranspiler.ts`, no ast-transpiler src change (no pin
bump), no hand-written base file touched. Single file changed in `build/`:
`build/csharp-local-types.js` (the S21 hook + the S22 identifier unwrap).
