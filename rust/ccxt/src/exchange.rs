// Native Rust – Exchange base class.
//
// Methods BELOW the `METHODS BELOW THIS LINE ARE TRANSPILED FROM TYPESCRIPT`
// marker in `ts/src/base/Exchange.ts` are transpiled into
// `exchange_generated.rs` (opt-in behind the `transpiled-base` feature
// while the transpiler-port is in progress).
//
// Methods ABOVE the marker are hand-written here — they are the
// language-specific pieces that can't be transpiled:
//   • HTTP client (reqwest)
//   • Cryptographic primitives (HMAC-SHA256/512, SHA256/512, MD5)
//   • Base64/hex encoding, URL-encoding, JSON
//   • String utilities mirroring CCXT's `js/src/base/functions.ts`
//
// **Field layout.** The transpiler treats every field on Exchange as
// `Value` (Python/PHP-style dynamic typing). To stay compatible without
// fighting Rust's type system, every public field on `Exchange` is
// `crate::Value` — transpiled code can read/write them directly.
// Rust-typed runtime state (the HTTP client, the verbose flag, etc.)
// lives on the private `Internals` sub-struct.

#![allow(non_snake_case)]

use indexmap::IndexMap as HashMap;
use std::sync::Arc;
use hmac::{Hmac, Mac};
use sha2::{Sha256, Sha512, Digest as Sha2Digest};
use sha1::Sha1;
use md5::Md5;
use base64::{engine::general_purpose::STANDARD as B64, Engine as _};
use crate::{Value, ExchangeError, Result};

type HmacSha256 = Hmac<Sha256>;
type HmacSha512 = Hmac<Sha512>;
type HmacSha1   = Hmac<Sha1>;
type HmacMd5    = Hmac<Md5>;

/// Callback type used by derived exchanges to provide their `describe()` data.
pub type DescribeCallback = Arc<dyn Fn() -> Value + Send + Sync>;

// HTTP/JSON timing counters — accumulated by `fetch_typed`, read+reset
// by the CLI / benchmarks via `take_http_timings()`.
static HTTP_NANOS:  std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
static JSON_NANOS:  std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);
static HTTP_CALLS:  std::sync::atomic::AtomicU64 = std::sync::atomic::AtomicU64::new(0);

/// Snapshot + reset the global HTTP/JSON timings. Returns
/// `(http_nanos, json_nanos, http_calls)` and zeroes them.
pub fn take_http_timings() -> (u64, u64, u64) {
    use std::sync::atomic::Ordering::Relaxed;
    (
        HTTP_NANOS.swap(0, Relaxed),
        JSON_NANOS.swap(0, Relaxed),
        HTTP_CALLS.swap(0, Relaxed),
    )
}

// ── Internals (Rust-typed runtime state, not exposed to transpiled code) ─────

pub struct Internals {
    pub http_client:    Option<reqwest::Client>,
    pub describe_cb:    Option<DescribeCallback>,
    pub last_rest_ts:   i64,
    pub headers:        HashMap<String, String>,
    /// Leaky-bucket rate-limiter state, `(tokens, last_refill_ms)`, shared and
    /// interior-mutable so the `&self` async `throttle()` can serialize requests
    /// on one exchange instance. See `Exchange::throttle`.
    pub throttle:       std::sync::Arc<tokio::sync::Mutex<(f64, i64)>>,
    /// Cached dispatch table built from `self.api`. Maps the snake-case
    /// implicit API name (e.g. `public_get_exchange_info`) to
    /// `(path, api_scope, http_verb)`.
    pub implicit_api:   HashMap<String, (String, Vec<String>, String)>,
    /// Method names currently being dispatched to a derived override. Lets the
    /// async `dispatch_to_derived` default (in `ExchangeBase`) block recursion
    /// on a single method while allowing sibling dispatches. This is the only
    /// dispatch state left — virtual dispatch itself is now static (review #1),
    /// so there are no raw self-pointers to keep.
    pub dispatch_stack:       Vec<String>,
}

/// The Go-style "interface" that every derived exchange implements. When
/// Exchange.ts calls `this.parseTicker(...)` (and similar), the transpiler
/// rewrites it to `self.derived().parse_ticker(...)`; that goes through
/// this trait's vtable to the derived exchange's override.
///
/// Default impls return `Value::Null` so an unbound Exchange still
/// compiles and runs (it just gives back empty results).
pub trait DerivedExchange {
    // ── parsers (the dominant override surface) ──────────────────────────
    fn parse_ticker(&self, _ticker: Value, _market: Value) -> Value { Value::Null }
    fn parse_trade(&self, _trade: Value, _market: Value) -> Value { Value::Null }
    fn parse_order(&self, _order: Value, _market: Value) -> Value { Value::Null }
    fn parse_market(&self, _market: Value) -> Value { Value::Null }
    fn parse_ohlcv(&self, _ohlcv: Value, _market: Value) -> Value { Value::Null }
    fn parse_order_book(&self, _ob: Value, _symbol: Value, _ts: Value, _bk: Value, _ak: Value, _pk: Value, _ak2: Value, _ck: Value) -> Value { Value::Null }
    fn parse_balance(&self, _response: Value) -> Value { Value::Null }
    fn parse_position(&self, _position: Value, _market: Value) -> Value { Value::Null }
    fn parse_funding_rate(&self, _rate: Value, _market: Value) -> Value { Value::Null }
    fn parse_deposit(&self, _tx: Value, _currency: Value) -> Value { Value::Null }
    fn parse_deposit_address(&self, _addr: Value, _currency: Value) -> Value { Value::Null }
    fn parse_last_price(&self, _entry: Value, _market: Value) -> Value { Value::Null }
    fn parse_withdrawal(&self, _tx: Value, _currency: Value) -> Value { Value::Null }
    fn parse_ledger_entry(&self, _entry: Value, _currency: Value) -> Value { Value::Null }
    fn parse_transfer(&self, _transfer: Value, _currency: Value) -> Value { Value::Null }
    fn parse_currency(&self, _currency: Value) -> Value { Value::Null }
    fn parse_bid_ask(&self, _bidask: Value, _price_key: Value, _amount_key: Value, _market: Value) -> Value { Value::Null }
    fn parse_open_interest(&self, _interest: Value, _market: Value) -> Value { Value::Null }
    fn parse_liquidation(&self, _liquidation: Value, _market: Value) -> Value { Value::Null }
    fn parse_funding_rate_history(&self, _entry: Value, _market: Value) -> Value { Value::Null }
    fn parse_margin_modification(&self, _data: Value, _market: Value) -> Value { Value::Null }
    fn parse_account(&self, _account: Value) -> Value { Value::Null }
    fn parse_my_trade(&self, _trade: Value, _market: Value) -> Value { Value::Null }
    fn parse_transaction(&self, _transaction: Value, _currency: Value) -> Value { Value::Null }
    fn parse_borrow_interest(&self, _info: Value, _market: Value) -> Value { Value::Null }
    fn parse_adl_rank(&self, _info: Value, _market: Value) -> Value { Value::Null }
    fn parse_income(&self, _info: Value, _market: Value) -> Value { Value::Null }
    fn parse_greeks(&self, _greeks: Value, _market: Value) -> Value { Value::Null }
    fn parse_margin_mode(&self, _margin_mode: Value, _market: Value) -> Value { Value::Null }
    fn parse_conversion(&self, _conversion: Value, _from_currency: Value, _to_currency: Value) -> Value { Value::Null }
    fn parse_borrow_rate(&self, _info: Value, _currency: Value) -> Value { Value::Null }
    fn parse_leverage(&self, _leverage: Value, _market: Value) -> Value { Value::Null }
    fn parse_market_leverage_tiers(&self, _info: Value, _market: Value) -> Value { Value::Null }
    fn parse_deposit_withdraw_fee(&self, _fee: Value, _currency: Value) -> Value { Value::Null }
    fn create_expired_option_market(&self, _symbol: Value) -> Value { Value::Null }
    // ── prediction-tier parsers (overridden by prediction venues) ────────
    fn parse_prediction_trade(&self, _trade: Value, _market: Value) -> Value { Value::Null }
    fn parse_prediction_order(&self, _order: Value, _market: Value) -> Value { Value::Null }
    fn parse_prediction_position(&self, _position: Value, _market: Value) -> Value { Value::Null }
    // ── signers / error handlers ─────────────────────────────────────────
    fn sign(&self, _path: Value, _api: Value, _method: Value, _params: Value, _headers: Value, _body: Value) -> Value { Value::Null }
    fn handle_errors(&self, _code: Value, _reason: Value, _url: Value, _method: Value, _headers: Value, _body: Value, _response: Value, _request_headers: Value, _request_body: Value) -> Value { Value::Null }
}

// `Internals` no longer holds raw pointers, so `Send`/`Sync` are auto-derived
// (its fields — `reqwest::Client`, `Arc<dyn Fn + Send + Sync>`,
// `Arc<tokio::Mutex<_>>`, maps, `Vec<String>` — are all thread-safe). No manual
// `unsafe impl` and no `PhantomPinned` are needed now that dispatch is static
// (review #1: thread safety is compiler-proven, not asserted).

// A cloned Exchange gets a fresh `Internals` — the http client and dispatch
// state are per-instance and must not be shared.
// Test-only callers (`clone_self`) only read `Value` fields off the copy.
impl Clone for Internals {
    fn clone(&self) -> Self { Internals::default() }
}

impl Default for Internals {
    fn default() -> Self {
        Self {
            http_client:      None,
            describe_cb:      None,
            last_rest_ts:     0,
            headers:          HashMap::new(),
            throttle:         std::sync::Arc::new(tokio::sync::Mutex::new((0.0, 0))),
            implicit_api:     HashMap::new(),
            dispatch_stack:      Vec::new(),
        }
    }
}

// ── Exchange struct ─────────────────────────────────────────────────────────
//
// Every transpiler-visible field is `Value`. Both camelCase and snake_case
// names appear because the TS source uses both interchangeably.

#[derive(Clone)]
pub struct Exchange {
    // identity
    pub id:          Value,
    pub name:        Value,
    pub countries:   Value,
    pub version:     Value,
    pub alias:       Value,
    pub certified:   Value,
    pub pro:         Value,
    pub hostname:    Value,

    // credentials
    pub apiKey:        Value,
    pub secret:        Value,
    pub password:      Value,
    pub uid:           Value,
    pub walletAddress: Value,
    pub privateKey:    Value,
    pub twofa:         Value,
    pub token:         Value,
    pub login:         Value,
    pub accountId:     Value,
    pub requiredCredentials: Value,

    // rate limiting / connection
    pub timeout:                Value,
    pub rateLimit:              Value,
    pub enableRateLimit:        Value,
    pub rateLimiterAlgorithm:   Value,
    pub rollingWindowSize:      Value,
    pub tokenBucket:            Value,
    pub verbose:                Value,
    pub isSandboxModeEnabled:   Value,

