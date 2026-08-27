# Rust target re-review

**Reviewed:** 2026-07-25

**Current HEAD:** `99906bd05461b5c78e71c2acbf28c137eef1ffb5`

**Previous reviewed HEAD:** `be36094dd5d87362d417896488030c7e4c0d55f7`

**Scope:** commit `99906bd054` (`rust: fix static-dispatch regressions from the re-review`) plus the current runtime, generated REST/prediction/Pro/API output, typed wrappers, generators, tests, package, examples, documentation, and CI. This was an offline review; no live or funded exchange operations were run.

## Verdict

The static-trait architecture introduced at `be36094dd5` remains the correct structural direction. Commit `99906bd054` successfully repairs the release-gate regressions identified in that review: typed wrappers no longer use obsolete Pin/unsafe/bind scaffolding, the 11 affected alias wrappers regain inherited typed methods, and the examples plus scoped library Clippy gate are repaired. These are substantive fixes, not comment-only changes.

The target is still **not ready to be called a safe or generally supported Rust CCXT implementation**. Three independent unsafe/semantic P0 classes are unchanged: shared-reference-to-mutable coercion, error loss at transport/typed boundaries, and detached copy-on-write mutation. Generated WebSocket output remains largely structural rather than operational. Static async dispatch also still overloads `Value::Null` as its “no derived override” sentinel, so a legitimate null result can fall through and execute a base implementation. The latest commit fixes important integration regressions but intentionally leaves these architectural blockers out of scope.

Recommended release boundary:

- do not publish to crates.io yet;
- do not describe Pro/WebSocket as supported;
- do not describe the target as safe while `coerce_to_mut_unsafe`/`coerce_value_to_mut` remain;
- keep private/trading support explicitly exchange-scoped and fail closed for missing cryptography;
- make generation, examples, Clippy, rustfmt, ID tests, and generated Pro tests mandatory before changing the status from preview.

## Delta since the previous review

| Area | Current status | Evidence |
|---|---|---|
| Lifetime-erased/raw-pointer dispatch | **Resolved** | static trait dispatch replaced the raw Core pointers and manual `Send`/`Sync`; no production `derived_core_ptr`/`bind_derived`/async pointer trampoline remains |
| Static-dispatch inheritance/virtual routing | **Improved, semantic sentinel defect remains** | representative REST, prediction, Pro, two-hop implicit-API, and alias-wrapper parent routes are generated correctly; 239 generated async-virtual preambles still treat `Value::Null` as “no override” |
| Ordinary generated `&self -> &mut Self` receiver casts | **Resolved** | the old generated receiver casts remain absent |
| Base/shared-`Value` mutable coercions | **Open and unchanged, still P0** | three active base Exchange coercion call sites and 137 generated `Value` coercion sites across 59 files remain |
| Rate limiting | **Normal request path resolved; option semantics incomplete** | `fetch_typed`/`request_typed` throttle and `describe().rateLimit`/config precedence is tested; algorithm selection and dynamic property updates remain ineffective |
| Sandbox mode | **Resolved for the reviewed path** | `super_set_sandbox_mode` now routes to the real sandbox implementation; a Binance URL-swap unit test passes |
| `BorrowInterest` typed result | **Resolved** | distinct domain type and wrapper return mapping are present |
| Malformed order-book rows | **Resolved for typed conversion** | malformed/non-finite rows are dropped and a unit test passes |
| EIP-712 integer validation | **Partially resolved** | in-range and overflow behavior for valid `intN`/`uintN` widths is tested; malformed/invalid width declarations are silently treated as 256-bit |
| Catch/retry lowering | **Substantially improved, not fully proven** | generated `fetch_web_endpoint` retains retry/catch-oriented flow; lowering is still syntax-driven and lacks broad behavioral coverage |
| Machine-local Claude settings | **Resolved** | tracked `.claude/settings.local.json` was removed |
| Typed wrapper ownership | **Resolved** | all 104 wrappers now use `Box<Core>` with safe `&mut` projection; wrapper Pin, `get_unchecked_mut`, bind calls, and stale raw-pointer comments are gone |
| Examples | **Resolved for compilation; warning cleanup remains** | all five bins compile, but there are seven unique warnings; six were induced by this commit (five unused trait imports and one unnecessary `mut`) |
| Typed aliases | **Resolved for the reported regression** | all 11 affected alias wrappers regained `fetch_markets` and `fetch_currencies`; parent-inherited methods route through generated parent `call_dynamic` fallback |
| Scoped library Clippy/public async warning flood | **Resolved for the declared single-task contract** | three hand-written doc-comment failures were fixed and `async_fn_in_trait` is explicitly allowed with the non-`Send` future contract documented |
| ID tests | **Open** | Paradex still reaches unsupported StarkNet signing and fails the expected `CCXT` header assertion |

