<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\React;

use React\Promise\Deferred;
use Recoil\Listener;
use Recoil\Strand;
use Throwable;

/**
 * Please note that this code is not part of the public API. It may be
 * changed or removed at any time without notice.
 *
 * @access private
 *
 * Adapts a React deferred object into a Recoil listener.
 */
final class DeferredAdaptor implements Listener
{
    /**
     * @param Deferred $deferred The deferred to settle when the strand exits.
     */
    public function __construct(Deferred $deferred)
    {
        $this->deferred = $deferred;
    }

    /**
     * Resume execution.
     *
     * @param mixed       $value  The operation result.
     * @param Strand|null $strand The strand that produced this result upon exit, if any.
     */
    public function send($value = null, Strand $strand = null)
    {
        $this->deferred->resolve($value);
    }

    /**
     * Resume execution, indicating an error state.
     *
     * @param Throwable   $exception The operation result.
     * @param Strand|null $strand    The strand that produced this exception upon exit, if any.
     */
    public function throw(Throwable $exception, Strand $strand = null)
    {
        $this->deferred->reject($exception);
    }

    /**
     * @var Deferred The deferred to settle when the strand exits.
     */
    private $deferred;
}
