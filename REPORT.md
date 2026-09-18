# U19 — `object X = add(...)` chains over a proven-string BOX leaf

* roster line: **U19** — `object url = add(add(...))` (137) + `object messageHash = add(...)` (69) +
  `object topic/channel/auth/payload/subMessageHash = add(...)` (~90)
* worktree `/root/worktrees/cs90/U19`, branch `cs90-U19`, base `d847892a6fcf5699640862316303b6344a3e4daf`
* touched file: **`build/csharp-local-types.js` only** (`+104/-1`). No `build/csharpTranspiler.ts`, no
  ast-transpiler, no hand-written base file, no `ts/src` edit.

## Family and rule

A local whose initializer is a `+` chain is printed as nested `add(...)` calls, and each call's
overload is picked by ITS left operand's static type — so the chain's C# static type is decided by the
**leftmost operand** (the leaf). Two cases:

* leaf statically `string` / `string?` → the printed chain already binds `add(string, …)`, is
  statically `string`, and the existing `isProvablyStringOperand` path declares the local (cast-free).
  This is the "typed local / literal / string-returning helper" half of the roster line and is
  unchanged here.
* leaf printed statically `object` whose **box** is provably a string or null → the printed chain is
  `add(object, object)`: its C# type is `object`, so naming the value needs a cast and only a cast:
  `string? x = ((string)add(…))`. That declaration is exact, not an assertion: with a string box the
  object overload concatenates, with a null box it takes its `a is (string)` miss and returns null
  (the cast of null is null — it is the same value the `object` declaration held), and any other box
  throws inside the very add call the untyped tree already makes (a string sibling forces the string
  branch's `(string)b` cast, so no numeric result can ever be returned).

Added (`build/csharp-local-types.js`):

* **`stringBoxLeafProof`** (line ~5302, family comment ~5272) — the leaf proofs, each one the landed
  declaration-form proof reused on the chain operand:
  * `market['id']` → `MARKET_ROW_STRING_KEYS` (`marketRowStringReadType`) — the U01 key tables;
  * `this.urls['api']['rest']` → `urlsDescribeStringProducer` (the describe() literal spells that
    leaf as a string); a **dynamic** final key is deliberately excluded (see rejects);
  * `this.getWsUrl(…)` → `STRING_BOX_OBJECT_CALLS`: the one definition (`ts/src/pro/binance.ts`,
    `pro/binance.cs:259`) returns only urls reads and add chains over them on all 5 return paths
    (hand census 2026-09-18), i.e. a string or null;
  * `this.apiKey / secret / password / login / uid / accountId / privateKey` →
    `STRING_MEMBER_OBJECT_LEAVES`: `cs/ccxt/base/Exchange.Options.cs` declares each exactly once as
    `public string <name> { get; set; }` on `BaseExchange` (no shadowing anywhere in `cs/**`, census
    `grep -rEn "^\s*(public|private|protected|internal)\s+…\s+(apiKey|secret|…)"` → 0 hits in the
    generated trees), so the read's static type already IS `string`, the chain already binds the
    string overloads and takes **no cast**; every writer (base `SafeString`, the generated tree's
    string literals / `(string)` casts, user assignments checked by the same property type) leaves a
    string or null box.
* **`plusChainLeftmostOperand` / `plusChainStringBoxLeaf`** (~5336/5354) — walks the left spine of a
  `+` tree to the leaf the printed `add(...)` nesting keys on.
* **`csharpLocalTypeOf` branch** (~5811) — when the declaration is untyped and the leaf proof fires:
  `string?` + the `(string)` cast (cast omitted for a member leaf: its chain is already statically
  string).
* **`stringPlusOperandIsProvablyString`** right operand (~4696) — a right operand printed `object`
  whose box is a proven string-or-null box is exactly as safe as the `string?` spelling the function
  already accepts (`add(string, object)` calls `b?.ToString()` where the object overload's string
  branch casts `(string)b`; identical for a string box, both concatenations treat null as `""`).
  This is the roster's "extend stringPlusOperandIsProvablyString with the … market-row key leaves and
  … venue helpers" half, on the right-operand side.

Every later read and write is still re-scanned by the landed `csharpLocalIsSafeToRetype` (a `string?`
local used as a `+` left operand, a self-concat write of a `string?`, a rebinding write etc. all
reject), which is why 229 U19-named chain sites stay `object` (see rejects).

## Census

```
before (base d847892a6, `git stash` of cs/ in this worktree):
locals: object=9304 typed=44132 typed%=82
casts: (string)=2113 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102

after:
locals: object=9192 typed=44244 typed%=82
casts: (string)=2203 (IList<object>)=1922 (bool)=1 (object)=672 (Dictionary<string, object>)=334 (IDictionary<string,object>)=2563 (Int64)=133 (IDictionary<string, object>)=127 (List<object>)=102
```

* **typed declarations: 112** (`object` 9304 → 9192, typed 44132 → 44244; 113 changed pairs = 112
  retyped declarations + 1 receiver-cast drop)
* **casts removed: 1** — `((string)assetPair).ToLower()` → `assetPair.ToLower()` (the declared type of
  `assetPair` now carries the cast's target, so the printer's receiver wrap became an identity).
* **casts added: 90** (`(string)` 2113 → 2203) — the exactness cast of the 91 declarations whose chain
  is printed statically `object` (the 21 cast-free ones are the member-led chains and the
  statically-string chains my right-operand proof unblocked). A statically-`object` chain cannot be
  named without a cast; leaving the whole family `object` is the only cast-free alternative.
* typed by name (113 pairs, some outside the roster's name list — the rule is leaf-keyed, not
  name-keyed, and dedupes at integration): url 45, topic 13, channelName 10, payload 5, auth 6,
  subHash 4, subscriptionHash 3, dataType 4, channel 3, subMessageHash 3, rawHash 3, fullUrl 1,
  secondPayload 1, assetPair 1, topic 2, stringToSign/jsonParamsBase64 2, streamId 2, and singles.

## Platforms / gates

* regen determinism: REST + WS + prediction forced regens run twice, `git diff -- cs/ | md5sum` =
  `fb505d87d3816a1c1bfd21eae7cc5dab` both times (fixed point).
* `verify-diff.py d847892a6fcf5699640862316303b6344a3e4daf` → **`files=34 pairs=113 unexpected=0`**
* farm build (`ccxt-farm build --targets cs --wait`) from the committed branch — dotnet
  `Build succeeded. 0 Warning(s) 0 Error(s)` (cs/ccxt/cli/tests), `branch_update=unchanged`
  (= the farm's own regen of the committed tree is byte-identical):
  * **job 713 / exit=0** on `a54ae2d95455acf77bd01790caf700fb6a63d05a` (the code commit),
  * **job 725 / exit=0** on `d64825afa34c65623fae17de33a0e31cca74e9e0` (the tip the code diff was
    gated at; every later commit on this branch is this REPORT.md alone — not a build input),
  both with `generator=404e9daa7f0ab58d085ed04aaa61a19546dfeda2`, `skipped_exchanges=76`.

## Rejected sub-cases (with the reason)

1. **`this.urls` reads with a DYNAMIC final key** (`this.urls['api'][api]`, `this.urls['api']['ws']['private'][type]`)
   — **44 sites**, incl. 37 of the roster's `url` family. The landed `urlsLiteralChain` rejects a
   dynamic key, and I keep that rejection: `describe()` returns
   `this.deepExtend(super.describe(), {…})`, so the parent's keys under the same section are
   deep-merged in — the venue's own literal bounds only the keys it spells. The sibling-section walk
   the landed literal-key rule uses cannot bound an inherited key under a *dynamic* key. A per-venue
   parent-describe census would be needed; the value-side failure is benign (a non-string box makes
   `add` return null / throw, both preserved by the cast), but the **proof of "string or null"** is
   not available from the own literal, so it is rejected on doubt (BRIEF rule 4).
2. **Self-concat / urls-write sites** — 5 string-literal-led + 19 urls-literal-key-led chains
   (`url = add(url, ".json")`, `url = add(url, add("?", auth))`, `url = this.urls['api']['rest'] + url`).
   Rejected by `csharpLocalIsSafeToRetype`: a `string?` candidate used as a `+` LEFT operand (or a
   self-concat write) rebinds the object overload to `add(string, *)`, which returns the right operand
   for a null left where `add(object, object)` returned null (and the write would hold the urls value
   where it held null). This is the pre-existing census ("107 such chains, all rejected") — this unit
   keeps those sites rejected, with the corrected reason: the cast itself is exact (it is applied to
   the chain result, `(string)null` is null), the blocker is the later write, not the cast.
3. **`object` parameter / unproven-local leaves** (~165 U19-named sites: messageHash `channel` 20,
   `type` 17, `eventVar` 10, `channelName` 5, `table` 4; channel `messageType` 13, `typeId` 3;
   auth `timestamp` 6, `method` 5, `nonce` 3; payload/topic/subMessageHash `timestamp`/`method`/
   `channelName`; url `bs`/`host`; …). The leaf's box is whatever the caller passed — no proof exists
   at this layer. The declaration half is another unit's family (string params/cores: U50/U24; the
   destructured/local normalization: U13/U14/U17/U32). Reject.
4. **`baseUrl`-led chains (15 sites)** and `bs`/`host`-led chains: `baseUrl` can only be typed
   `string?` (`this.implodeHostname (…)` is declared `string?`) and it is the LEFT operand of a `+`
   in these very chains, which the landed left-operand rule rejects on the null-left divergence
   (add(object, object) → null vs add(string, *) → the right operand). Coupled reject: typing U33's
   `implodeHostname` callers does not unblock them.
5. **`this.implodeHostname (this.urls['api'][api]) + '/'` (bitbank, 2 sites)**: the leaf is already
   statically `string?`, so the existing cast-free rule computes `string` and the safety scan vetoes
   the site on its uses (pre-existing; the dynamic-key receiver is rejected as in 1).
6. **Out-of-family leaves**: `this.options[…]`-led, `(this.urls['api'] as Dict)['rest']`-led
   (coinmate), `currencyIds[0] + currencyIds[1]` (bitstamp), and call-initializers that merely contain
   a chain (coinex `this.hash (this.encode (urlencoded + '&secret_key=' + this.secret))`) — no leaf
   proof; not touched.
7. **`this.<member>` reads outside the base's `public string` properties** (`this.urls`, `this.options`,
   `this.symbols`, …) — different tables/units.
