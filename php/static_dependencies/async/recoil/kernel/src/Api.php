<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Kernel;

use Recoil\Recoil;

/**
 * The kernel's interface to the implementation of the operations described by
 * the {@see Recoil} API facade.
 *
 * Each operation is passed the strand that called the API operation as its
 * first argument. Operations may by implemented as a regular PHP function or
 * as a coroutine (by returning a generator).
 */
interface Api
{
    /**
     * Dispatch an API call based on the key and value yielded from a coroutine.
     *
     * The implementation should not attribute any special behaviour to integer
     * keys, as PHP's generator implementation implicitly yields integer keys
     * when a value is yielded without specifying a key.
     *
     * This method is responsible for handling the "dispatchable values" as
     * described in the doc-block of the {@see Recoil} API facade.
     *
     * @param SystemStrand $strand The strand executing the API call.
     * @param mixed        $key    The yielded key.
     * @param mixed        $value  The yielded value.
     *
     * @return null
     */
    public function __dispatch(SystemStrand $strand, $key, $value);

    /**
     * Invoke a non-standard API operation.
     *
     * The first element in $arguments must be the calling strand. If no such
     * operation exists, the calling strand should be resumed with a
     * BadMethodCallException.
     *
     * @return Generator|null
     */
    public function __call(string $name, array $arguments);

    /**
     * Schedule a coroutine for execution on a new strand.
     *
     * @see Recoil::execute() for the full specification.
     *
     * @param SystemStrand $strand    The strand executing the API call.
     * @param mixed        $coroutine The coroutine to execute.
     *
     * @return Generator|null
     */
    public function execute(SystemStrand $strand, $coroutine);

    /**
     * Create a callback function that starts a new strand of execution.
     *
     * @see Recoil::callback() for the full specification.
     *
     * @param SystemStrand $strand    The strand executing the API call.
     * @param callable     $coroutine The coroutine to execute.
     *
     * @return Generator|null
     */
    public function callback(SystemStrand $strand, callable $coroutine);

    /**
     * Force the current strand to cooperate.
     *
     * @see Recoil::cooperate() for the full specification.
     *
     * @param SystemStrand $strand The strand executing the API call.
     *
     * @return Generator|null
     */
    public function cooperate(SystemStrand $strand);

    /**
     * Suspend the current strand for a fixed interval.
     *
     * @see Recoil::sleep() for the full specification.
     *
     * @param SystemStrand $strand   The strand executing the API call.
     * @param float        $interval The interval to wait, in seconds.
     *
     * @return Generator|null
     */
    public function sleep(SystemStrand $strand, float $interval);

    /**
     * Execute a coroutine with a cap on execution time.
     *
     * @see Recoil::timeout() for the full specification.
     *
     * @param SystemStrand $strand    The strand executing the API call.
     * @param float        $timeout   The interval to allow for execution, in seconds.
     * @param mixed        $coroutine The coroutine to execute.
     *
     * @return Generator|null
     */
    public function timeout(SystemStrand $strand, float $timeout, $coroutine);

    /**
     * Get the current strand.
     *
     * @see Recoil::strand() for the full specification.
     *
     * @param SystemStrand $strand The strand executing the API call.
     *
     * @return Generator|null
     */
    public function strand(SystemStrand $strand);

    /**
     * Suspend execution of the calling strand until it is manually resumed or
     * terminated.
     *
     * @see Recoil::suspend() for the full specification.
     *
     * @param SystemStrand  $strand      The strand executing the API call.
     * @param callable|null $suspendFn   A function invoked with the strand after it is suspended.
     * @param callable|null $terminateFn A function invoked if the strand is terminated while suspended.
     *
     * @return Generator|null
     */
    public function suspend(
        SystemStrand $strand,
        callable $suspendFn = null,
        callable $terminateFn = null
    );

    /**
     * Terminate the current strand.
     *
     * @see Recoil::terminate() for the full specification.
     *
     * @param SystemStrand $strand The strand executing the API call.
     *
     * @return Generator|null
     */
    public function terminate(SystemStrand $strand);

    /**
     * Stop the kernel.
     *
     * @see Recoil::stop() for the full specification.
     *
     * @param SystemStrand $strand The strand executing the API call.
     *
     * @return Generator|null
     */
    public function stop(SystemStrand $strand);

