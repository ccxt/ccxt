// Hand-written Rust port of `ts/src/base/ws/OrderBook.ts`.
//
// In TS each variant is a distinct subclass that swaps its `bids`/`asks`
// implementation. In Rust we use an enum-shaped `BookSides` so a single
// `OrderBook` struct holds whichever side variant was constructed —
// keeps the call sites (`book.limit()`, `book.reset(snapshot)`,
// `book.update(snapshot)`) uniform.

use crate::Value;
use super::order_book_side::{
    Side, OrderBookSide, CountedOrderBookSide, IndexedOrderBookSide,
};

/// The three concrete side types share `limit()` plus a public
/// `entries` accessor that exposes `[price, size, …]` deltas.
#[derive(Debug, Clone)]
pub enum BookSides {
    Plain    { bids: OrderBookSide,        asks: OrderBookSide        },
    Counted  { bids: CountedOrderBookSide, asks: CountedOrderBookSide },
    Indexed  { bids: IndexedOrderBookSide, asks: IndexedOrderBookSide },
}

impl BookSides {
    pub fn bids_entries(&self) -> &Vec<Vec<Value>> {
        match self {
            BookSides::Plain   { bids, .. } => &bids.entries,
            BookSides::Counted { bids, .. } => &bids.entries,
            BookSides::Indexed { bids, .. } => &bids.entries,
        }
    }
    pub fn asks_entries(&self) -> &Vec<Vec<Value>> {
        match self {
            BookSides::Plain   { asks, .. } => &asks.entries,
            BookSides::Counted { asks, .. } => &asks.entries,
            BookSides::Indexed { asks, .. } => &asks.entries,
        }
    }
    pub fn limit(&mut self) {
        match self {
            BookSides::Plain   { bids, asks } => { bids.limit(); asks.limit(); }
            BookSides::Counted { bids, asks } => { bids.limit(); asks.limit(); }
            BookSides::Indexed { bids, asks } => { bids.limit(); asks.limit(); }
        }
    }
}

/// Mirrors `OrderBook { bids, asks, timestamp, datetime, nonce, symbol, cache }`.
/// `cache` is the snapshot-update reorder buffer used by the live-pro
/// methods (unused in the base tests, but we keep the field shape).
#[derive(Debug, Clone)]
pub struct OrderBook {
    pub sides:     BookSides,
    pub timestamp: Option<i64>,
    pub datetime:  Option<String>,
    pub nonce:     Option<i64>,
    pub symbol:    Option<String>,
    pub cache:     Vec<Value>,
}

fn iso8601_millis(ts: i64) -> Option<String> {
    if ts < 0 { return None; }
    chrono::DateTime::<chrono::Utc>::from_timestamp_millis(ts)
        .map(|t| t.to_rfc3339_opts(chrono::SecondsFormat::Millis, true))
}

/// Coerce a snapshot dict to a list of `[price, size, …]` deltas
/// suitable for `OrderBookSide::seed`.
fn snapshot_deltas(snapshot: &Value, key: &str) -> Vec<Vec<Value>> {
    let arr = match snapshot {
        Value::Dict(d) => match d.get(key) {
            Some(Value::Arr(a)) => a.clone(),
            _ => return Vec::new(),
        },
        _ => return Vec::new(),
    };
    arr.iter().map(|row| match row {
        Value::Arr(a) => (**a).clone(),
        _ => Vec::new(),
    }).collect()
}

fn snapshot_int(snapshot: &Value, key: &str) -> Option<i64> {
    match snapshot {
        Value::Dict(d) => match d.get(key) {
            Some(Value::Int(n))   => Some(*n),
            Some(Value::Float(f)) => Some(*f as i64),
            _ => None,
        },
        _ => None,
    }
}

fn snapshot_str(snapshot: &Value, key: &str) -> Option<String> {
    match snapshot {
        Value::Dict(d) => match d.get(key) {
            Some(Value::Str(s)) => Some(s.clone()),
            _ => None,
        },
        _ => None,
    }
}

impl OrderBook {
    /// Construct a plain (`OrderBookSide`) book from a snapshot dict.
    pub fn new(snapshot: Value, depth: Option<usize>) -> Self {
        let mut bids = OrderBookSide::new(Side::Bid, depth);
        let mut asks = OrderBookSide::new(Side::Ask, depth);
        bids.seed(&snapshot_deltas(&snapshot, "bids"));
        asks.seed(&snapshot_deltas(&snapshot, "asks"));
        Self::finish(BookSides::Plain { bids, asks }, &snapshot)
    }

    /// Construct a `CountedOrderBook` (3rd value = order count).
    pub fn new_counted(snapshot: Value, depth: Option<usize>) -> Self {
        let mut bids = CountedOrderBookSide::new(Side::Bid, depth);
        let mut asks = CountedOrderBookSide::new(Side::Ask, depth);
        bids.seed(&snapshot_deltas(&snapshot, "bids"));
        asks.seed(&snapshot_deltas(&snapshot, "asks"));
        Self::finish(BookSides::Counted { bids, asks }, &snapshot)
    }

    /// Construct an `IndexedOrderBook` (3rd value = order id).
    pub fn new_indexed(snapshot: Value, depth: Option<usize>) -> Self {
        let mut bids = IndexedOrderBookSide::new(Side::Bid, depth);
        let mut asks = IndexedOrderBookSide::new(Side::Ask, depth);
        bids.seed(&snapshot_deltas(&snapshot, "bids"));
        asks.seed(&snapshot_deltas(&snapshot, "asks"));
        Self::finish(BookSides::Indexed { bids, asks }, &snapshot)
    }

    fn finish(sides: BookSides, snapshot: &Value) -> Self {
        let timestamp = snapshot_int(snapshot, "timestamp");
        let datetime  = timestamp.and_then(iso8601_millis);
        let nonce     = snapshot_int(snapshot, "nonce");
        let symbol    = snapshot_str(snapshot, "symbol");
        Self { sides, timestamp, datetime, nonce, symbol, cache: Vec::new() }
    }

    pub fn limit(&mut self) -> &mut Self {
        self.sides.limit();
        self
    }

    pub fn update(&mut self, snapshot: Value) -> &mut Self {
        let new_nonce = snapshot_int(&snapshot, "nonce");
        if let (Some(n), Some(cur)) = (new_nonce, self.nonce) {
            if n <= cur { return self; }
        }
        self.nonce     = new_nonce;
        self.timestamp = snapshot_int(&snapshot, "timestamp");
        self.datetime  = self.timestamp.and_then(iso8601_millis);
        self.reset(snapshot)
    }

    /// `reset(snapshot)` — wipe and reseed bids/asks; refresh metadata.
    pub fn reset(&mut self, snapshot: Value) -> &mut Self {
        let bids_deltas = snapshot_deltas(&snapshot, "bids");
        let asks_deltas = snapshot_deltas(&snapshot, "asks");
        match &mut self.sides {
            BookSides::Plain { bids, asks } => {
                bids.seed(&bids_deltas);
                asks.seed(&asks_deltas);
            }
            BookSides::Counted { bids, asks } => {
                bids.seed(&bids_deltas);
                asks.seed(&asks_deltas);
            }
            BookSides::Indexed { bids, asks } => {
                bids.seed(&bids_deltas);
                asks.seed(&asks_deltas);
            }
        }
        self.timestamp = snapshot_int(&snapshot, "timestamp");
        self.datetime  = self.timestamp.and_then(iso8601_millis);
        self.nonce     = snapshot_int(&snapshot, "nonce");
        self.symbol    = snapshot_str(&snapshot, "symbol");
        self
    }
}
