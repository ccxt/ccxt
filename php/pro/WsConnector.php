<?php

namespace ccxt\pro;

use ccxt\async\Throttle;
use React\Async;
use React\EventLoop\Loop;

class WsConnector {

    public $clients = array();
    public $options = array();
    public $verbose = false;
    public $tokenBucket;
    public $enableRateLimit = false;

    public function __construct($options = array()) {
        $this->options = $options;
        $this->verbose = Exchange::safe_value($options, 'verbose', false);
        $this->tokenBucket = Exchange::safe_value($options, 'tokenBucket', null);
        $this->enableRateLimit = Exchange::safe_value($options, 'enableRateLimit', false);
    }

    // streaming-specific options
    public $streaming = array(
        'keepAlive' => 30000,
        'heartbeat' => true,
        'ping' => null,
        'maxPingPongMisses' => 2.0,
    );

    public $newUpdates = true;

    function inflate($data) {
        return \ccxt\pro\inflate($data); // zlib_decode($data);
    }

    function inflate64($data) {
        return \ccxt\pro\inflate64($data); // zlib_decode(base64_decode($data));
    }

    function gunzip($data) {
        return \ccxt\pro\gunzip($data);
    }

    function order_book ($snapshot = array(), $depth = PHP_INT_MAX) {
        return new OrderBook($snapshot, $depth);
    }


    function orderBook ($snapshot = array(), $depth = PHP_INT_MAX) {
        return new OrderBook($snapshot, $depth);
    }

    function indexed_order_book($snapshot = array(), $depth = PHP_INT_MAX) {
        return new IndexedOrderBook($snapshot, $depth);
    }

    function IndexedOrderBook($snapshot = array(), $depth = PHP_INT_MAX) {
        return new IndexedOrderBook($snapshot, $depth);
    }

    function counted_order_book($snapshot = array(), $depth = PHP_INT_MAX) {
        return new CountedOrderBook($snapshot, $depth);
    }

    function CountedOrderBook($snapshot = array(), $depth = PHP_INT_MAX) {
        return new CountedOrderBook($snapshot, $depth);
    }

    function client($url) {
        if (!array_key_exists($url, $this->clients)) {
            $on_message = Exchange::safe_value($this->options, 'handle_message');
            $on_error = array($this, 'on_error');
            $on_close = array($this, 'on_close');
            $on_connected = array($this, 'on_connected');
            $ws_options = Exchange::safe_value($this->options, 'ws', array());
            $options = array_replace_recursive(array(
                'log' => array($this, 'log'),
                'verbose' => $this->verbose,
                'throttle' => new Throttle($this->tokenBucket),
            ), $this->streaming, $ws_options);
            $this->clients[$url] = new Client($url, $on_message, $on_error, $on_close, $on_connected, $options);
        }
        return $this->clients[$url];
    }

    // the ellipsis packing/unpacking requires PHP 5.6+ :(
    function spawn($method, ... $args) {
        return Async\async(function () use ($method, $args) {
            return Async\await($method(...$args));
        }) ();
    }

    function delay($timeout, $method, ... $args) {
        Loop::addTimer($timeout / 1000, function () use ($method, $args) {
            $this->spawn($method, ...$args);
        });
    }

    function watch($url, $message_hash, $message = null, $subscribe_hash = null, $subscription = null) {
        $client = $this->client($url);
        // todo: calculate the backoff delay in php
        $backoff_delay = 0; // milliseconds
        $future = $client->future($message_hash);
        $connected = $client->connect($backoff_delay);
        $connected->then(
            function($result) use ($client, $message_hash, $message, $subscribe_hash, $subscription) {
                if (!isset($client->subscriptions[$subscribe_hash])) {
                    $client->subscriptions[$subscribe_hash] = isset($subscription) ? $subscription : true;
                    // todo: add PHP async rate-limiting
                    // todo: decouple signing from subscriptions
                    $options = Exchange::safe_value($this->options, 'ws');
                    $cost = Exchange::safe_value ($options, 'cost', 1);
                    if ($message) {
                        if ($this->enableRateLimit) {
                            // add cost here |
                            //               |
                            //               V
                            \call_user_func($client->throttle, $cost)->then(function ($result) use ($client, $message) {
                                $client->send($message);
                            });
                        } else {
                            $client->send($message);
                        }
                    }
                }
            }
        );
        return $future->promise();
    }

    function on_connected($client, $message = null) {
        // for user hooks
        // echo "Connected to " . $client->url . "\n";
    }

    function on_error($client, $error) {
        if (array_key_exists($client->url, $this->clients) && $this->clients[$client->url]->error) {
            unset($this->clients[$client->url]);
        }
    }

    function on_close($client, $message) {
        if ($client->error) {
            // connection closed due to an error, do nothing
        } else {
            // server disconnected a working connection
            if (array_key_exists($client->url, $this->clients)) {
                unset($this->clients[$client->url]);
            }
        }
    }

    function close() {
        // make sure to close the exchange once you are finished using the websocket connections
        // so that the event loop can complete it's work and go to sleep
        foreach ($this->clients as $client) {
            $client->close();
        }
    }

    function __destruct() {
        // parent::__destruct();
        $this->close();
    }

    function find_timeframe($timeframe, $timeframes = null) {
        $timeframes = $timeframes ? $timeframes : $this->timeframes;
        $keys = array_keys($timeframes);
        for ($i = 0; $i < count($keys); $i++) {
            $key = $keys[$i];
            if ($timeframes[$key] === $timeframe) {
                return $key;
            }
        }
        return null;
    }

    public function formatScientificNotationFTX($n) {
        if ($n === 0) {
            return '0e-00';
        }
        return str_replace('E-', 'e-0', sprintf('g', $n));
    }
}
