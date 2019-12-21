<?php

namespace ccxtpro;

trait ClientTrait {

    public $clients = array();
    public $loop = null;

    public function client($url) {
        if (!in_array($url, $this->clients)) {
            $on_message = array($this, 'handle_message');
            $on_error = array($this, 'on_error');
            $on_close = array($this, 'on_close');
            // decide client type here: ws / signalr / socketio
            $config = array('loop' => $this->loop);
            $this->clients[$url] = new Client($url, $on_message, $on_error, $on_close, $config);
        }
        return $this->clients[$url];
    }

    // the ellipsis packing/unpacking requires PHP 5.6+ :(
    public function after($future, callable $method, ... $args) {
        return $future->then (function($result) use ($method, $args) {
            return $method(... $args);
        });
    }

    public function watch($url, $message_hash, $message, $subscribe_hash = null) {
        $client = $this->client($url);
        $backoff_delay = 0;
        $future = $client->future($message_hash);
        $connected = $client->connect($backoff_delay);
        $connected->then(
            function($result) {
                // if (message && !client.subscriptions[subscribeHash]) {
                //     client.subscriptions[subscribeHash] = true
                //     // todo: decouple signing from subscriptions
                //     message = this.signMessage (client, messageHash, message)
                //     client.send (message)
                // }
                echo "OK --------------------------------------------------------\n";
                exit();
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
}
