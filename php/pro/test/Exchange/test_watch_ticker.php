<?php

function test_watch_ticker($exchange, $symbol) {

    echo __FUNCTION__ . "\n";

    $method = 'watchTicker';

    // we have to skip some exchanges here due to the frequency of trading
    $skipped_exchanges = array(
        'cex',
        'ripio',
        'mexc',
        'woo',
        'alpaca'
    );

    if (in_array($exchange->id, $skipped_exchanges)) {

        echo $exchange->id, ' ', $method, "() test skipped\n";
        return;
    }

    if (!(array_key_exists($method, $exchange->has) && $exchange->has[$method])) {
        echo $exchange->id, ' ', $method, "() is not supported or not implemented yet\n";
        return;
    }

    $now = $exchange->milliseconds();
    $ends = $now + 10000;
    while ($now < $ends) {
        try {
            $ticker = yield $exchange->watch_ticker($symbol);
            echo $ticker['datetime'], ' ', $exchange->id, ' ', $symbol, ' watch_ticker ', $ticker['last'] . "\n";
        } catch (Exception $e) {
            if (!($e instanceof \ccxt\NetworkError)) {
                throw $e;
            }
        }
        $now = $exchange->milliseconds();
    }
}
