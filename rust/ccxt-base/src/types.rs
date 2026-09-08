// Native Rust – hand-written domain types.
//
// These mirror the unified structures in wiki/Manual.md.
// Exchange code accesses fields via `Value` maps at runtime; these structs
// are used for the typed wrapper layer (analogous to Go's typed wrappers).

use indexmap::IndexMap as HashMap;
use crate::Value;

/// A `{ min, max }` bound from a market's `limits` block. Either side may be
/// absent when the venue does not declare it.
#[derive(Debug, Clone, Copy, Default, PartialEq)]
pub struct MinMax {
    pub min: Option<f64>,
    pub max: Option<f64>,
}

impl MinMax {
    fn from_value(v: &Value) -> Self {
        use crate::value::safe_number;
        MinMax { min: safe_number(v, "min", None), max: safe_number(v, "max", None) }
    }
    /// `true` when `amount` is within the bound (an absent side never fails).
    pub fn contains(&self, amount: f64) -> bool {
        self.min.map_or(true, |m| amount >= m) && self.max.map_or(true, |m| amount <= m)
    }
}

/// A market's declared order limits. Check these before sending an order —
/// it costs no request and no rate-limit weight.
#[derive(Debug, Clone, Copy, Default, PartialEq)]
pub struct MarketLimits {
    pub amount:   MinMax,
    pub price:    MinMax,
    pub cost:     MinMax,
    pub leverage: MinMax,
}

/// A market's tick/step sizes.
#[derive(Debug, Clone, Copy, Default, PartialEq)]
pub struct MarketPrecision {
    pub amount: Option<f64>,
    pub price:  Option<f64>,
    pub cost:   Option<f64>,
    pub base:   Option<f64>,
    pub quote:  Option<f64>,
}

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
    /// Declared order bounds — amount / price / cost / leverage.
    pub limits:   MarketLimits,
    /// Declared tick and step sizes.
    pub precision: MarketPrecision,
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
        m.settle  = safe_string(&v, "settle",  None);
        m.base_id  = safe_string(&v, "baseId",  None).unwrap_or_default();
        m.quote_id = safe_string(&v, "quoteId", None).unwrap_or_default();
        m.market_type = safe_string(&v, "type", None).unwrap_or_else(|| "spot".to_owned());
        m.spot    = safe_bool(&v, "spot",   Some(false)).unwrap_or(false);
        m.margin  = safe_bool(&v, "margin", Some(false)).unwrap_or(false);
        m.swap    = safe_bool(&v, "swap",   Some(false)).unwrap_or(false);
        m.future  = safe_bool(&v, "future", Some(false)).unwrap_or(false);
        m.option  = safe_bool(&v, "option", Some(false)).unwrap_or(false);
        m.contract = safe_bool(&v, "contract", Some(false)).unwrap_or(false);
        m.linear  = safe_bool(&v, "linear",  None);
        m.inverse = safe_bool(&v, "inverse", None);
        m.active  = safe_bool(&v, "active", Some(true)).unwrap_or(true);
        m.taker   = safe_number(&v, "taker", None);
        m.maker   = safe_number(&v, "maker", None);
        let sub = |parent: &Value, key: &str| crate::value::get_value(parent, &Value::Str(key.to_string()));
        let limits = sub(&v, "limits");
        m.limits = MarketLimits {
            amount:   MinMax::from_value(&sub(&limits, "amount")),
            price:    MinMax::from_value(&sub(&limits, "price")),
            cost:     MinMax::from_value(&sub(&limits, "cost")),
            leverage: MinMax::from_value(&sub(&limits, "leverage")),
        };
        let precision = sub(&v, "precision");
        m.precision = MarketPrecision {
            amount: safe_number(&precision, "amount", None),
            price:  safe_number(&precision, "price",  None),
            cost:   safe_number(&precision, "cost",   None),
            base:   safe_number(&precision, "base",   None),
            quote:  safe_number(&precision, "quote",  None),
        };
        m.raw     = v;
        m
    }
}

/// A unified ticker. Mirrors the TS `Ticker` interface (`ts/src/base/types.ts`).
#[derive(Debug, Clone, Default)]
pub struct Ticker {
    pub symbol:         String,
    pub timestamp:      Option<i64>,
    pub datetime:       Option<String>,
    pub high:           Option<f64>,
    pub low:            Option<f64>,
    pub bid:            Option<f64>,
    pub bid_volume:     Option<f64>,
    pub ask:            Option<f64>,
    pub ask_volume:     Option<f64>,
    pub vwap:           Option<f64>,
    pub open:           Option<f64>,
    pub close:          Option<f64>,
    pub last:           Option<f64>,
    pub previous_close: Option<f64>,
    pub change:         Option<f64>,
    pub percentage:     Option<f64>,
    pub average:        Option<f64>,
    pub base_volume:    Option<f64>,
    pub quote_volume:   Option<f64>,
    pub index_price:    Option<f64>,
    pub mark_price:     Option<f64>,
    pub raw:            Value,
}

impl Ticker {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut t = Ticker::default();
        t.symbol         = safe_string(&v, "symbol",      None).unwrap_or_default();
        t.timestamp      = safe_integer(&v, "timestamp",  None);
        t.datetime       = safe_string(&v, "datetime",    None);
        t.high           = safe_number(&v, "high",         None);
        t.low            = safe_number(&v, "low",          None);
        t.bid            = safe_number(&v, "bid",          None);
        t.bid_volume     = safe_number(&v, "bidVolume",    None);
        t.ask            = safe_number(&v, "ask",          None);
        t.ask_volume     = safe_number(&v, "askVolume",    None);
        t.vwap           = safe_number(&v, "vwap",         None);
        t.open           = safe_number(&v, "open",         None);
        t.close          = safe_number(&v, "close",        None);
        t.last           = safe_number(&v, "last",         None);
        t.previous_close = safe_number(&v, "previousClose", None);
        t.change         = safe_number(&v, "change",       None);
        t.percentage     = safe_number(&v, "percentage",   None);
        t.average        = safe_number(&v, "average",      None);
        t.base_volume    = safe_number(&v, "baseVolume",   None);
        t.quote_volume   = safe_number(&v, "quoteVolume",  None);
        t.index_price    = safe_number(&v, "indexPrice",   None);
        t.mark_price     = safe_number(&v, "markPrice",    None);
        t.raw = v;
        t
    }
}

/// A unified trade record. Mirrors the TS `Trade` interface.
#[derive(Debug, Clone, Default)]
pub struct Trade {
    pub id:             Option<String>,
    pub order:          Option<String>,
    pub symbol:         String,
    pub timestamp:      Option<i64>,
    pub datetime:       Option<String>,
    pub trade_type:     Option<String>,   // "limit" | "market"
    pub side:           Option<String>,
    pub taker_or_maker: Option<String>,   // "taker" | "maker"
    pub price:          Option<f64>,
    pub amount:         Option<f64>,
    pub cost:           Option<f64>,
    pub fee:            Option<Fee>,
    pub raw:            Value,
}

impl Trade {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut t = Trade::default();
        t.id             = safe_string(&v, "id",        None);
        t.order          = safe_string(&v, "order",     None);
        t.symbol         = safe_string(&v, "symbol",    None).unwrap_or_default();
        t.timestamp      = safe_integer(&v, "timestamp", None);
        t.datetime       = safe_string(&v, "datetime",  None);
        t.trade_type     = safe_string(&v, "type",      None);
        t.side           = safe_string(&v, "side",      None);
        t.taker_or_maker = safe_string(&v, "takerOrMaker", None);
        t.price          = safe_number(&v, "price",     None);
        t.amount         = safe_number(&v, "amount",    None);
        t.cost           = safe_number(&v, "cost",      None);
        t.fee            = match crate::get_value(&v, &Value::Str("fee".to_string())) {
            fee @ Value::Dict(_) => Some(Fee::from_value(fee)),
            _ => None,
        };
        t.raw = v;
        t
    }
}

/// A unified order. Mirrors the TS `Order` interface.
#[derive(Debug, Clone, Default)]
pub struct Order {
    pub id:        Option<String>,
    pub client_order_id: Option<String>,
    pub symbol:    String,
    pub timestamp: Option<i64>,
    pub datetime:  Option<String>,
    pub last_trade_timestamp:  Option<i64>,
    pub last_update_timestamp: Option<i64>,
    pub status:    Option<String>,   // "open" | "closed" | "canceled" | "expired"
    pub order_type:Option<String>,   // "limit" | "market"
    pub time_in_force: Option<String>, // "GTC" | "IOC" | "FOK" | "PO"
    pub side:      Option<String>,   // "buy" | "sell"
    pub price:     Option<f64>,
    pub average:   Option<f64>,
    pub amount:    Option<f64>,
    pub filled:    Option<f64>,
    pub remaining: Option<f64>,
    pub cost:      Option<f64>,
    pub trigger_price:     Option<f64>,
    pub stop_price:        Option<f64>,   // deprecated alias of `trigger_price`
    pub take_profit_price: Option<f64>,
    pub stop_loss_price:   Option<f64>,
    pub post_only:   Option<bool>,
    pub reduce_only: Option<bool>,
    pub trades:    Vec<Trade>,
    pub fee:       Option<HashMap<String, Value>>,
    pub raw:       Value,
}

