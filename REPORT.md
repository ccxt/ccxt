# cs90 U24 — shadow copies of the `symbol` / `timeframe` / `since` / `currency` / `tag` core args

Unit: roster line U24 (UNITS.md §E). Base `d847892a6fcf5699640862316303b6344a3e4daf`, branch `cs90-U24`,
worktree `/root/worktrees/cs90/U24`. U23 owns the `limit` copy; nothing here is keyed on `limit`.

## Family

The `typeCoreArgs` / `retypeCoreArgCopies` copies (`object <alias> = <core arg>;` + the body uses renamed
to the alias) whose SOURCE is one of this unit's string core args. Base census of the copies, by source:

| source | alias shapes | base `object` copies | typed by this unit | residual |
|---|---|---|---|---|
| `symbol` | symbolVar | 189 | 180 | 9 |
| `tag` | tagVar | 49 | 47 | 2 |
| `timeframe` | timeframeVar | 41 | 29 | 12 |
| `since` | sinceVar / startTime / start / timestamp / startTimestamp | 20 + 7 + 3 + 1 + 1 | 0 | 33 |
| `currency` | currencyVar / entry / chains | 9 + 3 + 1 | 0 | 13 |
| **total** | | **325** | **256** | **69** |

`typed_declarations = 256` (180 symbolVar + 47 tagVar + 29 timeframeVar), `casts_removed = 4`.
Diff vs base: 115 files, 487 changed lines = 256 declaration retypes + 227 write casts + 4 cast removals.

## Rules / tables / passes touched

- `build/csharpTranspiler.ts` (hotspot) — the shadow-property analysis of `retypeCoreArgCopies`:
  - `CORE_ARG_SHADOW_OWNED_SOURCES = [ 'symbol', 'timeframe', 'since', 'currency', 'tag' ]` — the key of
    every new rule. A copy of another source (`limit` — U23, `code` — S01, …) keeps exactly the rules it
    had; only the two write forms below are gated on this list.
  - `CORE_ARG_SHADOW_MARKET_ROW_READ_RE` + `CORE_ARG_SHADOW_MARKET_ROW_BIND_RE`: the write
    `alias = GetValue(row, "<key>")` is proven a string when the key is in `MARKET_ROW_STRING_KEYS`
    (imported from `build/csharp-local-types.js` — the same census the classifier uses for the READ form
    `string? symbol = ((string)GetValue(market, "symbol"));`, ~250 sites on the base) and the receiver is a
    local this body binds ONLY from `this.market` / `this.safeMarket` / `this.safeMarketStructure`
    (`coreArgShadowProducerLocals` + `coreArgShadowOnlyBinds`: every assignment of the name is that producer
    or a `null` init).
  - `CORE_ARG_SHADOW_ELEMENT0_READ_RE` + `CORE_ARG_SHADOW_STRING_ELEMENT0_BIND_RE`
    (`handleWithdrawTagAndParams`): the write `alias = holder[0]` is proven a string when the holder is an
    `IList<object>` parmeter-bound local of that one call — the hand-written helper returns
    `new List<object>() { tag, parameters }` where `tag` is a `string?` local or the caller's tag on every
    path (`cs/ccxt/base/Exchange.BaseMethods.cs#handleWithdrawTagAndParams`).
  - `coreArgShadowWriteCastType` / `coreArgShadowCastWrite` — the cast the typed declaration implies, and the
    line rewrite that inserts it (`alias = ((string)<rhs>);`).
  - `coreArgShadowIsProvable` gained an optional `castCasts: number[]`: present only for an owned source;
    it enables the two write forms (a write that needs the cast is not a blocker) and collects the line
    indexes. `retypeCoreArgCopies` rewrites those lines ALL-OR-NOTHING and only then retypes the
    declaration — a raw line whose shape does not survive the rewrite keeps the declaration `object`, so a
    retyped declaration without its cast cannot be emitted. A coupling check in the unit audit enforces the
    same invariant on the output.
  - the S04 gate (`newRules = source !== 'timeframe'`, a lower-numbered unit in the previous round) is lifted:
    this unit owns the `timeframe` copy now. It was false for `timeframe` alone, so no other source changes —
    it is what makes the 29 `timeframeVar` sits provable (the `add` only-positions rule, `inOp`,
    `getMessageHash`, `safeSymbol`, …).
