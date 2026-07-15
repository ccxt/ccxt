// CCXT-pro OrderBook types — Value-shaped facades.
//
// Mirrors `ts/src/base/ws/OrderBook.ts` and `OrderBookSide.ts` as
// Value::Dict markers. Tags:
//   * `__bookKind` ∈ {OrderBook, IndexedOrderBook, CountedOrderBook}
//   * `__sideKind` (on the per-side markers carried under `bids`/`asks`)
//     ∈ {OrderBookSide, IndexedOrderBookSide, CountedOrderBookSide}
//
// All mutation logic — `store`/`storeArray`/`limit`/`reset`/`update` —
// lives in `Value::*` methods (see `value.rs`). The transpiled tests
// in `rust/tests/base_ws/test.orderBook.rs` operate on Value-typed
// locals throughout, so the factories must return Value to satisfy
// the call sites the AST transpiler emits.

use crate::Value;
use indexmap::IndexMap;

pub const BOOK_PLAIN:   &str = "OrderBook";
pub const BOOK_INDEXED: &str = "IndexedOrderBook";
pub const BOOK_COUNTED: &str = "CountedOrderBook";

pub const SIDE_PLAIN:   &str = "OrderBookSide";
pub const SIDE_INDEXED: &str = "IndexedOrderBookSide";
pub const SIDE_COUNTED: &str = "CountedOrderBookSide";

const MAX_DEPTH_SENTINEL: i64 = i64::MAX / 2;

fn iso8601_millis(ts: i64) -> Option<String> {
    if ts < 0 { return None; }
    chrono::DateTime::<chrono::Utc>::from_timestamp_millis(ts)
        .map(|t| t.to_rfc3339_opts(chrono::SecondsFormat::Millis, true))
}

/// Build a side marker (`OrderBookSide` / `IndexedOrderBookSide` /
/// `CountedOrderBookSide`) seeded from a `[[price, size, …], …]` list.
/// `is_bid: true` flips the price comparison (TS uses `index_price =
/// side ? -price : price`); we keep the same semantics inside
/// `Value::store_array`.
fn new_side(kind: &str, is_bid: bool, depth: i64, deltas: &Value) -> Value {
    let mut m = IndexMap::new();
    m.insert("__sideKind".to_string(),  Value::Str(kind.to_string()));
    m.insert("_isBid".to_string(),      Value::Bool(is_bid));
    m.insert("_depth".to_string(),      Value::Int(depth));
    m.insert("_entries".to_string(),    Value::Array(Vec::new()));
    m.insert("hashmap".to_string(),    Value::Map(IndexMap::new()));
    let mut side = Value::Map(m);
    if let Value::Arr(rows) = deltas {
        for row in rows.iter() {
            if let Value::Arr(_) = row {
                side.store_array(row.clone());
            }
        }
    }
    side
}

fn build_book(kind: &str, snapshot: Value, depth: Value) -> Value {
    let max_depth = match &depth {
        Value::Int(n) if *n > 0 => *n,
        _ => MAX_DEPTH_SENTINEL,
    };
    let (side_kind, _) = match kind {
        BOOK_INDEXED => (SIDE_INDEXED, true),
        BOOK_COUNTED => (SIDE_COUNTED, true),
        _            => (SIDE_PLAIN,   true),
    };
    let bids_deltas = crate::get_value(&snapshot, &Value::Str("bids".to_string()));
    let asks_deltas = crate::get_value(&snapshot, &Value::Str("asks".to_string()));
    let bids = new_side(side_kind, /*is_bid=*/ true,  max_depth, &bids_deltas);
    let asks = new_side(side_kind, /*is_bid=*/ false, max_depth, &asks_deltas);

    let timestamp = match crate::get_value(&snapshot, &Value::Str("timestamp".to_string())) {
        Value::Int(n)   => Some(n),
        Value::Float(f) => Some(f as i64),
        _ => None,
    };
    let datetime = timestamp.and_then(iso8601_millis);
    let nonce = match crate::get_value(&snapshot, &Value::Str("nonce".to_string())) {
        Value::Int(n)   => Value::Int(n),
        Value::Float(f) => Value::Int(f as i64),
        _ => Value::Null,
    };
    let symbol = crate::get_value(&snapshot, &Value::Str("symbol".to_string()));

    let mut m = IndexMap::new();
    m.insert("__bookKind".to_string(), Value::Str(kind.to_string()));
    m.insert("_depth".to_string(),     Value::Int(max_depth));
    m.insert("bids".to_string(),       bids);
    m.insert("asks".to_string(),       asks);
    m.insert("timestamp".to_string(),  timestamp.map(Value::Int).unwrap_or(Value::Null));
    m.insert("datetime".to_string(),   datetime.map(Value::Str).unwrap_or(Value::Null));
    m.insert("nonce".to_string(),      nonce);
    m.insert("symbol".to_string(),     symbol);
    Value::Map(m)
}

// ─── factories ────────────────────────────────────────────────────────────

/// `new Bids(deltas, depth)` — TS side-class shorthand for an
/// `OrderBookSide` constructed with `is_bid: true`. The transpiled
/// per-exchange WS code (`bitmart`, `bitvavo`, …) uses this when
/// patching an inner side of an order book snapshot. Returns the same
/// `__sideKind` marker as `OrderBook::new`'s seeded sides.
pub struct Bids;
impl Bids {
    pub fn new(deltas: Value, depth: Value) -> Value {
        let max_depth = match &depth {
            Value::Int(n) if *n > 0 => *n,
            _ => MAX_DEPTH_SENTINEL,
        };
        new_side(SIDE_PLAIN, /*is_bid=*/ true, max_depth, &deltas)
    }
}

/// `new Asks(deltas, depth)` — the ask-side companion.
pub struct Asks;
impl Asks {
    pub fn new(deltas: Value, depth: Value) -> Value {
        let max_depth = match &depth {
            Value::Int(n) if *n > 0 => *n,
            _ => MAX_DEPTH_SENTINEL,
        };
        new_side(SIDE_PLAIN, /*is_bid=*/ false, max_depth, &deltas)
    }
}

pub struct OrderBook;
impl OrderBook {
    /// `new OrderBook(snapshot)` or `new OrderBook(snapshot, depth)`.
    /// Both arities are emitted by the transpiler — `padCallsForVariadicFn`
    /// pads the 1-arg call with `Value::Null`, so we can declare the
    /// 2-arg signature unconditionally.
    pub fn new(snapshot: Value, depth: Value) -> Value {
        build_book(BOOK_PLAIN, snapshot, depth)
    }
}

pub struct IndexedOrderBook;
impl IndexedOrderBook {
    pub fn new(snapshot: Value, depth: Value) -> Value {
        build_book(BOOK_INDEXED, snapshot, depth)
    }
}

pub struct CountedOrderBook;
impl CountedOrderBook {
    pub fn new(snapshot: Value, depth: Value) -> Value {
        build_book(BOOK_COUNTED, snapshot, depth)
    }
}
