// Rust language-specific tests — mirror of Go's `test.languageSpecific.go`.
//
// These verify Rust-only properties of the public API surface that the
// transpiled cross-language tests don't cover:
//
//   * `test_types_rest`  — typed REST wrapper compiles end-to-end and
//                          exposes inherited methods on alias exchanges
//                          (mirror of `go/tests/base/test.types.rest.go`).
//
// The futures returned by the typed methods are NEVER `.await`-ed —
// constructing them is the type-check; dropping them avoids any
// network traffic. Async fns in Rust are lazy, so an unpolled future
// is a no-op.

#![allow(unused_must_use, unused_variables, dead_code)]

use ccxt::{Binance, Myokx, Binanceusdm, Value};
use ccxt::types::{Trade, Order, Ticker};

/// Mirrors Go's `TestTypesRest`. Constructs a typed Binance, a typed
/// alias (Myokx → Okx), and a typed subclass (Binanceusdm → Binance);
/// proves each exposes the unified API surface with the right typed
/// return types. Inheritance is the load-bearing assertion here —
/// `Myokx::fetch_order_typed` is defined nowhere in `myokx_typed.rs`;
/// the wrapper picks it up because the generator walks the
/// `Deref<Target = OkxCore>` chain.
pub fn test_types_rest() -> Result<(), String> {
    // 1. Plain typed exchange.
    let mut binance = Binance::new(None);
    let _: std::pin::Pin<Box<dyn std::future::Future<Output = ccxt::Result<Vec<Trade>>> + '_>> =
        Box::pin(binance.fetch_trades("BTC/USDT", None, Some(5), Value::Null));

    // 2. Alias exchange: Myokx is a thin override of Okx
    //    (`MyokxCore: Deref<Target = OkxCore>`). The generator walks
    //    the Deref chain so `fetch_order_typed` is present on `Myokx`
    //    even though `myokx.rs` doesn't define `fetch_order` directly.
    let mut myokx = Myokx::new(None);
    let _: std::pin::Pin<Box<dyn std::future::Future<Output = ccxt::Result<Order>> + '_>> =
        Box::pin(myokx.fetch_order("iddd", Some("BTC/USDT"), Value::Null));

    // 3. Subclass: Binanceusdm inherits its typed surface from Binance.
    let mut binusdm = Binanceusdm::new(None);
    let _: std::pin::Pin<Box<dyn std::future::Future<Output = ccxt::Result<Ticker>> + '_>> =
        Box::pin(binusdm.fetch_ticker("BTC/USDT:USDT", Value::Null));

    Ok(())
}

/// Aggregator entry point — mirror of Go's `TestLanguageSpecific`.
/// Currently just runs the typed-surface checks. Future Rust-only
/// suites land here too (proxy plumbing, runtime panic bridging, …).
pub fn run() -> Result<(), String> {
    test_types_rest()?;
    Ok(())
}
