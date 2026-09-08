# C++ implementation review

- **Last checked (UTC):** 2026-09-08T02:24:00Z
- **Repository:** `/root/new-lang/ccxt` — Claude's observed working directory, not `/root/ccxt`.
- **Reviewed HEAD:** `45359ec515` ("c++: crypto layer (keccak/ECDSA/ed25519/EIP-712/starknet), jwt, exact bigint ids, C++ test leniency"). HEAD was `0d6f3620cb` at pass start; Claude committed mid-pass, then started new uncommitted edits (`parseJson` rewrite, `cpp/CMakeLists.txt`, new `cpp/cli/`) — the `parseJson` section below reflects those working-tree edits, reviewed at ~02:15Z. Mixed snapshot; findings attributed to observed checkout state, not to a specific actor.
- **Review mode:** comments only; no implementation changes, regeneration, staging, commits, live requests, or real credentials.
- **Schedule:** Hermes job `ccxt-cpp-review` (`f9f3fa4855bd`), every 12h. The `requesting-code-review` skill's review-only mode governs this pass (Steps 7–8, auto-fix/commit, do not apply).
- **Verdict:** P1 parseJson breakage (root cause fixed in an uncommitted edit, residuals remain), one P2 EIP-712 signing divergence, P2 missing crypto test coverage, plus two open P3s. The new keccak/ECDSA implementations were independently verified bit-for-bit against the TS reference. This is not approval of the complete C++ port.

## Open findings

### CPP-005 — P1 — `parseJson` thrown-on-every-call on libstdc++ (root cause addressed in uncommitted fix; residuals remain)

**Location:** `cpp/ccxt/base/ExchangeBase.cpp:860-870` (regex at 867); live reachability at `fetch()` line 1330 — **every** REST response body goes through `parseJson`, and the failure fallback returns the raw response string.

**Original defect:** the bigint-quoting regex `(?<![\w.-])-?(\d{19,})(?![\d.])` uses a lookbehind. libstdc++'s ECMAScript engine (GCC 13.3, same as CI's ubuntu-latest default toolchain) rejects lookbehind at construction: `std::regex_error: Invalid '(?...)' zero-width assertion`. Being a function-local `static`, initialization is retried on every call, so **every** `parseJson` call threw and returned `undefined`. Verified with a compiled probe of the exact expression (GCC 13.3): all inputs → `REGEX-THROW`. Impact: all 104 exchanges' live `fetch*` calls degrade to returning the raw JSON string; static gates stay green because they never route through `fetch()`/`parseJson`.

**Fix status:** the working tree (uncommitted, `git diff cpp/ccxt/base/ExchangeBase.cpp`) now replaces the lookbehind with `\d{19,}` plus manual prev/next-char checks. Probe of the new logic (exact copy):
- bare `2880534893454904000` → quoted ✓; quoted `"2880534893454904000"` → untouched ✓; negative bare → `"-288…"` ✓; fraction tails untouched ✓; `1e20` untouched ✓.
- **Residual A (corrupts the whole parse):** quoted negative big-int string `{"x": "-2880534893454904000"}` → `{"x": "-"2880534893454904000""}` — the minus branch lacks an `else continue`, so it quotes the digits after an unmatched `-` and produces invalid JSON → `undefined` response.
- **Residual B (corrupts the whole parse):** `12345678901234567890e5` → `"12345678901234567890"e5` — exponent tails aren't excluded (only `.` is checked); invalid JSON → `undefined`. Python-style `1e+24` mantissas are 1 digit and safe, but ≥19-digit mantissa + exponent still breaks.
- **Residual C (semantic drift):** the same fix quotes mantissas in scientific literals where JS `JSON.parse` yields a number; type divergence remains for any quoted-worthy value that JS parses numerically.
- **Still no test:** `parseJson` has no unit coverage; the alpaca-id case and the two corruption cases above would each fail today.

