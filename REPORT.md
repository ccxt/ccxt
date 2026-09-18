# cs90 U50 — venue-helper string params (`string?`) + list params (`IList<object>`)

**Branch** `cs90-U50` (worktree `/root/worktrees/cs90/U50`), base `d847892a6fcf5699640862316303b6344a3e4daf`
(cs-strict-INT head), ast-transpiler pin `404e9daa7f0ab58d085ed04aaa61a19546dfeda2` — **not an `[AST]` unit**,
the printer was not touched.

**Result: 264 parameter declarations retyped — 233 `object <name>` → `string?` (VENUE_STRING_ARGS, S45
mechanism) and 31 `object <name>` → `IList<object>` (CORE_LIST_ARGS, name-keyed) — 0 casts removed (net),
26 shadow copies added, 19 `getArrayLength(x)` → `x?.Count ?? 0` knock-ons.** No hand-written base file,
no `ts/src` change, no new file under `build/`.

`hotspot:` `build/csharpTranspiler.ts` (three edits: `VENUE_STRING_ARGS` +233 triples, `CORE_LIST_ARGS`
+15 pairs, and the `csharpNativeListCalls` paren rule). No ast-transpiler src, no hand-written base.

## Family

| half | roster line | mechanism | result |
|---|---|---|---|
| (a) `symbol` (+ leftover `status`/`id`/`side`) `object` params on non-core venue helpers | `object symbol` … → `string symbol` via the S45 mechanism | `VENUE_STRING_ARGS` (per-venue `(method, position)`) + the unchanged `typeVenueStringArgs` pass | **233 declarations** over 90 venue keys, 94 files |
| (b) `object symbols`/`symbolsAndTimeframes`/`messageHashes`/`topics`/`channels`/`args` list params | `object symbols` list params, 78 per U02 → `List<string>` | `CORE_LIST_ARGS` (name-keyed, target `IList<object>`) + the unchanged `typeCoreArgs` pass | **31 declarations** over 15 `(method, position)` pairs |

The S45 table on the base covers the 7-name set (`type/side/timeframe/code/id/status/marketType`) with 390
triples. `symbol` was **not** in the S45 `NAMES` set, and the S45 run's own leftovers (the triples its
admission dropped) are the same family: re-running the S45 analyzer on this tree with `symbol` added
reproduces the landed 390 exactly and admits **252** new triples — 215 of them `symbol` params, 30 in the
generated base files, 7 the `status`/`id`/`side` leftovers. That is the census that says the roster premise
holds on this tree (the landed table is a *subset* of the current admission, not a competing one).

The list half is U02's explicitly-deferred follow-up ("narrowing those parameters would need a fresh
S39-style caller census — out of this unit's scope"). The target type is **not** `List<string>` (see
rejected sub-case 1); the sound spelling is `IList<object>`, the one `CORE_LIST_ARGS` already uses.

## What changed

| file | change |
|---|---|
| `build/csharpTranspiler.ts` | `VENUE_STRING_ARGS`: +233 triples (union with the 390 landed, sorted, one line per venue). `CORE_LIST_ARGS`: +15 pairs (2 existing lines gain a position: `unSubscribePublicMultiple` `{2,3}`, `unWatchTopics` `{2,3}`). `csharpNativeListCalls`: the native length replacement is wrapped in parentheses when the next non-space character is an operator. |
| `cs/ccxt/base/Exchange.BaseMethods.cs`, `Exchange.TradingMethods.cs` | generated: 13 base declarations retyped |
| `cs/ccxt/exchanges/**` | generated: 220 retypes (REST + pro + prediction) + 26 shadows + 122 body renames + 19 helper→native knock-ons |
| `cs/tests/**` | **unchanged** — regenerating the test tree (`--tests`, `--baseTests`) is byte-identical |

The two passes themselves are untouched; `typeVenueStringArgs` already implements the shadow rule
(`object <name>Var = <name>;` + body rename) for a reassigned parameter, and `typeCoreArgs` already
implements the list shadow rule. The only pass *logic* edit is the paren rule in
`csharpNativeListCalls` — see "farm job 881" below.

