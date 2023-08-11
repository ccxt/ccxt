<?php

namespace ccxt\pro;

use React\EventLoop\Loop;
use React\Promise\Deferred;
use React\Promise\PromiseInterface;

class Future extends Deferred implements PromiseInterface {
    // implements PromiseInterface lets it be awaitable
    public function __construct() {
        parent::__construct();
    }

    public function then($onFulfilled = null, $onRejected = null, $onProgress = null) {
        return $this->promise()->then($onFulfilled, $onRejected);
    }

    public function resolve($value = null) {
        // from the docs
        // Unlike timers, tick callbacks are guaranteed to be executed in the order they are enqueued.
        Loop::futureTick(function () use ($value) {
            parent::resolve($value);
        });
    }

    public function reject($reason = null) {
        Loop::futureTick(function () use ($reason) {
            parent::reject($reason);
        });
    }
};
