<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Exception;

use Recoil\Strand;
use RuntimeException;
use Throwable;

/*
 * A kernel panic has occurred as a result of an unhandled exception in a
 * strand.
 */
class StrandException extends RuntimeException implements PanicException
{
    /**
     * Create a strand exception.
     *
     * @param Strand    $strand The strand that caused the panic.
     * @param Throwable $cause  The exception that caused the panic.
     */
    public static function create(Strand $strand, Throwable $cause): self
    {
        return new self($strand, $cause);
    }

    /**
     * Get the strand that caused the panic.
     */
    public function strand(): Strand
    {
        return $this->strand;
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
     * @param Strand    $strand The strand that caused the panic.
     * @param Throwable $cause  The exception that caused the panic.
     */
    public function __construct(Strand $strand, Throwable $cause)
    {
        $this->strand = $strand;
        parent::__construct(
            \sprintf(
                'Unhandled exception in strand #%d: %s (%s).',
                $strand->id(),
                \get_class($cause),
                $cause->getMessage()
            ),
            0,
            $cause
        );
    }

    /**
     * @var Strand The strand that caused the panic.
     */
    private $strand;
}
