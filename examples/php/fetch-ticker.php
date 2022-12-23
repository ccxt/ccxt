<?php
// ##############################################################
// to see asynchronous version, check: 'async-await-methods.php' example
// ##############################################################

include dirname(dirname(dirname(__FILE__))) . '/ccxt.php';
date_default_timezone_set('UTC');

$classname = '\\ccxt\\binance';
$symbol = 'ETH/USDT';
$exchange = new $classname(array(
    'timeout' => 30000,
));

try {
    $result = $exch->fetch_ticker($symbol);
    echo "Ticker: " . $result['symbol'] . ', 24hr high: '. $result['high']. "\n";
} catch (Exception $e) {
    if ($e instanceof \ccxt\NetworkError) {
        echo '[Network Error] ' . $e->getMessage() . "\n";
    } else {
        echo '['. get_class($e) . '] ' . $e->getMessage() . "\n";
    }
}