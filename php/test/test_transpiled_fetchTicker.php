<?php

function test_ticker($exchange, $symbol) {
    $method = 'fetchTicker';
    if ($exchange->has[$method]) {
        dump(green($exchange->id), green($symbol), 'executing ' . $method . '()');
        $ticker = yield $exchange->{$method}($symbol);
        dump(green($exchange->id), green($symbol), 'ticker:', implode(' ', array(
            $ticker['datetime'],
            'high: ' . $ticker['high'],
            'low: ' . $ticker['low'],
            'bid: ' . $ticker['bid'],
            'ask: ' . $ticker['ask'],
            'volume: ' . $ticker['quoteVolume'], )));
    } else {
        dump(green($symbol), $method . '() is not supported');
    }
}