impl Order {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer, safe_bool};
        let mut o = Order::default();
        o.id              = safe_string(&v, "id",            None);
        o.client_order_id = safe_string(&v, "clientOrderId", None);
        o.symbol          = safe_string(&v, "symbol",        None).unwrap_or_default();
        o.timestamp       = safe_integer(&v, "timestamp",    None);
        o.datetime        = safe_string(&v, "datetime",      None);
        o.last_trade_timestamp  = safe_integer(&v, "lastTradeTimestamp",  None);
        o.last_update_timestamp = safe_integer(&v, "lastUpdateTimestamp", None);
        o.status          = safe_string(&v, "status",        None);
        o.order_type      = safe_string(&v, "type",          None);
        o.time_in_force   = safe_string(&v, "timeInForce",   None);
        o.side            = safe_string(&v, "side",          None);
        o.price           = safe_number(&v, "price",         None);
        o.average         = safe_number(&v, "average",       None);
        o.amount          = safe_number(&v, "amount",        None);
        o.filled          = safe_number(&v, "filled",        None);
        o.remaining       = safe_number(&v, "remaining",     None);
        o.cost            = safe_number(&v, "cost",          None);
        o.trigger_price     = safe_number(&v, "triggerPrice",    None);
        o.stop_price        = safe_number(&v, "stopPrice",       None);
        o.take_profit_price = safe_number(&v, "takeProfitPrice", None);
        o.stop_loss_price   = safe_number(&v, "stopLossPrice",   None);
        o.post_only       = safe_bool(&v, "postOnly",   None);
        o.reduce_only     = safe_bool(&v, "reduceOnly", None);
        o.trades          = vec_from_value(&crate::get_value(&v, &Value::Str("trades".to_string())), Trade::from_value);
        o.fee             = match crate::get_value(&v, &Value::Str("fee".to_string())) {
            Value::Dict(m) => Some((*m).clone()),
            _ => None,
        };
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
    pub raw:       Value,
}

impl OrderBook {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_integer, get_value};
        let mut ob = OrderBook::default();
        ob.symbol    = safe_string(&v, "symbol",    None);
        ob.timestamp = safe_integer(&v, "timestamp", None);
        ob.datetime  = safe_string(&v, "datetime",  None);
        ob.nonce     = safe_integer(&v, "nonce",    None);
        // `bids`/`asks` are arrays of `[price, amount]` pairs. Walk the
        // outer `Value::Arr` and pull the first two numeric entries of each
        // inner row. A row that isn't a 2+ element array of parseable numbers
        // is DROPPED rather than emitted as `[NaN, NaN]` — a NaN level is not a
        // valid book entry and would corrupt best-bid/ask and depth math
        // downstream (review #7).
        let extract_side = |key: &str| -> Vec<[f64; 2]> {
            let side = get_value(&v, &Value::Str(key.to_string()));
            // A resolved WS book keeps its sides as shared markers (entries in
            // the side store), not inline arrays — read those levels straight
            // from the store as `[price, amount]` pairs (no intermediate Value
            // clone). Without this the match below misses and the typed book
            // comes back empty. Falls through to plain-array parsing otherwise.
            if let Some(pairs) = crate::value::side_price_amounts(&side) {
                return pairs;
            }
            match side {
                Value::Arr(rows) => rows.iter().filter_map(|row| {
                    let num = |cell: Option<&Value>| -> f64 {
                        match cell {
                            Some(Value::Float(f)) => *f,
                            Some(Value::Int(n))   => *n as f64,
                            Some(Value::Str(s))   => s.parse().unwrap_or(f64::NAN),
                            _ => f64::NAN,
                        }
                    };
                    let (price, amt) = match row {
                        Value::Arr(r) => (num(r.first()), num(r.get(1))),
                        _ => (f64::NAN, f64::NAN),
                    };
                    if price.is_nan() || amt.is_nan() { None } else { Some([price, amt]) }
                }).collect(),
                _ => Vec::new(),
            }
        };
        ob.bids = extract_side("bids");
        ob.asks = extract_side("asks");
        ob.raw  = v;
        ob
    }
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

impl Balances {
    pub fn from_value(v: Value) -> Self {
        use crate::value::get_value;
        let mut b = Balances::default();
        b.info = get_value(&v, &Value::Str("info".to_string()));
        // The top-level `free`/`used`/`total` keys are dicts of
        // `<currency-code> → number`. Walk them and collect.
        let extract = |key: &str| -> HashMap<String, f64> {
            let m = get_value(&v, &Value::Str(key.to_string()));
            match m {
                Value::Dict(d) => d.iter().filter_map(|(k, val)| {
                    let n = match val {
                        Value::Float(f) => Some(*f),
                        Value::Int(n)   => Some(*n as f64),
                        Value::Str(s)   => s.parse().ok(),
                        _ => None,
                    }?;
                    Some((k.clone(), n))
                }).collect(),
                _ => HashMap::new(),
            }
        };
        b.free  = extract("free");
        b.used  = extract("used");
        b.total = extract("total");
        b
    }
}

/// Unified transaction (deposit / withdrawal). Mirrors the TS `Transaction` interface.
#[derive(Debug, Clone, Default)]
pub struct Transaction {
    pub id:           Option<String>,
    pub txid:         Option<String>,
    pub timestamp:    Option<i64>,
    pub datetime:     Option<String>,
    pub address:      Option<String>,
    pub address_from: Option<String>,
    pub address_to:   Option<String>,
    pub tag:          Option<String>,
    pub tag_from:     Option<String>,
    pub tag_to:       Option<String>,
    pub tx_type:      Option<String>,   // "deposit" | "withdrawal"
    pub amount:       Option<f64>,
    pub currency:     Option<String>,
    pub status:       Option<String>,   // "pending" | "ok" | "failed" | "canceled"
    pub updated:      Option<i64>,
    pub fee:          Option<Fee>,
    pub network:      Option<String>,
    pub comment:      Option<String>,
    pub internal:     Option<bool>,
    pub raw:          Value,
}

impl Transaction {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer, safe_bool};
        let mut t = Transaction::default();
        t.id           = safe_string(&v, "id",          None);
        t.txid         = safe_string(&v, "txid",        None);
        t.timestamp    = safe_integer(&v, "timestamp",  None);
        t.datetime     = safe_string(&v, "datetime",    None);
        t.address      = safe_string(&v, "address",     None);
        t.address_from = safe_string(&v, "addressFrom", None);
        t.address_to   = safe_string(&v, "addressTo",   None);
        t.tag          = safe_string(&v, "tag",         None);
        t.tag_from     = safe_string(&v, "tagFrom",     None);
        t.tag_to       = safe_string(&v, "tagTo",       None);
        t.tx_type      = safe_string(&v, "type",        None);
        t.amount       = safe_number(&v, "amount",      None);
        t.currency     = safe_string(&v, "currency",    None);
        t.status       = safe_string(&v, "status",      None);
        t.updated      = safe_integer(&v, "updated",    None);
        t.fee          = match crate::get_value(&v, &Value::Str("fee".to_string())) {
            fee @ Value::Dict(_) => Some(Fee::from_value(fee)),
            _ => None,
        };
        t.network      = safe_string(&v, "network",     None);
        t.comment      = safe_string(&v, "comment",     None);
        t.internal     = safe_bool(&v, "internal",      None);
        t.raw = v;
        t
    }
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

impl Currency {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_bool, safe_number};
        let mut c = Currency::default();
        c.id        = safe_string(&v, "id",   None).unwrap_or_default();
        c.code      = safe_string(&v, "code", None).unwrap_or_default();
        c.name      = safe_string(&v, "name", None);
        c.active    = safe_bool(&v, "active", Some(true)).unwrap_or(true);
        c.precision = safe_number(&v, "precision", None);
        c.raw = v;
        c
    }
}

/// Unified position (derivatives). Mirrors the TS `Position` interface.
#[derive(Debug, Clone, Default)]
pub struct Position {
    pub id:               Option<String>,
    pub symbol:           String,
    pub timestamp:        Option<i64>,
    pub datetime:         Option<String>,
    pub side:             Option<String>,
    pub contracts:        Option<f64>,
    pub contract_size:    Option<f64>,
    pub notional:         Option<f64>,
    pub entry_price:      Option<f64>,
    pub mark_price:       Option<f64>,
    pub last_price:       Option<f64>,
    pub liquidation_price: Option<f64>,
    pub unrealized_pnl:   Option<f64>,
    pub realized_pnl:     Option<f64>,
    pub collateral:       Option<f64>,
    pub leverage:         Option<f64>,
    /// Unified `marginMode` ("cross" | "isolated").
    pub margin_mode:      Option<String>,
    /// Deprecated `marginType` key still emitted by a few venues; prefer `margin_mode`.
    pub margin_type:      Option<String>,
    pub hedged:           Option<bool>,
    pub maintenance_margin:            Option<f64>,
    pub maintenance_margin_percentage: Option<f64>,
    pub initial_margin:                Option<f64>,
    pub initial_margin_percentage:     Option<f64>,
    pub margin_ratio:     Option<f64>,
    pub percentage:       Option<f64>,
    pub last_update_timestamp: Option<i64>,
    pub stop_loss_price:   Option<f64>,
    pub take_profit_price: Option<f64>,
    pub raw:              Value,
}

