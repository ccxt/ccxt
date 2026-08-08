// Hand-written base for the prediction-market tier.
//
// Mirrors the TS class hierarchy introduced by the prediction merge:
//   `class PredictionExchange extends BaseExchange`  (ts/src/base/PredictionExchange.ts)
// and Go's `type PredictionExchange struct { BaseExchange }`. In Rust the base
// runtime lives in `crate::exchange::Exchange`; `PredictionExchange` embeds one
// and `Deref`s to it, so:
//
//   * the transpiled prediction methods (in `prediction_exchange_generated.rs`,
//     `impl PredictionExchange { ... }`) reach every base field/method through
//     Rust's auto-deref on the dot operator (`self.markets`, `self.safe_string`,
//     `self.derived()`, …), exactly as a normal exchange Core does over
//     `Exchange`; and
//   * a prediction venue Core (`KalshiCore { exchange: PredictionExchange }`)
//     `Deref`s to `PredictionExchange`, so its own overrides win, then
//     PredictionExchange's unified overrides (createOrder, fetchTicker, …), then
//     the shared `Exchange` base — the correct method-resolution order.
//
// The four prediction-only state fields (`outcomes`/`events` maps) live on this
// struct so the transpiled `self.outcomes` / `self.events` field accesses
// resolve here rather than on the base `Exchange`.

use crate::Value;
use crate::exchange::Exchange;

#[derive(Clone)]
pub struct PredictionExchange {
    pub exchange: Exchange,
    // Prediction-only instance state (see PredictionExchange.ts field block).
    pub outcomes: Value,
    pub outcomes_by_id: Value,
    pub events: Value,
    pub events_by_slug: Value,
}

impl PredictionExchange {
    pub fn new(config: Option<Value>) -> Self {
        Self {
            exchange: Exchange::new(config),
            outcomes: Value::Null,
            outcomes_by_id: Value::Null,
            events: Value::Null,
            events_by_slug: Value::Null,
        }
    }
}

/// `super.*` shims for the prediction tier — the counterpart of `ExchangeRuntime`
/// (review #1: static dispatch). Rust has no `super`, so the transpiler emits
/// `self.super_<m>(...)`; these resolve statically on the concrete prediction
/// Core. Blanket-impl'd for every `PredictionBase`.
pub trait PredictionRuntime: crate::prediction_exchange_generated::PredictionBase {
    /// Venue `super.fetchOutcome(outcome)` → the PredictionExchange base impl.
    async fn super_fetch_outcome(&mut self, outcome_symbol: Value) -> Value {
        <Self as crate::prediction_exchange_generated::PredictionBase>::fetch_outcome(self, outcome_symbol).await
    }
    /// Base `super.fetchOHLCV(...)` → the shared `Exchange` implementation.
    async fn super_fetch_ohlcv(&mut self, symbol: Value, timeframe: Value, since: Value, limit: Value, params: Value) -> Value {
        <Self as crate::exchange_generated::ExchangeBase>::fetch_ohlcv(self, symbol, &[timeframe, since, limit, params]).await
    }
    // NB: `super_set_markets` / `super_set_sandbox_mode` are inherited from
    // `ExchangeRuntime` (identical forwarding to the base) — not redefined here,
    // else `self.super_set_markets(...)` would be ambiguous between the two.
}
impl<T: crate::prediction_exchange_generated::PredictionBase> PredictionRuntime for T {}

impl std::ops::Deref for PredictionExchange {
    type Target = Exchange;
    fn deref(&self) -> &Self::Target { &self.exchange }
}

impl std::ops::DerefMut for PredictionExchange {
    fn deref_mut(&mut self) -> &mut Self::Target { &mut self.exchange }
}
