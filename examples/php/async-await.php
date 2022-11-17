<?php

$root = dirname(dirname(dirname(__FILE__)));
include $root . '/ccxt.php';
date_default_timezone_set('UTC');
//
$exchange = new ccxt\async\binance([]);
React\Async\await($exchange->load_markets());
$symbols = array('BTC/USDT', 'ETH/USDT');


// Instead of yield generators, now users can use modern Async/Await syntax


echo "########## Combined await ##########\n";
$promises = [];
foreach ($symbols as $symbol) {
    $promises[] = $exchange->fetch_ticker($symbol);
}
$tickers = React\Async\await(React\Promise\all($promises));
echo "{$tickers[0]['symbol']} {$tickers[0]['close']}  |  {$tickers[1]['symbol']} {$tickers[1]['close']}\n";




echo "########## Individual await ##########\n";
foreach ($symbols as $symbol) {
    $ticker = React\Async\await($exchange->fetch_ticker($symbol));
    echo "{$ticker['symbol']} {$ticker['close']}\n";
}



echo "########## Callback style ##########\n";
foreach ($symbols as $symbol) {
    $exchange->fetch_ticker($symbol)->then(function($ticker){
        echo "{$ticker['symbol']} {$ticker['close']}\n";
    });
}