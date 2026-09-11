# JN-30 AUDIT — derivatives type families (Position / Funding / Greeks / Leverage / Margin containers) + nullability

Branch: `java-nt-funding-position` · Worktree: `/root/worktrees/jn-ad` · Base: `853ab685540`
(PR #30367). All generated files were regenerated through the emitters; nothing was hand-edited.

Scope audited (`ts/src/base/types.ts` ↔ `java/lib/src/main/java/io/github/ccxt/types/*.java`),
32 classes:

| group | classes |
|---|---|
| positions | `Position`, `PositionModeInfo`, `MarginLoan` |
| funding | `FundingRate`, `FundingRates`, `FundingHistory`, `FundingRateHistory` |
| open interest / liquidations | `OpenInterest`, `OpenInterests`, `Liquidation` |
| greeks / options | `Greeks`, `AllGreeks`, `Option`, `OptionChain` |
| leverage / margin mode | `Leverage`, `Leverages`, `LeverageTier`, `LeverageTiers`, `MarginMode`, `MarginModes`, `MarketMarginModes`, `MarginModification` |
| borrow rates | `BorrowInterest`, `CrossBorrowRate`, `CrossBorrowRates`, `IsolatedBorrowRate`, `IsolatedBorrowRates` |
| misc derivatives | `ADL`, `Conversion`, `TransferEntry`, `LongShortRatio`, `LastPrice`, `LastPrices` |

---

## (a) Field / type / nullability audit — measured

Script: `JN-30-evidence/audit-derivatives.ts` (loads the same IR the emitters use, diffs it
field-by-field against the .java declarations; full output `JN-30-evidence/audit-derivatives.out.txt`).

| metric | count |
|---|---|
| classes audited | 32 |
| `Dictionary<...>` container classes | 10 |
| Java field declarations | 223 |
| TS members missing from Java | **0** |
| Java members not present in TS | **0** |
| primitive (non-nullable) field declarations | **0** |
| `Object`-typed fields (excl. `info`) | **0** |
| `Map<String,Object>` fields other than `info` | **0** |
| `List<Object>` members | **0** (one guarded `(List<Object>)` cast inside `LeverageTiers` fill loop only) |
| TS fields declared optional/nullable | 111 — every one maps to a boxed Java type |

Every non-`info` member is a nominal class, a `Map<String, X>` / `Map<String, List<X>>` container,
a `List<X>`, or a boxed scalar. No member is a shape TS does not define, so there was nothing
left to *type* here: **the base emitter already renders this whole slice** (this matches
`npx tsx build/transpileTypes.ts --lang java --check` exiting 0 — file on disk == emitter output).

Container value types (the `Dict<string, X>` pattern), all nominal:

| container | Java member | TS |
|---|---|---|
| `FundingRates` | `Map<String, FundingRate> rates` | `Dictionary<FundingRate>` |
| `OpenInterests` | `Map<String, OpenInterest> interests` | `Dictionary<OpenInterest>` |
| `AllGreeks` | `Map<String, Greeks> greeks` | `Dictionary<Greeks>` |
| `MarginModes` | `Map<String, MarginMode> modes` | `Dictionary<MarginMode>` |
| `Leverages` | `Map<String, Leverage> leverages` | `Dictionary<Leverage>` |
| `LeverageTiers` | `Map<String, List<LeverageTier>> tiers` | `Dictionary<LeverageTier[]>` |
| `CrossBorrowRates` | `Map<String, CrossBorrowRate> rates` | `Dictionary<CrossBorrowRate>` |
| `IsolatedBorrowRates` | `Map<String, IsolatedBorrowRate> rates` | `Dictionary<IsolatedBorrowRate>` |
| `LastPrices` | `Map<String, LastPrice> prices` | `Dictionary<LastPrice>` |
| `OptionChain` | `Map<String, Option> options` | `Dictionary<Option>` |

## (b) What was typed

Nothing in the families' *members* was left to type (0 raw members above). The one class of the
slice that was **not wired into the typed surface at all** is `AllGreeks` — see (d), which is the
code change on this branch.

## (c) Nullability — no fabricated defaults; two flags

**No non-nullable field sits in front of an optional field in these families.** Evidence:

1. `0` primitive field declarations across the 32 classes (and across *all* generated
   `exchanges/*.java` — measured, `grep -rn "^    public \(double\|long\|boolean\|int\) " exchanges/` = 0).
   Java boxed types (`Double`/`Long`/`String`/`Boolean`) are the only ones emitted
   (`scalarFor`, `build/typeEmitters/java.ts:253-277`) — an absent JSON key stays `null`, never `0`.
2. `TypeHelper.safeFloat/safeInteger/safeString/safeBool` delegate to `SafeMethods`, which return
   `null` (never `0/""/false`) for a missing or empty key (`SafeMethods.java:65-135`).
3. Runtime probe on the compiled classes (`JN-30-evidence/Jn30Probe.java` → `.out.txt`):

```
Position.liquidationPrice  = null      # optional CCXT field absent -> null, NOT 0.0
Position.unrealizedPnl     = null
Position.initialMargin     = null
Position.contracts         = 1.5
```

So the dangerous fabricated-zero scenario (`liquidationPrice`/`unrealizedPnl`/`margin` = 0 on a
leveraged position) **cannot occur in the Java container layer**. The only primitive
`Num`-typed options in the port are hand-written `BaseExchange` options (`public double rateLimit;`
etc.), outside this slice.

**FLAG 1 (null handling of the container conversions).** The generated typed wrappers convert a
raw result with `new X(res)` / `toTypedList(res, X::new)`
(`build/generateJavaWrappers.ts:295-315`, method bodies 365-369 / 407-410). Both NPE when the
underlying result is `null`, whereas the untyped path returned `null`:

```
THROWS  new Tickers(null)            -> NullPointerException: ... "data" is null
THROWS  new FundingRates(null)       -> NullPointerException
THROWS  new AllGreeks(null)          -> NullPointerException        (…all 9 containers probed)
THROWS  toTypedList(null, Position::new) -> NullPointerException
OK      new FundingRate(null)        -> all-null element (scalar classes are null-safe)
```

The container ctors themselves are `TypeHelper.toMap(raw); … data.entrySet()` with no null guard
(`renderNewDictionary`, `build/typeEmitters/java.ts:703-760`). This is **not** a Java-only
regression: the C# port (`new Tickers(null)` → `foreach` over a null dictionary) and the Go port
(`tickersData2.(map[string]any)` type assertion) behave the same, and the untyped-return TS
semantics (`undefined`) are not preserved by any of them. Suggested fix (semantically exact) is
in the wrapper layer, not the ctor — return `null` when the whole result is null:
`res == null ? null : new X(res)` / a null guard in `toTypedList` — which is JN-B's
"wrapper returns" surface; flagged rather than edited here to avoid clobbering that slice.

**FLAG 2 (silent key drop).** A `Dictionary<X []>` value that is not a `List` is silently dropped
in the fill loop (`LeverageTiers`), so `.get(key)` later throws `NoSuchElementException` instead of
showing the malformed row. Port-local accessor design; not changed.

Also noted while auditing (not this slice): `MarketInterface.marginModes` is already typed
`MarketMarginModes`; `BaseExchange.positions` is `Object` and TS declares it `positions: any`, so
leaving it raw matches the TS source of truth.

## (d) Unified-method return types vs Java classes — census

Script: `JN-30-evidence/audit-known-census.ts` (scans every `Promise<…>` return annotation of the
234 unified async methods in `ts/src/base/Exchange.ts` + `PredictionExchange.ts`, resolves the
`Market`/`Currency` aliases, then cross-checks the type name against the Java classes and against
`KNOWN_TYPES` in `build/generateJavaWrappers.ts` — the gate that decides whether a typed wrapper
overload is emitted). Output: `JN-30-evidence/audit-known-census.out.txt`.

* Families scanned: **82** distinct (unified method → family type) pairs (`audit-d-returns.ts`).
* **81/82 were already fully wired.**
* **The single gap: `fetchAllGreeks → AllGreeks`.** `AllGreeks.java` existed but was absent from
  `KNOWN_TYPES`, so no `AllGreeks`-typed overload existed anywhere (`grep` for `AllGreeks` in
  `java/…/exchanges/` found 0 typed uses) and `fetchAllGreeks` stayed `CompletableFuture<Object>`
  on the Core even though TS annotates `Promise<AllGreeks>` (implemented by binance, bybit, okx,
  paradex).

### Change on this branch

1. `build/generateJavaWrappers.ts` — `KNOWN_TYPES += 'AllGreeks'`
2. `build/typeEmitters/java.ts` — `AllGreeks` added to `DICT_FIELD` (`greeks`), `DICT_HAS_INFO`
   and `DICT_SKIP_INFO_KEY`, so the class is regenerable and the emitter's hard-error contract
   (a KNOWN_TYPES name must be generable) holds if the file is ever deleted.

Measured effect (regenerated, not hand-edited): **104 REST wrappers + 7 prediction wrappers**
gain the typed surface — `java/` diff = **111 files, +1332 lines, 0 deletions**; the two build
files are +4/−1 (the four table entries above):

```java
public AllGreeks fetchAllGreeks(List<String> symbols, Map<String, Object> params) { … new AllGreeks(res); }
public CompletableFuture<AllGreeks> fetchAllGreeksAsync(List<String> symbols, Map<String, Object> params) { … AllGreeks::new; }
public AllGreeks fetchAllGreeks(String[] symbols, Map<String, Object> params) { … }
```

Deletion-recovery test: removed `AllGreeks.java`, ran `transpileTypes --lang java` → file recreated
by `renderNewDictionary` with the same shape (only cosmetic diff: local `Greeks g` vs the committed
`Greeks t` in `get()`), then restored. Before this change the emitter would have left the file
absent once it entered `KNOWN_TYPES`.

Cross-slice note (NOT changed — different family): `fetchDepositAddressesByNetwork → DepositAddresses`
has the identical gap (`DepositAddresses.java` exists, not in `KNOWN_TYPES`, no typed overload
anywhere, and *not* in `DICT_FIELD` either). One-line-each fix in the same two files if the owner of
that family wants it.

## Build gate

| step | result |
|---|---|
| `npx tsx build/transpileTypes.ts --lang java --check` | exit 0 (in sync) |
| `npm run force-transpileJava` | exit 0; re-run leaves `git status` clean (idempotent) |
| `npx tsx build/javaTranspiler.ts --prediction --force` | exit 0; `git status` clean |
| `cd java && ./gradlew clean compileJava` | **BUILD SUCCESSFUL** in 2m10s, 8 tasks executed, 0 errors (includes `:tests:compileJava`) |

No `ts/src` file was touched, so the TS `tsc` / eslint gate does not apply to this branch.
