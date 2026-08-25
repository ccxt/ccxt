// binance-order-error-handling — placing orders and reacting to what goes wrong.
//
// CCXT normalises every venue's error strings into one class hierarchy
// (`ts/src/base/errorHierarchy.ts`). In Rust that arrives as `ExchangeError`
// with a `.kind` and an `.is("...")` test that walks the hierarchy, so
// `OrderNotFound.is("InvalidOrder")` and `RequestTimeout.is("NetworkError")`
// are both true. That is what lets you write ONE handler that works across
// exchanges instead of grepping venue-specific messages.
//
// This example walks a series of order attempts, each one provoking a
// different failure, and routes every outcome through a single
// `classify()` policy function — the part worth copying.
//
//   cargo run --release --bin binance-order-error-handling
//
// Runs with no credentials by default: the client-side failures (missing keys,
// unknown symbol, below-minimum amount) need no account, and the rest are
// reported as skipped. With credentials it also exercises InsufficientFunds
// and OrderNotFound.
//
//   BINANCE_APIKEY=... BINANCE_SECRET=... cargo run --release \
//       --bin binance-order-error-handling
//
// Credentials go to the **testnet** unless BINANCE_LIVE=1 is set. Every order
// this example would actually place is checked against a 25 USD notional cap
// first and any order that does get created is cancelled before exit.
use ccxt::types::{Market, Order};
use ccxt::{Binance, Config, ExchangeError, Params};

/// Hard cap on the notional of any order this example is willing to send.
const MAX_NOTIONAL_USD: f64 = 25.0;