8. **The `getWsUrl` PRODUCER retype** (`CSHARP_STRING_RETURN_METHODS`), which the roster line suggests,
   is deliberately NOT done: retyping the generated signature to `string?` moves the *binding* of every
   existing call site from `add(object, object)` to `add(string, *)`, and for a null result
   (`this.urls['api']['ws'][type]` with a key the venue's urls does not spell) that returns the right
   operand where the current code returns null — e.g. `pro/binance.cs:306`
   (`((string?)((object)(add(add(this.getWsUrl(type, "private"), "?listenKey="), listenKey))))`).
   The chain-site cast names the same box without moving any binding. 8 `url` sites typed this way.

## Residual risk

* The exactness of `((string)chain)` rests on the leaf's box proof; the only shape that would diverge
  is an all-numeric chain (`add(Int64-box, Int64-box)` returning a number), which the proofs exclude
  (a proven string/null leaf) and the sibling string operand/receiver casts turn into a throw.
* `STRING_BOX_OBJECT_CALLS = ['getWsUrl']` rests on a hand census of **one** definition (5 return
  paths, `ts/src/pro/binance.ts`). A future edit adding a numeric return, or a second venue
  definition of the name, invalidates it — re-census before the next round. (Even then the failure
  mode is a throw where the untyped tree threw as well; the risk is a *stale* census, not a silent
  value change.)
* `STRING_MEMBER_OBJECT_LEAVES` rests on the C# property type + writer census. A non-string writer is
  impossible without a cast through the `string` property (compile-checked), but a *new* base property
  of the same name in another tier would need a re-census; the prediction tier
  (`PredictionExchange : BaseExchange`) inherits the same `public string` properties.
* 91 declarations now take a cast the campaign counts as a smell; that cast is what makes a
  statically-`object` chain nameable, and it is an identity conversion for the value the box already
  holds (never a new assertion). Removing it later requires a producer whose printed C# type is
  already `string` (the printer-side route — U54+).
* The `string?` spelling is now on 91 locals that later feed `object` parameters/`Dictionary` values —
  no emitted line changes, but downstream overload bindings at the *uses* are only as good as
  `csharpLocalIsSafeToRetype`; the farm's full-tree compile and the campaign's runtime lanes are the
  backstop.
* Name-agnostic leaf rule: sites owned by sibling units (e.g. U20's `symbol = add(...)`,
  U45's `subHash`) are typed by the same proof; integration dedupes (the rule is per-site).

## hotspot: lines

* `build/csharp-local-types.js:5272-5357` — new family comment + `stringBoxLeafProof` /
  `plusChainLeftmostOperand` / `plusChainStringBoxLeaf`
* `build/csharp-local-types.js:5811-5820` — `csharpLocalTypeOf` branch (declaration retype + cast)
* `build/csharp-local-types.js:4690-4701` — `stringPlusOperandIsProvablyString` right-operand proof
* no `build/csharpTranspiler.ts`, ast-transpiler `src/` or hand-written base file touched.