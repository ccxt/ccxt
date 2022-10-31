<?php

function test_watch_trades($exchange, $symbol) {

    echo __FUNCTION__ . "\n";

    $method = 'watchTrades';

    // we have to skip some exchanges here due to the frequency of trading
    $skipped_exchanges = array(
        'bitvavo',
        'dsx',
        'currencycom',
        'idex2', // rinkeby testnet, trades too rare
        'ripio',
        'gopax', // requires authentication for watch_order_book
        'coinflex' // too illiquid
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
            $trades = yield $exchange->watch_trades($symbol);
            echo $exchange->iso8601($now), ' ', $exchange->id, ' ', $symbol, ' ', count($trades) . " trades\n";
        } catch (Exception $e) {
            if (!($e instanceof \ccxt\NetworkError)) {
                throw $e;
            }
        }
        $now = $exchange->milliseconds();
    }
}
