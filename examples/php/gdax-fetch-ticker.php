<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set ('UTC');

$exchange = new \ccxt\gdax (array (
    'enableRateLimit' => true,
));

echo "CCXT v." . \ccxt\Exchange::VERSION . "\n";

try {

    $symbol = 'ETH/BTC';
    $result = $exchange->fetch_ticker ($symbol);

    var_dump ($result);

} catch (\ccxt\NetworkError $e) {
    echo '[Network Error] ' . $e->getMessage () . "\n";
} catch (\ccxt\ExchangeError $e) {
    echo '[Exchange Error] ' . $e->getMessage () . "\n";
} catch (Exception $e) {
    echo '[Error] ' . $e->getMessage () . "\n";
}

?>
