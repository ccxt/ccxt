// CCXT Rust — cross-exchange WebSocket order-book comparison (TYPED API).
//
// Subscribes over WebSocket (`watch_order_book`) to the BTC/USDT:USDT
// USDT-margined perpetual on **binance, bybit and okx** simultaneously — one
// dedicated task and WS connection per venue — keeps the latest top-of-book from
// each, and prints a live comparison table.
//
// Each venue is built by id via `ccxt_pro::from_id_with_config(id, config)` and driven
// through the typed `watch_order_book() -> Result<OrderBook>`.
//
// Usage (needs the `ws` feature):
//   cargo run --features ws --bin watch_orderbook_compare
//   cargo run --features ws --bin watch_orderbook_compare -- 20     # 20 prints then exit
//   cargo run --features ws --bin watch_orderbook_compare -- 20 1   # 20 prints, 1s cadence
//
// Live network is required.
use std::collections::BTreeMap;
use std::panic::AssertUnwindSafe;
use std::sync::Arc;
use std::time::Duration;

use ccxt::types::OrderBook;
use ccxt::{Config, Params};
use ccxt_pro::{from_id_with_config, TypedExchange, TypedExchangeExt};
use futures::FutureExt;
use tokio::sync::RwLock;
use tokio::time::MissedTickBehavior;

/// The unified symbol every venue is asked for: the USDT-margined BTC perpetual.
const SYMBOL: &str = "BTC/USDT:USDT";

/// Latest top-of-book for one venue.
#[derive(Clone, Copy, Default)]
struct Top {
    bid: f64,
    ask: f64,
    updates: u64,
}

impl Top {
    fn mid(&self) -> f64 {
        (self.bid + self.ask) / 2.0
    }
}

/// venue name → its latest top-of-book, shared between the watchers and printer.
type Board = Arc<RwLock<BTreeMap<&'static str, Top>>>;

/// Best bid/ask straight off the typed `OrderBook` (`bids`/`asks` are `[f64; 2]`
/// `[price, amount]` rows, best-first).
fn top_of_book(ob: &OrderBook) -> Option<(f64, f64)> {
    let bid = ob.bids.first().map(|b| b[0])?;
    let ask = ob.asks.first().map(|a| a[0])?;
    if bid > 0.0 && ask > 0.0 {
        Some((bid, ask))
    } else {
        None
    }
}

/// Watch loop for any venue. `watch_order_book` returns a typed `OrderBook`
/// each update; a watch that errors is caught and retried after a short backoff.
async fn watch_loop(name: &'static str, mut ex: Box<dyn TypedExchange>, board: Board) {
    loop {
        let fut = ex.watch_order_book(SYMBOL, None, Params::none());
        match AssertUnwindSafe(fut).catch_unwind().await {
            Ok(Ok(ob)) => {
                if let Some((bid, ask)) = top_of_book(&ob) {
                    let mut b = board.write().await;
                    let entry = b.entry(name).or_default();
                    entry.bid = bid;
                    entry.ask = ask;
                    entry.updates += 1;
                }
            }
            _ => {
                eprintln!("[{name}] watch error — reconnecting in 2s");
                tokio::time::sleep(Duration::from_secs(2)).await;
            }
        }
    }
}

/// Render one comparison line across the venues that have quoted so far.
async fn print_board(board: &Board) {
    let b = board.read().await;
    if b.is_empty() {
        println!("… waiting for first updates …");
        return;
    }
    let best_bid = b.values().map(|t| t.bid).fold(f64::MIN, f64::max);
    let best_ask = b
        .values()
        .filter(|t| t.ask > 0.0)
        .map(|t| t.ask)
        .fold(f64::MAX, f64::min);
    println!("──────────────────────────────────────────────────────────────");
    for (name, t) in b.iter() {
        let avg_mid: f64 = b.values().map(Top::mid).sum::<f64>() / (b.len() as f64);
        let dev = t.mid() - avg_mid;
        println!(
            "  {name:<8}  bid {:>12.2}  ask {:>12.2}  mid {:>12.2}  ({:+.2} vs avg)  [{} upd]",
            t.bid,
            t.ask,
            t.mid(),
            dev,
            t.updates
        );
    }
    if best_ask < f64::MAX && best_bid > f64::MIN {
        println!(
            "  → best bid {best_bid:.2} / best ask {best_ask:.2}  cross-spread {:+.2}",
            best_bid - best_ask
        );
    }
}

fn main() {
    let rt = tokio::runtime::Builder::new_multi_thread()
        .enable_all()
        .thread_stack_size(32 * 1024 * 1024)
        .build()
        .unwrap();
    rt.block_on(async_main());
}

async fn async_main() {
    let mut args = std::env::args().skip(1);
    let max_prints: Option<u64> = args.next().and_then(|s| s.parse().ok());
    let cadence_secs: u64 = args.next().and_then(|s| s.parse().ok()).unwrap_or(2);

    println!(
        "Comparing {SYMBOL} order books over WebSocket: binance · bybit · okx\n\
         (cadence {cadence_secs}s{})",
        max_prints
            .map(|n| format!(", {n} prints"))
            .unwrap_or_default()
    );

    let board: Board = Arc::new(RwLock::new(BTreeMap::new()));

    // binance & bybit are told to load ONLY linear (USDⓈ-M) markets so the WS
    // depth stream's bare "BTCUSDT" id resolves to the perpetual, not spot.
    let linear_cfg = || {
        Config::new().option(
            "fetchMarkets",
            Params::new().with_strs("types", &["linear"]),
        )
    };

    let mut handles = Vec::new();
    for (name, cfg) in [
        ("binance", linear_cfg()),
        ("bybit", linear_cfg()),
        ("okx", Config::none()),
    ] {
        match from_id_with_config(name, cfg) {
            Some(ex) => {
                handles.push(tokio::spawn(watch_loop(name, ex, board.clone())));
            }
            None => eprintln!("[{name}] no typed WS wrapper — skipping"),
        }
    }

    let mut ticker = tokio::time::interval(Duration::from_secs(cadence_secs));
    ticker.set_missed_tick_behavior(MissedTickBehavior::Skip);
    let mut printed = 0u64;
    loop {
        ticker.tick().await;
        print_board(&board).await;
        printed += 1;
        if let Some(max) = max_prints {
            if printed >= max {
                break;
            }
        }
    }

    for h in handles {
        h.abort();
    }
}
