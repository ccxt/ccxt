// CCXT Rust — cross-exchange WebSocket order-book comparison.
//
// Subscribes over WebSocket (`watchOrderBook`) to the BTC/USDT:USDT
// USDT-margined perpetual on **binance, bybit and okx** simultaneously — one
// dedicated task and WS connection per venue — keeps the latest top-of-book
// from each, and prints a live table comparing best bid / ask / mid plus the
// cross-exchange spread (who's quoting richest/cheapest right now).
//
// This exercises the ported WS runtime end to end: each venue's transpiled
// `watch_order_book` connects, subscribes, and its `handle_message` applies the
// depth deltas into the shared order-book cache, resolving each `watch` call
// with the updated book.
//
// Usage (needs the `ws` feature — it pulls in the transpiled pro/ WS venues):
//   cargo run --features ws --bin watch_orderbook_compare
//   cargo run --features ws --bin watch_orderbook_compare -- 20     # 20 prints then exit
//   cargo run --features ws --bin watch_orderbook_compare -- 20 1   # 20 prints, 1s cadence
//
// Live network is required (it connects to the real exchanges).
//
// STATUS: the WS runtime is live end-to-end for all three venues — each streams
// a fully-resolved, live-updating order book. This works because order books are
// shared-mutable: a side's entries live in a backing store keyed by `__side_id`
// (so `handle_deltas(side.clone(), …)` reflects into the cached book) and a
// book's scalar meta (nonce/timestamp/…) lives in a store keyed by `__book_id`
// (so okx's seqId check and binance's U/u sequencing see the persisted nonce).
// binance additionally needs its REST depth snapshot, fetched via `spawn`
// (executed inline on the drive loop), and is configured below to load only
// linear markets so the "BTCUSDT" id resolves to the perpetual, not spot.

use std::collections::BTreeMap;
use std::panic::AssertUnwindSafe;
use std::sync::Arc;
use std::time::Duration;

use ccxt::exchange_generated::ExchangeBase;
use ccxt::{get_value, Value};
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

/// Pull the best bid/ask out of a returned order-book `Value`
/// (`{ bids: [[price, amount], …], asks: [[price, amount], …] }`).
fn top_of_book(ob: &Value) -> Option<(f64, f64)> {
    let bids = get_value(ob, &Value::Str("bids".to_string()));
    let asks = get_value(ob, &Value::Str("asks".to_string()));
    let bid = get_value(&get_value(&bids, &Value::Int(0)), &Value::Int(0)).as_f64()?;
    let ask = get_value(&get_value(&asks, &Value::Int(0)), &Value::Int(0)).as_f64()?;
    if bid > 0.0 && ask > 0.0 {
        Some((bid, ask))
    } else {
        None
    }
}

/// Generic watch loop for any venue Core. Calls `watch_order_book` through the
/// `ExchangeBase::call_dynamic` vtable so one function serves all three venue
/// types, and republishes each update into the shared board. A watch that
/// errors (network blip / disconnect) is caught and retried after a short
/// backoff — the connection is re-established by the next `watch` call.
async fn watch_loop<T>(name: &'static str, mut ex: Box<T>, board: Board)
where
    T: ExchangeBase + Send + 'static,
{
    loop {
        let fut = ExchangeBase::call_dynamic(
            &mut *ex,
            "watch_order_book",
            vec![Value::Str(SYMBOL.to_string())],
        );
        match AssertUnwindSafe(fut).catch_unwind().await {
            Ok(ob) => {
                if let Some((bid, ask)) = top_of_book(&ob) {
                    let mut b = board.write().await;
                    let entry = b.entry(name).or_default();
                    entry.bid = bid;
                    entry.ask = ask;
                    entry.updates += 1;
                }
            }
            Err(_) => {
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
    // Best (highest) bid and best (lowest) ask across venues.
    let best_bid = b.values().map(|t| t.bid).fold(f64::MIN, f64::max);
    let best_ask = b
        .values()
        .filter(|t| t.ask > 0.0)
        .map(|t| t.ask)
        .fold(f64::MAX, f64::min);
    println!("──────────────────────────────────────────────────────────────");
    for (name, t) in b.iter() {
        // How far this venue's mid sits from the cross-venue average.
        let avg_mid: f64 = b.values().map(Top::mid).sum::<f64>() / (b.len() as f64);
        let dev = t.mid() - avg_mid;
        println!(
            "  {name:<8}  bid {:>12.2}  ask {:>12.2}  mid {:>12.2}  ({:+.2} vs avg)  [{} upd]",
            t.bid, t.ask, t.mid(), dev, t.updates
        );
    }
    if best_ask < f64::MAX && best_bid > f64::MIN {
        // Cross-exchange arbitrage spread: best bid anywhere minus best ask
        // anywhere (positive ⇒ someone bids above another's ask).
        println!(
            "  → best bid {best_bid:.2} / best ask {best_ask:.2}  cross-spread {:+.2}",
            best_bid - best_ask
        );
    }
}

fn main() {
    // The pro Core's initial `load_markets` parses ~2000 markets through the
    // WS→REST dispatch chain, which is deeper than the default 2 MB tokio worker
    // stack; give the workers plenty of headroom.
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
        max_prints.map(|n| format!(", {n} prints")).unwrap_or_default()
    );

    let board: Board = Arc::new(RwLock::new(BTreeMap::new()));

    // One Core + WS connection per venue. `bind()` runs each Core's init
    // (describe → options/urls/has) before it's moved into its task.
    //
    // binance is told to load ONLY linear (USDⓈ-M) futures markets. Its WS depth
    // stream tags messages with the market id "BTCUSDT", which otherwise collides
    // between spot (BTC/USDT) and the perpetual (BTC/USDT:USDT); with both loaded
    // `handleOrderBook` resolves the collision to the spot market (ccxt lists spot
    // first) and drops the perp deltas. Loading only linear markets leaves a
    // single "BTCUSDT" so it resolves to the perpetual we're watching.
    let binance_cfg = ccxt::runtime::json_parse(&Value::Str(
        r#"{"options":{"fetchMarkets":{"types":["linear"]}}}"#.to_string(),
    ));
    let mut binance = Box::new(ccxt_pro::pro::binance::BinanceCore::new(Some(binance_cfg)));
    binance.bind();
    // bybit: same restriction, for two reasons — its option-instruments pagination
    // (category=option per baseCoin) is slow/fragile and not needed here, and its
    // WS depth stream also tags messages with the bare id "BTCUSDT", which would
    // collide with spot if both were loaded.
    let bybit_cfg = ccxt::runtime::json_parse(&Value::Str(
        r#"{"options":{"fetchMarkets":{"types":["linear"]}}}"#.to_string(),
    ));
    let mut bybit = Box::new(ccxt_pro::pro::bybit::BybitCore::new(Some(bybit_cfg)));
    bybit.bind();
    let mut okx = Box::new(ccxt_pro::pro::okx::OkxCore::new(None));
    okx.bind();

    let mut handles = Vec::new();
    handles.push(tokio::spawn(watch_loop("binance", binance, board.clone())));
    handles.push(tokio::spawn(watch_loop("bybit", bybit, board.clone())));
    handles.push(tokio::spawn(watch_loop("okx", okx, board.clone())));

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
