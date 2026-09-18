# cs90 U43 — locals initialised by typed base helpers, held `object` by a later write

**Family.** `object X = this.<helper>(...)` declarations whose initializer is one of the base's
*typed* helpers — `json/encode/urlencode/urlencodeNested/urlencodeWithArrayRepeat/encodeURIComponent/
hmac/stringToBase64/stringToBase16` (roster group D), `iso8601/milliseconds/seconds/nonce/uuid/
parse8601` (B), `numberToString/amountToPrecision/priceToPrecision/costToPrecision` (C),
`safeMarket/safeSymbol/safeCurrencyCode` (A) — where a LATER WRITE or USE keeps the declaration
`object`. U43 owns the join when the DECLARATION initializer is one of these helpers.

**Files touched.** `build/csharp-local-types.js` only (no `build/csharpTranspiler.ts`, no
ast-transpiler src, no hand-written base, no `ts/src`). No new files under `build/`; the census and
probe tooling lives in `campaigns/cs90/tools/U43/`.

## Roster premise correction (census, not estimate)

The roster sizes were UPPER bounds from a grep; the real family on this base is **23 sites**, and
two of the four buckets belong to lower-numbered units:

| roster bucket | roster | actual on base | owner |
|---|---|---|---|
| A `safeMarket/safeSymbol/...` | 5 | **1** (`safeSymbol`) + 131 `safeCurrencyCode` | U18 (`safeCurrencyCode`, WAVE1 `8899e58cf3b`) |
| B `iso8601/milliseconds/seconds/nonce/uuid/parse8601` | 12 | **11** | U43 |
| C `numberToString/amountToPrecision/priceToPrecision/costToPrecision` | 8 | **7** | U43 |
| D `json/encode/urlencode/hmac/…` | 78 | **4** (`encodeURIComponent` 3, `stringToBase64` 1) | U43 — the other ~74 are U34's crypto helpers (`hash` 25, `signMessage` 24, `base64ToBinary` 10, `binaryConcat` 7, `stringToCharsArray` 6, `randNumber` 5, `ethGetAddressFromPrivateKey` 4) |

`object X = this.json(...)` / `this.encode(...)` / `this.urlencode(...)` / `this.hmac(...)` sites:
**0** each — those helpers are already typed everywhere on this base. The 78 in the roster was the
U34 crypto-helper count.

## What was changed

Two rules in `build/csharp-local-types.js`:

1. **`'encodeURIComponent': 'string'`** in the `this.<helper>` return table (Exchange.Encode.cs
   section, beside `encode`/`decode`). The hand-written base declares
   `public string encodeURIComponent(object str2)` and every return path is the `StringBuilder`
   result — a null argument throws inside the `(string)str2` cast, it never returns null, so the
   non-nullable spelling is the honest one (same reasoning as the `urlencodeBase64` entry).
2. **Right-operand proof extension** in `stringPlusOperandIsProvablyString`:
   `CSHARP_THIS_STRING_MEMBER_TYPES` + `thisStringMemberRead()` accept a `this.<member>` read whose
   hand-written base declaration IS a string box (`Exchange.Options.cs`:
   `public string apiKey/secret/password/uid/accountId/login/privateKey/walletAddress/twofa/proxy/
   hostname/userAgent/id { get; set; }`). The read's C# static type is that box, so
   `add(string, string)` / `add(string, object)` bind and concat a string-or-null right operand
   exactly like `add(object, object)`'s `(string)b` branch (both hand back the left for null).
   A member the base declares `object` (`name`, `token`, `urls`, `markets`, `timeout`) can hold a
   non-string and stays unprovable — deliberately excluded.

