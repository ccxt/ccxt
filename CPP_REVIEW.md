# C++ implementation review

- **Last checked (UTC):** 2026-09-05T10:38:59Z
- **Repository:** `/root/new-lang/ccxt` — Claude's observed working directory, not `/root/ccxt`.
- **Reviewed HEAD:** `9fd8ccd6a64f68a6e3296e7de70ae3c3ba15d586`, plus uncommitted changes.
- **Review mode:** comments only; no implementation changes, regeneration, staging, commits, live requests, or real credentials.
- **Schedule:** Hermes job `ccxt-cpp-review` (`f9f3fa4855bd`), **every 12 hours**, pinned to **`openai-codex / gpt-6-astra`** (the setup chat's model), not the default model. Updated at the user's request; next scheduled attempt is 2026-09-05T22:57:28Z. This initial report was written by the setup session. The separately triggered automated review failed at 2026-09-05T10:55:09Z with HTTP 429 (account rate limit), before producing a review. The job remains enabled. Schedule/model changes do not advance the Last checked timestamp or change the findings below.
- **Verdict:** one confirmed P2 test-harness defect in the reviewed slice; this is not approval of the complete C++ port.

## Open findings

### CPP-001 — P2 — Preserve primitive types when comparing JSON-valued request fields

**Location:** `cpp/tests/StaticTests.h:174-178`, reached through `sameScalarOrJson` at `182-202`.

`sameAnyImpl` compares leaf values by converting both to text. Consequently it accepts a JSON number in place of a string, or a boolean in place of a string, when their rendered text matches. This affects JSON inside form fields such as Binance `batchOrders`: the newly added recursive comparison can report success while the request's JSON types have changed.

This differs from the TypeScript request harness: `ts/src/test/tests.ts:1560-1578` parses JSON-valued form fields, and `1732-1735` compares request primitives with strict equality. This is a confirmed comparator false positive, **not** evidence that current generated requests already contain incorrect types.

**Executed reproduction:** `/root/workspace/.ccxt-review-verification/probe.cpp` includes the actual current `StaticTests.h` and calls `sameScalarOrJson` with these synthetic negative regression cases:

| Expected JSON | Actual JSON | Observed comparator result |
|---|---|---|
| `[{"quantity":"0.1"}]` | `[{"quantity":0.1}]` | accepted (`true`) |
| `[{"reduceOnly":"true"}]` | `[{"reduceOnly":true}]` | accepted (`true`) |

**Recommended change:** compare value categories before leaf contents. Request comparison must distinguish string, boolean, number, null/undefined, object, and array, while mapping C++ numeric representations consistently to the JavaScript Number category. Do not require identical C++ `std::any` numeric storage types. Add negative tests for the cases above and positive tests for valid nested JSON with reordered keys and skipped nondeterministic fields.

## Verified resolved findings

None; this is the initial review.

## Verification

Commands below were executed from `/root/new-lang/ccxt` unless an absolute path is shown.

| Check | Actual result |
|---|---|
| `git diff --check -- cpp build/cppTranspiler.ts` | exit 0 |
| `make -q -C cpp/build ccxt-static-binance ccxt-tests ccxt-value-tests` | exit 0 before and after tests; dependency graph considered targets up to date |
| `timeout 20s ./cpp/build/ccxt-value-tests` | exit 0; value-model tests passed |
| `timeout 30s ./cpp/build/ccxt-tests --baseTests` | exit 0; **39/39** core tests passed; **23** explicitly staged |
| `timeout 45s ./cpp/build/ccxt-static-binance --requestTests` | exit 0; **353 passed, 0 failed, 3 skipped** |
| Compile/run comparator probe below | both exit 0; both incorrect-type comparisons accepted |

```sh
timeout 75s g++ -std=c++17 -O0 -I/root/new-lang/ccxt/cpp \
  /root/workspace/.ccxt-review-verification/probe.cpp \
  /root/new-lang/ccxt/cpp/build/libccxt.a -lcrypto -lcurl -pthread \
  -o /root/workspace/.ccxt-review-verification/probe
timeout 15s /root/workspace/.ccxt-review-verification/probe
```

Exact probe output:

```text
quoted quantity versus JSON number accepted=1 reason=
quoted reduceOnly versus JSON boolean accepted=1 reason=
```

Static-request output: `/root/workspace/ccxt-review-static-request.log`.
Additional evidence: `/root/workspace/.ccxt-review-verification/initial-evidence.md`.

**Limitations:** existing binaries were used after read-only dependency freshness checks, not a clean independent rebuild. No CTest invocation, sanitizer run, all-language matrix, or live exchange test was performed. The probe compiled the current test helper but linked the existing base library. Passing request fixtures do not establish completeness or exclude the false positive above.

## Scope and snapshot

Inspected current diffs in `build/cppTranspiler.ts`, `cpp/ccxt/base/ExchangeBase.cpp`, and `cpp/tests/StaticTests.h`; the CMake test definitions and offline runners; relevant TypeScript comparison code. The much larger generated `cpp/ccxt/exchanges/binance.h` diff was not exhaustively reviewed.

**Scoped content fingerprint:** `bb73cdb33f9a5cc9491dea576853d43c8a8a64ffc63b1189bebd116f52121513` over **203 files** plus HEAD. It is SHA-256 of compact JSON `{"HEAD":<hash>,"files":[[<path>,<SHA-256 file bytes>],...]}`, paths sorted lexically. Scope: files under `cpp/ccxt/` and `cpp/tests/`, plus `cpp/CMakeLists.txt`, `build/cppTranspiler.ts`, `ts/src/base/Exchange.ts`, `ts/src/binance.ts`, `ts/src/test/tests.ts`, `ts/src/test/static/request/binance.json`, `package.json`, and `run-tests.js`. Build artifacts and this report are excluded. Fingerprinting is change detection, not a claim that all scoped files were reviewed.

This was an in-progress checkout, not an immutable source snapshot. HEAD was unchanged across inspection and dependency freshness checks passed both before and after execution; a complete start/end content fingerprint was not captured in this initial setup pass. Subsequent passes should capture both to detect concurrent edits.

## Remaining review scope / known deferred work

- Review generator dispatch/default-argument behavior against TypeScript, including explicitly undefined optional arguments, and inspect the generated Binance diff in bounded slices.
- Extend review to lifetime/ownership and deferred async behavior, precision, signing/encoding, error handling, and CI integration.
- `cpp/tests/static_binance.cpp:198-216` explicitly skips response fixtures pending a mockable transport. Response parsing is **not verified** by the request-test success above. Treat this as declared incomplete work, not a newly introduced defect.
- The base runner explicitly stages 23 tests; do not describe the core subset as full base-test coverage.

## Recent review history

- **2026-09-05:** Initial setup-session review. Added CPP-001 with a compiled reproduction. Offline value-model, core-base, and static-request checks passed as recorded above. Recurring reviews enabled every 30 minutes.
