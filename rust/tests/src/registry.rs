// Exchange registry — maps an exchange id to an async dispatcher that
// runs `<method>(args)` in offline mode and returns whatever was about
// to be sent over the network (URL, headers, body).
//
// Adding a new exchange is one arm of the `match` in `dispatch`.

use ccxt::Value;
use ccxt::exchanges::{
    alpaca::AlpacaCore, apex::ApexCore,
    aster::AsterCore,
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
    coinbase::CoinbaseCore,
    coinbaseexchange::CoinbaseexchangeCore,
    coinbaseinternational::CoinbaseinternationalCore,
    coincheck::CoincheckCore, coinex::CoinexCore, coinmate::CoinmateCore,
    coinone::CoinoneCore, coinsph::CoinsphCore,
    coinspot::CoinspotCore, cryptocom::CryptocomCore,
    cryptomus::CryptomusCore, deepcoin::DeepcoinCore, delta::DeltaCore,
    deribit::DeribitCore, derive::DeriveCore, digifinex::DigifinexCore,
    dydx::DydxCore, exmo::ExmoCore, fmfwio::FmfwioCore, foxbit::FoxbitCore,
    gate::GateCore, gemini::GeminiCore, grvt::GrvtCore,
    hashkey::HashkeyCore, hibachi::HibachiCore, hitbtc::HitbtcCore,
    hollaex::HollaexCore, htx::HtxCore,
    hyperliquid::HyperliquidCore,
    independentreserve::IndependentreserveCore, indodax::IndodaxCore,
    kraken::KrakenCore, krakenfutures::KrakenfuturesCore,
    kucoin::KucoinCore, kucoinfutures::KucoinfuturesCore,
    latoken::LatokenCore, lbank::LbankCore, lighter::LighterCore,
    luno::LunoCore, mercado::MercadoCore, mexc::MexcCore,
    modetrade::ModetradeCore, myokx::MyokxCore, ndax::NdaxCore,
    okx::OkxCore, okxus::OkxusCore,
    onetrading::OnetradingCore, p2b::P2bCore,
    pacifica::PacificaCore, paradex::ParadexCore, paymium::PaymiumCore,
    phemex::PhemexCore, poloniex::PoloniexCore, tokocrypto::TokocryptoCore,
    toobit::ToobitCore, upbit::UpbitCore,
    weex::WeexCore, whitebit::WhitebitCore, woo::WooCore,
    woofipro::WoofiproCore, xt::XtCore, zaif::ZaifCore,
    zebpay::ZebpayCore,
    bybiteu::BybiteuCore, extended::ExtendedCore, gateeu::GateeuCore,
    kucoineu::KucoineuCore, mudrex::MudrexCore,
};
// Prediction-market venue Cores live in a separate module (they Deref through
// PredictionExchange). `hyperliquid` shares an id with the regular exchange, so
// it is not imported here.
use ccxt::prediction::{
    kalshi::KalshiCore, limitless::LimitlessCore,
    myriad::MyriadCore, polymarket::PolymarketCore,
};
use indexmap::IndexMap as HashMap;
use std::panic;
use futures::FutureExt;