impl Position {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer, safe_bool};
        let mut p = Position::default();
        p.id             = safe_string(&v, "id",     None);
        p.symbol         = safe_string(&v, "symbol", None).unwrap_or_default();
        p.timestamp      = safe_integer(&v, "timestamp", None);
        p.datetime       = safe_string(&v, "datetime",   None);
        p.side           = safe_string(&v, "side",   None);
        p.contracts      = safe_number(&v, "contracts",    None);
        p.contract_size  = safe_number(&v, "contractSize", None);
        p.notional       = safe_number(&v, "notional",     None);
        p.entry_price    = safe_number(&v, "entryPrice",   None);
        p.mark_price     = safe_number(&v, "markPrice",    None);
        p.last_price     = safe_number(&v, "lastPrice",    None);
        p.liquidation_price = safe_number(&v, "liquidationPrice", None);
        p.unrealized_pnl = safe_number(&v, "unrealizedPnl", None);
        p.realized_pnl   = safe_number(&v, "realizedPnl",   None);
        p.collateral     = safe_number(&v, "collateral",   None);
        p.leverage       = safe_number(&v, "leverage",     None);
        p.margin_mode    = safe_string(&v, "marginMode",   None);
        p.margin_type    = safe_string(&v, "marginType",   None);
        p.hedged         = safe_bool(&v, "hedged",         None);
        p.maintenance_margin            = safe_number(&v, "maintenanceMargin",           None);
        p.maintenance_margin_percentage = safe_number(&v, "maintenanceMarginPercentage", None);
        p.initial_margin                = safe_number(&v, "initialMargin",               None);
        p.initial_margin_percentage     = safe_number(&v, "initialMarginPercentage",     None);
        p.margin_ratio   = safe_number(&v, "marginRatio",  None);
        p.percentage     = safe_number(&v, "percentage",   None);
        p.last_update_timestamp = safe_integer(&v, "lastUpdateTimestamp", None);
        p.stop_loss_price   = safe_number(&v, "stopLossPrice",   None);
        p.take_profit_price = safe_number(&v, "takeProfitPrice", None);
        p.raw = v;
        p
    }
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

impl Transfer {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut t = Transfer::default();
        t.id           = safe_string(&v, "id",        None);
        t.timestamp    = safe_integer(&v, "timestamp", None);
        t.datetime     = safe_string(&v, "datetime",  None);
        t.currency     = safe_string(&v, "currency",  None);
        t.amount       = safe_number(&v, "amount",    None);
        t.from_account = safe_string(&v, "fromAccount", None);
        t.to_account   = safe_string(&v, "toAccount",   None);
        t.status       = safe_string(&v, "status",   None);
        t.raw = v;
        t
    }
}

/// Unified ledger entry. Mirrors the TS `LedgerEntry` interface.
#[derive(Debug, Clone, Default)]
pub struct LedgerEntry {
    pub id:        Option<String>,
    pub timestamp: Option<i64>,
    pub datetime:  Option<String>,
    pub direction: Option<String>,   // "in" | "out"
    pub account:   Option<String>,
    pub reference_id:      Option<String>,
    pub reference_account: Option<String>,
    pub entry_type: Option<String>,  // "trade" | "transaction" | "fee" | …
    pub amount:    Option<f64>,
    pub currency:  Option<String>,
    pub before:    Option<f64>,
    pub after:     Option<f64>,
    pub status:    Option<String>,
    pub fee:       Option<Fee>,
    pub raw:       Value,
}

impl LedgerEntry {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut l = LedgerEntry::default();
        l.id        = safe_string(&v, "id",        None);
        l.timestamp = safe_integer(&v, "timestamp", None);
        l.datetime  = safe_string(&v, "datetime",  None);
        l.direction = safe_string(&v, "direction", None);
        l.account   = safe_string(&v, "account",   None);
        l.reference_id      = safe_string(&v, "referenceId",      None);
        l.reference_account = safe_string(&v, "referenceAccount", None);
        l.entry_type = safe_string(&v, "type",     None);
        l.amount    = safe_number(&v, "amount",    None);
        l.currency  = safe_string(&v, "currency",  None);
        l.before    = safe_number(&v, "before",    None);
        l.after     = safe_number(&v, "after",     None);
        l.status    = safe_string(&v, "status",    None);
        l.fee       = match crate::get_value(&v, &Value::Str("fee".to_string())) {
            fee @ Value::Dict(_) => Some(Fee::from_value(fee)),
            _ => None,
        };
        l.raw = v;
        l
    }
}

/// Unified funding rate. Mirrors the TS `FundingRate` interface.
#[derive(Debug, Clone, Default)]
pub struct FundingRate {
    pub symbol:        String,
    pub funding_rate:  Option<f64>,
    pub timestamp:     Option<i64>,
    pub datetime:      Option<String>,
    pub mark_price:    Option<f64>,
    pub index_price:   Option<f64>,
    pub interest_rate: Option<f64>,
    pub estimated_settle_price: Option<f64>,
    pub funding_timestamp: Option<i64>,
    pub funding_datetime:  Option<String>,
    pub next_funding_timestamp: Option<i64>,
    pub next_funding_datetime:  Option<String>,
    pub next_funding_rate:      Option<f64>,
    pub previous_funding_timestamp: Option<i64>,
    pub previous_funding_datetime:  Option<String>,
    pub previous_funding_rate:      Option<f64>,
    pub interval:      Option<String>,
    pub raw:           Value,
}

impl FundingRate {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut f = FundingRate::default();
        f.symbol       = safe_string(&v, "symbol", None).unwrap_or_default();
        f.funding_rate = safe_number(&v, "fundingRate", None);
        f.timestamp    = safe_integer(&v, "timestamp", None);
        f.datetime     = safe_string(&v, "datetime", None);
        f.mark_price    = safe_number(&v, "markPrice",    None);
        f.index_price   = safe_number(&v, "indexPrice",   None);
        f.interest_rate = safe_number(&v, "interestRate", None);
        f.estimated_settle_price = safe_number(&v, "estimatedSettlePrice", None);
        f.funding_timestamp = safe_integer(&v, "fundingTimestamp", None);
        f.funding_datetime  = safe_string(&v, "fundingDatetime",   None);
        f.next_funding_timestamp = safe_integer(&v, "nextFundingTimestamp", None);
        f.next_funding_datetime  = safe_string(&v, "nextFundingDatetime",   None);
        f.next_funding_rate      = safe_number(&v, "nextFundingRate",       None);
        f.previous_funding_timestamp = safe_integer(&v, "previousFundingTimestamp", None);
        f.previous_funding_datetime  = safe_string(&v, "previousFundingDatetime",   None);
        f.previous_funding_rate      = safe_number(&v, "previousFundingRate",       None);
        f.interval     = safe_string(&v, "interval", None);
        f.raw = v;
        f
    }
}

/// Unified greeks (options). Mirrors the TS `Greeks` interface.
#[derive(Debug, Clone, Default)]
pub struct Greeks {
    pub symbol:    String,
    pub timestamp: Option<i64>,
    pub datetime:  Option<String>,
    pub delta:     Option<f64>,
    pub gamma:     Option<f64>,
    pub theta:     Option<f64>,
    pub vega:      Option<f64>,
    pub rho:       Option<f64>,
    pub vanna:     Option<f64>,
    pub volga:     Option<f64>,
    pub charm:     Option<f64>,
    pub bid_size:  Option<f64>,
    pub ask_size:  Option<f64>,
    pub bid_implied_volatility:  Option<f64>,
    pub ask_implied_volatility:  Option<f64>,
    pub mark_implied_volatility: Option<f64>,
    pub bid_price:  Option<f64>,
    pub ask_price:  Option<f64>,
    pub mark_price: Option<f64>,
    pub last_price: Option<f64>,
    pub underlying_price: Option<f64>,
    pub raw:       Value,
}

impl Greeks {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut g = Greeks::default();
        g.symbol    = safe_string(&v, "symbol", None).unwrap_or_default();
        g.timestamp = safe_integer(&v, "timestamp", None);
        g.datetime  = safe_string(&v, "datetime",  None);
        g.delta  = safe_number(&v, "delta", None);
        g.gamma  = safe_number(&v, "gamma", None);
        g.theta  = safe_number(&v, "theta", None);
        g.vega   = safe_number(&v, "vega",  None);
        g.rho    = safe_number(&v, "rho",   None);
        g.vanna  = safe_number(&v, "vanna", None);
        g.volga  = safe_number(&v, "volga", None);
        g.charm  = safe_number(&v, "charm", None);
        g.bid_size = safe_number(&v, "bidSize", None);
        g.ask_size = safe_number(&v, "askSize", None);
        g.bid_implied_volatility  = safe_number(&v, "bidImpliedVolatility",  None);
        g.ask_implied_volatility  = safe_number(&v, "askImpliedVolatility",  None);
        g.mark_implied_volatility = safe_number(&v, "markImpliedVolatility", None);
        g.bid_price  = safe_number(&v, "bidPrice",  None);
        g.ask_price  = safe_number(&v, "askPrice",  None);
        g.mark_price = safe_number(&v, "markPrice", None);
        g.last_price = safe_number(&v, "lastPrice", None);
        g.underlying_price = safe_number(&v, "underlyingPrice", None);
        g.raw = v;
        g
    }
}

