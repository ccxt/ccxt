// Rust language-specific tests — mirror of Go's `test.languageSpecific.go`.
//
// These verify Rust-only properties of the public API surface that the
// transpiled cross-language tests don't cover:
//
//   * `test_types_rest`  — every unified domain type is defined in
//                          `ccxt::types` and reachable through the typed
//                          wrapper with the right return type, and alias/
//                          subclass exchanges inherit that typed surface
//                          (mirror + superset of `go/tests/base/test.types.rest.go`).
//
//   * `test_ws_initialization` — the live-test snapshot preserves WS defaults
//                          and configured options across loadMarkets.
//
//   * `test_throttler_performance` — the rate limiter actually spaces requests
//                          at the venue's declared rateLimit (mirror of
//                          `go/tests/base/test.throttlerPerformance.go`). It
//                          calls `throttle()` directly, so it makes no network
//                          requests.
//
// The futures returned by the typed methods are NEVER `.await`-ed —
// constructing them is the type-check; dropping them avoids any network
// traffic. Async fns in Rust are lazy, so an unpolled future is a no-op.

#![allow(unused_must_use, unused_variables, dead_code)]

use ccxt::Value;
use ccxt::{Binance, Myokx, Binanceusdm};
use ccxt::types::*;

/// Compile-time assertion that `f` resolves to `ccxt::Result<T>`. The future
/// is consumed and dropped without being polled — the call is a pure type
/// check and performs no I/O.
fn returns<T>(_f: impl std::future::Future<Output = ccxt::Result<T>>) {}


pub fn test_types_rest() -> Result<(), String> {
    let n = Value::Null;
    let mut b = Binance::new(None);

    // ── singular structs ──────────────────────────────────────────────
    returns::<Ticker>(b.fetch_ticker("BTC/USDT", n.clone()));
    returns::<OrderBook>(b.fetch_order_book("BTC/USDT", Some(5), n.clone()));
    returns::<Order>(b.create_order("BTC/USDT", "limit", "buy", 1.0, Some(20000.0), n.clone()));
    returns::<Balances>(b.fetch_balance(n.clone()));
    returns::<Position>(b.fetch_position("BTC/USDT", n.clone()));
    returns::<Transfer>(b.transfer("USDT", 1.0, "spot", "swap", n.clone()));
    returns::<Transaction>(b.withdraw("USDT", 1.0, "0x0", None, n.clone()));
    returns::<LedgerEntry>(b.fetch_ledger_entry("id", Some("USDT"), n.clone()));
    returns::<FundingRate>(b.fetch_funding_rate("BTC/USDT:USDT", n.clone()));
    returns::<Greeks>(b.fetch_greeks("BTC/USDT", n.clone()));
    returns::<OpenInterest>(b.fetch_open_interest("BTC/USDT:USDT", n.clone()));
    returns::<Leverage>(b.fetch_leverage("BTC/USDT:USDT", n.clone()));
    returns::<MarginMode>(b.fetch_margin_mode("BTC/USDT:USDT", n.clone()));
    returns::<TradingFee>(b.fetch_trading_fee("BTC/USDT", n.clone()));
    returns::<BorrowRate>(b.fetch_cross_borrow_rate("USDT", n.clone()));
    returns::<DepositAddress>(b.fetch_deposit_address("USDT", n.clone()));

    // ── list-returning methods ────────────────────────────────────────
    returns::<Vec<Market>>(b.fetch_markets(n.clone()));
    returns::<Vec<Trade>>(b.fetch_trades("BTC/USDT", None, Some(5), n.clone()));
    returns::<Vec<Order>>(b.create_orders(n.clone(), n.clone()));
    returns::<Vec<Position>>(b.fetch_positions(None, n.clone()));
    returns::<Vec<Transaction>>(b.fetch_deposits_withdrawals(None, None, None, n.clone()));
    returns::<Vec<Transfer>>(b.fetch_transfers(None, None, None, n.clone()));
    returns::<Vec<LedgerEntry>>(b.fetch_ledger(None, None, None, n.clone()));
    returns::<Vec<BorrowInterest>>(b.fetch_borrow_interest(None, None, None, None, n.clone()));
    returns::<Vec<DepositAddress>>(b.fetch_deposit_addresses(None, n.clone()));
    returns::<Vec<LeverageTier>>(b.fetch_market_leverage_tiers("BTC/USDT:USDT", n.clone()));
    returns::<Vec<Liquidation>>(b.fetch_my_liquidations(None, None, None, n.clone()));
    returns::<AllGreeks>(b.fetch_all_greeks(None, n.clone()));
    returns::<DepositAddresses>(b.fetch_deposit_addresses_by_network("USDT", n.clone()));
    returns::<Vec<OpenInterest>>(b.fetch_open_interest_history("BTC/USDT:USDT", None, None, None, n.clone()));

    // ── keyed-map aliases (HashMap<String, T>) ────────────────────────
    returns::<Tickers>(b.fetch_tickers(None, n.clone()));
    returns::<OrderBooks>(b.fetch_order_books(None, None, n.clone()));
    returns::<Currencies>(b.fetch_currencies(n.clone()));
    returns::<FundingRates>(b.fetch_funding_rates(None, n.clone()));
    returns::<OpenInterests>(b.fetch_open_interests(None, n.clone()));
    returns::<Leverages>(b.fetch_leverages(None, n.clone()));
    returns::<MarginModes>(b.fetch_margin_modes(None, n.clone()));
    returns::<TradingFees>(b.fetch_trading_fees(n.clone()));

    // ── types without a dedicated typed method still must be defined ───
    // (OHLCV is a raw `[f64; 6]`; Status/Fee/Currency are reached through
    //  other structures — assert each name resolves to a real type.)
    let _ohlcv: Option<OHLCV> = None;
    let _status: Option<Status> = None;
    let _fee: Option<Fee> = None;
    let _currency: Option<Currency> = None;
    let _market: Option<Market> = None;

    // ── inheritance: alias + subclass reach the same typed surface ─────
    // Myokx is a thin override of Okx (`MyokxCore: Deref<Target = OkxCore>`);
    // `fetch_order` is defined nowhere in myokx_typed.rs but is callable
    // because the generator walks the Deref chain.
    let mut myokx = Myokx::new(None);
    returns::<Order>(myokx.fetch_order("iddd", Some("BTC/USDT"), n.clone()));

    // Binanceusdm inherits its whole typed surface from Binance.
    let mut binusdm = Binanceusdm::new(None);
    returns::<Ticker>(binusdm.fetch_ticker("BTC/USDT:USDT", n.clone()));

    Ok(())
}


