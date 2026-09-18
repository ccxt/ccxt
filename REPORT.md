# U18 — `object bs|base|quote|currency = null` + `object x = this.safeCurrencyCode(...)`: WHY they stay `object`, and the guard proof that types the provable subset

- Branch `cs90-U18`, base `d847892a6fcf5699640862316303b6344a3e4daf` (PR #30530 head), ast pin `404e9daa7f0ab58d085ed04aaa61a19546dfeda2` (unchanged — this unit is not `[AST]`).
- Code commit `b3dd1626f739a1f7cb4981f3f1269280efb8215c`; farm `HEAD b3dd1626f73 job=706 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`.
- Tooling: `campaigns/cs90/tools/U18/` (`census_sites.py` site table, `classify.py` add-left/other split, `table.py` per-site write/read table, `paircheck.py` diff pair audit, `probe-stringplus.diff` the rejected-rule probe, `log.txt`/proof logs).

## 1. The WHY — measured with a debug-instrumented classifier, not guessed

Family = 145 declarations: 131 `object x = this.safeCurrencyCode(...)` (`bs`×120, `feeCurrency`×6, `quote`×2, `tradedCurrency`, `mappedBase`, `baseSymbol`) + 14 `object bs|base|quote|currency = null;`. Two causes, nothing else:

**(a) the `+` LEFT-operand rule — ~120 sites.** A reason-tagged run of `csharpLocalIsSafeToRetype` over the 8 largest files logged `UNSAFE type=string? reason=L4460` for 59 of 79 candidate locals; L4460 is
`if (isString && isLeftPlusOperand (n)) { if (!stringPlusOperandIsProvablyString (csharp, n, csharpType, context)) return false; }`
and `stringPlusOperandIsProvablyString` requires `csharpType === 'string'`. The initialiser table *does* give these locals `string?` (`CSHARP_LOCAL_THIS_RETURN_TYPES.safeCurrencyCode`), the null-init join *does* join e.g. okx `bs = this.safeString(symbolBase, 0)` to `string?` — the only blocker is the veto. No ref sink (`x++`/`delete`/`throw`/`PrefixUnary`) fires anywhere in the family, and there is no later non-string write in the 122 no-write sites.

The veto is correct for a nullable box and must not be relaxed globally:
- `add(object, object)` (cs/ccxt/base/Exchange.TranspileHelpers.cs:461-493) falls to `else { return null; }` for a null left; `add(string, string)` / `add(string, object)` (ib. 495-503) return the RIGHT operand for a null left.
- The writers are genuinely nullable: `safeCurrencyCode` is `string?` in the base (`Exchange.BaseMethods.cs:5916`, `return ((string?)((object)(getValue(currency, "code"))))` — null for an unknown currency), `this.safeString(parts, 0)` returns null off the end of a `.split`.
- The reads feed emitted market rows, so the null case is observable: okx `createExpiredOptionMarket` `{ "id", add(add(… bs, "-"), …) }` (cs/ccxt/exchanges/okx.cs:2415) is `null` on the object path but `"-USD-…"` on the `string?` path.
- Probe: relaxing the rule (accepting `string?`, `campaigns/cs90/tools/U18/probe-stringplus.diff`) changes 81 lines in 10 files — rejected; the divergence is real.

**(b) the WRITER JOIN — 10 sites.** `bithumb.cs:2500 currency`, `btcmarkets.cs:1251 currency`, `kraken.cs:1680 currency`, `independentreserve.cs:708 quote`, `coinex.cs:2591 feeCurrency`, `kucoin.cs:8394/8531 feeCurrency`, `weex.cs:2028 feeCurrency`, `pro/weex.cs:1398/1701 feeCurrency`, plus the same-shaped `binance.cs:11467 tradedCurrency`/`earnedCurrency` joins. Their later write is `getValue(market|marketResolved, "quote"/"base")` / `GetValue(...)` — `csharpTypeOfValue` has no arm for a market-row element read, so `typeFromValueOrWrites` returns undefined before any veto. Deferred, see §4(b).

**(c) 6 sites needed only a non-null proof at the read** — the market-row style guards the family already writes: `bithumb.cs:2482`, `latoken.cs:1318`, `pro/cex.cs:923` (`if (x != null && y != null) { … add(x, "/") … }`), `latoken.cs:538`, `mercado.cs:360` (`if (x == null || y == null) { continue; }`), `hyperliquid.cs:1035` (`if (x == null) { throw … }` + a non-null `.replace` write).

## 2. The fix (build/csharp-local-types.js only)

New proof family, wired into all three left-operand call sites of `csharpLocalIsSafeToRetype` (plain `BinaryExpression`, `ParenthesizedExpression`, `+=`): `stringPlusOperandIsNonNullAtUse` + `stringValueIsNonNullAtUse` (+ `stringLocalWriteNodes`, `nullTestOf`, `nullTestIsThisBinding`, `flattenLogicalChain`, `stripParens`).

A `string?` local as a `+` left operand is accepted when the value **at that read** is proven non-null:
1. the read sits in the then-branch of `if` whose condition is a conjunction of `x !== undefined` / `x != null` tests, one of them this binding (the TS source parenthesises the leaves — `stripParens` handles that);
2. or a preceding statement of one of the read's statement lists is an unconditional-exit guard (`if (x === undefined || y === undefined) { continue|return|throw }`) that tests this binding;
3. or a preceding statement is a plain `x = <value>` write whose value the module proves a NON-null `string`;
and in every case **no other write to the binding exists between the proof and the read** (range scan over every plain/compound assignment node of the binding). The right operand must still be a string box (`string`/`string?`), exactly as in `stringPlusOperandIsProvablyString`.

Soundness: with a non-null left, `add(string, string)` computes the same concatenation as `add(object, object)`'s `(string)a + (string)b` branch (a null right operand returns the left unchanged in both — the object overload's `(string)b` cast is exact on a string box); the only divergent input, a null left, cannot arise at an accepted read. Guards: a `string` candidate is declined (the non-null spelling has its own rule — this also keeps the `nonNullStringDefaultCall` retry from recursing), and a local whose initialiser is a proven non-null-default `safeString` keeps the **stronger** `string` + identity-cast spelling that the existing retry produces (without this, phemex `brokerId` would have *widened* an already-typed `string` to `string?`).