    /**
     * Create a bi-directional link between two strands.
     *
     * @see Recoil::link() for the full specification.
     *
     * @param SystemStrand      $strand  The strand executing the API call.
     * @param SystemStrand      $strandA The first strand to link.
     * @param SystemStrand|null $strandB The second strand to link (null = calling strand).
     *
     * @return Generator|null
     */
    public function link(
        SystemStrand $strand,
        SystemStrand $strandA,
        SystemStrand $strandB = null
    );

    /**
     * Break a previously established bi-directional link between strands.
     *
     * @see Recoil::link() for the full specification.
     *
     * @param SystemStrand      $strand  The strand executing the API call.
     * @param SystemStrand      $strandA The first strand to unlink.
     * @param SystemStrand|null $strandB The second strand to unlink (null = calling strand).
     *
     * @return Generator|null
     */
    public function unlink(
        SystemStrand $strand,
        SystemStrand $strandA,
        SystemStrand $strandB = null
    );

    /**
     * Take ownership of a strand and wait for it to exit.
     *
     * @see Recoil::adopt() for the full specification.
     *
     * @param SystemStrand $strand    The strand executing the API call.
     * @param SystemStrand $substrand The strand to monitor.
     *
     * @return Generator|null
     */
    public function adopt(SystemStrand $strand, SystemStrand $substrand);

    /**
     * Execute multiple coroutines concurrently and wait for them all to return.
     *
     * @see Recoil::all() for the full specification.
     *
     * @param SystemStrand $strand         The strand executing the API call.
     * @param mixed        $coroutines,... The coroutines to execute.
     *
     * @return Generator|null
     */
    public function all(SystemStrand $strand, ...$coroutines);

    /**
     * Execute multiple coroutines concurrently and wait for any one of them to
     * return.
     *
     * @see Recoil::any() for the full specification.
     *
     * @param SystemStrand $strand         The strand executing the API call.
     * @param mixed        $coroutines,... The coroutines to execute.
     *
     * @return Generator|null
     */
    public function any(SystemStrand $strand, ...$coroutines);

    /**
     * Execute multiple coroutines concurrently and wait for a subset of them to
     * return.
     *
     * @see Recoil::some() for the full specification.
     *
     * @param SystemStrand $strand         The strand executing the API call.
     * @param int          $count          The required number of successful strands.
     * @param mixed        $coroutines,... The coroutines to execute.
     *
     * @return Generator|null
     */
    public function some(SystemStrand $strand, int $count, ...$coroutines);

    /**
     * Execute multiple coroutines concurrently and wait for any one of them
     * to return or throw an exception.
     *
     * @see Recoil::first() for the full specification.
     *
     * @param SystemStrand $strand         The strand executing the API call.
     * @param mixed        $coroutines,... The coroutines to execute.
     *
     * @return Generator|null
     */
    public function first(SystemStrand $strand, ...$coroutines);

    /**
     * Read data from a stream.
     *
     * @see Recoil::read() for the full specification.
     *
     * @param SystemStrand $strand    The strand executing the API call.
     * @param resource     $stream    A readable stream resource.
     * @param int          $minLength The minimum number of bytes to read.
     * @param int          $maxLength The maximum number of bytes to read.
     *
     * @return Generator|null
     */
    public function read(
        SystemStrand $strand,
        $stream,
        int $minLength,
        int $maxLength
    );

    /**
     * Write data to a stream.
     *
     * @see Recoil::write() for the full specification.
     *
     * @param SystemStrand $strand The strand executing the API call.
     * @param resource     $stream A writable stream resource.
     * @param string       $buffer The data to write to the stream.
     * @param int          $length The maximum number of bytes to write.
     *
     * @return Generator|null
     */
    public function write(
        SystemStrand $strand,
        $stream,
        string $buffer,
        int $length
    );

    /**
     * Wait for one or more streams to become readable or writable.
     *
     * @see Recoil::select() for the full specification.
     *
     * @param SystemStrand    $strand The strand executing the API call.
     * @param array<resource> $read   The set of readable streams.
     * @param array<resource> $read   The set of writable streams.
     *
     * @return Generator|null
     */
    public function select(SystemStrand $strand, array $read, array $write);
}
