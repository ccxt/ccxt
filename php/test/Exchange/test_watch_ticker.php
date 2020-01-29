<?php

function test_watch_ticker($exchange, $symbol) {

    $future = new \ccxtpro\Future();

    function tick($iteration, $maxIterations, $future, $method, ... $args) {
        $method(... $args)->then(function($result) use ($iteration, $maxIterations, $future, $method, $args) {
            echo $exchange->id, ' ', $symbol, ' watch_ticker ', $result['last'] . "\n";
            if ($iteration < $maxIterations) {
                tick(++$iteration, $maxIterations, $future, $method, ...$args);
            } else {
                $future->resolve($result);
            }
        });
    };

    tick(0, 5, $future, array($exchange, 'watch_ticker'), $symbol);

    return $future;

}