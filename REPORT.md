# U47 — `((string)x)` casts: census by target-expression family, identity casts removed

- worktree `/root/worktrees/cs90/U47`, branch `cs90-U47`, base `d847892a6fcf5699640862316303b6344a3e4daf`
  (PR ccxt/ccxt#30530 head, ast-transpiler pin `404e9daa7f0ab58d085ed04aaa61a19546dfeda2`).
- **781 `((string)…)` casts removed, 0 declarations retyped** (this unit's axis is casts, not locals),
  136 generated files, +732/-732 lines. No `[AST]` change: the pass lives in `build/csharpTranspiler.ts`.
- Rules: one new post-print pass `dropIdentityStringCasts` (outermost in the four existing chains:
  exchange/ws/prediction venue files, `Exchange.BaseMethods.cs`, `Exchange.TradingMethods.cs`,
  `PredictionExchange.cs`) plus the two proof tables `STRING_PRODUCER_HELPERS`, `STRING_PRODUCER_FIELDS`.

## Why the removal is identity-preserving (the proof the whole unit rests on)

`((string)X)` is a C# *identity conversion* whenever X's static type already is `string`/`string?`:
for a reference type the nullable annotation is not part of the type (or of any signature, so
overload resolution cannot move), `(string)null` is `null` (no `InvalidCastException` — that needs a
non-null non-string), and nothing unboxes. The pass therefore only fires on operands whose **emitted**
type is provably `string`:

1. **string literal** — `"…"`/`@"…"`/`$"…"` is `string` by definition. The printer wraps literal
   *arguments* (`Remove((string)"k")`, `Replace((string)"%", (string)"")`) and spaced
   constructor arguments (`throw new BadResponse ((string)"…")`).
2. **nested cast** — `(string)X` / `((string)X)` already yields a `string` (this is how
   `((string)((string)value))` collapses to `((string)value)`; the *inner* cast still unboxes, so
   only the outer is taken unless the inner operand is proven too).
3. **`this.<m>(…)` whose declared C# return type is `string`/`string?`** — read off the processed
   content's own `public … <m>(` declarations (per-venue override authority; a name declared twice
   with two types is vetoed as `*`), falling back to the hand-written/base table below only when the
   content does not declare the name at all.
4. **bare identifier declared `string`/`string?` in the same method region** (parameter, local or
   `foreach` binding) — S09's region scan (`isCsharpMethodSignature` delimited, comment lines
   excluded, blocked-wins per name) extended from its five target names to *every* name, plus S09's
   `foreach|catch|for|using|fixed` veto and two lambda-parameter vetoes (`x =>`, `(a, x) =>`).

Both printed shapes are handled; the deletion never moves the box:

| shape | example | deletion |
|---|---|---|
| wrapper (expression position) | `string s = ((string)this.safeString(o, "id"));` | `((string)` + its matching `)` (only when `matchingParen(at) == term`) |
| call paren + printer's single cast | `Remove((string)"k")`, `new X ((string)m)`, `sum(((string)code))` | the 8-char cast token `(string)` only — deleting the pair would eat the call's paren |

Which shape applies is decided from the text: a word character immediately before the `(` is a
callee (`Remove(`); a non-keyword word before whitespace is a spaced callee (`new BadResponse (`); a
`)`/`]` is resolved by the group it closes (an expression group such as `[(string)((string)code)]` is
the cast's own paren, a call/indexer group is a call's paren); otherwise (`=`, `,`, `{`, `return`,
`throw`, `new`, `await`, `?:`, …) the `(` groups the cast. This is the trap that made a first version
emit `throw new BadResponse "…" ;` — the previous-*character* test alone is not enough, the
previous-*word* must be consulted.

Removals are applied line-wise to a fixpoint (max 6 rounds: a removal can expose the next wrapper),
non-overlapping removals are applied right-to-left so offsets stay valid, and the `mask` of
`maskCsharpLiterals` + `csharpCommentIndex` guarantee a `((string)` inside a literal or a `//`
comment can neither match nor shift the paren depth.

## Proof tables (each entry names its declaration on the tree)

`STRING_PRODUCER_HELPERS` (`build/csharpTranspiler.ts:1222`), all verified on the emitted tree:

```
safeString          cs/ccxt/base/Exchange.SafeMethods.cs:129  string?
safeString2         cs/ccxt/base/Exchange.SafeMethods.cs:131  string?
safeStringUpper     cs/ccxt/base/Exchange.SafeMethods.cs:139  string?
safeStringLower     cs/ccxt/base/Exchange.SafeMethods.cs:157  string?
safeStringLower2    cs/ccxt/base/Exchange.SafeMethods.cs:163  string?
safeCurrencyCode    cs/ccxt/base/Exchange.BaseMethods.cs:5916 string?
amountToPrecision   cs/ccxt/base/Exchange.BaseMethods.cs:5718 string?
findTimeframe       cs/ccxt/base/Exchange.BaseMethods.cs:630  string?
json                cs/ccxt/base/Exchange.Functions.cs:325    string
ethGetAddressFromPrivateKey cs/ccxt/base/Exchange.ETH.cs:322  string
numberToString      cs/ccxt/base/Exchange.Number.cs:427       string
intToBase16         cs/ccxt/base/Exchange.Encode.cs:265       string
urlencode           cs/ccxt/base/Exchange.Encode.cs:364       string
```

