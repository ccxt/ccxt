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
use sha2::{Sha256, Sha384, Sha512, Digest as Sha2Digest};
use sha1::Sha1;
use md5::Md5;
use base64::{engine::general_purpose::STANDARD as B64, Engine as _};
use crate::{Value, ExchangeError, Result};


/// Callback type used by derived exchanges to provide their `describe()` data.
pub type DescribeCallback = Arc<dyn Fn() -> Value + Send + Sync>;

// HTTP/JSON timing counters — accumulated by `fetch_typed`, read+reset
// by the CLI / benchmarks via `take_http_timings()`.
#[derive(Default)]
struct HttpTimings { http_nanos: u64, json_nanos: u64, http_calls: u64 }

// One owner thread holds the three counters; a caller hands it an add and never
// waits, so there is no lock on the HTTP path. A read is ordered behind every
// add this thread already posted.
static TIMINGS: std::sync::LazyLock<crate::value::OwnerThread<HttpTimings>> =
    std::sync::LazyLock::new(|| {
        crate::value::OwnerThread::spawn("ccxt-http-timings", HttpTimings::default())
    });

fn timings_add(http_calls: u64, http_nanos: u64, json_nanos: u64) {
    TIMINGS.post(move |t| {
        t.http_calls += http_calls;
        t.http_nanos += http_nanos;
        t.json_nanos += json_nanos;
    });
}

tokio::task_local! {
    // URLs whose WS drive loop is active on the current task's call stack. A
    // spawned coroutine that does a nested `self.watch(sameUrl)` (bitvavo's
    // getBook, htx's snapshot req) must NOT start a second drive loop — that
    // would block the outer loop on a hash the outer loop is responsible for
    // resolving. Instead it just sends its subscribe frame and returns; the
    // outer loop processes the reply. Task-local so it survives task migration;
    // immutable, so a nested drive extends it with its own scope, not a lock.
    static WS_DRIVEN_URLS: Vec<String>;
}

/// Snapshot + reset the global HTTP/JSON timings. Returns
/// `(http_nanos, json_nanos, http_calls)` and zeroes them.
pub fn take_http_timings() -> (u64, u64, u64) {
    TIMINGS.run(|t| (
        std::mem::take(&mut t.http_nanos),
        std::mem::take(&mut t.json_nanos),
        std::mem::take(&mut t.http_calls),
    ))
}

// ── Internals (Rust-typed runtime state, not exposed to transpiled code) ─────

// ── Rate limiter: one owner task, channel hand-off ──────────────────────────
// The leaky bucket is stateful and must serialize requests, so a single task
// owns it and every caller hands it a request and awaits the reply. No lock is
// held across the sleep and the bucket refill is never observed half-applied.
pub struct ThrottleHandle {
    tx: std::sync::OnceLock<tokio::sync::mpsc::UnboundedSender<ThrottleJob>>,
}

struct ThrottleJob {
    refill_rate: f64,
    capacity:    f64,
    delay_ms:    f64,
    cost:        f64,
    reply:       tokio::sync::oneshot::Sender<()>,
}

impl Default for ThrottleHandle {
    fn default() -> Self { ThrottleHandle { tx: std::sync::OnceLock::new() } }
}

impl ThrottleHandle {
    fn sender(&self) -> &tokio::sync::mpsc::UnboundedSender<ThrottleJob> {
        self.tx.get_or_init(|| {
            let (tx, mut rx) = tokio::sync::mpsc::unbounded_channel::<ThrottleJob>();
            tokio::spawn(async move {
                let mut tokens: f64 = 0.0;
                let mut last_ms: i64 = 0;
                while let Some(job) = rx.recv().await {
                    let n = now_ms();
                    if last_ms == 0 { last_ms = n; }
                    tokens = (tokens + job.refill_rate * (n - last_ms).max(0) as f64).min(job.capacity);
                    last_ms = n;
                    if tokens < 0.0 {
                        let wait = ((-tokens) / job.refill_rate).max(job.delay_ms);
                        tokio::time::sleep(std::time::Duration::from_millis(wait.ceil() as u64)).await;
                        let n2 = now_ms();
                        tokens = (tokens + job.refill_rate * (n2 - last_ms).max(0) as f64).min(job.capacity);
                        last_ms = n2;
                    }
                    tokens -= job.cost;
                    let _ = job.reply.send(());
                }
            });
            tx
        })
    }

    /// Queues one request on the bucket's owner and returns once it has been
    /// served (which is what serializes concurrent callers on one instance).
    pub(crate) async fn wait(&self, refill_rate: f64, capacity: f64, delay_ms: f64, cost: f64) {
        let (reply, done) = tokio::sync::oneshot::channel::<()>();
        let job = ThrottleJob { refill_rate, capacity, delay_ms, cost, reply };
        if self.sender().send(job).is_err() { return; }
        let _ = done.await;
    }
}

fn now_ms() -> i64 {
    std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map(|d| d.as_millis() as i64)
        .unwrap_or(0)
}

pub struct Internals {
    pub http_client:    Option<reqwest::Client>,
    /// `validateServerSsl` the cached `http_client` was built with, so a later flip rebuilds it.
    pub http_client_validates_ssl: bool,
    pub describe_cb:    Option<DescribeCallback>,
    pub last_rest_ts:   i64,
    pub headers:        HashMap<String, String>,
    /// Leaky-bucket rate-limiter state, `(tokens, last_refill_ms)`, owned by one
    /// task so the `&self` async `throttle()` can serialize requests on one
    /// exchange instance without a lock. See `ThrottleHandle`.
    pub throttle:       ThrottleHandle,
    /// Cached dispatch table built from `self.api`. Maps the snake-case
    /// implicit API name (e.g. `public_get_exchange_info`) to
    /// `(path, api_scope, http_verb, endpoint_config)`.
    pub implicit_api:   HashMap<String, (String, Vec<String>, String, Value)>,
    /// Method names currently being dispatched to a derived override. Lets the
    /// async `dispatch_to_derived` default (in `ExchangeBase`) block recursion
    /// on a single method while allowing sibling dispatches. This is the only
    /// dispatch state left — virtual dispatch itself is now static (review #1),
    /// so there are no raw self-pointers to keep.
    pub dispatch_stack:       Vec<String>,
    /// Last snake_case name that reached `call_dynamic_base`'s `_` arm and
    /// matched neither a dispatch arm nor an implicit-API endpoint. That arm
    /// must keep returning `Value::Null` (a static-request test may probe an
    /// optional name), but a dynamic re-entry from `fetchPaginatedCall*` /
    /// `fetchWebEndpoint` treats a miss as fatal — see
    /// `crate::exchange::call_dynamic_required`.
    pub dynamic_dispatch_miss: Option<String>,
    /// Typed views of `markets_by_id` / `currencies_by_id` / `currencies`, rebuilt only when the source map changes.
    pub typed_by_id: std::sync::Mutex<TypedByIdStores>,
}

/// A typed by-id store decoded once from one source dict: `rows[i]` holds the records of the
/// source's i-th id, so a lookup is one index probe and the keys are never copied.
pub struct TypedById<T> {
    source: Option<crate::value::Dict>,
    rows: Vec<Vec<T>>,
}

impl<T> Default for TypedById<T> {
    fn default() -> Self { TypedById { source: None, rows: Vec::new() } }
}

#[derive(Default)]
pub struct TypedByIdStores {
    pub markets:    Arc<TypedById<crate::types::Market>>,
    pub currencies: Arc<TypedById<crate::types::Currency>>,
    pub currencies_by_code: Arc<TypedById<crate::types::Currency>>,
}

impl<T> TypedById<T> {
    /// The records stored under exchange id `id` (several markets can share one id).
    pub fn records_by_id(&self, id: &str) -> Option<&[T]> {
        let index = self.source.as_ref()?.get_index_of(id)?;
        self.rows.get(index).map(Vec::as_slice)
    }
    fn is_from(&self, src: Option<&crate::value::Dict>) -> bool {
        match (&self.source, src) { (Some(a), Some(b)) => Arc::ptr_eq(a, b), (None, None) => true, _ => false }
    }
    /// The shared store for `src`, decoded only when `src` is not the dict decoded last time.
    fn refresh(store: &mut Arc<Self>, src: Option<&crate::value::Dict>, decode: impl Fn(&Value) -> Vec<T>) -> Arc<Self> {
        if !store.is_from(src) {
            let source = src.map(Arc::clone);
            let rows = source.as_deref().map_or_else(Vec::new, |m| m.values().map(&decode).collect());
            *store = Arc::new(TypedById { source, rows });
        }
        Arc::clone(store)
    }
}

/// The Go-style "interface" that every derived exchange implements. When
/// Exchange.ts calls `this.parseTicker(...)` (and similar), the transpiler
/// rewrites it to `self.derived().parse_ticker(...)`; that goes through
/// this trait's vtable to the derived exchange's override.
///
/// Default impls delegate to `derived_parent()` and return `Value::Null`
/// without one, so an unbound Exchange still compiles and runs.
pub trait DerivedExchange {
    /// The parent core of a subclass; each default below delegates to it, or returns Null without one.
    fn derived_parent(&self) -> Option<&impl crate::exchange_generated::ExchangeBase> { None::<&BaseCore> }
    /// The same parent for the `&mut self` slots (sign, handle_errors).
    fn derived_parent_mut(&mut self) -> Option<&mut impl crate::exchange_generated::ExchangeBase> { None::<&mut BaseCore> }
    // ── parsers (the dominant override surface) ──────────────────────────
    fn parse_ticker(&self, ticker: impl Into<Value>, market: Option<&crate::types::Market>) -> Option<crate::value::Dict> { self.derived_parent().and_then(|p| DerivedExchange::parse_ticker(p, ticker, market)) }
    fn parse_trade(&self, trade: impl Into<Value>, market: Option<&crate::types::Market>) -> Option<crate::value::Dict> { self.derived_parent().and_then(|p| DerivedExchange::parse_trade(p, trade, market)) }
    fn parse_order(&self, order: impl Into<Value>, market: Option<&crate::types::Market>) -> Option<crate::value::Dict> { self.derived_parent().and_then(|p| DerivedExchange::parse_order(p, order, market)) }
    fn parse_market(&self, market: impl Into<Value>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_market(p, market)) }
    fn parse_ohlcv(&self, ohlcv: Value, market: Option<&crate::types::Market>) -> Option<crate::value::List> { self.derived_parent().and_then(|p| DerivedExchange::parse_ohlcv(p, ohlcv, market)) }
    fn parse_order_book(&self, ob: impl Into<Value>, symbol: Value, optional_args: &[Value]) -> Option<crate::value::Dict> { self.derived_parent().and_then(|p| DerivedExchange::parse_order_book(p, ob, symbol, optional_args)) }
    fn parse_balance(&self, response: impl Into<Value>) -> Option<crate::value::Dict> { self.derived_parent().and_then(|p| DerivedExchange::parse_balance(p, response)) }
    fn parse_position(&self, position: impl Into<Value>, market: Option<&crate::types::Market>) -> Option<crate::value::Dict> { self.derived_parent().and_then(|p| DerivedExchange::parse_position(p, position, market)) }
    fn parse_funding_rate(&self, rate: impl Into<Value>, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_funding_rate(p, rate, market)) }
    fn parse_deposit(&self, tx: Value, currency: Option<&crate::types::Currency>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_deposit(p, tx, currency)) }
    fn parse_deposit_address(&self, addr: impl Into<Value>, currency: Option<&crate::types::Currency>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_deposit_address(p, addr, currency)) }
    fn parse_last_price(&self, entry: impl Into<Value>, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_last_price(p, entry, market)) }
    fn parse_withdrawal(&self, tx: Value, currency: Option<&crate::types::Currency>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_withdrawal(p, tx, currency)) }
    fn parse_ledger_entry(&self, entry: impl Into<Value>, currency: Option<&crate::types::Currency>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_ledger_entry(p, entry, currency)) }
    fn parse_transfer(&self, transfer: impl Into<Value>, currency: Option<&crate::types::Currency>) -> Option<crate::value::Dict> { self.derived_parent().and_then(|p| DerivedExchange::parse_transfer(p, transfer, currency)) }
    fn parse_currency(&mut self, currency: impl Into<Value>) -> Value { self.derived_parent_mut().map_or(Value::Null, |p| DerivedExchange::parse_currency(p, currency)) }
    fn parse_bid_ask(&self, bidask: Value, price_key: Value, amount_key: Value, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_bid_ask(p, bidask, price_key, amount_key, market)) }
    fn parse_open_interest(&self, interest: impl Into<Value>, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_open_interest(p, interest, market)) }
    fn parse_liquidation(&self, liquidation: Value, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_liquidation(p, liquidation, market)) }
    fn parse_funding_rate_history(&self, entry: Value, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_funding_rate_history(p, entry, market)) }
    fn parse_margin_modification(&self, data: impl Into<Value>, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_margin_modification(p, data, market)) }
    fn parse_account(&self, account: impl Into<Value>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_account(p, account)) }
    fn parse_my_trade(&self, trade: impl Into<Value>, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_my_trade(p, trade, market)) }
    fn parse_transaction(&self, transaction: impl Into<Value>, currency: Option<&crate::types::Currency>) -> Option<crate::value::Dict> { self.derived_parent().and_then(|p| DerivedExchange::parse_transaction(p, transaction, currency)) }
    fn parse_borrow_interest(&self, info: impl Into<Value>, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_borrow_interest(p, info, market)) }
    fn parse_adl_rank(&self, info: impl Into<Value>, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_adl_rank(p, info, market)) }
    fn parse_income(&self, info: impl Into<Value>, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_income(p, info, market)) }
    fn parse_greeks(&self, greeks: impl Into<Value>, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_greeks(p, greeks, market)) }
    fn parse_margin_mode(&self, margin_mode: impl Into<Value>, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_margin_mode(p, margin_mode, market)) }
    fn parse_conversion(&self, conversion: impl Into<Value>, from_currency: Option<&crate::types::Currency>, to_currency: Option<&crate::types::Currency>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_conversion(p, conversion, from_currency, to_currency)) }
    fn parse_borrow_rate(&self, info: Value, currency: Option<&crate::types::Currency>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_borrow_rate(p, info, currency)) }
    fn parse_leverage(&self, leverage: impl Into<Value>, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_leverage(p, leverage, market)) }
    fn parse_market_leverage_tiers(&self, info: impl Into<Value>, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_market_leverage_tiers(p, info, market)) }
    fn parse_deposit_withdraw_fee(&self, fee: impl Into<Value>, currency: Option<&crate::types::Currency>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_deposit_withdraw_fee(p, fee, currency)) }
    fn create_expired_option_market(&self, symbol: Value) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::create_expired_option_market(p, symbol)) }
    /// Typed like `ExchangeBase::market`, whose dispatch hands the call here unchanged; the default is the parent's, else the base lookup.
    fn market(&self, symbol: &str) -> Result<crate::types::Market> where Self: crate::exchange_generated::ExchangeBase {
        match self.derived_parent() { Some(p) => DerivedExchange::market(p, symbol), None => crate::exchange_generated::ExchangeBase::market_non_virtual(self, symbol) }
    }
    // ── prediction-tier parsers (overridden by prediction venues) ────────
    fn parse_prediction_trade(&self, trade: impl Into<Value>, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_prediction_trade(p, trade, market)) }
    fn parse_prediction_order(&self, order: impl Into<Value>, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_prediction_order(p, order, market)) }
    fn parse_prediction_position(&self, position: impl Into<Value>, market: Option<&crate::types::Market>) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::parse_prediction_position(p, position, market)) }
    // ── signers / error handlers ─────────────────────────────────────────
    /// `nonce()` — the request timestamp. The base default is `seconds()`, but
    /// 47 venues override it (binance: `milliseconds() - timeDifference`), and
    /// without a slot here the override is invisible to any caller that reaches
    /// the base through a trait method — notably a pro Core, which finds
    /// `ExchangeBase::nonce` at deref step 0 and never looks at the REST
    /// parent's inherent one. Binance spot then signs its ws-api subscribe with
    /// a seconds timestamp and the venue answers -1130.
    fn nonce(&self) -> Value { self.derived_parent().map_or(Value::Null, |p| DerivedExchange::nonce(p)) }
    fn sign(&mut self, path: &str, optional_args: &[Value]) -> Option<crate::value::Dict> { self.derived_parent_mut().and_then(|p| DerivedExchange::sign(p, path, optional_args)) }
    fn handle_errors(&mut self, code: i64, reason: &str, url: &str, method: &str, headers: Value, body: &str, response: Value, request_headers: Value, request_body: Value) -> Value { self.derived_parent_mut().map_or(Value::Null, |p| DerivedExchange::handle_errors(p, code, reason, url, method, headers, body, response, request_headers, request_body)) }
}

