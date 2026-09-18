# cs90 U15 — `object response|result|trades|query = null` (~70) null-init later-write join

**Family:** the null-initialised locals (TS `let x = undefined` / `let x: T;`) named `response`,
`result`, `trades`, `query` in the three generated trees, joined with every later plain write. The
join itself already exists and is name-agnostic (`build/csharp-local-types.js#typeFromValueOrWrites`,
the null-declared path in `csharpLocalTypeOf`); this unit owns these four names' sites.

**Result: 0 sites typed, 0 casts removed — every one of the 74 sites is unprovable, with the proof
recorded per class below.** One 3-line comment added to `build/csharp-local-types.js` (line 6044,
above `DESTRUCTURED_ELEMENT0_TYPES`) recording the element-1 rejection so the sibling unit (U26) and
the integrator do not re-litigate it.

**Census (before == after, byte-identical):**
```
locals: object=9304 typed=44132 typed%=82
casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
params: object=11635  returns: object=1080
```

**Gates:** scoped regens (`--force --noTests`, the id sets below) both before and after the edit leave
`git diff --stat -- cs/` **empty** (base tree reproduced byte-for-byte; a comment cannot move output,
verified rather than assumed). `verify-diff.py HEAD` → `files=0 pairs=0 unexpected=0`. No
`build/csharpTranspiler.ts`, no ast-transpiler, no hand-written base file touched → **no `hotspot:`
lines**; the only edit is the 3-line comment in `build/csharp-local-types.js`.

## 1. Census of the family

74 declaration sites (`grep -E '^\s+object (response|result|trades|query) = null;'` over
`cs/ccxt/exchanges/{,pro/,prediction/}`) — matching the roster's per-name sizes exactly:
**response 50, result 7, trades 8, query 9**. Tools + full per-site tables:
`campaigns/cs90/tools/U15/` (`site-blockers.py` → `site-blockers.txt`, `classes.py`, `survey.py`,
`summary.py`, `writers.py`, `site.py`).

## 2. Trace: what the classifier already proves for these 74 locals

