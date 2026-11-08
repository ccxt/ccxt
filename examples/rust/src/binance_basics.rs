// CCXT Rust — Binance typed example.
//
// Uses `ccxt::Binance`: every unified method returns a native Rust struct
// (`Ticker`, `Vec<Trade>`, …) instead of the dynamic `Value`, wrapped in
// `Result<T, ccxt::ExchangeError>`. `try_load_markets()` (from the
// `TypedExchange` trait) fetches and caches markets, so callers don't touch the
// low-level dispatch machinery.
//
// Note: the underlying behaviour is transpiled from `ts/src/binance.ts` — to
// change it, edit the TypeScript and re-run the Rust transpiler.
use ccxt::{Binance, Params, TypedExchange};

#[tokio::main]
async fn main() {
    println!("=== Binance — CCXT Rust typed example ===\n");

    let mut binance = Binance::new(None);

    // Fetch + cache markets (also wires describe()/implicit-API under the hood).
    println!("→ load_markets() …");
    if let Err(e) = binance.try_load_markets(false).await {
        eprintln!("   ✗ [{}] {}", e.kind, e.message);
        return;
    }

    // fetch_tickers() -> Tickers  (HashMap<String, Ticker>)
    println!("→ fetch_tickers() -> Tickers");
    match binance.fetch_tickers(None, Params::none()).await {
        Ok(tickers) => {
            println!("   ✓ {} tickers", tickers.len());
            for sym in ["BTC/USDT", "ETH/USDT", "SOL/USDT"] {
                if let Some(t) = tickers.get(sym) {
                    println!(
                        "     {sym:<10} last={:?} baseVol={:?}",
                        t.last, t.base_volume
                    );
                }
            }
        }
        Err(e) => println!("   ✗ {e}"),
    }

    // fetch_trades(symbol, since, limit, params) -> Vec<Trade>
    println!("\n→ fetch_trades(\"BTC/USDT\", limit=5) -> Vec<Trade>");
    match binance
        .fetch_trades("BTC/USDT", None, Some(5), Params::none())
        .await
    {
        Ok(trades) => {
            println!("   ✓ {} trades", trades.len());
            for t in trades.iter().take(5) {
                println!(
                    "     {:<4} price={:?} amount={:?}",
                    t.side.as_deref().unwrap_or("?"),
                    t.price,
                    t.amount
                );
            }
        }
        Err(e) => println!("   ✗ {e}"),
    }
}