**Recommended:** add `continue` when `text[s-1] == '-'` is not in a value position (Residual A); treat a following `e`/`E` as a non-quote (Residual B); add a `parseJson` regression test with the alpaca id, a quoted big-int string, a quoted negative, and a scientific literal.

### CPP-006 — P2 — EIP-712 array-of-struct encoding diverges from ethers → wrong grvt signatures

**Location:** `cpp/ccxt/base/ExchangeBase.cpp` `ethEncodeStructuredData` → `encodeData` array branch (`elem = structs.count(base.first) ? encodeData(base.first, item) : encodeAtomic(...)`, then one `keccak256` over the concatenation).

**Reference (vendored ethers, `ts/src/static_dependencies/ethers/hash/typed-data.ts` `#getEncoder` array branch):** for an array of structs, each element is encoded with the struct encoder (**typehash ‖ fields**), each element is then **keccak'd individually**, and finally the concatenation is keccak'd. The C++ encodes each element as **fields only** (no typehash prefix, no per-element keccak). Two independent divergences; the digest differs whenever a struct-array field exists.

**Reachability:** grvt's `EIP712_ORDER_TYPE`/`EIP712_ORDER_WITH_BUILDER_TYPE` declare `'legs': 'OrderLeg[]'` (`ts/src/grvt.ts:402,420`) and grvt signs orders through `ethEncodeStructuredData` + `ecdsa`. The C++ grvt static request gate is enabled, but `skipKeys: ['r','s','v', …]` (`ts/src/test/static/request/grvt.json`) skips signature components, so the wrong digest passes the gate and only fails live (grvt rejects the signature).

**Minor companion divergence:** the C++ domain-struct builder includes keys that are present with a `null` value; ethers `hashDomain` drops null-valued domain keys (`if (domain[name] == null) continue;`). Encodes `null` as `0` where ethers omits the field.

**Recommended:** in the array branch, use `hashStruct(base.first, item)` per element (and verify against a real grvt sign-request fixture — capture one with `node cli.js grvt createOrder --report` once private fixtures exist, or construct a minimal typed-data vector pinned from ethers).

### CPP-009 — P2 — new crypto layer shipped with zero test coverage; stale stand-in test claims the code can't exist

**Location:** `cpp/tests/Manual/test.cryptography.h` (registered as `"cryptography"` in `main.cpp`), commit `45359ec515`.

The commit implements keccak-256, RFC-6979 secp256k1 ECDSA, ed25519, EIP-712, ABI encoding, jwt and the whole Starknet stack, but adds **no tests anywhere** (`cpp/tests/` greps show no keccak/ecdsa/pedersen vectors). `test.cryptography.h` is a hand-written stand-in whose bottom comment still asserts "ecdsa — requires RFC-6979 … cannot reproduce without implementing 6979 by hand" and "keccak — digestFor() throws" — both now false, and the header comment in `Starknet.h` claims the code was "verified against the vendored TS implementation's outputs — see the vectors in the commit that introduced this file"; **no such vectors exist in the commit**. The stand-in also contradicts the established C# convention (machine-transpiled `transpileCryptoTestsToCSharp`; per the repo's own memory: hand-written crypto tests are not acceptable long-term).

**Recommended:** replace the stand-in with the dedicated per-file transpile of `ts/src/test/base/test.cryptography.ts` (mirroring `transpileCryptoTestsToCSharp`), extended with vectors for keccak, secp256k1 RFC-6979, EIP-712 struct-array encodings, pedersen and starknet sign; delete the stale "cannot reproduce" comments; update the Starknet.h verification claim to cite actual vectors.

### CPP-002 — P2 — `callDynamically` still cannot resolve the unified-test framework's base helpers

