<?php

function print_orderbook($orderbook, ... $args) {
    $id = isset($orderbook['nonce']) ? $orderbook['nonce'] : $orderbook['datetime'];
    echo $id, ' ', $args[0], ' ',
        count($orderbook['asks']), ' asks ', json_encode($orderbook['asks'][0]), ' ',
        count($orderbook['bids']), ' bids ', json_encode($orderbook['bids'][0]), "\n";
}

function test_watch_order_book($exchange, $symbol) {

    echo __FUNCTION__ . "\n";

    $future = new \ccxtpro\Future();

    if (array_key_exists('watchOrderBook', $exchange->has) && $exchange->has['watchOrderBook']) {

        function tick_order_book($iteration, $maxIterations, $future, $method, ... $args) {
            $method(... $args)->then(function($result) use ($iteration, $maxIterations, $future, $method, $args) {
                print_orderbook($result, ... $args);
                if ($iteration < $maxIterations) {
                    tick_order_book(++$iteration, $maxIterations, $future, $method, ... $args);
                } else {
                    $future->resolve($result);
                }
            });
        };

        tick_order_book(0, 10, $future, array($exchange, 'watch_order_book'), $symbol);

    } else {

        echo $exchange->id, " watchOrderBook() is not supported or not implemented yet\n";
        $future->resolve(true);
    }

    return $future;
}
