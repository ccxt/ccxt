// Live-test dispatcher — one persistent real exchange Core per id, keyed
// in a global cache so `exchange.<method>(...)` in the transpiled tests
// runs the *same* code a user gets when consuming `ccxt`. Mirrors how Go's
// `initExchange(name)` returns a `*Exchange` whose method calls dispatch
// to the real exchange implementation.

use ccxt::Value;
use ccxt::exchange::DynCallFn;
use ccxt::exchanges::{
    aftermath::AftermathCore, alpaca::AlpacaCore, apex::ApexCore,
    arkham::ArkhamCore, ascendex::AscendexCore, aster::AsterCore,
    backpack::BackpackCore, bequant::BequantCore, bigone::BigoneCore,
    binance::BinanceCore, binancecoinm::BinancecoinmCore,
    binanceus::BinanceusCore, binanceusdm::BinanceusdmCore,
    bingx::BingxCore, bit2c::Bit2cCore, bitbank::BitbankCore,
    bitbns::BitbnsCore, bitfinex::BitfinexCore, bitflyer::BitflyerCore,
    bitget::BitgetCore, bithumb::BithumbCore, bitmart::BitmartCore,
    bitmex::BitmexCore, bitopro::BitoproCore, bitrue::BitrueCore,
    bitso::BitsoCore, bitstamp::BitstampCore, bitteam::BitteamCore,
    bittrade::BittradeCore, bitvavo::BitvavoCore,
    blockchaincom::BlockchaincomCore, blofin::BlofinCore,
    btcbox::BtcboxCore, btcmarkets::BtcmarketsCore, btcturk::BtcturkCore,
    bullish::BullishCore, bybit::BybitCore, bydfi::BydfiCore, cex::CexCore,
    coinbase::CoinbaseCore, coinbaseadvanced::CoinbaseadvancedCore,
    coinbaseexchange::CoinbaseexchangeCore,
    coinbaseinternational::CoinbaseinternationalCore,
    coincheck::CoincheckCore, coinex::CoinexCore, coinmate::CoinmateCore,
    coinmetro::CoinmetroCore, coinone::CoinoneCore, coinsph::CoinsphCore,
    coinspot::CoinspotCore, cryptocom::CryptocomCore,
    cryptomus::CryptomusCore, deepcoin::DeepcoinCore, delta::DeltaCore,
    deribit::DeribitCore, derive::DeriveCore, digifinex::DigifinexCore,
    dydx::DydxCore, exmo::ExmoCore, fmfwio::FmfwioCore, foxbit::FoxbitCore,
    gate::GateCore, gateio::GateioCore, gemini::GeminiCore, grvt::GrvtCore,
    hashkey::HashkeyCore, hibachi::HibachiCore, hitbtc::HitbtcCore,
    hollaex::HollaexCore, htx::HtxCore, huobi::HuobiCore,
    hyperliquid::HyperliquidCore,
    independentreserve::IndependentreserveCore, indodax::IndodaxCore,
    kraken::KrakenCore, krakenfutures::KrakenfuturesCore,
    kucoin::KucoinCore, kucoinfutures::KucoinfuturesCore,
    latoken::LatokenCore, lbank::LbankCore, lighter::LighterCore,
    luno::LunoCore, mercado::MercadoCore, mexc::MexcCore,
    modetrade::ModetradeCore, myokx::MyokxCore, ndax::NdaxCore,
    novadax::NovadaxCore, okx::OkxCore, okxus::OkxusCore,
    onetrading::OnetradingCore, oxfun::OxfunCore, p2b::P2bCore,
    pacifica::PacificaCore, paradex::ParadexCore, paymium::PaymiumCore,
    phemex::PhemexCore, poloniex::PoloniexCore, tokocrypto::TokocryptoCore,
    toobit::ToobitCore, upbit::UpbitCore, wavesexchange::WavesexchangeCore,
    weex::WeexCore, whitebit::WhitebitCore, woo::WooCore,
    woofipro::WoofiproCore, xt::XtCore, yobit::YobitCore, zaif::ZaifCore,
    zebpay::ZebpayCore,
    bybiteu::BybiteuCore, extended::ExtendedCore, gateeu::GateeuCore,
    kucoineu::KucoineuCore, mudrex::MudrexCore,
};
use crate::registry::for_each_core;
use indexmap::IndexMap as HashMap;
use std::sync::{Mutex, OnceLock};