/// One macro definition, three matches. Each consumer defines its own
/// per-id callback macro (`arm!`, `snapshot_arm!`, `has_arm!`) then
/// invokes `for_each_core!(arm)` to expand the same id list across all
/// 110 exchanges. Source of truth for "which exchanges are testable
/// offline" lives in exactly one place — adding a new exchange means
/// one line here. Keep this in sync with `rust/ccxt/src/exchanges/mod.rs`.
macro_rules! for_each_core {
    ($cb:ident) => {
        $cb!(alpaca, AlpacaCore);
        $cb!(apex, ApexCore);
        $cb!(aster, AsterCore);
        $cb!(backpack, BackpackCore);
        $cb!(bequant, BequantCore);
        $cb!(bigone, BigoneCore);
        $cb!(binance, BinanceCore);
        $cb!(binancecoinm, BinancecoinmCore);
        $cb!(binanceus, BinanceusCore);
        $cb!(binanceusdm, BinanceusdmCore);
        $cb!(bingx, BingxCore);
        $cb!(bit2c, Bit2cCore);
        $cb!(bitbank, BitbankCore);
        $cb!(bitbns, BitbnsCore);
        $cb!(bitfinex, BitfinexCore);
        $cb!(bitflyer, BitflyerCore);
        $cb!(bitget, BitgetCore);
        $cb!(bithumb, BithumbCore);
        $cb!(bitmart, BitmartCore);
        $cb!(bitmex, BitmexCore);
        $cb!(bitopro, BitoproCore);
        $cb!(bitrue, BitrueCore);
        $cb!(bitso, BitsoCore);
        $cb!(bitstamp, BitstampCore);
        $cb!(bitteam, BitteamCore);
        $cb!(bittrade, BittradeCore);
        $cb!(bitvavo, BitvavoCore);
        $cb!(blockchaincom, BlockchaincomCore);
        $cb!(blofin, BlofinCore);
        $cb!(btcbox, BtcboxCore);
        $cb!(btcmarkets, BtcmarketsCore);
        $cb!(btcturk, BtcturkCore);
        $cb!(bullish, BullishCore);
        $cb!(bybit, BybitCore);
        $cb!(bydfi, BydfiCore);
        $cb!(cex, CexCore);
        $cb!(coinbase, CoinbaseCore);
        $cb!(coinbaseexchange, CoinbaseexchangeCore);
        $cb!(coinbaseinternational, CoinbaseinternationalCore);
        $cb!(coincheck, CoincheckCore);
        $cb!(coinex, CoinexCore);
        $cb!(coinmate, CoinmateCore);
        $cb!(coinone, CoinoneCore);
        $cb!(coinsph, CoinsphCore);
        $cb!(coinspot, CoinspotCore);
        $cb!(cryptocom, CryptocomCore);
        $cb!(cryptomus, CryptomusCore);
        $cb!(deepcoin, DeepcoinCore);
        $cb!(delta, DeltaCore);
        $cb!(deribit, DeribitCore);
        $cb!(derive, DeriveCore);
        $cb!(digifinex, DigifinexCore);
        $cb!(dydx, DydxCore);
        $cb!(exmo, ExmoCore);
        $cb!(fmfwio, FmfwioCore);
        $cb!(foxbit, FoxbitCore);
        $cb!(gate, GateCore);
        $cb!(gemini, GeminiCore);
        $cb!(grvt, GrvtCore);
        $cb!(hashkey, HashkeyCore);
        $cb!(hibachi, HibachiCore);
        $cb!(hitbtc, HitbtcCore);
        $cb!(hollaex, HollaexCore);
        $cb!(htx, HtxCore);
        $cb!(hyperliquid, HyperliquidCore);
        $cb!(independentreserve, IndependentreserveCore);
        $cb!(indodax, IndodaxCore);
        $cb!(kraken, KrakenCore);
        $cb!(krakenfutures, KrakenfuturesCore);
        $cb!(kucoin, KucoinCore);
        $cb!(kucoinfutures, KucoinfuturesCore);
        $cb!(latoken, LatokenCore);
        $cb!(lbank, LbankCore);
        $cb!(lighter, LighterCore);
        $cb!(luno, LunoCore);
        $cb!(mercado, MercadoCore);
        $cb!(mexc, MexcCore);
        $cb!(modetrade, ModetradeCore);
        $cb!(myokx, MyokxCore);
        $cb!(ndax, NdaxCore);
        $cb!(okx, OkxCore);
        $cb!(okxus, OkxusCore);
        $cb!(onetrading, OnetradingCore);
        $cb!(p2b, P2bCore);
        $cb!(pacifica, PacificaCore);
        $cb!(paradex, ParadexCore);
        $cb!(paymium, PaymiumCore);
        $cb!(phemex, PhemexCore);
        $cb!(poloniex, PoloniexCore);
        $cb!(tokocrypto, TokocryptoCore);
        $cb!(toobit, ToobitCore);
        $cb!(upbit, UpbitCore);
        $cb!(weex, WeexCore);
        $cb!(whitebit, WhitebitCore);
        $cb!(woo, WooCore);
        $cb!(woofipro, WoofiproCore);
        $cb!(xt, XtCore);
        $cb!(zaif, ZaifCore);
        $cb!(zebpay, ZebpayCore);
        $cb!(bybiteu, BybiteuCore);
        $cb!(extended, ExtendedCore);
        $cb!(gateeu, GateeuCore);
        $cb!(kucoineu, KucoineuCore);
        $cb!(mudrex, MudrexCore);
        // Prediction-market venues (crate::prediction). `hyperliquid` is
        // intentionally omitted here — its id collides with the regular
        // exchange of the same name (see `for_each_prediction_extra!`).
        $cb!(kalshi, KalshiCore);
        $cb!(limitless, LimitlessCore);
        $cb!(myriad, MyriadCore);
        $cb!(polymarket, PolymarketCore);
    };
}
pub(crate) use for_each_core;

#[derive(Debug, Default, Clone)]
pub struct Captured {
    pub url:     String,
    pub method:  String,
    pub body:    Option<String>,
    pub headers: HashMap<String, String>,
}

