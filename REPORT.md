# cs90 U54 — `getArrayLength(x)` → the receiver's own `Count`/`Length` (printer, type-hook gated)

[AST] unit. ccxt worktree `/root/worktrees/cs90/U54` (branch `cs90-U54`), paired ast worktree
`/root/worktrees/cs90-ast/U54` (branch `cs90-U54`, base `404e9daa`).

- **ast branch/sha**: `cs90-U54` = `003c49891a2b183f3a55d2ee99e17a2ac54d91a3` (in
  `/root/ast-transpiler`; pushed with `ccxt-farm push-generator`, farm reports `present`)
- **ccxt code commit**: `8a31ca070409e6c30facd507c4e29437b689b434` (`package.json` pin →
  `003c49891a2b183f3a55d2ee99e17a2ac54d91a3`); the branch tip is that commit + this report, whose
  generated tree is byte-identical to it (`git diff 8a31ca070409e6c30facd507c4e29437b689b434 HEAD -- cs/`
  is empty).
- **farm**: job `876` on the code commit (`exit=0`, `branch_update=unchanged`,
  `generator=003c49891a2b183f3a55d2ee99e17a2ac54d91a3`) and job `888` on the tip that carries this
  report (`exit=0`, `branch_update=unchanged`, same generator, tree identical to the code commit);
  `buildCS` = **Build succeeded, 0 Warning(s), 0 Error(s)** for both.

## Family

`x.length` prints `getArrayLength(x)`. When the declaration the printer emits for `x` already
carries a C# collection / string type, the receiver's own member IS the measurement the helper
makes (`(x?.Count ?? 0)` is exactly its `null → 0` branch, and the receiver is read once), so the
helper call is replaced by that member read at print time. Any receiver whose printed type the
printer cannot name keeps `getArrayLength` **byte for byte**.

`hotspot: /root/ast-transpiler src/csharpTranspiler.ts` — `csharpCountMemberOf`,
`csharpDeclaredLengthExpression`, `csharpLengthReceiverType` (new hook, default `undefined`),
`csharpNativeLengthExpression` (restructured: the pre-existing checker-Array arm is unchanged, the
new arm is its fall-through), `CSHARP_COUNT_TYPES`, `CSHARP_LENGTH_CAST`.
`hotspot: build/csharp-local-types.js` — `lengthReceiverType` / `printedLocalType` /
`installCsharpNativeLengths`, wired into `installCsharpLocalTypes` (no new file under `build/`).

## Audit (the roster's first ask): who converts a typed-list receiver today?

`campaigns/cs90/tools/U54/gaplen.py` re-implements the ccxt post-print pass
`nativeListHelperCalls` (build/csharpTranspiler.ts, S15) method-scoped receiver scan over every
`getArrayLength(X)` site of `cs/ccxt/exchanges/**`:

- sites found: **681** (704 helper occurrences in the tier, 23 have a non-identifier receiver)
- receivers that are a **single list-typed declaration in the same method**: **0** — the post-print
  pass already converts every one of them (measured: REST 586 → 300 with the pass disabled, i.e.
  286 sites in REST alone; pro 325 + prediction 102 are in the same state)
- receivers left: 669 `object`, 3 `ccxt.pro.ArrayCache`, 2 `string`, 1 `IDictionary<string, object>`,
  1 `var`, 5 multi-declaration names, 23 non-identifier receivers.

So the printer-side arm can only add sites the post-pass's **text** scan cannot see: a receiver that
is not a bare identifier in a scanned method (a printed cast), and the tiers the pass is not applied
to at all (the generated tests are transpiled by-content and never reach it). The ccxt hook therefore
answers **only** where the pass does not fire, which is what keeps the scanned tiers byte-identical.

## Census (`campaigns/cs90/census.sh`, cs/ccxt/exchanges/**)

```
before (base d847892a6)   locals: object=9304 typed=44132 typed%=82
                          helpers: isTrue=1434 isEqual=12034 getValue=6761 add=8833 getArrayLength=704
after  (8a31ca0704)       locals: object=9304 typed=44132 typed%=82
                          helpers: isTrue=1434 isEqual=12034 getValue=6761 add=8833 getArrayLength=698
```

`casts_removed = 0`, `typed_declarations = 0` (this unit removes helper calls, it does not retype a
declaration). Helper sites converted: **31** — 6 in the census scope + 25 in the generated tests tier:

- census scope: `pro/extended.cs` `((IList<object>)(rawOrders))`, `pro/p2b.cs` `((IList<object>)(trades))`,
  `pro/paradex.cs` `((IList<object>)(inserts))`, `prediction/polymarket.cs` ×3
  `((IList<object>)(parsedOutcomes|parsedTokenIds|parsedPrices))` — the printer printed the cast
  itself, so the cast target names the static type and no hook is needed
  (`(((IList<object>)(x))?.Count ?? 0)`, the cast is evaluated exactly as before).
- generated tests (`cs/tests/Generated/**`, 12 files): `test.afterConstructor`, `test.networkMethods`,
  `test.setMarketsFromExchange`, `test.toArray`, `Base/Ws/test.orderBook`, `Exchange/Base/test.balance`,
  `Exchange/Base/test.market`, `Exchange/Base/test.sharedMethods`, `Exchange/Ws/test.watchTradesForSymbols`,
  `Exchange/test.loadMarkets`, `Exchange/test.proxies`, `TestMethods.cs`.

