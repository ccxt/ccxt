use ccxt::types::OHLCV;
use ccxt::{from_id, Params, TypedExchange, TypedExchangeExt};


// to run it cargo run --manifest-path examples/rust/Cargo.toml --bin multi_exchange_ohlcv_chart

const TIMEFRAME: &str = "1h";
const LIMIT: i64 = 72;
const HEIGHT: usize = 18;
const MARKERS: [char; 4] = ['*', 'o', '+', 'x'];
const OVERLAP: char = '#';

struct Series {
    id: String,
    symbol: String,
    marker: char,
    closes: Vec<f64>,
}

async fn fetch_series(id: &str, symbol: &str, marker: char) -> Option<Series> {
    let mut exchange: Box<dyn TypedExchange> = match from_id(id, None) {
        Some(e) => e,
        None => {
            println!("{id:<18} unknown exchange id");
            return None;
        }
    };
    let started = std::time::Instant::now();
    let candles: Vec<OHLCV> = match exchange
        .fetch_ohlcv(symbol, Some(TIMEFRAME), None, Some(LIMIT), Params::none())
        .await
    {
        Ok(c) => c,
        Err(e) => {
            println!("{id:<18} [{}] {}", e.kind, e.message);
            return None;
        }
    };
    let closes: Vec<f64> = candles.iter().map(|candle| candle[4]).collect();
    if closes.is_empty() {
        println!("{id:<18} no candles returned");
        return None;
    }
    println!("{id:<18} {symbol:<10} {} candles in {} ms", closes.len(), started.elapsed().as_millis());
    Some(Series {
        id: id.to_string(),
        symbol: symbol.to_string(),
        marker,
        closes,
    })
}

fn tail(series: &Series, width: usize) -> &[f64] {
    &series.closes[series.closes.len() - width..]
}

fn plot(series: &[Series], width: usize) {
    let mut low = f64::MAX;
    let mut high = f64::MIN;
    for s in series {
        for close in tail(s, width) {
            low = low.min(*close);
            high = high.max(*close);
        }
    }
    if !(high > low) {
        println!("flat range, nothing to plot");
        return;
    }
    let mut grid = vec![vec![' '; width]; HEIGHT];
    for s in series {
        for (x, close) in tail(s, width).iter().enumerate() {
            let normalized = (close - low) / (high - low);
            let y = ((1.0 - normalized) * (HEIGHT as f64 - 1.0)).round() as usize;
            let y = y.min(HEIGHT - 1);
            grid[y][x] = match grid[y][x] {
                ' ' => s.marker,
                existing if existing == s.marker => existing,
                _ => OVERLAP,
            };
        }
    }
    for (row_index, row) in grid.iter().enumerate() {
        let price = high - (high - low) * (row_index as f64) / (HEIGHT as f64 - 1.0);
        println!("{price:>12.2} | {}", row.iter().collect::<String>());
    }
    println!("{:>12} +{}", "", "-".repeat(width));
    println!("{:>12}   oldest {} x {} newest", "", width, TIMEFRAME);
}

fn legend(series: &[Series], width: usize) {
    println!();
    println!(
        "{:<3} {:<18} {:<10} {:>12} {:>12} {:>9}",
        "", "exchange", "symbol", "first", "last", "change"
    );
    for s in series {
        let window = tail(s, width);
        let first = window[0];
        let last = window[window.len() - 1];
        let change = if first > 0.0 {
            (last - first) / first * 100.0
        } else {
            0.0
        };
        println!(
            "{:<3} {:<18} {:<10} {:>12.2} {:>12.2} {:>8.2}%",
            s.marker, s.id, s.symbol, first, last, change
        );
    }
    println!("{OVERLAP:<3} two or more exchanges on the same point");
}

async fn run() {
    let targets = [
        ("binance", "BTC/USDT"),
        ("okx", "BTC/USDT"),
        ("kraken", "BTC/USD"),
        ("bitstamp", "BTC/USD"),
    ];
    println!("fetching {} candles of {TIMEFRAME}\n", LIMIT);
    let started = std::time::Instant::now();
    let pending = targets
        .iter()
        .enumerate()
        .map(|(index, (id, symbol))| fetch_series(id, symbol, MARKERS[index % MARKERS.len()]));
    let series: Vec<Series> = futures::future::join_all(pending)
        .await
        .into_iter()
        .flatten()
        .collect();
    println!("\n{} of {} exchanges in {} ms", series.len(), targets.len(), started.elapsed().as_millis());
    if series.is_empty() {
        println!("\nno exchange returned candles");
        return;
    }
    let width = series
        .iter()
        .map(|s| s.closes.len())
        .min()
        .unwrap_or(0)
        .min(LIMIT as usize);
    if width == 0 {
        println!("\nno overlapping candles");
        return;
    }
    println!();
    plot(&series, width);
    legend(&series, width);
}

fn main() {
    tokio::runtime::Builder::new_multi_thread()
        .worker_threads(2)
        .thread_stack_size(64 * 1024 * 1024)
        .enable_all()
        .build()
        .unwrap()
        .block_on(run());
}
