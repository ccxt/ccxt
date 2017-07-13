<?php

date_default_timezone_set ('UTC');

include 'ccxt.php';

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
    ));
}

$markets['_1broker']->apiKey = 'A0f79063a5e91e6d62fbcbbbbdd63258';
$markets['xbtce']->uid = '68ef0552-3c37-4896-ba56-76173d9cd573';
$markets['xbtce']->apiKey = 'dK2jBXMTppAM57ZJ';
$markets['xbtce']->secret = 'qGNTrzs3d956DZKSRnPPJ5nrQJCwetAnh7cR6Mkj5E4eRQyMKwKqH7ywsxcR78WT';

function test_market_symbol ($market, $symbol) {
    $delay = $market->rateLimit * 1000;
    usleep ($delay);
    $ticker = $market->fetch_ticker ($symbol);
    echo implode (' ', array ($market->id, $symbol, 'ticker',
        $ticker['datetime'],
        'high: '    . $ticker['high'],
        'low: '     . $ticker['low'],
        'bid: '     . $ticker['bid'],
        'ask: '     . $ticker['ask'],
        'volume: '  . $ticker['quoteVolume'])) . "\n";
    
    usleep ($delay);
    $orderbook = $market->fetch_order_book ($symbol);
    echo implode (' ', array ($market->id, $symbol, 'order book',
        $orderbook['datetime'],
        'bid: '       . @$orderbook['bids'][0][0],
        'bidVolume: ' . @$orderbook['bids'][0][1],
        'ask: '       . @$orderbook['asks'][0][0],
        'askVolume: ' . @$orderbook['asks'][0][1])) . "\n";

}

function load_market ($market) {

    $products = $market->load_products ();
    $symbols = array_keys ($products);    
    echo $market->id . ' ' . count ($symbols) . " symbols: " . implode (", ", $symbols) . "\n";
}

function test_market ($market) {

    $symbols = array_keys ($market->products);
    $delay = $market->rateLimit * 1000;

    foreach ($symbols as $symbol)
        if (strpos ($symbol, '.d') === false)
            test_market_symbol ($market, $symbol);

    // usleep ($delay);

    // $orderbook = $market->fetch_order_book (array_keys ($products)[0]);
    // var_dump ($orderbook);

    // usleep ($delay);

    // $trades = $market->fetch_trades (array_keys ($products)[0]);
    // var_dump ($trades);

    // usleep ($delay);

    // $ticker = $market->fetch_ticker (array_keys ($products)[0]);
    // $ticker = $market->fetch_ticker ('BTC/USD');
    // var_dump ($ticker);

    // usleep ($delay);

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
    
        } catch (Exception $e) {
    
            var_dump ($e->getMessage ());
            break;
        }
    }

}

?>