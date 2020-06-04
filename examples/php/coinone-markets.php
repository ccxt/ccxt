<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

$exchange = new \ccxt\coinone (array (
    'enableRateLimit' => true,
    // 'verbose' => true, // uncomment for verbose output
));

$markets = $exchange->load_markets();

var_dump ($markets);
echo "\n" . $exchange->name . " supports " . count($markets) . " pairs\n";

?>