/// Reads the cached Core's `last_request_url` / `_body` / `_headers`
/// out of the type-erased pointer. One per Core type so we can keep
/// the registry value-typed (no trait objects).
type ReadStateFn = fn(*mut ()) -> Value;

/// Shallow-merges `new_options` into the cached Core's `options` Map.
/// Lets `exchange.options['uta'] = false` (snapshot mutation) flow
/// through to the live Core before its next call — otherwise broker-id
/// tests that toggle option flags on the snapshot would have no effect
/// on the actual `createOrder` code path that runs on the Core.
type WriteOptionsFn = fn(*mut (), Value);

/// Writes a canned HTTP response into the cached Core's `mock_response`.
/// Used by static *response* tests: `setFetchResponse` stashes the JSON
/// payload on the snapshot, and the next dispatch pushes it to the Core
/// so `fetch_typed` returns it without hitting the network. Single-use —
/// `fetch_typed` clears `mock_response` once consumed.
type WriteMockFn = fn(*mut (), Value);

/// Per-Core typed drop. Necessary because `*mut ()` erases the type, so
/// `Box::from_raw` on a raw `*mut ()` would deallocate the bytes but
/// never run the Core's `Drop` chain (deep `Value::Map`s + a reqwest
/// client). Each `ensure_live_core` replacement reclaims the old Box
/// through this trampoline.
type DropCoreFn = fn(*mut ());

/// Resolves a snapshot heavy-field (`markets`, `markets_by_id`, …) by
/// reading it straight off the Core. Used by `LIVE_LOOKUP` so the test
/// runner's snapshot can stay tiny — only `__live_id` + a few light
/// scalars — and avoid deep-cloning ~4k markets per helper invocation.
type ReadFieldFn = fn(*mut (), &str) -> Option<Value>;

/// Writes a credential / single-field value onto the Core. Static
/// request tests for chain-signature exchanges read `walletAddress` /
/// `privateKey` from the fixture and stash them on the snapshot; the
/// Core was built with the offline-default placeholders and wouldn't
/// otherwise see those.
type WriteFieldFn = fn(*mut (), &str, Value);

/// Resolves a SINGLE market by unified symbol off the Core, reusing the
/// Core's real `market()` logic (markets → markets_by_id → expired
/// option). Returns just that one market — crucial for perf: the
/// validators call `exchange.market(symbol)` once per item, and routing
/// that through `read_field("markets")` would deep-clone the whole
/// ~4k-entry map on every call (≈25ms × thousands of tickers/markets).
type ReadMarketFn = fn(*mut (), &str) -> Value;

/// Cheap "is this a known market symbol" check off the Core — a key
/// containment test on `markets` / `markets_by_id` with no clone. The
/// `symbol in exchange.markets` guard in `test.ticker.rs` runs once per
/// ticker; routing it through `read_field("markets")` would clone the
/// whole map each time.
type HasMarketFn = fn(*mut (), &str) -> bool;

/// The leaked raw pointer to a boxed `<Exchange>Core`. `*mut ()` isn't
/// `Send` by default; the unsafe impls assert that the Box lives forever
/// on the heap (we leak it) and is touched serially from the test runner.
#[derive(Copy, Clone)]
struct CorePtr(*mut ());
unsafe impl Send for CorePtr {}
unsafe impl Sync for CorePtr {}

