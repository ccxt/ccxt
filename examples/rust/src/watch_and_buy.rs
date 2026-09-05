use ccxt::types::Market;
use ccxt::{Config, Params};
use ccxt_pro::Binance;

const SYMBOL: &str = "BTC/USDT";
const MAX_NOTIONAL_USD: f64 = 25.0;

fn creds() -> Option<(String, String)> {
    match (
        std::env::var("BINANCE_APIKEY"),
        std::env::var("BINANCE_SECRET"),
    ) {
        (Ok(k), Ok(s)) if !k.is_empty() && !s.is_empty() => Some((k, s)),
        _ => None,
    }
}

fn order_amount(m: &Market, price: f64) -> f64 {
    let min_amount = m.limits.amount.min.unwrap_or(0.0001);
    let min_cost = m.limits.cost.min.unwrap_or(5.0);
    let step = m.precision.amount.filter(|s| *s > 0.0).unwrap_or(0.0);
    let mut amount = f64::max(min_amount, min_cost / price);
    if step > 0.0 {
        amount = ((amount / step) + 1e-9).ceil() * step;
        for _ in 0..8 {
            if amount * price >= min_cost && amount >= min_amount {
                break;
            }
            amount += step;
        }
    }
    amount
}

async fn run() {
    let place_real = std::env::var("BINANCE_PLACE_REAL").is_ok();
    let live = std::env::var("BINANCE_LIVE").is_ok();

    let mut cfg = Config::new();
    if let Some((k, s)) = creds() {
        cfg = cfg.api_key(&k).secret(&s);
        if !live {
            cfg = cfg.sandbox(true);
        }
    }

    // One instance: watch_order_book (WS) and create_order (REST) both come off it.
    let mut exchange = Binance::with_config(cfg);
    if let Err(e) = exchange.try_load_markets(false).await {
        println!("load_markets failed [{}]: {}", e.kind, e.message);
        return;
    }
    let market = match exchange.market(SYMBOL) {
        Ok(m) => m,
        Err(e) => {
            println!("[{}] {}", e.kind, e.message);
            return;
        }
    };

    let reference = match exchange.fetch_ticker(SYMBOL, Params::none()).await {
        Ok(t) => t.last.unwrap_or(0.0),
        Err(e) => {
            println!("fetch_ticker [{}] {}", e.kind, e.message);
            return;
        }
    };
    if reference <= 0.0 {
        println!("no reference price");
        return;
    }

    let trigger: f64 = std::env::var("TRIGGER")
        .ok()
        .and_then(|v| v.parse().ok())
        .unwrap_or((reference * 0.999).floor());

    println!("REST fetch_ticker  last={reference:.2}");
    println!("trigger            buy when best bid <= {trigger:.2}");
    println!(
        "mode               {}",
        if !place_real {
            "dry run (BINANCE_PLACE_REAL=1 to place)"
        } else {
            "WILL PLACE AN ORDER"
        }
    );

    loop {
        let book = match exchange
            .watch_order_book(SYMBOL, Some(5), Params::none())
            .await
        {
            Ok(b) => b,
            Err(e) => {
                println!("watch_order_book [{}] {}", e.kind, e.message);
                continue;
            }
        };
        let bid = match book.bids.first() {
            Some(level) => level[0],
            None => continue,
        };
        if bid > trigger {
            continue;
        }

        let price = (bid * 0.999).floor();
        let amount = order_amount(&market, price);
        let notional = amount * price;
        println!("\ntriggered: bid={bid:.2} <= {trigger:.2}");
        println!("would buy {amount:.8} @ {price:.2}  = {notional:.2} USDT");

        if notional >= MAX_NOTIONAL_USD {
            println!("skipped: {notional:.2} >= {MAX_NOTIONAL_USD:.0} cap");
            return;
        }
        if !place_real {
            println!("dry run, nothing sent");
            return;
        }

        // REST call on the same instance that is streaming the book.
        match exchange
            .create_order(SYMBOL, "limit", "buy", amount, Some(price), Params::none())
            .await
        {
            Ok(order) => {
                let id = order.id.clone().unwrap_or_default();
                println!(
                    "placed id={id} status={}",
                    order.status.clone().unwrap_or_default()
                );
                match exchange
                    .cancel_order(&id, Some(SYMBOL), Params::none())
                    .await
                {
                    Ok(c) => println!("cancelled status={}", c.status.unwrap_or_default()),
                    Err(e) => {
                        println!("cancel [{}] {}  CHECK {SYMBOL} MANUALLY", e.kind, e.message)
                    }
                }
            }
            Err(e) => println!("create_order [{}] {}", e.kind, e.message),
        }
        return;
    }
}

fn main() {
    if std::env::var("CCXT_SHOW_PANICS").is_err() {
        std::panic::set_hook(Box::new(|_| {}));
    }
    tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .thread_stack_size(64 * 1024 * 1024)
        .enable_all()
        .build()
        .unwrap()
        .block_on(run());
}
