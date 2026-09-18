# U17 — null-init string / numeric locals (REST + pro + prediction)

Roster line: `object until|timestamp|since|limit… = null` (numeric) and
`object symbol|url|channel|channelName|id|tag|settle|settleId|timeInForce = null` (string) null-joins
that are NOT U13's / U14's / U16's names (`marketType` is U13's, `bs`/`base`/`quote` are U18's).

Worktree `/root/worktrees/cs90/U17`, branch `cs90-U17`, base `d847892a6fcf5699640862316303b6344a3e4daf`.

## Result

| | before | after |
|---|---|---|
| locals | `object=9304 typed=44132 typed%=82` | `object=9296 typed=44140 typed%=82` |
| casts | `(string)=2113` | `(string)=2118` (5 cast-backs on the write path below) |

`typed_declarations = 8`, `casts_removed = 0` — this family removes no cast: every site's value was
already the named box, so only the declaration moved, and the five `(string)` casts are added
cast-backs on writes whose printed value is an `object`-returning helper (or an `is string`-guarded
copy) while the box is a string.

The eight sites (`git diff d847892a6fcf5699640862316303b6344a3e4daf -- cs/`, 7 files):

| file | line | sub-case | change |
|---|---|---|---|
| `bit2c.cs` | 1049 | no-init `let timestamp: Int;` | `object timestamp = null` → `Int64? timestamp = null` |
| `bit2c.cs` | 1050 | no-init `let id: Str;` | `object id = null` → `string? id = null` |
| `bitso.cs` | 1459 | null-init + `typeof order === 'string'` copy | `object id = null` → `string? id = null` + `id = ((string)order);` |
| `bybit.cs` | 10495 | null-init + market-row read | `object symbol = null` → `string? symbol = null` + `symbol = ((string)GetValue(market, "symbol"));` |
| `kraken.cs` | 1640 | null-init + `typeof trade === 'string'` copy | `object id = null` → `string? id = null` + `id = ((string)trade);` |
| `mexc.cs` | 4060 | null-init + `typeof order === 'string'` copy | `object id = null` → `string? id = null` + `id = ((string)order);` |
| `phemex.cs` | 2223 | no-init `let timestamp: Int;` | `object timestamp = null` → `Int64? timestamp = null` |
| `pro/mexc.cs` | 693 | null-init + market-row read | `object symbol = null` → `string? symbol = null` + `symbol = ((string)GetValue(market, "symbol"));` |

## Rules / tables / passes touched (`build/csharp-local-types.js` only)

1. `U17_STRING_NAMES` / `U17_NUMERIC_NAMES` + `u17FamilyName()` — the family gate. Every mechanism
   below is keyed on the DECLARATION'S OWN NAME, so no sibling family can fire on the same line and
   the emission outside these names stays byte-identical.
2. **No-initialiser shard** (`let timestamp: Int;` / `let id: Str;` — no initialiser in TS, the
   printer emits `object x = null;`): the `csharpLocalDeclaration` gate and the
   `csharpTypeOfValue === 'null'` gate in `csharpLocalTypeOf` now let a U17 name through; the
   annotation is the claim and the existing scan validates every write/read
   (`assignable(Int64?/string?, write)`) — the same path an initialized `let x: Int = undefined`
   already takes. 3 sites (bit2c ×2, phemex).
3. **Write-value proofs** in the null-init join (`typeFromValueOrWrites`) and in the retype scan
   (`csharpLocalIsSafeToRetype`), both gated by (1):
   - `u17RowReadWriteType` — `x = market['symbol']`: reuses the landed receiver proof
     (`marketRowReadKey`: `this.market/safeMarket/safeMarketStructure`-or-null provenance +
     disqualifier scan) and the landed key table (`MARKET_ROW_STRING_KEYS`, 1276-field writer
     census). No new key, no new receiver shape, no table edit. 2 sites.
   - `u17NarrowedCopyWriteType` — `if (typeof x === 'string') { y = x; }` prints as
     `if ((x is string)) { y = x; }`: the guard proves the box is a string, and the copy is that
     very box. 3 sites.
4. **Cast-backs for (3)** — `recordU17RowReadWriteTarget` records `scope -> Map<printed name,
   declaration>` only after the declaration was actually emitted `string?`; the installers chain
   `printElementAccessExpression` and `printIdentifier` and wrap exactly that write's RHS in
   `((string)…)`; a shadowed same-name binding is excluded by comparing `resolveReference` with the
   recorded declaration. A declaration the scan vetoes keeps `object` and its cast-free write.
   Why the cast is needed at all: **the C# compiler does not narrow the conversion** — a farm build
   of the first cut failed with `CS0266: Cannot implicitly convert type 'object' to 'string'` on the
   three `is string`-guarded copies (bitso/mexc/kraken), which is what the cast fixes; the guard
   makes it an identity (null included).

