<?php

$root = dirname(dirname(dirname(__FILE__)));
include_once $root . '/vendor/autoload.php';

use ccxt\async;
use React\Promise;

$exchange = new async\binance([
    'enableRateLimit' => true,
    'verbose' => true,
]);

$exchange::$kernel->execute(function () use ($exchange) {
    yield $exchange->load_markets();
    echo 'Market id of BTC/USDT is ' . $exchange->market_id('BTC/USDT');

    $symbols = array('ETH/BTC', 'LTC/BTC', 'BCH/BTC');
    $yields = [];
    foreach ($symbols as $symbol) {
        $yields[] = $exchange->fetch_ticker($symbol);
    }
    try {
        $tickers = yield $yields;
    } catch (\Exception $e) {
        trigger_error('Something went wrong uwu', E_USER_ERROR);
    }
    foreach ($tickers as $ticker) {
        echo $ticker['symbol'] . ' bid price is ' . $ticker['bid'] . PHP_EOL;
    }
});

$exchange::$kernel->run();