    // proxy
    pub proxy:               Value,
    pub proxyUrl:            Value,
    pub proxy_url:           Value,
    pub proxyUrlCallback:    Value,
    pub proxy_url_callback:  Value,
    pub httpProxy:           Value,
    pub http_proxy:          Value,
    pub httpProxyCallback:   Value,
    pub http_proxy_callback: Value,
    pub httpsProxy:          Value,
    pub https_proxy:         Value,
    pub httpsProxyCallback:  Value,
    pub https_proxy_callback: Value,
    pub socksProxy:          Value,
    pub socks_proxy:         Value,
    pub socksProxyCallback:  Value,
    pub socks_proxy_callback: Value,
    pub wsProxy:             Value,
    pub ws_proxy:            Value,
    pub wssProxy:            Value,
    pub wss_proxy:           Value,
    pub wsSocksProxy:        Value,
    pub ws_socks_proxy:      Value,

    // market data caches
    pub markets:           Value,
    pub markets_by_id:     Value,
    pub currencies:        Value,
    pub currencies_by_id:  Value,
    pub commonCurrencies:  Value,
    pub baseCurrencies:    Value,
    pub quoteCurrencies:   Value,
    pub symbols:           Value,
    pub ids:               Value,
    pub codes:             Value,
    pub timeframes:        Value,
    pub precision:         Value,
    pub limits:            Value,
    pub fees:              Value,
    pub features:          Value,
    pub has:               Value,
    pub exceptions:        Value,
    pub urls:              Value,
    pub api:               Value,
    pub options:           Value,
    pub headers:           Value,
    pub accounts:          Value,
    pub accountsById:      Value,

    // runtime state
    pub orderbooks:        Value,
    pub orders:            Value,
    pub trades:            Value,
    pub myTrades:          Value,
    pub positions:         Value,
    // WS state — mirrors `ts/src/base/Exchange.ts` `newUpdates: boolean = true`.
    // Per-exchange WS code reads `self.newUpdates` to decide whether to call
    // `cache.getLimit(...)` (return only what's new since the last call) or
    // emit the whole rolling buffer.
    pub newUpdates:        Value,
    pub tickers:           Value,
    pub bidsasks:          Value,
    pub ohlcvs:            Value,
    pub clients:           Value,
    pub balance:           Value,
    pub liquidations:      Value,
    pub myLiquidations:    Value,
    pub fundingRates:      Value,
    pub triggerOrders:     Value,
    pub transactions:      Value,
    pub reloadingMarkets:  Value,
    pub marketsLoading:    Value,

    // last-* tracking
    pub last_request_url:        Value,
    pub last_request_headers:    Value,
    pub last_request_body:       Value,
    pub last_http_response:      Value,
    pub last_response_headers:   Value,
    /// Canned HTTP response for static *response* tests — when set,
    /// `fetch_typed` returns it without hitting the network so the
    /// exchange's parser runs against fixture data. Mirrors Go's
    /// `MockResponse` field. Cleared back to `Null` after dispatch.
    pub mock_response:           Value,
    pub last_json_response:      Value,
    pub lastRestRequestTimestamp: Value,
    /// Rolling cache of recent fetch results, capped at
    /// `fetchHistoryCacheSize`. Mirrors `Exchange.ts` `fetchHistoryCache`
    /// / `fetchHistoryCacheSize` (hand-written, above the transpile marker).
    pub fetchHistoryCache:      Value,
    pub fetchHistoryCacheSize:  Value,

    // misc
    pub paddingMode:               Value,
    pub precisionMode:             Value,
    pub substituteCommonCurrencyCodes: Value,
    pub reduceFees:                Value,
    pub minFundingAddressLength:   Value,
    pub MAX_VALUE:                 Value,
    pub returnResponseHeaders:     Value,
    pub httpExceptions:            Value,
    pub status:                    Value,

    // user-agent / fetch behavior
    pub userAgent:                 Value,
    pub user_agent:                Value,
    pub userAgents:                Value,

    // describe() output (legacy)
    pub describe_data:             Value,
    pub derived_describe:          Option<DescribeCallback>,

    // private runtime state (typed)
    pub internals: Internals,
}

impl Default for Exchange {
    fn default() -> Self { Self::new(None) }
}

// ── base-class describe() defaults (Exchange.ts) ────────────────────────────
// Mirrors the constant sub-objects returned by the base `describe()` so a
// plain `Exchange` carries the same shape as CCXT (verified by the
// transpiled `test.afterConstructor` base test).

fn vmap(pairs: &[(&str, Value)]) -> Value {
    let mut m = HashMap::new();
    for (k, v) in pairs { m.insert((*k).to_string(), v.clone()); }
    Value::Map(m)
}

fn min_max() -> Value { vmap(&[("min", Value::Null), ("max", Value::Null)]) }

fn base_limits() -> Value {
    vmap(&[
        ("leverage", min_max()),
        ("amount",   min_max()),
        ("price",    min_max()),
        ("cost",     min_max()),
    ])
}

fn base_fees() -> Value {
    vmap(&[
        ("trading", vmap(&[
            ("tierBased",  Value::Null),
            ("percentage", Value::Null),
            ("taker",      Value::Null),
            ("maker",      Value::Null),
        ])),
        ("funding", vmap(&[
            ("tierBased",  Value::Null),
            ("percentage", Value::Null),
            ("withdraw",   Value::Map(HashMap::new())),
            ("deposit",    Value::Map(HashMap::new())),
        ])),
    ])
}

fn base_urls() -> Value {
    vmap(&[
        ("logo", Value::Null), ("api", Value::Null), ("test", Value::Null),
        ("www", Value::Null), ("doc", Value::Null), ("api_management", Value::Null),
        ("fees", Value::Null), ("referral", Value::Null),
    ])
}

fn base_status() -> Value {
    vmap(&[
        ("status",  Value::Str("ok".to_string())),
        ("updated", Value::Null),
        ("eta",     Value::Null),
        ("url",     Value::Null),
        ("info",    Value::Null),
    ])
}

/// `deepExtend(a, b)` — recursive merge; `b` wins on scalar conflicts,
/// nested maps merge key-by-key.
fn deep_merge(a: &Value, b: &Value) -> Value {
    match (a, b) {
        (Value::Dict(am), Value::Dict(bm)) => {
            let mut out = (**am).clone();
            for (k, bv) in bm.iter() {
                let merged = match out.get(k) {
                    Some(av) => deep_merge(av, bv),
                    None     => bv.clone(),
                };
                out.insert(k.clone(), merged);
            }
            Value::Map(out)
        }
        _ => b.clone(),
    }
}

fn base_http_exceptions() -> Value {
    let mut m = HashMap::new();
    for (code, class) in [
        ("422", "ExchangeError"),         ("418", "DDoSProtection"),
        ("429", "RateLimitExceeded"),     ("404", "ExchangeNotAvailable"),
        ("409", "ExchangeNotAvailable"),  ("410", "ExchangeNotAvailable"),
        ("451", "ExchangeNotAvailable"),  ("500", "ExchangeNotAvailable"),
        ("501", "ExchangeNotAvailable"),  ("502", "ExchangeNotAvailable"),
        ("520", "ExchangeNotAvailable"),  ("521", "ExchangeNotAvailable"),
        ("522", "ExchangeNotAvailable"),  ("525", "ExchangeNotAvailable"),
        ("526", "ExchangeNotAvailable"),  ("400", "ExchangeNotAvailable"),
        ("403", "ExchangeNotAvailable"),  ("405", "ExchangeNotAvailable"),
        ("503", "ExchangeNotAvailable"),  ("530", "ExchangeNotAvailable"),
        ("408", "RequestTimeout"),        ("504", "RequestTimeout"),
        ("401", "AuthenticationError"),   ("407", "AuthenticationError"),
        ("511", "AuthenticationError"),
    ] {
        m.insert(code.to_string(), Value::Str(class.to_string()));
    }
    Value::Map(m)
}