#[derive(Copy, Clone)]
struct CoreEntry {
    call:          DynCallFn,
    ptr:           CorePtr,
    read_state:    ReadStateFn,
    write_options: WriteOptionsFn,
    write_mock:    WriteMockFn,
    drop_core:     DropCoreFn,
    read_field:    ReadFieldFn,
    write_field:   WriteFieldFn,
    read_market:   ReadMarketFn,
    has_market:    HasMarketFn,
}

static CORES: OnceLock<Mutex<HashMap<String, CoreEntry>>> = OnceLock::new();

fn cores() -> &'static Mutex<HashMap<String, CoreEntry>> {
    CORES.get_or_init(|| Mutex::new(HashMap::new()))
}

/// True iff a real Core has been instantiated for this id.
pub fn has_live(id: &str) -> bool {
    cores().lock().map(|m| m.contains_key(id)).unwrap_or(false)
}

/// Build (and cache) the real exchange Core for `id`. Always rebuilds —
/// each call to `initExchange` is a fresh test case and must not see
/// state (option flags, last_request_*) left over from a previous case.
/// Mirrors Go's `InitOfflineExchange` returning a brand-new exchange.
/// Hand-written helper used by `test_helpers::initExchange` to push
/// proxy fields (and any other Value-typed Core field) straight onto
/// the registered Core. Needed because the transpiled `expand_settings`
/// runs on a clone of the snapshot and its `set_value` mutations never
/// reach the live Core; the proxy lookup is therefore done in Rust
/// against `skip-tests.json` directly and written through here.
pub fn write_field_for_id(id: &str, key: &str, value: Value) {
    let entry = {
        let m = cores().lock().unwrap();
        m.get(id).copied()
    };
    if let Some(entry) = entry {
        (entry.write_field)(entry.ptr.0, key, value);
    }
}

pub fn ensure_live_core(id: &str, cfg: Value) {
    if let Some(entry) = build_core(id, cfg) {
        // Drop the old entry's leaked Box before replacing — otherwise
        // static-fixture tests (one initExchange per case, ~thousands of
        // cases) would leak a Box<Core> per test.
        let mut m = cores().lock().unwrap();
        if let Some(old) = m.insert(id.to_string(), entry) {
            (old.drop_core)(old.ptr.0);
        }
    }
}

/// Dispatch `method(args)` against the cached real Core. Returns
/// `Value::Null` if no Core is registered for `id`. Hits the network if
/// the method does — this is the same code path `npm run cli.rs` uses.
pub async fn live_call(id: &str, method: &str, args: Vec<Value>) -> Value {
    let entry = {
        let m = cores().lock().unwrap();
        m.get(id).copied()
    };
    let entry = match entry { Some(e) => e, None => return Value::Null };
    let snake = camel_to_snake(method);
    (entry.call)(entry.ptr.0, &snake, args).await
}