`STRING_PRODUCER_FIELDS` (`:1241`) — the `public string <name> { get; set; }` block of
`cs/ccxt/base/Exchange.Options.cs` (partial class `BaseExchange`, lines 89-96): `secret apiKey
password uid accountId login privateKey walletAddress twofa` (all 9, only 5 occur in the census;
`token` in the same block is `public object` and is deliberately absent). No venue declares a twin
(census `grep`), and every tier derives from `BaseExchange`.

## Census (before → after), `campaigns/cs90/census.sh`

```
before  locals: object=9304 typed=44132 typed%=82
after   locals: object=9304 typed=44132 typed%=82      (no declaration retypes in this unit)

before  casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
after   casts: (string)=1332 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102

params/returns/helpers rows: byte-identical (object params=11635, object returns=1080,
isTrue=1434 isEqual=12034 getValue=6761 add=8833 getArrayLength=704).
(string) per tier: rest 985→507, pro 1007→761, prediction 121→64.
```

781 removals = 702 sites the independent census already called IDENTITY + 79 sites it left UNKNOWN
but the pass proves by an explicit rule (59 nested-cast sites + 20 `this.<field>` reads).
Family breakdown (`tools/U47/familydiff.py`, base census minus residual census):

```
 104 ARG literal            62 WRAP call:safeString      61 WRAP ident:status    60 WRAP ident:type
  57 WRAP nested cast       45 WRAP ident:code          24+20 ident:symbol       24 WRAP ident:outcome
  15 WRAP ident:channel     10 WRAP ident:topic         10 WRAP ident:toCurrencyId
   9 WRAP ident:fromCurrencyId  8 WRAP member:this.secret   8 ARG ident:id
   7 ARG ident:messageHash   7 WRAP ident:amountString    7 WRAP ident:account    7 WRAP literal
   7 WRAP ident:timeInForce  6 WRAP call:parseUnits       6 WRAP ident:url
   5 WRAP call:safeCurrencyCode / ident:name / ident:address / member:this.walletAddress
   5 WRAP ident:unifiedTimeframe / call:safeStringLower  … long tail of one-and-two-site names
```

## Gates

- `verify-diff.py HEAD` → `files=136 pairs=732 unexpected=667`. **All 667 are one declared class**:
  `verify-diff.py` models only a cast that heads a declaration/return statement, so every cast removed
  *inside* an expression (`getValue(market, ((string)key))`, `((string)status).Split(…)`) is
  UNEXPECTED there. Its own rules accept the 65 declaration-anchored ones.
- `tools/U47/pairaudit.py HEAD` (the dedicated pair audit for this class) → **`pairs=732
  unexpected=0`**. It accepts a line pair only when `+` is `-` with `(string)`/`((string)X)` tokens
  deleted only (bounded successive-edit search), paren balance equal, no other character touched, and
  it carries a `--selftest` that proves it flags the collapse class
  (`Remove((string)key)` → `Removekey)`), a mutated operand, a renamed target and added text.
