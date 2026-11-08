```rust
// Smoke test across a set of exchanges via the TYPED API. Each venue is built
// by id with `ccxt::from_id` (which returns a boxed `TypedExchange`) and its
// `fetch_markets` is run over the network through the by-name typed dispatch
// `call::<Vec<Market>>`, printing the decoded count.
use ccxt::types::Market;
use ccxt::{from_id, TypedExchange};

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
        // `call` decodes the unified return into `Vec<Market>` (implicit-API setup
        // is handled lazily inside the exchange, so no manual describe()/build needed).
        match ex.call::<Vec<Market>>("fetch_markets", vec![]).await {
            Ok(markets) => println!("{} markets", markets.len()),
            Err(e) => println!("error: {e}"),
        }
    }
}

```
