<?php

$root = dirname(dirname(dirname(dirname(__FILE__))));
include $root . '/ccxt.php';


$config = array('enableRateLimit' => true);
$binance = new \ccxt\async\binance($config);
$bittrex = new \ccxt\async\bittrex($config);
$symbol = "BTC/USDT";

function loop($exchange, $symbol) {
    for ($i = 0; $i < 5; $i++) {
        $ticker = yield $exchange->watch_ticker($symbol);
        print_ticker($ticker, $exchange->id, $symbol);
    }
    $exchange::get_kernel()->stop();
}

function print_ticker($ticker, $exchange_name, $symbol) {
    $bid = $ticker['bid'];
    $ask = $ticker['ask'];
    echo "$exchange_name $symbol - bid: $bid <> ask: $ask" . PHP_EOL;
}

$bittrex::execute_and_run(loop($bittrex, $symbol));
$binance::execute_and_run(loop($binance, $symbol));
