<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Kernel\Exception;

use Exception;
use Recoil\Listener;
use Recoil\Strand;
use Throwable;

/**
 * An exception was thrown by a listener while a strand is exiting.
 */
class StrandListenerException extends Exception
{
    /**
     * @param Strand    $strand    The exited strand.
     * @param Throwable $exception The exception thrown by the listener.
     */
    public function __construct(
        Strand $strand,
        Throwable $previous
    ) {
        $this->strand = $strand;

        parent::__construct(
            sprintf(
                'Unhandled exception in listener for strand #%d: %s (%s).',
                $strand->id(),
                get_class($previous),
                $previous->getMessage()
            ),
            0,
            $previous
        );
    }

    /**
     * Get the exited strand.
     */
    public function strand(): Strand
    {
        return $this->strand;
    }

    /**
     * @var Strand The exited strand.
     */
    private $strand;
}
