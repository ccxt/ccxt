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
mod registry;
pub mod tests_support;  // public so transpiled base/ tests can reach it
pub mod test_helpers;   // hand-written harness helpers for the transpiled tests.rs
// Transpiled base tests (test.safeMethods.rs, test.precise.rs, …),
// generated from ts/src/test/base/. Behind a feature flag.
#[cfg(feature = "transpiled-tests")]
#[path = "../base/mod.rs"]
mod base_transpiled;
// `tests.rs` — the transpiled `TestMainClass` test harness, generated
// from `ts/src/test/tests.ts` by `tsx build/rustTranspiler.ts --testMain`.
mod tests;

use test_helpers::{getCliArgValue, getCliPositionalArg};
use tests::TestMainClass;

#[tokio::main]
async fn main() -> ExitCode {
    let run_base_tests = is_true(&getCliArgValue(Value::Str("--baseTests".to_string())));
    let ws_tests       = is_true(&getCliArgValue(Value::Str("--ws".to_string())));
    let verbose        = is_true(&getCliArgValue(Value::Str("--verbose".to_string())))
                      || is_true(&getCliArgValue(Value::Str("-v".to_string())));

    // ── base tests ──────────────────────────────────────────────────
    if run_base_tests {
        if let Err(e) = base_tests::run(ws_tests) {
            eprintln!("Hand-written base tests failed: {e}");
            return ExitCode::FAILURE;
        }
        println!("Hand-written base {} tests passed!", if ws_tests { "WS" } else { "REST" });
        #[cfg(feature = "transpiled-tests")]
        {
            println!("Running transpiled base tests:");
            if let Err(e) = base_transpiled::run_all() {
                eprintln!("Transpiled base tests failed: {e}");
                return ExitCode::FAILURE;
            }
            println!("Transpiled base tests passed!");
        }
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

    match outcome {
        Ok(_)  => ExitCode::SUCCESS,
        Err(_) => {
            eprintln!("test run failed (re-run with --verbose for details)");
            ExitCode::FAILURE
        }
    }
}