Everything else in `cs/` is byte-identical: REST ids (104) + pro ids (76) + prediction ids (7) +
`--tests` regenerated locally against the new pin, and the farm's own `transpileCS` step reports
`branch_update=unchanged` for the whole tree.

## Gates

`python3 campaigns/cs90/verify-diff.py HEAD` → `files=16 pairs=31 unexpected=31`. The shared gate
models declaration/return/signature/cast pairs only; a helper call replaced inside a statement is
UNEXPECTED for every pair by construction. Justification: `campaigns/cs90/tools/U54/pair-audit.py`
re-derives each plus line from its minus line — `pairs=31 substitutions=32 bad=0` — requiring
(a) the substitution `getArrayLength(ARG)` → `(ARG?.Count ?? 0)` (a non-identifier ARG is
parenthesised, the cast form is `((ARG)?.Count ?? 0)`), (b) at least one occurrence per changed line
and any *unchanged* occurrence left exactly as it was, and (c) the substituted receiver's own printed
declaration in the enclosing method to carry a `List<…>/IList<…>/Dictionary<…>/string` type (or the
printed cast to name one). `--selftest` proves it rejects a mutated member, a foreign receiver, added
text, an extra paren, an aliased double substitution, the un-parenthesised cast form and an
unbalanced call.

ast side: `npx jest tests/csharpTranspiler.test.ts` → **123 passed** (7 new: no hook → unchanged
`getArrayLength`; `List<object>`/`List<string>`/`Dictionary<string, object>`/`string?` → the member;
`double`/`Int64`/`object` → helper kept; a printed cast with no hook → `Count`).

## Rejected sub-cases (with the reason)

- **Typed params** (`IList<object> symbols`, …): the printer prints `object <name>` for a parameter —
  the parameter retype is a *post-print* pass (`retypeSignatureArgs`/`typeCoreArgs`), so at print time
  no type exists to gate on. The post-pass reads the retyped signature and converts those sites;
  census: 0 residual `getArrayLength(<typed param>)` sites in the exchange tree.
- **`this.<field>` receivers** (`this.accounts` ×4, `this.orders` ×1): the base property is
  `public object accounts { get; set; } = new dict();` (`Exchange.Options.cs`) and venues store either
  a list or a dict in it — no single member names the value, and the printer's `CSHARP_NATIVE_FIELDS`
  table has no entry for it. Rejected rather than cast.
- **`(storedOrderBook as ccxt.pro.OrderBook).cache` ×5 and `(orderbook as ccxt.pro.OrderBook)` ×2**:
  the receiver is a field of a hand-written class (`ccxt.pro.OrderBook`); naming it needs a
  member-type table this unit does not own.
- **`getArrayLength(<call>)` ×4** (`getValue(this.options, "crossMarginPairsData")`, `getValue(response, "error")` ×2,
  `getValue(getValue(this.urls, "api"), …)`): the receiver is an element read, `object` by contract.
- **Multi-declaration receivers ×5** (`List<object>|object`): only `prediction/myriad.cs`
  (`IList<object> grouped`) has a *list* binding at the read; the other four (`binance` `balances`,
  `bithumb` `response`, `htx` `balances`, `pro/bybit` `data`) read an `object` declaration in the same
  scope. Typing the myriad site needs a symbol-level binding proof (the hook's `resolveReference`
  answers only for a single binding) — left to a unit that owns that proof.
- **`ccxt.pro.ArrayCache` receivers ×3**: the pass's list prefix test does not cover them and this
  unit's member map (`List</IList</Dictionary</IDictionary</ConcurrentDictionary<`) does not either;
  `BaseCache : SlimConcurrentList<object>` needs its own proof.
- **`string` receivers ×2** (`gemini`, `nado`): the helper's string branch is `((string)value).Length`;
  `?.Length ?? 0` is equivalent, but both sites are in scanned tiers whose emission must stay
  byte-identical, so they are the post-pass's to convert (it does not, today) — documented, not taken.
- **Reusing the shared `csharpLocalTypeOf` hook**: it already answers the shapes the post-pass
  rewrites (`csharpReceiverIsDeclaredList`, the element-access gate), so gating this arm on it would
  re-spell ~700 already-converted sites (`x.Count` → `(x?.Count ?? 0)`). The family therefore uses its
  own hook (`csharpLengthReceiverType`), same contract: default `undefined`, untyped emission
  byte-identical.

## Residual risk

- The hook answers the type the *printed* declaration carries (printer's own answer, else the
  classifier's rewrite when the printer printed the `object` token). A wrong answer cannot pass
  silently: the member read does not compile on a receiver of another type — the farm `buildCS` gate
  (0 warnings) is the proof for all 31 sites.
- `(x?.Count ?? 0)` is parenthesised, so it cannot re-associate inside a larger expression (the
  post-pass's own `x?.Count ?? 0` spelling is only ever emitted in argument/statement position today —
  measured: all 405 occurrences are followed by `,` `)` or `;`).
- The generated tests tier is regenerated by `--tests`; if a later unit's printer change is merged
  without re-running that stage, these 25 sites keep the new spelling (deterministic for the same
  printer) — `git diff <built-sha> HEAD -- cs/` stays empty for this report commit.
