<?php

namespace ccxt\pro;

use Ratchet\Client\Connector;
use React;
use React\EventLoop\Loop;
use React\Promise\Timer;
use React\Promise\Timer\TimeoutException;

use ccxt\RequestTimeout;
use ccxt\NetworkError;
use ccxt\Exchange;

use Ratchet\RFC6455\Messaging\Frame;
use Ratchet\RFC6455\Messaging\Message;

use Exception;
use RuntimeException;

class NoOriginHeaderConnector extends Connector {
    public function generateRequest($url, array $subProtocols, array $headers) {
        return parent::generateRequest($url, $subProtocols, $headers)->withoutHeader('Origin');
    }
}

class Client {

    public $url;
    public $futures = array();
    public $subscriptions = array();
    public $rejections = array();

    public $on_message_callback;
    public $on_error_callback;
    public $on_close_callback;
    public $on_connected_callback;

    public $error;
    public $connectionStarted;
    public $connectionEstablished;
    // public $connection_timer; // ?
    public $connectionTimeout = 30000;
    public $pingInterval;
    public $keepAlive = 30000;
    public $maxPingPongMisses = 2.0;
    public $lastPong = null;
    public $ping = null;
    public $verbose = false; // verbose output
    public $gunzip = false;
    public $inflate = false;
    public $throttle = null;
    public $connection = null;
    public $connected; // connection-related Future
    public $isConnected = false;
    public $noOriginHeader = true;

    // ratchet/pawl/reactphp stuff
    public $connector = null;

    // ------------------------------------------------------------------------

    public function future($message_hash) {
        if (!array_key_exists($message_hash, $this->futures)) {
            $this->futures[$message_hash] = new Future();
        }
        $future = $this->futures[$message_hash];
        if (array_key_exists($message_hash, $this->rejections)) {
            $future->reject($this->rejections[$message_hash]);
            unset($this->rejections[$message_hash]);
        }
        return $future->promise();
    }

    public function resolve($result, $message_hash) {
        if ($this->verbose && ($message_hash === null)) {
            $this->log(date('c'), 'resolve received null messageHash');
        }
        if (array_key_exists($message_hash, $this->futures)) {
            $promise = $this->futures[$message_hash];
            $promise->resolve($result);
            unset($this->futures[$message_hash]);
        }
        return $result;
    }

