// Unit tests for Exchange runtime behaviors requiring a concrete venue (Binance).
// Moved from ccxt-core so ccxt-core remains decoupled from generated venues,
// while ccxt-base continues running these tests under `cargo test -p ccxt-base --features transpiled-base`.

#[cfg(all(test, feature = "engine", feature = "binance"))]
mod response_mock_tests {
    use crate::exchange::ExchangeRuntime;
    use crate::{get_value, Value};

    #[tokio::test]
    async fn response_mock_serves_multiple_requests_until_reset() {
        // Conflicting proxies reject any unmocked request before network I/O.
        let config = Value::from_json(&serde_json::json!({
            "httpProxy": "http://fake:8080", "httpsProxy": "http://fake:8080",
            "enableRateLimit": false,
        }));
        let mut exchange = crate::exchanges::binance::BinanceCore::new(Some(config));
        let response = Value::from_json(&serde_json::json!({ "price": "100" }));
        exchange.exchange.mock_response = response.clone();
        for symbol in ["BTCUSDT", "ETHUSDT"] {
            let params = Value::from_json(&serde_json::json!({ "symbol": symbol }));
            let result = exchange.request_typed(
                "ticker/price", &["public".to_string()], "GET", params, Value::Int(1),
            ).await.expect("each request must use the same mock without network access");
            assert_eq!(result, response);
            assert_eq!(exchange.exchange.last_request_url, Value::Str(format!(
                "https://api.binance.com/api/v3/ticker/price?symbol={symbol}",
            ).into()));
        }
        exchange.exchange.mock_response = Value::Null;
        let error = exchange.request_typed(
            "ticker/price", &["public".to_string()], "GET", Value::Null, Value::Int(1),
        ).await.expect_err("reset must restore the normal transport path");
        assert!(error.to_string().contains("InvalidProxySettings"));
    }

    #[tokio::test]
    async fn response_mock_preserves_public_request_url() {
        let mut exchange = crate::exchanges::binance::BinanceCore::new(None);
        let response = Value::from_json(&serde_json::json!({ "price": "100" }));
        exchange.exchange.mock_response = response.clone();
        let params = Value::from_json(&serde_json::json!({ "symbol": "BTCUSDT" }));
        let result = exchange.request_typed(
            "ticker/price", &["public".to_string()], "GET", params, Value::Int(1),
        ).await.expect("mock response must not require network access");
        assert_eq!(result, response);
        assert_eq!(exchange.exchange.last_request_url, Value::Str(
            "https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT".into(),
        ));
        assert_eq!(exchange.exchange.last_request_body, Value::Null);
    }

    #[tokio::test]
    async fn response_mock_preserves_private_request_headers_and_body() {
        let config = Value::from_json(&serde_json::json!({
            "apiKey": "fixture-key", "secret": "fixture-secret",
        }));
        let mut exchange = crate::exchanges::binance::BinanceCore::new(Some(config));
        let response = Value::from_json(&serde_json::json!({ "orderId": 123 }));
        exchange.exchange.mock_response = response.clone();
        let params = Value::from_json(&serde_json::json!({
            "symbol": "BTCUSDT", "side": "BUY", "type": "MARKET", "quantity": "1",
        }));
        let result = exchange.request_typed(
            "order", &["private".to_string()], "POST", params, Value::Int(1),
        ).await.expect("signed mock response must not require network access");
        assert_eq!(result, response);
        assert_eq!(exchange.exchange.last_request_url, Value::Str(
            "https://api.binance.com/api/v3/order".into(),
        ));
        assert_eq!(get_value(&exchange.exchange.last_request_headers,
            &Value::Str("X-MBX-APIKEY".into())), Value::Str("fixture-key".into()));
        let Value::Str(body) = &exchange.exchange.last_request_body else {
            panic!("signed POST must retain its encoded body");
        };
        assert!(body.contains("symbol=BTCUSDT"));
        assert!(body.contains("signature="));
    }
}

#[cfg(all(test, feature = "engine", feature = "binance"))]
mod rate_limit_config_tests {
    use crate::exchange::ExchangeRuntime;
    use crate::exchange_generated::ExchangeBase;
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

