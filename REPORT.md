# U07 — `GetValue(x, "key")` uppercase form on Dictionary-typed receivers with a checker-proven string value

**Family.** A declaration `object X = GetValue(recv, "key");` in the generated tree — the
*static twin* the printer binds at an element read whose receiver's declaration
`build/csharp-local-types.js` typed as a string-keyed dictionary (S63,
`csharpElementAccessTypedReceiver`). The value is the raw box at `recv["key"]`. Where the TS
checker resolves the read — through the receiver's declared type — to a string (`string`,
`Str = string | undefined`, a string-literal union), the local is declared `string?` behind the
`(string)` cast, the exact shape the market-row string keys use (`MARKET_ROW_STRING_KEYS`):
`(string)GetValue(...)` names the box, `(string)null` → null for a missing key / null receiver.

**Base** `d847892a6fcf5699640862316303b6344a3e4daf` (PR #30530 head, cs-strict-INT), branch
`cs90-U07`, worktree `/root/worktrees/cs90/U07`.

## Rules / tables / passes touched

| File | What |
|---|---|
| `build/csharp-local-types.js` | new `typedDictStringReadType(csharp, initializer)` + `typeIsStringOrNullish(type)`; one new branch in `csharpLocalTypeOf`'s fallback chain, placed **after** `marketRowStringReadType` / `marketRowBoolReadType` (U01's market-row receivers keep ownership of every site their proof reaches — both rules name the same box, `string?` + `(string)` cast). Family comment + census in the file (section "U07: a checker-proven string value read off a proven dictionary receiver"). |
| `cs/ccxt/**` | regenerated (only the declarations in this family changed). |

No other file: `hotspot: build/csharpTranspiler.ts — not touched`; `hotspot: ast-transpiler src
(csharpTranspiler.ts) — not touched` (the unit is not `[AST]`; no ast worktree/pin change);
`hotspot: hand-written cs/ccxt/base/*.cs — not touched`.

## Sites typed

* **155 declarations typed** (154 in `cs/ccxt/exchanges/**`, 1 in `cs/ccxt/base/Exchange.BaseMethods.cs`
  — `string? code = ((string)GetValue(parsed, "code"));`, the same proof).
* **0 casts removed.** The unit *adds* the `(string)` cast-back (155 × `((string)GetValue(...)`);
  exchange-tree `((string)` census +154), which is what the `string?` spelling requires — the cast
  names the box the value already is, exactly like the landed market-row family. Dropping the
  now-identity `(string)X` casts on consumers (`result[(string)code]`) belongs to U47.
* one knock-on line, the printer's own string-equality hook (`installCsharpStringEquality`):
  `cs/ccxt/exchanges/kucoin.cs` `if (!isEqual(currencyId, "NIM"))` → `if (currencyId != "NIM")`
  (the local is now `string?`; `isEqual(string?, "lit")` → `==` is exact, BRIEF item 4).

Census (`campaigns/cs90/census.sh`, `cs/ccxt/exchanges/**`):

```
before: locals: object=9304 typed=44132 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        helpers: isEqual=12034
after:  locals: object=9150 typed=44286 typed%=82
        casts: (string)=2267 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        helpers: isEqual=12033
```

## verify-diff.py (base `HEAD`)

```
files=82 pairs=156 unexpected=1
  [PAIR] cs/ccxt/exchanges/kucoin.cs: - if (!isEqual(currencyId, "NIM"))
      + if (currencyId != "NIM")
```

The single UNEXPECTED line is justified above (printer-side string-equality hook; exact for a
string-or-null operand). Every other pair (155) is `object X = GetValue(recv, "k")` →
`string? X = ((string)GetValue(recv, "k"))` — byte-identical modulo the declaration type and the
added cast-back. The 155 typed sites span 132 distinct (file, receiver, key) groups; per key:
`symbol` 116, `r` 14, `s` 14, `id` 5 (+1 in BaseMethods), `code` 3, `uppercaseId` 1, `type` 1,
`referenceId` 1.

Scoped regens (the ids carrying the family: 33 REST + 48 WS + 5 prediction) are a fixed point:
re-running all three tiers leaves the identical 82-file / 156-pair diff, and the farm's own
transpile reported `branch_update=unchanged`.

## Farm

* `ccxt-farm build --targets cs --wait` on `da7552c902f4e639261ed98660f1ce2c178939b6` (code commit)
  → `job=666 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`
* `ccxt-farm build --targets cs --wait` on `3eebf54ab26519ed4ad63dc0acf96bfb7b0b9544` (this report's
  first revision) → `job=680 exit=0 branch_update=unchanged`
* `ccxt-farm log <job> --step buildCS --tail 60` for both: `Build succeeded. 0 Warning(s) 0 Error(s)`.
* Fixed point over the WHOLE tree (not just the family's ids): from this committed tree,
  `ccxt-perf-slot.sh --local npx tsx build/csharpTranspiler.ts --force --noTests` (exit 0) and
  `... --force --ws --noTests` (exit 0) both leave `git status --short -- cs/` **empty** — the
  REST/prediction and the pro tier are byte-identical under the new classifier pass.
* The tip of this branch is gated with the same `ccxt-farm build --targets cs --wait`; its job id
  and exit are the ones recorded in the unit's submission record (`ccxt-farm status <sha>` is the
  evidence).

## Evidence / tooling (`campaigns/cs90/tools/U07/`)

