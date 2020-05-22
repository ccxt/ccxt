<?php

error_reporting(E_ALL | E_STRICT);
date_default_timezone_set('UTC');

require_once 'vendor/autoload.php';
include_once 'php/test/Exchange/test_watch_order_book.php';
include_once 'php/test/Exchange/test_watch_ticker.php';
include_once 'php/test/Exchange/test_watch_trades.php';

if (count($argv) < 2) {
    echo "Exchange id not specified\n";
    exit(1);
}

$args = array_slice($argv, 2);
$verbose = count(array_filter($args, function ($option) {
    return strstr ($option, '--verbose') !== false;
})) > 0;

$keys_global = './keys.json';
$keys_local = './keys.local.json';
$keys_file = file_exists($keys_local) ? $keys_local : $keys_global;

$config = file_exists($keys_file) ? json_decode(file_get_contents($keys_file), true) : array();

$loop = \React\EventLoop\Factory::create();

$id = $argv[1];

// ----------------------------------------------------------------------------

function test_public($exchange, $symbol) {
    echo "test_public\n";
    $future = new \ccxtpro\Future();
    //
    test_watch_order_book($exchange, $symbol)->then(function() use ($exchange, $symbol, $future) {
        test_watch_ticker($exchange, $symbol)->then(function() use ($exchange, $symbol, $future) {
            test_watch_trades($exchange, $symbol)->then(function() use ($exchange, $symbol, $future) {
                $future->resolve(true);
            });
        });
    });
    //
    return $future;
};

function test_private($exchange, $symbol, $code) {
    echo "test_private\n";
    $future = new \ccxtpro\Future();
    if ($exchange->check_required_credentials(false)) {
        // test_watch_balance($exchange)->then(function() use (&$future) {
            $future->resolve(true);
        // });
    } else {
        $future->resolve(true);
    }
    return $future;
};

function test_exchange($exchange) {
    $delay = $exchange->rateLimit * 1000;
    $symbol = is_array($exchange->symbols) ? current($exchange->symbols) : '';
    $symbols = array(
        'BTC/KRW',
        'BTC/USD',
        'BTC/USDT',
        'BTC/CNY',
        'BTC/EUR',
        'BTC/ETH',
        'ETH/BTC',
        'BTC/JPY',
        'LTC/BTC',
    );
    foreach ($symbols as $s) {
        if (in_array ($s, $exchange->symbols) && (array_key_exists ('active', $exchange->markets[$s]) ? $exchange->markets[$s]['active'] : true)) {
            $symbol = $s;
            break;
        }
    }
    $code = 'BTC'; // wip
    $future = new \ccxtpro\Future();
    if (strpos($symbol, '.d') === false) {
        test_public($exchange, $symbol)->then(function() use ($exchange, $symbol, $code, $future) {
            test_private($exchange, $symbol, $code)->then(function () use (&$future) {
                $future->resolve(true);
            });
        });
    } else {
        $future->resolve(true);
    }
    return $future;
};

// ----------------------------------------------------------------------------

$test = function () use ($id, $config, $loop, $verbose) {

    $options = array_key_exists($id, $config) ? $config[$id] : array();
    $exchange_class = '\\ccxtpro\\' . $id;
    $exchange = new $exchange_class(array_merge_recursive(array(
        'enableRateLimit' => true,
        'loop' => $loop,
        'verbose' => $verbose,
        // 'urls' => array(
        //     'api' => array(
        //         'ws' => 'ws://127.0.0.1:8080',
        //     ),
        // ),
        // 'print' => function () {
        //     $args = func_get_args();
        //     if (is_array($args)) {
        //         $array = array();
        //         foreach ($args as $arg) {
        //             $array[] = is_string($arg) ? $arg : json_encode($arg, JSON_PRETTY_PRINT);
        //         }
        //         echo implode(' ', $array), "\n";
        //     }
        // },

    ), $options));

    echo 'Testing ', $exchange->id, "\n";

    if (@$exchange->skip) {

        echo $exchange->id, " [Skipped]\n";
        echo "Done.\n";
        exit ();

    } else {

        $exchange->load_markets();

        test_exchange($exchange)->then(function() {
            echo "Done.\n";
            exit ();
        });
    }
};

// ----------------------------------------------------------------------------

$loop->futureTick($test);
$loop->run ();
