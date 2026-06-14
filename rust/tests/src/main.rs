// CCXT Rust – test runner entry point.
//
// Thin entry point — mirrors `go/tests/main.go`. All the test logic
// lives in the transpiled `TestMainClass` (`tests.rs`, generated from
// `ts/src/test/tests.ts`). `main` only:
//   * routes `--baseTests` to the base-test suites, and
//   * otherwise hands off to `TestMainClass::init(exchange, symbol, method)`.

#![allow(dead_code)]

use std::process::ExitCode;
use ccxt::Value;
use ccxt::runtime::is_true;
use futures::FutureExt;

mod assertions;
mod base_tests;
mod fixtures;
mod language_specific;
mod registry;
pub mod tests_support;       // public so transpiled base/ tests can reach it
pub mod test_helpers;        // hand-written harness helpers for the transpiled tests.rs
pub mod live_dispatch;       // one persistent real Core per id for live tests
pub mod pro_test_helpers;    // hand-written ws_deep_equal used by transpiled WS tests
// Transpiled base tests (test.safeMethods.rs, test.precise.rs, …),
// generated from ts/src/test/base/. Behind a feature flag.
#[cfg(feature = "transpiled-tests")]
#[path = "../base/mod.rs"]
mod base_transpiled;
// Transpiled WS base tests (test.cache.rs, test.orderBook.rs, test.close.rs),
// generated from ts/src/pro/test/base/. Same feature flag as REST.
#[cfg(feature = "transpiled-tests")]
#[path = "../base_ws/mod.rs"]
mod base_ws_transpiled;
// Transpiled exchange tests (unified-method tests + structure
// validators), generated from ts/src/test/Exchange/. Behind its own
// feature while the harness surface (ExchangeOps, validators) is
// completed — keeps base + id tests building meanwhile.
#[cfg(feature = "exchange-tests")]
#[path = "../exchange/mod.rs"]
pub mod exchange_transpiled;
// `tests.rs` — the transpiled `TestMainClass` test harness, generated
// from `ts/src/test/tests.ts` by `tsx build/rustTranspiler.ts --testMain`.
mod tests;

use test_helpers::{getCliArgValue, getCliPositionalArg};
use tests::TestMainClass;

#[tokio::main]
async fn main() -> ExitCode {
    // Install the heavy-field live-lookup callback in the ccxt crate so
    // `exchange.markets` / `.markets_by_id` reads on the test snapshot
    // resolve straight off the cached Core instead of deep-cloning the
    // entire ~4k-entry markets Map on every helper invocation.
    live_dispatch::init_live_lookup();
    let run_base_tests = is_true(&getCliArgValue(Value::Str("--baseTests".to_string())));
    let ws_tests       = is_true(&getCliArgValue(Value::Str("--ws".to_string())));
    let verbose        = is_true(&getCliArgValue(Value::Str("--verbose".to_string())))
                      || is_true(&getCliArgValue(Value::Str("-v".to_string())));

    // ── base tests ──────────────────────────────────────────────────
    // Mirrors `go/tests/main.go`: run the transpiled `baseTestsInit()`
    // aggregator (generated from `ts/src/test/base/tests.init.ts`) and
    // fail on the first panicking assertion.
    if run_base_tests {
        if let Err(e) = base_tests::run(ws_tests) {
            eprintln!("Hand-written base tests failed: {e}");
            return ExitCode::FAILURE;
        }
        // Rust language-specific tests — mirror of Go's `TestLanguageSpecific`.
        // Runs the typed-surface compile-checks (test.types.rest) before the
        // transpiled base suite. Skipped under `--ws` for parity with Go.
        if !ws_tests {
            if let Err(e) = language_specific::run() {
                eprintln!("Language-specific tests failed: {e}");
                return ExitCode::FAILURE;
            }
        }
        #[cfg(feature = "transpiled-tests")]
        if !ws_tests {
            if !verbose {
                std::panic::set_hook(Box::new(|_| {}));
            }
            let outcome = std::panic::AssertUnwindSafe(
                base_transpiled::baseTestsInit()
            ).catch_unwind().await;
            let _ = std::panic::take_hook();
            if let Err(e) = outcome {
                let msg = e.downcast_ref::<String>().map(|s| s.as_str())
                    .or_else(|| e.downcast_ref::<&str>().copied())
                    .unwrap_or("<panic>");
                eprintln!("Base tests failed: {msg}");
                return ExitCode::FAILURE;
            }
        }
        // WS base tests: same panic-shield model, runs the transpiled
        // `run_all()` aggregator emitted by
        // `build/rustTranspiler.ts::writeBaseTestsWsModFile`.
        #[cfg(feature = "transpiled-tests")]
        if ws_tests {
            if !verbose {
                std::panic::set_hook(Box::new(|_| {}));
            }
            let outcome = std::panic::catch_unwind(std::panic::AssertUnwindSafe(
                || base_ws_transpiled::run_all()
            ));
            let _ = std::panic::take_hook();
            if let Err(e) = outcome {
                let msg = e.downcast_ref::<String>().map(|s| s.as_str())
                    .or_else(|| e.downcast_ref::<&str>().copied())
                    .unwrap_or("<panic>");
                eprintln!("Base WS tests failed: {msg}");
                return ExitCode::FAILURE;
            }
        }
        println!("Base {} tests passed!", if ws_tests { "WS" } else { "REST" });
        return ExitCode::SUCCESS;
    }

    // ── delegate to the transpiled TestMainClass ────────────────────
    // The static request/response paths dispatch through the registry,
    // whose offline exchanges raise expected parse-step panics that are
    // caught internally — silence the default panic hook so they don't
    // spam stderr (`--verbose` keeps it for debugging).
    if !verbose {
        std::panic::set_hook(Box::new(|_| {}));
    }

    let mut tests = TestMainClass::new();
    let argv_exchange = getCliPositionalArg(Value::Int(0));
    let argv_symbol   = getCliPositionalArg(Value::Int(1));
    let argv_method   = getCliPositionalArg(Value::Int(2));

    let outcome = std::panic::AssertUnwindSafe(
        tests.init(argv_exchange, argv_symbol, argv_method)
    ).catch_unwind().await;

    // NB: the live method-test path calls `exitScript(0)` from inside
    // TestMainClass (transpiled `tests.rs`) which `std::process::exit`s
    // before returning here — so a successful live run prints its
    // completion line from `exitScript`, not from this match.
    match outcome {
        Ok(_)  => ExitCode::SUCCESS,
        Err(_) => {
            eprintln!("test run failed (re-run with --verbose for details)");
            ExitCode::FAILURE
        }
    }
}