---

## P0 — must fix before any safety claim

## 1. Eliminate every shared-reference-to-mutable coercion

The pointer-based derived dispatcher is gone, but the codebase still manufactures mutable references from shared references:

- `rust/ccxt/src/exchange_stubs.rs` has three active `coerce_to_mut_unsafe(self)` call sites in base helpers;
- `rust/ccxt/src/runtime.rs` still exposes `coerce_value_to_mut`;
- current generated output contains 137 `coerce_value_to_mut(...)` call sites across 59 files.

This remains a Rust soundness blocker. A caller can hold a valid shared reference while generated code creates a mutable reference to the same object. Compilation, pinning, single-threaded tests, or a lack of observed crashes does not satisfy Rust's aliasing contract.

Do not replace these with another centralized unsafe cast. Change the generated signatures and dataflow so mutation requires `&mut Value`, or redesign `Value` around explicit safe interior mutability with a documented concurrency model. Add a CI search that rejects new coercion sites and drive the count to zero.

## 2. Preserve errors through transport, dynamic dispatch, and typed decoding

`ExchangeRuntime::fetch` still converts every `fetch_typed` error into `Value::Null`. That collapses timeout, DNS/TLS, proxy, authentication, exchange errors, and malformed-response cases into an ordinary value.

Other gaps remain:

- `fetch_typed` runs `handle_errors` only on non-success HTTP status; exchanges that report errors in an HTTP-200 body can bypass exchange-specific classification;
- a successful non-JSON body becomes `Value::Str`, which downstream typed decoders can turn into default/empty structures;
- many `from_value` conversions use defaults for missing or wrong-typed required fields;
- generated dynamic methods return `Value`, so panics are still the internal error channel and `call_typed` has to recover them at the outer boundary.

The raw/dynamic layer should return `Result<Value, ExchangeError>` for fallible operations. Preserve the original cause and status/body context. Run `handle_errors` according to each exchange's semantics even when HTTP status is 2xx. Typed conversion should be fallible and path-aware rather than silently constructing a plausible default object.

## 3. Replace detached copy-on-write mutation with explicit writeback

`Value` is copy-on-write, but generated code still mutates clones of values pulled from a parent structure. The current scan finds 574 relevant mutation sites, including 78 direct field-clone mutation patterns; these totals are unchanged from the previous reviewed snapshot. Additional local-variable/get-value shapes exist beyond that direct pattern.

Typical failure modes are:

- mutating `&mut self.some_field.clone()` and discarding the clone;
- cloning a nested object with `get_value`, mutating it, and never storing it back;
- mutation helpers operating on temporary values produced by access rewrites;
- append/remove operations that pass tests only when a special regex repair happens to recognize the exact source shape.

The generator needs lvalue-aware lowering: identify the owned root, clone only when necessary, mutate a local, and emit deterministic writeback through every parent path. This belongs in an AST/IR mutation pass with tests, not a growing catalog of regexes.

## 4. Do not expose generated WebSocket methods until callbacks and transport work

The Pro tree still contains 24 callback table entries set to `Value::Null` across seven generated exchange files. `Value::call` still returns `Value::Null`, so even a non-null callable-shaped value cannot execute a handler. Client/send/spawn/watch/unwatch paths remain incomplete or no-op, and generated methods can compile while never delivering subscription data.

