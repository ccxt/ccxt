<?php

$root = dirname(dirname(dirname(dirname(__FILE__))));
include $root . '/ccxt.php';

$id = 'binance';
$exchange_class = '\\ccxt\\pro\\' . $id;
$exchange = new $exchange_class(array(
    'enableRateLimit' => true,
));

$symbols = array('BTC/USDT', 'ETH/USDT', 'ETH/BTC');

$loop = function($exchange, $symbol) {
    while (true) {
        try {
            
            $orderbook = yield $exchange->watch_order_book($symbol);
            print_orderbook($orderbook, $symbol);

        } catch (\ccxt\ResetConnection $e) { // reset connection, triggered, return to loop to reconnect

            echo get_class($e) . ': ' . $e->getMessage() . "\n";

        } catch (Exception $e) { // Some error happened, print error and exit loop
        
            echo get_class($e) . ': ' . $e->getMessage() . "\n";
            exit(1);

        }
    }
};

foreach ($symbols as $symbol) {
    \React\Async\coroutine($loop, $exchange, $symbol);
}
