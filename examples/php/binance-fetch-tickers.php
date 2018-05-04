<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set ('UTC');

$exchange = new \ccxt\binance (array (
    // 'verbose' => true, // for debugging
    'timeout' => 30000,
));

try {

    // WARNING !!!

    // DO NOT CALL THIS MORE THAN ONCE IN 2 MINUTES OR YOU WILL GET BANNED BY BINANCE!

    // https://github.com/binance-exchange/binance-official-api-docs/blob/master/rest-api.md#limits

    $result = $exchange->fetch_tickers ();

    print_r ($result);

} catch (\ccxt\NetworkError $e) {
    echo '[Network Error] ' . $e->getMessage () . "\n";
} catch (\ccxt\ExchangeError $e) {
    echo '[Exchange Error] ' . $e->getMessage () . "\n";
} catch (Exception $e) {
    echo '[Error] ' . $e->getMessage () . "\n";
}

?>