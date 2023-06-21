<?php

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set('UTC');

$exchange = new \ccxt\gateio(array(
    'apiKey' => 'YOUR_API_KEY', // ←------------ replace with your keys
    'secret' => 'YOUR_SECRET_KEY',
    'options' => array(
        'defaultType' => 'swap',
    ),
    // 'verbose' => true, // uncomment if debug output is needed
));

// Example 1: Creating and canceling a linear future (limit) order
try {
    $markets = $exchange->load_markets ();
    $symbol = 'LTC/USDT:USDT';
    $type = 'limit';
    $side = 'buy';
    $amount = 1;
    $price = 55;

    // placing an order
    $order = $exchange->create_order ($symbol, $type, $side, $amount, $price);
    var_dump ($order);

    // listing open orders
    $open_orders = $exchange->fetch_open_orders($symbol);
    var_dump($open_orders);

    // cancel order
    $cancel = $exchange->cancel_order ($order['id'], $symbol);
    var_dump ($cancel);

} catch (\ccxt\NetworkError $e) {
    echo '[Network Error] ' . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo '[Error] ' . $e->getMessage() . "\n";
}

// Example 2: Creating and canceling a linear future (stop-limit) order with leverage
try {
    $markets = $exchange->load_markets ();
    $symbol = 'LTC/USDT:USDT';
    $type = 'limit';
    $side = 'buy';
    $amount = 1;
    $price = 55;
    $stop_price = 130;

    $params = array (
        'stopPrice' => $stop_price,
    );

    // set leverage
    $leverage = $exchange->set_leverage(3, $symbol);
    var_dump($leverage);

    // placing an order
    $order = $exchange->create_order ($symbol, $type, $side, $amount, $price, $params);
    var_dump ($order);

    // listing open orders
    $open_orders = $exchange->fetch_open_orders($symbol);
    // var_dump($open_orders);

    // cancel order
    $cancelParams = array (
        'isStop' => true,
    );
    $cancel = $exchange->cancel_order ($order['id'], $symbol, $cancelParams);
    var_dump ($cancel);

    // reset leverage
    $leverage = $exchange->set_leverage(1, $symbol);
    var_dump($leverage);

} catch (\ccxt\NetworkError $e) {
    echo '[Network Error] ' . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo '[Error] ' . $e->getMessage() . "\n";
}
?>
