use ccxt::Params;
use ccxt_pro::Binance;

// run it by doing: cargo run --bin watch_trades --features ws --release -- BTC/USDT

async fn run() {
    let symbol = std::env::args()
        .nth(1)
        .unwrap_or_else(|| "BTC/USDT".to_string());

    let mut exchange = Binance::new(None);
    if let Err(e) = exchange.try_load_markets(false).await {
        println!("load_markets failed [{}]: {}", e.kind, e.message);
        return;
    }

    println!("watching {symbol} trades on binance, ctrl-c to stop");

    loop {
        match exchange
            .watch_trades(&symbol, None, None, Params::none())
            .await
        {
            Ok(trades) => {
                for trade in &trades {
                    println!(
                        "{}  {:<12}  {:<4}  price={:<12} amount={:<12} cost={:?}",
                        trade.datetime.clone().unwrap_or_default(),
                        trade.id.clone().unwrap_or_default(),
                        trade.side.clone().unwrap_or_default(),
                        trade.price.unwrap_or(0.0),
                        trade.amount.unwrap_or(0.0),
                        trade.cost,
                    );
                }
            }
            Err(e) => println!("[{}] {}", e.kind, e.message),
        }
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
