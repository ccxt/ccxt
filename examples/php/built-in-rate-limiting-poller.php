<?php

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set('UTC');

$exchange = '\\ccxt\\poloniex';
$exchange = new $exchange();

$symbol = 'DOGE/BTC';

while (true) {
    $order_book = $exchange->fetch_order_book($symbol);
    echo "----------------------------------------------------------------\n";
    echo date('c') . "\n";
    echo count($order_book['bids']) . " bids and " . count($order_book['asks']) . " asks\n";
    echo sprintf("bid: %.8f ask: %.8f", $order_book['bids'][0][0], $order_book['asks'][0][0]) . "\n";
}