impl Exchange {
    pub fn new(config: Option<Value>) -> Self {
        let mut ex = Exchange {
            // Base-class id (Exchange.ts describe()). A derived exchange's
            // describe() overrides this with its own id.
            id:        Value::Str("Exchange".to_string()),
            name:      Value::Null,
            countries: Value::Null,
            version:   Value::Null,
            alias:     Value::Bool(false),
            certified: Value::Bool(false),
            pro:       Value::Bool(false),
            hostname:  Value::Null,

            apiKey:        Value::Null,
            secret:        Value::Null,
            password:      Value::Null,
            uid:           Value::Null,
            walletAddress: Value::Null,
            privateKey:    Value::Null,
            twofa:         Value::Null,
            token:         Value::Null,
            login:         Value::Null,
            accountId:     Value::Null,
            // Base-class default (Exchange.ts). Kept when an exchange's
            // describe() doesn't override it — so `checkRequiredCredentials`
            // still works even though `super.describe()` is stubbed.
            requiredCredentials: {
                let mut m = HashMap::new();
                m.insert("apiKey".to_string(),        Value::Bool(true));
                m.insert("secret".to_string(),        Value::Bool(true));
                m.insert("uid".to_string(),           Value::Bool(false));
                m.insert("accountId".to_string(),     Value::Bool(false));
                m.insert("login".to_string(),         Value::Bool(false));
                m.insert("password".to_string(),      Value::Bool(false));
                m.insert("twofa".to_string(),         Value::Bool(false));
                m.insert("privateKey".to_string(),    Value::Bool(false));
                m.insert("walletAddress".to_string(), Value::Bool(false));
                m.insert("token".to_string(),         Value::Bool(false));
                Value::Map(m)
            },

            timeout:              Value::Int(10_000),
            rateLimit:            Value::Int(2_000),
            enableRateLimit:      Value::Bool(true),
            rateLimiterAlgorithm: Value::Str("leakyBucket".to_string()),
            rollingWindowSize:    Value::Int(60_000),
            tokenBucket:          Value::Map(HashMap::new()),
            verbose:              Value::Bool(false),
            isSandboxModeEnabled: Value::Bool(false),

            proxy:               Value::Null,
            proxyUrl:            Value::Null,
            proxy_url:           Value::Null,
            proxyUrlCallback:    Value::Null,
            proxy_url_callback:  Value::Null,
            httpProxy:           Value::Null,
            http_proxy:          Value::Null,
            httpProxyCallback:   Value::Null,
            http_proxy_callback: Value::Null,
            httpsProxy:          Value::Null,
            https_proxy:         Value::Null,
            httpsProxyCallback:  Value::Null,
            https_proxy_callback: Value::Null,
            socksProxy:          Value::Null,
            socks_proxy:         Value::Null,
            socksProxyCallback:  Value::Null,
            socks_proxy_callback: Value::Null,
            wsProxy:             Value::Null,
            ws_proxy:            Value::Null,
            wssProxy:            Value::Null,
            wss_proxy:           Value::Null,
            wsSocksProxy:        Value::Null,
            ws_socks_proxy:      Value::Null,

            markets:           Value::Null,
            markets_by_id:     Value::Null,
            currencies:        Value::Map(HashMap::new()),
            currencies_by_id:  Value::Null,
            commonCurrencies:  {
                let mut m = HashMap::new();
                m.insert("XBT".to_string(),   Value::Str("BTC".to_string()));
                m.insert("BCHSV".to_string(), Value::Str("BSV".to_string()));
                Value::Map(m)
            },
            baseCurrencies:    Value::Null,
            quoteCurrencies:   Value::Null,
            symbols:           Value::Null,
            ids:               Value::Null,
            codes:             Value::Null,
            timeframes:        Value::Null,
            precision:         Value::Null,
            limits:            base_limits(),
            fees:              base_fees(),
            features:          Value::Null,
            has:               Value::Map(HashMap::new()),
            exceptions:        Value::Null,
            urls:              base_urls(),
            api:               Value::Null,
            // Base-class default `options` (Exchange.ts describe()). Kept
            // when an exchange's describe() omits it — `super.describe()`
            // is stubbed, so it wouldn't otherwise flow through.
            options: {
                let mk = |p: &str, s: &str, d: &str| {
                    let mut e = HashMap::new();
                    e.insert("primary".to_string(),   Value::Str(p.to_string()));
                    e.insert("secondary".to_string(), Value::Str(s.to_string()));
                    e.insert("default".to_string(),   Value::Str(d.to_string()));
                    Value::Map(e)
                };
                let mut repl = HashMap::new();
                repl.insert("ETH".to_string(), mk("ETH", "ERC20", "secondary"));
                repl.insert("CRO".to_string(), mk("CRONOS", "CRC20", "secondary"));
                repl.insert("TRX".to_string(), mk("TRX", "TRC20", "secondary"));
                repl.insert("BTC".to_string(), mk("BTC", "BRC20", "primary"));
                let mut o = HashMap::new();
                o.insert("defaultNetworkCodeReplacements".to_string(), Value::Map(repl));
                Value::Map(o)
            },
            headers:           Value::Map(HashMap::new()),
            accounts:          Value::Null,
            accountsById:      Value::Null,

            orderbooks:    Value::Map(HashMap::new()),
            orders:        Value::Null,
            trades:        Value::Map(HashMap::new()),
            myTrades:      Value::Null,
            positions:     Value::Null,
            newUpdates:    Value::Bool(true),
            tickers:       Value::Map(HashMap::new()),
            bidsasks:      Value::Map(HashMap::new()),
            ohlcvs:        Value::Map(HashMap::new()),
            clients:       Value::Map(HashMap::new()),
            balance:       Value::Map(HashMap::new()),
            liquidations:  Value::Null,
            myLiquidations: Value::Null,
            fundingRates:  Value::Null,
            triggerOrders: Value::Null,
            transactions:  Value::Map(HashMap::new()),
            reloadingMarkets: Value::Null,
            marketsLoading:   Value::Null,

            last_request_url:           Value::Null,
            last_request_headers:       Value::Null,
            last_request_body:          Value::Null,
            last_http_response:         Value::Null,
            last_response_headers:      Value::Null,
            mock_response:              Value::Null,
            last_json_response:         Value::Null,
            lastRestRequestTimestamp:   Value::Int(0),
            fetchHistoryCache:          Value::List(vec![]),
            fetchHistoryCacheSize:      Value::Int(0),

            paddingMode:                       Value::Null,
            precisionMode:                     Value::Null,
            substituteCommonCurrencyCodes:     Value::Bool(true),
            reduceFees:                        Value::Bool(true),
            minFundingAddressLength:           Value::Int(1),
            MAX_VALUE:                         Value::Float(f64::MAX),
            returnResponseHeaders:             Value::Bool(false),
            httpExceptions:                    base_http_exceptions(),
            status:                            base_status(),

            userAgent:   Value::Null,
            user_agent:  Value::Null,
            userAgents:  {
                let mut m = HashMap::new();
                m.insert("chrome".to_string(), Value::Str("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36".to_string()));
                m.insert("chrome39".to_string(), Value::Str("Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36".to_string()));
                m.insert("chrome100".to_string(), Value::Str("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36".to_string()));
                Value::Map(m)
            },

            describe_data:     Value::Null,
            derived_describe:  None,

            internals: Internals::default(),
        };
        if let Some(cfg) = config { ex.apply_config(&cfg); }
        // `afterConstruct()` (Exchange.ts) — builds `networksById`, the
        // features table, `tokenBucket`, predefined markets and applies
        // sandbox mode from `options.sandbox` / `options.testnet`. It is an
        // `ExchangeBase` trait method now, so run it through a `BaseCore`
        // (no overrides) and unwrap the mutated Exchange back out.
        let mut __bc = BaseCore::new(ex);
        crate::exchange_generated::ExchangeBase::after_construct(&mut __bc);
        __bc.into_inner()
    }

    fn apply_config(&mut self, cfg: &Value) {
        use crate::value::safe_string;
        if let Some(v) = safe_string(cfg, "id",       None) { self.id       = Value::Str(v); }
        if let Some(v) = safe_string(cfg, "name",     None) { self.name     = Value::Str(v); }
        if let Some(v) = safe_string(cfg, "hostname", None) { self.hostname = Value::Str(v); }
        let rate_limit = crate::get_value(cfg, &Value::Str("rateLimit".to_string()));
        if matches!(rate_limit, Value::Int(_) | Value::Float(_)) { self.rateLimit = rate_limit; }
        let timeout = crate::get_value(cfg, &Value::Str("timeout".to_string()));
        if matches!(timeout, Value::Int(_) | Value::Float(_)) { self.timeout = timeout; }
        let fetch_history_cache_size = crate::get_value(cfg, &Value::Str("fetchHistoryCacheSize".to_string()));
        if matches!(fetch_history_cache_size, Value::Int(_) | Value::Float(_)) { self.fetchHistoryCacheSize = fetch_history_cache_size; }
        let urls = crate::get_value(cfg, &Value::Str("urls".to_string()));
        if let Value::Dict(_) = urls { self.urls = deep_merge(&self.urls, &urls); }
        if let Some(v) = safe_string(cfg, "apiKey",        None) { self.apiKey        = Value::Str(v); }
        if let Some(v) = safe_string(cfg, "secret",        None) { self.secret        = Value::Str(v); }
        if let Some(v) = safe_string(cfg, "password",      None) { self.password      = Value::Str(v); }
        if let Some(v) = safe_string(cfg, "uid",           None) { self.uid           = Value::Str(v); }
        if let Some(v) = safe_string(cfg, "walletAddress", None) { self.walletAddress = Value::Str(v); }
        if let Some(v) = safe_string(cfg, "privateKey",    None) { self.privateKey    = Value::Str(v); }
        if let Some(v) = safe_string(cfg, "token",         None) { self.token         = Value::Str(v); }
        if let Some(v) = safe_string(cfg, "login",         None) { self.login         = Value::Str(v); }
        if let Some(v) = safe_string(cfg, "accountId",     None) { self.accountId     = Value::Str(v); }
        if let Some(v) = safe_string(cfg, "httpProxy",     None) { self.httpProxy     = Value::Str(v); }
        if let Some(v) = safe_string(cfg, "httpsProxy",    None) { self.httpsProxy    = Value::Str(v); }
        if let Some(b) = crate::value::safe_bool(cfg, "verbose",         None) { self.verbose         = Value::Bool(b); }
        if let Some(b) = crate::value::safe_bool(cfg, "enableRateLimit", None) { self.enableRateLimit = Value::Bool(b); }
        // Pre-populated state (mirrors CCXT TS Exchange constructor):
        // markets/currencies/options arrive ready to use from offline
        // tests, the CLI, or library users seeding state. `setMarkets`
        // also derives markets_by_id and symbols.
        let markets    = crate::get_value(cfg, &Value::Str("markets".to_string()));
        let currencies = crate::get_value(cfg, &Value::Str("currencies".to_string()));
        if !matches!(markets,    Value::Null) { self.set_markets_inline(markets); }
        if !matches!(currencies, Value::Null) { self.currencies = currencies; }
        let opts = crate::get_value(cfg, &Value::Str("options".to_string()));
        if let Value::Dict(extra) = opts {
            let mut merged = match &self.options {
                Value::Dict(m) => (**m).clone(),
                _ => HashMap::new(),
            };
            let extra = Arc::try_unwrap(extra).unwrap_or_else(|a| (*a).clone());
            for (k, v) in extra { merged.insert(k, v); }
            self.options = Value::Map(merged);
        }
        let accounts = crate::get_value(cfg, &Value::Str("accounts".to_string()));
        if !matches!(accounts, Value::Null) { self.accounts = accounts; }
    }

    /// `markets`-from-config → derives `markets_by_id` + `symbols`.
    /// Accepts either Map<symbol, market> or Array<market>.
    fn set_markets_inline(&mut self, markets: Value) {
        let arr: Vec<Value> = match &markets {
            Value::Dict(m)   => m.values().cloned().collect(),
            Value::Arr(a) => (**a).clone(),
            _ => return,
        };
        let mut by_symbol = HashMap::new();
        // `markets_by_id` maps an exchange market id → the *list* of
        // markets sharing that id (e.g. binance spot + swap both have
        // id `BTCUSDT`); `safeMarket` disambiguates by market type.
        let mut by_id: HashMap<String, Vec<Value>> = HashMap::new();
        let mut symbols   = Vec::new();
        for m in &arr {
            if let Some(s) = crate::value::safe_string(m, "symbol", None) {
                by_symbol.insert(s.clone(), m.clone());
                symbols.push(Value::Str(s));
            }
            if let Some(i) = crate::value::safe_string(m, "id", None) {
                by_id.entry(i).or_default().push(m.clone());
            }
        }
        self.markets       = if by_symbol.is_empty() { markets } else { Value::Map(by_symbol) };
        self.markets_by_id = Value::Map(
            by_id.into_iter().map(|(k, v)| (k, Value::Array(v))).collect()
        );
        self.symbols       = Value::Array(symbols);
    }

    // ── http client ─────────────────────────────────────────────────────────

    fn http_client(&mut self) -> &reqwest::Client {
        if self.internals.http_client.is_none() {
            let mut b = reqwest::Client::builder()
                .timeout(std::time::Duration::from_millis(self.timeout_ms()))
                // Transparent gzip: many exchanges return large JSON payloads
                // (binance spot exchangeInfo is ~17 MB raw vs ~0.3 MB gzipped).
                // Other CCXT langs request gzip by default; without this rust
                // downloads the full uncompressed body, dominating load time.
                .gzip(true);
            if let Some(ua) = self.user_agent_str() { b = b.user_agent(ua); }
            // Apply scheme-specific proxies. Order matters for reqwest's
            // proxy matcher: SOCKS catches everything when set, HTTP/HTTPS
            // only match their own scheme. The legacy `proxy` (and its
            // snake_case alias) plus tests' `httpsProxy` use the catch-all
            // form via Proxy::all(...). The `socks` feature on `reqwest`
            // is what makes `socks5://...` URIs actually route — without
            // it `Proxy::all` would build but the connection silently
            // never goes through SOCKS.
            let mut proxies: Vec<reqwest::Proxy> = Vec::new();
            for field in [&self.socksProxy, &self.socks_proxy] {
                if let Value::Str(s) = field {
                    if !s.is_empty() {
                        if let Ok(p) = reqwest::Proxy::all(s.as_str()) { proxies.push(p); }
                    }
                }
            }
            for field in [&self.httpsProxy, &self.https_proxy] {
                if let Value::Str(s) = field {
                    if !s.is_empty() {
                        if let Ok(p) = reqwest::Proxy::https(s.as_str()) { proxies.push(p); }
                    }
                }
            }
            for field in [&self.httpProxy, &self.http_proxy] {
                if let Value::Str(s) = field {
                    if !s.is_empty() {
                        if let Ok(p) = reqwest::Proxy::http(s.as_str()) { proxies.push(p); }
                    }
                }
            }
            // Legacy single `proxy` setter (catch-all). Only honoured if
            // none of the scheme-specific fields fired.
            if proxies.is_empty() {
                if let Value::Str(s) = &self.proxy {
                    if !s.is_empty() {
                        if let Ok(p) = reqwest::Proxy::all(s.as_str()) { proxies.push(p); }
                    }
                }
            }
            for p in proxies { b = b.proxy(p); }
            self.internals.http_client = Some(b.build().expect("reqwest client"));
        }
        self.internals.http_client.as_ref().unwrap()
    }

