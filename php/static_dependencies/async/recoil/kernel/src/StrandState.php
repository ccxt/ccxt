<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Kernel;

/**
 * Enumeration of strand states, used by StrandTrait.
 */
final class StrandState
{
    const READY = 0;
    const RUNNING = 1;
    const SUSPENDED_ACTIVE = 2;
    const SUSPENDED_INACTIVE = 3;
    const EXITED = 4;

    private function __construct()
    {
    }
}
