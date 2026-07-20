// Native Rust – hand-written domain types.
//
// These mirror the unified structures in wiki/Manual.md.
// Exchange code accesses fields via `Value` maps at runtime; these structs
// are used for the typed wrapper layer (analogous to Go's typed wrappers).

use indexmap::IndexMap as HashMap;
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

impl Transaction {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut t = Transaction::default();
        t.id        = safe_string(&v, "id",        None);
        t.txid      = safe_string(&v, "txid",      None);
        t.timestamp = safe_integer(&v, "timestamp", None);
        t.datetime  = safe_string(&v, "datetime",  None);
        t.address   = safe_string(&v, "address",   None);
        t.amount    = safe_number(&v, "amount",    None);
        t.currency  = safe_string(&v, "currency",  None);
        t.status    = safe_string(&v, "status",    None);
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

impl Position {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number};
        let mut p = Position::default();
        p.symbol         = safe_string(&v, "symbol", None).unwrap_or_default();
        p.side           = safe_string(&v, "side",   None);
        p.contracts      = safe_number(&v, "contracts",    None);
        p.contract_size  = safe_number(&v, "contractSize", None);
        p.entry_price    = safe_number(&v, "entryPrice",   None);
        p.mark_price     = safe_number(&v, "markPrice",    None);
        p.unrealized_pnl = safe_number(&v, "unrealizedPnl", None);
        p.leverage       = safe_number(&v, "leverage",     None);
        p.margin_type    = safe_string(&v, "marginType",   None);
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

impl LedgerEntry {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut l = LedgerEntry::default();
        l.id        = safe_string(&v, "id",        None);
        l.timestamp = safe_integer(&v, "timestamp", None);
        l.datetime  = safe_string(&v, "datetime",  None);
        l.direction = safe_string(&v, "direction", None);
        l.account   = safe_string(&v, "account",   None);
        l.amount    = safe_number(&v, "amount",    None);
        l.currency  = safe_string(&v, "currency",  None);
        l.raw = v;
        l
    }
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

impl FundingRate {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number, safe_integer};
        let mut f = FundingRate::default();
        f.symbol       = safe_string(&v, "symbol", None).unwrap_or_default();
        f.funding_rate = safe_number(&v, "fundingRate", None);
        f.timestamp    = safe_integer(&v, "timestamp", None);
        f.datetime     = safe_string(&v, "datetime", None);
        f.raw = v;
        f
    }
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

impl Greeks {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number};
        let mut g = Greeks::default();
        g.symbol = safe_string(&v, "symbol", None).unwrap_or_default();
        g.delta  = safe_number(&v, "delta", None);
        g.gamma  = safe_number(&v, "gamma", None);
        g.theta  = safe_number(&v, "theta", None);
        g.vega   = safe_number(&v, "vega",  None);
        g.rho    = safe_number(&v, "rho",   None);
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
    pub symbol: Option<String>,
    pub maker:  Option<f64>,
    pub taker:  Option<f64>,
    pub raw:    Value,
}

impl TradingFee {
    pub fn from_value(v: Value) -> Self {
        use crate::value::{safe_string, safe_number};
        let mut t = TradingFee::default();
        t.symbol = safe_string(&v, "symbol", None);
        t.maker  = safe_number(&v, "maker",  None);
        t.taker  = safe_number(&v, "taker",  None);
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
    use super::{Market, Order, OrderBook};
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
}
