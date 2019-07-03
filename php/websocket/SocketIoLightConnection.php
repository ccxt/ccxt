<?php

namespace ccxt;
use React;
use Ratchet;
use Clue;

require __DIR__ . '/../../vendor/autoload.php';

require_once 'WebsocketBaseConnection.php';

class SocketIoEnvelop {
    public $ws;
    public $is_closing;
    public $connecting;
    public $connected;
    public $ping_interval_ms;
    public $ping_timeout_ms;

    public function __construct () {
        $this->ws = null;
        $this->is_closing = false;
        $this->connecting = false;
        $this->connected = false;
        $this->ping_interval_ms = 25000;
        $this->ping_timeout_ms = 5000;
    }
}

class SocketIoLightConnection extends WebsocketBaseConnection {

    public $options;
    private $timeout;
    private $loop;
    /**
     * @var SocketIoEnvelop
     */
    private $client;

    public function __construct ($options = array (), $timeout, $loop) {
        parent::__construct();
        $this->options = $options;
        $this->timeout = $timeout;
        $this->loop = $loop;
        $this->client = new SocketIoEnvelop();
        $this->ping_interval = null;
        $this->ping_timeout = null;
    }

    protected function createPingProcess (){
        $that = $this;
        $this->destroyPingProcess();
        $this->ping_interval = $this->loop->addPeriodicTimer($this->client->ping_interval_ms / 1000, function() use(&$that){
            if ($that->client->is_closing) {
                $that->destroyPingProcess();
            } else {
                $that->cancelPingTimeout();
                $that->client->ws->send('2');
                if ($this->options['verbose']) {
                    echo('SocketIoLightConnection: ping sent');
                }
                $that->ping_timeout = $this->loop->addTimer($this->client->ping_timeout_ms / 1000, function() use(&$that){
                    $that->emit('err', 'pong not received from server');
                    $that->client->ws->close();
                });
            }
        });
    }

    protected function destroyPingProcess() {
        if ($this->ping_interval != null){
            $this->loop->cancelTimer($this->ping_interval);
            $this->ping_interval = null;
        }
        $this->cancelPingTimeout();
    }

    protected function cancelPingTimeout() {
        if ($this->ping_timeout != null){
            $this->loop->cancelTimer($this->ping_timeout);
            $this->ping_timeout = null;
        }
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
                    $client = new SocketIoEnvelop();
                    $client->connecting = true;
                    $reactConnector = new React\Socket\Connector($that->loop, [
                        'timeout' => $that->timeout
                    ]);
                    $connector = new Ratchet\Client\Connector($that->loop, $reactConnector);
                    $connector($that->options['url'])
                    ->then(function(Ratchet\Client\WebSocket $conn) use (&$that, &$client, &$resolve, &$reject){
                        $conn->on('message', function(\Ratchet\RFC6455\Messaging\MessageInterface $msg) use (&$that,&$resolve){
                            if ($that->client->is_closing) {
                                return;
                            }
                            if ($this->options['verbose']) {
                                echo("SocketIoLightConnection: " .$msg."\n");
                            }
                            $code = substr($msg,0,1);
                            if ($code === '0') {
                                // initial message
                                $msgDecoded = json_decode(substr($msg, 1), true);
                                if ($msgDecoded['pingInterval']){
                                    $that->client->ping_interval_ms = $msgDecoded['pingInterval'];
                                }
                                if ($msgDecoded['pingTimeout']){
                                    $that->client->ping_timeout_ms = $msgDecoded['pingTimeout'];
                                }
                            } else if ($code === '3') {
                                $that->cancelPingTimeout();
                                if ($this->options['verbose']) {
                                    echo("SocketIoLightConnection: pong received");
                                }
                            } else if ($code === '4') {
                                $code2 = substr($msg, 1, 1);
                                if ($code2 == '2') {
                                    $that->emit ('message', substr($msg, 2));
                                } else if ($code2 == '0') {
                                    $that->createPingProcess();
                                    $that->emit ('open');
                                    $resolve();
                                }
                            } else if ($code === '1') {
                                $that->emit ('err', 'server sent disconnect message');
                                $that->close();
                            } else {
                                if ($this->options['verbose']) {
                                    echo ("SocketIoLightConnection: unknown msg received from iosocket: " . data);
                                }
                            }

                        });
                
                        $conn->on('close', function($code = null, $reason = null) use (&$that, $client){
                            $client->connecting = false;
                            $client->connected = false;
                            if (!$client->is_closing) {
                                $that->emit ('close');
                            }
                        });
                        $conn->on('error', function($err) use (&$that, $client){
                            $client->connecting = false;
                            $client->connected = false;
                            if (!$client->is_closing) {
                                $that->emit ('err', $err);
                            }
                        });
                        $client->ws = $conn;
                        $that->client = &$client;
                        $that->client->connected = true;
                        $that->client->connected = false;
                        if (isset($that->config['wait-after-connect'])) {
                            Clue\React\Block\sleep($this->options['wait-after-connect'] / 1000, $loop);
                        }
                        
                
                        // $conn->send('Hello World!');
                    }, function(\Exception $e) use (&$that, &$reject, $client) {
                        if ($this->options['verbose']) {
                            echo "SocketIoLightConnection: Could not connect: {$e->getMessage()}\n";
                        }
                        $client->connected = false;
                        $client->connected = false;
                        $reject($e);
                        // $loop->stop();
                    });
                } catch (\Exception $e) {
                    $client->connected = false;
                    $client->connected = false;
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
            $this->client->connected = false;
            $this->client->connected = false;
            $this->client->ws = null;
        }
    }

    public function send ($data) {
        $this->client->ws->send ('42' . $data);
    }

    public function isActive() {
        return ($this->client->connected) || ($this->client->connecting);
    }
}