/// True iff a Core for this id exists.
pub fn has(id: &str) -> bool {
    macro_rules! check { ($name:ident, $core:ident) => {
        if id == stringify!($name) { return true; }
    }; }
    for_each_core!(check);
    false
}

/// Run `method(args)` in offline mode and capture last_request_*.
/// Mirrors Go's `InitOfflineExchange` + `TestRequestStatically`:
///   markets/currencies come in via the constructor config so
///   `load_markets()` sees them already cached and never hits the wire.
pub async fn dispatch(id: &str, method: &str, args: Vec<Value>, fixture_options: &Value) -> Captured {
    let cfg = build_offline_config(id, fixture_options);
    // call_dynamic expects snake_case names; fixtures use camelCase.
    let m = camel_to_snake(method);
    // Each arm clones `args` because the borrow checker has to assume
    // every arm might fire — at runtime only one does.
    macro_rules! arm { ($name:ident, $core:ident) => {
        if id == stringify!($name) {
            let mut ex = Box::new(<$core>::new(Some(cfg.clone())));
            ex.bind();
            let _ = panic::AssertUnwindSafe(ex.call_dynamic(&m, args.clone())).catch_unwind().await;
            return capture(&ex.exchange);
        }
    }; }
    for_each_core!(arm);
    Captured::default()
}

/// Static *response* test dispatch — injects `mock` as the canned HTTP
/// response and returns whatever the exchange's parser produced.
pub async fn dispatch_response(
    id: &str, method: &str, args: Vec<Value>, fixture_options: &Value, mock: Value,
) -> Value {
    let cfg = build_offline_config(id, fixture_options);
    let m = camel_to_snake(method);
    macro_rules! arm { ($name:ident, $core:ident) => {
        if id == stringify!($name) {
            let mut ex = Box::new(<$core>::new(Some(cfg.clone())));
            ex.bind();
            ex.exchange.mock_response = mock.clone();
            return match panic::AssertUnwindSafe(ex.call_dynamic(&m, args.clone())).catch_unwind().await {
                Ok(v)  => v,
                Err(_) => Value::Null,
            };
        }
    }; }
    for_each_core!(arm);
    Value::Null
}

/// Builds the real exchange Core from `cfg` and snapshots it to a
/// `Value` (via `Exchange::to_value()`). Unlike a bare config map, the
/// snapshot carries the exchange's `describe()` output — `options`
/// (incl. `brokerId` / `broker`), `has`, `urls`, etc. — which the
/// broker-id tests assert against. Returns `Value::Null` for an id with
/// no registered Core so callers can fall back to a plain config map.
pub fn exchange_snapshot(id: &str, cfg: Value) -> Value {
    macro_rules! arm { ($name:ident, $core:ident) => {
        if id == stringify!($name) {
            let mut ex = Box::new(<$core>::new(Some(cfg.clone())));
            ex.bind();
            return ex.exchange.to_value();
        }
    }; }
    for_each_core!(arm);
    Value::Null
}

