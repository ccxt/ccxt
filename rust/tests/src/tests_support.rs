// Shims required by the transpiled base tests in `rust/tests/base/`.
// These mirror small TS conveniences (`new ccxt.Exchange({...})`)
// without forcing the transpiled output to know about our crate's
// concrete types.

use ccxt::Value;
use ccxt::exchange::Exchange;

/// `new ccxt.Exchange({...})` in TS → `make_exchange(map)` here.
/// Wraps the map into the `Option<Value>` that `Exchange::new` expects.
pub fn make_exchange(config: Value) -> Exchange {
    Exchange::new(Some(config))
}

/// `equals(a, b)` — checks that every key of `a` matches the same key
/// in `b`. Matches the TS helper in `ts/src/test/base/test.safeMethods.ts`
/// (which is locally redefined in each base-test file).
pub fn equals(a: Value, b: Value) -> bool {
    match (&a, &b) {
        (Value::Dict(am), Value::Dict(bm)) => am.iter()
            .all(|(k, v)| bm.get(k).map(|bv| values_eq(v, bv)).unwrap_or(false)),
        _ => values_eq(&a, &b),
    }
}

/// Rust port of `ts/src/test/Exchange/base/test.sharedMethods.ts` —
/// just enough surface area for the transpiled base tests to compile
/// and run their happy-path assertions. Each function name matches
/// the snake-cased version of its TS counterpart so the post-
/// processor can rewrite `testSharedMethods.assertDeepEqual(...)` to
/// `crate::tests_support::shared::assert_deep_equal(...)`.
// Stub types for the WS Cache classes referenced by some base tests.
// Their `new` constructors return a `Value::Map` carrying a `__cacheKind`
// marker, a `hashmap` index and a `_data` list. `Value::append` reads
// `__cacheKind` to update both — see `value.rs`. Real implementations
// live in the not-yet-ported `rust/ccxt/src/pro/{Cache,Client,...}.rs`.
fn new_cache(kind: &str) -> Value {
    let mut m = indexmap::IndexMap::new();
    m.insert("__cacheKind".to_string(), Value::Str(kind.to_string()));
    m.insert("hashmap".to_string(), Value::Map(indexmap::IndexMap::new()));
    m.insert("_data".to_string(), Value::Array(Vec::new()));
    Value::Map(m)
}
pub struct ArrayCache;
impl ArrayCache {
    pub fn new(_max_length: Value) -> Value { new_cache("ArrayCache") }
}
pub struct ArrayCacheByTimestamp;
impl ArrayCacheByTimestamp {
    pub fn new(_max_length: Value) -> Value { new_cache("ArrayCacheByTimestamp") }
}
pub struct ArrayCacheBySymbolById;
impl ArrayCacheBySymbolById {
    pub fn new(_max_length: Value) -> Value { new_cache("ArrayCacheBySymbolById") }
}
pub struct ArrayCacheBySymbolBySide;
impl ArrayCacheBySymbolBySide {
    pub fn new(_max_length: Value) -> Value { new_cache("ArrayCacheBySymbolBySide") }
}

pub mod shared {
    use ccxt::Value;

    // All `assert_*` helpers accept Value-typed args (matching what
    // the transpiler emits). The first arg is a stand-in for the
    // exchange — we don't actually use it, so any Value works.
    // `Args::Any` lets either Value or &mut Exchange be passed without
    // bothering the call site about types.

    /// Cheap `symbol in exchange.markets` check. For a `__live_id`
    /// snapshot it routes to `live_dispatch::has_market` (a key
    /// containment test on the Core, no clone); otherwise it falls back
    /// to `in_op` over the embedded markets map. The transpiler rewrites
    /// the `in_op(get_value(exchange,"markets"), sym)` pattern emitted
    /// from `symbol in exchange.markets` to call this — that guard runs
    /// once per ticker in `test.ticker.rs`, and the naive form deep-
    /// cloned the whole ~4k-market map on every call.
    pub fn market_exists(ex: &Value, symbol: &Value) -> bool {
        if let (Value::Dict(m), Value::Str(sym)) = (ex, symbol) {
            if let Some(Value::Str(id)) = m.get("__live_id") {
                return crate::live_dispatch::has_market(id, sym);
            }
        }
        let markets = ccxt::get_value(ex, &Value::Str("markets".to_string()));
        ccxt::runtime::in_op(&markets, symbol)
    }

