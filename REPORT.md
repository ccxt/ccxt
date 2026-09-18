# cs90 U25 — the withdraw `tag` core arg (`object tagVar = tag;`)

**Family.** Every generated `Withdraw`/`WithdrawWs` body carries the `typeCoreArgs` shadow
`object tagVar = tag;` because the body reassigns the narrowed `tag` parameter from
`handleWithdrawTagAndParams` (`[ tag, params ] = this.handleWithdrawTagAndParams (tag, params)`).
The core parameter is already `string tag = null` (CORE_STRING_ARGS `withdraw`/`withdrawWs`,
positions 0/2/3) and every one of the 49 call sites passes it (or its copy) — so the shadow copies
were the remaining `object` surface of the family. This unit types them and the one remaining
`object tag = null` core parameter of the family.

- 49 shadow copies retyped: `object tagVar = tag;` -> `string tagVar = tag;` (`typed_declarations`)
- 1 core parameter retyped: `bitvavo.withdrawRequest(..., object tag = null, ...)` -> `string tag = null`
- casts: 3 removed (okx `((string)tagVar).Length` receiver + the 2 wrap drops at the
  `withdrawRequest` call sites), 49 element casts added — see "Why the element cast is identity".

## Rules / tables / passes touched (`build/csharpTranspiler.ts` only)

1. new tables `CORE_ARG_SHADOW_STRING_ELEMENT0_HELPERS = ['handleWithdrawTagAndParams']`,
   `CORE_ARG_SHADOW_TAG_ALIASES = ['tagVar']`, type `CoreArgShadowTagContext` (U25-keyed: sibling
   shadow families symbol / timeframe / since / currency / limit keep the base behaviour).
2. `coreArgShadowRhsIsTyped`: accepts a write whose RHS is `<holder>[0]` of an audited holder.
3. `coreArgShadowUseKind` + new `coreArgShadowTagContext`: accept the shadow written into an
   object-valued slot the same body declares — an `object` local (bithumb `destinationRequest`) or a
   `Dictionary<string, object>` / `IDictionary<string, object>` indexer (coinmate `transaction["tag"]`).
4. `coreArgShadowIsProvable`: builds that context for the `tagVar` alias only.
5. new `insertCoreArgShadowElementCasts`, called from `retypeCoreArgCopies`: writes the `(string)`
   the retyped declaration needs into `<alias> = <holder>[0];`.
6. `CORE_STRING_ARGS['withdrawRequest']: [0] -> [0, 3]` (TS `withdrawRequest (code: Str, amount: any,
   address: any, tag: Str = undefined, params = {})` confirms position 3; the single declaration has
   no write a `string` cannot take and both call sites pass the retyped copy).
7. `CORE_ARG_CAST_EXEMPT_NAMES += 'tag', 'tagVar'`: the wrap `castCoreArgCallSites` inserts for the
   newly narrowed position is dropped again by `dropRedundantCoreArgCasts` (proof: the nearest
   in-scope declaration is exactly `string`). The `tag` entry is inert on this tree — the only
   `((string)tag)` sites are prediction-tier methods whose `tag` is `object`.

## Why the element cast is identity (proof for the 49 added `(string)`)

