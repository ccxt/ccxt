<?php

$root = dirname(dirname(dirname(dirname(__FILE__))));
include $root . '/ccxt.php';


$config = array('enableRateLimit' => true);
$binance = new \ccxt\pro\binance($config);
$bittrex = new \ccxt\pro\bittrex($config);
$symbol = "BTC/USDT";

$loop = function($exchange, $symbol) {
    echo 'got inside' . PHP_EOL;
    for ($i = 0; $i < 5; $i++) {
        $ticker = yield $exchange->watch_ticker($symbol);
        print_ticker($ticker, $exchange->id, $symbol);
    }
};

function print_ticker($ticker, $exchange_name, $symbol) {
    $bid = $ticker['bid'];
    $ask = $ticker['ask'];
    echo "$exchange_name $symbol - bid: $bid <> ask: $ask" . PHP_EOL;
}

\React\Async\coroutine($loop, $bittrex, $symbol);
\React\Async\coroutine($loop, $binance, $symbol);