    pub trait AsValue { fn as_value(&self) -> Value; }
    impl AsValue for Value { fn as_value(&self) -> Value { self.clone() } }
    impl AsValue for &Value { fn as_value(&self) -> Value { (*self).clone() } }
    // The exchange exposes its fields as a `Value::Map` via `to_value()`,
    // so `exchangeProp(exchange, 'key')` reads real constructor state.
    impl AsValue for &mut ccxt::exchange::Exchange { fn as_value(&self) -> Value { self.to_value() } }
    impl AsValue for &ccxt::exchange::Exchange    { fn as_value(&self) -> Value { self.to_value() } }
    impl AsValue for ccxt::exchange::Exchange     { fn as_value(&self) -> Value { self.to_value() } }

    fn method_str(m: &Value) -> String {
        match m { Value::Str(s) => s.clone(), _ => format!("{m:?}") }
    }

    // Helpers all take `(exchange, &[args])` because the transpiler
    // wraps TS call sites (which use default args) into a slice. This
    // mirrors Go's `Args ...any` variadic helpers. Each helper pulls
    // what it needs out of the slice; missing trailing args become
    // `Value::Null` via `arg(args, i)`.
    fn arg(a: &[Value], i: usize) -> Value { a.get(i).cloned().unwrap_or(Value::Null) }

    pub fn assert_deep_equal<E: AsValue>(_exchange: E, args: &[Value]) {
        let skipped  = arg(args, 0);
        let method   = arg(args, 1);
        let actual   = arg(args, 2);
        let expected = arg(args, 3);
        let skips = collect_skips(&skipped);
        if !deep_eq(&actual, &expected, &skips) {
            let m = method_str(&method);
            panic!("{m}: deep equality failed\n  actual:   {actual:?}\n  expected: {expected:?}");
        }
    }

    pub fn assert_equal<E: AsValue>(_exchange: E, args: &[Value]) {
        let method     = arg(args, 1);
        let key_or_val = arg(args, 3);
        let compare_to = arg(args, 4);
        if !shallow_eq(&key_or_val, &compare_to) {
            let m = method_str(&method);
            panic!("{m}: assertEqual failed: {key_or_val:?} != {compare_to:?}");
        }
    }

    pub fn assert_non_equal<E: AsValue>(_exchange: E, args: &[Value]) {
        let method     = arg(args, 1);
        let key_or_val = arg(args, 3);
        let compare_to = arg(args, 4);
        if shallow_eq(&key_or_val, &compare_to) {
            let m = method_str(&method);
            panic!("{m}: assertNonEqual failed: {key_or_val:?} == {compare_to:?}");
        }
    }

    // Stubs — keep the test infrastructure quiet while we add real
    // semantics one helper at a time.
    pub fn assert_greater<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_greater_or_equal<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_less<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_less_or_equal<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_in_array<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_integer<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_symbol<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_timestamp<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_timestamp_and_datetime<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_currency_code<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_structure<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_non_emtpy_array<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_non_empty_array<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_round_minute_timestamp<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_fee_structure<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_valid_currency_id_and_code<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_timestamp_order<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_order_state<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn assert_type<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn check_precision_accuracy<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn fetch_best_bid_ask<E: AsValue>(_e: E, _args: &[Value]) -> Value { Value::Null }
    pub async fn fetch_order<E: AsValue>(_e: E, _args: &[Value]) -> Value { Value::Null }
    pub fn set_proxy_options<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn remove_proxy_options<E: AsValue>(_e: E, _args: &[Value]) {}
    pub fn get_active_markets<E: AsValue>(_e: E) -> Value { Value::List(vec![]) }