## Gates

| Gate | Command | Result |
|---|---|---|
| admission census (part a) | `tools/U50/admit_groups.py` on `/root/u50-base` (`symbol` added to the S45 `NAMES`) | 252 triples admitted; 926 candidate groups vetoed with a first counter-example |
| TS-contract filter | `tools/U50/ts-filter.py` | 7 pairs dropped (`buildOutcomeSymbol(side: number)`, 6 × `parseWsTicker(market: Market)`) |
| reflective-dispatch gate (part a) | `tools/U50/dispatch_gate2.py` (C# spelling **and** the camelCase twin; `spawn`/`callDynamically`/`fetchPaginatedCall*` boxed elements classified) | 19 sites, 3 non-string → 3 whole override groups dropped (12 triples) |
| group veto apply | `tools/U50/apply_veto.py` | 245 → 233, whole ancestry-connected component dropped (C# invariance) |
| emitted-tree check (part a) | `tools/U50/tree_check.py` | **233/233 triples emitted `string?`, 0 declarations still `object`, 0 not found** |
| override + call-site check | `tools/U50/verify-tree.py` (S45 verifier, path-adapted) | **override param-type mismatches 0; call sites on narrowed positions 207, non-string 0** |
| pair audit (whole diff) | `tools/U50/pair_audit.py d847892a6` (`--selftest` first) | **233 string retypes + 31 list retypes + 26 shadow adds + 122 renames (1 prose-in-comment) + 19 helper→native; unexpected 0** |
| list admission gate | `tools/U50/list_gate2.py` (name-keyed: every declaration tree-wide, every call site both spellings, body writes, no `is`/`as`, TS list annotation, dispatch) | 61 candidates → fixed point 15 admitted |
| list tree check | `tools/U50/list_check.py`, `tools/U50/list_callcheck.py` | 31 declarations, 0 not `IList<object>`; 82 call sites (both spellings), 0 non-list |
| campaign checker | `python3 campaigns/cs90/verify-diff.py d847892a6` | `files=94 pairs=398 unexpected=220` — the checker's grammar has no rule for a **parameter** retype to `IList<object>`, a shadow add, a body rename or a helper→native line (its `ok_param_retype` rule accepts the `string?` half only: 178 pairs). All 220 are the four classes the unit-owned `pair_audit.py` classifies with 0 unexpected; same precedent as S45 (`unexpected=12`, the shadow class). |
| determinism | 3 × scoped forced regen (REST, `--ws`, `--prediction`) + `--tests`/`--baseTests` | `cs/tests` unchanged; the farm's forced regeneration reports `branch_update=unchanged` |

## Census (`campaigns/cs90/census.sh`, exchanges tier)

```
before (d847892a6)  locals: object=9304 typed=44132 typed%=82
                    casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
                    params: object=11635  returns: object=1080
                    helpers: isTrue=1434 isEqual=12034 getValue=6761 add=8833 getArrayLength=704
after  (85815482b)  locals: object=9330 typed=44132 typed%=82        (+26 = the shadow copies)
                    casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
                    params: object=11385  returns: object=1080        (-250)
                    helpers: isTrue=1434 isEqual=12034 getValue=6761 add=8833 getArrayLength=685   (-19)
```

`params: object` −250 = 220 in the census file list + 30 in `cs/ccxt/base/Exchange.{BaseMethods,TradingMethods}.cs`
(13 of the string half, 17 of the list half) — every retyped declaration is accounted for. `locals` object
+26 is the price of the shadow rule (a reassigned parameter whose writes are not all list producers keeps an
`object <name>Var` copy); typed locals and casts are unchanged, so this unit moves the *params* axis of the
round, not the locals axis.

## Farm

| sha | job | exit | what it proves |
|---|---|---|---|
| `00e98f75b36` (string half) | **810** | **0** | `pre-transpile · transpileCS · buildCS · stage-cs`, 0 warnings; `branch_update=unchanged` |
| `5bb16a728d2` (list half, first revision) | 881 | 1 | `CS0019: Operator '??' cannot be applied to operands of type 'int?' and 'bool'` in `pro/htx.cs` — the landed helper→native pass emitted `symbols?.Count ?? 0` inside `((… == 1))` |
| `ea4fa8d862d` (paren fix) | 892 | 1 | `CS1503` in `tests/Generated/Exchange/Ws/test.{watchBidsAsks,watchOrderBookForSymbols,watchTradesForSymbols}.cs` — the generated test drivers pass an `object` argument |
| `85815482b97` (final code state) | **912** | **0** | `branch_update=unchanged` (fixed point), 0 warnings, `generator=404e9daa` |
| REPORT tip (this file, tree identical apart from `REPORT.md`) | see `ccxt-farm status <final sha>` | — | same four steps |

`ccxt-farm log 881/892 --step buildCS` are the evidence for the two intermediate reds; both were fixed
before the final green (the second by dropping the refuted entries, the first by the paren rule).

## Rejected sub-cases

1. **`List<string>` as the list target (the roster's spelling) — refuted by the caller census.** 66 call
   sites of the list family pass `List<object>` (`new List<object>() {symbol}`, `List<object>` locals, the
   `List<object>` returns of `marketSymbols`/`getActiveSymbols`); `List<string>` is not convertible to
   `List<object>` and vice versa (invariance), so no spelling admits both. `IList<object>` is the only
   type every proven caller passes (and the one `CORE_LIST_ARGS` already uses); `List<string>` would also
   have been a *weaker* statement than the TS contract, which is `string[]` for these parameters.
2. **The five typed cores of the list family** — `watchBidsAsks` (test driver passes `object argSymbols`),
   `watchOrderBookForSymbols` / `watchTradesForSymbols` (test driver `object symbols` **and** the examples
   pass `List<string>`), `watchOHLCVForSymbols` (examples pass `List<List<string>>`). Farm job 892 is the
   CS1503 evidence; these are the 126 declarations the roster's "78 per U02" mostly refers to. They need
   the *test/example* tiers typed first (a `ts/src/test/**` change: 6 languages), not a table entry.
3. **`watchPositions[0]`, `setPositionsCache[2]`, `helperForWatchMultipleConstruct[1]`** — dropped by the
   fixed-point gate once the call-site census could see the generated test drivers: examples pass
   `List<string>`, `setPositionsCache`'s in-tree callers pass an `object symbols` parameter, gemini's
   `WatchTradesForSymbols` (itself refuted, see 2) passes `object symbols`.
4. **`FetchPositions`, `WatchTickers`, `parsePositions`, `subscribe*`, `watchPublic*`, `watchPrivate*`,
   `getDexFromSymbols`, `handleUnsubscriptions`, … (39 list candidates)** — call-site census: callers pass
   `object` parameters of sibling methods that are themselves refuted, `var` locals of `List<string>` in the
   examples, or `string`/`Dictionary` arguments (e.g. `subscribe(1)` is the *channel* argument). Full
   per-pair evidence in `tools/U50/list-gate2.json` / `/tmp` logs reproduced by `list_gate2.py`.
5. **`is`/`as` test on the narrowed parameter** — 10 declarations (`FetchPositions` family: aster, binance,
   bybit, coinex, cryptocom, digifinex, paradex) contain `symbols is IList<object>`, the printed form of
   `Array.isArray(symbols)`. With the parameter declared `IList<object>` that test is an identity
   conversion (CS0183 "always true" → build error under `TreatWarningsAsErrors`); `typeCoreArgs` inserts no
   shadow for it (its shadow rule fires on *assignment* only), so the whole name is rejected rather than
   editing the shared pass.
6. **Reflective dispatch (part a)** — `fetchPaginatedCallCursor("fetchBorrowInterest", symbol, since, …)`
   in bitget/… and `fetchPaginatedCallDynamic("fetchOrdersByStatus", …)` in kucoin box the argument at the
   narrowed position; the boxed value there is `since` (an `Int64?`), not the `symbol` the callee's position
   expects. 3 groups / 12 triples dropped (`FetchBorrowInterest[1]` × 11 venues, `kucoin::FetchOrdersByStatus[1]`).
   The S45 gate could not see these: its by-name scan uses the C# spelling, while the runtime dispatch string
   is the camelCase name — `dispatch_gate2.py` closes that hole for both halves (19 sites inspected).
7. **926 vetoed candidate groups (part a)** — `nearest-decl-not-string` 3004 / `call-sites-not-string` 593 /
   `decl-type` 320 (a sibling declaration is already `string?` from S45 or another type) / `arg` 139
   (`add(...)` overload rebinding) / `OTHER` 25 / `reflective-arg` 16 / `cast-bad` 2 / `hand-written-decl` 1.
   The dominant class is the one S45 documented: `this.parseOrderStatus(status)` where `status` is still an
   `object` local — retyping the *local* first is another unit's family.
8. **7 TS-contract drops** — `prediction:hyperliquid buildOutcomeSymbol(side: number)` and 6 ×
   `parseWsTicker(…, market: Market)`; the C# narrowing would have been a contract lie.

## Residual risk

- **The 26 shadow copies add object locals.** A parameter that the body assigns to keeps an
  `object <name>Var = <name>;` copy; typing those copies is the `retypeCoreArgCopies` family (U17/U24
  territory), not this unit. They are visible as `locals: object 9304 → 9330`.
- **The evidence is a static census.** The call-site gate proves every in-tree caller passes the type at
  the moment of the census; a caller added later that passes something else fails to *compile* (loud, not
  silent) — the farm build is the gate for that. For the string half this is a source-compat change for
  external C# callers passing `object` locals (the same trade-off S45 shipped).
- **The `is`-test class (sub-case 5) is left object deliberately**; the alternative (a shadow for an
  `is`/`as` test) means editing `typeCoreArgs`, which is shared with every landed `CORE_LIST_ARGS` family.
- **The paren rule touches a shared pass.** `csharpNativeListCalls` now parenthesises the native length
  when an operator follows; the census of every emitted site on the base (424) found **0** with an operator
  after, so the emitted tree is unchanged except the one site this unit creates (`pro/htx.cs:1800`). A
  future site in an operand position is fixed by the same rule.
- **`CORE_LIST_ARGS` is U02's moved table.** U02's branch moves it into `build/csharp-local-types.js`
  (piscina import); this unit adds 15 entries to the copy in `build/csharpTranspiler.ts`. The integrator's
  merge must carry the 15 pairs (plus the 2 merged positions) into the moved table — a mechanical
  resolution, listed here so it is not lost.
- **Volume.** 264 declarations / 424 changed lines / 94 files is past hand review; the guarantees are the
  pair-level audit (selftested against 7 corruption classes), the two independent censuses (admission
  analyzer + post-regen verifiers), the reflective/dispatch gates and the farm jobs 810/912.

## Tool inventory (`campaigns/cs90/tools/U50/`)

`admit.py` + `admit_groups.py` (S45 analyzer, `NAMES` + `symbol`, signature regex widened to
`async static public`), `ts-gate.py` + `ts-filter.py`, `dispatch_gate.py` + `dispatch_gate2.py`,
`apply_veto.py`, `tree_check.py`, `verify-tree.py`, `pair_audit.py` (7-class selftest), `census.py`,
`list_census.py`, `list_body_census.py`, `list_gate.py` + `list_gate2.py` (fixed point, both spellings),
`list_check.py`, `list_callcheck.py`, `list_summary.py`, `merge_table.py`, `merge_list_table2.py`,
`drop_list_entries.py`, `summarize.py`, `compare.py`, plus the generated tables `venue-admit*.json`,
`dispatch-gate.json`, `list-gate2.json`, `part1-added.json`, `part2-added.json`, `ids-{rest,ws,pred}.txt`.
