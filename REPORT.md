# U22 — ternary-initialised locals (`x = cond ? A : B`, incl. ternary *writes*)

Branch `cs90-U22`, base `d847892a6fcf5699640862316303b6344a3e4daf` (PR #30530 head).
Only `build/csharp-local-types.js` and the regenerated `cs/` tree are touched — **no
`build/csharpTranspiler.ts`, no ast-transpiler src, no hand-written base file** (so no
`hotspot:` line for any of those; the hotspot is `build/csharp-local-types.js` only).

## Rules added (all in `build/csharp-local-types.js`, header updated at lines ~181-195)

1. **`x = c ? D : x` / `x = c ? x : D` write joins** — `selfTernaryWriteType()` (+ the scan
   hook in `csharpLocalIsSafeToRetype` and the join hook in `typeFromValueOrWrites`).
   Exactly one arm reads the very local the accumulator is deciding (`isSelfRead`), so that
   read has no C# type until the declaration is fixed; the write's contribution is the OTHER
   arm's proven type (`conditionalArmType`). The running type is joined with it like any other
   write; when the other arm's box already fits the running declaration by an implicit,
   box-identical conversion (`assignable`) the write cannot move the declaration at all (the
   ternary is target-typed to the local, exactly like the `object` declaration it replaces).
   VariableDeclaration-only (a parameter's C# signature is retyped after printing).
2. **`this.omitZero (<string box>)` as an ARM** — `conditionalArmType` now also consults the
   existing `omitZeroStringProducer` proof: the hand-written `string? omitZero (string?)`
   overload (Exchange.Generic.cs) binds, so the call's own C# type IS `string?` (no cast).
3. **`c ? parseInt (v) : null` declarations** — `parseIntTernaryCastType()` + a new
   `info.castWhole` emission in `installCsharpLocalTypes` (the cast must wrap the whole
   conditional: `((Int64?)(((cond)) ? parseInt (v) : null))`; a cast binds its own operand
   first, so the plain `((T)value)` shape would have cast the *condition*).
   Exactness: the hand-written `public static object parseInt (object a)`
   (Exchange.TranspileHelpers.cs:866) has one value path —
   `parsedValue = (Convert.ToInt64 (Math.Floor (Convert.ToDouble (a))))` inside a `try` — and
   `null` when the conversion throws: an Int64 box or null, never Int32/double/string.
   Every arm must be null-ish or a `parseInt` call.

`unifyArms` itself is unchanged: the roster's other named arm proofs (string literals, typed
locals, `null` arm → nullable) already existed on the base.

## Counts

* **typed declarations: 33** (`object N = ...` → `T N = ...`), census `object` 9304 → 9271.
* **casts removed: 2** (kraken `((IDictionary<string,object>)close)["price"|"price2"] = …` —
  the S22 dictionary index-write elision fires once `close` is declared `IDictionary<string, object>`).
* also: 1 element-write cast **added** (cryptomus `cost = (string)costparametersVariable[0];`,
  the ELEM_CAST shape the base already emits for a `string?` target), and 15 `isEqual(...)` +
  2 `isTrue(...)` helper calls replaced by the printer's own native emission (see class B below).

Census before/after (`campaigns/cs90/census.sh`, full-tree regen):
```
before: locals: object=9304 typed=44132 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        helpers: isTrue=1434 isEqual=12034 getValue=6761 add=8833 getArrayLength=704
after:  locals: object=9271 typed=44165 typed%=82
        casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2561 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
        helpers: isTrue=1432 isEqual=12019 getValue=6761 add=8833 getArrayLength=704
params: object=11635 (unchanged)   returns: object=1080 (unchanged)
```
Type spellings added (`string?` ×24, `Int64?` ×3, `IDictionary<string, object>` ×1, `string` ×3
(pro/kucoin `action`), `bool` ×2 (zebpay)).
Tier split: 30 REST-tree declarations + 3 pro-tree (`pro/kucoin` ×3), 0 prediction.

Diff: 22 files, 51 `-`/51 `+` lines, all declaration/identity pairs.

## verify-diff.py

`python3 /root/.hermes/profiles/deepseek/campaigns/cs90/verify-diff.py HEAD` →
**`files=22 pairs=51 unexpected=21`**. The 21 UNEXPECTED pairs are four classes, every one a
direct consequence of a retyped declaration in this unit's family:

**Class A — 3 pairs, the `parseInt` boundary cast** (aster, binance `leverage`; cryptocom
`expiry`). The pair shape is new (`((T)(conditional))` needs its own paren pair), the pair
itself is the documented `object N = …` → `TYPE N = (<cast>…)` shape of `verify-diff.py`
(`same_modulo_cast`), only with the extra paren pair that the conditional operand requires.
Proof: `parseInt`'s only boxes are Int64 / null (hand-written body quoted above); the cast
therefore unboxes exactly the box the untyped `object` declaration already held; `(Int64?)null`
is null, not a throw.

**Class B — 15 pairs, the printer's own native emission** for a local this unit declared
`string?` / `bool` (bingx, bitget, coinbaseinternational, cryptomus, deepcoin, krakenfutures,
lighter ×7, whitebit, zebpay) — the class removes 15 `isEqual(...)` calls (14 pairs; one
krakenfutures line carries two) and 2 `isTrue(...)` calls (the single zebpay pair):
* `isEqual(x, "lit")` → `x == "lit"` / `!isEqual(x, "lit")` → `x != "lit"` — the base's S60
  rule (`installCsharpStringEquality`), proven for a *typed* string box: C#'s `==` on `string`
  is the same ordinal comparison the helper's string branch performs, and the box is unchanged.
* `isTrue(a) && isTrue(b)` → `a && b` for `bool` locals — the base's S61/ConditionOperands rule;
  `isTrue` is the identity on a C# `bool`, and a `bool` local can hold nothing else.
  These lines are emitted by the *printer* from the declared type; nothing in this unit prints
  them, and no behaviour changes (both substitutions are the base campaign's own documented
  equivalences, already landed and used by other families' retyped locals).

**Class C — 1 pair, element-write cast added** (cryptomus
`cost = costparametersVariable[0];` → `cost = (string)costparametersVariable[0];`): the
ELEM_CAST shape `verify-diff.py` accepts for `((IList<object>)tmp)[n]`; this site's holder is
already declared `IList<object>`, so only the `(string)` cast is new. Exact: the element is the
`[string, Dict]` tuple's element 0 of off an audited `handleOptionAndParams` call, the same
proof the base's destructured-write rule uses.

**Class D — 2 pairs, cast removal** (kraken, listed above): the S22 dictionary index-write
cast elision on a receiver this unit declared `IDictionary<string, object>`; the removed cast
was `((IDictionary<string,object>)close)`, i.e. an identity conversion of the declared type.

## Determinism

Two consecutive full `--force` REST regens (104 ids) plus a `--ws` (76) + `--prediction` (7) +
`--tests`/`--baseTests` pass produced the identical `git diff -- cs/ | sha256sum`
(`4fda968289efd5c42eac6fd8a72ab87b1918e33c6d2c121a541db99fb8d9a7b0`) — a fixed point.

## Rejected sub-cases (with reason)

Measured before the change on the 87-file ternary census (rest+pro+prediction), probe tooling:
`campaigns/cs90/tools/U22/` (`ternary-census.py`, `probe.sh`, `ts-self-ternary-census.py`).
Baseline family: 248 `object N = <ternary>` declarations (rest 87 / pro 87 / pred 74) and 59
self-arm ternary *writes* in the generated C#. After the rules, in the REST tree 471 ternary
declaration sites were classified: 346 typed / 124 dropped for unproven arms / 1 dropped by the
safety scan; pro: 253 → 168 typed / 82 unproven arms / 3 scan.

1. **Element-access arms, ~86 sites** (`cond ? market['quote'] : market['base']`,
   `cond ? getValue(market, "symbol") : undefined`, `cond ? marketIds[i] : undefined`). The arm's
   C# type is `object` (printed `GetValue(...)`), so naming the conditional's type needs a cast
   **on the arm**, a new emission shape that does not exist for arms; and the key/receiver tables
   that would prove it (`MARKET_ROW_STRING_KEYS`, the element-read families) belong to U01/U02/U04
   (lower unit numbers). Rejected whole.
2. **Parameter arms, ~72 sites** (`cond ? 50 : limit`, `cond ? 'USDC' : quote`,
   `cost !== undefined ? cost : quoteAmount`). Every generated parameter prints `object name = null`;
   the narrow spellings exist only after printing (`typeCoreArgs` / `PARAMETERS_ARG_TYPED_METHODS`),
   which is why the module's header already documents "locals initialised from a PARAMETER" as
   untypeable, and params are U50/U53's family. Rejected (the `selfTernaryWriteType` guard makes
   this explicit). Same for the `headers = cond ? headers : {}` family (alpaca, bitbns, bullish,
   bybit, kucoin) — `headers` is a parameter.
3. **Call arms whose C# signature stays `object`**: `this.safeValue(...)` (~24, U11/U41 twins),
   `this.networkCodeToId(...)` (2, `public virtual object networkCodeToId` in
   Exchange.BaseMethods.cs — U33), `this.convertFromRawQuantity(...)` (rejected by the
   `CSHARP_NUMERIC_RETURN_TYPES` census itself), `this.getPrice(...)` (4 pro-bybit; venue helper,
   no hand-written typed signature), `this.encodeURIComponent(...)`/urlencode (U43),
   `this.keysort(...)` (proven, but its sibling arm is a param). A cast would name an arbitrary box.
4. **`this.<member>` arms outside the arm table**: `this.triggerOrders` (4 sites) — the base
   declares `public object triggerOrders;` (Exchange.Options.cs:189), so `ccxt.pro.ArrayCache`
   would be a lie; retyping the field is the ws member-cache family (U11/U45) and would type
   element reads elsewhere (knock-ons beyond this unit). `this.bidsasks` is `public object
   bidsasks`; `this.tickers`/`this.clients` are not BaseExchange fields / deliberately absent
   from `CSHARP_LOCAL_THIS_ARM_MEMBER_TYPES`.
5. **Scalar cross-widenings, all rejected**: `key = (method === 'fetchOHLCV') ? 0 : 'timestamp'`
   (6 sites, int + string), `cond ? this.safeInteger(a) : this.safeNumber(b)`-style `Int64?` +
   `double?`, `double` + `int?` (a cast would move the box, not name it — hard rule 2).
6. **Mixed collection arms**: `cond ? this.safeDict(...) : this.safeList(...)` /
   `this.safeDict(...) : {}` where the sibling is an unproven arm — no common C# type.
7. **`Array.isArray(x) ? x : this.safeList(x, 'items', [])` (10 sites)**: the `x` arm is a
   parameter (see 2) — the `safeList` side is proven, the other arm is not.
8. **destructured-write scan rejects (pro/kucoin `method` ×2, `topic`)**: the arms prove `string`,
   but the local is later written by a `[method, params] = this.handleOptionAndParams2(...)`
   destructuring; the audited destructured-write cast list (ELEM_CAST) belongs to U13.
9. **Prediction tier: 73 blocked sites deferred to U44** (the roster assigns the whole
   prediction shard there; the module's two existing arm-widening rules are already gated on
   `isPredictionTierSource`). No rule added here fires in the prediction tree (checked: the
   `--prediction` regen is byte-identical).
10. **`this.omitZero(v)` arms with a non-string `v`** (fromEv/fromEp/safeValue2 results):
    `omitZero` hands a non-string box straight back, so only the proven string argument qualifies.

## Residual risk

* The self-ternary rule is a **write-side** rule: it can retype declarations whose own
  initializer is anything (null-init, `safeString`, a literal). That overlaps the *site* families
  of U17 (null-init string writes) and U21 (literal-init locals whose blocker was an unprovable
  write) — the roster told U21 to coordinate with U22, and the integrator should keep one side.
  Overlapping sites in this diff: `settleId`/`collateralString`/`status`/`quoteId` (null-init),
  `pro/kucoin` `action` ×3 (literal init), `amount` (woo/woofipro/modetrade, `safeString` init).
* The `parseInt` cast is the only cast this unit adds; it is exact only while
  `Exchange.TranspileHelpers.parseInt` keeps its single Int64/null return path (hand-written, so
  a future edit could invalidate it — the module comment states the invariant).
* Class B knock-ons (15 `isEqual` + 2 `isTrue` removals) are the base campaign's own equivalence
  rules, but they are *emitted* because of this unit's retypes: any reviewer re-gating this diff
  should read them as one class, not as 15 behaviour edits.
* Gate scope: `ccxt-farm build --targets cs` compiles the committed tree (ccxt + tests + cli);
  no runtime lane (`id-tests-cs` / `request-cs` / `response-cs`) was requested for this unit, and
  no live exchange call was made.

## Farm gate

```
ccxt-farm build --targets cs --wait          # from /root/worktrees/cs90/U22
farm: job 707 admitted on slot 1 (targets=cs via cli transpile_force=0)
HEAD 082d24f6063d27faaa4308db344d9e202abe7efa job=707 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
HEAD d7f75a4b0129dad7d85effb4117e1cb06621676a job=723 exit=0 branch_update=unchanged generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2
```

`exit=0` (no error, no warning from this diff) and `branch_update=unchanged` — the farm's own
`--force` regeneration reproduced the tree byte-for-byte, i.e. the fixed point holds on the farm
too. `082d24f` is the code commit (`build/csharp-local-types.js` + `cs/` + REPORT.md);
`d7f75a4` amends the REPORT section only, and the delivered tip differs from `d7f75a4` in
REPORT.md alone — the compiled `cs/` tree is byte-identical across all of them, and
`ccxt-farm status <sha>` resolves a green result per sha (the tip was re-gated the same way).
