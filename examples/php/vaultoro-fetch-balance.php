<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set ('UTC');

$exchange = new \ccxt\vaultoro (array (
    // 'verbose' => true, // for debugging
    // 'timeout' => 30000,
    "apiKey" => "CEwxqNb3GzixcrhzrPkn47JkdsDpff6z",
    "secret" => "ZXRBWURDN3NSVFNJSmFIRHlOWUVfd1d6UjZwSFdiTGI=",
));

try {

    $result = $exchange->fetch_balance ();

    print_r ($result);

} catch (\ccxt\NetworkError $e) {
    echo '[Network Error] ' . $e->getMessage () . "\n";
} catch (\ccxt\ExchangeError $e) {
    echo '[Exchange Error] ' . $e->getMessage () . "\n";
} catch (Exception $e) {
    echo '[Error] ' . $e->getMessage () . "\n";
}

?>