## 3. Counts and gates

- **typed_declarations: 74** `object X = …` declarations → `string?`/`string` in 32 files (`cs/ccxt/exchanges/*`: aster, binance, bingx, bitflyer, bitget, bithumb, bittrade, blofin, cex, coinbaseexchange, coinone, htx, hyperliquid, independentreserve, kraken, latoken, mercado, mexc, mudrex, okx, onetrading, tokocrypto, whitebit, woo; `pro/`: binance, bingx, bitmex, cex, htx, okx; `prediction/myriad.cs`; `cs/ccxt/base/Exchange.BaseMethods.cs`). 9 of them are roster-family (`bithumb.cs:588/2482`, `latoken.cs:538/1318`, `mercado.cs bs+quote`, `hyperliquid.cs:1035`, `pro/cex.cs:923` + the `string? symbol`/`string id` knock-ons in the same methods); the other 65 are the same proof firing on other `string?` locals with a guard-proven `+` left read (`brokerId`, `interval`, `intervalString`, `side`, `prefix`, `scheme`, `table`, `channel`, `currency1`, `feeCurrencyId`, `baseUrl`, `stockListenKey`, `underlying`, `period`, `messageHash`, …), together with the landed chain/equality cascades. Every accepted read (36 distinct proof sites, 110 reads) was hand-audited against the TS source.
- **casts: 11 `(string)`/`(string?)` tokens removed on 9 expressions** — 7 printer receiver wraps now that the receiver is declared (`side.Length`, `id.ToLower()`×2, `id.Split`, `bs.Replace`, `messageHash.Replace`, `channel.Replace`) + 2 boundary return casts (binance/blofin).
- **census before → after** (`campaigns/cs90/census.sh`, `cs/ccxt/exchanges/**`):
  `locals: object=9304 typed=44132 typed%=82` → `locals: object=9231 typed=44205 typed%=82`
  `casts: … (string)=2113 … (object)=672 …` → `casts: … (string)=2106 … (object)=670 …`