    fn timeout_ms(&self) -> u64 {
        match &self.timeout {
            Value::Int(n)   => *n as u64,
            Value::Float(f) => *f as u64,
            _ => 10_000,
        }
    }

    fn user_agent_str(&self) -> Option<&str> {
        match &self.userAgent { Value::Str(s) => Some(s.as_str()), _ => match &self.user_agent {
            Value::Str(s) => Some(s.as_str()), _ => None
        }}
    }

    fn proxy_str(&self) -> Option<&str> {
        // Honour `proxy` first (legacy CCXT setter), then the scheme-
        // specific aliases. Offline broker-id / static tests rely on
        // `httpsProxy` pointing at a fake host so requests fail locally
        // instead of leaving the machine.
        for v in [&self.proxy, &self.httpsProxy, &self.https_proxy, &self.httpProxy, &self.http_proxy] {
            if let Value::Str(s) = v {
                if !s.is_empty() { return Some(s.as_str()); }
            }
        }
        None
    }

    fn is_verbose(&self) -> bool {
        matches!(self.verbose, Value::Bool(true))
    }


    // ── encoding / URL helpers ──────────────────────────────────────────────

    pub fn urlencode_kv(&self, params: &Value) -> String {
        let m = match params { Value::Dict(m) => m, _ => return String::new() };
        m.iter().map(|(k, v)| format!(
            "{}={}",
            url_pct(k),
            url_pct(&crate::runtime::stringify_param(v)),
        )).collect::<Vec<_>>().join("&")
    }

    pub fn implode_params(&self, path: Value, params: Value) -> Value {
        let path_str = match &path { Value::Str(s) => s.clone(), _ => return path };
        let m = match &params { Value::Dict(m) => m, _ => return Value::Str(path_str) };
        let mut out = path_str;
        for (k, v) in m.iter() {
            let needle = format!("{{{k}}}");
            if out.contains(&needle) {
                out = out.replace(&needle, &crate::runtime::stringify_param(v));
            }
        }
        Value::Str(out)
    }

    pub fn json_str(&self, v: &Value) -> String {
        serde_json::to_string(&v.to_json()).unwrap_or_default()
    }

    // ── crypto ──────────────────────────────────────────────────────────────

    pub fn hmac(&self, data: Value, secret: Value, hash: Value, optional_args: &[Value]) -> Value {
        // `data`/`secret` may be a string OR the byte-array produced by
        // `encode()` (CCXT's `hmac` takes the encoded request/secret).
        let dbytes = value_to_bytes(&data);
        let sbytes = value_to_bytes(&secret);
        let h = match &hash { Value::Str(s) => s.clone(), _ => "sha256".to_string() };
        let digest = match optional_args.get(0) {
            Some(Value::Str(d)) => d.clone(),
            _ => "hex".to_string(),
        };
        match self.hmac_typed(&dbytes, &sbytes, &h, &digest) {
            Ok(v) => Value::Str(v),
            Err(_) => Value::Null,
        }
    }

    pub fn hmac_typed(&self, data: &[u8], secret: &[u8], hash: &str, digest: &str) -> Result<String> {
        let dbytes = data;
        let sbytes = secret;
        let raw: Vec<u8> = match hash.to_ascii_lowercase().as_str() {
            "sha256" => { let mut m = HmacSha256::new_from_slice(sbytes).unwrap(); m.update(dbytes); m.finalize().into_bytes().to_vec() }
            "sha512" => { let mut m = HmacSha512::new_from_slice(sbytes).unwrap(); m.update(dbytes); m.finalize().into_bytes().to_vec() }
            "sha1"   => { let mut m = HmacSha1::new_from_slice(sbytes).unwrap();   m.update(dbytes); m.finalize().into_bytes().to_vec() }
            "md5"    => { let mut m = HmacMd5::new_from_slice(sbytes).unwrap();    m.update(dbytes); m.finalize().into_bytes().to_vec() }
            other    => return Err(ExchangeError::new("BadRequest", format!("unknown hmac: {other}"))),
        };
        Ok(match digest {
            "base64" => B64.encode(&raw),
            _        => hex::encode(&raw),
        })
    }

    pub fn hash(&self, data: Value, algo: Value, optional_args: &[Value]) -> Value {
        // `data` may be a string OR the byte-array produced by `encode()`.
        let dbytes = value_to_bytes(&data);
        let a = match &algo { Value::Str(s) => s.clone(), _ => "sha256".to_string() };
        let digest = match optional_args.get(0) {
            Some(Value::Str(d)) => d.clone(),
            _ => "hex".to_string(),
        };
        let raw = hash_raw(&dbytes, &a);
        match digest.as_str() {
            // `binary` → a byte-array Value (consumed by another crypto step).
            "binary" => Value::Array(raw.iter().map(|b| Value::Int(*b as i64)).collect()),
            "base64" => Value::Str(B64.encode(&raw)),
            _        => Value::Str(hex::encode(&raw)),
        }
    }

    pub fn hash_typed(&self, data: &[u8], algo: &str, digest: &str) -> String {
        let raw = hash_raw(data, algo);
        match digest {
            "base64" => B64.encode(&raw),
            _        => hex::encode(&raw),
        }
    }

    pub fn binary_to_base64(&self, data: Value, _optional_args: &[Value]) -> Value {
        let bytes = value_to_bytes(&data);
        Value::Str(B64.encode(&bytes))
    }
    pub fn base64_to_binary(&self, s: Value, _optional_args: &[Value]) -> Value {
        let str_val = match &s { Value::Str(s) => s.clone(), _ => return Value::Null };
        match B64.decode(&str_val) {
            Ok(b) => Value::Array(b.into_iter().map(|n| Value::Int(n as i64)).collect()),
            Err(_) => Value::Null,
        }
    }
    pub fn binary_to_base16(&self, data: Value, _optional_args: &[Value]) -> Value {
        let bytes = value_to_bytes(&data);
        Value::Str(hex::encode(&bytes))
    }
    pub fn base16_to_binary(&self, s: Value, _optional_args: &[Value]) -> Value {
        let str_val = match &s { Value::Str(s) => s.clone(), _ => return Value::Null };
        match hex::decode(&str_val) {
            Ok(b) => Value::Array(b.into_iter().map(|n| Value::Int(n as i64)).collect()),
            Err(_) => Value::Null,
        }
    }

    // ── time ────────────────────────────────────────────────────────────────

    pub fn milliseconds(&self) -> Value {
        let n = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis() as i64).unwrap_or(0);
        Value::Int(n)
    }
    pub fn seconds(&self) -> Value {
        match self.milliseconds() { Value::Int(n) => Value::Int(n / 1000), v => v }
    }
    pub fn microseconds(&self) -> Value {
        match self.milliseconds() { Value::Int(n) => Value::Int(n * 1000), v => v }
    }
    /// Typed i64 access for hand-written code that needs a raw timestamp.
    fn milliseconds_i64(&self) -> i64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis() as i64).unwrap_or(0)
    }

    pub fn iso8601(&self, ts: Value) -> Value {
        let n = match ts {
            Value::Int(n)   => n,
            Value::Float(f) => f as i64,
            Value::Str(ref s) => match s.parse::<i64>() { Ok(v) => v, Err(_) => return Value::Null },
            _ => return Value::Null,
        };
        if n < 0 {
            return Value::Null;
        }
        chrono::DateTime::<chrono::Utc>::from_timestamp_millis(n)
            .map(|t| Value::Str(t.to_rfc3339_opts(chrono::SecondsFormat::Millis, true)))
            .unwrap_or(Value::Null)
    }

    pub fn parse8601(&self, s: Value) -> Value {
        let str_val = match s { Value::Str(s) => s, _ => return Value::Null };
        if str_val.is_empty() {
            return Value::Null;
        }
        // rfc3339 (`T…Z` / `+00:00` offset forms).
        if let Ok(t) = chrono::DateTime::parse_from_rfc3339(&str_val) {
            return Value::Int(t.timestamp_millis());
        }
        // Numeric timezone offset WITHOUT a colon (`+0000`) — not valid
        // rfc3339 but common (e.g. bitso `2024-03-13T10:59:59+0000`). JS
        // `Date.parse` accepts it; chrono needs an explicit `%z` format.
        for fmt in [
            "%Y-%m-%dT%H:%M:%S%.f%z", "%Y-%m-%dT%H:%M:%S%z",
            "%Y-%m-%d %H:%M:%S%.f%z", "%Y-%m-%d %H:%M:%S%z",
        ] {
            if let Ok(t) = chrono::DateTime::parse_from_str(&str_val, fmt) {
                return Value::Int(t.timestamp_millis());
            }
        }
        // Lenient fallbacks — naive forms are interpreted as UTC.
        for fmt in [
            "%Y-%m-%d %H:%M:%S%.f", "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S%.f", "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M",
        ] {
            if let Ok(ndt) = chrono::NaiveDateTime::parse_from_str(&str_val, fmt) {
                return Value::Int(ndt.and_utc().timestamp_millis());
            }
        }
        if let Ok(d) = chrono::NaiveDate::parse_from_str(&str_val, "%Y-%m-%d") {
            if let Some(ndt) = d.and_hms_opt(0, 0, 0) {
                return Value::Int(ndt.and_utc().timestamp_millis());
            }
        }
        Value::Null
    }

    // safe_string/safe_number/safe_integer/safe_bool live on the transpiled
    // side (`exchange_generated.rs`) when the `transpiled-base` feature is
    // enabled. The free-functions in `crate::value` are the typed
    // equivalents — used internally by hand-written code below.


}

// ── small helper used by url-encoding above ─────────────────────────────────

// ── derived dispatch re-entry guard ─────────────────────────────────────────
//
// Virtual dispatch itself is now STATIC: `ExchangeBase`'s default methods call
// `DerivedExchange::X(self, ...)` and `self.call_dynamic(...)` directly on the
// concrete Core, with no stored self-pointer (review #1). All that remains here
// is the per-method re-entry guard the async `dispatch_to_derived` default (in
// `exchange_generated::ExchangeBase`) uses so a base method that dispatches its
// own name falls through to the base body instead of looping.

