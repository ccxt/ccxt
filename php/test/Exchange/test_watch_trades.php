<?php

use React\Promise;

function test_watch_trades($exchange, $symbol) {

    echo __FUNCTION__ . "\n";

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

    } else {

        if (array_key_exists($method, $exchange->has) && $exchange->has[$method]) {

            function tick_trades($iteration, $maxIterations, $exchange, $symbol) {
                return $exchange->watch_trades($symbol)->then(function($result) use ($iteration, $maxIterations, $exchange, $symbol) {
                    echo $exchange->id, ' ', $symbol, ' ', count($result) . " trades\n";
                    if (++$iteration < $maxIterations) {
                        return tick_trades($iteration, $maxIterations, $exchange, $symbol);
                    }
                });
            };

            return tick_trades(0, 3, $exchange, $symbol);

        } else {

            echo $exchange->id, ' ', $method, "() is not supported or not implemented yet\n";
        }

    }

    return Promise\resolve(true);

}
