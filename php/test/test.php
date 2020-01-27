<?php

error_reporting(E_ALL | E_STRICT);
date_default_timezone_set('UTC');

require_once 'vendor/autoload.php';
include_once 'php/test/Exchange/test_watch_order_book.php';

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
    return \React\Promise\reduce(array(
        // test_watch_order_book($exchange, $symbol),
        // test_watch_ticker($exchange, $symbol),
        // test_watch_trades($exchange, $symbol),
    ), function($c, $i) { $c[] = $i; return $c; }, array());
};

function test_private($exchange, $symbol, $code) {
    echo "test_private\n";
    if ($exchange->check_required_credentials(false)) {
        return \React\Promise\reduce(array(
            // test_watch_balance($exchange),
        ), function($c, $i) { $c[] = $i; return $c; }, array());
    }
};

function test_exchange($exchange) {
    $delay = $exchange->rateLimit * 1000;
    $symbol = is_array($exchange->symbols) ? current($exchange->symbols) : '';
    $symbols = array(
        'BTC/USD',
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
        return \React\Promise\reduce(array(
            test_public($exchange, $symbol),
            test_private($exchange, $symbol, $code),
        ), function($c, $i) { $c[] = $i; return $c; }, array());
    }
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
    ), $options));

    echo 'Testing ', $exchange->id, "\n";

    $exchange->load_markets();

    test_exchange($exchange)->then(function() {
        echo "Done.\n";
        exit ();
    });
};

// ----------------------------------------------------------------------------

$loop->futureTick($test);
$loop->run ();

/*

$symbol = 'ETH/BTC';
$delay = 5000;

function print_balances($balance) {
    $currencies = array_keys($balance['free']);
    $iso8601 = date('c ');
    foreach ($currencies as $code) {
        $b = $balance[$code];
        // print positive balances only
        if (($b['free'] > 0) || ($b['used'] > 0) || ($b['total'] > 0)) {
            echo $iso8601, ' ', $code, ': ', json_encode($b), "\n";
        }
    }
}


exit();

function subscribe ($exchange, $resolved, $rejected, ...$args) {
    $promise = $exchange->watch_order_book(...$args);
    $promise->then(function ($result) use ($exchange, $resolved, $rejected, $args) {
        $resolved($result);
        subscribe($exchange, $resolved, $rejected, ...$args);
    }, $rejected);
}

subscribe(
    $exchange,
    function ($result) {
        var_dump(json_encode($result));
    },
    function ($error) {
        echo "error\n";
        var_dump($error);
    },
    $symbol,
);

$loop->run ();

$tick = function () use ($loop, $exchange, &$tick) {

    $promise = $exchange->watch_heartbeat();
    $promise->then(
        function ($response) use ($loop, $tick) {
            echo date('c '), print_r($response, true),  "\n";
            $loop->futureTick($tick);
        },
        function ($error) {
            echo date('c'), ' ERROR ', $error->getMessage (), "\n";
        }
    );
};
//*/

/*


// $shortopts = '';
// $longopts = array (
//     "nonce::", // '::' means optional, ':' means required
// );

// $options = getopt ($shortopts, $longopts);
// var_dump ($options);
// exit ();

//-----------------------------------------------------------------------------


//-----------------------------------------------------------------------------

function test_trades($exchange, $symbol) {
    if ($exchange->has['fetchTrades']) {
        $delay = $exchange->rateLimit * 1000;
        usleep($delay);

        dump(green($symbol), 'fetching trades...');
        $trades = $exchange->fetch_trades($symbol);
        dump(green($symbol), 'fetched', green(count($trades)), 'trades');
    } else {
        dump(green($symbol), 'fetchTrades () not supported');
    }
}

function test_symbol($exchange, $symbol) {
    test_ticker($exchange, $symbol);
    if ($exchange->id === 'coinmarketcap') {
        dump(var_export($exchange->fetchGlobal()));
    } else {
        test_order_book($exchange, $symbol);
    }

    test_trades($exchange, $symbol);
}

function load_exchange($exchange) {
    $markets = $exchange->load_markets();
    $symbols = array_keys($markets);
    dump(green($exchange->id), green(count($symbols)), 'symbols:', implode(', ', $symbols));
}

function try_all_proxies($exchange, $proxies) {
    $current_proxy = 0;
    $max_retries = count($proxies);

    // a special case for ccex
    if ($exchange->id == 'ccex') {
        $currentProxy = 1;
    }

    for ($i = 0; $i < $max_retries; $i++) {
        try {
            $exchange->proxy = $proxies[$current_proxy];

            // add random origin to proxied requests
            if (strlen($exchange->proxy) > 0) {
                $exchange->origin = $exchange->uuid();
            }

            $current_proxy = (++$current_proxy) % count($proxies);

            load_exchange($exchange);
            test_exchange($exchange);
            break;
        } catch (\ccxt\RequestTimeout $e) {
            dump(yellow('[Timeout Error] ' . $e->getMessage() . ' (ignoring)'));
        } catch (\ccxt\DDoSProtection $e) {
            dump(yellow('[DDoS Protection Error] ' . $e->getMessage() . ' (ignoring)'));
        } catch (\ccxt\AuthenticationError $e) {
            dump(yellow('[Authentication Error] ' . $e->getMessage() . ' (ignoring)'));
        } catch (\ccxt\ExchangeNotAvailable $e) {
            dump(yellow('[Exchange Not Available] ' . $e->getMessage() . ' (ignoring)'));
        } catch (\ccxt\NotSupported $e) {
            dump(yellow('[Not Supported] ' . $e->getMessage() . ' (ignoring)'));
        } catch (\ccxt\NetworkError $e) {
            dump(yellow('[Network Error] ' . $e->getMessage() . ' (ignoring)'));
        } catch (\ccxt\ExchangeError $e) {
            dump(yellow('[Exchange Error] ' . $e->getMessage() . ' (ignoring)'));
        } catch (Exception $e) {
            dump(red('[Error] ' . $e->getMessage()));
        }
    }
}

function test_exchange($exchange) {
    $delay = $exchange->rateLimit * 1000;

    $symbol = is_array($exchange->symbols) ? current($exchange->symbols) : '';
    $symbols = array(
        'BTC/USD',
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

    if (strpos($symbol, '.d') === false) {
        dump(green('SYMBOL:'), green($symbol));

        test_symbol($exchange, $symbol);
    }

    // usleep ($delay);
    // $trades = $exchange->fetch_trades (array_keys ($markets)[0]);
    // var_dump ($trades);

    if ((!$exchange->apiKey) or (strlen($exchange->apiKey) < 1)) {
        return;
    }

    usleep($delay);

    $balance = $exchange->fetch_balance();
    print_r($balance);

    // $exchange->verbose = true;
    // $order = $exchange->create_market_buy_order ('LTC/BTC', 0.1);
    // var_dump ($order);
    // print_r ($order);
}

$proxies = array(
    '',
    'https://cors-anywhere.herokuapp.com/',
    // 'https://crossorigin.me/',
);


*/







