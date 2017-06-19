<?php

include 'ccxt.php';

$markets = null;
try {

    include 'config.php';
    // $markets = \config\$markets;

} catch (Exception $e) {

    $markets = array (
        '_1broker'   => array ('apiKey' => '', 'token' => '', ),
        '_1btcxe'    => array ('apiKey' => '', 'secret' => '', ),
        'bit2c'      => array ('apiKey' => '', 'secret' => '', ),
        'bitbay'     => array ('apiKey' => '', 'secret' => '', ),
        'bitcoid'    => array ('apiKey' => '', 'secret' => '', ),
        'bitfinex'   => array ('apiKey' => '', 'secret' => '', ),
        'bitlish'    => array ('apiKey' => '', 'login' => '', 'password' => '', ),
        'bitmarket'  => array ('apiKey' => '', 'secret' => '', ),
        'bitmex'     => array ('apiKey' => '', 'secret' => '', ),
        'bitso'      => array ('apiKey' => '', 'secret' => '', ),
        'bittrex'    => array ('apiKey' => '', 'secret' => '', ),
        'btcx'       => array ('apiKey' => '', 'secret' => '', ),
        'bxinth'     => array ('apiKey' => '', 'secret' => '', ),
        'ccex'       => array ('apiKey' => '', 'secret' => '', ),
        'cex'        => array ('apiKey' => '', 'secret' => '', 'uid' => '', ),
        'coincheck'  => array ('apiKey' => '', 'secret' => '', ),
        'coinsecure' => array ('apiKey' => '', ),
        'exmo'       => array ('apiKey' => '', 'secret' => '', ),
        'fybse'      => array ('apiKey' => '', 'secret' => '', ),
        'fybsg'      => array ('apiKey' => '', 'secret' => '', ),
        'hitbtc'     => array ('apiKey' => '', 'secret' => '', ),
        'huobi'      => array ('apiKey' => '', 'secret' => '', ),
        'jubi'       => array ('apiKey' => '', 'secret' => '', ),
        'kraken'     => array ('apiKey' => '', 'secret' => '', ),
        'luno'       => array ('apiKey' => '', 'secret' => '', ),
        'okcoinusd'  => array ('apiKey' => '', 'secret' => '', ),
        'okcoincny'  => array ('apiKey' => '', 'secret' => '', ),
        'poloniex'   => array ('apiKey' => '', 'secret' => '', ),
        'quadrigacx' => array ('apiKey' => '', 'secret' => '', 'uid' => '', ),
        'quoine'     => array ('apiKey' => '', 'secret' => '', ),
        'therock'    => array ('apiKey' => '', 'secret' => '', ),
        'vaultoro'   => array ('apiKey' => '', 'secret' => '', ),
        'virwox'     => array ('apiKey' => '', 'login' => '', 'password' => '', ),
        'yobit'      => array ('apiKey' => '', 'secret' => '', ),
        'zaif'       => array ('apiKey' => '', 'secret' => '', ),
    );
}

//-----------------------------------------------------------------------------

$verbose = false;

foreach ($markets as $id => $params) {
    $market = '\\ccxt\\' . $id;
    $markets[$id] = new $market (array_merge (array (
        'id'      => $id,
        'verbose' => $verbose,
    ), $params));
}

function test_market ($market) {

    $delay = 3 * 1000000;

    echo "-----------------------------------------------------------------\n";
    // echo $market->id . "\n";
    $products = $market->load_products ();
    
    // echo $market->id . " products:\n";
    // var_dump ($products);
    
    echo $market->id . " symbols:\n" . implode (", ", array_keys ($products)) . "\n";

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

    // $balance = $market->fetch_balance ();
    // var_dump ($balance);

    // usleep ($delay);
}

foreach ($markets as $id => $market) {
    try {
        test_market ($market);  
    } catch (Exception $e) {
        var_dump ($e->getMessage ());
        break;
    }
}

// $market = $markets['_1broker'];
// test_market ($market);

?>