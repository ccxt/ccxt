<?php

namespace ccxtpro;

class Future extends \React\Promise\Deferred {
    public $loop;

    public function __construct($loop = null) {
        parent::__construct();
        $this->loop = $loop;
    }

    public function then($onFulfilled = null, $onRejected = null, $progressHandler = null) {
        return $this->promise()->then($onFulfilled, $onRejected);
    }

    public function resolve($value = null) {
        // from the docs
        // Unlike timers, tick callbacks are guaranteed to be executed in the order they are enqueued.
        $this->loop->futureTick(function () use ($value) {
            parent::resolve($value);
        });
    }

    public function reject($reason = null) {
        $this->loop->futureTick(function () use ($reason) {
            parent::reject($reason);
        });
    }
};