`handleWithdrawTagAndParams` is declared exactly once (`cs/ccxt/base/Exchange.BaseMethods.cs:5675`,
`object tag, object parameters -> List<object>`; no venue / pro / prediction override —
`git grep handleWithdrawTagAndParams` = 1 declaration + 49 call sites) and its generated body is
`if (isDictionary(tag)) { parameters = extend(tag, parameters); tag = null; } if (isEqual(tag, null))
tag = safeString(parameters, "tag"); ... return new List<object>() { tag, parameters };` — slot 0 is
either the argument's own box or `safeString(...)`. Every call site passes `tagVar`, whose only two
writes are the seed (the core's `string tag = null` parameter) and this slot read, so slot 0 is
string-or-null at every site: `(string)holder[0]` is a reference conversion of the box that is
already there (null included). The remaining use shapes are the ones the base rule set already
proves for a string shadow: argument to `handleWithdrawTagAndParams` (callee already in
`CORE_ARG_SHADOW_CALLEES`), the `((string)tagVar)` identity cast, `isEqual(tagVar, …)`,
`add(…, tagVar)` as the RIGHT operand of a two-argument call (`add(object,string)` is not declared,
so an object left keeps `add(object, object)`; a string left goes `add(string, object)` ->
`add(string, string)`, declared identical in `Exchange.TranspileHelpers.cs`), dict-slot writes
(`request[...] = tagVar;`, `{ "tag", tagVar },`), and `withdrawRequest(…, tagVar, …)`.

## Census (`campaigns/cs90/census.sh`, cs/ccxt/exchanges/** incl. pro + prediction)

```
before  locals: object=9304 typed=44132 typed%=82
        casts: (string)=2113 (IList<object>)=1922 … (List<object>)=102
        params: object=11635  returns: object=1080
after   locals: object=9255 typed=44181 typed%=82
        casts: (string)=2112 (IList<object>)=1922 … (List<object>)=102
        params: object=11634  returns: object=1080
```

Δ object locals −49, typed locals +49, `((string)` −1, object params −1.

## Gates

`verify-diff.py HEAD` -> `files=49 pairs=102 unexpected=51` (exit 1). The 51 are the two classes the
grammar does not model and `tools/U25/pair-audit.py` proves:

| class | n | gate | proof |
|---|---|---|---|
| DECL `object tagVar = tag;` -> `string tagVar = tag;` | 49 | accepted (DECL rule) | same indent/name/initializer |
| ELEM `tagVar = holder[0];` -> `tagVar = (string)holder[0];` | 49 | **UNEXPECTED** | gate's ELEM rule models only the casted-holder spelling `x = (T)((IList<object>)tmp)[0];`; here the holder is printer-typed `IList<object> tmp = (IList<object>)this.handleWithdrawTagAndParams(...)` and read directly |
| RECEIVER `(((string)tagVar).Length …` -> `((tagVar).Length …` | 1 | accepted (S09 rule) | identity, `tagVar` declared `string` |
| SIG `… object tag = null, …` -> `… string tag = null, …` | 1 | accepted (S45 `ok_param_retype`) | same position/name/default, all other params byte-equal |
| WSJOIN `… address, tagVar, …` -> `… address,tagVar, …` | 2 | **UNEXPECTED** | whitespace-only trace of the wrap insert (`castCoreArgCallSites`) + drop (`dropRedundantCoreArgCasts`), whose `,` join does not restore the space. Precedent: the committed base already carries this shape in 77 files (e.g. `this.parseOHLCVs(ohlcvs, market,timeframeVar, since, limit)`) |

`pair-audit.py` (with `--selftest`): `pairs: {'DECL': 49, 'ELEM': 49, 'RECEIVER': 1, 'WSJOIN': 2,
'SIG': 1} flagged=0`; tree invariant `sites=49 retyped=49 cast_writes=49 problems=0` (no
`object tagVar = tag;` left anywhere, every retyped declaration has exactly its cast write naming the
holder declared in the same method). The selftest proves the audit flags a retargeted cast, a moved
index, a missing cast, a mutated declaration, a foreign whitespace join and a retargeted signature.

**Farm.** `ccxt-farm build --targets cs --wait` on the code commit
`b3458a2dc15f886123aa71c88c41e6191267dc8c`: `job=682 exit=0 branch_update=unchanged
generator=404e9daa…` — the farm's own transpile reproduced the committed tree byte-for-byte (its
`buildCS` step: `Build succeeded. 0 Warning(s) 0 Error(s)`). This REPORT-only tip is re-gated from a
throwaway branch (`cs90-U25-gate`) so the sha-keyed farm note resolves for the tip as well.

