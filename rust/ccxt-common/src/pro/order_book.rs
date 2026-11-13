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
use crate::pro::cache::{CacheKey, CacheStore};
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
    let mut side = crate::value::make_side_marker(kind, is_bid, depth);
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
    let bids_deltas = crate::get_value(&snapshot, &Value::Str("bids".into()));
    let asks_deltas = crate::get_value(&snapshot, &Value::Str("asks".into()));
    let bids = new_side(side_kind, /*is_bid=*/ true,  max_depth, &bids_deltas);
    let asks = new_side(side_kind, /*is_bid=*/ false, max_depth, &asks_deltas);

    let timestamp = match crate::get_value(&snapshot, &Value::Str("timestamp".into())) {
        Value::Int(n)   => Some(n),
        Value::Float(f) => Some(f as i64),
        _ => None,
    };
    let datetime = timestamp.and_then(iso8601_millis);
    let nonce = match crate::get_value(&snapshot, &Value::Str("nonce".into())) {
        Value::Int(n)   => Value::Int(n),
        Value::Float(f) => Value::Int(f as i64),
        _ => Value::Null,
    };
    let symbol = crate::get_value(&snapshot, &Value::Str("symbol".into()));

    // Scalar meta lives in the shared book store (keyed by `__book_id`) so WS
    // handlers that mutate a cloned book — okx's seqId nonce — propagate.
    let book_id = crate::value::alloc_book_id();
    crate::value::book_meta_set(book_id, "timestamp", timestamp.map(Value::Int).unwrap_or(Value::Null));
    crate::value::book_meta_set(book_id, "datetime",  datetime.map(|s| Value::Str(s.into())).unwrap_or(Value::Null));
    crate::value::book_meta_set(book_id, "nonce",     nonce);
    crate::value::book_meta_set(book_id, "symbol",    symbol);

    let mut m = IndexMap::new();
    m.insert("__bookKind".to_string(), Value::Str(kind.to_string().into()));
    m.insert("__book_id".to_string(),  Value::Int(book_id));
    m.insert("_depth".to_string(),     Value::Int(max_depth));
    m.insert("bids".to_string(),       bids);
    m.insert("asks".to_string(),       asks);
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

// ─── typed handle ─────────────────────────────────────────────────────────

/// An order book built by `Exchange::order_book` / `indexed_order_book` / `counted_order_book`. It always
/// holds the book marker dict (`__bookKind` + `__book_id`); clones share the sides and the scalar meta
/// through the ids, as the untyped marker did.
#[derive(Debug, Clone, PartialEq)]
pub struct Book(Value);

impl Book {
    /// `book.limit()`: trim both sides to the book depth; the result is the same shared book.
    pub fn limit(&mut self) -> Book { Book(self.0.limit()) }
    /// `book.reset(snapshot)`: reseed sides and meta from the snapshot.
    pub fn reset(&mut self, snapshot: Value) { crate::value::book_reset(&mut self.0, snapshot) }
    /// `book.reset()`.
    pub fn reset0(&mut self) { crate::value::book_reset(&mut self.0, Value::Null) }
    /// `book['bids'|'asks'|'nonce'|..]`: the shared-store read.
    pub fn book_field(&self, k: &str) -> Value { self.0.book_field(k) }
    /// `book['nonce'|'timestamp'|..] = v`: the shared-store write.
    pub fn set_book_meta(&mut self, k: &str, v: Value) { self.0.set_book_meta(k, v) }
}

impl From<Book> for Value { fn from(b: Book) -> Value { b.0 } }
/// The shared marker (an Arc bump); a `Book` always holds a `Dict`.
impl From<&Book> for Value { fn from(b: &Book) -> Value { if let Value::Dict(d) = &b.0 { Value::Dict(std::sync::Arc::clone(d)) } else { Value::Null } } }
impl From<Option<Book>> for Value { fn from(b: Option<Book>) -> Value { b.map_or(Value::Null, |b| b.0) } }
/// A boxed value written into a book slot: a book marker is that book, anything else is no book (the untyped
/// map stored it, and every book reader treated a non-book entry as missing).
impl From<Value> for Option<Book> {
    fn from(v: Value) -> Option<Book> { if crate::value::book_kind_of(&v) { Some(Book(v)) } else { None } }
}
impl From<&Option<Book>> for Value { fn from(b: &Option<Book>) -> Value { b.as_ref().map_or(Value::Null, Value::from) } }

/// The book operations on an optional book slot; an absent book ignores them and reads `Null`, as a
/// `Value::Null` receiver did.
pub trait BookSlot {
    /// `book.limit()`: trims the book and hands it back boxed (`Null` for no book, as `Value::Null.limit()` did).
    fn limit(&mut self) -> Value;
    fn reset(&mut self, snapshot: Value);
    fn reset0(&mut self);
    fn book_field(&self, k: &str) -> Value;
    fn set_book_meta(&mut self, k: &str, v: Value);
}

impl BookSlot for Option<Book> {
    fn limit(&mut self) -> Value { match self { Some(b) => Value::from(b.limit()), None => Value::Null } }
    fn reset(&mut self, snapshot: Value) { if let Some(b) = self { b.reset(snapshot) } }
    fn reset0(&mut self) { if let Some(b) = self { b.reset0() } }
    fn book_field(&self, k: &str) -> Value { self.as_ref().map_or(Value::Null, |b| b.book_field(k)) }
    fn set_book_meta(&mut self, k: &str, v: Value) { if let Some(b) = self { b.set_book_meta(k, v) } }
}

/// The order books keyed by symbol (`Exchange::orderbooks`). Entries are only ever written from a
/// `Book`, so every element read is a `Book` or absent.
pub type BookMap = IndexMap<String, Book>;

impl CacheStore for BookMap {
    type Entry = Book;
    fn has<K: CacheKey + ?Sized>(&self, key: &K) -> bool { key.strict().is_some_and(|k| self.contains_key(k)) }
    fn at<K: CacheKey + ?Sized>(&self, key: &K) -> Option<Book> { key.strict().and_then(|k| self.get(k)).cloned() }
    fn lookup<K: CacheKey + ?Sized>(&self, key: &K) -> Option<Book> { self.get(key.text().as_ref()).cloned() }
    /// Writing an absent book leaves the map as it is (the untyped dict stored a `Null` entry there).
    fn put<K: CacheKey + ?Sized>(&mut self, key: &K, book: impl Into<Option<Book>>) {
        if let Some(b) = book.into() { self.insert(key.text().into_owned(), b); }
    }
    fn forget<K: CacheKey + ?Sized>(&mut self, key: &K) { if let Some(k) = key.strict() { self.shift_remove(k); } }
}

/// The map as a plain dict of book markers (the `to_value` snapshot): each key is copied, each marker an Arc bump.
impl From<&BookMap> for Value {
    fn from(m: &BookMap) -> Value { Value::Map(m.iter().map(|(k, b)| (String::from(k.as_str()), Value::from(b))).collect()) }
}

/// A fresh book of each kind, as `Exchange::order_book` & co. return it.
pub(crate) fn new_book(kind: &str, snapshot: Value, depth: Value) -> Book { Book(build_book(kind, snapshot, depth)) }
