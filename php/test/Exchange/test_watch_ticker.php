<?php

use React\Promise;

function test_watch_ticker($exchange, $symbol) {

    echo __FUNCTION__ . "\n";

    $method = 'watchTicker';

    // we have to skip some exchanges here due to the frequency of trading
    $skipped_exchanges = array(
        'ripio',
    );

    if (in_array($exchange->id, $skipped_exchanges)) {

        echo $exchange->id, ' ', $method, "() test skipped\n";

    } else {

        if (array_key_exists($method, $exchange->has) && $exchange->has[$method]) {

            function tick_ticker($iteration, $maxIterations, $exchange, $symbol) {
                return $exchange->watch_ticker($symbol)->then(function($result) use ($iteration, $maxIterations, $exchange, $symbol) {
                    echo $result['datetime'], ' ', $exchange->id, ' ', $symbol, ' watch_ticker ', $result['last'] . "\n";
                    if ($iteration < $maxIterations) {
                        return tick_ticker(++$iteration, $maxIterations, $exchange, $symbol);
                    }
                });
            };

            return tick_ticker(0, 3, $exchange, $symbol);

        } else {

            echo $exchange->id, ' ', $method, "() is not supported or not implemented yet\n";
        }
    }
    return Promise\resolve(true);
}
