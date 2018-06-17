<?php 

$root = dirname (dirname (dirname (__FILE__)));

include $root . '/ccxt.php';
include $root . '/php/async/WebsocketConnection.php';

require __DIR__ . '/../../vendor/autoload.php';

$loop = React\EventLoop\Factory::create();


$ws = new ccxt\WebsocketConnection([
  // 'url' => 'wss://ws.cex.io/ws/'
  'url' => 'wss://echo.websocket.org'
], 1000, $loop);
/*
try {
  $value = Clue\React\Block\await($ws->connect(), $loop);
  // promise successfully fulfilled with $value
  echo 'Result: ' . $value;
} catch (Exception $exception) {
  // promise rejected with $exception
  echo 'ERROR: ' . $exception->getMessage();
}
*/

$ws->on ('err', function ($error) {
    echo ($error);
});

$ws->on ('message', function ($msg) use ($ws, $loop){
    $loop->addTimer(5, function () use ($ws) {
        $ws->sendJson ([
            'helo' => 'helo'
        ]);
    });
});

$ws->on ('close', function ($msg) {
    echo '--->close';
});

try {
    Clue\React\Block\await ($ws->connect(), $loop);
    $deferred = new \React\Promise\Deferred();
    $ws->once ('message', function ($msg) use ($deferred){
        $deferred->resolve($msg);
    });
    $ws->sendJson ([
        'helo' => 'helo'
    ]);
    /*
    $promise = new React\Promise\Promise (
        function ($resolve, $reject) use($ws) {
            $ws->once ('message', function ($msg) use ($resolve) {
                // $resolve($msg);
            });
                    
        });
        */
    $timeout = React\Promise\Timer\timeout($deferred->promise(), 5.0, $loop);
        
    $value = Clue\React\Block\await($timeout, $loop);
    echo 'awaited for:' . $value;
      
} catch (Exception $ex) {
    echo $ex;
    $ws->close();
}

/*
$ws->connect()->then(function () use($loop, $ws) {
  $ws->sendJson ([
        'helo' => 'helo'
  ]);
  
  $promise = new React\Promise (
    function ($resolve, $reject) use($ws) {
        echo 'ññññ';
        $ws->on ('message', function ($msg) {
            echo 'message';
            $resolve($msg);
        });
    });
    $timeout = React\Promise\Timer\timeout($promise, 10.0, $loop);
    
    // Clue\React\Block\sleep(5, $loop);
    try {
        $value = Clue\React\Block\await($promise, $loop);
        echo $value;
    } catch (Exception $ex) {
        echo $ex;
    }
    $ws->close();
});
*/
$loop->run();

