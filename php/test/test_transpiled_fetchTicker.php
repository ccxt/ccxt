<?php
namespace ccxt\test_methods;
use React\Async;
use React\Promise;

global $testMethodsArray;
$name = 'fetchTicker';
$testMethodsArray[$name] = function ($exchange, $symbol) {
    return Async\async(function () use ($exchange, $symbol) {
        $ticker = Async\await ($exchange->{$method}($symbol));
        var_dump($exchange->id, $symbol, 'ticker:', implode(' ', array(
            'dt: ' . $ticker['datetime'],
            'high: ' . $ticker['high'],
            'low: ' . $ticker['low'],
            'bid: ' . $ticker['bid'],
            'ask: ' . $ticker['ask'],
            'volume: ' . $ticker['quoteVolume'], )));
    }) ();
};
