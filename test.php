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
    // 'urls' => array(
    //     'api' => array(
    //         'ws' => 'ws://127.0.0.1:8080',
    //     ),
    // ),
));

$handler = function () use ($loop, $exchange, $symbol) {

    $exchange->hello_world();

    $promise = $exchange->watch_order_book($symbol);
    $promise->then(function ($orderbook) use ($loop, $handler) {
        $loop->futureTick($handler);
    });

    // x = None
    // while True:
    //     try:
    //         response = await exchange.watch_order_book(symbol)
    //         print(len(response['asks']), 'asks', response['asks'][0], len(response['bids']), 'bids', response['bids'][0])
    //     except Exception as e:
    //         print('Error', type(e), str(e))
    //         await sleep(1)
    //         # await exchange.close()
    //     # sys.exit()
    // await exchange.close()
    // print('test() is done', x)
    // # pprint(orderbook)

    // echo "Hello, World!\n";

};


$loop->futureTick($handler);

$loop->run ();

?>