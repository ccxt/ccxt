<?php

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set('UTC');


$symbol = 'BTC/USDT';

$exchange_id = 'latoken';
// instantiate the exchange by id
$exchange = '\\ccxt\\' . $exchange_id;
$exchange = new $exchange(array(
    // 'verbose': true, // uncomment for debugging purposes
    // uncomment and change for your keys to enable private calls
    // 'apiKey': 'YOUR_API_KEY',
    // 'secret': 'YOUR_API_SECRET',
));

$exchange->load_markets();

echo "-------------------------------------------------------------------\n";

echo $exchange->id, " has:\n";
var_dump($exchange->has);

// public API

echo "-------------------------------------------------------------------\n";

$markets = array_values($exchange->markets);
echo 'Loaded ', count($markets), ' ', $exchange->id, " markets:\n";
// var_dump($markets);

echo "-------------------------------------------------------------------\n";

$currencies = array_values($exchange->currencies);
echo 'Loaded ', count($currencies), ' ', $exchange->id, " currencies:\n";
// var_dump($currencies);

echo "-------------------------------------------------------------------\n";

$time = $exchange->fetch_time();
echo 'Exchange time: ', $exchange->iso8601($time), "\n";

echo "-------------------------------------------------------------------\n";

$ticker = $exchange->fetch_ticker($symbol);
var_dump($ticker);

echo "-------------------------------------------------------------------\n";

$tickers = $exchange->fetch_tickers();
echo 'Loaded ', count($tickers), ' ', $exchange->id, " tickers:\n";
// var_dump($tickers);

echo "-------------------------------------------------------------------\n";

$orderbook = $exchange->fetch_order_book ($symbol);
var_dump($orderbook);

echo "-------------------------------------------------------------------\n";

$trades = $exchange->fetch_trades($symbol);
var_dump(array_map(function ($x) use ($exchange) {
    return $exchange->omit($x, array('info', 'timestamp'));
}, $trades));

echo "-------------------------------------------------------------------\n";

// private API

if ($exchange->check_required_credentials(false)) {

    $balance = $exchange->fetch_balance();
    var_dump($exchange->omit($balance, array('info')));

    echo "-------------------------------------------------------------------\n";

    $order = $exchange->create_order($symbol, 'limit', 'buy', 0.001, 10000);
    var_dump($order);

    echo "-------------------------------------------------------------------\n";

    $open_orders = $exchange->fetch_open_orders($symbol);
    var_dump($open_orders);

    echo "-------------------------------------------------------------------\n";

    $canceled = $exchange->cancel_order($order['id'], $order['symbol']);
    var_dump($canceled);

    echo "-------------------------------------------------------------------\n";

    $closed_orders = $exchange->fetch_closed_orders($symbol);
    var_dump($closed_orders);

    echo "-------------------------------------------------------------------\n";

    $canceled_orders = $exchange->fetch_canceled_orders($symbol);
    var_dump($canceled_orders);

    echo "-------------------------------------------------------------------\n";

    $my_trades = $exchange->fetch_my_trades($symbol);
    var_dump($my_trades);

}

?>
