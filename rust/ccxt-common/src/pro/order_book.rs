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
    let bids_deltas = snapshot.at("bids");
    let asks_deltas = snapshot.at("asks");
    let bids = new_side(side_kind, /*is_bid=*/ true,  max_depth, bids_deltas);
    let asks = new_side(side_kind, /*is_bid=*/ false, max_depth, asks_deltas);

    let timestamp = match *snapshot.at("timestamp") {
        Value::Int(n)   => Some(n),
        Value::Float(f) => Some(f as i64),
        _ => None,
    };
    let datetime = timestamp.and_then(iso8601_millis);
    let nonce = match *snapshot.at("nonce") {
        Value::Int(n)   => Value::Int(n),
        Value::Float(f) => Value::Int(f as i64),
        _ => Value::Null,
    };
    let symbol = snapshot.at("symbol").to_owned();

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
    /// ral-66c: `const m = book.cache`: a copy of the delta buffer (a later `book.cache = []` leaves it as it was).
    pub fn cache_items(&self) -> crate::value::List { crate::value::cache_entries_as_value(&self.0.book_field("cache")).unwrap_or_default().into_list() }
    /// ral-66c: `book.cache.push(v)`: append to the shared delta buffer (the store the boxed handle appends to).
    pub fn cache_push(&mut self, v: Value) { crate::value::try_book_cache_push(&self.0.book_field("cache"), &v); }
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

/// ral-ug: an order-book side read off a book (`book['bids'|'asks']`), the shared side marker. Writes land on the
/// book's side store and reads see it, exactly as the boxed marker did; a level read hands out the stored level as is.
#[derive(Debug, Clone, PartialEq)]
pub struct Side(Value);

impl Side {
    pub fn of(v: Value) -> Side { Side(v) }
    /// `side.store(price, size)`.
    pub fn store(&mut self, price: impl Into<Value>, size: impl Into<Value>) { self.0.store(price, size) }
    /// `side.storeArray(delta)`.
    pub fn store_array(&mut self, delta: Value) { self.0.store_array(delta) }
    /// `side.length`: the level count (`Int(0)` for no side).
    pub fn length(&self) -> Value {
        match &self.0 {
            Value::Dict(d) if d.contains_key("__sideKind") => Value::Int(crate::value::side_entries_len(d) as i64),
            v => Value::Int(v.len() as i64),
        }
    }
    /// `side[i]`: the stored level (`Null` out of range or for no side).
    pub fn level(&self, i: &Value) -> Value { crate::value::get_value(&self.0, i) }
}

impl From<Side> for Value { fn from(s: Side) -> Value { s.0 } }

#[cfg(test)]
mod side_tests {
    use super::*;

    fn level(p: f64, a: f64) -> Value { Value::Arr(std::sync::Arc::new(vec![Value::Float(p), Value::Float(a)])) }

    // ral-ug: the side handle reads and writes exactly as the boxed marker: in range, out of range, a Null side and a
    // wrong-kind side; a store through the handle is seen by the book.
    #[test]
    fn side_handle_matches_the_boxed_marker() {
        let mut snap = crate::value::HashMap::new();
        snap.insert("bids".to_string(), Value::Arr(std::sync::Arc::new(vec![level(10.0, 1.0), level(9.0, 2.0)])));
        snap.insert("asks".to_string(), Value::Arr(std::sync::Arc::new(vec![level(11.0, 1.0)])));
        let book = new_book(BOOK_PLAIN, Value::Map(snap), Value::Null);
        let mut side = Side::of(book.book_field("bids"));
        let sides = || [book.book_field("bids"), Value::Null, Value::Int(3), Value::Str("x".into())];
        let lengths = [Value::Int(2), Value::Int(0), Value::Int(0), Value::Int(1)];
        for ((v, raw), n) in sides().into_iter().map(Side::of).zip(sides()).zip(lengths) {
            assert_eq!(v.length(), n);
            for i in [Value::Int(0), Value::Int(1), Value::Int(2), Value::Int(-1), Value::Str("0".into()), Value::Null] {
                assert_eq!(v.level(&i), crate::value::get_value(&raw, &i), "level {:?}", i);
            }
        }
        side.store(Value::Float(9.5), Value::Float(4.0));
        side.store_array(level(9.0, 0.0));
        assert_eq!(Side::of(book.book_field("bids")).length(), Value::Int(2));
        assert_eq!(Side::of(book.book_field("bids")).level(&Value::Int(1)), level(9.5, 4.0));
        let mut none = Side::of(Value::Null);
        none.store(Value::Int(1), Value::Int(1));
        assert_eq!(Value::from(none), Value::Null);
    }

    // ral-66c: the typed cache reads and appends exactly as the boxed handle route, and the copy keeps its items
    // after `book.cache = []` (the JS array semantics); no book reads `[]` and ignores a push.
    #[test]
    fn typed_cache_matches_the_boxed_handle() {
        let mut book = new_book(BOOK_PLAIN, Value::Map(crate::value::HashMap::new()), Value::Null);
        book.cache_push(Value::Int(1));
        let boxed = Value::from(&book);
        let mut field = boxed.book_field("cache");
        crate::runtime::append_to_array(&mut field, Value::Int(2));
        let items = book.cache_items();
        assert_eq!(items.as_ref(), &vec![Value::Int(1), Value::Int(2)]);
        assert_eq!(book.book_field("cache").len(), 2);
        book.set_book_meta("cache", Value::from(Vec::<Value>::new()));
        assert_eq!(items.len(), 2);
        assert_eq!(book.cache_items().len(), 0);
        let mut slot: Option<Book> = Some(book);
        slot.cache_push(Value::Int(3));
        assert_eq!(slot.cache_items().as_ref(), &vec![Value::Int(3)]);
        let mut none: Option<Book> = None;
        none.cache_push(Value::Int(4));
        assert_eq!(none.cache_items().len(), 0);
    }
}

/// The book operations on an optional book slot; an absent book ignores them and reads `Null`, as a
/// `Value::Null` receiver did.
pub trait BookSlot {
    /// `book.limit()`: trims the book and hands it back boxed (`Null` for no book, as `Value::Null.limit()` did).
    fn limit(&mut self) -> Value;
    fn reset(&mut self, snapshot: Value);
    fn reset0(&mut self);
    fn book_field(&self, k: &str) -> Value;
    fn set_book_meta(&mut self, k: &str, v: Value);
    /// ral-66c: the delta buffer copy (`[]` for no book).
    fn cache_items(&self) -> crate::value::List;
    /// ral-66c: append to the delta buffer (no book ignores it).
    fn cache_push(&mut self, v: Value);
}

impl BookSlot for Option<Book> {
    fn limit(&mut self) -> Value { match self { Some(b) => Value::from(b.limit()), None => Value::Null } }
    fn reset(&mut self, snapshot: Value) { if let Some(b) = self { b.reset(snapshot) } }
    fn reset0(&mut self) { if let Some(b) = self { b.reset0() } }
    fn book_field(&self, k: &str) -> Value { self.as_ref().map_or(Value::Null, |b| b.book_field(k)) }
    fn set_book_meta(&mut self, k: &str, v: Value) { if let Some(b) = self { b.set_book_meta(k, v) } }
    fn cache_items(&self) -> crate::value::List { self.as_ref().map_or_else(|| std::sync::Arc::new(Vec::new()), |b| b.cache_items()) }
    fn cache_push(&mut self, v: Value) { if let Some(b) = self { b.cache_push(v) } }
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
