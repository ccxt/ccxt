<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Kernel;

use Closure;
use Generator;
use Icecave\Repr\Repr;
use Recoil\ApiCall;
use Recoil\Awaitable;
use Recoil\AwaitableProvider;
use Recoil\CoroutineProvider;
use Recoil\Exception\TerminatedException;
use Recoil\Kernel\Exception\PrimaryListenerRemovedException;
use Recoil\Kernel\Exception\StrandListenerException;
use Recoil\Listener;
use Recoil\Strand;
use Recoil\StrandTrace;
use SplObjectStorage;
use Throwable;
use UnexpectedValueException;

/**
 * The standard {@see SystemStrand} implementation.
 */
trait StrandTrait
{
    /**
     * @param SystemKernel $kernel     The kernel on which the strand is executing.
     * @param Api          $api        The kernel API used to handle yielded values.
     * @param int          $id         The strand ID.
     * @param mixed        $entryPoint The strand's entry-point coroutine.
     */
    public function __construct(
        SystemKernel $kernel,
        Api $api,
        int $id,
        $entryPoint
    ) {
        $this->kernel = $kernel;
        $this->primaryListener = $kernel;
        $this->api = $api;
        $this->id = $id;

        if ($entryPoint instanceof Generator) {
            $this->current = $entryPoint;
        } elseif ($entryPoint instanceof CoroutineProvider) {
            $this->current = $entryPoint->coroutine();
        } else {
            $this->current = (static function () use ($entryPoint) {
                return yield $entryPoint;
            })();
        }
    }

    /**
     * Get the strand's ID.
     *
     * Strand IDs are unique within the kernel.
     */
    public function id(): int
    {
        return $this->id;
    }

    /**
     * Get the kernel that the strand is running on.
     */
    public function kernel(): SystemKernel
    {
        return $this->kernel;
    }