`hotspot:` **none** — `build/csharpTranspiler.ts`, the ast-transpiler sources and the hand-written
`cs/ccxt/base/*.cs` are untouched. The two shared hooks are printer methods already overridden by the
existing S21/S22/S63/proven-string passes (`printElementAccessExpression`, `printIdentifier`); this
pass chains on top of them and is idempotent (`_u17RowReadCastsPatched`).

## Gates

- Baseline: stash of the change → scoped regen (`bit2c phemex bybit`) → `git diff -- cs/` **empty**;
  the change was then re-applied.
- **Full local regen** (all 104 REST + 76 pro + 7 prediction ids, `--force`, one tier per run) —
  the worktree is a regeneration fixed point over the whole tree, so the commit is exactly what a
  repo-wide force-transpile emits. (The first cut regenerated only the 68 ids carrying a U17 name
  and missed one narrowed-copy site — kraken — which the full regen then produced; the farm build is
  what caught it. Lesson: after a classifier change, regenerate the FULL id list, not the family's
  file list.)
- `python3 campaigns/cs90/verify-diff.py d847892a6fcf5699640862316303b6344a3e4daf` →
  `files=7 pairs=13 unexpected=5`; the five UNEXPECTED lines are the cast-backs, one class.
- `campaigns/cs90/tools/U17/pair-audit.py d847892a6fcf5699640862316303b6344a3e4daf` (selftest
  passes: it rejects a renamed target, a mutated operand and a dropped paren) →
  `pairs=13 decl=8 cast=5 BAD=0`; it asserts every pair is a type-only declaration swap or
  `sym = expr;` → `sym = ((string)expr);`, plus that each cast target is declared `string?` in the
  same diff.
- Farm: `ccxt-farm build --targets cs --wait` on the committed tip (see `farm_job` / exit below);
  the first cut's job 754 exit=1 is what found the CS0266 above.

The five UNEXPECTED lines in `verify-diff.py` are one class: the cast-back the gate has no rule for
(assignment-position cast). The pair audit models it (unchanged line + cast token only, target
declared `string?` by the same diff, no other token moved).

## Rejected sub-cases (122 of 130 candidate sites)

Census = every currently-untyped site of the family (grep `^\s+object <name> = null;` over the
generated tree), each classified from a debug run of the classifier over all 68 ids that carry one
of these names (`tools/U17/sites.py` + the name-keyed debug dump in `tools/U17/`).

**Numeric — 34 rejected of 36**
- 25 × `until` written by `[u, params] = this.handleOptionAndParams(2)(params, …, 'until')`:
  element 0 is the caller's RAW params box (`object value = this.safeValue2(...)`, then
  `value = value != null ? value : defaultValue`). An `(Int64?)` element cast unboxes and would throw
  `InvalidCastException` where the untyped box flowed on (an int/string `params.until`), i.e. a
  runtime value change — rule 1; no in-tree writer census can close it (the writer is the user).
  Precedent: the tree's 526 element-0 casts come exclusively from helpers whose own C# body boxes the
  named type (handleMarketType/SubType/ProductType/NetworkCode/ParamString/ParamInteger/
  OriginAndSingleAddress) — **0 from handleOptionAndParams**. U13's roster claims this helper for its
  string names; if the integrator accepts a per-option-key census there, these 25 sites are the same
  class and should be taken once, not unilaterally by this unit.
- `timestamp bithumb.cs:2421` — write `normalizedTimestamp - 9 * 3600000` (untyped arithmetic
  operand) → U35's numeric-overload family.
- `timestamp bitopro.cs:1020` — `copyFrom[0]` element read, `timestamp = since` param copy and
  `this.sum(timestamp, …)` self-read → U02 / U24 / U35.
- `timestamp bitstamp.cs:1754`, `timestamp gate.cs:9334` — `this.parseInt(...)` / `multiply(...)`
  writes → U35 / U43.
- `timestamp pro/ndax.cs:476` — `Math.max(...)` write → U35.
- `timestamp phemex.cs:2385` — ternary write whose arm reads the local itself.
- 3 × no write at all (`timestamp nado.cs:2625`, `timestamp pro/coinbase.cs:556`, `since luno.cs:1520`):
  an annotation or a name is not a proof; with no write the local is only ever null, so the printer's
  `object x = null;` box is kept.

