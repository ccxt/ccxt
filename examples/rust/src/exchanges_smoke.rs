// Smoke test across a set of exchanges via the TYPED API. Each venue is built
// by id with `ccxt::exchanges::with_exchange`, which hands the concrete venue to
// a generic visitor; `fetch_markets` runs over the network through the by-name
// typed dispatch `call::<Vec<Market>>`, printing the decoded count.
use ccxt::types::Market;
use ccxt::{ExchangeVisitor, TypedExchange};

struct FetchMarkets;

impl ExchangeVisitor for FetchMarkets {
    type Output = ();
    async fn visit<E: TypedExchange + 'static>(self, mut ex: E) {
        print!("   fetch_markets … ");
        // `call` decodes the unified return into `Vec<Market>` (implicit-API setup
        // is handled lazily inside the exchange, so no manual describe()/build needed).
        match ex.call::<Vec<Market>>("fetch_markets", vec![]).await {
            Ok(markets) => println!("{} markets", markets.len()),
            Err(e) => println!("error: {e}"),
        }
    }
}

#[tokio::main]
async fn main() {
    let ids = ["binance", "bybit", "okx", "kucoin", "bitget", "hyperliquid", "gate"];
    for id in ids {
        println!("\n=== {id} ===");
        if ccxt::exchanges::with_exchange(id, None, FetchMarkets).await.is_none() {
            println!("   unknown id");
        }
    }
}