    /**
     * Start the strand.
     */
    public function start()
    {
        ////////////////////////////////////////////////////////////////////////////
        // This method intentionally sacrifices readability in order to keep      //
        // the number of function calls to a minimum for the sake of performance. //
        ////////////////////////////////////////////////////////////////////////////

        // The strand has exited already. This can occur if it is terminated
        // immediately after being scheduled for execution ...
        if ($this->state === StrandState::EXITED) {
            return;
        }

        assert(
            $this->state === StrandState::READY || $this->state === StrandState::SUSPENDED_INACTIVE,
            'strand state must be READY or SUSPENDED_INACTIVE to start the strand'
        );

        assert(
            $this->state !== StrandState::SUSPENDED_INACTIVE || $this->action !== null,
            'action must be provided to start the strand when SUSPENDED_INACTIVE'
        );

        // Trace the stack push of the entry-point, this is performed inside an
        // assertion so that it can be optimised away completely in production ...
        assert(
            $this->state !== StrandState::READY ||
            $this->trace === null ||
            $this->trace->push($this, 0) ||
            true
        );

        $this->state = StrandState::RUNNING;
        $this->terminator = null;

        // Execute the next "tick" of the current coroutine ...
        try {
            // If action is set, we are resuming the generator. The action and
            // the associated value variable must be set before jumping to the
            // "resume_generator" label, or by calling send() or throw() ...
            if ($this->action) {
                resume_generator:
                assert($this->current instanceof Generator, 'call-stack must not be empty');
                assert($this->state === StrandState::RUNNING, 'strand state must be RUNNING');
                assert($this->action === 'send' || $this->action === 'throw', 'action must be "send" or "throw"');
                assert($this->action !== 'throw' || $this->value instanceof Throwable, 'value must be throwable');

                // Trace the resume, this is performed inside an assertion so
                // that it can be optimised away completely in production ...
                assert(
                    $this->trace === null ||
                    $this->trace->resume($this, $this->depth + 1, $this->action, $this->value) ||
                    true
                );

                $this->terminator = null;
                $this->current->{$this->action}($this->value);
                $this->action = $this->value = null;
            }

            // The "start_generator" label is jumped to when a new generator has
            // been pushed onto the call-stack ...
            start_generator:
            assert($this->current instanceof Generator, 'call-stack must not be empty');
            assert($this->state === StrandState::RUNNING, 'strand state must be RUNNING');

            // If the generator is "valid" it has futher iterations to perform,
            // therefore it has yielded, rather than returned ...
            if ($this->current->valid()) {
                $produced = $this->current->current();

                // Trace the yield, this is performed inside an assertion so
                // that it can be optimised away completely in production ...
                assert(
                    $this->trace === null ||
                    $this->trace->yield($this, $this->depth + 1, $this->current->key(), $produced) ||
                    true
                );

                $this->state = StrandState::SUSPENDED_ACTIVE;

                try {
                    // Another generator was yielded, push it onto the call
                    // stack and execute it ...
                    if ($produced instanceof Generator) {
                        push_generator:
                        assert(
                            $produced instanceof Generator,
                            'can not push non-generator onto stack'
                        );

                        // "fast" functionless stack-push ...
                        $this->stack[$this->depth++] = $this->current;
                        $this->current = $produced;
                        $this->state = StrandState::RUNNING;

                        // Trace the stack push, this is performed inside an
                        // assertion so that it can be optimised away completely
                        // in production ...
                        assert(
                            $this->trace === null ||
                            $this->trace->push($this, $this->depth) ||
                            true
                        );

                        goto start_generator;

                    // A coroutine provider was yielded. Extract the coroutine
                    // then push it onto the call-stack and execute it ...
                    } elseif ($produced instanceof CoroutineProvider) {
                        // The coroutine is extracted from the provider before the
                        // stack push is begun in case coroutine() throws ...
                        $produced = $produced->coroutine();
                        goto push_generator;

                    // An API call was made through the Recoil static facade ...
                    } elseif ($produced instanceof ApiCall) {
                        $produced = $this->api->{$produced->__name}(
                            $this,
                            ...$produced->__arguments
                        );

                        assert(
                            $produced === null || $produced instanceof Generator,
                            'API operations must be return Generator|null'
                        );

                        if ($produced instanceof Generator) {
                            goto push_generator;
                        }

                    // A generic awaitable object was yielded ...
                    } elseif ($produced instanceof Awaitable) {
                        $produced->await($this);

                    // An awaitable provider was yielded ...
                    } elseif ($produced instanceof AwaitableProvider) {
                        $produced->awaitable()->await($this);

                    // A raw callable was yielded ...
                    } elseif (
                        $produced instanceof Closure || // perf
                        \is_callable($produced)
                    ) {
                        $produced = $produced();

                        if ($produced instanceof Generator) {
                            goto push_generator;
                        }

                        throw new UnexpectedValueException(
                            'The yielded callable returned ' .
                            Repr::repr($produced) .
                            ', expected a generator.'
                        );

                    // Some unidentified value was yielded, allow the API to
                    // dispatch the operation as it sees fit ...
                    } else {
                        $produced = $this->api->__dispatch(
                            $this,
                            $this->current->key(),
                            $produced
                        );

                        assert(
                            $produced === null || $produced instanceof Generator,
                            'API operations must be return Generator|null'
                        );

                        if ($produced instanceof Generator) {
                            goto push_generator;
                        }
                    }

                // An exception occurred as a result of the yielded value. This
                // exception is not propagated up the call-stack, but rather
                // sent back to the current coroutine (i.e., the one that yielded
                // the value) ...
                } catch (Throwable $e) {
                    $this->action = 'throw';
                    $this->value = $e;
                    $this->state = StrandState::RUNNING;
                    goto resume_generator;
                }

                // The strand has already been set back to the READY state. This
                // means that send() or throw() was called while handling the
                // yielded value. Resume the current coroutine immediately ...
                if ($this->state === StrandState::READY) {
                    $this->state = StrandState::RUNNING;
                    goto resume_generator;

                // Otherwise, if the strand was not terminated while handling
                // the yielded value, it is now fully suspended. No further
                // action will be performed until send() or throw() is called ...
                } elseif ($this->state !== StrandState::EXITED) {
                    $this->state = StrandState::SUSPENDED_INACTIVE;

                    // Trace the suspend, this is performed inside an assertion
                    // so that it can be optimised away completely in production ...
                    assert(
                        $this->trace === null ||
                        $this->trace->suspend($this, $this->depth + 1) ||
                        true
                    );
                }

                return;
            }

            // The generator is not "valid", and has therefore returned a value
            // (which may be null) ...
            $this->action = 'send';
            $this->value = $this->current->getReturn();

        // An exception was thrown during the execution of the generator ...
        } catch (Throwable $e) {
            $this->action = 'throw';
            $this->value = $e;
        }

        // Trace the stack pop, this is performed inside an assertion so
        // that it can be optimised away completely in production ...
        assert(
            $this->trace === null ||
            $this->trace->pop($this, $this->depth) ||
            true
        );

        // The current coroutine has ended, either by returning or throwing. If
        // there is a coroutine above it on the call-stack, we pop the current
        // coroutine from the stack and resume the parent ...
        if ($this->depth) {
            // "fast" functionless stack-pop ...
            $current = &$this->stack[--$this->depth];
            $this->current = $current;
            $current = null;

            $this->state = StrandState::RUNNING;
            goto resume_generator;
        }

        // Trace the exit. This is performed inside an assertion so that it can
        // be optimised away completely in production ...
        assert(
            $this->trace === null ||
            $this->trace->exit($this, 0, $this->action, $this->value) ||
            true
        );

        // Otherwise the call-stack is empty, the strand has exited ...
        $this->exit();
    }

