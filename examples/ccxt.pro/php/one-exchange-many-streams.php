<?php

error_reporting(E_ALL | E_STRICT);
date_default_timezone_set('UTC');
require_once 'vendor/autoload.php';

$loop = \React\EventLoop\Factory::create();

$id = 'poloniex';
$exchange_class = '\\ccxtpro\\' . $id;
$exchange = new $exchange_class(array(
    'enableRateLimit' => true,
    'loop' => $loop,
));

$exchange->load_markets();

$symbols = array('BTC/USDT', 'ETH/USDT', 'ETH/BTC');

function print_orderbook($orderbook, $symbol) {
    $id = isset($orderbook['nonce']) ? $orderbook['nonce'] : $orderbook['datetime'];
    echo $id, ' ', $symbol, ' ',
        count($orderbook['asks']), ' asks ', json_encode($orderbook['asks'][0]), ' ',
        count($orderbook['bids']), ' bids ', json_encode($orderbook['bids'][0]), "\n";
}

function loop($exchange, $symbol) {
    $exchange->watch_order_book($symbol)->then(function($orderbook) use ($exchange, $symbol) {
        print_orderbook($orderbook, $symbol);
        loop($exchange, $symbol);
    });
};

$main = function () use ($exchange, $symbols) {
    foreach ($symbols as $symbol) {
        loop($exchange, $symbol);
    }
};

$loop->futureTick($main);
$loop->run ();
