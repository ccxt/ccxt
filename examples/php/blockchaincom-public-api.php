<?php

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set('UTC');

$exchange = new \ccxt\blockchaincom(array(
    'verbose' => true,
    'timeout' => 30000,
));

try {

    $symbol = 'BTC/USD';

    $result = $exchange->fetch_markets ();
    printf("Total number of markets:" . count($result));
    printf("\n--------------------------------------------------------------\n");

    $result = $exchange->fetch_l2_order_book ($symbol);
    printf("L2" . " " . $result["symbol"] . " " . $result["asks"][0][0] . " " . $result["bids"][0][0]);
    printf("\n--------------------------------------------------------------\n");

    $result = $exchange->fetch_l3_order_book ($symbol);
    printf("L3" . " " . $result["symbol"] . " " . $result["asks"][0][0] . " " . $result["bids"][0][0]);
    printf("\n--------------------------------------------------------------\n");

    $result = $exchange->fetch_order_book ($symbol);
    printf("Order Book" . " " . $result["symbol"] . " " . $result["asks"][0][0] . " " . $result["bids"][0][0]);
    printf("\n--------------------------------------------------------------\n");

    $result = $exchange->fetch_ticker ($symbol);
    printf("Ticker" . " " . $result["symbol"] . "\n");
    var_dump( $result["info"]);
    printf("\n--------------------------------------------------------------\n");

    $result = $exchange->fetch_tickers ();
    printf("Tickers" . "\n");
    var_dump( $result[$symbol]);
    printf("\n--------------------------------------------------------------\n");

} catch (\ccxt\NetworkError $e) {
    echo '[Network Error] ' . $e->getMessage() . "\n";
} catch (\ccxt\ExchangeError $e) {
    echo '[Exchange Error] ' . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo '[Error] ' . $e->getMessage() . "\n";
}

?>