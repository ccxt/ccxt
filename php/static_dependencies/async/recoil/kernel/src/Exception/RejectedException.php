<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Kernel\Exception;

use Icecave\Repr\Repr;
use RuntimeException;

/**
 * A promise was rejected with a non-exception reason.
 */
class RejectedException extends RuntimeException
{
    /**
     * @param mixed $reason The reason that the promise was rejected.
     */
    public function __construct($reason)
    {
        $this->reason = $reason;

        if (\is_string($reason)) {
            parent::__construct($reason);
        } elseif (\is_integer($reason)) {
            parent::__construct('The promise was rejected (' . Repr::repr($reason) . ').', $reason);
        } else {
            parent::__construct('The promise was rejected (' . Repr::repr($reason) . ').');
        }
    }

    /**
     * Fetch the rejection reason.
     *
     * @return mixed The reason that the promise was rejected.
     */
    public function reason()
    {
        return $this->reason;
    }

    private $reason;
}
