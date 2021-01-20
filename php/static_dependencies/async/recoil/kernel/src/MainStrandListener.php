<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Kernel;

use Recoil\Kernel\Exception\KernelStoppedException;
use Recoil\Listener;
use Recoil\Strand;
use Throwable;

/**
 * Please note that this code is not part of the public API. It may be
 * changed or removed at any time without notice.
 *
 * @access private
 */
final class MainStrandListener implements Listener
{
    public function __construct()
    {
        $this->exception = new KernelStoppedException();
    }

    /**
     * Send the result of a successful operation.
     *
     * @param mixed       $value  The operation result.
     * @param Strand|null $strand The strand that produced this result upon exit, if any.
     *
     * @return null
     */
    public function send($value = null, Strand $strand = null)
    {
        assert($strand instanceof SystemStrand);

        $this->value = $value;
        $this->exception = null;

        $strand->kernel()->stop();
    }

    /**
     * Send the result of an unsuccessful operation.
     *
     * @param Throwable   $exception The operation result.
     * @param Strand|null $strand    The strand that produced this exception upon exit, if any.
     *
     * @return null
     */
    public function throw(Throwable $exception, Strand $strand = null)
    {
        assert($strand instanceof SystemStrand);

        $this->value = null;
        $this->exception = $exception;

        $strand->kernel()->stop();
    }

    /**
     * Return the value produced by the strand (or throw the exception if it
     * failed).
     *
     * @return mixed     The value returned by the strand.
     * @throws Throwable The exception thrown by the strand, if any.
     */
    public function get()
    {
        if ($this->exception) {
            throw $this->exception;
        }

        return $this->value;
    }

    /**
     * @var mixed The value produced by the strand.
     */
    private $value;

    /**
     * @var Throwable The exception produced by the strand.
     */
    private $exception;
}
