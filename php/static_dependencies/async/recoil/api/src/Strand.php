<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil;

/**
 * A strand of execution.
 *
 * The coroutine kernel's equivalent to a thread.
 */
interface Strand extends Listener, AwaitableProvider
{
    /**
     * Get the strand's ID.
     *
     * Strand IDs are unique within the kernel.
     */
    public function id(): int;

    /**
     * Permanently stop the strand from executing.
     *
     * @return null
     */
    public function terminate();

    /**
     * Check if the strand has exited.
     */
    public function hasExited(): bool;

    /**
     * Get the current trace for this strand.
     *
     * @return StrandTrace|null
     */
    public function trace();

    /**
     * Set the current trace for this strand.
     *
     * This method has no effect when assertions are disabled.
     *
     * @return null
     */
    public function setTrace(StrandTrace $trace = null);
}
