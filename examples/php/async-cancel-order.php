<?php

error_reporting(E_ALL | E_STRICT);
date_default_timezone_set('UTC');
require_once 'vendor/autoload.php';

echo "CCXT v." . \ccxtpro\Exchange::VERSION . "\n";

$id = 'binance';
$exchange_class = '\\ccxtpro\\' . $id;
$exchange = new $exchange_class(array(
    'enableRateLimit' => true,
    'apiKey' => 'YOUR_API_KEY',
    'secret' => 'YOUR_SECRET',
));

$id = 'YOUR_ORDER_ID';
$symbols = array('BTC/USDT');

function loop($exchange, $symbol) {
    $markets = yield $exchange->load_markets();
    $response = yield $exchange->cancel_order($symbol);
    print_r($response);
};

$kernel = $exchange::get_kernel();
foreach ($symbols as $symbol) {
    $kernel->execute(loop($exchange, $id, $symbol));
}

$kernel->run();
