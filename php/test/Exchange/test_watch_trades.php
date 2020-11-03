<?php

function test_watch_trades($exchange, $symbol) {

    echo __FUNCTION__ . "\n";

    $future = new \ccxtpro\Future();

    $method = 'watchTrades';

    $skipped_exchanges = array(
        'bitvavo',
        'dsx',
        'currencycom',
        'idex2', // rinkeby testnet, trades too rare
        'ripio',
    );

    if (in_array($exchange->id, $skipped_exchanges)) {

        echo $exchange->id, ' ', $method, "() test skipped\n";
        $future->resolve(true);

    } else {

        if (array_key_exists($method, $exchange->has) && $exchange->has[$method]) {

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

            echo $exchange->id, ' ', $method, "() is not supported or not implemented yet\n";
            $future->resolve(true);
        }

    }

    return $future;
}