/// A single trading-fee descriptor (per currency or per side).
#[derive(Debug, Clone, Default)]
pub struct Fee {
    pub currency: Option<String>,
    pub cost:     Option<f64>,
    pub rate:     Option<f64>,
    pub raw:      Value,
}

impl Fee {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number};
        let mut f = Fee::default();
        f.currency = safe_string(&v, "currency", None);
        f.cost     = safe_number(&v, "cost",     None);
        f.rate     = safe_number(&v, "rate",     None);
        f.raw = v;
        f
    }
}

/// Unified trading-fee descriptor (per-symbol maker / taker).
#[derive(Debug, Clone, Default)]
pub struct TradingFee {
    pub symbol:     Option<String>,
    pub maker:      Option<f64>,
    pub taker:      Option<f64>,
    pub percentage: Option<bool>,
    pub tier_based: Option<bool>,
    pub raw:        Value,
}

impl TradingFee {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_bool};
        let mut t = TradingFee::default();
        t.symbol     = safe_string(&v, "symbol", None);
        t.maker      = safe_number(&v, "maker",  None);
        t.taker      = safe_number(&v, "taker",  None);
        t.percentage = safe_bool(&v, "percentage", None);
        t.tier_based = safe_bool(&v, "tierBased",  None);
        t.raw = v;
        t
    }
}

/// Unified liquidation record.
#[derive(Debug, Clone, Default)]
pub struct Liquidation {
    pub symbol:    String,
    pub timestamp: Option<i64>,
    pub datetime:  Option<String>,
    pub price:     Option<f64>,
    pub base_value:  Option<f64>,
    pub quote_value: Option<f64>,
    pub contracts:     Option<f64>,
    pub contract_size: Option<f64>,
    pub side:      Option<String>,   // "buy" | "sell"
    pub raw:       Value,
}

impl Liquidation {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut l = Liquidation::default();
        l.symbol      = safe_string(&v, "symbol", None).unwrap_or_default();
        l.timestamp   = safe_integer(&v, "timestamp", None);
        l.datetime    = safe_string(&v, "datetime", None);
        l.price       = safe_number(&v, "price", None);
        l.base_value  = safe_number(&v, "baseValue",  None);
        l.quote_value = safe_number(&v, "quoteValue", None);
        l.contracts     = safe_number(&v, "contracts",    None);
        l.contract_size = safe_number(&v, "contractSize", None);
        l.side        = safe_string(&v, "side", None);
        l.raw = v;
        l
    }
}

/// Unified open-interest snapshot.
#[derive(Debug, Clone, Default)]
pub struct OpenInterest {
    pub symbol:    String,
    pub timestamp: Option<i64>,
    pub datetime:  Option<String>,
    pub open_interest_amount: Option<f64>,
    pub open_interest_value:  Option<f64>,
    pub base_volume:  Option<f64>,
    pub quote_volume: Option<f64>,
    pub raw:       Value,
}

impl OpenInterest {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut o = OpenInterest::default();
        o.symbol    = safe_string(&v, "symbol", None).unwrap_or_default();
        o.timestamp = safe_integer(&v, "timestamp", None);
        o.datetime  = safe_string(&v, "datetime",  None);
        o.open_interest_amount = safe_number(&v, "openInterestAmount", None);
        o.open_interest_value  = safe_number(&v, "openInterestValue",  None);
        o.base_volume  = safe_number(&v, "baseVolume",  None);
        o.quote_volume = safe_number(&v, "quoteVolume", None);
        o.raw = v;
        o
    }
}

/// Exchange-wide status snapshot.
#[derive(Debug, Clone, Default)]
pub struct Status {
    pub status:    Option<String>,
    pub updated:   Option<i64>,
    pub eta:       Option<i64>,
    pub url:       Option<String>,
    pub raw:       Value,
}

impl Status {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_integer};
        let mut s = Status::default();
        s.status  = safe_string(&v, "status", None);
        s.updated = safe_integer(&v, "updated", None);
        s.eta     = safe_integer(&v, "eta",     None);
        s.url     = safe_string(&v, "url",     None);
        s.raw = v;
        s
    }
}

/// Unified margin mode per symbol.
#[derive(Debug, Clone, Default)]
pub struct MarginMode {
    pub symbol:      Option<String>,
    pub margin_mode: Option<String>,
    pub raw:         Value,
}

impl MarginMode {
    pub fn from_value(v: Value) -> Self {
        use crate::value::safe_string;
        let mut m = MarginMode::default();
        m.symbol      = safe_string(&v, "symbol", None);
        m.margin_mode = safe_string(&v, "marginMode", None);
        m.raw = v;
        m
    }
}

/// Unified leverage per symbol.
#[derive(Debug, Clone, Default)]
pub struct Leverage {
    pub symbol:        Option<String>,
    pub margin_mode:   Option<String>,
    pub long_leverage: Option<f64>,
    pub short_leverage: Option<f64>,
    pub raw:           Value,
}

impl Leverage {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number};
        let mut l = Leverage::default();
        l.symbol         = safe_string(&v, "symbol", None);
        l.margin_mode    = safe_string(&v, "marginMode", None);
        l.long_leverage  = safe_number(&v, "longLeverage", None);
        l.short_leverage = safe_number(&v, "shortLeverage", None);
        l.raw = v;
        l
    }
}

/// One bracket in a leverage-tier ladder.
#[derive(Debug, Clone, Default)]
pub struct LeverageTier {
    pub tier:           Option<f64>,
    pub symbol:         Option<String>,
    pub currency:       Option<String>,
    pub min_notional:   Option<f64>,
    pub max_notional:   Option<f64>,
    pub maintenance_margin_rate: Option<f64>,
    pub max_leverage:   Option<f64>,
    pub raw:            Value,
}

impl LeverageTier {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number};
        let mut t = LeverageTier::default();
        t.tier           = safe_number(&v, "tier", None);
        t.symbol         = safe_string(&v, "symbol", None);
        t.currency       = safe_string(&v, "currency", None);
        t.min_notional   = safe_number(&v, "minNotional", None);
        t.max_notional   = safe_number(&v, "maxNotional", None);
        t.maintenance_margin_rate = safe_number(&v, "maintenanceMarginRate", None);
        t.max_leverage   = safe_number(&v, "maxLeverage", None);
        t.raw = v;
        t
    }
}

/// Unified borrow / lending rate.
#[derive(Debug, Clone, Default)]
pub struct BorrowRate {
    pub currency:  Option<String>,
    pub rate:      Option<f64>,
    pub period:    Option<i64>,
    pub timestamp: Option<i64>,
    pub datetime:  Option<String>,
    pub raw:       Value,
}

impl BorrowRate {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut r = BorrowRate::default();
        r.currency  = safe_string(&v, "currency", None);
        r.rate      = safe_number(&v, "rate", None);
        r.period    = safe_integer(&v, "period", None);
        r.timestamp = safe_integer(&v, "timestamp", None);
        r.datetime  = safe_string(&v, "datetime", None);
        r.raw = v;
        r
    }
}

/// Unified borrow-interest record (margin interest accrued on a borrow).
/// Distinct from `BorrowRate` — it carries accrued interest and the borrowed
/// amount, not a periodic rate (review #7: `fetchBorrowInterest` was wrongly
/// mapped to `BorrowRate`).
#[derive(Debug, Clone, Default)]
pub struct BorrowInterest {
    pub symbol:          Option<String>,
    pub currency:        Option<String>,
    pub interest:        Option<f64>,
    pub interest_rate:   Option<f64>,
    pub amount_borrowed: Option<f64>,
    pub margin_mode:     Option<String>,
    pub timestamp:       Option<i64>,
    pub datetime:        Option<String>,
    pub raw:             Value,
}

impl BorrowInterest {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut r = BorrowInterest::default();
        r.symbol          = safe_string(&v, "symbol", None);
        r.currency        = safe_string(&v, "currency", None);
        r.interest        = safe_number(&v, "interest", None);
        r.interest_rate   = safe_number(&v, "interestRate", None);
        r.amount_borrowed = safe_number(&v, "amountBorrowed", None);
        r.margin_mode     = safe_string(&v, "marginMode", None);
        r.timestamp       = safe_integer(&v, "timestamp", None);
        r.datetime        = safe_string(&v, "datetime", None);
        r.raw = v;
        r
    }
}

/// Unified deposit address.
#[derive(Debug, Clone, Default)]
pub struct DepositAddress {
    pub currency: Option<String>,
    pub address:  Option<String>,
    pub tag:      Option<String>,
    pub network:  Option<String>,
    pub raw:      Value,
}

impl DepositAddress {
    pub fn from_value(v: Value) -> Self {
        use crate::value::safe_string;
        let mut d = DepositAddress::default();
        d.currency = safe_string(&v, "currency", None);
        d.address  = safe_string(&v, "address", None);
        d.tag      = safe_string(&v, "tag", None);
        d.network  = safe_string(&v, "network", None);
        d.raw = v;
        d
    }
}

/// Unified margin modification — the result of `addMargin` / `reduceMargin` /
/// `setMargin`, and each row of `fetchMarginAdjustmentHistory`. Mirrors the TS
/// `MarginModification` interface (`ts/src/base/types.ts`).
#[derive(Debug, Clone, Default)]
pub struct MarginModification {
    pub symbol:      Option<String>,
    pub mod_type:    Option<String>,   // "add" | "reduce" | "set"
    pub margin_mode: Option<String>,   // "cross" | "isolated"
    pub amount:      Option<f64>,
    pub total:       Option<f64>,
    pub code:        Option<String>,
    pub status:      Option<String>,
    pub timestamp:   Option<i64>,
    pub datetime:    Option<String>,
    pub raw:         Value,
}

