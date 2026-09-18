# U21 — string-literal initialisers: the later-write proofs (28 sites typed, 4 casts removed)

Worktree `/root/worktrees/cs90/U21`, branch `cs90-U21`, base `d847892a6fcf5699640862316303b6344a3e4daf`
(PR #30530 head, ast-transpiler pin `404e9daa7f0ab58d085ed04aaa61a19546dfeda2` — unchanged, this unit is not `[AST]`).

## Family

`object <name> = "<literal>"` declarations that stay `object` because a later write to the same local is
unprovable, where the write is a `+` chain (printed `add(...)`) or a conditional over such chains that
**reads the local being classified**:

```csharp
object messageHash = "trades:";                                    // the declaration
messageHash = add(add(messageHash, ":"), symbolVar);               // the write (self-read = left spine)
```

The declaration's own box is the literal's non-null `string`, so the join's running type is a non-null
string; the write keeps that box when the emitted `add(...)` tree's **left spine** ends in a non-null
string leaf, because then every enclosing call resolves to `add(string, string)` / `add(string, object)`
— both declared `string`, never null (`cs/ccxt/base/Exchange.TranspileHelpers.cs:484-503`). Only a
left-spine read of the local itself is new here: the initialiser-position rule (`csharpTypeOfValue`'s
`isProvablyStringOperand(node.left)`, `csharp-local-types.js:3685`) already answers every other leaf,
and cannot see the local being classified (`classifyInProgress`).

Conditional writes are the same proof per arm (`x = cond ? 'a' + x : x`, `x = cond ? add(x, "_cross") : x`):
both arms are statically `string`, so the conditional's natural type is `string`.

Non-null leaves only: a `string?` local / `safeString*` read / `as string` cast as the left spine keeps the
local `object`, because a null left operand is the one input where `add(string, *)` returns the RIGHT
operand where `add(object, object)` returns `null` (the helper comment quoted above). This is the same
fence `stringPlusOperandIsProvablyString` (`:4781`) applies to a left-operand read of a typed local.

## Rules / passes touched

Only `build/csharp-local-types.js` (classifier). No `build/csharpTranspiler.ts` change, no ast-transpiler
change, no hand-written base file edit. `hotspot:` none for those three.

* `nonNullStringWriteLeaf (csharp, node)` — new: literal / `localIdentifierType === 'string'` /
  `this.<member>` with a non-null `CSHARP_LOCAL_THIS_MEMBER_TYPES` entry / `.toString()` /
  `callReturnType === 'string'`.
* `stringWriteNodeIsProvable (csharp, context, declaration, node, state)` — new: self-read (sets
  `state.selfRead`), `+` chain (left spine only), conditional (both arms).
* `stringAccumulatorWriteType (csharp, context, declaration, value)` — new; gated
  `isStringLiteralInit (declaration)`, requires `state.selfRead`.
* `typeFromValueOrWrites` — new hook after the existing self-concat / self-omit fallbacks
  (`written === undefined && type === 'string' && !sawNull && isStringLiteralInit`).
* `csharpLocalIsSafeToRetype` EqualsToken branch — mirror hook (`selfStringWrite`), so the write that the
  join proved is not vetoed by `assignable (csharpType, csharpTypeOfValue (rhs))` being false for the
  self-read value. Every other scan fence is unchanged.

## Before / after census (census.sh, `cs/ccxt/exchanges/**`; before = base commit via `git archive`)

```
BEFORE  locals: object=9304 typed=44132 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        params: object=11635  returns: object=1080
        helpers: isTrue=1434 isEqual=12034 getValue=6761 add=8833 getArrayLength=704
        object <name> = "lit": 164
AFTER   locals: object=9280 typed=44156 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=671 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        params: object=11635  returns: object=1080
        helpers: isTrue=1434 isEqual=12032 getValue=6761 add=8833 getArrayLength=704
        object <name> = "lit": 140
```

**sites typed 28** (24 in the census tree + 4 in `cs/ccxt/base/PredictionExchange.cs`); **casts removed 4**
(1 in the census tree + 3 in PredictionExchange.cs); 5 `isEqual (x, "")` → `x == ""` rewrites and 2
`return ((string?)((object)(x)))` → `return x` unwraps are knock-ons of the same typed locals.

Per-site (file:line at the change, local): PredictionExchange.cs 114 extraNames, 292 s, 591 s, 665 label;
prediction/binance.cs 2071 failedDetails; prediction/hyperliquid.cs 2256 titleSuffix; prediction/polymarket.cs
754 slug, 3427 result; pro/bitget.cs 1755 subscriptionHash, 2336 messageHash; pro/bithumb.cs 1017 messageHash;
pro/bitopro.cs 226 messageHash; pro/cryptocom.cs 535, 960 messageHash; pro/hashkey.cs 427 messageHash;
pro/htx.cs 2028 prefix; pro/hyperliquid.cs 1502 messageHash; pro/kucoin.cs 192, 220, 554 action, 2175, 2629
messageHash; pro/mexc.cs 1176, 1378 messageHash; pro/pacifica.cs 1228 messageHash; pro/toobit.cs 917, 1053
messageHash; pro/upbit.cs 704 messageHash.

Determinism: full local regen (REST 104 ids + `--ws` 76 ids + `--prediction` 7 ids) run twice; the
`git diff -- cs/ | sha256sum` was identical across runs (`3952301c2cce…`), and the farm's forced transpile
reported `branch_update=unchanged`. `--tests` regen leaves `cs/tests` / `examples/cs` untouched.

## verify-diff.py (base `HEAD~1`)

```
files=16 pairs=37 unexpected=7
```

The 7 UNEXPECTED pairs are knock-ons of the typed locals, all in `PredictionExchange.cs` / `polymarket.cs`:

* 5× `!isEqual (x, "")` / `isEqual (x, "")` → `x != ""` / `x == ""` — `installCsharpStringEquality` fires
  once the local is a proven non-null `string`; for a non-null string the native form is exactly equivalent
  (BRIEF item 4). x = s / label / slug.
* 2× `return ((string?)((object)(x)));` → `return x;` — the proven-string return path drops the identity
  wrap once the local is a non-null `string` (`needsUnboxingWrap`). x = s (method `normalizeTagKey`,
  declared `string?`) / slug (`shortenSlug`).

The remaining 30 pairs are declaration-only; the 8 cast removals inside them (`s = ((string)s).Replace…`,
`((string)s).Split…`, and the two return wraps) are the cast-removal shape verify-diff already models for
all but the return position.

## Farm

```
HEAD 490d1ae779bad269a9ca79a1f381e615cde3e6fc job=679 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
buildCS: Build succeeded. 0 Warning(s) 0 Error(s)
```

`ccxt-farm status 490d1ae779b`: `state=succeeded, exit_code=0, failing_files=[]`. `branch_update=unchanged`
means the farm's forced transpile of the pushed tree reproduced exactly this `cs/` tree (the fixed point
also checked locally, above).