impl Exchange {
    /// Enter the guard for `method`. Returns `false` if `method` is already on
    /// the dispatch stack (re-entry — caller should fall through to the base
    /// body); otherwise pushes it and returns `true`.
    pub fn dispatch_guard_enter(&mut self, method: &str) -> bool {
        if self.internals.dispatch_stack.iter().any(|m| m == method) { return false; }
        self.internals.dispatch_stack.push(method.to_string());
        true
    }

    /// Leave the guard (pop the most-recently entered method).
    pub fn dispatch_guard_exit(&mut self) {
        self.internals.dispatch_stack.pop();
    }
}

// ── ExchangeRuntime: base methods that reach derived overrides ───────────────
//
// A handful of hand-written base methods must call a derived override
// (`sign`, `handle_errors`) or dispatch async-by-name, so they need the
// concrete Core as `Self` to resolve statically (review #1). They live in this
// trait, blanket-impl'd for every `ExchangeBase`, so `self.fetch(...)`,
// `self.request_typed(...)`, … on a Core (or inside an `ExchangeBase` default)
// resolve here. Bodies reach `Exchange` fields via the `DerefMut` bound, other
// base methods via `ExchangeBase`, and pure `impl Exchange` helpers via `Deref`.
pub trait ExchangeRuntime: crate::exchange_generated::ExchangeBase {
    async fn fetch(&mut self, url: Value, optional_args: &[Value]) -> Value {
        let url_str = match &url { Value::Str(s) => s.clone(), _ => crate::runtime::stringify_param(&url) };
        let method = optional_args.get(0).cloned().unwrap_or(Value::Str("GET".to_string()));
        let headers = optional_args.get(1).cloned().unwrap_or(Value::Null);
        let body = optional_args.get(2).cloned().unwrap_or(Value::Null);
        let method_str = match &method { Value::Str(s) => s.clone(), _ => "GET".to_string() };
        let body_str = match &body { Value::Str(s) => Some(s.clone()), _ => None };
        let headers_map: HashMap<String, String> = match &headers {
            Value::Dict(m) => m.iter().filter_map(|(k, v)| match v {
                Value::Str(s) => Some((k.clone(), s.clone())),
                _ => None,
            }).collect(),
            _ => HashMap::new(),
        };
        match self.fetch_typed(&url_str, &method_str, headers_map, body_str).await {
            Ok(v) => v,
            Err(_) => Value::Null,
        }
    }

    async fn fetch_typed(
        &mut self,
        url:     &str,
        method:  &str,
        headers: HashMap<String, String>,
        body:    Option<String>,
    ) -> Result<Value> {
        let _fetch_call_count = HTTP_CALLS.fetch_add(1, std::sync::atomic::Ordering::Relaxed);
        self.last_request_url     = Value::Str(url.to_string());
        self.last_request_headers = Value::Map(headers.iter()
            .map(|(k, v)| (k.clone(), Value::Str(v.clone())))
            .collect());
        self.last_request_body    = match &body {
            Some(b) => Value::Str(b.clone()),
            None    => Value::Null,
        };
        if !matches!(self.mock_response, Value::Null) {
            return Ok(self.mock_response.clone());
        }
        let proxy_defined = |v: &Value| matches!(v, Value::Str(s) if !s.is_empty());
        let used_proxies = [
            proxy_defined(&self.httpProxy)  || proxy_defined(&self.http_proxy),
            proxy_defined(&self.httpsProxy) || proxy_defined(&self.https_proxy),
            proxy_defined(&self.socksProxy) || proxy_defined(&self.socks_proxy),
        ].iter().filter(|x| **x).count();
        if used_proxies > 1 {
            return Err(ExchangeError::new(
                "InvalidProxySettings",
                format!("{} you have multiple conflicting proxy settings, please use only one from: httpProxy, httpsProxy, socksProxy",
                    match &self.id { Value::Str(s) => s.as_str(), _ => "" }),
            ));
        }
        let client = self.http_client().clone();
        let method_parsed = reqwest::Method::from_bytes(method.as_bytes())
            .map_err(|_| ExchangeError::new("BadRequest", format!("invalid HTTP method: {method}")))?;
        let mut req = client.request(method_parsed, url);
        for (k, v) in &self.internals.headers { req = req.header(k, v); }
        for (k, v) in &headers                { req = req.header(k, v); }
        if self.is_verbose() {
            eprintln!("[ccxt] {method} {url}");
            for (k, v) in &self.internals.headers { eprintln!("[ccxt]   {k}: {v}"); }
            for (k, v) in &headers                { eprintln!("[ccxt]   {k}: {v}"); }
            if let Some(b) = &body {
                eprintln!("[ccxt]   request body: {b}");
            }
        }
        if let Some(b) = body                 { req = req.body(b); }
        let __http_t0 = std::time::Instant::now();
        let resp = req.send().await?;
        let status = resp.status().as_u16();
        let text   = resp.text().await?;
        HTTP_NANOS.fetch_add(__http_t0.elapsed().as_nanos() as u64,
            std::sync::atomic::Ordering::Relaxed);
        if self.is_verbose() {
            eprintln!("[ccxt] ← {status} {} bytes", text.len());
            const CAP: usize = 16384;
            if text.len() > CAP {
                eprintln!("[ccxt]   response body: {}… ({} bytes total)",
                    &text[..text.char_indices().take_while(|(i, _)| *i < CAP).last().map(|(i, c)| i + c.len_utf8()).unwrap_or(0)],
                    text.len());
            } else {
                eprintln!("[ccxt]   response body: {text}");
            }
        }
        let __json_t0 = std::time::Instant::now();
        let json = match serde_json::from_str::<serde_json::Value>(&text) {
            Ok(j)  => Value::from_json(&j),
            Err(_) => Value::Null,
        };
        JSON_NANOS.fetch_add(__json_t0.elapsed().as_nanos() as u64,
            std::sync::atomic::Ordering::Relaxed);
        if status >= 400 {
            // Static dispatch to the derived exchange's handle_errors override.
            crate::exchange::DerivedExchange::handle_errors(
                self,
                Value::Int(status as i64),
                Value::Null,
                Value::Str(url.to_string()),
                Value::Str(method.to_string()),
                Value::Null,
                Value::Str(text.clone()),
                json.clone(),
                Value::Null,
                Value::Null,
            );
            return Err(ExchangeError::new(
                if status == 429 { "RateLimitExceeded" }
                else if status >= 500 { "ExchangeNotAvailable" }
                else { "ExchangeError" },
                format!("HTTP {status}: {text}"),
            ));
        }
        if matches!(json, Value::Null) {
            return Ok(Value::Str(text));
        }
        Ok(json)
    }

    async fn request_typed(&mut self, path: &str, scope_segments: &[String], verb: &str, params: Value) -> Result<Value> {
        if !matches!(self.mock_response, Value::Null) {
            return self.fetch_typed("", verb, HashMap::new(), None).await;
        }
        self.throttle(&[]).await;
        let api_arg = if scope_segments.len() == 1 {
            Value::Str(scope_segments[0].clone())
        } else {
            Value::Array(scope_segments.iter().map(|s| Value::Str(s.clone())).collect())
        };
        let scope_lookup: String = scope_segments.first().cloned().unwrap_or_default();
        // Static dispatch to the derived exchange's sign override.
        let signed = crate::exchange::DerivedExchange::sign(
            self,
            Value::Str(path.to_string()),
            api_arg,
            Value::Str(verb.to_string()),
            params.clone(),
            Value::Null,
            Value::Null,
        );
        if let Value::Dict(m) = &signed {
            let url = match m.get("url") { Some(Value::Str(s)) => s.clone(), _ => String::new() };
            let method = match m.get("method") { Some(Value::Str(s)) => s.clone(), _ => verb.to_string() };
            let body = match m.get("body") { Some(Value::Str(s)) => Some(s.clone()), _ => None };
            let headers = match m.get("headers") {
                Some(Value::Dict(h)) => h.iter()
                    .filter_map(|(k, v)| match v { Value::Str(s) => Some((k.clone(), s.clone())), _ => None })
                    .collect::<HashMap<_, _>>(),
                _ => HashMap::new(),
            };
            if !url.is_empty() {
                return self.fetch_typed(&url, &method, headers, body).await;
            }
        }
        let base = self.url_for_scope(&scope_lookup).ok_or_else(|| ExchangeError::new(
            "BadRequest",
            format!("no URL configured for api scope `{scope_lookup}`"),
        ))?;
        let imploded = self.implode_params(Value::Str(path.to_string()), params.clone());
        let path_str = match &imploded { Value::Str(s) => s.clone(), _ => path.to_string() };
        let consumed_keys = self.extract_path_params(path);
        let remaining_params = match params {
            Value::Dict(m) => {
                let mut keep = HashMap::new();
                let m = Arc::try_unwrap(m).unwrap_or_else(|a| (*a).clone());
                for (k, v) in m {
                    if !consumed_keys.contains(&k) { keep.insert(k, v); }
                }
                Value::Map(keep)
            }
            other => other,
        };
        let mut url = format!("{}/{}", base.trim_end_matches('/'), path_str.trim_start_matches('/'));
        let mut body: Option<String> = None;
        let qs = match &remaining_params {
            Value::Dict(m) if !m.is_empty() => self.urlencode_kv(&remaining_params),
            _ => String::new(),
        };
        if verb == "GET" || verb == "DELETE" {
            if !qs.is_empty() {
                url = format!("{}?{}", url, qs);
            }
        } else if !qs.is_empty() {
            body = Some(qs);
        }
        let mut headers = HashMap::new();
        if scope_lookup != "public" {
            if let Value::Str(k) = &self.apiKey {
                headers.insert("X-MBX-APIKEY".to_string(), k.clone());
            }
        }
        self.fetch_typed(&url, verb, headers, body).await
    }

    /// Route an implicit-API method name to `request_typed`.
    async fn implicit_api_call(&mut self, name: &str, params: Value) -> Result<Value> {
        if self.internals.implicit_api.is_empty() {
            self.build_implicit_api();
        }
        let entry = self.internals.implicit_api.get(name).cloned();
        let (path, scope_segments, verb) = match entry {
            Some(t) => t,
            None => return Err(ExchangeError::new(
                "NotSupported",
                format!("implicit API method {name} not found in api block"),
            )),
        };
        self.request_typed(&path, &scope_segments, &verb, params).await
    }

    /// Dispatch an implicit-API method by name (from transpiled `_api.rs`).
    async fn call_method(&mut self, name: Value, args: &[Value]) -> Value {
        let n = match name { Value::Str(s) => s, _ => return Value::Null };
        let params = args.get(0).cloned().unwrap_or(Value::Map(HashMap::new()));
        match self.implicit_api_call(&n, params).await {
            Ok(v) => v,
            Err(e) => {
                if matches!(self.verbose, Value::Bool(true)) {
                    eprintln!("[ccxt] {n} failed: {e}");
                }
                panic!("{e}");
            }
        }
    }

