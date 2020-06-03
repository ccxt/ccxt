<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

$exchange = new \ccxt\coinone (array (
    'verbose' => true,
));

$tickers = $exchange->fetch_tickers();

var_dump ($tickers);

?>