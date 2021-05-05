<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set ('UTC');

$exchange = new \ccxt\async\binance (array (
    'enableRateLimit' => true,
    // 'verbose' => true,
));

$exchange->execute_and_run(function () use ($exchange) {
    try {
        $result = yield $exchange->fetch_ticker('ETH/BTC');
        echo var_export($result, true) . "\n";
    } catch (Exception $e) {
        echo get_class($e) . ': ' . $e->getMessage() . "\n";
    }
});
