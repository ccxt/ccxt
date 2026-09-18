# U40 — `object x = this.omit(...)`: IDictionary<string, object> receiver overloads

family: **`object <local> = this.omit(<receiver>, keys)` declarations** in the generated tree.
base `d847892a6fcf5699640862316303b6344a3e4daf` · branch `cs90-U40` · code commit
`90217654a554a12fa36a5dbc713e8f87b9a06f94` · **2 declarations typed, 0 casts removed**.

## What changed

1. `cs/ccxt/base/Exchange.Functions.cs` (hand-written base, **hotspot**): two overloads beside the
   existing Dictionary pair —

   ```csharp
   public Dictionary<string, object> omit(IDictionary<string, object> a, string key)
   public Dictionary<string, object> omit(IDictionary<string, object> a, object k)
   ```

   Both forward into the same object path (`(dict)omit((object)a, k)`), so the runtime value is the
   same fresh `outDict` the `object` overload already builds. The `IList<object>` pass-through of
   `omit(object, object)` is unreachable for them: a value whose C# static type is
   `IDictionary<string, object>` implements that interface, and **no type in `cs/` implements both
   `IDictionary<string, object>` and `IList<object>`** (census: the only `IList<object>` implementors
   are `IOrderBookSide` / `OrderBookSide : SlimConcurrentList<object>, IOrderBookSide`; the
   IDictionary ones are `Dictionary`, `CustomConcurrentDictionary`/`ConcurrentDictionary`,
   `IOrderBook`/`OrderBook`).
2. `build/csharp-local-types.js` — `omitReceiverIsDictionary` now accepts `IDictionary<string, object>`
   receivers on its Identifier **and** CallExpression arms (previously the concrete Dictionary only);
   the family note in the header and the `omitDictionaryProducer` comment were updated. No new table,
   no new pass, no `build/csharpTranspiler.ts` change, no ast-transpiler change (not an `[AST]` unit).

Sites typed (regenerated):

```
cs/ccxt/exchanges/bithumb.cs:1287   object tickers = this.omit(data, "date");                        -> Dictionary<string, object>
cs/ccxt/exchanges/bitteam.cs:2312   object balanceByCurrencies = this.omit(result, new List<object>() {...});  -> Dictionary<string, object>
```

Both receivers are `IDictionary<string, object>` locals (`this.safeDict(...)` / `((IDictionary<string, object>)this.safeValue(...))`),
so the call now binds the new interface overload and its own C# type IS the declaration — no cast.

## Receiver census (129 family sites on the base tree, `cs/ccxt/exchanges/**`)

