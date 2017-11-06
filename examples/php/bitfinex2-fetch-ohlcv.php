<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set ('UTC');

$exchange = '\\ccxt\\bitfinex2';
$exchange = new $exchange (array (
    'enableRateLimit' => true,
    'rateLimit' => 12000,
));

// bitfinex2 breaks occasionally

for ($i = 0; $i < 1000; $i++) {
    $ohlcv = $exchange->fetch_ohlcv ('BTC/USD', '1m');
    print_r ($exchange->iso8601 ($ohlcv[0][0]) . "\t" . count($ohlcv) . "\n");
}

?>