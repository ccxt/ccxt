<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set ('UTC');

echo 'PHP v' . PHP_MAJOR_VERSION . '.' . PHP_MINOR_VERSION . '.' . PHP_RELEASE_VERSION . "\n";
echo 'CCXT v' . \ccxt\Exchange::VERSION . "\n";

$exchange = new \ccxt\bytetrade (array (
    'enableRateLimit' => true,
    // replace with your keys
    'apiKey' => 'YOUR_API_KEY',
    'secret' => 'YOUR_SECRET',
));

$exchange->load_markets();
$exchange->verbose = true;

$symbol = 'BTC/USDT';
$type = 'limit';
$side = 'buy';
$amount = 0.000865;
$price = 11560;

$order = $exchange->create_order($symbol, $type, $side, $amount, $price);
print_r ($order);
