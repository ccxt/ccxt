<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set ('UTC');

$kernel = \ccxt\async\Exchange::get_kernel();

$kernel->execute(function () {
    $exchange = new \ccxt\async\binance (array (
        'enableRateLimit' => true,
        // 'verbose' => true,
    ));
    try {
        $result = yield $exchange->fetch_ticker('ETH/BTC');
        echo var_export($result, true) . "\n";
    } catch (Exception $e) {
        echo get_class($e) . ': ' . $e->getMessage() . "\n";
    }
});

$kernel->run();
