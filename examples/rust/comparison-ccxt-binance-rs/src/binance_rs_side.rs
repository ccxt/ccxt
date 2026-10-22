// binance-rs baseline: watch one or many BTC/USDT-style diff-depth streams (the
// same feed ccxt's watch_order_book consumes) and report frames / CPU / peak RSS
// over N seconds. binance-rs hands you the raw delta per frame; it does NOT
// maintain a sorted book (that's the asymmetry vs ccxt, which maintains +
// checksums a full book).
//
// N > 1 goes through `connect_multiple_streams` — one connection, N streams —
// the direct counterpart of ccxt's `watch_order_book_for_symbols`. Reporting is
// deliberately the same shape as ccxt_side so the two are read side by side;
// note `t_all_live` here is just the first frame per stream, since there is no
// REST snapshot to seed.
//
//   cargo run --release --bin binance_rs_side -- [secs] [symbols] [channel]
//     symbols: a count (e.g. `10`) or a comma-separated list. Default: BTC/USDT.
//     channel: `book` (default, `@depth@100ms`), `trades` (`@trade`) or
//              `aggtrades` (`@aggTrade`).
//
// NOTE: on the path-based URL binance-rs builds
// (wss://stream.binance.com/ws/<sym>@trade) the raw `@trade` feed delivers
// nothing here, while `@aggTrade` and `@depth` on the same URL work. ccxt
// reaches `@trade` fine via SUBSCRIBE on /ws/0, so use `aggtrades` on both
// sides for a like-for-like trade comparison.
use binance::websockets::{WebSockets, WebsocketEvent};
use std::collections::HashMap;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::sync::Mutex;
use std::time::Instant;

// One stream: last delta size, how many frames, and when it first delivered.
struct Stream { bids: usize, asks: usize, frames: u64, first_s: f64 }

const BUILTIN: &[&str] = &[
    "BTC/USDT", "ETH/USDT", "BNB/USDT", "SOL/USDT", "XRP/USDT",
    "ADA/USDT", "DOGE/USDT", "AVAX/USDT", "LINK/USDT", "DOT/USDT",
];

fn cpu_secs() -> f64 {
    std::fs::read_to_string("/proc/self/stat").ok().and_then(|s| {
        let close = s.rfind(')')?;
        let rest: Vec<&str> = s[close + 2..].split_whitespace().collect();
        let u: f64 = rest.get(11)?.parse().ok()?;
        let k: f64 = rest.get(12)?.parse().ok()?;
        Some((u + k) / 100.0)
    }).unwrap_or(0.0)
}
fn rss_field_mb(field: &str) -> f64 {
    std::fs::read_to_string("/proc/self/status").ok().and_then(|s| {
        s.lines().find(|l| l.starts_with(field))
            .and_then(|l| l.split_whitespace().nth(1))
            .and_then(|kb| kb.parse::<f64>().ok())
    }).map(|kb| kb / 1024.0).unwrap_or(0.0)
}
fn rss_mb() -> f64 { rss_field_mb("VmRSS:") }
fn peak_rss_mb() -> f64 { rss_field_mb("VmHWM:") }

fn parse_symbols(arg: Option<String>) -> Vec<String> {
    match arg {
        None => vec!["BTC/USDT".to_string()],
        Some(a) => match a.parse::<usize>() {
            Ok(n) => BUILTIN.iter().take(n.min(BUILTIN.len())).map(|s| s.to_string()).collect(),
            Err(_) => a.split(',').map(|s| s.trim().to_string()).filter(|s| !s.is_empty()).collect(),
        },
    }
}

