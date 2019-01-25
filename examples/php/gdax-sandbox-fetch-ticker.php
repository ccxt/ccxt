<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set ('UTC');

echo "CCXT v." . \ccxt\Exchange::VERSION . "\n";

$exchange = new \ccxt\gdax (array (
    'enableRateLimit' => true,
    'urls' => array (
        'api' => 'https://api-public.sandbox.gdax.com',
    ),
));

// preload the markets first

try {

    $exchange->load_markets ();

} catch (\ccxt\BaseError $e) {
    echo 'Failed to load markets: ' . $e->getMessage () . "\n";
} catch (Exception $e) {
    echo '[Error] ' . $e->getMessage () . "\n";
}

$symbol = 'ETH/BTC';
$market = null;

// check if the market in question is available

try {
    $market = $exchange->market ($symbol);
} catch (\ccxt\BaseError $e) {
    echo $exchange->id . ' does not have market symbol ' . $symbol . "!\n";
    echo 'Markets symbols supported by ' . $exchange->id . ":\n";
    echo print_r ($exchange->symbols, true) . "\n";
    exit ();
}

if ($market['active']) {

    try {

        $result = $exchange->fetch_ticker ($symbol);
        var_dump ($result);

    } catch (\ccxt\NetworkError $e) {
        echo '[Network Error] ' . $e->getMessage () . "\n";
    } catch (\ccxt\ExchangeError $e) {
        echo '[Exchange Error] ' . $e->getMessage () . "\n";
    } catch (Exception $e) {
        echo '[Error] ' . $e->getMessage () . "\n";
    }

} else {

    echo $exchange->id . ' market ' . $symbol . " is inactive!\n";
    exit ();
}

?>