// `Internals` no longer holds raw pointers, so `Send`/`Sync` are auto-derived
// (its fields — `reqwest::Client`, `Arc<dyn Fn + Send + Sync>`,
// `ThrottleHandle`, maps, `Vec<String>` — are all thread-safe). No manual
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
            http_client_validates_ssl: true,
            describe_cb:      None,
            last_rest_ts:     0,
            headers:          HashMap::new(),
            throttle:         ThrottleHandle::default(),
            implicit_api:     HashMap::new(),
            dispatch_stack:      Vec::new(),
            dynamic_dispatch_miss: None,
            typed_by_id:      std::sync::Mutex::new(TypedByIdStores::default()),
        }
    }
}

// ── Exchange struct ─────────────────────────────────────────────────────────
//
// Every transpiler-visible field is `Value`. Both camelCase and snake_case
// names appear because the TS source uses both interchangeably.
// Plain-map state below is single-owner (no lock, no tag), so the Rust transpiler emits native reads.

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
    /// The raw constructor config, kept so `initialize_properties` can merge it
    /// over `describe()` the way Go's `InitParent` does
    /// (`deepExtend(describe, userConfig)`) instead of relying on per-field
    /// precedence guards in each Core's generated `init()`.
    pub userConfig:             Value,
    pub verbose:                Value,
    pub isSandboxModeEnabled:   Value,
    /// `false` disables tls certificate and hostname verification for REST and WS.
    pub validateServerSsl:      Value,

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
    /// Plain dict-or-null container -- see `PLAIN_DICT_FIELDS`.
    pub markets:           Option<crate::value::Dict>,
    pub markets_by_id:     Option<crate::value::Dict>,
    /// Plain dict, never undefined (TS `createSafeDictionary`): reads and writes are the stdlib map ops.
    pub currencies:        crate::value::Dict,
    pub currencies_by_id:  Option<crate::value::Dict>,
    pub commonCurrencies:  Value,
    pub baseCurrencies:    Value,
    pub quoteCurrencies:   Value,
    pub symbols:           crate::value::List,
    pub ids:               Value,
    pub codes:             Value,
    pub timeframes:        Option<crate::value::Dict>,
    pub precision:         Value,
    pub limits:            Value,
    pub fees:              crate::value::Dict,
    pub features:          Value,
    pub has:               crate::value::Dict,
    pub exceptions:        Value,
    /// Plain dict, never tagged: reads and writes are the stdlib map ops.
    pub urls:              crate::value::Dict,
    pub api:               Value,
    /// Plain dict-or-null container -- see `PLAIN_DICT_FIELDS`.
    pub options:           crate::value::Dict,
    pub headers:           Value,
    pub accounts:          Value,
    pub accountsById:      Value,

    // runtime state
    pub orderbooks:        crate::pro::order_book::BookMap,
    pub orders:            Option<crate::pro::cache::Cache>,
    pub trades:            crate::pro::cache::CacheMap,
    pub myTrades:          Option<crate::pro::cache::Cache>,
    pub positions:         Option<crate::pro::cache::Cache>,
    pub positionsByType:   crate::pro::cache::CacheMap,
    // WS state — mirrors `ts/src/base/Exchange.ts` `newUpdates: boolean = true`.
    // Per-exchange WS code reads `self.newUpdates` to decide whether to call
    // `cache.getLimit(...)` (return only what's new since the last call) or
    // emit the whole rolling buffer.
    pub newUpdates:        Value,
    pub tickers:           crate::value::Dict,
    pub bidsasks:          Value,
    pub ohlcvs:            crate::pro::cache::CacheShelf,
    pub clients:           Value,
    /// Plain dict, never tagged: reads and writes are the stdlib map ops.
    pub balance:           crate::value::Dict,
    pub liquidations:      Option<crate::pro::cache::Cache>,
    pub myLiquidations:    Option<crate::pro::cache::Cache>,
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
    /// `MockResponse` field. Reused for all requests in a fixture; the test
    /// dispatcher replaces or clears it before the next REST dispatch.
    pub mock_response:           Value,
    /// Response-test mock keyed by url fragment, for methods that call several
    /// endpoints: one shared body cannot cover two endpoints of different
    /// declared shapes. Consulted before `mock_response`.
    pub mock_response_by_url:    Value,
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
    pub networkAliases:            crate::value::Dict,
    pub MAX_VALUE:                 Value,
    pub returnResponseHeaders:     Value,
    pub httpExceptions:            crate::value::Dict,
    pub status:                    Value,

    // user-agent / fetch behavior
    pub userAgent:                 Value,
    pub user_agent:                Value,
    pub userAgents:                crate::value::Dict,

    // describe() output (legacy)
    pub describe_data:             Value,
    pub derived_describe:          Option<DescribeCallback>,

    // private runtime state (typed)
    pub internals: Internals,
}

/// Base fields holding a plain, single-owner dict container.
///
/// Each one is a dict or `Null` for the whole life of the exchange and the
/// runtime never tags it (`__cacheKind` / `__book_id` / `__ws_subs_url` /
/// `__live_id`), so reading and writing them is the stdlib map op and nothing
/// else. The Rust transpiler emits those ops natively for the generated
/// tiers; the test below holds the invariant they are proven from.
pub const PLAIN_DICT_FIELDS: [&str; 1] = ["markets"];

/// The container invariant above, checked against the real constructor and
/// against the runtime's own write-through helper.
#[cfg(test)]
mod plain_dict_container_proof {
    use super::*;

    fn slot<'a>(ex: &'a mut Exchange, name: &str) -> &'a mut Option<crate::value::Dict> {
        match name {
            "markets" => &mut ex.markets,
            other => panic!("not a plain-dict field: {other}"),
        }
    }

    #[test]
    fn fields_hold_a_dict_or_null() {
        let mut ex = Exchange::new(None);
        for name in PLAIN_DICT_FIELDS {
            assert!(slot(&mut ex, name).is_none(), "{name} starts undefined");
        }
    }

    #[test]
    fn literal_key_entry_matches_get_value_mut() {
        // `if let Value::Dict(bind) = get_value_mut(&mut f, &Value::Str("k"..))`
        // against the emitted `entry("k").or_insert(Null)` and the same head test.
        let seeds: [Option<Value>; 3] = [None, Some(Value::Int(7)), Some(Value::Map(HashMap::new()))];
        for start in [Value::Null, Value::Map(HashMap::new())] {
            for seed in &seeds {
                let mut base = start.clone();
                if let (Some(v), Value::Dict(m)) = (seed.clone(), &mut base) {
                    std::sync::Arc::make_mut(m).insert("k".to_string(), v);
                }

                let mut helper = base.clone();
                let from_helper = crate::runtime::get_value_mut(&mut helper, &Value::Str("k".into())).clone();
                // What the emitted `if let Value::Dict(bind)` lets the body see.
                let seen_helper = if from_helper.as_map().is_some() { from_helper } else { Value::Null };

                let mut native = base;
                let mut seen_native = Value::Null;
                if let Value::Dict(m) = &mut native {
                    let entry = std::sync::Arc::make_mut(m).entry("k".to_string()).or_insert(Value::Null);
                    if let Value::Dict(inner) = entry {
                        seen_native = Value::Dict(inner.clone());
                    }
                }

                assert_eq!(seen_helper, seen_native, "head binding diverged (seed {seed:?})");
                assert_eq!(helper, native, "slot state diverged (seed {seed:?})");
            }
        }
    }
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

fn base_fees() -> crate::value::Dict {
    Arc::new([
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
    ].into_iter().map(|(k, v)| (k.to_string(), v)).collect())
}

fn base_urls() -> crate::value::Dict {
    Arc::new([
        ("logo", Value::Null), ("api", Value::Null), ("test", Value::Null),
        ("www", Value::Null), ("doc", Value::Null), ("api_management", Value::Null),
        ("fees", Value::Null), ("referral", Value::Null),
    ].into_iter().map(|(k, v)| (k.to_string(), v)).collect())
}

