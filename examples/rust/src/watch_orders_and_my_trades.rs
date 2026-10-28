// watchOrders + watchMyTrades on binance, both live at the same time.
//
// Both ride ONE user-data stream: one connection, one authentication (one
// listenKey for the USD-M/COIN-M streams, one signed ws-api session for spot).
// Watching the two channels does not authenticate twice.
//
// The typed watch methods take `&mut self`, so two of them cannot be awaited
// concurrently on a single instance — see multi_sub.rs Part A for the same
// shape. They don't need to be: the client's reader fills each channel's cache
// as frames land, so alternating the two awaits keeps both live. Each await is
// bounded by a short slice so a quiet channel can't starve the other (with no
// bound, `watch_orders` would block on an account that is only filling trades).
//
//   BINANCE_APIKEY=... BINANCE_SECRET=... \
//     cargo run --features ws --bin watch_orders_and_my_trades -- [secs]
//
// Runs for 60s by default. Read-only: it subscribes and prints, and places
// nothing, so it runs against the live host — read-only API keys are enough.
// There is no testnet switch on purpose: with credentials set, `load_markets`
// makes a signed sapi call, and binance's testnet has no sapi host, so it dies
// with "does not have a testnet/sandbox URL for sapi endpoints" before any
// stream opens (setting `fetchCurrencies: false` does not avoid it).
//
// BINANCE_MARKET_TYPE=future streams USD-M instead of spot, and SHOW_RAW=1
// adds each update's raw exchange payload (CCXT's `info` field).
use ccxt::{Config, Params};
use ccxt_pro::Binance;
use std::collections::HashSet;
use std::time::{Duration, Instant};

/// How long a single `watch_*` await is allowed to block before handing the
/// turn to the other channel, once that channel is up.
const SLICE: Duration = Duration::from_secs(2);

/// Budget for a channel's FIRST call, which does the work the round-robin
/// slice must not race: authenticate (a REST listenKey round-trip, or a signed
/// ws-api subscribe), open the socket, send the subscribe frame. Cancelling
/// that at 2s doesn't just retry — it can abort `authenticate` after it has
/// taken the single-flight lead but before it settles, and the next call then
/// joins a flight nobody is flying. A timeout at this budget means the stream
/// is up and the account is simply idle, which is reported rather than
/// swallowed, so a channel that never came up can't masquerade as a quiet one.
const CONNECT_BUDGET: Duration = Duration::from_secs(30);

fn creds() -> Option<(String, String)> {
    match (
        std::env::var("BINANCE_APIKEY"),
        std::env::var("BINANCE_SECRET"),
    ) {
        (Ok(k), Ok(s)) if !k.is_empty() && !s.is_empty() => Some((k, s)),
        _ => None,
    }
}

fn show_raw() -> bool {
    std::env::var("SHOW_RAW").is_ok()
}

fn num(v: Option<f64>) -> String {
    v.map(|n| format!("{n}")).unwrap_or_else(|| "-".to_string())
}

