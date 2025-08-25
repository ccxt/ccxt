- [Bybit Updated](./examples/php/)


 ```php
 <?php

include './ccxt.php';

date_default_timezone_set('UTC');

echo 'CCXT v' . \ccxt\Exchange::VERSION . "\n";

$exchange = new \ccxt\bybit(array(
    'apiKey' => 'YOUR_API_KEY',
    'secret' => 'YOUR_SECRET_KEY',
    // 'verbose' => true, // uncomment if debug output is needed
));


// Example 1: Spot : fetch balance, create order, cancel it and check canceled orders
function example_1($exchange) {
    $exchange->options['defaultType'] = 'spot'; // very important set spot as default type
    $markets = $exchange->load_markets();

    // fetch spot balance
    $balance = $exchange->fetch_balance();
    print_r($balance);

    // create limit order
    $symbol = 'LTC/USDT';
    $type = 'limit';
    $side = 'buy';
    $amount = 0.1;
    $price = 50;
    $create_order = $exchange->create_order($symbol, $type, $side, $amount, $price);
    print_r('Create order id:' . $create_order['id']);

    // cancel created order
    $canceled_order = $exchange->cancel_order($create_order['id'], $symbol);
    print_r($canceled_order);

    // Check canceled orders (bybit does not have a single endpoint to check orders
    // we have to choose whether to check open or closed orders and call fetch_open_orders
    // or fetch_closed_orders respectively
    $orders = $exchange->fetch_closed_orders($symbol);
    print_r($orders);

}

// -----------------------------------------------------------------------------------------

// Example 2 :: Swap : fetch balance, open a position and close it
function example_2($exchange) {
    $exchange->options['defaultType'] = 'swap'; // very important set swap as default type
    $markets = $exchange->load_markets();

    // fetch swap balance
    $balance =  $exchange->fetch_balance();
    print_r($balance);

    // create market order and open position
    $symbol = 'LTC/USDT:USDT';
    $type = 'market';
    $side = 'buy';
    $amount = 0.1;
    $price = null;
    $create_order = $exchange->create_order($symbol, $type, $side, $amount, $price);
    print_r('Create order id:' . $create_order['id']);

    // check opened position
    $symbols = [ $symbol ];
    $positions = $exchange->fetch_positions($symbols);
    print_r($positions);

    // Close position by issuing a order in the opposite direction
    $side = 'sell';
    $params = array (
        'reduce_only' => true
    );
    $close_position = $exchange->create_order($symbol, $type, $side, $amount, $price,  $params);
    print_r($close_position);
}

// -----------------------------------------------------------------------------------------

// Example 3 :: USDC Swap : fetch balance, open a position and close it
function example_3($exchange) {
    $exchange->options['defaultType'] = 'swap'; // very important set swap as default type
    $markets = $exchange->load_markets();

    // fetch USDC swap balance
    // when no symbol is available we can show our intent
    // of using USDC endpoints by either using defaultSettle in options or
    // settle in params
    // Using Options: exchange->$options['defaultSettle'] = 'USDC';
    // Using params:
    $balance_params = array(
        'settle' => 'USDC'
    );
    $balance =  $exchange->fetch_balance($balance_params);
    print_r($balance);


    // create order and open position
    // taking into consideration that USDC markets do not support
    // market orders
    $symbol = 'BTC/USD:USDC';
    $type = 'limit';
    $side = 'buy';
    $amount = 0.01;
    $price = 20000; // adjust this accordingly
    $create_order = $exchange->create_order($symbol, $type, $side, $amount, $price);
    print_r('Create order id:' . $create_order['id']);

    // check if the order was filled and the position opened
    $symbols = [ $symbol ];
    $positions = $exchange->fetch_positions($symbols);
    print_r($positions);

    // close position (assuming it was already opened) by issuing an order in the opposite direction
    $side = 'sell';
    $params = array (
        'reduce_only' => true
    );
    $close_position = $exchange->create_order($symbol, $type, $side, $amount, $price,  $params);
    print_r($close_position);
}

// -----------------------------------------------------------------------------------------

// Example 3 :: Future : fetch balance, create stop-order and check open stop-orders
function example_4($exchange) {
    $exchange->options['defaultType'] = 'future'; // very important set future as default type
    $markets = $exchange->load_markets();

    // fetch future balance
    $balance =  $exchange->fetch_balance();
    print_r($balance);


    // create stop-order
    $symbol = 'ETH/USD:ETH-220930';
    $type = 'limit';
    $side = 'buy';
    $amount = 10;  // in USD for inverse futures
    $price = 1200;
    $stop_order_params = array(
        'position_idx' => 0, // 0 One-Way Mode, 1 Buy-side, 2 Sell-side, default = 0
        'stopPrice' => 1000, // mandatory for stop orders
        'basePrice' => 1100  // mandatory for stop orders
    );
    $stop_order = $exchange->create_order($symbol, $type, $side, $amount, $price, $stop_order_params);
    print_r('Create order id:' . $stop_order['id']);

    // check opened stop-order
    $open_order_params = array(
        'stop' => true
    );
    $open_orders = $exchange->fetch_open_orders($symbol, null, null, $open_order_params);
    print_r($open_orders);

    // cancell all open stop-orders
    $cancel_orders = $exchange->cancel_all_orders($symbol, $open_order_params);
    print_r($cancel_orders);
}

// -----------------------------------------------------------------------------------------

function main($exchange) {
    example_1($exchange);
    example_2($exchange);
    example_3($exchange);
    example_4($exchange);
}

main($exchange)

?>
 
```