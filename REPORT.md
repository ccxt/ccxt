# cs90 U42 — plain identifier copies `object x = <typed param or local>;`

Branch `cs90-U42`, base `d847892a6fcf5699640862316303b6344a3e4daf` (PR #30530 head), ast pin
`404e9daa7f0ab58d085ed04aaa61a19546dfeda2` (unchanged — not an [AST] unit).
Final sha `2f798ef0c0bbe305810ed2a5bdbaa582b3fca0fb`, farm job **887 exit=0**
(`branch_update=unchanged`). **12 sites typed / 0 casts removed.**

## Family and mechanism

`object x = y;` where `y` is a method parameter or a body local whose **emitted** C# declaration
is concrete: the copy holds exactly that declaration's box (a reference copy, or the same value
type), so the copy may name the same type when every other use of it is an identity.

New post-print pass `retypeIdentifierCopies` + `u42CopyIsProvable` / `u42CopyUseKind` /
`u42CopyRhsIsTyped` / `u42StringArmIsTyped` in `build/csharpTranspiler.ts`, wired outermost (after
`dropRedundantObjectBoxCasts` / `retypeCacheElementWriteCasts`) in all four pipelines:

* `hotspot: build/csharpTranspiler.ts:1204-1235` — the U42 tables (`U42_COPY_TYPES`,
  `U42_COPY_OWNED_SOURCES` / `_ALIASES`, `U42_COPY_CALLEES`, `U42_COPY_WIDENING`).
* `hotspot: build/csharpTranspiler.ts:3575-3830` — the pass and its proofs.
* `hotspot: build/csharpTranspiler.ts:6043`, `6051`, `6099` (base / trading / prediction base
  pipelines) and `6448` (exchange + ws + prediction exchange pipeline) — one call each.

