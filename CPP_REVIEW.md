# C++ implementation review

- **Last checked (UTC):** 2026-09-07 01:44Z (pass 5) — HEAD advanced to `3a985daf0f` ("c++: transpiled tests.ts framework, exchange factory, static gates green (356/64)") plus a large uncommitted WIP (208 untracked files: 206 new exchange headers/TUs, `Exchange.Dispatch.inc`, `ExchangeFactory.{h,cpp}`, `transpile-batches.sh`; modified `ExchangeBase.{h,cpp}`, `binance.h`, api tiers, `build/cppTranspiler.ts`).
- **Repository:** `/root/new-lang/ccxt` — Claude's observed working directory, not `/root/ccxt`.
- **Review mode:** comments only; no implementation changes, regeneration, staging, commits, live requests, or real credentials. `CPP_REVIEW.md` is the only repo file written.
- **Verdict:** the four showstoppers from pass 4 are fixed in the committed code — CPP-005 (string-literal corruption), CPP-006 (registry casing), CPP-007 (error masking) and CPP-010 (missing `features`) are all RESOLVED in `3a985daf0f`, and the transpiled static framework is now structurally sound (offline mock transport, faithful comparator). One new uncommitted defect (CPP-011, miss-cache poisoning in `callDynamically`) plus small parity notes (CPP-012). Not approval of the complete C++ port; live gates and per-exchange semantic review remain.

## Open findings

### CPP-011 — P2 — `tableMissCache` poisons dispatch after a thrown unified-method exception (working tree, new)

**Location:** `cpp/ccxt/base/ExchangeBase.cpp` `callDynamically` (~1422-1442). Uncommitted; `tableMissCache` is absent from HEAD (0 matches in `git show HEAD:`), added by the current WIP along with `tableMissCacheMutex` in `ExchangeBase.h`.

**Mechanism:** after the first `callMethod(...)` call that throws *for any reason*, the name is inserted into `tableMissCache` and every subsequent `callDynamically` for that name skips the dispatch tables entirely, falling to the hand-written helper registry — which rethrows the *first* exception only when `underlying` is set. On later calls `underlying` is a fresh empty `exception_ptr`, so the call ends in `throw NotSupported("callDynamically: no handler for ...")`.

**Trigger/impact:** the test framework calls every unified method through `callDynamically` (`testMainClass.inc:323` `loadMarkets`, method iteration at 301-388). If `fetchTicker` throws once (RateLimitExceeded, AuthenticationError, BadSymbol, any transient failure) the error is correctly propagated that one time, but every later `fetchTicker` call on that exchange instance fails with the misleading `NotSupported` for the rest of the process — even after the transient cause is gone. Test runs that catch a failure and continue to the next method will then report cascade `NotSupported` failures. Static gates are unaffected (their mock transport never throws), which is consistent with "static gates green". Live runs are where this bites.

**Recommended fix:** only cache names that are provably absent from every table — e.g. have the generated `callMethod` chain throw a dedicated `UnknownMethod` for a table miss and cache only when that type is caught; let any other exception propagate without caching. (Or drop the cache; the ~800-comparison scan is a perf optimization, not a correctness requirement.) Add a regression test: call a unified method, force one exception via the mock transport, assert the *same* method still dispatches afterwards (and the error type is preserved).

### CPP-012 — P3 — `intToBase16` diverges for negative input (working tree, new)

**Location:** `cpp/ccxt/base/ExchangeBase.cpp` `intToBase16` (~1817): `snprintf("%llx", static_cast<unsigned long long>(toLong(number)))`.
TS (`Exchange.ts:2437`): `elem.toString(16)` — JS returns `"-1"` for `-1`; the C++ unsigned cast returns `"ffffffffffffffff"`. All current call sites pass non-negative values (crypto salts/indices), so latent. Fix: branch on `toLong(number) < 0` and emit `"-" + hex`.

### CPP-013 — P3 — formatting split between regenerated tracked headers and new batch headers (working tree, new)

