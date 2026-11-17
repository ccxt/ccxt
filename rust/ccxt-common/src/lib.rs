// CCXT Core – engine runtime library root
//
// Encapsulates the hand-written engine (runtime, Value, HTTP, crypto, Precise,
// OrderRouter, and WS primitives).

#![allow(non_snake_case, dead_code, unused_variables, unused_imports)]
#![allow(clippy::style, clippy::complexity, clippy::perf)]
#![allow(async_fn_in_trait)]

pub mod error;
pub mod value;
pub mod types;
pub mod params;
pub mod exchange;
pub mod precise;
pub mod runtime;

pub mod exchange_errors;
pub mod exchange_stubs;
pub mod order_router;
pub mod order_router_selftest;

pub mod exchange_generated;
pub mod prediction_exchange;
pub mod prediction_exchange_generated;

pub mod pro;

// ── top-level re-exports ──────────────────────────────────────────────────────

pub use error::ExchangeError;
pub use params::{Config, Params};
pub use value::{Value, get_value, set_value, safe_string, safe_number, safe_integer, safe_bool};
pub use exchange::Exchange;
pub use order_router::{OrderRouter, RouterVenue, RouterResult};

/// Convenience Result alias used throughout the crate.
pub type Result<T> = std::result::Result<T, ExchangeError>;
