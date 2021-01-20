<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil;

/**
 * An unit of work that notifies one or more listeners when complete.
 *
 * Awaitables are "dispatchable values". Yielding an awaitable from a coroutine
 * causes the strand to suspend until the work is complete.
 */
interface Awaitable
{
    /**
     * Add a listener to be notified when the work is complete.
     *
     * @return null
     */
    public function await(Listener $listener);
}
