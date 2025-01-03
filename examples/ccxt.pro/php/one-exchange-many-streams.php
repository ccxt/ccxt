<?php

$root = dirname(dirname(dirname(dirname(__FILE__))));
include $root . '/ccxt.php';

$id = 'aax';
$exchange_class = '\\ccxt\\pro\\' . $id;
$exchange = new $exchange_class(array(
    'enableRateLimit' => true,
));

$symbols = array('BTC/USDT', 'ETH/USDT', 'ETH/BTC');

function print_orderbook($orderbook, $symbol) {
    $id = isset($orderbook['nonce']) ? $orderbook['nonce'] : $orderbook['datetime'];
    echo $id, ' ', $symbol, ' ',
        count($orderbook['asks']), ' asks ', json_encode($orderbook['asks'][0]), ' ',
        count($orderbook['bids']), ' bids ', json_encode($orderbook['bids'][0]), "\n";
}

$loop = function($exchange, $symbol) {
    while (true) {
        $orderbook = yield $exchange->watch_order_book($symbol);
        print_orderbook($orderbook, $symbol);
    }
};

foreach ($symbols as $symbol) {
    \React\Async\coroutine($loop, $exchange, $symbol);
}
