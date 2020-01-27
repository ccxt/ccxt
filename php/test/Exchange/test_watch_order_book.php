<?php

function print_orderbook($orderbook) {
    echo date('c '),
        count($orderbook['asks']), ' asks ', json_encode($orderbook['asks'][0]), ' ',
        count($orderbook['bids']), ' bids ', json_encode($orderbook['bids'][0]), "\n";
}

function tick($iteration, $maxIterations, $future, $method, ... $args) {

    echo "tick ---\n";
    exit();

    $method(... $args)->then(function ($result) use ($iteration, $maxIterations, $future, $method, $args) {
        print_orderbook($result);
        if ($iteration < $maxIterations) {
            tick(++$iteration, $maxIterations, $future, $method, ...$args);
        } else {
            $future->resolve($result);
        }
    });
};

function test_watch_order_book($exchange, $symbol) {

    $future = new \ccxtpro\Future();

    echo "test_watch_order_book ---\n";

    tick(0, 10, $future, array($exchange, 'watch_order_book'), $symbol);

    return $future;

    // return
    // // return $ti
    // // $delay = $exchange->rateLimit * 1000;
    // // usleep($delay);
    // // dump(green($exchange->id), green($symbol), 'fetching order book...');
    // // $orderbook = $exchange->fetch_order_book($symbol);
    // // dump(green($exchange->id), green($symbol), 'order book:', implode(' ', array(
    // //     $orderbook['datetime'],
    // //     'bid: '       . @$orderbook['bids'][0][0],
    // //     'bidVolume: ' . @$orderbook['bids'][0][1],
    // //     'ask: '       . @$orderbook['asks'][0][0],
    // //     'askVolume: ' . @$orderbook['asks'][0][1])));
};