    public function reject($result, $message_hash = null) {
        if ($message_hash) {
            if (array_key_exists($message_hash, $this->futures)) {
                $promise = $this->futures[$message_hash];
                unset($this->futures[$message_hash]);
                $promise->reject($result);
            } else {
                $this->rejections[$message_hash] = $result;
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
            callable $on_connected_callback,
            $config
        ) {

        $this->url = $url;
        $this->futures = array();
        $this->subscriptions = array();
        $this->rejections = array();

        $this->on_message_callback = $on_message_callback;
        $this->on_error_callback = $on_error_callback;
        $this->on_close_callback = $on_close_callback;
        $this->on_connected_callback = $on_connected_callback;

        foreach ($config as $key => $value) {
            $this->{$key} =
                (property_exists($this, $key) && is_array($this->{$key}) && is_array($value)) ?
                    array_replace_recursive($this->{$key}, $value) :
                    $value;
        }

        $this->connected = new Future();
        $connector = new React\Socket\Connector();
        if ($this->noOriginHeader) {
            $this->connector = new NoOriginHeaderConnector(Loop::get(), $connector);
        } else {
            $this->connector = new Connector(Loop::get(), $connector);
        }
    }

    public function create_connection() {
        $timeout = $this->connectionTimeout / 1000;
        if ($this->verbose) {
            echo date('c'), ' connecting to ', $this->url, "\n";
        }
        $headers = property_exists($this, 'options') && array_key_exists('headers', $this->options) ? $this->options['headers'] : [];
        $promise = call_user_func($this->connector, $this->url, [], $headers);
        Timer\timeout($promise, $timeout, Loop::get())->then(
            function($connection) {
                if ($this->verbose) {
                    echo date('c'), " connected\n";
                }
                $this->connection = $connection;
                $this->connection->on('message', array($this, 'on_message'));
                $this->connection->on('close', array($this, 'on_close'));
                $this->connection->on('error', array($this, 'on_error'));
                $this->connection->on('pong', array($this, 'on_pong'));
                $this->isConnected = true;
                $this->connectionEstablished = $this->milliseconds();
                $this->connected->resolve($this->url);
                $this->set_ping_interval();
                $on_connected_callback = $this->on_connected_callback;
                $on_connected_callback($this);
            },
            function(\Exception $error) {
                // echo date('c'), ' connection failed ', get_class($error), ' ', $error->getMessage(), "\n";
                // the ordering of these exceptions is important
                // since one inherits another
                if ($error instanceof TimeoutException) {
                    $error = new RequestTimeout($error->getMessage());
                } else if ($error instanceof RuntimeException) {
                    // connection failed or rejected
                    $error = new NetworkError($error->getMessage());
                }
                $this->on_error($error);
            }
        );
    }

    public function connect($backoff_delay = 0) {
        if (!$this->connection) {
            $this->connection = true;
            if ($backoff_delay) {
                if ($this->verbose) {
                    echo date('c'), ' backoff delay ', $backoff_delay, " seconds\n";
                }
                $callback = array($this, 'create_connection');
                Loop::addTimer(((float)$backoff_delay) / 1000, $callback);
            } else {
                if ($this->verbose) {
                    echo date('c'), ' no backoff delay', "\n";
                }
                $this->create_connection();
            }
        }
        return $this->connected;
    }

    public function send($data) {
        $message = is_string($data) ? $data : Exchange::json($data);
        if ($this->verbose) {
            echo date('c'), ' sending ', $message, "\n";
        }
        $this->connection->send($message);
        return null;
    }

    public function close() {
        $this->connection->close();
    }

    public function on_pong($message) {
        // echo date('c'), ' on_pong ', (string) $message, "\n";
        $this->lastPong = $this->milliseconds();
    }

    public function on_error($error) {
        if ($this->verbose) {
            echo date('c'), ' on_error ', get_class($error), ' ', $error->getMessage(), "\n";
        }
        $this->error = $error;
        $on_error_callback = $this->on_error_callback;
        $on_error_callback($this, $error);
        $this->reset($error);
    }

    public function on_close($message) {
        if ($this->verbose) {
            echo date('c'), ' on_close ', (string) $message, "\n";
        }
        $on_close_callback = $this->on_close_callback;
        $on_close_callback($this, $message);
        if (!$this->error) {
            // todo: exception types for server-side disconnects
            $this->reset(new NetworkError($message));
        }
    }

    public function on_message(Message $message) {
        if (!ctype_print((string)$message)) { // only decompress if the message is a binary
            if ($this->gunzip) {
                $message = \ccxt\pro\gunzip($message);
            } else if ($this->inflate) {
                $message = \ccxt\pro\inflate($message);
            }
        }

        try {
            $message = (string) $message;
            if ($this->verbose) {
                echo date('c'), ' on_message ', $message, "\n";
            }
            $message = Exchange::is_json_encoded_object($message) ? json_decode($message, true) : $message;
        } catch (Exception $e) {
            if ($this->verbose) {
                echo date('c'), ' on_message json_decode ', $e->getMessage(), "\n";
            }
            // reset with a json encoding error ?
        }
        $on_message_callback = $this->on_message_callback;
        $on_message_callback($this, $message);
    }

    public function reset($error) {
        $this->clear_ping_interval();
        $this->reject($error);
    }

    public function set_ping_interval() {
        if ($this->keepAlive) {
            $delay = ($this->keepAlive / 1000);
            $this->pingInterval = Loop::addPeriodicTimer($delay, array($this, 'on_ping_interval'));
        }
    }

    public function clear_ping_interval() {
        if ($this->pingInterval) {
            Loop::cancelTimer($this->pingInterval);
        }
    }

    public function milliseconds() {
        list($msec, $sec) = explode(' ', microtime());
        return (int)($sec . substr($msec, 2, 3));
    }

    public function on_ping_interval() {
        if ($this->keepAlive && $this->isConnected) {
            $now = $this->milliseconds();
            $this->lastPong = isset ($this->lastPong) ? $this->lastPong : $now;
            if (($this->lastPong + $this->keepAlive * $this->maxPingPongMisses) < $now) {
                $this->on_error(new RequestTimeout('Connection to ' . $this->url . ' timed out due to a ping-pong keepalive missing on time'));
            } else {
                if ($this->ping) {
                    $this->send(call_user_func($this->ping, $this));
                } else {
                    $this->connection->send(new Frame('', true, Frame::OP_PING));
                }
            }
        }
    }

    public function log() {
        $args = func_get_args();
        if (is_array($args)) {
            $array = array();
            foreach ($args as $arg) {
                $array[] = is_string($arg) ? $arg : json_encode($arg, JSON_PRETTY_PRINT);
            }
            echo implode(' ', $array), "\n";
        }
    }
};
