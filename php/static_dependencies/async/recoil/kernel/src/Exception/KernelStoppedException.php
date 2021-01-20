<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Kernel\Exception;

use Exception;

/**
 * Used to notify a listener that it has been removed as the primary listener of
 * a strand.
 */
class KernelStoppedException extends Exception
{
    public function __construct()
    {
        parent::__construct('The kernel was stopped before the main strand exited.');
    }
}