    /// Loads markets (and currencies), dispatching `fetch_markets` /
    /// `fetch_currencies` / `set_markets` to the derived overrides.
    async fn load_markets(&mut self, optional_args: &[Value]) -> Value {
        let reload = optional_args.get(0).cloned().unwrap_or(Value::Bool(false));
        let reload_b = matches!(reload, Value::Bool(true));
        if !reload_b && !self.markets.is_null() {
            return self.markets.clone();
        }
        let has_fetch_currencies = matches!(
            crate::get_value(&self.has, &Value::Str("fetchCurrencies".to_string())),
            Value::Bool(true),
        );
        let mut currencies = Value::Null;
        if has_fetch_currencies {
            if let Some(v) = self.dispatch_to_derived("fetch_currencies", Vec::new()).await {
                currencies = v;
            }
        }
        let fetched = match self.dispatch_to_derived("fetch_markets", Vec::new()).await {
            Some(v) => v,
            None => return Value::Null,
        };
        if matches!(fetched, Value::Null) {
            return self.markets.clone();
        }
        let preloaded_non_empty = matches!(&self.currencies, Value::Dict(m) if !m.is_empty());
        let currencies_arg = if matches!(&currencies, Value::Dict(m) if !m.is_empty()) {
            currencies
        } else if preloaded_non_empty {
            self.currencies.clone()
        } else {
            crate::exchange_stubs::synthesize_currencies_from_markets(&fetched, &self.precisionMode)
        };
        let is_prediction = matches!(
            crate::get_value(&self.has, &Value::Str("prediction".to_string())),
            Value::Bool(true),
        );
        if is_prediction {
            let _ = self.dispatch_to_derived("set_markets", vec![fetched, currencies_arg]).await;
        } else {
            <Self as crate::exchange_generated::ExchangeBase>::set_markets(self, fetched, &[currencies_arg]);
        }
        self.markets.clone()
    }

    // ── super.X() shims — call the BASE (ExchangeBase) method, fully-qualified
    // so a derived override is bypassed (that is what `super.X()` means).
    fn super_describe(&self) -> Value {
        <Self as crate::exchange_generated::ExchangeBase>::describe(self)
    }
    fn super_set_sandbox_mode(&mut self, enabled: Value) {
        <Self as crate::exchange_generated::ExchangeBase>::set_sandbox_mode(self, enabled);
    }
    fn super_safe_market(&self, id: Value, market: Value, delim: Value, market_type: Value) -> Value {
        <Self as crate::exchange_generated::ExchangeBase>::safe_market(self, &[id, market, delim, market_type])
    }
    fn super_handle_market_type_and_params(&self, method_name: Value, market: Value, params: Value, default_value: Value) -> Value {
        <Self as crate::exchange_generated::ExchangeBase>::handle_market_type_and_params(self, method_name, &[market, params, default_value])
    }
    fn super_market(&self, symbol: Value) -> Value {
        <Self as crate::exchange_generated::ExchangeBase>::market(self, symbol)
    }
    fn super_amount_to_precision(&self, symbol: Value, amount: Value) -> Value {
        <Self as crate::exchange_generated::ExchangeBase>::amount_to_precision(self, symbol, amount)
    }
    fn super_handle_margin_mode_and_params(&self, method_name: Value, params: Value, default_value: Value) -> Value {
        <Self as crate::exchange_generated::ExchangeBase>::handle_margin_mode_and_params(self, method_name, &[params, default_value])
    }
    fn super_safe_currency_code(&self, currency_id: Value, currency: Value) -> Value {
        <Self as crate::exchange_generated::ExchangeBase>::safe_currency_code(self, currency_id, &[currency])
    }
    fn super_set_markets(&mut self, markets: Value, currencies: Value) -> Value {
        <Self as crate::exchange_generated::ExchangeBase>::set_markets(self, markets, &[currencies])
    }
    fn super_network_id_to_code(&self, optional_args: &[Value]) -> Value {
        <Self as crate::exchange_generated::ExchangeBase>::network_id_to_code(self, optional_args)
    }
    fn super_network_code_to_id(&self, network_code: Value, optional_args: &[Value]) -> Value {
        <Self as crate::exchange_generated::ExchangeBase>::network_code_to_id(self, network_code, optional_args)
    }
    async fn super_fetch_deposit_address(&mut self, code: Value, params: Value) -> Value {
        self.fetch_deposit_address(code, &[params]).await
    }
    async fn super_load_markets(&mut self, reload: Value, params: Value) -> Value {
        self.load_markets(&[reload, params]).await
    }
}

impl<T: crate::exchange_generated::ExchangeBase> ExchangeRuntime for T {}

/// A minimal Core wrapping a bare `Exchange` with NO overrides. Lets code that
/// only has an `Exchange` value — `Value` snapshots (value.rs), the constructor
/// (`after_construct`), and base unit tests — call `ExchangeBase`/`ExchangeRuntime`
/// trait methods, which all resolve to the base defaults (review #1: base
/// methods are trait methods now, so a bare `Exchange` can't call them directly).
pub struct BaseCore {
    pub exchange: Exchange,
}
impl BaseCore {
    pub fn new(exchange: Exchange) -> Self { Self { exchange } }
    pub fn into_inner(self) -> Exchange { self.exchange }
}
impl std::ops::Deref for BaseCore {
    type Target = Exchange;
    fn deref(&self) -> &Exchange { &self.exchange }
}
impl std::ops::DerefMut for BaseCore {
    fn deref_mut(&mut self) -> &mut Exchange { &mut self.exchange }
}
impl DerivedExchange for BaseCore {}
impl crate::exchange_generated::ExchangeBase for BaseCore {
    fn call_dynamic<'a>(&'a mut self, method: &'a str, args: Vec<Value>)
        -> std::pin::Pin<Box<dyn std::future::Future<Output = Value> + 'a>>
    {
        Box::pin(async move { self.call_dynamic_base(method, args).await })
    }
}

// ── implicit API dispatch ───────────────────────────────────────────────────

impl Exchange {
    /// Builds the `name → (path, scope, verb)` dispatch table by walking
    /// the `self.api` Value::Map. Called lazily on first dynamic call.
    ///
    /// The `api` block layout is:
    ///   { <scope>: { <verb>: [path, path, ...] } }
    ///   { <scope>: { <subscope>: { <verb>: [path, ...] } } }
    /// — arbitrary nesting before the verb level. The verb is one of
    /// `get`/`post`/`put`/`delete`/`patch` (any case). All path components
    /// before the verb concatenate into the scope (joined by `_`).
    pub fn build_implicit_api(&mut self) {
        let mut map: HashMap<String, (String, Vec<String>, String)> = HashMap::new();
        Self::walk_api_node(&self.api, &[], &mut map);
        self.internals.implicit_api = map;
    }

    fn walk_api_node(
        node: &Value,
        crumbs: &[String],
        out: &mut HashMap<String, (String, Vec<String>, String)>,
    ) {
        let known_verbs = ["get", "post", "put", "delete", "patch"];
        let last_is_verb = crumbs.last()
            .map(|c| known_verbs.iter().any(|v| *v == c.to_lowercase().as_str()))
            .unwrap_or(false);
        match node {
            // If the current level is a verb (`get`/`post`/…) and its child
            // is a Map, the keys ARE the paths (and values are rate-limit
            // costs — exchange-specific).
            Value::Dict(m) if last_is_verb => {
                let verb = crumbs.last().unwrap().to_lowercase();
                // Method name uses snake-cased scope (`fapi_public_get_X`).
                let scope_snake = Self::api_scope_from_crumbs(&crumbs[..crumbs.len() - 1]);
                // But sign()/urls.api lookup uses the original segments
                // (camelCase, e.g. `["fapiPublic"]` for binance,
                //  `["public","common"]` for bitget, `["public","spot"]`
                //  for gate). Preserve as Vec<String> so the dispatcher
                //  can choose Value::Str (single) vs Value::Array (multi).
                let scope_segments: Vec<String> = crumbs[..crumbs.len() - 1].to_vec();
                for path_key in m.keys() {
                    Self::register_implicit(&verb, &scope_snake, &scope_segments, path_key, out);
                }
            }
            Value::Dict(m) => {
                for (key, child) in m.iter() {
                    let mut next = crumbs.to_vec();
                    next.push(key.clone());
                    Self::walk_api_node(child, &next, out);
                }
            }
            // Some exchanges use `Array<path-string>` at the verb level.
            Value::Arr(a) if last_is_verb => {
                let verb = crumbs.last().unwrap().to_lowercase();
                let scope_snake = Self::api_scope_from_crumbs(&crumbs[..crumbs.len() - 1]);
                let scope_segments: Vec<String> = crumbs[..crumbs.len() - 1].to_vec();
                for path in a.iter() {
                    let path_str = match path {
                        Value::Str(s) => s.clone(),
                        Value::Dict(pm) => match pm.get("method").or_else(|| pm.get("path")) {
                            Some(Value::Str(s)) => s.clone(),
                            _ => continue,
                        },
                        _ => continue,
                    };
                    Self::register_implicit(&verb, &scope_snake, &scope_segments, &path_str, out);
                }
            }
            _ => {}
        }
    }

    fn api_scope_from_crumbs(crumbs: &[String]) -> String {
        // The scope identifier in TS is camelCase (e.g. `fapiPrivate`),
        // but transpiled call sites are snake_case (`fapi_private_get_X`).
        // Convert each crumb camelCase → snake_case and join with `_`.
        crumbs.iter()
            .map(|s| s
                .chars()
                .enumerate()
                .flat_map(|(i, c)| {
                    if c.is_ascii_uppercase() && i > 0 {
                        vec!['_', c.to_ascii_lowercase()]
                    } else {
                        vec![c.to_ascii_lowercase()]
                    }
                })
                .collect::<String>())
            .collect::<Vec<_>>()
            .join("_")
    }

    fn register_implicit(
        verb: &str,
        scope_snake: &str,
        scope_segments: &[String],
        path: &str,
        out: &mut HashMap<String, (String, Vec<String>, String)>,
    ) {
        // CCXT's TS `defineRestApiEndpoint` builds the method name by
        // splitting the path on EVERY non-alphanumeric character:
        //   `path.split(/[^a-zA-Z0-9]/)` → capitalize each part → join.
        // So `:`, `{`, `}`, `/`, `.`, `-` are all separators. Examples:
        //   `ticker/24hr`                      → `Ticker24hr` → `ticker24hr`
        //   `lending/auto-invest`              → `LendingAutoInvest` → `lending_auto_invest`
        //   `candles/trade:{tf}:{sym}/hist`    → `CandlesTradeTfSymHist`
        //                                      → `candles_trade_tf_sym_hist`
        let camel: String = path
            .split(|c: char| !c.is_ascii_alphanumeric())
            .filter(|s| !s.is_empty())
            .map(|seg| {
                let mut chars = seg.chars();
                match chars.next() {
                    None => String::new(),
                    Some(c) => c.to_ascii_uppercase().to_string() + chars.as_str(),
                }
            })
            .collect();
        // snake_case from camel: insert `_` between [a-z\d] and [A-Z],
        // and between [A-Z]+ and [A-Z][a-z]. Mirrors the transpiler's
        // toSnakeCase exactly.
        let snake = Self::to_snake_case(&camel);
        let snake_name = format!("{scope_snake}_{verb}_{snake}");
        // CamelCase variant: `<scope_camel><Verb><PathCamel>` — TS often
        // constructs method names dynamically as camelCase (e.g. bit2c's
        // `"privatePostOrderAddOrder"`). `self.call_method(name, ...)`
        // looks up by exact string, so register both keys.
        let scope_camel: String = scope_segments.iter()
            .enumerate()
            .map(|(i, s)| {
                if i == 0 {
                    s.to_string()
                } else {
                    let mut chars = s.chars();
                    match chars.next() {
                        None => String::new(),
                        Some(c) => c.to_ascii_uppercase().to_string() + chars.as_str(),
                    }
                }
            })
            .collect();
        let verb_camel = {
            let mut chars = verb.chars();
            match chars.next() {
                None => String::new(),
                Some(c) => c.to_ascii_uppercase().to_string() + chars.as_str().to_lowercase().as_str(),
            }
        };
        let camel_name = format!("{scope_camel}{verb_camel}{camel}");
        let entry = (path.to_string(), scope_segments.to_vec(), verb.to_uppercase());
        out.insert(snake_name, entry.clone());
        if !out.contains_key(&camel_name) {
            out.insert(camel_name, entry);
        }
    }

