<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil;

use Generator as Coroutine;

/**
 * An object that produces a coroutine.
 *
 * Coroutine providers are "dispatchable values". Yielding a coroutine provider
 * from a coroutine behaves the same as yielding the coroutine it produces.
 */
interface CoroutineProvider
{
    public function coroutine(): Coroutine;
}
