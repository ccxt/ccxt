<?php

namespace React\Promise;

/**
 * Creates a promise for the supplied `$promiseOrValue`.
 *
 * If `$promiseOrValue` is a value, it will be the resolution value of the
 * returned promise.
 *
 * If `$promiseOrValue` is a thenable (any object that provides a `then()` method),
 * a trusted promise that follows the state of the thenable is returned.
 *
 * If `$promiseOrValue` is a promise, it will be returned as is.
 *
 * @param mixed $promiseOrValue
 * @return PromiseInterface
 */
function resolve($promiseOrValue = null)
{
    if ($promiseOrValue instanceof ExtendedPromiseInterface) {
        return $promiseOrValue;
    }

    // Check is_object() first to avoid method_exists() triggering
    // class autoloaders if $promiseOrValue is a string.
    if (\is_object($promiseOrValue) && \method_exists($promiseOrValue, 'then')) {
        $canceller = null;

        if (\method_exists($promiseOrValue, 'cancel')) {
            $canceller = [$promiseOrValue, 'cancel'];
        }

        return new Promise(function ($resolve, $reject, $notify) use ($promiseOrValue) {
            $promiseOrValue->then($resolve, $reject, $notify);
        }, $canceller);
    }

    return new FulfilledPromise($promiseOrValue);
}

/**
 * Creates a rejected promise for the supplied `$promiseOrValue`.
 *
 * If `$promiseOrValue` is a value, it will be the rejection value of the
 * returned promise.
 *
 * If `$promiseOrValue` is a promise, its completion value will be the rejected
 * value of the returned promise.
 *
 * This can be useful in situations where you need to reject a promise without
 * throwing an exception. For example, it allows you to propagate a rejection with
 * the value of another promise.
 *
 * @param mixed $promiseOrValue
 * @return PromiseInterface
 */
function reject($promiseOrValue = null)
{
    if ($promiseOrValue instanceof PromiseInterface) {
        return resolve($promiseOrValue)->then(function ($value) {
            return new RejectedPromise($value);
        });
    }

    return new RejectedPromise($promiseOrValue);
}

/**
 * Returns a promise that will resolve only once all the items in
 * `$promisesOrValues` have resolved. The resolution value of the returned promise
 * will be an array containing the resolution values of each of the items in
 * `$promisesOrValues`.
 *
 * @param array $promisesOrValues
 * @return PromiseInterface
 */
function all($promisesOrValues)
{
    return map($promisesOrValues, function ($val) {
        return $val;
    });
}

/**
 * Initiates a competitive race that allows one winner. Returns a promise which is
 * resolved in the same way the first settled promise resolves.
 *
 * The returned promise will become **infinitely pending** if  `$promisesOrValues`
 * contains 0 items.
 *
 * @param array $promisesOrValues
 * @return PromiseInterface
 */
function race($promisesOrValues)
{
    $cancellationQueue = new CancellationQueue();
    $cancellationQueue->enqueue($promisesOrValues);

    return new Promise(function ($resolve, $reject, $notify) use ($promisesOrValues, $cancellationQueue) {
        resolve($promisesOrValues)
            ->done(function ($array) use ($cancellationQueue, $resolve, $reject, $notify) {
                if (!is_array($array) || !$array) {
                    $resolve();
                    return;
                }

                foreach ($array as $promiseOrValue) {
                    $cancellationQueue->enqueue($promiseOrValue);

                    resolve($promiseOrValue)
                        ->done($resolve, $reject, $notify);
                }
            }, $reject, $notify);
    }, $cancellationQueue);
}

/**
 * Returns a promise that will resolve when any one of the items in
 * `$promisesOrValues` resolves. The resolution value of the returned promise
 * will be the resolution value of the triggering item.
 *
 * The returned promise will only reject if *all* items in `$promisesOrValues` are
 * rejected. The rejection value will be an array of all rejection reasons.
 *
 * The returned promise will also reject with a `React\Promise\Exception\LengthException`
 * if `$promisesOrValues` contains 0 items.
 *
 * @param array $promisesOrValues
 * @return PromiseInterface
 */
function any($promisesOrValues)
{
    return some($promisesOrValues, 1)
        ->then(function ($val) {
            return \array_shift($val);
        });
}

/**
 * Returns a promise that will resolve when `$howMany` of the supplied items in
 * `$promisesOrValues` resolve. The resolution value of the returned promise
 * will be an array of length `$howMany` containing the resolution values of the
 * triggering items.
 *
 * The returned promise will reject if it becomes impossible for `$howMany` items
 * to resolve (that is, when `(count($promisesOrValues) - $howMany) + 1` items
 * reject). The rejection value will be an array of
 * `(count($promisesOrValues) - $howMany) + 1` rejection reasons.
 *
 * The returned promise will also reject with a `React\Promise\Exception\LengthException`
 * if `$promisesOrValues` contains less items than `$howMany`.
 *
 * @param array $promisesOrValues
 * @param int $howMany
 * @return PromiseInterface
 */
