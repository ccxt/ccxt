<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil;

/**
 * An object that produces an Awaitable object.
 *
 * Awaitable providers are "dispatchable values". Yielding an awaitable provider
 * from a coroutine causes the strand to suspend until the awaitable it produces
 * is complete.
 */
interface AwaitableProvider
{
    public function awaitable(): Awaitable;
}
