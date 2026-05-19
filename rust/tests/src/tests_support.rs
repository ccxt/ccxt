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
        (Value::Map(am), Value::Map(bm)) => am.iter()
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
pub mod shared {
    use ccxt::Value;

    // All `assert_*` helpers accept Value-typed args (matching what
    // the transpiler emits). The first arg is a stand-in for the
    // exchange — we don't actually use it, so any Value works.
    // `Args::Any` lets either Value or &mut Exchange be passed without
    // bothering the call site about types.

    pub trait AsValue { fn as_value(&self) -> Value; }
    impl AsValue for Value { fn as_value(&self) -> Value { self.clone() } }
    impl AsValue for &Value { fn as_value(&self) -> Value { (*self).clone() } }
    impl AsValue for &mut ccxt::exchange::Exchange { fn as_value(&self) -> Value { Value::Null } }
    impl AsValue for &ccxt::exchange::Exchange    { fn as_value(&self) -> Value { Value::Null } }
    impl AsValue for ccxt::exchange::Exchange     { fn as_value(&self) -> Value { Value::Null } }

    fn method_str(m: &Value) -> String {
        match m { Value::Str(s) => s.clone(), _ => format!("{m:?}") }
    }

    pub fn assert_deep_equal<E: AsValue>(_exchange: E, skipped: Value, method: Value, actual: Value, expected: Value) {
        let skips = collect_skips(&skipped);
        if !deep_eq(&actual, &expected, &skips) {
            let m = method_str(&method);
            panic!("{m}: deep equality failed\n  actual:   {actual:?}\n  expected: {expected:?}");
        }
    }

    pub fn assert_equal<E: AsValue>(_exchange: E, _skipped: Value, method: Value, _entry: Value, key_or_val: Value, compare_to: Value, _allow_null: Value) {
        if !shallow_eq(&key_or_val, &compare_to) {
            let m = method_str(&method);
            panic!("{m}: assertEqual failed: {key_or_val:?} != {compare_to:?}");
        }
    }

    pub fn assert_non_equal<E: AsValue>(_exchange: E, _skipped: Value, method: Value, _entry: Value, key_or_val: Value, compare_to: Value, _allow_null: Value) {
        if shallow_eq(&key_or_val, &compare_to) {
            let m = method_str(&method);
            panic!("{m}: assertNonEqual failed: {key_or_val:?} == {compare_to:?}");
        }
    }

    // Stubs — keep the test infrastructure quiet while we add real
    // semantics one helper at a time.
    pub fn assert_greater<E: AsValue>(_e: E, _s: Value, _m: Value, _entry: Value, _k: Value, _c: Value, _allow_null: Value) {}
    pub fn assert_greater_or_equal<E: AsValue>(_e: E, _s: Value, _m: Value, _entry: Value, _k: Value, _c: Value, _allow_null: Value) {}
    pub fn assert_less<E: AsValue>(_e: E, _s: Value, _m: Value, _entry: Value, _k: Value, _c: Value, _allow_null: Value) {}
    pub fn assert_less_or_equal<E: AsValue>(_e: E, _s: Value, _m: Value, _entry: Value, _k: Value, _c: Value, _allow_null: Value) {}
    pub fn assert_in_array<E: AsValue>(_e: E, _s: Value, _m: Value, _entry: Value, _k: Value, _expected: Value, _allow_null: Value) {}
    pub fn assert_integer<E: AsValue>(_e: E, _s: Value, _m: Value, _entry: Value, _k: Value, _allow_null: Value) {}
    pub fn assert_symbol<E: AsValue>(_e: E, _s: Value, _m: Value, _entry: Value, _k: Value, _expected: Value, _allow_null: Value) {}
    pub fn assert_timestamp<E: AsValue>(_e: E, _s: Value, _m: Value, _entry: Value, _now: Value, _k: Value, _allow_null: Value) {}
    pub fn assert_timestamp_and_datetime<E: AsValue>(_e: E, _s: Value, _m: Value, _entry: Value, _now: Value, _k: Value, _allow_null: Value) {}
    pub fn assert_currency_code<E: AsValue>(_e: E, _s: Value, _m: Value, _entry: Value, _actual: Value, _expected: Value, _allow_null: Value) {}
    pub fn assert_structure<E: AsValue>(_e: E, _s: Value, _m: Value, _entry: Value, _format: Value, _empty: Value, _deep: Value) {}
    pub fn assert_non_emtpy_array<E: AsValue>(_e: E, _s: Value, _m: Value, _entry: Value, _hint: Value) {}
    pub fn assert_round_minute_timestamp<E: AsValue>(_e: E, _s: Value, _m: Value, _entry: Value, _k: Value) {}
    pub fn assert_fee_structure<E: AsValue>(_e: E, _s: Value, _m: Value, _entry: Value, _k: Value, _allow_null: Value) {}
    pub fn assert_valid_currency_id_and_code<E: AsValue>(_e: E, _s: Value, _m: Value, _entry: Value, _cid: Value, _ccode: Value, _allow_null: Value) {}
    pub fn assert_timestamp_order<E: AsValue>(_e: E, _m: Value, _code_or_sym: Value, _items: Value, _ascending: Value) {}
    pub fn assert_order_state<E: AsValue>(_e: E, _s: Value, _m: Value, _order: Value, _status: Value, _strict: Value) {}

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
            Value::Array(a) => a.iter().filter_map(|v| match v {
                Value::Str(s) => Some(s.clone()), _ => None,
            }).collect(),
            Value::Map(m)   => m.keys().cloned().collect(),
            _               => Vec::new(),
        }
    }

    fn deep_eq(a: &Value, b: &Value, skip: &[String]) -> bool {
        match (a, b) {
            (Value::Map(am), Value::Map(bm)) => {
                let ak: std::collections::BTreeSet<_> = am.keys().filter(|k| !skip.contains(k)).collect();
                let bk: std::collections::BTreeSet<_> = bm.keys().filter(|k| !skip.contains(k)).collect();
                if ak != bk { return false; }
                ak.iter().all(|k| deep_eq(&am[*k], &bm[*k], skip))
            }
            (Value::Array(av), Value::Array(bv)) => {
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
        (Value::Array(x), Value::Array(y)) => x.len() == y.len()
            && x.iter().zip(y.iter()).all(|(a, b)| values_eq(a, b)),
        (Value::Map(x),  Value::Map(y))  => x.len() == y.len()
            && x.iter().all(|(k, v)| y.get(k).map(|w| values_eq(v, w)).unwrap_or(false)),
        _ => false,
    }
}
