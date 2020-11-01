<?php

namespace ccxtpro;

class Future extends \React\Promise\Deferred {
    private $cancelled;
    public $loop;

    public function __construct($loop = null) {
        $this->loop = $loop;
        $this->cancelled = false;
        parent::__construct(function () {
            $this->cancelled = true;
        });
    }

    public function then($onFulfilled = null, $onRejected = null) {
        return $this->promise()->then($onFulfilled, $onRejected);
    }

    public function resolve($value = null) {
        // from the docs
        // Unlike timers, tick callbacks are guaranteed to be executed in the order they are enqueued.
        $this->loop->futureTick(function () use ($value) {
            if (!$this->cancelled) {
                parent::resolve($value);
            }
        });
    }

    public function reject($reason = null) {
        $this->loop->futureTick(function () use ($reason) {
            if (!$this->cancelled) {
                parent::reject($reason);
            }
        });
    }
};