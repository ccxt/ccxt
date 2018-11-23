<?php 
$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';
include $root . '/php/Exchange.php';
include $root . '/php/cex.php';

require __DIR__ . '/../../vendor/autoload.php';

if ($argc > 3) {
    $id = $argv[1];
    $apiKey =  isset($_ENV["API_KEY"])?$_ENV["API_KEY"]:'';
    $secret =  isset($_ENV["SECRET"])?$_ENV["SECRET"]:'';
    $event = $argv[2];
    $symbol = $argv[3];
    $params = array();
    for ($i=4;$i<$argc;$i++){
        $parts = explode(':',$argv[$i],2);
        $params[$parts[0]] = $parts[1];
    }
    if ($argc > 4){
        preg_match_all('~^var\s+([^=]+?)\s*=\s*(.+?)\s*;?\s*$~imu', $argv[4], $matchesAll, PREG_SET_ORDER);
        foreach ($matchesAll as $matches) {
            $params[$matches[1]] = $matches[2];
        }
    }
    
} else {
    echo 'php '. __FILE__ . ' exchange-id event symbol [params] ...\n';
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
    $exchange->websocketClose();
});

$exchange->on ($event, function ($symbol, $data) use($event) {
    echo ($event. " received from: " . $symbol);
    print_r ($data);
    echo ("\n");
});


$exchange->websocket_subscribe ($event, $symbol, $params);
echo('subscribed ' . $symbol);
$loop->run();