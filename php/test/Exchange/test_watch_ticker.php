<?php

function test_watch_ticker($exchange, $symbol) {

    $future = new \ccxtpro\Future();

    function tick($future, $iteration, $maxIterations, $exchange, $symbol) {
        $exchange->watch_ticker($symbol)->then(function($result) use ($future, $iteration, $maxIterations, $exchange, $symbol) {
            echo $result['datetime'], ' ', $exchange->id, ' ', $symbol, ' watch_ticker ', $result['last'] . "\n";
            if ($iteration < $maxIterations) {
                tick($future, ++$iteration, $maxIterations, $exchange, $symbol);
            } else {
                $future->resolve($result);
            }
        });
    };

    tick($future, 0, 5, $exchange, $symbol);

    return $future;

}