    fn to_snake_case(s: &str) -> String {
        // 1st pass: `[A-Z]+([A-Z][a-z])` → `$1_$2`
        let bytes: Vec<char> = s.chars().collect();
        let mut out = String::with_capacity(s.len() + 4);
        for i in 0..bytes.len() {
            let c = bytes[i];
            let prev = if i > 0 { Some(bytes[i - 1]) } else { None };
            let next = if i + 1 < bytes.len() { Some(bytes[i + 1]) } else { None };
            if c.is_ascii_uppercase() {
                let prev_lower_or_digit = prev
                    .map(|p| p.is_ascii_lowercase() || p.is_ascii_digit())
                    .unwrap_or(false);
                let prev_upper = prev.map(|p| p.is_ascii_uppercase()).unwrap_or(false);
                let next_lower = next.map(|n| n.is_ascii_lowercase()).unwrap_or(false);
                if prev_lower_or_digit {
                    out.push('_');
                } else if prev_upper && next_lower {
                    out.push('_');
                }
            }
            out.push(c.to_ascii_lowercase());
        }
        // Collapse any `__` runs introduced by underscores already in input.
        while out.contains("__") {
            out = out.replace("__", "_");
        }
        out.trim_matches('_').to_string()
    }

    /// Resolves the base URL for a given api scope. Looks up
    /// `urls.api.<scope>`; if that's itself a map, prefers `rest`.
    fn url_for_scope(&self, scope: &str) -> Option<String> {
        let api = crate::get_value(&self.urls, &Value::Str("api".to_string()));
        // Try scoped first (binance-style: urls.api.public, urls.api.private).
        let scoped = crate::get_value(&api, &Value::Str(scope.to_string()));
        let raw = match scoped {
            Value::Str(s) => s,
            Value::Dict(m) => match m.get("rest").or_else(|| m.get("current")) {
                Some(Value::Str(s)) => s.clone(),
                _ => return self.fallback_rest_url(&api),
            },
            _ => return self.fallback_rest_url(&api),
        };
        Some(self.implode_hostname_typed(&raw))
    }

    /// Many exchanges (okx, kucoin, bitget, gate, hyperliquid, …) use
    /// a single `urls.api.rest` URL for all scopes. Fall back to it
    /// when the per-scope lookup misses.
    fn fallback_rest_url(&self, api: &Value) -> Option<String> {
        let rest = crate::get_value(api, &Value::Str("rest".to_string()));
        if let Value::Str(s) = rest {
            return Some(self.implode_hostname_typed(&s));
        }
        // Last resort: if urls.api itself is a string, use it.
        if let Value::Str(s) = api {
            return Some(self.implode_hostname_typed(s));
        }
        None
    }

    /// Internal typed `{hostname}` substitution.
    fn implode_hostname_typed(&self, url: &str) -> String {
        let host = match &self.hostname {
            Value::Str(s) => s.clone(),
            _ => return url.to_string(),
        };
        url.replace("{hostname}", &host)
    }

    /// Dispatches an implicit API call. Looks the method up in the dispatch
    /// table (building it on first use) and routes through `request`.
    /// Public-endpoint request: imploding params into the path/query and
    /// hitting `fetch`. Private endpoints need per-exchange signing — for
    /// now we treat anything outside `public` as a stub that returns Null.

    fn extract_path_params(&self, path: &str) -> Vec<String> {
        let mut out: Vec<String> = vec![];
        let mut chars = path.chars().peekable();
        while let Some(c) = chars.next() {
            if c == '{' {
                let mut name = String::new();
                while let Some(&nc) = chars.peek() {
                    if nc == '}' { chars.next(); break; }
                    name.push(nc); chars.next();
                }
                if !name.is_empty() { out.push(name); }
            }
        }
        out
    }
}

/// Raw digest bytes for a named hash algorithm — includes Keccak-256
/// (`keccak`), used by ETH-style signing (hyperliquid, etc.).
pub(crate) fn hash_raw(data: &[u8], algo: &str) -> Vec<u8> {
    match algo.to_ascii_lowercase().as_str() {
        "sha256" => { let mut h = Sha256::new(); h.update(data); h.finalize().to_vec() }
        "sha512" => { let mut h = Sha512::new(); h.update(data); h.finalize().to_vec() }
        "sha1"   => { let mut h = Sha1::new();   h.update(data); h.finalize().to_vec() }
        "md5"    => { let mut h = Md5::new();    h.update(data); h.finalize().to_vec() }
        "keccak" | "keccak256" => {
            use sha3::{Keccak256, Digest as _};
            let mut h = Keccak256::new();
            h.update(data);
            h.finalize().to_vec()
        }
        _ => Vec::new(),
    }
}

/// EIP-712 `encode` — produces the `\x19\x01 || domainSeparator ||
/// hashStruct(message)` preimage. The caller keccak-hashes this into the
/// 32-byte digest that gets ECDSA-signed (hyperliquid, etc.).
type Eip712Types = std::collections::BTreeMap<String, Vec<(String, String)>>;

/// Strip a trailing `[...]` array suffix from an EIP-712 field type, so
/// `Order[]` and `Order` both resolve to the struct name `Order`.
fn eip712_base_type(ty: &str) -> &str {
    match ty.find('[') { Some(i) => &ty[..i], None => ty }
}

/// EIP-712 `encodeType`: the primary type's signature followed by every
/// referenced struct type, sorted alphabetically (per the spec), so a nested
/// `TypedDataSign(Order contents,…)` correctly appends `Order(uint256 salt,…)`.
fn eip712_encode_type(primary: &str, types: &Eip712Types) -> String {
    fn collect(name: &str, types: &Eip712Types, deps: &mut std::collections::BTreeSet<String>) {
        if let Some(fields) = types.get(name) {
            for (_, ty) in fields {
                let base = eip712_base_type(ty).to_string();
                if types.contains_key(&base) && deps.insert(base.clone()) {
                    collect(&base, types, deps);
                }
            }
        }
    }
    let fmt = |name: &str| -> String {
        let fields = types.get(name).cloned().unwrap_or_default();
        let inner: Vec<String> = fields.iter().map(|(n, t)| format!("{t} {n}")).collect();
        format!("{}({})", name, inner.join(","))
    };
    let mut deps = std::collections::BTreeSet::new();
    collect(primary, types, &mut deps);
    deps.remove(primary);
    let mut out = fmt(primary);
    for dep in &deps { out.push_str(&fmt(dep)); } // BTreeSet iterates sorted
    out
}

pub(crate) fn eip712_encode(domain: &Value, types: &Value, message: &Value) -> Vec<u8> {
    let dm = match domain { Value::Dict(m) => m, _ => return Vec::new() };
    // EIP712Domain field set — canonical order, only the keys present.
    let mut domain_fields: Vec<(String, String)> = Vec::new();
    for (n, t) in [("name", "string"), ("version", "string"), ("chainId", "uint256"),
                   ("verifyingContract", "address"), ("salt", "bytes32")] {
        if dm.contains_key(n) { domain_fields.push((n.to_string(), t.to_string())); }
    }
    // Domain has no nested structs — a flat (empty type-map) hash.
    let mut domain_types: Eip712Types = Eip712Types::new();
    domain_types.insert("EIP712Domain".to_string(), domain_fields);
    let domain_sep = eip712_hash_struct("EIP712Domain", domain, &domain_types);

    // Collect all user-defined types (name → fields), excluding EIP712Domain.
    let mut type_map: Eip712Types = Eip712Types::new();
    if let Value::Dict(m) = types {
        for (name, def) in m.iter() {
            if name == "EIP712Domain" { continue; }
            if let Value::Arr(arr) = def {
                let fields: Vec<(String, String)> = arr.iter().filter_map(|it| match it {
                    Value::Dict(fm) => Some((
                        fm.get("name")?.as_str()?.to_string(),
                        fm.get("type")?.as_str()?.to_string(),
                    )),
                    _ => None,
                }).collect();
                type_map.insert(name.clone(), fields);
            }
        }
    }
    if type_map.is_empty() { return Vec::new(); }
    // Primary type = the one not referenced as a field type by any other type
    // (the top-level struct). Falls back to the first key.
    let referenced: std::collections::HashSet<String> = type_map.values()
        .flat_map(|fs| fs.iter().map(|(_, t)| eip712_base_type(t).to_string()))
        .collect();
    let primary = type_map.keys().find(|k| !referenced.contains(*k)).cloned()
        .unwrap_or_else(|| type_map.keys().next().cloned().unwrap_or_default());
    let struct_hash = eip712_hash_struct(&primary, message, &type_map);
    let mut out = vec![0x19u8, 0x01u8];
    out.extend_from_slice(&domain_sep);
    out.extend_from_slice(&struct_hash);
    out
}

/// EIP-712 `hashStruct(typeName, data)`: keccak(typeHash ‖ encoded-fields),
/// where a field whose type is itself a struct in `types` is hashed recursively.
fn eip712_hash_struct(type_name: &str, data: &Value, types: &Eip712Types) -> Vec<u8> {
    let type_str = eip712_encode_type(type_name, types);
    let mut enc = hash_raw(type_str.as_bytes(), "keccak"); // typeHash (32 bytes)
    let dm = match data { Value::Dict(m) => Some(m), _ => None };
    let fields = types.get(type_name).cloned().unwrap_or_default();
    for (name, ty) in &fields {
        let v = dm.and_then(|m| m.get(name)).cloned().unwrap_or(Value::Null);
        let base = eip712_base_type(ty);
        if types.contains_key(base) {
            // Nested struct field — recurse.
            enc.extend_from_slice(&eip712_hash_struct(base, &v, types));
        } else {
            enc.extend_from_slice(&eip712_encode_value(ty, &v));
        }
    }
    hash_raw(&enc, "keccak")
}

