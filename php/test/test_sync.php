<?php

namespace ccxt;
error_reporting(E_ALL | E_STRICT);
date_default_timezone_set('UTC');

include_once 'vendor/autoload.php';
include_once 'test_trade.php';
include_once 'test_order.php';
include_once 'test_ohlcv.php';
include_once 'test_position.php';
include_once 'test_transaction.php';
include_once 'test_account.php';

use React\Async;

function style($s, $style) {
    return $style . $s . "\033[0m";
}
function green($s) {
    return style($s, "\033[92m");
}
function blue($s) {
    return style($s, "\033[94m");
}
function yellow($s) {
    return style($s, "\033[93m");
}
function red($s) {
    return style($s, "\033[91m");
}
function pink($s) {
    return style($s, "\033[95m");
}
function bold($s) {
    return style($s, "\033[1m");
}
function underline($s) {
    return style($s, "\033[4m");
}
function dump($s) {
    echo implode(' ', func_get_args()) . "\n";
}

ini_set('memory_limit', '512M');

$exchanges = null;

// $shortopts = '';
// $longopts = array (
//     "nonce::", // '::' means optional, ':' means required
// );

// $options = getopt ($shortopts, $longopts);
// var_dump ($options);
// exit ();

# first we filter the args
$verbose = count(array_filter($argv, function ($option) { return strstr($option, '--verbose') !== false; })) > 0;
$args = array_values(array_filter($argv, function ($option) { return strstr($option, '--verbose') === false; }));

//-----------------------------------------------------------------------------

foreach (Exchange::$exchanges as $id) {
    $exchange = '\\ccxt\\' . $id;
    $exchanges[$id] = new $exchange();
}

$keys_global = './keys.json';
$keys_local = './keys.local.json';
$keys_file = file_exists($keys_local) ? $keys_local : $keys_global;

var_dump($keys_file);

$config = json_decode(file_get_contents($keys_file), true);

foreach ($config as $id => $params) {
    foreach ($params as $key => $value) {
        if (array_key_exists($id, $exchanges)) {
            if (property_exists($exchanges[$id], $key)) {
                $exchanges[$id]->$key = is_array($exchanges[$id]->$key) ? array_replace_recursive($exchanges[$id]->$key, $value) : $value;
            }
        }
    }
}

$exchanges['coinbasepro']->urls['api'] = $exchanges['coinbasepro']->urls['test'];

