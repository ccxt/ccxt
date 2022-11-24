<?php

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set('UTC');

$exchange = new \ccxt\huobipro(array(
    'apiKey' => 'YOUR_API_KEY', // ←------------ replace with your keys
    'secret' => 'YOUR_SECRET',
    // 'verbose' => true, // uncomment if debug output is needed
));

try {

    $balance = $exchange->fetch_balance ();
    var_dump ($balance);

} catch (\ccxt\NetworkError $e) {
    echo '[Network Error] ' . $e->getMessage() . "\n";
} catch (\ccxt\ExchangeError $e) {
    echo '[Exchange Error] ' . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo '[Error] ' . $e->getMessage() . "\n";
}

?>
