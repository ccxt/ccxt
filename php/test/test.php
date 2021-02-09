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
    //
    yield test_watch_order_book($exchange, $symbol);
    yield test_watch_ticker($exchange, $symbol);
    yield test_watch_trades($exchange, $symbol);
};

function test_private($exchange, $symbol, $code) {
    echo "test_private\n";
    if ($exchange->check_required_credentials(false)) {
        NULL;
    }
    yield 0;
};

function test_exchange($exchange) {
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
    if (strpos($symbol, '.d') === false) {
        yield test_public($exchange, $symbol);
        yield test_private($exchange, $symbol, $code);
    }
};

// ----------------------------------------------------------------------------

$test = function () use ($id, $config, $verbose) {

    $options = array_key_exists($id, $config) ? $config[$id] : array();
    $exchange_class = '\\ccxtpro\\' . $id;
    $exchange = new $exchange_class(array_merge_recursive(array(
        'enableRateLimit' => true,
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
        exit();

    } else {

        yield $exchange->load_markets();

        yield test_exchange($exchange);
        $exchange::get_kernel()->stop();
    }
};

// ----------------------------------------------------------------------------

\ccxtpro\Exchange::execute_and_run($test);
