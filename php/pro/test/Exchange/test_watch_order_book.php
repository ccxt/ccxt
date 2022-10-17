<?php

function print_orderbook($orderbook, $symbol) {
    $id = isset($orderbook['nonce']) ? $orderbook['nonce'] : $orderbook['datetime'];
    echo $orderbook['datetime'], ' ', $id, ' ', $symbol, ' ',
        count($orderbook['asks']), ' asks ', json_encode($orderbook['asks'][0]), ' ',
        count($orderbook['bids']), ' bids ', json_encode($orderbook['bids'][0]), "\n";
}

function test_watch_order_book($exchange, $symbol) {

    echo __FUNCTION__ . "\n";

    $method = 'watchOrderBook';

    // we have to skip some exchanges here due to the frequency of trading
    $skipped_exchanges = array(
        'ripio',
        'gopax', // requires authentication for watch_order_book
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
            $result = yield $exchange->watch_order_book($symbol);
            print_orderbook($result, $symbol);
        } catch (Exception $e) {
            if (!($e instanceof \ccxt\NetworkError)) {
                throw $e;
            }
        }
        $now = $exchange->milliseconds();
    }
}
