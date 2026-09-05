// exchange-verbose-sandbox — the two ways to turn on verbose logging and
// sandbox (testnet) routing on a typed exchange.
//
//   1. at construction, through `Config`
//   2. afterwards, through `set_verbose` / `set_sandbox_mode`
//
// Each mode makes one real public request so the `[ccxt]` log line shows the
// host actually being used — that URL is the proof sandbox took effect.
//
//   cargo run --release --bin exchange-verbose-sandbox
use ccxt::{Binance, Config};

fn state(label: &str, ex: &Binance) {
    println!(
        "  {label:<22} verbose={:<5} sandbox={:<5} id={}",
        ex.is_verbose(),
        ex.is_sandbox_mode_enabled(),
        ex.id(),
    );
}

async fn ping(ex: &mut Binance) {
    match ex.fetch_time(()).await {
        Ok(Some(ms)) => println!("  server time            {ms}"),
        Ok(None) => println!("  server time            none"),
        Err(e) => println!("  server time            [{}] {}", e.kind, e.message),
    }
}

async fn run() {
    println!("── 1. through Config, at construction");
    let mut a = Binance::with_config(Config::new().verbose(true).sandbox(true));
    state("Config::new()...", &a);
    ping(&mut a).await;

    println!("\n── 2. through the setters, after construction");
    let mut b = Binance::new(None);
    state("Binance::new(None)", &b);

    b.set_verbose(true);
    if let Err(e) = b.set_sandbox_mode(true) {
        println!("  set_sandbox_mode       [{}] {}", e.kind, e.message);
    }
    state("after setters", &b);
    ping(&mut b).await;

    println!("\n── setters also turn things back off");
    b.set_verbose(false);
    if let Err(e) = b.set_sandbox_mode(false) {
        println!("  set_sandbox_mode       [{}] {}", e.kind, e.message);
    }
    state("after reverting", &b);
    ping(&mut b).await;

    println!("\n── a venue with no testnet reports it instead of failing silently");
    let mut c = ccxt::Bitstamp::new(None);
    match c.set_sandbox_mode(true) {
        Ok(()) => println!("  bitstamp               enabled (unexpected)"),
        Err(e) => println!("  bitstamp               [{}] {}", e.kind, e.message),
    }
}

fn main() {
    if std::env::var("CCXT_SHOW_PANICS").is_err() {
        std::panic::set_hook(Box::new(|_| {}));
    }
    let rt = tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .thread_stack_size(64 * 1024 * 1024)
        .enable_all()
        .build()
        .unwrap();
    rt.block_on(run());
}
