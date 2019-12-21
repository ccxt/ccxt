<?php

date_default_timezone_set ('UTC');

// require __DIR__ . '/ccxtpro.php';
require_once 'vendor/autoload.php';

$loop = \React\EventLoop\Factory::create();

$symbol = 'ETH/BTC';

$id = 'poloniex';
$exchange_class = '\\ccxtpro\\' . $id;
$exchange = new $exchange_class(array(
    'enableRateLimit' => true,
    'loop' => $loop,
    // 'urls' => array(
    //     'api' => array(
    //         'ws' => 'ws://127.0.0.1:8080',
    //     ),
    // ),
));

$tick = null;
$tick = function () use ($loop, $exchange, $symbol, $tick) {

    $promise = $exchange->watch_order_book($symbol);
    $promise->then(
        function ($response) use ($loop, $tick) {
            echo date('c '), count($response['asks']), ' asks [', $response['asks'][0][0], ', ', $response['asks'][0][1], '] ', count($response['bids']), ' bids [', $response['asks'][0][0], ', ', $response['asks'][0][1], ']' . "\n";
            echo "\n";
            exit();
            $loop->futureTick($tick);
        },
        function ($error) {
            echo date('c'), ' ERROR ', $error->getMessage (), "\n";
        }
    );
};


$loop->futureTick($tick);
$loop->run ();

?>