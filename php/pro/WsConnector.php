<?php

namespace ccxt\pro;

use ccxt\async\Throttle;
use React\Async;
use React\EventLoop\Loop;

class WsConnector {

    public $clients = array();
    public $options = array();
    public $log;
    public $ping;
    public $get_enable_rate_limit;
    public $get_token_bucket;
    public $get_verbose_mode;
    public $get_keep_alive;
    public $get_max_ping_pong_misses;
    public $get_gunzip;
    public $get_inflate;
    public $get_cost;

    public function __construct($options = array()) {
        $this->options = $options;
        $this->get_token_bucket = Exchange::safe_value($options, 'get_token_bucket');
        $this->get_verbose_mode = Exchange::safe_value($options, 'get_verbose_mode');
        $this->get_enable_rate_limit = Exchange::safe_value($options, 'get_enable_rate_limit');
        $this->get_keep_alive = Exchange::safe_value($options, 'get_keep_alive');
        $this->get_max_ping_pong_misses = Exchange::safe_value($options, 'get_max_ping_pong_misses');
        $this->get_gunzip = Exchange::safe_value($options, 'get_gunzip');
        $this->get_inflate = Exchange::safe_value($options, 'get_inflate');
        $this->get_cost = Exchange::safe_value($options, 'get_cost');
        $this->ping = Exchange::safe_value($options, 'ping');
        $this->log = Exchange::safe_value($options, 'log');
    }

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
            // $ws_options = Exchange::safe_value($this->options, 'ws', array());
            // $options = array_replace_recursive(array(
            //     'log' => array($this, 'log'),
            //     'ping' => array($this, 'ping'),
            //     'verbose' => $this->verbose,
            //     'throttle' => new Throttle($this->tokenBucket),
            // ), $this->streaming, $ws_options);
            $options = array (
                'log' => array($this, 'log'),
                'ping' => array($this, 'ping'),
                'throttle' => new Throttle(($this->get_token_bucket)()),
                'get_verbose_mode' => $this->get_verbose_mode,
                'get_enable_rate_limit' => $this->get_enable_rate_limit,
                'get_keep_alive' => $this->get_keep_alive,
                'get_max_ping_pong_misses' => $this->get_max_ping_pong_misses,
                'get_gunzip' => $this->get_gunzip,
                'get_inflate'=> $this->get_inflate,
            );
            $this->clients[$url] = new Client($url, $on_message, $on_error, $on_close, $on_connected, $options);
        }
        return $this->clients[$url];
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
                    $cost = ($this->get_cost)();
                    if ($message) {
                        if (($this->get_enable_rate_limit)()) {
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
