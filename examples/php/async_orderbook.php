<?php 
$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';
include $root . '/php/Exchange.php';
include $root . '/php/cex.php';

require __DIR__ . '/../../vendor/autoload.php';

use React;

if ($argc > 5) {
    $id = $argv[1];
    $apiKey = $argv[2];
    $secret = $argv[3];
    $symbol = $argv[4];
    $limit = intval ($argv[5]);
} else {
    echo 'php '. __FILE__ . ' exchange-id apikey secret symbol limit\n';
    exit(-1);
}

$loop = React\EventLoop\Factory::create();

$cl = 'ccxt\\' . $id;

$exchange = new  $cl (array(
    'apiKey' => $apiKey,
    'secret' => $secret,
    'enableRateLimit' => true,
    'verbose' => true,
    'timeout' => 5 * 1000,
    'react_loop' => $loop
));

$exchange->on ('err', function ($err, $conxid) use ($exchange){
    echo ($err);
    $exchange->asyncClose();
});

$exchange->on ('ob', function ($symbol, $ob) {
    echo ("ob received from: " . $symbol);
    // print_r ($ob);
    echo ("\n");
});
$exchange->async_subscribe_order_book ($symbol);
$exchange->async_fetch_order_book($symbol, $limit);
echo ("ob received\n");
// print_r ($ob);

$loop->run();
