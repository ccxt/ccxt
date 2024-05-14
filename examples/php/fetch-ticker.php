<?php
// ##########################################
// for asynchronous (async/await) version check: https://github.com/ccxt/ccxt/blob/master/examples/php/async-await.php
// ##########################################

include dirname(dirname(dirname(__FILE__))) . '/ccxt.php';
date_default_timezone_set('UTC');

$exchange = new \ccxt\okx(array(
    // 'verbose' => true, // for debugging
    'timeout' => 30000,
));

// If you want to use test-mode (a.k.a. sandbox), uncomment the following line:
// $exchange->set_sandbox_mode(true); 

$symbol = 'ETH/USDT';

try {
    if (array_key_exists($symbol, $exchange->markets)) {
        $market = $exchange->market($symbol);
    } else {
        echo $exchange->id . ' does not have market symbol ' . $symbol . "; Supported symbols:\n";
        echo print_r($exchange->symbols, true) . "\n";
        exit();
    }
    if($market['active']) {
        $result = $exchange->fetch_ticker($symbol);
        echo "Ticker: " . $result['symbol'] . ', 24hr high: '. $result['high']. "\n";
    } else {
        echo $exchange->id . ' market ' . $symbol . " is not active!\n";
    }
} catch (Exception $e) {
    if ($e instanceof \ccxt\NetworkError) {
        echo '[Network Error] ' . $e->getMessage() . "\n";
    } else {
        echo '['. get_class($e) . '] ' . $e->getMessage() . "\n";
    }
}
