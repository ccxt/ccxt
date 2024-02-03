<?php

namespace ccxt\pro;

use ccxt\async\Throttler;
use ccxt\BaseError;
use ccxt\ExchangeClosedByUser;
use ccxt\ExchangeError;
use Exception;
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
        return \ccxt\pro\inflate($data); // zlib_decode($data);
    }

    public function inflate64($data) {
        return \ccxt\pro\inflate64($data); // zlib_decode(base64_decode($data));
    }

    public function gunzip($data) {
        return \ccxt\pro\gunzip($data);
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

    public function client($url) : Client {
        if (!array_key_exists($url, $this->clients)) {
            $on_message = array($this, 'handle_message');
            $on_error = array($this, 'on_error');
            $on_close = array($this, 'on_close');
            $on_connected = array($this, 'on_connected');
            $ws_options = $this->safe_value($this->options, 'ws', array());
            $options = array_replace_recursive(array(
                'log' => array($this, 'log'),
                'verbose' => $this->verbose,
                'throttle' => new Throttler($this->tokenBucket),
            ), $this->streaming, $ws_options);
            $this->clients[$url] = new Client($url, $on_message, $on_error, $on_close, $on_connected, $options);
            $this->configure_proxy_client($this->clients[$url]);
        }
        return $this->clients[$url];
    }

    // the ellipsis packing/unpacking requires PHP 5.6+ :(
    public function spawn($method, ... $args) {
        $future = new Future();
        $promise = Async\async(function () use ($method, $args) {
            return Async\await($method(...$args));
        }) ();
        $promise->done(function ($result) use ($future){
            $future->resolve($result);
        }, function ($error) use ($future) {
            $future->reject($error);
        });
        return $future;
    }

    public function delay($timeout, $method, ... $args) {
        Loop::addTimer($timeout / 1000, function () use ($method, $args) {
            $this->spawn($method, ...$args);
        });
    }

    private function configure_proxy_client($client) {
        [ $httpProxy, $httpsProxy, $socksProxy ] = $this->check_ws_proxy_settings();
        $selected_proxy_address = $httpProxy ? $httpProxy : ($httpsProxy ? $httpsProxy : $socksProxy );
        $proxy_connector = $this->setProxyAgents($httpProxy, $httpsProxy, $socksProxy);
        $client->set_ws_connector($selected_proxy_address, $proxy_connector);
    }

    public function watch_multiple($url, $message_hashes, $message = null, $subscribe_hashes = null, $subscription = null) {
        $client = $this->client($url);

        // todo: calculate the backoff delay in php
        $backoff_delay = 0; // milliseconds

        $future = Future::race(array_map(array($client, 'future'), $message_hashes));

        $missing_subscriptions = array();
        if ($subscribe_hashes !== null) {
            for ($i = 0; $i < count($subscribe_hashes); $i++) {
                $subscribe_hash = $subscribe_hashes[$i];
                if (!array_key_exists($subscribe_hash, $client->subscriptions)) {
                    $missing_subscriptions[] = $subscribe_hash;
                    $client->subscriptions[$subscribe_hash] = $subscription ?? true;
                }
            }
        }

        $connected = $client->connect($backoff_delay);
        if ($missing_subscriptions) {
            $connected->then(
                function($result) use ($client, $message, $message_hashes, $subscribe_hashes, $future) {
                    // todo: add PHP async rate-limiting
                    // todo: decouple signing from subscriptions
                    $options = $this->safe_value($this->options, 'ws');
                    $cost = $this->safe_value ($options, 'cost', 1);
                    if ($message) {
                        if ($this->enableRateLimit) {
                            // add cost here |
                            //               |
                            //               V
                            \call_user_func($client->throttle, $cost)->then(function ($result) use ($client, $message, $message_hashes, $subscribe_hashes, $future) {
                                try {
                                    Async\await($client->send($message));
                                } catch (Exception $error) {
                                    $client->on_error($error);
                                }
                            });
                        } else {
                            try {
                                Async\await($client->send($message));
                            } catch (Exception $error) {
                                $client->on_error($error);
                            }
                        }
                    }
                },
                function($error) use ($client, $message_hashes, $subscribe_hashes, $future) {
                    $future->reject($error);
                    foreach ($subscribe_hashes as $subscribe_hash) {
                        unset($client->subscriptions[$subscribe_hash]);
                    }
                }
            );
        }
        return $future;
    }

    public function watch($url, $message_hash, $message = null, $subscribe_hash = null, $subscription = null) {
        $client = $this->client($url);

        // todo: calculate the backoff delay in php
        $backoff_delay = 0; // milliseconds
        if (($subscribe_hash == null) && array_key_exists($message_hash, $client->futures)) {
            return $client->futures[$message_hash];
        }
        $future = $client->future($message_hash);
        $subscribed = isset($client->subscriptions[$subscribe_hash]);
        if (!$subscribed) {
            $client->subscriptions[$subscribe_hash] = $subscription ?? true;
        }
        $connected = $client->connect($backoff_delay);
        if (!$subscribed) {
            $connected->then(
                function($result) use ($client, $message, $message_hash, $subscribe_hash) {
                    // todo: add PHP async rate-limiting
                    // todo: decouple signing from subscriptions
                    $options = $this->safe_value($this->options, 'ws');
                    $cost = $this->safe_value ($options, 'cost', 1);
                    if ($message) {
                        if ($this->enableRateLimit) {
                            // add cost here |
                            //               |
                            //               V
                            \call_user_func($client->throttle, $cost)->then(function ($result) use ($client, $message, $message_hash, $subscribe_hash) {
                                try {
                                    Async\await($client->send($message));
                                } catch (Exception $error) {
                                    $client->on_error($error);
                                }
                            });
                        } else {
                            try {
                                Async\await($client->send($message));
                            } catch (Exception $error) {
                                $client->on_error($error);
                            }
                        }
                    }
                },
                function($error) use ($client, $subscribe_hash, $message_hash) {
                    $client->reject($error, $message_hash);
                    unset($client->subscriptions[$subscribe_hash]);
                }
            );
        }
        return $future;
    }

    public function on_connected($client, $message = null) {
        // for user hooks
        // echo "Connected to " . $client->url . "\n";
    }

    public function on_error(Client $client, $error) {
        if (array_key_exists($client->url, $this->clients) && $this->clients[$client->url]->error) {
            unset($this->clients[$client->url]);
        }
    }

    public function on_close(Client $client, $message) {
        if ($client->error) {
            // connection closed by the user or due to an error, do nothing
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
            $client->error = new ExchangeClosedByUser ($this->id . ' closed by user');
            $client->close();
            $url = $client->url;
            unset($this->clients[$url]);
        }
    }

    public function __destruct() {
        parent::__destruct();
        $this->close();
    }

    public function load_order_book($client, $messageHash, $symbol, $limit = null, $params = array()) {
        return Async\async(function () use ($client, $messageHash, $symbol, $limit, $params) {
            if (!array_key_exists($symbol, $this->orderbooks)) {
                $client->reject(new ExchangeError($this->id . ' loadOrderBook() orderbook is not initiated'), $messageHash);
                return;
            }
            try {
                $stored = $this->orderbooks[$symbol];
                $maxRetries = $this->handle_option('watchOrderBook', 'maxRetries', 3);
                $tries = 0;
                while ($tries < $maxRetries) {
                    $orderBook = Async\await($this->fetch_order_book($symbol, $limit, $params));
                    $index = $this->get_cache_index($orderBook, $stored->cache);
                    if ($index >= 0) {
                        $stored->reset($orderBook);
                        $this->handle_deltas($stored, array_slice($stored->cache, $index));
                        $stored->cache = array();
                        $client->resolve($stored, $messageHash);
                        return;
                    }
                    $tries++;
                }
                $client->reject (new ExchangeError ($this->id . ' nonce is behind the cache after ' . strval($tries) . ' tries.' ), $messageHash);
                unset($this->clients[$client->url]);
            } catch (BaseError $e) {
                $client->reject($e, $messageHash);
                Async\await($this->load_order_book($client, $messageHash, $symbol, $limit, $params));
            }
        }) ();
    }
}
