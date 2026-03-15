<?php

namespace ccxt\pro;

use Ratchet\Client\Connector;
use Ratchet\Client\WebSocket;
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
    public $options = array();

    public $cookies = array();

    public $on_message_callback;
    public $on_error_callback;
    public $on_close_callback;
    public $on_connected_callback;

    public $error;
    public $connecting;
    // public $connection_timer; // ?
    public $connectionTimeout = 30000;
    public $pingInterval;
    public $connectionInterval;
    public $keepAlive = 30000;
    public $maxPingPongMisses = 2.0;
    public $lastPong = null;
    public $ping = null;
    public $verbose = false; // verbose output
    public $gunzip = false;
    public $inflate = false;
    public $throttler = null;
    public $throttle = null;
    public $connection = null;
    public $connected; // connection-related Future
    public $closed = false;
    public $noOriginHeader = true;
    public $log = null;
    public $heartbeat = null;
    public int $cost = 1;
    public $timeframes = null;
    public $watchTradesForSymbols = null;
    public $watchOrderBookForSymbols = null;

    public $decompressBinary = true;

    public $binaryMessageDecoder = null; // custom decoder for binary messages (e.g., SBE)

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
        return $future;
    }

    public function reusable_future($message_hash) {
        return $this->future($message_hash);  // only used in go
    }

    public function reusableFuture($message_hash) {
        return $this->future($message_hash);  // only used in go
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
    }

    public function set_ws_connector($proxy_address = null, $proxy_conenctor = null) {
        // set default connector
        if (!$proxy_address) {
            $react_default_connector = new React\Socket\Connector();
            if ($this->noOriginHeader) {
                $this->connector = new NoOriginHeaderConnector(Loop::get(), $react_default_connector);
            } else {
                $this->connector = new Connector(Loop::get(), $react_default_connector);
            }
        } else {
            if ($this->noOriginHeader) {
                $this->connector = new NoOriginHeaderConnector(Loop::get(), $proxy_conenctor);
            } else {
                $this->connector = new Connector(Loop::get(), $proxy_conenctor);
            }
        }
    }

    public function create_connection() {
        return React\Async\async(function () {
            $timeout = $this->connectionTimeout / 1000;
            if ($this->verbose) {
                echo date('c'), ' connecting to ', $this->url, "\n";
            }
            $headers = property_exists($this, 'options') && array_key_exists('headers', $this->options) ? $this->options['headers'] : [];
            if (is_array($this->cookies) && count($this->cookies)) {
                $cookie_string = '';
                foreach ($this->cookies as $key => $value) {
                    $cookie_string .= $key . '=' . $value . '; ';
                }
                $headers['Cookie'] = rtrim($cookie_string, '; ');
            }
            $promise = call_user_func($this->connector, $this->url, [], $headers);
            Timer\timeout($promise, $timeout, Loop::get())->then(
                function(WebSocket $connection) {
                    if ($this->verbose) {
                        echo date('c'), " connected\n";
                    }
                    $this->connection = $connection;
                    $this->connection->on('message', array($this, 'on_message'));
                    $this->connection->on('close', array($this, 'on_close'));
                    $this->connection->on('error', array($this, 'on_error'));
                    $this->connection->on('pong', array($this, 'on_pong'));
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
        })();
    }

    public function connect($backoff_delay = 0) {
        if (($this->connection == null) && !$this->connecting) {
            $this->connecting = true;
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
        return React\Async\async(function () use ($data) {
            $message = is_string($data) ? $data : Exchange::json($data);
            if ($this->verbose) {
                echo date('c'), ' sending ', $message, "\n";
            }
            return $this->connection->send($message);
        })();
    }

    public function close() {
        foreach ($this->futures as $future) {
            $future->cancel();
        }
        $this->clear_ping_interval();
        if ($this->connection !== null) {
            $this->connection->removeListener('close', array($this, 'on_close'));
            $this->connection->close();
        }
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
        $is_binary = preg_match('~[^\x20-\x7E\t\r\n]~', $message) > 0;
        $message_data = (string) $message;
        
        if ($is_binary) { // only decompress if the message is a binary
            if ($this->gunzip) {
                $message_data = \ccxt\pro\gunzip($message_data);
            } else if ($this->inflate) {
                $message_data = \ccxt\pro\inflate($message_data);
            } else if ($this->binaryMessageDecoder) {
                // Custom binary message decoder (e.g., for SBE)
                // Convert message to binary string if needed
                $binary_data = $message_data;
                try {
                    $decoded = call_user_func($this->binaryMessageDecoder, $binary_data);
                    $message_data = $decoded;
                    if ($this->verbose) {
                        echo date('c'), ' on_message decoded binary ', json_encode($message_data), "\n";
                    }
                } catch (Exception $e) {
                    if ($this->verbose) {
                        echo date('c'), ' binaryMessageDecoder error ', $e->getMessage(), "\n";
                    }
                    // If binary decoding fails, fall back to normal handling
                    if ($this->decompressBinary) {
                        $message_data = (string) $message;
                    }
                }
            } else {
                if ($this->decompressBinary) {
                    $message_data = (string) $message;
                }
            }
        }

        try {
            if ($this->verbose) {
                echo date('c'), ' on_message ', is_string($message_data) ? $message_data : json_encode($message_data), "\n";
            }
            // Only try to parse as JSON if it's a string and looks like JSON
            if (is_string($message_data) && Exchange::is_json_encoded_object($message_data)) {
                $message_data = json_decode($message_data, true);
            }
        } catch (Exception $e) {
            if ($this->verbose) {
                echo date('c'), ' on_message json_decode ', $e->getMessage(), "\n";
            }
            // reset with a json encoding error?
        }
        try {
            $on_message_callback = $this->on_message_callback;
            $on_message_callback($this, $message_data);
        } catch (Exception $error) {
            $this->reject($error);
        }
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
        if ($this->keepAlive && !$this->closed) {
            $now = $this->milliseconds();
            $this->lastPong = isset ($this->lastPong) ? $this->lastPong : $now;
            if (($this->lastPong + $this->keepAlive * $this->maxPingPongMisses) < $now) {
                $this->on_error(new RequestTimeout('Connection to ' . $this->url . ' timed out due to a ping-pong keepalive missing on time'));
            } else {
                if ($this->ping) {
                    try {
                        $this->send(call_user_func($this->ping, $this));
                    } catch (Exception $e) {
                        $this->on_error($e);
                    }
                } else {
                    try {
                        $this->connection->send(new Frame('', true, Frame::OP_PING));
                    } catch (Exception $e) {
                        $this->on_error($e);
                    }
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