fn base_status() -> Value {
    vmap(&[
        ("status",  Value::Str("ok".into())),
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

fn base_http_exceptions() -> crate::value::Dict {
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
        m.insert(code.to_string(), Value::Str(class.to_string().into()));
    }
    Arc::new(m)
}

impl Exchange {
    pub fn new(config: Option<Value>) -> Self {
        let mut ex = Exchange {
            // Base-class id (Exchange.ts describe()). A derived exchange's
            // describe() overrides this with its own id.
            id:        Value::Str("Exchange".into()),
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
            rateLimiterAlgorithm: Value::Str("leakyBucket".into()),
            rollingWindowSize:    Value::Int(60_000),
            tokenBucket:          Value::Map(HashMap::new()),
            userConfig:           Value::Null,
            verbose:              Value::Bool(false),
            isSandboxModeEnabled: Value::Bool(false),
            validateServerSsl:    Value::Bool(true),

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

            markets:           None,
            markets_by_id:     None,
            currencies:        crate::value::Dict::default(),
            currencies_by_id:  None,
            commonCurrencies:  {
                let mut m = HashMap::new();
                m.insert("XBT".to_string(),   Value::Str("BTC".into()));
                m.insert("BCHSV".to_string(), Value::Str("BSV".into()));
                Value::Map(m)
            },
            baseCurrencies:    Value::Null,
            quoteCurrencies:   Value::Null,
            symbols:           std::sync::Arc::new(Vec::new()),
            ids:               Value::Null,
            codes:             Value::Null,
            timeframes:        None,
            precision:         Value::Null,
            limits:            base_limits(),
            fees:              base_fees(),
            features:          Value::Null,
            has:               crate::value::Dict::default(),
            exceptions:        Value::Null,
            urls:              base_urls(),
            api:               Value::Null,
            // Base-class default `options` (Exchange.ts describe()). Kept
            // when an exchange's describe() omits it — `super.describe()`
            // is stubbed, so it wouldn't otherwise flow through.
            options: {
                let mk = |p: &str, s: &str, d: &str| {
                    let mut e = HashMap::new();
                    e.insert("primary".to_string(),   Value::Str(p.to_string().into()));
                    e.insert("secondary".to_string(), Value::Str(s.to_string().into()));
                    e.insert("default".to_string(),   Value::Str(d.to_string().into()));
                    Value::Map(e)
                };
                let mut repl = HashMap::new();
                repl.insert("ETH".to_string(), mk("ETH", "ERC20", "secondary"));
                repl.insert("CRO".to_string(), mk("CRONOS", "CRC20", "secondary"));
                repl.insert("TRX".to_string(), mk("TRX", "TRC20", "secondary"));
                repl.insert("BTC".to_string(), mk("BTC", "BRC20", "primary"));
                let mut o = HashMap::new();
                o.insert("defaultNetworkCodeReplacements".to_string(), Value::Map(repl));
                Arc::new(o)
            },
            headers:           Value::Map(HashMap::new()),
            accounts:          Value::Null,
            accountsById:      Value::Null,

            orderbooks:    crate::pro::order_book::BookMap::new(),
            orders:        None,
            trades:        crate::pro::cache::CacheMap::new(),
            myTrades:      None,
            positions:     None,
            positionsByType: crate::pro::cache::CacheMap::new(),
            newUpdates:    Value::Bool(true),
            tickers:       crate::value::Dict::default(),
            bidsasks:      Value::Map(HashMap::new()),
            ohlcvs:        crate::pro::cache::CacheShelf::new(),
            clients:       Value::Map(HashMap::new()),
            balance:       crate::value::Dict::default(),
            liquidations:  None,
            myLiquidations: None,
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
            mock_response_by_url:       Value::Null,
            last_json_response:         Value::Null,
            lastRestRequestTimestamp:   Value::Int(0),
            fetchHistoryCache:          Value::List(vec![]),
            fetchHistoryCacheSize:      Value::Int(0),

            paddingMode:                       Value::Null,
            precisionMode:                     Value::Null,
            substituteCommonCurrencyCodes:     Value::Bool(true),
            reduceFees:                        Value::Bool(true),
            minFundingAddressLength:           Value::Int(1),
                        networkAliases:                    (std::sync::Arc::new([("ETH".to_string(), Value::Str("ERC20".into())), ("TRX".to_string(), Value::Str("TRC20".into())), ("BSC".to_string(), Value::Str("BEP20".into())), ("BSC20".to_string(), Value::Str("BEP20".into())), ("CRONOS".to_string(), Value::Str("CRC20".into())), ("ARB".to_string(), Value::Str("ARBITRUM".into())), ("ARBONE".to_string(), Value::Str("ARBITRUM".into())), ("ARBNOVA".to_string(), Value::Str("ARBITRUM_NOVA".into()))].into_iter().collect())),
            MAX_VALUE:                         Value::Float(f64::MAX),
            returnResponseHeaders:             Value::Bool(false),
            httpExceptions:                    base_http_exceptions(),
            status:                            base_status(),

            userAgent:   Value::Null,
            user_agent:  Value::Null,
            userAgents:  {
                let mut m = HashMap::new();
                m.insert("chrome".to_string(), Value::Str("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36".into()));
                m.insert("chrome39".to_string(), Value::Str("Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36".into()));
                m.insert("chrome100".to_string(), Value::Str("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4896.75 Safari/537.36".into()));
                Arc::new(m)
            },

            describe_data:     Value::Null,
            derived_describe:  None,

            internals: Internals::default(),
        };
        if let Some(cfg) = config {
            ex.userConfig = cfg.clone();
            ex.apply_config(&cfg);
        }
        // NOTE: `afterConstruct()` is deliberately NOT run here. In TS the
        // constructor applies describe() and only then calls afterConstruct,
        // so the bits it derives (networksById, the features table, the
        // tokenBucket, the sandbox swap) see the venue's own values. Running
        // it at this point — before the derived Core's describe() has been
        // applied — is what made every venue throttle at the base 2000ms and
        // forced a string of compensations in the generated `init()`. Each
        // Core's `init()` now calls it last; a bare `Exchange` with no derived
        // Core (base unit tests, `BaseCore`) calls `after_construct` itself.
        ex
    }

    /// Apply a merged `describe()` + constructor-config map onto the typed
    /// fields. The Rust counterpart of Go's `initializeProperties`
    /// (`go/v4/exchange_options.go`) and of the TS constructor's
    /// `deepExtend(this, describe(), userConfig)` — which Rust cannot do
    /// directly because `Exchange` is a struct, not a dynamic object.
    ///
    /// Each Core's generated `init()` used to inline ~84 lines of this, which
    /// is why every field carried its own precedence guard: config was applied
    /// in `new()` BEFORE `describe()` ran, so `describe()` had to be stopped
    /// from clobbering it. Here the config is merged over `describe()` first
    /// (Go's `deepExtend(describe, userConfig)`), so last-write-wins is the
    /// precedence rule and no guards are needed.
    ///
    /// Absent keys leave the base default in place — the equivalent of Go's
    /// `SafeString(props, key, default)`.
    pub fn initialize_properties(&mut self, described: Value) {
        let props = if matches!(self.userConfig, Value::Null) {
            described
        } else {
            crate::runtime::deep_merge_dict(&described, &self.userConfig)
        };
        let get = |k: &str| props.at(k).to_owned();
        let assign = |field: &mut Value, v: Value| {
            if !matches!(v, Value::Null) {
                *field = v;
            }
        };
        assign(&mut self.api, get("api"));
        if let Value::Dict(m) = get("urls") { self.urls = m; }
        if let Value::Dict(m) = get("has") { self.has = m; }
        assign(&mut self.hostname, get("hostname"));
        assign(&mut self.version, get("version"));
        assign(&mut self.id, get("id"));
        assign(&mut self.name, get("name"));
        assign(&mut self.exceptions, get("exceptions"));
        assign(&mut self.requiredCredentials, get("requiredCredentials"));
        assign(&mut self.precisionMode, get("precisionMode"));
        if let Value::Dict(m) = get("timeframes") { self.timeframes = Some(m); }
        if let Value::Dict(m) = get("fees") { self.fees = m; }
        assign(&mut self.features, get("features"));
        // `userAgent` (describe() or user config): a string, a `{ 'User-Agent': .. }`
        // dict, or `false` to send none; `userAgents` replaces the base table.
        assign(&mut self.userAgent, get("userAgent"));
        if let Value::Dict(m) = get("userAgents") { self.userAgents = m; }
        let rate_limit = get("rateLimit");
        if matches!(rate_limit, Value::Int(_) | Value::Float(_)) {
            self.rateLimit = rate_limit;
        }
        // `options` and `commonCurrencies` MERGE rather than replace: the base
        // Exchange seeds defaults into both, and describe() only supplies the
        // venue's additions.
        if let Value::Dict(extra) = get("options") {
            let merged = Arc::make_mut(&mut self.options);
            let extra = Arc::try_unwrap(extra).unwrap_or_else(|a| (*a).clone());
            for (k, v) in extra { merged.insert(k, v); }
        }
        if let Value::Dict(extra) = get("commonCurrencies") {
            let mut merged = match &self.commonCurrencies {
                Value::Dict(m) => (**m).clone(),
                _ => HashMap::new(),
            };
            let extra = Arc::try_unwrap(extra).unwrap_or_else(|a| (*a).clone());
            for (k, v) in extra { merged.insert(k, v); }
            self.commonCurrencies = Value::Map(merged);
        }
        // A venue whose describe() ships its own markets (the hard-coded ones)
        // resolves load_markets without a network call. Guarded on markets not
        // already being loaded, so config-injected markets win.
        let described_markets = get("markets");
        if matches!(&described_markets, Value::Dict(m) if !m.is_empty())
            && self.markets.is_none()
        {
            self.set_markets_inline(described_markets);
        }
        self.build_implicit_api();
    }

    fn apply_config(&mut self, cfg: &Value) {
        use crate::value::safe_string;
        if let Some(v) = safe_string(cfg, "id",       None) { self.id       = Value::Str(v.into()); }
        if let Some(v) = safe_string(cfg, "name",     None) { self.name     = Value::Str(v.into()); }
        if let Some(v) = safe_string(cfg, "hostname", None) { self.hostname = Value::Str(v.into()); }
        match cfg.at("rateLimit") { &Value::Int(n) => self.rateLimit = Value::Int(n), &Value::Float(x) => self.rateLimit = Value::Float(x), _ => {} }
        match cfg.at("timeout") { &Value::Int(n) => self.timeout = Value::Int(n), &Value::Float(x) => self.timeout = Value::Float(x), _ => {} }
        match cfg.at("fetchHistoryCacheSize") { &Value::Int(n) => self.fetchHistoryCacheSize = Value::Int(n), &Value::Float(x) => self.fetchHistoryCacheSize = Value::Float(x), _ => {} }
        let urls = cfg.at("urls");
        if let (Value::Dict(_), Value::Dict(m)) = (urls, deep_merge(&Value::Dict(self.urls.clone()), urls)) { self.urls = m; }
        if let Some(v) = safe_string(cfg, "apiKey",        None) { self.apiKey        = Value::Str(v.into()); }
        if let Some(v) = safe_string(cfg, "secret",        None) { self.secret        = Value::Str(v.into()); }
        if let Some(v) = safe_string(cfg, "password",      None) { self.password      = Value::Str(v.into()); }
        if let Some(v) = safe_string(cfg, "uid",           None) { self.uid           = Value::Str(v.into()); }
        if let Some(v) = safe_string(cfg, "walletAddress", None) { self.walletAddress = Value::Str(v.into()); }
        if let Some(v) = safe_string(cfg, "privateKey",    None) { self.privateKey    = Value::Str(v.into()); }
        if let Some(v) = safe_string(cfg, "token",         None) { self.token         = Value::Str(v.into()); }
        if let Some(v) = safe_string(cfg, "login",         None) { self.login         = Value::Str(v.into()); }
        if let Some(v) = safe_string(cfg, "accountId",     None) { self.accountId     = Value::Str(v.into()); }
        if let Some(v) = safe_string(cfg, "httpProxy",     None) { self.httpProxy     = Value::Str(v.into()); }
        if let Some(v) = safe_string(cfg, "httpsProxy",    None) { self.httpsProxy    = Value::Str(v.into()); }
        if let Some(v) = safe_string(cfg, "socksProxy",    None) { self.socksProxy    = Value::Str(v.into()); }
        // WS proxies: the `watch*` transport dials these through an HTTP
        // CONNECT tunnel. Without them here a config-supplied `wsProxy` set
        // the field on nothing and the socket quietly went direct.
        if let Some(v) = safe_string(cfg, "wsProxy",       None) { self.wsProxy       = Value::Str(v.into()); }
        if let Some(v) = safe_string(cfg, "wssProxy",      None) { self.wssProxy      = Value::Str(v.into()); }
        if let Some(b) = crate::value::safe_bool(cfg, "verbose",         None) { self.verbose         = Value::Bool(b); }
        if let Some(b) = crate::value::safe_bool(cfg, "enableRateLimit", None) { self.enableRateLimit = Value::Bool(b); }
        if let Some(b) = crate::value::safe_bool(cfg, "validateServerSsl", None) { self.validateServerSsl = Value::Bool(b); }
        // Pre-populated state (mirrors CCXT TS Exchange constructor):
        // markets/currencies/options arrive ready to use from offline
        // tests, the CLI, or library users seeding state. `setMarkets`
        // also derives markets_by_id and symbols.
        let markets    = cfg.at("markets").to_owned();
        let currencies = cfg.at("currencies").to_owned();
        if !matches!(markets,    Value::Null) { self.set_markets_inline(markets); }
        if let Value::Dict(c) = currencies { self.currencies = c; }
        let opts = cfg.at("options").to_owned();
        if let Value::Dict(extra) = opts {
            let merged = Arc::make_mut(&mut self.options);
            let extra = Arc::try_unwrap(extra).unwrap_or_else(|a| (*a).clone());
            for (k, v) in extra { merged.insert(k, v); }
        }
        let accounts = cfg.at("accounts").to_owned();
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
                symbols.push(Value::Str(s.into()));
            }
            if let Some(i) = crate::value::safe_string(m, "id", None) {
                by_id.entry(i).or_default().push(m.clone());
            }
        }
        self.markets       = if by_symbol.is_empty() { if let Value::Dict(m) = markets { Some(m) } else { None } } else { Some(Arc::new(by_symbol)) };
        self.markets_by_id = Some(Arc::new(
            by_id.into_iter().map(|(k, v)| (k, Value::Array(v))).collect()
        ));
        self.symbols       = std::sync::Arc::new(symbols);
    }

    // ── http client ─────────────────────────────────────────────────────────

    fn http_client(&mut self) -> &reqwest::Client {
        let validates_ssl = self.validates_server_ssl();
        if self.internals.http_client_validates_ssl != validates_ssl {
            self.internals.http_client = None;
        }
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
                        if let Ok(p) = reqwest::Proxy::all(s.as_ref()) { proxies.push(p); }
                    }
                }
            }
            for field in [&self.httpsProxy, &self.https_proxy] {
                if let Value::Str(s) = field {
                    if !s.is_empty() {
                        if let Ok(p) = reqwest::Proxy::https(s.as_ref()) { proxies.push(p); }
                    }
                }
            }
            for field in [&self.httpProxy, &self.http_proxy] {
                if let Value::Str(s) = field {
                    if !s.is_empty() {
                        if let Ok(p) = reqwest::Proxy::http(s.as_ref()) { proxies.push(p); }
                    }
                }
            }
            // Legacy single `proxy` setter (catch-all). Only honoured if
            // none of the scheme-specific fields fired.
            if proxies.is_empty() {
                if let Value::Str(s) = &self.proxy {
                    if !s.is_empty() {
                        if let Ok(p) = reqwest::Proxy::all(s.as_ref()) { proxies.push(p); }
                    }
                }
            }
            for p in proxies { b = b.proxy(p); }
            if !validates_ssl {
                // with rustls this also skips the hostname check
                b = b.danger_accept_invalid_certs(true);
            }
            self.internals.http_client = Some(b.build().expect("reqwest client"));
            self.internals.http_client_validates_ssl = validates_ssl;
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

    /// The User-Agent sent with every request, picked as Exchange.ts `fetch` does:
    /// `userAgent`, else `user_agent`, else `userAgents['chrome']` when both are unset;
    /// a dict value sends its `User-Agent` entry; `false` or `''` sends none.
    fn user_agent_str(&self) -> Option<&str> {
        let chosen = match (&self.userAgent, &self.user_agent) {
            (Value::Null, Value::Null) => self.userAgents.get("chrome"),
            (Value::Null, ua) | (ua, _) => Some(ua),
        };
        let header = match chosen {
            Some(Value::Dict(m)) => m.get("User-Agent"),
            other => other,
        };
        match header {
            Some(Value::Str(s)) if !s.is_empty() => Some(s.as_ref()),
            _ => None,
        }
    }


    /// Whether request/response logging is on.
    pub fn is_verbose(&self) -> bool {
        matches!(self.verbose, Value::Bool(true))
    }

    pub fn validates_server_ssl(&self) -> bool {
        !matches!(self.validateServerSsl, Value::Bool(false))
    }

    /// enables or disables server ssl certificate validation for REST and WS connections;
    /// the cached http client is rebuilt on the next request when the value changes
    pub fn set_validate_server_ssl(&mut self, validate: Value) {
        // transpiled callers pass a Value (see set_sandbox_mode); anything but an
        // explicit false keeps validation on, matching validates_server_ssl above
        self.validateServerSsl = Value::Bool(!matches!(validate, Value::Bool(false)));
    }

    // Setup accessors, reached on every exchange through its `Deref<Target = Exchange>`.
    // Setters take Rust primitives and return `&mut Self` so they chain.

    /// Every loaded market, typed. Empty until markets are loaded.
    pub fn markets(&self) -> Vec<crate::types::Market> {
        self.markets.as_deref().map(|d| d.values().cloned().map(crate::types::Market::from_value).collect()).unwrap_or_default()
    }

    /// Markets by exchange id (one id can name several markets), typed and shared.
    pub fn markets_by_id_typed(&self) -> Arc<TypedById<crate::types::Market>> {
        let mut stores = self.internals.typed_by_id.lock().unwrap_or_else(|e| e.into_inner());
        TypedById::refresh(&mut stores.markets, self.markets_by_id.as_ref(), |v| match v {
            Value::Arr(a) => a.iter().cloned().map(crate::types::Market::from_value).collect(),
            _ => Vec::new(),
        })
    }

    /// Currencies by exchange id, typed and shared.
    pub fn currencies_by_id_typed(&self) -> Arc<TypedById<crate::types::Currency>> {
        let mut stores = self.internals.typed_by_id.lock().unwrap_or_else(|e| e.into_inner());
        TypedById::refresh(&mut stores.currencies, self.currencies_by_id.as_ref(), |v| match v {
            Value::Dict(_) => vec![crate::types::Currency::from_value(v.clone())],
            _ => Vec::new(),
        })
    }

    /// Currencies by unified code, typed and shared (same store shape as the by-id one).
    pub fn currencies_by_code_typed(&self) -> Arc<TypedById<crate::types::Currency>> {
        let mut stores = self.internals.typed_by_id.lock().unwrap_or_else(|e| e.into_inner());
        TypedById::refresh(&mut stores.currencies_by_code, Some(&self.currencies), |v| match v {
            Value::Dict(_) => vec![crate::types::Currency::from_value(v.clone())],
            _ => Vec::new(),
        })
    }

    /// Every loaded currency, typed. Empty until markets are loaded.
    pub fn currencies(&self) -> Vec<crate::types::Currency> {
        self.currencies.values().cloned().map(crate::types::Currency::from_value).collect()
    }

    /// Unified symbols of every loaded market, sorted.
    pub fn symbols(&self) -> Vec<String> {
        let mut out: Vec<String> = self.markets().into_iter().map(|m| m.symbol).collect();
        out.sort();
        out
    }

    /// The ccxt id of this exchange, e.g. binance.
    pub fn id(&self) -> String {
        match &self.id { Value::Str(s) => s.to_string(), _ => String::new() }
    }

    /// Whether sandbox/testnet endpoints are in use.
    pub fn is_sandbox_mode_enabled(&self) -> bool {
        matches!(self.isSandboxModeEnabled, Value::Bool(true))
    }

    /// Log every HTTP request and response to stderr.
    pub fn set_verbose(&mut self, on: bool) -> &mut Self { self.verbose = Value::Bool(on); self }
    /// Client-side rate limiting (on by default).
    pub fn set_enable_rate_limit(&mut self, on: bool) -> &mut Self { self.enableRateLimit = Value::Bool(on); self }
    /// Milliseconds per rate-limit token; read on every throttled call.
    pub fn set_rate_limit_ms(&mut self, ms: i64) -> &mut Self { self.rateLimit = Value::Int(ms); self }
    /// HTTP request timeout in milliseconds.
    pub fn set_timeout_ms(&mut self, ms: i64) -> &mut Self { self.timeout = Value::Int(ms); self }
    pub fn set_api_key(&mut self, v: &str) -> &mut Self { self.apiKey = Value::from(v); self }
    pub fn set_secret(&mut self, v: &str) -> &mut Self { self.secret = Value::from(v); self }
    pub fn set_password(&mut self, v: &str) -> &mut Self { self.password = Value::from(v); self }
    pub fn set_uid(&mut self, v: &str) -> &mut Self { self.uid = Value::from(v); self }
    pub fn set_wallet_address(&mut self, v: &str) -> &mut Self { self.walletAddress = Value::from(v); self }
    pub fn set_private_key(&mut self, v: &str) -> &mut Self { self.privateKey = Value::from(v); self }
    pub fn set_token(&mut self, v: &str) -> &mut Self { self.token = Value::from(v); self }
    /// REST proxies: set at most one (conflicting proxy settings are rejected per request).
    pub fn set_http_proxy(&mut self, url: &str) -> &mut Self { self.httpProxy = Value::from(url); self }
    pub fn set_https_proxy(&mut self, url: &str) -> &mut Self { self.httpsProxy = Value::from(url); self }
    pub fn set_socks_proxy(&mut self, url: &str) -> &mut Self { self.socksProxy = Value::from(url); self }
    /// WebSocket proxy, dialed with an HTTP CONNECT tunnel by the `watch*` transport.
    pub fn set_ws_proxy(&mut self, url: &str) -> &mut Self { self.wsProxy = Value::from(url); self }

    /// Merge entries into `options` the way `Config::options` does; nested objects combine.
    pub fn set_options(&mut self, options: crate::Params) -> &mut Self {
        let merged = crate::Config::new().options(crate::Params::from(Value::Dict(self.options.clone())))
            .options(options)
            .into_value();
        if let Value::Dict(m) = merged.at("options").to_owned() { self.options = m; }
        self
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

    pub fn implode_params(&self, path: Value, params: impl std::borrow::Borrow<Value>) -> String {
        let params: &Value = params.borrow();
        let path_str: String = match &path { Value::Str(s) => s.to_string(), Value::Null => return String::new(), other => return other.to_string() };
        let m = match params { Value::Dict(m) => m, _ => return path_str };
        let mut out = path_str;
        for (k, v) in m.iter() {
            let needle = format!("{{{k}}}");
            if out.contains(&needle) {
                out = out.replace(&needle, &crate::runtime::stringify_param(v));
            }
        }
        out
    }

    pub fn json_str(&self, v: &Value) -> String {
        serde_json::to_string(&v.to_json()).unwrap_or_default()
    }

    // ── crypto ──────────────────────────────────────────────────────────────

    pub fn hmac(&self, data: impl Into<Value>, secret: impl Into<Value>, hash: &str, optional_args: &[Value]) -> String {
        // `data`/`secret` may be a string OR the byte-array produced by
        // `encode()` (CCXT's `hmac` takes the encoded request/secret).
        let dbytes = value_to_bytes(&data.into());
        let sbytes = value_to_bytes(&secret.into());
        let digest = match optional_args.get(0) {
            Some(Value::Str(d)) => d.clone(),
            _ => "hex".to_string().into(),
        };
        self.hmac_typed(&dbytes, &sbytes, hash, &digest).unwrap_or_default()
    }

    pub fn hmac_typed(&self, data: &[u8], secret: &[u8], hash: &str, digest: &str) -> Result<String> {
        let raw = hmac_raw(data, secret, hash)
            .ok_or_else(|| ExchangeError::new("BadRequest", format!("unknown hmac: {}", hash.to_ascii_lowercase())))?;
        Ok(match digest {
            "base64" => B64.encode(&raw),
            _        => hex_encode(&raw),
        })
    }

    /// `hash` with a `'hex'` / `'base64'` digest (the default is hex); the `'binary'` digest is `hash_binary`.
    pub fn hash(&self, data: impl Into<Value>, algo: &str, optional_args: &[Value]) -> String {
        let dbytes = value_to_bytes(&data.into());
        let digest = match optional_args.get(0) {
            Some(Value::Str(d)) => d.clone(),
            _ => "hex".to_string().into(),
        };
        self.hash_typed(&dbytes, algo, &digest)
    }

    /// `hash(data, algo, 'binary')`: the raw digest bytes.
    pub fn hash_binary(&self, data: impl Into<Value>, algo: &str) -> crate::value::Bytes {
        crate::value::Bytes::of(&hash_raw(&value_to_bytes(&data.into()), algo))
    }

    pub fn hash_typed(&self, data: &[u8], algo: &str, digest: &str) -> String {
        let raw = hash_raw(data, algo);
        match digest {
            "base64" => B64.encode(&raw),
            _        => hex_encode(&raw),
        }
    }

    pub fn binary_to_base64(&self, data: impl Into<Value>, _optional_args: &[Value]) -> String {
        let bytes = value_to_bytes(&data.into());
        B64.encode(&bytes)
    }
    pub fn base64_to_binary(&self, s: impl std::borrow::Borrow<Value>, _optional_args: &[Value]) -> crate::value::Bytes {
        let str_val = match s.borrow() { Value::Str(s) => s, _ => return crate::value::Bytes::default() };
        crate::value::Bytes::of(&B64.decode(&**str_val).unwrap_or_default())
    }
    pub fn binary_to_base16(&self, data: impl Into<Value>, _optional_args: &[Value]) -> String {
        let bytes = value_to_bytes(&data.into());
        hex_encode(&bytes)
    }
    pub fn base16_to_binary(&self, s: Value, _optional_args: &[Value]) -> crate::value::Bytes {
        let str_val = match &s { Value::Str(s) => s.clone(), _ => return crate::value::Bytes::default() };
        crate::value::Bytes::of(&hex_decode(&*str_val).unwrap_or_default())
    }

    // ── time ────────────────────────────────────────────────────────────────

    pub fn milliseconds(&self) -> i64 {
        std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .map(|d| d.as_millis() as i64).unwrap_or(0)
    }
    pub fn seconds(&self) -> i64 {
        self.milliseconds() / 1000
    }
    pub fn microseconds(&self) -> i64 {
        self.milliseconds() * 1000
    }

    /// `ts` is lent as a scalar: `None` / `Value::Null` and non-scalars answer `Null`, a string parses as i64.
    pub fn iso8601(&self, ts: impl crate::value::ScalarArg) -> Value {
        let n = match ts.scalar() {
            crate::value::ScalarRef::Num(Value::Int(n)) => n,
            crate::value::ScalarRef::Num(Value::Float(f)) => f as i64,
            crate::value::ScalarRef::Str(s) => match s.parse::<i64>() { Ok(v) => v, Err(_) => return Value::Null },
            _ => return Value::Null,
        };
        if n < 0 {
            return Value::Null;
        }
        chrono::DateTime::<chrono::Utc>::from_timestamp_millis(n)
            .map(|t| Value::Str(t.to_rfc3339_opts(chrono::SecondsFormat::Millis, true).into()))
            .unwrap_or(Value::Null)
    }

    pub fn parse8601(&self, s: impl crate::value::ScalarArg) -> Option<i64> {
        let str_val = match s.scalar() { crate::value::ScalarRef::Str(s) => s, _ => return None };
        if str_val.is_empty() {
            return None;
        }
        // rfc3339 (`T…Z` / `+00:00` offset forms).
        if let Ok(t) = chrono::DateTime::parse_from_rfc3339(&str_val) {
            return Some(t.timestamp_millis());
        }
        // Numeric timezone offset WITHOUT a colon (`+0000`) — not valid
        // rfc3339 but common (e.g. bitso `2024-03-13T10:59:59+0000`). JS
        // `Date.parse` accepts it; chrono needs an explicit `%z` format.
        for fmt in [
            "%Y-%m-%dT%H:%M:%S%.f%z", "%Y-%m-%dT%H:%M:%S%z",
            "%Y-%m-%d %H:%M:%S%.f%z", "%Y-%m-%d %H:%M:%S%z",
        ] {
            if let Ok(t) = chrono::DateTime::parse_from_str(&str_val, fmt) {
                return Some(t.timestamp_millis());
            }
        }
        // Lenient fallbacks — naive forms are interpreted as UTC.
        for fmt in [
            "%Y-%m-%d %H:%M:%S%.f", "%Y-%m-%d %H:%M:%S",
            "%Y-%m-%dT%H:%M:%S%.f", "%Y-%m-%dT%H:%M:%S",
            "%Y-%m-%d %H:%M", "%Y-%m-%dT%H:%M",
        ] {
            if let Ok(ndt) = chrono::NaiveDateTime::parse_from_str(&str_val, fmt) {
                return Some(ndt.and_utc().timestamp_millis());
            }
        }
        if let Ok(d) = chrono::NaiveDate::parse_from_str(&str_val, "%Y-%m-%d") {
            if let Some(ndt) = d.and_hms_opt(0, 0, 0) {
                return Some(ndt.and_utc().timestamp_millis());
            }
        }
        None
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
/// Hash-list argument of `watch_multiple`: read in place, so callers lend their list.
pub trait WsHashList { fn ws_hashes(&self) -> Vec<String>; }
impl WsHashList for Value { fn ws_hashes(&self) -> Vec<String> { ws_string_list(self) } }
impl WsHashList for &Value { fn ws_hashes(&self) -> Vec<String> { ws_string_list(self) } }
impl WsHashList for &crate::value::List { fn ws_hashes(&self) -> Vec<String> { list_strings(self) } }
impl WsHashList for crate::value::List { fn ws_hashes(&self) -> Vec<String> { list_strings(self) } }
impl WsHashList for &[Value] { fn ws_hashes(&self) -> Vec<String> { list_strings(self) } }
fn list_strings(a: &[Value]) -> Vec<String> {
    a.iter().filter_map(|x| x.as_str().map(str::to_string)).collect()
}
/// Coerce a `Value` (string, or list of strings) into a `Vec<String>` of
/// message/subscribe hashes for the WS drive loop.
fn ws_string_list(v: &Value) -> Vec<String> {
    match v {
        Value::Str(s) => vec![s.to_string()],
        Value::Arr(a) => a
            .iter()
            .filter_map(|x| match x {
                Value::Str(s) => Some(s.to_string()),
                _ => None,
            })
            .collect(),
        _ => Vec::new(),
    }
}

pub trait ExchangeRuntime: crate::exchange_generated::ExchangeBase {
    fn fetch(&mut self, url: Value, optional_args: &[Value]) -> impl ::std::future::Future<Output = Value> + Send { async move {
        let url_str = match &url { Value::Str(s) => s.to_string(), _ => crate::runtime::stringify_param(&url).into() };
        let method = optional_args.get(0).cloned().unwrap_or(Value::Str("GET".into()));
        let headers = optional_args.get(1).cloned().unwrap_or(Value::Null);
        let body = optional_args.get(2).cloned().unwrap_or(Value::Null);
        let method_str = match &method { Value::Str(s) => s.to_string(), _ => "GET".to_string().into() };
        let body_str = match &body { Value::Str(s) => Some(s.to_string()), _ => None };
        let headers_map: HashMap<String, String> = match &headers {
            Value::Dict(m) => m.iter().filter_map(|(k, v)| match v {
                Value::Str(s) => Some((k.clone(), s.to_string())),
                _ => None,
            }).collect(),
            _ => HashMap::new(),
        };
        match self.fetch_typed(&url_str, &method_str, headers_map, body_str).await {
            Ok(v) => v,
            // `panic!` is the transpiled error convention — `ExchangeError`'s Display
            // renders `[Kind] message`, which `is_instance` matches on.
            Err(e) => panic!("{}", e),
        }
    } }

    // ── WebSocket (pro) drive loop ──────────────────────────────────────────
    //
    // Port of the runtime side of `Exchange.watch` / `watchMultiple`. These are
    // trait methods (not inherent on `Exchange`) so `self` is the concrete Core
    // and `dispatch_to_derived("handle_message", …)` reaches the venue override.
    //
    // Model: `watch` drives synchronously — it connects, sends the subscribe
    // frame once, then loops reading inbound frames and feeding each to the
    // venue's `handle_message` (which calls `client.resolve(value, hash)`),
    // returning as soon as one of the awaited hashes is settled. A repeated
    // `while true { watch_x().await }` consumer therefore gets one update per
    // call, exactly like the TS Future model. (Concurrently awaiting two streams
    // on the *same* socket via join is a known limitation — each drive loop
    // pulls from the shared frame queue.)

    /// Shared drive loop for `watch` / `watch_multiple`.
    fn ws_run<T: crate::pro::ws_client::Settled>(
        &mut self,
        url: String,
        hashes: Vec<String>,
        message: Value,
        subscribe_hashes: Vec<String>,
        subscription: Value,
    ) -> impl ::std::future::Future<Output = T> + Send { async move {
        let __ws_proxy = [&self.wsProxy, &self.ws_proxy, &self.wssProxy]
            .iter()
            .find_map(|v| match v { Value::Str(s) if !s.is_empty() => Some(s.to_string()), _ => None });
        // binary frames are decompressed unless the exchange opts out (mexc, paradex)
        let __decompress_binary = !matches!(self.options.get("decompressBinary"), Some(Value::Bool(false)));
        // options.ws.options.headers ride on the upgrade request, as in the other ports
        let __ws_options = self.options.get("ws").unwrap_or(&Value::Null).at("options");
        let __ws_headers: Vec<(String, String)> = match __ws_options.at("headers") {
            Value::Dict(m) => m.iter().filter_map(|(k, v)| match v {
                Value::Str(s) => Some((k.clone(), s.to_string())),
                Value::Int(n) => Some((k.clone(), n.to_string())),
                _ => None,
            }).collect(),
            _ => Vec::new(),
        };
        let client = match crate::pro::ws_client::ensure_client_with_options(&url, &__ws_headers, __ws_proxy, __decompress_binary, self.validates_server_ssl()).await {
            Ok(c) => c,
            Err(e) => panic!("{}", e),
        };
        if std::env::var("CCXT_WS_DEBUG").is_ok() {
            eprintln!("[wswait] {:?}", hashes);
        }
        client.note_futures(&hashes);
        // Subscribe once per hash. Send the message if any subscribe hash was
        // newly added, or if none were provided (mirrors TS's
        // `subscribeHashes === undefined || missingSubscriptions.length`).
        let mut send_subscribe = subscribe_hashes.is_empty();
        for sh in &subscribe_hashes {
            if client.subscribe_once(sh, subscription.clone()) {
                send_subscribe = true;
            }
        }
        if send_subscribe && !matches!(message, Value::Null) {
            let payload = match &message {
                Value::Str(s) => s.to_string(),
                v => v.to_json().to_string(),
            };
            client.send_text(payload);
        }
        // Mirror the connection into `self.clients`, the map TS venues iterate
        // to decide whether a stream is still worth keeping alive (binance's
        // `keepAliveListenKey` re-arms only while some client still holds a
        // subscription for the type). The handle serves `subscriptions` /
        // `futures` live from the registry, so this stays coherent as
        // subscriptions come and go.
        if let Value::Dict(m) = &mut self.clients {
            Arc::make_mut(m).insert(url.clone(), crate::pro::ws_client::client_value(&url));
        }
        // If an ancestor ws_run on this task is already driving `url`, don't
        // start a nested loop — the subscribe frame was sent above; report the
        // current settled state and let the outer loop resolve `hashes`.
        let driving = WS_DRIVEN_URLS
            .try_with(|v| v.iter().any(|u| u == &url))
            .unwrap_or(false);
        if driving {
            return match client.take_settled_as::<T>(&hashes) {
                Some(Ok(v)) => v,
                _ => T::default(),
            };
        }
        // Mark `url` for the duration of this drive so a nested watch on the same
        // url takes the branch above. The inner scope carries the ancestors' urls
        // plus this one, and restores the outer set on the way out.
        let mut urls = WS_DRIVEN_URLS.try_with(|v| v.clone()).unwrap_or_default();
        urls.push(url.clone());
        WS_DRIVEN_URLS
            .scope(urls, self.ws_drive_loop(client, hashes, url.clone()))
            .await
    } }

    /// One inbound frame → the venue's `handle_message`, through the typed
    /// handle this loop owns. Still hands over the untyped view, so generated
    /// handlers keep their untyped `handle_message` signature.
    fn ws_handle_message<'a>(
        &'a mut self,
        client: &'a mut crate::pro::ws_client::ClientHandle,
        message: Value,
    ) -> std::pin::Pin<Box<dyn ::std::future::Future<Output = ()> + Send + 'a>> {
        Box::pin(async move {
            // the base routeMessage of ts/src/base/Exchange.ts: the frame goes to the handler that
            // takes its shape. The port carries raw bytes as an array of byte values, so a
            // non-empty array of them is the binary frame (no venue's json array frame is one).
            let method = match &message {
                Value::Str(_) => "handle_text_message",
                Value::Arr(a) if !a.is_empty() && crate::exchange_stubs::is_byte_array(&message) => "handle_binary_message",
                Value::Arr(_) => "handle_list_message",
                _ => "handle_message",
            };
            let _ = self
                .dispatch_to_derived(method, &[client.as_value(), message])
                .await;
        })
    }

    /// Read → dispatch → drain loop, split out so `ws_run` can wrap it in the
    /// `WS_DRIVEN_URLS` task-local scope.
    fn ws_drive_loop<T: crate::pro::ws_client::Settled>(
        &mut self,
        client: std::sync::Arc<crate::pro::ws_client::ClientState>,
        hashes: Vec<String>,
        url: String,
    ) -> impl ::std::future::Future<Output = T> + Send { async move {
        loop {
            // Run coroutines scheduled via spawn/delay, inline (they need
            // &mut self). Drain repeatedly: a coroutine may schedule another
            // (handle_order_book → delay(watch_order_book_snapshot)). Runs at
            // the top of the iteration rather than after the dispatch below so
            // the `continue` on a fired deadline reaches it too.
            loop {
                let batch = crate::exchange_stubs::drain_spawn_queue();
                if batch.is_empty() { break; }
                for (method, args) in batch {
                    if std::env::var("CCXT_WS_DEBUG").is_ok() {
                        eprintln!("[wsdrain] {}", method);
                    }
                    if method == "load_order_book" {
                        self.ws_load_order_book(args).await;
                    } else {
                        let _ = self.dispatch_to_derived(&method, &args).await;
                    }
                }
            }
            if let Some(settled) = client.take_settled_as::<T>(&hashes) {
                match settled {
                    Ok(v) => return v,
                    Err(e) => panic!(
                        "{}",
                        match &e {
                            Value::Str(s) => s.clone(),
                            v => crate::runtime::stringify_param(v).into(),
                        }
                    ),
                }
            }
            // Bound the read by the earliest pending `delay` deadline, so a
            // periodic coroutine (binance's `keepAliveListenKey`) still fires
            // on a stream that has gone quiet. `next_message` keeps its frames
            // in the client's queue, so timing out drops nothing.
            let next_due = crate::exchange_stubs::next_spawn_due();
            let received = match next_due {
                Some(d) => match tokio::time::timeout(d, client.next_message()).await {
                    Ok(m) => m,
                    // Deadline reached: loop back round to the drain above.
                    Err(_) => continue,
                },
                None => client.next_message().await,
            };
            let msg = match received {
                Some(m) => m,
                None => panic!("[NetworkError] {} websocket connection closed", url),
            };
            if std::env::var("CCXT_WS_DEBUG").is_ok() {
                let n: usize = std::env::var("CCXT_WS_DEBUG").ok()
                    .and_then(|v| v.parse().ok()).filter(|v| *v > 1).unwrap_or(220);
                let s = msg.to_json().to_string();
                eprintln!("[wsmsg] {}", s.chars().take(n).collect::<String>());
            }
            let mut client_handle = crate::pro::ws_client::ClientHandle::from_value(
                &crate::pro::ws_client::client_value(&url));
            self.ws_handle_message(&mut client_handle, msg).await;
        }
    } }

    /// Base `loadOrderBook`: fetch the REST depth snapshot, splice the buffered
    /// WS cache onto it, and resolve the watcher. Venues spawn this after
    /// buffering enough deltas (bitstamp, …). Runs in the drive loop so it can
    /// reach the venue's `get_cache_index` / `handle_deltas` overrides.
    fn ws_load_order_book(
        &mut self,
        args: Vec<Value>,
    ) -> impl ::std::future::Future<Output = ()> + Send { async move {
        let client = args.get(0).cloned().unwrap_or(Value::Null);
        let message_hash = args.get(1).cloned().unwrap_or(Value::Null);
        let symbol = args.get(2).cloned().unwrap_or(Value::Null);
        let limit = args.get(3).cloned().unwrap_or(Value::Null);
        let params = args.get(4).cloned().unwrap_or(Value::Map(indexmap::IndexMap::new()));
        let err = |id: &Value| Value::Str(format!(
            "[ExchangeError] {} loadOrderBook() failed to synchronize",
            match id { Value::Str(s) => s.as_ref(), _ => "" }).into());
        if !crate::pro::cache::CacheStore::has(&self.orderbooks, &symbol) {
            crate::pro::ws_client::value_reject(&client, err(&self.id), message_hash.as_str());
            return;
        }
        let max_retries: i64 = 3;
        let mut tries = 0;
        while tries < max_retries {
            let book: Option<crate::pro::order_book::Book> = crate::pro::cache::CacheStore::at(&self.orderbooks, &symbol);
            let mut stored = Value::from(&book);
            let snapshot = self
                .dispatch_to_derived("fetch_rest_order_book_safe",
                    &[symbol.clone(), limit.clone(), params.clone()])
                .await
                .unwrap_or(Value::Null);
            // the deltas buffered while the snapshot was fetched
            let cache = Value::Arr(crate::pro::order_book::BookSlot::cache_items(&book));
            let index = self
                .dispatch_to_derived("get_cache_index", &[snapshot.clone(), cache.clone()])
                .await;
            let idx = match index { Some(Value::Int(n)) => n, _ => -1 };
            if idx >= 0 {
                stored.reset(snapshot);
                let items = crate::pro::order_book::BookSlot::cache_items(&book);
                let deltas: Vec<Value> = items.iter().skip(idx as usize).cloned().collect();
                self.dispatch_to_derived("handle_deltas", &[stored.clone(), Value::List(deltas)]).await;
                crate::set_value(&mut stored, &Value::Str("cache".into()), Value::List(Vec::new()));
                crate::pro::ws_client::value_resolve(&client, stored.clone(), message_hash.as_str());
                return;
            }
            tries += 1;
        }
        crate::pro::ws_client::value_reject(&client, err(&self.id), message_hash.as_str());
    } }

    fn watch<'a>(
        &mut self,
        url: impl Into<Option<&'a str>>,
        message_hash: impl Into<Option<&'a str>>,
        message: impl Into<Value>,
        subscribe_hash: impl Into<Option<&'a str>>,
        subscription: impl Into<Value>,
    ) -> impl ::std::future::Future<Output = Value> + Send {
        let hash_s = message_hash.into().unwrap_or("null").to_string();
        let (url_s, message, subscription) = (url.into().unwrap_or("null").to_string(), message.into(), subscription.into());
        let sub_hash_s = match subscribe_hash.into() { Some(s) => s.to_string(), None => hash_s.to_string() };
        async move { self.ws_run::<Value>(url_s, vec![hash_s], message, vec![sub_hash_s], subscription).await }
    }

    fn watch_multiple<'a>(
        &mut self,
        url: impl Into<Option<&'a str>>,
        message_hashes: impl WsHashList,
        message: impl Into<Value>,
        subscribe_hashes: impl WsHashList,
        subscription: impl Into<Value>,
    ) -> impl ::std::future::Future<Output = Value> + Send {
        let (url_s, hashes, message) = (url.into().unwrap_or("null").to_string(), message_hashes.ws_hashes(), message.into());
        let (sub_hashes, subscription) = (subscribe_hashes.ws_hashes(), subscription.into());
        async move { self.ws_run::<Value>(url_s, hashes, message, sub_hashes, subscription).await }
    }


    fn fetch_typed(
        &mut self,
        url:     &str,
        method:  &str,
        headers: HashMap<String, String>,
        body:    Option<String>,
    ) -> impl ::std::future::Future<Output = Result<Value>> + Send { async move {
        timings_add(1, 0, 0);
        self.last_request_url     = Value::Str(url.to_string().into());
        self.last_request_headers = Value::Map(headers.iter()
            .map(|(k, v)| (k.clone(), Value::Str(v.clone().into())))
            .collect());
        self.last_request_body    = match &body {
            Some(b) => Value::Str(b.clone().into()),
            None    => Value::Null,
        };
        // map iteration is unordered, so sort the fragments for a deterministic pick
        if let Value::Dict(byUrl) = &self.mock_response_by_url {
            let mut fragments: Vec<&String> = byUrl.keys().collect();
            fragments.sort();
            for fragment in &fragments {
                if url.contains(fragment.as_str()) {
                    return Ok(byUrl.get(*fragment).cloned().unwrap_or(Value::Null));
                }
            }
            if let Some(first) = fragments.first() {
                return Ok(byUrl.get(*first).cloned().unwrap_or(Value::Null));
            }
        }
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
                    match &self.id { Value::Str(s) => s.as_ref(), _ => "" }),
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
        let reason = resp.status().canonical_reason().unwrap_or("");
        // expose the response headers the way the other ports do (last_response_headers and
        // the `headers` argument of handle_errors): venues read them, e.g. grvt takes its
        // session cookie and account id from Set-Cookie / X-Grvt-Account-Id on sign-in.
        // reqwest lowercases header names; repeated headers are joined with ", " like node-fetch
        let mut response_headers: HashMap<String, Value> = HashMap::new();
        for name in resp.headers().keys() {
            let joined = resp.headers().get_all(name).iter()
                .filter_map(|v| v.to_str().ok())
                .collect::<Vec<&str>>()
                .join(", ");
            response_headers.insert(name.as_str().to_string(), Value::Str(joined.into()));
        }
        let response_headers_value = Value::Map(response_headers.into_iter().collect());
        self.last_response_headers = response_headers_value.clone();
        let text   = resp.text().await?;
        timings_add(0, __http_t0.elapsed().as_nanos() as u64, 0);
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
        timings_add(0, 0, __json_t0.elapsed().as_nanos() as u64);
        // Venues also report failures in a 2xx body, so every response goes through
        // the derived handle_errors; a Null result falls back to httpExceptions.
        let handled = crate::exchange::DerivedExchange::handle_errors(
            self,
            status as i64,
            reason,
            &url.to_string(),
            &method.to_string(),
            response_headers_value,
            &text,
            json.clone(),
            Value::Null,
            Value::Null,
        );
        if matches!(handled, Value::Null) {
            self.handle_http_status_code(
                Value::Int(status as i64),
                Value::Str(reason.into()),
                Value::Str(url.to_string().into()),
                Value::Str(method.to_string().into()),
                Value::Str(text.clone().into()),
            );
        }
        if status >= 400 {
            return Err(ExchangeError::new(
                if status == 429 { "RateLimitExceeded" }
                else if status >= 500 { "ExchangeNotAvailable" }
                else { "ExchangeError" },
                format!("HTTP {status}: {text}"),
            ));
        }
        if matches!(json, Value::Null) {
            return Ok(Value::Str(text.into()));
        }
        Ok(json)
    } }

    fn request_typed(&mut self, path: &str, scope_segments: &[String], verb: &str, params: Value, cost: Value) -> impl ::std::future::Future<Output = Result<Value>> + Send { async move {
        // Mock transport responses only; preserve the signed request metadata.
        if matches!(self.mock_response, Value::Null) && matches!(self.mock_response_by_url, Value::Null) {
            self.throttle(&[cost]).await;
        }
        let api_arg = Value::Array(scope_segments.iter().map(|s| Value::Str(s.clone().into())).collect());
        let scope_lookup: String = scope_segments.first().cloned().unwrap_or_default();
        // Static dispatch to the derived exchange's sign override.
        let signed = crate::exchange::DerivedExchange::sign(
            self,
            path,
            &[api_arg, Value::Str(verb.to_string().into()), params.clone(), Value::Null, Value::Null],
        );
        if let Some(m) = &signed {
            let url = match m.get("url") { Some(Value::Str(s)) => s.to_string(), _ => String::new().into() };
            let method = match m.get("method") { Some(Value::Str(s)) => s.to_string(), _ => verb.to_string().into() };
            let body = match m.get("body") { Some(Value::Str(s)) => Some(s.to_string()), _ => None };
            let headers = match m.get("headers") {
                Some(Value::Dict(h)) => h.iter()
                    .filter_map(|(k, v)| match v { Value::Str(s) => Some((k.clone(), s.to_string())), _ => None })
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
        let path_str = self.implode_params(Value::Str(path.to_string().into()), &params);
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
                headers.insert("X-MBX-APIKEY".to_string(), k.to_string());
            }
        }
        self.fetch_typed(&url, verb, headers, body).await
    } }

    /// Route an implicit-API method name to `request_typed`.
    fn implicit_api_call(&mut self, name: &str, params: Value) -> impl ::std::future::Future<Output = Result<Value>> + Send { async move {
        if self.internals.implicit_api.is_empty() {
            self.build_implicit_api();
        }
        let entry = self.internals.implicit_api.get(name).cloned();
        let (path, scope_segments, verb, config) = match entry {
            Some(t) => t,
            None => return Err(ExchangeError::new(
                "NotSupported",
                format!("implicit API method {name} not found in api block"),
            )),
        };
        let api = Value::Array(scope_segments.iter().map(|s| Value::Str(s.clone().into())).collect());
        let cost = if matches!(self.enableRateLimit, Value::Bool(true)) {
            self.call_dynamic(
                "calculate_rate_limiter_cost",
                &[api, Value::Str(verb.clone().into()), Value::Str(path.clone().into()), params.clone(), config],
            ).await
        } else {
            Value::Null
        };
        self.request_typed(&path, &scope_segments, &verb, params, cost).await
    } }

    #[doc(hidden)]
    fn implicit_api_rate_limit_cost(&mut self, name: &str, params: Value) -> impl ::std::future::Future<Output = Result<Value>> + Send { async move {
        if self.internals.implicit_api.is_empty() {
            self.build_implicit_api();
        }
        let (path, scope_segments, verb, config) = self.internals.implicit_api
            .get(name)
            .cloned()
            .ok_or_else(|| ExchangeError::new("NotSupported", format!("implicit API method {name} not found in api block")))?;
        let api = Value::Array(scope_segments.iter().map(|s| Value::Str(s.clone().into())).collect());
        Ok(self.call_dynamic(
            "calculate_rate_limiter_cost",
            &[api, Value::Str(verb.into()), Value::Str(path.into()), params, config],
        ).await)
    } }

    /// Dispatch an implicit-API method by name (from transpiled `_api.rs`).
    fn call_method(&mut self, name: Value, args: &[&Value]) -> impl ::std::future::Future<Output = Value> + Send { async move {
        let n = match name { Value::Str(s) => s, _ => return Value::Null };
        let params = args.get(0).map_or_else(|| Value::Map(HashMap::new()), |v| (*v).clone());
        match self.implicit_api_call(&n, params).await {
            Ok(v) => v,
            Err(e) => {
                if matches!(self.verbose, Value::Bool(true)) {
                    eprintln!("[ccxt] {n} failed: {e}");
                }
                panic!("{e}");
            }
        }
    } }

    /// `call_method` by name taken back as a dict: the map it answered, else an empty map (as `.into_dict()`).
    fn call_method_t(&mut self, name: &'static str, args: &[&Value]) -> impl ::std::future::Future<Output = crate::value::Dict> + Send { async move {
        self.call_method_o(name, args).await.unwrap_or_default()
    } }
    /// `call_method` by name taken back as an optional dict: `None` for anything but a map (as `.into_opt_dict()`).
    fn call_method_o(&mut self, name: &'static str, args: &[&Value]) -> impl ::std::future::Future<Output = Option<crate::value::Dict>> + Send { async move {
        self.call_method_as(name, args).await
    } }
    /// `call_method` by name with the body taken as its declared shape: `None` for any other body.
    fn call_method_as<T: crate::value::EndpointBody>(&mut self, name: &'static str, args: &[&Value]) -> impl ::std::future::Future<Output = Option<T>> + Send { async move {
        T::from_body(self.call_method(Value::Str(name.into()), args).await)
    } }

    /// Loads markets (and currencies), dispatching `fetch_markets` /
    /// `fetch_currencies` / `set_markets` to the derived overrides.
    fn load_markets(&mut self, reload: bool, params: impl Into<crate::Params> + Send) -> impl ::std::future::Future<Output = Result<crate::types::Markets>> + Send { async move {
        let _ = params.into();
        let markets = crate::runtime::call_typed(async move {
        let reload_b = reload;
        if !reload_b && self.markets.is_some() {
            return Value::from(&self.markets);
        }
        let has_fetch_currencies = matches!(
            self.has.get("fetchCurrencies").cloned().unwrap_or(Value::Null),
            Value::Bool(true),
        );
        let mut currencies = Value::Null;
        if has_fetch_currencies {
            if let Some(v) = self.dispatch_to_derived("fetch_currencies", &[]).await {
                currencies = v;
            }
            // Exchange.ts loadMarketsHelper: fetchMarkets reads the just-fetched
            // currencies from `options['cachedCurrencies']` (latoken, kraken, bitso, hyperliquid).
            // Moved in and taken back out below: one object, as in JS.
            set_cached_currencies(&mut self.options, std::mem::take(&mut currencies));
        }
        let fetched = self.dispatch_to_derived("fetch_markets", &[]).await;
        if let Some(c) = take_cached_currencies(&mut self.options) {
            currencies = c;
        }
        let fetched = match fetched {
            Some(v) => v,
            None => return Value::Null,
        };
        if matches!(fetched, Value::Null) {
            return Value::from(&self.markets);
        }
        let preloaded_non_empty = !self.currencies.is_empty();
        let currencies_arg = if matches!(&currencies, Value::Dict(m) if !m.is_empty()) {
            currencies
        } else if preloaded_non_empty {
            Value::from(&self.currencies)
        } else {
            crate::exchange_stubs::synthesize_currencies_from_markets(&fetched, &self.precisionMode)
        };
        let is_prediction = matches!(
            self.has.get("prediction").cloned().unwrap_or(Value::Null),
            Value::Bool(true),
        );
        if is_prediction {
            let _ = self.dispatch_to_derived("set_markets", &[fetched, currencies_arg]).await;
        } else {
            <Self as crate::exchange_generated::ExchangeBase>::set_markets(self, fetched, &[currencies_arg]);
        }
        // Index markets_by_id by the secondary id (`id2`, e.g. apex's
        // crossSymbolName) too, so a WS handler that resolves a market from the
        // id2-based stream id (`safeMarket(data['s'])`) reaches the unified
        // symbol instead of a synthetic one.
        if let Some(markets) = self.markets.clone() {
            if let Some(by_id_arc) = &self.markets_by_id {
                let mut by_id = (**by_id_arc).clone();
                for market in markets.values() {
                    if let (Value::Str(id2s), Value::Str(ids)) = (market.at("id2"), market.at("id")) {
                        if id2s != ids && !id2s.is_empty() && !by_id.contains_key(id2s.as_ref()) {
                            by_id.insert(id2s.to_string(), Value::List(vec![market.clone()]));
                        }
                    }
                }
                self.markets_by_id = Some(Arc::new(by_id));
            }
        }
        let _ = (self.markets_by_id_typed(), self.currencies_by_id_typed());
        Value::from(&self.markets)
        }).await?;
        Ok(crate::types::FromRaw::from_raw(markets))
    } }

    // ── super.X() shims — call the BASE (ExchangeBase) method, fully-qualified
    // so a derived override is bypassed (that is what `super.X()` means).
    fn super_describe(&self) -> Value {
        <Self as crate::exchange_generated::ExchangeBase>::describe(self)
    }
    fn super_set_sandbox_mode(&mut self, enabled: bool) {
        crate::types::IntoRaw::into_raw(<Self as crate::exchange_generated::ExchangeBase>::set_sandbox_mode(self, enabled));
    }
    fn super_safe_market(&self, id: Option<&str>, market: Option<&crate::types::Market>, delim: Value, market_type: Value) -> crate::types::Market {
        <Self as crate::exchange_generated::ExchangeBase>::safe_market(self, id, market, &[delim, market_type])
    }
    fn super_handle_market_type_and_params(&self, method_name: Value, market: Option<&crate::types::Market>, params: Value, default_value: Value) -> (Value, crate::value::Dict) {
        <Self as crate::exchange_generated::ExchangeBase>::handle_market_type_and_params(self, method_name, market, &[&params, &default_value])
    }
    fn super_market(&self, symbol: Value) -> Value {
        crate::types::IntoRaw::into_raw(<Self as crate::exchange_generated::ExchangeBase>::market_non_virtual(self, symbol.as_str().unwrap_or_default()))
    }
    fn super_handle_margin_mode_and_params(&self, method_name: Value, params: Value, default_value: Value) -> (Value, crate::value::Dict) {
        <Self as crate::exchange_generated::ExchangeBase>::handle_margin_mode_and_params(self, method_name, &[&params, &default_value])
    }
    fn super_safe_currency_code(&self, currency_id: Option<&str>, currency: Option<&crate::types::Currency>) -> Option<String> {
        <Self as crate::exchange_generated::ExchangeBase>::safe_currency_code(self, currency_id, currency)
    }
    fn super_set_markets(&mut self, markets: Value, currencies: Value) -> Value {
        <Self as crate::exchange_generated::ExchangeBase>::set_markets(self, markets, &[currencies])
    }
    fn super_network_id_to_code(&self, network_id: Option<&str>, currency_code: Option<&str>) -> Option<String> {
        <Self as crate::exchange_generated::ExchangeBase>::network_id_to_code(self, network_id, currency_code)
    }
    fn super_network_code_to_id(&self, network_code: Option<&str>, currency_code: Option<&str>) -> Value {
        <Self as crate::exchange_generated::ExchangeBase>::network_code_to_id(self, network_code, currency_code)
    }
    fn super_fetch_deposit_address(&mut self, code: Value, params: Value) -> impl ::std::future::Future<Output = Value> + Send { async move {
        let typed = <Self as crate::exchange_generated::ExchangeBase>::fetch_deposit_address(self, code.as_str().unwrap_or_default(), params).await;
        crate::types::IntoRaw::into_raw(typed)
    } }
    fn super_load_markets(&mut self, reload: Value, params: Value) -> impl ::std::future::Future<Output = Value> + Send { async move {
        crate::types::IntoRaw::into_raw(<Self as ExchangeRuntime>::load_markets(self, reload.is_truthy(), params).await)
    } }
    // `self.X(..)` for the trait slots with no ExchangeBase method, so an override printed only in the trait impl stays callable.
    fn parse_deposit(&self, tx: Value, currency: Option<&crate::types::Currency>) -> Value { DerivedExchange::parse_deposit(self, tx, currency) }
    fn parse_withdrawal(&self, tx: Value, currency: Option<&crate::types::Currency>) -> Value { DerivedExchange::parse_withdrawal(self, tx, currency) }
    fn parse_bid_ask(&self, bidask: Value, price_key: Value, amount_key: Value, market: Option<&crate::types::Market>) -> Value { DerivedExchange::parse_bid_ask(self, bidask, price_key, amount_key, market) }
    fn parse_my_trade(&self, trade: Value, market: Option<&crate::types::Market>) -> Value { DerivedExchange::parse_my_trade(self, trade, market) }
}

