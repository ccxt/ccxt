```rust
// Exchange-agnostic code via the built-in `ccxt::TypedExchange` bound — the
// Rust analog of a C#/Go `IExchange`. Every exchange (ccxt::Binance,
// ccxt::Kraken, …) implements it, so one generic function serves every venue
// with native typed returns. Compile-check only.
use ccxt::{Binance, ExchangeVisitor, Kraken, Params, TypedExchange};

// ── A. generic (static dispatch) ─────────────────────────────────────────────
async fn last_price<E: TypedExchange>(ex: &mut E, symbol: &str) -> Option<f64> {
    ex.load_markets(false, ()).await.ok()?;
    ex.fetch_ticker(symbol, Params::none()).await.ok()?.last
}

async fn report<E: TypedExchange>(ex: &mut E) {
    if ex.load_markets(false, ()).await.is_err() {
        return;
    }
    if let Ok(t) = ex.fetch_ticker("BTC/USDT", Params::none()).await {
        println!("{} last={:?}", t.symbol, t.last);
    }
    // Unsupported methods resolve to a NotSupported error at runtime:
    match ex.fetch_deposit_addresses(None, Params::none()).await {
        Ok(addrs) => println!("{} deposit addresses", addrs.len()),
        Err(e) => println!("unsupported: {e}"),
    }
}

// ── B. runtime selection by id: the venue is handed to a generic visitor ─────
struct Report;

impl ExchangeVisitor for Report {
    type Output = ();
    async fn visit<E: TypedExchange + 'static>(self, mut ex: E) {
        report(&mut ex).await
    }
}

#[allow(dead_code)]
async fn demo() {
    // A: static — concrete type, typed return
    let mut b = Binance::new(None);
    let _last: Option<f64> = last_price(&mut b, "BTC/USDT").await;

    // A': a fixed set of different venues is a tuple, each call monomorphised
    let (mut b, mut k) = (Binance::new(None), Kraken::new(None));
    futures::join!(report(&mut b), report(&mut k));

    // B: venues chosen at runtime by id, still typed returns
    for id in ["binance", "kraken"] {
        if ccxt::exchanges::with_exchange(id, None, Report).await.is_none() {
            println!("{id} not compiled in");
        }
    }
}

fn main() {
    println!("iexchange_demo: compile-check only — uses ccxt::TypedExchange");
}

```
