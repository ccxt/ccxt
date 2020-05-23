<?php

function test_watch_ticker($exchange, $symbol) {

    echo __FUNCTION__ . "\n";

    $future = new \ccxtpro\Future();

    if (array_key_exists('watchTicker', $exchange->has) && $exchange->has['watchTicker']) {

        function tick_ticker($future, $iteration, $maxIterations, $exchange, $symbol) {
            $exchange->watch_ticker($symbol)->then(function($result) use ($future, $iteration, $maxIterations, $exchange, $symbol) {
                echo $result['datetime'], ' ', $exchange->id, ' ', $symbol, ' watch_ticker ', $result['last'] . "\n";
                if (++$iteration < $maxIterations) {
                    tick_ticker($future, $iteration, $maxIterations, $exchange, $symbol);
                } else {
                    $future->resolve($result);
                }
            });
        };

        tick_ticker($future, 0, 3, $exchange, $symbol);

    } else {

        echo $exchange->id, " watchTicker() is not supported or not implemented yet\n";
        $future->resolve(true);
    }

    return $future;
}
