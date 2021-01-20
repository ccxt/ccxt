<?php

namespace React\EventLoop;

interface LoopInterface
{
    /**
     * [Advanced] Register a listener to be notified when a stream is ready to read.
     *
     * Note that this low-level API is considered advanced usage.
     * Most use cases should probably use the higher-level
     * [readable Stream API](https://github.com/reactphp/stream#readablestreaminterface)
     * instead.
     *
     * The first parameter MUST be a valid stream resource that supports
     * checking whether it is ready to read by this loop implementation.
     * A single stream resource MUST NOT be added more than once.
     * Instead, either call [`removeReadStream()`](#removereadstream) first or
     * react to this event with a single listener and then dispatch from this
     * listener. This method MAY throw an `Exception` if the given resource type
     * is not supported by this loop implementation.
     *
     * The listener callback function MUST be able to accept a single parameter,
     * the stream resource added by this method or you MAY use a function which
     * has no parameters at all.
     *
     * The listener callback function MUST NOT throw an `Exception`.
     * The return value of the listener callback function will be ignored and has
     * no effect, so for performance reasons you're recommended to not return
     * any excessive data structures.
     *
     * If you want to access any variables within your callback function, you
     * can bind arbitrary data to a callback closure like this:
     *
     * ```php
     * $loop->addReadStream($stream, function ($stream) use ($name) {
     *     echo $name . ' said: ' . fread($stream);
     * });
     * ```
     *
     * See also [example #11](examples).
     *
     * You can invoke [`removeReadStream()`](#removereadstream) to remove the
     * read event listener for this stream.
     *
     * The execution order of listeners when multiple streams become ready at
     * the same time is not guaranteed.
     *
     * @param resource $stream   The PHP stream resource to check.
     * @param callable $listener Invoked when the stream is ready.
     * @throws \Exception if the given resource type is not supported by this loop implementation
     * @see self::removeReadStream()
     */
    public function addReadStream($stream, $listener);

    /**
     * [Advanced] Register a listener to be notified when a stream is ready to write.
     *
     * Note that this low-level API is considered advanced usage.
     * Most use cases should probably use the higher-level
     * [writable Stream API](https://github.com/reactphp/stream#writablestreaminterface)
     * instead.
     *
     * The first parameter MUST be a valid stream resource that supports
     * checking whether it is ready to write by this loop implementation.
     * A single stream resource MUST NOT be added more than once.
     * Instead, either call [`removeWriteStream()`](#removewritestream) first or
     * react to this event with a single listener and then dispatch from this
     * listener. This method MAY throw an `Exception` if the given resource type
     * is not supported by this loop implementation.
     *
     * The listener callback function MUST be able to accept a single parameter,
     * the stream resource added by this method or you MAY use a function which
     * has no parameters at all.
     *
     * The listener callback function MUST NOT throw an `Exception`.
     * The return value of the listener callback function will be ignored and has
     * no effect, so for performance reasons you're recommended to not return
     * any excessive data structures.
     *
     * If you want to access any variables within your callback function, you
     * can bind arbitrary data to a callback closure like this:
     *
     * ```php
     * $loop->addWriteStream($stream, function ($stream) use ($name) {
     *     fwrite($stream, 'Hello ' . $name);
     * });
     * ```
     *
     * See also [example #12](examples).
     *
     * You can invoke [`removeWriteStream()`](#removewritestream) to remove the
     * write event listener for this stream.
     *
     * The execution order of listeners when multiple streams become ready at
     * the same time is not guaranteed.
     *
     * Some event loop implementations are known to only trigger the listener if
     * the stream *becomes* readable (edge-triggered) and may not trigger if the
     * stream has already been readable from the beginning.
     * This also implies that a stream may not be recognized as readable when data
     * is still left in PHP's internal stream buffers.
     * As such, it's recommended to use `stream_set_read_buffer($stream, 0);`
     * to disable PHP's internal read buffer in this case.
     *
     * @param resource $stream   The PHP stream resource to check.
     * @param callable $listener Invoked when the stream is ready.
     * @throws \Exception if the given resource type is not supported by this loop implementation
     * @see self::removeWriteStream()
     */
    public function addWriteStream($stream, $listener);

