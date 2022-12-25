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
$symbol = 'ETH/USDT';

try {
    $result = $exchange->fetch_ticker($symbol);
    echo "Ticker: " . $result['symbol'] . ', 24hr high: '. $result['high']. "\n";
} catch (Exception $e) {
    if ($e instanceof \ccxt\NetworkError) {
        echo '[Network Error] ' . $e->getMessage() . "\n";
    } else {
        echo '['. get_class($e) . '] ' . $e->getMessage() . "\n";
    }
}
