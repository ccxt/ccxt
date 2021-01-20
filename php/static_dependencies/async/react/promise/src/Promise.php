<?php

namespace React\Promise;

class Promise implements ExtendedPromiseInterface, CancellablePromiseInterface
{
    private $canceller;
    private $result;

    private $handlers = [];
    private $progressHandlers = [];

    private $requiredCancelRequests = 0;
    private $cancelRequests = 0;

    public function __construct(callable $resolver, callable $canceller = null)
    {
        $this->canceller = $canceller;

        // Explicitly overwrite arguments with null values before invoking
        // resolver function. This ensure that these arguments do not show up
        // in the stack trace in PHP 7+ only.
        $cb = $resolver;
        $resolver = $canceller = null;
        $this->call($cb);
    }

    public function then(callable $onFulfilled = null, callable $onRejected = null, callable $onProgress = null)
    {
        if (null !== $this->result) {
            return $this->result->then($onFulfilled, $onRejected, $onProgress);
        }

        if (null === $this->canceller) {
            return new static($this->resolver($onFulfilled, $onRejected, $onProgress));
        }

        // This promise has a canceller, so we create a new child promise which
        // has a canceller that invokes the parent canceller if all other
        // followers are also cancelled. We keep a reference to this promise
        // instance for the static canceller function and clear this to avoid
        // keeping a cyclic reference between parent and follower.
        $parent = $this;
        ++$parent->requiredCancelRequests;

        return new static(
            $this->resolver($onFulfilled, $onRejected, $onProgress),
            static function () use (&$parent) {
                if (++$parent->cancelRequests >= $parent->requiredCancelRequests) {
                    $parent->cancel();
                }

                $parent = null;
            }
        );
    }

    public function done(callable $onFulfilled = null, callable $onRejected = null, callable $onProgress = null)
    {
        if (null !== $this->result) {
            return $this->result->done($onFulfilled, $onRejected, $onProgress);
        }

        $this->handlers[] = static function (ExtendedPromiseInterface $promise) use ($onFulfilled, $onRejected) {
            $promise
                ->done($onFulfilled, $onRejected);
        };

        if ($onProgress) {
            $this->progressHandlers[] = $onProgress;
        }
    }

    public function otherwise(callable $onRejected)
    {
        return $this->then(null, static function ($reason) use ($onRejected) {
            if (!_checkTypehint($onRejected, $reason)) {
                return new RejectedPromise($reason);
            }

            return $onRejected($reason);
        });
    }

    public function always(callable $onFulfilledOrRejected)
    {
        return $this->then(static function ($value) use ($onFulfilledOrRejected) {
            return resolve($onFulfilledOrRejected())->then(function () use ($value) {
                return $value;
            });
        }, static function ($reason) use ($onFulfilledOrRejected) {
            return resolve($onFulfilledOrRejected())->then(function () use ($reason) {
                return new RejectedPromise($reason);
            });
        });
    }

    public function progress(callable $onProgress)
    {
        return $this->then(null, null, $onProgress);
    }

    public function cancel()
    {
        if (null === $this->canceller || null !== $this->result) {
            return;
        }

        $canceller = $this->canceller;
        $this->canceller = null;

        $this->call($canceller);
    }

    private function resolver(callable $onFulfilled = null, callable $onRejected = null, callable $onProgress = null)
    {
        return function ($resolve, $reject, $notify) use ($onFulfilled, $onRejected, $onProgress) {
            if ($onProgress) {
                $progressHandler = static function ($update) use ($notify, $onProgress) {
                    try {
                        $notify($onProgress($update));
                    } catch (\Throwable $e) {
                        $notify($e);
                    } catch (\Exception $e) {
                        $notify($e);
                    }
                };
            } else {
                $progressHandler = $notify;
            }

            $this->handlers[] = static function (ExtendedPromiseInterface $promise) use ($onFulfilled, $onRejected, $resolve, $reject, $progressHandler) {
                $promise
                    ->then($onFulfilled, $onRejected)
                    ->done($resolve, $reject, $progressHandler);
            };

            $this->progressHandlers[] = $progressHandler;
        };
    }

    private function reject($reason = null)
    {
        if (null !== $this->result) {
            return;
        }

        $this->settle(reject($reason));
    }

    private function settle(ExtendedPromiseInterface $promise)
    {
        $promise = $this->unwrap($promise);

        if ($promise === $this) {
            $promise = new RejectedPromise(
                new \LogicException('Cannot resolve a promise with itself.')
            );
        }

        $handlers = $this->handlers;

        $this->progressHandlers = $this->handlers = [];
        $this->result = $promise;
        $this->canceller = null;

        foreach ($handlers as $handler) {
            $handler($promise);
        }
    }

    private function unwrap($promise)
    {
        $promise = $this->extract($promise);

        while ($promise instanceof self && null !== $promise->result) {
            $promise = $this->extract($promise->result);
        }

        return $promise;
    }

    private function extract($promise)
    {
        if ($promise instanceof LazyPromise) {
            $promise = $promise->promise();
        }

        return $promise;
    }

    private function call(callable $cb)
    {
        // Explicitly overwrite argument with null value. This ensure that this
        // argument does not show up in the stack trace in PHP 7+ only.
        $callback = $cb;
        $cb = null;

        // Use reflection to inspect number of arguments expected by this callback.
        // We did some careful benchmarking here: Using reflection to avoid unneeded
        // function arguments is actually faster than blindly passing them.
        // Also, this helps avoiding unnecessary function arguments in the call stack
        // if the callback creates an Exception (creating garbage cycles).
        if (\is_array($callback)) {
            $ref = new \ReflectionMethod($callback[0], $callback[1]);
        } elseif (\is_object($callback) && !$callback instanceof \Closure) {
            $ref = new \ReflectionMethod($callback, '__invoke');
        } else {
            $ref = new \ReflectionFunction($callback);
        }
        $args = $ref->getNumberOfParameters();

        try {
            if ($args === 0) {
                $callback();
            } else {
                // Keep references to this promise instance for the static resolve/reject functions.
                // By using static callbacks that are not bound to this instance
                // and passing the target promise instance by reference, we can
                // still execute its resolving logic and still clear this
                // reference when settling the promise. This helps avoiding
                // garbage cycles if any callback creates an Exception.
                // These assumptions are covered by the test suite, so if you ever feel like
                // refactoring this, go ahead, any alternative suggestions are welcome!
                $target =& $this;
                $progressHandlers =& $this->progressHandlers;

                $callback(
                    static function ($value = null) use (&$target) {
                        if ($target !== null) {
                            $target->settle(resolve($value));
                            $target = null;
                        }
                    },
                    static function ($reason = null) use (&$target) {
                        if ($target !== null) {
                            $target->reject($reason);
                            $target = null;
                        }
                    },
                    static function ($update = null) use (&$progressHandlers) {
                        foreach ($progressHandlers as $handler) {
                            $handler($update);
                        }
                    }
                );
            }
        } catch (\Throwable $e) {
            $target = null;
            $this->reject($e);
        } catch (\Exception $e) {
            $target = null;
            $this->reject($e);
        }
    }
}