The passing base WS suite checks hand-written cache/order-book primitives. It does not prove generated venue subscriptions work. There is still no Rust equivalent of the generated TypeScript Pro venue-method suite.

Either keep `transpiled-ws` explicitly experimental and hide unsupported venue methods, or implement a callable representation, callback invocation, connection lifecycle, send/receive loop, subscription routing, reconnect/resubscribe, cancellation, and exception propagation. Add deterministic mock-server integration tests before enabling a venue.

---

## P1 — correctness, API, generator, and release blockers

## 5. Keep static dispatch, replace the null sentinel, and document the trait surface

The static trait architecture is the correct direction for soundness. Commit `99906bd054` restores the checked-in consumers by importing `ExchangeBase`/`ExchangeRuntime` and by calling sandbox/demo methods on the concrete Core. The README typed quick-start also compiles in a temporary external edition-2021 consumer using a current-thread Tokio runtime. This proves the intended typed surface can be consumed, and the examples now serve as useful import guidance for direct Core use.

The dispatch result protocol also overloads `Value::Null` as “this tier has no override.” Base async preambles return a derived value only when it is non-null; a real exchange override that legitimately returns JSON/null is therefore indistinguishable from a miss and falls through to a parent/base implementation. Depending on the method, that can cause duplicate work, a second request, or a `NotSupported` panic. Use an explicit result such as `OverrideResult::NotImplemented | Implemented(Value)` instead of reserving a valid CCXT value as control flow.

The remaining consumer issue is documentation and API stability. The README says the typed wrapper's read-only Deref exposes the full dynamic surface, but most dynamic methods require mutable access and one of the public traits to be in scope. Decide whether the supported API is typed-wrapper-only, public Core plus trait imports, or stable inherent forwarders. Document that contract, provide a prelude if trait imports are intentional, and compile README snippets plus a small downstream consumer in CI.

## 6. Preserve repaired typed-wrapper inheritance and remove output-driven discovery

The reported wrapper regressions are fixed:

- `parseParents` recognizes each generated Core's `pub parent: ...Core` field;
- the 11 affected aliases again expose `fetch_markets` and `fetch_currencies`;
- parent-inherited methods route through `call_dynamic`, whose generated fallback delegates to the parent Core;
- all 104 wrappers store `Box<Core>` and use ordinary safe `&mut` access;
- there are zero wrapper `Pin<Box<_>>`, `get_unchecked_mut`, or bind call sites.

The architectural concern is narrower now: the wrapper generator still discovers inheritance and callable methods by parsing previously generated Rust. `discoverDefinedMethods` also regexes every matching `fn`, and the typed aggregator is built from whatever `_typed.rs` files happen to exist on disk. This retains clean-build order dependence and stale-file risk. Carry parentage and method ownership from TypeScript AST/IR metadata instead, generate into a temporary tree, and add API-surface snapshots for parent/alias pairs.

## 7. Make typed wrappers faithful and fallible

The new `BorrowInterest` type and malformed-order-book-row filter are good targeted fixes, but the typed layer still has systemic parity gaps:

- `fetch_partial_balance` is still modeled as a full `Balances` return;
- `Option` arguments are converted to explicit `Value::Null`; generated base methods use positional defaulting, so an explicit null can suppress the TypeScript default (for example timeframe defaults);
- wrong-shaped/null responses frequently decode to empty vectors or default structs rather than `Err`;
- required fields can silently become empty strings, zeroes, or `None`;
- parent-inherited typed methods now route dynamically and therefore still inherit the dynamic layer's null-sentinel, panic, and default-decoding limitations.

Generate typed signatures from authoritative unified-method metadata rather than return-name heuristics. Preserve omitted versus explicit null where TypeScript distinguishes them. Make conversion return `Result<T, DecodeError>` with a field path and expected/actual type. Add compile-time signature tests and malformed-shape tests.

## 8. Preserve the resolved normal request limiter path and finish option semantics