/// Unified dispatch — what the transpiled test code calls in place of
/// `exchange.<method>(args).await`. Extracts the exchange id from the
/// Value snapshot, looks up the cached real Core, forwards the call,
/// and finally syncs the `last_request_url` / `_body` / `_headers`
/// fields from the live Core back onto the snapshot Map. Without that
/// sync the transpiled `get_value(&exchange, "last_request_body")` reads
/// (used by broker-id and static request tests) would see the stale
/// initial snapshot — never the request the dispatched call just made.
///
/// Panics inside the call are caught, the state sync runs, and then the
/// panic is resumed so the test's outer `catch_unwind` still observes
/// the error. Mirrors Go's typed-interface dispatch through
/// `ccxt.ICoreExchange`.
pub async fn dispatch(ex: &mut Value, method: &str, args: Vec<Value>) -> Value {
    let id = match ccxt::get_value(ex, &Value::Str("id".to_string())) {
        Value::Str(s) => s,
        _ => return Value::Null,
    };
    let entry = {
        let m = cores().lock().unwrap();
        m.get(&id).copied()
    };
    let entry = match entry { Some(e) => e, None => return Value::Null };
    // Pre-flight: propagate snapshot writes (e.g. `options.uta = false`
    // in the kucoin broker test) to the live Core before the call so the
    // dispatched code path observes them.
    let opts = ccxt::get_value(ex, &Value::Str("options".to_string()));
    if matches!(opts, Value::Dict(_)) {
        (entry.write_options)(entry.ptr.0, opts);
    }
    // Propagate per-case credential overrides too. Static request tests
    // for chain-signature exchanges (pacifica/hyperliquid/paradex) set
    // `walletAddress` / `privateKey` on the snapshot from the fixture;
    // the Core was built with the offline-default credentials and
    // wouldn't otherwise see those.
    //
    // The same write-through applies to proxy fields: the transpiled
    // `tests.rs::initExchangeBeforeTests` reads `httpProxy` / `httpsProxy`
    // / `wsProxy` / `wssProxy` from `skip-tests.json` when `--useProxy`
    // is passed and `set_value`s them on the snapshot. The Core builds
    // its `reqwest::Client` from its OWN `httpProxy`/`httpsProxy`/
    // `socksProxy` fields, so without this propagation the proxies stay
    // snapshot-only and live requests go direct (e.g. binance 451 from
    // a restricted region). Push the snapshot values to the Core too.
    for key in ["walletAddress", "privateKey", "apiKey", "secret", "uid",
                "password", "token", "login", "accountId",
                "httpProxy", "httpsProxy", "socksProxy", "proxy",
                "wsProxy", "wssProxy", "wsSocksProxy"] {
        let v = ccxt::get_value(ex, &Value::Str(key.to_string()));
        if matches!(v, Value::Str(ref s) if !s.is_empty()) {
            (entry.write_field)(entry.ptr.0, key, v);
        }
    }
    // Static fixtures replace `exchange.currencies` on the snapshot with
    // the contents of `static/currencies/<id>.json` (mirroring TS's
    // `exchange.currencies = currencies` reassignment in
    // `initOfflineExchange`). The Core's after-construct path
    // synthesizes currencies from markets and would otherwise compute
    // a wrong `currency.id` (e.g. bitmex `XBT` instead of `XBt`),
    // breaking URL builders. Push the snapshot value back here.
    if let Value::Dict(m) = &*ex {
        if let Some(curr) = m.get("currencies") {
            if matches!(curr, Value::Dict(c) if !c.is_empty()) {
                (entry.write_field)(entry.ptr.0, "currencies", curr.clone());
            }
        }
    }
    // Now that the currencies live on the Core, drop the (often 100s-of-KB)
    // copy from the snapshot. The static-output assertions recurse with
    // `exchange.clone()` per node, so a heavy `currencies` map there turned
    // `--responseTests` into an O(nodes × map-size) crawl (minutes).
    // Reads of `exchange.currencies` fall through to `live_lookup` → the
    // Core, which now holds them.
    if let Value::Dict(m) = &mut *ex { std::sync::Arc::make_mut(m).shift_remove("currencies"); }
    // Static *response* tests stash a canned JSON payload via
    // `setFetchResponse(exchange, response)` — push it to the Core so
    // `fetch_typed` returns it instead of hitting the (fake) network.
    // `Null` clears any leftover mock.
    let mock = ccxt::get_value(ex, &Value::Str("__fetchResponse".to_string()));
    (entry.write_mock)(entry.ptr.0, mock);
    // Clear the snapshot's mock so it doesn't leak into a subsequent
    // dispatch on the same exchange.
    if let Value::Dict(m) = &mut *ex { std::sync::Arc::make_mut(m).shift_remove("__fetchResponse"); }
    let snake = camel_to_snake(method);
    let fut = (entry.call)(entry.ptr.0, &snake, args);
    let result = futures::FutureExt::catch_unwind(
        std::panic::AssertUnwindSafe(fut)
    ).await;
    // Sync first — broker-id tests rely on reading `last_request_*`
    // after a panic'd `createOrder` (offline proxy makes the send fail).
    let state = (entry.read_state)(entry.ptr.0);
    if let (Value::Dict(snapshot), Value::Dict(fresh)) = (&mut *ex, state) {
        let snapshot = std::sync::Arc::make_mut(snapshot);
        let fresh = std::sync::Arc::try_unwrap(fresh).unwrap_or_else(|a| (*a).clone());
        for (k, v) in fresh { snapshot.insert(k, v); }
    }
    match result {
        Ok(v) => v,
        Err(panic) => std::panic::resume_unwind(panic),
    }
}

