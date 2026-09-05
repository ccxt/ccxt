// Exchange registry — turns an exchange id into a snapshot `Value` of the
// real venue Core (see `exchange_snapshot`) and re-exports the generated
// `for_each_core!` / `for_each_ws_core!` id-list macros.
//
// The offline request/response dispatch that used to live here was
// superseded by the transpiled `TestMainClass` (`tests.rs`) driving the
// persistent Cores in `live_dispatch.rs`; it was removed as dead code.

use ccxt::Value;
// Every venue Core the harness dispatches to, straight from the generated
// list. `live_dispatch.rs` already globs this; registry.rs used to repeat the
// names by hand, so adding an exchange (revolutx) broke the build here with
// "cannot find type RevolutxCore in this scope" until someone remembered to
// edit this list too. The glob keeps `for_each_core!` and the names it expands
// to from drifting apart.
use crate::generated_cores::*;
// Aliases for the prediction Cores whose ids collide with a regular exchange —
// used by `exchange_snapshot`'s prediction-mode override.
use ccxt::prediction::binance::BinanceCore as PredBinanceCore;
use ccxt::prediction::hyperliquid::HyperliquidCore as PredHyperliquidCore;

/// One macro definition, three matches. Each consumer defines its own
/// per-id callback macro (`arm!`, `snapshot_arm!`, `has_arm!`) then
/// invokes `for_each_core!(arm)` to expand the same id list across all
/// 110 exchanges. Source of truth for "which exchanges are testable
/// offline" lives in exactly one place — adding a new exchange means
/// one line here. Keep this in sync with `rust/ccxt/src/exchanges/mod.rs`.
pub(crate) use crate::generated_cores::for_each_core;

/// Pro (WebSocket) Cores, expanded like `for_each_core!` but only over the
/// exchanges that ship a `ccxt::pro::<id>` Core. Used by `build_core` under
/// `--ws` so the live WS tests get a Core whose `has` carries the watch*
/// methods and whose `call_dynamic` routes the WS handlers.
pub(crate) use crate::generated_cores::for_each_ws_core;

/// Builds the real exchange Core from `cfg` and snapshots it to a
/// `Value` (via `Exchange::to_value()`). Unlike a bare config map, the
/// snapshot carries the exchange's `describe()` output — `options`
/// (incl. `brokerId` / `broker`), `has`, `urls`, etc. — which the
/// broker-id tests assert against. Returns `Value::Null` for an id with
/// no registered Core so callers can fall back to a plain config map.
pub fn exchange_snapshot(id: &str, cfg: Value) -> Value {
    macro_rules! arm { ($name:ident, $core:ident) => {
        if id == stringify!($name) {
            let mut ex = Box::new(<$core>::new(Some(cfg.clone())));
            ex.bind();
            return ex.to_value();
        }
    }; }
    // In prediction mode, `binance` / `hyperliquid` snapshot from their
    // prediction Cores (mirrors build_core). Without this the snapshot's
    // `options` key carries the regular exchange's describe (e.g. binance's
    // `recvWindow: 10000`), which then merges into the prediction Core and
    // leaks into signed requests — failing the static prediction request tests.
    if crate::live_dispatch::is_prediction_mode() {
        arm!(binance, PredBinanceCore);
        arm!(hyperliquid, PredHyperliquidCore);
    }
    for_each_core!(arm);
    Value::Null
}
