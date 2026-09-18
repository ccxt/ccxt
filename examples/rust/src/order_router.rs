// OrderRouter — ask the router how to convert one asset into another.
//
// The router holds live L2 books from many venues and answers "what is the
// cheapest way to turn X into Y right now, and on which venues" — book-walked
// to your actual size, fee-adjusted, and split across venues when that beats
// any single one.
//
// This example is READ-ONLY: it asks for a recommendation and prints it. It
// never places an order. Execution lives behind router.execute(plan, venues),
// which defaults to dry_run and refuses to trade unless explicitly told to.
//
// Usage:
//   ORDER_ROUTER_API_KEY=or_live_... cargo run --manifest-path examples/rust/Cargo.toml --bin order_router
//
// Get a key from https://docs.ccxt.com/router

use ccxt::value::HashMap;
use ccxt::{OrderRouter, Value};

#[tokio::main]
async fn main() {
    let api_key = match std::env::var("ORDER_ROUTER_API_KEY") {
        Ok(key) if !key.is_empty() => key,
        _ => {
            println!("set ORDER_ROUTER_API_KEY (get one at https://docs.ccxt.com/router)");
            return;
        }
    };

    let mut config = HashMap::new();
    config.insert("apiKey".to_string(), Value::Str(api_key));
    // config.insert("baseUrl".to_string(), Value::Str("https://docs.ccxt.com/router/api".into()));  // the default
    let router = match OrderRouter::new(&Value::Map(config)) {
        Ok(client) => client,
        Err(e) => {
            eprintln!("{e}");
            return;
        }
    };

    // Exactly one of amountIn or amountOut — never both, and never neither.
    // They are different book traversals, not a unit conversion: amountIn walks
    // until the money runs out, amountOut until the size is reached.
    let mut params = HashMap::new();
    params.insert("amountIn".to_string(), Value::Float(20.0));
    params.insert("strategy".to_string(), Value::Str("split_optimal".to_string()));

    let route = match router.fetch_route("USDT", "BTC", &Value::Map(params)).await {
        Ok(found) => found,
        Err(e) => {
            eprintln!("{e}");
            return;
        }
    };

    // An unroutable pair comes back as a result with a reason, NOT an error.
    // Refusing to quote is a deliberate outcome, not a failure.
    let unroutable = router.string_at(&route, "unroutableReason", "");
    if !unroutable.is_empty() {
        println!("unroutable: {unroutable}");
        return;
    }

    println!(
        "{} {} -> {} {}",
        router.number_at(&route, "amountIn", 0.0),
        router.string_at(&route, "from", ""),
        router.number_at(&route, "amountOut", 0.0),
        router.string_at(&route, "to", ""),
    );
    println!("effective rate   {}", router.number_at(&route, "effectiveRate", 0.0));
    // Positive impact is worse.
    println!("price impact     {} bps", router.number_at(&route, "impactBps", 0.0));
    println!("fill ratio       {}", router.number_at(&route, "fillRatio", 0.0));

    // One hop is a direct conversion; more than one means it was bridged
    // (e.g. SOL -> USDT -> BTC), and each hop is a separate order.
    for (index, hop) in router.list_at(&route, "hops").iter().enumerate() {
        let legs = router.list_at(hop, "legs");
        println!(
            "hop {} {} {} - {} venue(s)",
            index + 1,
            router.string_at(hop, "pair", ""),
            router.string_at(hop, "side", ""),
            legs.len(),
        );
        for leg in &legs {
            println!(
                "    {} {} @ {}",
                router.string_at(leg, "exchangeId", ""),
                router.number_at(leg, "amount", 0.0),
                router.number_at(leg, "averagePrice", 0.0),
            );
        }
    }
}
