<?php

function print_orderbook($orderbook) {
    echo (isset($orderbook['nonce']) ? $orderbook['nonce'] : date('c ', (int) $orderbook['timestamp'] / 1000)), ' ',
        count($orderbook['asks']), ' asks ', json_encode($orderbook['asks'][0]), ' ',
        count($orderbook['bids']), ' bids ', json_encode($orderbook['bids'][0]), "\n";
}

function test_watch_order_book($exchange, $symbol) {

    $future = new \ccxtpro\Future();

    function tick($iteration, $maxIterations, $future, $method, ... $args) {
        $method(... $args)->then(function($result) use ($iteration, $maxIterations, $future, $method, $args) {
            print_orderbook($result);
            if ($iteration < $maxIterations) {
                tick(++$iteration, $maxIterations, $future, $method, ...$args);
            } else {
                $future->resolve($result);
            }
        });
    };

    tick(0, 10, $future, array($exchange, 'watch_order_book'), $symbol);

    return $future;
}