- `build/csharp-local-types.js`: `MARKET_ROW_STRING_KEYS` exported (module-private before) so the write rule
  reads the same table instead of duplicating the key list.
- No `ts/src` edit (generator-side only → no other language changes); no new file under `build/`.

## Baseline / verification

- BASELINE FIRST: scoped forced runs on the untouched tree (REST + `--ws` + `--prediction`) → `git diff -- cs/`
  empty.
- Local regen scoped to the 128 files carrying an owned-source copy (64 REST + 58 pro + 4 prediction ids, plus
  the base files the runs regenerate): `ccxt-perf-slot.sh --local npx tsx build/csharpTranspiler.ts --force
  --noTests [--ws|--prediction] <ids>`. A second identical pass reproduced the diff byte-for-byte
  (`sha256(git diff -- cs/)` = `24c3253c837633bf` before and after).
- `python3 campaigns/cs90/verify-diff.py HEAD` → `files=115 pairs=487 unexpected=230` (rc=1). Expected: the
  grammar models declaration/return retypes and cast removals heading a statement; this unit's 227 write-cast
  INSERTIONS and 3 cast removals that do not head a declaration read as unexpected. Unit-owned pair audit
  (`campaigns/cs90/tools/U24/pair_audit.py`, `--selftest` = 10/10 PASS, including the coupling corruption cases)
  → `changed lines: 487  classes: {'R1': 256, 'R2': 227, 'R3': 4}  UNEXPECTED pairs: 0`. Its three classes:
  R1 `object <alias> = <source>;` → `<T> <alias> = <source>;` (source a parameter of the enclosing method
  declared T); R2 `<alias> = <rhs>;` → `<alias> = ((string)<rhs>);` with `<rhs>` one of the two proven
  producers (re-derived from the emitted body — the audit never reads the pass); R3 the identity cast removals
  below.
- Cast removals (4): `((string)timeframeVar)` × 2 (bithumb `parseOHLCVs`, kalshi `parseOHLCVs` lines),
  `(((string)tagVar).Length` (okx `Withdraw`), `[(string)timeframeVar]` (pro/onetrading `WatchOHLCV` indexer) —
  all dropped by the base's own `dropStringTimeframeCasts` / `retypeStringReceiverCasts` passes, which fire only
  once the binding is `string`; each is the same expression to the compiler (`(string)x` on a string binding).
- Farm: `HEAD e60fbd4858aad1a5a30ffe688436e20e0672f716 job=684 exit=0 branch_update=unchanged
  generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2` (no [AST] change; the pin is untouched and
  `branch_update=unchanged` is the whole-tree fixed-point proof for the committed sha).
