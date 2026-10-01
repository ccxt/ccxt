// CCXT Rust – ccxt-base library root
//
// Re-exports the ccxt-core engine runtime, and houses the transpiled
// REST and prediction exchange Cores (exchanges/, prediction/).

#![allow(non_snake_case, dead_code, unused_variables, unused_imports)]
#![allow(clippy::style, clippy::complexity, clippy::perf)]
#![allow(async_fn_in_trait)]

// Re-export all ccxt-core modules and symbols for seamless backward compatibility
pub use ccxt_core::*;

pub use ccxt_core::{
    error,
    exchange,
    exchange_errors,
    exchange_generated,
    exchange_stubs,
    order_router,
    order_router_selftest,
    params,
    precise,
    prediction_exchange,
    prediction_exchange_generated,
    pro,
    runtime,
    types,
    value,
};

#[cfg(feature = "engine")]
pub mod prediction;

#[cfg(feature = "engine")]
pub mod exchanges;

#[cfg(not(feature = "engine"))]
pub mod exchanges {
    // empty until transpiled-base feature is enabled
}
