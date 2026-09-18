# U52 — ws handler leftovers: `object message` params (S40) + `object client` (S46)

Unit U52 of campaign `cs90`. Base `d847892a6fcf5699640862316303b6344a3e4daf` (PR #30530 head, branch
cs-strict-INT; ast-transpiler pin `404e9daa7f0ab58d085ed04aaa61a19546dfeda2`, unchanged — not an
`[AST]` unit). Worktree `/root/worktrees/cs90/U52`, branch `cs90-U52`.

## Family and result

Census of what S40 (`object message` on ws handlers) and S46 (`object client`) left behind, and the
provable remainder retyped:

* **`object message` (S40 leftovers): 69 handler parameters retyped** from `object <name>` to
  `IDictionary<string, object> <name>` in 14 files (13 `cs/ccxt/exchanges/pro`, 1
  `cs/ccxt/exchanges/prediction`). **No call site is edited** — the diff is declaration-only, so the
  generated tree gains **no conversion at all** (0 casts added, 0 removed).
* **`object client` (S46 leftovers): no provable remainder** — census and proof below (§ "The
  `object client` half"). 0 changes is the result there.

The roster's upper bound was 436 `object message` declarations (my census: 436 in
`pro/`+`prediction/`, the analyzer sees 438 including 2 in `cs/ccxt/ws`); 369 remain `object` after
this unit, each with a recorded reason (§ Rejected sub-cases).

