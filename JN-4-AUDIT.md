# JN-4 AUDIT — nested members inside Java nominal type classes

Branch: `java-nt-nested-members` · Worktree: `/root/worktrees/jn-d` · Base: `853ab685540`

## Task premise vs measured state

The slice asked to type members of the 82 nominal classes `java/lib/src/main/java/io/github/ccxt/types/*.java`
that are still raw (`Object` / `Map<String,Object>` / `List<Object>`) although `ts/src/base/types.ts`
defines a shape: `MarketInterface.precision`, `.limits`/MinMax, marginModes, `Order.fee`/`.trades`,
`Trade.fee`, `Ticker` fields, `Position`, `Balance`, fee/tier structures.

**Measured: that work is already in place at the base commit.** The type classes are *generated*
from `ts/src/base/types.ts` by `build/typeEmitters/java.ts` (infra from PR #29507, reconciling
generator, see its header), and `npx tsx build/transpileTypes.ts --lang java --check` exits 0 —
every generated file on disk is byte-identical to what the emitter derives from the TS source of truth.

## Census (script: `JN-4-census.py`, run over all 82 classes)

| metric | count |
|---|---|
| classes | 82 |
| total field declarations | 687 |
| fields declared `Object` | 0 |
| fields declared `List<Object>` | 0 |
| fields declared `Map<String,Object>` **other than `info`** | 3 |
| `info` fields (`Map<String,Object>`, stays raw by design) | 54 |
| `info`-excluded fields with a nominal / collection-of-nominal type | 630 |

The 3 remaining non-`info` raw fields, each a deliberate passthrough that matches TS exactly:

| member | TS declaration | Java | rationale |
|---|---|---|---|
| `OrderRequest.params` | `params?: any` (types.ts:786) | `Map<String,Object>` | free-form request bag; `any` non-info -> map is the emitter's uniform policy |
| `PredictionOrderRequest.params` | `params?: any` (types.ts:798) | `Map<String,Object>` | same |
| `TradingFeeInterface.tiers` | `tiers?: Dict` (types.ts:74) | `Map<String,Object>` | `Dict` = `Dictionary<any>`; the volume-tier schedule is venue-specific (maker/taker arrays of `[volume, fee]`, commented in types.ts) and every other port keeps it raw too: C# `Dictionary<string, object>?`, Go `map[string]any`. Typing it further would fabricate structure CCXT does not define. |

## Nested members in scope — already typed (field -> class)

| member | Java type | shape source |
|---|---|---|
| `MarketInterface.precision` | `Precision` | types.ts:86 |
| `MarketInterface.limits` | `Limits` (inline literal -> `Limits`; amount/cost/leverage/price/market -> `MinMax`) | types.ts:133-139 |
| `MarketInterface.marginModes` | `MarketMarginModes` | types.ts:81 |
| `MarketInterface.outcomes` | `List<PredictionOutcome>` | types.ts:142 |
| `Order.fee` / `Order.trades` | `Fee` / `List<Trade>` | types.ts:455-456 |
| `Trade.fee` | `Fee` | types.ts:430 |
| `Ticker.*` | all scalars (`Double`/`Long`/`String`/`Boolean`) + `info`; TS defines no nested member on Ticker | types.ts:475-498 |
| `Position.*` / `Balance.*` | all scalars + `info` | types.ts:552, 625 |
| `CurrencyInterface.limits` | `CurrencyLimits` (amount/withdraw -> `MinMax`) | types.ts:538 |
| `PredictionMarket.limits` / `.fees` / `.outcomes` | `Limits` / `PredictionFees` / `List<PredictionOutcome>` | types.ts:208-209 |
| `PredictionOutcome.precision` | `Precision` | types.ts:228 |
| `LeverageTiers.tiers` | `Map<String, List<LeverageTier>>` | types.ts:980 |
| `TradingFees.fees`, `DepositWithdrawFees.fees` | `Map<String, TradingFeeInterface>` / `Map<String, DepositWithdrawFee>` | types.ts:709 + wrappers |
| `LedgerEntry.fee`, `Transaction.fee`, `PredictionOrder.fee`, `PredictionTrade.fee` | `Fee` | types.ts |

`PredictionMarket.limits` reuses the shared `Limits` class instead of declaring a narrower
`{ amount?, cost? }` struct — identical policy in the C# port (`INLINE_STRUCT_EXTRAS`,
build/typeEmitters/csharp.ts:146-148). No change.

## Nullability (rule (c))

Every nested member is a boxed reference assigned only when the source key is present and non-null:
`Object xRaw = TypeHelper.safeValue(data, "x"); this.x = xRaw != null ? new X(xRaw) : null;`
(`MarketInterface.java:93-98`, `Order.java:64-68`, `Trade.java:37`, `PredictionMarket.java:77-79`).
`TypeHelper.safeFloat/safeString/safeInteger/safeBool` delegate to `SafeMethods`, which return `null`
(never 0/""/false) when a key is absent — `SafeMethods.SafeFloat` returns `convertedDefault == null`
for a missing key (SafeMethods.java:107-135). Scalar nested members (`MinMax.min/max`,
`Precision.amount/...`, `Fee.rate/cost`) are `Double`/`String`/`Boolean` and null when absent.
No fabricated defaults anywhere.

Collection conversions guard with `instanceof List<?>` / `instanceof Map<?,?>` and leave the field
null otherwise, so a venue that returns a non-list/non-map stays null instead of throwing.

## Field coverage (no silent drops)

A field-by-field diff of every TS interface against its Java class shows **zero TS members missing
in Java**. Note the emitter would *silently skip* a field whose shape it cannot render
(`renderInterface`, build/typeEmitters/java.ts:558-561 — `continue`), so this is worth re-checking
whenever types.ts gains a field with a new shape; today nothing is dropped.

## Why no code change

Within this slice's constraints (type only what types.ts defines; never fabricate; `info` stays
`Map<String,Object>`), there is no member left to type: the only raws are three TS `any`/`Dict`
passthrough bags whose further typing would invent structure. Forcing a change would violate the
campaign's correctness rules. Evidence: census numbers above + `transpileTypes --check` exit 0 +
cross-port parity for `tiers`.

## Build gate

(recorded after running — see final commit message)
