<?php

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set('UTC');

// ----------------------------------------------------------------------------
// an example of how to load markets for each exchange just once
// in order to save memory and time for initializing multiple exchange instances
// see these issues for details:
// - https://github.com/ccxt/ccxt/issues/7312
// - https://github.com/ccxt/ccxt/issues/8176
// ----------------------------------------------------------------------------

$keys = array(
    'ids',
    'markets',
    'markets_by_id',
    'currencies',
    'currencies_by_id',
    'base_currencies',
    'quote_currencies',
    'symbols',
);


$id = 'kraken';
$exchange_class = "\\ccxt\\{$id}";
$exchange = new $exchange_class();

$markets_on_disk = "./{$id}.markets.json";

$exchange->verbose = true; // this is a debug output to demonstrate which networking calls are being issued

if (file_exists($markets_on_disk)) {

    $cache = json_decode(file_get_contents($markets_on_disk), true);
    foreach ($keys as $key) {
        $exchange->{$key} = $cache[$key];
    }

} else {

    $exchange->load_markets();
    $cache = array();
    foreach ($keys as $key) {
        $cache[$key] = $exchange->{$key};
    }
    file_put_contents($markets_on_disk, json_encode($cache));
}

$exchange->fetch_ticker('ETH/BTC');