impl MarginModification {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut m = MarginModification::default();
        m.symbol      = safe_string(&v, "symbol",     None);
        m.mod_type    = safe_string(&v, "type",       None);
        m.margin_mode = safe_string(&v, "marginMode", None);
        m.amount      = safe_number(&v, "amount",     None);
        m.total       = safe_number(&v, "total",      None);
        m.code        = safe_string(&v, "code",       None);
        m.status      = safe_string(&v, "status",     None);
        m.timestamp   = safe_integer(&v, "timestamp", None);
        m.datetime    = safe_string(&v, "datetime",   None);
        m.raw = v;
        m
    }
}

/// Unified margin borrow/repay receipt returned by `borrowCrossMargin`,
/// `borrowIsolatedMargin`, `repayCrossMargin` and `repayIsolatedMargin`.
/// Mirrors the TS `MarginLoan` interface (`ts/src/base/types.ts`): every
/// venue's `parseMarginLoan` emits exactly `id`/`currency`/`amount`/`symbol`/
/// `timestamp`/`datetime` (+ `info`).
#[derive(Debug, Clone, Default)]
pub struct MarginLoan {
    pub id:        Option<String>,
    pub currency:  Option<String>,
    pub amount:    Option<f64>,
    pub symbol:    Option<String>,
    pub timestamp: Option<i64>,
    pub datetime:  Option<String>,
    pub raw:       Value,
}

impl MarginLoan {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut m = MarginLoan::default();
        m.id        = safe_string(&v, "id",        None);
        m.currency  = safe_string(&v, "currency",  None);
        m.amount    = safe_number(&v, "amount",    None);
        m.symbol    = safe_string(&v, "symbol",    None);
        m.timestamp = safe_integer(&v, "timestamp", None);
        m.datetime  = safe_string(&v, "datetime",  None);
        m.raw = v;
        m
    }
}

/// Unified currency-conversion record (`fetchConvertQuote`, `createConvertTrade`,
/// `fetchConvertTrade`, and each row of `fetchConvertTradeHistory`). Mirrors the
/// TS `Conversion` interface.
#[derive(Debug, Clone, Default)]
pub struct Conversion {
    pub id:            Option<String>,
    pub timestamp:     Option<i64>,
    pub datetime:      Option<String>,
    pub from_currency: Option<String>,
    pub from_amount:   Option<f64>,
    pub to_currency:   Option<String>,
    pub to_amount:     Option<f64>,
    pub price:         Option<f64>,
    pub fee:           Option<f64>,
    pub raw:           Value,
}

impl Conversion {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut c = Conversion::default();
        c.id            = safe_string(&v, "id",           None);
        c.timestamp     = safe_integer(&v, "timestamp",   None);
        c.datetime      = safe_string(&v, "datetime",     None);
        c.from_currency = safe_string(&v, "fromCurrency", None);
        c.from_amount   = safe_number(&v, "fromAmount",   None);
        c.to_currency   = safe_string(&v, "toCurrency",   None);
        c.to_amount     = safe_number(&v, "toAmount",     None);
        c.price         = safe_number(&v, "price",        None);
        c.fee           = safe_number(&v, "fee",          None);
        c.raw = v;
        c
    }
}

/// Unified auto-deleveraging rank (`fetchADLRank`, `fetchPositionADLRank`,
/// and each row of `fetchPositionsADLRank`). Mirrors the TS `ADL` interface.
#[derive(Debug, Clone, Default)]
pub struct ADL {
    pub symbol:     Option<String>,
    pub rank:       Option<i64>,
    pub rating:     Option<String>,
    pub percentage: Option<f64>,
    pub timestamp:  Option<i64>,
    pub datetime:   Option<String>,
    pub raw:        Value,
}

impl ADL {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut a = ADL::default();
        a.symbol     = safe_string(&v, "symbol",     None);
        a.rank       = safe_integer(&v, "rank",      None);
        a.rating     = safe_string(&v, "rating",     None);
        a.percentage = safe_number(&v, "percentage", None);
        a.timestamp  = safe_integer(&v, "timestamp", None);
        a.datetime   = safe_string(&v, "datetime",   None);
        a.raw = v;
        a
    }
}

/// Unified long/short ratio (`fetchLongShortRatio`, and each row of
/// `fetchLongShortRatioHistory`). Mirrors the TS `LongShortRatio` interface.
#[derive(Debug, Clone, Default)]
pub struct LongShortRatio {
    pub symbol:           Option<String>,
    pub timestamp:        Option<i64>,
    pub datetime:         Option<String>,
    pub timeframe:        Option<String>,
    pub long_short_ratio: Option<f64>,
    pub raw:              Value,
}

impl LongShortRatio {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut r = LongShortRatio::default();
        r.symbol           = safe_string(&v, "symbol",         None);
        r.timestamp        = safe_integer(&v, "timestamp",     None);
        r.datetime         = safe_string(&v, "datetime",       None);
        r.timeframe        = safe_string(&v, "timeframe",      None);
        r.long_short_ratio = safe_number(&v, "longShortRatio", None);
        r.raw = v;
        r
    }
}

/// One historical funding-rate sample (each row of `fetchFundingRateHistory`).
/// Mirrors the TS `FundingRateHistory` interface. Distinct from
/// [`FundingRate`], which is the live snapshot with next/previous rates.
#[derive(Debug, Clone, Default)]
pub struct FundingRateHistory {
    pub symbol:       Option<String>,
    pub funding_rate: Option<f64>,
    pub timestamp:    Option<i64>,
    pub datetime:     Option<String>,
    pub raw:          Value,
}

impl FundingRateHistory {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut f = FundingRateHistory::default();
        f.symbol       = safe_string(&v, "symbol",      None);
        f.funding_rate = safe_number(&v, "fundingRate", None);
        f.timestamp    = safe_integer(&v, "timestamp",  None);
        f.datetime     = safe_string(&v, "datetime",    None);
        f.raw = v;
        f
    }
}

/// One funding payment made or received (each row of `fetchFundingHistory`).
/// Mirrors the TS `FundingHistory` interface.
#[derive(Debug, Clone, Default)]
pub struct FundingHistory {
    pub id:        Option<String>,
    pub symbol:    Option<String>,
    pub code:      Option<String>,
    pub timestamp: Option<i64>,
    pub datetime:  Option<String>,
    pub amount:    Option<f64>,
    pub raw:       Value,
}

impl FundingHistory {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut f = FundingHistory::default();
        f.id        = safe_string(&v, "id",         None);
        f.symbol    = safe_string(&v, "symbol",     None);
        f.code      = safe_string(&v, "code",       None);
        f.timestamp = safe_integer(&v, "timestamp", None);
        f.datetime  = safe_string(&v, "datetime",   None);
        f.amount    = safe_number(&v, "amount",     None);
        f.raw = v;
        f
    }
}

/// One sub-account / wallet entry (each row of `fetchAccounts`). Mirrors the
/// TS `Account` interface.
#[derive(Debug, Clone, Default)]
pub struct Account {
    pub id:           Option<String>,
    pub account_type: Option<String>,
    pub code:         Option<String>,
    pub raw:          Value,
}

impl Account {
    pub fn from_value(v: Value) -> Self {
        use crate::value::safe_string;
        let mut a = Account::default();
        a.id           = safe_string(&v, "id",   None);
        a.account_type = safe_string(&v, "type", None);
        a.code         = safe_string(&v, "code", None);
        a.raw = v;
        a
    }
}

/// Position-mode flag (`fetchPositionMode`). Mirrors the TS `PositionModeInfo`
/// interface: `hedged` is `true` for hedge (dual-side) mode, `false` for one-way.
#[derive(Debug, Clone, Default)]
pub struct PositionModeInfo {
    pub hedged: Option<bool>,
    pub raw:    Value,
}

impl PositionModeInfo {
    pub fn from_value(v: Value) -> Self {
        use crate::value::safe_bool;
        let mut p = PositionModeInfo::default();
        p.hedged = safe_bool(&v, "hedged", None);
        p.raw = v;
        p
    }
}

/// Unified option-contract snapshot (`fetchOption`, and each value of
/// `fetchOptionChain`). Named `OptionContract` because `Option` collides with
/// `core::option::Option`. Mirrors the TS `Option` interface.
#[derive(Debug, Clone, Default)]
pub struct OptionContract {
    pub currency:           Option<String>,
    pub symbol:             Option<String>,
    pub timestamp:          Option<i64>,
    pub datetime:           Option<String>,
    pub implied_volatility: Option<f64>,
    pub open_interest:      Option<f64>,
    pub bid_price:          Option<f64>,
    pub ask_price:          Option<f64>,
    pub mid_price:          Option<f64>,
    pub mark_price:         Option<f64>,
    pub last_price:         Option<f64>,
    pub underlying_price:   Option<f64>,
    pub change:             Option<f64>,
    pub percentage:         Option<f64>,
    pub base_volume:        Option<f64>,
    pub quote_volume:       Option<f64>,
    pub raw:                Value,
}

