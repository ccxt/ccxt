<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

$exchange = new \ccxt\coinone (array (
    'enableRateLimit' => true,
    // 'verbose' => true, // uncomment for verbose output
));

// fetch all
$tickers = $exchange->fetch_tickers();
var_dump ($tickers);

echo "\n";

// fetch one by one
$markets = $exchange->load_markets();
foreach ($markets as $symbol => $m) {
    var_dump($exchange->fetch_ticker($symbol));
}

?>