pub fn run() -> Result<(), String> {
    test_types_rest()?;
    Ok(())
}

/// Drives `throttle()` `num_requests` times with a cost of 1 each and returns
/// the elapsed milliseconds. No API calls — the limiter is exercised directly,
/// exactly as Go's `TestThrottlerPerformanceHelper` does.
async fn throttler_elapsed_ms(num_requests: usize) -> u128 {
    let mut core = ccxt::exchanges::binance::BinanceCore::new(None);
    core.exchange.enableRateLimit = Value::Bool(true);
    let started = std::time::Instant::now();
    for _ in 0..num_requests {
        core.exchange.throttle(&[Value::Int(1)]).await;
    }
    started.elapsed().as_millis()
}


pub async fn test_throttler_performance() -> Result<(), String> {
    let elapsed = throttler_elapsed_ms(20).await;
    println!("throttler: 20 binance requests in {elapsed} ms (rateLimit 50 → expect ~1000)");
    if elapsed < 500 {
        return Err(format!(
            "leaky bucket should take at least half a second for 20 requests, time was: {elapsed}"
        ));
    }
    if elapsed > 3000 {
        return Err(format!(
            "20 binance requests took {elapsed}ms; at its declared rateLimit of 50ms that is \
             ~1000ms, so the token bucket is not tracking rateLimit"
        ));
    }
    Ok(())
}


pub async fn run_async() -> Result<(), String> {
    test_ws_initialization().await?;
    test_throttler_performance().await?;
    Ok(())
}