    /**
     * Remove the read event listener for the given stream.
     *
     * Removing a stream from the loop that has already been removed or trying
     * to remove a stream that was never added or is invalid has no effect.
     *
     * @param resource $stream The PHP stream resource.
     */
    public function removeReadStream($stream);

    /**
     * Remove the write event listener for the given stream.
     *
     * Removing a stream from the loop that has already been removed or trying
     * to remove a stream that was never added or is invalid has no effect.
     *
     * @param resource $stream The PHP stream resource.
     */
    public function removeWriteStream($stream);

    /**
     * Enqueue a callback to be invoked once after the given interval.
     *
     * The timer callback function MUST be able to accept a single parameter,
     * the timer instance as also returned by this method or you MAY use a
     * function which has no parameters at all.
     *
     * The timer callback function MUST NOT throw an `Exception`.
     * The return value of the timer callback function will be ignored and has
     * no effect, so for performance reasons you're recommended to not return
     * any excessive data structures.
     *
     * Unlike [`addPeriodicTimer()`](#addperiodictimer), this method will ensure
     * the callback will be invoked only once after the given interval.
     * You can invoke [`cancelTimer`](#canceltimer) to cancel a pending timer.
     *
     * ```php
     * $loop->addTimer(0.8, function () {
     *     echo 'world!' . PHP_EOL;
     * });
     *
     * $loop->addTimer(0.3, function () {
     *     echo 'hello ';
     * });
     * ```
     *
     * See also [example #1](examples).
     *
     * If you want to access any variables within your callback function, you
     * can bind arbitrary data to a callback closure like this:
     *
     * ```php
     * function hello($name, LoopInterface $loop)
     * {
     *     $loop->addTimer(1.0, function () use ($name) {
     *         echo "hello $name\n";
     *     });
     * }
     *
     * hello('Tester', $loop);
     * ```
     *
     * This interface does not enforce any particular timer resolution, so
     * special care may have to be taken if you rely on very high precision with
     * millisecond accuracy or below. Event loop implementations SHOULD work on
     * a best effort basis and SHOULD provide at least millisecond accuracy
     * unless otherwise noted. Many existing event loop implementations are
     * known to provide microsecond accuracy, but it's generally not recommended
     * to rely on this high precision.
     *
     * Similarly, the execution order of timers scheduled to execute at the
     * same time (within its possible accuracy) is not guaranteed.
     *
     * This interface suggests that event loop implementations SHOULD use a
     * monotonic time source if available. Given that a monotonic time source is
     * only available as of PHP 7.3 by default, event loop implementations MAY
     * fall back to using wall-clock time.
     * While this does not affect many common use cases, this is an important
     * distinction for programs that rely on a high time precision or on systems
     * that are subject to discontinuous time adjustments (time jumps).
     * This means that if you schedule a timer to trigger in 30s and then adjust
     * your system time forward by 20s, the timer SHOULD still trigger in 30s.
     * See also [event loop implementations](#loop-implementations) for more details.
     *
     * @param int|float $interval The number of seconds to wait before execution.
     * @param callable  $callback The callback to invoke.
     *
     * @return TimerInterface
     */
    public function addTimer($interval, $callback);