    #[tokio::test]
    async fn implicit_api_preserves_and_calculates_endpoint_cost() {
        let mut binance = crate::exchanges::binance::BinanceCore::new(None);
        binance.build_implicit_api();
        let config = binance
            .exchange
            .internals
            .implicit_api
            .get("fapi_public_get_depth")
            .expect("Binance futures depth endpoint must be registered")
            .3
            .clone();
        assert_eq!(
            crate::get_value(&config, &Value::Str("cost".into())),
            Value::Int(2),
            "the implicit API table dropped the endpoint's base cost"
        );
        let params = Value::Map({
            let mut map = crate::value::HashMap::new();
            map.insert("limit".to_string(), Value::Int(100));
            map
        });
        let cost = binance
            .implicit_api_rate_limit_cost("fapi_public_get_depth", params)
            .await
            .expect("registered endpoint must have a calculable cost");
        assert_eq!(cost, Value::Int(5), "Binance byLimit cost was not applied");
    }
}

#[cfg(all(test, feature = "engine", feature = "binance"))]
mod sandbox_mode_tests {
    use crate::Value;

    // super_set_sandbox_mode was a no-op, so venues that override setSandboxMode
    // (binance, okx, gate, …) never actually switched to their sandbox URL
    // (review #9). After delegating to the base, set_sandbox_mode(true) must
    // swap urls['api'] -> urls['test'] and toggle isSandboxModeEnabled.
    #[test]
    fn binance_sandbox_swaps_api_url() {
        let mut b = crate::exchanges::binance::BinanceCore::new(None);
        let test_url = crate::get_value(&b.exchange.urls, &Value::Str("test".into()));
        assert!(!matches!(test_url, Value::Null), "binance describe() has no test url");
        b.set_sandbox_mode(Value::Bool(true));
        assert_eq!(b.exchange.isSandboxModeEnabled, Value::Bool(true));
        let api_url = crate::get_value(&b.exchange.urls, &Value::Str("api".into()));
        assert_eq!(api_url, test_url, "sandbox mode did not switch urls['api'] to urls['test']");
    }
}

#[cfg(all(test, feature = "engine", feature = "binance"))]
mod dynamic_dispatch_tests {
    use crate::exchange::CallDynamicChecked;
    use crate::exchange_generated::ExchangeBase;
    use crate::Value;

    #[tokio::test]
    async fn unified_method_reaches_a_dispatch_arm_not_the_null_fallthrough() {
        let mut b = crate::exchanges::binance::BinanceCore::new(None);
        let snake = crate::exchange::method_name_to_snake_case(
            &Value::Str("fetchOHLCV".into()));
        assert_eq!(snake, "fetch_ohlcv");
        b.exchange.internals.dynamic_dispatch_miss = None;
        let _ = futures::FutureExt::catch_unwind(
            std::panic::AssertUnwindSafe(b.call_dynamic(&snake, vec![])),
        ).await;
        assert_eq!(
            b.exchange.internals.dynamic_dispatch_miss, None,
            "`{snake}` fell through to the `_ => Null` arm — a paginated \
             re-entry would have silently returned an empty page",
        );
        // Negative control for the probe itself: a name with no arm DOES record.
        let _ = b.call_dynamic("fetch_definitely_not_an_arm", vec![]).await;
        assert_eq!(
            b.exchange.internals.dynamic_dispatch_miss.as_deref(),
            Some("fetch_definitely_not_an_arm"),
            "the miss probe is inert — the assertion above proves nothing",
        );
    }

    #[tokio::test]
    async fn implicit_endpoint_is_still_reachable_and_is_not_a_miss() {
        let mut b = crate::exchanges::binance::BinanceCore::new(None);
        b.exchange.build_implicit_api();
        let snake = crate::exchange::method_name_to_snake_case(
            &Value::Str("publicGetTicker24hr".into()));
        assert!(
            b.exchange.internals.implicit_api.contains_key(&snake),
            "implicit api has no `{snake}` entry — the `_` arm would treat a real \
             endpoint as an unknown name",
        );
    }

    #[tokio::test]
    #[should_panic(expected = "NotSupported")]
    async fn unknown_dynamic_name_is_loud_not_null() {
        let mut b = crate::exchanges::binance::BinanceCore::new(None);
        let _ = b.call_dynamic_checked(
            Value::Str("fetchNoSuchThingAtAll".into()),
            vec![],
        ).await;
    }

    #[tokio::test]
    async fn bare_call_dynamic_still_returns_null_for_optional_probes() {
        let mut b = crate::exchanges::binance::BinanceCore::new(None);
        let out = b.call_dynamic("fetch_no_such_thing_at_all", vec![]).await;
        assert_eq!(out, Value::Null);
        assert_eq!(
            b.exchange.internals.dynamic_dispatch_miss.as_deref(),
            Some("fetch_no_such_thing_at_all"),
            "the `_` arm did not record the miss, so call_dynamic_checked \
             could never raise on it",
        );
    }
}