impl<T: crate::exchange_generated::ExchangeBase> ExchangeRuntime for T {}

/// Normalize a TS dynamic method name for the generated Rust dispatch table.
///
/// Must stay byte-identical to the transpiler's `toSnakeCase`
/// (`build/rustTranspiler.ts`) and to `Exchange::to_snake_case` (which names
/// the implicit-API entries `call_dynamic`'s fall-through looks up) — it is the
/// only thing deciding whether a paginated `this[method](...)` re-entry lands
/// on a dispatch arm. `method_name_snake_case_tests` pins all three.
///
/// A name that is not a `Value::Str` (or is empty) is a hard bug: TS
/// `this[name](...)` always indexes with a string. Returning `""` here would
/// resolve to no dispatch arm and no implicit endpoint, so `call_dynamic`
/// would hand back `Value::Null` and the caller would silently see an empty
/// page instead of an error — exactly the failure this PR set out to remove.
/// Panic instead, mirroring the TS `TypeError: this[method] is not a function`
/// (the transpiled try/catch turns it back into a catchable error).
pub fn method_name_to_snake_case(name: &Value) -> String {
    let name = match name {
        Value::Str(name) if !name.is_empty() => name,
        _ => panic!(
            "{}",
            crate::exchange_errors::not_supported(format!(
                "dynamic method dispatch requires a non-empty string method name, got {name:?}"
            )),
        ),
    };
    let chars: Vec<char> = name.chars().collect();
    let mut out = String::with_capacity(name.len() + 4);
    for (i, &c) in chars.iter().enumerate() {
        if c.is_ascii_uppercase() {
            let lower_before = i > 0
                && (chars[i - 1].is_ascii_lowercase() || chars[i - 1].is_ascii_digit());
            let acronym_end = i > 0 && chars[i - 1].is_ascii_uppercase()
                && chars.get(i + 1).map(|next| next.is_ascii_lowercase()).unwrap_or(false);
            if lower_before || acronym_end {
                out.push('_');
            }
            out.push(c.to_ascii_lowercase());
        } else {
            out.push(c);
        }
    }
    out
}

