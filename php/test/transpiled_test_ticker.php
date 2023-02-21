<?php
namespace ccxt\test_methods;
global $testMethodsArray;

$test_method = 'ticker';

$testMethodsArray[$test_method] = function ($ticker, $exchange, $symbol) use ($test_method) {
    assert ($ticker);
    $sampleItem = array(
        'info' => array( 'a' => 1, 'b' => 2, 'c' => 3 ),    // the original decoded JSON as is
        'timestamp' => 1502962946216,            // Unix $timestamp in milliseconds
        'datetime' => '2017-08-17 12:42:48.000', // ISO8601 datetime with milliseconds
        'symbol' => 'ETH/BTC',                   // $symbol
        // ...
    );
    $timestamp = $ticker['timestamp'];
    assert ($ticker['datetime'] === $exchange->iso8601 ($timestamp));
    assert ($ticker['symbol'] === $symbol, 'trade $symbol is not equal to requested $symbol => $trade => ' . $ticker['symbol'] . ' requested => ' . $symbol);
};