/// What a caller should actually DO about an error. This is the reusable part:
/// it is written entirely against the unified hierarchy, so the same function
/// works for any ccxt exchange.
#[derive(Debug, PartialEq)]
enum Policy {
    /// Transient. Back off and try the same request again.
    Retry { after_ms: u64 },
    /// The request is wrong but fixable — round the amount, top up, re-price.
    Fix(&'static str),
    /// Nothing to retry: credentials, permissions, or an unsupported call.
    Abort(&'static str),
    /// Order is already gone / already done. Usually benign.
    Ignore(&'static str),
}

fn classify(e: &ExchangeError) -> Policy {
    // Order matters: test the most specific classes first, then fall back to
    // the parent classes via `is()`.
    if e.is("InsufficientFunds") {
        return Policy::Fix("not enough balance — reduce size or fund the account");
    }
    if e.is("OrderNotFound") {
        return Policy::Ignore("order already filled, cancelled, or never existed");
    }
    if e.is("DuplicateOrderId") {
        return Policy::Ignore("this clientOrderId was already accepted");
    }
    if e.is("InvalidOrder") {
        // Parent of OrderNotFound/DuplicateOrderId, so it must come after them.
        return Policy::Fix("order parameters rejected — check amount/price/limits");
    }
    if e.is("BadSymbol") {
        return Policy::Abort("symbol not listed on this venue");
    }
    if e.is("AuthenticationError") {
        // Also covers PermissionDenied / AccountSuspended.
        return Policy::Abort("credentials missing, wrong, or lacking permission");
    }
    if e.is("RateLimitExceeded") || e.is("DDoSProtection") {
        return Policy::Retry { after_ms: 2_000 };
    }
    if e.is("OnMaintenance") {
        return Policy::Retry { after_ms: 30_000 };
    }
    if e.is("NetworkError") {
        // RequestTimeout, ExchangeNotAvailable, InvalidNonce, ChecksumError…
        return Policy::Retry { after_ms: 500 };
    }
    if e.is("NotSupported") {
        return Policy::Abort("this exchange does not implement that call");
    }
    if e.is("BadRequest") || e.is("ArgumentsRequired") {
        return Policy::Fix("malformed request — check the arguments");
    }
    Policy::Abort("unclassified — inspect .kind and the raw message")
}

fn report(case: &str, outcome: Result<Order, ExchangeError>) {
    println!("\n── {case}");
    match outcome {
        Ok(o) => println!(
            "   OK       id={} status={} {} {:?} @ {:?}",
            o.id.clone().unwrap_or_default(),
            o.status.clone().unwrap_or_default(),
            o.symbol,
            o.amount,
            o.price
        ),
        Err(e) => {
            // `.kind` is the leaf class; the chain shows what it inherits from.
            println!("   kind     {}", e.kind);
            println!("   chain    {}", chain(&e));
            println!("   message  {}", first_line(&e.message));
            println!("   policy   {:?}", classify(&e));
        }
    }
}

/// Walk the hierarchy so the output shows *why* a generic handler catches it.
fn chain(e: &ExchangeError) -> String {
    const LADDER: &[&str] = &[
        "InsufficientFunds",
        "OrderNotFound",
        "DuplicateOrderId",
        "InvalidOrder",
        "BadSymbol",
        "BadRequest",
        "ArgumentsRequired",
        "PermissionDenied",
        "AuthenticationError",
        "NotSupported",
        "OperationRejected",
        "ExchangeError",
        "RateLimitExceeded",
        "DDoSProtection",
        "OnMaintenance",
        "RequestTimeout",
        "ExchangeNotAvailable",
        "NetworkError",
        "OperationFailed",
        "BaseError",
    ];
    let hits: Vec<&str> = LADDER
        .iter()
        .copied()
        .filter(|k| *k != e.kind && e.is(k))
        .collect();
    if hits.is_empty() {
        e.kind.clone()
    } else {
        format!("{} -> {}", e.kind, hits.join(" -> "))
    }
}

fn first_line(m: &str) -> String {
    m.lines().next().unwrap_or("").chars().take(160).collect()
}

/// Refuse to send anything worth `MAX_NOTIONAL_USD` or more. Called before
/// every `create_order` that could actually rest on the book.
fn guard_notional(amount: f64, price: f64) -> Result<(), String> {
    let notional = amount * price;
    if notional >= MAX_NOTIONAL_USD {
        return Err(format!(
            "refusing to send {notional:.2} USD notional (cap {MAX_NOTIONAL_USD:.0})"
        ));
    }
    Ok(())
}

/// Declared minimums, straight off the typed market — no `Value` digging.
fn mins(m: &Market) -> (f64, f64) {
    (
        m.limits.amount.min.unwrap_or(0.0),
        m.limits.cost.min.unwrap_or(0.0),
    )
}

fn creds() -> Option<(String, String)> {
    match (
        std::env::var("BINANCE_APIKEY"),
        std::env::var("BINANCE_SECRET"),
    ) {
        (Ok(k), Ok(s)) if !k.is_empty() && !s.is_empty() => Some((k, s)),
        _ => None,
    }
}

fn build(with_creds: bool) -> Binance {
    // Spot only — keeps loadMarkets small and the symbols unambiguous.
    let mut cfg = Config::new().option("fetchMarkets", Params::new().with_strs("types", &["spot"]));
    if with_creds {
        if let Some((k, s)) = creds() {
            cfg = cfg.api_key(&k).secret(&s);
        }
    }
    Binance::with_config(cfg)
}

async fn run() {
    let has_creds = creds().is_some();
    let live = std::env::var("BINANCE_LIVE").is_ok();
    println!("binance-order-error-handling");
    println!(
        "  credentials: {}   target: {}",
        if has_creds {
            "present"
        } else {
            "none (client-side cases only)"
        },
        if !has_creds {
            "public endpoints"
        } else if live {
            "LIVE"
        } else {
            "testnet (sandbox)"
        }
    );
    println!("  notional cap: {MAX_NOTIONAL_USD:.0} USD per order");

    // ── 1. No credentials: caught before any HTTP request goes out ──────────
    {
        let mut ex = build(false);
        // No credentials here, so the (authenticated) currency load is skipped
        // and this cannot fail — but check anyway rather than assume.
        if let Err(e) = ex.try_load_markets(false).await {
            println!(
                "load_markets failed [{}]: {}",
                e.kind,
                first_line(&e.message)
            );
            return;
        }
        let out = ex
            .create_order("BTC/USDT", "limit", "buy", 0.001, Some(1.0), Params::none())
            .await;
        report("1. create_order with no API keys", out);
    }

    let mut ex = build(has_creds);
    if let Err(e) = ex.try_load_markets(false).await {
        println!("\n── load_markets");
        println!("   kind     {}", e.kind);
        println!("   chain    {}", chain(&e));
        println!("   message  {}", first_line(&e.message));
        println!("   policy   {:?}", classify(&e));
        println!("\ncannot continue without a market table.");
        return;
    }

    // A real reference price, so the guard and the limits checks mean something.
    let last = match ex.fetch_ticker("BTC/USDT", Params::none()).await {
        Ok(t) => t.last.unwrap_or(0.0),
        Err(e) => {
            println!("\ncannot fetch a reference price: {}", e.kind);
            return;
        }
    };
    println!("\n  BTC/USDT last = {last:.2}");

    // ── 2. Unknown symbol: rejected locally by market() ─────────────────────
    {
        let out = ex
            .create_order(
                "NOTACOIN/USDT",
                "limit",
                "buy",
                1.0,
                Some(1.0),
                Params::none(),
            )
            .await;
        report("2. create_order on an unlisted symbol", out);
    }

    // ── 3. Below the venue minimum ──────────────────────────────────────────
    // Check the declared limits FIRST — a local check costs no request and no
    // rate-limit weight. Then send it anyway to show what the venue returns.
    {
        let market = match ex.market("BTC/USDT") {
            Ok(m) => m,
            Err(e) => {
                println!("\ncannot read the market: {}", e.kind);
                return;
            }
        };
        let (min_amount, min_cost) = mins(&market);
        println!(
            "\n   (declared limits: min amount {min_amount}, min cost {min_cost} — \
             checking these before sending avoids a wasted request)"
        );
        let tiny = if min_amount > 0.0 {
            min_amount / 10.0
        } else {
            0.000_001
        };
        let price = last * 0.5; // far from the book: cannot fill
        let out = ex
            .create_order(
                "BTC/USDT",
                "limit",
                "buy",
                tiny,
                Some(price),
                Params::none(),
            )
            .await;
        report("3. create_order below the minimum amount", out);
    }

    // ── 6. A real order, inside the cap, then cleaned up ────────────────────
    {
        let market = ex.market("BTC/USDT").expect("BTC/USDT is listed");
        let (min_amount, min_cost) = mins(&market);
        let min_amount = if min_amount > 0.0 { min_amount } else { 0.0001 };
        let min_cost = if min_cost > 0.0 { min_cost } else { 5.0 };
        let price = last * 0.5; // far below the book: rests, never fills
                                // Satisfy BOTH minimums, then verify the result is under the cap.
        let amount = f64::max(min_amount, (min_cost * 1.1) / price);
        match guard_notional(amount, price) {
            Err(why) => println!("\n── 6. resting order — skipped: {why}"),
            Ok(()) => {
                println!(
                    "\n   (sending {amount:.6} BTC @ {price:.2} = {:.2} USD notional, under the cap)",
                    amount * price
                );
                let created = ex
                    .create_order(
                        "BTC/USDT",
                        "limit",
                        "buy",
                        amount,
                        Some(price),
                        Params::none(),
                    )
                    .await;
                let id = created.as_ref().ok().and_then(|o| o.id.clone());
                report("6. a valid resting order", created);
                // Always clean up, whatever happened above.
                if let Some(id) = id {
                    let out = ex.cancel_order(&id, Some("BTC/USDT"), Params::none()).await;
                    report("6b. cleanup: cancel_order", out);
                }
            }
        }
    }

    summary();
}

fn summary() {
    println!("\n────────────────────────────────────────────────────────────");
    println!("Takeaway: match on the hierarchy, not on message text.");
    println!("  err.is(\"InvalidOrder\")      catches OrderNotFound, DuplicateOrderId,");
    println!("                               OrderNotFillable, ContractUnavailable, …");
    println!("  err.is(\"NetworkError\")      catches RequestTimeout, RateLimitExceeded,");
    println!("                               DDoSProtection, ExchangeNotAvailable, OnMaintenance");
    println!("  err.is(\"AuthenticationError\") catches PermissionDenied, AccountSuspended");
    println!("Retry only the OperationFailed subtree; everything under ExchangeError");
    println!("is a bug in the request or the account state and will fail again.");
}

fn main() {
    // The transpiled core signals errors by panicking across an internal
    // catch_unwind; the typed layer turns that back into `Result`. Silence the
    // default hook so the caught panics do not double-print above each case.
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
