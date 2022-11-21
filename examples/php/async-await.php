<?php
// Instead of yield generators, now users can use modern Async/Await syntax
include dirname(dirname(dirname(__FILE__))) . '/ccxt.php';
use function React\Async\async;
use function React\Async\await;
date_default_timezone_set('UTC');

$exchange = new ccxt\async\binance([]);
await($exchange->load_markets());
$symbols = array('BTC/USDT', 'ETH/USDT');


$promises = [];
foreach ($symbols as $symbol) {
    $promises[] = $exchange->fetch_ticker($symbol);
}
$tickers = await(React\Promise\all($promises));
echo "########## Combined await ##########\n";
echo "{$tickers[0]['symbol']} {$tickers[0]['close']}  |  {$tickers[1]['symbol']} {$tickers[1]['close']}\n";



echo "########## Individual await ##########\n";
foreach ($symbols as $symbol) {
    $ticker = await($exchange->fetch_ticker($symbol));
    echo "{$ticker['symbol']} {$ticker['close']}\n";
}



$exchange->fetch_ticker($symbols[0])->then(function($ticker){
    echo "########## Callback style ##########\n";
    echo "### Callback->then finished: {$ticker['symbol']} {$ticker['close']}\n";
});




function myFunc ($exchange, $symbol) {
    return async(function () use ($exchange, $symbol) {
        // example sleep
        await(React\Promise\Timer\sleep(0.5));
        $ticker = await($exchange->fetch_ticker($symbol));
        echo "########## Custom async function ##########\n";
        echo "### Custom async function : {$ticker['symbol']} {$ticker['close']}\n";
    });
}
await(myFunc($exchange, $symbols[0])());
