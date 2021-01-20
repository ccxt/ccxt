<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Exception;

use Recoil\Strand;
use RuntimeException;

/**
 * Indicates that a strand has been explicitly terminated.
 */
class TerminatedException extends RuntimeException implements RecoilException
{
    /**
     * Create a terminated exception.
     *
     * @param Strand $strand The terminated strand.
     */
    public static function create(Strand $strand): self
    {
        return new self($strand);
    }

    /**
     * Get the terminated strand.
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
     * @see TerminatedException::create()
     *
     * @param Strand $strand The terminated strand.
     */
    public function __construct(Strand $strand)
    {
        $this->strand = $strand;

        parent::__construct('Strand #' . $strand->id() . ' was terminated.');
    }

    /**
     * @var Strand The terminated strand.
     */
    private $strand;
}
