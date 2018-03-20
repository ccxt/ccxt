<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set ('UTC');

$exchange = new \ccxt\binance (array (
    'apiKey' => 'YOUR_API_KEY', // ←------------ replace with your keys
    'secret' => 'YOUR_SECRET',
    'verbose' => true,
));

try {

    $orderId = 'xxxxxxxx'; // ←--------- replace with your order id
    $symbol = 'XRP/BTC'; // ←--------- replace with your symbol

    $exchange->cancelOrder ($orderId, $symbol);

} catch (\ccxt\NetworkError $e) {
    echo '[Network Error] ' . $e->getMessage () . "\n";
} catch (\ccxt\ExchangeError $e) {
    echo '[Exchange Error] ' . $e->getMessage () . "\n";
} catch (Exception $e) {
    echo '[Error] ' . $e->getMessage () . "\n";
}

?>