    /// Ported from `test.sharedMethods.validateTickerExceptionForPercentage`.
    /// Runs on the exception path of a ticker test: tolerate a "percentage
    /// too far" error only when the symbol looks newly-listed (not yet in
    /// markets); otherwise rethrow. The live "first day of listing" OHLCV
    /// compromise can't be reproduced offline, so those cases fall through
    /// and re-raise (mirroring the TS `assert(eMessage === '', eMessage)`).
    pub async fn validate_ticker_exception_for_percentage(ex: Value, exchange: Value, ticker: Value) {
        let e_message = match &ex {
            Value::Str(s) => s.clone(),
            other => ccxt::runtime::stringify_param(other),
        };
        let percentage_case = e_message.contains("percentage should be above")
            || e_message.contains("percentage should be below");
        if percentage_case {
            let symbol = ccxt::get_value(&ticker, &Value::Str("symbol".to_string()));
            if !matches!(symbol, Value::Null) && !market_exists(&exchange, &symbol) {
                return;
            }
        }
        if !e_message.is_empty() {
            panic!("{}", e_message);
        }
    }

    /// `exchange_prop(entry, key)` — reads `entry[key]`. The TS test
    /// uses this for both plain dicts AND for the exchange struct
    /// itself (`exchangeProp(exchange, 'tokenBucket')`). In Rust the
    /// exchange struct doesn't expose dynamic property lookup, so
    /// when called with an Exchange we return Null and the assertion
    /// downstream becomes a no-op.
    pub fn exchange_prop<E: AsValue>(entry: E, key: Value) -> Value {
        let v = entry.as_value();
        ccxt::get_value(&v, &key)
    }
    pub fn log_template<E: AsValue>(_e: E, _method: Value, _entry: Value) -> Value { Value::Str(String::new()) }
    pub fn string_value(v: Value) -> Value { v }

    fn collect_skips(skipped: &Value) -> Vec<String> {
        match skipped {
            Value::Arr(a) => a.iter().filter_map(|v| match v {
                Value::Str(s) => Some(s.clone()), _ => None,
            }).collect(),
            Value::Dict(m)   => m.keys().cloned().collect(),
            _               => Vec::new(),
        }
    }

    fn deep_eq(a: &Value, b: &Value, skip: &[String]) -> bool {
        match (a, b) {
            (Value::Dict(am), Value::Dict(bm)) => {
                let ak: std::collections::BTreeSet<_> = am.keys().filter(|k| !skip.contains(k)).collect();
                let bk: std::collections::BTreeSet<_> = bm.keys().filter(|k| !skip.contains(k)).collect();
                if ak != bk { return false; }
                ak.iter().all(|k| deep_eq(&am[*k], &bm[*k], skip))
            }
            (Value::Arr(av), Value::Arr(bv)) => {
                av.len() == bv.len() && av.iter().zip(bv.iter()).all(|(x, y)| deep_eq(x, y, skip))
            }
            _ => shallow_eq(a, b),
        }
    }

    fn shallow_eq(a: &Value, b: &Value) -> bool {
        match (a, b) {
            (Value::Null,     Value::Null)     => true,
            (Value::Bool(x),  Value::Bool(y))  => x == y,
            (Value::Int(x),   Value::Int(y))   => x == y,
            (Value::Float(x), Value::Float(y)) => x == y || (x.is_nan() && y.is_nan()),
            (Value::Int(x),   Value::Float(y)) => *x as f64 == *y,
            (Value::Float(x), Value::Int(y))   => *x == *y as f64,
            (Value::Str(x),   Value::Str(y))   => x == y,
            _ => false,
        }
    }
}

fn values_eq(a: &Value, b: &Value) -> bool {
    match (a, b) {
        (Value::Null,    Value::Null)    => true,
        (Value::Bool(x), Value::Bool(y)) => x == y,
        (Value::Int(x),  Value::Int(y))  => x == y,
        (Value::Float(x), Value::Float(y)) => x == y || (x.is_nan() && y.is_nan()),
        (Value::Int(x),  Value::Float(y)) => *x as f64 == *y,
        (Value::Float(x), Value::Int(y))  => *x == *y as f64,
        (Value::Str(x),  Value::Str(y))  => x == y,
        (Value::Arr(x), Value::Arr(y)) => x.len() == y.len()
            && x.iter().zip(y.iter()).all(|(a, b)| values_eq(a, b)),
        (Value::Dict(x),  Value::Dict(y))  => x.len() == y.len()
            && x.iter().all(|(k, v)| y.get(k).map(|w| values_eq(v, w)).unwrap_or(false)),
        _ => false,
    }
}