Commit `8cd14b8486` is a substantial improvement:

- normal implicit endpoint requests now reach `request_typed`, which calls `throttle` before signing/fetching;
- venue `describe().rateLimit` is applied during Core initialization;
- an explicit config `rateLimit` wins over the venue default;
- unit tests cover Binance initialization, config override, disable behavior, and spacing.

The normal generated HTTP path is now wired correctly. Remaining gaps and hardening work are:

- `rateLimiterAlgorithm` is still ignored;
- dynamic `set_property` updates do not update the typed `rate_limit` field, so exchange logic that changes the limit at runtime (for example MEXC-style adaptations) can be ineffective;
- prediction/RPC helpers contain direct raw-`fetch` paths; establish and document whether those are intentionally low-level, parity-compatible bypasses rather than ordinary rate-limited endpoint calls;
- there is no end-to-end test proving two generated implicit API calls apply endpoint cost as well as the configured limiter.

Keep the current `fetch_typed` integration and config precedence covered. Define the supported algorithm contract, make runtime updates coherent, and test the actual generated request path with a fake clock/mock transport. The existing unit tests establish spacing and configuration, but not every endpoint-cost/dynamic-update behavior.

## 9. Replace regex repair with AST/IR semantics and make clean generation self-contained

The generator now emits a much safer dispatch architecture, but it does so through more post-transpile regex and scans of previously generated Rust:

- async propagation discovers function names by regex from generated files;
- base-method classification scans `exchange_generated.rs`, `exchange_stubs.rs`, and `exchange.rs`;
- parent-hop routing scans generated Core/API files;
- inherited `self.method(...)` calls are rewritten by regex and name sets;
- mutation, default arguments, callback erasure, catches, and test adaptation remain post-processing passes;
- typed wrapper parent discovery now matches the new output shape, but still derives source semantics by regex-parsing generated Rust.

This creates order dependence and makes a dirty-tree successful generation weaker evidence than a clean-tree run. Move inheritance, method resolution, asyncness, lvalues, defaults, catches, callbacks, and API metadata into a typed intermediate representation. CI should generate from a source-only clean checkout in one documented command, run it twice, and require byte-identical output with no stale artifacts.

The current base-name classifier is also over-broad: it regex-scans whole files and admits 59 free/helper/test function names that are not receiver methods. No checked-in bare `self.<name>()` call currently collides with those 59 names, so this is a latent resolution bug rather than a demonstrated misdispatch, but it shows why method ownership must come from structured metadata.

Representative static routes do look correct: Binance base-to-derived market loading, Polymarket's prediction-tier fallback, and Kucoin Futures' two-hop Pro-to-REST implicit API calls all resolve to the expected generated implementation. Preserve those cases as golden and behavioral tests while replacing the textual resolver.

## 10. Keep unsupported operations and capability metadata aligned

`super_set_sandbox_mode` now works and unsupported StarkNet signing still fails closed, both of which are correct. However, the target continues to expose methods/capabilities whose required primitives are not implemented. The ID suite declares 27 cases but stops at case 20: Paradex reaches `starknetSign()` and then fails the expected `CCXT` header assertion, leaving the seven later cases unexecuted. Other cryptographic/protocol stubs remain for Dydx, Lighter, Apex, curve25519/Axolotl, and related paths.

Do not replace these with null/no-op success. Either implement and verify the primitive, or gate the exchange/method and update Rust-specific capability/test expectations so unsupported behavior is explicit. The package README currently says the offline ID suite passes; that statement is false at this HEAD.

## 11. Make test accounting measure generated and executed behavior

The offline static suites are broad and useful, but their success does not cover several critical paths:

