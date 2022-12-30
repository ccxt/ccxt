<?php

namespace ccxt\async;

use React\Promise\Deferred;
use React\Promise\Promise;
use React\EventLoop\Loop;
use React\Async;

class Throttle {
    public $config;
    public $queue;
    public $running;

    public function __construct($config) {
        $this->config = array_merge(array(
            'refillRate' => 1.0,
            'delay' => 0.001,
            'cost' => 1.0,
            'tokens' => 0.0,
            'maxCapacity' => 2000,
            'capacity' => 1.0,
        ), $config);
        $this->queue = new \SplQueue();
        $this->running = false;
    }

    public function loop() {
        return Async\async(function () {
            $last_timestamp = microtime(true) * 1000.0;
            while ($this->running) {
                list($future, $cost) = $this->queue->bottom();
                $cost = $cost ? $cost : $this->config['cost'];
                if ($this->config['tokens'] >= 0) {
                    $this->config['tokens'] -= $cost;
                    $future->resolve();
                    $this->queue->dequeue();
                    # context switch?
                    # yield 0;
                    if ($this->queue->count() === 0) {
                        $this->running = false;
                    }
                } else {
                    $time = $this->config['delay'];
                    $sleep = new Promise(function ($resolve) use ($time) {
                        Loop::addTimer($time, function () use ($resolve) {
                            $resolve(null);
                        });
                    });
                    Async\await($sleep);
                    $now = microtime(true) * 1000;
                    $elapsed = $now - $last_timestamp;
                    $last_timestamp = $now;
                    $this->config['tokens'] = min($this->config['tokens'] + ($elapsed * $this->config['refillRate']), $this->config['capacity']);
                }
            }
        }) ();
    }


    public function __invoke($cost = null) {
        $future = new Deferred();
        if ($this->queue->count() > $this->config['maxCapacity']) {
            throw new \RuntimeException('throttle queue is over maxCapacity (' . strval($this->config['maxCapacity']) . '), see https://github.com/ccxt/ccxt/issues/11645#issuecomment-1195695526');
        }
        $this->queue->enqueue(array($future, $cost));
        if (!$this->running) {
            Loop::futureTick(array($this, 'loop'));
            $this->running = true;
        }
        return $future->promise();
    }
}
