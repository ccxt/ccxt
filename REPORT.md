# U16 — `object accountIndex|userAddress|apiKeyIndex|subaccount|vaultAddress|portfolio|subaccountId|accountId = null`

Family (UNITS.md U16), roster line only. Branch `cs90-U16`, worktree `/root/worktrees/cs90/U16`,
base `d847892a6fcf5699640862316303b6344a3e4daf` (PR #30530 head). NOT an `[AST]` unit — nothing in
`/root/ast-transpiler`, no pin change.

## Result: 44 sites typed, 0 casts removed

`44 sites typed` = `Int64?` declarations, each with the `(Int64?)` element-0 cast back. Every changed
line is in `cs/ccxt/exchanges/lighter.cs` (39 sites) and `cs/ccxt/exchanges/pro/lighter.cs` (5 sites);
the two helpers exist nowhere else (`grep -rl handleAccountIndex|handleApiKeyIndex ts/src/` → lighter
REST + pro only), so no other exchange can be touched by the added table entries.

```
before: locals: object=9304 typed=44132 typed%=82
after : locals: object=9260 typed=44176 typed%=82      (object -44 / typed +44)
casts : (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334
        (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        — unchanged (the family adds element casts, it removes none)
```

Per-name `object <name> = null` census (base → after):
`accountIndex 28→2`, `apiKeyIndex 20→2`, `userAddress 26→26`, `subaccount 19→19`,
`vaultAddress 16→16`, `portfolio 15→15`, `subaccountId 13→13`, `accountId 7→7` (144 → 100).
The two surviving `accountIndex` / `apiKeyIndex` locals are the helpers' own internals (below).

## Rule / proof

`[ accountIndex|apiKeyIndex, params ] = [await] this.handle{Account,ApiKey}Index (...)`

* Both lighter helpers have exactly ONE return path
  (`cs/ccxt/exchanges/lighter.cs` base lines 600-614 / 615-675; `grep -c "return "` = 1 in each):
  `return new List<object> {this.parseToInt (x), parameters};` — the account-index helpers are
  `virtual List<object>` (sync) and `async virtual Task<object>` (awaited) respectively, but the
  emitted pair is the same 2-element list in both.
* `Exchange.BaseMethods.cs#parseToInt` is declared `Int64?` (`return ((Int64?)((object)(parseInt (…))));`),
  so slot 0 holds a boxed `Int64` or `null` — nothing else can reach it. The `(Int64?)` cast names
  exactly that box (`(Int64?)null` → null, boxed Int64 → Int64, the same value the untyped `object`
  slot held: an unbox adds no value, no call and no conversion).
* Tables/passes touched (`build/csharp-local-types.js`, 14 lines):
  * `DESTRUCTURED_ELEMENT0_TYPES` += `'handleAccountIndex': 'Int64?'`, `'handleApiKeyIndex': 'Int64?'`
    — the table whose documented meaning is "the helper boxes a concretely-typed local in slot 0 on
    every return path (read off the generated C# body)". The `let x: Int = undefined` target takes
    the annotation's `Int64?` (a scalar annotation is not joined with the writes), so the only gates
    are `destructuredWriteIsCastable` (slot 0, same helper, same function, unambiguous printed name,
    cast type == declared type) and `csharpLocalIsSafeToRetype` over every read/write.
  * `destructuredWriteIsCastable` now unwraps a leading `await` before the callee check: the printer
    emits the same `var tmp = await …; x = ((IList<object>)tmp)[0];` pair for an awaited call.
    Disjointness proof: rank of every `[ a, b ] = await this.<helper> (` site in `ts/src` —
    `handleUTAAndParams 38`, `handleAccountIndex 26`, `handlePortfolioAndParams 12`, `isUnifiedEnabled 8`,
    … — `handleAccountIndex` is the ONLY one of the audited element-0 helpers that is ever awaited
    (every other audited helper is declared sync: `grep "public … List<object> handle{ParamString,
    ParamString2, ParamInteger, ParamInteger2, ParamBool, ParamBool2, NetworkCodeAndParams,
    TriggerDirectionAndParams, PostOnly}|handleHfAndParams"` all return `List<object>` un-async).
    The string half of the same branch still requires a plain `CallExpression` in
    `destructuredStringElementProof`, so no `string?` site can newly fire either.
  * Nothing else: no printer change, no post-print pass, no table outside `csharp-local-types.js`,
    `cs/` diff is declaration-type + element-cast only, and no `ts/src` edit (js/py/php/go/java/rust
    output untouched — the change is C#-classifier-only).

## Post-print audit of the generated diff

`verify-diff.py HEAD~1` on the code commit: `files=2 pairs=88 unexpected=18`. The 18 UNEXPECTED lines
are ONE class, the direct-index spelling of the same element-0 cast:

```
-        apiKeyIndex = apiKeyIndexparametersVariable[0];
+        apiKeyIndex = (Int64?)apiKeyIndexparametersVariable[0];
```

`verify-diff.py` models that insertion only for the untyped-holder spelling
(`((IList<object>)tmp)[0]` → ELEM_CAST, 26 of my pairs accepted); the typed-holder spelling
(the printer's own `IList<object> tmp = (IList<object>)this.handleApiKeyIndex(…)`) is not modelled.
Pair audit shipped with the unit (`campaigns/cs90/tools/U16/pair-audit.py`, `--selftest` proves it
flags a mutated index / holder / target and accepts the three valid shapes):

```
$ python3 campaigns/cs90/tools/U16/pair-audit.py --selftest
SELFTEST PASS: 3 valid shapes accepted, 6 injected mutations flagged
$ python3 campaigns/cs90/tools/U16/pair-audit.py HEAD~1
pairs=88 DECL=44 ELEM_CAST=26 ELEM_DIRECT=18
declared: accountIndex:Int64?, apiKeyIndex:Int64?
element casts: accountIndex -> Int64? x26, apiKeyIndex -> Int64? x18
```

Every element cast names the type the same target's declaration carries (checked inside the audit);
every pair is `<name> = [cast] <holder>[[i]];` with the same indent, name, holder and index.

## Rejected sub-cases (100 of the 144 sites)

Census over the 144 `object <name> = null` sites of the base tree
(`campaigns/cs90/tools/U16/writer-census2.py` + `verdict-census.py`, run on
`git archive HEAD~1 cs/ccxt/exchanges`):

| n | sites | reason for keeping `object` |
|---|---|---|
| 47 | `handleOptionAndParams[0]` / `handleOptionAndParams2[0]` (19 `subaccount`, 9+7 `vaultAddress` incl. 2 prediction, 7 `accountId`, 3 `portfolio`, 2 `accountIndex`, 1 `apiKeyIndex`; plus the 2 helper-internal locals) | slot 0 is the caller's `params[optionName]` value — `handleOptionAndParams` returns `safeValue2 (params, optionName, 'default'+OptionName)` / `this.options[…]` / `defaultValue` unchanged, i.e. an arbitrary box. A `(string)` / `(Int64?)` cast would throw on a caller that passes a numeric address where the untyped box flowed on. The file header already documents this family as deliberately `object` ("handleOptionAndParams/2 element 0 is the user's params value"). |
| 26 | `handlePublicAddress[0]` (dydx 5 + hyperliquid 16 + prediction/hyperliquid 5) | the helper returns `[ user, parameters ]` where `user` is `handleOptionAndParams (params, method, 'address', userAux)` — again the caller's value (`userAux` itself from `handleOptionAndParams 'user'`). Only the second path (`this.walletAddress`) is a proven string, so the slot is not a concrete-typed local on EVERY path. |
| 13 | `handleDeriveSubaccountId[0]` (derive + pro/derive) | same caller-value slot (`handleOptionAndParams 'subaccount_id'` or `safeString (this.options, …)`); additionally the TS annotation is the union `let subaccountId: Str \| Dict`, so no single scalar spelling is honest. |
| 12 | `handlePortfolioAndParams[0]` (coinbaseinternational) | three paths: the caller's `params['portfolio']`, `safeString (this.options, 'portfolio')`, and the account loop's `safeString (info, 'portfolio_id')`; not all paths prove a string. |
| 2 | misc `getValue` (`coinbase` `accountId = getValue (parts, 3)` from a `path.split ('/')` local; `hyperliquid` `userAddress = address` — an `object` parameter) | the split-result element read is the U02/U03 element-read family (a later-write position, not an initialiser) and the parameter copy is U42's; both are other units' mechanisms. |

`vaultAddress` deserves its own note: 16 of those sites carry a second write
`vaultAddress = this.formatVaultAddress (vaultAddress)` (a helper whose declaration is already
`string?`), and one a `vaultAddress = ((string)vaultAddress).Replace("0x", "")`. The local still
cannot be typed while the FIRST write (the `handleOptionAndParams` element read) is unprovable: the
write-join ignores an unprovable destructured write, but the retype scan re-checks every write and
rejects the site. Narrowing the local instead of the read would need the option value proven.

## Residual risk

* The added cast is the unit's only runtime-touching change: a non-`Int64` box in slot 0 would now
  throw `InvalidCastException` at the assignment where the untyped `object` flowed on. Slot 0 is
  the single `return new List<object> {this.parseToInt (x), parameters};` of each helper (verified
  on both base bodies) and `parseToInt` is declared `Int64?`, so the only boxes are Int64 and null
  (`null` is unboxed to `null` by `(Int64?)`).
* The element cast only compiles against the `IList<object>` read the printer emits; the farm build
  (`cd`, `dotnet` build of `ccxt` + `cli` + `tests`) is the compile gate: 0 warnings 0 errors.
* Reads of the retyped locals were re-scanned: `isEqual (x, null)`, `isLessThan`/`isGreaterThan`,
  `this.numberToString (x)`, `this.parseToInt (x)`, `GetValue`/`getValue` keys, dictionary
  initialisers, `this.handleBuilderFeeApproval (x, y)`, `this.initAuthObject` (fed the string
  copies) — none of those helpers has a
  typed twin that an `Int64?` argument could rebind (`isEqual`/`isLessThan`/`isGreaterThan` are
  `(object, object)` only; `numberToString` is `(object)` only; `GetValue (IDictionary, string)`
  stays inapplicable for an `Int64?` key, so `(object, object)` binds exactly as before — the C#
  implicit `Int64? → object` boxes the same value the `object` duplicate held).
* Census tooling is textual (regex over the emitted C#), not the TS checker; each of the five
  reject classes was spot-checked by hand in the venue sources (nado `subaccount`, dydx
  `userAddress`, derive `subaccountId`, coinbaseinternational `portfolio`, coinbase `accountId`).
* Untyped remaining surface for this family: the 100 rejected sites above (documented per class).
  `subaccountId`'s `Str | Dict` sites and every `handleOptionAndParams`-written site stay for a
  caller-value census (U41's option-key family), not for this unit.

## Hotspots

* `hotspot: build/csharp-local-types.js` — the campaign's shared classifier; this unit edits
  `DESTRUCTURED_ELEMENT0_TYPES` (2 entries) and `destructuredWriteIsCastable` (await unwrap). Both
  are keyed by helper NAME, so a sibling unit touching the same table for a different helper can
  merge mechanically; the await unwrap is shared by every future entry and must stay gated on the
  callee being a `this.` call of a table helper.
* no `build/csharpTranspiler.ts`, no `/root/ast-transpiler` src, no hand-written `cs/ccxt/base` file,
  no `ts/src` file was touched (so no bridge twins, no pin bump, no other-language output).

## Gates

* Baseline first: `npx tsx build/csharpTranspiler.ts --force --noTests lighter` +
  `--force --ws --noTests lighter` on the untouched tree → `git diff --stat -- cs/` empty.
* Determinism: same two scoped regens after the edit → `git diff -- cs/ | sha256sum` identical
  (`ee749d58f62565b6f1c5a1130a7c67bfee031246d95f3779eae07dfa42c7893b`).
* `ccxt-farm build --targets cs` for the code commit `66b0a7b3bdc` (the tree the tip below carries):
  `job=650 exit=0`, `branch_update=unchanged` (the farm's own regeneration reproduced this tree
  byte-for-byte), `buildCS` log: `Build succeeded. 0 Warning(s) 0 Error(s)`. Re-confirmed as
  `job=655 exit=0, branch_update=unchanged, skipped_exchanges=76` for the commit that added this
  report; a later report-only edit changes no build input, so `ccxt-farm status <tip-sha>` is the
  tip's own (identical-tree) result.
* Runtime test lane (`ccxt-farm build --targets cs --test --rebuild`, job 657) is NOT usable as a
  gate on this farm host: it aborts in `Tests.BaseTest.baseTestsInit` → `MultithreadTest` with
  `ccxt.NetworkError: okx GET https://www.okx.com/api/v5/public/instruments?instType=SPOT Resource
  temporarily unavailable (www.okx.com:443)` — the lane runs live `loadMarkets` for every exchange
  and the farm host has no egress. Nothing in the stack touches lighter, and the generated `okx.cs`
  is unchanged by this diff (job 655 skipped it as byte-identical). The unit-specific runtime proof
  that the added cast cannot throw is the static one: slot 0 of both helpers is always
  `parseToInt`'s `Int64?` box, checked on the single return path of each helper.
* Tooling left in `campaigns/cs90/tools/U16/`: `ts-census.py`, `writer-census.py`,
  `writer-census2.py`, `verdict-census.py`, `pair-audit.py` (`--selftest`), `awaited-probe.sh`,
  `proof-dump.sh`. Nothing new under `build/`.