- `tools/U47/famcensus.py` re-derivation over the regenerated tree → **1 residual provable-identity
  site** (`cs/ccxt/exchanges/bitmex.cs:3524`, operand `response.Replace(…)` — a member-access operand;
  member chains are deliberately out of the pass's proof set, so the cast stays). 0 sites where the
  pass removed a cast the census called NOT (unbox).
- Determinism: the three scoped regens and a full `--force` REST and a full `--force --ws` regen leave
  `cs/` byte-identical (`git diff -- cs/ | sha256sum` = `20fc07e01ab5b9bab987d5a3b7c85ad5210730aba43e9c7d848d59679fe54d66`
  across all runs) — the tree is a fixed point. `examples/cs` has 0 casts; the generated test tree
  (158 casts) is produced by a chain that never carried S09/S10 either, so it is untouched.
- Farm: `HEAD <code-sha> job=<id> exit=<ec>` — see the farm section below.

## Rejected sub-cases (with reason, from the residual census)

1. `((string)getValue(x, i|"k"))` **551 sites — rejected**. `getValue(object, object)` is
   `public object` (`cs/ccxt/base/Exchange.TranspileHelpers.cs:895`) so the cast is an **unbox**;
   dropping it changes a type-check into nothing. Retyping the producer is the A-family's axis
   (U01/U02/U05/U07), not a cast removal. Same for `((string)GetValue(dict, "k"))` **252 sites**
   (`:899`/`:913`, both `object`).
2. `((string)this.requestId())` **30 sites — rejected**: `public virtual object requestId()` in
   bttrade.cs:44 / okx.cs:2476 (venue-local, so the same-file rule is authoritative and says `object`).
3. `this.convertTypeToAccount` (4), `this.remove0xPrefix` (2), `this.handleOption` (1) — same shape
   (`Exchange.BaseMethods.cs:6550`, `Exchange.Encode.cs:43` return `object`);
   `EXCHANGE`-side roster text claiming `remove0xPrefix` is `string` is wrong on this tree.
4. **522 operand-`object` sites** — the operand is declared `object`/`var`/another type in its own
   method region (e.g. the *base virtual* implementations in `Exchange.BaseMethods.cs`, where
   `cleanUnsubscription(WebSocketClient, object subHash, …)` keeps `((string)subHash)` while the typed
   per-venue overrides lose it). Dropping these would delete a real unbox → kept.
5. `((string)add(...))`, `((string)slice(...))` — overloaded/bare helpers whose binding depends on the
   arguments (`add(string,string)` vs `add(object,object)`) → no text-level proof, kept.
6. Member-access operands (`((string)response.Replace(…)`, `this.<prop>.<prop>`) — out of the proof
   set on purpose; 1 site remains. Extending to "string-returning member calls" is a different family
   (`String.Replace/Trim/…` return `string`) and belongs to whoever owns the receiver-cast rules.
7. `((string)key)` where `key` is a *dictionary key* name (not a declaration) — no declaration in the
   region → kept (the pass never guesses).

## Residual risk

- **Text-level proofs are per method region.** The pass reads the same text the compiler sees, and the
  region delimiters are S09's proven ones, but a *false* "declared `string`" verdict would delete a
  real unbox. Guarded three ways: blocked-wins per name (any other declaration of the name vetoes it),
  fixed-point determinism, and the independent re-derivation census above (0 unexplained removals,
  1 conservative leftover).
- **No `ref`/`out` sink can be hit**: the pass only deletes a cast token around an expression whose
  static type is unchanged, and no `(string)` cast in the tree sits in a `ref`/`out` position (census).
- **Overload resolution cannot move**: `string` and `string?` are the same type for binding; only
  nullable-flow warnings differ, and `CS8600/8601/8602/8604/8625` are in `cs/ccxt/ccxt.csproj`'s
  `NoWarn` under `TreatWarningsAsErrors` (the farm gate is the authority).
- The 65 declaration-anchored removals go through `verify-diff.py`'s own rule; the 667 inline ones rely
  on `pairaudit.py`, whose selftest proves it rejects the paren-collapse class. A reviewer who wants a
  second opinion can re-run both tools plus `famcensus.py` (all in `campaigns/cs90/tools/U47/`).
- Not covered by this unit: the `((IList<object>)…)` / `((IDictionary<string,object>)…)` / `((Int64)…)`
  families (U48/U49) and the getValue/GetValue unboxes (A-family).

## Hotspots (`build/csharpTranspiler.ts`, +289/-4)

```
1222  const STRING_PRODUCER_HELPERS  (hand-written/base producer table, proof comments)
1241  const STRING_PRODUCER_FIELDS   (Exchange.Options.cs string property block)
4346  dropIdentityStringCasts        (region scan + per-line driver)
4443  dropIdentityStringCastsOnLine  (fixpoint, non-overlapping removals right-to-left)
4483  matchingParenBackwards         (which group a `)`/`]` closes -> shape decision)
4503  identityStringCastRemoval      (operand extent, shape, deletion ranges)
4559  identityStringOperand          (literal / nested / this.<m>( / this.<field> / identifier)
6021, 6029, 6077, 6423             the four chain wraps (base methods, trading, prediction base,
                                   and the venue-file chain used by REST + ws + prediction)
```

No `build/csharp-local-types.js` change, no `cs/ccxt/base/*` hand-written change, no `ts/src` change,
no `[AST]` change (ast pin untouched).

## Tooling (campaigns/cs90/tools/U47/, no files added under build/)

- `famcensus.py` — census of every `((string)X)` by (operand family, shape, verdict) with a
  method-region type resolver; `--sites` dumps the site list.
- `familydiff.py` — removals per family (base census minus residual census).
- `pairaudit.py` — a line pair is legal only as a `(string)`/`((string)X)` deletion with preserved
  paren balance; `--selftest` covers the collapse/mutation/rename/added-text classes.
- `census.py`, `shadowaudit.py` — first-pass family histogram and the lambda-shadow audit (0 shadowed
  candidates on the base).

## Farm (compile gate, dotnet is farm-only)

```
HEAD 4a6f8e3a160eb1514d06c6d64b3378f28eaec0e1 job=885 exit=0 branch_update=unchanged
generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2   (buildCS step: 0 Warning(s) 0 Error(s))
```

`branch_update=unchanged` is the strongest determinism proof available for this unit: the farm ran
its own forced transpile on the committed tree and produced the same bytes this worktree has.
