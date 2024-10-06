<?php
namespace ccxt\pro;
include_once (__DIR__.'/../../../../ccxt.php');


use React\Async;
use React\sleep;


function create_and_watch_orders($exchange, $symbol) {
    return Async\async(function () use ($exchange, $symbol) {
        yield sleep(10);
        $order1 = yield $exchange->create_order($symbol, 'limit', 'buy', 10, 0.5);
        echo 'createOrder:', $order1['id'], "\n";

        $order2 = yield $exchange->create_order($symbol, 'limit', 'buy', 11, 0.49);
        echo 'createOrder:', $order2['id'], "\n";

        $order3 = yield $exchange->create_order($symbol, 'limit', 'buy', 11, 0.48);
        echo 'createOrder:', $order3['id'], "\n";

        $orders = yield $exchange->watch_orders($symbol);
        echo 'orders:', count($orders), "\n";

        assert(count($orders) === 2, 'Expecting 2 orders to be returned');

        $exchange->close();
    })();
}

$test_create_and_watch_orders = function () {
    $apiKey = 'dcdb042f4f0603265bce20abab5ca557016b0d0103010850f80faf40c8a747c0';
    $secret = '0359f4ecba2509781c73847786c485d934780163f9f6a8bb89b55617b939b77a';

    $exchangeClass = '\\ccxt\\pro\\binanceusdm';
    $exchange = new $exchangeClass([
        'apiKey' => $apiKey,
        'secret' => $secret,
        'enableRateLimit' => true
    ]);

    $exchange->set_sandbox_mode(true);
    $exchange->verbose = true;
    $symbol = 'XRP/USDT:USDT';

    Async\await(create_and_watch_orders($exchange, $symbol));
};

\React\Async\coroutine($test_create_and_watch_orders);