**String — 88 rejected of 94 (6 typed here)** — buckets (disjoint, counted from the name-keyed
classifier debug dump over all string ids):

| bucket | n | reason / owner |
|---|---|---|
| A destructured `handleOptionAndParams` element 0 | 27 | same rejection as the numeric 25 |
| D concat write with an untyped operand | 18 | U18 (`object` currency locals) + U19/U20 (chain leaf) |
| F identifier copy of a param/local outside a `typeof … === 'string'` branch | 12 | U42 / U18 |
| C `this.urls['api']['ws'][…]` nested literal-key read | 10 | U05 |
| I other: no-write sites, mixed joins, untyped-call writes | 8 | list below |
| B element read of a param list (`symbol = symbols[0]` / `= symbols`) | 7 | U02 |
| E element read of a split/list result (`parts[1]`, `splitted[1]`, `addressParts[1]`, `copyFrom[0]`) | 4 | U02 |
| H market-row read blocked by a SIBLING write | 2 | `pro/apex.cs:495`, `pro/bybit.cs:643` |

- A: `pro/okx` ×8 `channel`, `pro/coinbaseinternational` ×2, `pro/grvt` ×2, `pro/toobit`, `pro/gate`,
  `pro/blofin`, `alpaca`, `bitget` ×2, `cex`, `kalshi` `timeInForce`, `phemex` `settle` ×3.
- D: `aster`, `binance` ×2, `bithumb`, `bitmex`, `coinone`, `latoken`, `mudrex`, `pro/cex` … — the
  operand is U18's `object`/`bs` currency local; the family's own self-concat rule cannot fire while
  the running type is not proven non-null.
- I (8): `binance.cs:11506 id`, `bitvavo.cs:2830 id`, `phemex.cs:4308 tag` (no write at all — nothing
  to name); `indodax.cs:883 symbol` (market-row read with a `market`-parameter receiver, see below);
  `pro/bitget.cs:629 channel`; `pro/onetrading symbol` (`previousOrder['symbol']` untyped +
  `safeString`); `pro/htx url` and `pro/kucoin url` (`implodeParams`/`safeString` writes beside
  `await this.getUtaUrl()` / `negotiate`, which are not in a string-return table). Mixed-type joins
  otherwise (`bitfinex id` with `Int64?` + `string?` + `null` writes, `htx settleId` with a
  `this.isTrue(…)` write beside string writes, `gemini settleId` copying an untyped currency local)
  fall into the copy/concat buckets above.
- **Deliberately left `object` although the WRITE is a proven market-row read**: the receiver is a
  `market` PARAMETER, not a proven-row local — `delta.cs:3820`, `indodax.cs:883`, `okx.cs:11151`,
  `pacifica.cs:3460`, `mexc.cs:2004`, `coinbase.cs:1493`, `bithumb.cs:2479`, `bitget.cs:11810` (their
  remaining blockers overlap buckets B–F as well). The U01 roster line lists the "Dictionary market
  param" receiver as its own extension; the landed `MARKET_ROW_*` proof requires a local with
  `this.market/safeMarket/safeMarketStructure` (or null) provenance. If U01 lands that receiver
  proof, these sites type automatically through the write path added here (no rebase needed).

## Residual risk

- The five cast-backs are a new assignment-position cast. The market-row pair can only fire after the
  target declaration was accepted `string?` by the same receiver+key proof the declaration shard
  uses; the `is string` pair can only fire when the guard tests the very identifier being copied.
  Both name the box the value already is; the audit asserts the injected text is the unchanged line
  plus the cast token. Risk if either proof is later weakened: the cast could then throw where the
  untyped line returned the raw box (the compiler finding CS0266 on the first cut is the evidence
  that this is a real, not a cosmetic, surface).
- The no-initialiser shard trusts the TS annotation (`Int`/`Str`) as the claim, exactly as the landed
  initialized-declaration path does; every write is re-checked by `csharpLocalIsSafeToRetype`, and a
  scalar annotation on a no-init declaration of another unit's name still keeps `object`.
- Volume: 8 declaration lines + 5 cast lines, all read by hand.

## Farm gate

`ccxt-farm build --targets cs --wait` on the committed code tip: **job 777, exit=0,
`branch_update=unchanged`, `0 Warning(s)`** in `buildCS` — the farm's own repo-wide regeneration
reproduced this commit's tree, so the tree is a force-transpile fixed point. The first cut's
`job 754 exit=1` was the CS0266 that produced the cast-backs above. The only later edit to this
branch is this REPORT.md paragraph, which changes no build input; the final sha and its own farm
job are recorded in the handoff.
