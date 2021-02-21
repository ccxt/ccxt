<?php

namespace ccxt;
error_reporting(E_ALL | E_STRICT);
date_default_timezone_set('UTC');

include_once 'vendor/autoload.php';
include_once 'test_trade.php';
include_once 'test_order.php';
include_once 'test_ohlcv.php';
include_once 'test_transaction.php';

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

//-----------------------------------------------------------------------------

foreach (Exchange::$exchanges as $id) {
    $exchange = '\\ccxt\\async\\' . $id;
    $exchanges[$id] = new $exchange(array('enableRateLimit' => true));
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
    dump(green($exchange->id), green($symbol), 'fetching ticker...');
    $ticker = yield $exchange->fetch_ticker($symbol);
    dump(green($exchange->id), green($symbol), 'ticker:', implode(' ', array(
        $ticker['datetime'],
        'high: ' . $ticker['high'],
        'low: ' . $ticker['low'],
        'bid: ' . $ticker['bid'],
        'ask: ' . $ticker['ask'],
        'volume: ' . $ticker['quoteVolume'], )));
}

function test_order_book($exchange, $symbol) {
    dump(green($exchange->id), green($symbol), 'fetching order book...');
    $orderbook = yield $exchange->fetch_order_book($symbol);
    dump(green($exchange->id), green($symbol), 'order book:', implode(' ', array(
        $orderbook['datetime'],
        'bid: '       . @$orderbook['bids'][0][0],
        'bidVolume: ' . @$orderbook['bids'][0][1],
        'ask: '       . @$orderbook['asks'][0][0],
        'askVolume: ' . @$orderbook['asks'][0][1])));
}

//-----------------------------------------------------------------------------

function test_trades($exchange, $symbol) {
    if ($exchange->has['fetchTrades']) {

        dump(green($symbol), 'fetching trades...');
        $trades = yield $exchange->fetch_trades($symbol);
        if (count($trades) > 0) {
            test_trade($exchange, $trades[0], $symbol, time() * 1000);
        }
        dump(green($symbol), 'fetched', green(count($trades)), 'trades');
    } else {
        dump(green($symbol), 'fetchTrades() not supported');
    }
}

//-----------------------------------------------------------------------------

function test_orders($exchange, $symbol) {
    if ($exchange->has['fetchOrders']) {
        $skipped_exchanges = array (
            'bitmart',
            'rightbtc',
        );
        if (in_array($exchange->id, $skipped_exchanges)) {
            dump(green($symbol), 'fetch_orders() skipped');
            return;
        }
        dump(green($symbol), 'fetching orders...');
        $orders = yield $exchange->fetch_orders($symbol);
        foreach ($orders as $order) {
            test_order($exchange, $order, $symbol, time() * 1000);
        }
        dump(green($symbol), 'fetched', green(count($orders)), 'orders');
    } else {
        dump(green($symbol), 'fetchOrders() not supported');
    }
}

//-----------------------------------------------------------------------------

function test_closed_orders($exchange, $symbol) {
    if ($exchange->has['fetchClosedOrders']) {

        dump(green($symbol), 'fetching closed orders...');
        $orders = yield $exchange->fetch_closed_orders($symbol);
        foreach ($orders as $order) {
            test_order($exchange, $order, $symbol, time() * 1000);
            assert($order['status'] === 'closed' || $order['status'] === 'canceled');
        }
        dump(green($symbol), 'fetched', green(count($orders)), 'closed orders');
    } else {
        dump(green($symbol), 'fetchClosedOrders() not supported');
    }
}

//-----------------------------------------------------------------------------

function test_open_orders($exchange, $symbol) {
    if ($exchange->has['fetchOpenOrders']) {

        dump(green($symbol), 'fetching open orders...');
        $orders = yield $exchange->fetch_open_orders($symbol);
        foreach ($orders as $order) {
            test_order($exchange, $order, $symbol, time() * 1000);
            assert($order['status'] === 'open');
        }
        dump(green($symbol), 'fetched', green(count($orders)), 'open orders');
    } else {
        dump(green($symbol), 'fetchOpenOrders() not supported');
    }
}

//-----------------------------------------------------------------------------

