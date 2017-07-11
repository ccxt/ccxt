<?php

date_default_timezone_set ('UTC');

include 'ccxt.php';

$markets = null;
$verbose = false;

if (file_exists ('config.php'))

    include 'config.php';

else

    $markets = array ();

//-----------------------------------------------------------------------------

foreach (\ccxt\Market::$markets as $id) {
    $market = '\\ccxt\\' . $id;
    $markets[$id] = new $market (array ('verbose' => $verbose, 'proxy' => 'https://crossorigin.me/'));
}

function test_market ($market) {

    $delay = 3 * 1000000;

    echo "-----------------------------------------------------------------\n";
    // echo $market->id . "\n";
    $products = $market->load_products ();
    
    // echo $market->id . " products:\n";
    // var_dump ($products);

    $symbols = array_keys ($products);
    
    echo $market->id . ' ' . count ($symbols) . " symbols: " . implode (", ", $symbols) . "\n";

    foreach ($symbols as $symbol) {
        if (strpos ($symbol, '.d') === false) {
            
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
    }

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
    
        $market = $markets[$argv[1]];
        test_market ($market);
    
    } else {
    
        echo $argv[1] + " not found.\n";
    }

} else {

    foreach ($markets as $id => $market) {
    
        try {
    
            test_market ($market);  
    
        } catch (Exception $e) {
    
            var_dump ($e->getMessage ());
            break;
        }
    }

}

?>