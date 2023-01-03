<?php

namespace ccxt\pro;

use ccxt\async\Throttle;
use React\Async;
use React\EventLoop\Loop;

trait ClientTrait {

    public $clients = array();

    // streaming-specific options
    public $streaming = array(
        'keepAlive' => 30000,
        'heartbeat' => true,
        'ping' => null,
        'maxPingPongMisses' => 2.0,
    );

    public $newUpdates = true;

    public function inflate($data) {
        return \ccxtpro\inflate($data); // zlib_decode($data);
    }

    public function inflate64($data) {
        return \ccxtpro\inflate64($data); // zlib_decode(base64_decode($data));
    }

    public function gunzip($data) {
        return \ccxtpro\gunzip($data);
    }

    public function order_book ($snapshot = array(), $depth = PHP_INT_MAX) {
        return new OrderBook($snapshot, $depth);
    }

    public function indexed_order_book($snapshot = array(), $depth = PHP_INT_MAX) {
        return new IndexedOrderBook($snapshot, $depth);
    }

    public function counted_order_book($snapshot = array(), $depth = PHP_INT_MAX) {
        return new CountedOrderBook($snapshot, $depth);
    }

    public function calculate_rate_limit_config($rate_limit_config) {
        $rate_limit = $this->safe_number($rate_limit_config, 'rateLimit');
        $config = $this->extend(array(
            'delay' => 0.001,
            'capacity' => 1,
            'cost' => 1,
            'maxCapacity' => 1000,
            'refillRate' => ($this->rateLimit > 0) ? 1.0 / $this->rateLimit : PHP_INT_MAX,
        ), $rate_limit_config);
        return $config;
    }

    public function client($url) {
        $ws_options = $this->safe_value($this->options, 'ws', array());
        # get ws rl config
        $rate_limits = $this->safe_value($ws_options, 'rateLimits', array());
        # if no rateLimit is defined in the WS implementation, we fallback to the ccxt one
        $default_rate_limit_config = $this->safe_value($rate_limits, 'default', $this->tokenBucket);
        $default_rate_limit_config = $this->calculate_rate_limit_config($default_rate_limit_config);
        if (!array_key_exists($this, 'clients')) {
            # get new connections rl config if not fallback to default
            $new_connections_limit_config = $this.safe_value($rate_limits, 'newConnections', $default_rate_limit_config);
            $new_connections_limit_config = $this->calculate_rate_limit_config($new_connections_limit_config);
            $this->clients = array(
                'throttle' => new Throttler($new_connections_limit_config, $this->asyncio_loop),
            );
        }
        if (!array_key_exists($url, $this->clients)) {
            $on_message = array($this, 'handle_message');
            $on_error = array($this, 'on_error');
            $on_close = array($this, 'on_close');
            $on_connected = array($this, 'on_connected');
            # allowing specify rate limits per url, if not specified use default
            $rate_limit_config = $this->safe_value($rate_limits, $url, $default_rate_limit_config);
            $rate_limit_config = $this->calculate_rate_limit_config($rate_limit_config);
            $options = array_replace_recursive(array(
                'log' => array($this, 'log'),
                'verbose' => $this->verbose,
                'throttle' => new Throttle($rate_limit_config),
            ), $this->streaming, $ws_options);
            $this->clients[$url] = new Client($url, $on_message, $on_error, $on_close, $on_connected, $options);
        }
        return $this->clients[$url];
    }

    // the ellipsis packing/unpacking requires PHP 5.6+ :(
    public function spawn($method, ... $args) {
        return Async\async(function () use ($method, $args) {
            return Async\await($method(...$args));
        }) ();
    }

    public function delay($timeout, $method, ... $args) {
        Loop::addTimer($timeout / 1000, function () use ($method, $args) {
            $this->spawn($method, ...$args);
        });
    }

    public function watch($url, $message_hash, $message = null, $subscribe_hash = null, $subscription = null) {
        $client = $this->client($url);
        // todo: calculate the backoff delay in php
        $backoff_delay = 0; // milliseconds
        $future = $client->future($message_hash);
        $connected;
        if ($this->enableRateLimit) {
            $connected = $this->clients->throttle()->then(
                function () use ($client, $backoff_delay) {
                    return $client->connect($backoff_delay);
                }
            );
        } else {
            $connected = $client->connect($backoff_delay);
        }
        $connected->then(
            function($result) use ($client, $message_hash, $message, $subscribe_hash, $subscription) {
                if (!isset($client->subscriptions[$subscribe_hash])) {
                    $client->subscriptions[$subscribe_hash] = isset($subscription) ? $subscription : true;
                    // todo: add PHP async rate-limiting
                    // todo: decouple signing from subscriptions
                    $options = $this->safe_value($this->options, 'ws');
                    $cost = $this->safe_value ($options, 'cost', 1);
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
        return $future;
    }

    public function on_connected($client, $message = null) {
        // for user hooks
        // echo "Connected to " . $client->url . "\n";
    }

    public function on_error($client, $error) {
        if (array_key_exists($client->url, $this->clients) && $this->clients[$client->url]->error) {
            unset($this->clients[$client->url]);
        }
    }

    public function on_close($client, $message) {
        if ($client->error) {
            // connection closed due to an error, do nothing
        } else {
            // server disconnected a working connection
            if (array_key_exists($client->url, $this->clients)) {
                unset($this->clients[$client->url]);
            }
        }
    }

    public function close() {
        // make sure to close the exchange once you are finished using the websocket connections
        // so that the event loop can complete it's work and go to sleep
        foreach ($this->clients as $client) {
            $client->close();
        }
    }

    public function __destruct() {
        parent::__destruct();
        $this->close();
    }

    public function find_timeframe($timeframe, $timeframes = null) {
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
}