impl OptionContract {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut o = OptionContract::default();
        o.currency           = safe_string(&v, "currency",          None);
        o.symbol             = safe_string(&v, "symbol",            None);
        o.timestamp          = safe_integer(&v, "timestamp",        None);
        o.datetime           = safe_string(&v, "datetime",          None);
        o.implied_volatility = safe_number(&v, "impliedVolatility", None);
        o.open_interest      = safe_number(&v, "openInterest",      None);
        o.bid_price          = safe_number(&v, "bidPrice",          None);
        o.ask_price          = safe_number(&v, "askPrice",          None);
        o.mid_price          = safe_number(&v, "midPrice",          None);
        o.mark_price         = safe_number(&v, "markPrice",         None);
        o.last_price         = safe_number(&v, "lastPrice",         None);
        o.underlying_price   = safe_number(&v, "underlyingPrice",   None);
        o.change             = safe_number(&v, "change",            None);
        o.percentage         = safe_number(&v, "percentage",        None);
        o.base_volume        = safe_number(&v, "baseVolume",        None);
        o.quote_volume       = safe_number(&v, "quoteVolume",       None);
        o.raw = v;
        o
    }
}

/// Last traded price per symbol (each value of `fetchLastPrices`). Mirrors the
/// TS `LastPrice` interface.
#[derive(Debug, Clone, Default)]
pub struct LastPrice {
    pub symbol:    Option<String>,
    pub timestamp: Option<i64>,
    pub datetime:  Option<String>,
    pub price:     Option<f64>,
    pub side:      Option<String>,   // "buy" | "sell"
    pub raw:       Value,
}

impl LastPrice {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut p = LastPrice::default();
        p.symbol    = safe_string(&v, "symbol",    None);
        p.timestamp = safe_integer(&v, "timestamp", None);
        p.datetime  = safe_string(&v, "datetime",  None);
        p.price     = safe_number(&v, "price",     None);
        p.side      = safe_string(&v, "side",      None);
        p.raw = v;
        p
    }
}

/// Unified isolated-margin borrow rate — one entry per symbol with a rate for
/// each leg (`fetchIsolatedBorrowRate`, and each value of
/// `fetchIsolatedBorrowRates`). Mirrors the TS `IsolatedBorrowRate` interface.
/// Distinct from [`BorrowRate`] (cross-margin, single `currency`/`rate`), whose
/// decoder would leave every field of an isolated rate `None`.
#[derive(Debug, Clone, Default)]
pub struct IsolatedBorrowRate {
    pub symbol:     Option<String>,
    pub base:       Option<String>,
    pub base_rate:  Option<f64>,
    pub quote:      Option<String>,
    pub quote_rate: Option<f64>,
    pub period:     Option<i64>,
    pub timestamp:  Option<i64>,
    pub datetime:   Option<String>,
    pub raw:        Value,
}

impl IsolatedBorrowRate {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut r = IsolatedBorrowRate::default();
        r.symbol     = safe_string(&v, "symbol",    None);
        r.base       = safe_string(&v, "base",      None);
        r.base_rate  = safe_number(&v, "baseRate",  None);
        r.quote      = safe_string(&v, "quote",     None);
        r.quote_rate = safe_number(&v, "quoteRate", None);
        r.period     = safe_integer(&v, "period",   None);
        r.timestamp  = safe_integer(&v, "timestamp", None);
        r.datetime   = safe_string(&v, "datetime",  None);
        r.raw = v;
        r
    }
}

/// One leg of a [`DepositWithdrawFee`] — the fee for a deposit or a withdrawal,
/// and whether it is a percentage of the amount (vs. a flat fee). Mirrors the
/// TS `DepositWithdrawFeeNetwork` interface.
#[derive(Debug, Clone, Copy, Default, PartialEq)]
pub struct DepositWithdrawFeeLeg {
    pub fee:        Option<f64>,
    pub percentage: Option<bool>,
}

impl DepositWithdrawFeeLeg {
    fn from_value(v: &Value) -> Self {
        use crate::value::{safe_number, safe_bool};
        DepositWithdrawFeeLeg { fee: safe_number(v, "fee", None), percentage: safe_bool(v, "percentage", None) }
    }
}

/// Unified deposit/withdraw fee for one currency (`fetchDepositWithdrawFee`,
/// and each value of `fetchDepositWithdrawFees`). Mirrors the TS
/// `DepositWithdrawFee` interface: a currency-level `withdraw`/`deposit` pair
/// plus the same pair per network under `networks`.
#[derive(Debug, Clone, Default)]
pub struct DepositWithdrawFee {
    pub withdraw: DepositWithdrawFeeLeg,
    pub deposit:  DepositWithdrawFeeLeg,
    pub networks: HashMap<String, DepositWithdrawFeeNetwork>,
    pub raw:      Value,
}

/// Per-network `withdraw`/`deposit` legs inside [`DepositWithdrawFee::networks`].
#[derive(Debug, Clone, Copy, Default, PartialEq)]
pub struct DepositWithdrawFeeNetwork {
    pub withdraw: DepositWithdrawFeeLeg,
    pub deposit:  DepositWithdrawFeeLeg,
}

impl DepositWithdrawFee {
    pub fn from_value(v: Value) -> Self {
        let sub = |parent: &Value, key: &str| crate::value::get_value(parent, &Value::Str(key.to_string()));
        let mut d = DepositWithdrawFee::default();
        d.withdraw = DepositWithdrawFeeLeg::from_value(&sub(&v, "withdraw"));
        d.deposit  = DepositWithdrawFeeLeg::from_value(&sub(&v, "deposit"));
        if let Value::Dict(networks) = sub(&v, "networks") {
            for (id, net) in networks.iter() {
                d.networks.insert(id.clone(), DepositWithdrawFeeNetwork {
                    withdraw: DepositWithdrawFeeLeg::from_value(&sub(net, "withdraw")),
                    deposit:  DepositWithdrawFeeLeg::from_value(&sub(net, "deposit")),
                });
            }
        }
        d.raw = v;
        d
    }
}

// -----------------------------------------------------------------------------
// Collection aliases (mirror the plural names used in Go's exchange_types.go)
// -----------------------------------------------------------------------------

pub type Markets       = HashMap<String, Market>;
pub type Currencies    = HashMap<String, Currency>;
pub type Tickers       = HashMap<String, Ticker>;
pub type OrderBooks    = HashMap<String, OrderBook>;
pub type FundingRates  = HashMap<String, FundingRate>;
pub type OpenInterests = HashMap<String, OpenInterest>;
pub type Leverages     = HashMap<String, Leverage>;
pub type MarginModes   = HashMap<String, MarginMode>;
pub type TradingFees   = HashMap<String, TradingFee>;
/// `fetchCrossBorrowRates` — currency code → [`BorrowRate`].
pub type CrossBorrowRates    = HashMap<String, BorrowRate>;
/// `fetchIsolatedBorrowRates` — symbol → [`IsolatedBorrowRate`].
pub type IsolatedBorrowRates = HashMap<String, IsolatedBorrowRate>;
/// `fetchLastPrices` — symbol → [`LastPrice`].
pub type LastPrices          = HashMap<String, LastPrice>;
/// `fetchOptionChain` — symbol → [`OptionContract`].
pub type OptionChain         = HashMap<String, OptionContract>;
/// `fetchLeverageTiers` — symbol → its ladder of [`LeverageTier`]s.
pub type LeverageTiers       = HashMap<String, Vec<LeverageTier>>;
/// `fetchDepositWithdrawFees` — currency code → [`DepositWithdrawFee`].
pub type DepositWithdrawFees = HashMap<String, DepositWithdrawFee>;
/// `fetchAllGreeks` — symbol → [`Greeks`].
pub type AllGreeks           = HashMap<String, Greeks>;
/// `fetchDepositAddresses` — currency code → [`DepositAddress`].
pub type DepositAddresses    = HashMap<String, DepositAddress>;

/// Walk a `Value::Dict` of `<key> → Value` and decode each value with
/// the supplied `from_value` constructor. Returns an empty map on a
/// non-dict input — matches the lenient fallback semantics of the
/// individual `from_value` impls.
pub fn dict_from_value<T>(v: &Value, decode: fn(Value) -> T) -> HashMap<String, T> {
    match v {
        Value::Dict(d) => d.iter()
            .map(|(k, val)| (k.clone(), decode(val.clone())))
            .collect(),
        _ => HashMap::new(),
    }
}

/// Walk a `Value::Arr` and decode each element with the supplied
/// `from_value` constructor.
pub fn vec_from_value<T>(v: &Value, decode: fn(Value) -> T) -> Vec<T> {
    match v {
        Value::Arr(rows) => rows.iter().map(|row| decode(row.clone())).collect(),
        _ => Vec::new(),
    }
}

#[cfg(test)]
mod from_value_tests {
    use super::{Market, Order, OrderBook, MarginModification, Conversion, IsolatedBorrowRate, BorrowRate, PositionModeInfo, LastPrice, LeverageTier, DepositWithdrawFee, MarginLoan, Ticker, Trade, Position, Transaction, LedgerEntry, FundingRate, TradingFee, OpenInterest, Liquidation, Greeks};
    use crate::Value;
    use crate::value::HashMap;