- Cargo runs 20 library tests and 3 harness tests, with zero doctests;
- the base REST runner reports pass/fail but no case count; source accounting finds 60 generated, eight handwritten, and one language-specific entry-point call;
- the harness `base_ws_suite` still reports success through a hand-written gate rather than generated Pro venue behavior;
- the generated base WS surface contains only two entry points (`cache` and `orderBook`);
- `test.close.rs` is not wired into the base WS module;
- there are no generated Rust Pro exchange method tests;
- `test.createOrder` and `test.proxies` are explicitly skipped by the exchange-test transpiler;
- tests-only and WS generation entry paths can bypass the full dropped-test summary;
- REST static suites disable `grvt`, `extended`, `mudrex`, and `lighter`.

Emit structured generated/compiled/executed/skipped counts per source suite and fail when an expected test is absent. Add inheritance/static-dispatch tests across base → REST parent → REST alias and base → REST → Pro, including nested virtual calls and implicit APIs. Add negative tests for transport error preservation, COW writeback, invalid typed shapes, and WebSocket callbacks.

## 12. Restore authoritative CI gates

The current CI workflow has useful isolated feature checks, package verification, examples, base/static suites, and a scoped Clippy step. Commit `99906bd054` restores the two gates it targeted: standalone examples compile and the exact scoped library Clippy command passes with `-D warnings`. The deliberate non-`Send` async-trait contract is now documented and its advisory warning is explicitly allowed.

Remaining red or incomplete gates are:

- full-workspace strict Clippy fails with 10 test-harness errors;
- strict rustdoc fails on five `invalid-html-tags` errors in `exchange.rs` (`<scope>` twice, `<verb>` twice, and `<subscope>` once);
- `cargo fmt --manifest-path rust/Cargo.toml --all -- --check` fails with 1,413,190 lines of diff output;
- the ID suite still fails at Paradex;
- examples compile but emit seven unique warnings; six come from the latest fix commit;
- the CI-labelled `npm run buildRust --tests` step expands to the same plain `cargo build` as `npm run buildRust`; `--tests` is not forwarded to Cargo;
- CI still lacks generated Pro venue tests and clean/deterministic generation;
- package success is not publication readiness.

CI also does not currently gate the explicit default-feature check, workspace all-target/all-feature check and tests, workspace strict Clippy, prediction fixtures, package verification, strict rustdoc, or rustfmt.

Make every advertised command required after establishing a format strategy that is enforceable. Generated files may use scoped lint allowances where justified, but hand-written runtime, harness, and generator code should not hide correctness or suspicious lints.

---

## P2 — hardening and publication work

## 13. Complete numeric and ABI validation

The new BigInt range checks correctly reject negative unsigned values and overflows for valid widths; tests cover `uint8`, `int8`, `uint64`, and `uint256` boundary cases. The implementation does **not** validate the declared type width itself:

```text
digits.parse().unwrap_or(256)
invalid width -> width = 256
```

Therefore `uint7`, `int0`, `uint264`, and malformed suffixes are accepted as 256-bit instead of rejected. Invalid numeric strings also become zero through `unwrap_or_default`. Separately, JSON integers above `u64::MAX` still fall back to `f64`, which can lose identifier precision.

Reject malformed ABI/EIP-712 type declarations and malformed values explicitly. Preserve arbitrary-size JSON integers as decimal strings or BigInt-backed values. Add tests for invalid widths/suffixes and values beyond `u64::MAX`.

## 14. Define clone and state-sharing semantics

Core/Exchange cloning still does not mean "a second equivalent exchange instance." Internal clients/limiter/dispatch state and caches can be reset, detached, or behaviorally different. The old stale-pointer problem is gone, but silent semantic divergence remains.

Prefer no `Clone` for stateful exchange objects. If cloning is required, specify whether credentials, markets, limiter state, HTTP client, WS subscriptions, and caches are shared or copied, and test that contract.

## 15. Finish documentation and public-surface cleanup

Commit `99906bd054` removes the stale raw-pointer/pinning comments from typed wrappers, updates Cargo/lib feature descriptions, removes the obsolete unsafe `call_method` doc block, and documents the deliberate non-`Send` native-async-trait contract. Remaining user-facing drift is still material:

- the README claims all offline conformance suites, including ID, pass;
- the README claims read-only Deref exposes the full dynamic mutable surface without documenting the required traits;
- contributor documentation still describes Rust CI as unwired;
- no stable REST/prediction/Pro/private/typed support matrix exists.

