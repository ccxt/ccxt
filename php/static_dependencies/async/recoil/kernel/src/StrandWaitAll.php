<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\Kernel;

use Recoil\Awaitable;
use Recoil\Listener;
use Recoil\Strand;
use Throwable;

/**
 * Implementation of Api::all().
 */
final class StrandWaitAll implements Awaitable, Listener
{
    public function __construct(SystemStrand ...$substrands)
    {
        $this->substrands = $substrands;
    }

    /**
     * Attach a listener to this object.
     *
     * @param Listener $listener The object to resume when the work is complete.
     *
     * @return null
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

        if (empty($this->substrands)) {
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

        foreach ($this->substrands as $s) {
            if ($s !== $strand) {
                $s->clearPrimaryListener();
                $s->terminate();
            }
        }

        $this->substrands = [];
        $this->listener->throw($exception, $strand);
    }

    /**
     * @var Listener|null The object to notify upon completion.
     */
    private $listener;

    /**
     * @var array<SystemStrand> The strands to wait for.
     */
    private $substrands;

    /**
     * @var array<integer, mixed> The results of the successful strands. Ordered
     *                     by completion order, indexed by strand order.
     */
    private $values = [];
}
