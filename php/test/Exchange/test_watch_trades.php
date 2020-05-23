<?php

function test_watch_trades($exchange, $symbol) {

    echo __FUNCTION__ . "\n";

    $future = new \ccxtpro\Future();
    
    $skipped_exchanges = array(
        'dsx',
    );
    
    if (in_array($exchange->id, $skipped_exchanges)) {
        echo $exchange->id, " watchTrades() skipped\n";
        $future->resolve(true);
    }

    if (array_key_exists('watchTrades', $exchange->has) && $exchange->has['watchTrades']) {

        function tick_trades($future, $iteration, $maxIterations, $exchange, $symbol) {
            $exchange->watch_trades($symbol)->then(function($result) use ($future, $iteration, $maxIterations, $exchange, $symbol) {
                echo $exchange->id, ' ', $symbol, ' ', count($result) . " trades\n";
                if (++$iteration < $maxIterations) {
                    tick_trades($future, $iteration, $maxIterations, $exchange, $symbol);
                } else {
                    $future->resolve($result);
                }
            });
        };

        tick_trades($future, 0, 3, $exchange, $symbol);

    } else {

        echo $exchange->id, " watchTrades() is not supported or not implemented yet\n";
        $future->resolve(true);
    }

    return $future;
}
