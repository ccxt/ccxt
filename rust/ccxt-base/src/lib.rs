// CCXT Rust – library root
//
// Hand-written files (never overwritten by the transpiler):
//   src/error.rs          – ExchangeError enum + From impls
//   src/value.rs          – CCXT Value type (mirrors transpiler output)
//   src/types.rs          – Domain types: Order, Trade, Ticker, …
//   src/exchange.rs       – Exchange base: HTTP, crypto, string utilities
//   src/precise.rs        – Precise decimal arithmetic (mirrors Precise.ts)
//
// Generated files (overwritten on each transpile run):
//   src/exchange_generated.rs  – Exchange.ts base methods
//   src/exchange_errors.rs     – error constructor functions
//   src/exchanges/mod.rs       – pub mod declarations for REST exchanges
//   src/exchanges/*.rs         – individual REST exchange implementations
//   src/pro/mod.rs             – pub mod declarations for WS exchanges
//   src/pro/*.rs               – individual WebSocket exchange implementations

// Hand-written code keeps rustc's naming/dead-code allowances (the transpiled
// surface uses camelCase) and silences the noisy Clippy *style/complexity/perf*
// groups, but leaves Clippy's `correctness` and `suspicious` groups ENABLED so
// real defects in the hand-written runtime aren't masked (review #11). Generated
// files carry their own blanket `clippy::all` allow.
#![allow(non_snake_case, dead_code, unused_variables, unused_imports)]
#![allow(clippy::style, clippy::complexity, clippy::perf)]
// The base surface (`ExchangeBase`/`ExchangeRuntime`/`PredictionBase`) uses
// native `async fn` in public traits. This is deliberate (review #1): virtual
// dispatch boxes these futures as `Pin<Box<dyn Future + 'a>>` WITHOUT a `Send`
// bound, so callers get non-`Send` futures by design — the exchange objects are
// driven on a single task, not shared across threads. `async fn` in a trait is
// exactly the right desugaring for that contract, so silence the auto-trait
// advisory lint rather than hand-rolling `-> impl Future` signatures.
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

// The transpiled base method surface (now the `ExchangeBase` trait, review #1)
// compiles and typechecks against the hand-written base; the per-exchange REST
// Cores are the part gated behind `transpiled-base`.
// The transpiled base `impl Exchange` methods (describe, safe_market,
// set_markets, …). The hand-written base (exchange.rs / exchange_stubs.rs)
// calls these unconditionally, so they are non-optional infrastructure — always
// compiled, independent of the per-exchange `transpiled-base` feature (which
// gates only the heavy `exchanges`/`prediction` venue modules). This keeps a
// no-default-features consumer build compiling instead of failing with missing
// base methods.
pub mod exchange_generated;

// Prediction-market tier (ts/src/base/PredictionExchange.ts + ts/src/prediction/*).
// `prediction_exchange` is the hand-written base struct; the `_generated` module
// holds its transpiled methods (now a `trait PredictionBase: ExchangeBase`). Both
// gated behind the same `transpiled-base` feature as the rest of the transpiled
// surface. The prediction tier is a second inheritance layer (Core →
// PredictionExchange → Exchange) wired with its own static ExchangeBase dispatch
// (review #1 pointer removal).
#[cfg(feature = "transpiled-base")]
pub mod prediction_exchange;

#[cfg(feature = "transpiled-base")]
pub mod prediction_exchange_generated;

// Transpiled prediction-market venue Cores (ts/src/prediction/*.ts). Kept in
// their own module so an id that also exists as a regular exchange (hyperliquid)
// doesn't collide under `exchanges`.
#[cfg(feature = "transpiled-base")]
pub mod prediction;

#[cfg(feature = "transpiled-base")]
pub mod exchanges;

#[cfg(not(feature = "transpiled-base"))]
pub mod exchanges {
    // empty until transpiled-base feature is enabled
}

// The per-exchange typed unified-method wrappers (`Binance`, `Kraken`, … with
// `fetch_ticker(..) -> Result<Ticker>`) plus the `TypedExchange` /
// `TypedExchangeExt` traits now live in the sibling `ccxt-typed` crate (import
// as `ccxt_typed::Binance`). They were split out so the base `ccxt` crate's
// single `rustc` invocation stays under the CI runner's memory ceiling.

pub mod pro;

// ── top-level re-exports ──────────────────────────────────────────────────────

pub use error::ExchangeError;
pub use params::{Config, Params};
pub use value::{Value, get_value, set_value, safe_string, safe_number, safe_integer, safe_bool};
pub use exchange::Exchange;

/// Convenience Result alias used throughout the crate.
pub type Result<T> = std::result::Result<T, ExchangeError>;
