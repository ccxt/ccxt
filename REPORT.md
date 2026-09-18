# cs90 U02 — `getValue(<string-list name>, i)` element reads

**Branch** `cs90-U02` (worktree `/root/worktrees/cs90/U02`), base `d847892a6fcf5699640862316303b6344a3e4daf`.

## Family

`const x = <name>[i]` where `<name>` is a **method parameter** the `typeCoreArgs` pass narrowed to
`IList<object>` (CORE_LIST_ARGS) and the TS annotation is a **string list** (`Strings` =
`string[] | undefined`, or `string[]`). The printer emits `getValue(<name>, i)`; the local becomes
`string?` behind the `(string)` cast the local-receiver element-access family
(`elementAccessElementType`) already emits for `List<object>` receivers — so the two halves of the
roster line (`receiver declared List<string>/IList<object>` + `every element provably string`) now
agree on one spelling.

**60 sites typed / 0 casts removed / 0 hand-written base files touched / ast-transpiler untouched**
(not an `[AST]` unit).

## What changed

| File | Change |
|---|---|
| `build/csharp-local-types.js` | new proof `stringListParameterElementType` (+ `stringListParameterWriteProducer`, `stringListParameterAnnotation`, `parameterListUseIsMutation`), wired into `elementAccessElementType`; the printer hook `csharpListTypedCoreArg` installed in `installCsharpLocalTypes`; `this.marketIds (...)` added to `stringElementsProducer`; `CORE_LIST_ARGS` / `CORE_LIST_TARGET_TYPES` now live here (moved, see below) |
| `build/csharpTranspiler.ts` | `hotspot:` the two tables moved out (imported from `./csharp-local-types.js`); no pass logic changed |

Why the table moved: `installCsharpLocalTypes` is called with the **ast** `Transpiler`, so the
classifier can only learn the narrowed parameter type from a table it can import — and the worker
thread imports `csharp-local-types.js`, never `csharpTranspiler.ts`. Importing the table from
`csharpTranspiler.ts` (the first attempt) deadlocked the piscina workers; the move keeps **one copy**
of the table shared by the narrowing pass and the element-read proof, so a position added to
CORE_LIST_ARGS can never be typed here by accident. No new file under `build/`.

The proof reads, for the receiver parameter `p` of the enclosing method `m`:
1. `p` is the only binding of that name in the enclosing function and its position in `m` is
   `CORE_LIST_ARGS[m][pos] === 'IList<object>'` → the emitted receiver **is** a list
   (the roster's `Reject any receiver that is object` rule: a `Strings` parameter the pass left
   `object` keeps its untyped local — 78 such sites below);
2. the TS annotation is `Strings` / `string[]`;
3. every write `p = RHS` in the body is a string-list producer. Census over the emitted tree
   (`grep -E '^\s+symbols = ' cs/ccxt`, 390 writes): 369 `this.marketSymbols (...)` (its generated
   body adds exactly one `string?` per element, `safeString (market, "symbol", getValue (symbols, i))`,
   Exchange.BaseMethods.cs:3579), 8 `this.symbols` (census A of the file header), 1
   `this.getActiveSymbols (...)`; the remaining 12 write an empty `new List<object> ()` whose every
   read is bounded by its own Count. An `as string[]` on the RHS is unwrapped (compile-time-only
   assertion);
