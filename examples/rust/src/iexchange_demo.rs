// Exchange-agnostic code via the built-in `ccxt::TypedExchange` trait — the
// Rust analog of a C#/Go `IExchange`. Every typed wrapper (ccxt::Binance,
// ccxt::Kraken, …) implements it, so you can be generic OR dynamic over
// exchanges with native typed returns. Compile-check only.
// `TypedExchange` = object-safe core (call_raw + load_markets, enables
// `Box<dyn ...>`); `TypedExchangeExt` = the typed methods (fetch_ticker, …),
// blanket-implemented for every `TypedExchange`. Import both to call them.
use ccxt::{Binance, Kraken, TypedExchange, TypedExchangeExt, Value};

// ── A. generic (static dispatch) ─────────────────────────────────────────────
async fn last_price<E: TypedExchange>(ex: &mut E, symbol: &str) -> Option<f64> {
    ex.load_markets(false).await;
    ex.fetch_ticker(symbol, Value::Null).await.ok()?.last
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
    let mut venues: Vec<Box<dyn TypedExchange>> =
        ["binance", "kraken"].iter().filter_map(|id| create(id)).collect();
    for ex in &mut venues {
        ex.load_markets(false).await;
        if let Ok(t) = ex.fetch_ticker("BTC/USDT", Value::Null).await {
            println!("{} last={:?}", t.symbol, t.last);
        }
        // Unsupported methods resolve to a NotSupported error at runtime:
        match ex.fetch_deposit_addresses(None, Value::Null).await {
            Ok(addrs) => println!("{} deposit addresses", addrs.len()),
            Err(e) => println!("unsupported: {e}"),
        }
    }
}

fn main() {
    println!("iexchange_demo: compile-check only — uses ccxt::TypedExchange");
}
