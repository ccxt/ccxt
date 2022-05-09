<?php

$root = dirname (dirname (dirname (__FILE__)));
include_once $root . '/vendor/autoload.php';

use ccxt\async;
use React\Promise;

$exchange = new async\binance([
    'enableRateLimit' => true,
    'verbose' => true,
]);

$exchange::$kernel->execute(function () use ($exchange) {
    $symbols = array('ETH/BTC', 'LTC/BTC', 'BCH/BTC');
    try {
        $yields = [];
        foreach ($symbols as $symbol) {
            $yields[] = $exchange->fetch_ticker($symbol);
        }
        $tickers = yield $yields;
        foreach ($tickers as $ticker) {
            echo $ticker['symbol'] . ' bid price is ' . $ticker['bid'] . PHP_EOL;
        }
    } catch (Exception $e) {
        var_dump($e);
    }
});
$exchange::$kernel->run();