    /**
     * Terminate execution of the strand.
     *
     * If the strand is suspended waiting on an asynchronous operation, that
     * operation is cancelled.
     *
     * The call-stack is not unwound, it is simply discarded.
     */
    public function terminate()
    {
        if ($this->state === StrandState::EXITED) {
            return;
        }

        $this->stack = [];
        $this->action = 'throw';
        $this->value = TerminatedException::create($this);

        // Trace the exit. This is performed inside an assertion so that it can
        // be optimised away completely in production ...
        assert(
            $this->trace === null ||
            $this->trace->exit($this, $this->depth + 1, $this->action, $this->value) ||
            true
        );

        if ($this->terminator) {
            ($this->terminator)($this);
        }

        $this->exit();
    }

    /**
     * Resume execution of a suspended strand.
     *
     * @param mixed       $value  The value to send to the coroutine on the the top of the call-stack.
     * @param Strand|null $strand The strand that produced this result upon exit, if any.
     */
    public function send($value = null, Strand $strand = null)
    {
        // Ignore resumes after exit, not all asynchronous operations will have
        // meaningful cancel operations and some may attempt to resume the
        // strand after it has been terminated.
        if ($this->state === StrandState::EXITED) {
            return;
        }

        assert(
            $this->state === StrandState::SUSPENDED_ACTIVE ||
            $this->state === StrandState::SUSPENDED_INACTIVE,
            'strand must be suspended to resume'
        );

        $this->action = 'send';
        $this->value = $value;

        if ($this->state === StrandState::SUSPENDED_INACTIVE) {
            $this->start();
        } else {
            $this->state = StrandState::READY;
        }
    }

    /**
     * Resume execution of a suspended strand with an error.
     *
     * @param Throwable   $exception The operation result.
     * @param Strand|null $strand    The strand that produced this exception upon exit, if any.
     */
    public function throw(Throwable $exception, Strand $strand = null)
    {
        // Ignore resumes after exit, not all asynchronous operations will have
        // meaningful cancel operations and some may attempt to resume the
        // strand after it has been terminated.
        if ($this->state === StrandState::EXITED) {
            return;
        }

        assert(
            $this->state === StrandState::SUSPENDED_ACTIVE ||
            $this->state === StrandState::SUSPENDED_INACTIVE,
            'strand must be suspended to resume'
        );

        $this->action = 'throw';
        $this->value = $exception;

        if ($this->state === StrandState::SUSPENDED_INACTIVE) {
            $this->start();
        } else {
            $this->state = StrandState::READY;
        }
    }

    /**
     * Check if the strand has exited.
     */
    public function hasExited(): bool
    {
        return $this->state === StrandState::EXITED;
    }

    /**
     * Set the primary listener.
     *
     * If the current primary listener is not the kernel, it is notified with
     * a {@see PrimaryListenerRemovedException}.
     *
     * @return null
     */
    public function setPrimaryListener(Listener $listener)
    {
        if ($this->state === StrandState::EXITED) {
            $listener->{$this->action}($this->value, $this);
        } else {
            $previous = $this->primaryListener;
            $this->primaryListener = $listener;

            if ($previous !== $this->kernel) {
                $previous->throw(
                    new PrimaryListenerRemovedException($previous, $this),
                    $this
                );
            }
        }
    }

    /**
     * Set the primary listener to the kernel.
     *
     * The current primary listener is not notified.
     */
    public function clearPrimaryListener()
    {
        $this->primaryListener = $this->kernel;
    }