Correct those claims and compile documentation examples. If non-`Send` futures are the intended stable contract, make that visible in user documentation rather than only in a crate-level lint comment.

## 16. Finish package/release integration

`cargo package --locked --allow-dirty` passes and verifies 422 files, about 39.8 MiB unpacked / 4.6 MiB compressed. Metadata and crate README exist. Remaining publication work includes:

- package size remains high;
- locked `spin 0.9.8` is yanked;
- no crates.io publication/release policy is documented;
- rustfmt and the ID suite remain red even though examples and scoped library Clippy are repaired;
- no stable support matrix exists for REST, prediction, Pro, private operations, typed/dynamic APIs, or exchange-specific cryptography;
- root README/user-facing language skills do not present Rust alongside mature targets.

Do not publish until safety and semantic boundaries stabilize and all release gates pass from the packaged artifact.

---

## Verification performed at `99906bd054`

| Command/suite | Result |
|---|---|
| isolated crate check, no default features | **Passed** |
| isolated crate check, default features | **Passed** |
| isolated crate check, all features | **Passed** |
| workspace/all-target/all-feature check using `rust/Cargo.toml` | **Passed** |
| `cargo test --workspace --all-features` using `rust/Cargo.toml` | **Passed:** 20 library + 3 harness tests; 0 doctests |
| standalone examples, all targets | **Passed**, with unused-import/unused-mut/dead-code warnings |
| README typed quick-start in an external path-dependent consumer | **Passed** (compile-only, current-thread Tokio runtime) |
| exact scoped library Clippy with `-D warnings` | **Passed** |
| full-workspace/all-target/all-feature Clippy with `-D warnings` | **Failed:** 10 test-harness errors |
| strict rustdoc (`RUSTDOCFLAGS=-Dwarnings`) | **Failed:** 5 `invalid-html-tags` errors |
| rustfmt check | **Failed:** 1,413,190 lines of formatter diff |
| package generation/verification | **Passed:** 422 files, 39.8 MiB unpacked / 4.6 MiB compressed; yanked `spin 0.9.8` warning |
| exact CI `npm run buildRust` | **Passed** |
| exact CI `npm run buildRust --tests` | **Passed, but misleading:** `--tests` is not forwarded; repeats plain `cargo build` |
| base REST suite | **Passed** |
| base WS suite | **Passed** (base harness only, not generated Pro venues) |
| REST static request suite | **Passed:** 4,280 cases; 4 exchanges disabled |
| REST static response suite | **Passed:** 1,392 cases; 4 exchanges disabled |
| prediction static request suite | **Passed:** 42 cases |
| prediction static response suite | **Passed:** 32 cases |
| ID suite, verbose | **Failed:** Paradex unsupported StarkNet signing / missing expected `CCXT` header |
| live/funded tests | **Not run** |

The successful compile, package, and static-fixture results are meaningful regression evidence. They do not establish Rust aliasing soundness, error fidelity, COW writeback correctness, generated WebSocket operation, or complete typed parity.

## Recommended remediation order

1. Keep the static trait dispatcher; replace the null sentinel and add inheritance/virtual-call tests.
2. Remove all shared-to-mutable coercions.
3. Preserve `Result` from transport through typed decoding and classify HTTP-200 exchange errors.
4. Replace detached COW mutations with IR-level lvalue/writeback generation.
5. Implement or hide generated WebSocket callbacks and transport.
6. Make typed decoding/defaults fallible and faithful.
7. Move generator repair and wrapper discovery to typed AST/IR metadata; require clean deterministic generation.
8. Complete rate-limiter runtime updates and end-to-end request tests.
9. Align unsupported capabilities/tests and complete ABI/numeric validation.
10. Restore the ID suite and establish an enforceable rustfmt gate.
11. Document the Core/trait public surface and compile README/downstream consumer snippets.
12. Expand generated test accounting, Pro tests, support docs, and publication gates.