4. no in-place mutation of the list: the `(push|unshift|splice|sort|reverse|fill|pop|shift)` census
   over `ts/src` matches only lists **built** in the method (marketIds/messageHashes/topics), never a
   parameter, and `((IList<object>)<name>).Add (` has no hit in `cs/`. An argument position is
   therefore allowed (the callee gets the caller's own array) where the local-receiver scan rejects
   it.

The local's own uses are still vetted by `csharpLocalIsSafeToRetype`, so a site whose uses cannot
live with `string?` keeps `object`.

`this.marketIds (...)` joins the string-elements producers: its generated body
(Exchange.BaseMethods.cs#MarketIds) adds exactly one `string? id = this.marketId (getValue (symbols, i))`
per element and only when it is non-null, so every element of the returned list is a string. That
unlocks 12 `object marketId = getValue(marketIds, i)` locals.

## Census

```
base  (d847892a6)  locals: object=9304 typed=44132 typed%=82   casts: (string)=2113
after (bd37b5442)  locals: object=9244 typed=44192 typed%=82   casts: (string)=2172
```

`campaigns/cs90/census.sh` on both trees; the +59 `(string)` casts are the cast each retyped
declaration carries (58 of the 60 sites; `topic` below needs none).

## Diff

21 files, 60 changed lines, all declaration-type-only:

```
string? symbol    = ((string)getValue(symbols, i));     45
string? marketId  = ((string)getValue(marketIds, i));   12
string? s         = ((string)getValue(symbols, i));      1
string? requested = ((string)getValue(outcomes, i));     1   (prediction/hyperliquid)
string  topic     = add(channelName, String.Join(",", marketIds.ToArray()));  1
```

```
$ python3 campaigns/cs90/verify-diff.py
files=21 pairs=60 unexpected=0
```

Receivers: `symbols` 46, `marketIds` 12, `outcomes` 1 (same shape — a `Strings` parameter narrowed
by CORE_LIST_ARGS; no other unit claims it, and U02 < U06). Verified with a second full regen: the
diff hash `git diff -- cs/ | sha256sum` is unchanged (`ad934d20df3a…`) and the farm's `--force` job
reports `branch_update=unchanged`.

One line is a **knock-on**, not an element read: `pro/kucoin.cs#WatchTradesForSymbols`
`object topic = add(channelName, String.Join(",", marketIds.ToArray()))` → `string topic`. It is
enabled by the new `this.marketIds (...)` proof (disabling that branch alone reverts the line and
only that line) and is sound on its own: `String.Join (string, string[])` returns `string`,
`channelName` is a non-null `string`, and `add (string, string) == add (object, object)` for those
operands (Exchange.TranspileHelpers.cs:484-500) — every use of `topic` is an `object` position
(`subscribeMultiple` / `IList<object>.Add`). `verify-diff.py` classifies it as a declaration-only
retype (not UNEXPECTED). It overlaps U19's `add` family textually; if U19 lands first, the site is
already typed there and merging is a no-op.

## Farm gate

```
$ ccxt-farm build --targets cs --wait       # from the committed branch
farm: job 737 admitted on slot 0 (targets=cs)
HEAD bd37b5442ed0f5747cb2df6c37b36e1c35d924b5 job=737 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
```

### Farm jobs (all from this branch's worktree)

| sha | job | exit | what it proves |
|---|---|---|---|
| `bd37b5442ed` (code commit) | 737 | **0** | `pre-transpile · transpileCS · buildCS · stage-cs`, 0 warnings from this diff; `--force` job with `branch_update=unchanged` → the generated tree is a fixed point |
| `69d23713027` (REPORT tip; identical tree apart from this file) | 766 | **0** | same four steps, `branch_update=unchanged`, `generator=404e9daa` |
| `8371860102da` (earlier REPORT tip) | 750 | 1 | `--test`: `testCS` fails on farm egress (see below) |
| base `d847892a6` (throwaway branch) | 760 | 1 | `--test`: **identical** failure → pre-existing, not this diff's |

**Test lane (`--test`).** On the REPORT tip the `testCS` step fails with
`ccxt.NetworkError: okx GET https://www.okx.com/api/v5/public/instruments?instType=SPOT Resource
temporarily unavailable (www.okx.com:443)` from `BaseTest.MultithreadTest` — a live okx call, i.e.
farm egress. The **base commit fails identically** (job 760), so it is pre-existing and not this
diff's. No C# test lane runs on this box (the local C# toolchain is farm-only) and none reaches the
retyped sites here; the gates this branch ships are the fixed-point force regen, the 0-warning sln
build and the base-comparison above.

## Rejected sub-cases (all reasons are censuses, not guesses)

* **78 `object`-declared parameter receivers** (`param:object`, integer index) — e.g. `FetchPositions`,
  `WatchTickers`, `WatchPositions`, `WatchOrderBookForSymbols` on most venues: the TS annotation is
  `Strings` but the pass left the C# parameter `object`, so the receiver proves nothing about its
  elements. Roster rule ("reject any receiver that is `object`"). Narrowing those parameters would
  need a fresh S39-style caller census (every caller must already pass a list / null) — out of this
  unit's scope.
* **16 receivers read out of a runtime dict** — `List<object> messageHashes = this.safeList (subscription,
  "messageHashes", …)` / `… "symbols" …` (pro bingx/bitfinex/bitmex/bybit/bydfi/coinbase/cryptocom/gate/htx/
  kucoin/xt, `cleanCache`, `handleUnSubscription`, `handleSubscriptionStatus`, `fetchMarkets`): the
  receiver's C# declaration is a list but the element type comes from a dictionary entry, so a
  per-key writer census would be needed (the same reason U03's roster gives for `safeList` receivers).
* **3 `Object.keys` lists declared twice in one method** (binance `FetchTradingFees` ×2, pro bitrue
  `findSwapMarketByWsBaseQuote`): `elementAccessElementType` requires exactly one binding of the
  receiver name in the enclosing function; attributing the read to one of two same-name bindings is
  a structural change to the shared family, and `findSwapMarketByWsBaseQuote`'s read is a *dict*
  index (`getValue(markets, getValue(symbols, i))`), not an element read at all.
* **2 `object`-declared locals built by a ternary / `safeValue`** (pro binance
  `handleOrderBookSubscription`, pro blofin `watchMultipleWrapper`) — `object` receivers, rejected.
* **4 `[]`-initialised local lists whose only writes are unproven pushes** (gemini `FetchMarketsFromAPI`,
  pro onetrading `watchMany` ×2, nado `FetchMarkets`): the push argument is itself an unproven element
  read. nado is the counter-example that keeps the proof producer-based: its `symbols` holds **raw
  market dicts**, not strings, despite the name.
* **1 non-integer key read** (pro gate `handleOHLCV`, `getValue(marketIds, symbol)`) — a dictionary
  read on a `Dictionary<string, object>` local, not an element read.
* **144 sites where the read is an argument**, not a declaration (`this.market (getValue (symbols, i))`,
  `add (…, getValue (symbols, 0))`, `((IList<object>)result).Add (…)`): the unit's metric is declared
  locals; typing them would mean a new call-site pass (`GetValue` twin / receiver retype) with a
  wider blast radius.

## Residual risk

* The added `(string)` cast throws where the old `object` box flowed on, exactly like the 82 sibling
  sites that already carry it. The element census (TS annotation `Strings`/`string[]` + the write
  producers + no in-place mutation) is what makes the cast an identity; a C# caller that passes a
  `List<object>` holding a non-string to one of these methods would now throw at the loop.
* The `topic` knock-on is outside the roster's name list (justified above).
* `casts_removed = 0`: every retype keeps the campaign's existing `string?` + `(string)` spelling.
  A cast-free spelling would need a typed `GetValue (IList<object>, int)` twin next to the S63 dict
  twin plus a post-print rewrite — a new mechanism (hand-written base + another hotspot) that this
  branch does not attempt.
* Sibling units that touch CORE_LIST_ARGS (U01/U03/U04 don't) or `stringElementsProducer` (U03/U06)
  may conflict on the moved table; the move is mechanical (identical data, identical emission).

## Tooling

`campaigns/cs90/tools/U02/site_census.py`, `receiver_census.py`, `param_census.py` — the three
censuses this report quotes (`--detail` / `--json` outputs).
