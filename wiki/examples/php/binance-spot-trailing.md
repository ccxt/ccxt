- [Binance Spot Trailing](./examples/php/)


 ```php
 <?php

include './ccxt.php';

date_default_timezone_set('UTC');

echo 'CCXT v' . \ccxt\Exchange::VERSION . "\n";

$exchange = new \ccxt\binance(array(
    'apiKey' => 'YOUR_API_KEY',
    'secret' => 'YOUR_SECRET_KEY',
    // 'verbose' => true, // uncomment if debug output is needed
));

// You can read more about spot trailing orders here:
// https://github.com/binance/binance-spot-api-docs/blob/master/faqs/trailing-stop-faq.md

// Example 1: Spot : trailing spot loss
function example_1($exchange) {
    $markets = $exchange->load_markets(true);

    // create STOP_LOSS_LIMIT BUY with a trailing stop of 5%.
    $symbol = 'LTC/USDT';
    $type = 'STOP_LOSS_LIMIT';
    $side = 'buy';
    $amount = 0.4;
    $price = 25;
    $params = array(
        'trailingDelta' => 500, // 5% in BIPS
    );
    $create_order = $exchange->create_order($symbol, $type, $side, $amount, $price, $params);
    
    print_r('Create order id:' . $create_order['id']);
    
    // cancel created order
    $canceled_order = $exchange->cancel_order($create_order['id'] . $symbol);
    print_r ($canceled_order);
}

// -----------------------------------------------------------------------------------------

// Example 2: Spot : TAKE_PROFIT_LIMIT BUY order
function example_2($exchange) {
    $markets = $exchange->load_markets(true);

    // create STOP_LOSS_LIMIT BUY with a trailing stop of 5%.
    $symbol = 'LTC/USDT';
    $type = 'TAKE_PROFIT_LIMIT';
    $side = 'buy';
    $amount = 0.2;
    $price = 70;
    $params = array(
        'trailingDelta' => 250, // 2.5% in BIPS
    );

    $create_order = $exchange->create_order($symbol, $type, $side, $amount, $price, $params);
    
    print_r('Create order id:' . $create_order['id']);
    
    // cancel created order
    $canceled_order = $exchange->cancel_order($create_order['id'], $symbol);
    print_r ($canceled_order);
}
// -----------------------------------------------------------------------------------------

function main($exchange) {
    example_1($exchange);
    example_2($exchange);
}

main($exchange)

?>
 
```