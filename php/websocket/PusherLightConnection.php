<?php

namespace ccxt;
use React;
use Ratchet;
use Clue;

require __DIR__ . '/../../vendor/autoload.php';

require_once 'WebsocketBaseConnection.php';

class PusherWsEnvelop {
    public $ws;
    public $is_closing;
    public $connecting;
    public $connected;
    public $activityTimeout;
    public $pongTimeout;

    public function __construct () {
        $this->ws = null;
        $this->is_closing = false;
        $this->connecting = false;
        $this->connected = false;
        $this->activityTimeout = 120 * 1000;
        $this->pongTimeout = 30 * 1000;
    }
}

class PusherLightConnection extends WebsocketBaseConnection {

    public const CLIENT = 'ccxt-light-client';
    public const VERSION = '1.0';
    public const PROTOCOL = '7';
    public $options;
    private $timeout;
    private $loop;
    private $_activityTimer;
    private $urlParam;
    /**
     * @var PusherWsEnvelop
     */
    private $client;

    public function __construct ($options = array (), $timeout, $loop) {
        parent::__construct();
        $this->options = $options;
        $this->timeout = $timeout;
        $this->loop = $loop;
        $this->client = new PusherWsEnvelop();
        $this->activityTimer = null;
        $this->urlParam = '?client='.self::CLIENT.'&version='.self::VERSION.'&protocol='.self::PROTOCOL;
    }

    public function resetActivityCheck() {
        if ($this->activityTimer != null) {
            // $this->activityTimer->cancel();
            $this->loop->cancelTimer($this->activityTimer);
        }
        if ($this->client->is_closing) {
            return;
        }
        $that = $this;
        $this->activityTimer = $this->loop->addTimer($this->client->activityTimeout / 1000, function() use(&$that){
            if (!$that->client->is_closing) {
                if ($this->options['verbose']) {
                    echo "PusherLightConnection: pusher->send ping\n";
                }
                $that->client->ws.send(json_encode(array(
                    "event"=> 'pusher:ping',
                    "data" => array()
                )));
                $this->activityTimer = $this->loop->addTimer($this->client->pongTimeout / 1000, function() use(&$that){
                    if (!$that->client->is_closing){
                        $that->emit('err', 'pong not received from server');
                        $that->client->ws->close();
                    }
                });
            }
        });
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
                    $client = new PusherWsEnvelop();
                    $client->connecting = true;
                    $reactConnector = new React\Socket\Connector($that->loop, [
                        'timeout' => $that->timeout
                    ]);
                    $connector = new Ratchet\Client\Connector($that->loop, $reactConnector);
                    $connector($that->options['url'] . $that->urlParam)
                    ->then(function(Ratchet\Client\WebSocket $conn) use (&$that, &$client, &$resolve, &$reject){
                        $conn->on('message', function(\Ratchet\RFC6455\Messaging\MessageInterface $msg) use (&$that, &$resolve){
                            if ($that->client->is_closing) {
                                return;
                            }
                            if ($this->options['verbose']) {
                                echo ("PusherLightConnection: Message received from socket: ".$msg."\n");
                            }
                            $that->resetActivityCheck ();
                            $msgDecoded = json_decode($msg, true);
                            if ($msgDecoded['event'] === 'pusher:connection_established'){
                                // starting
                                $eventData = json_decode($msgDecoded['data'], true);
                                if ($eventData['activity_timeout']){
                                    $that->client->activityTimeout = $eventData['activity_timeout'] * 1000;
                                }
                                if (isset($that->config['wait-after-connect'])) {
                                    Clue\React\Block\sleep($that->options['wait-after-connect'] / 1000, $loop);
                                }
                                $that->emit ('open');
                                $resolve();
                            } else if ($msgDecoded['event'] === 'pusher:ping'){
                                $that->client->ws->send(json_encode(array(
                                    "event"=> 'pusher:pong',
                                    "data"=> array()
                                )));
                            } else if ($msgDecoded['event'] === 'pusher_internal:subscription_succeeded'){
                                $channel = $msgDecoded['channel'];
                                $that->emit('message', json_encode(array(
                                    'event'=> 'subscription_succeeded',
                                    'channel'=> $channel
                                )));
                            } else if ($msgDecoded['event'] === 'pusher:error'){
                                // {"event":"pusher:error","data":{"code":null,"message":"Unsupported event received on socket: subscribe"}
                                $that->emit ('err', $msgDecoded['data']['message']);
                            } else {
                                $eventData = json_decode($msgDecoded['data'], true);
                                $channel = $msgDecoded['channel'];
                                $that->emit('message', json_encode(array(
                                    "event"=> $msgDecoded['event'],
                                    "channel"=>  $channel,
                                    "data"=> $eventData
                                )));
                            }
                            // conn->close();
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
                        
                        // $conn->send('Hello World!');
                    }, function(\Exception $e) use (&$that, &$reject, $client) {
                        if ($this->options['verbose']) {
                            echo "PusherLightConnection: Could not connect: {$e->getMessage()}\n";
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
        if (!$this->client->is_closing) {
            $jsonData = json_decode($data, true);
            if ($jsonData['event'] === 'subscribe'){
                $this->client->ws->send (json_encode(array(
                    "event" => 'pusher:subscribe',
                    "data"=> array (
                        "channel"=> $jsonData['channel']
                    )
                )));
            } else if ($jsonData['event']  === 'unsubscribe'){
                $this->client->ws->send (json_encode(array(
                    "event" => 'pusher:unsubscribe',
                    "data"=> array (
                        "channel"=> $jsonData['channel']
                    )
                )));
            }
        }
    }

    public function isActive() {
        return ($this->client->connected) || ($this->client->connecting);
    }
}