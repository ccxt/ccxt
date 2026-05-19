// Native Rust – hand-written domain types.
//
// These mirror the unified structures in wiki/Manual.md.
// Exchange code accesses fields via `Value` maps at runtime; these structs
// are used for the typed wrapper layer (analogous to Go's typed wrappers).

use std::collections::HashMap;
use crate::Value;

/// A unified market / symbol descriptor.
#[derive(Debug, Clone, Default)]
pub struct Market {
    pub id:       String,
    pub symbol:   String,
    pub base:     String,
    pub quote:    String,
    pub settle:   Option<String>,
    pub base_id:  String,
    pub quote_id: String,
    pub market_type: String,   // "spot" | "swap" | "future" | "option"
    pub spot:     bool,
    pub margin:   bool,
    pub swap:     bool,
    pub future:   bool,
    pub option:   bool,
    pub active:   bool,
    pub contract: bool,
    pub linear:   Option<bool>,
    pub inverse:  Option<bool>,
    pub taker:    Option<f64>,
    pub maker:    Option<f64>,
    pub raw:      Value,
}

impl Market {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_bool, safe_number};
        let mut m = Market::default();
        m.id      = safe_string(&v, "id",     None).unwrap_or_default();
        m.symbol  = safe_string(&v, "symbol", None).unwrap_or_default();
        m.base    = safe_string(&v, "base",   None).unwrap_or_default();
        m.quote   = safe_string(&v, "quote",  None).unwrap_or_default();
        m.market_type = safe_string(&v, "type", None).unwrap_or_else(|| "spot".to_owned());
        m.spot    = safe_bool(&v, "spot",   Some(false)).unwrap_or(false);
        m.swap    = safe_bool(&v, "swap",   Some(false)).unwrap_or(false);
        m.future  = safe_bool(&v, "future", Some(false)).unwrap_or(false);
        m.option  = safe_bool(&v, "option", Some(false)).unwrap_or(false);
        m.active  = safe_bool(&v, "active", Some(true)).unwrap_or(true);
        m.taker   = safe_number(&v, "taker", None);
        m.maker   = safe_number(&v, "maker", None);
        m.raw     = v;
        m
    }
}

/// A unified ticker.
#[derive(Debug, Clone, Default)]
pub struct Ticker {
    pub symbol:       String,
    pub timestamp:    Option<i64>,
    pub datetime:     Option<String>,
    pub high:         Option<f64>,
    pub low:          Option<f64>,
    pub bid:          Option<f64>,
    pub ask:          Option<f64>,
    pub last:         Option<f64>,
    pub base_volume:  Option<f64>,
    pub quote_volume: Option<f64>,
    pub raw:          Value,
}

impl Ticker {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut t = Ticker::default();
        t.symbol        = safe_string(&v, "symbol",      None).unwrap_or_default();
        t.timestamp     = safe_integer(&v, "timestamp",  None);
        t.datetime      = safe_string(&v, "datetime",    None);
        t.high          = safe_number(&v, "high",         None);
        t.low           = safe_number(&v, "low",          None);
        t.bid           = safe_number(&v, "bid",          None);
        t.ask           = safe_number(&v, "ask",          None);
        t.last          = safe_number(&v, "last",         None);
        t.base_volume   = safe_number(&v, "baseVolume",   None);
        t.quote_volume  = safe_number(&v, "quoteVolume",  None);
        t.raw = v;
        t
    }
}

/// A unified trade record.
#[derive(Debug, Clone, Default)]
pub struct Trade {
    pub id:        Option<String>,
    pub symbol:    String,
    pub timestamp: Option<i64>,
    pub datetime:  Option<String>,
    pub side:      Option<String>,
    pub price:     Option<f64>,
    pub amount:    Option<f64>,
    pub cost:      Option<f64>,
    pub raw:       Value,
}

impl Trade {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut t = Trade::default();
        t.id        = safe_string(&v, "id",        None);
        t.symbol    = safe_string(&v, "symbol",    None).unwrap_or_default();
        t.timestamp = safe_integer(&v, "timestamp", None);
        t.datetime  = safe_string(&v, "datetime",  None);
        t.side      = safe_string(&v, "side",      None);
        t.price     = safe_number(&v, "price",     None);
        t.amount    = safe_number(&v, "amount",    None);
        t.cost      = safe_number(&v, "cost",      None);
        t.raw = v;
        t
    }
}

