<?php
namespace ccxt\pro;
ini_set('memory_limit', '-1');
include_once (__DIR__.'/../../../../ccxt.php');


use React\Async;
use React\Promise;
use React\EventLoop\Loop;
use RuntimeException;

function watch_ticker_loop ($exchange) {
    return Async\async(function () use ($exchange) {
        while (true) {
            $ticker = Async\await ($exchange->watch_ticker('BTC/USDT'));
        }
    }) ();
};


function watch_order_book_for_symbols_loop($exchange) {
    return Async\async(function () use ($exchange) {
        while (true) {
            $trades = Async\await ( $exchange->watch_trades_for_symbols(['BTC/USDT', 'ETH/USDT', 'LTC/USDT']));
        }
    }) ();
};


function close_after ($exchange, $s) {
    return Async\async(function () use ($exchange, $s) {
        Async\delay ($s);
        $exchange->close();
    }) (); 
};


$test_close = function () {
    $exchangeClass = '\\ccxt\\pro\\binance';
    $exchange = new  $exchangeClass();
    $exchange->verbose = false;

    // --------------------------------------------

    var_dump('Testing exchange.close(): No future awaiting, should close with no errors');
    Async\await ($exchange->watch_ticker('BTC/USDT'));
    $client = array_values($exchange->clients)[0];
    var_dump('ticker received');
    $exchange->close();
    var_dump('PASSED - exchange closed with no errors');

    // --------------------------------------------

    var_dump('Testing exchange.close(): Awaiting future should throw RuntimeException');
    try {
        Async\await(Promise\all([
            close_after($exchange, 5),
            watch_ticker_loop($exchange)
        ]));
    } catch(\Throwable $e) {
        if ($e instanceof RuntimeException) {
            var_dump('PASSED - future rejected with RuntimeException');
        } else {
            throw $e;
        }
    }

    // --------------------------------------------

    var_dump('Test exchange.close(): Call watch_multiple unhandled futures are canceled');
    try {
        Async\await(Promise\all([
            close_after($exchange, 5),
            watch_order_book_for_symbols_loop($exchange)
        ]));
    } catch(\Throwable $e) {
        if ($e instanceof RuntimeException) {
            var_dump('PASSED - future rejected with RuntimeException');
        } else {
            throw $e;
        }
    }

    var_dump('Test that futures that have no listeners are canceled instead of rejected');
    $client = $exchange->client($client->url);
    $test = $client->future('testing');
    $client->close();
    var_dump($test);

};


\React\Async\coroutine($test_close);
Loop::run();