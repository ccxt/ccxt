<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set ('UTC');

$exchange = new \ccxt\huobipro (array (
    'apiKey' => 'ez2xc4vb6n-da8c4c7d-76cbde5b-7cc77', // ←------------ replace with your keys
    'secret' => '03454cfd-cf15e71b-fe87eadf-16a79',
    // 'verbose' => true, // uncomment if debug output is needed
));

try {

    $markets = $exchange->load_markets ();

    // Example: Creating/cancelling a linear swap (limit) order 
    $symbol = 'ADA/USDT:USDT';
    $order_type = 'limit';
    $side = 'buy';
    $offset = 'open';
    $cli_order_id = random_int (0,100);
    $leverage = 1;
    $amount = 1;
    $price = 1;

    $params = array (
        'offset' => $offset,
        'lever_rate' => $leverage,
        'client_order_id' => $cli_order_id
    );

    $order = $exchange->create_order($symbol, $order_type, $side, $amount, $price, $params);
    var_dump($order['id']);

} catch (\ccxt\NetworkError $e) {
    echo '[Network Error] ' . $e->getMessage () . "\n";
} catch (\ccxt\ExchangeError $e) {
    echo '[Exchange Error] ' . $e->getMessage () . "\n";
} catch (Exception $e) {
    echo '[Error] ' . $e->getMessage () . "\n";
}

?>
