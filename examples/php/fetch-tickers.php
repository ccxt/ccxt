<?php
// ##############################################################
// to see asynchronous version, check: 'async-await.php' example
// ##############################################################

include dirname(dirname(dirname(__FILE__))) . '/ccxt.php';
date_default_timezone_set('UTC');

$exchange = new \ccxt\binance(array(
    // 'verbose' => true, // for debugging
    'timeout' => 30000,
));

try {
    $result = $exchange->fetch_tickers (); // note, don't call it for binance more than once in every few seconds.
    print_r ($result);
} catch (\ccxt\NetworkError $e) {
    echo '[Network Error] ' . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo '[Error] ' . $e->getMessage() . "\n";
}

?>