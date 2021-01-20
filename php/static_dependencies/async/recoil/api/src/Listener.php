<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil;

use Throwable;

/**
 * An object that can be notified of the result of an operation.
 */
interface Listener
{
    /**
     * Send the result of a successful operation.
     *
     * @param mixed       $value  The operation result.
     * @param Strand|null $strand The strand that produced this result upon exit, if any.
     *
     * @return null
     */
    public function send($value = null, Strand $strand = null);

    /**
     * Send the result of an unsuccessful operation.
     *
     * @param Throwable   $exception The operation result.
     * @param Strand|null $strand    The strand that produced this exception upon exit, if any.
     *
     * @return null
     */
    public function throw(Throwable $exception, Strand $strand = null);
}