function some($promisesOrValues, $howMany)
{
    $cancellationQueue = new CancellationQueue();
    $cancellationQueue->enqueue($promisesOrValues);

    return new Promise(function ($resolve, $reject, $notify) use ($promisesOrValues, $howMany, $cancellationQueue) {
        resolve($promisesOrValues)
            ->done(function ($array) use ($howMany, $cancellationQueue, $resolve, $reject, $notify) {
                if (!\is_array($array) || $howMany < 1) {
                    $resolve([]);
                    return;
                }

                $len = \count($array);

                if ($len < $howMany) {
                    throw new Exception\LengthException(
                        \sprintf(
                            'Input array must contain at least %d item%s but contains only %s item%s.',
                            $howMany,
                            1 === $howMany ? '' : 's',
                            $len,
                            1 === $len ? '' : 's'
                        )
                    );
                }

                $toResolve = $howMany;
                $toReject  = ($len - $toResolve) + 1;
                $values    = [];
                $reasons   = [];

                foreach ($array as $i => $promiseOrValue) {
                    $fulfiller = function ($val) use ($i, &$values, &$toResolve, $toReject, $resolve) {
                        if ($toResolve < 1 || $toReject < 1) {
                            return;
                        }

                        $values[$i] = $val;

                        if (0 === --$toResolve) {
                            $resolve($values);
                        }
                    };

                    $rejecter = function ($reason) use ($i, &$reasons, &$toReject, $toResolve, $reject) {
                        if ($toResolve < 1 || $toReject < 1) {
                            return;
                        }

                        $reasons[$i] = $reason;

                        if (0 === --$toReject) {
                            $reject($reasons);
                        }
                    };

                    $cancellationQueue->enqueue($promiseOrValue);

                    resolve($promiseOrValue)
                        ->done($fulfiller, $rejecter, $notify);
                }
            }, $reject, $notify);
    }, $cancellationQueue);
}

/**
 * Traditional map function, similar to `array_map()`, but allows input to contain
 * promises and/or values, and `$mapFunc` may return either a value or a promise.
 *
 * The map function receives each item as argument, where item is a fully resolved
 * value of a promise or value in `$promisesOrValues`.
 *
 * @param array $promisesOrValues
 * @param callable $mapFunc
 * @return PromiseInterface
 */
function map($promisesOrValues, callable $mapFunc)
{
    $cancellationQueue = new CancellationQueue();
    $cancellationQueue->enqueue($promisesOrValues);

    return new Promise(function ($resolve, $reject, $notify) use ($promisesOrValues, $mapFunc, $cancellationQueue) {
        resolve($promisesOrValues)
            ->done(function ($array) use ($mapFunc, $cancellationQueue, $resolve, $reject, $notify) {
                if (!\is_array($array) || !$array) {
                    $resolve([]);
                    return;
                }

                $toResolve = \count($array);
                $values    = [];

                foreach ($array as $i => $promiseOrValue) {
                    $cancellationQueue->enqueue($promiseOrValue);
                    $values[$i] = null;

                    resolve($promiseOrValue)
                        ->then($mapFunc)
                        ->done(
                            function ($mapped) use ($i, &$values, &$toResolve, $resolve) {
                                $values[$i] = $mapped;

                                if (0 === --$toResolve) {
                                    $resolve($values);
                                }
                            },
                            $reject,
                            $notify
                        );
                }
            }, $reject, $notify);
    }, $cancellationQueue);
}

/**
 * Traditional reduce function, similar to `array_reduce()`, but input may contain
 * promises and/or values, and `$reduceFunc` may return either a value or a
 * promise, *and* `$initialValue` may be a promise or a value for the starting
 * value.
 *
 * @param array $promisesOrValues
 * @param callable $reduceFunc
 * @param mixed $initialValue
 * @return PromiseInterface
 */
function reduce($promisesOrValues, callable $reduceFunc, $initialValue = null)
{
    $cancellationQueue = new CancellationQueue();
    $cancellationQueue->enqueue($promisesOrValues);

    return new Promise(function ($resolve, $reject, $notify) use ($promisesOrValues, $reduceFunc, $initialValue, $cancellationQueue) {
        resolve($promisesOrValues)
            ->done(function ($array) use ($reduceFunc, $initialValue, $cancellationQueue, $resolve, $reject, $notify) {
                if (!\is_array($array)) {
                    $array = [];
                }

                $total = \count($array);
                $i = 0;

                // Wrap the supplied $reduceFunc with one that handles promises and then
                // delegates to the supplied.
                $wrappedReduceFunc = function ($current, $val) use ($reduceFunc, $cancellationQueue, $total, &$i) {
                    $cancellationQueue->enqueue($val);

                    return $current
                        ->then(function ($c) use ($reduceFunc, $total, &$i, $val) {
                            return resolve($val)
                                ->then(function ($value) use ($reduceFunc, $total, &$i, $c) {
                                    return $reduceFunc($c, $value, $i++, $total);
                                });
                        });
                };

                $cancellationQueue->enqueue($initialValue);

                \array_reduce($array, $wrappedReduceFunc, resolve($initialValue))
                    ->done($resolve, $reject, $notify);
            }, $reject, $notify);
    }, $cancellationQueue);
}

/**
 * @internal
 */
function _checkTypehint(callable $callback, $object)
{
    if (!\is_object($object)) {
        return true;
    }

    if (\is_array($callback)) {
        $callbackReflection = new \ReflectionMethod($callback[0], $callback[1]);
    } elseif (\is_object($callback) && !$callback instanceof \Closure) {
        $callbackReflection = new \ReflectionMethod($callback, '__invoke');
    } else {
        $callbackReflection = new \ReflectionFunction($callback);
    }

    $parameters = $callbackReflection->getParameters();

    if (!isset($parameters[0])) {
        return true;
    }

    $expectedException = $parameters[0];

    if (!$expectedException->getClass()) {
        return true;
    }

    return $expectedException->getClass()->isInstance($object);
}
