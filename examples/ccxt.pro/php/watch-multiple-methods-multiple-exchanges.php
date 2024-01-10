<?php
error_reporting(E_ALL | E_STRICT);
date_default_timezone_set('UTC');
include dirname(dirname(dirname(dirname(__FILE__)))). '/ccxt.php';

$binance_id = '\\ccxt\\pro\\binance';
$binance_exchange = new $binance_id( /*[ 'apiKey' => _YOUR_APIKEY_HERE_, 'secret' => _YOUR_SECRET_HERE_ ]*/ ); 

$ftx_id = '\\ccxt\\pro\\ftx';
$ftx_exchange = new $ftx_id( /*['apiKey' => _YOUR_APIKEY_HERE_, 'secret' => _YOUR_SECRET_HERE_]*/ ); 

$wrapper_func = function($exchange, $symbol, $method_name) {
    if ($exchange->has[$method_name]) {
        print ("Starting $method_name for $exchange->id -> $symbol\n");
        while (true) {
            try {
                $orderbook = yield $exchange->$method_name($symbol);
                print("$exchange->id -> $method_name -> $symbol : " . substr(json_encode($orderbook), 0 , 70) . "...\n");
            } catch (\Exception $ex) {
                print($ex->getMessage());
                sleep(5);
            }
        }
    } else {
        print ($exchange->id . " API yet doesnt support $method_name");
    }
};

function runAsync (...$args) { 
    \React\Async\coroutine(...$args);
}

// *** uncomment whichever methods you want to test ***
// runAsync($wrapper_func, ...[$exchange, 'ETH/USDT', 'watchOrderBook']);
// runAsync($wrapper_func, ...[$exchange, 'ETH/USDT', 'watchTicker']);
// runAsync($wrapper_func, ...[$exchange, 'ETH/USDT', 'watchOrders']);
// runAsync($wrapper_func, ...[$exchange, 'ETH/USDT', 'watchMyTrades']);

runAsync($wrapper_func, ...[$binance_exchange, 'SOL/USDT', 'watchTrades']);
runAsync($wrapper_func, ...[$ftx_exchange, 'ETH/USDT', 'watchTrades']);