- **fixed point**: `git diff -- cs/ | sha256sum` = `e48670a1942812feefab904760320360f55ecee68b4ef86160a0a2a899de1585` before and after two full forced regens (REST + `--ws`); the farm's own `--force` build reports `branch_update=unchanged` (no local stale-disk fallback).
- **verify-diff.py HEAD**: `files=32 pairs=87 unexpected=6` — the 6 are justified in §5; all other pairs are `object X = …` → typed, or the cast-removal shape the gate accepts.
- **farm**: the CODE commit `b3dd1626f739a1f7cb4981f3f1269280efb8215c` → `job 706 exit=0 branch_update=unchanged`; this REPORT's own commit (the branch tip as of the last farm run, `5898dd63f98d4d10e66afb666997a399b7122926`) → `job 720 exit=0 branch_update=unchanged`; both `generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2` (the pin), i.e. the farm's own forced regen reproduced this tree byte-for-byte.

## 4. Rejected sub-cases (with reasons)

**(a) ~120 unguarded `+`-left sites stay `object`.** `bs`/`base`/`baseSymbol`/`tradedCurrency`/`mappedBase` whose add-left reads are not dominated by any null test or non-null write: okx/binance `bs = this.safeString(optionParts|symbolBase, 0)`, gemini/alpaca/aster/… `bs = this.safeCurrencyCode(baseId)` at `add(add(bs, "/"), quote)` and the `"id"` chains. Reason: the emitted value diverges in the null case (§1(a)); the declaration may not name a smaller box than the value can be. With the writer census (122 of the 145 sites have no write at all, the others are `safeString`/`safeCurrencyCode`/`getValue`) *no* site in this shard proves non-nullness, so this is a reject with proof, not a missing rule. `npx`+debug census: 37 `base` + 4 `tradedCurrency` + 4 `base`(`currencyId`) in the 8 sampled files, same reason.
**(b) The writer-join class (10 sites, list in §1(b)) — deferred to U01.** The write RHS is a market-row string key read: (i) 8 of the 10 receivers are `object` parameters (`market`) or locals reassigned from `safeMarket`, which `marketRowReadKey` rejects (it needs a local whose *declaration initialiser* is a market-row producer); (ii) typing the read only names the value — the *assignment* still needs a `(string)` cast, and `csharpLocalDeclaration` rewrites declarations only, so a new write-site cast pass would be required; (iii) `getValue(<market-row-local>, key)` is U01's roster line (it even names the "Dictionary market param" case), so the site class is theirs. `btcmarkets.cs:1251` (`Dictionary<string, object> market = this.market(symbol)` + `GetValue`) is the only site whose receiver the existing receiver proof could name — kept out for (ii)/(iii). **If U01 lands the write-side arm, these 10 locals join for free.**
**(c) element-read joins** `object earnedCurrency = bnb['code']` (`earnedCurrency JOIN_FAILED`, binance shuffle) and `object currency = this.currencies[code]` / `optionsCurrencies[j]` — unproven element reads (U01/U06 families); the local keeps `object`.
**(d) ternary writes** `feeCurrency = (side == "sell") ? getValue(market, "quote") : getValue(market, "base")` (kucoin ×2): same as (b), and no arm for a market-row read inside `csharpTypeOfValue`.
**(e) `object baseId/quoteId = null` + `getValue(market, "base"/"quote")` in the else-branch** (independentreserve.cs:707/708): (b) plus the same for `bs`.
**(f) proven-non-null-by-construction but no syntactic guard**: e.g. `bs = this.safeCurrencyCode(baseId)` inside `if (baseId != null && quoteId != null)` — the *argument's* guard is not a guard on the local, and the local's other write (`getValue(market, "base")`) is unproven anyway; rejected (no flow-sensitive argument proof in this unit).
**(g) compound assignments (`x += r`)**: accepted only under the same non-null proof; no family site qualified.
**(h) prediction tier**: the family has no site there (census); `prediction/myriad.cs` changed only via an unrelated `interval`-shaped local of the same proof.
**(i) printer-side equality rewrites** (`isEqual(x,"lit")` → `x == "lit"`) are not this unit's family: the 4 such lines are the landed `installCsharpStringEquality` reacting to the new declarations (justified in §5).
**(j) `[AST]` paths** (`getValue`/`isTrue`/`add` emission) untouched — the unit is not `[AST]`; no ast worktree, no pin bump.

