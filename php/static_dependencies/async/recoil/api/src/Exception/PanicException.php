<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Exception;

/**
 * A kernel panic has occurred.
 *
 * A panic occurs when a strand or the kernel itself throws an exception that
 * was not handled by the kernel's exception handler (or no exception handler
 * was installed).
 *
 * @see KernelException
 * @see StrandException
 */
interface PanicException extends RecoilException
{
}
