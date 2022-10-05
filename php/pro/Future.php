<?php

namespace ccxt\pro;

use React\EventLoop\Loop;
use React\Promise\Deferred;

class Future extends Deferred {
    public function __construct() {
        parent::__construct();
    }

    public function then($onFulfilled = null, $onRejected = null, $progressHandler = null) {
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