Temporary instrumentation (a `u15trace` hook at the three exits of `csharpLocalTypeOf` — join failed
/ scan vetoed / typed — printing the joined type; **reverted before the commit**, evidence kept) run
over every id set that carries the family (23 REST + 8 ws + `--prediction opinion` = `trace-*.txt`,
reduced by `trace_table.py`, joined to the C# sites by `crosscheck.py`):

```
74/74 sites traced   noreturn (join produced no type) = 64
                     UNSAFE   (join proved a type, scan vetoed) = 10
                     TYPED = 0
```

The 10 scan-vetoed sites are the only ones where a type existed at all; each is rejected on evidence
in §3. No site in this family is typed today, and the family cannot be moved by repeating the join —
the blockers are per-site writes, not a missing rule.

## 3. Rejected sub-cases, with the reason

Per-site blocker classes (a site with several blockers appears in each; 74 sites):

```
51 await (implicit API)   14 other (omit/extend/safeList/Replace/getValue/…)   7 copy   6 elem1
 4 new-collection         4 string-op (add / printer-cast reads)   4 self-write   4 From*
 3 parseJson              3 safeValue                             3 never-written
```

**(A) implicit-API awaited writers — 51 sites (41 of them with no other blocker).** Every writer is
`x = await this.<publicGet…|privateGet…|fapi…|sapi…|papi…|dapi…|eapi…>(…)`. An implicit API method is
generated `Task<object>` (it returns the raw decoded JSON box), so the awaiter's static type is
`object`; cs-strict S26/S28 already rejected retyping them. Sites: `binance.cs` 5727, 6332, 6430
(+`new List<object>() {response}`), 6487, 6578, 9775, 10840, 11140, 11664 (+`parseJson`), 13047
(+`getValue(response, 0)`), 14941, 17392; `bithumb.cs` 829/868/1328/1469/1726/2663; `bitrue.cs`
1435/1527/1661; `btse.cs` 1834/2645/2842; `aster.cs` 1960/2024/3428; `bitget.cs` 6605/9018/9772;
`mexc.cs` 3234; `modetrade.cs` 2382; `toobit.cs` 1888; `weex.cs` 1312/2287; `woofipro.cs` 2717;
`bullish.cs` 2810; `coinbaseexchange.cs` 1943; `bitstamp.cs` 3346 (`withdraw`); `gate.cs` 4121;
`hashkey.cs` 3222; `prediction/opinion.cs` 527; `pro/htx.cs` 974; `pro/kucoin.cs` 2646;
`pro/mexc.cs` 1050/1188 (see (D)).

**(B) element-1 destructuring writes — 6 sites: the roster's suggested mechanism, rejected with a
proof.** `binance.cs:5722` (`fetchBalance`), `okx.cs:5964`, `okx.cs:6171`, `pro/gate.cs:1559`,
`pro/gate.cs:1776`, `pro/gate.cs:1964`. The TS annotation (`NullableDict` / `Dict`) lets the join
succeed (`binance fetchBalance query → Dictionary<string, object>` in the trace), and the only veto
is `csharpLocalIsSafeToRetype` → `destructuredWriteIsCastable` for the `[ … , query ] = this.helper (…)`
write. Extending a table the way `DESTRUCTURED_ELEMENT0_TYPES` does for slot 0 is **not
behaviour-preserving**, because slot 1 is not a proven box:

* On every path, slot 1 of every helper used at these six sites is the **caller's own `parameters`
  argument** (read off `cs/ccxt/base/Exchange.BaseMethods.cs`): `handleMarketTypeAndParams` (5042 —
  `parameters ??= new Dictionary<string, object>()` then `{ type, parameters }`),
  `handleSubTypeAndParams` (5093, same shape), `handleMarginModeAndParams` (5130, forwards to
  `handleOptionAndParams`), `handleOptionAndParams` (4981 — slot 1 is `parameters`, unchanged or
  `this.omit(parameters, …)`), `handleOptionAndParams2` (5016, same), `handleParamBool2` (4305 —
  `{ safeBool2 (…), parameters }`). None of them ever builds a fresh dict unconditionally.
* At all six sites that argument is the enclosing method's `object parameters = null` parameter
  (`binance.FetchBalance`, `okx.FetchCanceledOrders`, `okx.FetchClosedOrders`, `gate.WatchPositions`,
  `gate.WatchOrders`, `gate.WatchMyLiquidationsForSymbols`) — the C# boundary type is `object`, so the
  box is whatever the caller passed; no in-tree proof exists for it.
* A **`List<object>` argument reaches slot 1 without throwing**, so an injected
  `(Dictionary<string, object>)` / `(IDictionary<string, object>)` cast would throw
  `InvalidCastException` where the untyped box flowed on: `omit(object aa, object k)`
  (`Exchange.Functions.cs:74-79`) returns an `IList<object>` receiver **unchanged**, and `SafeValueN`
  (`Exchange.SafeMethods.cs:405-427`) accepts an `IList<object>`, returns its `defaultValue` and never
  throws. The base records that path itself: "list params (e.g. batch-order bodies) flow through
  fetch2 into omit and must pass through untouched, so the object-receiver overloads stay
  object-returning" (`Exchange.Functions.cs:62-63`).
* Identical standard to the cs-strict S43 pilot rejection of `object parameters` (roster U26:
  "`parameters` is the object param (S43 pilot rejected)") — slot 1 *is* that parameter.

**(C) string-typed `query`/`result` sites — 3 sites, rejected by the `string?` left-operand rule.**
`binance.cs:15593`, `tokocrypto.cs:2875` (`sign ()`), `bingx.cs:7074` (`customEncode`). The join proves
`string?` (null/`undefined` initialiser + `urlencode*`/`rawencode`/`add (...)`) and the scan vetoes it
because the local is the **LEFT operand of `+`** in its own accumulator writes
(`query = add (query, …)`, `result = add (result, …)`). The veto is required for behaviour: with the
`object` declaration `add (object, object)` returns **null** for a null left, whereas `add (string, *)`
returns the right operand (`Exchange.TranspileHelpers.cs:461-495`). A non-nullable `string` is also
wrong — the box *is* null before the first write. (By mechanism these three are the string null-join
shard the roster assigns to U17; they are enumerated here because the names are in my line.)

**(D) self-write identity helpers — 4 sites.** `pro/mexc.cs:1050/1188`:
`trades = this.requireValue (trades, "…")`; `bingx.cs:3891/4057`:
`response = this.fixStringifiedJsonMembers (response)`. Both helpers return `object` (the local's own
box), so the write needs a write-site cast or a typed overload, and both sites *also* carry an
implicit-API await (`watchSpotPublic`/`watchSwapPublic`/`watchSpotPrivate`/`watchSwapPrivate`,
`swapV2PrivatePostTradeOrderTest`), so the join fails first.

**(E) other-unit producers — 12 sites, blocked until that unit lands; the existing join then types
them with no U15 rule.** `this.safeValue (<recv>, <key>, {})` (dict/list default) — U08/U09/U10's TS
`safeValue`→`safeDict`/`safeList` conversion: `htx.cs:6798`, `6991`, `8743`, plus `digifinex.cs:1414`
(blocked by `result = data;`, a copy of such a local). `ccxt.BaseExchange.From*` — U30:
`lbank.cs:2571` (FromDepositAddress ×2), `lbank.cs:3149` (FromDict ×2), `lbank.cs:2967` (FromDict ×2),
`hashkey.cs:4558` (FromTradingFees). `parseJson` — U34: `binance.cs:11664`, `bitget.cs` sites.
`watch*` awaited producers — U27: `pro/htx.cs:974`, `pro/kucoin.cs:2646` (`trades = await this.subscribe*`).

**(F) never-written locals — 3 sites (upstream TS defect, not a typing opportunity).**
`pro/modetrade.cs:920`, `pro/woo.cs:1262`, `pro/woofipro.cs:917`: `object trades = null;` in
`parseWsOrder` is only *read* (the `{ "trades", trades }` dict value). The TS declares
`const trades = undefined;` (`ts/src/pro/modetrade.ts:848`, same in `woo.ts`/`woofipro.ts`) — a
`const` that can never be assigned — so those venues' emitted order rows always carry
`trades: undefined`/null (`modetrade.ts:951` handles `parsed['trades']` in a *different* method).
There is no box to name (null on every path): typing is impossible by construction; the venue's own
lane should fix the TS.

**(G) `hyperliquid.cs:2126` (`isUnifiedEnabled`) — join proves `string?`, vetoed at the write site.**
TS `let response: Str = undefined;`; writes `response = rawResponse` (inside
`if (typeof rawResponse === 'string')`, which the checker narrows — so the *join* accepts it), two
`response = ((string)response).Replace (…)` (string) and `response = undefined` in the catch. The scan
vetoes because the emitted write `response = rawResponse;` puts an `object`-typed local into a
`string?` local — CS0266 without a cast. It would need a **cast at the write site** (sound there: the
printed `is string` guard proves the box), i.e. a new guarded-write cast family — not this unit's
mechanism, recorded as a follow-up candidate.

**(H) `htx.cs:8972` (`sign`) — both writes need a write-site cast.** `query` is `new
Dictionary<string, object>() {}` inside `if (isArrayParams)` and `this.omit (parameters,
this.extractParams (path))` otherwise; the omit's C# type is `object` (its receiver is the method's
`object parameters`), so the assignment into a typed local cannot compile without a cast, and the
`isArrayParams` guard proves only "not a list", not "a dict". Same write-site-cast limit as (G).