/// Encodes an integer into a 32-byte EIP-712 / ABI word for a `uintN`/`intN`
/// type, validating the declared bit width. Fails closed (panics) on a negative
/// value in an unsigned type, or any value that overflows the declared width,
/// instead of silently truncating to 32 bytes or routing a negative through the
/// unsigned branch (review #15). Valid, in-range values encode exactly as
/// before (big-endian right-aligned for uint; two's-complement sign-extended
/// for int), so signing of well-formed payloads is unchanged.
pub(crate) fn eip712_int_word(ty: &str, n: &num_bigint::BigInt) -> [u8; 32] {
    use num_bigint::{BigInt, Sign};
    let signed = ty.starts_with("int");
    let digits = ty.trim_start_matches(if signed { "int" } else { "uint" });
    let mut width: usize = if digits.is_empty() { 256 } else { digits.parse().unwrap_or(256) };
    if !((8..=256).contains(&width) && width % 8 == 0) { width = 256; }
    let mut out = [0u8; 32];
    if !signed {
        if n.sign() == Sign::Minus {
            panic!("eip712/abi: negative value {n} supplied for unsigned type {ty}");
        }
        let max = (BigInt::from(1) << width) - 1;
        if n > &max {
            panic!("eip712/abi: value {n} overflows {ty} (max {max})");
        }
        let (_, be) = n.to_bytes_be();
        let take = be.len().min(32);
        out[32 - take..].copy_from_slice(&be[be.len() - take..]);
    } else {
        let min = -(BigInt::from(1) << (width - 1));
        let max = (BigInt::from(1) << (width - 1)) - 1;
        if n < &min || n > &max {
            panic!("eip712/abi: value {n} out of range for {ty} ([{min}, {max}])");
        }
        if n.sign() == Sign::Minus { out = [0xff; 32]; }
        let be = n.to_signed_bytes_be();
        let take = be.len().min(32);
        out[32 - take..].copy_from_slice(&be[be.len() - take..]);
    }
    out
}

fn eip712_encode_value(ty: &str, v: &Value) -> [u8; 32] {
    let mut out = [0u8; 32];
    if ty == "string" || ty == "bytes" {
        out.copy_from_slice(&hash_raw(&value_to_bytes(v), "keccak"));
    } else if ty.starts_with("bytes") {
        // bytesN — left-aligned.
        let b = eip712_bytes(v);
        let n = b.len().min(32);
        out[..n].copy_from_slice(&b[..n]);
    } else if ty == "address" {
        // 20-byte address, right-aligned (left-padded with zeros).
        let b = eip712_bytes(v);
        let take = b.len().min(20);
        out[32 - take..].copy_from_slice(&b[b.len() - take..]);
    } else if ty == "bool" {
        if matches!(v, Value::Bool(true)) { out[31] = 1; }
    } else if ty.starts_with("uint") || ty.starts_with("int") {
        // uint256 (e.g. polymarket tokenId) exceeds u128 — use BigInt. Signed
        // intN uses two's-complement, sign-extended to 32 bytes.
        use num_bigint::{BigInt, Sign};
        let n: BigInt = match v {
            Value::Int(i)   => BigInt::from(*i),
            Value::Float(f) => BigInt::from(*f as i64),
            Value::Str(s)   => {
                let t = s.trim();
                if let Some(h) = t.strip_prefix("0x") {
                    BigInt::parse_bytes(h.as_bytes(), 16).unwrap_or_default()
                } else {
                    BigInt::parse_bytes(t.as_bytes(), 10).unwrap_or_default()
                }
            }
            _ => BigInt::from(0),
        };
        out = eip712_int_word(ty, &n);
    }
    out
}

/// Decode an EIP-712 byte value: a `0x`-hex string or a byte-array Value.
fn eip712_bytes(v: &Value) -> Vec<u8> {
    match v {
        Value::Str(s) => {
            let h = s.strip_prefix("0x").unwrap_or(s);
            hex::decode(h).unwrap_or_else(|_| s.as_bytes().to_vec())
        }
        _ => value_to_bytes(v),
    }
}

pub(crate) fn value_to_bytes(v: &Value) -> Vec<u8> {
    match v {
        Value::Str(s) => s.as_bytes().to_vec(),
        Value::Arr(a) => a.iter().filter_map(|x| match x {
            Value::Int(n) => Some(*n as u8),
            _ => None,
        }).collect(),
        _ => Vec::new(),
    }
}

pub(crate) fn url_pct(s: &str) -> String {
    s.bytes().map(|b| match b {
        b'A'..=b'Z' | b'a'..=b'z' | b'0'..=b'9' | b'-' | b'_' | b'.' | b'~' => (b as char).to_string(),
        _ => format!("%{b:02X}"),
    }).collect()
}

#[cfg(test)]
mod eip712_int_tests {
    use super::eip712_int_word;
    use num_bigint::BigInt;

    #[test]
    fn uint8_max_ok_and_int8_bounds_ok() {
        assert_eq!(eip712_int_word("uint8", &BigInt::from(255))[31], 255);
        let _ = eip712_int_word("int8", &BigInt::from(127));
        let _ = eip712_int_word("int8", &BigInt::from(-128));
    }

    #[test]
    fn i64_u64_boundaries_ok() {
        let _ = eip712_int_word("int64", &BigInt::from(i64::MAX));
        let _ = eip712_int_word("int64", &BigInt::from(i64::MIN));
        let _ = eip712_int_word("uint64", &BigInt::from(u64::MAX));
    }

    // u64::MAX + 1 (2^64) must fit a uint256 exactly: 0x01 followed by 8 zero
    // bytes, right-aligned → byte index 23.
    #[test]
    fn u64_plus_one_preserved_in_uint256() {
        let n = BigInt::from(u64::MAX) + 1;
        assert_eq!(eip712_int_word("uint256", &n)[23], 1);
    }

    #[test]
    fn negative_int_is_twos_complement() {
        assert_eq!(eip712_int_word("int256", &BigInt::from(-1)), [0xff; 32]);
    }

    #[test]
    #[should_panic(expected = "overflows")]
    fn uint8_overflow_rejected() { let _ = eip712_int_word("uint8", &BigInt::from(256)); }

    #[test]
    #[should_panic(expected = "negative")]
    fn uint_negative_rejected() { let _ = eip712_int_word("uint256", &BigInt::from(-1)); }

    #[test]
    #[should_panic(expected = "out of range")]
    fn int8_overflow_rejected() { let _ = eip712_int_word("int8", &BigInt::from(128)); }

    #[test]
    #[should_panic(expected = "overflows")]
    fn uint64_plus_one_rejected() {
        let _ = eip712_int_word("uint64", &(BigInt::from(u64::MAX) + 1));
    }
}

#[cfg(test)]
mod throttle_tests {
    use super::Exchange;
    use crate::Value;

    // The leaky-bucket limiter must space requests by ~rateLimit ms (real time).
    #[tokio::test]
    async fn spaces_requests_by_rate_limit() {
        let mut ex = Exchange::new(None);
        ex.enableRateLimit = Value::Bool(true);
        ex.rateLimit = Value::Int(15); // 15 ms per token
        let start = std::time::Instant::now();
        for _ in 0..5 { ex.throttle(&[]).await; }
        let elapsed = start.elapsed().as_millis();
        // 1st immediate, next 4 each wait ~15ms → ≥ ~45ms (generous lower bound).
        assert!(elapsed >= 45, "throttle did not space requests: {elapsed}ms");
    }

    // Disabled rate limiting must not sleep at all.
    #[tokio::test]
    async fn disabled_is_noop() {
        let mut ex = Exchange::new(None);
        ex.enableRateLimit = Value::Bool(false);
        ex.rateLimit = Value::Int(1000);
        let start = std::time::Instant::now();
        for _ in 0..5 { ex.throttle(&[]).await; }
        assert!(start.elapsed().as_millis() < 50, "disabled throttle slept");
    }
}

#[cfg(all(test, feature = "transpiled-base"))]
mod rate_limit_config_tests {
    use crate::Value;

    // init() must apply describe().rateLimit so the limiter spaces requests at
    // the venue rate instead of the base 2000ms default (review #8). binance
    // declares rateLimit: 50.
    #[test]
    fn binance_init_applies_describe_rate_limit() {
        let b = crate::exchanges::binance::BinanceCore::new(None);
        assert_eq!(
            b.exchange.rateLimit,
            Value::Int(50),
            "init() dropped describe().rateLimit; got {:?}",
            b.exchange.rateLimit
        );
    }

    // A caller-supplied rateLimit must win over describe()'s value.
    #[test]
    fn config_rate_limit_overrides_describe() {
        let mut cfg = crate::value::HashMap::new();
        cfg.insert("rateLimit".to_string(), Value::Int(123));
        let b = crate::exchanges::binance::BinanceCore::new(Some(Value::Map(cfg)));
        assert_eq!(b.exchange.rateLimit, Value::Int(123), "config rateLimit was clobbered by describe()");
    }
}

#[cfg(all(test, feature = "transpiled-base"))]
mod sandbox_mode_tests {
    use crate::Value;

    // super_set_sandbox_mode was a no-op, so venues that override setSandboxMode
    // (binance, okx, gate, …) never actually switched to their sandbox URL
    // (review #9). After delegating to the base, set_sandbox_mode(true) must
    // swap urls['api'] -> urls['test'] and toggle isSandboxModeEnabled.
    #[test]
    fn binance_sandbox_swaps_api_url() {
        let mut b = crate::exchanges::binance::BinanceCore::new(None);
        let test_url = crate::get_value(&b.exchange.urls, &Value::Str("test".to_string()));
        assert!(!matches!(test_url, Value::Null), "binance describe() has no test url");
        b.set_sandbox_mode(Value::Bool(true));
        assert_eq!(b.exchange.isSandboxModeEnabled, Value::Bool(true));
        let api_url = crate::get_value(&b.exchange.urls, &Value::Str("api".to_string()));
        assert_eq!(api_url, test_url, "sandbox mode did not switch urls['api'] to urls['test']");
    }
}

#[cfg(all(test, feature = "transpiled-base"))]
mod cow_alias_tests {
    use super::Exchange;
    use crate::Value;
    use crate::runtime::get_array_length;

    // convertOHLCVToTradingView does `result[key].push(...)` on an extracted
    // local — a COW clone in Rust. Without the write-back the result columns
    // stay empty. Assert the data survives (review P0-C).
    #[test]
    fn convert_ohlcv_to_trading_view_preserves_pushes() {
        use crate::exchange_generated::ExchangeBase;
        let ex = super::BaseCore::new(Exchange::new(None));
        let row = Value::List(vec![
            Value::Int(1_700_000_000_000), Value::Int(1), Value::Int(2),
            Value::Int(0), Value::Int(1), Value::Int(10),
        ]);
        let ohlcvs = Value::List(vec![row.clone(), row]);
        let r = ex.convert_ohlcv_to_trading_view(ohlcvs, &[]);
        for key in ["t", "o", "h", "l", "c", "v"] {
            let col = crate::get_value(&r, &Value::Str(key.to_string()));
            assert_eq!(get_array_length(&col), Value::Int(2),
                "result['{key}'] lost its pushes — COW write-back failed");
        }
    }
}
