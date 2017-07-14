<?php

date_default_timezone_set ('UTC');

include 'ccxt.php';
include 'Console/Table.php';

date_default_timezone_set ('UTC');

function style ($s, $style) { return $style . $s . "\033[0m"; }
function green     ($s) { return style ($s, "\033[92m"); }
function blue      ($s) { return style ($s, "\033[94m"); }
function yellow    ($s) { return style ($s, "\033[93m"); }
function red       ($s) { return style ($s, "\033[91m"); }
function pink      ($s) { return style ($s, "\033[95m"); }
function bold      ($s) { return style ($s, "\033[1m"); }
function underline ($s) { return style ($s, "\033[4m"); }
function dump ($s) { echo implode (' ', func_get_args ()) . "\n"; }

$markets = null;

if (file_exists ('config.php'))
    include 'config.php';
else
    $markets = array ();

//-----------------------------------------------------------------------------

foreach (\ccxt\Market::$markets as $id) {
    $market = '\\ccxt\\' . $id;
    $markets[$id] = new $market (array (
        'verbose' => false,
        // 'proxy' => 'https://crossorigin.me/',
        // 'proxy' => 'https://cors-anywhere.herokuapp.com/',
        // 'proxy' => 'http://cors-proxy.htmldriven.com/?url=',
    ));
}

$markets['_1broker']->apiKey = 'A0f79063a5e91e6d62fbcbbbbdd63258';

$markets['xbtce']->uid    = '68ef0552-3c37-4896-ba56-76173d9cd573';
$markets['xbtce']->apiKey = 'dK2jBXMTppAM57ZJ';
$markets['xbtce']->secret = 'qGNTrzs3d956DZKSRnPPJ5nrQJCwetAnh7cR6Mkj5E4eRQyMKwKqH7ywsxcR78WT';

$markets['coinspot']->apiKey = '36b5803f892fe97ccd0b22da79ce6b21';
$markets['coinspot']->secret = 'QGWL9ADB3JEQ7W48E8A3KTQQ42V2P821LQRJW3UU424ATYPXF893RR4THKE9DT0RBNHKX8L54F35KBVFH';

// $markets['bitmex']->proxy   = ''; // bitmex doesn't like proxies
// $markets['btcx']->proxy     = ''; // btcx doesn't like Origin: * any more
// $markets['_1broker']->proxy = ''; // _1broker doesn't like it either
// $markets['_1btcxe']->proxy  = ''; // _1btcxe doesn't like it either
// $markets['huobi']->proxy    = ''; // huobi doesn't like it either

function test_market_symbol_ticker ($market, $symbol) { 
    $ticker = $market->fetch_ticker ($symbol);
    echo implode (' ', array ($market->id, $symbol, 'ticker',
        $ticker['datetime'],
        'high: '    . $ticker['high'],
        'low: '     . $ticker['low'],
        'bid: '     . $ticker['bid'],
        'ask: '     . $ticker['ask'],
        'volume: '  . $ticker['quoteVolume'])) . "\n";
}

function test_market_symbol_orderbook ($market, $symbol) {
    $orderbook = $market->fetch_order_book ($symbol);
    echo implode (' ', array ($market->id, $symbol, 'order book',
        $orderbook['datetime'],
        'bid: '       . @$orderbook['bids'][0][0],
        'bidVolume: ' . @$orderbook['bids'][0][1],
        'ask: '       . @$orderbook['asks'][0][0],
        'askVolume: ' . @$orderbook['asks'][0][1])) . "\n";
}

function test_market_symbol ($market, $symbol) {
    $delay = $market->rateLimit * 1000;
    usleep ($delay);
    test_market_symbol_ticker ($market, $symbol);
    usleep ($delay);
    test_market_symbol_orderbook ($market, $symbol);
}

function load_market ($market) {

    $products = $market->load_products ();
    $symbols = array_keys ($products);    
    echo $market->id . ' ' . count ($symbols) . " symbols: " . implode (", ", $symbols) . "\n";
}

function test_market ($market) {

    $keys = array_keys ($market->products);
    $delay = $market->rateLimit * 1000;

    $symbol = $keys[0];
    $symbols = array (
        'BTC/USD',
        'BTC/CNY',
        'BTC/ETH',
        'ETH/BTC',
        'BTC/JPY',
        'LTC/BTC',
    );

    foreach ($symbols as $s) {
        if (in_array ($s, $keys))
            $symbol = $s;
    }

    if (strpos ($symbol, '.d') === false)
        test_market_symbol ($market, $symbol);

    // usleep ($delay);
    // $trades = $market->fetch_trades (array_keys ($products)[0]);
    // var_dump ($trades);

    if ((!$market->apiKey) or (strlen ($market->apiKey) < 1))
        return;

    usleep ($delay);

    $balance = $market->fetch_balance ();
    var_dump ($balance);
}

if (count ($argv) > 1) {
    
    if ($markets[$argv[1]]) {
    
        $id = $argv[1];
        $market = $markets[$id];
        load_market ($market);

        if (count ($argv) > 2) {
            test_market_symbol ($market, $argv[2]);
        }
        else 
            test_market ($market);

    } else {
    
        echo $argv[1] + " not found.\n";
    }

} else {

    foreach ($markets as $id => $market) {
    
        try {
    
            load_market ($market);
            test_market ($market);  
    
        } catch (\ccxt\DDoSProtectionError $e) {
    
            dump (yellow ($e->getMesage ())); 
        }
    }

}

?>