    /**
     * Enqueue a callback to be invoked repeatedly after the given interval.
     *
     * The timer callback function MUST be able to accept a single parameter,
     * the timer instance as also returned by this method or you MAY use a
     * function which has no parameters at all.
     *
     * The timer callback function MUST NOT throw an `Exception`.
     * The return value of the timer callback function will be ignored and has
     * no effect, so for performance reasons you're recommended to not return
     * any excessive data structures.
     *
     * Unlike [`addTimer()`](#addtimer), this method will ensure the the
     * callback will be invoked infinitely after the given interval or until you
     * invoke [`cancelTimer`](#canceltimer).
     *
     * ```php
     * $timer = $loop->addPeriodicTimer(0.1, function () {
     *     echo 'tick!' . PHP_EOL;
     * });
     *
     * $loop->addTimer(1.0, function () use ($loop, $timer) {
     *     $loop->cancelTimer($timer);
     *     echo 'Done' . PHP_EOL;
     * });
     * ```
     *
     * See also [example #2](examples).
     *
     * If you want to limit the number of executions, you can bind
     * arbitrary data to a callback closure like this:
     *
     * ```php
     * function hello($name, LoopInterface $loop)
     * {
     *     $n = 3;
     *     $loop->addPeriodicTimer(1.0, function ($timer) use ($name, $loop, &$n) {
     *         if ($n > 0) {
     *             --$n;
     *             echo "hello $name\n";
     *         } else {
     *             $loop->cancelTimer($timer);
     *         }
     *     });
     * }
     *
     * hello('Tester', $loop);
     * ```
     *
     * This interface does not enforce any particular timer resolution, so
     * special care may have to be taken if you rely on very high precision with
     * millisecond accuracy or below. Event loop implementations SHOULD work on
     * a best effort basis and SHOULD provide at least millisecond accuracy
     * unless otherwise noted. Many existing event loop implementations are
     * known to provide microsecond accuracy, but it's generally not recommended
     * to rely on this high precision.
     *
     * Similarly, the execution order of timers scheduled to execute at the
     * same time (within its possible accuracy) is not guaranteed.
     *
     * This interface suggests that event loop implementations SHOULD use a
     * monotonic time source if available. Given that a monotonic time source is
     * only available as of PHP 7.3 by default, event loop implementations MAY
     * fall back to using wall-clock time.
     * While this does not affect many common use cases, this is an important
     * distinction for programs that rely on a high time precision or on systems
     * that are subject to discontinuous time adjustments (time jumps).
     * This means that if you schedule a timer to trigger in 30s and then adjust
     * your system time forward by 20s, the timer SHOULD still trigger in 30s.
     * See also [event loop implementations](#loop-implementations) for more details.
     *
     * Additionally, periodic timers may be subject to timer drift due to
     * re-scheduling after each invocation. As such, it's generally not
     * recommended to rely on this for high precision intervals with millisecond
     * accuracy or below.
     *
     * @param int|float $interval The number of seconds to wait before execution.
     * @param callable  $callback The callback to invoke.
     *
     * @return TimerInterface
     */
    public function addPeriodicTimer($interval, $callback);

    /**
     * Cancel a pending timer.
     *
     * See also [`addPeriodicTimer()`](#addperiodictimer) and [example #2](examples).
     *
     * Calling this method on a timer instance that has not been added to this
     * loop instance or on a timer that has already been cancelled has no effect.
     *
     * @param TimerInterface $timer The timer to cancel.
     *
     * @return void
     */
    public function cancelTimer(TimerInterface $timer);

    /**
     * Schedule a callback to be invoked on a future tick of the event loop.
     *
     * This works very much similar to timers with an interval of zero seconds,
     * but does not require the overhead of scheduling a timer queue.
     *
     * The tick callback function MUST be able to accept zero parameters.
     *
     * The tick callback function MUST NOT throw an `Exception`.
     * The return value of the tick callback function will be ignored and has
     * no effect, so for performance reasons you're recommended to not return
     * any excessive data structures.
     *
     * If you want to access any variables within your callback function, you
     * can bind arbitrary data to a callback closure like this:
     *
     * ```php
     * function hello($name, LoopInterface $loop)
     * {
     *     $loop->futureTick(function () use ($name) {
     *         echo "hello $name\n";
     *     });
     * }
     *
     * hello('Tester', $loop);
     * ```
     *
     * Unlike timers, tick callbacks are guaranteed to be executed in the order
     * they are enqueued.
     * Also, once a callback is enqueued, there's no way to cancel this operation.
     *
     * This is often used to break down bigger tasks into smaller steps (a form
     * of cooperative multitasking).
     *
     * ```php
     * $loop->futureTick(function () {
     *     echo 'b';
     * });
     * $loop->futureTick(function () {
     *     echo 'c';
     * });
     * echo 'a';
     * ```
     *
     * See also [example #3](examples).
     *
     * @param callable $listener The callback to invoke.
     *
     * @return void
     */
    public function futureTick($listener);

