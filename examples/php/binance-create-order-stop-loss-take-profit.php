<?php

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set('UTC');

echo 'PHP v' . PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION . '.' . PHP_RELEASE_VERSION . "\n";
echo 'CCXT v' . \ccxt\Exchange::VERSION . "\n";

$id = 'binanceusdm'; // edit this line

// ----------------------------------------------------------------------------

// instantiate the exchange by id
$exchange_class = '\\ccxt\\' . $id;
$exchange = new $exchange_class(array(
    // some exchanges may require additional API credentials
    'apiKey' => 'YOUR_API_KEY', // edit this line
    'secret' => 'YOUR_SECRET', // edit this line
));

$exchange->load_markets();
// $exchange->verbose = True; // uncomment for debugging purposes

$symbol = 'BTC/USDT';
$side = 'buy';
$amount = 0.01;
$stopPrice = 25000;
$takeProfitPrice = 35000;

try {

    $order = $exchange->create_order($symbol, 'MARKET', $side, $amount);
    print_r($order);

    $inverted_side = ($side == 'buy') ? 'sell' : 'buy';

    $stopLossParams = array('stopPrice' => $stopLossPrice);
    $stopLossOrder = $exchange->create_order($symbol, 'STOP_MARKET', $inverted_side, $amount, null, $stopLossParams);
    print_r($stopLossOrder);

    $takeProfitParams = array('stopPrice' => $takeProfitPrice);
    $takeProfitOrder = $exchange->create_order($symbol, 'TAKE_PROFIT_MARKET', $inverted_side , $amount, null, $takeProfitParams);
    print_r($takeProfitOrder);

} catch (Exception $e) {
    echo get_class($e) . ': ' . $e->getMessage() . "\n";
}

