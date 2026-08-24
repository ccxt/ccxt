// binance-order-with-params — placing an order with exchange-specific extras.
//
// Every unified method ends with a `params` argument for the knobs a
// particular venue understands. On the typed layer that is a `Params` builder,
// so it is written with Rust primitives rather than a dynamic `Value`:
//
//     Params::new()
//         .with_str("clientOrderId", "my-id-1")
//         .with_bool("postOnly", true)
//         .with_str("selfTradePrevention", "EXPIRE_MAKER")
//
// The unified ones (`clientOrderId`, `postOnly`, `timeInForce`, `reduceOnly`,
// `triggerPrice`, …) mean the same thing on every venue; ccxt translates them
// into whatever binance actually wants on the wire — `postOnly` becomes a
// LIMIT_MAKER order type on spot, `clientOrderId` becomes `newClientOrderId`.
//
//   cargo run --release --bin binance-order-with-params
//
// With no credentials it prints what would be sent and stops.
//
// With credentials it runs against the binance **testnet**
// (`Config::sandbox(true)`); BINANCE_LIVE=1 targets the live host instead.
// The resolved endpoint is printed rather than assumed, so you can always see
// where an order is actually going.
//
// Placing anything still needs an explicit opt-in:
//
//   BINANCE_APIKEY=… BINANCE_SECRET=…                      -> validate-only
//   BINANCE_APIKEY=… BINANCE_SECRET=… BINANCE_PLACE_REAL=1 -> places for real
//
// The default path uses binance's `params.test = true` endpoint, which runs
// full validation and creates nothing. The opt-in path is capped at 25 USD
// notional per order and cancels whatever it creates.
use ccxt::types::{Market, Order};
use ccxt::{Binance, Config, ExchangeError, Params};

/// Hard cap on the notional of any order this example is willing to send.
const MAX_NOTIONAL_USD: f64 = 25.0;
const SYMBOL: &str = "BTC/USDT";

fn creds() -> Option<(String, String)> {
    match (std::env::var("BINANCE_APIKEY"), std::env::var("BINANCE_SECRET")) {
        (Ok(k), Ok(s)) if !k.is_empty() && !s.is_empty() => Some((k, s)),
        _ => None,
    }
}

/// A client order id unique per run. Binance rejects a repeat within its
/// retention window with DuplicateOrderId, which is the whole point of the id.
fn client_id(tag: &str, nonce: u128) -> String {
    format!("ccxt-{tag}-{nonce}")
}

fn first_line(m: &str) -> String {
    m.lines().next().unwrap_or("").chars().take(160).collect()
}

fn show_err(label: &str, e: &ExchangeError) {
    println!("   {label:<10} [{}] {}", e.kind, first_line(&e.message));
}

fn show_order(label: &str, o: &Order) {
    println!(
        "   {label:<10} id={} clientOrderId={} status={} type={} {} {:?} @ {:?}",
        o.id.clone().unwrap_or_default(),
        o.client_order_id.clone().unwrap_or_else(|| "—".into()),
        o.status.clone().unwrap_or_default(),
        o.order_type.clone().unwrap_or_default(),
        o.side.clone().unwrap_or_default(),
        o.amount,
        o.price,
    );
}

/// Refuse to send anything worth `MAX_NOTIONAL_USD` or more.
fn guard(amount: f64, price: f64) -> Result<(), String> {
    let notional = amount * price;
    if notional >= MAX_NOTIONAL_USD {
        return Err(format!("{notional:.2} USD >= {MAX_NOTIONAL_USD:.0} cap — refusing"));
    }
    Ok(())
}

/// Smallest amount that satisfies both the min-amount and min-cost limits.
fn min_amount_at(m: &Market, price: f64) -> f64 {
    let min_amount = m.limits.amount.min.unwrap_or(0.0001);
    let min_cost = m.limits.cost.min.unwrap_or(5.0);
    f64::max(min_amount, (min_cost * 1.05) / price)
}

/// Where requests will actually go, read back off the constructed exchange
/// rather than assumed. Worth doing for anything that places orders.
fn api_host(ex: &Binance) -> String {
    let api = ccxt::runtime::get_value(&ex.urls, &ccxt::Value::Str("api".to_string()));
    match ccxt::runtime::get_value(&api, &ccxt::Value::Str("public".to_string())) {
        ccxt::Value::Str(s) => s,
        _ => "?".to_string(),
    }
}