Unchanged in substance; the registry grew (safeValue/deepExtend/json/parseJson/… ~40 entries, `ExchangeBase.cpp:1476-1516`) but the five required names still appear in **neither** `Exchange.Dispatch.inc` **nor** the registry: `jsonStringifyWithNull`, `setProperty`, `getProperty`, `capitalize`, `exceptionMessage`. Regenerated `test.sharedMethods.inc` now calls `getProperty` **27** times (was 2) and `setProperty` **12** times (was 8) — the gap is growing. The first `assertDeepEqual` in any per-method unified test still throws `NotSupported ("callDynamically: no handler for \"jsonStringifyWithNull\"")`. Static gates remain unaffected (they never reach these helpers). Same recommended fix as before: registry entries + `jsonStringifyWithNull` implementing `JSON.stringify(obj, (_, v) => v === undefined ? null : v)` + a base test executing one `assertDeepEqual`.

### CPP-003 — P3 — number rendering divergence now driving source-of-truth fixture edits

`cpp/ccxt/base/helpers.cpp:19-36` (`numberToJsString`) is unchanged — integral doubles in [1e15, 1e21) still render as `1e+15` where JS prints `1000000000000000`, and small values render shortest-round-trip (`9.599999999999999e-05`) where JS prints `0.00009599999999999999`. New evidence this pass: commit `45359ec515` edited the shared lighter response fixture (`0.000001` → `1e-06`, `0.00009599999999999999` → `9.599999999999999e-05`) to match the C++ renderer. The response leaf comparison is `.toString()`-based (`ts/src/test/tests.ts` ~1722-1737) with the numeric-fallback branch limited to PY/C#, so C++ has no numeric tolerance and fixture text must match the C++ string rendering exactly. These edits are JS-neutral (same doubles) but confirm the drift mechanism; every new fixture with such values will need the same accommodation until the renderer matches JS. Same recommended fix as before.

### CPP-004 — P3 — `toDydxLong` still matches neither TS nor C#

Unchanged: `ExchangeBase.cpp:2564` returns `str(value)` with the comment "TS: BigInt(value).toString()", while TS (`ts/src/base/Exchange.ts:2304`) returns a Long **value** and C# throws `NotSupported`. Latent until the dydx protobuf milestone.

### CPP-007 — P3 — C#-style vacant-key leniency applied to a dict-based port; `disabledCPP` silent skips

`ts/src/test/tests.ts` (3 spots, `assertNewAndStoredOutputInner` + key counting) now grants C++ the C# leniency that treats "stored value vacant + output key missing" as equal, justified there because C# unified types are structs that always materialize keys. C++ unified structures are **dicts** (`std::any` → `ccxt::dict`, e.g. `binance.h:7939 parseTicker`), so a missing key is a real parse divergence that this leniency masks. Severity P3 only because the masked case is restricted to fixture keys whose stored value is vacant. Also: `disabledCPP: true` was added to the apex and lighter static fixtures (both EVM-signed exchanges) with no `until`/comment — fine as staging, but both should be re-enabled once the crypto layer is fixture-verified, otherwise the EIP-712/ECDSA request paths have no C++ gate at all.

### CPP-008 — P3 — `ecdsa` prehash/fixedLength contract diverges from TS (latent); misleading comment

- TS (`ts/src/base/functions/crypto.ts:112`): `prehash` is a **hash object** applied to the request **hex text** (`request = hash(request, prehash, 'hex')`); C++: boolean → `keccak256` of the **decoded bytes**. Divergent on both input and algorithm.
- TS: `fixedLength` triggers the extraEntropy retry loop until r and s are fixed-width; C++: `(void) fixedLength`.
- Both are unreachable today (all 12 TS call sites pass `undefined`), hence P3 — but the divergences are silent and will surface the day an exchange uses them.
- `Crypto.cpp:385` block comment says "its LAST 32 bytes are the message hash z"; noble's `bits2int` takes the **leftmost** 256 bits and the code implements leftmost — code is right, comment is wrong (the inline comment at 397 already says leftmost).

## Verified this pass (no findings)

