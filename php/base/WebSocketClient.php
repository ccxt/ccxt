<?php

// @author frosty00
// @email carlo.revelli@berkeley.edu


namespace ccxtpro;

require_once __DIR__ . '/../vendor/autoload.php';

use Ratchet\RFC6455\Messaging\Frame;
use Ratchet\RFC6455\Messaging\Message;

$GLOBALS['loop'] = \React\EventLoop\Factory::create ();
$reactConnector = new \React\Socket\Connector ($GLOBALS['loop']);
$GLOBALS['connector'] = new \Ratchet\Client\Connector ($GLOBALS['loop'], $reactConnector);

register_shutdown_function(function () {
    $GLOBALS['loop']->run ();
});


class WebSocketClient {
    public $url;
    public $futures;
    public static $clients = array ();
    private $timeout;
    private $handler;
    private $connection;
    protected $connected;
    protected $lastPong;
    protected $pingNonce;
    protected $timeoutTimer;
    protected $connectedFuture;

    public function __construct($url, callable $handler, $timeout = 5000) {
        $this->url = $url;
        $this->handler = $handler;
        $this->timeout = $timeout;
        $this->connected = false;
        $this->pingNonce = 0;
        $this->lastPong = PHP_INT_MAX;
        $timeoutTimer = null;
        $this->connectedFuture = null;
        $this->futures = array ();
        $this->subscriptions = array ();

    }

    public function connect() {
        if (!$this->isConnected()) {
            $this->connected = true;
            $this->connectedFuture = $GLOBALS['connector'] ($this->url)->then (function ($conn) {
                $this->connection = $conn;
                $this->connection->on ('message', function ($msg) {
                    $this->onMessage($msg);
                });
                $this->connection->on ('close', function () {
                    $this->connected = false;
                });
                $this->connection->on ('pong', function () {
                    $this->lastPong = Exchange::milliseconds();
                });
                $this->check_timeout ();
            });
        }
        return $this->connectedFuture;
    }

    public function send ($data) {
        $this->connect()->then(function () use ($data) {
            $this->connection->send (Exchange::json($data));
        });
    }

    public function close () {
        $this->connection->close ();
    }

    public function isConnected () {
        return $this->connected;
    }

    public function onMessage(Message $message) {
        $x = $this->handler;
        $x ($this, Exchange::parse_json ($message . ''));
    }

    private function check_timeout () {
        $this->timeoutTimer = $GLOBALS['loop']->addPeriodicTimer(1, function () {
            $this->pingNonce = ($this->pingNonce + 1) % (PHP_INT_MAX - 1);
            $this->connection->send (new Frame($this->pingNonce, true, Frame::OP_PING));
            if (Exchange::milliseconds ()  - $this->lastPong > $this->timeout) {
                $this->connected = false;
                foreach ($this->futures as $deferred) {
                    $deferred->reject (new RequestTimeout ('Websocket did not receive a pong in reply to a ping within ' . $this->timeout . ' seconds'));
                }
                $this->futures = array ();
                $GLOBALS['loop']->cancelTimer ($this->timeoutTimer);
            }
        });
    }

    public static function registerFuture ($url, $message_hash, $entry, $apikey, $subscribe = null) {
        $index = $url . $apikey != null ? ('#' . $apikey) : '';
        if (array_key_exists ($index, WebSocketClient::$clients)) {
            $client = WebSocketClient::$clients[$index];
        } else {
            $client = new WebSocketClient ($url, $entry);
            WebSocketClient::$clients[$index] = $client;
        }
        if (array_key_exists ($message_hash, $client->futures)) {
            $future = $client->futures[$message_hash];
        } else {
            $future = new Future ();
            $client->futures[$message_hash] = $future;
        }
        if ($subscribe == null) {
            $client->connect ();
        } else if (!(array_key_exists($message_hash, $client->subscriptions) && $client->subscriptions[$message_hash])) {
            $client->send ($subscribe);
            $client->subscriptions[$message_hash] = true;
        }
        return $future->promise ()->then (function ($result) use ($client, $message_hash) {
            unset ($client->futures[$message_hash]);
            return $result;
        });
    }
};
