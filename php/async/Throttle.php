<?php

namespace ccxt\async;

use React\Promise\Deferred;
use Recoil\React\ReactKernel;

class Throttle {
    public $config;
    public $queue;
    public $running;
    public $kernel;

    public function __construct($config, $kernel) {
        $this->config = array_merge(array(
            'refillRate' => 1.0,
            'delay' => 0.001,
            'cost' => 1.0,
            'tokens' => 0.0,
            'maxCapacity' => 1000,
            'capacity' => 1.0,
        ), $config);
        $this->queue = new \SplQueue();
        $this->running = false;
        $this->kernel = $kernel;
    }

    public function loop() {
        $last_timestamp = microtime(true) * 1000.0;
        while ($this->running) {
            list($future, $cost) = $this->queue->bottom();
            $cost = $cost ? $cost : $this->config['cost'];
            if ($this->config['tokens'] >= 0) {
                $this->config['tokens'] -= $cost;
                $future->resolve();
                $this->queue->dequeue();
                # context switch?
                yield 0;
                if ($this->queue->count() === 0) {
                    $this->running = false;
                }
            } else {
                yield $this->config['delay'];
                $now = microtime(true) * 1000;
                $elapsed = $now - $last_timestamp;
                $last_timestamp = $now;
                $this->config['tokens'] = min($this->config['tokens'] + ($elapsed * $this->config['refillRate']), $this->config['capacity']);
            }
        }
    }


    public function __invoke($cost = null) {
        $future = new Deferred();
        if ($this->queue->count() > $this->config['maxCapacity']) {
            throw new \RuntimeException('queue length greater than maxCapacity');
        }
        $this->queue->enqueue(array($future, $cost));
        if (!$this->running) {
            $this->kernel->execute(array($this, 'loop'));
            $this->running = true;
        }
        return $future->promise();
    }
}
