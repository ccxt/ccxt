<?php

namespace ccxtpro;

trait ClientTrait {

    public $clients = array();
    public $loop = null;

    public function order_book ($snapshot = array()) {
        return new OrderBook($snapshot);
    }

    public function limited_order_book($snapshot = array(), $depth = null) {
        return new LimitedOrderBook($snapshot, $depth);
    }

    public function indexed_order_book($snapshot = array()) {
        return new IndexedOrderBook($snapshot);
    }

    public function limited_indexed_order_book($snapshot = array(), $depth = null) {
        return new LimitedIndexedOrderBook($snapshot, $depth);
    }

    public function limited_counted_order_book($snapshot = array(), $depth = null) {
        return new LimitedCountedOrderBook($snapshot, $depth);
    }

    public function counted_order_book($snapshot = array()) {
        return new CountedOrderBook($snapshot);
    }

    public function client($url) {
        if (!array_key_exists($url, $this->clients)) {
            $on_message = array($this, 'handle_message');
            $on_error = array($this, 'on_error');
            $on_close = array($this, 'on_close');
            // decide client type here: ws / signalr / socketio
            $config = array('loop' => $this->loop);
            $this->clients[$url] = new Client($url, $on_message, $on_error, $on_close, $config);
        }
        return $this->clients[$url];
    }

    public function call($method, ... $args) {
        return $method(... $args);
    }

    public function callAsync($method, ... $args) {
        return $method(... $args);
    }

    // the ellipsis packing/unpacking requires PHP 5.6+ :(
    public function after($future, callable $method, ... $args) {
        return $future->then (function($result) use ($method, $args) {
            return $method($result, ... $args);
        });
    }

    public function spawn($method, ... $args) {
        echo date('c '), "spawn\n";
        $this->loop->futureTick(function () use ($method, $args) {
            echo date('c '), "spawn futureTick\n";
            try {
                $method(... $args);
            } catch (\Exception $e) {
                // todo: handle spawned errors
                throw $e;
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
                // echo "OK --------------------------------------------------------\n";
                // exit();
                // var_dump($result);
            },
            function($error) {
                echo date('c '), get_class($error), ' ', $error->getMessage(), "\n";
                echo "ERROR -----------------------------------------------------\n";
                exit();
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

}