**Fixed point.** Two consecutive full local REST + `--ws` `--force` regens leave
`git diff -- cs/ | sha256sum` = `69c24751fc1724d049e1f58db20e5235e6dac23412e5f4d48d0664a232726244`
(49 files, 102 +/- lines) unchanged.

## Rejected sub-cases

1. `handleWithdrawTagAndParams(object tag, object parameters)` parameter — stays `object`: TS is
   `tag: any` and the body's first branch is the supported dict input (`isDictionary(tag)` ->
   `extend(tag, parameters)`); narrowing it is unproven and would break that path.
2. prediction `PredictionExchange.normalizeTagKey(object tag)`, `polymarket.tagToSlug(object tag)` —
   event-tag values are dicts/lists in that tier (the body's `((string)tag).ToLower()` is the box
   assertion); prediction tier is U44's sweep.
3. `limitless.FetchRawMarketsByTags(object tags, …)` — a list of tag strings, not the withdraw tag arg.
4. the 6 `object tag = null;` null-init locals in parse* methods (phemex:4308, cryptocom:2471,
   btcmarkets:524, upbit:1982, coinex:3725, bitstamp:2848) — null-init string joins, which the roster
   assigns to U17 (lower unit number owns contested sites).
5. `btcmarkets` `object tagTo = tag;` — a copy of a local, U42's copy-propagation family.
6. sibling shadows (`symbolVar` / `timeframeVar` / `sinceVar` / `currencyVar` / `limitVar`) — the new
   widenings are keyed to the `tagVar` alias and the `handleWithdrawTagAndParams` holder, so U23/U24/S04
   sites keep the base behaviour (confirmed: the whole diff is 49 withdraw wrappers).
7. `withdrawRequest` positions 1/2 (`amount`, `address`) — TS `any`; only position 3 is narrowed.

## Residual risk

- The 49 element casts are unboxing casts and are identity only because every call site feeds the
  helper a string-or-null. The helper's dict branch is already unreachable from the typed C# boundary
  (the core parameter was `string tag = null` on the base, and reflective dispatch converts boxed
  arguments to the declared parameter type first), so this unit adds no new runtime exposure — but a
  future caller reaching `handleWithdrawTagAndParams` with a non-string, non-dict tag would throw where
  the `object` spelling flowed.
- Roster overlap: U24's line also lists `tagVar` (49) for the pro + prediction trees; all 49 sites here
  are REST `Withdraw` bodies except `cs/ccxt/exchanges/pro/bitvavo.cs:1481` (`WithdrawWs`). If U24's
  branch covers the same sites the hunks are identical (integrator dedupe); the withdraw `tag` family
  is U25's by the roster line and this unit's task statement.
- `verify-diff.py` exit 1 is expected (the two classes above); the integrator should read the table.

## hotspot: lines

- `hotspot: build/csharpTranspiler.ts` — 2 new tables + 1 type + 1 new method
  (`insertCoreArgShadowElementCasts`) + 4 edited passes (`coreArgShadowRhsIsTyped`,
  `coreArgShadowUseKind`, `coreArgShadowIsProvable`, `retypeCoreArgCopies`) + `CORE_STRING_ARGS`
  and `CORE_ARG_CAST_EXEMPT_NAMES`. +108/−8 lines.
- `hotspot: build/csharpTranspiler.ts (CORE_ARG_CAST_EXEMPT_NAMES)` — shared with cs-strict S01
  (`code`/`codeVar`); the edit is additive on one line and the drop stays gated on the nearest
  declaration being exactly `string`.
- `hotspot: build/csharpTranspiler.ts (CORE_STRING_ARGS['withdrawRequest'])` — shared table, additive
  (`[0]` -> `[0, 3]`).
- no hand-written base file touched, no ast-transpiler source (not an [AST] unit), no
  `build/csharp-local-types.js` change.

Tooling: `campaigns/cs90/tools/U25/site-census.py` (per-site use-shape census),
`campaigns/cs90/tools/U25/pair-audit.py` (`--selftest`).
