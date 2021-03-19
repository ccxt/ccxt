<?php

error_reporting(E_ALL | E_STRICT);
date_default_timezone_set('UTC');
require_once 'vendor/autoload.php';

$id = 'poloniex';
$exchange_class = '\\ccxtpro\\' . $id;
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

function loop($exchange, $symbol) {
    while (true) {
        $orderbook = yield $exchange->watch_order_book($symbol);
        print_orderbook($orderbook, $symbol);
    }
};

$kernel = $exchange::get_kernel();
foreach ($symbols as $symbol) {
    $kernel->execute(loop($exchange, $symbol));
}

$kernel->run();
