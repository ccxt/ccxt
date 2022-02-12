<?php

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set ('UTC');

// $exchange = new \ccxt\redot (array (
//     'apiKey' => 'YOUR_API_KEY',
//     'secret' => 'YOUR_SECRET',
//     'enableRateLimit' => true,
// ));

$exchange = new \ccxt\redot (array (
    'apiKey' => '3nCmZsG1TzHr9rD0',
    'secret' => 'Bw3drviPQJMONHTKmDuvVus9',
    'enableRateLimit' => true,
));

echo "CCXT v." . \ccxt\Exchange::VERSION . "\n";

try {
    // Create auth token (mandatory step)
    $exchange->sign_in();

    $balances = $exchange->fetch_balance();
    var_dump ($balances);

} catch (\ccxt\NetworkError $e) {
    echo '[Network Error] ' . $e->getMessage () . "\n";
} catch (\ccxt\ExchangeError $e) {
    echo '[Exchange Error] ' . $e->getMessage () . "\n";
} catch (Exception $e) {
    echo '[Error] ' . $e->getMessage () . "\n";
}

?>
