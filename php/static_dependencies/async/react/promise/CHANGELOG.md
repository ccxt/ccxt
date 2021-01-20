CHANGELOG for 2.x
=================

* 2.8.0 (2020-05-12)

    *   Mark `FulfilledPromise`, `RejectedPromise` and `LazyPromise` as deprecated for Promise v2 (and remove for Promise v3).
        (#143 and #165 by @clue)

        ```php
        // deprecated
        $fulfilled = new React\Promise\FulfilledPromise($value);
        $rejected = new React\Promise\RejectedPromise($reason);

        // recommended alternatives
        $fulfilled = React\Promise\resolve($value);
        $rejected = React\Promise\reject($reason);
        ```

    *   Fix: Fix checking whether cancellable promise is an object and avoid possible warning.
        (#168 by @smscr and @jsor)

    *   Improve documentation and add docblocks to functions and interfaces.
        (#135 by @CharlotteDunois)

    *   Add `.gitattributes` to exclude dev files from exports.
        (#154 by @reedy)

    *   Improve test suite, run tests on PHP 7.4 and update PHPUnit test setup.
        (#163 by @clue)

* 2.7.1 (2018-01-07)

    *   Fix: file_exists warning when resolving with long strings.
        (#130 by @sbesselsen)
    *   Improve performance by prefixing all global functions calls with \ to skip the look up and resolve process and go straight to the global function.
        (#133 by @WyriHaximus)

* 2.7.0 (2018-06-13)

    *   Feature: Improve memory consumption for pending promises by using static internal callbacks without binding to self.
        (#124 by @clue)

* 2.6.0 (2018-06-11)

    *   Feature: Significantly improve memory consumption and performance by only passing resolver args
        to resolver and canceller if callback requires them. Also use static callbacks without
        binding to promise, clean up canceller function reference when they are no longer
        needed and hide resolver and canceller references from call stack on PHP 7+.
        (#113, #115, #116, #117, #118, #119 and #123 by @clue)

        These changes combined mean that rejecting promises with an `Exception` should
        no longer cause any internal circular references which could cause some unexpected
        memory growth in previous versions. By explicitly avoiding and explicitly
        cleaning up said references, we can avoid relying on PHP's circular garbage collector
        to kick in which significantly improves performance when rejecting many promises.

    *   Mark legacy progress support / notification API as deprecated
        (#112 by @clue)

    *   Recommend rejecting promises by throwing an exception
        (#114 by @jsor)

    *   Improve documentation to properly instantiate LazyPromise
        (#121 by @holtkamp)

    *   Follower cancellation propagation was originally planned for this release
        but has been reverted for now and is planned for a future release.
        (#99 by @jsor and #122 by @clue)

* 2.5.1 (2017-03-25)

    * Fix circular references when resolving with a promise which follows
      itself (#94).

* 2.5.0 (2016-12-22)

    * Revert automatic cancellation of pending collection promises once the
      output promise resolves. This was introduced in 42d86b7 (PR #36, released
      in [v2.3.0](https://github.com/reactphp/promise/releases/tag/v2.3.0)) and
      was both unintended and backward incompatible.

      If you need automatic cancellation, you can use something like:

      ```php
      function allAndCancel(array $promises)
      {
           return \React\Promise\all($promises)
               ->always(function() use ($promises) {
                   foreach ($promises as $promise) {
                       if ($promise instanceof \React\Promise\CancellablePromiseInterface) {
                           $promise->cancel();
                       }
                   }
              });
      }
      ```
    * `all()` and `map()` functions now preserve the order of the array (#77).
    * Fix circular references when resolving a promise with itself (#71).

* 2.4.1 (2016-05-03)

    * Fix `some()` not cancelling pending promises when too much input promises
      reject (16ff799).

* 2.4.0 (2016-03-31)

    * Support foreign thenables in `resolve()`.
      Any object that provides a `then()` method is now assimilated to a trusted
      promise that follows the state of this thenable (#52).
    * Fix `some()` and `any()` for input arrays containing not enough items
      (#34).

* 2.3.0 (2016-03-24)

    * Allow cancellation of promises returned by functions working on promise
      collections (#36).
    * Handle `\Throwable` in the same way as `\Exception` (#51 by @joshdifabio).

* 2.2.2 (2016-02-26)

    * Fix cancellation handlers called multiple times (#47 by @clue).

* 2.2.1 (2015-07-03)

    * Fix stack error when resolving a promise in its own fulfillment or
      rejection handlers.

* 2.2.0 (2014-12-30)

    * Introduce new `ExtendedPromiseInterface` implemented by all promises.
    * Add new `done()` method (part of the `ExtendedPromiseInterface`).
    * Add new `otherwise()` method (part of the `ExtendedPromiseInterface`).
    * Add new `always()` method (part of the `ExtendedPromiseInterface`).
    * Add new `progress()` method (part of the `ExtendedPromiseInterface`).
    * Rename `Deferred::progress` to `Deferred::notify` to avoid confusion with
      `ExtendedPromiseInterface::progress` (a `Deferred::progress` alias is
      still available for backward compatibility)
    * `resolve()` now always returns a `ExtendedPromiseInterface`.

* 2.1.0 (2014-10-15)

    * Introduce new `CancellablePromiseInterface` implemented by all promises.
    * Add new `cancel()` method (part of the `CancellablePromiseInterface`).

* 2.0.0 (2013-12-10)

    New major release. The goal is to streamline the API and to make it more
    compliant with other promise libraries and especially with the new upcoming
    [ES6 promises specification](https://github.com/domenic/promises-unwrapping/).

    * Add standalone Promise class.
    * Add new `race()` function.
    * BC break: Bump minimum PHP version to PHP 5.4.
    * BC break: Remove `ResolverInterface` and `PromiseInterface` from 
      `Deferred`.
    * BC break: Change signature of `PromiseInterface`.
    * BC break: Remove `When` and `Util` classes and move static methods to
      functions.
    * BC break: `FulfilledPromise` and `RejectedPromise` now throw an exception
      when initialized with a promise instead of a value/reason.
    * BC break: `Deferred::resolve()` and `Deferred::reject()` no longer return
      a promise.
