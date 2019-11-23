<?php

/*

MIT License

Copyright (c) 2017 Igor Kroitor

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

*/

//-----------------------------------------------------------------------------

namespace ccxtpro;

use kornrunner\Eth;
use kornrunner\Secp256k1;
use kornrunner\Solidity;

$version = 'undefined';

trait WebSocketTrait {

    public $same = true;
    public $different = false;

    public static $VERSION = 'undefined';

    public function define_ws_api ($has) {
        $methods = is_array ($has) ? array_keys ($has) : array ();
        for ($i = 0; $i < count ($methods); $i++) {
            $method = $methods[$i];
            $pos = strpos ($method, 'Ws');
            if ($pos === false) {
                continue;
            }
            $underscoreMethod = static::underscore($method);
            $name = substr ($method, $pos);
            $entryName = $name . 'Message';
            $handlerName = 'handle_' . static::underscore ($name);
            $this->$entryName = function ($url, $messageHash, $subcribe = null) use ($handlerName) {
                return WebSocketClient::registerFuture ($url, $messageHash, \Closure::fromCallable (array ($this, 'handle_ws_message')), $this->apiKey, $subcribe)->then (function ($result) use ($handlerName) {
                    return $this->$handlerName ($result);
                });
            };
            $subscribeName = 'subscribe' . $name;
            $underscoreSubscribeName = static::underscore ($subscribeName);
            $subscribeX = function ($onResolved, $onRejected, ...$args) use ($underscoreMethod, $underscoreSubscribeName) {
                $p = $this->$underscoreMethod(...$args);
                $p->then(function ($result) use ($onResolved, $onRejected, $args, $underscoreSubscribeName) {
                    $onResolved($result);
                    $this->$underscoreSubscribeName($onResolved, $onRejected, ...$args);
                }, $onRejected);
            };
            $this->$subscribeName = $subscribeX;
            $this->$underscoreSubscribeName = $subscribeX;
        }
    }

    public function handle_ws_message ($client, $response) {
        $messageHash = $this->get_ws_message_hash ($client, $response);
        if (!(is_array ($client->futures) && array_key_exists ($messageHash, $client->futures))) {
            $this->handle_ws_dropped ($client, $response, $messageHash);
            return;
        }
        $future = $client->futures[$messageHash];
        $future->resolve ($response);
    }

    public function handle_ws_dropped ($client, $response, $messageHash) {}
}

class Exchange extends \ccxt\Exchange {

    use WebSocketTrait;
}

Exchange::$exchanges = array(
    'binance',
    'bitfinex',
    'bitmex',
    'kraken',
    'poloniex',
);

