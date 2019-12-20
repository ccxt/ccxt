<?php

namespace ccxtpro;

use Ratchet\RFC6455\Messaging\Frame;
use Ratchet\RFC6455\Messaging\Message;

use RuntimeException;

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
    // public $connection_timer; // ?
    public $connectionTimeout = 10;
    public $pingInterval;
    public $keepAlive;
    public $connection = null;
    public $connected; // connection-related Future

    // ratchet/pawl/reactphp stuff
    public $loop = null;
    public $connector;

    // ------------------------------------------------------------------------

    public function future($message_hash) {
        if (!isset($this->futures[$message_hash])) {
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
            $message_hashes = array_keys($this->futures);
            foreach ($message_hashes as $message_hash) {
                $this->resolve($result, $message_hash);
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
            $message_hashes = array_keys($this->futures);
            foreach ($message_hashes as $message_hash) {
                $this->reject($result, $message_hash);
            }
        }
        return $result;
    }

    public function __construct(
            $url,
            callable $on_message_callback,
            callable $on_error_callback,
            callable $on_close_callback,
            $config
        ) {

        $this->url = $url;
        // $this->timeout = 5000;
        // $this->pingNonce = 0;
        // $this->lastPong = PHP_INT_MAX;
        $timeoutTimer = null;
        $this->futures = array();
        $this->subscriptions = array();
        $this->connected = new Future ();

        $this->on_message_callback = $on_message_callback;
        $this->on_error_callback = $on_error_callback;
        $this->on_close_callback = $on_close_callback;

        foreach ($config as $key => $value) {
            $this->{$key} =
                (property_exists($this, $key) && is_array($this->{$key}) && is_array($value)) ?
                    array_replace_recursive($this->{$key}, $value) :
                    $value;
        }

        if (!$this->loop) {
            throw new \ccxt\NotSupported('Client requires a reactphp event loop');
        }

        $options = array('timeout' => $this->connectionTimeout);
        $connector = new \React\Socket\Connector($this->loop, $options);
        $this->connector = new \Ratchet\Client\Connector($this->loop, $connector);

    }

    public function connect($backoff_delay = 0) {
        if (!$this->connection) {
            $this->connection = true;
            if ($backoff_delay) {
                // $this->loop->futureTick
            }
            $connector = $this->connector;
            $connector($this->url)->then(function($connection) {
                $this->connection = $connection;
                $this->connection->on('message', array($this, 'on_message'));
                $this->connection->on('close', array($this, 'on_close'));
                $this->connection->on('pong', array($this, 'on_pong'));
                $this->connected->resolve($this->url);
            }, function($error) {
                if (is_a($error, 'RuntimeException')) {
                    // connection failed or rejected
                    $error = new \ccxt\NetworkError($error->getMessage ());
                }
                $this->on_error($error);
            });
        }
        return $this->connected;
    }

    public function send($data) {
        $this->connection->send(Exchange::json($data));
    }

    public function close() {
        $this->connection->close();
    }

    public function isConnected() {
        return $this->connected;
    }

    public function on_pong() {
        // $this->lastPong = Exchange::milliseconds();
    }

    public function on_error($error) {
        echo date('c'), ' on_error ', $error->getMessage(), "\n";
        // convert ws errors to ccxt errors if necessary
        $this->error = new \ccxt\NetworkError($error->getMessage ());
        $this->reset($this->error);
        $on_error_callback = $this->on_error_callback;
        $on_error_callback($this, $this->error);
    }

    public function on_close($message) {
        echo date('c'), ' on_close ', (string) $message, "\n";
        exit();
        if (!$this->error) {
            // todo: exception types for server-side disconnects
            $this->reset(new NetworkError($message));
        }
        $on_close_callback = $this->on_close_callback;
        $on_close_callback($this, $message);
        exit();
    }

    public function on_message(Message $message) {
        try {
            $message = json_decode($message, true);
            // message = isJsonEncodedObject (message) ? JSON.parse (message) : message
        } catch (Exception $e) {
            echo date('c'), ' on_message json_decode ', $e->getMessage(), "\n";
            // reset with a json encoding error ?
        }
        $on_message_callback = $this->on_message_callback;
        $on_message_callback($this, $message);
        exit();
    }

    public function reset($error) {
        // $this->clearConnectionTimeout();
        // $this->clearPingInterval();
        $this->connected->reject($error);
        $this->reject($error);
    }


    // onError (error) {
    //     console.log (new Date (), 'onError', error.message)
    //     // convert ws errors to ccxt errors if necessary
    //     this.error = new NetworkError (error.message)
    //     this.reset (this.error)
    //     this.onErrorCallback (this, this.error)
    // }

    // onClose (message) {
    //     console.log (new Date (), 'onClose', message)
    //     if (!this.error) {
    //         // todo: exception types for server-side disconnects
    //         this.reset (new NetworkError (message))
    //     }
    //     this.onCloseCallback (this, message)
    // }

    // def on_error(self, error):
    //     print(Exchange.iso8601(Exchange.milliseconds()), 'on_error', error)
    //     self.error = error
    //     self.reset(error)
    //     self.on_error_callback(self, error)
    //     if not self.closed():
    //         ensure_future(self.close(1006))

    // def on_close(self, code):
    //     print(Exchange.iso8601(Exchange.milliseconds()), 'on_close', code)
    //     if not self.error:
    //         self.reset(NetworkError(code))
    //     self.on_close_callback(self, code)
    //     if not self.closed():
    //         ensure_future(self.close(code))


    // public static $clients = array ();
    // private $timeout;
    // private $handler;
    // private $connection;
    // protected $connected;
    // protected $lastPong;
    // protected $pingNonce;
    // protected $timeoutTimer;
    // protected $connectedFuture;

    // private function check_timeout () {
    //     $this->timeoutTimer = $this->loop->addPeriodicTimer(1, function () {
    //         $this->pingNonce = ($this->pingNonce + 1) % (PHP_INT_MAX - 1);
    //         $this->connection->send (new Frame($this->pingNonce, true, Frame::OP_PING));
    //         if (Exchange::milliseconds ()  - $this->lastPong > $this->timeout) {
    //             $this->connected = false;
    //             foreach ($this->futures as $deferred) {
    //                 $deferred->reject (new RequestTimeout ('Client did not receive a pong in reply to a ping within ' . $this->timeout . ' seconds'));
    //             }
    //             $this->futures = array ();
    //             $this->loop->cancelTimer ($this->timeoutTimer);
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