/// Wraps a `call_dynamic` re-entry that MUST resolve. `call_dynamic_base`'s
/// `_` arm returns `Value::Null` for a name that is neither a dispatch arm nor
/// an implicit-API endpoint — fine for an optional probe, but a dynamic
/// re-entry from `fetchPaginatedCall*` / `fetchWebEndpoint` would then hand the
/// caller an empty page instead of an error. That arm records the miss on
/// `internals.dynamic_dispatch_miss`; this raises it as a loud `NotSupported`,
/// the way `call_method` used to fail, so a dispatch regression surfaces as an
/// error rather than as null data (review on #30385).
pub trait CallDynamicChecked: crate::exchange_generated::ExchangeBase {
    fn call_dynamic_checked(&mut self, name: Value, args: Vec<Value>) -> impl ::std::future::Future<Output = Value> + Send { async move {
        let snake = method_name_to_snake_case(&name);
        // Clear first: a miss recorded by an unrelated earlier probe must not
        // be attributed to this call.
        self.internals.dynamic_dispatch_miss = None;
        let out = self.call_dynamic(&snake, &args).await;
        // Only OUR name counts — a nested optional probe inside the dispatched
        // method legitimately misses and must stay silent.
        if self.internals.dynamic_dispatch_miss.as_deref() == Some(snake.as_str()) {
            self.internals.dynamic_dispatch_miss = None;
            panic!(
                "{}",
                crate::exchange_errors::not_supported(format!(
                    "{} dynamic method {snake}() resolved to no dispatch arm and no implicit API endpoint",
                    crate::runtime::stringify_param(&self.id),
                )),
            );
        }
        out
    } }
}

