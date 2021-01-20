<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Kernel;

/**
 * Enumeration of kernel states, used by KernelTrait.
 */
final class KernelState
{
    const STOPPED = 0;
    const RUNNING = 1;
    const STOPPING = 2;

    private function __construct()
    {
    }
}