function test_transactions($exchange, $code) {
    if ($exchange->has['fetchTransactions']) {

        dump(green($code), 'fetching transactions...');
        $transactions = yield $exchange->fetch_transactions($code);
        foreach ($transactions as $transaction) {
            test_transaction($exchange, $transaction, $code, time() * 1000);
        }
        dump(green($code), 'fetched', green(count($transactions)), 'transactions');
    } else {
        dump(green($code), 'fetchTransactions() not supported');
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
    if ($exchange->has['fetchOHLCV']) {

        $timeframes = $exchange->timeframes ? $exchange->timeframes : array('1d' => '1d');
        $timeframe = array_keys($timeframes)[0];
        $limit = 10;
        $duration = $exchange->parse_timeframe($timeframe);
        $since = $exchange->milliseconds() - $duration * $limit * 1000 - 1000;
        dump(green($symbol), 'fetching ohlcvs...');
        $ohlcvs = yield $exchange->fetch_ohlcv($symbol, $timeframe, $since, $limit);
        foreach ($ohlcvs as $ohlcv) {
            test_ohlcv($exchange, $ohlcv, $symbol, time() * 1000);
        }
        dump(green($symbol), 'fetched', green(count($ohlcvs)), 'ohlcvs');
    } else {
        dump(green($symbol), 'fetchOHLCV() not supported');
    }
}

//-----------------------------------------------------------------------------

function test_symbol($exchange, $symbol, $code) {
    if ($exchange->has['fetchTicker']) {
        test_ticker($exchange, $symbol);
    }
    if ($exchange->id === 'coinmarketcap') {
        dump(var_export(yield $exchange->fetchGlobal()));
    } else {
        yield test_order_book($exchange, $symbol);
        yield test_trades($exchange, $symbol);
        yield test_ohlcvs($exchange, $symbol);
        if ($exchange->check_required_credentials(false)) {
            if ($exchange->has['signIn']) {
                $exchange->sign_in();
            }
            test_orders($exchange, $symbol);
            test_closed_orders($exchange, $symbol);
            test_open_orders($exchange, $symbol);
            test_transactions($exchange, $code);
            $balance = yield $exchange->fetch_balance();
            var_dump($balance);
        }
    }
}

function load_exchange($exchange) {
    $markets = yield $exchange->load_markets();
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

            yield load_exchange($exchange);
            yield test_exchange($exchange);
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

    $symbol = is_array($exchange->symbols) ? current($exchange->symbols) : '';
    $symbols = array(
        'BTC/USD',
        'BTC/USDT',
        'BTC/CNY',
        'BTC/EUR',
        'BTC/ETH',
        'ETH/BTC',
        'ETH/USDT',
        'BTC/JPY',
        'LTC/BTC',
    );

    foreach ($symbols as $s) {
        if (in_array ($s, $exchange->symbols) && (array_key_exists ('active', $exchange->markets[$s]) ? $exchange->markets[$s]['active'] : true)) {
            $symbol = $s;
            break;
        }
    }

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

    if (strpos($symbol, '.d') === false) {
        dump(green('SYMBOL:'), green($symbol));
        dump(green('CODE:'), green($code));
        yield test_symbol($exchange, $symbol, $code);
    }
}

$proxies = array(
    '',
    'https://cors-anywhere.herokuapp.com/',
    // 'https://crossorigin.me/',
);

$main = function() use ($argv, $exchanges, $proxies, $config) {
    if (count($argv) > 1) {
        if ($exchanges[$argv[1]]) {
            $id = $argv[1];
            $exchange = $exchanges[$id];

            $exchange_config = $exchange->safe_value($config, $id, array());
            $skip = $exchange->safe_value($exchange_config, 'skip', false);
            if ($skip) {
                dump(red('[Skipped] ' . $id));
                exit();
            }

            dump(green('EXCHANGE:'), green($exchange->id));

            if (count($argv) > 2) {
                yield load_exchange($exchange);
                yield test_symbol($exchange, $argv[2]);
            } else {
                yield try_all_proxies($exchange, $proxies);
            }
        } else {
            echo $argv[1] . " not found.\n";
        }
    } else {
        foreach ($exchanges as $id => $exchange) {
            yield try_all_proxies($exchange, $proxies);
        }
    }
};

$kernel = async\Exchange::get_kernel();
$kernel->execute($main);
$kernel->run();