| Tool | What it proves |
|---|---|
| `u07-sites.py` (+ `u07-ts-census.mjs`) | the 186 `object X = GetValue(recv, "lit")` sites in `cs/ccxt/exchanges/**`, joined to the TS declaration + TS checker type; the before/after site tables and the reject lists in this report. |
| `u07-probe.mjs` | drives the *installed* classifier (`csharpLocalDeclaration`) over every element-read declaration, i.e. the family boundary is measured with the same code the printer runs (not a re-implementation). |
| `u07-producers.py`, `u07-producercensus.mjs` | the value census: writes at the accepted keys inside the 22 producer methods the accepted receivers come from. |
| `u07-writers.mjs` | corpus-wide write census at the accepted keys with the checker's value types. |

## Rejected sub-cases (32 of the 186)

**A. Literal key whose TS checker element type is not a string — 20 sites (keep `object`).**
`any` (13): `prediction/opinion.cs:197 childMarkets = eventVar["markets"]`,
`prediction/kalshi.cs:2611 parsedMarketsRaw = parsedEvent["markets"]`,
`prediction/polymarket.cs:{1333,1600,1655,1902,2494} tokenId = outcomeObj["outcomeId"]`
(the receiver is an `any` element read),
`whitebit.cs:{1558,1559} depositFee/withdrawFee = feeData["deposit"|"withdraw"]` (`Dict`),
`dydx.cs:{1536,1539} atomicResolution/quantumConversionExponent = marketInfo[...]`
(`Dictionary<any>`), `indodax.cs:1001 rawOrders = openOrdersResult["orders"]`
(`Dictionary<any>`), `pro/phemex.cs:1320 symbol = parsed["symbol"]` (`parsed = parsedOrders[i]`
is `any`).
`Bool` (6): `pro/weex.cs:{225,283,439,497,906,969} isContract = firstMarket["contract"]`
(`MarketInterface.contract: Bool` — a bool key, not this family).
`Dictionary<any>` (1): `woo.cs:5209 networks = currencyItem["networks"]`.
Reason: no checker proof of a string box ⇒ the `(string)` cast would be an unproven assertion.

**B. Rule fires, `csharpLocalIsSafeToRetype` vetoes — 12 sites (keep `object`).** In every one
the local is the **LEFT operand of `+`** (printed `add(<local>, …)`), where `string?` would
rebind the overload from `add(object, object)` to `add(string, object)`/`add(string, string)`:
`binance.cs:11469 earnedCurrency`, `btcbox.cs:409 currencyId`, `coincheck.cs:357 currencyId`,
`pro/binance.cs:{923,2720} streamId`, `pro/binance.cs:{1929,2022} marketId`,
`pro/bydfi.cs:170 marketId`, `pro/grvt.cs:{195,352,471,614} marketId`
(e.g. `add(add(marketId, "@"), interval.ToString())`).
Reason: the campaign's hard rule 1 (prove the overload move identical). Unlocking them needs an
`add(object, object)` null-left == `add(string, ?)` proof — a scan change with blast radius
beyond this family, deliberately not made here.

**C. Producer-side counter-evidence — no accepted site reads it (documented, not a rule
exception).** The value census over the 22 producer methods found 10 writes at accepted keys that
are not checker-typed strings, all in (venue, producer, key) groups that **no** accepted site
reads (0 of the 137 groups of the 167 checker-accepted sites overlap): `pro/hitbtc.ts:1005
parseWsOrderTrade` boxes a market
ROW at `'symbol'`, `pro/bitrue.ts:{566,768}` `any` symbols, `kraken.ts:998` /
`pro/hashkey.ts:608` market-row symbol reads (`any`, string at runtime),
`bitvavo.ts:641` / `whitebit.ts:700` are networks sub-dict `'id'` writes (a lexical false
positive of the scan), `hitbtc.ts:1010` / `bittrade.ts:1199` currency-row `'id'` from `any`
locals, `pro/xt.ts:1347` `'type'` from a `MarketType` string union (accepted shape). Had any of
them been read by an accepted site, that site would have been rejected — the `pro/hitbtc`
market-row-at-`symbol` case is the one that shows the census is load-bearing.

## Residual risk

* The added `(string)` cast throws `InvalidCastException` where the runtime box at the key is not
  a string (the same exposure the market-row string keys already carry). Bounded by the census:
  1,278 writes at the accepted keys inside the accepted producers, 1,268 checker-typed
  `string`/`Str`/`string-literal`/`undefined`; the 10 others live in groups no accepted site reads
  (case C). A row written *outside* the 22 producer methods is bounded corpus-wide to three
  `this.safeTrade/safeOrder(<local>, market)` call sites, whose rows are built inside the same
  method (their writes are in the census). Rows a user injects through options
  (`this.currencies`/`this.markets` state) carry the same trust the landed market-row key table
  already places in those maps.
* 12 sites (case B) and 20 sites (case A) stay `object`; the family's upper bound in the roster
  (186) is therefore not reached — 155 typed is the proven subset.
* Because the declaration is `string?`, ~154 consumer `(string)X` casts on those locals are now
  identity casts and remain in the tree (census `(string)` +154). Removing them is U47's family,
  not this unit's; it is the reason `casts_removed` is 0 here.
* One behaviour line moved (kucoin `isEqual` → `!=`, justified above) — the printer's own hook,
  not a hand edit.