**Blast radius, measured not assumed.** A tree-wide census of `add(<object local>, this.<member>)`
over all three tiers finds exactly **4** sites (2 `version`, 1 `secret`, 1 `apiKey`); both string
ones are U43 sites. `object X = this.encodeURIComponent(...)` sites: 4, all U43. Nothing outside
the family can fire *with an `object` left operand* — but the leaf proof also reaches add-chains
and null-joint declarations whose LEFT leaf was ALREADY typed, which the initializer census cannot
see (5 such files, found by the farm's full regen; sites 8-12 below).

## Result: 12 declarations typed, 0 casts removed

```
before: locals: object=9304 typed=44132 typed%=82
after : locals: object=9292 typed=44144 typed%=82
```

The 12 pairs (`verify-diff.py d847892a6fc` → `files=9 pairs=12 unexpected=0`):

| # | site | before → after | class |
|---|---|---|---|
| 1 | `aster.cs:5055` | `object encoded` → `string encoded` | table entry |
| 2 | `bithumb.cs:3676` | `object encodedKey` → `string encodedKey` | table entry (add-left, right = `"="` literal) |
| 3 | `bithumb.cs:3678` | `object encodedValue` → `string encodedValue` | table entry |
| 4 | `cryptomus.cs:1327` | `object jsonParamsBase64` → `string` | right-operand proof (add-left, right = `this.secret`) |
| 5 | `bithumb.cs:3655` | `object encodedKey` → `string encodedKey` | **knock-on** (initializer is `add(encodeURIComponent(key), "[]")` — U19's site; both leaves now proven) |
| 6 | `cryptomus.cs:1328` | `object stringToSign` → `string` | **knock-on** (initializer `add(jsonParamsBase64, this.secret)`) |
| 7 | `pro/coinbaseinternational.cs:179` | `object auth` → `string` | **knock-on** (`add(add(add(timestamp, this.apiKey), "CBINTLMD"), this.password)`; the pro tree's `timestamp` was already `string`) |
| 8 | `binance.cs:15673` | `object signature = null` → `string? signature = null` | **knock-on** — null-init join: all three writes are `this.encodeURIComponent(rsa(...)/eddsa(...))` / `this.hmac(...)`, now proven non-null strings |
| 9 | `bybit.cs:11727` | `object payload` → `string payload` | **knock-on** (`add(add(timestamp, this.apiKey), body)`; `timestamp` already `string`) |
| 10 | `coinmate.cs:1489` | `object auth` → `string auth` | **knock-on** (`add(add(nonce, this.uid), this.apiKey)`; `nonce` already `string`) |
| 11 | `ndax.cs:3066` | `object auth` → `string auth` | **knock-on** (same shape as 10) |
| 12 | `pro/cex.cs:1722` | `object auth` → `string auth` | **knock-on** (`add(nonce, this.apiKey)`; `nonce` already `string`) |

Knock-ons 5-12 are U19-family / null-join declarations that become typed once every leaf is
proven. Each is overload-identical: the chain resolves to `add(string, string)` for string-or-null
operands, which returns the same concatenation `add(object, object)`'s `(string)a + (string)b`
branch returns, and a `string?` null-init join keeps the same box. They are the documented cascade
class, not a claim on U19's family.

**Two scoped-regen / farm traps (recorded because they cost two rounds).**
Sites 8-12 were NOT in the scoped id list, because that list was derived from
`object X = this.<helper>(...)` declarations — and those files' chains start from an already-typed
local (`string timestamp = this.nonce().ToString()`) or from a null-init. The real blast radius of
a *leaf* proof includes **every** add-chain and null-joint declaration whose leaf is now provable,
so the authoritative check is a **full** farm regen, not a scoped run derived from the initializer
census. And the farm's default (`transpile_force=0`) run is **incremental** — job 807 reported
`branch_update=unchanged` with `skipped_exchanges=76` and still missed `pro/cex.cs` (site 12),
because the skip test looks at the exchange's own TS input, not at `build/csharp-local-types.js`.
A `branch_update=unchanged` result is only a fixed-point proof with `skipped_exchanges=0`
(push option `full=1`).

**Farm gate.**
- `job 804` — first `ccxt-farm build --targets cs --wait`: `exit=0`, ff-merged the 4 extra files
  (sites 8-11), i.e. it caught the first batch of knock-ons the scoped regen had missed.
- `job 807` — `ce5d8b93624`, `exit=0`, `branch_update=unchanged` but `skipped_exchanges=76`
  (incremental; NOT a fixed-point proof).
- `job 830` — REPORT tip, `exit=0`, ff-merged `pro/cex.cs` (site 12).
- **`job 838` — code commit `9d5ed9230d0764d2c22366a7c291cfd0fa7e156d`, `exit=0`,
  `skipped_exchanges=0`, `transpile_forced_by=option`, `branch_update=unchanged`,
  `generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`, `failing_files=[]`** — the authoritative
  full-tree fixed-point + compile gate for the tree this unit ships.
- **`job 843` / `job 851` — the REPORT-commit tips: `exit=0`, `skipped_exchanges=0`,
  `transpile_forced_by=option`, `branch_update=unchanged`, same `generator` pin, `failing_files=[]`.**
  `REPORT.md` is not a build input, so every one of these jobs gates the byte-identical tree
  (`git diff 9d5ed9230d0 <tip> -- cs/ build/` empty).
- The branch carries ONE squashed commit (`git log --oneline` → a single `cs:` commit on
  `d847892a6fc`), force-pushed to the farm branch
  (`git push --force farm HEAD:refs/heads/cs90-U43 -o build=cs -o full=1`) because each amend made
  the plain `ccxt-farm build` answer exit 77 ("farm's cs90-U43 is ahead"), per the campaign skill.
  `REPORT.md` is not a build input, so the tree gated by job 843 is byte-identical to this tip's
  (`git diff <tip> -- cs/ build/` empty).

## Blocking-write census per residual site (19 sites left `object`)

Probe: the installed classifier instrumented via `tools/U43/instrument.py`
(`csharpLocalDeclaration` + `csharpLocalIsSafeToRetype` reject log + `typeFromValueOrWrites` join
log), run over the 12 REST ids that carry the family. Reason codes are the classifier's own
reject/join sites.

**Rejected — other units' mechanisms (do not duplicate):**

| site(s) | init | blocking write | owner / proof |
|---|---|---|---|
| `bitfinex.cs:2091`, `:4570` `amountString` | `amountToPrecision` | `amountString = (side==='buy') ? amountString : Precise.stringNeg(amountString)` — the ternary's first arm READS the local being classified, so the write's type is unresolvable (join `written === undefined`) | **U32**'s self-read running-type arm (WAVE1 `e516e972dd6`, "self-read join arm"). Porting it here would duplicate a ~100-line mechanism U32 already ships; U32 < U43 owns it. |
| `kucoin.cs:3891/3997/4078` `endAt` | `milliseconds` | `endAt = this.sum(since, limit * duration)` | **U35** (`sum` returns `object` by contract; numeric-helper family) |
| `bithumb.cs:3089`, `pro/bithumb.cs:365` `timestamp` | `parse8601` | `timestamp = subtract(normalizedTimestamp, multiply(9, 3600000))` | **U35** (`subtract`/`multiply`) |
| `deribit.cs:3817` `time` | `milliseconds` | `time = add(sinceVar, month)`; `sinceVar` is an `object` core-arg copy | **U24** (core-arg shadow) — the add leaf is unprovable until `sinceVar` is typed |
| `htx.cs:2904` `symbol` | `safeSymbol` | `symbol = this.tryGetSymbolFromFutureMarkets(symbol)` | **U37** (venue-local generated helper return paths) |
| `kucoin.cs:9822` `clientOid` | `uuid` | `[clientOid, params] = this.handleOptionAndParams(...)` (reject at `destructuredWriteIsCastable`) | **U13/U24** (destructuring) |
| `bitmex.cs:1739` `timestamp` | `parse8601` | `timestamp = 0` (int literal) | **U38**. Would need an `int → Int64?` join edge; that edge also moves the runtime box (Int32 `0` → Int64 `0`) for every U38 site, so it is not a U43-local change. |

**Rejected — unprovable right operand (`method`), 4 sites:**
`deepcoin.cs:3571` `dateTime` (`iso8601`), `okx.cs:8139` `timestamp` (`iso8601`),
`weex.cs:5036` `timestamp` (`numberToString`), `kucoin.cs:11751` `timestamp` (`nonce().toString()`,
left already non-null) — all blocked at
`if (isString && isLeftPlusOperand (n))` → `stringPlusOperandIsProvablyString`.
The right operand is the `method` parameter, emitted as `object method = null` in the generated
`sign(...)` signature. With the left typed `string`, C# picks `add(string, object)` =
`add(a, b?.ToString())`, which for a non-string `method` returns a string where
`add(object, object)`'s `(string)b` throws `InvalidCastException` — **not overload-identical**, so
the C# static type of the right operand is the only admissible proof (that is exactly what the
existing rule requires). The TS annotation `method: string` is not a C# static guarantee.

**Rejected — `string?` left operand with no non-null proof, 3 sites:**
`pro/coinbase.cs:286` `timestamp` (`numberToString`, right = `name` param),
`prediction/limitless.cs:3596` `timestamp` (`iso8601`, right = `newline` local),
`pro/deribit.cs:1194` `timeString` (`numberToString`, right = `lineBreak` local).
Both helpers have real null return paths (`Exchange.Time.cs#Iso8601` returns null for a null /
non-numeric / out-of-range argument; `Exchange.Number.cs#NumberToString` returns null for a null
argument), so a `string?` left operand is only legal with a proof that the value AT THAT READ is
non-null. There is **no** dominating null test, early-exit guard or non-null write in any of these
methods, so U18's non-null-at-use shape (WAVE1 `8899e58cf3b`) finds nothing here — its three arms
(then-branch `x !== undefined` conjunction, `if (x === undefined) continue|return|throw` guard,
preceding proven-non-null write) all require source the sites do not have. Typing the left without
that proof would change `add(object, object)`'s null-left result (null) into the right operand.

## Residual risk

- **Small, load-bearing proof surface.** Two rules, 7 declarations. The only semantic assumption
  added is "a `this.<member>` the base declares `public string` holds a string or null" — the same
  assumption `CSHARP_LOCAL_THIS_ARM_MEMBER_TYPES` (U22) and `CSHARP_LOCAL_THIS_MEMBER_TYPES`
  already rely on for `secret`/`privateKey`/`hostname`/`userAgent`. If a venue redeclares one of
  the 13 members as `object` in its own partial class, the emitted `add` would bind
  `add(object, object)` again and the declaration would stay `object` — that direction is safe
  (it only loses the type, never changes a value). The reverse (a member declared `string` that
  actually holds a non-string) cannot happen through the C# compiler.
- **Knock-ons 5-7** are in U19's family and will be reported by `verify-diff.py` as ordinary
  declaration pairs; the integrator may see them again from U19's own branch — dedupe by line.
- The 19 residual sites are all blocked by a *named* other unit; if those units land first, a
  re-run of U43's rules picks up no extra sites (nothing in the two new rules is keyed on them).

## Not re-litigated

`hash`/`signMessage`/`base64ToBinary`/`binaryConcat`/`stringToCharsArray`/`randNumber`/
`ethGetAddressFromPrivateKey`/`parseJson`/`safeCurrencyCode`/`remove0xPrefix`/`implodeHostname`/
`networkCodeToId` are lower-numbered units' families (U18/U33/U34) and were excluded from the
census by the declaration initializer, per the roster's disjointness rule.

## Hotspots

- `build/csharp-local-types.js` — only file touched. No `build/csharpTranspiler.ts`, no
  ast-transpiler src, no hand-written base file, no `ts/src`. No ast worktree / pin bump.

## Tooling (campaigns/cs90/tools/U43/)

`census-sites.py` (per-helper site census), `blocker-census.py` (later-write blocker per site from
the emitted C#), `radius-census.py` (blast radius of the right-operand proof), `instrument.py`
(classifier probe: declaration decision + init type + retype reject line + join line),
`analyse-probe.py`, `blockers-after.txt`.
