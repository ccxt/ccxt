<?php

namespace React\Promise;

interface ExtendedPromiseInterface extends PromiseInterface
{
    /**
     * Consumes the promise's ultimate value if the promise fulfills, or handles the
     * ultimate error.
     *
     * It will cause a fatal error if either `$onFulfilled` or
     * `$onRejected` throw or return a rejected promise.
     *
     * Since the purpose of `done()` is consumption rather than transformation,
     * `done()` always returns `null`.
     *
     * @param callable|null $onFulfilled
     * @param callable|null $onRejected
     * @param callable|null $onProgress This argument is deprecated and should not be used anymore.
     * @return void
     */
    public function done(callable $onFulfilled = null, callable $onRejected = null, callable $onProgress = null);

    /**
     * Registers a rejection handler for promise. It is a shortcut for:
     *
     * ```php
     * $promise->then(null, $onRejected);
     * ```
     *
     * Additionally, you can type hint the `$reason` argument of `$onRejected` to catch
     * only specific errors.
     *
     * @param callable $onRejected
     * @return ExtendedPromiseInterface
     */
    public function otherwise(callable $onRejected);

    /**
     * Allows you to execute "cleanup" type tasks in a promise chain.
     *
     * It arranges for `$onFulfilledOrRejected` to be called, with no arguments,
     * when the promise is either fulfilled or rejected.
     *
     * * If `$promise` fulfills, and `$onFulfilledOrRejected` returns successfully,
     *    `$newPromise` will fulfill with the same value as `$promise`.
     * * If `$promise` fulfills, and `$onFulfilledOrRejected` throws or returns a
     *    rejected promise, `$newPromise` will reject with the thrown exception or
     *    rejected promise's reason.
     * * If `$promise` rejects, and `$onFulfilledOrRejected` returns successfully,
     *    `$newPromise` will reject with the same reason as `$promise`.
     * * If `$promise` rejects, and `$onFulfilledOrRejected` throws or returns a
     *    rejected promise, `$newPromise` will reject with the thrown exception or
     *    rejected promise's reason.
     *
     * `always()` behaves similarly to the synchronous finally statement. When combined
     * with `otherwise()`, `always()` allows you to write code that is similar to the familiar
     * synchronous catch/finally pair.
     *
     * Consider the following synchronous code:
     *
     * ```php
     * try {
     *     return doSomething();
     * } catch(\Exception $e) {
     *     return handleError($e);
     * } finally {
     *     cleanup();
     * }
     * ```
     *
     * Similar asynchronous code (with `doSomething()` that returns a promise) can be
     * written:
     *
     * ```php
     * return doSomething()
     *     ->otherwise('handleError')
     *     ->always('cleanup');
     * ```
     *
     * @param callable $onFulfilledOrRejected
     * @return ExtendedPromiseInterface
     */
    public function always(callable $onFulfilledOrRejected);

    /**
     * Registers a handler for progress updates from promise. It is a shortcut for:
     *
     * ```php
     * $promise->then(null, null, $onProgress);
     * ```
     *
     * @param callable $onProgress
     * @return ExtendedPromiseInterface
     * @deprecated 2.6.0 Progress support is deprecated and should not be used anymore.
     */
    public function progress(callable $onProgress);
}
