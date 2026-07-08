<?php

namespace ccxt\pro;

use React\EventLoop\Loop;
use React\Promise\Deferred;
use React\Promise\PromiseInterface;
use RuntimeException;

use function React\Promise\race;

class Future implements PromiseInterface {
    private Deferred $deferred;
    private bool $hasListeners = false;

    // implements PromiseInterface lets it be awaitable
    public function __construct() {
        $this->deferred = new Deferred();
    }

    public function then(?callable $onFulfilled = null, ?callable $onRejected = null): PromiseInterface {
        $this->hasListeners = true;
        return $this->deferred->promise()->then($onFulfilled, $onRejected);
    }

    public function resolve($value = null) {
        // from the docs
        // Unlike timers, tick callbacks are guaranteed to be executed in the order they are enqueued.
        Loop::futureTick(function () use ($value) {
            $this->deferred->resolve($value);
        });
    }

    public function reject($reason = null) {
        Loop::futureTick(function () use ($reason) {
            $this->deferred->reject($reason);
        });
    }

    public function catch(callable $onRejected): PromiseInterface {
        $this->hasListeners = true;
        return $this->deferred->promise()->catch($onRejected);
    }

    public function finally(callable $onFulfilledOrRejected): PromiseInterface {
        $this->hasListeners = true;
        return $this->deferred->promise()->finally($onFulfilledOrRejected);
    }

    public function cancel(): void {
        if ($this->hasListeners) {
            $this->deferred->reject(new RuntimeException('Promise has been canceled'));
        } else {
            $this->deferred->promise()->cancel();
        }
    }

    public function otherwise(callable $onRejected): PromiseInterface {
        // deprecated
        return $this->deferred->promise()->otherwise($onRejected);
    }

    public function always(callable $onFulfilledOrRejected): PromiseInterface {
        // deprecated
        return $this->deferred->promise()->always($onFulfilledOrRejected);
    }

    public static function race(array $futures): Future {
        $future = new Future();
        $promise = race($futures);
        $promise->then(array($future, 'resolve'), array($future, 'reject'));
        return $future;
    }
};
