<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Exception;

use RuntimeException;
use Throwable;

/**
 * A kernel panic has been caused by an exception inside the kernel.
 */
class KernelException extends RuntimeException implements PanicException
{
    /**
     * Create a kernel exception.
     *
     * @param Throwable $cause The exception that caused the panic.
     */
    public static function create(Throwable $cause): self
    {
        return new self($cause);
    }

    /**
     * Please note that this code is not part of the public API. It may be
     * changed or removed at any time without notice.
     *
     * @access private
     *
     * This constructor is public because the `Exception` class does not allow
     * subclasses to have private or protected constructors.
     *
     * @see KernelException::create()
     *
     * @param Throwable $cause The exception that caused the panic.
     */
    public function __construct(Throwable $cause)
    {
        parent::__construct(
            \sprintf(
                'Unhandled exception in kernel: %s (%s).',
                \get_class($cause),
                $cause->getMessage()
            ),
            0,
            $cause
        );
    }
}
