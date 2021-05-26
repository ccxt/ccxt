<?php

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set('UTC');

$exchange = new \ccxt\binance(array(
    'apiKey' => 'YOUR_API_KEY', // replace with your keys
    'secret' => 'YOUR_SECRET',
    'verbose' => true,
    'enableRateLimit' => true,
));

try {

    $symbol = 'XRP/BTC'; // replace with your symbol
    $amount = 123.45; // replace with your amount here
    $price = 543.21; // replace with your price here
    $stop_price = 123.45; // replace with your stop_price

    // $limit_iceberg_qty = 543.21; // replace with your limit iceberg amount

    // if stopLimitPrice is provided, stopLimitTimeInForce is also required
    // $stop_limit_price = 54.321; // replace with your stop limit price
    // $stop_limit_time_in_force = 'GTC'; // or 'FOK', or 'IOC'

    // $stop_iceberg_qty = 123.45; // replace with your stop iceberg amount

    // https://github.com/ccxt/ccxt/wiki/Manual#loading-markets
    $exchange->load_markets();

    // https://github.com/ccxt/ccxt/wiki/Manual#symbols-and-market-ids
    $market = $exchange->market($symbol);

    // https://github.com/ccxt/ccxt/wiki/Manual#implicit-api-methods
    $params = array(
        'symbol' => $market['id'], // market id
        // 'listClientOrderId' => 'STRING', // a unique id for the entire orderList
        'side' => 'BUY', // or 'SELL'
        'quantity' => $exchange->amount_to_precision($symbol, $amount), // decimal string
        // 'limitClientOrderId' => 'STRING', // a unique id for the limit order
        'price' => $exchange->price_to_precision($symbol, $price), // decimal string
        // 'limitIcebergQty' => $exchange->amount_to_precision($symbol, $limit_iceberg_qty), // decimal string
        // 'stopClientOrderId' => 'STRING', // a unique id for the stop loss/stop loss limit leg
        'stopPrice' => $exchange->price_to_precision($symbol, $stop_price), // decimal string
        // if stopLimitPrice is provided, stopLimitTimeInForce is also required
        // 'stopLimitPrice' => $exchange->price_to_precision($symbol, $stop_limit_price), // decimal string
        // 'stopLimitTimeInForce' => $stop_limit_time_in_force,
        // 'stopIcebergQty' => $exchange->amount_to_precision($symbol, $stop_iceberg_qty), // decimal string
        // 'newOrderRespType' => 'ACK', // or 'RESULT', or 'FULL', // set the response JSON
    );

    $response = $exchange->private_post_order_oco($params);

    var_dump($response);

} catch (\ccxt\NetworkError $e) {
    echo '[Network Error] ' . $e->getMessage() . "\n";
} catch (\ccxt\ExchangeError $e) {
    echo '[Exchange Error] ' . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo '[Error] ' . $e->getMessage() . "\n";
}

?>