fn build_core(id: &str, cfg: Value) -> Option<CoreEntry> {
    // Field access on `core.last_request_*` auto-derefs through each
    // Core's `Deref` chain (root: `BinanceCore → Exchange`; subclass:
    // `BinanceusCore → BinanceCore → Exchange`) — so this one expression
    // works for every Core type without per-subclass plumbing.
    macro_rules! arm { ($name:ident, $core:ident) => {
        if id == stringify!($name) {
            let mut ex = Box::new(<$core>::new(Some(cfg.clone())));
            ex.bind();
            let raw = Box::into_raw(ex) as *mut ();
            fn read_state(ptr: *mut ()) -> Value {
                let core: &$core = unsafe { &*(ptr as *const $core) };
                let mut m = HashMap::new();
                m.insert("last_request_url".to_string(),     core.last_request_url.clone());
                m.insert("last_request_body".to_string(),    core.last_request_body.clone());
                m.insert("last_request_headers".to_string(), core.last_request_headers.clone());
                // Heavy fields (`markets`, `markets_by_id`, `symbols`,
                // `currencies`, etc.) are NOT eagerly copied — that
                // would deep-clone ~4k market entries on every dispatch
                // and again on every helper call (e.g. binance's
                // testMarket loops 4k times × 20 `exchange.clone()`).
                // Instead, the snapshot carries `__live_id` and the
                // `ccxt::value::LIVE_LOOKUP` thread-local resolves
                // those reads against the Core directly. Lightweight
                // fields (`has`, `options`, `codes`, `ids`) still mirror
                // here so helpers that scan them work synchronously.
                m.insert("has".to_string(),                  core.has.clone());
                m.insert("options".to_string(),              core.options.clone());
                // `symbols`, `codes`, `ids` resolve through LIVE_LOOKUP
                // — even the string lists are heavy (~4k strings for
                // binance) and get re-cloned per helper invocation.
                Value::Map(m)
            }
            // Live-lookup accessor for the `LIVE_LOOKUP` callback —
            // resolves heavy fields straight off the Core without
            // cloning them into the snapshot.
            fn read_field(ptr: *mut (), key: &str) -> Option<Value> {
                let core: &$core = unsafe { &*(ptr as *const $core) };
                Some(match key {
                    "markets"          => core.markets.clone(),
                    "markets_by_id"    => core.markets_by_id.clone(),
                    "currencies"       => core.currencies.clone(),
                    "currencies_by_id" => core.currencies_by_id.clone(),
                    // Lightweight ones still served here so a `__live_id`
                    // snapshot stays fully introspectable through the
                    // same code path.
                    "symbols"          => core.symbols.clone(),
                    "codes"            => core.codes.clone(),
                    "ids"              => core.ids.clone(),
                    "has"              => core.has.clone(),
                    "options"          => core.options.clone(),
                    "last_request_url"     => core.last_request_url.clone(),
                    "last_request_body"    => core.last_request_body.clone(),
                    "last_request_headers" => core.last_request_headers.clone(),
                    "id"               => core.id.clone(),
                    "precisionMode"    => core.precisionMode.clone(),
                    "fees"             => core.fees.clone(),
                    "urls"             => core.urls.clone(),
                    // Describe-derived config blocks. These are large
                    // (binance's `api` alone is hundreds of nested
                    // endpoints) and immutable during a test run, so we
                    // strip them from the cloned snapshot in
                    // `initExchange` and resolve them straight off the
                    // Core here. Keeps `exchange.clone()` — which the
                    // transpiled validators do dozens of times per
                    // market — from deep-copying the whole describe()
                    // output on every iteration.
                    "api"              => core.api.clone(),
                    "timeframes"       => core.timeframes.clone(),
                    "exceptions"       => core.exceptions.clone(),
                    "features"         => core.features.clone(),
                    "precision"        => core.precision.clone(),
                    "limits"           => core.limits.clone(),
                    _ => return None,
                })
            }
            fn write_options(ptr: *mut (), new_opts: Value) {
                // Snapshot wins. The test harness's static-fixture loop
                // resets `snapshot.options` to its pre-case state after
                // every test case (binance.json has cases that set
                // `portfolioMargin: true` and the next case must NOT see
                // it). A merge would let stale per-case keys leak across
                // cases, so we replace outright — the snapshot already
                // mirrors `describe().options` since `to_value()` seeded it.
                let core: &mut $core = unsafe { &mut *(ptr as *mut $core) };
                if let Value::Dict(_) = &new_opts {
                    core.options = new_opts;
                }
            }
            fn write_mock(ptr: *mut (), response: Value) {
                let core: &mut $core = unsafe { &mut *(ptr as *mut $core) };
                core.mock_response = response;
            }
            fn drop_core(ptr: *mut ()) {
                // SAFETY: `ptr` came from `Box::into_raw` of a
                // `Box<$core>` in the same macro invocation. The
                // registry just removed its only reference; we own it.
                unsafe { drop(Box::from_raw(ptr as *mut $core)); }
            }
            fn write_field(ptr: *mut (), key: &str, value: Value) {
                let core: &mut $core = unsafe { &mut *(ptr as *mut $core) };
                match key {
                    "walletAddress" => core.walletAddress = value,
                    "privateKey"    => core.privateKey    = value,
                    "apiKey"        => core.apiKey        = value,
                    "secret"        => core.secret        = value,
                    "uid"           => core.uid           = value,
                    "password"      => core.password      = value,
                    "token"         => core.token         = value,
                    "login"         => core.login         = value,
                    "accountId"     => core.accountId     = value,
                    // Proxy fields — `--useProxy` reads these from
                    // `skip-tests.json` per-exchange in
                    // `tests.rs::initExchangeBeforeTests`. The Core's
                    // `http_client()` (which builds the cached
                    // `reqwest::Client`) reads these fields directly, so
                    // they MUST be propagated to the Core not just the
                    // snapshot — otherwise live test runs ignore the
                    // proxy and hit binance/etc. direct (→ 451 from
                    // restricted regions). The HTTP client is built
                    // lazily on the first request, so writing here
                    // (before the test calls `loadMarkets`) is in time.
                    "httpProxy"     => core.httpProxy     = value,
                    "httpsProxy"    => core.httpsProxy    = value,
                    "socksProxy"    => core.socksProxy    = value,
                    "proxy"         => core.proxy         = value,
                    "wsProxy"       => core.wsProxy       = value,
                    "wssProxy"      => core.wssProxy      = value,
                    "wsSocksProxy"  => core.wsSocksProxy  = value,
                    // Heavy fields. Static fixtures load these from
                    // `static/{markets,currencies}/<id>.json` and the
                    // test runner reassigns them on the snapshot after
                    // construction (mirroring TS's
                    // `exchange.currencies = currencies` line in
                    // `initOfflineExchange`). Without this branch, the
                    // Core keeps the synthesized-from-markets versions
                    // and downstream URL builders compute the wrong
                    // `currency.id` (e.g. bitmex `XBt` vs `XBT`).
                    "markets"       => core.markets    = value,
                    "currencies"    => core.currencies = value,
                    _ => {},
                }
            }
            fn read_market(ptr: *mut (), symbol: &str) -> Value {
                // Reuse the Core's real `market()` (markets →
                // markets_by_id → expired option) but clone only the one
                // market it returns — not the whole markets map.
                let core: &$core = unsafe { &*(ptr as *const $core) };
                core.market(Value::Str(symbol.to_string()))
            }
            fn has_market(ptr: *mut (), symbol: &str) -> bool {
                let core: &$core = unsafe { &*(ptr as *const $core) };
                let key = Value::Str(symbol.to_string());
                ccxt::runtime::in_op(&core.markets, &key)
                    || ccxt::runtime::in_op(&core.markets_by_id, &key)
            }
            return Some(CoreEntry {
                call:          <$core>::__call_dynamic_dispatch as DynCallFn,
                ptr:           CorePtr(raw),
                read_state:    read_state    as ReadStateFn,
                write_options: write_options as WriteOptionsFn,
                write_mock:    write_mock    as WriteMockFn,
                drop_core:     drop_core     as DropCoreFn,
                read_field:    read_field    as ReadFieldFn,
                write_field:   write_field   as WriteFieldFn,
                read_market:   read_market   as ReadMarketFn,
                has_market:    has_market    as HasMarketFn,
            });
        }
    }; }
    for_each_core!(arm);
    None
}

