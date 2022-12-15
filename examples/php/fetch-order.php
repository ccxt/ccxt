<?php

$root = dirname(dirname(dirname(__FILE__)));

include $root . '/ccxt.php';

date_default_timezone_set('UTC');

$id = 'livecoin'; // edit this line

// ----------------------------------------------------------------------------

// instantiate the exchange by id
$exchange_class = '\\ccxt\\' . $id;
$exchange = new $exchange_class(array(

    // some exchanges may require additional API credentials
    'apiKey' => 'YOUR_API_KEY', // edit this line
    'secret' => 'YOUR_SECRET', // edit this line

    // this is not required! uncomment only if you want to debug it
    // 'verbose' => true,

));

// ----------------------------------------------------------------------------

if ($exchange->has['fetchOrder'] === false) {

    echo $exchange->id . " does not support fetchOrder() yet\n";
    exit();

} else if ($exchange->has['fetchOrder'] === 'emulated') {

    echo $exchange->id . " fetchOrder() is 'emulated' and relies " .
        "on the `.orders` cache as described in the Manual:\n" .
        "https://github.com/ccxt/ccxt/wiki/Manual#orders-cache\n";

    exit();

}

// ----------------------------------------------------------------------------

if ($exchange->has['fetchOrder'] === true) {

    // this is the order id returned from by any of the order API methods
    // createOrder(), fetchOrders(), fetchOpenOrders(), fetchClosedOrders()
    $order_id = '45125111901'; // edit this line

    // most of exchanges will not require the symbol argument, but some of
    // the exchanges will require it, and it's safe to always pass the
    // symbol argument to fetchOrder along with the order id
    $symbol = 'ETH/BTC'; // edit this line

    // these params are exchange-specific, most of exchanges don't require them
    // some exchanges or methods may require this or that parameter in certain
    // cases, consult the exchanges' API docs to get a list of all params
    $params = array(
        // 'param1' => 'value1', // uncomment and edit if necessary
        // 'param2' => 'value2', // uncomment and edit if necessary
    );

    try {

        $order = $exchange->fetch_order($order_id, $symbol, $params);
        print_r($order);

    } catch (\ccxt\NetworkError $e) {

        // in case of a networking or a connectivity error instead of simply
        // printing the error message here, the application should define
        // the behavior or a recover-and-retry strategy, because networking
        // errors are temporary and occasionally happen with all exchanges
        // a retry after a while may be enough, depending on the error
        echo get_class ($e) . ': ' . $e->getMessage() . "\n";

    } catch (\ccxt\ExchangeError $e) {

        // in case of an exchange error the application should stop and signal
        // the error to the developer or to the user, human interference is
        // required to resolve an exchange error in each specific case
        echo get_class($e) . ': ' . $e->getMessage() . "\n";

    } catch (Exception $e) {

        echo get_class($e) . ': ' . $e->getMessage() . "\n";

    }

}