    /**
     * Set the strand 'terminator'.
     *
     * The terminator is a function invoked when the strand is terminated. It is
     * used by the kernel API to clean up any pending asynchronous operations.
     *
     * The terminator function is removed without being invoked when the strand
     * is resumed.
     */
    public function setTerminator(callable $fn = null)
    {
        assert(
            !$fn || !$this->terminator,
            'only a single terminator can be set'
        );

        assert(
            $this->state === StrandState::READY ||
            $this->state === StrandState::SUSPENDED_ACTIVE ||
            $this->state === StrandState::SUSPENDED_INACTIVE,
            'strand must be suspended to set a terminator'
        );

        $this->terminator = $fn;
    }

    /**
     * The Strand interface extends AwaitableProvider, but this particular
     * implementation can provide await functionality directly.
     *
     * Implementations must favour await() over awaitable() when both are
     * available to avoid a pointless performance hit.
     */
    public function awaitable(): Awaitable
    {
        return $this;
    }

    /**
     * Attach a listener to this object.
     *
     * @param Listener $listener The object to resume when the work is complete.
     *
     * @return null
     */
    public function await(Listener $listener)
    {
        if ($this->state === StrandState::EXITED) {
            $listener->{$this->action}($this->value, $this);
        } else {
            $this->listeners[] = $listener;
        }
    }

    /**
     * Create a uni-directional link to another strand.
     *
     * If this strand exits, any linked strands are terminated.
     *
     * @return null
     */
    public function link(SystemStrand $strand)
    {
        if ($this === $strand) {
            return;
        }

        if ($this->linkedStrands === null) {
            $this->linkedStrands = new SplObjectStorage();
        }

        $this->linkedStrands->attach($strand);
    }

    /**
     * Break a previously created uni-directional link to another strand.
     *
     * @return null
     */
    public function unlink(SystemStrand $strand)
    {
        if ($this->linkedStrands !== null) {
            $this->linkedStrands->detach($strand);
        }
    }

    /**
     * Get the current trace for this strand.
     *
     * @return StrandTrace|null
     */
    public function trace()
    {
        return $this->trace;
    }

    /**
     * Set the current trace for this strand.
     *
     * This method has no effect when assertions are disabled.
     */
    public function setTrace(StrandTrace $trace = null)
    {
        assert(($this->trace = $trace) || true);
    }

    /**
     * Finalize the strand by notifying any listeners of the exit and
     * terminating any linked strands.
     */
    private function exit()
    {
        $this->state = StrandState::EXITED;
        $this->current = null;

        try {
            $this->primaryListener->{$this->action}($this->value, $this);

            foreach ($this->listeners as $listener) {
                $listener->{$this->action}($this->value, $this);
            }

        // Notify the kernel if any of the listeners fail ...
        } catch (Throwable $e) {
            $this->kernel->throw(
                new StrandListenerException($this, $e),
                $this
            );
        } finally {
            $this->primaryListener = null;
            $this->listeners = [];
        }

        if ($this->linkedStrands !== null) {
            try {
                foreach ($this->linkedStrands as $strand) {
                    $strand->unlink($this);
                    $strand->terminate();
                }
            } finally {
                $this->linkedStrands = null;
            }
        }
    }

    /**
     * @var SystemKernel The kernel.
     */
    private $kernel;

    /**
     * @var Api The kernel API.
     */
    private $api;

    /**
     * @var int The strand Id.
     */
    private $id;

    /**
     * @var array<Generator> The call-stack (except for the top element).
     */
    private $stack = [];

    /**
     * @var int The call-stack depth (not including the top element).
     */
    private $depth = 0;

    /**
     * @var Generator|null The current top of the call-stack.
     */
    private $current;

    /**
     * @var Listener|null The strand's primary listener.
     */
    private $primaryListener;

    /**
     * @var array<Listener> Objects to notify when this strand exits.
     */
    private $listeners = [];

    /**
     * @var callable|null A callable invoked when the strand is terminated.
     */
    private $terminator;

    /**
     * @var SplObjectStorage<Strand>|null Strands to terminate when this strand
     *                                    is terminated.
     */
    private $linkedStrands;

    /**
     * @var int The current state of the strand.
     */
    private $state = StrandState::READY;

    /**
     * @var string|null The next action to perform on the current coroutine ('send' or 'throw').
     */
    private $action;

    /**
     * @var mixed The value or exception to send or throw on the next tick or
     *            the result of the strand's entry point coroutine if the strand
     *            has exited.
     */
    private $value;

    /**
     * @var StrandTrace|null The strand trace, if set.
     */
    private $trace;
}
