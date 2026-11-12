```rust
// Exchange-agnostic code via the built-in `ccxt::TypedExchange` trait — the
// Rust analog of a C#/Go `IExchange`. Every exchange (ccxt::Binance,
// ccxt::Kraken, …) implements it, so you can be generic OR dynamic over
// exchanges with native typed returns. Compile-check only.
// `Box<dyn TypedExchange>` holds any venue; the base-spec methods (load_markets,
// market, set_sandbox_mode, fetch_ticker, …) are inherent on `dyn TypedExchange`
// with the same names and signatures as on every concrete exchange struct.
use ccxt::Params;
use ccxt::{Binance, Kraken, TypedExchange};

// ── A. generic (static dispatch) ─────────────────────────────────────────────
async fn last_price<E: TypedExchange + 'static>(ex: &mut E, symbol: &str) -> Option<f64> {
    // The typed methods live on `dyn TypedExchange`, so view the generic as one.
    let ex: &mut (dyn TypedExchange + 'static) = ex;
    ex.load_markets(false, ()).await.ok()?;
    ex.fetch_ticker(symbol, Params::none()).await.ok()?.last
}

// ── B. dynamic (runtime selection, heterogeneous collection) ─────────────────
fn create(id: &str) -> Option<Box<dyn TypedExchange>> {
    match id {
        "binance" => Some(Box::new(Binance::new(None))),
        "kraken" => Some(Box::new(Kraken::new(None))),
        _ => None,
    }
}

#[allow(dead_code)]
async fn demo() {
    // A: static — concrete type, typed return
    let mut b = Binance::new(None);
    let _last: Option<f64> = last_price(&mut b, "BTC/USDT").await;

    // B: dynamic — mixed exchanges chosen at runtime, still typed returns
    let mut venues: Vec<Box<dyn TypedExchange>> = ["binance", "kraken"]
        .iter()
        .filter_map(|id| create(id))
        .collect();
    for ex in &mut venues {
        if ex.load_markets(false, ()).await.is_err() {
            continue;
        }
        if let Ok(t) = ex.fetch_ticker("BTC/USDT", Params::none()).await {
            println!("{} last={:?}", t.symbol, t.last);
        }
        // Unsupported methods resolve to a NotSupported error at runtime:
        match ex.fetch_deposit_addresses(None, Params::none()).await {
            Ok(addrs) => println!("{} deposit addresses", addrs.len()),
            Err(e) => println!("unsupported: {e}"),
        }
    }
}

fn main() {
    println!("iexchange_demo: compile-check only — uses ccxt::TypedExchange");
}

```