The code change is commit `490d1ae779b`; the branch tip adds this report only (no build input), and the same
`ccxt-farm build --targets cs --wait` was run for that tip from a throwaway gate branch — the farm note is
keyed by SHA, so `ccxt-farm status <tip-sha>` resolves the tip's result (exit=0, same tree).

## Tooling (campaigns/cs90/tools/U21/)

`regen-all.sh` (local REST + ws + prediction regen), `aggregate.py` + `summary2.txt` (per-site
classifier-reason log), `audit2.py` (every read/write of each changed local), `reject-census.py` /
`classify.py` (the rejection breakdown above), `pro3.log` / `rest2.log` (the instrumented runs).

## Rejected sub-cases (with the reason each one stays `object`)

The 164-site roster line decomposes after this change into 28 typed + 136 rejected. Counted on the
generated tree (140 remaining `object <name> = "lit"` in the census tree + the base-file ones):

1. **`x = <holder>[0]` destructured element writes from the `handle*AndParams` family — 82 sites**
   (handleOptionAndParams 52, handleMarketTypeAndParams 22, handleMarginModeAndParams 5,
   handleOptionAndParams2 2, handleSubTypeAndParams 1; e.g. bydfi wallet/contractType, kucoin
   accountMode/accountType/marginMode, hashkey marketType, btse marketType/type, deepcoin
   marketType/marginMode/mrgPosition, weex priceType/depth). `Exchange.BaseMethods.cs:4981-5011`: element 0
   is `safeValue2 (parameters, optionName, defaultOptionName)` or the caller's `defaultValue` — an
   arbitrary USER box, not a string. Naming the target `string` would force the destructuring machinery to
   inject a `(string)` element cast (`literalInitElement0Type`'s ELEM_CAST shape) that throws
   `InvalidCastException` where the untyped `object` local flowed the value on. The module's own
   `destructuredStringElementProof` deliberately limits the literal-init shard to the
   SafeString-bodied helpers (`SAFE_STRING_ELEMENT0_HELPERS`, `:6040-6059`). Extending the element-0
   tables is roster line U13's (lower number owns the site), so this unit leaves them alone.
2. **Self-concat whose immediate right operand (the self-read's) is not a proven string box — 16 sites**
   (`signatureQuery + add(add(key, "="), value)`, `detailsString + getValue(details, i) + " "`,
   `url + api`, `instIds + "," + GetValue(entryMarket, "id")`, `result = getValue(hexChars, remainder) + result`).
   The write proof accepts them (the left spine is the local), but `csharpLocalIsSafeToRetype`'s
   left-operand fence (`stringPlusOperandIsProvablyString`, `:4781`) rejects: for the local as the LEFT of
   `+` the right operand must be a `string`/`string?` box, else `add(string, object)`'s `b?.ToString()`
   replaces `add(object, object)`'s `(string)b` cast. The missing operand proofs (market-row string keys,
   element reads, param copies, venue-helper returns) are U19's / U01's / U02's / U33's own leaf lines.
3. **`add` chain whose left-most operand is another untyped local/member — 5+12 sites**
   (`descriptor = group + '.' + depth + '.' + interval` (deribit — depth/group come from the class 1
   destructuring), `channel = messageType + '.order_book_update'` (gate — `getTypeByMarket` is U33),
   `symbol = base + '/' + quote + …` (gate — U05), `auth = ts + method + …` / `this.apiKey + …`
   (U43's member/table family; `accountId`/`apiKey` are `SafeString (…, null)`-settable properties, so the
   honest spelling is `string?`, cf. `CSHARP_LOCAL_THIS_ARM_MEMBER_TYPES`' hostname/userSecret precedent),
   `messageHash = add(add(marginMode, ":positions"), messageHash)` (htx — marginMode is class 1)).
4. **Plain copy of an untyped local/param — 10 sites** (`payload = body` (coinbase,
   coinbaseexchange, coinbaseinternational), `queryString = body`, `jsonParams = body`,
   `sign_body = body`, `bodyString = body`, `bodyToSignature = body`, `endpart = body`,
   `decimalString = value`, `accountType = subscription`, `id = this.accountId`). The value is a bare
   identifier read: `csharpTypeOfValue` already resolves those through the source local's own
   classification, so nothing is added by this unit; unblocking them is the param-copy / core-arg-shim
   family (U42 / U23 / U24) or the source local's own type.
5. **`getValue`/`GetValue` market-row read in the write position — 4 sites** (`marketId`/`suffix` ←
   `market['lowercaseId']`, `settleCoin` ← `market['settleId']`, `code` ← `market['quote']`,
   `bybit code`). The box is provable (`MARKET_ROW_STRING_KEYS`), but the emitted C# of a *write* is
   `x = GetValue (market, "lowercaseId")` — an `object` read with no cast; the declaration-position rule
   injects `(string)` through the declaration wrapper only, and no pass injects a cast on a plain write
   (the destructured ELEM_CAST pass covers `x = holder[i]` only). Left to U01/U05, whose family owns the
   key table (and is free to add the write-position cast pass).
6. **`this.urls[...]` describe-leaf reads — 3 sites** (`url` in pro/binance). `urlsDescribeStringProducer`
   proves the leaf `string?` (not non-null), so the join would have to widen the local to `string?` and the
   write would again need an injected cast (same blocker as class 5). U05 owns the urls/options leaf.
7. **Conditional write with a nullable left-spine arm — 1 site** (phemex `messageHash = usePerpetualApi ?
   'perpetual' + messageHash : type + messageHash`). `type` is `string?` (destructured element with a
   `(string)` cast); a null `type` makes the untyped code yield `null` and the typed code the right
   operand — a real value divergence, so the arm stays unproven. Fixable only together with a non-null
   proof for `type`.

## Residual risk

* The accepted writes keep the value identical for every string / null input; where a sibling operand is
  an `object` box holding a NON-string (impossible for the in-tree callers — the sibling leaves are `string`
  params, `string?` locals, market-row reads or the local itself — but expressible in principle), the typed
  call concatenates through `add(string, object)`'s `b?.ToString()` where the untyped call threw
  `InvalidCastException` on `(string)b`. This is the divergence class the module already accepts for an
  initialiser-position `+` chain with a proven string left operand (`:3685`); both are "crash vs value"
  paths, never a silent value change for a valid input.
* Knock-on rewrites (`isEqual` → `==`, dropped identity return wraps) are inside the module's own rules
  for a proven non-null `string` local; they are itemised above because verify-diff does not model them.
* 24 of 136 rejected sites are blocked by leaf-type families owned by sibling units; when those land (U13
  element-0 tables, U19/U01/U05/U33 leaves, U42 param copies) this unit's write proof applies unchanged to
  the sites whose chains are otherwise proven — no rebase needed, the join simply sees the new leaf types.

## Final sha

* code (farm-green): `490d1ae779bad269a9ca79a1f381e615cde3e6fc`, farm job `679`, `exit=0`.
* branch tip = the commit carrying this report (adds no build input; its own farm note resolves by SHA).