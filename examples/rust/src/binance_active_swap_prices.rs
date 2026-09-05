// binance-active-swap-prices — swap markets → active ones → first 10 → prices,
// entirely on the typed wrapper.
//
// The point of the typed layer is that none of this needs the dynamic `Value`
// enum: `markets()` hands back `Vec<Market>` with real Rust fields (`swap`,
// `active`, `linear`, `limits`, `precision`), and `fetch_tickers` hands back
// `Tickers` — a `HashMap<String, Ticker>` of decoded prices.
//
//   cargo run --release --bin binance-active-swap-prices
//   cargo run --release --bin binance-active-swap-prices -- 25    # first 25
use ccxt::types::{Market, Ticker};
use ccxt::{Binance, Config, Params};

fn f(v: Option<f64>) -> String {
    v.map(|x| format!("{x}")).unwrap_or_else(|| "—".to_string())
}

/// `linear`/`inverse` as a label, straight off the typed market.
fn contract_kind(m: &Market) -> &'static str {
    match (m.linear, m.inverse) {
        (Some(true), _) => "linear",
        (_, Some(true)) => "inverse",
        _ => "?",
    }
}

async fn run() {
    let take: usize = std::env::args().nth(1).and_then(|s| s.parse().ok()).unwrap_or(10);

    // 1. Build the client. No `Value` anywhere — `Config` takes primitives and
    //    nests `options` the same way every other ccxt binding does.
    let mut binance = Binance::with_config(
        Config::new().option("fetchMarkets", Params::new().with_strs("types", &["linear", "inverse"])),
    );

    // 2. Load the market table once.
    binance.load_markets(false).await;
    let all: Vec<Market> = binance.markets();
    println!("loaded {} markets", all.len());

    // 3. Swap markets only — `Market::swap` is a plain `bool`.
    let swaps: Vec<Market> = all.into_iter().filter(|m| m.swap).collect();
    println!("  of which swap:   {}", swaps.len());

    // 4. Active only — the `active` flag on the market, no request needed.
    let (active, inactive): (Vec<Market>, Vec<Market>) =
        swaps.into_iter().partition(|m| m.active);
    println!("  of which active: {} (skipping {} inactive)", active.len(), inactive.len());
    if let Some(m) = inactive.first() {
        println!("  e.g. inactive:   {} ({})", m.symbol, contract_kind(m));
    }

    // 5. First N. Sort by symbol so the selection is reproducible — the order
    //    the venue lists markets in is not stable.
    let mut chosen = active;
    chosen.sort_by(|a, b| a.symbol.cmp(&b.symbol));
    chosen.truncate(take);
    if chosen.is_empty() {
        println!("\nno active swap markets found");
        return;
    }
    println!("\ntaking the first {} by symbol:", chosen.len());

    // 6. Prices for exactly those symbols — one batched call rather than N.
    let symbols: Vec<String> = chosen.iter().map(|m| m.symbol.clone()).collect();
    let tickers = match binance.fetch_tickers(Some(symbols.clone()), Params::none()).await {
        Ok(t) => t,
        Err(e) => {
            // Unified error hierarchy: retry the OperationFailed subtree only.
            println!("fetch_tickers failed [{}]: {}", e.kind, e.message);
            println!("retryable: {}", e.is("OperationFailed"));
            return;
        }
    };

    // binance's futures 24h-ticker endpoint carries last/high/low/volume but
    // NOT bid/ask, so those come back as `None`. The top of book is a separate
    // endpoint — `fetch_bids_asks` — also batched. Merge the two so the table
    // below has a full quote.
    let books = binance.fetch_bids_asks(Some(symbols), Params::none()).await.unwrap_or_default();

    println!(
        "\n{:<24} {:>6} {:>14} {:>14} {:>14} {:>16}",
        "symbol", "kind", "bid", "ask", "last", "24h base vol"
    );
    println!("{}", "-".repeat(94));
    for m in &chosen {
        match tickers.get(&m.symbol) {
            Some(t) => {
                let book = books.get(&m.symbol);
                let bid = t.bid.or_else(|| book.and_then(|b| b.bid));
                let ask = t.ask.or_else(|| book.and_then(|b| b.ask));
                println!(
                    "{:<24} {:>6} {:>14} {:>14} {:>14} {:>16}",
                    m.symbol, contract_kind(m), f(bid), f(ask), f(t.last), f(t.base_volume)
                );
            }
            // A listed, active market can still have no ticker (never traded).
            None => println!("{:<24} {:>6} {:>14}", m.symbol, contract_kind(m), "no ticker"),
        }
    }

    // 7. The typed market carries its trading rules too — useful before sizing
    //    an order, and free (already loaded, no extra request).
    if let Some(m) = chosen.first() {
        println!(
            "\n{} — settle {} · min amount {} · min cost {} · amount step {} · price step {}",
            m.symbol,
            m.settle.clone().unwrap_or_else(|| "—".to_string()),
            f(m.limits.amount.min),
            f(m.limits.cost.min),
            f(m.precision.amount),
            f(m.precision.price),
        );
        let cheapest: Option<&Ticker> = tickers.get(&m.symbol);
        if let (Some(min), Some(px)) = (m.limits.amount.min, cheapest.and_then(|t| t.last)) {
            println!("  smallest order there ≈ {:.2} {}", min * px, m.quote);
        }
    }
}

fn main() {
    // The transpiled core signals errors by panicking across an internal
    // catch_unwind; the typed layer turns that back into `Result`. Silence the
    // default hook so caught errors do not print twice.
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
