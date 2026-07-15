// Smoke test for all transpiled exchanges. Runs each one's
// fetch_markets() over the network and prints the result count.

use ccxt::Value;
use ccxt::exchanges::{
    binance::BinanceCore,
    bybit::BybitCore,
    okx::OkxCore,
    kucoin::KucoinCore,
    bitget::BitgetCore,
    hyperliquid::HyperliquidCore,
    gate::GateCore,
};
use std::panic;
use futures::FutureExt;

fn populate(ex: &mut ccxt::exchange::Exchange, described: Value) {
    ex.api      = ccxt::get_value(&described, &Value::Str("api".to_string()));
    ex.urls     = ccxt::get_value(&described, &Value::Str("urls".to_string()));
    ex.has      = ccxt::get_value(&described, &Value::Str("has".to_string()));
    ex.options  = ccxt::get_value(&described, &Value::Str("options".to_string()));
    ex.hostname = ccxt::get_value(&described, &Value::Str("hostname".to_string()));
    ex.verbose  = Value::Bool(std::env::var("VERBOSE").is_ok());
    ex.build_implicit_api();
}

fn count(v: &Value) -> String {
    match v {
        Value::Array(a) => format!("Array[{}]", a.len()),
        Value::Map(m)   => format!("Map[{}]",   m.len()),
        Value::Null     => "Null".to_string(),
        other           => format!("{:?}", std::mem::discriminant(other)),
    }
}

macro_rules! smoke {
    ($name:literal, $core:ty) => {{
        println!("\n=== {} ===", $name);
        let mut ex = Box::new(<$core>::new(None));
        ex.bind();
        let d = ex.describe();
        populate(&mut ex.exchange, d);
        print!("   fetch_markets … ");
        let r = panic::AssertUnwindSafe(ex.fetch_markets(&[])).catch_unwind().await;
        match r {
            Ok(v)  => println!("{}", count(&v)),
            Err(_) => println!("panicked"),
        }
    }};
}

#[tokio::main]
async fn main() {
    smoke!("binance",     BinanceCore);
    smoke!("bybit",       BybitCore);
    smoke!("okx",         OkxCore);
    smoke!("kucoin",      KucoinCore);
    smoke!("bitget",      BitgetCore);
    smoke!("hyperliquid", HyperliquidCore);
    smoke!("gate",        GateCore);
}