    fn dict(pairs: &[(&str, Value)]) -> Value {
        let mut m = HashMap::new();
        for (k, v) in pairs { m.insert(k.to_string(), v.clone()); }
        Value::Map(m)
    }

    // Malformed order-book rows (non-array, too short, unparseable) must be
    // dropped, not emitted as [NaN, NaN] (review #7).
    #[test]
    fn order_book_drops_malformed_rows() {
        let row = |a: Value, b: Value| Value::Array(vec![a, b]);
        let bids = Value::Array(vec![
            row(Value::Str("100.5".into()), Value::Str("2".into())), // ok
            Value::Array(vec![Value::Str("bad".into()), Value::Int(1)]), // NaN price → drop
            Value::Array(vec![Value::Int(99)]),                          // missing amount → drop
            Value::Str("notarow".into()),                               // not an array → drop
            row(Value::Int(99), Value::Float(3.0)),                     // ok
        ]);
        let ob = OrderBook::from_value(dict(&[("bids", bids)]));
        assert_eq!(ob.bids.len(), 2, "malformed rows were not dropped: {:?}", ob.bids);
        assert_eq!(ob.bids[0], [100.5, 2.0]);
        assert_eq!(ob.bids[1], [99.0, 3.0]);
        assert!(ob.bids.iter().all(|r| !r[0].is_nan() && !r[1].is_nan()));
    }

    #[test]
    fn market_assigns_declared_fields() {
        let v = dict(&[
            ("id", Value::Str("BTCUSDT".into())), ("symbol", Value::Str("BTC/USDT:USDT".into())),
            ("settle", Value::Str("USDT".into())), ("baseId", Value::Str("BTC".into())),
            ("quoteId", Value::Str("USDT".into())), ("margin", Value::Bool(true)),
            ("contract", Value::Bool(true)), ("linear", Value::Bool(true)), ("inverse", Value::Bool(false)),
        ]);
        let m = Market::from_value(v);
        assert_eq!(m.settle.as_deref(), Some("USDT"));
        assert_eq!(m.base_id, "BTC");
        assert_eq!(m.quote_id, "USDT");
        assert!(m.margin && m.contract);
        assert_eq!(m.linear, Some(true));
        assert_eq!(m.inverse, Some(false));
    }

    #[test]
    fn order_assigns_fee() {
        let v = dict(&[
            ("id", Value::Str("1".into())),
            ("fee", dict(&[("currency", Value::Str("USDT".into())), ("cost", Value::Float(0.1))])),
        ]);
        let o = Order::from_value(v);
        let fee = o.fee.expect("fee should be assigned");
        assert_eq!(fee.get("currency"), Some(&Value::Str("USDT".into())));
    }

    // The unified structs added for the typed-wrapper coverage push must
    // actually read the camelCase keys the TS parsers emit — a decoder that
    // reads the wrong key compiles green and silently yields all-`None`.
    #[test]
    fn margin_modification_reads_unified_keys() {
        let v = dict(&[
            ("symbol", Value::Str("BTC/USDT:USDT".into())),
            ("type", Value::Str("add".into())),
            ("marginMode", Value::Str("isolated".into())),
            ("amount", Value::Float(0.001)),
            ("code", Value::Str("USDT".into())),
            ("status", Value::Str("ok".into())),
            ("timestamp", Value::Int(1_700_000_000_000)),
        ]);
        let m = MarginModification::from_value(v);
        assert_eq!(m.symbol.as_deref(), Some("BTC/USDT:USDT"));
        assert_eq!(m.mod_type.as_deref(), Some("add"));
        assert_eq!(m.margin_mode.as_deref(), Some("isolated"));
        assert_eq!(m.amount, Some(0.001));
        assert_eq!(m.code.as_deref(), Some("USDT"));
        assert_eq!(m.status.as_deref(), Some("ok"));
        assert_eq!(m.timestamp, Some(1_700_000_000_000));
        assert_eq!(m.total, None);
    }

    #[test]
    fn conversion_reads_unified_keys() {
        let v = dict(&[
            ("id", Value::Str("q1".into())),
            ("fromCurrency", Value::Str("BTC".into())),
            ("fromAmount", Value::Str("0.5".into())),
            ("toCurrency", Value::Str("USDT".into())),
            ("toAmount", Value::Float(20000.0)),
            ("price", Value::Int(40000)),
        ]);
        let c = Conversion::from_value(v);
        assert_eq!(c.id.as_deref(), Some("q1"));
        assert_eq!(c.from_currency.as_deref(), Some("BTC"));
        assert_eq!(c.from_amount, Some(0.5));
        assert_eq!(c.to_currency.as_deref(), Some("USDT"));
        assert_eq!(c.to_amount, Some(20000.0));
        assert_eq!(c.price, Some(40000.0));
        assert_eq!(c.fee, None);
    }

    #[test]
    fn isolated_borrow_rate_is_not_the_cross_shape() {
        let v = dict(&[
            ("symbol", Value::Str("BTC/USDT".into())),
            ("base", Value::Str("BTC".into())),
            ("baseRate", Value::Float(0.0001)),
            ("quote", Value::Str("USDT".into())),
            ("quoteRate", Value::Float(0.0002)),
        ]);
        let r = IsolatedBorrowRate::from_value(v.clone());
        assert_eq!(r.symbol.as_deref(), Some("BTC/USDT"));
        assert_eq!(r.base_rate, Some(0.0001));
        assert_eq!(r.quote_rate, Some(0.0002));
        // The previous mapping (`IsolatedBorrowRate` → `BorrowRate`) lost every field.
        let wrong = BorrowRate::from_value(v);
        assert_eq!(wrong.currency, None);
        assert_eq!(wrong.rate, None);
    }

    #[test]
    fn leverage_tiers_map_of_vec_and_deposit_withdraw_fee_nesting() {
        let tier = |n: f64| dict(&[("tier", Value::Float(n)), ("maxLeverage", Value::Int(20))]);
        let tiers = dict(&[("BTC/USDT:USDT", Value::Array(vec![tier(1.0), tier(2.0)]))]);
        let decoded = super::dict_from_value(&tiers, |row| super::vec_from_value(&row, LeverageTier::from_value));
        assert_eq!(decoded["BTC/USDT:USDT"].len(), 2);
        assert_eq!(decoded["BTC/USDT:USDT"][1].tier, Some(2.0));
        assert_eq!(decoded["BTC/USDT:USDT"][1].max_leverage, Some(20.0));
        let fee = DepositWithdrawFee::from_value(dict(&[
            ("withdraw", dict(&[("fee", Value::Float(0.0005)), ("percentage", Value::Bool(false))])),
            ("deposit", dict(&[("fee", Value::Null), ("percentage", Value::Null)])),
            ("networks", dict(&[("BTC", dict(&[
                ("withdraw", dict(&[("fee", Value::Str("0.0004".into())), ("percentage", Value::Bool(false))])),
                ("deposit", dict(&[("fee", Value::Int(0)), ("percentage", Value::Null)])),
            ]))])),
        ]));
        assert_eq!(fee.withdraw.fee, Some(0.0005));
        assert_eq!(fee.withdraw.percentage, Some(false));
        assert_eq!(fee.deposit.fee, None);
        assert_eq!(fee.networks["BTC"].withdraw.fee, Some(0.0004));
        assert_eq!(fee.networks["BTC"].deposit.fee, Some(0.0));
    }

    #[test]
    fn position_mode_and_last_price_read_unified_keys() {
        let p = PositionModeInfo::from_value(dict(&[("hedged", Value::Bool(true))]));
        assert_eq!(p.hedged, Some(true));
        let lp = LastPrice::from_value(dict(&[
            ("symbol", Value::Str("ETH/USDT".into())),
            ("price", Value::Str("3000.5".into())),
            ("side", Value::Str("buy".into())),
        ]));
        assert_eq!(lp.symbol.as_deref(), Some("ETH/USDT"));
        assert_eq!(lp.price, Some(3000.5));
        assert_eq!(lp.side.as_deref(), Some("buy"));
    }

    // Mirrors binance `parseMarginLoan`: `id` from `tranId`, `currency` from the
    // unified code, `symbol` undefined for cross margin. A decoder keyed on the
    // raw exchange fields (`tranId`/`asset`) would silently read all-`None`.
    #[test]
    fn margin_loan_reads_unified_keys() {
        let m = MarginLoan::from_value(dict(&[
            ("id", Value::Str("108988250265".into())),
            ("currency", Value::Str("USDC".into())),
            ("amount", Value::Int(10)),
            ("symbol", Value::Null),
            ("timestamp", Value::Int(1_727_170_761_267)),
            ("datetime", Value::Str("2024-09-24T09:39:21.267Z".into())),
            ("info", dict(&[("tranId", Value::Int(108988250265)), ("asset", Value::Str("USDC".into()))])),
        ]));
        assert_eq!(m.id.as_deref(), Some("108988250265"));
        assert_eq!(m.currency.as_deref(), Some("USDC"));
        assert_eq!(m.amount, Some(10.0));
        assert_eq!(m.symbol, None);
        assert_eq!(m.timestamp, Some(1_727_170_761_267));
        assert_eq!(m.datetime.as_deref(), Some("2024-09-24T09:39:21.267Z"));
        assert!(matches!(m.raw, Value::Dict(_)));
    }

