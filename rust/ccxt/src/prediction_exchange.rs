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

impl PredictionExchange {
    // `super.*` shims. Rust has no `super`, so the transpiler emits
    // `self.super_<m>(...)`. A prediction *venue*'s super is `PredictionExchange`
    // (so `super_fetch_outcome` resolves to this tier's own `fetch_outcome`);
    // the prediction *base*'s super is the shared `Exchange`, reached through the
    // embedded `self.exchange` (so its override isn't re-entered). Args mirror the
    // call sites the transpiler produces.

    /// Venue `super.fetchOutcome(outcome)` → the PredictionExchange base impl.
    pub async fn super_fetch_outcome(&mut self, outcome_symbol: Value) -> Value {
        self.fetch_outcome(outcome_symbol).await
    }

    /// Base `super.fetchOHLCV(...)` → the shared `Exchange` implementation.
    pub async fn super_fetch_ohlcv(&mut self, symbol: Value, timeframe: Value, since: Value, limit: Value, params: Value) -> Value {
        self.exchange.fetch_ohlcv(symbol, &[timeframe, since, limit, params]).await
    }

    /// Base `super.setMarkets(markets, currencies)` → shared `Exchange`.
    pub fn super_set_markets(&mut self, markets: Value, currencies: Value) -> Value {
        self.exchange.set_markets(markets, &[currencies])
    }

    /// Base `super.setSandboxMode(enabled)` → shared `Exchange`.
    pub fn super_set_sandbox_mode(&mut self, enabled: Value) {
        self.exchange.set_sandbox_mode(enabled)
    }
}

impl std::ops::Deref for PredictionExchange {
    type Target = Exchange;
    fn deref(&self) -> &Self::Target { &self.exchange }
}

impl std::ops::DerefMut for PredictionExchange {
    fn deref_mut(&mut self) -> &mut Self::Target { &mut self.exchange }
}
