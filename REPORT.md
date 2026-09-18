# U34 — crypto/encode helper results (hash / signMessage / base64ToBinary / binaryConcat / stringToCharsArray / randNumber / ethGetAddressFromPrivateKey / this.secret)

Branch `cs90-U34`, base `d847892a6fcf5699640862316303b6344a3e4daf`. No `[AST]` work: the ast-transpiler pin
(`404e9daa7f0ab58d085ed04aaa61a19546dfeda2`) is untouched, no `build/csharpTranspiler.ts` change.

## Family / rules touched (`build/csharp-local-types.js`)

1. `CSHARP_LOCAL_THIS_RETURN_TYPES` +7 — the hand-written base signature IS the call's own C# type, so the
   declaration needs **no cast**:
   | entry | proof (hand-written base) |
   |---|---|
   | `base64ToBinary` → `byte[]` | `Exchange.Encode.cs` `public byte[] base64ToBinary(object)` |
   | `binaryConcat` → `byte[]` | `Exchange.Encode.cs` `public byte[] binaryConcat(params object[])` (List&lt;byte&gt; builder `.ToArray()`, empty array for 0 parts — never null) |
   | `base58ToBinary` → `byte[]` | `Exchange.Encode.cs` `public byte[] base58ToBinary(object)` (Base58.Decode) |
   | `binaryToBase58` → `string` | `Exchange.Encode.cs` `public string binaryToBase58(object)` (Base58.Encode) |
   | `ethGetAddressFromPrivateKey` → `string` | `Exchange.ETH.cs` `public string ethGetAddressFromPrivateKey(object)` |
   | `randNumber` → `int` | `Exchange.cs` `public int randNumber(int size)` |
   | `stringToCharsArray` → `List<object>` | `Exchange.cs`, retyped in this unit (see 5) |
2. `hashDigestLiteralType()` + one branch in `csharpLocalTypeOf`'s cast chain — `this.hash(…)` keeps the
   `object` signature (its own base comment forbids narrowing: a digest *variable* may return either box),
   so the declaration names the box its **digest literal** proves behind the exact cast back:
   absent digest / `"hex"` / `"base64"` → `string` (`((string)…)`), `"binary"` → `byte[]` (`((byte[])…)`).
   Non-literal digest or any other arity → `undefined` (stays `object`).
   Census (2026-09-18, every `this.hash (` call in `cs/ccxt/**`): 51 calls — 41 with a literal digest
   (`"hex"` 29, `"binary"` 12), 10 two-argument calls that take the `Hash` default (`digest2 ??= "hex"`);
   no variable digest exists anywhere.
3. `CSHARP_STRING_RETURN_METHODS_BY_DECLARATION = { signMessage: 'string', signHash: 'string' }` — the
   per-declaration twin of the collection by-declaration table, with its own strict predicate
   `stringReturnExpressionProves()` (string literal; `.padStart`/`.padEnd` → `(x as String).PadLeft/Right`;
   `add(<provably string>, …)`; a read of a local this module declares `string`; anything
   `csharpTypeOfValue`/the printer's hook proves statically `string` — including the recursive
   `this.signHash(…)` peer). Wiring: `collectionReturnType` (declaration retype),
   `callReturnType` (call-site local, no cast), `callCollectionReturnType` + `collectionReturnExpressionProves`
   (return-path proof), `byDeclarationCollectionReturnIsProven` (no boundary cast on a proven path).
   A `string?` proof is deliberately rejected (CS8603).