## 4. Residual risk

* **None from this unit**: `cs/` is byte-identical to the base tree, so no runtime behaviour can
  change; the comment is inert.
* The 6 element-1 sites (class B) stay `object` until someone proves a `Dictionary<string, object>`
  box for the callers' `parameters` parameter. Every shortcut was already tried and rejected in
  cs-strict S43 (TS annotation `Dict`/`NullableDict`, "typed wrappers pass Dictionary"), and the
  `List<object>` passthrough in `omit`/`SafeValueN` is the concrete counter-example.
* Classes E are enumerated with sites so the integrator can re-measure after U08/U09/U10/U30 land;
  no U15-specific rule is needed for them.
* Tool caveat: `noreturn` in the trace means "the join produced no type" — for the 3 never-written
  sites that is the null-only path, for the others an unprovable write; `site-blockers.txt` names the
  write per site.

## 5. Evidence (profile-side, not committed)

`/root/.hermes/profiles/deepseek/campaigns/cs90/tools/U15/`: `site-blockers.py` +
`site-blockers.txt` (74 sites × writes × blocker class), `classes.py`, `crosscheck.py` +
`site-trace-outcomes.txt` (site ↔ trace outcome), `trace-*.txt` (raw classifier traces),
`survey.py` / `summary.py` / `writers.py` / `site.py` / `trace_table.py`, `census-before.txt`,
`census-after.txt`.