- **keccak-256**: official vectors `keccak256("")` and `keccak256("abc")` match, probe compiled from exact copies of `Crypto.cpp` (see Verification).
- **ECDSA secp256k1**: exact-copy probe output `r=432310e3…`, `s=530128b6…`, `v=0` for priv `C9AFA9D8…` / msg digest `af2bdbe1…` — **bit-for-bit identical** to `@noble/curves` 2.2.0 (repo's pinned version) with `{lowS:true, prehash:false, format:'recovered'}`. RFC-6979 DRBG, k-retry, low-s, recovery bit and leftmost truncation all correct.
- **jwt HS/ED** vs `ts/src/base/functions/rsa.ts:37`: alg defaulting, header/opt merging, `iat` extraction, HS = base64url(HMAC-binary) ≡ TS, ED = base64→base64url ≡ TS. `urlencodeBase64` matches TS string/bytes semantics (`encode.ts:40`). ES256 throws `NotSupported` — staged stub; coinbase's ES256 branch (`coinbase.ts:5313`) will hit it.
- **starknet**: pedersen seed points are the canonical StarkWare constants; `pedersenAccumulate` 248/4-bit split walk, `grindKey` (limit = 2^256 − 2^256 mod n, seed‖minimal-index, 100k cap), `sign` (63-nibble fixMsgHashLen, bits2int strip-zero-bytes+shift, RFC-6979 seed = int2octets(d)‖int2octets(m)), `computeAccountAddress` (pedersen chain + mod 2^251−256) and legacy typed-data structure all match `@scure/starknet`/vendored semantics. `starknetSign` returns `json(list)` matching TS. Nits: `starknetKeccakNum` has a dead `BN_mod` call; TS throws on >1 message type while C++ silently takes the first; grindKey loops `i <= 100000` vs scure's `< 100000` (harmless).
- **EIP-712 primary/domain**: `dict` is insertion-ordered (`Value.h` OrderedMap) so `entries().front()` matches ethers' primary-type selection; domain field order/filtering matches `hashDomain` except the null-key case (CPP-006 companion).
- **ethGetAddressFromPrivateKey**: C++ lowercase output matches TS (`binaryToBase16` is lowercase, not checksummed); the C++ "checksummed like the TS" comment misdescribes TS but behavior matches.
- **`starknetSign`/`hyperliquid.signHash`/`paradex` generated code**: slice(-64), `0x` prefixes, `v = 27+v` — match TS call sites.
- **`cpp/tests/main.cpp`** `all` handling and usage text: fine. `operator!` (ccxt-namespace, ADL-documented) and Crypto.h/Crypto.cpp interface: fine.

## Verification

Executed from `/root/new-lang/ccxt` unless noted. Probes live in `/tmp/ccxt-review-probes/` (reviewer-owned, outside the repo). No repo build dirs touched; no binaries from `cpp/build` run.

| Check | Actual result |
|---|---|
| HEAD at pass start / end | `0d6f3620cb` / `45359ec515` (Claude committed mid-pass); working tree re-dirtied by end (uncommitted `parseJson` rewrite, `cpp/CMakeLists.txt`, new `cpp/cli/`) → mixed snapshot |
| Scope fingerprint (SHA-256 over `cpp/ccxt`, `cpp/tests`, `cpp/CMakeLists.txt`, `build/cppTranspiler.ts`, `ts/src/base/Exchange.ts`, `ts/src/test/tests.ts`, `package.json`, `run-tests.js`; build output and this report excluded) | start `8dfc8991…b9a942`, end `89d3aa4d…8b3b9f88` — changed during the pass |
| `grep -rn` for `jsonStringifyWithNull`/`getProperty`/… in `Exchange.Dispatch.inc` + registry | all 5 names: 0 in dispatch, absent from registry (CPP-002) |
| `regex_probe.cpp` (original lookbehind expr, GCC 13.3) | every input → `REGEX-THROW: Invalid '(?...)' zero-width assertion` (CPP-005) |
| `regex_probe2.cpp` (uncommitted replacement logic, exact copy) | table in CPP-005: 2 residual corruption modes |
| `crypto_probe.cpp` (exact copies of `Crypto.cpp` keccak + ecdsa, minimal stubs; compiled `-O0`, no repo files) | keccak vectors OK; ecdsa output bit-identical to noble 2.2.0 (node, ESM) |
| `node --input-type=module` reference signature | `r=432310e32cb80eb6503a26ce83cc165c783b870845fb8aad6d970889fcd7a6c8 s=530128b6b81c548874a6305d93ed071ca6e05074d85863d4056ce89b02bfab69 v=0` |
| Static gates / build | **not run** — implementer actively editing; binaries not trusted as current-source evidence |

**Limitations:** offline static review + standalone probes only. No clean rebuild, sanitizers, live requests, or full test matrix. The 104-exchange generated surface was spot-checked (grvt, paradex, hyperliquid, binance, coinbase paths), not exhaustively read. Starknet pedersen/sign were reviewed structurally and against the TS reference sources, not executed against fixtures. Findings cover the reviewed slice only.

## Scope and snapshot

Reviewed: commit `45359ec515` in full (Crypto.cpp/h, Starknet.cpp/h, ExchangeBase.cpp crypto/parseJson/dydx regions, `cpp/CMakeLists.txt`, `cpp/tests/main.cpp`, `ts/src/test/tests.ts` leniency additions, apex/lighter fixture edits) plus the mid-pass uncommitted `parseJson` rewrite and `cpp/CMakeLists.txt` diff; re-verified CPP-002/003/004 status at the new HEAD. Reference sources read: `ts/src/base/Exchange.ts`, `ts/src/base/functions/{crypto,rsa,encode}.ts`, vendored ethers `hash/typed-data.ts`, `@noble/curves` 2.2.0 sources in `node_modules`, `ts/src/grvt.ts`, `ts/src/paradex.ts`, fixtures for grvt/paradex/lighter/apex. Not reviewed this pass: `build/cppTranspiler.ts` (unchanged since last pass), the mass-generated exchange header regeneration in `0d6f3620cb`, the new `cpp/cli/` directory (created after this pass's scope).

## Remaining review scope / known deferred work

- Per-method unified tests still need generation/rollout; CPP-002 blocks their `assertDeepEqual` path.
- Async-future lifetime/ownership, Precise arithmetic breadth, per-exchange error mapping and the bulk of per-exchange signing remain unreviewed.
- The new `cpp/cli/` and any further uncommitted edits (checkout was re-dirtied mid-pass).
- Starknet legacy typed-data paths executed only against source comparison, not fixtures; no C++ live run has been observed.

## Recent review history

- **2026-09-08:** HEAD `45359ec515` (+ mid-pass uncommitted parseJson fix). Added CPP-005 (P1 parseJson broken by libstdc++ lookbehind; uncommitted fix verified with residual corruption modes), CPP-006 (EIP-712 struct-array encoding diverges from ethers → grvt signatures), CPP-007 (C#-style leniency on dict port + disabledCPP skips), CPP-008 (ecdsa prehash/fixedLength latent divergence), CPP-009 (crypto layer has no tests; stale stand-in claims). Verified keccak + ECDSA bit-for-bit against noble 2.2.0 with compiled probes; jwt/urlencodeBase64/starknet structure reviewed clean. CPP-002/003/004 remain open (CPP-003 now with fixture-edit evidence). Mixed snapshot — Claude committed and re-dirtied the tree during the pass.
- **2026-09-07:** HEAD `84f35fb8` + uncommitted reroute. Added CPP-002, CPP-003 (executed repro), CPP-004. CPP-001 resolved by supersession; response-test limitation cleared; `StaticTests.h` flagged as dead code (still true: only `TestUtils.h` references it).
- **2026-09-05:** Initial setup-session review. Added CPP-001 with a compiled reproduction. Recurring reviews enabled.
