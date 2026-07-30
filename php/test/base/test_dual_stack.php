<?php
namespace ccxt;

// ----------------------------------------------------------------------------
// hand-written base test: explicit dual-stack (IPv4/IPv6) support
// 1) sync curl: fetch() sets CURLOPT_IPRESOLVE + CURLOPT_HAPPY_EYEBALLS_TIMEOUT_MS
// 2) async react: create_connector() must enable 'happy_eyeballs'
// ----------------------------------------------------------------------------

// test-local observer for curl options: PHP resolves unqualified function
// calls to the current namespace first, so curl_setopt() calls made from
// within namespace ccxt end up here; it always delegates to the global
// curl_setopt, so the runtime behavior is unchanged
if (!function_exists('ccxt\\curl_setopt')) {
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
    $exchange = new \ccxt\Exchange(array('id' => 'sampleexchange'));
    $exchange->timeout = 1000;
    // end-to-end: fetch() applies dual-stack curl options before the request
    // (127.0.0.1:9 refuses immediately, no traffic leaves the machine)
    dual_stack_recorded_curl_options_start();
    try {
        $exchange->fetch('http://127.0.0.1:9/');
    } catch (\Exception $e) {
        // expected: connection refused; options were set before curl_exec
    }
    $recorded = dual_stack_recorded_curl_options_stop();
    assert(is_array($recorded) && array_key_exists(CURLOPT_IPRESOLVE, $recorded));
    assert($recorded[CURLOPT_IPRESOLVE] === CURL_IPRESOLVE_WHATEVER);
    assert($recorded[CURLOPT_IPRESOLVE] !== CURL_IPRESOLVE_V4);
    assert(array_key_exists(CURLOPT_HAPPY_EYEBALLS_TIMEOUT_MS, $recorded));
    assert($recorded[CURLOPT_HAPPY_EYEBALLS_TIMEOUT_MS] === 1);
    $exchange->close();
}

function dual_stack_inner_tcp_connector($connector) {
    assert($connector instanceof \React\Socket\Connector);
    $connectors_property = new \ReflectionProperty('React\Socket\Connector', 'connectors');
    $connectors = $connectors_property->getValue($connector);
    assert(is_array($connectors) && array_key_exists('tcp', $connectors));
    $tcp = $connectors['tcp'];
    assert($tcp instanceof \React\Socket\TimeoutConnector);
    $inner_property = new \ReflectionProperty('React\Socket\TimeoutConnector', 'connector');
    return $inner_property->getValue($tcp);
}

function test_dual_stack_async_connector() {
    if (!class_exists('React\Socket\Connector')) {
        echo "skip test_dual_stack_async_connector: react/socket is not installed\n";
        return;
    }
    assert(class_exists('React\Socket\HappyEyeBallsConnector'));
    $exchange = new \ccxt\async\Exchange(array('id' => 'sampleexchange'));
    $inner = dual_stack_inner_tcp_connector($exchange->create_connector());
    assert($inner instanceof \React\Socket\HappyEyeBallsConnector);
    $inner_default = dual_stack_inner_tcp_connector($exchange->default_connector);
    assert($inner_default instanceof \React\Socket\HappyEyeBallsConnector);
    $inner_opt_out = dual_stack_inner_tcp_connector($exchange->create_connector(array('happy_eyeballs' => false)));
    assert($inner_opt_out instanceof \React\Socket\DnsConnector);
    $exchange->close();
}

function test_dual_stack() {
    test_dual_stack_sync_curl();
    test_dual_stack_async_connector();
}