async fn run() {
    let has_creds = creds().is_some();
    let place_real = std::env::var("BINANCE_PLACE_REAL").is_ok();
    let live = std::env::var("BINANCE_LIVE").is_ok();
    // Nonce for the client ids — passed in rather than generated per call so
    // all four stages of one run are grouped by the same suffix.
    let nonce = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis())
        .unwrap_or(0);

    println!("binance-order-with-params");
    println!(
        "  credentials: {}   mode: {}   cap: {MAX_NOTIONAL_USD:.0} USD/order",
        if has_creds { "present" } else { "none" },
        if !has_creds { "public only" }
        else if place_real { "PLACES ORDERS (BINANCE_PLACE_REAL=1)" }
        else { "validate-only (params.test)" }
    );

    let mut cfg = Config::new()
        .option("fetchMarkets", Params::new().with_strs("types", &["spot"]))
        // binance's fetchCurrencies is an AUTHENTICATED call needing wallet
        // permission, and loadMarkets runs it whenever credentials are set.
        // Order placement does not need currencies, and a trade-only API key
        // (the sane setup) cannot make that call — so opt out.
        .option_bool("fetchCurrencies", false)
        // Likewise `fetchMargins`: binance's spot market load pulls margin
        // pair lists from `sapi` when credentials are present. Testnet has no
        // `sapi` at all, and a trade-only key cannot call it — and none of it
        // is needed to place an order.
        .option_bool("fetchMargins", false);
    // CCXT_VERBOSE=1 logs every HTTP request and response — the first thing to
    // reach for when a venue rejects a parameter set.
    if std::env::var("CCXT_VERBOSE").is_ok() {
        cfg = cfg.verbose(true);
    }
    if let Some((k, s)) = creds() {
        cfg = cfg.api_key(&k).secret(&s);
        if !live {
            cfg = cfg.sandbox(true);
        }
    }
    let mut ex = Binance::with_config(cfg);
    // Print the resolved host instead of asserting one — sandbox routing does
    // not currently work, so an assumption here would be a dangerous lie.
    println!("  endpoint:    {}", api_host(&ex));
    if let Err(e) = ex.try_load_markets(false).await {
        println!("\nload_markets failed [{}]: {}", e.kind, first_line(&e.message));
        return;
    }
    let market = match ex.market(SYMBOL) {
        Ok(m) => m,
        Err(e) => { println!("\n{}: {}", e.kind, first_line(&e.message)); return; }
    };
    let last = match ex.fetch_ticker(SYMBOL, Params::none()).await {
        Ok(t) => t.last.unwrap_or(0.0),
        Err(e) => { println!("\nno reference price [{}]", e.kind); return; }
    };
    // Well below the book, so a limit buy rests instead of filling.
    let resting_price = (last * 0.5).floor();
    let amount = min_amount_at(&market, resting_price);
    println!("\n  {SYMBOL} last={last:.2}  resting bid={resting_price:.2}  amount={amount:.6}");

    // ── The parameter set ───────────────────────────────────────────────────
    // Built from primitives; `Params` keeps insertion order, which is what the
    // signing code expects.
    let build_params = |tag: &str| {
        Params::new()
            // Your own id for the order — survives round-trips, and lets you
            // cancel or look the order up without storing the venue's id.
            .with_str("clientOrderId", &client_id(tag, nonce))
            // Maker-only: reject rather than cross the spread. ccxt turns this
            // into a LIMIT_MAKER order type on binance spot.
            .with_bool("postOnly", true)
            // What binance should do if this would trade against your own order.
            .with_str("selfTradePrevention", "EXPIRE_MAKER")
    };

    println!("\n── params being sent");
    println!("   clientOrderId       {}", client_id("rest", nonce));
    println!("   postOnly            true   (-> LIMIT_MAKER on binance spot)");
    println!("   selfTradePrevention EXPIRE_MAKER");
    println!("   note: postOnly and timeInForce are mutually exclusive — binance");
    println!("         rejects LIMIT_MAKER carrying a timeInForce.");

    if !has_creds {
        println!("\nno credentials — stopping before any request that needs them.");
        println!("BINANCE_APIKEY=… BINANCE_SECRET=… to run the four order stages.");
        return;
    }

    // ── 1. Validate only ────────────────────────────────────────────────────
    // `test: true` routes to binance's /order/test endpoint: full validation,
    // nothing created. The cheapest way to check a parameter set is accepted.
    println!("\n── 1. dry run (params.test = true — validates, creates nothing)");
    let dry = build_params("test").with_bool("test", true);
    match ex.create_order(SYMBOL, "limit", "buy", amount, Some(resting_price), dry).await {
        Ok(o) => show_order("accepted", &o),
        Err(e) => show_err("rejected", &e),
    }

    if !place_real {
        println!("\n── 2-5. real order / read-back / cancel / postOnly rejection");
        println!("   skipped    validate-only. BINANCE_PLACE_REAL=1 to run them.");
        println!("\n   They place orders against {}.", api_host(&ex));
        return;
    }

    // ── 2. A real resting order ─────────────────────────────────────────────
    println!("\n── 2. real order, cancelled afterwards");
    let rest_id = client_id("rest", nonce);
    if let Err(why) = guard(amount, resting_price) {
        println!("   skipped    {why}");
    } else {
        match ex.create_order(SYMBOL, "limit", "buy", amount, Some(resting_price), build_params("rest")).await {
            Err(e) => show_err("rejected", &e),
            Ok(o) => {
                show_order("created", &o);

                // ── 3. Read it back by YOUR id, not the venue's ─────────────
                // `fetch_order` takes the exchange id positionally; the client
                // id goes through params.
                println!("\n── 3. read back by clientOrderId");
                let by_client = Params::new().with_str("clientOrderId", &rest_id);
                match ex.fetch_order("", Some(SYMBOL), by_client).await {
                    Ok(f) => show_order("found", &f),
                    Err(e) => show_err("lookup", &e),
                }

                // ── 4. Cancel by the same id ────────────────────────────────
                println!("\n── 4. cancel by clientOrderId");
                let cancel_by_client = Params::new().with_str("clientOrderId", &rest_id);
                match ex.cancel_order("", Some(SYMBOL), cancel_by_client).await {
                    Ok(c) => show_order("cancelled", &c),
                    Err(e) => {
                        show_err("cancel", &e);
                        // Fall back to the venue id so nothing is left resting.
                        if let Some(id) = o.id.clone() {
                            match ex.cancel_order(&id, Some(SYMBOL), Params::none()).await {
                                Ok(c) => show_order("cancelled", &c),
                                Err(e) => show_err("cancel!", &e),
                            }
                        }
                    }
                }
            }
        }
    }

    // ── 5. postOnly actually refusing to cross ──────────────────────────────
    // Priced ABOVE the market, so it would take rather than make. postOnly
    // means binance rejects it instead of filling — that rejection IS the
    // demonstration. Still guarded, in case the venue ever ignores the flag.
    println!("\n── 5. postOnly buy priced above the market (expect a rejection)");
    let crossing_price = (last * 1.02).ceil();
    let crossing_amount = min_amount_at(&market, crossing_price);
    if let Err(why) = guard(crossing_amount, crossing_price) {
        println!("   skipped    {why}");
    } else {
        let p = build_params("cross");
        match ex.create_order(SYMBOL, "limit", "buy", crossing_amount, Some(crossing_price), p).await {
            Err(e) => {
                show_err("rejected", &e);
                println!("   postOnly honoured — the order never crossed the spread.");
            }
            Ok(o) => {
                // Should not happen; clean up immediately if it does.
                show_order("FILLED?", &o);
                println!("   unexpected: postOnly did not prevent a crossing order.");
                if let Some(id) = o.id.clone() {
                    let _ = ex.cancel_order(&id, Some(SYMBOL), Params::none()).await;
                }
            }
        }
    }

    // Nothing should be left open. Say so either way.
    println!("\n── final open orders on {SYMBOL}");
    match ex.fetch_open_orders(Some(SYMBOL), None, None, Params::none()).await {
        Ok(open) if open.is_empty() => println!("   none — clean."),
        Ok(open) => {
            println!("   {} still open:", open.len());
            for o in &open { show_order("open", o); }
        }
        Err(e) => show_err("lookup", &e),
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
