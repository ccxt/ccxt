// CCXT Rust — Binance typed-API example.
//
// `ccxt::Binance` is the exchange itself: its unified API surface returns
// native Rust types (`Ticker`, `Vec<Trade>`, `OrderBook`, …) wrapped in
// `Result<T, ccxt::ExchangeError>`, so error handling is idiomatic Rust:
//
//   match binance.fetch_ticker("BTC/USDT", Params::none()).await {
//       Ok(t)  => println!("last = {:?}", t.last),
//       Err(e) => eprintln!("[{}] {}", e.kind, e.message),
//   }
//
// `ccxt::Binance` is transpiled from `ts/src/binance.ts` — to change its
// behaviour, edit the TypeScript and re-run the Rust transpiler.

use ccxt::{Binance, Params, TypedExchange};

#[tokio::main]
async fn main() {
    println!("=== Binance — CCXT Rust typed-API example ===\n");

    // Construct the exchange. Unified methods are inherent and return
    // `ccxt::types::*`; setup accessors (`markets()`, `set_verbose()`, …)
    // come from the base `Exchange` via `Deref`.
    let mut binance = Binance::new(None);

    // 1. try_load_markets — required to resolve a unified symbol to the
    //    exchange-specific id used downstream. It comes from the
    //    `TypedExchange` trait and returns the markets typed; a failed load
    //    is an `Err`, not a panic.
    println!("→ try_load_markets() …");
    if let Err(e) = binance.try_load_markets(false).await {
        eprintln!("   ✗ [{}] {}", e.kind, e.message);
        return;
    }
    // Typed accessor — no `Value` handling needed to read the loaded markets.
    let market_count = binance.markets().len();
    println!("   ✓ {} markets loaded\n", market_count);

    // 2. fetch_ticker → returns a `Ticker` struct.
    println!("→ fetch_ticker(\"BTC/USDT\") …");
    match binance.fetch_ticker("BTC/USDT", Params::none()).await {
        Ok(t) => {
            println!(
                "   ✓ symbol={}  last={:?}  bid={:?}  ask={:?}",
                t.symbol, t.last, t.bid, t.ask
            );
        }
        Err(e) => eprintln!("   ✗ [{}] {}", e.kind, e.message),
    }
    println!();

    // 3. fetch_trades → returns Vec<Trade>.
    println!("→ fetch_trades(\"BTC/USDT\", since=None, limit=5) …");
    match binance
        .fetch_trades("BTC/USDT", None, Some(5), Params::none())
        .await
    {
        Ok(trades) => {
            println!("   ✓ {} trades", trades.len());
            for t in trades.iter().take(5) {
                println!(
                    "     {:?}  side={:?}  px={:?}  amt={:?}",
                    t.id, t.side, t.price, t.amount
                );
            }
        }
        Err(e) => eprintln!("   ✗ [{}] {}", e.kind, e.message),
    }
    println!();

    // 4. fetch_order_book → returns an `OrderBook`.
    println!("→ fetch_order_book(\"BTC/USDT\", limit=5) …");
    match binance
        .fetch_order_book("BTC/USDT", Some(5), Params::none())
        .await
    {
        Ok(ob) => {
            println!(
                "   ✓ symbol={:?}  bids={}  asks={}",
                ob.symbol,
                ob.bids.len(),
                ob.asks.len()
            );
            if let Some(top_bid) = ob.bids.first() {
                println!("     top bid: price={} amount={}", top_bid[0], top_bid[1]);
            }
            if let Some(top_ask) = ob.asks.first() {
                println!("     top ask: price={} amount={}", top_ask[0], top_ask[1]);
            }
        }
        Err(e) => eprintln!("   ✗ [{}] {}", e.kind, e.message),
    }
}
