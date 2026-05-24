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
pub mod live_dispatch;  // one persistent real Core per id for live tests
// Transpiled base tests (test.safeMethods.rs, test.precise.rs, …),
// generated from ts/src/test/base/. Behind a feature flag.
#[cfg(feature = "transpiled-tests")]
#[path = "../base/mod.rs"]
mod base_transpiled;
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

    match outcome {
        Ok(_)  => ExitCode::SUCCESS,
        Err(_) => {
            eprintln!("test run failed (re-run with --verbose for details)");
            ExitCode::FAILURE
        }
    }
}
