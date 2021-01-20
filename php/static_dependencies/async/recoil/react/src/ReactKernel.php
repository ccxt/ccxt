<?php

declare(strict_types=1); // @codeCoverageIgnore

namespace Recoil\React;

use React\EventLoop\Factory;
use React\EventLoop\LoopInterface;
use Recoil\Kernel\Api;
use Recoil\Kernel\KernelState;
use Recoil\Kernel\KernelTrait;
use Recoil\Kernel\SystemKernel;
use Recoil\Strand;
use SplQueue;

/**
 * A Recoil coroutine kernel based on a ReactPHP event loop.
 */
final class ReactKernel implements SystemKernel
{
    /**
     * Create a new kernel.
     *
     * @param LoopInterface|null $eventLoop The event loop to use (null = default).
     */
    public static function create(LoopInterface $eventLoop = null): self
    {
        if ($eventLoop === null) {
            $eventLoop = Factory::create();
        }

        return new self(
            $eventLoop,
            new ReactApi($eventLoop)
        );
    }

    /**
     * Schedule a coroutine for execution on a new strand.
     *
     * Execution begins when the kernel is run; or, if called from within a
     * strand, when that strand cooperates.
     *
     * @param mixed $coroutine The coroutine to execute.
     */
    public function execute($coroutine): Strand
    {
        $strand = new ReactStrand($this, $this->api, $this->nextId++, $coroutine);

        $this->eventLoop->futureTick(
            function () use ($strand) {
                $strand->start();
            }
        );

        return $strand;
    }

    /**
     * Stop the kernel.
     */
    public function stop()
    {
        if ($this->state === KernelState::RUNNING) {
            $this->state = KernelState::STOPPING;
            $this->eventLoop->stop();
        }
    }

    /**
     * Please note that this code is not part of the public API. It may be
     * changed or removed at any time without notice.
     *
     * @access private
     *
     * This constructor is public so that it may be used by auto-wiring
     * dependency injection containers. If you are explicitly constructing an
     * instance please use one of the static factory methods listed below.
     *
     * @see ReactKernel::start()
     * @see ReactKernel::create()
     *
     * @param LoopInterface $eventLoop The event loop.
     * @param Api           $api       The kernel API.
     */
    public function __construct(LoopInterface $eventLoop, Api $api)
    {
        $this->eventLoop = $eventLoop;
        $this->api = $api;
        $this->panicExceptions = new SplQueue();
    }

    /**
     * The kernel's main event loop. Invoked inside the run() method.
     *
     * Loop must return when $this->state is KernelState::STOPPING.
     *
     * @return null
     */
    protected function loop()
    {
        $this->eventLoop->run();
    }

    use KernelTrait;

    /**
     * @var LoopInterface The event loop.
     */
    private $eventLoop;

    /**
     * @var int The next strand ID.
     */
    private $nextId = 1;
}