fn main() {
    let run_secs: u64 = std::env::args().nth(1).and_then(|s| s.parse().ok()).unwrap_or(30);
    let syms = parse_symbols(std::env::args().nth(2));
    let channel = std::env::args().nth(3).unwrap_or_else(|| "book".to_string());
    // "BTC/USDT" -> "btcusdt@depth@100ms" (or "btcusdt@trade")
    let suffix = match channel.as_str() {
        "trades" => "@trade",
        "aggtrades" => "@aggTrade",
        _ => "@depth@100ms",
    };
    let streams: Vec<String> = syms.iter()
        .map(|s| format!("{}{suffix}", s.replace('/', "").to_lowercase()))
        .collect();
    println!(
        "binance-rs: {} {channel} stream(s) for {run_secs}s… {}",
        streams.len(),
        streams.iter().take(6).cloned().collect::<Vec<_>>().join(",")
    );

    let keep = AtomicBool::new(true);
    let frames = AtomicU64::new(0);
    let levels_total = AtomicU64::new(0);
    let books: Mutex<HashMap<String, Stream>> = Mutex::new(HashMap::new());
    let all_live_s = Mutex::new(f64::NAN);
    let start = Instant::now();
    let cpu0 = cpu_secs();

    let mut ws = WebSockets::new(|event: WebsocketEvent| {
        // (symbol, a, b) — bids/asks for a depth delta, or 1 trade for the tape.
        let hit = match &event {
            WebsocketEvent::DepthOrderBook(d) => Some((d.symbol.clone(), d.bids.len(), d.asks.len())),
            WebsocketEvent::Trade(t) => Some((t.symbol.clone(), 1usize, 0usize)),
            WebsocketEvent::AggrTrades(t) => Some((t.symbol.clone(), 1usize, 0usize)),
            _ => None,
        };
        if hit.is_none() && std::env::var("BRS_DEBUG").is_ok() {
            eprintln!("[unmatched] {event:?}");
        }
        if let Some((symbol, a, b)) = hit {
            frames.fetch_add(1, Ordering::Relaxed);
            let at = start.elapsed().as_secs_f64();
            let mut books = books.lock().unwrap();
            let e = books.entry(symbol)
                .or_insert(Stream { bids: 0, asks: 0, frames: 0, first_s: at });
            e.bids = a;
            e.asks = b;
            e.frames += 1;
            levels_total.fetch_add((a + b) as u64, Ordering::Relaxed);
            if books.len() == streams.len() {
                let mut all = all_live_s.lock().unwrap();
                if all.is_nan() { *all = at; }
            }
        }
        if start.elapsed().as_secs() >= run_secs {
            keep.store(false, Ordering::Relaxed);
        }
        Ok(())
    });

    if streams.len() == 1 {
        ws.connect(&streams[0]).expect("connect");
    } else {
        ws.connect_multiple_streams(&streams).expect("connect_multiple_streams");
    }
    if let Err(e) = ws.event_loop(&keep) {
        eprintln!("event_loop: {e:?}");
    }
    let _ = ws.disconnect();

    let cpu = cpu_secs() - cpu0;
    let wall = start.elapsed().as_secs_f64();
    let books = books.lock().unwrap();
    let delta_levels: usize = books.values().map(|s| s.bids + s.asks).sum();
    println!(
        "BINANCE-RS  books={}/{}  frames={}  levels_in_last_deltas={delta_levels}  \
         wall={wall:.1}s  cpu={cpu:.3}s  peakRSS={:.0}MB  resyncs=n/a",
        books.len(), streams.len(), frames.load(Ordering::Relaxed), peak_rss_mb()
    );
    let mut per: Vec<_> = books.iter()
        .map(|(s, v)| format!("{s} {}/{} live@{:.1}s x{}", v.bids, v.asks, v.first_s, v.frames))
        .collect();
    per.sort();
    let all = *all_live_s.lock().unwrap();
    println!(
        "note: @depth delivers raw deltas — no maintained/sorted book, no REST snapshot to seed. \
         t_all_live={}  per-stream: {per:?}",
        if all.is_nan() { "never".to_string() } else { format!("{all:.1}s") }
    );
    // One machine-readable line for the `compare` driver. binance-rs has no
    // market metadata and no snapshot stage, so the load/markets fields are 0.
    println!(
        "RESULT side=binance-rs channel={channel} mode=streams want={} books={} frames={} cpu={cpu:.3} wall={wall:.1} \
         levels={delta_levels} levels_total={} resyncs=0 t_all_live={} load_s=0.0 markets=0 currencies=0 \
         rss_boot=0 rss_new=0 rss_markets=0 rss_end={:.0} rss_peak={:.0}",
        streams.len(), books.len(), frames.load(Ordering::Relaxed),
        levels_total.load(Ordering::Relaxed),
        if all.is_nan() { -1.0 } else { all },
        rss_mb(), peak_rss_mb()
    );
}
