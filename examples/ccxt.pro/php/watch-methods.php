<?php
include dirname(dirname(dirname(dirname(__FILE__)))). '/ccxt.php';

$exchange_class = '\\ccxt\\pro\\binance';
$exchange = new $exchange_class(['apiKey' => _YOUR_APIKEY_HERE_, 'secret' => _YOUR_SECRET_HERE_]); 

$wrapper_func = function($exchange, $symbol, $method_name) {
    if ($exchange->has[$method_name]) {
        print ("Starting $method_name for $exchange->id -> $symbol\n");
        while (true) {
            try {
                $orderbook = yield $exchange->$method_name($symbol);
                print("$method_name received: $exchange->id -> $symbol : " . substr(json_encode($orderbook), 0 , 70) . "...\n");
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
runAsync($wrapper_func, ...[$exchange, 'ETH/USDT', 'watchTrades']);
// runAsync($wrapper_func, ...[$exchange, 'ETH/USDT', 'watchTicker']);
// runAsync($wrapper_func, ...[$exchange, 'ETH/USDT', 'watchOrders']);
// runAsync($wrapper_func, ...[$exchange, 'ETH/USDT', 'watchMyTrades']);

