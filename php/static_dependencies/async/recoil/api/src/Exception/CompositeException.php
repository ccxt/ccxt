<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Exception;

use Exception;
use Throwable;

/**
 * A container for multiple exceptions produced by API operations that run
 * multiple strands in parallel.
 */
class CompositeException extends Exception implements RecoilException
{
    /**
     * Create a composite exception.
     *
     * @see CompositeException::exceptions() for information about the array
     * keys and ordering.
     *
     * @array<int, Throwable> The exceptions.
     */
    public static function create(array $exceptions): self
    {
        return new self($exceptions);
    }

    /**
     * Get the exceptions.
     *
     * The array order matches the order of strand completion. The array keys
     * indicate the order in which the strand was passed to the operation. This
     * allows unpacking of the result with list() to get the results in
     * pass-order.
     *
     * @return array<int, Throwable> The exceptions.
     */
    public function exceptions(): array
    {
        return $this->exceptions;
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
     * @see CompositeException::create()
     *
     * @param array<int, Throwable> The exceptions.
     */
    public function __construct(array $exceptions)
    {
        $this->exceptions = $exceptions;

        parent::__construct(\count($exceptions) . ' operation(s) failed.');
    }

    /**
     * @var array<int, Throwable> The exceptions.
     */
    private $exceptions;
}