| # | receiver | resolution | reason |
|---|---|---|---|
| 119 | `parameters` (object param) | REJECT | object receiver keeps `omit(object, object)`; its `IList<object>` pass-through is reachable (batch-order bodies flow `fetch2 -> handleOptionAndParams -> omit`, see PR #30356) |
| 2 | `data` (bithumb), `result` (bitteam) | **TYPED** | `IDictionary<string, object>` locals |
| 2 | `this.urls` (binance:4611, bybit:2262) | REJECT | member is `public object urls` (Exchange.Options.cs:86) — no interface conversion; a member read is also outside the local-receiver proofs |
| 2 | `query` (okx:6015, okx:6171) | REJECT | `object query = null` (okx:5964/6171) — null-init later-write join, owned by lower units (U13–U18/U26) |
| 1 | `response` (coinone:609, `parseBalance(object response)`) | REJECT | object param |
| 1 | `account` (htx:9703) | REJECT | `object account = null` (htx:9695) — null-init join |
| 1 | `rest` (limitless:321) | REJECT | `object rest = this.omit(parameters, ...)` (limitless:309) — receiver is itself an object-receiver omit result |
| 1 | `request` (pro/gate:437) | REJECT | `var request = ((IList<object>)tmp)[0]` — element read, C# static type `object` |

Outside the exchanges tree the same family has 3 more sites, all rejected:
`Exchange.BaseMethods.cs:997/1023` (`this.omit(this.urls, "apiBackup")`, object member) and
`:2302` (`safeBalance(object balance)` — object param). A further write-shaped site,
`Exchange.BaseMethods.cs:1651 featuresObj = this.omit(featuresObj, "extends")`, is rejected because
the declaration (`object featuresObj = <ternary of getValue calls>`) is object. Already-typed
declarations from the pre-existing Dictionary rule (unchanged, 3 sites):
`prediction/limitless.cs:3414`, `prediction/hyperliquid.cs:646`.

## Overload-resolution proof (no ambiguity for object args)

Model of the six overloads (`O1 object+params`, `O2 object,object`, `O3/O4` Dictionary, `O5/O6`
IDictionary) applied to every one of the **1185 `omit(` call sites in `cs/`** (excluding
`cs/static/`), tool `campaigns/cs90/tools/U40/overload-ambiguity-census.py` (`--selftest` proves it
flags the incomparable-candidate class and keeps `object` receivers on O2):

```
winners: {'O2': 1175, 'O1': 6, 'O3': 1, 'O4': 1, 'O5': 1, 'O6': 1}
object-receiver winners (unchanged by U40): {'O2': 1175, 'O1': 6}
AMBIGUOUS sites: 0
```

- an `object` argument still binds `omit(object, object)` (normal form) over the expanded
  `params object[]` form — identical to the pre-U40 resolution; the new overloads are not applicable
  to it (no implicit conversion `object -> IDictionary`);
- the only sites whose binding moves are the 2 IDictionary ones; the 2 Dictionary sites keep O3/O4
  (identity beats the interface conversion);
- `string` keys prefer the `(…, string)` overload (identity beats boxing), list keys the
  `(…, object)` one; 1/3+-argument calls still take O1.

Compile-level proof: the farm builds the whole sln (ccxt + tests + cli) with
`TreatWarningsAsErrors`; any ambiguity would be CS0121/CS0266.

## Gates

- **BASELINE FIRST**: scoped regen on the untouched base (`binance bybit okx kraken gate`) left
  `git diff --stat -- cs/` empty.
- Scoped regen coverage: 87 REST + 37 `--ws` + 7 `--prediction` ids = every `ts/src` file containing
  `this.omit` except `base/Exchange.ts` / `base/PredictionExchange.ts`, which the same runs
  regenerate as `Exchange.BaseMethods.cs` / `PredictionExchange.cs` (both byte-unchanged).
  `--tests` regen: `cs/tests/` byte-identical.
- Determinism: `git diff -- cs/ | sha256sum` = `e3b3034ab4d243b8` before and after re-running the
  scoped regen (fixed point).
- `verify-diff.py d847892a6`: `files=3 pairs=2 unexpected=16`. The 2 pairs are the two declaration
  retypes; **all 16 UNEXPECTED lines are the one `-0/+15` block in `cs/ccxt/base/Exchange.Functions.cs`**
  (the hand-written overloads + comment) — no generated line is unexplained.
- Census before: `locals: object=9304 typed=44132 typed%=82` (casts/params/helpers identical to the
  campaign base) · after: `locals: object=9302 typed=44134 typed%=82`, casts unchanged.
- Farm: **job 801, HEAD 90217654a554a12fa36a5dbc713e8f87b9a06f94, exit=0**,
  `branch_update=unchanged`, `generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`,
  `Build succeeded. 0 Warning(s) 0 Error(s)` (buildCS step). This commit's build inputs are
  byte-identical to that sha (REPORT.md is not a build input); the tip is re-gated the same way and
  its job is keyed by the tip sha (`ccxt-farm status <tip sha>`).

## Rejected sub-cases (all with reason)

1. `parameters` (119 sites) — object param, pass-through reachable. **This is the bulk of the roster's
   133 and is a genuine reject, not a miss.**
2. `this.urls` (2 + 2 base sites) — the member is declared `object`; also not a local.
3. okx `query` / htx `account` — receiver declared by the null-init later-write join, a **lower
   unit's** family (U13–U18/U26). Interaction for the integrator: the moment such a receiver is typed
   Dictionary/IDictionary by its own unit, the omit declaration at these sites types with it — no
   further change here.
4. coinone `response`, base `safeBalance(balance)` — object params.
5. limitless `rest`, pro/gate `request` — receivers are themselves object-typed producers.
6. `Exchange.BaseMethods.cs:1651 featuresObj` — write site on an object-declared local.
7. **IDictionary-running-type self-omit accumulator** (`hyperliquid` `orderParams`,
   ts/src/hyperliquid.ts:2382 -> cs/ccxt/exchanges/hyperliquid.cs:2601): the declaration is held
   `object` because `typeFromValueOrWrites`'s self-omit arm requires
   `type === 'Dictionary<string, object>'`. Probe (`tools/U40/blocker-probe.mjs`): initializer type
   `IDictionary<string, object>`, write `orderParams = this.omit(orderParams, [...])` type
   `undefined`, verdict `undefined`. The new overloads make that write provably a Dictionary value,
   but the *declaration* (`object x = this.safeDict(...)`) belongs to the safeDict-declaration family
   (U36, lower unit) — left untouched to keep ownership disjoint.
8. `paradex request` (ts/src/paradex.ts:1928): initializer `this.createOrderRequest(...)` is
   Dictionary, but the second write `request = await this.signOrderRequest(request, true)` is
   unprovable — the omit write is not the blocker. Reject.

## Bridge mirrors

Checked: `omit` has **no bridge twin** — `cs/tests/BaseTest.Bridge.cs` and
`examples/cs/examples/Examples.Bridge.cs` contain no `omit`, and there is no static `omit` in
`Exchange.TranspileHelpers.cs`. The only call sites outside `cs/ccxt` are
`cs/tests/Generated/Base/test.omit.cs` (`exchange.omit(Dictionary, string|List)` -> O3/O4, unchanged)
and `cs/tests/Generated/Exchange/Base/test.market.cs:120` (`format` is declared `object` -> O2,
unchanged). Nothing to mirror.

## Residual risk

- The `(dict)` cast in the new overloads is the only new failure mode: it would throw where the
  untyped box flowed on **iff** an `IDictionary<string, object>`-typed receiver were also an
  `IList<object>` at runtime. No such type exists in the tree (census above); the 2 sites' boxes are
  `safeDict` results (JSON dicts or the `Dictionary` default). The pre-existing Dictionary overloads
  rest on the same assumption.
- Overload resolution is proved by (a) the spec-level reasoning, (b) the 1185-site model with a
  self-tested ambiguity detector, (c) the whole-sln farm compile at 0 warnings. Behaviour is
  unchanged because the new overloads forward into the untouched object path.
- The receiver census uses a region scan whose signature regex also matches `for (`; cross-checked
  with a file-wide, over-inclusive name->type map — it surfaced no additional IDictionary/Dictionary
  receiver inside the family (its extra hits are name collisions across methods or write sites).
- Runtime test lanes (`id-tests-cs`, `request-cs`, `response-cs`) were **not** run: the change adds
  overloads that forward into the unchanged object path, the emitted bodies are identical modulo the
  two declaration type names, and the compile gate covers the whole sln including `cs/tests`.

hotspot: `cs/ccxt/base/Exchange.Functions.cs` (hand-written base, +15 lines — the two
`omit(IDictionary<string, object>, …)` overloads and their comment).
