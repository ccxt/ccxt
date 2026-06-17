<?php

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set('UTC');

$id = 'bitfinex2';

// instantiate the exchange by id
$exchange = '\\ccxt\\' . $id;
$exchange = new $exchange ();

// load all markets from the exchange
$trades = $exchange->fetch_trades ('ETH/BTC', 1518983548636 - 2 * 24 * 60 * 60 * 1000);

foreach ($trades as $trade) {
    echo $trade['datetime'] . "\n";
}
echo count ($trades) . " trades\n";

?>