`binance.h` keeps the old 4-space indentation while all new batch headers (`bequant.h`, `okx.h`, …) use 2-space (`transpile-batches.sh` / different emit path). Cosmetic, both compile (verified), but the diff noise will be huge on the next binance regen and suggests two formatting configurations in `build/cppTranspiler.ts` or the underlying AST backend. Worth unifying before the batch headers are committed.

## Previously open findings (status)

- **CPP-001 (P2 comparator type confusion) — RESOLVED** (commit `94ba7bb78f`, superseded). The transpiled framework's comparator — `assertNewAndStoredOutputInner` (`Generated/testMainClass.inc:1827-1935`) — asserts dict key-count equality, recurses with skipKeys, compares array lengths, and does strict type-checked scalar comparison; reviewed this pass, faithful to the TS reference. The offline mock transport (`setFetchResponse` → `fetchImpl` in `TestMainClass.Bridge.h:229-234`, consulted by `ExchangeBase::fetch`) is what keeps the static gates offline.
- **CPP-002 (P3, `iso8601` extreme-input divergence) — still open.** Now at `ExchangeBase.cpp:968`; code unchanged.
- **CPP-003 (P3, `loadMarkets` empty-dict gate stricter than TS) — still open.** Now at `ExchangeBase.cpp:1958-1977`; gate `markets.size() > 0` unchanged (TS keys on `marketsLoading` being set).
- **CPP-004 — MOOT** (file deleted by the restructure; carried).
- **CPP-005 (P1, string-literal corruption in generated tests) — RESOLVED in `3a985daf0f`.** Committed `testMainClass.inc` census: 0× `std::string("std::any{}")`, correct flag literals (`"--requestTests"`, `"--responseTests"`, `"--verbose"`, `"--info"`), correct assert message at line 117, correct fixture paths. The remaining 48 `std::string("safeString")` occurrences are legitimate member-name dispatch arguments (`callDynamically(exchange, std::string("safeString"), ...)`), not corruption.
- **CPP-006 (P1, registry key casing) — RESOLVED in `3a985daf0f`.** Registry moved to `Generated/Exchange/TestRegistry.inc`; keys are now lowercase unified names (`"afterConstruct"`, `"fetchAccounts"`, …) matching the dispatch lookups; `"features"` present. Worktree copy identical.
- **CPP-007 (P2, `callDynamically` swallows unified-method exceptions) — RESOLVED in `3a985daf0f`.** `callDynamically` tail now does `if (underlying) std::rethrow_exception (underlying);` before the generic `NotSupported` (HEAD: `ExchangeBase.cpp:1472`), so the original mapped error (RateLimitExceeded etc.) surfaces. Caveat: the new miss-cache partially re-opens this in a different shape — see CPP-011.
- **CPP-008 (P3, `handleHttpStatusCode` unknown-5xx catch-all) — still open.** Now at `ExchangeBase.cpp:1529-1530`; unchanged.
- **CPP-009 (P3, `fetch()` parity nits) — still open.** `fetch` body untouched by this WIP (hunks landed elsewhere); the three nits (parsed-body `false`/`0` edge, shallow-vs-deep header merge, hardcoded statusText/empty headers to `handleErrors`) remain at ~`ExchangeBase.cpp:1290-1350`.
- **CPP-010 (P3, `getTestFilesSync` omits `features`) — RESOLVED in `3a985daf0f`.** `TestMainClass.Bridge.h` (HEAD:250-254) now pushes `"features"`.

## Verification

All commands from `/root/new-lang/ccxt` or `/tmp` reviewer-owned files; no credentials, no live endpoints, no builds in the implementer's build dirs, no package installs.

