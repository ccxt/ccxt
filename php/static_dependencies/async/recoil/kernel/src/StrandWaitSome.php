<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Kernel;

use Recoil\Awaitable;
use Recoil\Exception\CompositeException;
use Recoil\Listener;
use Recoil\Strand;
use Throwable;

/**
 * Implementation of Api::some().
 */
final class StrandWaitSome implements Awaitable, Listener
{
    public function __construct(int $count, SystemStrand ...$substrands)
    {
        assert($count >= 1);
        assert($count <= count($substrands));

        $this->count = $count;
        $this->substrands = $substrands;
    }

    /**
     * Get the number of strands that must succeed before the calling strand is
     * resumed.
     *
     * The initial value is equal to the constructor's $count parameter, and is
     * decremented each time a substrand succeeds.
     *
     * @return int The number of strands that must succeed.
     */
    public function count(): int
    {
        return $this->count;
    }

    /**
     * Attach a listener to this object.
     *
     * @param Listener $listener The object to resume when the work is complete.
     */
    public function await(Listener $listener)
    {
        if ($listener instanceof SystemStrand) {
            $listener->setTerminator(function () {
                foreach ($this->substrands as $strand) {
                    $strand->clearPrimaryListener();
                    $strand->terminate();
                }
            });
        }

        $this->listener = $listener;

        foreach ($this->substrands as $substrand) {
            $substrand->setPrimaryListener($this);
        }
    }

    /**
     * Send the result of a successful operation.
     *
     * @param mixed       $value  The operation result.
     * @param Strand|null $strand The strand that produced this result upon exit, if any.
     */
    public function send($value = null, Strand $strand = null)
    {
        assert($strand instanceof Strand, 'strand cannot be null');
        assert(in_array($strand, $this->substrands, true), 'unknown strand');

        $index = \array_search($strand, $this->substrands, true);
        unset($this->substrands[$index]);

        $this->values[$index] = $value;

        if (0 === --$this->count) {
            foreach ($this->substrands as $s) {
                $s->clearPrimaryListener();
                $s->terminate();
            }

            $this->listener->send($this->values);
        }
    }

    /**
     * Send the result of an unsuccessful operation.
     *
     * @param Throwable   $exception The operation result.
     * @param Strand|null $strand    The strand that produced this exception upon exit, if any.
     */
    public function throw(Throwable $exception, Strand $strand = null)
    {
        assert($strand instanceof Strand, 'strand cannot be null');
        assert(in_array($strand, $this->substrands, true), 'unknown strand');

        $index = \array_search($strand, $this->substrands, true);
        unset($this->substrands[$index]);

        $this->exceptions[$index] = $exception;

        if ($this->count > \count($this->substrands)) {
            foreach ($this->substrands as $s) {
                $s->clearPrimaryListener();
                $s->terminate();
            }

            $this->listener->throw(
                CompositeException::create($this->exceptions)
            );
        }
    }

    /**
     * @var Listener|null The object to notify upon completion.
     */
    private $listener;

    /**
     * @var int The number of strands that must succeed.
     */
    private $count;

    /**
     * @var array<SystemStrand> The strands to wait for.
     */
    private $substrands;

    /**
     * @var array<integer, mixed> The results of the successful strands. Ordered
     *                     by completion order, indexed by strand order.
     */
    private $values = [];

    /**
     * @var array<integer, Exception> The exceptions thrown by failed strands.
     *                     Ordered by completion order, indexed by strand order.
     */
    private $exceptions = [];
}
