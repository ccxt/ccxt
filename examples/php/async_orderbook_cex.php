<?php 
$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';
include $root . '/php/Exchange.php';
include $root . '/php/cex.php';

require __DIR__ . '/../../vendor/autoload.php';

use React;

if ($argc > 4) {
    $apiKey = $argv[1];
    $secret = $argv[2];
    $symbol = $argv[3];
    $limit = intval ($argv[4]);
} else {
    echo 'php '. __FILE__ . 'apikey secret symbol limit\n';
    exit(-1);
}

$loop = React\EventLoop\Factory::create();

$exchange = new ccxt\cex (array(
    'apiKey' => $apiKey,
    'secret' => $secret,
    'enableRateLimit' => true,
    'verbose' => true,
    'timeout' => 5 * 1000,
    'react_loop' => $loop
));

$exchange->on ('err', function ($err) use ($exchange){
    echo ($err);
    $exchange->asyncClose();
});

$exchange->on ('ob', function ($symbol, $ob) {
    echo ("ob received from: " . $symbol);
    // print_r ($ob);
    echo ("\n");
});
$exchange->async_subscribe_order_book ($symbol);
$ob = $exchange->async_fetch_order_book($symbol, $limit);
echo ("od received\n");
// print_r ($ob);

$loop->run();
