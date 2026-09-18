# U33 — string-returning generated + hand-written helpers (`object` → `string`/`string?`)

Unit: cs90 roster line U33 (family G/H: base helpers still returning `object`). Branch `cs90-U33`, base
`d847892a6fcf5699640862316303b6344a3e4daf` (PR #30530 head, cs-strict-INT), ast-transpiler pin
`404e9daa7f0ab58d085ed04aaa61a19546dfeda2` — **not an [AST] unit**: no ast-transpiler change, no
`build/csharpTranspiler.ts` change, no `ts/src` change.

## Family / result

| name | mechanism | type | roster sites typed |
|---|---|---|---|
| `networkCodeToId` | `CSHARP_METHOD_RETURN_TYPES` (+ local table) | `string?` | **15 / 15** |
| `networkIdToCode` | already landed (S35) — verified, no residual | `string?` | 0 left |
| `getSupportedMapping` | `CSHARP_METHOD_RETURN_TYPES` | `string` | **9 / 9** |
| `convertTypeToAccount` | `CSHARP_METHOD_RETURN_TYPES` | `string?` | 8 / 9 |
| `codeFromOptions` | `CSHARP_METHOD_RETURN_TYPES` | `string?` | **4 / 4** |
| `getUrlByMarket` (sync, pro/gate) | `CSHARP_METHOD_RETURN_TYPES` | `string?` | **13 / 13** |
| `getTypeByMarket` | rejected (proof below) | — | 0 / 13 |
| `implodeHostname` | rejected (proof below) | — | 0 / 8 |
| `remove0xPrefix` | hand-written base retype + local table | `string` | 6 / 7 |
| `walletAddress` (`this.walletAddress`) | `CSHARP_LOCAL_WS_MEMBER_TYPES` | `string` | **5 / 5** |

Totals: **83 local declarations typed** (60 of them the roster's own sites), **7 signatures retyped**
(5 generated + 1 htx override + 1 hand-written), **15 casts removed** (13 `((string)…)` unbox/receiver
casts + 2 redundant `((string?)((object)(x)))` funnels), **16 return-path funnels added** (15 `string?`
+ 1 `string`).

## Files / tables touched (no pass logic changed)

- `build/csharp-local-types.js` — three table insertions only:
  - `CSHARP_METHOD_RETURN_TYPES` +5 (`getSupportedMapping` `string`, `getUrlByMarket` /
    `convertTypeToAccount` / `codeFromOptions` / `networkCodeToId` `string?`) with the per-declaration
    return-path census in the block comment. This wrapper casts **every** return of every declaration
    (null in / null out) — used instead of `CSHARP_STRING_RETURN_METHODS` because each of these names'
    TS return type is `any` (a Dict index / a safeValue chain / an untyped urls-map read) and
    `stringishReturn` would skip them; see the `networkCodeToId` note below.
  - `CSHARP_LOCAL_THIS_RETURN_TYPES` +7 (the five above, `remove0xPrefix` `string`,
    `ethGetAddressFromPrivateKey` `string` — the write producer that blocks the walletAddress family).
  - `CSHARP_LOCAL_WS_MEMBER_TYPES` +1 (`walletAddress` `string`, mirroring
    `cs/ccxt/base/Exchange.Options.cs:96` `public string walletAddress { get; set; }`).
- `cs/ccxt/base/Exchange.Encode.cs` — hand-written `remove0xPrefix` `object` → `string` + a 3-line
  comment. Both return paths hand back `str`, the `(string)str2` unbox taken at the top of the body, so
  a non-string argument already throws before either return; the signature only names that box. No
  bridge twin exists (`grep -rn 'remove0xPrefix' cs/tests/BaseTest.Bridge.cs
  examples/cs/examples/Examples.Bridge.cs` → 0 hits), so nothing to mirror.
- Generated (all three tiers force-regenerated): 30 `cs/ccxt/exchanges/**` files, the 3 generated base
  files (`Exchange.BaseMethods.cs`, `PredictionExchange.cs`, `Exchange.Encode.cs`'s callers) and 2
  `cs/tests/Generated/**` files.

### The `networkCodeToId` mechanism choice (found the hard way)

`CSHARP_STRING_RETURN_METHODS` + the boundary-cast set **cannot** carry this name: htx's override
(`ts/src/htx.ts:3359`) has no TS return annotation and its inferred type is not string-ish, so
`stringishReturn` returns false and the override's own print stays `object` — while
`printMethodDefinition` substitutes the base's new `string?` into the override signature. The result is
`public override string? networkCodeToId(…)` with four bare `object` returns → **CS0266** on the farm.
`CSHARP_METHOD_RETURN_TYPES` has no such gate and casts every return of every declaration, so base and
override stay consistent (CS0508). Verified in the emitted tree: all 5 base returns and all 4 htx
returns carry the funnel.

## Census (`campaigns/cs90/census.sh`, `cs/ccxt/exchanges/**`)

```
before  locals: object=9304 typed=44132 typed%=82
        casts: (string)=2113 …  returns: object=1080   isEqual=12034
after   locals: object=9226 typed=44210 typed%=82
        casts: (string)=2100 (object)=678 …  returns: object=1077   isEqual=12019
```

(before measured on `git archive d847892a6 cs/ccxt/exchanges` in `/tmp/u33base`; `returns`/`isEqual`
are the exchange-tree slice of the delta — `networkCodeToId` / `convertTypeToAccount` /
`getSupportedMapping` signatures live in the base tree.)

## verify-diff.py (base `d847892a6`)

```
files=33 pairs=132 unexpected=20
```

All 20 unexpected lines are two justified classes; there are **no typed→object flips** (the only
`+ object X = ` line in the whole diff is `object chars = this.stringToCharsArray(stripped.ToLower());`,
a receiver-cast drop, not a type flip):

1. **`[BLOCK] cs/ccxt/base/Exchange.Encode.cs` (-1/+4)** — the hand-written `remove0xPrefix` signature
   retype plus its 3-line comment (hand-written base edits are not modelled by the checker).
2. **15 × `isEqual(<local>, "lit")` → `==` / `!=` and 2 × dropped boundary funnels** — knock-ons of the
   newly typed locals: the landed U14 native-comparison pass fires on `string?` locals
   (`isEqual(x, "lit")` → `x == "lit"`), and `return ((string?)((object)(h)))` /
   `return ((string?)((object)(this.walletAddress)))` become `return h;` / `return this.walletAddress;`
   once the value is a string local. Both are identity in every case (a string box compared to a
   literal; a cast that only named the box).

## Farm gate

```
HEAD 2cd8ee1c6b58e07c6f64de30d0a54bc8a0bd1894 job=845 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
```

`branch_update=unchanged` is the full-tree fixed-point proof: the farm's own forced regeneration of
every file found nothing to add. Locally the same fixed point was shown three times (scoped id
regens, then `--force --noTests`, `--force --ws --noTests`, `--force --prediction --noTests`, `--tests`
— `git diff -- cs/ | sha256sum` = `35af009895a4ee9ef1ee0399271680f66cc67d0482047d53977df48359f0fc9d` before
and after each). The REPORT.md tip is gated separately (see below).

## Rejected sub-cases (with the reason)

1. **`implodeHostname` — all 8 sites** (`extended`, `alpaca`, `pacifica`, `bitflyer`, `woo`, `bingx`,
   `bitbns`, `bigone`). The base signature is `string` (forced by the text pass) but the table entry is
   `string?` — honestly so: `implodeHostname` forwards `implodeParams`, whose two return paths are
   `(string)path2` and `path.Replace(…)`, i.e. null when the argument is null. Every one of the 8 sites
   reads the local as the **LEFT operand** of a `+` chain (`url + endpoint`, `url += '/api'`, …), where
   the declared type picks the overload: `add(object, object)` returns null for a null left while
   `add(string, *)` returns the right operand — a real value change in the null case. No site carries a
   non-null proof at the read (no null test, no early exit, no preceding non-null write), and the null
   case is reachable (alpaca passes `getValue(getValue(this.urls, "api"), getValue(api, 0))`, a dynamic
   key that can miss). This is U18's documented reject class; reject with proof, 0 changes.
2. **`getTypeByMarket` — all 13 sites** (pro/gate). The signature is already `string?` (S51), so only
   the locals are at stake, and every site reads `messageType` as a `+` LEFT operand
   (`messageType + ".order_place"`, `messageType + ".trades"`, …). The callee returns null exactly when
   its argument is null, and **3 of the 13 sites pass a ternary with a null arm**
   (`Dictionary<string, object> market = (symbol == null) ? null : this.market(symbol);` at pro/gate
   247 / 293 / 360) — the null value is genuinely reachable there, so the retype would change the
   emitted `channel`. For the other 10 the argument's non-nullness rests on `market()` / `ToDict`
   internals (not a static proof). Reject with proof, 0 changes.
3. **`convertTypeToAccount` htx (1 of 9)** — `fromAccountId` is the left operand of
   `add(add(fromAccountId, "-to-"), toAccountId)`. The return type must stay `string?` (kucoin's own
   sites write `fromId = this.safeString(utaAccountsByType, fromId, fromId)` back into the local), so
   the left-operand veto applies; its sibling `toAccountId` types because it only ever appears as a
   right operand. The other 8 sites (gate 3, kucoin 4, htx 1) are typed.
4. **`remove0xPrefix` polymarket (1 of 7)** — `builderHex` is written by
   `builderHex = add(feeHex, addressHex)` where `addressHex` is a plain copy of `builderHex`
   (`object addressHex = builderHex;`), so the write's value type is unresolvable while the source
   local is being classified. That copy family belongs to another unit (U42); reject here, 6 of 7
   sites typed (PredictionExchange ×2, nado, grvt, myriad, opinion).
5. **`networkCodeToId` via `CSHARP_STRING_RETURN_METHODS`** — rejected in favour of
   `CSHARP_METHOD_RETURN_TYPES` for the htx-override reason above (would have shipped CS0266).

## Residual risk

- The proofs are **censuses, not static**: (a) `networkCodeToId`'s `return networkCode` fallback
  unboxes the caller's argument — the TS signature is `(networkCode: Str, …): Str` and all 56 in-tree
  call sites pass a string-typed expression (47 × a `handleNetworkCodeAndParams` element-0 `string?`
  local, 6 × `network`, 1 × the recursion's `oldCodes[networkCode]` from the base default options
  table's 3 string entries, 1 × `defaultNetworkCode`, 1 × hashkey's `string? networkId`), but a C#
  caller passing a non-string to the `object networkCode` parameter would now hit the cast where the
  `object` return flowed through. (b) `getSupportedMapping`'s non-nullable `string` rests on all 9
  in-tree call sites passing an inline string-valued dict literal (pro/gate 6, pro/hitbtc 2,
  pro/bitget 1) — a future caller with a null value would throw. (c) `getUrlByMarket` rests on gate's
  `urls['api']` (2 string leaves + 3 dict-of-string leaves) and `convertTypeToAccount` on the
  `accountsByType` option tables (okx/bigone/poloniex/bydfi/bitget, all string-valued) plus the
  `((string)account).ToLower()` unbox already in the body. (d) `codeFromOptions` rests on deribit's
  `options['code']` tables and the caller's `params['code']` — all 4 call sites already unbox with
  `this.currency(((string)code))`, so the funnel adds no new failure mode. (e) htx's
  `networkChainIdsByNames` values are `string?` by its only writer
  (`[code][title] = safeString(chainEntry, 'chain')`).
- The diff is broader than the roster names: 83 typed declarations of which 60 are the roster's own
  sites — the remaining 23 are knock-ons from the same tables (4 `ethGetAddressFromPrivateKey` locals +
  4 unblocked writes it made provable, add-chain `channel`/`messageHash` locals, null-init joins like
  mexc/htx `networkId = null`, coinsph's `(networkCode == null) ? null : …` ternaries, dydx's dropped
  boundary cast, the 2 test-tier locals). Each is a declaration-type-only line; no typed→object flip.
- **Nothing was exercised at runtime** (dotnet is farm-only). The farm's `buildCS` step compiles the
  tree (exit=0, 0 warnings from this diff); the id-tests / request / response lanes are the integration
  PR's gate, and a wrong runtime box is only catchable there.
- One transient: the first scoped REST regen emitted a stale `htx.cs` (a `toAccountId` local left
  `object`); a re-run of the same ids fixed it and every later full forced regen (and the farm's own)
  reproduces the committed tree byte-for-byte. Cause not established — most likely contention with the
  sibling jobs on the box at that moment. The farm's `branch_update=unchanged` is the authoritative
  fixed-point evidence.

## Hotspot lines

- `build/csharp-local-types.js`: `CSHARP_METHOD_RETURN_TYPES` (+5 names + the census comment),
  `CSHARP_LOCAL_THIS_RETURN_TYPES` (+7), `CSHARP_LOCAL_WS_MEMBER_TYPES` (+1). No pass logic touched.
- Hand-written base: `cs/ccxt/base/Exchange.Encode.cs` (`remove0xPrefix` signature + comment).
- No `build/csharpTranspiler.ts` line, no ast-transpiler src line.

## Tooling

`campaigns/cs90/tools/U33/sites.py` (per-family site census with enclosing method + every use),
`campaigns/cs90/tools/U33/sites4.txt` / `sites.json` (the raw census output),
`campaigns/cs90/tools/U33/u33-probe.mjs` (drives the installed classifier over every
`this.<family name>(…)` declaration and dumps the decision + each use's syntax parent — used to read
the veto reason per site without re-implementing the classifier).
