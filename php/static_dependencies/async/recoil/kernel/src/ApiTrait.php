<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Kernel;

use BadMethodCallException;
use Icecave\Repr\Repr;
use InvalidArgumentException;
use Recoil\Kernel\Exception\RejectedException;
use Recoil\Recoil;
use Throwable;
use UnexpectedValueException;

/**
 * A partial implementation of {@see Api}.
 */
trait ApiTrait
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
     * @return Generator|null
     */
    public function __dispatch(SystemStrand $strand, $key, $value)
    {
        if (null === $value) {
            return $this->cooperate($strand);
        }

        if (\is_integer($value) || \is_float($value)) {
            return $this->sleep($strand, $value);
        }

        if (\is_array($value)) {
            return $this->all($strand, ...$value);
        }

        if (\is_resource($value)) {
            if (\is_string($key)) {
                return $this->write($strand, $value, $key, PHP_INT_MAX);
            } else {
                return $this->read($strand, $value, 1, PHP_INT_MAX);
            }
        }

        if (\method_exists($value, 'then')) {
            $onFulfilled = static function ($result) use ($strand) {
                $strand->send($result);
            };

            $onRejected = static function ($reason) use ($strand) {
                if ($reason instanceof Throwable) {
                    $strand->throw($reason);
                } else {
                    $strand->throw(new RejectedException($reason));
                }
            };

            if (\method_exists($value, 'done')) {
                $value->done($onFulfilled, $onRejected);
            } else {
                $value->then($onFulfilled, $onRejected);
            }

            if (\method_exists($value, 'cancel')) {
                $strand->setTerminator(function () use ($value) {
                    $value->cancel();
                });
            }

            return null;
        }

        $strand->throw(
            new UnexpectedValueException(
                'The yielded pair ('
                . Repr::repr($key)
                . ', '
                . Repr::repr($value)
                . ') does not describe any known operation.'
            )
        );

        return null;
    }

    /**
     * Invoke a non-standard API operation.
     *
     * The first element in $arguments must be the calling strand.
     */
    public function __call(string $name, array $arguments)
    {
        (function (string $name, SystemStrand $strand) {
            $strand->throw(
                new BadMethodCallException(
                    'The API does not implement an operation named "' . $name . '".'
                )
            );
        })($name, ...$arguments);
    }

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
    public function execute(SystemStrand $strand, $coroutine)
    {
        $strand->send($strand->kernel()->execute($coroutine));
    }

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
    public function callback(SystemStrand $strand, callable $coroutine)
    {
        $kernel = $strand->kernel();

        $strand->send(
            static function (...$arguments) use ($kernel, $coroutine) {
                $kernel->execute($coroutine(...$arguments));
            }
        );
    }

    /**
     * Force the current strand to cooperate.
     *
     * @see Recoil::cooperate() for the full specification.
     *
     * @param SystemStrand $strand The strand executing the API call.
     *
     * @return Generator|null
     */
    abstract public function cooperate(SystemStrand $strand);

    /**
     * Suspend the current strand for a fixed interval.
     *
     * @see Recoil::sleep() for the full specification.
     *
     * @param SystemStrand $strand   The strand executing the API call.
     * @param float        $interval The interval to wait.
     *
     * @return Generator|null
     */
    abstract public function sleep(SystemStrand $strand, float $interval);

    /**
     * Get the current strand.
     *
     * @see Recoil::strand() for the full specification.
     *
     * @param SystemStrand $strand The strand executing the API call.
     *
     * @return Generator|null
     */
    public function strand(SystemStrand $strand)
    {
        $strand->send($strand);
    }

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
    ) {
        if ($terminateFn) {
            $strand->setTerminator($terminateFn);
        }
        if ($suspendFn) {
            $suspendFn($strand);
        }
    }

    /**
     * Terminate the current strand.
     *
     * @see Recoil::terminate() for the full specification.
     *
     * @param SystemStrand $strand The strand executing the API call.
     *
     * @return Generator|null
     */
    public function terminate(SystemStrand $strand)
    {
        $strand->terminate();
    }

    /**
     * Stop the kernel.
     *
     * @see Recoil::stop() for the full specification.
     *
     * @param SystemStrand $strand The strand executing the API call.
     *
     * @return Generator|null
     */
    public function stop(SystemStrand $strand)
    {
        $strand->kernel()->stop();
    }

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
    ) {
        if ($strandB === null) {
            $strandB = $strand;
        }

        $strandA->link($strandB);
        $strandB->link($strandA);

        $strand->send();
    }

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
    ) {
        if ($strandB === null) {
            $strandB = $strand;
        }

        $strandA->unlink($strandB);
        $strandB->unlink($strandA);

        $strand->send();
    }

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
    public function adopt(SystemStrand $strand, SystemStrand $substrand)
    {
        $strand->setTerminator(function () use ($substrand) {
            $substrand->clearPrimaryListener();
            $substrand->terminate();
        });

        $substrand->setPrimaryListener($strand);
    }

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
    public function all(SystemStrand $strand, ...$coroutines)
    {
        if (empty($coroutines)) {
            return (function () {
                yield Recoil::cooperate();

                return [];
            })();
        }

        $kernel = $strand->kernel();
        $substrands = [];

        foreach ($coroutines as $coroutine) {
            $substrands[] = $kernel->execute($coroutine);
        }

        (new StrandWaitAll(...$substrands))->await($strand);

        return null;
    }

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
    public function any(SystemStrand $strand, ...$coroutines)
    {
        if (empty($coroutines)) {
            return $this->cooperate($strand);
        }

        $kernel = $strand->kernel();
        $substrands = [];

        foreach ($coroutines as $coroutine) {
            $substrands[] = $kernel->execute($coroutine);
        }

        (new StrandWaitAny(...$substrands))->await($strand);

        return null;
    }

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
    public function some(SystemStrand $strand, int $count, ...$coroutines)
    {
        $max = \count($coroutines);

        if ($count < 0 || $count > $max) {
            $strand->throw(
                new InvalidArgumentException(
                    'Can not wait for '
                    . $count
                    . ' coroutines, count must be between 0 and '
                    . $max
                    . ', inclusive.'
                )
            );

            return null;
        }

        if ($count == 0 || empty($coroutines)) {
            return (function () {
                yield Recoil::cooperate();

                return [];
            })();
        }

        $kernel = $strand->kernel();
        $substrands = [];

        foreach ($coroutines as $coroutine) {
            $substrands[] = $kernel->execute($coroutine);
        }

        (new StrandWaitSome($count, ...$substrands))->await($strand);

        return null;
    }

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
    public function first(SystemStrand $strand, ...$coroutines)
    {
        if (empty($coroutines)) {
            return $this->cooperate($strand);
        }

        $kernel = $strand->kernel();
        $substrands = [];

        foreach ($coroutines as $coroutine) {
            $substrands[] = $kernel->execute($coroutine);
        }

        (new StrandWaitFirst(...$substrands))->await($strand);

        return null;
    }

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
    abstract public function read(
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
    abstract public function write(
        SystemStrand $strand,
        $stream,
        string $buffer,
        int $length
    );
}
