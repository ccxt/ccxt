<?php
namespace ccxt\test_methods;
use React\Async;
use React\Promise;
global $testMethodsArray;

$test_method = 'fetchTicker';

$testMethodsArray[$test_method] = function ($testMethodsArray, $exchange, $symbol) use ($test_method){
    return Async\async(function () use ($testMethodsArray, $exchange, $symbol, $test_method) {
        $ticker = Async\await ($exchange->{$test_method}($symbol));
        $testMethodsArray['ticker']($ticker, $exchange, $symbol);
    }) ();
};
