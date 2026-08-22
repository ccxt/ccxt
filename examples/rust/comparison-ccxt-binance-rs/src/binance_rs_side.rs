// binance-rs baseline: watch the BTC/USDT diff-depth stream (the same feed
// ccxt's watch_order_book consumes) and report frames / CPU / peak RSS over N
// seconds. binance-rs hands you the raw delta per frame; it does NOT maintain a
// sorted book (that's the asymmetry vs ccxt, which maintains + checksums a full
// book).
use binance::websockets::{WebSockets, WebsocketEvent};
use std::sync::atomic::{AtomicBool, AtomicU64, AtomicUsize, Ordering};
use std::time::Instant;

fn cpu_secs() -> f64 {
    std::fs::read_to_string("/proc/self/stat").ok().and_then(|s| {
        let close = s.rfind(')')?;
        let rest: Vec<&str> = s[close + 2..].split_whitespace().collect();
        let u: f64 = rest.get(11)?.parse().ok()?;
        let k: f64 = rest.get(12)?.parse().ok()?;
        Some((u + k) / 100.0)
    }).unwrap_or(0.0)
}
fn peak_rss_mb() -> f64 {
    std::fs::read_to_string("/proc/self/status").ok().and_then(|s| {
        s.lines().find(|l| l.starts_with("VmHWM:"))
            .and_then(|l| l.split_whitespace().nth(1))
            .and_then(|kb| kb.parse::<f64>().ok())
    }).map(|kb| kb / 1024.0).unwrap_or(0.0)
}

fn main() {
    let run_secs: u64 = std::env::args().nth(1).and_then(|s| s.parse().ok()).unwrap_or(30);
    let sym = std::env::var("SYM").unwrap_or_else(|_| "btcusdt".into());
    println!("binance-rs: {sym}@depth@100ms for {run_secs}s…");

    let keep = AtomicBool::new(true);
    let frames = AtomicU64::new(0);
    let last_b = AtomicUsize::new(0);
    let last_a = AtomicUsize::new(0);
    let start = Instant::now();
    let cpu0 = cpu_secs();

    let mut ws = WebSockets::new(|event: WebsocketEvent| {
        if let WebsocketEvent::DepthOrderBook(d) = event {
            frames.fetch_add(1, Ordering::Relaxed);
            last_b.store(d.bids.len(), Ordering::Relaxed);
            last_a.store(d.asks.len(), Ordering::Relaxed);
        }
        if start.elapsed().as_secs() >= run_secs {
            keep.store(false, Ordering::Relaxed);
        }
        Ok(())
    });

    ws.connect(&format!("{sym}@depth@100ms")).expect("connect");
    if let Err(e) = ws.event_loop(&keep) {
        eprintln!("event_loop: {e:?}");
    }
    let _ = ws.disconnect();

    let cpu = cpu_secs() - cpu0;
    let wall = start.elapsed().as_secs_f64();
    println!(
        "BINANCE-RS  frames={}  (last delta: bids={} asks={})  \
         wall={wall:.1}s  cpu={cpu:.3}s  peakRSS={:.0}MB",
        frames.load(Ordering::Relaxed),
        last_b.load(Ordering::Relaxed),
        last_a.load(Ordering::Relaxed),
        peak_rss_mb()
    );
    println!("note: binance-rs @depth delivers raw deltas — no maintained/sorted book.");
}
