<?php 
$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';
include $root . '/php/Exchange.php';
include $root . '/php/cex.php';

require __DIR__ . '/../../vendor/autoload.php';

if ($argc > 5) {
    $id = $argv[1];
    $apiKey = $argv[2];
    $secret = $argv[3];
    $limit = intval ($argv[4]);
    $symbols = array();
    for ($i = 5; $i < $argc; $i++) {
        $symbols[] = $argv[$i];
    }
    
} else {
    echo 'php '. __FILE__ . ' exchange-id apikey secret limit symbol ...\n';
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

foreach ($symbols as $symbol) {
    echo ("subscribe: " . $symbol . "\n");
    $exchange->websocket_subscribe ('ob', $symbol, array('limit'=>$limit));
    echo ("subscribed: " . $symbol . "\n");
    $exchange->websocket_fetch_order_book($symbol, $limit);
    echo ("ob fetched: " . $symbol . "\n");
    // print_r ($ob);
    Clue\React\Block\sleep(5, $loop);
}
foreach ($symbols as $symbol) {
    echo ("unsubscribe: " . $symbol . "\n");
    $exchange->websocket_unsubscribe ('ob', $symbol);
    echo ("unsubscribed: " . $symbol . "\n");
    Clue\React\Block\sleep(5, $loop);
}


$loop->run();
