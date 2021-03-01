<?php

namespace ccxtpro;

use React\Promise\Timer;
use React\Promise\Timer\TimeoutException;

use ccxt\RequestTimeout;
use ccxt\NetworkError;
use ccxt\Exchange;

use Ratchet\RFC6455\Messaging\Frame;
use Ratchet\RFC6455\Messaging\Message;

use Exception;
use RuntimeException;

class NoOriginHeaderConnector extends \Ratchet\Client\Connector {
    public function generateRequest($url, array $subProtocols, array $headers) {
        return parent::generateRequest($url, $subProtocols, $headers)->withoutHeader('Origin');
    }
}

class Client {

    public $url;
    public $futures = array();
    public $subscriptions = array();

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
    public $connection = null;
    public $connected; // connection-related Future
    public $isConnected = false;
    public $noOriginHeader = true;

    // ratchet/pawl/reactphp stuff
    public $loop = null;
    public $connector = null;

    // ------------------------------------------------------------------------

    public function future($message_hash) {
        if (is_array($message_hash)) {
            $first_hash = $message_hash[0];
            if (!array_key_exists($first_hash, $this->futures)) {
                $future = new Future($this->loop);
                $this->futures[$first_hash] = $future;
                $length = count($message_hash);
                for ($i = 1; $i < $length; $i++) {
                    $hash = $message_hash[$i];
                    $this->futures[$hash] = $future;
                }
            }
            return $this->futures[$first_hash];
        } else {
            if (!array_key_exists($message_hash, $this->futures)) {
                $this->futures[$message_hash] = new Future($this->loop);
            }
            return $this->futures[$message_hash];
        }
    }

    public function resolve($result, $message_hash) {
        if ($this->verbose && ($message_hash === null)) {
            $this->print(date('c'), 'resolve received null messageHash');
        }
        if (array_key_exists($message_hash, $this->futures)) {
            $promise = $this->futures[$message_hash];
            unset($this->futures[$message_hash]);
            $promise->resolve($result);
        }
        return $result;
    }

    public function reject($result, $message_hash = null) {
        if ($message_hash) {
            if (array_key_exists($message_hash, $this->futures)) {
                $promise = $this->futures[$message_hash];
                unset($this->futures[$message_hash]);
                $promise->reject($result);
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

        if (!$this->loop) {
            throw new \ccxt\NotSupported('Client requires a reactphp event loop');
        }

        $this->connected = new Future($this->loop);
        $connector = new \React\Socket\Connector($this->loop);
        if ($this->noOriginHeader) {
            $this->connector = new NoOriginHeaderConnector($this->loop, $connector);
        } else {
            $this->connector = new \Ratchet\Client\Connector($this->loop, $connector);
        }
    }

    public function create_connection() {
        $connector = $this->connector;
        $timeout = $this->connectionTimeout / 1000;
        if ($this->verbose) {
            echo date('c'), ' connecting to ', $this->url, "\n";
        }
        Timer\timeout($connector($this->url), $timeout, $this->loop)->then(
            function($connection) {
                if ($this->verbose) {
                    echo date('c'), " connected\n";
                }
                $this->connection = $connection;
                $this->connection->on('message', array($this, 'on_message'));
                $this->connection->on('close', array($this, 'on_close'));
                $this->connection->on('error', array($this, 'on_error'));
                $this->connection->on('pong', array($this, 'on_pong'));
                $this->connected->resolve($this->url);
                $this->isConnected = true;
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
                $this->loop->addTimer(((float)$backoff_delay) / 1000, $callback);
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
        if ($this->gunzip) {
            $message = \ccxtpro\gunzip($message);
        } else if ($this->inflate) {
            $message = \ccxtpro\inflate($message);
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
        $this->connected->reject($error);
        $this->reject($error);
    }

    public function set_ping_interval() {
        if ($this->keepAlive) {
            $delay = ($this->keepAlive / 1000);
            $this->pingInterval = $this->loop->addPeriodicTimer($delay, array($this, 'on_ping_interval'));
        }
    }

    public function clear_ping_interval() {
        if ($this->pingInterval) {
            $this->loop->cancelTimer($this->pingInterval);
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

    public function print() {
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
