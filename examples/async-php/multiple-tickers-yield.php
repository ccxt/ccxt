<?php

$root = dirname(dirname(dirname(__FILE__)));
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


$exchange::$kernel->execute(function () use ($exchange, $promises) {
    yield $exchange->load_markets();
    echo 'Market id of BTC/USDT is ' . $exchange->market_id('BTC/USDT');
    $all_promises = Promise\all($promises);
    try {
        $tickers = yield $all_promises;
    } catch (\Exception $e) {
        trigger_error('Something went wrong uwu', E_USER_ERROR);
    }
    foreach ($tickers as $ticker) {
        echo $ticker['symbol'] . ' bid price is ' . $ticker['bid'] . PHP_EOL;
    }
});

$exchange::$kernel->run();
