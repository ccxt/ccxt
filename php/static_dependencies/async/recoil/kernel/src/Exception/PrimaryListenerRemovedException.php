<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Kernel\Exception;

use Exception;
use Recoil\Listener;
use Recoil\Strand;

/**
 * Used to notify a listener that it has been removed as the primary listener of
 * a strand.
 */
class PrimaryListenerRemovedException extends Exception
{
    /**
     * @param Listener $listener The primary listener that was removed.
     * @param Strand   $strand   The strand from which it was removed.
     */
    public function __construct(Listener $listener, Strand $strand)
    {
        $this->listener = $listener;
        $this->strand = $strand;

        parent::__construct(
            sprintf(
                'Primary listener removed from strand #%d.',
                $strand->id()
            )
        );
    }

    /**
     * Get the listener that was removed.
     */
    public function listener(): Listener
    {
        return $this->listener;
    }

    /**
     * Get the strand from which the listener was removed.
     */
    public function strand(): Strand
    {
        return $this->strand;
    }

    /**
     * @var Listener The listener that was removed.
     */
    private $listener;

    /**
     * @var Strand The strand from which the listener was removed.
     */
    private $strand;
}
