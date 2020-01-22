<?php

namespace ccxtpro;

trait ClientTrait {

    public $clients = array();

    // streaming-specific options
    public $streaming = array(
        'keepAlive' => 30000,
        'heartbeat' => true,
        'ping' => null,
    );

    public $loop = null; // reactphp's loop

    public function inflate($string) {
        return zlib_decode(base64_decode($string));
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

    public function client($url) {
        if (!array_key_exists($url, $this->clients)) {
            $on_message = array($this, 'handle_message');
            $on_error = array($this, 'on_error');
            $on_close = array($this, 'on_close');
            $config = array_replace_recursive(array(
                'loop' => $this->loop, // reactphp-specific
            ), $this->streaming);
            $this->clients[$url] = new Client($url, $on_message, $on_error, $on_close, $config);
        }
        return $this->clients[$url];
    }

    // the ellipsis packing/unpacking requires PHP 5.6+ :(
    public function after($future, callable $method, ... $args) {
        return $future->then(function($result) use ($method, $args) {
            return $method($result, ... $args);
        });
    }

    public function afterAsync($future, callable $method, ... $args) {
        $await = new Future();
        $future->then(function($result) use ($method, $args, $await) {
            return $method($result, ... $args)->then(
                function($result) use ($await) {
                    $await->resolve($result);
                },
                function($error) use ($await) {
                    $await->reject($error);
                }
            );
        });
        return $await;
    }

    // the ellipsis packing/unpacking requires PHP 5.6+ :(
    public function afterDropped($future, callable $method, ... $args) {
        return $future->then(function($result) use ($method, $args) {
                return $method(... $args);
        });
    }

    public function spawn($method, ... $args) {
        $this->loop->futureTick(function () use ($method, $args) {
            try {
                $method(... $args);
            } catch (\Exception $e) {
                // todo: handle spawned errors
            }
        });
    }

    public function watch($url, $message_hash, $message = null, $subscribe_hash = null, $subscription = null) {
        $client = $this->client($url);
        // todo: calculate the backoff delay in php
        $backoff_delay = 0; // milliseconds
        $future = $client->future($message_hash);
        $connected = $client->connect($backoff_delay);
        $connected->then(
            function($result) use ($client, $message_hash, $message, $subscribe_hash, $subscription) {
                if ($message && !isset($client->subscriptions[$subscribe_hash])) {
                    $client->subscriptions[$subscribe_hash] = isset($subscription) ? $subscription : true;
                    // todo: decouple signing from subscriptions
                    $message = $this->sign_message($client, $message_hash, $message);
                    $client->send($message);
                }
            },
            function($error) {
                echo date('c '), get_class($error), ' ', $error->getMessage(), "\n";
                // we do nothing and don't return a resolvable value from here
                // we leave it in a rejected state to avoid triggering the
                // then-clauses that will follow (if any)
                // removing this catch will raise UnhandledPromiseRejection in JS
                // upon connection failure
            });
        return $future;
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

    public function close () {
        // todo: implement ClientTrait.php close
        // const clients = Object.values (this.clients || {})
        // for (let i = 0; i < clients.length; i++) {
        //     const client = clients[i]
        //     await client.close ()
        //     delete this.clients[client.url]
        // }
    }

    public function sign_message($client, $messag_hash, $message, $params = array()) {
        throw new \ccxt\NotSupported ($this->id . ' signMessage () not implemented yet');
    }
}