/// A unified order.
#[derive(Debug, Clone, Default)]
pub struct Order {
    pub id:        Option<String>,
    pub client_order_id: Option<String>,
    pub symbol:    String,
    pub timestamp: Option<i64>,
    pub datetime:  Option<String>,
    pub status:    Option<String>,   // "open" | "closed" | "canceled" | "expired"
    pub order_type:Option<String>,   // "limit" | "market"
    pub side:      Option<String>,   // "buy" | "sell"
    pub price:     Option<f64>,
    pub amount:    Option<f64>,
    pub filled:    Option<f64>,
    pub remaining: Option<f64>,
    pub cost:      Option<f64>,
    pub fee:       Option<HashMap<String, Value>>,
    pub raw:       Value,
}

impl Order {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut o = Order::default();
        o.id              = safe_string(&v, "id",            None);
        o.client_order_id = safe_string(&v, "clientOrderId", None);
        o.symbol          = safe_string(&v, "symbol",        None).unwrap_or_default();
        o.timestamp       = safe_integer(&v, "timestamp",    None);
        o.datetime        = safe_string(&v, "datetime",      None);
        o.status          = safe_string(&v, "status",        None);
        o.order_type      = safe_string(&v, "type",          None);
        o.side            = safe_string(&v, "side",          None);
        o.price           = safe_number(&v, "price",         None);
        o.amount          = safe_number(&v, "amount",        None);
        o.filled          = safe_number(&v, "filled",        None);
        o.remaining       = safe_number(&v, "remaining",     None);
        o.cost            = safe_number(&v, "cost",          None);
        o.raw = v;
        o
    }
}

/// A unified order-book snapshot.
#[derive(Debug, Clone, Default)]
pub struct OrderBook {
    pub symbol:    Option<String>,
    pub timestamp: Option<i64>,
    pub datetime:  Option<String>,
    pub bids:      Vec<[f64; 2]>,
    pub asks:      Vec<[f64; 2]>,
    pub nonce:     Option<i64>,
}

/// A unified OHLCV candle: [timestamp, open, high, low, close, volume].
pub type OHLCV = [f64; 6];

/// Unified balance / account info.
#[derive(Debug, Clone, Default)]
pub struct Balances {
    pub info:  Value,
    pub free:  HashMap<String, f64>,
    pub used:  HashMap<String, f64>,
    pub total: HashMap<String, f64>,
}

/// Unified transaction (deposit / withdrawal).
#[derive(Debug, Clone, Default)]
pub struct Transaction {
    pub id:        Option<String>,
    pub txid:      Option<String>,
    pub timestamp: Option<i64>,
    pub datetime:  Option<String>,
    pub address:   Option<String>,
    pub amount:    Option<f64>,
    pub currency:  Option<String>,
    pub status:    Option<String>,
    pub raw:       Value,
}

/// Unified currency descriptor.
#[derive(Debug, Clone, Default)]
pub struct Currency {
    pub id:        String,
    pub code:      String,
    pub name:      Option<String>,
    pub active:    bool,
    pub precision: Option<f64>,
    pub raw:       Value,
}

/// Unified position (derivatives).
#[derive(Debug, Clone, Default)]
pub struct Position {
    pub symbol:           String,
    pub side:             Option<String>,
    pub contracts:        Option<f64>,
    pub contract_size:    Option<f64>,
    pub entry_price:      Option<f64>,
    pub mark_price:       Option<f64>,
    pub unrealized_pnl:   Option<f64>,
    pub leverage:         Option<f64>,
    pub margin_type:      Option<String>,
    pub raw:              Value,
}

/// Unified transfer record.
#[derive(Debug, Clone, Default)]
pub struct Transfer {
    pub id:        Option<String>,
    pub timestamp: Option<i64>,
    pub datetime:  Option<String>,
    pub currency:  Option<String>,
    pub amount:    Option<f64>,
    pub from_account: Option<String>,
    pub to_account:   Option<String>,
    pub status:    Option<String>,
    pub raw:       Value,
}

/// Unified ledger entry.
#[derive(Debug, Clone, Default)]
pub struct LedgerEntry {
    pub id:        Option<String>,
    pub timestamp: Option<i64>,
    pub datetime:  Option<String>,
    pub direction: Option<String>,
    pub account:   Option<String>,
    pub amount:    Option<f64>,
    pub currency:  Option<String>,
    pub raw:       Value,
}

/// Unified funding rate.
#[derive(Debug, Clone, Default)]
pub struct FundingRate {
    pub symbol:        String,
    pub funding_rate:  Option<f64>,
    pub timestamp:     Option<i64>,
    pub datetime:      Option<String>,
    pub raw:           Value,
}

/// Unified greeks (options).
#[derive(Debug, Clone, Default)]
pub struct Greeks {
    pub symbol:    String,
    pub delta:     Option<f64>,
    pub gamma:     Option<f64>,
    pub theta:     Option<f64>,
    pub vega:      Option<f64>,
    pub rho:       Option<f64>,
    pub raw:       Value,
}