| Check | Actual result |
|---|---|
| Committed diff `6761444924..3a985daf0f` (cppTranspiler +568, ExchangeBase +463, Generated framework, factory, cpp.yml) | reviewed; 4 findings resolved (above) |
| Corruption census of committed Generated output (`git show HEAD:...`) | clean: 0 corrupted literals; flags/messages/paths correct |
| Registry keys (HEAD + worktree) | lowercase, dispatch-consistent; `features` present |
| TS parity spot checks | `fixStringifiedJsonMembers` = exact match of TS replaceAll sequence; `microseconds` = `milliseconds()*1000` ✓; `uuid5` arg order (namespace, name) matches TS (header decl param *names* swapped — cosmetic); `binaryConcat` variadic matches `concatBytes` shape (call sites with >5 parts not scanned — limitation) |
| New hand-written helpers (`randNumber`, `remove0xPrefix`, `intToBase16`, `exceptionMessage`, `randomBytes`, `uuid5`, ZK/eth/starknet stubs) | reviewed in diff; explicit `NotSupported` stubs are deferred features matching the C# convention, not defects |
| Derived-exchange scheme (`bequantApi : hitbtc`, `super.` → `hitbtc::`, dispatch fallback `return hitbtc::callMethod(...)`) | reviewed; qualified-id member calls execute on `this` — correct TS-equivalent semantics |
| Base dispatch `Exchange.Dispatch.inc` (521 branches, untracked) | reviewed; arity arms match the documented design; no fetch*/loadMarkets branches (those live in the hand-written registry) — consistent |
| **g++ 13.3 `-fsyntax-only` -std=c++17, current tree** | `cpp/ccxt/base/ExchangeBase.cpp` → exit 0; `cpp/ccxt/exchanges/tu_bequant.cpp` → exit 0; `cpp/ccxt/exchanges/tu_binance.cpp` → exit 0 (no warnings emitted) |
| Freshness of `cpp/build/ccxt-tests` | binary built Sep 6 17:44; `ExchangeBase.{h,cpp}` modified 19:53 and many exchange headers regenerated after — **stale, not run** |
| Static gates (`ccxt-tests binance --requestTests/--responseTests`) | **not run** (stale binary; also bounded-pass policy). Offline safety of the gates confirmed statically: `setFetchResponse` swaps `fetchImpl`, `runStaticTests` reads fixtures only |
| `git diff --check` | not rerun this pass (no new hand-authored whitespace-sensitive text); WIP regenerated files excluded from the check |
| Fingerprint stability | captured twice during pass 5 — identical `a6579e5c…` → no concurrent edits; attribution to HEAD is exact |

**Limitations:** no compile of the *full* tree (206 new exchange TUs — only two spot-compiled), no CTest run, no sanitizers, no live requests. Static gates reviewed statically only; the "356/64 green" claim is the implementer's commit message, not re-executed here. `transpileTestRegistry`'s first-regex thunk scan and the arity-unpack brittleness notes from pass 4 still apply.

## Scope and snapshot

Reviewed this pass (pass 5): commit `3a985daf0f` (transpiled tests.ts framework, exchange factory, dispatch fallback chain, `Exchange.Dispatch.inc`) and the uncommitted WIP: `build/cppTranspiler.ts` (+104: base dispatch + TS-parent fallback), `build/generateImplicitAPI.ts` (+8: derived api tier includes parent exchange), `cpp/ccxt/base/ExchangeBase.{h,cpp}` (+209/+68: miss-cache, `microseconds`, hand-written helpers, OpenSSL SHA/rand), `cpp/ccxt/base/{Exchange,Crypto}.h`, `cpp/ccxt/exchanges/{binance.h,tu_binance.cpp}`, `cpp/tests/TestMainClass.Bridge.h` (getRootException via `current_exception()`, exception_ptr unwrapping), `cpp/tests/Manual/test.cryptography.h` (temporary stand-in note), the 10 modified api tiers, new `cpp/ccxt/exchanges/ExchangeFactory.{h,cpp}`, new untracked exchange headers (spot: bequant, apex, hitbtc, okx, binance dispatch tails) and `transpile-batches.sh`. TS references: `ts/src/base/Exchange.ts` (fixStringifiedJsonMembers/intToBase16/uuid5/microseconds), `ts/src/test/tests.ts:236` (isDictionary), `ts/src/test/base/test.uuid.ts`.

