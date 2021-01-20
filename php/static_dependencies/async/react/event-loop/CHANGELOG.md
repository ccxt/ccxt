# Changelog

## 1.1.1 (2020-01-01)

*   Fix: Fix reporting connection refused errors with `ExtUvLoop` on Linux and `StreamSelectLoop` on Windows.
    (#207 and #208 by @clue)

*   Fix: Fix unsupported EventConfig and `SEGFAULT` on shutdown with `ExtEventLoop` on Windows.
    (#205 by @clue)

*   Fix: Check PCNTL functions for signal support instead of PCNTL extension with `StreamSelectLoop`.
    (#195 by @clue)

*   Add `.gitattributes` to exclude dev files from exports.
    (#201 by @reedy)

*   Improve test suite to fix testing `ExtUvLoop` on Travis,
    fix Travis CI builds, do not install `libuv` on legacy PHP setups,
    fix failing test cases due to inaccurate timers,
    run tests on Windows via Travis CI and
    run tests on PHP 7.4 and simplify test matrix and test setup.
    (#197 by @WyriHaximus and #202, #203, #204 and #209 by @clue)

## 1.1.0 (2019-02-07)

*   New UV based event loop (ext-uv).
    (#112 by @WyriHaximus)

*   Use high resolution timer on PHP 7.3+. 
    (#182 by @clue)

*   Improve PCNTL signals by using async signal dispatching if available. 
    (#179 by @CharlotteDunois)

*   Improve test suite and test suite set up.
    (#174 by @WyriHaximus, #181 by @clue)

*   Fix PCNTL signals edge case. 
    (#183 by @clue)

## 1.0.0 (2018-07-11)

*   First stable LTS release, now following [SemVer](https://semver.org/).
    We'd like to emphasize that this component is production ready and battle-tested.
    We plan to support all long-term support (LTS) releases for at least 24 months,
    so you have a rock-solid foundation to build on top of.

>   Contains no other changes, so it's actually fully compatible with the v0.5.3 release.

## 0.5.3 (2018-07-09)

*   Improve performance by importing global functions.
    (#167 by @Ocramius)

*   Improve test suite by simplifying test bootstrap by using dev autoloader.
    (#169 by @lcobucci)

*   Minor internal changes to improved backward compatibility with PHP 5.3.
    (#166 by @Donatello-za)

## 0.5.2 (2018-04-24)

*   Feature: Improve memory consumption and runtime performance for `StreamSelectLoop` timers.
    (#164 by @clue)

*   Improve test suite by removing I/O dependency at `StreamSelectLoopTest` to fix Mac OS X tests.
    (#161 by @nawarian)

## 0.5.1 (2018-04-09)

*   Feature: New `ExtEvLoop` (PECL ext-ev)  (#148 by @kaduev13)

## 0.5.0 (2018-04-05)

A major feature release with a significant documentation overhaul and long overdue API cleanup!

This update involves a number of BC breaks due to dropped support for deprecated
functionality. We've tried hard to avoid BC breaks where possible and minimize
impact otherwise. We expect that most consumers of this package will actually
not be affected by any BC breaks, see below for more details.

We realize that the changes listed below may seem overwhelming, but we've tried
to be very clear about any possible BC breaks. Don't worry: In fact, all ReactPHP
components are already compatible and support both this new release as well as
providing backwards compatibility with the last release.

*   Feature / BC break: Add support for signal handling via new
    `LoopInterface::addSignal()` and `LoopInterface::removeSignal()` methods.
    (#104 by @WyriHaximus and #111 and #150 by @clue)

    ```php
    $loop->addSignal(SIGINT, function () {
        echo 'CTRL-C';
    });
    ```

*   Feature: Significant documentation updates for `LoopInterface` and `Factory`.
    (#100, #119, #126, #127, #159 and #160 by @clue, #113 by @WyriHaximus and #81 and #91 by @jsor)

*   Feature: Add examples to ease getting started
    (#99, #100 and #125 by @clue, #59 by @WyriHaximus and #143 by @jsor)

*   Feature: Documentation for advanced timer concepts, such as monotonic time source vs wall-clock time
    and high precision timers with millisecond accuracy or below.
    (#130 and #157 by @clue)

*   Feature: Documentation for advanced stream concepts, such as edge-triggered event listeners
    and stream buffers and allow throwing Exception if stream resource is not supported.
    (#129 and #158 by @clue)

*   Feature: Throw `BadMethodCallException` on manual loop creation when required extension isn't installed.
    (#153 by @WyriHaximus)

*   Feature / BC break: First class support for legacy PHP 5.3 through PHP 7.2 and HHVM
    and remove all `callable` type hints for consistency reasons.
    (#141 and #151 by @clue)

*   BC break: Documentation for timer API and clean up unneeded timer API.
    (#102 by @clue)

    Remove `TimerInterface::cancel()`, use `LoopInterface::cancelTimer()` instead:

    ```php
    // old (method invoked on timer instance)
    $timer->cancel();
    
    // already supported before: invoke method on loop instance
    $loop->cancelTimer($timer);
    ```

    Remove unneeded `TimerInterface::setData()` and `TimerInterface::getData()`,
    use closure binding to add arbitrary data to timer instead:

    ```php
    // old (limited setData() and getData() only allows single variable)
    $name = 'Tester';
    $timer = $loop->addTimer(1.0, function ($timer) {
        echo 'Hello ' . $timer->getData() . PHP_EOL;
    });
    $timer->setData($name);

    // already supported before: closure binding allows any number of variables
    $name = 'Tester';
    $loop->addTimer(1.0, function () use ($name) {
        echo 'Hello ' . $name . PHP_EOL;
    });
    ```

    Remove unneeded `TimerInterface::getLoop()`, use closure binding instead:

    ```php
    // old (getLoop() called on timer instance)
    $loop->addTimer(0.1, function ($timer) {
        $timer->getLoop()->stop();
    });

    // already supported before: use closure binding as usual
    $loop->addTimer(0.1, function () use ($loop) {
        $loop->stop();
    });
    ```

*   BC break: Remove unneeded `LoopInterface::isTimerActive()` and
    `TimerInterface::isActive()` to reduce API surface.
    (#133 by @clue)

    ```php
    // old (method on timer instance or on loop instance)
    $timer->isActive();
    $loop->isTimerActive($timer);
    ```

*   BC break: Move `TimerInterface` one level up to `React\EventLoop\TimerInterface`.
    (#138 by @WyriHaximus)

    ```php
    // old (notice obsolete "Timer" namespace)
    assert($timer instanceof React\EventLoop\Timer\TimerInterface);

    // new
    assert($timer instanceof React\EventLoop\TimerInterface);
    ```

*   BC break: Remove unneeded `LoopInterface::nextTick()` (and internal `NextTickQueue`),
    use `LoopInterface::futureTick()` instead.
    (#30 by @clue)

    ```php
    // old (removed)
    $loop->nextTick(function () {
        echo 'tick';
    });

    // already supported before
    $loop->futureTick(function () {
        echo 'tick';
    });
    ```

*   BC break: Remove unneeded `$loop` argument for `LoopInterface::futureTick()`
    (and fix internal cyclic dependency).
    (#103 by @clue)

    ```php
    // old ($loop gets passed by default)
    $loop->futureTick(function ($loop) {
        $loop->stop();
    });

    // already supported before: use closure binding as usual
    $loop->futureTick(function () use ($loop) {
        $loop->stop();
    });
    ```

*   BC break: Remove unneeded `LoopInterface::tick()`.
    (#72 by @jsor)

    ```php
    // old (removed)
    $loop->tick();

    // suggested work around for testing purposes only
    $loop->futureTick(function () use ($loop) {
        $loop->stop();
    });
    ```

*   BC break: Documentation for advanced stream API and clean up unneeded stream API.
    (#110 by @clue)

    Remove unneeded `$loop` argument for `LoopInterface::addReadStream()`
    and `LoopInterface::addWriteStream()`, use closure binding instead:

    ```php
    // old ($loop gets passed by default)
    $loop->addReadStream($stream, function ($stream, $loop) {
        $loop->removeReadStream($stream);
    });

    // already supported before: use closure binding as usual
    $loop->addReadStream($stream, function ($stream) use ($loop) {
        $loop->removeReadStream($stream);
    });
    ```

*   BC break: Remove unneeded `LoopInterface::removeStream()` method,
    use `LoopInterface::removeReadStream()` and `LoopInterface::removeWriteStream()` instead.
    (#118 by @clue)

    ```php
    // old
    $loop->removeStream($stream);

    // already supported before
    $loop->removeReadStream($stream);
    $loop->removeWriteStream($stream);
    ```

*   BC break: Rename `LibEventLoop` to `ExtLibeventLoop` and `LibEvLoop` to `ExtLibevLoop`
    for consistent naming for event loop implementations.
    (#128 by @clue)

*   BC break: Remove optional `EventBaseConfig` argument from `ExtEventLoop`
    and make its `FEATURE_FDS` enabled by default.
    (#156 by @WyriHaximus)

*   BC break: Mark all classes as final to discourage inheritance.
    (#131 by @clue)

*   Fix: Fix `ExtEventLoop` to keep track of stream resources (refcount)
    (#123 by @clue)

*   Fix: Ensure large timer interval does not overflow on 32bit systems
    (#132 by @clue)

*   Fix: Fix separately removing readable and writable side of stream when closing
    (#139 by @clue)

*   Fix: Properly clean up event watchers for `ext-event` and `ext-libev`
    (#149 by @clue)

*   Fix: Minor code cleanup and remove unneeded references
    (#145 by @seregazhuk)

*   Fix: Discourage outdated `ext-libevent` on PHP 7
    (#62 by @cboden)

*   Improve test suite by adding forward compatibility with PHPUnit 6 and PHPUnit 5,
    lock Travis distro so new defaults will not break the build,
    improve test suite to be less fragile and increase test timeouts,
    test against PHP 7.2 and reduce fwrite() call length to one chunk.
    (#106 and #144 by @clue, #120 and #124 by @carusogabriel, #147 by nawarian and #92 by @kelunik)

*   A number of changes were originally planned for this release but have been backported
    to the last `v0.4.3` already: #74, #76, #79, #81 (refs #65, #66, #67), #88 and #93

## 0.4.3 (2017-04-27)

* Bug fix: Bugfix in the usage sample code #57 (@dandelionred) 
* Improvement: Remove branch-alias definition #53 (@WyriHaximus)
* Improvement: StreamSelectLoop: Use fresh time so Timers added during stream events are accurate #51 (@andrewminerd)
* Improvement: Avoid deprecation warnings in test suite due to deprecation of getMock() in PHPUnit #68 (@martinschroeder)
* Improvement: Add PHPUnit 4.8 to require-dev #69 (@shaunbramley)
* Improvement: Increase test timeouts for HHVM and unify timeout handling #70 (@clue)
* Improvement: Travis improvements (backported from #74) #75 (@clue)
* Improvement: Test suite now uses socket pairs instead of memory streams #66 (@martinschroeder)
* Improvement: StreamSelectLoop: Test suite uses signal constant names in data provider #67 (@martinschroeder)
* Improvement: ExtEventLoop: No longer suppress all errors #65 (@mamciek)
* Improvement: Readme cleanup #89 (@jsor)
* Improvement: Restructure and improve README #90 (@jsor)
* Bug fix: StreamSelectLoop: Fix erroneous zero-time sleep (backport to 0.4) #94 (@jsor)

## 0.4.2 (2016-03-07)

* Bug fix: No longer error when signals sent to StreamSelectLoop
* Support HHVM and PHP7 (@ondrejmirtes, @cebe)
* Feature: Added support for EventConfig for ExtEventLoop (@steverhoades)
* Bug fix: Fixed an issue loading loop extension libs via autoloader (@czarpino)

## 0.4.1 (2014-04-13)

* Bug fix: null timeout in StreamSelectLoop causing 100% CPU usage (@clue)
* Bug fix: v0.3.4 changes merged for v0.4.1

## 0.4.0 (2014-02-02)

* Feature: Added `EventLoopInterface::nextTick()`, implemented in all event loops (@jmalloc)
* Feature: Added `EventLoopInterface::futureTick()`, implemented in all event loops (@jmalloc)
* Feature: Added `ExtEventLoop` implementation using pecl/event (@jmalloc)
* BC break: Bump minimum PHP version to PHP 5.4, remove 5.3 specific hacks
* BC break: New method: `EventLoopInterface::nextTick()`
* BC break: New method: `EventLoopInterface::futureTick()`
* Dependency: Autoloading and filesystem structure now PSR-4 instead of PSR-0

## 0.3.5 (2016-12-28)

This is a compatibility release that eases upgrading to the v0.4 release branch.
You should consider upgrading to the v0.4 release branch.

* Feature: Cap min timer interval at 1µs, thus improving compatibility with v0.4
  (#47 by @clue)

## 0.3.4 (2014-03-30)

* Bug fix: Changed StreamSelectLoop to use non-blocking behavior on tick() (@astephens25)

## 0.3.3 (2013-07-08)

* Bug fix: No error on removing non-existent streams (@clue)
* Bug fix: Do not silently remove feof listeners in `LibEvLoop`

## 0.3.0 (2013-04-14)

* BC break: New timers API (@nrk)
* BC break: Remove check on return value from stream callbacks (@nrk)

## 0.2.7 (2013-01-05)

* Bug fix: Fix libevent timers with PHP 5.3
* Bug fix: Fix libevent timer cancellation (@nrk)

## 0.2.6 (2012-12-26)

* Bug fix: Plug memory issue in libevent timers (@cameronjacobson)
* Bug fix: Correctly pause LibEvLoop on stop()

## 0.2.3 (2012-11-14)

* Feature: LibEvLoop, integration of `php-libev`

## 0.2.0 (2012-09-10)

* Version bump

## 0.1.1 (2012-07-12)

* Version bump

## 0.1.0 (2012-07-11)

* First tagged release