async fn run(secs: u64) {
    let (api_key, secret) = match creds() {
        Some(c) => c,
        None => {
            println!("watchOrders and watchMyTrades are private streams.");
            println!("set BINANCE_APIKEY and BINANCE_SECRET (read-only keys are enough).");
            return;
        }
    };
    let market_type = std::env::var("BINANCE_MARKET_TYPE").unwrap_or_else(|_| "spot".to_string());

    let cfg = Config::new()
        .api_key(&api_key)
        .secret(&secret)
        .option_str("defaultType", &market_type);

    let mut ex = Binance::with_config(cfg);
    if let Err(e) = ex.try_load_markets(false).await {
        println!("load_markets [{}] {}", e.kind, e.message);
        return;
    }
    println!("binance {market_type} — watchOrders + watchMyTrades on one connection, {secs}s");
    println!("waiting for account activity…\n");

    // The watch methods return the channel's cache, so the same entry comes
    // back on every call until it ages out. Print each state once: an order is
    // worth reprinting when its status or filled amount moves, a trade never is.
    let mut seen_orders: HashSet<String> = HashSet::new();
    let mut seen_trades: HashSet<String> = HashSet::new();
    let (mut order_updates, mut trade_updates) = (0u64, 0u64);
    // Each channel gets CONNECT_BUDGET until its first call comes back, then
    // drops to the round-robin SLICE.
    let (mut orders_up, mut trades_up) = (false, false);

    let deadline = Instant::now() + Duration::from_secs(secs);
    while Instant::now() < deadline {
        let remaining = deadline.saturating_duration_since(Instant::now());
        let budget = if orders_up { SLICE } else { CONNECT_BUDGET }.min(remaining);
        if budget.is_zero() {
            break;
        }
        // Only call it a subscribe timeout if the channel actually got its
        // full budget — a short run window ending early is not a failure.
        let full_budget = budget == CONNECT_BUDGET;

        match tokio::time::timeout(budget, ex.watch_orders(None, None, None, Params::none())).await {
            Ok(Ok(orders)) => {
                for o in &orders {
                    let key = format!(
                        "{}|{}|{}",
                        o.id.clone().unwrap_or_default(),
                        o.status.clone().unwrap_or_default(),
                        num(o.filled),
                    );
                    if !seen_orders.insert(key) {
                        continue;
                    }
                    order_updates += 1;
                    println!(
                        "[order] {} {} {} {} status={} amount={} price={} filled={} cost={}",
                        o.id.clone().unwrap_or_else(|| "-".to_string()),
                        o.symbol,
                        o.side.clone().unwrap_or_else(|| "-".to_string()),
                        o.order_type.clone().unwrap_or_else(|| "-".to_string()),
                        o.status.clone().unwrap_or_else(|| "-".to_string()),
                        num(o.amount),
                        num(o.price),
                        num(o.filled),
                        num(o.cost),
                    );
                    if show_raw() {
                        println!("         info={}", o.raw.to_json());
                    }
                }
            }
            Ok(Err(e)) => println!("[order] error [{}] {}", e.kind, e.message),
            Err(_) if !orders_up && full_budget => {
                println!("[order] subscribed, no events yet");
            }
            // Nothing on this channel within the slice — give the other a turn.
            Err(_) => {}
        }
        if !orders_up && full_budget {
            orders_up = true;
        }

        let remaining = deadline.saturating_duration_since(Instant::now());
        let budget = if trades_up { SLICE } else { CONNECT_BUDGET }.min(remaining);
        if budget.is_zero() {
            break;
        }
        let full_budget = budget == CONNECT_BUDGET;

        match tokio::time::timeout(budget, ex.watch_my_trades(None, None, None, Params::none()))
            .await
        {
            Ok(Ok(trades)) => {
                for t in &trades {
                    let key = t.id.clone().unwrap_or_else(|| {
                        format!("{}|{}", t.symbol, num(t.timestamp.map(|v| v as f64)))
                    });
                    if !seen_trades.insert(key) {
                        continue;
                    }
                    trade_updates += 1;
                    println!(
                        "[trade] {} {} {} amount={} price={} cost={}",
                        t.id.clone().unwrap_or_else(|| "-".to_string()),
                        t.symbol,
                        t.side.clone().unwrap_or_else(|| "-".to_string()),
                        num(t.amount),
                        num(t.price),
                        num(t.cost),
                    );
                    if show_raw() {
                        println!("         info={}", t.raw.to_json());
                    }
                }
            }
            Ok(Err(e)) => println!("[trade] error [{}] {}", e.kind, e.message),
            Err(_) if !trades_up && full_budget => {
                println!("[trade] subscribed, no events yet");
            }
            Err(_) => {}
        }
        if !trades_up && full_budget {
            trades_up = true;
        }
    }

    println!("\ndone: {order_updates} order updates, {trade_updates} trades");
    if order_updates == 0 && trade_updates == 0 {
        if orders_up || trades_up {
            println!("(subscribed fine — no account activity in the window; place or fill an order to see output)");
        } else {
            println!("(neither stream came up — see the errors above)");
        }
    }
}

fn main() {
    let secs: u64 = std::env::args()
        .nth(1)
        .and_then(|v| v.parse().ok())
        .unwrap_or(60);
    if std::env::var("CCXT_SHOW_PANICS").is_err() {
        std::panic::set_hook(Box::new(|_| {}));
    }
    tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .thread_stack_size(64 * 1024 * 1024)
        .enable_all()
        .build()
        .unwrap()
        .block_on(run(secs));
}
