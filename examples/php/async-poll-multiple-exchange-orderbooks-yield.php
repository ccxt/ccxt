<?php

$root = dirname(dirname(dirname(__FILE__)));
include_once $root . '/vendor/autoload.php';

use ccxt\async;

$binance = new async\binance();
$bitfinex = new async\bitfinex2();
$poloniex = new async\poloniex();

$exchanges = array($binance, $bitfinex, $poloniex);

function poller($exchange) {
    $symbol = "ETH/BTC";
    while (true) {
        try {
            $result = yield $exchange->fetch_order_book($symbol);
            echo str_pad($exchange->id, 9) . " " . $symbol . " " . str_pad(count($result['bids']), 3) . " bids, highest bid: " .
                str_pad(strval($result['bids'][0][0]), 10, "0") . " " . str_pad(count($result["asks"]), 3) . " asks, lowest ask: " . str_pad(strval($result["asks"][0][0]), 10, "0") . PHP_EOL;

        } catch (Exception $e) {
            var_dump($e);
        }
    }
}

async\Exchange::get_kernel()->execute(function () use ($exchanges) {
    $yields = [];
    foreach ($exchanges as $exchange) {
        $yields[] = poller($exchange);
    }
    // spawn all the coroutines asynchronously
    yield $yields;
});

async\Exchange::get_kernel()->run();