/// Mirrors Go's `InitOfflineExchange` — fake credentials + sentinel
/// proxy + markets/currencies pre-loaded from the static fixture files.
fn build_offline_config(id: &str, fixture_options: &Value) -> Value {
    let markets    = load_static_json(id, "markets");
    let currencies = load_static_json(id, "currencies");

    let mut nested_options: HashMap<String, Value> = HashMap::from([
        ("enableUnifiedAccount".to_string(), Value::Bool(true)),
        ("enableUnifiedMargin".to_string(),  Value::Bool(false)),
        ("accessToken".to_string(),          Value::Str("token".to_string())),
        ("expires".to_string(),              Value::Int(999_999_999_999_999)),
        ("leverageBrackets".to_string(),     Value::Map(HashMap::new())),
    ]);
    // Fixture-level + case-level options come in as a flat Map (e.g.
    // {leverageBrackets: ..., portfolioMargin: true}). These map
    // directly into exchange.options. Also support a nested .options
    // key for fixtures that wrap them.
    if let Value::Dict(fm) = fixture_options {
        for (k, v) in fm.iter() {
            // Skip top-level credential keys (handled separately below).
            if matches!(k.as_str(),
                "apiKey" | "secret" | "password" | "uid" | "walletAddress"
                | "privateKey" | "token" | "login" | "accountId" | "accounts"
                | "options" | "markets" | "currencies" | "httpProxy" | "httpsProxy"
            ) { continue; }
            nested_options.insert(k.clone(), v.clone());
        }
        if let Some(Value::Dict(inner)) = fm.get("options") {
            for (k, v) in inner.iter() { nested_options.insert(k.clone(), v.clone()); }
        }
    }
    let mut accounts_a = HashMap::new();
    accounts_a.insert("id".to_string(),   Value::Str("myAccount".to_string()));
    accounts_a.insert("code".to_string(), Value::Str("USDT".to_string()));
    let mut accounts_b = HashMap::new();
    accounts_b.insert("id".to_string(),   Value::Str("myAccount".to_string()));
    accounts_b.insert("code".to_string(), Value::Str("USDC".to_string()));

    let mut cfg = HashMap::new();
    cfg.insert("markets".to_string(),         markets);
    cfg.insert("currencies".to_string(),      currencies);
    cfg.insert("enableRateLimit".to_string(), Value::Bool(false));
    cfg.insert("httpProxy".to_string(),       Value::Str("http://fake:8080".to_string()));
    cfg.insert("httpsProxy".to_string(),      Value::Str("http://fake:8080".to_string()));
    cfg.insert("apiKey".to_string(),          Value::Str("key".to_string()));
    cfg.insert("secret".to_string(),          Value::Str("secretsecret".to_string()));
    cfg.insert("password".to_string(),        Value::Str("password".to_string()));
    cfg.insert("walletAddress".to_string(),   Value::Str("wallet".to_string()));
    cfg.insert("privateKey".to_string(),      Value::Str("0xff3bdd43534543d421f05aec535965b5050ad6ac15345435345435453495e771".to_string()));
    cfg.insert("uid".to_string(),             Value::Str("uid".to_string()));
    cfg.insert("token".to_string(),           Value::Str("token".to_string()));
    cfg.insert("login".to_string(),           Value::Str("login".to_string()));
    cfg.insert("accountId".to_string(),       Value::Str("12345".to_string()));
    cfg.insert("accounts".to_string(),        Value::Array(vec![Value::Map(accounts_a), Value::Map(accounts_b)]));
    cfg.insert("options".to_string(),         Value::Map(nested_options));
    // Top-level fixture credential overrides (apiKey/secret/etc.)
    if let Value::Dict(fm) = fixture_options {
        for (k, v) in fm.iter() {
            if k == "options" { continue; } // handled above
            cfg.insert(k.clone(), v.clone());
        }
    }
    Value::Map(cfg)
}

fn capture(e: &ccxt::exchange::Exchange) -> Captured {
    let url     = match &e.last_request_url     { Value::Str(s) => s.clone(), _ => String::new() };
    let body    = match &e.last_request_body    { Value::Str(s) => Some(s.clone()), _ => None };
    let headers = match &e.last_request_headers {
        Value::Dict(m) => m.iter().filter_map(|(k, v)|
            match v { Value::Str(s) => Some((k.clone(), s.clone())), _ => None }).collect(),
        _ => HashMap::new(),
    };
    Captured { url, method: String::new(), body, headers }
}

fn load_static_json(id: &str, kind: &str) -> Value {
    let repo = env!("CARGO_MANIFEST_DIR").trim_end_matches("/rust/tests");
    let path = format!("{}/ts/src/test/static/{}/{}.json", repo, kind, id);
    let raw = match std::fs::read_to_string(&path) { Ok(s) => s, _ => return Value::Null };
    let j: serde_json::Value = match serde_json::from_str(&raw) { Ok(v) => v, _ => return Value::Null };
    json_to_value(&j)
}

/// camelCase → snake_case matching the transpiler's `toSnakeCase`:
///   - Acronyms stay glued: `fetchOHLCV` → `fetch_ohlcv` (not `fetch_o_h_l_c_v`)
///   - But `[A-Z]+[A-Z][a-z]` splits before the last cap: `XMLHttpRequest` → `xml_http_request`
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

fn json_to_value(j: &serde_json::Value) -> Value {
    match j {
        serde_json::Value::Null         => Value::Null,
        serde_json::Value::Bool(b)      => Value::Bool(*b),
        serde_json::Value::Number(n)    => {
            if let Some(i) = n.as_i64() { Value::Int(i) }
            else if let Some(f) = n.as_f64() { Value::Float(f) }
            else { Value::Null }
        }
        serde_json::Value::String(s)    => Value::Str(s.clone()),
        serde_json::Value::Array(a)     => Value::Array(a.iter().map(json_to_value).collect()),
        serde_json::Value::Object(o)    => {
            let mut m = HashMap::new();
            for (k, v) in o { m.insert(k.clone(), json_to_value(v)); }
            Value::Map(m)
        }
    }
}
