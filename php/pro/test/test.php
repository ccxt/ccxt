<?php

error_reporting(E_ALL | E_STRICT);
date_default_timezone_set('UTC');

require_once 'vendor/autoload.php';
include_once 'php/pro/test/Exchange/test_watch_order_book.php';
include_once 'php/pro/test/Exchange/test_watch_ticker.php';
include_once 'php/pro/test/Exchange/test_watch_trades.php';

use React\Async;

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
    yield from test_watch_order_book($exchange, $symbol);
    yield from test_watch_ticker($exchange, $symbol);
    yield from test_watch_trades($exchange, $symbol);
};

function test_private($exchange, $symbol, $code) {
    echo "test_private\n";
    if ($exchange->check_required_credentials(false)) {
        NULL;
    }
    yield from 0;
};

function get_test_symbol($exchange, $symbols) {
    $symbol = null;
    foreach ($symbols as $s) {
        $market = $exchange->safe_value($exchange->markets, $s);
        if ($market !== null) {
            $active = $exchange->safe_value($market, 'active');
            if ($active || $active === null) {
                $symbol = $s;
                break;
            }
        }
    }
    return $symbol;
}

function test_exchange($exchange) {

    $codes = array(
        'BTC',
        'ETH',
        'XRP',
        'LTC',
        'BCH',
        'EOS',
        'BNB',
        'BSV',
        'USDT',
        'ATOM',
        'BAT',
        'BTG',
        'DASH',
        'DOGE',
        'ETC',
        'IOTA',
        'LSK',
        'MKR',
        'NEO',
        'PAX',
        'QTUM',
        'TRX',
        'TUSD',
        'USD',
        'USDC',
        'WAVES',
        'XEM',
        'XMR',
        'ZEC',
        'ZRX',
    );

    $code = $codes[0];
    for ($i = 0; $i < count($codes); $i++) {
        if (array_key_exists($codes[$i], $exchange->currencies)) {
            $code = $codes[$i];
        }
    }

    $symbol = get_test_symbol($exchange, array(
        'BTC/USD',
        'BTC/USDT',
        'BTC/CNY',
        'BTC/EUR',
        'BTC/ETH',
        'ETH/BTC',
        'ETH/USDT',
        'BTC/JPY',
        'LTC/BTC',
        'USD/SLL',
    ));

    if ($symbol === null) {
        $markets = array_values($exchange->markets);
        foreach ($codes as $code) {
            $activeMarkets = array_filter($markets, function($market) use ($exchange, $code) {
                return $market['base'] === $code;
            });
            if (count($activeMarkets)) {
                $activeSymbols = array_map(function($market) {
                    return $market['symbol'];
                }, $activeMarkets);
                $symbol = get_test_symbol($exchange, $activeSymbols);
                break;
            }
        }
    }

    if ($symbol === null) {
        $markets = array_values($exchange->markets);
        $activeMarkets = array_filter($markets, function($market) use ($exchange) {
            return !$exchange->safe_value($market, 'active', false);
        });
        $activeSymbols = array_map(function($market) {
            return $market['symbol'];
        }, $activeMarkets);
        $symbol = get_test_symbol($exchange, $activeSymbols);
    }

    if ($symbol === null) {
        $symbol = get_test_symbol($exchange, $exchange->symbols);
    }

    if ($symbol === null) {
        $symbol = $exchange->symbols[0];
    }

    if (strpos($symbol, '.d') === false) {
        yield from test_public($exchange, $symbol);
        echo "finished public tests\n";
        // yield test_private($exchange, $symbol, $code);
    }
};

// ----------------------------------------------------------------------------

$test = function () use ($id, $config, $verbose) {

    $options = array_key_exists($id, $config) ? $config[$id] : array();
    $exchange_class = '\\ccxt\\pro\\' . $id;
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

    if (@$exchange->skipWs) {

        echo $exchange->id, " [Skipped]\n";
        echo "Done.\n";
        exit();

    } else {

        yield $exchange->load_markets();

        yield from test_exchange($exchange);
        exit();
    }
};

// ----------------------------------------------------------------------------

$promise = Async\coroutine($test);
Async\await($promise);