- Census `campaigns/cs90/census.sh`, exchanges/**: before `locals: object=9304 typed=44132 typed%=82`,
  `casts: (string)=2113 …`; after `locals: object=9054 typed=44382 typed%=83`, `casts: (string)=2331 …`.
  The `(string)` count moves +221/-3 inside the exchanges trees (net +218) and +6/-0 in the generated base
  files `Exchange.BaseMethods.cs` / `Exchange.TradingMethods.cs` (6 further retypes, outside the census globs,
  which is why the local count moves by 250 while 256 lines were retyped).

## Rejected sub-cases (with reason)

1. `currencyVar` / `entry` / `chains` (13) — the source is a `Dictionary<string, object>` parameter;
   `CORE_ARG_SHADOW_TYPES` admits scalars only, and the copy's writes are dict producers. A dict shadow type
   (+ its own write proofs) is a different family (U01/U04 own the dictionary receivers).
2. `sinceVar` / `startTime` / `start` / `timestamp` / `startTimestamp` (33, `Int64?`) — every blocker is a
   numeric write whose BOX is not proven: `subtract(…)` / `this.sum(…)` / `multiply(…)` / `mathMax(…)` (the
   `(object, object)` overload boxes an Int32 for int operands and a double for its double path, so a blind
   `(Int64?)` unbox would throw), int literals (`= 1`, `= 100`: `Int64? x = 1` converts and boxes an Int64
   where `object x = 1` boxes an Int32 — a real box change), ternary RHS (`(isEqual(x, null)) ? 100 : x` — U22
   owns ternary arms), `until = add(sinceVar, 86400000)` (the write target is U17's local), `add` at index 0
   (excluded by design: a null left would rebind `add(string, *)`), `x = this.safeValue(parameters, "…", x)`
   (a self-read), `originalSince = sinceVar` (a copy, U42), and `Math.Round(Convert.ToDouble(divide(x, 1000)))`
   (a double box). These producers are U35/U22/U17 families.
3. `symbolVar` (9): 2 × `symbolVar = GetValue(market, "symbol")` whose market-row local is bound through an
   intermediate (`Dictionary<string, object> marketResolved = this.market(symbolVar); market = marketResolved;`
   — pro/binance.cs:6124, pro/gate.cs:1761): rejected by the "every assignment of the receiver is a market-row
   producer" rule; bitmex.cs:3350 (`add(add(getValue(code, "…"), "…"), getValue(splitSymbol, 1))` — the RHS is
   not a proven producer); deepcoin.cs:2696 (a ternary RHS); gate.cs:6691, xt.cs:3082, pro/gate.cs:172/418
   (the alias is passed to `FetchOrdersByStatus` / `CreateSpotOrder` / `createOrderRequest` /
   `prepareOrdersByStatusRequest` — callees outside `CORE_ARG_SHADOW_CALLEES`, i.e. positions whose `object`
   parameter typing belongs to another family); pro/kucoin.cs:2163 (`orders = await this.subscribePrivateUta(…)`
   — an unproven write).
4. `tagVar` (2): bithumb.cs:2960 `destinationRequest = tagVar;` (a copy into another local, U42);
   coinmate.cs:903 `transaction["…"] = tagVar;` (an object-slot write whose receiver the pass's dict-write rule
   does not accept).
5. `timeframeVar` (12): 3 + 9 write-only shadows (`object timeframeVar = timeframe; timeframeVar ??= "1m";` and
   no read anywhere) — the analysis' `reads > 0` guard keeps them `object` (a write-only local is CS0219):
   bitfinex.cs:4149, btcturk.cs:851, pro/alpaca.cs:169, and the same shape in the generated base file
   (Exchange.BaseMethods.cs: FetchOpenInterestHistory / FetchOHLCV / FetchSpotOHLCV / FetchContractOHLCV /
   FetchOHLCVWs / WatchOHLCV / parseOHLCVs / parseWsOHLCVs / unWatchOHLCV). Deliberately not relaxed: the TS
   writes a value it never reads, and a typed declaration buys nothing there.

## Residual risk

- The 227 new `((string)…)` casts are unboxing assertions: they throw `InvalidCastException` where the untyped
  `object` flowed on if the value is not a string. Proof per shape above (a market row's string keys — the
  classifier already emits the identical cast for the READ form; `handleWithdrawTagAndParams`'s element 0).
  A `null` value converts to `null` through the cast (a reference-typed unbox), so the optional-symbol paths
  are unaffected.
- The `[(string)timeframeVar]` removal changes the indexer argument's static type from `string` to `string?`.
  For a reference type this is annotation-only (same type, same key); the base pass documents the same rule.
- 69 copies of owned sources remain `object` (table above), each with its blocker in the residual census
  (tools/U24/shadow_proof.py prints them site by site). Where a blocker is another unit's family, the site is
  expected to be picked up by that unit's branch — no rebase was done here.
- Coverage of the local regen is by construction: only files with an owned-source copy may change, and
  `git diff --name-only` after the regen contained no file outside that set (115 of 128; the 13 unchanged ones
  are the rejects above). The farm's `branch_update=unchanged` and the byte-identical second local pass are the
  whole-tree checks.

## Tooling (unit-owned, under campaigns/cs90/tools/U24/)

- `sites.py` — base census of the copies (file, line, alias, source, enclosing method, source param type).
- `uses.py` — the use-line shapes per alias (what a site's body does with the copy).
- `shadow_proof.py` — Python replica of `retypeCoreArgCopies` + `coreArgShadowIsProvable` (+ the U24 write
  rules), tables parsed out of the TS source; prints the residual sites with the blocking use. Run on the
  emitted tree: 50 residual sites for this family, 0 of them provable under the new rules (the replica and the
  emitted tree agree).
- `pair_audit.py` (`--selftest`) — the three-class pair audit + the coupling invariant (a retyped copy must
  carry its cast; a cast write must sit on a typed copy) used for the `verify-diff.py` justification above.