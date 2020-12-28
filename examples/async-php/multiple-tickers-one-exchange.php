<?php

$root = dirname (dirname (dirname (__FILE__)));
include_once $root . '/vendor/autoload.php';

use ccxt\async;
use React\Promise;

$exchange = new async\binance([
        'enableRateLimit' => true,
        'verbose' => true,
]);

$symbols = array('ETH/BTC', 'LTC/BTC', 'BCH/BTC');
$promises = [];
foreach ($symbols as $symbol) {
    $promises[] = $exchange->fetch_ticker($symbol);
}

Promise\all($promises)->then(function ($tickers) {
    foreach ($tickers as $ticker) {
        echo $ticker['symbol'] . ' bid price is ' . $ticker['bid'] . PHP_EOL;
    }
}, function ($error) {
    var_dump($error);
});

$exchange::$kernel->run();