    // The core structs were narrower than their TS interfaces (Ticker lacked
    // `open`/`close`/`percentage`…, Trade lacked `fee`/`order`/`takerOrMaker`,
    // Position lacked `marginMode`/`liquidationPrice`…). Pin the widened
    // decoders to the unified camelCase keys the TS parsers emit.
    #[test]
    fn widened_core_structs_read_unified_keys() {
        let fee = dict(&[("currency", Value::Str("USDT".into())), ("cost", Value::Float(0.12)), ("rate", Value::Float(0.001))]);
        let t = Ticker::from_value(dict(&[
            ("symbol", Value::Str("BTC/USDT".into())),
            ("open", Value::Float(100.0)), ("close", Value::Float(110.0)),
            ("bidVolume", Value::Int(3)), ("askVolume", Value::Str("4.5".into())),
            ("vwap", Value::Float(105.0)), ("previousClose", Value::Float(99.0)),
            ("change", Value::Float(10.0)), ("percentage", Value::Float(10.0)),
            ("average", Value::Float(105.0)), ("indexPrice", Value::Float(109.0)), ("markPrice", Value::Float(109.5)),
        ]));
        assert_eq!(t.open, Some(100.0));
        assert_eq!(t.close, Some(110.0));
        assert_eq!(t.bid_volume, Some(3.0));
        assert_eq!(t.ask_volume, Some(4.5));
        assert_eq!(t.vwap, Some(105.0));
        assert_eq!(t.previous_close, Some(99.0));
        assert_eq!(t.change, Some(10.0));
        assert_eq!(t.percentage, Some(10.0));
        assert_eq!(t.average, Some(105.0));
        assert_eq!(t.index_price, Some(109.0));
        assert_eq!(t.mark_price, Some(109.5));

        let tr = Trade::from_value(dict(&[
            ("id", Value::Str("t1".into())), ("order", Value::Str("o1".into())),
            ("type", Value::Str("limit".into())), ("takerOrMaker", Value::Str("maker".into())),
            ("fee", fee.clone()),
        ]));
        assert_eq!(tr.order.as_deref(), Some("o1"));
        assert_eq!(tr.trade_type.as_deref(), Some("limit"));
        assert_eq!(tr.taker_or_maker.as_deref(), Some("maker"));
        assert_eq!(tr.fee.as_ref().and_then(|f| f.cost), Some(0.12));
        assert_eq!(tr.fee.as_ref().and_then(|f| f.currency.clone()).as_deref(), Some("USDT"));

        let o = Order::from_value(dict(&[
            ("id", Value::Str("o1".into())),
            ("timeInForce", Value::Str("GTC".into())),
            ("postOnly", Value::Bool(true)), ("reduceOnly", Value::Bool(false)),
            ("average", Value::Float(101.0)), ("triggerPrice", Value::Float(95.0)),
            ("stopLossPrice", Value::Float(90.0)), ("takeProfitPrice", Value::Float(120.0)),
            ("lastTradeTimestamp", Value::Int(1_700_000_000_001)),
            ("lastUpdateTimestamp", Value::Int(1_700_000_000_002)),
            ("trades", Value::Arr(std::sync::Arc::new(vec![dict(&[("id", Value::Str("t1".into())), ("amount", Value::Float(0.5))])]))),
        ]));
        assert_eq!(o.time_in_force.as_deref(), Some("GTC"));
        assert_eq!(o.post_only, Some(true));
        assert_eq!(o.reduce_only, Some(false));
        assert_eq!(o.average, Some(101.0));
        assert_eq!(o.trigger_price, Some(95.0));
        assert_eq!(o.stop_loss_price, Some(90.0));
        assert_eq!(o.take_profit_price, Some(120.0));
        assert_eq!(o.last_trade_timestamp, Some(1_700_000_000_001));
        assert_eq!(o.last_update_timestamp, Some(1_700_000_000_002));
        assert_eq!(o.trades.len(), 1);
        assert_eq!(o.trades[0].id.as_deref(), Some("t1"));
        assert_eq!(o.trades[0].amount, Some(0.5));
        // A missing `trades` key decodes to an empty Vec, not a panic.
        assert!(Order::from_value(dict(&[])).trades.is_empty());

        let p = Position::from_value(dict(&[
            ("symbol", Value::Str("BTC/USDT:USDT".into())),
            ("marginMode", Value::Str("cross".into())), ("hedged", Value::Bool(false)),
            ("liquidationPrice", Value::Float(50000.0)), ("notional", Value::Float(1000.0)),
            ("collateral", Value::Float(100.0)), ("realizedPnl", Value::Float(1.5)),
            ("maintenanceMargin", Value::Float(5.0)), ("initialMargin", Value::Float(50.0)),
            ("marginRatio", Value::Float(0.05)), ("percentage", Value::Float(1.2)),
            ("lastUpdateTimestamp", Value::Int(1_700_000_000_003)),
        ]));
        assert_eq!(p.margin_mode.as_deref(), Some("cross"));
        assert_eq!(p.margin_type, None);
        assert_eq!(p.hedged, Some(false));
        assert_eq!(p.liquidation_price, Some(50000.0));
        assert_eq!(p.notional, Some(1000.0));
        assert_eq!(p.collateral, Some(100.0));
        assert_eq!(p.realized_pnl, Some(1.5));
        assert_eq!(p.maintenance_margin, Some(5.0));
        assert_eq!(p.initial_margin, Some(50.0));
        assert_eq!(p.margin_ratio, Some(0.05));
        assert_eq!(p.percentage, Some(1.2));
        assert_eq!(p.last_update_timestamp, Some(1_700_000_000_003));

        let tx = Transaction::from_value(dict(&[
            ("type", Value::Str("withdrawal".into())), ("network", Value::Str("TRC20".into())),
            ("tag", Value::Str("memo".into())), ("addressTo", Value::Str("Txyz".into())),
            ("updated", Value::Int(1_700_000_000_004)), ("internal", Value::Bool(true)),
            ("comment", Value::Str("c".into())), ("fee", fee.clone()),
        ]));
        assert_eq!(tx.tx_type.as_deref(), Some("withdrawal"));
        assert_eq!(tx.network.as_deref(), Some("TRC20"));
        assert_eq!(tx.tag.as_deref(), Some("memo"));
        assert_eq!(tx.address_to.as_deref(), Some("Txyz"));
        assert_eq!(tx.updated, Some(1_700_000_000_004));
        assert_eq!(tx.internal, Some(true));
        assert_eq!(tx.comment.as_deref(), Some("c"));
        assert_eq!(tx.fee.as_ref().and_then(|f| f.rate), Some(0.001));

        let le = LedgerEntry::from_value(dict(&[
            ("type", Value::Str("trade".into())), ("referenceId", Value::Str("r1".into())),
            ("before", Value::Float(10.0)), ("after", Value::Float(9.5)), ("status", Value::Str("ok".into())),
            ("fee", fee),
        ]));
        assert_eq!(le.entry_type.as_deref(), Some("trade"));
        assert_eq!(le.reference_id.as_deref(), Some("r1"));
        assert_eq!(le.before, Some(10.0));
        assert_eq!(le.after, Some(9.5));
        assert_eq!(le.status.as_deref(), Some("ok"));
        assert!(le.fee.is_some());

        let fr = FundingRate::from_value(dict(&[
            ("fundingRate", Value::Float(0.0001)), ("markPrice", Value::Float(1.0)),
            ("nextFundingTimestamp", Value::Int(1_700_000_000_005)), ("interval", Value::Str("8h".into())),
            ("previousFundingRate", Value::Float(0.00005)),
        ]));
        assert_eq!(fr.mark_price, Some(1.0));
        assert_eq!(fr.next_funding_timestamp, Some(1_700_000_000_005));
        assert_eq!(fr.interval.as_deref(), Some("8h"));
        assert_eq!(fr.previous_funding_rate, Some(0.00005));

        let tf = TradingFee::from_value(dict(&[("maker", Value::Float(0.001)), ("percentage", Value::Bool(true)), ("tierBased", Value::Bool(false))]));
        assert_eq!(tf.percentage, Some(true));
        assert_eq!(tf.tier_based, Some(false));

        let oi = OpenInterest::from_value(dict(&[("baseVolume", Value::Float(12.0)), ("quoteVolume", Value::Float(1200.0))]));
        assert_eq!(oi.base_volume, Some(12.0));
        assert_eq!(oi.quote_volume, Some(1200.0));

        let lq = Liquidation::from_value(dict(&[("contracts", Value::Float(2.0)), ("contractSize", Value::Float(0.01)), ("side", Value::Str("sell".into()))]));
        assert_eq!(lq.contracts, Some(2.0));
        assert_eq!(lq.contract_size, Some(0.01));
        assert_eq!(lq.side.as_deref(), Some("sell"));

        let g = Greeks::from_value(dict(&[("bidImpliedVolatility", Value::Float(0.6)), ("underlyingPrice", Value::Float(60000.0)), ("charm", Value::Float(-0.01))]));
        assert_eq!(g.bid_implied_volatility, Some(0.6));
        assert_eq!(g.underlying_price, Some(60000.0));
        assert_eq!(g.charm, Some(-0.01));

        assert_eq!(LeverageTier::from_value(dict(&[("symbol", Value::Str("ETH/USDT:USDT".into()))])).symbol.as_deref(), Some("ETH/USDT:USDT"));
    }
}
