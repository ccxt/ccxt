<?php

require dirname(__FILE__).'/../vendor/autoload.php';
include dirname(__FILE__) ."/../vendor/ccxt/ccxt/ccxt.php";

date_default_timezone_set ('UTC');

use TomWright\Database\ExtendedPDO\ExtendedPDO as ExtendedPDO;
use TomWright\Database\QueryBuilder\SqlQueryBuilder as SqlQueryBuilder;

$loop = React\EventLoop\Factory::create ();

// instantiate the exchange by id
$exchange = '\\ccxt\\poloniex';
$exchange = new $exchange ();

$tick_function = function () use ($exchange, $loop, &$tick_function) {
    global $exchange, $loop;
    $order_book = $exchange->fetch_order_book ($symbol);
    echo "----------------------------------------------------------------\n";
    echo date ('c') . "\n";
    echo count ($order_book['bids']) . " bids and " . count ($order_book['asks']) . " asks\n";
    echo sprintf ("bid: %.8f ask: %.8f", $order_book['bids'][0][0], $order_book['asks'][0][0]) . "\n";

    $loop->futureTick ($tick_function);
};

$loop->futureTick ($tick_function);
$loop->run ();