/// Exercise the same snapshot -> Core write-through used by live loadMarkets,
/// with preloaded markets so this regression test needs no network.
pub async fn test_ws_initialization() -> Result<(), String> {
    use ccxt::value::{get_value, set_value};
    use crate::{assert_eq_msg, assert_true};

    let at = |value: &Value, keys: &[&str]| {
        keys.iter().fold(value.clone(), |v, key| get_value(&v, &Value::str(*key)))
    };
    // Granular builds may omit either venue, but at least one case must run.
    let mut ws_ids = Vec::new();
    macro_rules! ws_id { ($name:ident, $core:ident) => { ws_ids.push(stringify!($name)); }; }
    crate::registry::for_each_ws_core!(ws_id);
    let mut tested_venues = 0;
    for (id, timeframe_path, expected, options) in [
        ("bingx", &["spot", "timeframes"][..], "1min",
            serde_json::json!({"spot": {"timeframes": {"1h": "custom"}}, "fixtureOnly": true})),
        ("bitget", &["timeframes"][..], "1m",
            serde_json::json!({"timeframes": {"1h": "custom"}, "fixtureOnly": true})),
    ] {
        if !ws_ids.contains(&id) {
            continue;
        }
        tested_venues += 1;
        let market_id = if id == "bingx" { "BTC-USDT" } else { "BTCUSDT" };
        for ws in [false, true] {
            let mut cfg = Value::from_json(&serde_json::json!({
                "markets": {"BTC/USDT": {
                    "id": market_id, "symbol": "BTC/USDT",
                    "base": "BTC", "quote": "USDT", "type": "spot", "spot": true
                }},
            }));
            let pristine = crate::test_helpers::initExchange(
                Value::str(id), &[cfg.clone(), Value::Bool(ws)],
            );
            let default_options = get_value(&pristine, &Value::str("options"));
            set_value(&mut cfg, &Value::str("options"), Value::from_json(&options));
            let mut exchange = crate::test_helpers::initExchange(
                Value::str(id), &[cfg, Value::Bool(ws)],
            );
            let expected_default = if ws { Value::str(expected) } else { Value::Null };
            let snapshot_options = get_value(&exchange, &Value::str("options"));
            assert_eq_msg!(
                get_value(&at(&snapshot_options, timeframe_path), &Value::str("1m")),
                expected_default, format!("{id} ws={ws}: initial snapshot timeframe")
            );

            let markets = crate::live_dispatch::dispatch(
                &mut exchange, "load_markets", vec![Value::Bool(false)],
            ).await;
            assert_true!(
                matches!(get_value(&markets, &Value::str("BTC/USDT")), Value::Dict(_)),
                "loadMarkets should return the preloaded market"
            );
            // dispatch syncs the Core's actual options back onto the snapshot.
            let core_options = get_value(&exchange, &Value::str("options"));
            let timeframes = at(&core_options, timeframe_path);
            assert_eq_msg!(get_value(&timeframes, &Value::str("1m")), expected_default,
                format!("{id} ws={ws}: loadMarkets must preserve the default timeframe"));
            assert_eq_msg!(get_value(&timeframes, &Value::str("1h")), Value::str("custom"),
                format!("{id} ws={ws}: loadMarkets must preserve the configured timeframe"));
            assert_eq_msg!(get_value(&core_options, &Value::str("fixtureOnly")), Value::Bool(true),
                format!("{id} ws={ws}: fixture-only option must reach the Core"));

            // Reset to the pristine REST/WS snapshot, not an empty map: defaults
            // must return, and a merge must not retain fixture-only options.
            set_value(&mut exchange, &Value::str("options"), default_options.clone());
            crate::live_dispatch::dispatch(
                &mut exchange, "load_markets", vec![Value::Bool(false)],
            ).await;
            let reset_options = get_value(&exchange, &Value::str("options"));
            let reset_timeframes = at(&reset_options, timeframe_path);
            assert_eq_msg!(get_value(&reset_timeframes, &Value::str("1m")), expected_default,
                format!("{id} ws={ws}: reset must restore the default timeframe"));
            assert_eq_msg!(get_value(&reset_timeframes, &Value::str("1h")),
                get_value(&at(&default_options, timeframe_path), &Value::str("1h")),
                format!("{id} ws={ws}: reset must remove the configured timeframe"));
            assert_eq_msg!(get_value(&reset_options, &Value::str("fixtureOnly")), Value::Null,
                format!("{id} ws={ws}: fixture-only option must not leak"));
        }
    }
    assert_true!(tested_venues > 0,
        "WS initialization: no cases ran; generate the BingX or Bitget WS core before running base tests");
    Ok(())
}
