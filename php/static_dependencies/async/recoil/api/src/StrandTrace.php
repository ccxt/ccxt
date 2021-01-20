<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil;

/**
 * A strand trace is a low-level observer of strand events.
 *
 * @see Strand::setTrace()
 *
 * A trace may only be set on a strand when assertions are enabled. When
 * assertions are disabled, all tracing related code is disabled, and setting
 * a trace has no effect.
 *
 * If an exception is thrown from any of the StrandTrace methods the kernel
 * behaviour is undefined.
 *
 * @link http://php.net/manual/en/ini.core.php#ini.zend.assertions
 */
interface StrandTrace
{
    /**
     * Record a push to the call-stack.
     *
     * @param Strand $strand The strand being traced.
     * @param int    $depth  The depth of the call-stack BEFORE the push operation.
     *
     * @return null
     */
    public function push(Strand $strand, int $depth);

    /**
     * Record a pop from the call-stack.
     *
     * @param Strand $strand The strand being traced.
     * @param int    $depth  The depth of the call-stack AFTER the pop operation.
     *
     * @return null
     */
    public function pop(Strand $strand, int $depth);

    /**
     * Record keys and values yielded from the coroutine on the head of the stack.
     *
     * @param Strand $strand The strand being traced.
     * @param int    $depth  The current depth of the call-stack.
     * @param mixed  $key    The key yielded from the coroutine.
     * @param mixed  $value  The value yielded from the coroutine.
     *
     * @return null
     */
    public function yield(Strand $strand, int $depth, $key, $value);

    /**
     * Record the action and value used to resume a yielded coroutine.
     *
     * @param Strand $strand The strand being traced.
     * @param int    $depth  The current depth of the call-stack.
     * @param string $action The resume action ('send' or 'throw').
     * @param mixed  $value  The resume value or exception.
     *
     * @return null
     */
    public function resume(Strand $strand, int $depth, string $action, $value);

    /**
     * Record the suspension of a strand.
     *
     * @param Strand $strand The strand being traced.
     * @param int    $depth  The current depth of the call-stack.
     *
     * @return null
     */
    public function suspend(Strand $strand, int $depth);

    /**
     * Record the action and value when a strand exits.
     *
     * @param Strand $strand The strand being traced.
     * @param int    $depth  The current depth of the call-stack.
     * @param string $action The final action performed on the strand's listener ('send' or 'throw').
     * @param mixed  $value  The strand result or exception.
     *
     * @return null
     */
    public function exit(Strand $strand, int $depth, string $action, $value);
}
