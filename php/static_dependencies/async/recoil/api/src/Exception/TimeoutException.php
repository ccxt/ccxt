<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Exception;

use RuntimeException;

/**
 * An operation has timed out.
 */
class TimeoutException extends RuntimeException implements RecoilException
{
    /**
     * Create a timeout exception.
     *
     * @param float $timeout The maximum time allowed for execution, in seconds.
     */
    public static function create(float $timeout): self
    {
        return new self($timeout);
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
     * @see TimeoutException::create()
     *
     * @param float $timeout The maximum time allowed for execution, in seconds.
     */
    public function __construct(float $timeout)
    {
        parent::__construct('The operation timed out after ' . $timeout . ' second(s).');
    }
}