4. `CSHARP_LOCAL_WS_MEMBER_TYPES` + `'secret': 'string?'` — `Exchange.Options.cs` `public string secret { get; set; }`,
   the read's C# static type is the property's own (nullable spelling = the existing arm table's).
5. Hand-written base `cs/ccxt/base/Exchange.cs`: `stringToCharsArray` `object` → `List<object>` (body
   `new List<string>()` → `new List<object>()`). Box change is behaviour-identical — see residual risk.

## Counts

- **87 object locals retyped** (83 in `cs/ccxt/exchanges/**`, 4 in the generated base tier
  `cs/ccxt/base/PredictionExchange.cs`): 25 hash digest literal · 16 signMessage/signHash call sites ·
  38 crypto/encode table-route · 6 later-write-join knock-ons · 2 add-chain knock-ons.
- **16 generated signature retypes** (`public virtual object signMessage/signHash` → `string`, per declaration:
  aster, derive, hibachi, limitless, modetrade, nado, paradex, woofipro — 8 + 8).
- **3 casts removed** (printer's `((string)x)` receiver casts dropped by the existing pass once the local is
  `string`): coinex `.ToLower()`/`.ToUpper()` ×2, lbank `.ToUpper()` ×1.
- **25 casts added** (the hash family: 13 `((string)…)`, 12 `((byte[])…)`) — the `object` signature cannot be
  narrowed, the literal digest is the proof.
- Knock-on class (behaviour-identical, existing helper→native pass): 9 × `getArrayLength(x)` → `x?.Count ?? 0`
  on the now-`List<object>` stringToCharsArray receivers.

census before → after (`campaigns/cs90/census.sh`):
```
before: locals: object=9304 typed=44132 typed%=82   casts: (string)=2113 …   helpers: getArrayLength=704
after : locals: object=9221 typed=44214 typed%=82   casts: (string)=2125 …   helpers: getArrayLength=699
```
(`typed%` stays 82 by the census's floor: 44214/53435 = 82.7 %. The census's typed regex has no `byte\[\]?`
alternative, so `byte[]? secret = null` — coinbaseexchange, the null-init join — counts in neither bucket;
the diff itself carries 83 retyped `object … = …` lines in `cs/ccxt/exchanges/**`.)

## verify-diff.py (vs `d847892a6fcf5699640862316303b6344a3e4daf`)

```
files=37 pairs=116 unexpected=16
```
The 16 unexpected lines, all one of three documented classes:
1. `[BLOCK] cs/ccxt/base/Exchange.cs: -1/+3` + `[PAIR] var res = new List<string>()` — the hand-written base
   retype (hotspot, section 5 above; the added 2 lines are the comment).
2. `[PAIR] ×13` — `getArrayLength(x)` → `x?.Count ?? 0` (helper→native knock-on; `x?.Count ?? 0` is exactly
   `getArrayLength` for a non-null `List<object>`).
3. `[PAIR] cs/ccxt/exchanges/krakenfutures.cs: - object hash = this.hash(…, "binary"); // 2` — a
   decl+cast pair whose value carries a trailing `// 2` comment, which the pairer cannot normalise
   (the same pair on the comment-free lines is accepted).

## Farm

- code commit `dba45afab1b1ab1490acefd12ea1e5f4d74f75b4` → **job 825, exit=0**, `state=succeeded`,
  `generator=404e9daa…` (campaign pin), `branch_update=fast_forward`, `failing_files=[]`.
  Its own `--force` full regen (tests included) added 27 test-tier locals in `cs/tests/Generated/Base/`
  (base64ToBinary 10, base58ToBinary 12, binaryConcat 3, ethMethods 2 — same table entries, receiver
  `exchange`); per the campaign's `--noTests` local workflow those are left to the integrator's full regen.
- final tip (this file's commit) — gated on a throwaway branch `cs90-U34-gate` because a REPORT.md-only tip
  cannot fast-forward the farm's ref; the farm's result note is keyed by SHA, so `ccxt-farm status <tip>`
  resolves the job id/exit for the tip exactly as for the code commit.

## Rejected sub-cases (with proof)

1. **`parseJson` (14 `this.parseJson` + 8 bare) — rejected.** `Exchange.TranspileHelpers.cs:214`
   `public object parseJson(object json)` returns `JsonHelper.Deserialize((string)json)`, and
   `Exchange.JSONHelper.cs:59` `public static object Deserialize(string json)` hands back a dict OR a list
   (the commented-out `JsonConvert.DeserializeObject<dict>` / `List<dict>` branches in the same method are the
   census): no single C# type names the box, and the generated consumers (`getValue(parsed, "k")` and
   `getValue(parsed, 0)`) read both shapes. No table entry, no cast — 22 sites stay `object`.
2. **The four direct `object secret = this.secret;` locals — rejected** (woofipro:4133, pro/woofipro:685,
   pro/modetrade:688, modetrade:3591). The `this.secret` read itself is proven `string?` (entry 4), but the
   same method later writes `secret = getValue(parts, 1);` — element 1 of a `List<object>`
   (`((string)secret).Split(…).ToList<object>()`) — whose `object` box the retype scan's write-side
   assignability rejects (a `string?` target would be CS0266 at that line). Making it compile would need a
   write-side cast the printer does not emit (a new `printCustomBinaryExpressionIfAny` wrapper); out of scope.
3. **`signMessage`/`signHash` declarations that box the `{ r, s, v }` row — rejected** (dydx, hyperliquid,
   polymarket, opinion, prediction/hyperliquid): their `signHash` builds
   `new Dictionary<string, object>() { { "r", … } }`, so the per-declaration string proof fails and the
   declaration *and* all 9 of their call sites stay `object` (dydx:1416, hyperliquid:1847/1862,
   prediction/hyperliquid:2415, polymarket:2794/2843/3492, opinion:1058/1747). Naming them
   `Dictionary<string, object>` needs the collection by-declaration proof for `signHash` as well — a different
   family (U31/U37 territory), not claimed here.
4. **`object signature = this.signHash(encodedTx, privateKey)` (dydx:1425) — rejected** by the same proof
   (dydx's `signHash` returns the row).
5. **Ternary initialisers — left to U22** (lower unit number owns them): apex:1438
   `hasAccountId ? _accountId : this.randNumber(12).ToString()` and polymarket:3375
   `… ? this.ethChecksumAddress(this.ethGetAddressFromPrivateKey(…)) : this.walletAddress`.
   The `randNumber`/`ethGetAddressFromPrivateKey` entries do not fire on those call shapes.
6. **`prediction/polymarket.cs` `object parsedOutcomes/parsedTokenIds/parsedPrices` (1024-1026)** — `parseJson`
   rejects, case 1.

## Residual risk

- The 25 added hash casts are exact only because every digest argument in the tree is a literal
  (census: 51 `this.hash (` calls — 41 literal digests, `"hex"` ×29 / `"binary"` ×12, plus 10 two-argument
  calls that take `Hash`'s `digest2 ??= "hex"` default). A future variable digest simply does not fire the rule.
- `stringToCharsArray`'s box changes `List<string>` → `List<object>`. Consumers audited: `GetValue`'s
  `IList<object>` branch returns the same boxed element (`List<string>` was never load-bearing),
  `getArrayLength` is now the byte-identical `x?.Count ?? 0`, `unique(…)`'s `List<object>` branch yields the
  same distinct string list (`Select(x => x.ToString()).Distinct()`), and `inArray`'s `List<string>` branch is
  unreachable from these lists; no `(List<string>)` cast on a `stringToCharsArray` result exists in `cs/`.
- 8 of the 87 retypes are knock-ons outside the roster's named helpers (6 later-write joins: aster
  `walletAddress`, coinbaseexchange `byte[]? secret`, limitless `owner`, myriad `signer`, polymarket `secret`
  ×2; 2 add-chain: cryptomus `jsonParamsBase64`, `stringToSign`) — sound, but U19/U20/U22/U32 own those
  mechanisms: dedupe by line.
- The `signMessage`/`signHash` signature retypes are safe against CS0508: no declaring class inherits from
  another declaring class (all extend `Exchange` / `PredictionExchange` directly — census), and the farm's
  dotnet build (job 825) is the compile proof.
- Not verified by me: the runtime behaviour of the retyped `signMessage` callers (they are pure value flows —
  dict-value writes, `add` operands, `slice`/`ecdsa` arguments). The generated-tree diff is declaration-type-only
  except the documented cast/knock-on classes.

## hotspot:

- `hotspot: cs/ccxt/base/Exchange.cs` — hand-written base, `stringToCharsArray` object → `List<object>`.
- No `build/csharpTranspiler.ts` change, no ast-transpiler change, no other hand-written base file touched.
