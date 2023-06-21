<?php

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set('UTC');

$exchange = new \ccxt\binance (array(
    'apiKey' => 'YOUR_API_KEY', // change for your keys
    'secret' => 'YOUR_API_SECRET',
));

$message = null;

try {

    $exchange->load_markets();

    $exchange->verbose = true; // uncomment for debugging purposes

    // adjust your values below

    $symbol = 'BTC/USDT';
    $order_type = 'limit';
    $side = 'sell';
    $amount = 0.123; // adjust for your amount
    $price = 50000; // adjust for your price (for limit orders)

    $result = $exchange->create_order ($symbol, $order_type, $side, $amount, $price);
    var_dump ($result);

} catch (Exception $e) {

    echo get_class($e) . ': ' . $e->getMessage() . "\n";
}

?>
