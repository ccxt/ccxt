<?php

namespace ccxtpro;

trait ClientTrait {

    public $clients = array();
    public $loop = null;

    public function client($url) {
        if (!in_array($url, $this->clients)) {
            $on_message = array ($this, 'handle_message');
            $on_error = array ($this, 'on_error');
            $on_close = array ($this, 'on_close');
            // decide client type here: ws / signalr / socketio
            $config = array('loop' => $this->loop);
            $this->clients[$url] = new Client($url, $on_message, $on_error, $on_close, $config);
        }
        return $this->clients[$url];
    }

    public function after($future, $method, ... $args) {
        return $future->then (function ($result) use ($method, $args) {
            return $method(... $args);
        });
    }

    public function watch($url, $message_hash, $message, $subscribe_hash = null) {

        $client = $this->client($url);
        $backoff_delay = 0;
        $future = $client->future($message_hash);
        echo "EVERYTHING ALRIGHT SO FAR (WIP)\n";
        exit();
        $client->connect($backoff_delay)->then(function ($result) {
            echo "OK --------------------------------------------------------\n";
            var_dump($result);
        }, function ($result) {
            echo "ERROR -----------------------------------------------------\n";
            var_dump($result);
        });
        return $future;

        // ....................................................................
        // watch (url, messageHash, message = undefined, subscribeHash = undefined) {
        //     const client = this.client (url)
        //     // todo: calculate the backoff using the clients cache
        //     const backoffDelay = 0
        //     const future = client.future (messageHash)
        //     // we intentionally do not use await here to avoid unhandled exceptions
        //     // the policy is to make sure that 100% of promises are resolved or rejected
        //     // either with a call to client.resolve or client.reject with
        //     //  a proper exception class instance
        //     const connected = client.connect (backoffDelay)
        //     // the following is executed only if the catch-clause does not
        //     // catch any connection-level exceptions from the client
        //     // (connection established successfully)
        //     connected.then (() => {
        //         if (message && !client.subscriptions[subscribeHash]) {
        //             client.subscriptions[subscribeHash] = true
        //             // todo: decouple signing from subscriptions
        //             message = this.signWsMessage (client, messageHash, message)
        //             client.send (message)
        //         }
        //     }).catch ((error) => {
        //         // we do nothing and don't return a resolvable value from here
        //         // we leave it in a rejected state to avoid triggering the
        //         // then-clauses that will follow (if any)
        //         // removing this catch will raise UnhandledPromiseRejection in JS
        //         // upon connection failure
        //     })
        //     return future
        // }

        // ....................................................................
        // def watch(self, url, message_hash, message=None, subscribe_hash=None):
        //     client = self.client(url)
        //     future = client.future(message_hash)
        //     # we intentionally do not use await here to avoid unhandled exceptions
        //     # the policy is to make sure that 100% of promises are resolved or rejected
        //     asyncio.ensure_future(self.connect_ws_client(client, message_hash, message, subscribe_hash))
        //     return future

        // ....................................................................
        // public static function registerFuture ($url, $message_hash, $entry, $apikey, $subscribe = null) {
        //     $index = $url . $apikey != null ? ('#' . $apikey) : '';
        //     if (array_key_exists ($index, StreamingClient::$clients)) {
        //         $client = StreamingClient::$clients[$index];
        //     } else {
        //         $client = new StreamingClient ($url, $entry);
        //         StreamingClient::$clients[$index] = $client;
        //     }
        //     if (array_key_exists ($message_hash, $client->futures)) {
        //         $future = $client->futures[$message_hash];
        //     } else {
        //         $future = new Future ();
        //         $client->futures[$message_hash] = $future;
        //     }
        //     if ($subscribe == null) {
        //         $client->connect ();
        //     } else if (!(array_key_exists($message_hash, $client->subscriptions) && $client->subscriptions[$message_hash])) {
        //         $client->send ($subscribe);
        //         $client->subscriptions[$message_hash] = true;
        //     }
        //     return $future->promise ()->then (function ($result) use ($client, $message_hash) {
        //         unset ($client->futures[$message_hash]);
        //         return $result;
        //     });
        // }
    }

    // ------------------------------------------------------------------------
    // the code below is obsolete
    //
    // public function define_ws_api ($has) {
    //     $methods = is_array ($has) ? array_keys ($has) : array ();
    //     for ($i = 0; $i < count ($methods); $i++) {
    //         $method = $methods[$i];
    //         $pos = strpos ($method, 'Ws');
    //         if ($pos === false) {
    //             continue;
    //         }
    //         $underscoreMethod = static::underscore($method);
    //         $name = substr ($method, $pos);
    //         $entryName = $name . 'Message';
    //         $handlerName = 'handle_' . static::underscore ($name);
    //         $this->$entryName = function ($url, $messageHash, $subcribe = null) use ($handlerName) {
    //             return StreamingClient::registerFuture ($url, $messageHash, \Closure::fromCallable (array ($this, 'handle_message')), $this->apiKey, $subcribe)->then (function ($result) use ($handlerName) {
    //                 return $this->$handlerName ($result);
    //             });
    //         };
    //         $subscribeName = 'subscribe' . $name;
    //         $underscoreSubscribeName = static::underscore ($subscribeName);
    //         $subscribeX = function ($onResolved, $onRejected, ...$args) use ($underscoreMethod, $underscoreSubscribeName) {
    //             $p = $this->$underscoreMethod(...$args);
    //             $p->then(function ($result) use ($onResolved, $onRejected, $args, $underscoreSubscribeName) {
    //                 $onResolved($result);
    //                 $this->$underscoreSubscribeName($onResolved, $onRejected, ...$args);
    //             }, $onRejected);
    //         };
    //         $this->$subscribeName = $subscribeX;
    //         $this->$underscoreSubscribeName = $subscribeX;
    //     }
    // }
    //
    // public function handle_message ($client, $response) {
    //     $messageHash = $this->get_ws_message_hash ($client, $response);
    //     if (!(is_array ($client->futures) && array_key_exists ($messageHash, $client->futures))) {
    //         $this->handle_dropped ($client, $response, $messageHash);
    //         return;
    //     }
    //     $future = $client->futures[$messageHash];
    //     $future->resolve ($response);
    // }
    //
    // public function handle_dropped ($client, $response, $messageHash) {}

}