**Why the rule cannot live in the classifier** (the roster line asked for an extension of the
#30502 U05 copy family, which IS classifier-side): at print time the printer answers `object` for
**every** parameter (`baseTranspiler.printParameterType` → `DEFAULT_PARAMETER_TYPE`, `INFER_ARG_TYPE`
is false for C#), so the classifier has no way to know a parameter's emitted type; the passes that
narrow parameters (`typeCoreArgs`, `typeVenueStringArgs`, `retypeSignatureArgs`) and the wrapper
types an `override` method inherits (printer's override heuristic, `printParameteCustomName` +
`ArgTypeReplacements`) all run outside the classifier. The copy rule was therefore implemented where
the declared type literally exists: the emitted text. The classifier-side half of the family is
already complete — its `copyReadLocalType` resolves every source it can name, and the residual
classifier-side rejects below are legitimate write disagreements, not missing proofs.

Proof (per occurrence of the copy, `u42CopyUseKind`):

1. every shape `coreArgShadowUseKind` already proves for `typeCoreArgs` shadows — identity cast,
   cast to `object`, bare argument to a callee whose position there is `object` in **every**
   definition (`CORE_ARG_SHADOW_CALLEES` / `_NEW_CALLEES` / `_ONLY_POSITIONS`, `add` at position 1
   only), element of an object-valued initializer, `IDictionary<string, object>` element write,
   `return x;` from an object-returning method, `postFixIncrement(ref x)`-free shapes;
2. `alias = <rhs>;` / `alias ??= <rhs>;` where `rhs` is a proven producer of the target box
   (`coreArgShadowRhsIsTyped` for `string`, plus this unit's producers below);
3. `alias = <ident>;` where the method declares `<ident>` with the same box, or along
   `U42_COPY_WIDENING` (`List<object>`→`IList<object>`, `Dictionary`→`IDictionary`,
   `string?`→`string` — a nullable reference annotation is the same C# type at run time, only a
   NoWarn'd CS86xx);
4. `<other> = alias;` where `<other>` is a parameter/local declared `object` or a type the copy
   converts to implicitly — the same reference/box, and the target's own declaration is untouched;
5. `<dict>["key"] = alias;` on a receiver the body declares `Dictionary<string, object>` /
   `IDictionary<string, object>` (the `object` slot boxes the same value; the base pass's rule of
   the same shape needs the cast spelling, which a typed local does not carry);
6. `alias.ToString()` (a read of the receiver) for string targets — `object.ToString()` and
   `string.ToString()` are the same virtual call;
7. extra callees, each proven by a definition census in `cs/ccxt/base` (all positions `object`):
   `currency` → `Dictionary<string, object> currency (object id)`;
   `networkIdToCode` → `string? networkIdToCode (object networkId, object code)`;
   `safeCurrencyCode` → `string? safeCurrencyCode (object code, object currency = null)`;
   `safeOutcome` → `IDictionary<string, object> safeOutcome (object, object)`;
   `safeOutcomeSymbol` → `string? safeOutcomeSymbol (object, object)`;
   `filterByValueSinceLimit` → `object filterByValueSinceLimit (object, object, object, …)`;
   `getArrayLength` → the `List<object>` / `IList<object>` twins are identity copies of the
   `object` overload's `IList<object>` branch (`(value == null) ? 0 : value.Count`,
   `Exchange.TranspileHelpers.cs:697-712`), so an `IList<object>` argument cannot change the result;
8. conditional writes `(cond) ? "a" : "b"` / `(cond) ? strLocal : strLocal2` for string targets —
   the value is the selected string (or null).

`reads > 0` is required (a write-only local is CS0219 either way, but a read keeps the proof honest).

Ownership (disjointness): the U23 (`limit`), U24 (`symbol`, `timeframe`, `since`, `currency`,
`tag`) and U25 (`tag`) sources and their `<name>Var` copies are skipped by name, so no sibling
site is claimed twice; the copy families those units extended (`retypeCoreArgCopies`,
`coreArgShadowIsProvable`) are **not modified** — U24's 143-line and U25's 116-line diffs to that
function merge cleanly beside this new pass.

## Census

```
before: locals: object=9304 typed=44132 typed%=82   (campaigns/cs90/census.sh on d847892a6)
after:  locals: object=9292 typed=44144 typed%=82
casts:  (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334
        (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        — byte-identical to the base census (0 casts removed; this unit only renames declarations)
```

12 sites typed, 11 files: `blofin.cs`, `extended.cs`, `gate.cs` (2), `okx.cs`, `phemex.cs`,
`poloniex.cs`, `prediction/kalshi.cs`, `prediction/limitless.cs`, `prediction/myriad.cs`,
`prediction/polymarket.cs`, `pro/binance.cs`.

```
IList<object> symbolsList = symbols;   (blofin fetchLeverages)
string fromAccountVar = fromAccount;   (extended Transfer)
string? orderId = id;                  (gate fetchOrderRequest)
List<object> result = response;        (gate FetchOrdersByStatus)
string codeVar = code;                 (okx FetchDepositAddress)
string sideVar = side;                 (phemex CreateOrder)
string idVar = id;                     (poloniex FetchOrder)
double? yesPrice = price;              (prediction/kalshi CreateOrder)
string amountHex = maxUint;            (prediction/limitless approve)
string outcomeVar = outcome;           (prediction/polymarket WatchTicker)
string outcomeVar = outcome;           (prediction/myriad WatchOrders)
string? marketTypeVar = marketType;    (pro/binance ensureUserDataStreamWsSubscribeSignature)
```

## Gates

```
$ python3 campaigns/cs90/verify-diff.py d847892a6fc      -> files=11 pairs=12 unexpected=0
$ npx tsx build/csharpTranspiler.ts --force --noTests <all 104 REST ids>   exit=0   (diff hash c3cf6262…)
$ npx tsx build/csharpTranspiler.ts --force --ws --noTests <76 ws ids>     exit=0
$ npx tsx build/csharpTranspiler.ts --force --prediction --noTests <7 pred ids>  exit=0
$ npx tsx build/csharpTranspiler.ts --force --tests                        exit=0 (generated tests unchanged)
determinism: full REST+ws+prediction regen re-run -> identical `git diff -- cs/` sha256
farm: HEAD 2f798ef0c0bbe305810ed2a5bdbaa582b3fca0fb job=887 exit=0 branch_update=unchanged generator=404e9daa
```

`branch_update=unchanged` is the farm's own forced regen reproducing the tree byte-for-byte (fixed
point). The REPORT tip is re-gated the same way; see the last section.

## Rejected sub-cases (with the proof of why)

Census of the family (`object x = <ident>;` in `cs/ccxt/**`, 2421 sites): 1783 have a literal
initialiser (other units), 134 an `object` source, ~440 are the U23/U24/U25-owned `*Var` shadows,
and **65** have a concrete source type (the candidates here). 12 typed, the other 53 rejected:

**Write disagreement — an `object`-boxed producer (the "every later write agrees" rule):**

* `BaseMethods.cs:6971 uniqueResults = result` — `uniqueResults = this.removeRepeatedElementsFromArray(result);`
  returns `object` (`Exchange.BaseMethods.cs`).
* `BaseMethods.cs:7513 codeVar = code` / `gemini.cs:2346 codeVar = code` — `codeVar = GetValue(currency, "code");`
  → `GetValue(object, object)` is `object`.
* `gate.cs:7015` (source `spotResult` is `List<object>` — accepted) vs `prediction/binance.cs:559
  capped = collected` — `capped = this.arraySlice(collected, 0, limitVar);` → `arraySlice` returns `object`.
* `alpaca.cs:1171 symbolsVar = symbols` — `symbolsVar = allSymbols;` where `allSymbols` is declared
  `object` (`this.sort(...)` is not in a return table yet); `symbolsVar = this.marketSymbols(...)`
  is `IList<object>` but the first write decides.
* `prediction/kalshi.cs:2823` / `prediction/opinion.cs:460 reqLimit = pageLimit` — `reqLimit = remaining;`
  where `remaining` is `object` (`subtract(limit, rawEvents.Count)`).
* `pro/gate.cs:2632 messageHash = requestId` — `requestId` is an `object` parameter
  (`requestPrivate(object url, object reqParams, object channel, object requestId = null)`).
* `gate.cs:6549` (`clientOrderId` is `string?` → accepted) vs `poloniex.cs:2528 idVar = id` —
  `idVar = clientOrderId;` with `object clientOrderId = this.safeValue(parameters, "clientOrderId")`.
* `pro/binance.cs:3996/4994/5661 urlType = type` — the source local `type` is `object type = null;`
  + `type = ((IList<object>)…Variable)[0];` (another unit's destructuring family owns that retype).
* `prediction/myriad.cs:1265 txHash = txHashParam` — `txHash = await this.sendEvmTransaction(...)`
  is `Task<object>`.
* `pro/bitvavo.cs:1855 messageHash = action` — `DynamicInvoker.InvokeMethod(...)` is `object`.
* `prediction/polymarket.cs:1659 endS = nowS` (source `Int64`) — `endS = this.sum(startS, maxWindow);`
  → `sum(object, object)` is `object`; also the `endS = cond ? endBound : nowS` arm type is `object`
  for the same reason.
* `prediction/hyperliquid.cs:2253 title = parentSymbol` — `title = add(underlying, titleSuffix);`
  with `object underlying` → `add(object, object)` is `object`.
* `toobit.cs:3485 payload = queryString` — `payload = add(body, payload);` with `object body`.
* `pro/bullish.cs:418 messageHash = subscribeHash` / `pro/coinbase.cs:76,132 messageHash|watchMessageHash = name`
  — the copy is the LEFT operand of an `add(...)` chain inside a later write
  (`add(add(messageHash, "::"), …)`): `add(string, *)` and `add(object, *)` differ on a null left.
* `htx.cs:8109` / `lighter.cs:2861,3284` / `mudrex.cs:1490` / `poloniex.cs:4100` / `gate.cs:8754
  amountVar = amount` (`double`) — the writes are `parseFloat(...)` (`static object parseFloat(object)`),
  `this.parseToInt(...)` (`Int64?`, not convertible to `double`), or a `ref` sink
  (`prefixUnaryNeg(ref amountVar)`, which the shared scan rejects outright).

**`add(...)` / `+`-chain write or read (overload rebinding on a null left):**

* `deribit.cs:1276 symbol = id`, `krakenfutures.cs:555 symbol = id`, `kraken.cs:754 bs = baseId`,
  `mudrex.cs:624 bs = ms`, `prediction/hyperliquid.cs:2253 title` — every write is
  `add(add(…), …)`; with a `string?` copy the left operand rebinds `add(object, object)` →
  `add(string, object)` and a null left yields the right operand instead of null.
* `alpaca.cs:2079`, `hollaex.cs:2045`, `okx.cs:6859 addressVar = address`, `kraken.cs:3710
  codeVar = code` — `addressVar = add(add(addressVar, ":"), tagVar);` (the copy is the add's left).
* `pro/htx.cs:1050 prefix = orderType` — `object marginPrefix = (marginMode == "cross") ? add(prefix, "_cross") : prefix;`
  (add position 0).
* `pro/kraken.cs:1259 messageHash = name` / `pro/htx.cs:1096,1097` / `pro/upbit.cs:429` — the source
  is an `object`/`any` parameter, not a string one (the text census mis-bucketed some of these).

**Box-changing literal / element writes:**

* `kucoin.cs:11643 start = since` — `start = 0;`: an `int` literal into `Int64?` converts
  (boxes an Int64 where the `object` spelling boxes an Int32) — the rule the `typeCoreArgs` header
  documents; `mudrex.cs:380 requestLimit = limit` — `requestLimit = 500;` (same).
* `pro/gate.cs:543 interval = intervalDefault` — `interval = intervalparametersVariable[0];`
  (an element read from `IList<object>` is `object`).
* `whitebit.cs:4966 errorInfo = message` — `errorInfo = (…> 0) ? getValue(errorMessageArray, 0) : body;`
  — one arm is the `object` parameter `body`.
* `extended.cs:2204` (accepted: `currentAccountId` is `string?`) vs `grvt.cs:2143,2144
  fromAccountVar|toAccountVar = fromAccount|toAccount` — the ternary arms `tradingAccountId` /
  `fundingAccountId` are `object` locals (`object x = null` + element-0 writes).
* `bitmex.cs:2163 timestamp = since` (`timestamp = this.sum(timestamp, duration)`), `bullish.cs:3178
  startTimestamp`, `hollaex.cs:1046 start`, `mexc.cs:2202 start` (`subtract(...)`), `weex.cs:1848
  endTime = until` (`endTime = add(since, timeDelta)`) — all `object` producers.
* `prediction/PredictionExchange.cs:198 sliceEnd = limit` — `sliceEnd = resultLength;` where
  `resultLength` is `int` (`getArrayLength`): same int-literal box conversion as `start = 0`.
* `cs/ccxt/ws/Client.cs:422 deserializedMessages = message` — hand-written ws base (not generated;
  `JsonHelper.Deserialize` returns `object` there anyway).

## Residual risk

* Small unit by design: the roster's ~2300 is the whole `object x = <ident>;` shape, of which only
  65 sites have a concrete source type in this tree and 12 survive the write/use proof. Everything
  else is an `object` source (nothing to inherit) or a legitimate reject (above).
* The two `string outcomeVar = outcome;` / `string codeVar = code;`-style sites take a nullable
  producer into a non-null declaration in a later write: CS8600/CS8601 are in the csproj `NoWarn`
  list (with `TreatWarningsAsErrors` on) and the farm build is green with 0 warnings from this diff;
  the box is the same reference either way.
* `getArrayLength(IList<object>)` (blofin) is an S58 identity twin of the `object` overload's IList
  branch — verified in the hand-written base; the pass would still reject a receiver whose
  declaration is `object`.
* The pass reads types from the printed text, so it is sensitive to how a future pass prints a
  signature/local; a change there shows up as a *missed* site (keeps `object`), never as a wrong
  type, because every candidate is re-proved from the final text.
* Not gated at runtime: no test lane was run for this unit (`dotnet` is farm-only; the farm's
  buildCS is the compile gate). The change is declaration-type-only, and `verify-diff.py` pairs all
  12 lines as declaration swaps.

## Re-gate of the REPORT tip

`REPORT.md` is a docs-only commit on top of `2f798ef0c0b`; the final tip is re-gated with a
throwaway branch push (the farm's `cs90-U42` ref is at the code sha, so a plain `ccxt-farm build`
from the tip would be refused as non-fast-forward):

```
git branch -f cs90-U42-gate HEAD && git checkout cs90-U42-gate
ccxt-farm build --targets cs --wait     # HEAD <tip> job=<id> exit=0
git checkout cs90-U42 && git branch -D cs90-U42-gate
ccxt-farm status <tip>                  # resolves the same job
```
