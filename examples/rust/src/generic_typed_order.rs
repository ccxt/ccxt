use ccxt::types::{Market, Order, Ticker};
use ccxt::{from_id_with_config, Config, ExchangeError, Params, TypedExchange, TypedExchangeExt};

const EXCHANGES: &[&str] = &["binance", "bybit"];

const SYMBOL: &str = "BTC/USDT";
const MAX_NOTIONAL_USD: f64 = 25.0;

fn creds(id: &str) -> Option<(String, String)> {
    let up = id.to_uppercase();
    match (
        std::env::var(format!("{up}_APIKEY")),
        std::env::var(format!("{up}_SECRET")),
    ) {
        (Ok(k), Ok(s)) if !k.is_empty() && !s.is_empty() => Some((k, s)),
        _ => None,
    }
}

fn config_for(id: &str) -> Config {
    let mut cfg = Config::new();
    if let Some((k, s)) = creds(id) {
        cfg = cfg.api_key(&k).secret(&s);
        if std::env::var("CCXT_LIVE").is_err() {
            cfg = cfg.sandbox(true);
        }
    }
    cfg
}

fn resting_price(last: f64) -> f64 {
    (last * 0.90).floor()
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

fn fmt_err(e: &ExchangeError) -> String {
    let msg: String = e
        .message
        .lines()
        .next()
        .unwrap_or("")
        .chars()
        .take(90)
        .collect();
    format!("[{}] {msg}", e.kind)
}

async fn trade_on(id: &str, place: bool) {
    println!("\n═══ {id} ═══");

    let mut ex: Box<dyn TypedExchange> = match from_id_with_config(id, config_for(id)) {
        Some(e) => e,
        None => {
            println!("  no typed wrapper for {id}");
            return;
        }
    };

    ex.load_markets(false).await;
    let markets = ex.markets();
    if markets.is_empty() {
        println!("  markets did not load");
        return;
    }
    println!("  markets      {}", markets.len());

    let market: Market = match ex.market(SYMBOL) {
        Ok(m) => m,
        Err(e) => {
            println!("  market       {}", fmt_err(&e));
            return;
        }
    };

    let ticker: Ticker = match ex.fetch_ticker(SYMBOL, Params::none()).await {
        Ok(t) => t,
        Err(e) => {
            println!("  ticker       {}", fmt_err(&e));
            return;
        }
    };
    let last = ticker.last.unwrap_or(0.0);
    if last <= 0.0 {
        println!("  ticker       no last price");
        return;
    }

    let price = resting_price(last);
    let amount = order_amount(&market, price);
    let notional = amount * price;
    println!(
        "  {SYMBOL:<12} last={last:.2}  bid={price:.2}  amount={amount:.8}  notional={notional:.2}"
    );
    println!(
        "  limits       amount>={:.8}  cost>={}  step={:.8}",
        market.limits.amount.min.unwrap_or(0.0),
        market.limits.cost.min.unwrap_or(0.0),
        market.precision.amount.unwrap_or(0.0),
    );

    if creds(id).is_none() {
        println!(
            "  order        skipped, no {}_APIKEY/{}_SECRET",
            id.to_uppercase(),
            id.to_uppercase()
        );
        return;
    }
    if notional >= MAX_NOTIONAL_USD {
        println!("  order        skipped, {notional:.2} USD >= {MAX_NOTIONAL_USD:.0} cap");
        return;
    }
    if !place {
        println!("  order        skipped, set CCXT_PLACE_REAL=1 to place it");
        return;
    }

    let params = Params::new().with_str("clientOrderId", &format!("ccxt-generic-{id}"));
    let created: Order = match ex
        .create_order(SYMBOL, "limit", "buy", amount, Some(price), params)
        .await
    {
        Ok(o) => o,
        Err(e) => {
            println!("  create       {}", fmt_err(&e));
            return;
        }
    };
    println!(
        "  created      id={} status={} {:?} @ {:?}",
        created.id.clone().unwrap_or_default(),
        created.status.clone().unwrap_or_default(),
        created.amount,
        created.price,
    );

    let id_to_cancel = created.id.clone().unwrap_or_default();
    match ex
        .cancel_order(&id_to_cancel, Some(SYMBOL), Params::none())
        .await
    {
        Ok(c) => println!("  cancelled    status={}", c.status.unwrap_or_default()),
        Err(e) => println!("  cancel       {}  CHECK {SYMBOL} MANUALLY", fmt_err(&e)),
    }
}

async fn run() {
    let ids: Vec<String> = match std::env::args().nth(1) {
        Some(a) => a
            .split(',')
            .map(|s| s.trim().to_string())
            .filter(|s| !s.is_empty())
            .collect(),
        None => EXCHANGES.iter().map(|s| s.to_string()).collect(),
    };
    let place = std::env::var("CCXT_PLACE_REAL").is_ok();

    println!("generic_typed_order");
    println!("  exchanges    {ids:?}");
    println!("  symbol       {SYMBOL}");
    println!("  cap          {MAX_NOTIONAL_USD:.0} USD/order");
    println!(
        "  mode         {}",
        if place {
            "PLACES ORDERS (CCXT_PLACE_REAL=1)"
        } else {
            "inspect only"
        }
    );

    for id in &ids {
        trade_on(id, place).await;
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
