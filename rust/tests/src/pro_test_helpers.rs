// Hand-written runtime helpers consumed by the transpiled WS base tests
// in `rust/tests/base_ws/`. The transpiler injects a call to
// `ws_deep_equal` in place of every test's `equals(a, b)` body
// (the original `for…in` recursive walk doesn't transpile to Rust).

use ccxt::Value;

/// Keys we strip from both sides before recursing — these are the
/// internal bookkeeping fields baked into our `Value::Dict` marker
/// maps (see `crate::pro::cache` / `crate::pro::order_book`). The TS
/// `equals` helper does the equivalent: it has a hand-coded
/// `if (prop === 'hashmap') continue;` plus `'cache'` exclusion in
/// the order-book test.
const IGNORED_KEYS: &[&str] = &[
    // book bookkeeping
    "__bookKind", "__sideKind",
    // cache bookkeeping
    "__cacheKind", "maxSize",
    "_hashmap", "_data", "_entries",
    "_newUpdatesBySymbol", "_clearUpdatesBySymbol",
    "_allNewUpdates", "_clearAllUpdates",
    "_sizeTracker", "_newUpdates", "_clearUpdates",
    "_depth", "_isBid",
    // user-facing fields the TS tests' `equals` also skips
    "hashmap", "cache",
];

fn is_ignored(k: &str) -> bool { IGNORED_KEYS.iter().any(|x| *x == k) }

/// Deep value comparison used by every WS base test.
///
/// Behaves like the TS test's local `equals(a, b)`:
///   * length-mismatch on arrays returns false.
///   * skips a fixed allow-list of internal marker fields.
///   * recurses through dicts and arrays.
///   * scalars compare via float-tolerant equality (`Int(5)` == `Float(5.0)`).
///
/// **Crucially**, when comparing a cache marker map (carries a
/// `__cacheKind` key) against the array literal the TS test passes in,
/// we compare the cache's `_data` rolling buffer to the literal. Same
/// for order-book side markers (`__sideKind` → `_entries`) and books
/// (the visible `bids`/`asks` fields, plus timestamp/datetime/nonce).
pub fn ws_deep_equal(a: &Value, b: &Value) -> bool {
    // Unwrap cache markers: cache equals plain array when its `_data` does.
    if let Some(unwrapped) = unwrap_marker_to_array(a) {
        return ws_deep_equal(&unwrapped, b);
    }
    if let Some(unwrapped) = unwrap_marker_to_array(b) {
        return ws_deep_equal(a, &unwrapped);
    }
    match (a, b) {
        (Value::Dict(am), Value::Dict(bm)) => {
            // Iterate the union of keys (minus IGNORED_KEYS) — the
            // book marker carries `bids`/`asks` as side markers we'll
            // recurse into; both sides need to agree.
            let keys: std::collections::BTreeSet<&str> = am.keys()
                .chain(bm.keys())
                .map(String::as_str)
                .filter(|k| !is_ignored(k))
                .collect();
            for k in keys {
                let av = am.get(k).cloned().unwrap_or(Value::Null);
                let bv = bm.get(k).cloned().unwrap_or(Value::Null);
                if !ws_deep_equal(&av, &bv) { return false; }
            }
            true
        }
        (Value::Arr(av), Value::Arr(bv)) => {
            if av.len() != bv.len() { return false; }
            av.iter().zip(bv.iter()).all(|(x, y)| ws_deep_equal(x, y))
        }
        _ => scalar_eq(a, b),
    }
}

fn unwrap_marker_to_array(v: &Value) -> Option<Value> {
    let d = match v { Value::Dict(d) => d, _ => return None };
    if d.contains_key("__cacheKind") {
        return d.get("_data").cloned();
    }
    if d.contains_key("__sideKind") {
        return d.get("_entries").cloned();
    }
    None
}

fn scalar_eq(a: &Value, b: &Value) -> bool {
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
