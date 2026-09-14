// Smoke test across a set of exchanges via the TYPED API. Each venue is built
// by id with `ccxt::from_id` (which returns a boxed `TypedExchange`) and its
// typed `fetch_markets()` is run over the network, printing the decoded count.
use ccxt::Params;
use ccxt::{from_id, TypedExchange, TypedExchangeExt};

#[tokio::main]
async fn main() {
    let ids = ["binance", "bybit", "okx", "kucoin", "bitget", "hyperliquid", "gate"];
    for id in ids {
        println!("\n=== {id} ===");
        let mut ex: Box<dyn TypedExchange> = match from_id(id, None) {
            Some(e) => e,
            None => {
                println!("   unknown id");
                continue;
            }
        };
        print!("   fetch_markets … ");
        // Typed `fetch_markets() -> Result<Vec<Market>>` (implicit-API setup is
        // handled lazily inside the Core, so no manual describe()/build needed).
        match ex.fetch_markets(Params::none()).await {
            Ok(markets) => println!("{} markets", markets.len()),
            Err(e) => println!("error: {e}"),
        }
    }
}
