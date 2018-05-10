<?php

namespace ccxt;
use React;
use Ratchet;

require __DIR__ . '/../../vendor/autoload.php';

include 'AsyncConnection.php';

class WsEnvelop {
    public $ws;
    public $is_closing;

    public function __construct () {
        $this->ws = null;
        $this->is_closing = false;
    }
}

class WebsocketConnection extends AsyncConnection {

    private $options;
    private $timeout;
    private $loop;
    /**
     * @var WsEnvelop
     */
    private $client;

    public function __construct ($options = array (), $timeout, $loop) {
        parent::__construct();
        $this->options = $options;
        $this->timeout = $timeout;
        $this->loop = $loop;
        $this->client = new WsEnvelop();
    }
 
    public function connect () {
        $that = $this;

        return new React\Promise\Promise(
            function ($resolve, $reject) use (&$that) {
                try {
                    if ($that->client->ws !== null) {
                        $resolve();
                        return;
                    }
                    $client = new WsEnvelop();
                    $reactConnector = new React\Socket\Connector($that->loop, [
                        'timeout' => $that->timeout
                    ]);
                    $connector = new Ratchet\Client\Connector($that->loop, $reactConnector);
                    $connector($that->options['url'])
                    ->then(function(Ratchet\Client\WebSocket $conn) use (&$that, &$client, &$resolve, &$reject){
                        $conn->on('message', function(\Ratchet\RFC6455\Messaging\MessageInterface $msg) use (&$that){
                            if (!$that->client->is_closing) {
                                $that->emit ('message', $msg);
                            }
                            // conn->close();
                        });
                
                        $conn->on('close', function($code = null, $reason = null) use (&$that){
                            if (!$that->client->is_closing) {
                                $that->emit ('close');
                            }
                        });
                        $conn->on('error', function($err) use (&$that){
                            if (!$that->client->is_closing) {
                                $that->emit ('error', $err);
                            }
                        });
                        $client->ws = $conn;
                        $that->client = $client;
                        $resolve();
                
                        // $conn->send('Hello World!');
                    }, function(\Exception $e) use (&$that, &$reject) {
                        echo "Could not connect: {$e->getMessage()}\n";
                        $reject($e);
                        // $loop->stop();
                    });
                } catch (\Exception $e) {
                    echo ($e);
                    $reject($e);
                }
        
            }/*,
            function ($resolve, $reject) use (&$client) {
                // this will be called once calling `cancel()` on this promise
                // a common use case involves cleaning any resources and then rejecting
                if ($client->ws !== null) {
                    $client->is_closing = true;
                    $client->ws->close();
                    $client->ws = null;
                }
                $reject(new \RuntimeException('Operation cancelled'));
            }*/
        );
    }

    public function close () {
        if ($this->client->ws !== null) {
            $this->client->is_closing = true;
            $this->client->ws->close();
            $this->client->ws = null;
        }
    }

    public function send ($data) {
        $this->client->ws->send ($data);
    }
}