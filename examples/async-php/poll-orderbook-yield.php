<?php

$root = dirname(dirname(dirname(__FILE__)));
include_once $root . '/vendor/autoload.php';

use ccxt\async;

$exchange = new async\binance([
    'enableRateLimit' => true,
    'verbose' => true,
]);

$exchange::$kernel->execute(function () use ($exchange) {
    while (true) {
        $book = yield $exchange->fetch_order_book('ETH/BTC');
        echo count($book['bids']) . ' bids, highest bid ' . $book['bids'][0][0] . ' ' . count($book['asks']) . ' lowest ask ' . $book['asks'][0][0] . PHP_EOL;
    }
});

$exchange::$kernel->run();