impl<T: crate::exchange_generated::ExchangeBase> CallDynamicChecked for T {}

/// Every exchange (blanket over `ExchangeBase`): the typed unified methods come from
/// `ExchangeBase` / `ExchangeRuntime`, so code over any venue is `fn f<E: TypedExchange>(ex: &mut E)`.
pub trait TypedExchange: crate::exchange_generated::ExchangeBase + ExchangeRuntime {
    /// A unified method by snake_case name (any unified method or implicit endpoint),
    /// decoded into its typed return, e.g. `call::<Ticker>("fetch_ticker", args)`.
    fn call<R: crate::types::FromRaw + Send>(&mut self, method: &str, args: Vec<Value>) -> impl ::std::future::Future<Output = Result<R>> + Send { async move {
        Ok(R::from_raw(crate::runtime::call_typed(crate::exchange_generated::ExchangeBase::call_dynamic(self, method, &args)).await?))
    } }
}

impl<T: crate::exchange_generated::ExchangeBase> TypedExchange for T {}

/// Receives the concrete venue picked by id (`with_exchange`), monomorphised per venue.
pub trait ExchangeVisitor {
    type Output;
    fn visit<E: TypedExchange + 'static>(self, exchange: E) -> impl ::std::future::Future<Output = Self::Output> + Send;
}

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
    fn call_dynamic<'a>(&'a mut self, method: &'a str, args: &'a [Value])
        -> std::pin::Pin<Box<dyn std::future::Future<Output = Value> + Send + 'a>>
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
        let mut map: HashMap<String, (String, Vec<String>, String, Value)> = HashMap::new();
        Self::walk_api_node(&self.api, &[], &mut map);
        self.internals.implicit_api = map;
    }

    fn walk_api_node(
        node: &Value,
        crumbs: &[String],
        out: &mut HashMap<String, (String, Vec<String>, String, Value)>,
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
                for (path_key, endpoint_config) in m.iter() {
                    let config = match endpoint_config {
                        Value::Dict(_) => endpoint_config.clone(),
                        Value::Int(_) | Value::Float(_) => Value::Map({
                            let mut config = crate::value::HashMap::new();
                            config.insert("cost".to_string(), endpoint_config.clone());
                            config
                        }),
                        _ => Value::Map(crate::value::HashMap::new()),
                    };
                    Self::register_implicit(&verb, &scope_snake, &scope_segments, path_key, config, out);
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
                    let (path_str, config) = match path {
                        Value::Str(s) => (s.clone(), Value::Map(crate::value::HashMap::new())),
                        Value::Dict(pm) => match pm.get("method").or_else(|| pm.get("path")) {
                            Some(Value::Str(s)) => (s.clone(), path.clone()),
                            _ => continue,
                        },
                        _ => continue,
                    };
                    Self::register_implicit(&verb, &scope_snake, &scope_segments, &path_str, config, out);
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
        config: Value,
        out: &mut HashMap<String, (String, Vec<String>, String, Value)>,
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
        // An empty path (e.g. nado's `archive: { post: { '': 1 } }`, method
        // name `archivePost`) must NOT append a trailing `_` — the transpiled
        // call site looks up `archive_post`, not `archive_post_`.
        let snake_name = if snake.is_empty() {
            format!("{scope_snake}_{verb}")
        } else {
            format!("{scope_snake}_{verb}_{snake}")
        };
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
        // Snake-cased from the WHOLE camel name, which is what the transpiler
        // does to produce the call site. It usually equals `snake_name` above,
        // but the two diverge when a path segment starts with a digit: joining
        // pre-snaked parts forces a separator the transpiler never inserts, so
        // revolutx's `1.0/public/tickers` registers as
        // `public_get_10_public_tickers` while the generated code calls
        // `public_get10_public_tickers` (toSnakeCase puts no `_` between a
        // digit and the preceding letter). Register both spellings so either
        // resolves.
        let camel_snake_name = Self::to_snake_case(&camel_name);
        let entry = (path.to_string(), scope_segments.to_vec(), verb.to_uppercase(), config);
        out.insert(snake_name, entry.clone());
        if !out.contains_key(&camel_snake_name) {
            out.insert(camel_snake_name, entry.clone());
        }
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
        let api = self.urls.get("api").cloned().unwrap_or(Value::Null);
        // Try scoped first (binance-style: urls.api.public, urls.api.private).
        let scoped = api.at(scope).to_owned();
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
        if let Value::Str(s) = api.at("rest") {
            return Some(self.implode_hostname_typed(s));
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

    // Dispatches an implicit API call. Looks the method up in the dispatch
    // table (building it on first use) and routes through `request`.
    // Public-endpoint request: imploding params into the path/query and
    // hitting `fetch`. Private endpoints need per-exchange signing — for
    // now we treat anything outside `public` as a stub that returns Null.
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
        "sha384" => { let mut h = Sha384::new(); h.update(data); h.finalize().to_vec() }
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

/// The one HMAC dispatch for every hmac path; `None` for an unknown algorithm.
pub(crate) fn hmac_raw(data: &[u8], secret: &[u8], algo: &str) -> Option<Vec<u8>> {
    fn mac<D: Mac + hmac::digest::KeyInit>(data: &[u8], secret: &[u8]) -> Vec<u8> {
        let mut m = <D as Mac>::new_from_slice(secret).expect("HMAC accepts any key length");
        m.update(data);
        m.finalize().into_bytes().to_vec()
    }
    Some(match algo.to_ascii_lowercase().as_str() {
        "sha256" => mac::<Hmac<Sha256>>(data, secret),
        "sha384" => mac::<Hmac<Sha384>>(data, secret),
        "sha512" => mac::<Hmac<Sha512>>(data, secret),
        "sha1"   => mac::<Hmac<Sha1>>(data, secret),
        "md5"    => mac::<Hmac<Md5>>(data, secret),
        _ => return None,
    })
}

/// Formats a raw digest: `binary` is a byte-array Value, `base64`, else hex.
pub(crate) fn digest_value(raw: &[u8], digest: &str) -> Value {
    match digest {
        "binary" => Value::Array(raw.iter().map(|b| Value::Int(*b as i64)).collect()),
        "base64" => Value::Str(B64.encode(raw).into()),
        _        => Value::Str(hex_encode(raw).into()),
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
        use num_bigint::BigInt;
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
            hex_decode(h).unwrap_or_else(|| s.as_bytes().to_vec())
        }
        _ => value_to_bytes(v),
    }
}

/// Lowercase hex of `bytes`.
pub(crate) fn hex_encode(bytes: impl AsRef<[u8]>) -> String {
    const DIGITS: &[u8; 16] = b"0123456789abcdef";
    let bytes = bytes.as_ref();
    let mut out = String::with_capacity(bytes.len() * 2);
    for &b in bytes {
        out.push(DIGITS[(b >> 4) as usize] as char);
        out.push(DIGITS[(b & 0x0f) as usize] as char);
    }
    out
}

/// Hex (either case) to bytes; `None` on odd length or a non-hex char.
pub(crate) fn hex_decode(s: impl AsRef<[u8]>) -> Option<Vec<u8>> {
    fn nibble(c: u8) -> Option<u8> {
        match c {
            b'0'..=b'9' => Some(c - b'0'),
            b'a'..=b'f' => Some(c - b'a' + 10),
            b'A'..=b'F' => Some(c - b'A' + 10),
            _ => None,
        }
    }
    let s = s.as_ref();
    if s.len() % 2 != 0 {
        return None;
    }
    s.chunks_exact(2).map(|p| Some((nibble(p[0])? << 4) | nibble(p[1])?)).collect()
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

/// Writes `options['cachedCurrencies']`, as Exchange.ts loadMarketsHelper does
/// before its fetchMarkets call.
fn set_cached_currencies(options: &mut crate::value::Dict, currencies: Value) {
    Arc::make_mut(options).insert("cachedCurrencies".to_string(), currencies);
}

/// Deletes `options['cachedCurrencies']` after fetchMarkets, handing the value back.
fn take_cached_currencies(options: &mut crate::value::Dict) -> Option<Value> {
    Arc::make_mut(options).shift_remove("cachedCurrencies")
}

/// `options['cachedCurrencies']` lives only around fetchMarkets.
#[cfg(test)]
mod cached_currencies_tests {
    use super::{set_cached_currencies, take_cached_currencies, Exchange};
    use crate::Value;
    use super::HashMap;

    #[test]
    fn cached_currencies_set_then_removed() {
        let mut ex = Exchange::new(None);
        let mut c = HashMap::new();
        c.insert("BTC".to_string(), Value::Str("x".into()));
        set_cached_currencies(&mut ex.options, Value::Map(c));
        let cached = ex.options.get("cachedCurrencies").cloned().unwrap_or(Value::Null);
        assert_eq!(cached.as_map().map(|m| m.len()), Some(1));
        let back = take_cached_currencies(&mut ex.options);
        assert_eq!(back.as_ref().and_then(|v| v.as_map()).map(|m| m.len()), Some(1));
        assert!(!ex.options.contains_key("cachedCurrencies"));
    }
}

/// The User-Agent pick, against the real constructor and `initialize_properties`.
#[cfg(test)]
mod user_agent_tests {
    use super::Exchange;
    use crate::Value;
    use super::HashMap;

    const CHROME: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.94 Safari/537.36";
    const CHROME39: &str = "Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.71 Safari/537.36";

    fn described(user_agent: Value) -> Value {
        let mut m = HashMap::new();
        m.insert("userAgent".to_string(), user_agent);
        Value::Map(m)
    }

    #[test]
    fn unset_user_agent_falls_back_to_user_agents_chrome() {
        let mut ex = Exchange::new(None);
        assert_eq!(ex.user_agent_str(), Some(CHROME));
        ex.initialize_properties(described(Value::Null));
        assert_eq!(ex.user_agent_str(), Some(CHROME));
    }

    #[test]
    fn described_user_agent_is_applied() {
        let mut ex = Exchange::new(None);
        ex.initialize_properties(described(Value::Str(CHROME39.into())));
        assert_eq!(ex.user_agent_str(), Some(CHROME39));
    }

    #[test]
    fn dict_user_agent_sends_its_header_and_false_sends_none() {
        let mut ex = Exchange::new(None);
        let mut header = HashMap::new();
        header.insert("User-Agent".to_string(), Value::Str("ccxt-test".into()));
        ex.initialize_properties(described(Value::Map(header)));
        assert_eq!(ex.user_agent_str(), Some("ccxt-test"));
        ex.initialize_properties(described(Value::Bool(false)));
        assert_eq!(ex.user_agent_str(), None);
        ex.userAgent = Value::Str("".into());
        assert_eq!(ex.user_agent_str(), None);
    }
}

/// Pins the `mock_response` contract that `request_typed` implements: the canned
/// payload is returned by `fetch_typed` only AFTER the request has been built and
/// signed, so `last_request_url` / `_headers` / `_body` still describe the real
/// request a static *response* fixture would have sent; and the payload stays set
/// until the caller replaces or clears it, so one fixture can serve the several
/// `fetch_typed` calls a single paginating `fetchX` issues.

/// Pins `method_name_to_snake_case` — the transform that decides whether a
/// paginated `this[method](...)` re-entry lands on a `call_dynamic` arm — against
/// the two implementations it must agree with: the transpiler's `toSnakeCase`
/// (`build/rustTranspiler.ts`, which names the arms) and `Exchange::to_snake_case`
/// (which names the implicit-API entries the `_` arm falls through to).
/// Requested in review on #30385.
#[cfg(test)]
mod method_name_snake_case_tests {
    use super::{method_name_to_snake_case, Exchange};
    use crate::Value;

    fn snake(name: &str) -> String {
        method_name_to_snake_case(&Value::Str(name.to_string().into()))
    }

    // The four names the review called out, plus the digit/acronym shapes that
    // are the only places the three transforms could plausibly diverge.
    #[test]
    fn matches_the_transpiler_dispatch_arm_names() {
        // unified methods re-entered by fetchPaginatedCall* — these must hit an arm
        assert_eq!(snake("fetchTransfers"), "fetch_transfers");
        assert_eq!(snake("fetchOHLCV"), "fetch_ohlcv");                 // trailing acronym
        assert_eq!(snake("fetchOpenOrdersWs"), "fetch_open_orders_ws");
        assert_eq!(snake("fetchL2OrderBook"), "fetch_l2_order_book");   // letter+digit token
        assert_eq!(snake("getLeverageTiersPaginated"), "get_leverage_tiers_paginated");
        // implicit endpoints re-entered by fetchWebEndpoint — these must hit the
        // `_` arm's implicit_api lookup, which is keyed by to_snake_case
        assert_eq!(snake("publicGetTicker24hr"), "public_get_ticker24hr"); // NO `_` before a digit
        assert_eq!(snake("webExchangeGetV3Assets"), "web_exchange_get_v3_assets");
        assert_eq!(snake("webApiGetAjaxCoinCoinInfo"), "web_api_get_ajax_coin_coin_info");
        // acronym runs: `[A-Z]+[A-Z][a-z]` splits before the last capital only
        assert_eq!(snake("parseHTTPResponse"), "parse_http_response");
        assert_eq!(snake("fetchOHLCVWs"), "fetch_ohlcv_ws");
        // already-snake and single-token names are pass-through
        assert_eq!(snake("fetch"), "fetch");
        assert_eq!(snake("fetch_transfers"), "fetch_transfers");
    }

    // `method_name_to_snake_case` and `Exchange::to_snake_case` must produce the
    // SAME key, or a dynamic name would snake to something the implicit-api map
    // does not hold. Differential over the shapes above; the full 11k-name sweep
    // over every ts/src method + abstract endpoint also reports zero divergence.
    #[test]
    fn agrees_with_exchange_to_snake_case() {
        for name in [
            "fetchTransfers", "fetchOHLCV", "fetchOpenOrdersWs", "publicGetTicker24hr",
            "fetchL2OrderBook", "webExchangeGetV3Assets", "webApiGetAjaxCoinCoinInfo",
            "parseHTTPResponse", "fetchOHLCVWs", "privatePostSPEIWithdrawal",
            "sapiV3GetAsset", "fapiPublicGetTicker24hr", "publicGet10PublicTickers",
            "fetch", "fetchPositionsRisk", "createOrderWs", "fetchMyLiquidations",
        ] {
            assert_eq!(
                snake(name),
                Exchange::to_snake_case(name),
                "method_name_to_snake_case and Exchange::to_snake_case diverge on {name}",
            );
        }
    }

    // A non-string / empty dynamic name used to snake to "" and then resolve to
    // Value::Null — a silent empty page. It must be loud instead.
    #[test]
    #[should_panic(expected = "NotSupported")]
    fn non_string_method_name_is_loud() {
        let _ = method_name_to_snake_case(&Value::Int(7));
    }

    #[test]
    #[should_panic(expected = "NotSupported")]
    fn empty_method_name_is_loud() {
        let _ = method_name_to_snake_case(&Value::Str(String::new().into()));
    }
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

    #[test]
    fn implicit_api_retains_endpoint_cost_config() {
        let mut by_limit = crate::value::HashMap::new();
        by_limit.insert("cost".to_string(), Value::Int(2));
        by_limit.insert("byLimit".to_string(), Value::List(vec![
            Value::List(vec![Value::Int(100), Value::Int(5)]),
        ]));
        let mut endpoints = crate::value::HashMap::new();
        endpoints.insert("ticker".to_string(), Value::Float(0.1));
        endpoints.insert("depth".to_string(), Value::Map(by_limit.clone()));
        let mut verbs = crate::value::HashMap::new();
        verbs.insert("get".to_string(), Value::Map(endpoints));
        let mut api = crate::value::HashMap::new();
        api.insert("public".to_string(), Value::Map(verbs));
        let mut exchange = Exchange::new(None);
        exchange.api = Value::Map(api);
        exchange.build_implicit_api();
        let ticker_config = &exchange.internals.implicit_api["public_get_ticker"].3;
        assert_eq!(
            ticker_config.at("cost"),
            &Value::Float(0.1),
            "numeric endpoint costs must be normalized to a config object"
        );
        let depth_config = &exchange.internals.implicit_api["public_get_depth"].3;
        assert_eq!(depth_config, &Value::Map(by_limit), "object endpoint config must be retained");
    }

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

#[cfg(all(test, feature = "engine"))]
mod cow_alias_tests {
    use super::Exchange;
    use crate::Value;

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
        let r = Value::Dict(ex.convert_ohlcv_to_trading_view(ohlcvs, &[]));
        for key in ["t", "o", "h", "l", "c", "v"] {
            let col = r.at(key);
            assert_eq!(col.as_array().map(|a| a.len()), Some(2),
                "result['{key}'] lost its pushes — COW write-back failed");
        }
    }
}

#[cfg(test)]
mod http_error_tests {
    use super::{BaseCore, DerivedExchange, Exchange, ExchangeRuntime};
    use crate::Value;
    use futures::FutureExt;
    use std::io::{Read, Write};

    // Answers one request on a local port with the given status line and body.
    fn serve_once(status_line: &'static str, body: &'static str) -> String {
        let listener = std::net::TcpListener::bind("127.0.0.1:0").unwrap();
        let url = format!("http://{}/", listener.local_addr().unwrap());
        std::thread::spawn(move || {
            let (mut stream, _) = listener.accept().unwrap();
            let mut request = [0u8; 4096];
            let _ = stream.read(&mut request);
            let response = format!(
                "HTTP/1.1 {status_line}\r\nContent-Type: application/json\r\nContent-Length: {}\r\nConnection: close\r\n\r\n{body}",
                body.len(),
            );
            stream.write_all(response.as_bytes()).unwrap();
        });
        url
    }

    // A venue that reports failures inside a 200 body, the way okx does.
    struct EnvelopeCore {
        exchange: Exchange,
    }
    impl std::ops::Deref for EnvelopeCore {
        type Target = Exchange;
        fn deref(&self) -> &Exchange { &self.exchange }
    }
    impl std::ops::DerefMut for EnvelopeCore {
        fn deref_mut(&mut self) -> &mut Exchange { &mut self.exchange }
    }
    impl DerivedExchange for EnvelopeCore {
        fn handle_errors(&mut self, _code: i64, _reason: &str, _url: &str, _method: &str, _headers: Value, _body: &str, response: Value, _request_headers: Value, _request_body: Value) -> Value {
            let code = response.at("code");
            if !matches!(code, Value::Null) && *code != Value::Str("0".into()) {
                panic!("{}", crate::exchange_errors::create_error("InsufficientFunds", "code 51008"));
            }
            Value::Null
        }
    }
    impl crate::exchange_generated::ExchangeBase for EnvelopeCore {
        fn call_dynamic<'a>(&'a mut self, method: &'a str, args: &'a [Value])
            -> std::pin::Pin<Box<dyn std::future::Future<Output = Value> + Send + 'a>>
        {
            Box::pin(async move { self.call_dynamic_base(method, args).await })
        }
    }

    async fn fetch_error<C: ExchangeRuntime + Send>(core: &mut C, url: String) -> String {
        let outcome = std::panic::AssertUnwindSafe(core.fetch(Value::Str(url.into()), &[])).catch_unwind().await;
        match outcome {
            Ok(value) => format!("no error, returned {value:?}"),
            Err(payload) => payload.downcast_ref::<String>().cloned().unwrap_or_default(),
        }
    }

    #[tokio::test]
    async fn an_error_in_a_2xx_body_reaches_handle_errors() {
        let url = serve_once("200 OK", r#"{"code":"51008","msg":"Insufficient balance"}"#);
        let mut core = EnvelopeCore { exchange: Exchange::new(None) };
        let error = fetch_error(&mut core, url).await;
        assert!(error.contains("InsufficientFunds"), "{error}");
    }

    #[tokio::test]
    async fn a_status_in_http_exceptions_raises_its_class() {
        let url = serve_once("401 Unauthorized", "{}");
        let mut core = BaseCore::new(Exchange::new(None));
        let error = fetch_error(&mut core, url).await;
        assert!(error.contains("AuthenticationError"), "{error}");
    }

    #[tokio::test]
    async fn a_status_outside_http_exceptions_still_fails() {
        let url = serve_once("402 Payment Required", "{}");
        let mut core = BaseCore::new(Exchange::new(None));
        let error = fetch_error(&mut core, url).await;
        assert!(error.contains("ExchangeError"), "{error}");
    }
}

#[cfg(test)]
mod typed_by_id_tests {
    use super::Exchange;
    use crate::Value;
    use indexmap::IndexMap;

    fn market(id: &str, symbol: &str) -> Value {
        let mut m = IndexMap::new();
        m.insert("id".to_string(), Value::Str(id.to_string().into()));
        m.insert("symbol".to_string(), Value::Str(symbol.to_string().into()));
        Value::Map(m)
    }

    #[test]
    fn by_id_stores_decode_once_and_follow_a_replaced_map() {
        let mut ex = Exchange::new(None);
        let mut by_id = IndexMap::new();
        by_id.insert("BTCUSDT".to_string(), Value::Array(vec![market("BTCUSDT", "BTC/USDT"), market("BTCUSDT", "BTC/USDT:USDT")]));
        ex.markets_by_id = Some(std::sync::Arc::new(by_id));
        let first = ex.markets_by_id_typed();
        let rows = first.records_by_id("BTCUSDT").unwrap();
        assert_eq!(rows.len(), 2);
        assert_eq!(rows[1].symbol, "BTC/USDT:USDT");
        assert_eq!(rows[0].id.as_deref(), Some("BTCUSDT"));
        assert!(std::sync::Arc::ptr_eq(&first, &ex.markets_by_id_typed()));
        assert!(first.records_by_id("ETHUSDT").is_none());
        let mut cur = IndexMap::new();
        cur.insert("XBt".to_string(), market("XBt", "BTC"));
        ex.currencies_by_id = Some(std::sync::Arc::new(cur));
        assert_eq!(ex.currencies_by_id_typed().records_by_id("XBt").unwrap()[0].id.as_deref(), Some("XBt"));
        assert_eq!(ex.currencies_by_id_typed().records_by_id("XBt").unwrap()[0].code, None);
        assert_eq!(ex.currencies_by_id_typed().records_by_id("XBt").unwrap()[0].active, None);
        ex.markets_by_id = None;
        assert!(ex.markets_by_id_typed().records_by_id("BTCUSDT").is_none());
    }
}

#[cfg(test)]
mod digest_dispatch_tests {
    use super::*;

    const SHA384_HMAC_JEFE: &str = "af45d2e376484031617f78d2b58a6b1b9c7ef464f5a01b47e42ec3736322445e8e2240ca5e69e2c78b3239ecfab21649";

    #[test]
    fn every_hmac_path_supports_sha384() {
        let data = || Value::Str("what do ya want for nothing?".into());
        let key = || Value::Str("Jefe".into());
        let ex = Exchange::new(None);
        let method = ex.hmac(data(), key(), "sha384", &[]);
        let free = crate::runtime::hmac(data(), key(), Value::Str("sha384".into()), Value::Str("hex".into()));
        let typed = ex.hmac_typed(b"what do ya want for nothing?", b"Jefe", "SHA384", "hex").unwrap();
        assert_eq!(method, SHA384_HMAC_JEFE); // `hmac` returns String on this branch
        assert_eq!(free, Value::Str(SHA384_HMAC_JEFE.into()));
        assert_eq!(typed, SHA384_HMAC_JEFE);
    }

    #[test]
    fn hash_supports_sha384() {
        let ex = Exchange::new(None);
        assert_eq!(ex.hash_typed(b"abc", "sha384", "hex"),
            "cb00753f45a35e8bb5a03d699ac65007272c32ab0eded1631a8b605a43ff5bed8086072ba1e7cc2358baeca134c825a7");
    }

    #[test]
    fn hex_helpers_match_hex_crate_semantics() {
        assert_eq!(hex_encode([0x00u8, 0xab, 0xff]), "00abff");
        assert_eq!(hex_decode("00ABff"), Some(vec![0x00, 0xab, 0xff]));
        assert_eq!(hex_decode("abc"), None);
        assert_eq!(hex_decode("zz"), None);
        assert_eq!(hex_decode(""), Some(vec![]));
    }
}

#[cfg(test)]
mod option_tuple_dispatch_tests {
    use super::{BaseCore, Exchange};
    use crate::exchange_generated::ExchangeBase;
    use crate::Value;

    fn params(k: &str, v: Value) -> Value {
        let mut m = indexmap::IndexMap::new();
        m.insert(k.to_string(), v);
        Value::Map(m)
    }

    // The typed `(slot 0, Dict)` returns, called by quoted name, still answer the boxed `[value, params]` list.
    #[tokio::test]
    async fn call_dynamic_reboxes_the_option_tuple() {
        let mut core = BaseCore::new(Exchange::new(None));
        let args = |p: Value, d: Value| vec![p, Value::Str("fetchX".into()), Value::Str("flag".into()), d];
        let got = core.call_dynamic("handle_option_bool_and_params", &args(params("flag", Value::Str("true".into())), Value::Bool(false))).await;
        assert_eq!(got, Value::from(vec![Value::Bool(true), Value::Map(Default::default())]));
        let got = core.call_dynamic("handle_option_bool_and_params", &args(Value::Map(Default::default()), Value::Null)).await;
        assert_eq!(got, Value::from(vec![Value::Null, Value::Map(Default::default())]));
        let got = core.call_dynamic("handle_option_integer_and_params", &args(params("other", Value::Int(1)), Value::Int(7))).await;
        assert_eq!(got, Value::from(vec![Value::Int(7), params("other", Value::Int(1))]));
        let got = core.call_dynamic("handle_option_and_params", &args(params("flag", Value::Str("s".into())), Value::Null)).await;
        assert_eq!(got, Value::from(vec![Value::Str("s".into()), Value::Map(Default::default())]));
        let got = core.call_dynamic("handle_option_string_and_params2", &[params("b", Value::Str("v".into())), Value::Str("fetchX".into()),
            Value::Str("a".into()), Value::Str("b".into()), Value::Null]).await;
        assert_eq!(got, Value::from(vec![Value::Str("v".into()), Value::Map(Default::default())]));
    }
}
