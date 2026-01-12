- [Huobi Futures](./examples/php/)


 ```php
 <?php

include './ccxt.php';

date_default_timezone_set('UTC');

$exchange = new \ccxt\huobipro(array(
    'apiKey' => 'YOUR_API_KEY', // ←------------ replace with your keys
    'secret' => 'YOUR_SECRET_KEY',
    'options' => array(
        'defaultType' => 'future',
    )
    // 'verbose' => true, // uncomment if debug output is needed
));

try {

    $markets = $exchange->load_markets ();

    // creating and canceling a linear swap (limit) order
    $symbol = 'ADA/USD:ADA-220121'; // the last segment is the date of expiration (can be next week, next quarter, ...) adjust it accordingly
    $order_type = 'limit';
    $side = 'buy';
    $offset = 'open';
    $leverage = 1;
    $amount = 1;
    $price = 1;

    $params = array (
        'offset' => $offset,
        'lever_rate' => $leverage,
    );

    $order = $exchange->create_order ($symbol, $order_type, $side, $amount, $price, $params);
    var_dump ($order);
    $cancel = $exchange->cancel_order ($order['id'], $symbol);
    var_dump ($cancel);

} catch (\ccxt\NetworkError $e) {
    echo '[Network Error] ' . $e->getMessage() . "\n";
} catch (\ccxt\ExchangeError $e) {
    echo '[Exchange Error] ' . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo '[Error] ' . $e->getMessage() . "\n";
}

?>
 
```