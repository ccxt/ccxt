<?php

namespace ccxtpro;

require_once __DIR__ . '/../vendor/autoload.php';

use Ratchet\RFC6455\Messaging\Frame;
use Ratchet\RFC6455\Messaging\Message;

// globals are obsolete

// $GLOBALS['loop'] = \React\EventLoop\Factory::create ();
// $reactConnector = new \React\Socket\Connector ($GLOBALS['loop']);
// $GLOBALS['connector'] = new \Ratchet\Client\Connector ($GLOBALS['loop'], $reactConnector);

// globals are obsolete

// register_shutdown_function(function () {
//     $GLOBALS['loop']->run ();
// });


class Client {

    public $url;
    public $futures = array();
    public $subscriptions = array();

    public $on_message_callback;
    public $on_error_callback;
    public $on_close_callback;

    public $error;
    public $connectionStarted;
    public $connectionEstablished;
    public $connectionTimer;
    public $connectionTimeout;
    public $pingInterval;
    public $keepAlive;
    public $connection;

    // connection-related Future
    public $connected;

    // below is a one-to-one manual translation from JS,
    // todo: rewrite for native PHP

    public function future($message_hash) {
        if (!$this->futures[$message_hash]) {
            $this->futures[$message_hash] = new Future();
        }
        return $this->futures[$message_hash];
    }

    public function resolve($result, $message_hash = null) {
        if ($message_hash) {
            if ($this->futures[$message_hash]) {
                $promise = $this->futures[$message_hash];
                $promise->resolve($result);
                unset($this->futures[$message_hash]);
            }
        } else {
            $message_hashes = Object.keys($this->futures);
            for ($i = 0; $i < $message_hashes.length; $i++) {
                $this->resolve($result, $message_hashes[$i])
            }
        }
        return $result;
    }

    public function reject($result, $message_hash = null) {
        if ($message_hash) {
            if ($this->futures[$message_hash]) {
                $promise = $this->futures[$message_hash];
                $promise->reject($result);
                unset($this->futures[$message_hash]);
            }
        } else {
            $message_hashes = Object.keys($this->futures);
            for ($i = 0; $i < $message_hashes.length; $i++) {
                $this->reject($result, $message_hashes[i]);
            }
        }
        return $result;
    }

    // url,
    // onMessageCallback,
    // onErrorCallback,
    // onCloseCallback,
    // protocols: undefined, // ws-specific protocols
    // options: undefined, // ws-specific options
    // futures: {},
    // subscriptions: {},
    // error: undefined, // stores low-level networking exception, if any
    // connectionStarted: undefined, // initiation timestamp in milliseconds
    // connectionEstablished: undefined, // success timestamp in milliseconds
    // connectionTimer: undefined, // connection-related setTimeout
    // connectionTimeout: 10000, // 10 seconds by default, false to disable
    // pingInterval: undefined, // stores the ping-related interval
    // keepAlive: 3000, // ping-pong keep-alive frequency
    // // timeout is not used atm
    // // timeout: 30000, // throw if a request is not satisfied in 30 seconds, false to disable
    // connection: {
    //     readyState: undefined,
    // },

    // public static $clients = array ();
    // private $timeout;
    // private $handler;
    // private $connection;
    // protected $connected;
    // protected $lastPong;
    // protected $pingNonce;
    // protected $timeoutTimer;
    // protected $connectedFuture;

    // public function __construct($url, callable $handler, $timeout = 5000) {
    //     $this->url = $url;
    //     $this->handler = $handler;
    //     $this->timeout = $timeout;
    //     $this->connected = false;
    //     $this->pingNonce = 0;
    //     $this->lastPong = PHP_INT_MAX;
    //     $timeoutTimer = null;
    //     $this->connectedFuture = null;
    //     $this->futures = array ();
    //     $this->subscriptions = array ();

    // }

    // public function connect() {
    //     if (!$this->isConnected()) {
    //         $this->connected = true;
    //         $this->connectedFuture = $GLOBALS['connector'] ($this->url)->then (function ($conn) {
    //             $this->connection = $conn;
    //             $this->connection->on ('message', function ($msg) {
    //                 $this->onMessage($msg);
    //             });
    //             $this->connection->on ('close', function () {
    //                 $this->connected = false;
    //             });
    //             $this->connection->on ('pong', function () {
    //                 $this->lastPong = Exchange::milliseconds();
    //             });
    //             $this->check_timeout ();
    //         });
    //     }
    //     return $this->connectedFuture;
    // }

    // public function send ($data) {
    //     $this->connect()->then(function () use ($data) {
    //         $this->connection->send (Exchange::json($data));
    //     });
    // }

    // public function close () {
    //     $this->connection->close ();
    // }

    // public function isConnected () {
    //     return $this->connected;
    // }

    // public function onMessage(Message $message) {
    //     $x = $this->handler;
    //     $x ($this, Exchange::parse_json ($message . ''));
    // }

    // private function check_timeout () {
    //     $this->timeoutTimer = $GLOBALS['loop']->addPeriodicTimer(1, function () {
    //         $this->pingNonce = ($this->pingNonce + 1) % (PHP_INT_MAX - 1);
    //         $this->connection->send (new Frame($this->pingNonce, true, Frame::OP_PING));
    //         if (Exchange::milliseconds ()  - $this->lastPong > $this->timeout) {
    //             $this->connected = false;
    //             foreach ($this->futures as $deferred) {
    //                 $deferred->reject (new RequestTimeout ('Websocket did not receive a pong in reply to a ping within ' . $this->timeout . ' seconds'));
    //             }
    //             $this->futures = array ();
    //             $GLOBALS['loop']->cancelTimer ($this->timeoutTimer);
    //         }
    //     });
    // }

    // public static function registerFuture ($url, $message_hash, $entry, $apikey, $subscribe = null) {
    //     $index = $url . $apikey != null ? ('#' . $apikey) : '';
    //     if (array_key_exists ($index, Client::$clients)) {
    //         $client = Client::$clients[$index];
    //     } else {
    //         $client = new Client ($url, $entry);
    //         Client::$clients[$index] = $client;
    //     }
    //     if (array_key_exists ($message_hash, $client->futures)) {
    //         $future = $client->futures[$message_hash];
    //     } else {
    //         $future = new Future ();
    //         $client->futures[$message_hash] = $future;
    //     }
    //     if ($subscribe == null) {
    //         $client->connect ();
    //     } else if (!(array_key_exists($message_hash, $client->subscriptions) && $client->subscriptions[$message_hash])) {
    //         $client->send ($subscribe);
    //         $client->subscriptions[$message_hash] = true;
    //     }
    //     return $future->promise ()->then (function ($result) use ($client, $message_hash) {
    //         unset ($client->futures[$message_hash]);
    //         return $result;
    //     });
    // }
};
