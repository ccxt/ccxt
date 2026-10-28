// CCXT Rust — concurrent order-book watcher example.
//
// Spawns two fetcher tasks that poll Binance order books IN PARALLEL —
// spot (BTC/USDT) and the USDT-margined perpetual (BTC/USDT:USDT) — every
// 15 seconds and publish the top-of-book into a shared map, while a third
// task reads that map on the same cadence and prints the spot/perp price
// difference (the perp basis).
//

// Usage:
//   cargo run --bin orderbook_diff              # every 15 s, until Ctrl+C
//   cargo run --bin orderbook_diff -- 4         # 4 rounds, then exit
//   cargo run --bin orderbook_diff -- 4 5       # 4 rounds, 5 s cadence

use std::collections::HashMap;
use std::sync::Arc;
use std::time::{Duration, Instant, SystemTime, UNIX_EPOCH};

use ccxt::Params;
use ccxt::Binance;
use tokio::sync::RwLock;
use tokio::time::MissedTickBehavior;

const SPOT: &str = "BTC/USDT";
const SWAP: &str = "BTC/USDT:USDT";

#[derive(Clone, Debug)]
struct TopOfBook {
    bid: f64,
    ask: f64,
    exchange_ts: Option<i64>,
    updates: u64,
}

impl TopOfBook {
    fn mid(&self) -> f64 {
        (self.bid + self.ask) / 2.0
    }
}

/// Symbol → latest top-of-book, shared between the fetchers and the printer.
type SharedBooks = Arc<RwLock<HashMap<String, TopOfBook>>>;

fn wall_ms() -> u128 {
    SystemTime::now().duration_since(UNIX_EPOCH).unwrap().as_millis()
}

async fn run_fetcher(symbol: &'static str, books: SharedBooks, every: Duration, rounds: Option<u64>) {
    let mut exchange = Binance::new(None);
    let t0 = Instant::now();
    exchange.load_markets(false).await;
    println!("[{symbol}] markets loaded in {} ms", t0.elapsed().as_millis());
    let mut tick = tokio::time::interval(every);
    tick.set_missed_tick_behavior(MissedTickBehavior::Delay);
    let mut attempts: u64 = 0;
    let mut updates: u64 = 0;
    while rounds.map_or(true, |max| attempts < max) {
        tick.tick().await;
        attempts += 1;
        let started = Instant::now();
        let started_wall = wall_ms();
        match exchange.fetch_order_book(symbol, Some(5), Params::none()).await {
            Ok(ob) => {
                if let (Some(bid), Some(ask)) = (ob.bids.first(), ob.asks.first()) {
                    updates += 1;
                    println!(
                        "[{symbol}] #{updates} bid={} ask={}  (started @+{} ms, took {} ms)",
                        bid[0],
                        ask[0],
                        started_wall % 60_000,
                        started.elapsed().as_millis(),
                    );
                    books.write().await.insert(
                        symbol.to_string(),
                        TopOfBook { bid: bid[0], ask: ask[0], exchange_ts: ob.timestamp, updates },
                    );
                } else {
                    eprintln!("[{symbol}] empty order book");
                }
            }
            Err(e) => eprintln!("[{symbol}] fetch_order_book failed: [{}] {}", e.kind, e.message),
        }
    }
    println!("[{symbol}] fetcher done: {updates}/{attempts} rounds succeeded");
}

async fn run_printer(books: SharedBooks, every: Duration) {
    let mut tick = tokio::time::interval(every);
    tick.set_missed_tick_behavior(MissedTickBehavior::Delay);
    loop {
        tick.tick().await;
        let map = books.read().await;
        match (map.get(SPOT), map.get(SWAP)) {
            (Some(spot), Some(swap)) => {
                let diff = swap.mid() - spot.mid();
                let bps = diff / spot.mid() * 10_000.0;
                println!(
                    "== basis: spot mid={:.2}  perp mid={:.2}  diff={:+.2} USDT ({:+.2} bps)  [spot upd #{} ts={:?} / perp upd #{} ts={:?}]",
                    spot.mid(),
                    swap.mid(),
                    diff,
                    bps,
                    spot.updates,
                    spot.exchange_ts,
                    swap.updates,
                    swap.exchange_ts,
                );
            }
            _ => println!("== basis: waiting for both books ({} of 2 in the map)", map.len()),
        }
    }
}

#[tokio::main]
async fn main() {
    let mut args = std::env::args().skip(1);
    let rounds: Option<u64> = args.next().and_then(|s| s.parse().ok());
    let every = Duration::from_secs(args.next().and_then(|s| s.parse().ok()).unwrap_or(15));
    println!("=== CCXT Rust — concurrent {SPOT} vs {SWAP} order-book watcher ===");
    match rounds {
        Some(n) => println!("cadence: {} s, {} rounds\n", every.as_secs(), n),
        None => println!("cadence: {} s, until Ctrl+C\n", every.as_secs()),
    }
    let books: SharedBooks = Arc::new(RwLock::new(HashMap::new()));
    // The exchange futures carry a `Send` guarantee (the trait surface is
    // emitted as `impl Future + Send` / `Pin<Box<dyn Future + Send>>`), so the
    // fetchers go through plain `tokio::spawn` and run on the multi-threaded
    // runtime — genuinely parallel tasks, one exchange instance per task.
    let spot = tokio::spawn(run_fetcher(SPOT, books.clone(), every, rounds));
    let swap = tokio::spawn(run_fetcher(SWAP, books.clone(), every, rounds));
    let printer = tokio::spawn(run_printer(books.clone(), every));
    let _ = spot.await;
    let _ = swap.await;
    // Bounded run: the fetchers finished their rounds — print one final
    // reading (both books are guaranteed in the map by now), then stop.
    printer.abort();
    let map = books.read().await;
    if let (Some(spot), Some(swap)) = (map.get(SPOT), map.get(SWAP)) {
        let diff = swap.mid() - spot.mid();
        println!(
            "\nfinal: spot mid={:.2}  perp mid={:.2}  diff={:+.2} USDT",
            spot.mid(),
            swap.mid(),
            diff,
        );
    }
}