**Pass-5 scoped content fingerprint:** `a6579e5c99215890dba46a7eb9dc0caa4647d31618845b9dc0066086c5403594` over **459 files** plus HEAD `3a985daf0f3fdd965220f1fe4d31556da8c17d98` (SHA-256 of compact JSON `{"HEAD":<hash>,"files":[[<path>,<SHA-256 bytes>],...]}`, paths sorted; scope: `cpp/ccxt/**`, `cpp/tests/**` minus build artifacts, `cpp/CMakeLists.txt`, `build/cppTranspiler.ts`, `build/generateImplicitAPI.ts`, `ts/src/base/Exchange.ts`, `ts/src/binance.ts`, `ts/src/test/tests.ts`, static request+response binance fixtures, `package.json`, `run-tests.js`, `.github/workflows/cpp.yml`, `transpile-batches.sh`; script at `/tmp/cppreview_fingerprint.sh`). Captured at 01:30Z and 01:44Z — identical. **Use this value for future change detection.**

## Remaining review scope / known deferred work

- 206 new exchange headers/TUs: only bequant + binance compiled as probes and a handful of dispatch tails inspected. Per-exchange semantic review (signing, parsing, precision) is unreviewed; recommend spot-reviewing the `tu_*.cpp` batch rollouts incrementally.
- Crypto milestone still open: `ecdsa` (RFC-6979), `ethAbiEncode`, `ethEncodeStructuredData`, `ethGetAddressFromPrivateKey` (keccak-256), `starknetSign`, `convertToBigInt`, `getZKContractSignatureObj/TransferObj` are `NotSupported` stubs — any exchange whose sign path needs them fails at runtime with a clear error (deferred, documented in code).
- `test.cryptography.h` remains a hand-written subset stand-in pending a `transpileCryptoTests()` pipeline (the C# convention is machine transpilation with post-processing).
- Deferred-future lambda lifetime convention (`[=]`/`[this,...]` captures) — carried from prior passes; acceptable for the harness, needs a documented production convention.
- `curl_global_init` never called (fine on libcurl ≥ 7.84; CI ubuntu-24.04 has 8.x).
- Live gates (`run-tests.js --cpp`) and the miss-cache behavior under real exchange errors (CPP-011) are untestable until a fresh build exists.

## Recent review history

- **2026-09-05 (initial):** setup-session review at HEAD `9fd8ccd6a6`. Added CPP-001 with compiled reproduction.
- **2026-09-05T13:14Z (pass 2):** HEAD `2426f823d1`. CPP-001 extended to response comparator; added CPP-002/003/004. 39/39 base, 353/353 request, 64/64 response green (then-current binary).
- **2026-09-06 (pass 3):** HEAD `6761444924` + WIP restructure. CPP-001 fixed (superseded); CPP-004 moot. New: CPP-005 (P1 corruption, reproduced via isolated regenerate), CPP-006 (P1 casing), CPP-007 (P2 masking), CPP-008/009/010 (P3).
- **2026-09-06 13:36Z (pass 4):** no new changes; all findings re-verified present; fingerprint `e20d2e04…` (275 files).
- **2026-09-07 01:44Z (pass 5):** HEAD `3a985daf0f` + 208-file WIP. **Resolved:** CPP-005, CPP-006, CPP-007, CPP-010 (in the commit). **New:** CPP-011 (P2, miss-cache poisoning, uncommitted), CPP-012 (P3, intToBase16 negatives), CPP-013 (P3, formatting split). Still open: CPP-002, CPP-003, CPP-008, CPP-009. Verification: three g++ syntax-only probes of the current tree all exit 0; stale 17:44 binary not run; fingerprint `a6579e5c…` stable across the pass.
