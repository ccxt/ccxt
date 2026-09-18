# U12 — `this.safeValue2/N` (98 locals) + `this.safeValue(<params>, "price"|"amount"|"takeProfit"|"stopLoss"|"stopLossPrice"|"takeProfitPrice")` (~130)

Unit: cs90 roster line U12 (family B, `this.safeValue` splits). Branch `cs90-U12`, base
`d847892a6fcf5699640862316303b6344a3e4daf` (PR #30530 head, cs-strict-INT), ast-transpiler pin
`404e9daa7f0ab58d085ed04aaa61a19546dfeda2` — **not an [AST] unit**: no `build/csharpTranspiler.ts`
change, no ast-transpiler change, no hand-written `cs/ccxt/base` change (see *Hotspot lines*).

## Family as measured (C# locals, `cs/ccxt/exchanges/**`)

| sub-family | C# locals | disposition |
|---|---|---|
| `object x = this.safeValue2(…)` / `safeValueN(…)` | 98 (89 + 9) | **0 typed** (86 TS sites: 40 presence-only, 39 plain, 7 keyed/coerce) — §Rejected 5 |
| `object x = this.safeValue(<params\|orderParams>, "<6 keys>")` | 59 | 16 typed + 43 rejected (§Rejected 1–4) |
| `object x = this.safeValue(<row receiver: rawOrder\|message\|close>, "<price\|amount>")` | 50 | out of unit: response-row reads (U01/U06 own the receiver) |
| `object x = this.safeValue(<stopLoss\|takeProfit dict>, "price")` | 6 | rejected (Num read out of the dict) |
| `object x = this.safeValue(order, "<stopLoss\|takeProfit>")` (bingx rows) | 2 | rejected (§Rejected 2) |
| total six-key locals | 119 (117 plain `safeValue` + the 2 okx `safeValue2` `…Price` reads counted in the first row) | 16 typed / 103 rejected |

## What landed: 16 declarations typed, 0 casts removed

The only provable box in the family is the **dict** — `params.stopLoss` / `params.takeProfit` — and only
where every consumer of the local *reads* the value as a dict. For those 8 functions the TS call is
converted to the shape-enforcing accessor (`safeDict`, the roster's rule "takeProfit/stopLoss are dicts
in TS → safeDict where TS already narrows"), which is what makes the C# `IDictionary<string, object>`
true at runtime in every port:

| venue | TS fn | converted sites | consumers of the local (use-check, tools/U12/use_check.py) |
|---|---|---|---|
| bitget | createOrder (5659–5783) | 5689/5690 | `hasStopLoss`, `safeNumber2(sl,'triggerPrice','stopPrice')`, `safeNumber(sl,'price')` |
| bitget | createOrder (5785–6028) | 5813/5814 | `hasStopLoss`, `safeString2/safeString` keyed reads + `safeValue2`/`safeValue` keyed reads after the `ArgumentsRequired` guard |
| bitget | editOrder (6229–6423) | 6251/6252 | `hasStopLoss`, `safeNumber2/safeNumber/safeString` keyed reads |
| hyperliquid | createOrders loop (2373–2433) | 2385/2386 | `hasStopLoss`, `safeString2/safeString` keyed reads |
| lighter | createOrder (733–897) | 783/784 | `hasStopLoss`, `safeNumber2/safeString/safeNumber2` keyed reads, second presence check |
| okx | createOrder (3195–3503) | 3249/3250 | `hasStopLoss`, `safeValueN/safeString/safeString2` keyed reads + `InvalidOrder` guards |
| okx | editOrder (3629–3721) | 3658/3659 | `hasStopLoss`, `safeNumber/safeString` keyed reads |
| phemex | createOrder (2694–2989) | 2730/2731 | `hasStopLoss`, `safeValue2/safeString2/safeString` keyed reads + `InvalidOrder` guards |

`use_check.py` enumerates every identifier occurrence of the two names in each function outside string
literals: each function declares the pair exactly once (no shadowing) and every use is either
`!== undefined` or the dict is the first argument of a keyed accessor. No arithmetic, `add(...)`,
`typeof`, `parseJson`, `.length`, member access or raw pass-through anywhere.

Emitted diff is declaration-only — all 16 pairs:

```
-        object stopLoss = this.safeValue(parameters, "stopLoss");
+        IDictionary<string, object> stopLoss = this.safeDict(parameters, "stopLoss");
```

**Soundness.** `safeValue` is `object` by contract (cs-strict S55) and hands back whatever the user put
in `params`. `safeDict` (TS `Exchange.ts` and the generated C# `Exchange.BaseMethods.cs#safeDict`) is
`value == null → default`, `isDictionary(value) → (IDictionary<string, object>)value`, else `default` —
so the local is provably `null`-or-`IDictionary<string, object>`, no cast, no throw on a wrong box.
The generated C# `safeDict` already returns `IDictionary<string, object>`
(`retypeSafeCollectionHelpers`), so the declaration needs no cast:

```
cs/ccxt/base/Exchange.BaseMethods.cs:473  public virtual IDictionary<string, object> safeDict(object dictionaryOrList, object key, object defaultValue = null)
```

**This is the majority idiom, not a new one.** At the base commit 26 locals in 11 venues already read
these exact params this way (`git grep -hE 'IDictionary<string, object> (stopLoss|takeProfit) = this\.safeDict\(' d847892a6fc -- cs/ccxt/exchanges`:
backpack, blofin, btse, deepcoin, extended, htx, kucoin, mudrex, pro/kraken, toobit, weex) —
the TS sources of those venues (`extended.ts:2736`, `btse.ts:2213`, `deepcoin.ts:1627`, …) already call
`this.safeDict (params, 'stopLoss')`. After this change the count is 42 and the 5 converted venues emit
byte-identical declaration/presence lines (`bool hasStopLoss = (stopLoss != null);`).

## Files / tables touched

- `ts/src/{bitget,hyperliquid,lighter,okx,phemex}.ts` — 16 call sites, `this.safeValue (…, 'stopLoss'|'takeProfit')`
  → `this.safeDict (…)`. Nothing else in those files; no comment, no formatting churn (house style already
  recommends `safeDict` when the type is known).
- generated: `cs/ccxt/exchanges/{bitget,hyperliquid,lighter,okx,phemex}.cs` — 16 declarations.
- no `build/**`, no `cs/ccxt/base/**`, no ast-transpiler.

Census (`campaigns/cs90/census.sh`, base → after):
```
before: locals: object=9304 typed=44132 typed%=82
after:  locals: object=9288 typed=44148 typed%=82
```
(−16 object = +16 typed; every other census column byte-identical: casts, params, returns, helpers — the
conversion removes no cast because these locals carried none.)

## Gates

- Baseline first: scoped regen of binance/bybit/okx/kraken/gate on the unmodified base left
  `git diff --stat -- cs/` **empty**.
- Regen: `/root/.hermes/scripts/ccxt-perf-slot.sh --local npx tsx build/csharpTranspiler.ts --noTests bitget hyperliquid lighter okx phemex`
  (no `--ws` / `--prediction` needed: no pro/prediction file was edited; the base files regenerate
  unchanged).
- Determinism: `git diff -- cs/ | sha256sum` = `2100d1038f26953cd24fca618daf84809a98278a078c360dd1b87d6c4b244841`
  before and after a forced (`--force`) re-run — identical.
- TypeScript: `npx tsc --noEmit -p tsconfig.json` → exit 0 (strict / strictNullChecks clean).
- `python3 /root/.hermes/profiles/deepseek/campaigns/cs90/verify-diff.py HEAD` → **`files=5 pairs=16 unexpected=16`**
  (exit 1). All 16 unexpected pairs are the declared family and are justified below.
- Farm: `ccxt-farm build --targets cs --wait` from `cs90-U12` →
  **`HEAD 7e046a0167b848e34ecf895addfedb1ce51e3be3 job=654 exit=0 branch_update=unchanged
  generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`** — the code commit `7e046a0167b…`; `ccxt-farm status 654`:
  `state=succeeded, exit_code=0, branch_update=unchanged, skipped_exchanges=74`, `buildCS` log
  `Build succeeded. 0 Warning(s) 0 Error(s)`. `branch_update=unchanged` on a `--force`-capable job is the
  repo-wide fixed point: the farm's own transpile of the committed sha reproduced this tree byte-for-byte
  (my scoped regen covered every file the change can touch). This REPORT is the tip commit on top of that
  sha and adds only `REPORT.md` (no build input), so the farm-green commit is the tree under the tip.

### verify-diff justifications (16/16)

Every unexpected pair is one of the 16 lines above: the **declared type and its producing accessor change
together** (`object x = this.safeValue(params,'k')` → `IDictionary<string, object> x = this.safeDict(params,'k')`).
`verify-diff.py` accepts declaration-only pairs whose RHS is the same modulo cast; the `safeValue → safeDict`
swap is the mechanism the roster line prescribes for this sub-family (cs-strict S25 / U08 twin rule), so
each pair is reported rather than matched. No line outside these 16 pairs changed in the whole tree
(`git diff --numstat -- cs/` = 5 files, 16/16).

## Rejected sub-cases (with proof)

1. **`stopLossPrice` / `takeProfitPrice` / `amount` params (23 C# locals in this sub-family: 22 `…Price`
   presence-only + mudrex `amount`; the two okx `safeValue2 (params, 'stopLossPrice'|'takeProfitPrice', …)`
   locals belong to §5's family).** The value is user-supplied `Num` (number **or** string) and every consumer is a
   numeric/precision path: `this.priceToPrecision (symbol, stopLossPrice)` (bitget 6247/6249, dydx 1398,
   bitvavo 1542-1548, deribit 2157, lighter 836), `this.amountToPrecision (symbol, amount)` (mudrex 1207),
   `isStopLossOrder = stopLossPrice !== undefined`. Neither alternate accessor is a rename: `safeNumber`
   *parses* a string into a double (upstream sends string prices through `decimalToPrecision` as strings;
   a parsed double goes through `numberToString` — a different precision path) and silently drops a
   non-numeric string that `safeValue` passes through; `safeString` returns `undefined` for the ordinary
   `{ stopLossPrice: 100 }` (a number). A C# `double?` local would also be a box no user-string value has.
   → stays `object`.
2. **bingx response rows `stopLoss`/`takeProfit` (2 locals, ts/src/bingx.ts:3994/4006).** The row value is
   *explicitly* three-shaped: `typeof stopLoss !== 'number'`, `typeof stopLoss === 'string'` →
   `this.parseJson (stopLoss)`, else a dict read (`this.safeString (stopLoss, 'stopPrice')`). Nothing in
   the code claims a dict; the receiver is an order row (U06/U03 receiver territory). → reject.
3. **self-default class (12 TS sites / 12 C# locals): bybit 4309/4310, 4694/4695; derive 1344/1345;
   modetrade 1558/1559; woo 1408/1409; woofipro 1859/1860.** The local is passed as the *default* of the
   keyed read, i.e. the raw value is meant to flow through as the price:
   `this.safeNumber2 (stopLoss, 'triggerPrice', 'price', stopLoss)`,
   `this.safeString (stopLoss, 'triggerPrice', stopLoss)`,
   `this.safeValue2 (stopLoss, 'triggerPrice', 'stopPrice', stopLoss)`. With a dict-typed local the
   fallback would become the dict (or null) instead of the caller's value → behaviour change beyond the
   type claim. → reject (stays `object`).
4. **presence-only class for `stopLoss`/`takeProfit` (8 TS sites / 8 C# locals): modetrade 1668/1669,
   1737/1738; woofipro 1966/1967, 2032/2033.** The only consumer is the flag itself —
   `isConditional = … || stopLoss !== undefined || takeProfit !== undefined`. Nothing reads the value as a
   dict, so no type can be named ("name only what the box already is"); converting would additionally flip
   `isConditional`/`hasStopLoss` to false for a non-dict value, silently turning a conditional order into a
   plain one. → reject.
5. **`this.safeValue2/N` (98 C# locals, 86 TS sites) — no dict/list box is provable for any of them.**
   The value is user input (or a response row) whose box is ids, prices, bools or timestamps:
   - ids: `safeValue2(parameters, "cid", "clientOrderId")` → `request["cid"] = clientOrderId` (bitfinex
     2102, 2388), `clOrdID` (bitmex 2751, 2793), `origClientOrderId` (coinsph 1741, 1840),
     `client-order-ids` (bittrade 2021, htx 7257) — the value goes to the wire as-is; `safeString2` would
     turn a numeric id into `undefined` and `safeNumber2` would reformat it.
   - prices: `safeValue2(parameters, "quoteOrderQty", "cost")` → `decimalToPrecision(quoteOrderQtyNew, TRUNCATE, …)`
     (binance 7621); `safeValue2(parameters, "stopPrice", "triggerPrice")` → `priceToPrecision (symbol, triggerPrice)`
     (bitget 7470, 7747, 8281, bybit 5352, gate 5503/5699); `safeValue2(stopLoss|takeProfit, "triggerPrice", "stopPrice")`
     → `priceToPrecision` (bitget 7893/7909/8479/8484, phemex 3221/3246, okx 4441-4498) — the `Num` proof
     of §1 applies unchanged.
   - bools: `safeValue2(parameters, "stop", "trigger")` → `isEqual (trigger, true)` (bitget 8547, 8795),
     `postOnly`/`post_only` (coinbaseexchange 1856), `reduceOnly`/`reduce_only` (deribit 2501, bitrue 2228),
     `trigger`/`stop` (poloniex 2144/2572/2644/2708) — the box is a bool only if the user passed a real
     bool; the typed-accessor mechanism (`safeBool2`) silently drops truthy non-bools and is U14/U32
     territory (bool family).
   - timestamps: `safeValue2(parameters, "until", "end_date")` → `this.iso8601(until)` (coinbaseexchange
     1356, 1507, 1784, 2173) — `iso8601` accepts a string date **or** an Int64 ms, so no single box.
   - dual shape: `safeValue2 (params, 'clientOrderId', 'client_id')` (hyperliquid 2869) is scalar **or**
     array — `if (!Array.isArray (clientOrderId)) clientOrderId = [ clientOrderId ];`, and the emitted C#
     shows both `getValue(clientOrderId, i)` and an `is IList<object>` test → no type names it.
   - dict/list-default sites (contested, lower units own the default-shape families): gate
     `safeValue2(order, "put", "initial", {})` → `safeString(put, "contract")`; pro/bingx
     `safeValue2(message, "data", "o", {})` (same-file twin `safeDict2` exists); pro/mexc
     `safeValue2(message, "d", "data", {})`; pro/phemex `safeValue2(message, "kline", "kline_p", [])`
     → `parseOHLCVs`. These are U08/U09's family (`{`/`[` default shape) — deferred, not claimed here.
   - receiver-owned sites: pro/cryptocom `result` → `handleOrders/handleTrades`, pro/htx
     `client.subscriptions` subscription, pro/poloniex `previousOrders` cache — U10/U11 receivers.
   - contradiction inside one local: coinspot `balances = safeValue2(response, "balance", "balances")` is
     used as a list (`getArrayLength`, `is IList<object>`, `getValue(balances, i)`) **and** as a dict
     (`this.safeString(balances, currencyId)`, `((IDictionary<string,object>)balances).Keys`) → reject.
6. **`object x = this.safeValue (stopLoss|takeProfit, 'price')` (6 locals: bitget 5929/5942, bybit 4513/4532,
   toobit 1889/1902).** The value is read out of the dict as a price (`this.getPrice (symbol, slLimitPrice)`,
   `priceToPrecision`) — the §1 Num proof. (After this unit the *receiver* of these reads is typed, which is
   where the win stops.)
7. **`object x = this.safeValue(<rawOrder|close|message>, 'price'|'amount')` (50 locals).** Response-row
   reads (aster, binance, bitget, bithumb, blofin, bybit, coinex, cryptocom, digifinex, gate, hibachi, htx,
   kraken, krakenfutures, kucoin, mexc, modetrade, okx, woofipro + kraken `close['price']`, pro/blockchaincom
   `message['price']`): the row value is whatever the venue sent, and the receiver is a row local owned by
   the element-read units (U01/U06). Not claimed; unchanged.
8. **kucoin:4254 (`hasTpOrSlOrder = (this.safeValue (params, 'stopLoss') !== undefined) || …`)** — an inline
   presence check with no local: nothing to type, and converting the call to `safeDict` inside the
   `!== undefined` test would change the flag semantics (see §4). → untouched.

## Residual risk

- **The one behaviour delta of the landed change: a non-dict `params.stopLoss`/`params.takeProfit` is now
  treated as absent.** Today, a scalar/list value still exists at the local and the venue's own code reacts:
  okx createOrder/editOrder, phemex createOrder and bitget createOrder (5813) **throw**
  (`InvalidOrder`/`ArgumentsRequired`, with messages that literally index
  `params["stopLoss"]["triggerPrice"]`), while bitget 5689, hyperliquid and lighter build request fields
  from `undefined` (i.e. also no stop loss on the wire). After the change all five ignore a non-dict value
  silently. Justification: `stopLoss`/`takeProfit` are dict params in the Manual, every consumer in these
  functions is a keyed read, and 11 venues already use `safeDict` for the same params; but a user who passes
  `{ stopLoss: 100 }` loses the explicit error. If the integrator prefers to keep the loud path, the
  alternative is a raw `params['stopLoss'] !== undefined` presence check — rejected here because the printer
  emits `((IDictionary<string,object>)parameters)["stopLoss"]` for an indexed read on an `object` params
  (a *new* cast + an `InvalidCastException` for the very input it is meant to report).
- The 98 `safeValue2/N` locals and 43 of the 59 params-scope locals stay `object` on purpose (proofs above);
  they are not "missing proofs" but boxes the language cannot name.
- The user-input contract is only as good as the docs: nothing verifies at runtime that a *dict* stopLoss has
  `triggerPrice`; that is unchanged by this unit (the venues' own guards cover it).
- `tsc --noEmit` + the farm `buildCS` gate cover types and compilation; the semantic class above is only
  reachable through the id-tests (`npm run id-tests-cs`) with a scalar stopLoss — those fixtures pass dicts.

## Hotspot lines

- **none.** No `build/csharpTranspiler.ts`, no `build/csharp-local-types.js`, no ast-transpiler `src/`, no
  hand-written `cs/ccxt/base/**` file was touched (the `safeDict` return retype already existed).

## Tooling (campaigns/cs90/tools/U12/)

- `ts_sites.py` — the 121 six-key TS sites with their consumers; `classify.py` — per-site flag census
  (`keyed_read` / `self_default` / `str_coerce` / `presence_only`), `--all` mode covers every
  `safeValue[2|N]` site (1034); `use_check.py` — identifier-level use list per converted function;
  `sv2_census.py` / `sv2_dictscan.py` — the 98 `safeValue2/N` C# locals and their dict-shaped consumers;
  `survey.py`, `summary.py` — counts used above.