function test_ticker($exchange, $symbol) {
    $method = 'fetchTicker';
    if ($exchange->has[$method]) {
        dump(green($exchange->id), green($symbol), 'executing ' . $method . '()');
        $ticker = $exchange->{$method}($symbol);
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

function test_order_book($exchange, $symbol) {
    $method = 'fetchOrderBook';
    if ($exchange->has[$method]) {
        dump(green($exchange->id), green($symbol), 'executing ' . $method . '()');
        $orderbook = $exchange->{$method}($symbol);
        dump(green($exchange->id), green($symbol), 'order book:', implode(' ', array(
            $orderbook['datetime'],
            'bid: '       . @$orderbook['bids'][0][0],
            'bidVolume: ' . @$orderbook['bids'][0][1],
            'ask: '       . @$orderbook['asks'][0][0],
            'askVolume: ' . @$orderbook['asks'][0][1])));
    } else {
        dump(green($symbol), $method . '() is not supported');
    }
}

//-----------------------------------------------------------------------------

function test_trades($exchange, $symbol) {
    $method = 'fetchTrades';
    if ($exchange->has[$method]) {
        dump(green($exchange->id), green($symbol), 'executing ' . $method . '()');
        $trades = $exchange->{$method}($symbol);
        if (count($trades) > 0) {
            test_trade($exchange, $trades[0], $symbol, time() * 1000);
        }
        dump(green($symbol), 'fetched', green(count($trades)), 'trades');
    } else {
        dump(green($symbol), $method . '() is not supported');
    }
}

//-----------------------------------------------------------------------------

function test_orders($exchange, $symbol) {
    $method = 'fetchOrders';
    if ($exchange->has[$method]) {
        $skipped_exchanges = array (
            'bitmart',
            'rightbtc',
        );
        if (in_array($exchange->id, $skipped_exchanges)) {
            dump(green($symbol), $method . '() skipped');
            return;
        }
        dump(green($exchange->id), green($symbol), 'executing ' . $method . '()');
        $orders = $exchange->{$method}($symbol);
        foreach ($orders as $order) {
            test_order($exchange, $order, $symbol, time() * 1000);
        }
        dump(green($symbol), 'fetched', green(count($orders)), 'orders');
    } else {
        dump(green($symbol), $method . '() is not supported');
    }
}

//-----------------------------------------------------------------------------

function test_positions($exchange, $symbol) {
    $method = 'fetchPositions';
    if ($exchange->has[$method]) {
        $skipped_exchanges = array (
        );
        if (in_array($exchange->id, $skipped_exchanges)) {
            dump(green($symbol), $method . '() skipped');
            return;
        }

        // without symbol
        dump(green($exchange->id), 'executing ' . $method . '()');
        $positions = $exchange->{$method}();
        foreach ($positions as $position) {
            test_position($exchange, $position, null, time() * 1000);
        }
        dump(green($symbol), 'fetched', green(count($positions)), 'positions');

        // with symbol
        dump(green($exchange->id), green($symbol), 'executing ' . $method . '()');
        $positions = $exchange->{$method}(array($symbol));
        foreach ($positions as $position) {
            test_position($exchange, $position, $symbol, time() * 1000);
        }
        dump(green($symbol), 'fetched', green(count($positions)), 'positions');
    } else {
        dump(green($symbol), $method . '() is not supported');
    }
}

//-----------------------------------------------------------------------------


function test_closed_orders($exchange, $symbol) {
    $method = 'fetchClosedOrders';
    if ($exchange->has[$method]) {
        dump(green($exchange->id), green($symbol), 'executing ' . $method . '()');
        $orders = $exchange->{$method}($symbol);
        foreach ($orders as $order) {
            test_order($exchange, $order, $symbol, time() * 1000);
            assert($order['status'] === 'closed' || $order['status'] === 'canceled');
        }
        dump(green($symbol), 'fetched', green(count($orders)), 'closed orders');
    } else {
        dump(green($symbol), $method . '() is not supported');
    }
}

//-----------------------------------------------------------------------------

function test_open_orders($exchange, $symbol) {
    $method = 'fetchOpenOrders';
    if ($exchange->has[$method]) {
        dump(green($exchange->id), green($symbol), 'executing ' . $method . '()');
        $orders = $exchange->{$method}($symbol);
        foreach ($orders as $order) {
            test_order($exchange, $order, $symbol, time() * 1000);
            assert($order['status'] === 'open');
        }
        dump(green($symbol), 'fetched', green(count($orders)), 'open orders');
    } else {
        dump(green($symbol), $method . '() is not supported');
    }
}

//-----------------------------------------------------------------------------

function test_transactions($exchange, $code) {
    $method = 'fetchTransactions';
    if ($exchange->has[$method]) {
        dump(green($exchange->id), green($code), 'executing ' . $method . '()');
        $transactions = $exchange->{$method}($code);
        foreach ($transactions as $transaction) {
            test_transaction($exchange, $transaction, $code, time() * 1000);
        }
        dump(green($code), 'fetched', green(count($transactions)), 'transactions');
    } else {
        dump(green($code), $method . '() is not supported');
    }
}

//-----------------------------------------------------------------------------

function test_ohlcvs($exchange, $symbol) {
    $ignored_exchanges = array(
        'cex',
        'okex',
        'okexusd',
    );
    if (in_array($exchange->id, $ignored_exchanges)) {
        return;
    }
    $method = 'fetchOHLCV';
    if ($exchange->has[$method]) {
        $timeframes = $exchange->timeframes ? $exchange->timeframes : array('1d' => '1d');
        $exchange_has_one_minute_timeframe = array_key_exists('1m', $timeframes);
        $timeframe = $exchange_has_one_minute_timeframe ? '1m' : array_keys($timeframes)[0];
        $limit = 10;
        $duration = $exchange->parse_timeframe($timeframe);
        $since = $exchange->milliseconds() - $duration * $limit * 1000 - 1000;
        dump(green($exchange->id), green($symbol), 'testing ' . $method . '()');
        $ohlcvs = $exchange->{$method}($symbol, $timeframe, $since, $limit);
        foreach ($ohlcvs as $ohlcv) {
            test_ohlcv($exchange, $ohlcv, $symbol, time() * 1000);
        }
        dump(green($symbol), 'fetched', green(count($ohlcvs)), 'ohlcvs');
    } else {
        dump(green($symbol), 'fetchOHLCV() is not supported');
    }
}

//-----------------------------------------------------------------------------

function test_symbol($exchange, $symbol, $code) {
    $method = 'fetchTicker';
    if ($exchange->has[$method]) {
        test_ticker($exchange, $symbol);
    }
    test_order_book($exchange, $symbol);
    test_trades($exchange, $symbol);
    test_ohlcvs($exchange, $symbol);
    if ($exchange->check_required_credentials(false)) {
        if ($exchange->has['signIn']) {
            $exchange->sign_in();
        }
        test_orders($exchange, $symbol);
        test_closed_orders($exchange, $symbol);
        test_open_orders($exchange, $symbol);
        test_transactions($exchange, $code);
        $balance = $exchange->fetch_balance();
        var_dump($balance);
    }
}

//-----------------------------------------------------------------------------

function test_accounts($exchange) {
    $method = 'fetchAccounts';
    if ($exchange->has[$method]) {
        dump(green($exchange->id), 'executing ' . $method . '()');
        $accounts = $exchange->{$method}();
        foreach ($accounts as $account) {
            test_account($exchange, $account, $method);
        }
        dump(green($exchange->id), 'fetched', green(count($accounts)), 'accounts');
    } else {
        dump(green($exchange->id), $method . '() is not supported');
    }
}

function load_exchange($exchange) {
    global $verbose;
    $markets = $exchange->load_markets();
    $exchange->verbose = $verbose;
    // $exchange->verbose = true;
    $symbols = array_keys($markets);
    dump(green($exchange->id), green(count($symbols)), 'symbols:', implode(', ', $symbols));
}

function try_all_proxies($exchange, $proxies) {

    $index = array_search($exchange->proxy, $proxies);
    $current_proxy = ($index >= 0) ? $index : 0;
    $max_retries = count($proxies);

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

function get_test_code($exchange, $codes) {
    $code = $codes[0];
    for ($i = 0; $i < count($codes); $i++) {
        if (array_key_exists($codes[$i], $exchange->currencies)) {
            $code = $codes[$i];
        }
    }
    return $code;
}

$common_codes = array(
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

$common_symbols = array(
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
    'EUR/USD',
);

function get_test_symbol_and_code($exchange, $symbols, $codes) {

    $code = get_test_code($exchange, $codes);

    $symbol = get_test_symbol($exchange, $symbols);

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

    return array($symbol, $code);
}

function test_exchange($exchange) {

    global $common_symbols, $common_codes;

    list($symbol, $code) = get_test_symbol_and_code($exchange, $common_symbols, $common_codes);

    if (strpos($symbol, '.d') === false) {
        dump(green('SYMBOL:'), green($symbol));
        dump(green('CODE:'), green($code));
        test_symbol($exchange, $symbol, $code);
    }

    test_accounts($exchange);
}

$proxies = array(
    '',
    'https://cors-anywhere.herokuapp.com/',
);

$main = function() use ($args, $exchanges, $proxies, $config, $common_codes) {
    if (count($args) > 1) {
        if ($exchanges[$args[1]]) {
            $id = $args[1];
            $exchange = $exchanges[$id];

            $exchange_config = $exchange->safe_value($config, $id, array());
            $skip = $exchange->safe_value($exchange_config, 'skip', false);
            if ($skip) {
                dump(red('[Skipped] ' . $id));
                exit();
            }
            $alias = $exchange->alias;
            if ($alias) {
                dump(red('[Skipped alias] ' . $id));
                exit();
            }

            dump(green('EXCHANGE:'), green($exchange->id));

            if (count($args) > 2) {
                load_exchange($exchange);
                $code = get_test_code($exchange, $common_codes);
                test_symbol($exchange, $args[2], $code);
            } else {
                try_all_proxies($exchange, $proxies);
            }
        } else {
            echo $args[1] . " not found.\n";
        }
    } else {
        foreach ($exchanges as $id => $exchange) {
            try_all_proxies($exchange, $proxies);
        }
    }
};

$promise = $main();
$promise;