## 5. verify-diff UNEXPECTED lines — all 6

1. `binance.cs`: `- return ((string?)((object)(add(add(add(scheme, "//"), domain), "/"))));` → `+ return add(add(add(scheme, "//"), domain), "/");` — the module's own boundary cast (installCsharp*Returns) is dropped because the chain now prints `string`: `scheme` is the retyped, early-return-guarded local, so every `+` in the chain is the same call with a non-null string left; the cast was an identity on a string box (a reference cast accepts null unchanged).
2. `blofin.cs`: same for `prefix` (guarded by `if (prefix !== undefined)`).
3–5. `pro/bitmex.cs`: `isEqual(table, "orderBookL2"|"orderBookL2_25"|"orderBook10")` → `table == "…"` — the landed string-equality family (S60) reacting to `string? table` (guarded by the early `return` at pro/bitmex.ts:1616); `==` on a string local is the same value comparison, null-safe.
6. `pro/htx.cs`: same for `messageHash` (guarded by `if (messageHash !== undefined)`).
The 7 other non-declaration pairs (receiver-cast drops) are accepted by the gate's cast-removal rule.

## 6. Residual risk

- The proof is a syntactic dominance scan, not a dataflow analysis: it accepts only the three shapes above and requires a write-free range between the proof and the read; every other shape keeps `object` (reject-on-doubt). The riskiest accepted shape is the "preceding non-null write" one (hyperliquid `bs = bs.Replace(…)`): the write's value type comes from `csharpTypeOfValue`'s string tables, and any later write — conditional or not — voids the proof via the range scan.
- The rule is family-agnostic and fired on 65 locals outside the roster family; that is a *bonus* but also the biggest integration surface: other units' families may see their own `object X = …` lines typed by the same proof, and the landed chain/equality cascades add the 13 non-declaration pairs. Integration regenerates the tree, so the exchange-file diffs are throw-away, but the *classifier* hunk must merge cleanly — `hotspot: build/csharp-local-types.js` `csharpLocalIsSafeToRetype` is where sibling units extend vetoes (one `||` at three call sites, ~250 new lines, no other file in this diff is hand-written).
- Nothing was runtime-verified on this VM (dotnet is farm-only): the gate is the farm CS build (exit 0, no warnings from this diff) plus the byte-identical fixed-point regen. The null-case equivalence argument is static, read off the hand-written `add` overload bodies.
- 0 casts added.

## 7. hotspot lines

- `hotspot: build/csharp-local-types.js` — new proof family + `csharpLocalIsSafeToRetype` left-operand call sites (the shared veto path every unit's families pass through).
- No `build/csharpTranspiler.ts`, no ast-transpiler source, no hand-written `cs/ccxt/base/*` file touched (the only base change is the regenerated `Exchange.BaseMethods.cs`).