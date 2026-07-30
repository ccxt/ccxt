<?php
namespace ccxt;

// ----------------------------------------------------------------------------
// hand-written base test: explicit dual-stack (IPv4/IPv6) support
// 1) sync curl: fetch() must set CURLOPT_IPRESOLVE to CURL_IPRESOLVE_WHATEVER
// 2) async react: create_connector() must enable 'happy_eyeballs'
// ----------------------------------------------------------------------------

// test-local observer for curl options: PHP resolves unqualified function
// calls to the current namespace first, so curl_setopt() calls made from
// within namespace ccxt end up here; it always delegates to the global
// curl_setopt, so the runtime behavior is unchanged
if (!function_exists('ccxt\curl_setopt')) {
    function curl_setopt($handle, $option, $value) {
        if (isset($GLOBALS['ccxt_dual_stack_recorded_curl_options']) && is_array($GLOBALS['ccxt_dual_stack_recorded_curl_options'])) {
            $GLOBALS['ccxt_dual_stack_recorded_curl_options'][$option] = $value;
        }
        return \curl_setopt($handle, $option, $value);
    }
}

function dual_stack_recorded_curl_options_start() {
    $GLOBALS['ccxt_dual_stack_recorded_curl_options'] = array();
}

function dual_stack_recorded_curl_options_stop() {
    $recorded = $GLOBALS['ccxt_dual_stack_recorded_curl_options'];
    $GLOBALS['ccxt_dual_stack_recorded_curl_options'] = null;
    return $recorded;
}

function test_dual_stack_sync_curl() {
    if (!extension_loaded('curl')) {
        echo "skip test_dual_stack_sync_curl: ext-curl is not loaded\n";
        return;
    }
    assert(defined('CURLOPT_IPRESOLVE'));
    assert(defined('CURL_IPRESOLVE_WHATEVER'));
    $exchange = new \ccxt\Exchange(array('id' => 'sampleexchange'));
    // 1) the extracted helper sets IPRESOLVE to WHATEVER on a fresh curl handle
    $method = new \ReflectionMethod('ccxt\Exchange', 'configureCurlIpResolve');
    $handle = curl_init();
    dual_stack_recorded_curl_options_start();
    $method->invoke($exchange, $handle);
    $recorded = dual_stack_recorded_curl_options_stop();
    assert(is_array($recorded) && array_key_exists(CURLOPT_IPRESOLVE, $recorded));
    assert($recorded[CURLOPT_IPRESOLVE] === CURL_IPRESOLVE_WHATEVER);
    assert($recorded[CURLOPT_IPRESOLVE] !== CURL_IPRESOLVE_V4);
    // the happy eyeballs pacing is lowered to the smallest usable value where
    // libcurl supports it (0 would mean "use the 200ms default")
    if (defined('CURLOPT_HAPPY_EYEBALLS_TIMEOUT_MS')) {
        assert(array_key_exists(CURLOPT_HAPPY_EYEBALLS_TIMEOUT_MS, $recorded));
        assert($recorded[CURLOPT_HAPPY_EYEBALLS_TIMEOUT_MS] === 1);
    }
    unset($handle); // curl_close() is a no-op since PHP 8.0 and deprecated since 8.5
    // 2) end-to-end: fetch() applies it before the request is even attempted
    // (127.0.0.1:9 refuses immediately, no traffic ever leaves the machine)
    $exchange->timeout = 1000; // bound any env-proxy weirdness
    dual_stack_recorded_curl_options_start();
    try {
        $exchange->fetch('http://127.0.0.1:9/');
    } catch (\Exception $e) {
        // expected: connection refused, curl options were set before curl_exec
    }
    $recorded = dual_stack_recorded_curl_options_stop();
    assert(is_array($recorded) && array_key_exists(CURLOPT_IPRESOLVE, $recorded));
    assert($recorded[CURLOPT_IPRESOLVE] === CURL_IPRESOLVE_WHATEVER);
    $exchange->close();
}

function dual_stack_inner_tcp_connector($connector) {
    assert($connector instanceof \React\Socket\Connector);
    // react/socket keeps the built connector chain in a private property
    $connectors_property = new \ReflectionProperty('React\Socket\Connector', 'connectors');
    $connectors = $connectors_property->getValue($connector);
    assert(is_array($connectors) && array_key_exists('tcp', $connectors));
    $tcp = $connectors['tcp'];
    // ccxt always passes 'timeout', so the tcp connector is wrapped in a TimeoutConnector
    assert($tcp instanceof \React\Socket\TimeoutConnector);
    $inner_property = new \ReflectionProperty('React\Socket\TimeoutConnector', 'connector');
    return $inner_property->getValue($tcp);
}

function test_dual_stack_async_connector() {
    if (!class_exists('React\Socket\Connector')) {
        echo "skip test_dual_stack_async_connector: react/socket is not installed\n";
        return;
    }
    // happy eyeballs support requires react/socket >= 1.12 (composer.json pins 1.17)
    assert(class_exists('React\Socket\HappyEyeBallsConnector'));
    $exchange = new \ccxt\async\Exchange(array('id' => 'sampleexchange'));
    // a freshly created connector must do dual-stack happy eyeballs (not IPv4-only)
    $inner = dual_stack_inner_tcp_connector($exchange->create_connector());
    assert($inner instanceof \React\Socket\HappyEyeBallsConnector);
    // the default_connector created by the constructor uses it as well
    $inner_default = dual_stack_inner_tcp_connector($exchange->default_connector);
    assert($inner_default instanceof \React\Socket\HappyEyeBallsConnector);
    // an explicit user opt-out is still respected
    $inner_opt_out = dual_stack_inner_tcp_connector($exchange->create_connector(array('happy_eyeballs' => false)));
    assert($inner_opt_out instanceof \React\Socket\DnsConnector);
    $exchange->close();
}

function test_dual_stack() {
    test_dual_stack_sync_curl();
    test_dual_stack_async_connector();
}
