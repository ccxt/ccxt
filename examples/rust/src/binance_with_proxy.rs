use ccxt::{Config, Params};

fn rest_proxy() -> String {
    std::env::var("REST_PROXY").unwrap_or_else(|_| "http://127.0.0.1:8080".to_string())
}

fn ws_proxy() -> String {
    std::env::var("WS_PROXY").unwrap_or_else(|_| "http://127.0.0.1:8080".to_string())
}

async fn rest_through_config() {
    let cfg = Config::new().set_str("httpsProxy", &rest_proxy());
    let mut exchange = ccxt::Binance::with_config(cfg);
    match exchange.fetch_ticker("BTC/USDT", Params::none()).await {
        Ok(ticker) => println!("config   fetch_ticker  last={:?}", ticker.last),
        Err(e) => println!("config   fetch_ticker  [{}] {}", e.kind, e.message),
    }
}

async fn rest_through_setter() {
    let mut exchange = ccxt::Binance::new(None);
    exchange.set_https_proxy(&rest_proxy());
    match exchange.fetch_order_book("BTC/USDT", Some(5), Params::none()).await {
        Ok(book) => println!("setter   fetch_order_book  bids={} asks={}", book.bids.len(), book.asks.len()),
        Err(e) => println!("setter   fetch_order_book  [{}] {}", e.kind, e.message),
    }
}

async fn ws_through_setter() {
    let mut exchange = ccxt_pro::Binance::new(None);
    exchange.set_ws_proxy(&ws_proxy());
    match exchange.watch_ticker("BTC/USDT", Params::none()).await {
        Ok(ticker) => println!("setter   watch_ticker  last={:?}", ticker.last),
        Err(e) => println!("setter   watch_ticker  [{}] {}", e.kind, e.message),
    }
}

async fn ws_through_config() {
    let cfg = Config::new().set_str("wsProxy", &ws_proxy());
    let mut exchange = ccxt_pro::Binance::with_config(cfg);
    match exchange.watch_trades("BTC/USDT", None, Some(5), Params::none()).await {
        Ok(trades) => println!("config   watch_trades  {} trades", trades.len()),
        Err(e) => println!("config   watch_trades  [{}] {}", e.kind, e.message),
    }
}

async fn run() {
    println!("rest proxy = {}", rest_proxy());
    println!("ws proxy   = {}\n", ws_proxy());
    rest_through_config().await;
    rest_through_setter().await;
    ws_through_setter().await;
    ws_through_config().await;
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