    /**
     * Register a listener to be notified when a signal has been caught by this process.
     *
     * This is useful to catch user interrupt signals or shutdown signals from
     * tools like `supervisor` or `systemd`.
     *
     * The listener callback function MUST be able to accept a single parameter,
     * the signal added by this method or you MAY use a function which
     * has no parameters at all.
     *
     * The listener callback function MUST NOT throw an `Exception`.
     * The return value of the listener callback function will be ignored and has
     * no effect, so for performance reasons you're recommended to not return
     * any excessive data structures.
     *
     * ```php
     * $loop->addSignal(SIGINT, function (int $signal) {
     *     echo 'Caught user interrupt signal' . PHP_EOL;
     * });
     * ```
     *
     * See also [example #4](examples).
     *
     * Signaling is only available on Unix-like platform, Windows isn't
     * supported due to operating system limitations.
     * This method may throw a `BadMethodCallException` if signals aren't
     * supported on this platform, for example when required extensions are
     * missing.
     *
     * **Note: A listener can only be added once to the same signal, any
     * attempts to add it more then once will be ignored.**
     *
     * @param int $signal
     * @param callable $listener
     *
     * @throws \BadMethodCallException when signals aren't supported on this
     *     platform, for example when required extensions are missing.
     *
     * @return void
     */
    public function addSignal($signal, $listener);

    /**
     * Removes a previously added signal listener.
     *
     * ```php
     * $loop->removeSignal(SIGINT, $listener);
     * ```
     *
     * Any attempts to remove listeners that aren't registered will be ignored.
     *
     * @param int $signal
     * @param callable $listener
     *
     * @return void
     */
    public function removeSignal($signal, $listener);

    /**
     * Run the event loop until there are no more tasks to perform.
     *
     * For many applications, this method is the only directly visible
     * invocation on the event loop.
     * As a rule of thumb, it is usally recommended to attach everything to the
     * same loop instance and then run the loop once at the bottom end of the
     * application.
     *
     * ```php
     * $loop->run();
     * ```
     *
     * This method will keep the loop running until there are no more tasks
     * to perform. In other words: This method will block until the last
     * timer, stream and/or signal has been removed.
     *
     * Likewise, it is imperative to ensure the application actually invokes
     * this method once. Adding listeners to the loop and missing to actually
     * run it will result in the application exiting without actually waiting
     * for any of the attached listeners.
     *
     * This method MUST NOT be called while the loop is already running.
     * This method MAY be called more than once after it has explicity been
     * [`stop()`ped](#stop) or after it automatically stopped because it
     * previously did no longer have anything to do.
     *
     * @return void
     */
    public function run();

    /**
     * Instruct a running event loop to stop.
     *
     * This method is considered advanced usage and should be used with care.
     * As a rule of thumb, it is usually recommended to let the loop stop
     * only automatically when it no longer has anything to do.
     *
     * This method can be used to explicitly instruct the event loop to stop:
     *
     * ```php
     * $loop->addTimer(3.0, function () use ($loop) {
     *     $loop->stop();
     * });
     * ```
     *
     * Calling this method on a loop instance that is not currently running or
     * on a loop instance that has already been stopped has no effect.
     *
     * @return void
     */
    public function stop();
}
