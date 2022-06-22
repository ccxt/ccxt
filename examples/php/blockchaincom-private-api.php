<?php

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set('UTC');

$exchange = new \ccxt\blockchaincom(array(
    'timeout' => 300000,
    'secret' => 'YOUR_SECRET_KEY'
));

$symbol = 'BTC/USDT';
$type = 'limit'; // # or 'market', or 'Stop' or 'StopLimit'
$side = 'buy';
$amount = 0.01;
$price = 2000;

try {
    // fetch fees
    $result = $exchange->fetch_trading_fees();
    printf("Trading Fees" . "\n");
    var_dump( $result[$symbol] );
    printf("\n--------------------------------------------------------------\n"); 
    
    // my trades
    $result = $exchange->fetch_my_trades();
    printf("My Trades" . "\n");
    var_dump( $result );
    printf("\n--------------------------------------------------------------\n");
    
    // deposits
    $result = $exchange->fetch_deposits();
    printf("Deposits" . "\n");
    var_dump( $result[0] );
    printf("\n--------------------------------------------------------------\n");

    // fetch account balance from the exchange
    $result = $exchange->fetch_balance();
    printf("Balance" . "\n");
    var_dump( $result );
    printf("\n--------------------------------------------------------------\n");

    // withdrawals
    $result = $exchange->fetch_withdrawals();
    printf("Withdrawals" . "\n");
    var_dump( $result[0] );
    printf("\n--------------------------------------------------------------\n");

    // deposit address
    $result = $exchange->fetch_deposit_address('BTC');
    printf("Deposit Address" . "\n");
    var_dump( $result );
    printf("\n--------------------------------------------------------------\n");

    // create new limit order
    $new_order = $exchange->create_order($symbol, $type, $side, $amount, $price);
    printf("New Order " . "\n");
    var_dump( $new_order );
    printf("\n--------------------------------------------------------------\n");

    // open orders
    $result = $exchange->fetch_open_orders();
    printf("Open Orders" . "\n");
    var_dump( $result[0] );
    printf("\n--------------------------------------------------------------\n");

    // cancel order
    $result = $exchange->cancel_order($new_order['id']);
    printf("Cancel Order" . "\n");
    var_dump( $result );
    printf("\n--------------------------------------------------------------\n");

    // closed orders
    $result = $exchange->fetch_closed_orders();
    printf("Closed Orders" . "\n");
    var_dump( $result );
    printf("\n--------------------------------------------------------------\n");

    // orders by state
    $result = $exchange->fetch_orders_by_state("CANCELED");
    printf("Orders by State" . "\n");
    var_dump( $result );
    printf("\n--------------------------------------------------------------\n");

    // fetch withdrawal white list
    $result = $exchange->fetch_withdrawal_whitelist();
    printf("Withdrawal white list" . "\n");
    var_dump( $result[0] );
    printf("\n--------------------------------------------------------------\n");

} catch (\ccxt\NetworkError $e) {
    echo '[Network Error] ' . $e->getMessage() . "\n";
} catch (\ccxt\ExchangeError $e) {
    echo '[Exchange Error] ' . $e->getMessage() . "\n";
} catch (Exception $e) {
    echo '[Error] ' . $e->getMessage() . "\n";
}

?>