/// Resolves `<id>.<key>` against the cached Core (`live_lookup_thunk`
/// is installed by `init_live_lookup` and read from `ccxt::value::get_value`).
fn live_lookup(id: &str, key: &str) -> Option<Value> {
    let entry = {
        let m = cores().lock().ok()?;
        m.get(id).copied()
    };
    let entry = entry?;
    (entry.read_field)(entry.ptr.0, key)
}

/// Resolves a single market by symbol off the cached Core for `id`,
/// without cloning the whole markets map. Returns `Value::Null` if the
/// id isn't a live Core. Used by `ExchangeOps::market` for `__live_id`
/// snapshots.
pub fn market_for(id: &str, symbol: &str) -> Value {
    let entry = {
        let m = match cores().lock() { Ok(g) => g, Err(_) => return Value::Null };
        m.get(id).copied()
    };
    match entry {
        Some(e) => (e.read_market)(e.ptr.0, symbol),
        None    => Value::Null,
    }
}

/// Cheap membership: is `symbol` a known market on the cached Core for
/// `id`? No markets-map clone. Returns `false` for non-live ids.
pub fn has_market(id: &str, symbol: &str) -> bool {
    let entry = {
        let m = match cores().lock() { Ok(g) => g, Err(_) => return false };
        m.get(id).copied()
    };
    match entry {
        Some(e) => (e.has_market)(e.ptr.0, symbol),
        None    => false,
    }
}