Why the *interface* spelling and not the roster's `Dictionary<string, object>`: at every admitted
call site the argument is **already declared** `IDictionary<string, object>` (or the concrete
`Dictionary<string, object>`, which converts implicitly) — the interface is exactly the box the value
has, so the retype needs no call-site change. The concrete spelling would have to downcast the
interface-typed argument at runtime (`(Dictionary<string, object>)data`), which is the assertion class
S40 rejected for interface-typed arguments in its own report ("asserting the concrete class of an
interface-typed value — rejected (the interface spelling … would take these for free; see residual
risk)"). This unit takes exactly that free route, and additionally keeps the diff cast-free.

## Census (`campaigns/cs90/census.sh`, base → after)

```
base : locals: object=9304 typed=44132 typed%=82 | casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102 | params: object=11635  returns: object=1080
after: locals: object=9304 typed=44132 typed%=82 | casts: byte-identical to base                                                                                                    | params: object=11566  returns: object=1080
helpers: byte-identical to base
```

`params: object` −69; **every other census field is byte-identical** (locals, all nine cast targets,
returns, helpers) — the change cannot move a local, a cast or a helper call.

## Proof (why each of the 69 is legal)

Per (venue, handler), re-derived from the emitted tree by
`campaigns/cs90/tools/U52/admit5.py` and re-checked by `tools/U52/verify_U52.py` (both in this dir):

1. **Call-site-driven (29 handlers / 29 call sites = 26 `ok-decl:I` + 1 `ok-decl:D` + 2 chain)**: every reference of the handler is a
   direct call whose 2nd argument is a **statically dict-typed declaration** in the emitted text —
   `IDictionary<string, object> subscription = this.safeDict (…)` (hyperliquid ×9, pacifica ×6,
   bingx/bydfi/deepcoin/htx/xt), `IDictionary<string, object> data = this.safeDict (pub, "data", …)`
   (myriad ×5), `IDictionary<string, object> rawOrder = this.safeDict (message, "o", message)`
   (aster), `Dictionary<string, object> trade = …` (poloniex `handleMyTrades`). A value of a
   declared interface/class type **is** that type at the call; the interface parameter accepts it
   unchanged, so the emitted line is byte-identical and no runtime conversion is added.
2. **Reflective-only (40 handlers / 102 invoke sites: 7 proven by a dict-typed argument local —
   aster's `IDictionary<string, object> messageInner = this.safeDict (message, "data", message)` —
   and 95 by the dispatch-key rule on 33 handlers)**: the handler's only
   reference is a dispatch-table method group (`{ "ticker", this.handleTicker }`) whose reflective
   invoke `DynamicInvoker.InvokeMethod (method, new object[] { client, message })` is reached only
   when the *method* was selected by a **key read off the message**: `string? k = this.safeString
   (message, "…")` → `object method = (k == null) ? null : this.safeValue (methods, k)` → invoke
   inside `if (method != null)`. `safeString`/`safeStringN` answer `null` for anything that is not a
   dict, so a JSON array / bare string / scalar frame selects no entry and never reaches the handler
   (`ndax`, `upbit`, `modetrade` ×13, `poloniex` ×7, `independentreserve` ×4, `aster` ×5 + the
   `handleBalanceAndPosition → handlePositions` chain, `upbit handleMyOrder → handleOrder` chain).
3. **Body compiles unchanged under the interface parameter** — checked for all 69: no `(T)param` /
   `param as T` conversion the interface cannot make (a `(string)message` would be CS0030), no
   `ref`/`out` sink on the parameter, no reassignment of it (a reassignment is a counter-proof:
   aster `handleOrderUpdate`/`handleBalance`, binance `handleBalance` are rejected for exactly that),
   no `return param;` under a concrete return type, and no base overload that would re-bind for the
   interface receiver (the only dict-typed first-parameter overloads in the hand-written base are
   `GetValue(IDictionary<string,object>, string)` — not called with the parameter in this set — and
   `inOp(Dictionary<string,object>, string)`, which an `IDictionary<string,object>` argument cannot
   bind to).
4. **No hierarchy conflict** — no ancestor or descendant class in the emitted tree declares the same
   handler name (the pro subclass files `bequant : hitbtc`, `gateeu : gate`, … are not in this set),
   so no override can be left with a mismatched parameter type.
5. **Disjoint from S40's `WS_HANDLER_DICT_MESSAGE`** — checked per (venue, handler) in
   `verify_U52.py`; the two passes can never rewrite the same declaration.

## Rules / passes touched — `hotspot: build/csharpTranspiler.ts`

| where | what |
|---|---|
| `build/csharpTranspiler.ts:1339` | `WS_HANDLER_IDICT_MESSAGE: Record<venue, handlerName[]>` — the admitted table (14 venues / 69 handlers), proof rules in the 24-line header comment |
| `build/csharpTranspiler.ts:4916` | `retypeWsHandlerMessagesToInterface (content)` — signature retype only; self-gating on the emitted call sites (`dictTypedInMethod` + the same-file chain), a handler with a call the gate cannot clear stays `object` whole |
| `build/csharpTranspiler.ts:6294` | hook, immediately outside `retypeWsHandlerMessages` in the `createCSharpClass` pass chain |

`hotspot: build/csharpTranspiler.ts` (3 sites, +157/−1 lines). Nothing else: no
`build/csharp-local-types.js`, no hand-written base file, no `cs/tests`, no `ts/src`.

## Counts and gates

* sites typed: **69** (params; declaration-only). casts removed: **0** (0 added).
* `python3 campaigns/cs90/verify-diff.py HEAD` → `files=14 pairs=69 unexpected=69`. All 69 are one
  class — the ws handler parameter retype to the interface spelling — which `verify-diff.py`'s
  `ok_param_retype` does not model (it accepts only `object <name>` → `string?`/`string`; S40's 436
  concrete retypes are the same class and were justified the same way).
* `python3 tools/U52/audit-u52.py HEAD` → `pairs=69 table_entries=69 unexplained=0`; the audit
  accepts only a pair that is *the same declaration* modulo the parameter type and whose
  (file, handler) is in the table, and `--selftest` proves it rejects a renamed parameter, a changed
  receiver, a mutated modifier, an unlisted handler and a body edit (6/6 PASS).
* determinism: full REST (`--force --noTests`), full WS (all 76 pro ids) and full prediction regens
  each reproduce `git diff -- cs/ | sha256sum` = `3bbfc61acd4e690779b64321f5f545e9fdd71dba1b7718fbb10e8b322afd2934`
  unchanged, and no file outside the 14 changes.
* `npx tsc --noEmit -p tsconfig.json` → exit 0.

## Farm

`dotnet` never runs on this VM; the compile gate is the farm (cs target).

* code commit **`6afe203c6f974b8ecca9c496f0b76fc949245832`**: `ccxt-farm build --targets cs --wait` →
  **job 822, exit 0** — `branch_update=unchanged`, `generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`,
  `ccxt-farm log 822 --step buildCS` → `Build succeeded. 0 Warning(s) 0 Error(s)` for ccxt (netstandard
  2.0 + 2.1), cli and tests.
* every report-only tip is gated with the same command (they touch no build input):
  `82c952d36fa1804c65ad9ade9b95c487c5387d6a` → **job 886, exit 0**, `branch_update=unchanged`,
  `generator=404e9daa…`; the delivered tip carries its own job — `ccxt-farm status <tip sha>`
  resolves it. The branch carries only this unit's commits (no farm merge).

## Rejected sub-cases (the 367 declarations that stay `object`)

Reason counts are per declaration×reference, from `admit5.py` (base tree, corrected rules):

| n | reason | example |
|---|---|---|
| 117 | `invoke-arg bad-object-param` | the reflective invoke's argument is the dispatcher's own `object message` and no key-off-the-message selection covers it (bitget `handleTicker` @3091) |
| 103 | `arg bad-object-param` | a direct call with an `object` argument and no *implying* guard (apex `handleErrorMessage` @1125) |
| 71 | `excluded:dispatcher` | the venue's `handleMessage` itself: `Client.cs` hands it `JsonHelper.Deserialize`'s result, which is a JSON string for a bare-string frame and `msgBinary` (a string) for binary frames — the dispatcher must stay `object`; it is also the `handleMessageDelegate` wired at `Exchange.WsBridge.cs:172` and the base virtual at `Exchange.WsBridge.cs:125` |
| 71 | `invoke-arg bad-list` | counter-proof: the message is used as a list at the invoke (`binance.cs:6613` `x is IList<object>` + `getValue(x, 0)` dispatch) |
| 30 | `mg-no-invoke` | a `this.handleX` method group the analysis cannot tie to an invoke (binance `handleFetchOrderBook` @1013, `handleOrderBookSubscription` @867) |
| 26+25 | `arg/invoke-arg bad-decl:object` | the argument is an `object` local that is not a `safeDict` result (alpaca `object data`, polymarket `object eventVar`) |
| 21+17 | `arg bad-list` / `listshape` | the handler *body* uses the message as a list / `getArrayLength` (alpaca `handleCryptoMessage`, apex `handleMyTrades`) |
| 10 | `arg bad-decl:string?` | the argument is a string (derive `handleOrderBookUnSubscription` @431) |
| 9 | `arg bad-decl:List<object>` | the argument is a list (apex @1233) |
| 7 | `arg bad-shape` | the argument is not a bare identifier (bittrade/htx `getValue(messages, i)`) |
| 4 | `reassign` | the parameter is reassigned in the body (aster `handleOrderUpdate` @2025) |
| 3 | `other-ref` | a reference that is neither a call nor a method group (apex `handlePing` @1200, `Client.cs` delegate field) |
| 1 | `arg bad-decl:Int64?` | toobit `handleIncomingPong` gets `pongTimestamp` |

Explicitly rejected sub-cases that a *lax* rule would have admitted (the two corrections this unit
made to the proof rules):

1. **`else if (type == null)` guards are counter-proofs, not proofs.** poloniex `handleOrderRequest`
   is called at `poloniex.cs:1415` inside `else if ((type == null))`; a non-dict frame gives
   `type = this.safeString (message, "type") = null`, i.e. that branch is *exactly* the non-dict case.
   S40's rule (`any if whose condition mentions the key`) accepted it; the implication rule rejects it.
2. **The dispatch-key proof licenses the reflective invoke, not a direct call's own flow.**
   hitbtc `handleOrderRequest`/`handleAuthenticate` (calls at 1519/1523/1532) and xt
   `handleSubscriptionStatus` (@1726) had `ok-invoke-key` verdicts on *direct* call sites; a direct
   call needs the guard/declaration proof for its own site. Rejected (all four are `handleMessage`-
   argument calls without an implying guard).

Left out on purpose (provable but not declaration-only): the corrected guard rule *does* prove two
more handlers — `lighter handleUnSubscription` (guard `getIndexOf (channel, "lit") >= 0` with the
`""` default of `safeString`) and `poloniex handleAuthenticate` (`if (type == "auth")`) — but both
have a direct call whose argument is a bare `object` parameter, so they would need a new
`(IDictionary<string, object>)message` assertion at the call site. This unit holds itself to
declaration-only changes; the integrator can add them with S40's assertion mechanism if wanted
(`verify_U52.py` prints them as `NEEDS-CAST`).

## The `object client` half (S46 leftovers) — census and why 0

Census on this tree:

* `object client` **declarators: 1 tree-wide** — `cs/ccxt/base/Exchange.BaseMethods.cs:7862`
  (`object client = getValue (clients, i);` in the generated `cleanCache`). Every other
  `object client*` hit is a different name (`clientOrderId(s)`, `clientSubscription`,
  `clientPositions`, `clientOid`, `clientAlgoId`).
* `((WebSocketClient)client)` / `(client as WebSocketClient)` **code sites: 10** of 31 occurrences —
  the base-tier `Exchange.BaseMethods.cs:7863` + 9 in `pro/` (onetrading 1155/1163/1433/1443,
  whitebit 1034/1065/1067, cex 161, binance 3652); the other 21 are comment lines (S46's item 3).

Why they stay: the binding is produced by `this.safeValue (this.clients, url)` — the hand-written
`SafeValueN` dispatches on `IDictionary<string, object>` / non-generic `IDictionary` (via
`ConvertToDictionaryOfStringObject`) / list shapes and skips empty strings, so a typed producer would
have to replicate that body and would re-bind *every* `ConcurrentDictionary<string, WebSocketClient>`
receiver in the tree (S46 rejected it for the same reason). `this.client (url)` is not equivalent
(it `GetOrAdd`s, i.e. creates a client on a miss). And typing the `var` local by moving the cast to
the declaration (`WebSocketClient client = (WebSocketClient)this.safeValue (…)`) removes 0 casts and
types no census-counted local (`var` is not `object N = …`), so it is a wash — rejected on doubt
(rule 4). `binance:3651` is `getValue (clients, i)` on a `List<object>` (element read by contract).

## Residual risk

* The interface spelling is enforced at runtime on the **reflective** path (`Delegate.DynamicInvoke`
  coerces the boxed argument): a venue that starts sending a non-dict frame on a channel whose
  dispatch key is still selected would now throw where the `object` box flowed on. The key-off-the-
  message proof is exactly S40's (95 invoke sites on 33 handlers; the other 7 invoke sites pass a
  dict-typed local), and the interface spelling is strictly weaker than S40's concrete
  `Dictionary<string, object>` assertion.
* The 29 call-site-driven retypes add **no** conversion: the argument's static type is a dict type, so
  the retype cannot change the runtime value or an overload pick.
* Volume: 69 sites derived by a re-implementation of S40's analyzer plus a hand read of every
  sub-family; the analyzer itself had parsing bugs that are now fixed (below), so treat the count as
  tool-derived. Spot-check the largest diffs (`modetrade.cs` 13, `hyperliquid.cs` 9, `aster.cs` 8).
* The table is keyed by (venue, handler): a future TS change that adds a call site passing a
  non-dict-typed value keeps the handler `object` (the pass self-gates), but a *cross-file* caller
  would not be re-checked at transpile time (all call sites of the 69 are same-file today —
  verified).
* `myriad.cs` is in the prediction tree (U44's tier); the 5 sites there are ws-handler message
  params (this family), dedupe by line if U44 touches them.

## Findings for the integrator / sibling units

1. **S40's guard rule was polarity-blind, and `ws-msg-admit4.py` cannot express the corrected one.**
   The shipped rule accepts any `if` whose condition mentions the key — `else if (type == null)` is
   reachable for a non-dict frame (poloniex). The corrected rule (implication: every `||` disjunct
   must imply, one `&&` conjunct is enough; `!=` against a literal is *not* a proof) is implemented in
   `tools/U52/admit5.py:implies_dict`. Re-scanned over S40's landed set: 98 of its 132 emitted
   `(Dictionary<string, object>)arg` assertions are covered by the corrected rule; **34 are not**
   (`tools/U52/s40-finding.txt`; shapes: 15 `getIndexOf`-based guards, 10 `inOp`-based, 5 mixed, 4
   other). This is a *review item for the S40 owner*, not a claim that they are wrong: `inOp` on a
   list is `IList<object>.Contains(key)`, so an array frame carrying the key literal can satisfy it,
   and the `getIndexOf` shape is a proof my rule does not model.
2. **`ws-msg-admit4.py` has three parsing bugs** (all fixed in `tools/U52/admit5.py`, all
   *false-reject* direction): the declared type is read with `line.split(' ')[0]`, so
   `Dictionary<string, object> x` reads as `Dictionary<string,` and an `IDictionary` argument is
   reported `bad-decl` (32 of this unit's 33 call-site-driven sites); `params_of` splits the parameter
   list on every comma, so a multi-line signature yields `bad-param:object>` (3 `handleOrderBookMessage`
   declarations); the dispatch-key rule is anchored on `= this.safeValue (…`, which misses the emitted
   ternary form `object method = (k == null) ? null : this.safeValue (methods, k)` (39 sites).
   Any unit reusing that tool should take these fixes.
3. **The `object client` route** (for whoever owns the base tier): a
   `ConcurrentDictionary<string, WebSocketClient>`-keyed typed `safeValue` overload would retire the
   10 remaining cast sites — it needs a proof that its body matches `SafeValueN`'s non-generic
   `IDictionary` path, which is why this unit did not write one.

## Re-running

```
bash  /root/.hermes/profiles/deepseek/campaigns/cs90/census.sh                    # census
python3 campaigns/cs90/tools/U52/admit5.py  /root/worktrees/cs90/U52 --summary    # verdicts (post-U52: 0 admitted of 369)
git -C /root/worktrees/cs90/U52 archive <base> cs | tar -x -C /tmp/base-tree      # base tree for the full 438-decl run
python3 campaigns/cs90/tools/U52/verify_U52.py /root/worktrees/cs90/U52 [admit.json]   # the 5 claim checks
python3 campaigns/cs90/tools/U52/audit-u52.py HEAD [--selftest]                   # pair audit
python3 campaigns/cs90/verify-diff.py HEAD                                        # campaign gate
```

Artifacts in `campaigns/cs90/tools/U52/`: `admit5.py` (fixed analyzer + `if_blocks_raw` + `implies_dict`),
`admit5-base3.json` (the base-tree verdicts for all 438 declarations), `admitted-list.txt`,
`verify_U52.py`, `audit-u52.py`, `leftover-detail.py` (the unpatched copy used for the diff of the two
rule sets), `table.ts` (the table source), `s40-finding.txt` (the 34-site review list).