/// Wire the heavy-field resolver into the ccxt crate. Call once from
/// `main` before any live dispatch.
pub fn init_live_lookup() {
    ccxt::value::set_live_lookup(live_lookup);
}

/// camelCase → snake_case, matching the transpiler's `toSnakeCase`.
/// Mirrors registry.rs (kept here so the live path doesn't depend on
/// the offline-dispatch module).
fn camel_to_snake(s: &str) -> String {
    let bytes: Vec<char> = s.chars().collect();
    let mut out = String::with_capacity(s.len() + 4);
    for i in 0..bytes.len() {
        let c = bytes[i];
        let prev = if i > 0 { Some(bytes[i - 1]) } else { None };
        let next = if i + 1 < bytes.len() { Some(bytes[i + 1]) } else { None };
        if c.is_ascii_uppercase() {
            let prev_lower_or_digit = prev.map(|p| p.is_ascii_lowercase() || p.is_ascii_digit()).unwrap_or(false);
            let prev_upper = prev.map(|p| p.is_ascii_uppercase()).unwrap_or(false);
            let next_lower = next.map(|n| n.is_ascii_lowercase()).unwrap_or(false);
            if prev_lower_or_digit { out.push('_'); }
            else if prev_upper && next_lower { out.push('_'); }
        }
        out.push(c.to_ascii_lowercase());
    }
    out
}
